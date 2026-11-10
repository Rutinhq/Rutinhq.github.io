/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

type TurnstileRenderOptions = {
  sitekey: string
  theme?: 'auto' | 'light' | 'dark'
  size?: 'normal' | 'flexible' | 'compact'
  appearance?: 'always' | 'execute' | 'interaction-only'
  execution?: 'render' | 'execute'
  action?: string
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
  'timeout-callback'?: () => void
  'before-interactive-callback'?: () => void
}

interface TurnstileApi {
  render(container: HTMLElement | string, options: TurnstileRenderOptions): string
  reset(widgetId?: string): void
  remove(widgetId?: string): void
  getResponse(widgetId?: string): string
  execute?(widgetId?: string): void
}

interface Window {
  turnstile?: TurnstileApi
}
