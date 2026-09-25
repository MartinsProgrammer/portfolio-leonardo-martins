"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { elastic, spring } from "@/lib/motion";

const viewport = { once: true, margin: "-10% 0px" } as const;

/* Fade + slide-up com física de mola quando o elemento entra no viewport. */
export function Reveal({ children, delay = 0, y = 40, className = "", bouncy = false }: { children: ReactNode; delay?: number; y?: number; className?: string; bouncy?: boolean }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: bouncy ? 0.96 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewport}
      transition={{ ...(bouncy ? elastic : spring), delay, opacity: { duration: 0.6, delay } }}
    >
      {children}
    </motion.div>
  );
}

/* Cascata: o contentor não anima, só atrasa os filhos (StaggerItem) em 0.1s cada. */
export const staggerContainer = (stagger = 0.1, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: elastic },
};

export function Stagger({ children, className = "", stagger = 0.1, delay = 0, as = "div" }: { children: ReactNode; className?: string; stagger?: number; delay?: number; as?: "div" | "ul" | "ol" }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={staggerContainer(stagger, delay)} initial="hidden" whileInView="show" viewport={viewport}>
      {children}
    </Tag>
  );
}

/* Texto revelado linha a linha por uma máscara (overflow hidden), com mola elástica. */
const line: Variants = {
  hidden: { y: "115%", rotate: 3 },
  show: (i: number) => ({ y: "0%", rotate: 0, transition: { ...elastic, delay: 0.1 + i * 0.1 } }),
};

export function MaskText({ lines, className = "", as: Tag = "h2", inView = true }: { lines: ReactNode[]; className?: string; as?: "h1" | "h2" | "h3"; inView?: boolean }) {
  const MotionTag = motion[Tag];
  return (
    <MotionTag className={className} initial="hidden" {...(inView ? { whileInView: "show", viewport } : { animate: "show" })}>
      {lines.map((l, i) => (
        <span key={i} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
          <motion.span className="block origin-left" variants={line} custom={i}>
            {l}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export function SectionHeading({ eyebrow, lines, intro }: { eyebrow: string; lines: ReactNode[]; intro?: string }) {
  return (
    <div className="max-w-3xl">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <MaskText
        lines={lines}
        className="mt-5 font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white"
      />
      {intro && (
        <Reveal delay={0.25}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-mute sm:text-lg">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
