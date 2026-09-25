"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  type?: "button" | "submit";
  className?: string;
};

/* Botão que é atraído pelo cursor. As molas fazem o papel do lerp. */
export default function MagneticButton({ href, children, variant = "primary", external, type = "button", className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(120px circle at ${gx}% ${gy}%, rgba(62,232,255,0.55), transparent 70%)`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.3);
    y.set(dy * 0.4);
    gx.set(((e.clientX - r.left) / r.width) * 100);
    gy.set(((e.clientY - r.top) / r.height) * 100);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4 text-sm font-medium tracking-wide transition-[box-shadow,background-color,border-color] duration-500";
  const styles =
    variant === "primary"
      ? "bg-white text-ink shadow-[0_0_0_1px_rgba(62,232,255,0.3),0_10px_40px_-10px_rgba(62,232,255,0.5)] hover:shadow-[0_0_0_1px_rgba(62,232,255,0.8),0_16px_60px_-8px_rgba(62,232,255,0.8)]"
      : "border border-white/15 text-white hover:border-cyan/60 hover:bg-white/[0.04]";

  const inner = (
    <>
      {variant === "primary" && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glow }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </>
  );

  const common = {
    ref: ref as never,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    style: { x: sx, y: sy },
    className: `${base} ${styles} ${className}`,
    whileTap: { scale: 0.96 },
    "data-cursor": "magnet",
  };

  if (href) {
    return (
      <motion.a href={href} {...common} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} {...common}>
      {inner}
    </motion.button>
  );
}

