"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { scroller } from "@/lib/motion";

/* Scroll com inércia: o Lenis interpola a posição (lerp) em vez do salto nativo. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      autoRaf: true,
      anchors: { offset: -24 },
    });
    scroller.lenis = lenis;
    document.documentElement.classList.add("lenis");

    return () => {
      lenis.destroy();
      scroller.lenis = null;
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  return null;
}
