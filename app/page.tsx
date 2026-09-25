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

export default function Home() {
  return (
    <>
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
      <footer className="border-t border-white/[0.06]">
        <div className="container-x flex flex-col gap-3 py-10 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Leonardo Martins</p>
          <p>Web · Mobile · Sistemas de gestão</p>
        </div>
      </footer>
    </>
  );
}
