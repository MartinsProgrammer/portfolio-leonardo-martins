"use client";

import { useEffect, useRef } from "react";

/*
  Cursor personalizado:
  - o ponto segue o rato diretamente; o anel segue com lerp 0.1 (atraso elegante);
  - sobre elementos [data-cursor="magnet"] o anel expande para o tamanho do elemento
    e "cola" ao centro dele, deixando-se puxar só um pouco pelo rato.
*/
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !ring.current || !dot.current) return;

    document.documentElement.classList.add("has-cursor");
    const r = ring.current;
    const d = dot.current;

    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { x: mouse.x, y: mouse.y, w: 36, h: 36, radius: 18 };
    let target: HTMLElement | null = null;
    let visible = false;
    let down = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cursor="magnet"]') : null;
      if (!visible) {
        visible = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        r.style.opacity = "1";
        d.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      r.style.opacity = "0";
      d.style.opacity = "0";
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);

    const tick = () => {
      let tx = mouse.x;
      let ty = mouse.y;
      let tw = 36;
      let th = 36;
      let tr = 18;

      if (target && target.isConnected) {
        const b = target.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        const big = b.width > 240; // cartões: anel mais discreto, colado ao ponteiro
        // efeito magnético: preso ao centro do elemento, puxado ligeiramente pelo rato
        tx = big ? lerp(cx, mouse.x, 0.85) : cx + (mouse.x - cx) * 0.18;
        ty = big ? lerp(cy, mouse.y, 0.85) : cy + (mouse.y - cy) * 0.18;
        tw = big ? 88 : b.width + 14;
        th = big ? 88 : b.height + 14;
        tr = big ? 44 : Math.min(b.height, b.width) / 2 + 7;
      }
      if (down) {
        tw *= 0.85;
        th *= 0.85;
      }

      pos.x = lerp(pos.x, tx, 0.1);
      pos.y = lerp(pos.y, ty, 0.1);
      pos.w = lerp(pos.w, tw, 0.14);
      pos.h = lerp(pos.h, th, 0.14);
      pos.radius = lerp(pos.radius, tr, 0.14);

      r.style.transform = `translate3d(${pos.x - pos.w / 2}px, ${pos.y - pos.h / 2}px, 0)`;
      r.style.width = `${pos.w}px`;
      r.style.height = `${pos.h}px`;
      r.style.borderRadius = `${pos.radius}px`;
      r.dataset.active = target ? "true" : "false";
      d.style.transform = `translate3d(${mouse.x - 3}px, ${mouse.y - 3}px, 0)`;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        data-active="false"
        className="pointer-events-none fixed top-0 left-0 z-[100] opacity-0 border border-white/40 transition-[opacity,border-color,background-color,box-shadow] duration-300 will-change-transform data-[active=true]:border-cyan/80 data-[active=true]:bg-cyan/[0.06] data-[active=true]:shadow-[0_0_30px_-6px_rgba(62,232,255,0.6)]"
        style={{ width: 36, height: 36, borderRadius: 18 }}
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[101] h-1.5 w-1.5 rounded-full bg-cyan opacity-0 mix-blend-screen will-change-transform"
      />
    </>
  );
}
