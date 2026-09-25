"use client";

import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

/* Número que conta de 0 até ao valor quando entra no viewport. */
export default function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, mv, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{text}</motion.span>
    </span>
  );
}
