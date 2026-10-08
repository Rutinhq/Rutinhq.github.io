import { handleGuideLeadRequest, handleGuideRequest } from '../src/guide/api.ts'
import {
  consumeIpRateLimit,
  isTurnstileFailOpen,
  readTurnstileToken,
  resetGuideRateLimitMemory,
  TURNSTILE_SITEVERIFY_URL,
  verifyTurnstileToken,
} from '../src/guide/ingress.ts'
import type { GuideEnv } from '../src/guide/types.ts'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error(msg)
    process.exit(1)
  }
}

function guideRequest(
  extra: Record<string, unknown> = {},
  init: { ip?: string; url?: string } = {},
): Request {
  return new Request(init.url ?? 'http://guide.local/api/guide', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': init.ip ?? '203.0.113.10',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'what is GTM OS?' }],
      locale: 'en',
      page: '/',
      ...extra,
    }),
  })
}

function leadRequest(
  extra: Record<string, unknown> = {},
  init: { ip?: string; url?: string } = {},
): Request {
  return new Request(init.url ?? 'http://guide.local/api/guide/lead', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': init.ip ?? '203.0.113.11',
    },
    body: JSON.stringify({
      leadBrief: {
        topic: 'GTM OS fit',
        questionsAsked: ['what is GTM OS?'],
        objections: [],
        recommendedSku: 'gtm-os',
        nextStep: 'Book 30-min fit call — https://calendly.com/rutinhq/30min',
        transcriptExcerpt: 'user: what is GTM OS?',
        page: '/',
        locale: 'en',
      },
      ...extra,
    }),
  })
}

