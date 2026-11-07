export type TechnologyCategory = 'frontend' | 'backend' | 'ai' | 'devops'
export type StackFilter = TechnologyCategory | 'all'
export type BallSize = 'small' | 'medium' | 'large'

type TechnologyBase = {
  id: string
  name: string
  category: TechnologyCategory
  size: BallSize
}

export type Technology = TechnologyBase & (
  { logo: string; lightBacking?: boolean; mark?: never } |
  { mark: string; logo?: never; lightBacking?: never }
)

const logos = import.meta.glob<string>('../assets/tech-logos/*.svg', { eager: true, import: 'default', query: '?url' })

function branded(id: string, name: string, category: TechnologyCategory, size: BallSize, lightBacking = false): Technology {
  const logo = logos['../assets/tech-logos/' + id + '.svg']
  if (!logo) throw new Error('Missing technology logo: ' + id)
  return { id, name, category, size, logo, lightBacking }
}

function concept(id: string, name: string, mark: string, size: BallSize): Technology {
  return { id, name, category: 'ai', size, mark }
}

export const stackFilters: ReadonlyArray<{ id: StackFilter; name: string }> = [
  { id: 'all', name: 'All' },
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'ai', name: 'AI Engineering' },
  { id: 'devops', name: 'DevOps' },
]

export const technologies: readonly Technology[] = [
  branded('react', 'React', 'frontend', 'large'),
  branded('nextjs', 'Next.js', 'frontend', 'large'),
  branded('typescript', 'TypeScript', 'frontend', 'medium'),
  branded('javascript', 'JavaScript', 'frontend', 'medium'),
  branded('html5', 'HTML5', 'frontend', 'small'),
  branded('css3', 'CSS3', 'frontend', 'small'),
  branded('tailwindcss', 'Tailwind CSS', 'frontend', 'large'),
  branded('threejs', 'Three.js', 'frontend', 'medium', true),
  branded('gsap', 'GSAP', 'frontend', 'small'),
  branded('vitejs', 'Vite', 'frontend', 'medium'),
  branded('nodejs', 'Node.js', 'backend', 'large'),
  branded('express', 'Express.js', 'backend', 'medium', true),
  branded('python', 'Python', 'backend', 'large'),
  branded('fastapi', 'FastAPI', 'backend', 'medium'),
  branded('firebase', 'Firebase', 'backend', 'medium'),
  branded('mongodb', 'MongoDB', 'backend', 'medium'),
  branded('postgresql', 'PostgreSQL', 'backend', 'large'),
  branded('supabase', 'Supabase', 'backend', 'small'),
  branded('gemini', 'Gemini API', 'ai', 'large'),
  branded('groq', 'Groq', 'ai', 'medium'),
  concept('rag', 'RAG', 'RAG', 'medium'),
  concept('llm', 'LLM Integration', 'LLM', 'large'),
  concept('vectors', 'Vector Databases', 'VDB', 'small'),
  concept('search', 'Semantic Search', 'SEARCH', 'large'),
  concept('embeddings', 'Embeddings', 'EMB', 'small'),
  concept('workflow', 'AI Workflow Automation', 'AUTO', 'medium'),
  concept('indexing', 'Repository Indexing', 'INDEX', 'medium'),
  branded('git', 'Git', 'devops', 'medium'),
  branded('github', 'GitHub', 'devops', 'large', true),
  branded('githubactions', 'GitHub Actions', 'devops', 'small'),
  branded('docker', 'Docker', 'devops', 'large'),
  branded('vercel', 'Vercel', 'devops', 'small', true),
  branded('postman', 'Postman', 'devops', 'medium'),
  branded('vscode', 'VS Code', 'devops', 'small'),
]

const allSelection = [
  'react', 'nodejs', 'typescript', 'gemini', 'python', 'github', 'nextjs', 'docker', 'tailwindcss', 'rag', 'postgresql',
  'javascript', 'firebase', 'groq', 'git', 'mongodb', 'vectors', 'vscode', 'supabase', 'gsap', 'vitejs', 'githubactions',
]
const byId = new Map(technologies.map((technology) => [technology.id, technology]))

export function getVisibleTechnologies(filter: StackFilter, limit: number) {
  return filter === 'all'
    ? allSelection.slice(0, limit).flatMap((id) => byId.get(id) ?? [])
    : technologies.filter((technology) => technology.category === filter)
}
