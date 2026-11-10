/**
 * Unit tests for useGuideTurnstile: render is tied to host mount (callback ref
 * → controller.attach), not hook mount, and reset runs after consume.
 */
import {
  createGuideTurnstileController,
  type GuideTurnstileApi,
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

function mockTurnstile() {
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
      issue(widget, `token-${id}`)
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
  extra?: { loadScript?: () => Promise<void>; tokenWaitMs?: number },
) {
  return createGuideTurnstileController({
    getSiteKey: () => siteKey,
    loadScript: extra?.loadScript ?? (async () => {}),
    getApi: () => api,
    tokenWaitMs: extra?.tokenWaitMs ?? 500,
  })
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

  console.log('guide Turnstile hook checks passed')
}

void main()
