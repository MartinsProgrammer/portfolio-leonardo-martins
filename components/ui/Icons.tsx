type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const ArrowRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowUpRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const GitHub = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
export const Mail = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const Pin = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const Flame = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 22c4 0 7-2.7 7-6.6 0-4.4-4-6.9-4.6-11.4-2.5 1.6-4 4.2-3.9 6.8-1.2-.7-2-2.2-2.1-3.6C6.5 9.3 5 11.8 5 15.4 5 19.3 8 22 12 22Z" /></svg>
);
export const Code = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></svg>
);
