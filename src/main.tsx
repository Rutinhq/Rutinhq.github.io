import { HelmetProvider } from '@dr.pogodin/react-helmet'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { resolvePageForPath } from './App.tsx'
import { GuideWidgetLazy } from './components/guide/GuideHost'
import { isGuideWidgetPath } from './guide/config'
import i18n from './lib/i18n'
import { languageFromPathname } from './lib/i18n/paths'
import './styles/globals.css'

const root = document.getElementById('root')!

const tree = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

function clientRender() {
  createRoot(root).render(tree)
}

async function mount() {
  try {
    await i18n.changeLanguage(languageFromPathname(window.location.pathname))
    await resolvePageForPath(window.location.pathname)
    if (isGuideWidgetPath(window.location.pathname)) {
      await GuideWidgetLazy.preload()
    }
  } catch (err) {
    console.error('Route preload failed; mounting anyway', err)
  }

  try {
    if (root.hasChildNodes()) {
      hydrateRoot(root, tree)
    } else {
      clientRender()
    }
  } catch (err) {
    console.error('Hydrate failed; client-rendering', err)
    root.replaceChildren()
    clientRender()
  }
}

void mount()
