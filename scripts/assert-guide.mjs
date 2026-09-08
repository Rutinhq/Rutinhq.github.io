import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const kbPath = path.join(root, 'public/guide-kb.json')

if (!fs.existsSync(kbPath)) {
  console.error('public/guide-kb.json missing — run scripts/build-guide-kb.mjs')
  process.exit(1)
}

const kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'))
const policy = kb.policy
if (!policy || policy.uiName !== 'RutinHQ Guide') {
  console.error('guide-kb policy.uiName must be "RutinHQ Guide"')
  process.exit(1)
}
if (policy.calendlyUrl !== 'https://calendly.com/rutinhq/30min') {
  console.error('guide-kb must keep the public Calendly URL')
  process.exit(1)
}
if (policy.email !== 'strategy@rutinhq.com') {
  console.error('guide-kb email must be strategy@rutinhq.com')
  process.exit(1)
}

const requiredPaths = ['/', '/gtm-os', '/store-os', '/nexus-os', '/es']
if (requiredPaths.some((p) => !policy.widgetPaths.includes(p))) {
  console.error('guide widgetPaths must cover hub + LPs (EN/ES)')
  process.exit(1)
}

for (const url of policy.allowlistUrls) {
  const host = new URL(url).hostname
  if (!policy.allowlistHosts.includes(host)) {
    console.error(`allowlist URL host not permitted: ${url}`)
    process.exit(1)
  }
}

const publicBlob = `${JSON.stringify(kb.documents)}${JSON.stringify(policy.fallbackReplies)}${JSON.stringify(policy.uiName)}`
if (/capo/i.test(publicBlob) || /\bfzf\b/i.test(publicBlob) || /fuzzyflags/i.test(publicBlob)) {
  console.error('public guide KB must not mention Capo, FZF, or FuzzyFlags')
  process.exit(1)
}

const uiFiles = [
  'src/components/guide/GuideWidget.tsx',
  'src/components/guide/GuideHost.tsx',
  'src/locales/en.json',
  'src/locales/es.json',
]
for (const rel of uiFiles) {
  const body = fs.readFileSync(path.join(root, rel), 'utf8')
  if (/capo/i.test(body)) {
    console.error(`${rel} must not mention Capo in public UI copy`)
    process.exit(1)
  }
}

if (!kb.documents.some((d) => /GTM OS/.test(d.text))) {
  console.error('guide-kb must include GTM OS facts')
  process.exit(1)
}

console.log('guide-kb + UI name checks passed')
