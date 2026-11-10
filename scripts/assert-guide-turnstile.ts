/**
 * Unit tests for useGuideTurnstile: render is tied to host mount (callback ref
 * → controller.attach), not hook mount, and reset runs after consume.
 */
import {
  armGuideTurnstileHost,
  createGuideTurnstileController,
  formatGuideTurnstileTimeoutReason,
  GUIDE_TURNSTILE_ALWAYS_INTERACTIVE_SITE_KEY,
  GUIDE_TURNSTILE_HOST_MIN_HEIGHT_PX,
  GUIDE_TURNSTILE_TOKEN_WAIT_MS,
  resolveGuideTurnstileSiteKey,
  sendGuideWithTurnstile,
  shouldPostGuideAfterTurnstile,
  type GuideTurnstileApi,
  type GuideTurnstileChallengeUi,
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
  executeCount: number
}

function mockTurnstile(autoIssue = true, extra?: { autoIssueLimit?: number }) {
  const widgets = new Map<string, WidgetRecord>()
  const renderCalls: HTMLElement[] = []
  const executeCalls: string[] = []
  let n = 0
  const autoIssueLimit = extra?.autoIssueLimit ?? Number.POSITIVE_INFINITY

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
        executeCount: 0,
      }
      widgets.set(id, widget)
      if (autoIssue && options.execution !== 'execute') issue(widget, `token-${id}`)
      return id
    },
    reset(widgetId) {
      const widget = widgetId ? widgets.get(widgetId) : undefined
      if (!widget || widget.removed) return
      widget.resetCount += 1
      widget.token = ''
      // execution=execute: reset must NOT start the next challenge.
      if (autoIssue && widget.options.execution !== 'execute') {
        issue(widget, `token-${widget.id}-r${widget.resetCount}`)
      }
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
    execute(widgetId) {
      const widget = widgetId ? widgets.get(widgetId) : undefined
      if (!widget || widget.removed) return
      widget.executeCount += 1
      executeCalls.push(widget.id)
      if (autoIssue && widget.executeCount <= autoIssueLimit) {
        issue(widget, `token-${widget.id}-e${widget.executeCount}`)
      }
    },
  }

  return { api, widgets, renderCalls, executeCalls }
}

function host(init?: { hidden?: boolean; display?: string; visibility?: string }): HTMLDivElement {
  const classes = new Set<string>()
  const style: Record<string, string> = {
    display: init?.display ?? '',
    visibility: init?.visibility ?? '',
    minHeight: '',
    minWidth: '',
    height: '',
    width: '',
    overflow: '',
  }
  const el = {
    id: 'turnstile-host',
    hidden: Boolean(init?.hidden),
    style,
    classList: {
      add: (name: string) => {
        classes.add(name)
      },
      remove: (name: string) => {
        classes.delete(name)
      },
      contains: (name: string) => classes.has(name),
    },
    removeAttribute(name: string) {
      if (name === 'hidden') el.hidden = false
    },
  }
  return el as unknown as HTMLDivElement
}

const siteKey = '0x-test-site-key'