function siteverifyFetch(successFor: string): typeof fetch {
  return async (input, init) => {
    const url = String(input)
    assert(url === TURNSTILE_SITEVERIFY_URL, `unexpected fetch ${url}`)
    const raw = init?.body
    const params =
      raw instanceof URLSearchParams ? raw : new URLSearchParams(String(raw ?? ''))
    const token = params.get('response')
    return new Response(JSON.stringify({ success: token === successFor }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
}

const valid = await verifyTurnstileToken({
  secret: 'test-secret',
  token: 'valid-token',
  failOpen: false,
  fetchImpl: siteverifyFetch('valid-token'),
})
assert(valid.ok && valid.mode === 'verified', 'valid token must pass siteverify')

const invalid = await verifyTurnstileToken({
  secret: 'test-secret',
  token: 'bad-token',
  failOpen: false,
  fetchImpl: siteverifyFetch('valid-token'),
})
assert(!invalid.ok && invalid.error === 'turnstile_invalid', 'invalid token must 403-shape')

const missing = await verifyTurnstileToken({
  secret: 'test-secret',
  token: '',
  failOpen: false,
  fetchImpl: siteverifyFetch('valid-token'),
})
assert(!missing.ok && missing.error === 'turnstile_required', 'missing token must be required')

const failOpen = await verifyTurnstileToken({
  secret: undefined,
  token: null,
  failOpen: true,
  fetchImpl: async () => {
    throw new Error('siteverify must not run when fail-open')
  },
})
assert(failOpen.ok && failOpen.mode === 'fail_open', 'dev fail-open must skip siteverify')

const prodClosed = await verifyTurnstileToken({
  secret: undefined,
  token: 'anything',
  failOpen: false,
})
assert(
  !prodClosed.ok && prodClosed.error === 'turnstile_unavailable',
  'missing secret outside dev must not fail-open',
)

assert(
  readTurnstileToken({ turnstileToken: 'abc' }) === 'abc',
  'read turnstileToken from JSON body',
)
assert(
  isTurnstileFailOpen({}, new Request('http://guide.local/api/guide')),
  'guide.local without secret is fail-open',
)
assert(
  !isTurnstileFailOpen(
    { TURNSTILE_SECRET_KEY: 'set', NODE_ENV: 'development' },
    new Request('http://guide.local/api/guide'),
  ),
  'present secret is never fail-open',
)
assert(
  !isTurnstileFailOpen(
    { NODE_ENV: 'production' },
    new Request('https://www.rutinhq.com/api/guide'),
  ),
  'production host without secret is fail-closed',
)

resetGuideRateLimitMemory()
const first = await consumeIpRateLimit({ ip: '198.51.100.2', max: 2, windowMs: 60_000 })
const second = await consumeIpRateLimit({ ip: '198.51.100.2', max: 2, windowMs: 60_000 })
const third = await consumeIpRateLimit({ ip: '198.51.100.2', max: 2, windowMs: 60_000 })
assert(!first.limited && !second.limited, 'first two hits under max are allowed')
assert(third.limited && third.retryAfterSec >= 1, 'third hit must rate-limit')

resetGuideRateLimitMemory()
const originalFetch = globalThis.fetch
globalThis.fetch = siteverifyFetch('valid-token')

const secretEnv: GuideEnv = {
  TURNSTILE_SECRET_KEY: 'test-secret',
  NODE_ENV: 'production',
}

const okRes = await handleGuideRequest(
  guideRequest(
    { turnstileToken: 'valid-token' },
    { url: 'https://www.rutinhq.com/api/guide', ip: '198.51.100.20' },
  ),
  secretEnv,
  null,
)
assert(okRes.status === 200, `valid token must reach the guide handler, got ${okRes.status}`)

const badRes = await handleGuideRequest(
  guideRequest(
    { turnstileToken: 'bad-token' },
    { url: 'https://www.rutinhq.com/api/guide', ip: '198.51.100.21' },
  ),
  secretEnv,
  null,
)
assert(badRes.status === 403, `invalid token must 403, got ${badRes.status}`)
const badBody = (await badRes.json()) as { error?: string }
assert(badBody.error === 'turnstile_invalid', 'invalid token error key')

const missRes = await handleGuideRequest(
  guideRequest({}, { url: 'https://www.rutinhq.com/api/guide', ip: '198.51.100.22' }),
  secretEnv,
  null,
)
assert(missRes.status === 403, `missing token must 403, got ${missRes.status}`)
const missBody = (await missRes.json()) as { error?: string }
assert(missBody.error === 'turnstile_required', 'missing token error key')

const leadBad = await handleGuideLeadRequest(
  leadRequest(
    { turnstileToken: 'bad-token' },
    { url: 'https://www.rutinhq.com/api/guide/lead', ip: '198.51.100.23' },
  ),
  secretEnv,
)
assert(leadBad.status === 403, 'lead write must verify Turnstile before webhook')

const localOpen = await handleGuideRequest(
  guideRequest({}, { ip: '198.51.100.24' }),
  { NODE_ENV: 'development' },
  null,
)
assert(localOpen.status === 200, 'dev without secret keeps current catalog behavior')

resetGuideRateLimitMemory()
let limited: Response | null = null
for (let i = 0; i < 21; i += 1) {
  const res = await handleGuideRequest(
    guideRequest(
      { turnstileToken: 'valid-token' },
      { url: 'https://www.rutinhq.com/api/guide', ip: '198.51.100.30' },
    ),
    secretEnv,
    null,
  )
  if (res.status === 429) {
    limited = res
    break
  }
}
assert(limited !== null, '21st request from one IP must return 429')
assert(limited.headers.get('Retry-After'), '429 must set Retry-After')
const limitedBody = (await limited.json()) as { error?: string }
assert(limitedBody.error === 'rate_limited', '429 body error key')

const otherIp = await handleGuideRequest(
  guideRequest(
    { turnstileToken: 'valid-token' },
    { url: 'https://www.rutinhq.com/api/guide', ip: '198.51.100.31' },
  ),
  secretEnv,
  null,
)
assert(otherIp.status === 200, 'a different IP must not inherit the 429 bucket')

globalThis.fetch = originalFetch
resetGuideRateLimitMemory()

console.log('guide Turnstile + rate-limit checks passed')
