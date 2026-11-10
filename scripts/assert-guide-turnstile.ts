/**
 * Unit tests for useGuideTurnstile: render is tied to host mount (callback ref
 * → controller.attach), not hook mount, and reset runs after consume.
 */
import {
  createGuideTurnstileController,
  GUIDE_TURNSTILE_ALWAYS_INTERACTIVE_SITE_KEY,
  GUIDE_TURNSTILE_TOKEN_WAIT_MS,
  resolveGuideTurnstileSiteKey,
  sendGuideWithTurnstile,
  shouldPostGuideAfterTurnstile,
  type GuideTurnstileApi,
  type GuideTurnstileClock,
  type GuideTurnstileRenderOptions,
} from '../src/components/guide/useGuideTurnstile.ts'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error(msg)
    process.exit(1)
  }
}

type WidgetRecord = {
  id: string
  node: HTMLElement
  options: GuideTurnstileRenderOptions
  token: string
  removed: boolean
  resetCount: number
}

function mockTurnstile(autoIssue = true) {
  const widgets = new Map<string, WidgetRecord>()
  const renderCalls: HTMLElement[] = []
  let n = 0

  const issue = (widget: WidgetRecord, token: string) => {
    widget.token = token
    widget.options.callback?.(token)
  }

  const api: GuideTurnstileApi = {
    render(container, options) {
      const node = container as HTMLElement
      renderCalls.push(node)
      const id = `w${++n}`
      const widget: WidgetRecord = {
        id,
        node,
        options,
        token: '',
        removed: false,
        resetCount: 0,
      }
      widgets.set(id, widget)
      if (autoIssue) issue(widget, `token-${id}`)
      return id
    },
    reset(widgetId) {
      const widget = widgetId ? widgets.get(widgetId) : undefined
      if (!widget || widget.removed) return
      widget.resetCount += 1
      issue(widget, `token-${widget.id}-r${widget.resetCount}`)
    },
    remove(widgetId) {
      const widget = widgetId ? widgets.get(widgetId) : undefined
      if (widget) widget.removed = true
    },
    getResponse(widgetId) {
      const widget = widgetId ? widgets.get(widgetId) : undefined
      if (!widget || widget.removed) return ''
      return widget.token
    },
  }

  return { api, widgets, renderCalls }
}

function host(): HTMLDivElement {
  return { id: 'turnstile-host' } as HTMLDivElement
}

const siteKey = '0x-test-site-key'

function controllerOf(
  api: GuideTurnstileApi,
  extra?: {
    loadScript?: () => Promise<void>
    tokenWaitMs?: number
    clock?: GuideTurnstileClock
  },
) {
  return createGuideTurnstileController({
    getSiteKey: () => siteKey,
    loadScript: extra?.loadScript ?? (async () => {}),
    getApi: () => api,
    tokenWaitMs: extra?.tokenWaitMs ?? 500,
    clock: extra?.clock,
  })
}

function createFakeClock(): GuideTurnstileClock & { advance: (ms: number) => Promise<void> } {
  let now = 0
  const waiters: { at: number; resolve: () => void }[] = []
  return {
    now: () => now,
    sleep(ms: number) {
      return new Promise<void>((resolve) => {
        waiters.push({ at: now + ms, resolve })
      })
    },
    async advance(ms: number) {
      const target = now + ms
      while (true) {
        await Promise.resolve()
        await Promise.resolve()
        const due = waiters.filter((w) => w.at <= now)
        if (due.length) {
          waiters.splice(0, waiters.length, ...waiters.filter((w) => w.at > now))
          due.sort((a, b) => a.at - b.at).forEach((w) => w.resolve())
          continue
        }
        if (now >= target) break
        const nextAt = waiters.reduce((min, w) => Math.min(min, w.at), Number.POSITIVE_INFINITY)
        if (!Number.isFinite(nextAt) || nextAt > target) {
          now = target
          break
        }
        now = nextAt
      }
    },
  }
}

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

