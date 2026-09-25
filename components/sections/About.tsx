"use client";

import { motion } from "framer-motion";
import { asset, facts, metrics, profile, skills } from "@/lib/data";
import { Reveal, SectionHeading, Stagger, staggerContainer, staggerItem } from "@/components/ui/Reveal";
import { snappy } from "@/lib/motion";
import Counter from "@/components/ui/Counter";
import TiltCard from "@/components/ui/TiltCard";

export default function About() {
  return (
    <section id="sobre" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="01 — Sobre"
          lines={["Soluções simples,", <span key="b" className="text-mute">úteis e bem estruturadas.</span>]}
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-6 text-base leading-relaxed text-mute sm:text-lg">
            <Reveal>
              <p>
                Sou o <span className="text-white">Leonardo Martins</span>, programador web e mobile em Portugal. Desenvolvo websites,
                aplicações e sistemas de gestão com foco em utilidade, organização e boa experiência de utilização.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                Para além da programação, sou <span className="text-ember">Bombeiro Voluntário</span>. Uma experiência que me trouxe
                responsabilidade, disciplina e atenção ao detalhe — e que levo para cada linha de código.
              </p>
            </Reveal>

            {/* Dados */}
            <Reveal delay={0.2}>
              <dl className="mt-10 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-[8rem_1fr] gap-4 py-4 text-sm sm:grid-cols-[10rem_1fr] sm:text-base">
                    <dt className="font-mono text-xs uppercase tracking-[0.18em] text-mute/80 sm:text-[0.72rem]">{f.label}</dt>
                    <dd className="text-soft">
                      {f.value}
                      {f.hint && <span className="mt-1 block text-xs text-mute">{f.hint}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="mx-auto w-full max-w-sm lg:max-w-none">
            <TiltCard accent="#ff5a1f" max={6} className="overflow-hidden p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(profile.photo)}
                  alt="Leonardo Martins com a farda dos Bombeiros Voluntários"
                  className="h-full w-full object-cover object-[50%_18%] grayscale-[35%] transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6" style={{ transform: "translateZ(40px)" }}>
                  <div>
                    <p className="font-display text-xl font-semibold text-white">Leonardo Martins</p>
                    <p className="mt-1 text-sm text-mute">Programador Web & Mobile</p>
                  </div>
                  <span className="rounded-full border border-ember/40 bg-ember/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ember">
                    BV Tirsenses
                  </span>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>

        {/* Métricas */}
        <Stagger className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-3">
          {metrics.map((m) => (
            <motion.div key={m.label} variants={staggerItem} className="bg-ink/90 p-8 sm:p-10">
              <p className="font-display text-6xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
                <Counter value={m.value} suffix={m.suffix} />
              </p>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-mute">{m.label}</p>
            </motion.div>
          ))}
        </Stagger>

        {/* Stack: cada área e cada tecnologia surgem em cascata (0.1s) */}
        <Stagger className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {skills.map((s) => (
            <motion.div key={s.area} variants={staggerContainer(0.1)}>
              <motion.p variants={staggerItem} className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan">
                {s.area}
              </motion.p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {s.items.map((it) => (
                  <motion.li
                    key={it}
                    variants={staggerItem}
                    whileHover={{ y: -3, transition: snappy }}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-soft transition-colors duration-300 hover:border-cyan/50 hover:text-white"
                  >
                    {it}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
