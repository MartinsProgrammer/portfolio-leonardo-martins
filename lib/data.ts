/*
  Conteúdo do portfólio.
  Edita apenas este ficheiro para atualizar textos, projetos e experiência.
*/

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${BASE_PATH}${path}`;

export const profile = {
  name: "Leonardo Martins",
  location: "Santo Tirso, Portugal",
  email: "leozinpt0@gmail.com",
  github: "https://github.com/MartinsProgrammer",
  githubUser: "MartinsProgrammer",
  photo: "/images/perfil.webp",
};

export const facts = [
  { label: "Localização", value: "Santo Tirso, Portugal" },
  { label: "Formação", value: "TGPSI", hint: "Técnico de Gestão e Programação de Sistemas Informáticos · EPS Cidenai" },
  { label: "Área", value: "Desenvolvimento Web e Mobile" },
  { label: "Voluntariado", value: "Bombeiros Voluntários Tirsenses" },
  { label: "Foco", value: "Sistemas de gestão, dashboards e aplicações úteis" },
];

export type Experience = {
  year: number;
  role: string;
  company: string;
  description: string;
  highlight?: boolean;
};

// Do mais recente para o mais antigo
export const experience: Experience[] = [
  {
    year: 2025,
    role: "Programador",
    company: "Proteção Civil de Santo Tirso",
    description:
      "Estágio como programador no Serviço Municipal de Proteção Civil: desenvolvimento da app CivilConnect para a população, manutenção de equipamentos e apoio técnico.",
    highlight: true,
  },
  {
    year: 2024,
    role: "Flutter & APIs",
    company: "A. Sampaio & Filhos",
    description: "Desenvolvimento de software em Flutter, criação de APIs em C# e gestão de bases de dados Oracle.",
  },
  {
    year: 2023,
    role: "Suporte Técnico",
    company: "DP Informática",
    description: "Manutenção de computadores, gestão de produtos na plataforma Shopify e apoio técnico ao cliente.",
  },
  {
    year: 2022,
    role: "Hardware & Redes",
    company: "VB Informática",
    description: "Montagem e manutenção de computadores, diagnóstico de problemas e resolução de avarias.",
  },
];

export const skills = [
  { area: "Frontend", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind"] },
  { area: "Backend", items: ["Node.js", "Express", "C#", "PHP", "Python"] },
  { area: "Dados", items: ["PostgreSQL", "Supabase", "SQLite", "Oracle", "Firebase"] },
  { area: "Mobile", items: ["Flutter", "Dart", "Kotlin", "Jetpack Compose"] },
  { area: "Ferramentas", items: ["Git", "GitHub", "VS Code", "Shopify"] },
];

export type ProjectVisual = "nexo" | "nora" | "civil";

export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  status: "Em desenvolvimento" | "Concluído";
  visual: ProjectVisual;
  accent: string; // cor de destaque do cartão
};

export const projects: Project[] = [
  {
    id: "nexo",
    title: "NEXO",
    tagline: "Tudo ligado.",
    description:
      "Plataforma SaaS multi-escola para escolas de condução: alunos, instrutores, veículos, aulas, exames e pagamentos, com portais próprios para instrutor e aluno e fluxos RGPD.",
    tech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Tailwind"],
    status: "Em desenvolvimento",
    visual: "nexo",
    accent: "#5ff5d9",
  },
  {
    id: "nora",
    title: "NORA",
    tagline: "You are not alone.",
    description:
      "App Android de segurança pessoal: alerta SOS silencioso pelos botões de volume, SMS com localização para contactos de emergência e SOS Comunitário com notificações para quem está por perto.",
    tech: ["Kotlin", "Jetpack Compose", "Supabase", "Firebase"],
    status: "Em desenvolvimento",
    visual: "nora",
    accent: "#e5333f",
  },
  {
    id: "civilconnect",
    title: "CivilConnect",
    tagline: "Proteção Civil de Santo Tirso",
    description:
      "App móvel da Proteção Civil para a população de Santo Tirso: incêndios ativos, risco de incêndio, meteorologia e avisos do IPMA, reporte de ninhos de vespa velutina, dicas de autoproteção e contactos de emergência, com backoffice para gerir notícias e reportes.",
    tech: ["Flutter", "Dart", "APIs REST", "IPMA"],
    status: "Concluído",
    visual: "civil",
    accent: "#ff7a1a",
  },
];

const techCount = new Set(skills.flatMap((s) => s.items)).size;

export const metrics = [
  // Inclui trabalhos que já não estão em destaque (DriveGest, sites, Conversor SMPC)
  { value: 6, suffix: "+", label: "Projetos" },
  { value: techCount, suffix: "+", label: "Tecnologias" },
  { value: 17, suffix: "", label: "Média final TGPSI" },
];

export const nav = [
  { id: "sobre", label: "Sobre" },
  { id: "experiencia", label: "Experiência" },
  { id: "projetos", label: "Projetos" },
  { id: "contacto", label: "Contacto" },
];
