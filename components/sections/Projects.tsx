"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { asset, profile, type Project } from "@/lib/data";
import { useContent } from "@/lib/i18n";
import { SectionHeading } from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import LiquidVisual from "@/components/three/LiquidVisual";
import { ArrowRight, GitHub } from "@/components/ui/Icons";
import { scroller, snappy } from "@/lib/motion";
import { CivilVisual, NexoVisual, NoraVisual } from "./ProjectVisuals";

/*
  Projetos:
  - Desktop: a secção fica presa (sticky) e o scroll vertical faz deslizar os cartões na horizontal.
    Cada cartão roda em 3D consoante a distância ao centro do ecrã.
  - Telemóvel / movimento reduzido: carrossel com swipe nativo (scroll-snap).
  - Clicar num cartão abre o detalhe: o mockup "voa" da posição do cartão até ocupar o ecrã.
*/

const visuals = { nexo: NexoVisual, nora: NoraVisual, civil: CivilVisual } as const;

type Opened = { id: string; from: DOMRect };
type OpenFn = (p: Project, el: HTMLElement) => void;

const wrapIn = (list: Project[], i: number) => list[(i + list.length) % list.length];

/* Título da secção (igual nos dois modos) */
function Heading() {
  const { t } = useContent();
  return <SectionHeading eyebrow={t.projects.eyebrow} lines={[t.projects.lines[0], <span key="b" className="text-gradient">{t.projects.lines[1]}</span>]} intro={t.projects.intro} />;
}

function StatusBadge({ done }: { done: boolean }) {
  const { t } = useContent();
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mute">
      <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-400" : "animate-pulse bg-amber-400"}`} />
      {done ? t.projects.done : t.projects.wip}
    </span>
  );
}

function TechList({ tech, className = "" }: { tech: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {tech.map((t) => (
        <li key={t} className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[0.68rem] text-soft">
          {t}
        </li>
      ))}
    </ul>
  );
}

/* Mockup com distorção líquida. Fica invisível enquanto o detalhe desse projeto está aberto (é ele que "voou"). */
function CardVisual({ project, hidden }: { project: Project; hidden: boolean }) {
  const Visual = visuals[project.visual];
  return (
    <div data-visual={project.id} className="relative h-full w-full overflow-hidden rounded-[1.25rem]" style={{ visibility: hidden ? "hidden" : "visible", transformStyle: "preserve-3d" }}>
      <LiquidVisual>
        <Visual />
      </LiquidVisual>
    </div>
  );
}

function OpenLabel({ project }: { project: Project }) {
  const { t } = useContent();
  return (
    <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] transition-[gap] duration-300 group-hover:gap-3" style={{ color: project.accent }}>
      {t.projects.open} <ArrowRight className="h-4 w-4" />
    </span>
  );
}

const openFrom = (onOpen: OpenFn, p: Project) => (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget.querySelector<HTMLElement>("[data-visual]");
  if (el) onOpen(p, el);
};

/* --------------------------------------------------------- desktop: sticky */

function PinnedCard({ project, index, x, layout, openId, onOpen }: {
  project: Project;
  index: number;
  x: MotionValue<number>;
  layout: { o: number; w: number; vw: number };
  openId?: string;
  onOpen: OpenFn;
}) {
  const { t } = useContent();
  // As medidas vêm de uma ref, para o transform usar sempre os valores atuais
  const m = useRef(layout);
  m.current = layout;
  const d = useTransform(() => {
    const { o, w, vw } = m.current;
    return (o + w / 2 + x.get() - vw / 2) / vw;
  });
  const rotateY = useTransform(d, (v) => Math.max(-1.2, Math.min(1.2, v)) * -24);
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 1) * 0.14);
  const opacity = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 1.1) * 0.6);
  const z = useTransform(d, (v) => -Math.abs(v) * 140);

  return (
    <motion.div data-card style={{ rotateY, scale, opacity, z, transformPerspective: 1400 }} className="h-[min(72vh,640px)] w-[min(64vw,980px)] shrink-0">
      <TiltCard accent={project.accent} max={5} className="h-full">
        <button
          type="button"
          onClick={openFrom(onOpen, project)}
          className="grid h-full w-full grid-cols-[1.2fr_1fr] text-left"
          style={{ transformStyle: "preserve-3d" }}
          aria-label={t.projects.openAria(project.title)}
        >
          <div className="m-2">
            <CardVisual project={project} hidden={openId === project.id} />
          </div>
          <div className="flex flex-col justify-center p-8 xl:p-10" style={{ transform: "translateZ(30px)" }}>
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs" style={{ color: project.accent }}>
                0{index + 1}.
              </span>
              <StatusBadge done={project.done} />
            </div>
            <h3 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white xl:text-5xl">{project.title}</h3>
            <p className="mt-1 text-sm italic text-mute">{project.tagline}</p>
            <p className="mt-5 line-clamp-5 text-[0.95rem] leading-relaxed text-mute">{project.description}</p>
            <TechList tech={project.tech} className="mt-6" />
            <OpenLabel project={project} />
          </div>
        </button>
      </TiltCard>
    </motion.div>
  );
}

