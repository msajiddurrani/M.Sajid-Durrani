import { EditorialMasthead } from './components/EditorialMasthead'
import { About } from './components/About'
import { TornPaperStage } from './components/TornPaperStage'
import { SelectedWork } from './components/SelectedWork'
import { Expertise } from './components/Expertise'
import { ExperienceEducation } from './components/ExperienceEducation'
import { ContactFooter } from './components/ContactFooter'

export function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <EditorialMasthead />
      <main id="main" tabIndex={-1}>
        <About />
        <TornPaperStage />
        <SelectedWork />
        <Expertise />
        <ExperienceEducation />
      </main>
      <ContactFooter />
    </>
  )
}
