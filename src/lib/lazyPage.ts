import { createElement, lazy, type ComponentType } from 'react'

type PageModule = { default: ComponentType }

export type PreloadablePage = ComponentType & {
  preload: () => Promise<void>
}

/**
 * Route page that code-splits with React.lazy, but can be preloaded into
 * our own cache so renderToString / hydrateRoot emit the real tree (no
 * streaming bootstrap scripts, no private React.lazy payload mutation).
 */
export function lazyPage(factory: () => Promise<PageModule>): PreloadablePage {
  const Lazy = lazy(factory)
  let loaded: ComponentType | undefined
  let inflight: Promise<void> | undefined

  const preload = (): Promise<void> => {
    if (loaded) return Promise.resolve()
    if (!inflight) {
      inflight = factory()
        .then((mod) => {
          loaded = mod.default
        })
        .finally(() => {
          inflight = undefined
        })
    }
    return inflight
  }

  function Page(props: Record<string, unknown>) {
    if (loaded) return createElement(loaded, props)
    return createElement(Lazy, props)
  }

  Page.preload = preload
  return Page as PreloadablePage
}
