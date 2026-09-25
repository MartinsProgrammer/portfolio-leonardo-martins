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

export function NoraVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#3a1c40_0%,#0d0710_65%)]" style={{ transformStyle: "preserve-3d" }}>
      <div
        className="absolute top-1/2 left-1/2 h-[112%] w-[46%] max-w-[190px] -translate-x-1/2 -translate-y-[42%] rounded-[2rem] border border-white/15 bg-[#140c17] p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
        style={depth(40)}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/10" />
        <p className="mt-4 text-center font-display text-[0.7rem] font-semibold tracking-[0.3em] text-[#eac9ee]">NORA</p>
        <div className="relative mx-auto mt-6 grid aspect-square w-[78%] place-items-center">
          {[0, 1, 2].map((r) => (
            <motion.span
              key={r}
              className="absolute inset-0 rounded-full border border-[#e5333f]"
              animate={{ scale: [0.6, 1.25], opacity: [0.7, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: r * 0.8, ease: "easeOut" }}
            />
          ))}
          <span className="relative grid h-[62%] w-[62%] place-items-center rounded-full bg-gradient-to-b from-[#ff6b75] to-[#e5333f] font-display text-sm font-bold tracking-widest text-white shadow-[0_0_40px_rgba(229,51,63,0.6)]">
            SOS
          </span>
        </div>
        <p className="mt-5 text-center text-[0.62rem] text-[#eac9ee]/70">You are not alone.</p>
      </div>
    </div>
  );
}