function controllerOf(
  api: GuideTurnstileApi,
  extra?: {
    loadScript?: () => Promise<void>
    tokenWaitMs?: number
    clock?: GuideTurnstileClock
    onChallengeUi?: (ui: GuideTurnstileChallengeUi) => void
  },
) {
  return createGuideTurnstileController({
    getSiteKey: () => siteKey,
    loadScript: extra?.loadScript ?? (async () => {}),
    getApi: () => api,
    tokenWaitMs: extra?.tokenWaitMs ?? 500,
    clock: extra?.clock,
    onChallengeUi: extra?.onChallengeUi,
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
    assert(widget.options.appearance === 'interaction-only', 'appearance interaction-only until a real checkbox')
    assert(widget.options.theme === 'dark', 'theme dark matches the panel')
    assert(widget.options.execution === 'execute', 'execution execute — challenge starts at send')
    assert(widget.options.size === 'normal', 'size normal (300×65)')
    assert(
      typeof widget.options['before-interactive-callback'] === 'function',
      'before-interactive-callback sizes the host before paint',
    )
    assert(widget.options.action === 'guide', 'action guide')
    assert(typeof widget.options.callback === 'function', 'success callback')
    assert(typeof widget.options['expired-callback'] === 'function', 'expired callback')
    assert(typeof widget.options['error-callback'] === 'function', 'error callback')
    assert(typeof widget.options['timeout-callback'] === 'function', 'timeout callback re-executes')
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
    assert(token === 'token-w1-e1', `consumeToken must return the first token, got ${token}`)
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
    assert(first === 'token-w1-e1', `first token, got ${first}`)
    assert(second === 'token-w1-e2', `execute token after first consume+reset, got ${second}`)
    assert(third === 'token-w1-e3', `execute token after second consume+reset, got ${third}`)
    assert(widget.resetCount === 3, `reset after each consume, got ${widget.resetCount}`)
    assert(widget.executeCount === 3, `execute at each send, got ${widget.executeCount}`)
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

  assert(
    formatGuideTurnstileTimeoutReason(20_000, false) === 'token_wait_timeout',
    'prod degraded note stays token_wait_timeout',
  )
  assert(
    formatGuideTurnstileTimeoutReason(20_000, true) === 'token_wait_timeout@20.0s',
    'preview degraded note includes elapsed wait',
  )
  assert(
    formatGuideTurnstileTimeoutReason(8_250, true) === 'token_wait_timeout@8.3s',
    'preview elapsed is one decimal second',
  )

  {
    const clock = createFakeClock()
    const { api, widgets } = mockTurnstile(true, { autoIssueLimit: 2 })
    const controller = controllerOf(api, { tokenWaitMs: GUIDE_TURNSTILE_TOKEN_WAIT_MS, clock })
    controller.attach(host())
    await flush()
    const posted: string[] = []
    const send = (label: string) =>
      sendGuideWithTurnstile({
        consumeToken: () => controller.consumeToken(),
        siteKey,
        now: () => clock.now(),
        post: async (token) => {
          posted.push(`${label}:${token || ''}`)
        },
      })

    const q1 = await send('q1')
    assert(q1.ok === true, 'Q1 invisible token must POST')
    const q2 = await send('q2')
    assert(q2.ok === true, 'Q2 invisible token must POST')
    assert(
      posted.join(',') === 'q1:token-w1-e1,q2:token-w1-e2',
      `Q1+Q2 must each POST once, got ${posted.join(',')}`,
    )

    const q3 = send('q3')
    await flush()
    await clock.advance(8_000)
    assert(
      posted.filter((row) => row.startsWith('q3:')).length === 0,
      'Q3 must not POST before the interactive callback',
    )
    const widget = [...widgets.values()].filter((w) => !w.removed)[0]
    assert(widget.executeCount === 3, `Q3 execute starts at send, got ${widget.executeCount}`)
    widget.options.callback?.('tok-q3-at-8s')
    await clock.advance(200)
    const result = await q3
    assert(result.ok === true, 'Q3 t=8s callback must not fall to token_wait_timeout')
    assert(
      result.ok && result.token === 'tok-q3-at-8s',
      `Q3 must POST the t=8s token, got ${result.ok ? result.token : result.reason}`,
    )
    assert(
      posted.filter((row) => row === 'q3:tok-q3-at-8s').length === 1 && posted.length === 3,
      `Q1–Q3 must be three single sends, got ${posted.join(',')}`,
    )
    controller.dispose()
  }

  {
    const { api, widgets } = mockTurnstile(false)
    const controller = controllerOf(api, { tokenWaitMs: 2_000 })
    const node = host({ hidden: true, display: 'none', visibility: 'hidden' })
    node.style.minHeight = '0px'
    controller.attach(node)
    await flush()
    const pending = controller.consumeToken()
    await flush()
    assert(
      parseInt(node.style.minHeight, 10) === 0,
      'host stays collapsed until before-interactive-callback',
    )
    const widget = [...widgets.values()][0]
    widget.options['before-interactive-callback']?.()
    assert(node.hidden === false, 'interactive wait unhides a hidden host')
    assert(node.style.display === 'block', 'armed host is display:block')
    assert(node.style.visibility === 'visible', 'armed host is visibility:visible')
    assert(
      parseInt(node.style.minHeight, 10) >= GUIDE_TURNSTILE_HOST_MIN_HEIGHT_PX,
      'armed host has checkbox min-height before paint',
    )
    assert(node.classList.contains('guide-turnstile-armed'), 'armed class is set')
    widget.options.callback?.('tok-unhidden')
    assert((await pending) === 'tok-unhidden', 'token still resolves after unhiding')
    controller.dispose()
  }

  {
    const { api, widgets } = mockTurnstile(false)
    const controller = controllerOf(api, { tokenWaitMs: 5_000 })
    controller.attach(host())
    await flush()
    const pending = controller.consumeToken()
    await flush()
    const widget = [...widgets.values()][0]
    const execBefore = widget.executeCount
    const resetBefore = widget.resetCount
    widget.options['error-callback']?.()
    await flush()
    assert(widget.resetCount === resetBefore + 1, 'error-callback resets once')
    assert(widget.executeCount === execBefore + 1, 'error-callback execute retries once')
    widget.options['error-callback']?.()
    await flush()
    assert(widget.resetCount === resetBefore + 1, 'second error does not retry again')
    assert(widget.executeCount === execBefore + 1, 'second error does not execute again')
    widget.options.callback?.('tok-after-retry')
    assert((await pending) === 'tok-after-retry', 'retry token resolves the wait')
    controller.dispose()
  }

  {
    const node = host({ hidden: true, display: 'none' })
    armGuideTurnstileHost(node)
    assert(node.hidden === false && node.style.visibility === 'visible', 'armGuideTurnstileHost unhides')
    assert(parseInt(node.style.minHeight, 10) >= GUIDE_TURNSTILE_HOST_MIN_HEIGHT_PX, 'arm sets minHeight')
  }

  {
    const ui: GuideTurnstileChallengeUi[] = []
    const { api } = mockTurnstile(true)
    const controller = controllerOf(api, { onChallengeUi: (state) => ui.push(state) })
    controller.attach(host())
    await flush()
    const token = await controller.consumeToken()
    assert(Boolean(token), 'invisible pass still returns a token')
    assert(ui.includes('verifying'), 'wait starts as verifying')
    assert(!ui.includes('interactive'), 'no tick note before before-interactive-callback')
    controller.dispose()
  }

  {
    const ui: GuideTurnstileChallengeUi[] = []
    const node = host()
    const { api, widgets } = mockTurnstile(false)
    const controller = controllerOf(api, { onChallengeUi: (state) => ui.push(state) })
    controller.attach(node)
    await flush()
    const pending = controller.consumeToken()
    await flush()
    assert(ui[ui.length - 1] === 'verifying', 'pre-checkbox wait is verifying')
    assert(!ui.includes('interactive'), 'tick note is absent until before-interactive-callback')
    assert(!node.classList.contains('guide-turnstile-armed'), 'host stays collapsed while verifying')
    const widget = [...widgets.values()][0]
    widget.options['before-interactive-callback']?.()
    assert(ui.includes('interactive'), 'tick note appears after before-interactive-callback')
    assert(node.classList.contains('guide-turnstile-armed'), 'host is armed before the checkbox paints')
    assert(
      parseInt(node.style.minHeight, 10) >= GUIDE_TURNSTILE_HOST_MIN_HEIGHT_PX,
      'armed host is full size before paint',
    )
    widget.options.callback?.('tok-after-box')
    assert((await pending) === 'tok-after-box', 'interactive token still resolves')
    controller.dispose()
  }

  console.log('guide Turnstile hook checks passed')
}

void main()
