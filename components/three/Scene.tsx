"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Float, Html, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { snoise, sphereSurface } from "./glsl";

/*
  Cena 3D única, fixa atrás da página:
  1. Hero: esfera de fluido (shader) que se deforma em direção ao rato.
  2. Scroll: a esfera arde e desfaz-se em partículas, que voam e formam a malha do fundo.
  3. Mais abaixo (Projetos): as partículas reorganizam-se numa galáxia em espiral.
  Todo o input (rato, scroll) é suavizado com lerp dentro de um único useFrame.
*/

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/*
  Os materiais são criados à mão (useMemo): a prop "uniforms" do <shaderMaterial> é copiada
  pelo R3F, e assim perderíamos a referência que atualizamos a cada frame.
*/
function useShader(vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>, extra: THREE.ShaderMaterialParameters = {}) {
  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, ...extra }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vertexShader, fragmentShader, uniforms]
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Estado partilhado fora do React (sem re-renders)
const input = { ndc: new THREE.Vector2(0, 0), active: 0 };
const stages = { s1: 0, s2: 0 }; // alvos vindos do scroll
const marks = { heroH: 1, projTop: Infinity, vh: 1 }; // medidas das secções (atualizadas no resize)

function readStages() {
  const y = window.scrollY;
  stages.s1 = clamp01(y / (marks.heroH * 0.85));
  stages.s2 = clamp01((y - (marks.projTop - marks.vh * 1.25)) / (marks.vh * 0.9));
}
const smooth = { s1: 0, s2: 0 }; // valores suavizados

const COLORS = {
  cyan: new THREE.Color("#3ee8ff"),
  blue: new THREE.Color("#1d4ed8"),
  deep: new THREE.Color("#06121f"),
  fire: new THREE.Color("#ff5a1f"),
  gold: new THREE.Color("#ffb347"),
};

/* ---------------------------------------------------------------- esfera */

const sphereVertex = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uMouse;
  varying vec3 vDir;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vNoise;
  ${snoise}
  ${sphereSurface}
  void main() {
    vec3 dir = normalize(position);
    float n = surfaceNoise(dir, uTime);
    float pulse = sin(uTime * 1.6) * 0.025;
    vec3 p = dir * (1.0 + n + pulse);

    // Física de atração: a superfície estica-se em direção ao rato
    vec3 toM = uMouse - p;
    float pull = exp(-dot(toM, toM) * 1.1) * uHover;
    p += normalize(toM + 1e-5) * pull * 0.28;

    vDir = dir;
    vNoise = n;
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * dir);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const sphereFragment = /* glsl */ `
  uniform float uTime;
  uniform float uDissolve;
  uniform float uOpacity;
  uniform vec3 uCyan;
  uniform vec3 uDeep;
  uniform vec3 uFire;
  varying vec3 vDir;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vNoise;
  ${snoise}
  ${sphereSurface}
  void main() {
    float dn = dissolveNoise(vDir);
    float edge = uDissolve * 1.25 - 0.12;
    if (dn < edge) discard;

    float fres = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.2);
    // Ondas de fogo que percorrem a superfície
    float band = sin(vNoise * 18.0 + uTime * 1.4 + vDir.y * 4.0) * 0.5 + 0.5;
    float fire = pow(band, 28.0);

    // Núcleo escuro e vítreo, rebordo ciano, veios finos de fogo
    vec3 col = mix(uDeep, uCyan * 0.35, clamp(fres * 0.8 + vNoise * 1.2, 0.0, 1.0));
    col += uFire * fire * (0.55 + fres) * 0.9;
    col += uCyan * pow(fres, 2.0) * 0.95;

    // Rebordo incandescente onde a superfície se desfaz
    float burn = (1.0 - smoothstep(edge, edge + 0.07, dn)) * step(0.001, uDissolve);
    col = mix(col, vec3(1.0, 0.55, 0.18) * 2.2, burn);

    gl_FragColor = vec4(col, uOpacity);
  }
`;

const glowFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uCyan;
  uniform vec3 uFire;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c);
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    float warm = smoothstep(0.1, 0.5, 0.5 + 0.5 * sin(atan(c.y, c.x) * 2.0 + uTime * 0.4));
    vec3 col = mix(uCyan, uFire, warm * 0.45);
    gl_FragColor = vec4(col, a * 0.22 * uOpacity);
  }
`;

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* ------------------------------------------------------------- partículas */

const particlesVertex = /* glsl */ `
  uniform float uTime;
  uniform float uS1;
  uniform float uS2;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uSphereScale;
  uniform vec3 uSphereCenter;
  uniform vec2 uMouseGrid;
  uniform float uHoverGrid;
  uniform vec3 uGalaxyCenter;
  attribute vec3 aDir;
  attribute vec3 aGrid;
  attribute vec3 aGalaxy;
  attribute vec4 aRand;
  varying float vHeat;
  varying float vFlight;
  varying float vDepth;
  varying float vStage;
  varying float vGalaxy;
  varying float vRand;
  ${snoise}
  ${sphereSurface}

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  void main() {

    // 2. Malha ondulante no fundo (reage ao rato)
    vec3 g = aGrid;
    float t = uTime * 0.35;
    g.y += sin(g.x * 0.32 + t) * 0.42 + cos(g.z * 0.48 + t * 1.3) * 0.32 + sin((g.x + g.z) * 0.2 - t * 0.7) * 0.5;
    float d = distance(g.xz, uMouseGrid);
    float heat = exp(-d * d * 0.05) * uHoverGrid;
    g.y += heat * 1.6 + sin(d * 1.8 - uTime * 3.2) * exp(-d * 0.3) * 0.15 * uHoverGrid;

    // 3. Galáxia em espiral
    vec3 gx = aGalaxy;
    float r = length(gx.xz);
    gx.xz = rot(uTime * (0.03 + 0.25 / (r + 2.0))) * gx.xz;
    gx.yz = rot(-0.42) * gx.yz;
    gx += uGalaxyCenter;

    // Transições: cada partícula parte quando a sua zona da esfera arde
    float dn = dissolveNoise(aDir);
    float edge = uS1 * 1.25 - 0.12;
    float t1 = smoothstep(dn, dn + 0.35, edge);
    t1 = t1 * t1 * (3.0 - 2.0 * t1);

    // 1. Superfície da esfera (o ruído só é calculado enquanto a partícula lá está)
    vec3 sphere = uSphereCenter;
    if (t1 < 0.999) {
      float n = surfaceNoise(aDir, uTime);
      sphere += aDir * (1.0 + n + 0.015) * uSphereScale;
    }
    vec3 scatter = (aRand.xyz - 0.5) * vec3(9.0, 6.0, 9.0);
    vec3 p = mix(sphere, g, t1) + scatter * sin(t1 * 3.14159) * 0.55;

    float t2 = clamp(uS2 * 1.45 - aRand.w * 0.45, 0.0, 1.0);
    t2 = t2 * t2 * (3.0 - 2.0 * t2);
    p = mix(p, gx, t2) + scatter.zxy * sin(t2 * 3.14159) * 0.45;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vDepth = -mv.z;
    vHeat = heat * (1.0 - t2);
    vFlight = clamp(sin(t1 * 3.14159) + sin(t2 * 3.14159), 0.0, 1.0);
    vStage = t1;
    vGalaxy = t2;
    vRand = aRand.x;

    float size = uSize * (1.0 + aRand.y * 1.3 + heat * 2.5 + vFlight * 1.4) * mix(0.55, 1.0, t1);
    gl_PointSize = size * uPixelRatio * (10.0 / -mv.z);
  }
`;

const particlesFragment = /* glsl */ `
  uniform vec3 uCyan;
  uniform vec3 uBlue;
  uniform vec3 uFire;
  uniform vec3 uGold;
  varying float vHeat;
  varying float vFlight;
  varying float vDepth;
  varying float vStage;
  varying float vGalaxy;
  varying float vRand;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.0, r);

    vec3 col = mix(uBlue, uCyan, 0.35 + vRand * 0.65);
    col = mix(col, uFire, clamp(vHeat * 1.2 + vFlight * 0.6, 0.0, 1.0)); // brasas em voo
    col = mix(col, vRand > 0.86 ? uGold : uCyan, vGalaxy * 0.45);

    float fog = smoothstep(40.0, 6.0, vDepth) * 0.85 + 0.15;
    float alpha = a * fog * mix(0.3, 1.0, max(vStage, vGalaxy)) * (0.9 + vHeat * 0.6);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ------------------------------------------------------------------ hooks */

