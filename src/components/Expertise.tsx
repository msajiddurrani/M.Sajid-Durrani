import { capabilities } from '../data/portfolio'

export function Expertise() {
  return (
    <section id="expertise" className="expertise wrap" aria-labelledby="expertise-title">
      <div className="section-head">
        <div>
          <p className="eyebrow"><span>03</span> / Engineering expertise</p>
          <h2 id="expertise-title">THE STACK<span className="red">.</span></h2>
        </div>
        <p className="section-aside mono">Five disciplines<br />From interface to delivery</p>
      </div>
      <dl className="provenance mono" aria-label="Technology provenance">
        <div><dt>U</dt><dd>Supplied expertise</dd></div>
        <div><dt>G</dt><dd>GitHub profile listing</dd></div>
        <div><dt>R</dt><dd>Repository documentation cited in brief</dd></div>
      </dl>
      <ol className="capabilities">
        {capabilities.map((capability, index) => (
          <li key={capability.title}>
            <span className="capability-number mono">0{index + 1}</span>
            <div><h3>{capability.title}</h3><p>{capability.summary}</p></div>
            <div className="capability-tools">
              <p><b className="source mono">U</b> {capability.primary}</p>
              {capability.profile && <p><b className="source mono">G</b> {capability.profile}</p>}
              {capability.evidence && <p><b className="source mono">R</b> {capability.evidence}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
