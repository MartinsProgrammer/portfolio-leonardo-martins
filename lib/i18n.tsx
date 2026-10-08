"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { content, type Lang } from "./data";

/*
  Língua do site (PT/EN), sem rotas próprias: o site é estático (GitHub Pages).
  O HTML gerado está em português; no arranque escolhemos a língua guardada
  ou, na primeira visita, a do navegador. A escolha fica no localStorage.
*/

const KEY = "lang";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "pt", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    const initial: Lang = saved === "pt" || saved === "en" ? saved : navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
    setLangState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useContent = () => content[useLang().lang];
