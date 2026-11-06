import type { ReactNode } from 'react'

const titles: Record<string, string> = {
  context: 'Local context handoff',
  dentora: 'Odontogram study',
  axiom: 'Retrieval pipeline',
  sop: 'Governance and QA',
  terra: 'Geospatial interface',
  savyora: 'Training and facilities',
}

const visuals: Record<string, ReactNode> = {
  context: (
    <>
      <path d="M112 78h161l40 48h135M112 130h336M112 182h161l40-52" fill="none" stroke="currentColor" opacity=".55" strokeDasharray="3 5" />
      <g fill="var(--figure-bg)" stroke="currentColor">
        <rect x="27" y="57" width="133" height="40" /><rect x="27" y="110" width="133" height="40" /><rect x="27" y="163" width="133" height="40" />
        <rect x="295" y="96" width="189" height="72" />
      </g>
      <g fill="currentColor" fontSize="13">
        <text x="45" y="82">01 / CHATGPT</text><text x="45" y="135">02 / CLAUDE</text><text x="45" y="188">03 / GEMINI</text>
        <text x="321" y="128">LOCAL CONTEXT</text><text x="321" y="149" opacity=".75">CODE / LINKS / NOTES</text>
      </g>
      <circle cx="230" cy="130" r="6" fill="var(--red)" />
      <path d="M397 195h87m-12-6 12 6-12 6" fill="none" stroke="currentColor" />
    </>
  ),
  dentora: (
    <>
      <path d="M127 109C127 6 393 6 393 109M127 151c0 103 266 103 266 0M97 130h326m-163-96v192" stroke="currentColor" strokeDasharray="4 5" fill="none" opacity=".4" />
      {[0, 1].map((row) => <g key={row} transform={row ? 'translate(0 260) scale(1 -1)' : undefined}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((column) => {
          const y = 60 + 3.5 * (column - 3.5) ** 2
          return <path key={column} transform={'translate(' + (153 + column * 30) + ' ' + y + ')'} d="M-9-13q9-9 18 0l1 20-6 10h-8L-10 7Z M-5 0h10M0-5v10" fill="none" stroke={column === 5 && !row ? 'var(--red-dark)' : 'currentColor'} strokeWidth="1.6" />
        })}
      </g>)}
      <path d="M315 62h122v28" stroke="var(--red-dark)" fill="none" />
      <text x="405" y="111" fill="var(--red-dark)" fontSize="12">CHART</text>
    </>
  ),
  axiom: (
    <>
      <path d="M34 133h450M76 96v74m123-74v74m123-74v74m123-74v74" stroke="currentColor" strokeDasharray="4 5" opacity=".5" />
      <g fill="var(--figure-bg)" stroke="currentColor">
        <rect x="38" y="103" width="76" height="56" /><circle cx="199" cy="131" r="31" />
        <path d="M322 94l40 37-40 37-40-37z" /><rect x="405" y="103" width="80" height="56" />
      </g>
      <g fill="currentColor" fontSize="12" textAnchor="middle">
        <text x="76" y="136">REPO</text><text x="199" y="136">INDEX</text>
        <text x="322" y="136">RAG</text><text x="445" y="136">PORTAL</text>
      </g>
      <circle cx="322" cy="94" r="5" fill="var(--red)" />
    </>
  ),
  sop: (
    <>
      <path d="M54 54h412v151H54ZM54 93h412m-412 37h412m-412 37h412m-113-113v151" fill="none" stroke="currentColor" opacity=".45" />
      <g fill="currentColor" fontSize="14">
        <text x="76" y="80">CHECK</text><text x="76" y="116">01 / SOP RETRIEVAL</text>
        <text x="76" y="153">02 / EVIDENCE</text><text x="76" y="190">03 / CI VALIDATION</text>
        <text x="375" y="80">QA</text>
      </g>
      <path d="m397 110 6 6 13-13m-19 44 6 6 13-13m-19 44 6 6 13-13" fill="none" stroke="var(--red-dark)" strokeWidth="2" />
    </>
  ),
  terra: (
    <>
      <g stroke="currentColor" fill="none">
        <circle cx="260" cy="130" r="91" /><ellipse cx="260" cy="130" rx="59" ry="91" opacity=".6" />
        <ellipse cx="260" cy="130" rx="24" ry="91" opacity=".55" /><ellipse cx="260" cy="130" rx="91" ry="28" opacity=".55" />
        <path d="M178 92c39 21 125 21 164 0m-164 76c39-21 125-21 164 0M169 130h182" opacity=".6" />
        <ellipse cx="260" cy="130" rx="161" ry="49" transform="rotate(-19 260 130)" stroke="var(--red)" />
        <path d="M304 79h97l28-31h44M215 168h-99l-30 33H47" strokeDasharray="3 4" />
      </g>
      <g fill="var(--red)"><circle cx="304" cy="79" r="5" /><circle cx="215" cy="168" r="5" /></g>
      <g fill="currentColor" fontSize="12"><text x="396" y="38">OBSERVE</text><text x="47" y="222">INTERPRET</text></g>
    </>
  ),
  savyora: (
    <>
      <path d="M47 201h425M172 51v150m150-150v150" fill="none" stroke="currentColor" opacity=".25" />
      <g fill="currentColor" fontFamily="'Archivo Black', sans-serif" fontSize="59" letterSpacing="-4">
        <text x="43" y="118">TRAIN.</text><text x="124" y="177">RECOVER.</text>
      </g>
      <path d="M405 59h58m-28-28v56" fill="none" stroke="var(--red-dark)" strokeWidth="2" />
      <text x="47" y="222" fill="currentColor" fontSize="11">FACILITIES / TRAINING / MEMBERSHIP</text>
    </>
  ),
}

export function ProjectVisual({ id, number }: { id: string; number: string }) {
  return (
    <figure className="project-visual">
      <div className="figure-plate">
        <span className="figure-number mono">FIG. {number}</span>
        <svg viewBox="0 0 520 260" aria-hidden="true">{visuals[id]}</svg>
      </div>
      <figcaption className="mono">{titles[id]} <span>Concept illustration</span></figcaption>
    </figure>
  )
}
