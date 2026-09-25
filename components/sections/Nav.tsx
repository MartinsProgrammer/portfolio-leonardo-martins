"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { nav } from "@/lib/data";
import { elastic, scroller, snappy } from "@/lib/motion";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Nav() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Secção ativa no menu
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["topo", ...nav.map((n) => n.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    // Com o menu aberto, pára o scroll suave
    if (scroller.lenis) open ? scroller.lenis.stop() : scroller.lenis.start();
    else document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...elastic, delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="container-x pt-4">
        <div
          className={`relative z-50 flex items-center justify-between rounded-full px-3 py-2 transition-all duration-500 sm:px-4 ${
            scrolled && !open ? "glass !bg-ink/75 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]" : "border border-transparent"
          }`}
        >
          <a href="#topo" data-cursor="magnet" onClick={() => setOpen(false)} className="group flex items-center gap-3" aria-label="Início">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 font-display text-sm font-semibold text-white transition-colors duration-300 group-hover:border-cyan/70">
              <span>
                L<span className="text-cyan">M</span>
              </span>
            </span>
            <span className="hidden font-display text-sm font-semibold tracking-tight text-white sm:block">Leonardo Martins</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} data-cursor="magnet" className="relative rounded-full px-4 py-2 text-sm text-mute transition-colors duration-300 hover:text-white">
                {active === n.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                    transition={snappy}
                  />
                )}
                <span className={`relative ${active === n.id ? "text-white" : ""}`}>{n.label}</span>
              </a>
            ))}
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            <span className={`absolute h-px w-4 bg-white transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
            <span className={`absolute h-px w-4 bg-white transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 90% 40px)" }}
            animate={{ clipPath: "circle(150% at 90% 40px)" }}
            exit={{ clipPath: "circle(0% at 90% 40px)" }}
            transition={{ duration: 0.7, ease }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-ink/95 px-8 backdrop-blur-xl md:hidden"
          >
            {nav.map((n, i) => (
              <motion.a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...elastic, delay: 0.15 + i * 0.1 }}
                className="flex items-baseline gap-4 border-b border-white/[0.06] py-5 font-display text-4xl font-semibold tracking-tight text-white"
              >
                <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                {n.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
