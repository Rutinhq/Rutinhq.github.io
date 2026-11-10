import { useCallback, useEffect, useRef } from 'react'

const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const TOKEN_WAIT_MS = 4_000

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function readGuideTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : undefined
}

export function useGuideTurnstile(siteKey: string | undefined) {
  const hostRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false

    void loadTurnstileScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(hostRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'flexible',
          appearance: 'interaction-only',
          action: 'guide',
          callback: (token) => {
            tokenRef.current = token
          },
          'expired-callback': () => {
            tokenRef.current = null
          },
          'error-callback': () => {
            tokenRef.current = null
          },
        })
      })
      .catch(() => {
        /* Widget degrades: requests go without a token. */
      })

    return () => {
      cancelled = true
      const id = widgetIdRef.current
      widgetIdRef.current = null
      tokenRef.current = null
      if (id && window.turnstile) window.turnstile.remove(id)
    }
  }, [siteKey])

  const consumeToken = useCallback(async (): Promise<string | undefined> => {
    if (!siteKey) return undefined
    const started = Date.now()
    while (Date.now() - started < TOKEN_WAIT_MS) {
      const live =
        tokenRef.current ||
        (widgetIdRef.current && window.turnstile
          ? window.turnstile.getResponse(widgetIdRef.current)
          : '')
      if (live) {
        tokenRef.current = null
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
        return live
      }
      await sleep(100)
    }
    return undefined
  }, [siteKey])

  return { hostRef, consumeToken }
}