function useInputAndScroll(invalidate: () => void) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      input.ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      input.active = 1;
      invalidate();
    };
    const measure = () => {
      const hero = document.getElementById("topo");
      const proj = document.getElementById("projetos");
      marks.vh = innerHeight;
      marks.heroH = hero?.offsetHeight ?? innerHeight;
      marks.projTop = proj ? proj.getBoundingClientRect().top + scrollY : Infinity;
      readStages();
      invalidate();
    };
    const onScroll = () => invalidate(); // só relevante no modo "demand" (movimento reduzido)
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", measure);
    measure();
    // As secções mudam de altura quando as fontes/imagens carregam
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    smooth.s1 = stages.s1;
    smooth.s2 = stages.s2;
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [invalidate]);
}

/* ------------------------------------------------------------- componentes */

type Layout = { center: THREE.Vector3; scale: number; mobile: boolean };

function useLayout(): Layout {
  const { size, camera } = useThree();
  return useMemo(() => {
    const mobile = size.width < 1024;
    const cam = camera as THREE.PerspectiveCamera;
    const halfW = 8.5 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (size.width / size.height);
    return mobile
      ? { center: new THREE.Vector3(1.3, 2.3, -2), scale: 1.0, mobile }
      : { center: new THREE.Vector3(Math.min(halfW * 0.55, 4.4), 0.05, 0), scale: 1.35, mobile };
  }, [size.width, size.height, camera]);
}

function Keyword({ children, color, className = "" }: { children: string; color: string; className?: string }) {
  return (
    <span
      className={`kw block select-none whitespace-nowrap font-display font-semibold tracking-[-0.02em] ${className}`}
      style={{ color, textShadow: `0 0 24px ${color}88` }}
    >
      {children}
    </span>
  );
}