async function main() {
  {
    const { api, widgets, renderCalls } = mockTurnstile()
    const controller = controllerOf(api)
    assert(renderCalls.length === 0, 'must not render before host mounts')
    controller.attach(null)
    await flush()
    assert(renderCalls.length === 0, 'attach(null) must not render')
    const node = host()
    controller.attach(node)
    await flush()
    assert(renderCalls.length === 1, 'render must run once the host mounts')
    assert(renderCalls[0] === node, 'render target is the mounted host')
    const widget = [...widgets.values()][0]
    assert(widget.options.sitekey === siteKey, 'explicit render keeps sitekey')
    assert(widget.options.appearance === 'interaction-only', 'appearance interaction-only')
    assert(widget.options.size === 'flexible', 'size flexible')
    assert(widget.options.action === 'guide', 'action guide')
    assert(typeof widget.options.callback === 'function', 'success callback')
    assert(typeof widget.options['expired-callback'] === 'function', 'expired callback')
    assert(typeof widget.options['error-callback'] === 'function', 'error callback')
    controller.dispose()
  }

  {
    let resolveScript: () => void = () => {}
    const loadScript = () =>
      new Promise<void>((resolve) => {
        resolveScript = resolve
      })
    const { api, renderCalls } = mockTurnstile()
    const controller = controllerOf(api, { loadScript, tokenWaitMs: 1_000 })
    controller.attach(host())
    await flush()
    assert(renderCalls.length === 0, 'render waits for api.js')
    const pending = controller.consumeToken()
    resolveScript()
    const token = await pending
    assert(renderCalls.length === 1, 'render runs after script + host mount')
    assert(token === 'token-w1', `consumeToken must return the first token, got ${token}`)
    controller.dispose()
  }

  {
    const { api, widgets } = mockTurnstile()
    const controller = controllerOf(api)
    controller.attach(host())
    const first = await controller.consumeToken()
    const second = await controller.consumeToken()
    const third = await controller.consumeToken()
    const widget = [...widgets.values()][0]
    assert(first === 'token-w1', `first token, got ${first}`)
    assert(second === 'token-w1-r1', `reset token after first consume, got ${second}`)
    assert(third === 'token-w1-r2', `reset token after second consume, got ${third}`)
    assert(widget.resetCount === 3, `reset after each consume, got ${widget.resetCount}`)
    controller.dispose()
  }

  {
    const { api, widgets, renderCalls } = mockTurnstile()
    const controller = controllerOf(api)
    controller.attach(host())
    await flush()
    controller.attach(null)
    await flush()
    const secondHost = host()
    controller.attach(secondHost)
    await flush()
    assert(renderCalls.length === 2, 'reopen renders a new widget')
    const [first, second] = [...widgets.values()]
    assert(first.removed, 'closed widget must be removed')
    assert(!second.removed, 'reopened widget stays mounted')
    assert(second.node === secondHost, 'new widget targets the new host')
    controller.dispose()
    assert(second.removed, 'dispose removes the live widget')
  }

  {
    const { api, widgets } = mockTurnstile(false)
    const controller = controllerOf(api, { tokenWaitMs: 800 })
    controller.attach(host())
    await flush()
    const pending = controller.consumeToken()
    setTimeout(() => {
      const widget = [...widgets.values()][0]
      widget.options.callback?.('late-tick')
    }, 120)
    const token = await pending
    assert(token === 'late-tick', `late checkbox callback must send, got ${token}`)
    controller.dispose()
  }

  {
    const { api } = mockTurnstile(false)
    const controller = controllerOf(api, { tokenWaitMs: 250 })
    controller.attach(host())
    await flush()
    const token = await controller.consumeToken()
    assert(token === undefined, 'timeout with no tick must not invent a token')
    controller.dispose()
  }

  assert(GUIDE_TURNSTILE_TOKEN_WAIT_MS === 20_000, 'wait up to ~20s for the checkbox')
  assert(
    GUIDE_TURNSTILE_ALWAYS_INTERACTIVE_SITE_KEY === '3x00000000000000000000FF',
    'Cloudflare always-interactive dummy site key',
  )

  const prodKey = '0x4AAAAAAF6-kFpM12bv15mT'
  const interactive = '?ts=interactive'
  assert(
    resolveGuideTurnstileSiteKey(prodKey, '42402de1.rutinhq-web.pages.dev', interactive) ===
      GUIDE_TURNSTILE_ALWAYS_INTERACTIVE_SITE_KEY,
    'preview host may swap in the interactive dummy key',
  )
  assert(
    resolveGuideTurnstileSiteKey(prodKey, '42402de1.rutinhq-web.pages.dev', '') === prodKey,
    'preview without ?ts=interactive keeps the real site key',
  )
  assert(
    resolveGuideTurnstileSiteKey(prodKey, 'rutinhq.com', interactive) === prodKey,
    'rutinhq.com must never use the dummy key',
  )
  assert(
    resolveGuideTurnstileSiteKey(prodKey, 'www.rutinhq.com', interactive) === prodKey,
    'www.rutinhq.com must never use the dummy key',
  )
  assert(
    resolveGuideTurnstileSiteKey(prodKey, 'rutinhq-web.pages.dev', interactive) === prodKey,
    'Pages production alias must never use the dummy key',
  )

  assert(
    shouldPostGuideAfterTurnstile({ siteKey: prodKey, token: 'tok' }).post === true,
    'token present → POST once',
  )
  assert(
    shouldPostGuideAfterTurnstile({ siteKey: prodKey, token: undefined }).post === false &&
      shouldPostGuideAfterTurnstile({ siteKey: prodKey, token: undefined }).timedOut === true,
    'no token after wait → skip POST (local degraded, question kept)',
  )
  assert(
    shouldPostGuideAfterTurnstile({ siteKey: undefined, token: undefined }).post === true,
    'unset site key still posts (local fail-open)',
  )

  {
    const clock = createFakeClock()
    const { api, widgets } = mockTurnstile(false)
    const controller = controllerOf(api, { tokenWaitMs: GUIDE_TURNSTILE_TOKEN_WAIT_MS, clock })
    controller.attach(host())
    await flush()
    const posted: string[] = []
    const send = sendGuideWithTurnstile({
      consumeToken: () => controller.consumeToken(),
      siteKey,
      post: async (token) => {
        posted.push(token || '')
      },
    })
    await clock.advance(5_000)
    assert(posted.length === 0, 'must not POST before the checkbox callback')
    const widget = [...widgets.values()][0]
    widget.options.callback?.('tok-at-5s')
    await clock.advance(200)
    const result = await send
    assert(result.ok === true, 't=5s callback must not fall to token_wait_timeout')
    assert(
      result.ok && result.token === 'tok-at-5s',
      `request must use the t=5s token, got ${result.ok ? result.token : result.reason}`,
    )
    assert(posted.length === 1 && posted[0] === 'tok-at-5s', 'single send with the t=5s token')
    controller.dispose()
  }

  console.log('guide Turnstile hook checks passed')
}

void main()
