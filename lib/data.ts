/*
  Conteúdo do portfólio, em português (pt) e inglês (en).
  Edita apenas este ficheiro para atualizar textos, projetos e experiência.
  Os componentes leem a língua ativa com useContent() (lib/i18n.tsx).
*/

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${BASE_PATH}${path}`;

export type Lang = "pt" | "en";

export const profile = {
  name: "Leonardo Martins",
  location: "Santo Tirso, Portugal",
  email: "leozinpt0@gmail.com",
  github: "https://github.com/MartinsProgrammer",
  githubUser: "MartinsProgrammer",
  linkedin: "https://www.linkedin.com/in/martinsprogrammer",
  linkedinUser: "martinsprogrammer",
  photo: "/images/perfil.webp",
  // CV em PDF por língua (ex.: "/cv/leonardo-martins-pt.pdf", em public/cv). Sem ficheiro, o botão não aparece.
  cv: { pt: "", en: "" } as Record<Lang, string>,
};

/* ------------------------------------------------------------------ tipos */

export type Experience = {
  year: number;
  role: string;
  company: string;
  description: string;
  highlight?: boolean;
};

export type ProjectVisual = "nexo" | "nora" | "civil";

export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  // Estudo de caso (detalhe do projeto)
  problem: string;
  built: string[];
  result?: string; // só aparece quando estiver preenchido
  gallery?: { src: string; alt: string }[];
  tech: string[];
  done: boolean;
  visual: ProjectVisual;
  accent: string; // cor de destaque do cartão
};

/* ----------------------------------------------------- partes sem tradução */

const skillItems = [
  ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind"],
  ["Node.js", "Express", "C#", "PHP", "Python"],
  ["PostgreSQL", "Supabase", "SQLite", "Oracle", "Firebase"],
  ["Flutter", "Dart", "Kotlin", "Jetpack Compose"],
  ["Git", "GitHub", "VS Code", "Shopify"],
];
const techCount = new Set(skillItems.flat()).size;

const projectBase = {
  nexo: { tech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Tailwind"], done: true, visual: "nexo", accent: "#5ff5d9", gallery: [] as string[] },
  nora: { tech: ["Kotlin", "Jetpack Compose", "Supabase", "Firebase"], done: true, visual: "nora", accent: "#e5333f", gallery: ["/images/nora.webp"] },
  civilconnect: { tech: ["Flutter", "Dart", "APIs REST", "IPMA"], done: true, visual: "civil", accent: "#ff7a1a", gallery: ["/images/civilconnect.webp"] },
} as const;

type ProjectText = Pick<Project, "title" | "tagline" | "description" | "problem" | "built" | "result"> & { galleryAlt?: string[] };

const buildProjects = (text: Record<keyof typeof projectBase, ProjectText>): Project[] =>
  (Object.keys(projectBase) as (keyof typeof projectBase)[]).map((id) => {
    const { gallery, ...base } = projectBase[id];
    const { galleryAlt, ...t } = text[id];
    return { id, ...base, tech: [...base.tech], ...t, gallery: gallery.map((src, i) => ({ src, alt: galleryAlt?.[i] ?? t.title })) };
  });

/* --------------------------------------------------------------- português */

const pt = {
  facts: [
    { label: "Localização", value: "Santo Tirso, Portugal" },
    { label: "Formação", value: "TGPSI", hint: "Técnico de Gestão e Programação de Sistemas Informáticos · EPS Cidenai" },
    { label: "Área", value: "Desenvolvimento Web e Mobile" },
    { label: "Voluntariado", value: "Bombeiros Voluntários Tirsenses" },
    { label: "Foco", value: "Sistemas de gestão, dashboards e aplicações úteis" },
  ] as { label: string; value: string; hint?: string }[],

  // Do mais recente para o mais antigo
  experience: [
    {
      year: 2026,
      role: "Programador Web & Mobile",
      company: "Freelancer",
      description: "Desenvolvimento de websites, aplicações móveis e sistemas de gestão à medida para clientes, com projetos como o NEXO e a NORA.",
    },
    {
      year: 2025,
      role: "Programador",
      company: "Proteção Civil de Santo Tirso",
      description:
        "Estágio como programador no Serviço Municipal de Proteção Civil: desenvolvimento da app CivilConnect para a população, manutenção de equipamentos e apoio técnico.",
      highlight: true,
    },
    { year: 2024, role: "Flutter & APIs", company: "A. Sampaio & Filhos", description: "Desenvolvimento de software em Flutter, criação de APIs em C# e gestão de bases de dados Oracle." },
    { year: 2023, role: "Suporte Técnico", company: "DP Informática", description: "Manutenção de computadores, gestão de produtos na plataforma Shopify e apoio técnico ao cliente." },
    { year: 2022, role: "Hardware & Redes", company: "VB Informática", description: "Montagem e manutenção de computadores, diagnóstico de problemas e resolução de avarias." },
  ] as Experience[],

  skillAreas: ["Frontend", "Backend", "Dados", "Mobile", "Ferramentas"],

  projects: buildProjects({
    nexo: {
      title: "NEXO",
      tagline: "Tudo ligado.",
      description:
        "Plataforma SaaS multi-escola para escolas de condução: alunos, instrutores, veículos, aulas, exames e pagamentos, com portais próprios para instrutor e aluno e fluxos RGPD.",
      problem:
        "Uma escola de condução tem de coordenar alunos, instrutores, veículos, aulas, exames e pagamentos ao mesmo tempo — e cada pessoa precisa de ver apenas a parte que lhe diz respeito.",
      built: [
        "Plataforma SaaS multi-escola: cada escola trabalha com os seus próprios dados",
        "Gestão de alunos, instrutores, veículos, aulas, exames e pagamentos num só sítio",
        "Portais próprios para instrutores e para alunos",
        "Fluxos RGPD para o tratamento de dados pessoais",
      ],
    },
    nora: {
      title: "NORA",
      tagline: "You are not alone.",
      description:
        "App Android de segurança pessoal: alerta SOS silencioso pelos botões de volume, SMS com localização para contactos de emergência e SOS Comunitário com notificações para quem está por perto.",
      problem: "Numa situação de perigo, pegar no telemóvel, desbloqueá-lo e ligar a alguém pode ser impossível — ou chamar a atenção de quem não devia.",
      built: [
        "Alerta SOS silencioso ao premir Vol+ e Vol− em simultâneo, mesmo com o ecrã desligado",
        "SMS automático com a localização para os contactos de emergência",
        "SOS Comunitário: notificações para quem está por perto",
        "Painel que mostra se a proteção está completa (acessibilidade, SMS, localização e contactos)",
      ],
      galleryAlt: ["Ecrã inicial da NORA com o estado da proteção e o alerta silencioso"],
    },
    civilconnect: {
      title: "CivilConnect",
      tagline: "Proteção Civil de Santo Tirso",
      description:
        "App móvel da Proteção Civil para a população de Santo Tirso: incêndios ativos, risco de incêndio, queimas, meteorologia e avisos do IPMA, reporte de ninhos de vespa velutina, notícias, dicas de autoproteção e contactos de emergência, com backoffice para gerir conteúdos e reportes.",
      problem:
        "A população precisa de ter a informação de proteção civil num só lugar — incêndios, risco de incêndio, queimas, meteorologia e avisos — e de uma forma rápida de reportar ocorrências como ninhos de vespa velutina.",
      built: [
        "App em Flutter com incêndios ativos, risco de incêndio, queimas, meteorologia e avisos do IPMA",
        "Reporte de ninhos de vespa velutina pela população",
        "Notícias, dicas de autoproteção e contactos de emergência",
        "Backoffice para a Proteção Civil gerir conteúdos e reportes",
        "Desenvolvida durante o estágio no Serviço Municipal de Proteção Civil",
      ],
      galleryAlt: ["Menu principal da CivilConnect com as áreas da app"],
    },
  }),

  metrics: [
    // Inclui trabalhos que já não estão em destaque (DriveGest, sites, Conversor SMPC)
    { value: 6, suffix: "+", label: "Projetos" },
    { value: techCount, suffix: "+", label: "Tecnologias" },
    { value: 17, suffix: "", label: "Média final TGPSI" },
  ],

  nav: [
    { id: "sobre", label: "Sobre" },
    { id: "experiencia", label: "Experiência" },
    { id: "projetos", label: "Projetos" },
    { id: "contacto", label: "Contacto" },
  ],

  t: {
    nav: { home: "Início", openMenu: "Abrir menu", closeMenu: "Fechar menu", main: "Principal", switchLang: "Mudar para inglês" },
    hero: {
      lines: ["Crio soluções", "digitais com", "utilidade real."],
      sides: [
        { label: "Programador", text: "Websites, aplicações móveis e sistemas de gestão — de Next.js e Supabase a Flutter e Kotlin." },
        { label: "Bombeiro Voluntário", text: "Nos Bombeiros Voluntários Tirsenses, onde aprendi responsabilidade, disciplina e atenção ao detalhe." },
      ],
      viewProjects: "Ver projetos",
      cv: "Descarregar CV",
      scroll: "Scroll",
      scrollAria: "Descer para a secção Sobre",
    },
    about: {
      eyebrow: "01 — Sobre",
      lines: ["Soluções simples,", "úteis e bem estruturadas."],
      p1: ["Sou o ", "Leonardo Martins", ", programador web e mobile em Portugal. Desenvolvo websites, aplicações e sistemas de gestão com foco em utilidade, organização e boa experiência de utilização."],
      p2: ["Para além da programação, sou ", "Bombeiro Voluntário", ". Uma experiência que me trouxe responsabilidade, disciplina e atenção ao detalhe — e que levo para cada linha de código."],
      role: "Programador Web & Mobile",
      photoAlt: "Retrato de Leonardo Martins",
    },
    timeline: {
      eyebrow: "02 — Experiência",
      lines: ["Experiência real", "na área das TI."],
      intro:
        "Ao longo da formação desenvolvi competências em programação, desenvolvimento web, aplicações móveis, APIs, bases de dados e suporte informático, através de estágios em contexto real.",
    },
    projects: {
      eyebrow: "03 — Projetos",
      lines: ["Projetos em", "destaque."],
      intro: "Da gestão de escolas de condução à segurança pessoal e à Proteção Civil: software pensado para ser usado todos os dias.",
      keepScrolling: "Continua a fazer scroll",
      moreEyebrow: "E há mais",
      moreText: "Outros trabalhos estão no meu GitHub.",
      seeGithub: "Ver GitHub",
      open: "Abrir projeto",
      openAria: (title: string) => `Abrir o projeto ${title}`,
      done: "Concluído",
      wip: "Em desenvolvimento",
      problem: "O problema",
      built: "O que construí",
      result: "O resultado",
      gallery: "Capturas",
      stack: "Stack",
      close: "Fechar",
    },
    contact: {
      eyebrow: "04 — Contacto",
      lines: ["Vamos criar", "algo com", "qualidade?"],
      intro: "Estou disponível para desenvolver websites, melhorar projetos existentes ou criar soluções digitais à medida.",
      name: "O teu nome",
      email: "E-mail",
      message: "Conta-me sobre o projeto",
      send: "Enviar mensagem",
      status: {
        idle: "A mensagem chega diretamente ao meu e-mail.",
        sending: "A enviar…",
        sent: "Mensagem enviada! Respondo o mais breve possível.",
        error: "Não foi possível enviar. A abrir o teu e-mail como alternativa…",
      },
    },
    footer: "Web · Mobile · Sistemas de gestão",
    scene: { loading: "A preparar a cena 3D", words: ["Código", "Fogo", "Impacto"] },
    visuals: {
      nexoChips: ["Alunos", "Aulas", "Exames", "Pagamentos"],
      nexoAlt: "Painéis da plataforma NEXO para a escola, instrutores e alunos",
      noraAlt: "Ecrãs da app NORA: login, alerta SOS silencioso e contactos de emergência",
      civilAlt: "Ecrãs da app CivilConnect: abertura, menu principal e risco de incêndio",
    },
  },
};

export type Content = typeof pt;

/* ------------------------------------------------------------------ inglês */

const en: Content = {
  facts: [
    { label: "Location", value: "Santo Tirso, Portugal" },
    { label: "Education", value: "TGPSI", hint: "IT Systems Management and Programming Technician · EPS Cidenai" },
    { label: "Field", value: "Web and Mobile Development" },
    { label: "Volunteering", value: "Tirsenses Volunteer Firefighters" },
    { label: "Focus", value: "Management systems, dashboards and useful apps" },
  ],

  experience: [
    {
      year: 2026,
      role: "Web & Mobile Developer",
      company: "Freelancer",
      description: "Building websites, mobile apps and custom management systems for clients, including projects such as NEXO and NORA.",
    },
    {
      year: 2025,
      role: "Developer",
      company: "Santo Tirso Civil Protection",
      description:
        "Developer internship at the Municipal Civil Protection Service: built the CivilConnect app for residents, plus equipment maintenance and technical support.",
      highlight: true,
    },
    { year: 2024, role: "Flutter & APIs", company: "A. Sampaio & Filhos", description: "Software development in Flutter, building APIs in C# and managing Oracle databases." },
    { year: 2023, role: "Technical Support", company: "DP Informática", description: "Computer maintenance, product management on Shopify and customer support." },
    { year: 2022, role: "Hardware & Networking", company: "VB Informática", description: "Assembling and maintaining computers, diagnosing problems and fixing faults." },
  ],

  skillAreas: ["Frontend", "Backend", "Data", "Mobile", "Tools"],

  projects: buildProjects({
    nexo: {
      title: "NEXO",
      tagline: "Everything connected.",
      description:
        "Multi-school SaaS platform for driving schools: students, instructors, vehicles, lessons, exams and payments, with dedicated portals for instructors and students and GDPR workflows.",
      problem: "A driving school has to coordinate students, instructors, vehicles, lessons, exams and payments at the same time — and each person should only see what concerns them.",
      built: [
        "Multi-school SaaS platform: each school works with its own data",
        "Students, instructors, vehicles, lessons, exams and payments managed in one place",
        "Dedicated portals for instructors and students",
        "GDPR workflows for handling personal data",
      ],
    },
    nora: {
      title: "NORA",
      tagline: "You are not alone.",
      description:
        "Android personal safety app: silent SOS alert using the volume buttons, SMS with location to emergency contacts, and Community SOS with notifications for people nearby.",
      problem: "In a dangerous situation, picking up your phone, unlocking it and calling someone may be impossible — or draw the wrong person's attention.",
      built: [
        "Silent SOS alert by pressing Vol+ and Vol− together, even with the screen off",
        "Automatic SMS with your location to emergency contacts",
        "Community SOS: notifications for people nearby",
        "Dashboard showing whether protection is fully set up (accessibility, SMS, location and contacts)",
      ],
      galleryAlt: ["NORA home screen with the protection status and the silent alert"],
    },
    civilconnect: {
      title: "CivilConnect",
      tagline: "Santo Tirso Civil Protection",
      description:
        "Civil Protection mobile app for the people of Santo Tirso: active wildfires, fire risk, controlled burns, weather and IPMA warnings, reporting Asian hornet nests, news, safety tips and emergency contacts, with a back office to manage content and reports.",
      problem:
        "Residents need civil protection information in one place — wildfires, fire risk, controlled burns, weather and warnings — and a quick way to report incidents such as Asian hornet nests.",
      built: [
        "Flutter app with active wildfires, fire risk, controlled burns, weather and IPMA warnings",
        "Asian hornet nest reporting by residents",
        "News, safety tips and emergency contacts",
        "Back office for Civil Protection to manage content and reports",
        "Built during my internship at the Municipal Civil Protection Service",
      ],
      galleryAlt: ["CivilConnect main menu with the app's sections"],
    },
  }),

  metrics: [
    { value: 6, suffix: "+", label: "Projects" },
    { value: techCount, suffix: "+", label: "Technologies" },
    { value: 17, suffix: "", label: "Final grade (out of 20)" },
  ],

  nav: [
    { id: "sobre", label: "About" },
    { id: "experiencia", label: "Experience" },
    { id: "projetos", label: "Projects" },
    { id: "contacto", label: "Contact" },
  ],

  t: {
    nav: { home: "Home", openMenu: "Open menu", closeMenu: "Close menu", main: "Main", switchLang: "Mudar para português" },
    hero: {
      lines: ["I build digital", "solutions with", "real-world use."],
      sides: [
        { label: "Developer", text: "Websites, mobile apps and management systems — from Next.js and Supabase to Flutter and Kotlin." },
        { label: "Volunteer Firefighter", text: "At the Tirsenses Volunteer Firefighters, where I learned responsibility, discipline and attention to detail." },
      ],
      viewProjects: "See projects",
      cv: "Download CV",
      scroll: "Scroll",
      scrollAria: "Scroll down to the About section",
    },
    about: {
      eyebrow: "01 — About",
      lines: ["Simple solutions,", "useful and well built."],
      p1: ["I'm ", "Leonardo Martins", ", a web and mobile developer in Portugal. I build websites, apps and management systems focused on usefulness, organisation and a good user experience."],
      p2: ["Beyond programming, I'm a ", "Volunteer Firefighter", ". It taught me responsibility, discipline and attention to detail — and I bring that to every line of code."],
      role: "Web & Mobile Developer",
      photoAlt: "Portrait of Leonardo Martins",
    },
    timeline: {
      eyebrow: "02 — Experience",
      lines: ["Real-world experience", "in IT."],
      intro: "During my studies I built skills in programming, web development, mobile apps, APIs, databases and IT support through internships in real companies.",
    },
    projects: {
      eyebrow: "03 — Projects",
      lines: ["Featured", "projects."],
      intro: "From driving school management to personal safety and Civil Protection: software made to be used every day.",
      keepScrolling: "Keep scrolling",
      moreEyebrow: "There's more",
      moreText: "More of my work is on GitHub.",
      seeGithub: "See GitHub",
      open: "Open project",
      openAria: (title: string) => `Open the ${title} project`,
      done: "Completed",
      wip: "In progress",
      problem: "The problem",
      built: "What I built",
      result: "The outcome",
      gallery: "Screenshots",
      stack: "Stack",
      close: "Close",
    },
    contact: {
      eyebrow: "04 — Contact",
      lines: ["Shall we build", "something", "great?"],
      intro: "I'm available to build websites, improve existing projects or create custom digital solutions.",
      name: "Your name",
      email: "Email",
      message: "Tell me about your project",
      send: "Send message",
      status: {
        idle: "Your message goes straight to my inbox.",
        sending: "Sending…",
        sent: "Message sent! I'll get back to you as soon as possible.",
        error: "Couldn't send it. Opening your email app instead…",
      },
    },
    footer: "Web · Mobile · Management systems",
    scene: { loading: "Preparing the 3D scene", words: ["Code", "Fire", "Impact"] },
    visuals: {
      nexoChips: ["Students", "Lessons", "Exams", "Payments"],
      nexoAlt: "NEXO platform dashboards for the school, instructors and students",
      noraAlt: "NORA app screens: login, silent SOS alert and emergency contacts",
      civilAlt: "CivilConnect app screens: splash, main menu and fire risk",
    },
  },
};

export const content: Record<Lang, Content> = { pt, en };

export const skillsFor = (c: Content) => c.skillAreas.map((area, i) => ({ area, items: skillItems[i] }));
