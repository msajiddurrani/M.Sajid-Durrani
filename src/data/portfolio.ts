export const identity = {
  fullName: 'Muhammad Sajid Durrani',
  shortName: 'M. Sajid Durrani',
  role: 'Full-Stack AI Engineer & UI/UX Architect',
  location: 'Peshawar, Khyber Pakhtunkhwa, Pakistan',
  githubOwner: 'msajiddurrani',
  year: '2026',
}

export const contact = [
  { label: 'Mail', url: 'mailto:sajiddurrani987@gmail.com' },
  { label: 'WhatsApp', url: 'https://wa.me/923199644343' },
  { label: 'GitHub', url: 'https://github.com/msajiddurrani' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/sajiddurrani' },
]

export type Source = 'U' | 'G' | 'R'

export type Project = {
  id: string
  name: string
  category: string
  context: string
  architecture: string[]
  stack: { tech: string; source: Source }[]
}

export const projects: Project[] = [
  {
    id: 'context', name: 'Context Bridge', category: 'Developer tooling / Chrome extension',
    context: 'Conversations, code and useful links lose their context when a developer moves between AI tools.',
    architecture: [
      'Captures exact snippets and referenced links from ChatGPT, Claude and Gemini.',
      'Keeps handovers on-device in Chrome local storage under Manifest V3.',
      'Organizes captured material across a dashboard, popup and side panel.',
    ],
    stack: [
      { tech: 'TypeScript', source: 'U' }, { tech: 'Browser Extension APIs', source: 'U' },
      { tech: 'Local-first storage', source: 'U' }, { tech: 'Plasmo', source: 'R' },
      { tech: 'React', source: 'R' }, { tech: 'Tailwind CSS', source: 'R' },
    ],
  },
  {
    id: 'dentora', name: 'Dentora', category: 'Clinical SaaS / Dental practice management',
    context: 'Dental charting, administration and invoicing need a common workflow within the practice.',
    architecture: [
      'Makes clinical charting interactive with an odontogram.',
      'Brings charting and practice administration into the same interface.',
      'Supports a WhatsApp invoicing workflow.',
    ],
    stack: [
      { tech: 'React 18', source: 'U' }, { tech: 'TypeScript', source: 'U' },
      { tech: 'Vite', source: 'U' }, { tech: 'Tailwind CSS', source: 'U' }, { tech: 'Firebase', source: 'U' },
    ],
  },
  {
    id: 'axiom', name: 'Axiom AI', category: 'RAG / Knowledge portal',
    context: 'Repository knowledge is hard to find when it lives across code and documentation.',
    architecture: [
      'Indexes code repositories for retrieval.',
      'Connects a vector database and RAG workflow to a knowledge interface.',
      'Uses custom authentication interfaces for portal access.',
    ],
    stack: [
      { tech: 'Next.js', source: 'U' }, { tech: 'TypeScript', source: 'U' },
      { tech: 'Tailwind CSS', source: 'U' }, { tech: 'Vector database', source: 'U' }, { tech: 'RAG', source: 'U' },
    ],
  },
  {
    id: 'sop', name: 'SOP Forge — Enterprise Governance Work', category: 'Enterprise AI / SOP & HR governance / QA contribution',
    context: 'Internal policy workflows need evidence-grounded answers and tests for retrieval edge cases.',
    architecture: [
      'Supports evidence-grounded retrieval over SOP knowledge.',
      'My QA contribution focused on testing and RAG edge cases.',
      'Uses GitHub Actions for continuous integration validation.',
    ],
    stack: [
      { tech: 'React', source: 'U' }, { tech: 'TypeScript', source: 'U' }, { tech: 'RAG pipelines', source: 'U' },
      { tech: 'GitHub Actions CI', source: 'U' }, { tech: 'Test automation', source: 'U' },
    ],
  },
  {
    id: 'terra', name: 'Terrasphere-3D', category: '3D / Geospatial data visualization',
    context: 'Satellite and weather data benefit from a spatial interface that helps explain what is on screen.',
    architecture: [
      'Uses an interactive Three.js globe to give geospatial data context.',
      'Presents satellite and weather data in a shared visualization.',
      'Integrates Gemini for AI-assisted insights.',
    ],
    stack: [
      { tech: 'Vite', source: 'U' }, { tech: 'Three.js', source: 'U' },
      { tech: 'Gemini API', source: 'U' }, { tech: 'Vercel', source: 'U' },
    ],
  },
  {
    id: 'savyora', name: 'Savyora Fitness', category: 'Fitness / Editorial web experience',
    context: 'Prospective members need to explore facilities, training windows and memberships before getting in touch.',
    architecture: [
      'Uses Next.js App Router and responsive navigation for facilities and membership information.',
      'Uses motion to pace the presentation of training and facilities.',
      'Connects enquiries to a WhatsApp workflow.',
    ],
    stack: [
      { tech: 'Next.js App Router', source: 'R' }, { tech: 'React', source: 'U' },
      { tech: 'TypeScript', source: 'U' }, { tech: 'Tailwind CSS', source: 'U' }, { tech: 'GSAP', source: 'U' },
    ],
  },
]

type Capability = {
  title: string
  summary: string
  primary: string
  profile?: string
  evidence?: string
}

export const capabilities: Capability[] = [
  {
    title: 'Frontend',
    summary: 'Component architecture and responsive interfaces that stay readable and usable across screens.',
    primary: 'React 18, Next.js App Router, TypeScript, JavaScript ES6+, Tailwind CSS, component-based architecture, responsive UI design, accessibility-aware interfaces, frontend integration.',
    profile: 'HTML5, CSS3, Redux, Sass.',
    evidence: 'Context Bridge uses Plasmo, React, TypeScript and Tailwind CSS. Savyora Fitness uses Next.js App Router. The separate Axiom CRM uses React 18, Vite, Tailwind CSS and Motion.',
  },
  {
    title: 'Backend / SaaS',
    summary: 'The APIs, data flows and architecture behind software that can grow with the product.',
    primary: 'Node.js, Python, Firebase, RESTful APIs, vector databases, scalable SaaS architectures, backend integration.',
    profile: 'Express, MongoDB, PostgreSQL, GraphQL.',
    evidence: 'Axiom CRM documents Firebase Authentication, Google login, real-time Firestore and tenant isolation through rules. The separate SOP Forge Voice Triage repository documents Supabase schemas, FastAPI and WebSockets.',
  },
  {
    title: 'AI / RAG',
    summary: 'Retrieval-powered software with attention to source context, failure cases and evaluation.',
    primary: 'Retrieval-augmented generation, code and repository indexing, knowledge-grounded interfaces, vector search, Gemini API, multi-platform context synthesis, automated workflows, LLM integration and retrieval evaluation.',
    evidence: 'Context Bridge documents deterministic local-first capture. SOP Forge Voice Triage describes Groq LLM and ElevenLabs TTS with FastAPI and WebSocket streaming.',
  },
  {
    title: 'UI/UX / 3D / Interaction',
    summary: 'Visual systems, interaction design and motion that help people navigate complex products.',
    primary: 'UI/UX architecture, visual design systems, matte dark-mode systems, typography, Three.js, interactive globes and data visualization, GSAP, transitions and motion hierarchy.',
  },
  {
    title: 'QA / DevOps',
    summary: 'Testing and delivery practices that keep edge cases visible from implementation through release.',
    primary: 'Git, GitHub Actions CI/CD, Vite, browser extension APIs, automated tests, RAG edge-case evaluation, reliability-oriented QA, VS Code, Cline and AI-assisted workflows, Vercel frontend deployment.',
    profile: 'Docker, AWS, Postman, Vercel.',
    evidence: 'Context Bridge documents Manifest V3, Plasmo and Chrome local storage. Savyora Fitness documents Next.js production scripts.',
  },
]

export const experience = [
  {
    name: 'Zentrix Edge',
    role: 'Co-Founder | Full-Stack Developer & AI Engineer',
    description: 'Co-founded a software and AI engineering agency delivering full-stack applications, SaaS and AI-integrated software. I contribute to frontend architecture, UX systems and end-to-end delivery with Next.js, React, TypeScript and Python.',
  },
  {
    name: 'Saylani Mass IT Training (SMIT)',
    role: 'Full-Stack AI Engineer & UI/UX Architect',
    description: 'Built and architected governance-oriented internal tools and RAG-backed AI workflows with modern frontend integration.',
  },
  {
    name: 'SOP Forge (Enterprise Workflow & HR Governance Platform)',
    role: 'Quality Assurance Officer & Test Administrator',
    description: 'Collaborated on an enterprise SOP and governance system, focusing on testing, RAG edge cases and GitHub Actions CI.',
  },
]

export const education = [
  { course: 'Full-Stack Web & Mobile App Development (1.5-Year Intensive Program)', institution: 'Saylani Mass IT Training (SMIT), Peshawar' },
  { course: 'F.Sc. Pre-Engineering', institution: 'Hadaf Group of Colleges, Hayatabad Campus, BISE Peshawar Board' },
  { course: 'Matriculation', institution: 'Peshawar Model Boys School, Peshawar' },
]
