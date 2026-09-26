import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { asset } from "@/lib/data";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["300", "400", "600", "700"] });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://martinsprogrammer.github.io"),
  title: "Leonardo Martins — Programador Web & Mobile",
  description:
    "Portfólio de Leonardo Martins, programador web e mobile e bombeiro voluntário em Santo Tirso, Portugal. Projetos NEXO, NORA e CivilConnect.",
  openGraph: {
    title: "Leonardo Martins — Programador Web & Mobile",
    description: "Crio soluções digitais com utilidade real.",
    images: [asset("/images/perfil.webp")],
    locale: "pt_PT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${sora.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
