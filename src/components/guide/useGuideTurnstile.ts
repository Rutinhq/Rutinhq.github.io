import { useCallback, useEffect, useMemo } from 'react'
import { isGuidePreviewHost } from '../../guide/preview-host'

const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/** Cloudflare dummy key that always shows the checkbox. Preview UX only. */
export const GUIDE_TURNSTILE_ALWAYS_INTERACTIVE_SITE_KEY =
  '3x00000000000000000000FF'

/** Wait for the user to tick the box (callback) before posting. */
export const GUIDE_TURNSTILE_TOKEN_WAIT_MS = 20_000

let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('turnstile_script')), {
        once: true,
      })
      return
    }
    const script = document.createElement('script')
    script.src = TURNSTILE_SRC
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('turnstile_script')), {
      once: true,
    })
    document.head.appendChild(script)
  })
  return scriptPromise
}

function defaultNow(): number {
  return Date.now()
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export type GuideTurnstileRenderOptions = {
  sitekey: string
  theme?: 'auto' | 'light' | 'dark'
  size?: 'normal' | 'flexible' | 'compact'
  appearance?: 'always' | 'execute' | 'interaction-only'
  action?: string
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

export type GuideTurnstileApi = {
  render(container: HTMLElement | string, options: GuideTurnstileRenderOptions): string
  reset(widgetId?: string): void
  remove(widgetId?: string): void
  getResponse(widgetId?: string): string
}

export type GuideTurnstileClock = {
  now: () => number
  sleep: (ms: number) => Promise<void>
}

export type GuideTurnstileControllerOpts = {
  getSiteKey: () => string | undefined
  loadScript?: () => Promise<void>
  getApi?: () => GuideTurnstileApi | undefined
  clock?: GuideTurnstileClock
  tokenWaitMs?: number
}

export type GuideTurnstileController = {
  attach: (node: HTMLElement | null) => void
  consumeToken: () => Promise<string | undefined>
  dispose: () => void
}

function defaultGetApi(): GuideTurnstileApi | undefined {
  if (typeof window === 'undefined') return undefined
  return window.turnstile
}

/**
 * Explicit-render Turnstile session. Render is tied to host mount (callback ref),
 * not to hook mount — the chat host is inside `{open ? …}` so it is null until open.
 */
export function createGuideTurnstileController(
  opts: GuideTurnstileControllerOpts,
): GuideTurnstileController {
  const loadScript = opts.loadScript ?? loadTurnstileScript
  const getApi = opts.getApi ?? defaultGetApi
  const clock = opts.clock ?? { now: defaultNow, sleep: defaultSleep }
  const tokenWaitMs = opts.tokenWaitMs ?? GUIDE_TURNSTILE_TOKEN_WAIT_MS

  let generation = 0
  let widgetId: string | null = null
  let token: string | null = null
  let renderPromise: Promise<void> = Promise.resolve()

  const removeWidget = () => {
    const id = widgetId
    widgetId = null
    token = null
    if (!id) return
    const api = getApi()
    if (api) api.remove(id)
  }

  const attach = (node: HTMLElement | null) => {
    generation += 1
    const gen = generation
    removeWidget()
    if (!node || !opts.getSiteKey()) {
      renderPromise = Promise.resolve()
      return
    }

    let settle: () => void = () => {}
    renderPromise = new Promise<void>((resolve) => {
      settle = resolve
    })

    void loadScript()
      .then(() => {
        if (gen !== generation) return
        const api = getApi()
        const siteKey = opts.getSiteKey()
        if (!api || !siteKey) return
        widgetId = api.render(node, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'flexible',
          appearance: 'interaction-only',
          action: 'guide',
          callback: (value) => {
            token = value
          },
          'expired-callback': () => {
            token = null
          },
          'error-callback': () => {
            token = null
          },
        })
      })
      .catch(() => {
        /* Widget degrades: requests go without a token. */
      })
      .finally(() => {
        settle()
      })
  }

  const consumeToken = async (): Promise<string | undefined> => {
    if (!opts.getSiteKey()) return undefined
    const gen = generation
    const started = clock.now()
    const deadline = started + tokenWaitMs
    const pendingRender = renderPromise
    const renderWait = deadline - clock.now()
    if (renderWait > 0) {
      await Promise.race([pendingRender, clock.sleep(renderWait)])
    }
    while (clock.now() < deadline) {
      if (gen !== generation) return undefined
      const api = getApi()
      const live =
        token || (widgetId && api ? api.getResponse(widgetId) : '') || ''
      if (live) {
        token = null
        if (widgetId && api) api.reset(widgetId)
        return live
      }
      await clock.sleep(100)
    }
    return undefined
  }

  const dispose = () => {
    generation += 1
    removeWidget()
    renderPromise = Promise.resolve()
  }

  return { attach, consumeToken, dispose }
}

export function resolveGuideTurnstileSiteKey(
  envKey: string | undefined,
  hostname: string,
  search: string,
): string | undefined {
  const trimmed = typeof envKey === 'string' && envKey.trim() ? envKey.trim() : undefined
  if (isGuidePreviewHost(hostname)) {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    if (params.get('ts') === 'interactive') {
      return GUIDE_TURNSTILE_ALWAYS_INTERACTIVE_SITE_KEY
    }
  }
  return trimmed
}

export function readGuideTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY
  const hostname = typeof window === 'undefined' ? '' : window.location.hostname
  const search = typeof window === 'undefined' ? '' : window.location.search
  return resolveGuideTurnstileSiteKey(key, hostname, search)
}

/** Skip the POST when a site key is set but no token arrived — avoid a 403 + double send. */
export function shouldPostGuideAfterTurnstile(opts: {
  siteKey: string | undefined
  token: string | undefined
}): { post: boolean; timedOut: boolean } {
  if (!opts.siteKey) return { post: true, timedOut: false }
  if (opts.token) return { post: true, timedOut: false }
  return { post: false, timedOut: true }
}

export function useGuideTurnstile(siteKey: string | undefined) {
  const controller = useMemo(
    () =>
      createGuideTurnstileController({
        getSiteKey: () => siteKey,
      }),
    [siteKey],
  )

  useEffect(() => {
    if (!siteKey) return
    void loadTurnstileScript()
  }, [siteKey])

  useEffect(() => () => controller.dispose(), [controller])

  const hostRef = useCallback(
    (node: HTMLDivElement | null) => {
      controller.attach(node)
    },
    [controller],
  )

  const consumeToken = useCallback(() => controller.consumeToken(), [controller])

  return { hostRef, consumeToken }
}
