import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/archivo-black/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import { App } from './App'
import './styles.css'

// Fresh root visits and reloads open on the hero rather than a restored scroll position.
history.scrollRestoration = 'manual'
if (!location.hash || ['#top', '#hero'].includes(location.hash)) window.scrollTo(0, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)

import './editorial.css'
import './typography.css'
import './work-gallery.css'
import './paper-record.css'
import './interaction-polish.css'
