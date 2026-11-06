import { projects } from '../data/portfolio'
import { ProjectVisual } from './ProjectVisual'

export function SelectedWork() {
  return (
    <section id="work" className="work wrap" aria-labelledby="work-title">
      <div className="section-head">
        <div>
          <p className="eyebrow"><span>02</span> / Selected projects</p>
          <h2 id="work-title">SELECTED<br />WORK<span className="red">.</span></h2>
        </div>
        <p className="section-aside mono">01—06 <br />Software, AI systems<br />and interface studies</p>
      </div>
      <ol className="work-grid">
        {projects.map((project, index) => (
          <li key={project.id} className={'work-item work-' + project.id}>
            <article aria-labelledby={project.id + '-title'}>
              <div className="project-copy">
                <p className="project-index mono"><span className="red">0{index + 1}</span> / {project.category}</p>
                <h3 id={project.id + '-title'}>{project.name}</h3>
                <p>{project.context}</p>
                <ul className="project-details">
                  {project.architecture.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
                <p className="project-stack mono">
                  {project.stack.map(({ tech, source }) => <span key={tech}>{tech}<sup>{source}</sup></span>)}
                </p>
              </div>
              <ProjectVisual id={project.id} number={'0' + (index + 1)} />
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
