import { useLayoutEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SiteNavigation } from './components/SiteNavigation'
import { EditorialMasthead } from './components/EditorialMasthead'
import { About } from './components/About'
import { SelectedWork } from './components/SelectedWork'
import { Expertise } from './components/Expertise'
import { ExperienceEducation } from './components/ExperienceEducation'
import { ContactFooter } from './components/ContactFooter'
import { InteractionLayer } from './components/InteractionLayer'

export function App() {
  useLayoutEffect(() => {
    if (location.hash && !['#top', '#hero'].includes(location.hash)) return
    // Reset after child pin/layout setup as well as before React mounts.
    // Otherwise ScrollTrigger can restore a pre-reload scroll offset on refresh.
    ScrollTrigger.clearScrollMemory('manual')
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [])
  return (
    <div id="top">
      <InteractionLayer />
      <a className="skip" href="#main">Skip to content</a>
      <SiteNavigation />
      <main id="main" tabIndex={-1}>
        <EditorialMasthead />
        <About />
        <SelectedWork />
        <Expertise />
        <ExperienceEducation />
      </main>
      <ContactFooter />
    </div>
  )
}