function PinnedTrack({ openId, onOpen }: { openId?: string; onOpen: OpenFn }) {
  const { projects, t } = useContent();
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const distance = useMotionValue(0);
  const [dims, setDims] = useState({ distance: 0, vw: 1, cards: [] as { o: number; w: number }[] });
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const t = track.current;
    if (!t) return;
    const measure = () => {
      const cards = Array.from(t.querySelectorAll<HTMLElement>("[data-card]")).map((c) => ({ o: c.offsetLeft, w: c.offsetWidth }));
      const dist = Math.max(0, t.scrollWidth - innerWidth);
      distance.set(dist);
      setDims({ distance: dist, vw: innerWidth, cards });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", measure);
    };
  }, [distance]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // Mola leve: o deslize horizontal assenta suavemente (como o parallax do Hero)
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.0005 });
  const x = useTransform(() => -progress.get() * distance.get());
  const bar = useTransform(progress, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(x, "change", (v) => {
    let best = 0;
    dims.cards.forEach((c, i) => {
      const b = dims.cards[best];
      if (Math.abs(c.o + c.w / 2 + v - dims.vw / 2) < Math.abs(b.o + b.w / 2 + v - dims.vw / 2)) best = i;
    });
    setActive(best);
  });

  return (
    <div ref={section} style={{ height: `calc(100vh + ${dims.distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex items-center gap-[5vw] pr-[18vw] pl-[max(2rem,calc((100vw-76rem)/2+2rem))]">
          <div className="w-[min(34vw,460px)] shrink-0">
            <Heading />
            <p className="mt-10 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-mute">
              {t.projects.keepScrolling} <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </div>

          {projects.map((p, i) => (
            <PinnedCard key={p.id} project={p} index={i} x={x} layout={{ ...(dims.cards[i] ?? { o: 0, w: 1 }), vw: dims.vw }} openId={openId} onOpen={onOpen} />
          ))}

          <div className="w-[min(26vw,340px)] shrink-0">
            <p className="eyebrow">{t.projects.moreEyebrow}</p>
            <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">{t.projects.moreText}</p>
            <a href={profile.github} target="_blank" rel="noreferrer" data-cursor="magnet" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white transition-colors hover:border-cyan/60">
              <GitHub className="h-4 w-4" /> {t.projects.seeGithub}
            </a>
          </div>
        </motion.div>

        {/* Progresso da secção */}
        <div className="container-x absolute inset-x-0 bottom-10 flex items-center gap-6 font-mono text-xs text-mute">
          <span className="w-16 text-white">
            0{active + 1} <span className="text-mute">/ 0{projects.length}</span>
          </span>
          <div className="relative h-px flex-1 bg-white/10">
            <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan to-tech" style={{ width: bar }} />
          </div>
          <span className="w-32 text-right uppercase tracking-[0.18em] transition-colors duration-500" style={{ color: projects[active]?.accent }}>
            {projects[active]?.title}
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- telemóvel: swipe */

function SwipeTrack({ openId, onOpen }: { openId?: string; onOpen: OpenFn }) {
  const { projects, t } = useContent();
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const r = rail.current;
    if (!r) return;
    const mid = r.scrollLeft + r.clientWidth / 2;
    const dist = (c: HTMLElement) => Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
    const cards = Array.from(r.children) as HTMLElement[];
    setActive(cards.reduce((best, c, i) => (dist(c) < dist(cards[best]) ? i : best), 0));
  };

  return (
    <div className="py-28 sm:py-36">
      <div className="container-x">
        <Heading />
      </div>
      <div ref={rail} onScroll={onScroll} className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {projects.map((p, i) => (
          <div key={p.id} className="w-[86vw] max-w-[520px] shrink-0 snap-center">
            <TiltCard accent={p.accent} max={5} className="h-full">
              <button type="button" onClick={openFrom(onOpen, p)} className="flex h-full w-full flex-col text-left" aria-label={t.projects.openAria(p.title)}>
                <div className="m-2 aspect-[16/11]">
                  <CardVisual project={p} hidden={openId === p.id} />
                </div>
                <div className="flex flex-1 flex-col p-6 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs" style={{ color: p.accent }}>
                      0{i + 1}.
                    </span>
                    <StatusBadge done={p.done} />
                  </div>
                  <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">{p.title}</h3>
                  <p className="mt-1 text-sm italic text-mute">{p.tagline}</p>
                  <p className="mt-4 line-clamp-3 flex-1 text-[0.95rem] leading-relaxed text-mute">{p.description}</p>
                  <OpenLabel project={p} />
                </div>
              </button>
            </TiltCard>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2" aria-hidden>
        {projects.map((p, i) => (
          <span key={p.id} className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === active ? 28 : 6, background: i === active ? p.accent : "rgb(255 255 255 / 0.2)" }} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- detalhe */

function finalRect() {
  const vw = innerWidth;
  const vh = innerHeight;
  if (vw >= 1024) return { top: vh * 0.1, left: vw * 0.05, width: vw * 0.52, height: vh * 0.8 };
  return { top: vh * 0.07, left: vw * 0.04, width: vw * 0.92, height: Math.min(vh * 0.36, vw * 0.92 * 0.7) };
}

function CaseBlock({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <p className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.2em]" style={{ color: accent }}>
        <span className="h-px w-6" style={{ background: accent }} />
        {label}
      </p>
      <div className="mt-3 leading-relaxed text-soft">{children}</div>
    </div>
  );
}

function ProjectModal({ opened, onClose, onSwitch }: { opened: Opened; onClose: () => void; onSwitch: (id: string) => void }) {
  const { projects, t } = useContent();
  const index = Math.max(0, projects.findIndex((p) => p.id === opened.id));
  const project = projects[index];
  const { from } = opened;
  const Visual = visuals[project.visual];
  const [to] = useState(finalRect);
  const [wide] = useState(() => innerWidth >= 1024);
  const fromRect = { top: from.top, left: from.left, width: from.width, height: from.height };
  const spring = { type: "spring", stiffness: 110, damping: 19, mass: 0.9 } as const;
  const prev = wrapIn(projects, index - 1);
  const next = wrapIn(projects, index + 1);

  return (
    <motion.div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={project.title}>
      <motion.div
        className="absolute inset-0 bg-ink/85 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
        onClick={onClose}
      />

      {/* O mockup sai exatamente do sítio do cartão e cresce até à posição final (e volta ao fechar) */}
      <motion.div
        className="fixed overflow-hidden rounded-[1.25rem]"
        style={{ boxShadow: `0 40px 140px -40px ${project.accent}88` }}
        initial={fromRect}
        animate={to}
        exit={{ ...fromRect, transition: { ...spring, stiffness: 160, damping: 24 } }}
        transition={spring}
      >
        <AnimatePresence initial={false}>
          <motion.div key={project.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Visual />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Estudo de caso: o problema, o que construí, o resultado (se existir), capturas e stack */}
      <motion.div
        key={project.id}
        data-lenis-prevent
        className="fixed overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={wide ? { top: to.top, left: to.left + to.width + innerWidth * 0.04, width: innerWidth * 0.34, height: to.height } : { top: to.top + to.height + 24, left: to.left, width: to.width, bottom: 88 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0, transition: { ...snappy, delay: 0.25 } }}
        exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
      >
        <div className="flex min-h-full flex-col justify-center py-2">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs" style={{ color: project.accent }}>
              0{index + 1} / 0{projects.length}
            </span>
            <StatusBadge done={project.done} />
          </div>
          <h3 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-semibold tracking-tight text-white">{project.title}</h3>
          <p className="mt-2 text-lg italic" style={{ color: project.accent }}>
            {project.tagline}
          </p>

          <CaseBlock label={t.projects.problem} accent={project.accent}>
            <p>{project.problem}</p>
          </CaseBlock>
          <CaseBlock label={t.projects.built} accent={project.accent}>
            <ul className="space-y-2">
              {project.built.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full" style={{ background: project.accent }} />
                  {b}
                </li>
              ))}
            </ul>
          </CaseBlock>
          {project.result && (
            <CaseBlock label={t.projects.result} accent={project.accent}>
              <p>{project.result}</p>
            </CaseBlock>
          )}
          {!!project.gallery?.length && (
            <CaseBlock label={t.projects.gallery} accent={project.accent}>
              <div className="flex gap-3">
                {project.gallery.map((g) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={g.src} src={asset(g.src)} alt={g.alt} loading="lazy" className="h-64 w-auto rounded-2xl border border-white/10 object-contain" />
                ))}
              </div>
            </CaseBlock>
          )}
          <CaseBlock label={t.projects.stack} accent={project.accent}>
            <TechList tech={project.tech} />
          </CaseBlock>
        </div>
      </motion.div>

      {/* Controlos */}
      <motion.div
        className="fixed inset-x-0 bottom-6 flex items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
        exit={{ opacity: 0 }}
      >
        <button onClick={() => onSwitch(prev.id)} className="rounded-full border border-white/15 bg-ink/60 px-4 py-2.5 font-mono text-xs text-soft backdrop-blur transition-colors hover:border-white/40 hover:text-white">
          ← {prev.title}
        </button>
        <button onClick={onClose} autoFocus className="rounded-full bg-white px-5 py-2.5 font-mono text-xs font-medium text-ink">
          {t.projects.close} <span className="hidden sm:inline">(Esc)</span>
        </button>
        <button onClick={() => onSwitch(next.id)} className="rounded-full border border-white/15 bg-ink/60 px-4 py-2.5 font-mono text-xs text-soft backdrop-blur transition-colors hover:border-white/40 hover:text-white">
          {next.title} →
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ secção */

export default function Projects() {
  const { projects } = useContent();
  const [pinned, setPinned] = useState(false);
  const [opened, setOpened] = useState<Opened | null>(null);

  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(wide.matches && !calm.matches);
    update();
    wide.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  const onOpen: OpenFn = (project, el) => setOpened({ id: project.id, from: el.getBoundingClientRect() });
  const onSwitch = (id: string) => setOpened((o) => o && { ...o, id });

  // Ao fechar, o mockup regressa ao cartão do projeto que está aberto nesse momento
  const close = () => {
    setOpened((o) => {
      const el = o && document.querySelector<HTMLElement>(`[data-visual="${o.id}"]`);
      return o && el ? { ...o, from: el.getBoundingClientRect() } : o;
    });
    requestAnimationFrame(() => setOpened(null));
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  const ids = projects.map((p) => p.id).join(",");

  // Com o detalhe aberto: pára o scroll e aceita Esc / setas
  const openId = opened?.id;
  useEffect(() => {
    if (!openId) return;
    if (scroller.lenis) scroller.lenis.stop();
    else document.body.style.overflow = "hidden";
    const list = ids.split(",");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (step) setOpened((o) => o && { ...o, id: list[(list.indexOf(o.id) + step + list.length) % list.length] });
    };
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      if (scroller.lenis) scroller.lenis.start();
      else document.body.style.overflow = "";
    };
  }, [openId, ids]);

  return (
    <section id="projetos" className="relative">
      {pinned ? <PinnedTrack openId={openId} onOpen={onOpen} /> : <SwipeTrack openId={openId} onOpen={onOpen} />}
      <AnimatePresence>{opened && <ProjectModal key="modal" opened={opened} onClose={close} onSwitch={onSwitch} />}</AnimatePresence>
    </section>
  );
}
