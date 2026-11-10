import policy from './policy.json'
import type { GuideEnv } from './types'

const GUIDE_LIMITS = policy.limits

/** Cloudflare Turnstile Siteverify — secret stays on the server. */
export const TURNSTILE_SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type GuideGateEnv = GuideEnv & {
  TURNSTILE_SECRET_KEY?: string
  ENVIRONMENT?: string
  NODE_ENV?: string
  GUIDE_RATE_LIMIT?: GuideKvLike
}

export type GuideKvLike = {
  get(key: string): Promise<string | null>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>
}

export type RateLimitRecord = { n: number; resetAt: number }

export type GuideRateLimitStore = {
  get(key: string): Promise<RateLimitRecord | null>
  set(key: string, value: RateLimitRecord, ttlSec: number): Promise<void>
}

export type TurnstileDecision =
  | { ok: true; mode: 'verified' | 'fail_open' }
  | {
      ok: false
      error: 'turnstile_invalid' | 'turnstile_required' | 'turnstile_unavailable'
    }

export type RateLimitDecision =
  | { limited: false }
  | { limited: true; retryAfterSec: number }

const memoryHits = new Map<string, RateLimitRecord>()

const memoryStore: GuideRateLimitStore = {
  async get(key) {
    return memoryHits.get(key) ?? null
  },
  async set(key, value) {
    memoryHits.set(key, value)
    if (memoryHits.size > 10_000) {
      const now = Date.now()
      for (const [k, row] of memoryHits) {
        if (now > row.resetAt) memoryHits.delete(k)
      }
    }
  },
}

export function resetGuideRateLimitMemory(): void {
  memoryHits.clear()
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anon'
  )
}

export function isGuideDevRuntime(
  env: Pick<GuideGateEnv, 'ENVIRONMENT' | 'NODE_ENV'>,
  request?: Request,
): boolean {
  if (env.ENVIRONMENT === 'development' || env.NODE_ENV === 'development') {
    return true
  }
  if (!request) return false
  try {
    const host = new URL(request.url).hostname
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === 'guide.local'
    )
  } catch {
    return false
  }
}

/**
 * Missing TURNSTILE_SECRET_KEY fail-opens only in local/dev so Pages
 * production cannot silently skip Siteverify. Widget degrades to catalog
 * fallback on 403 until STACK sets the secret.
 */
export function isTurnstileFailOpen(
  env: GuideGateEnv,
  request?: Request,
): boolean {
  if (env.TURNSTILE_SECRET_KEY?.trim()) return false
  return isGuideDevRuntime(env, request)
}

export function readTurnstileToken(
  parsed: unknown,
  request?: Request,
): string | null {
  if (parsed && typeof parsed === 'object') {
    const rec = parsed as Record<string, unknown>
    for (const key of [
      'turnstileToken',
      'cf-turnstile-response',
      'turnstile_token',
    ] as const) {
      const value = rec[key]
      if (typeof value === 'string' && value.trim()) {
        return value.trim().slice(0, 2048)
      }
    }
  }
  const header = request?.headers.get('cf-turnstile-response')?.trim()
  return header ? header.slice(0, 2048) : null
}

function kvStore(kv: GuideKvLike): GuideRateLimitStore {
  return {
    async get(key) {
      const raw = await kv.get(`guide-rl:${key}`)
      if (!raw) return null
      try {
        const parsed = JSON.parse(raw) as RateLimitRecord
        if (typeof parsed.n === 'number' && typeof parsed.resetAt === 'number') {
          return parsed
        }
      } catch {
        return null
      }
      return null
    },
    async set(key, value, ttlSec) {
      await kv.put(`guide-rl:${key}`, JSON.stringify(value), {
        expirationTtl: Math.max(60, ttlSec),
      })
    },
  }
}

/**
 * Cache API keys must be GET requests on a URL that belongs to this zone.
 * A dummy path like `/__guide-rate-limit/:ip` is not a real Pages route, so
 * `caches.default.put` silently no-ops on *.pages.dev. Key off the incoming
 * `/api/guide` URL (query-only) so the entry stays on-zone.
 */
