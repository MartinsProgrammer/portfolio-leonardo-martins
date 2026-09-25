"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue, type Variants } from "framer-motion";
import { useRef } from "react";
import { experience, type Experience } from "@/lib/data";
import { SectionHeading, staggerContainer } from "@/components/ui/Reveal";
import { elastic } from "@/lib/motion";

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  // Mola sobre o progresso do scroll: a linha "enche" com inércia em vez de saltar
  const progress = useSpring(scrollYProgress, { stiffness: 50, damping: 15, restDelta: 0.0005 });
  const headTop = useTransform(progress, (v) => `${v * 100}%`);
  const headOpacity = useTransform(progress, [0, 0.02, 0.98, 1], [0, 1, 1, 0.6]);

  return (
    <section id="experiencia" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="02 — Experiência"
          lines={["Experiência real", <span key="b" className="text-mute">na área das TI.</span>]}
          intro="Ao longo da formação desenvolvi competências em programação, desenvolvimento web, aplicações móveis, APIs, bases de dados e suporte informático, através de estágios em contexto real."
        />

        <div ref={ref} className="relative mt-20">
          {/* Trilho */}
          <div className="absolute top-0 bottom-0 left-[11px] w-px bg-white/[0.08] md:left-1/2 md:-translate-x-1/2" />

          {/* Preenchimento: laranja (Proteção Civil) em cima, ciano (tech) em baixo */}
          <motion.div
            style={{ scaleY: progress }}
            className="absolute top-0 bottom-0 left-[10px] w-[3px] origin-top rounded-full bg-gradient-to-b from-ember via-[#ff9a4d] to-cyan md:left-1/2 md:-translate-x-1/2"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: progress }}
            className="absolute top-0 bottom-0 left-[4px] w-[15px] origin-top bg-gradient-to-b from-ember/40 via-transparent to-cyan/40 blur-md md:left-1/2 md:-translate-x-1/2"
          />

          {/* Cabeça luminosa que percorre a linha */}
          <motion.span
            aria-hidden
            style={{ top: headTop, opacity: headOpacity }}
            className="absolute left-[11px] z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.08),0_0_24px_6px_rgba(62,232,255,0.7)] md:left-1/2"
          />

          <ol className="space-y-16 md:space-y-28">
            {experience.map((item, i) => (
              <TimelineItem key={item.company} item={item} index={i} total={experience.length} progress={progress} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const piece: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: elastic },
};

function TimelineItem({ item, index, total, progress }: { item: Experience; index: number; total: number; progress: MotionValue<number> }) {
  // O nó acende quando a linha chega a ele
  const at = total > 1 ? index / (total - 1) : 0;
  const lit = useTransform(progress, [Math.max(0, at - 0.06), at], [0, 1]);
  const scale = useTransform(lit, [0, 1], [0.4, 1]);
  const left = index % 2 === 0;
  const accent = item.highlight ? "#ff5a1f" : "#3ee8ff";

  return (
    <li className="relative grid md:grid-cols-2 md:gap-16">
      <span aria-hidden className="absolute top-2 left-[5px] h-[13px] w-[13px] rounded-full border border-white/20 bg-ink md:left-1/2 md:-translate-x-1/2" />
      <motion.span
        aria-hidden
        style={{ opacity: lit, scale, background: accent, boxShadow: `0 0 0 6px ${accent}22, 0 0 24px ${accent}` }}
        className="absolute top-2 left-[5px] h-[13px] w-[13px] rounded-full md:left-1/2 md:-translate-x-1/2"
      />

      {/* Ano, cargo, empresa e descrição entram em cascata (0.1s) */}
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-18% 0px" }}
        className={`pl-10 md:pl-0 ${left ? "md:col-start-1 md:pr-4 md:text-right" : "md:col-start-2 md:pl-4"}`}
      >
        <motion.p variants={piece} className="flex items-baseline gap-3 font-mono text-xs tracking-[0.2em] uppercase md:inline-flex" style={{ color: accent }}>
          <span className="font-display text-3xl font-semibold tracking-tight">{item.year}</span>
          {item.role}
        </motion.p>
        <motion.h3 variants={piece} className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {item.company}
        </motion.h3>
        <motion.p variants={piece} className={`mt-4 max-w-md text-base leading-relaxed text-mute ${left ? "md:ml-auto" : ""}`}>
          {item.description}
        </motion.p>
      </motion.div>
    </li>
  );
}
