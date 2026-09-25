"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* Cartão com inclinação 3D e reflexo que segue o rato. */
export default function TiltCard({ children, className = "", accent = "#3ee8ff", max = 10 }: { children: ReactNode; className?: string; accent?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 20, mass: 0.5 };
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, (v) => v * 100);
  const gy = useTransform(py, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, ${accent}26, transparent 55%)`;
  const hover = useSpring(0, spring);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-cursor="magnet"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", ["--accent" as string]: accent }}
        className={`group relative rounded-3xl border border-white/[0.08] bg-graphite/80 transition-[border-color,box-shadow] duration-500 hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:shadow-[0_30px_80px_-30px_var(--accent)] ${className}`}
      >
        {children}
        <motion.div aria-hidden style={{ background: glare, opacity: hover }} className="pointer-events-none absolute inset-0 rounded-3xl" />
      </motion.div>
    </div>
  );
}
