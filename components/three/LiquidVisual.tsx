"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type * as THREE from "three";
import { snoise } from "./glsl";

/*
  Distorção de lente ao passar o rato.
  A ilustração do cartão é HTML vivo; ao entrar com o rato tiramos uma "fotografia"
  dela para uma textura e desenhamos por cima um plano WebGL com um shader de
  fluido (ondulação + ruído + aberração cromática) centrado no cursor.
  O loop só corre enquanto o efeito está visível. Desligado em ecrãs táteis.
  O three.js e o html-to-image só são descarregados no primeiro hover (não pesam no arranque).
*/

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;
  ${snoise}
  void main() {
    vec2 uv = vUv;
    vec2 d = uv - uMouse;
    d.x *= uAspect;
    float r = length(d);
    float fall = smoothstep(0.6, 0.0, r) * uStrength;

    // Fluxo de "vidro derretido" + ondas concêntricas a partir do cursor
    float n1 = snoise(vec3(uv * 3.2, uTime * 0.45));
    float n2 = snoise(vec3(uv * 3.2 + 11.3, uTime * 0.45));
    vec2 flow = vec2(n1, n2) * 0.045 * fall;
    vec2 dirv = r > 0.0001 ? d / r : vec2(0.0);
    vec2 ripple = dirv * sin(r * 32.0 - uTime * 5.5) * 0.011 * fall;
    ripple.x /= uAspect;
    vec2 duv = uv + flow + ripple + vec2(n2, n1) * 0.004 * uStrength;

    // Aberração cromática
    float ca = 0.007 * fall + 0.0015 * uStrength;
    vec3 col;
    col.r = texture2D(uTex, duv + vec2(ca, 0.0)).r;
    col.g = texture2D(uTex, duv).g;
    col.b = texture2D(uTex, duv - vec2(ca, 0.0)).b;

    // Reflexo líquido subtil
    col += fall * 0.09 * vec3(0.55, 0.9, 1.0) * smoothstep(0.35, 0.9, n1 * 0.5 + 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

let fontCSS: Promise<string> | null = null;
let libs: Promise<[typeof import("three"), typeof import("html-to-image")]> | null = null;
const loadLibs = () => (libs ??= Promise.all([import("three"), import("html-to-image")]));

export default function LiquidVisual({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const node = content.current;
    const cv = canvas.current;
    if (!el || !node || !cv) return;
    const capable = matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!capable) return;

    let T: typeof import("three") | null = null;
    let toCanvas: typeof import("html-to-image").toCanvas;
    let getFontEmbedCSS: typeof import("html-to-image").getFontEmbedCSS;
    let renderer: THREE.WebGLRenderer | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let texture: THREE.Texture | null = null;
    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    // Rato em UV (0..1), suavizado no loop
    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    let strength = 0;
    let goal = 0;
    let raf = 0;
    let running = false;
    let capturing = false;
    let last = performance.now();

    const setup = async () => {
      if (renderer) return;
      const [three, h2i] = await loadLibs();
      if (renderer) return;
      T = three;
      toCanvas = h2i.toCanvas;
      getFontEmbedCSS = h2i.getFontEmbedCSS;
      scene = new T.Scene();
      camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      material = new T.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTex: { value: null },
          uMouse: { value: new T.Vector2(0.5, 0.5) },
          uStrength: { value: 0 },
          uTime: { value: 0 },
          uAspect: { value: 1 },
        },
      });
      scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), material));
    };

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      strength += (goal - strength) * 0.08;
      mouse.x += (target.x - mouse.x) * 0.12;
      mouse.y += (target.y - mouse.y) * 0.12;
      if (material && renderer) {
        material.uniforms.uMouse.value.set(mouse.x, mouse.y);
        material.uniforms.uStrength.value = strength;
        material.uniforms.uTime.value += dt;
        renderer.render(scene, camera);
      }
      if (goal === 0 && strength < 0.003) {
        running = false;
        cv.style.opacity = "0";
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const capture = async () => {
      if (capturing) return;
      capturing = true;
      try {
        await setup();
        const r = el.getBoundingClientRect();
        const w = node.offsetWidth;
        const h = node.offsetHeight;
        fontCSS ??= getFontEmbedCSS(node);
        const snap = await toCanvas(node, { pixelRatio: Math.min(devicePixelRatio, 2), fontEmbedCSS: await fontCSS, width: w, height: h });
        if (!renderer || !material || !T) return;
        texture?.dispose();
        texture = new T.CanvasTexture(snap);
        texture.colorSpace = T.NoColorSpace;
        texture.minFilter = T.LinearFilter;
        texture.generateMipmaps = false;
        material.uniforms.uTex.value = texture;
        material.uniforms.uAspect.value = w / h;
        renderer.setSize(w, h, false);
        if (goal === 1 && r.width > 0) {
          renderer.render(scene, camera);
          cv.style.opacity = "1";
          start();
        }
      } catch {
        // Sem captura: o cartão continua a funcionar sem distorção
      } finally {
        capturing = false;
      }
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      goal = 1;
      if (running && texture) return; // ainda a desvanecer: reaproveita a captura
      void capture();
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      if (!running && goal === 0) Object.assign(mouse, target);
    };
    const onLeave = () => {
      goal = 0;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      texture?.dispose();
      material?.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
      <div ref={content} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300"
      />
    </div>
  );
}
