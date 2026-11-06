import { education, experience } from '../data/portfolio'

export function ExperienceEducation() {
  return (
    <div id="experience" className="record wrap">
      <section aria-labelledby="experience-title">
        <p className="eyebrow"><span>04</span> / Professional record</p>
        <h2 id="experience-title">EXPERIENCE<span className="red">.</span></h2>
        <ol className="record-list">
          {experience.map(({ name, role, description }, index) => (
            <li key={name}>
              <span className="record-number mono">0{index + 1}</span>
              <div><h3>{name}</h3><p className="record-role">{role}</p><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="education-title">
        <p className="eyebrow"><span>05</span> / Education</p>
        <h2 id="education-title">EDUCATION<span className="red">.</span></h2>
        <ol className="record-list">
          {education.map(({ course, institution }, index) => (
            <li key={course}>
              <span className="record-number mono">0{index + 1}</span>
              <div><h3>{course}</h3><p>{institution}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
