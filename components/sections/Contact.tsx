"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { asset, profile } from "@/lib/data";
import { useContent, useLang } from "@/lib/i18n";
import { MaskText, Reveal } from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { ArrowRight, ArrowUpRight, GitHub, LinkedIn, Mail, Pin } from "@/components/ui/Icons";

function Field({ id, label, type = "text", textarea = false }: { id: string; label: string; type?: string; textarea?: boolean }) {
  const cls =
    "peer w-full resize-none border-0 border-b border-white/15 bg-transparent px-0 pt-7 pb-3 text-base text-white outline-none transition-colors duration-300 placeholder:text-transparent focus:border-cyan";
  return (
    <div className="group relative">
      {textarea ? (
        <textarea id={id} name={id} placeholder={label} rows={4} required className={cls} />
      ) : (
        <input id={id} name={id} type={type} placeholder={label} required className={cls} autoComplete={id === "email" ? "email" : "name"} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-7 left-0 origin-left text-base text-mute transition-all duration-300 peer-focus:top-1 peer-focus:scale-75 peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:scale-75"
      >
        {label}
      </label>
      <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-cyan to-tech transition-all duration-500 peer-focus:w-full" />
    </div>
  );
}

function SocialLink({ href, icon, label, external }: { href: string; icon: ReactNode; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex h-12 items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.02] px-[0.85rem] text-soft transition-all duration-500 hover:border-cyan/50 hover:bg-cyan/[0.06] hover:text-white"
      aria-label={label}
      data-cursor="magnet"
    >
      <span className="shrink-0">{icon}</span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:ml-3 group-hover:max-w-[16rem] group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:max-w-[16rem] group-focus-visible:opacity-100">
        {label}
      </span>
      <ArrowUpRight className="h-3.5 w-0 shrink-0 opacity-0 transition-all duration-500 group-hover:ml-1.5 group-hover:w-3.5 group-hover:opacity-100" />
    </a>
  );
}

type Status = "idle" | "sending" | "sent" | "error";


export default function Contact() {
  const { t } = useContent();
  const { lang } = useLang();
  const cv = profile.cv[lang];
  const [status, setStatus] = useState<Status>("idle");

  // Envia a mensagem pelo FormSubmit (site estático); se falhar, abre o cliente de e-mail com a mensagem preenchida.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nome = String(data.get("nome") ?? "");
    const email = String(data.get("email") ?? "");
    const mensagem = String(data.get("mensagem") ?? "");
    const subject = `Contacto pelo portfólio — ${nome}`;
    setStatus("sending");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${profile.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ nome, email, mensagem, _subject: subject, _replyto: email, _template: "table" }),
      });
      const json: { success?: string | boolean } = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== "true") throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      const body = `${mensagem}\n\n${nome} · ${email}`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  return (
    <section id="contacto" className="relative py-28 sm:py-40">
      <div className="container-x grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal>
            <p className="eyebrow">{t.contact.eyebrow}</p>
          </Reveal>
          <MaskText
            key={lang}
            lines={[t.contact.lines[0], t.contact.lines[1], <span key="q" className="text-gradient">{t.contact.lines[2]}</span>]}
            className="mt-5 font-display text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[1] tracking-[-0.04em] text-white"
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-base leading-relaxed text-mute sm:text-lg">
              {t.contact.intro}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-3">
              <SocialLink href={profile.linkedin} external icon={<LinkedIn className="h-5 w-5" />} label={`linkedin.com/in/${profile.linkedinUser}`} />
              <SocialLink href={profile.github} external icon={<GitHub className="h-5 w-5" />} label={`github.com/${profile.githubUser}`} />
              <SocialLink href={`mailto:${profile.email}`} icon={<Mail className="h-5 w-5" />} label={profile.email} />
              <SocialLink href="https://maps.google.com/?q=Santo+Tirso" external icon={<Pin className="h-5 w-5" />} label={profile.location} />
            </div>
            {cv && (
              <a
                href={asset(cv)}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnet"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white transition-colors hover:border-cyan/60"
              >
                <ArrowRight className="h-4 w-4 rotate-90" /> {t.hero.cv}
              </a>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <form onSubmit={onSubmit} className="glass relative space-y-8 rounded-3xl p-6 sm:p-10">
            <Field id="nome" label={t.contact.name} />
            <Field id="email" label={t.contact.email} type="email" />
            <Field id="mensagem" label={t.contact.message} textarea />
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`text-xs ${status === "sent" ? "text-cyan" : "text-mute"}`}
                  aria-live="polite"
                >
                  {t.contact.status[status]}
                </motion.p>
              </AnimatePresence>
              <MagneticButton type="submit">
                {status === "sending" ? t.contact.status.sending : t.contact.send} <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
