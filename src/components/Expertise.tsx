import { TechStackSection } from './stack/TechStackSection'

const groups = [
  { title: 'Core', skills: ['TypeScript', 'JavaScript', 'Python', 'Node.js', 'Express.js', 'FastAPI'] },
  { title: 'Interface', skills: ['Next.js', 'React', 'Tailwind CSS', 'Three.js', 'GSAP', 'Vite'] },
  { title: 'Infrastructure', skills: ['PostgreSQL', 'MongoDB', 'Supabase', 'Git', 'Docker', 'GitHub Actions'] },
  { title: 'Intelligence', skills: ['Gemini API', 'Groq', 'RAG', 'Vector Databases', 'Semantic Search', 'AI Workflow Automation'] },
]

export function Expertise() {
  return (
    <section id="expertise" className="expertise wrap" aria-labelledby="expertise-title">
      <TechStackSection />
      <div className="skill-index" aria-label="Engineering disciplines">
        {groups.map(({ title, skills }) => (
          <div key={title}>
            <h3 className="mono">{title}</h3>
            <ul>{skills.map(skill => <li key={skill}><span aria-hidden="true">//</span>{skill}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  )
}
