"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/lib/i18n";

const Scene = lazy(() => import("./Scene"));

/* Fallback elegante enquanto o WebGL carrega: um orbe em CSS no lugar da esfera. */
function SceneFallback() {
  const { t } = useContent();
  return (
    <motion.div
      key="fallback"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
      transition={{ duration: 0.9 }}
      className="absolute inset-0 grid place-items-center lg:place-items-center lg:justify-end lg:pr-[14vw]"
    >
      <div className="relative -mt-[30vh] h-44 w-44 lg:mt-0 lg:h-64 lg:w-64">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(62,232,255,0.55),rgba(29,78,216,0.25)_45%,transparent_70%)] blur-sm" />
        <div className="absolute inset-[18%] animate-[spin_6s_linear_infinite] rounded-full border border-cyan/30 border-t-ember/70" />
        <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.3em] text-mute">
          {t.scene.loading}
        </p>
      </div>
    </motion.div>
  );
}

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const front = useRef<HTMLDivElement>(null);

  /*
    A cena 3D (three.js + shaders) é pesada para arrancar. Para o texto ficar utilizável logo:
    - telemóvel/ecrã estreito: arranca no primeiro toque/scroll, ou ao fim de 5 s;
    - desktop: assim que o browser estiver livre (requestIdleCallback).
    Até lá mostra-se o orbe em CSS (SceneFallback).
  */
  useEffect(() => {
    const events = ["pointerdown", "touchstart", "scroll", "wheel", "keydown"] as const;
    let timer = 0;
    let idle = 0;
    const cleanup = () => {
      events.forEach((e) => removeEventListener(e, start));
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback?.(idle);
    };
    function start() {
      cleanup();
      setMounted(true);
    }
    if (matchMedia("(pointer: coarse), (max-width: 1023px)").matches) {
      events.forEach((e) => addEventListener(e, start, { passive: true }));
      timer = window.setTimeout(start, 5000);
    } else if (window.requestIdleCallback) idle = window.requestIdleCallback(start, { timeout: 1500 });
    else timer = window.setTimeout(start, 200);
    return cleanup;
  }, []);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.6 }}>
          {mounted && (
            <Suspense fallback={null}>
              <Scene frontPortal={front} onReady={() => setReady(true)} />
            </Suspense>
          )}
        </motion.div>
        <AnimatePresence>{!ready && <SceneFallback />}</AnimatePresence>
        <div className="vignette absolute inset-0" />
        <div className="grain absolute inset-0" />
      </div>
      {/* Camada à frente do conteúdo: palavras 3D que passam por cima do texto */}
      <div ref={front} aria-hidden className={`pointer-events-none fixed inset-0 z-20 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} />
    </>
  );
}
