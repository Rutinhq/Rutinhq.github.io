/**
 * Preview-only diagnostics. Never true on production hosts
 * (`rutinhq.com` / `www.rutinhq.com` / the Pages production alias
 * `rutinhq-web.pages.dev`).
 */
export function isGuidePreviewHost(hostname: string): boolean {
  const host = String(hostname || '')
    .trim()
    .toLowerCase()
    .split(':')[0]
  if (!host) return false
  if (host === 'rutinhq.com' || host === 'www.rutinhq.com') return false
  if (host === 'rutinhq-web.pages.dev') return false
  return host.endsWith('.rutinhq-web.pages.dev')
}

export function guideRequestHostname(request: Request): string {
  try {
    return new URL(request.url).hostname
  } catch {
    return (request.headers.get('host') || '').split(':')[0]
  }
}
