"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/data";
import { MaskText } from "@/components/ui/Reveal";
import { elastic, snappy, spring } from "@/lib/motion";
import MagneticButton from "@/components/ui/MagneticButton";
import { ArrowRight, Code, Flame, GitHub } from "@/components/ui/Icons";


const sides = [
  {
    key: "dev",
    label: "Programador",
    icon: Code,
    color: "text-cyan",
    ring: "bg-cyan/10 ring-cyan/40",
    text: "Websites, aplicações móveis e sistemas de gestão — de Next.js e Supabase a Flutter e Kotlin.",
  },
  {
    key: "bv",
    label: "Bombeiro Voluntário",
    icon: Flame,
    color: "text-ember",
    ring: "bg-ember/10 ring-ember/40",
    text: "Nos Bombeiros Voluntários Tirsenses, onde aprendi responsabilidade, disciplina e atenção ao detalhe.",
  },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false); // rato por cima
  const [manual, setManual] = useState(false); // alguém já escolheu
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Mola leve: suaviza o parallax (lerp) e evita a aceleração nativa do scroll, que não respeita o target
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const y = useTransform(progress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(progress, [0, 0.7], [1, 0]);

  // Alterna sozinho a cada 8s (tempo para ler); pára com o rato por cima e deixa de mudar depois de um clique
  useEffect(() => {
    if (paused || manual) return;
    const t = setTimeout(() => setI((v) => (v + 1) % sides.length), 8000);
    return () => clearTimeout(t);
  }, [i, paused, manual]);

  const current = sides[i];

  return (
    <section ref={ref} id="topo" className="relative flex min-h-[100svh] items-center pt-28 pb-24">
      <motion.div style={{ y, opacity }} className="container-x relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-soft"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          {profile.location}
        </motion.p>

        <MaskText
          as="h1"
          inView={false}
          lines={[
            "Crio soluções",
            "digitais com",
            <span key="u" className="text-gradient">utilidade real.</span>,
          ]}
          className="font-display text-[clamp(2.6rem,8.5vw,6.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
        />

        {/* Dualidade Programador | Bombeiro Voluntário */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...elastic, delay: 0.7 }}
          className="mt-10 max-w-xl"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
            {sides.map((s, idx) => {
              const Icon = s.icon;
              const on = idx === i;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    setI(idx);
                    setManual(true);
                  }}
                  aria-pressed={on}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-300 ${on ? "text-white" : "text-mute hover:text-soft"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="dual"
                      className={`absolute inset-0 rounded-full ring-1 ${s.ring}`}
                      transition={snappy}
                    />
                  )}
                  <Icon className={`relative h-4 w-4 transition-colors duration-300 ${on ? s.color : ""}`} />
                  <span className="relative">{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="relative mt-5 min-h-[3.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={current.key}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ ...spring, stiffness: 120, damping: 18 }}
                className="text-base leading-relaxed text-mute sm:text-lg"
              >
                {current.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...elastic, delay: 0.9 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="#projetos">
            Ver projetos <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </MagneticButton>
          <MagneticButton href={profile.github} variant="ghost" external>
            <GitHub className="h-4 w-4" /> GitHub
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.a
        href="#sobre"
        aria-label="Descer para a secção Sobre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-mute sm:flex"
      >
        Scroll
        <span className="relative h-12 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent to-cyan"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
