import fs from 'node:fs'
import path from 'node:path'

const CALENDLY = 'https://calendly.com/rutinhq/30min'
const FORBIDDEN_HREF = /^(mailto:|\/cdn-cgi\/l\/email-protection)/i
const BUTTON_PRIMARY = /bg-primary/
const TALK_LABEL = /Talk to RutinHQ|Hablar con RutinHQ|\bTalk\b|\bHablar\b/

const SOURCE_FILES = [
  'src/layouts/parts/Header.tsx',
  'src/layouts/parts/Footer.tsx',
  'src/components/Ctas.tsx',
]

const SHELLS = [
  'dist/index.html',
  'dist/prerender/es.html',
  'dist/prerender/gtm-os.html',
  'dist/prerender/store-os.html',
  'dist/prerender/nexus-os.html',
  'dist/prerender/es-gtm-os.html',
  'dist/prerender/es-store-os.html',
  'dist/prerender/es-nexus-os.html',
  'dist/prerender/blog.html',
  'dist/prerender/es-blog.html',
  'dist/prerender/agents.html',
  'dist/prerender/es-agents.html',
]

function fail(message) {
  console.error(message)
  process.exit(1)
}

function anchors(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => {
    const attrs = match[1]
    const href = (attrs.match(/\bhref=["']([^"']+)["']/i) || [])[1] || ''
    const className = (attrs.match(/\bclass=["']([^"']*)["']/i) || [])[1] || ''
    const text = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    return { href, className, text, raw: match[0] }
  })
}

function isPrimaryCta(anchor) {
  if (BUTTON_PRIMARY.test(anchor.className) && TALK_LABEL.test(anchor.text)) {
    return true
  }
  if (TALK_LABEL.test(anchor.text) && !anchor.className.includes('underline')) {
    return true
  }
  return false
}

for (const file of SOURCE_FILES) {
  const source = fs.readFileSync(file, 'utf8')
  if (!source.includes('CALENDLY_URL')) {
    fail(`${file} primary Talk CTA must use CALENDLY_URL.`)
  }
  if (file.includes('Ctas.tsx')) {
    const emailLinkIdx = source.indexOf('<EmailLink')
    const primaryBlock = emailLinkIdx >= 0 ? source.slice(0, emailLinkIdx) : source
    if (/href=\{mailtoHref\}/.test(primaryBlock)) {
      fail(`${file} primary button must not bind href to mailtoHref.`)
    }
    if (!/href=\{CALENDLY_URL\}/.test(primaryBlock)) {
      fail(`${file} primary button must bind href to CALENDLY_URL.`)
    }
  }
  if (/href=\{talkMailtoForPath/.test(source)) {
    fail(`${file} must not point a Talk CTA at talkMailtoForPath.`)
  }
}

const emailLink = fs.readFileSync('src/components/EmailLink.tsx', 'utf8')
if (!emailLink.includes('<!--email_off-->') || !emailLink.includes('<!--/email_off-->')) {
  fail('src/components/EmailLink.tsx must emit Cloudflare email_off comments.')
}

for (const file of SHELLS) {
  if (!fs.existsSync(file)) {
    fail(`${file} missing — cannot assert primary CTAs.`)
  }
  const html = fs.readFileSync(file, 'utf8')
  if (html.includes('/cdn-cgi/l/email-protection')) {
    fail(`${file} must not emit /cdn-cgi/l/email-protection on any href.`)
  }

  const primary = anchors(html).filter(isPrimaryCta)
  if (primary.length === 0) {
    fail(`${file} must render at least one Talk/Hablar primary CTA.`)
  }

  for (const anchor of primary) {
    if (FORBIDDEN_HREF.test(anchor.href)) {
      fail(
        `${file} primary CTA must not be mailto or email-protection (got ${anchor.href} — ${anchor.text}).`,
      )
    }
    if (anchor.href !== CALENDLY) {
      fail(`${file} primary CTA must be ${CALENDLY} (got ${anchor.href} — ${anchor.text}).`)
    }
  }

  const filledButtons = anchors(html).filter((anchor) =>
    BUTTON_PRIMARY.test(anchor.className),
  )
  for (const anchor of filledButtons) {
    if (FORBIDDEN_HREF.test(anchor.href)) {
      fail(
        `${file} button-styled link must not be mailto or email-protection (got ${anchor.href}).`,
      )
    }
  }

  const mailtos = [...html.matchAll(/<a\b[^>]*\bhref=["']mailto:[^"']+["'][^>]*>/gi)]
  for (const match of mailtos) {
    const idx = match.index ?? html.indexOf(match[0])
    const before = html.slice(Math.max(0, idx - 200), idx)
    if (!before.includes('<!--email_off-->')) {
      fail(`${path.basename(file)} mailto ${match[0]} must sit after <!--email_off-->.`)
    }
  }

  if (!html.includes('<!--email_off-->') || !html.includes('<!--/email_off-->')) {
    fail(`${file} must wrap remaining email links in Cloudflare email_off comments.`)
  }

  if (file.endsWith('index.html') || file.endsWith('/es.html')) {
    const emailLine = file.endsWith('/es.html') ? 'o escríbenos a' : 'or email'
    if (!html.includes(emailLine)) {
      fail(`${file} must keep the secondary «${emailLine}» line next to Talk.`)
    }
  }
}

console.log('primary CTA: Calendly on Talk/Hablar buttons; mailto only as email_off secondary.')