function Hero3D({ layout, frontPortal }: { layout: Layout; frontPortal?: RefObject<HTMLElement | null> }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const words = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const detail = layout.mobile ? 24 : 40;
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, detail), [detail]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector3(3, 3, 3) },
      uDissolve: { value: 0 },
      uOpacity: { value: 1 },
      uCyan: { value: COLORS.cyan },
      uDeep: { value: COLORS.deep },
      uFire: { value: COLORS.fire },
    }),
    []
  );
  const glowUniforms = useMemo(
    () => ({ uOpacity: { value: 1 }, uTime: { value: 0 }, uCyan: { value: COLORS.cyan }, uFire: { value: COLORS.fire } }),
    []
  );

  const sphereMaterial = useShader(sphereVertex, sphereFragment, uniforms, { transparent: true });
  const glowMaterial = useShader(glowVertex, glowFragment, glowUniforms, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const local = useMemo(() => new THREE.Vector3(), []);
  const wordEls = useRef<HTMLElement[]>([]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    glowUniforms.uTime.value = uniforms.uTime.value;
    uniforms.uDissolve.value = smooth.s1;
    glowUniforms.uOpacity.value = 1 - smooth.s1;

    const g = group.current;
    if (!g) return;

    // Atração: o objeto inteiro é puxado ligeiramente para o rato
    const tx = layout.center.x + input.ndc.x * 0.35 * input.active;
    const ty = layout.center.y + input.ndc.y * 0.25 * input.active;
    g.position.x = lerp(g.position.x, tx, 0.06);
    g.position.y = lerp(g.position.y, ty, 0.06);
    g.position.z = layout.center.z;
    const s = layout.scale * (1 + smooth.s1 * 0.25);
    g.scale.setScalar(lerp(g.scale.x, s, 0.1));
    if (mesh.current) {
      mesh.current.rotation.y += dt * 0.08;
      mesh.current.rotation.x = lerp(mesh.current.rotation.x, -input.ndc.y * 0.3, 0.04);
      mesh.current.visible = smooth.s1 < 0.98;
    }

    // Rato em coordenadas locais da esfera, para a deformação no shader
    plane.constant = -g.position.z;
    raycaster.setFromCamera(input.ndc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      local.copy(hit).sub(g.position).divideScalar(g.scale.x);
      const dist = local.length();
      if (dist > 2.4) local.multiplyScalar(2.4 / dist);
      uniforms.uMouse.value.lerp(local, 0.1);
      const near = dist < 2.4 ? 1 : 0.25;
      uniforms.uHover.value = lerp(uniforms.uHover.value, input.active * near, 0.06);
    }

    // Palavras flutuantes desvanecem com a desintegração
    const wordOpacity = String(clamp01(1 - smooth.s1 * 1.8));
    if (!layout.mobile && !wordEls.current.length && state.gl.domElement) {
      wordEls.current = Array.from(document.querySelectorAll<HTMLElement>(".kw"));
    }
    wordEls.current.forEach((el) => (el.style.opacity = wordOpacity));
    if (words.current) words.current.visible = smooth.s1 < 0.6;
  });

  return (
    <group ref={group} position={layout.center}>
      <mesh ref={mesh} geometry={geometry} material={sphereMaterial} />
      <Billboard>
        <mesh position={[0, 0, -0.6]} material={glowMaterial}>
          <planeGeometry args={[6, 6]} />
        </mesh>
      </Billboard>

      {/* Palavras-chave em eixos 3D reais (Float + Html do drei). Desligadas em mobile. */}
      {!layout.mobile && (
        <group ref={words}>
          <Float speed={1.6} rotationIntensity={0.9} floatIntensity={1.1}>
            <Html transform distanceFactor={3.2} position={[-0.2, 1.55, 0.9]} portal={frontPortal as RefObject<HTMLElement>} pointerEvents="none">
              <Keyword color="#3ee8ff" className="text-4xl">Código</Keyword>
            </Html>
          </Float>
          <Float speed={1.2} rotationIntensity={1.2} floatIntensity={1.4}>
            <Html transform distanceFactor={3.2} position={[1.3, -1.25, -0.9]} pointerEvents="none">
              <Keyword color="#ff5a1f" className="text-4xl">Fogo</Keyword>
            </Html>
          </Float>
          <Float speed={1.9} rotationIntensity={0.7} floatIntensity={0.9}>
            <Html transform distanceFactor={3.2} position={[-1.55, -0.95, -0.6]} pointerEvents="none">
              <Keyword color="#ffffff" className="text-2xl">Impacto</Keyword>
            </Html>
          </Float>
        </group>
      )}
    </group>
  );
}

