/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

type TurnstileRenderOptions = {
  sitekey: string
  theme?: 'auto' | 'light' | 'dark'
  size?: 'normal' | 'flexible' | 'compact'
  appearance?: 'always' | 'execute' | 'interaction-only'
  action?: string
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

interface TurnstileApi {
  render(container: HTMLElement | string, options: TurnstileRenderOptions): string
  reset(widgetId?: string): void
  remove(widgetId?: string): void
  getResponse(widgetId?: string): string
}

interface Window {
  turnstile?: TurnstileApi
}