function cacheApiStore(cache: Cache, requestUrl?: string): GuideRateLimitStore {
  const asRequest = (key: string) => {
    let url: URL
    try {
      url = new URL(requestUrl && /^https?:\/\//.test(requestUrl) ? requestUrl : 'https://www.rutinhq.com/api/guide')
    } catch {
      url = new URL('https://www.rutinhq.com/api/guide')
    }
    url.search = ''
    url.hash = ''
    url.searchParams.set('guide_rl', key)
    return new Request(url.toString(), { method: 'GET' })
  }
  return {
    async get(key) {
      try {
        const hit = await cache.match(asRequest(key), { ignoreMethod: true })
        if (!hit || !hit.ok) return null
        const parsed = (await hit.json()) as RateLimitRecord
        if (typeof parsed.n === 'number' && typeof parsed.resetAt === 'number') {
          return parsed
        }
      } catch {
        return null
      }
      return null
    },
    async set(key, value, ttlSec) {
      try {
        await cache.put(
          asRequest(key),
          new Response(JSON.stringify(value), {
            status: 200,
            headers: {
              'content-type': 'application/json',
              'cache-control': `public, max-age=${Math.max(60, ttlSec)}`,
            },
          }),
        )
      } catch {
        /* Cache API may refuse the key; memory layer still counts. */
      }
    },
  }
}

function layeredStore(
  primary: GuideRateLimitStore,
  secondary: GuideRateLimitStore,
): GuideRateLimitStore {
  return {
    async get(key) {
      return (await primary.get(key)) ?? (await secondary.get(key))
    },
    async set(key, value, ttlSec) {
      await Promise.all([
        primary.set(key, value, ttlSec),
        secondary.set(key, value, ttlSec),
      ])
    },
  }
}

async function openRuntimeCache(): Promise<Cache | null> {
  try {
    if (typeof globalThis === 'undefined' || !('caches' in globalThis)) return null
    const runtimeCaches = (
      globalThis as typeof globalThis & {
        caches?: CacheStorage & { default?: Cache }
      }
    ).caches
    if (!runtimeCaches) return null
    if (typeof runtimeCaches.open === 'function') {
      return await runtimeCaches.open('guide-rate-limit')
    }
    return runtimeCaches.default ?? null
  } catch {
    return null
  }
}

/** KV if bound, else named Cache API + isolate memory, else memory (best effort). */
export async function createGuideRateLimitStore(
  env?: GuideGateEnv,
  requestUrl?: string,
): Promise<GuideRateLimitStore> {
  if (env?.GUIDE_RATE_LIMIT) return kvStore(env.GUIDE_RATE_LIMIT)
  const cache = await openRuntimeCache()
  if (cache) return layeredStore(memoryStore, cacheApiStore(cache, requestUrl))
  return memoryStore
}

export async function consumeIpRateLimit(options: {
  ip: string
  windowMs?: number
  max?: number
  store?: GuideRateLimitStore
}): Promise<RateLimitDecision> {
  const windowMs = options.windowMs ?? GUIDE_LIMITS.rateLimitWindowMs
  const max = options.max ?? GUIDE_LIMITS.rateLimitMax
  const store = options.store ?? memoryStore
  const now = Date.now()
  const key = options.ip || 'anon'
  const row = await store.get(key)
  const ttlSec = Math.max(60, Math.ceil(windowMs / 1000))

  if (!row || now > row.resetAt) {
    await store.set(key, { n: 1, resetAt: now + windowMs }, ttlSec)
    return { limited: false }
  }

  const next = { n: row.n + 1, resetAt: row.resetAt }
  await store.set(key, next, Math.max(60, Math.ceil((row.resetAt - now) / 1000)))
  if (next.n > max) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((row.resetAt - now) / 1000)),
    }
  }
  return { limited: false }
}

export async function verifyTurnstileToken(options: {
  secret?: string
  token?: string | null
  remoteip?: string
  failOpen: boolean
  fetchImpl?: typeof fetch
}): Promise<TurnstileDecision> {
  const secret = options.secret?.trim()
  if (!secret) {
    if (options.failOpen) {
      console.warn(
        '[guide] TURNSTILE_SECRET_KEY is unset — fail-open (dev only). Production Pages must set this secret before any LLM call or lead write.',
      )
      return { ok: true, mode: 'fail_open' }
    }
    return { ok: false, error: 'turnstile_unavailable' }
  }

  const token = options.token?.trim()
  if (!token) return { ok: false, error: 'turnstile_required' }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  const ip = options.remoteip?.trim()
  if (ip && ip !== 'anon' && ip !== 'local') body.set('remoteip', ip)

  const fetchImpl = options.fetchImpl ?? fetch
  try {
    const res = await fetchImpl(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    })
    const outcome = (await res.json()) as { success?: boolean }
    if (outcome.success === true) return { ok: true, mode: 'verified' }
    return { ok: false, error: 'turnstile_invalid' }
  } catch {
    return { ok: false, error: 'turnstile_invalid' }
  }
}

export function turnstileStatus(error: Extract<TurnstileDecision, { ok: false }>['error']): 403 {
  switch (error) {
    case 'turnstile_invalid':
    case 'turnstile_required':
    case 'turnstile_unavailable':
      return 403
    default: {
      const _never: never = error
      return _never
    }
  }
}

export function jsonWithHeaders(
  status: number,
  body: unknown,
  extra?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extra,
    },
  })
}

export function rateLimitResponse(retryAfterSec: number): Response {
  return jsonWithHeaders(
    429,
    { error: 'rate_limited' },
    { 'Retry-After': String(retryAfterSec) },
  )
}

export function turnstileDeniedResponse(
  error: Extract<TurnstileDecision, { ok: false }>['error'],
): Response {
  return jsonWithHeaders(turnstileStatus(error), { error })
}

export async function enforceGuideRateLimit(
  request: Request,
  env: GuideGateEnv,
): Promise<Response | null> {
  const decision = await consumeIpRateLimit({
    ip: clientIp(request),
    windowMs: GUIDE_LIMITS.rateLimitWindowMs,
    max: GUIDE_LIMITS.rateLimitMax,
    store: await createGuideRateLimitStore(env, request.url),
  })
  if (decision.limited) return rateLimitResponse(decision.retryAfterSec)
  return null
}

export async function enforceGuideTurnstile(
  request: Request,
  env: GuideGateEnv,
  parsed: unknown,
  fetchImpl?: typeof fetch,
): Promise<Response | null> {
  const decision = await verifyTurnstileToken({
    secret: env.TURNSTILE_SECRET_KEY,
    token: readTurnstileToken(parsed, request),
    remoteip: clientIp(request),
    failOpen: isTurnstileFailOpen(env, request),
    fetchImpl,
  })
  if (decision.ok) return null
  return turnstileDeniedResponse(decision.error)
}
