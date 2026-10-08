import Background from "@/components/three/Background";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Timeline from "@/components/sections/Timeline";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { LangProvider } from "@/lib/i18n";

export default function Home() {
  return (
    <LangProvider>
      <SmoothScroll />
      <Cursor />
      <Background />
      <ScrollProgress />
      <Nav />
      <main className="relative">
        <Hero />
        <About />
        <Timeline />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </LangProvider>
  );
}
