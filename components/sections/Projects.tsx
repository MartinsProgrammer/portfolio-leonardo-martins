"use client";

import { motion } from "framer-motion";
import { projects, type Project } from "@/lib/data";
import { SectionHeading, Stagger, staggerContainer, staggerItem } from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import LiquidVisual from "@/components/three/LiquidVisual";
import { elastic } from "@/lib/motion";
import { NexoVisual, NoraVisual } from "./ProjectVisuals";

const visuals = { nexo: NexoVisual, nora: NoraVisual } as const;

function StatusBadge({ status }: { status: Project["status"] }) {
  const done = status === "Concluído";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mute">
      <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-400" : "animate-pulse bg-amber-400"}`} />
      {status}
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const Visual = visuals[project.visual];
  return (
    <TiltCard accent={project.accent} max={7} className="h-full">
      <article className="flex h-full flex-col" style={{ transformStyle: "preserve-3d" }}>
        <div className="relative m-2 aspect-[16/11] overflow-hidden rounded-[1.25rem]" style={{ transformStyle: "preserve-3d" }}>
          <LiquidVisual>
            <Visual />
          </LiquidVisual>
        </div>

        {/* Conteúdo do cartão em cascata */}
        <motion.div
          variants={staggerContainer(0.1, 0.25)}
          className="flex flex-1 flex-col p-6 pt-4 sm:p-8 sm:pt-5"
          style={{ transform: "translateZ(30px)" }}
        >
          <motion.div variants={staggerItem} className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs" style={{ color: project.accent }}>
              0{index + 1}.
            </span>
            <StatusBadge status={project.status} />
          </motion.div>
          <motion.h3 variants={staggerItem} className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {project.title}
          </motion.h3>
          <motion.p variants={staggerItem} className="mt-1 text-sm italic text-mute">
            {project.tagline}
          </motion.p>
          <motion.p variants={staggerItem} className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-mute sm:text-base">
            {project.description}
          </motion.p>
          <motion.ul variants={staggerContainer(0.06)} className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <motion.li
                key={t}
                variants={staggerItem}
                className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[0.68rem] text-soft"
              >
                {t}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </article>
    </TiltCard>
  );
}

export default function Projects() {
  return (
    <section id="projetos" className="relative py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="03 — Projetos"
          lines={["Projetos em", <span key="b" className="text-gradient">destaque.</span>]}
          intro="Da gestão de escolas de condução à segurança pessoal: software pensado para ser usado todos os dias."
        />

        <Stagger className="mt-16 grid gap-6 md:grid-cols-2 lg:gap-8" stagger={0.15}>
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 80, scale: 0.92, rotateX: 8 },
                show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { ...elastic, staggerChildren: 0.1 } },
              }}
              style={{ transformPerspective: 1200 }}
            >
              <ProjectCard project={p} index={i} />
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
