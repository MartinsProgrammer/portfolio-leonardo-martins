"use client";

import { motion } from "framer-motion";
import { asset } from "@/lib/data";

/* Ilustrações próprias para cada projeto, com camadas em profundidade (translateZ) para o efeito 3D do tilt. */

const depth = (z: number) => ({ transform: `translateZ(${z}px)` });

export function NexoVisual() {
  const chips = ["Alunos", "Aulas", "Exames", "Pagamentos"];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#0f3b3a_0%,#07100f_60%)]" style={{ transformStyle: "preserve-3d" }}>
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(95,245,217,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(95,245,217,0.15)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute inset-0 grid place-items-center" style={depth(50)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/images/nexo-logo.png")} alt="Logótipo NEXO" className="w-[52%] max-w-[220px] drop-shadow-[0_0_30px_rgba(95,245,217,0.35)]" loading="lazy" />
      </div>
      {chips.map((c, i) => (
        <motion.span
          key={c}
          className="absolute rounded-full border border-[#5ff5d9]/30 bg-[#07100f]/80 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-[#b9fff1] backdrop-blur"
          style={{ ...depth(80), left: `${[10, 64, 14, 60][i]}%`, top: `${[14, 18, 74, 72][i]}%` }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

/* Moldura de telemóvel com uma captura real da app, que desliza devagar (scroll automático). */
function PhoneShot({ src, alt, glow }: { src: string; alt: string; glow: string }) {
  return (
    <div
      className="absolute top-1/2 left-1/2 h-[118%] w-[44%] max-w-[200px] -translate-x-1/2 -translate-y-[44%] rounded-[1.9rem] border border-white/20 bg-black p-[5px]"
      style={{ ...depth(40), boxShadow: `0 30px 60px -20px rgba(0,0,0,0.9), 0 0 60px -10px ${glow}` }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={asset(src)}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          animate={{ objectPosition: ["50% 0%", "50% 0%", "50% 100%", "50% 100%", "50% 0%"] }}
          transition={{ duration: 14, repeat: Infinity, times: [0, 0.15, 0.5, 0.65, 1], ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export function NoraVisual() {
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
      <PhoneShot src="/images/nora.webp" alt="Ecrã inicial da app NORA com o alerta SOS silencioso" glow="rgba(190,134,202,0.45)" />
    </div>
  );
}

export function CivilVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_25%,#3b1a06_0%,#0e0906_65%)]" style={{ transformStyle: "preserve-3d" }}>
      <div className="absolute inset-x-0 top-0 h-1.5 opacity-60 [background:repeating-linear-gradient(-45deg,#ff7a1a_0_10px,transparent_10px_20px)]" />
      <PhoneShot src="/images/civilconnect.webp" alt="Menu principal da app CivilConnecT" glow="rgba(255,122,26,0.4)" />
    </div>
  );
}
