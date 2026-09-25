import type Lenis from "lenis";
import type { Transition } from "framer-motion";

/* Física de mola partilhada por todas as entradas. */
export const spring: Transition = { type: "spring", stiffness: 50, damping: 15 };

/* Mesma mola com um pouco mais de massa: passa ligeiramente do alvo e assenta (efeito elástico). */
export const elastic: Transition = { type: "spring", stiffness: 50, damping: 15, mass: 1.4 };

/* Mola rápida para micro-interações (hover, pills, menus). */
export const snappy: Transition = { type: "spring", stiffness: 320, damping: 28 };

/* Instância global do Lenis (scroll suave), definida pelo SmoothScroll. */
export const scroller: { lenis: Lenis | null } = { lenis: null };