function ParticleSystem({ layout }: { layout: Layout }) {
  const { gl, camera } = useThree();
  const cols = layout.mobile ? 72 : 124;
  const rows = layout.mobile ? 46 : 80;
  const count = cols * rows;

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const dir = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    const galaxy = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    const v = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // direção uniforme na esfera
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      while (v.lengthSq() > 1 || v.lengthSq() < 0.01) v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      v.normalize();
      dir.set([v.x, v.y, v.z], i * 3);

      // posição na grelha do chão
      const x = i % cols;
      const z = Math.floor(i / cols);
      grid.set([(x / (cols - 1) - 0.5) * 36, -3.2, 5 - (z / (rows - 1)) * 30], i * 3);

      // posição na galáxia (3 braços)
      const arm = i % 3;
      const r = Math.pow(Math.random(), 0.65) * 11 + 0.3;
      const a = (arm / 3) * Math.PI * 2 + r * 0.55 + (Math.random() - 0.5) * (0.9 / (r * 0.25 + 0.6));
      const y = (Math.random() - 0.5) * 0.9 * (1 - r / 12);
      galaxy.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);

      rand.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    }
    // "position" só serve para o bounding; o shader usa os atributos próprios
    g.setAttribute("position", new THREE.BufferAttribute(grid.slice(), 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    g.setAttribute("aGrid", new THREE.BufferAttribute(grid, 3));
    g.setAttribute("aGalaxy", new THREE.BufferAttribute(galaxy, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
    return g;
  }, [cols, rows, count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uS1: { value: 0 },
      uS2: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.75) },
      uSize: { value: layout.mobile ? 3.4 : 2.8 },
      uSphereScale: { value: 1 },
      uSphereCenter: { value: new THREE.Vector3() },
      uMouseGrid: { value: new THREE.Vector2(0, -6) },
      uHoverGrid: { value: 0 },
      uGalaxyCenter: { value: new THREE.Vector3(0, -2.2, -7) },
      uCyan: { value: COLORS.cyan },
      uBlue: { value: COLORS.blue },
      uFire: { value: COLORS.fire },
      uGold: { value: COLORS.gold },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.mobile]
  );

  const material = useShader(particlesVertex, particlesFragment, uniforms, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const floor = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 3.2), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    uniforms.uS1.value = smooth.s1;
    uniforms.uS2.value = smooth.s2;
    uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.75);

    // A esfera de partículas segue a esfera sólida
    const sc = layout.scale * (1 + smooth.s1 * 0.25);
    uniforms.uSphereScale.value = lerp(uniforms.uSphereScale.value, sc, 0.1);
    const c = uniforms.uSphereCenter.value;
    c.x = lerp(c.x, layout.center.x + input.ndc.x * 0.35 * input.active, 0.06);
    c.y = lerp(c.y, layout.center.y + input.ndc.y * 0.25 * input.active, 0.06);
    c.z = layout.center.z;

    // Rato projetado no chão
    raycaster.setFromCamera(input.ndc, camera);
    if (raycaster.ray.intersectPlane(floor, hit)) {
      const m = uniforms.uMouseGrid.value;
      m.x = lerp(m.x, hit.x, 0.08);
      m.y = lerp(m.y, hit.z, 0.08);
    }
    uniforms.uHoverGrid.value = lerp(uniforms.uHoverGrid.value, input.active * smooth.s1 * (1 - smooth.s2), 0.05);
  });

  return (
    <points geometry={geometry} material={material} frustumCulled={false} />
  );
}

/* Câmara: sobe e inclina-se ao longo do scroll; parallax suave com o rato. */
function CameraRig() {
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    readStages(); // lê o scroll a cada frame (funciona com o Lenis e sem eventos)
    smooth.s1 = lerp(smooth.s1, stages.s1, 0.07);
    smooth.s2 = lerp(smooth.s2, stages.s2, 0.07);
    input.active = Math.max(0, input.active - dt * 0.2); // o rato "arrefece" quando pára

    const a = smooth.s1;
    const b = smooth.s2;
    const px = input.ndc.x * 0.6;
    const py = input.ndc.y * 0.35;
    camera.position.x = lerp(camera.position.x, px, 0.04);
    camera.position.y = lerp(camera.position.y, lerp(lerp(0, 3.4, a), 5.2, b) + py, 0.05);
    camera.position.z = lerp(camera.position.z, lerp(lerp(8.5, 10, a), 12.5, b), 0.05);
    look.set(0, lerp(lerp(0, -1.6, a), -2.4, b), lerp(lerp(0, -4, a), -7, b));
    camera.lookAt(look);
  });
  return null;
}

function World({ frontPortal, reduced }: { frontPortal?: RefObject<HTMLElement | null>; reduced: boolean }) {
  const layout = useLayout();
  const invalidate = useThree((s) => s.invalidate);
  useInputAndScroll(invalidate);
  return (
    <>
      <CameraRig />
      <ParticleSystem layout={layout} />
      <Hero3D layout={layout} frontPortal={reduced ? undefined : frontPortal} />
    </>
  );
}

export default function Scene({ frontPortal, onReady }: { frontPortal?: RefObject<HTMLElement | null>; onReady?: () => void }) {
  const [reduced] = useState(() => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [mobile] = useState(() => typeof window !== "undefined" && innerWidth < 1024);
  const maxDpr = 1.5;
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 45, near: 0.1, far: 80 }}
      dpr={dpr}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
    >
      {/* Baixa a resolução se os FPS caírem */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(maxDpr)} flipflops={3} onFallback={() => setDpr(1)} />
      <World frontPortal={frontPortal} reduced={reduced} />
    </Canvas>
  );
}
