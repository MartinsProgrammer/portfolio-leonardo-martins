"use client";

import { motion } from "framer-motion";
import { asset } from "@/lib/data";
import { useContent } from "@/lib/i18n";

/* Ilustrações próprias para cada projeto, com camadas em profundidade (translateZ) para o efeito 3D do tilt. */

const depth = (z: number) => ({ transform: `translateZ(${z}px)` });

export function NexoVisual() {
  const { visuals } = useContent().t;
  const chips = visuals.nexoChips;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#0f3b3a_0%,#07100f_60%)]" style={{ transformStyle: "preserve-3d" }}>
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(95,245,217,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(95,245,217,0.15)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <Mockup src="/images/nexo-mockup.webp" alt={visuals.nexoAlt} z={50} />
      {chips.map((c, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-[#5ff5d9]/30 bg-[#07100f]/80 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#b9fff1] backdrop-blur"
          style={{ ...depth(80), left: `${[6, 70, 8, 72][i]}%`, top: `${[6, 8, 88, 86][i]}%` }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

/* Mockup com capturas reais da app (telemóveis ou janelas de browser), com fundo transparente. */
function Mockup({ src, alt, z = 40 }: { src: string; alt: string; z?: number }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-[5%]" style={depth(z)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(src)} alt={alt} loading="lazy" className="h-full w-full object-contain" />
    </div>
  );
}

export function NoraVisual() {
  const { visuals } = useContent().t;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#3a1c40_0%,#0d0710_65%)]" style={{ transformStyle: "preserve-3d" }}>
      {[0, 1, 2].map((r) => (
        <motion.span
          key={r}
          className="absolute top-1/2 left-1/2 h-[70%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e5333f]/60"
          animate={{ scale: [0.6, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: r, ease: "easeOut" }}
        />
      ))}
      <Mockup src="/images/nora-mockup.webp" alt={visuals.noraAlt} />
    </div>
  );
}

export function CivilVisual() {
  const { visuals } = useContent().t;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_25%,#3b1a06_0%,#0e0906_65%)]" style={{ transformStyle: "preserve-3d" }}>
      <div className="absolute inset-x-0 top-0 h-1.5 opacity-60 [background:repeating-linear-gradient(-45deg,#ff7a1a_0_10px,transparent_10px_20px)]" />
      <Mockup src="/images/civilconnect-mockup.webp" alt={visuals.civilAlt} />
    </div>
  );
}
