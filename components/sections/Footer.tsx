"use client";

import { profile } from "@/lib/data";
import { useContent } from "@/lib/i18n";

export default function Footer() {
  const { t } = useContent();
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="container-x flex flex-col gap-3 py-10 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>{t.footer}</p>
      </div>
    </footer>
  );
}
