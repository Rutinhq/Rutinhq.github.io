/**
 * CSP3 path-part matching for the Cloudflare Web Analytics beacon.
 * Spec: https://www.w3.org/TR/CSP3/#match-paths
 *
 * A source path WITHOUT a trailing slash is an exact path (same number of
 * segments). `/beacon.min.js` therefore does NOT allow
 * `/beacon.min.js/vce7018…`. A source path WITH a trailing slash is a
 * directory prefix after dropping the empty final segment.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const VERSIONED =
  'https://static.cloudflareinsights.com/beacon.min.js/vce701823e78c4301a35b7e07294d87301792088814092'
const UNVERSIONED = 'https://static.cloudflareinsights.com/beacon.min.js'
const UNRELATED = 'https://static.cloudflareinsights.com/not-beacon.min.js'
const PREFIX = '/beacon.min.js/'
const EXACT = '/beacon.min.js'

/** CSP3 §6.7.2.12 path-part matching. pathA is the source; pathB is the URL path. */
function cspPathPartMatches(pathA, pathB) {
  if (pathA === '') return true
  if (pathA === '/' && pathB === '') return true
  const exactMatch = !pathA.endsWith('/')
  const listA = pathA.split('/')
  const listB = pathB.split('/')
  if (listA.length > listB.length) return false
  if (exactMatch && listA.length !== listB.length) return false
  if (!exactMatch) {
    if (listA[listA.length - 1] !== '') {
      throw new Error(`prefix path-part must end with empty segment: ${pathA}`)
    }
    listA.pop()
  }
  for (let i = 0; i < listA.length; i++) {
    if (decodeURIComponent(listA[i]) !== decodeURIComponent(listB[i])) return false
  }
  return true
}

function urlPath(url) {
  const { pathname } = new URL(url)
  return pathname
}

function assert(cond, message) {
  if (!cond) {
    console.error(message)
    process.exit(1)
  }
}

assert(
  !cspPathPartMatches(EXACT, urlPath(VERSIONED)),
  'CSP3: exact /beacon.min.js must NOT match versioned /beacon.min.js/v…',
)
assert(
  cspPathPartMatches(EXACT, urlPath(UNVERSIONED)),
  'CSP3: exact /beacon.min.js must match unversioned /beacon.min.js',
)
assert(
  cspPathPartMatches(PREFIX, urlPath(VERSIONED)),
  'CSP3: /beacon.min.js/ prefix must match versioned /beacon.min.js/v…',
)
assert(
  !cspPathPartMatches(PREFIX, urlPath(UNVERSIONED)),
  'CSP3: /beacon.min.js/ prefix does NOT match unversioned /beacon.min.js (empty trailing segment makes A longer) — both sources are required',
)
assert(
  !cspPathPartMatches(PREFIX, urlPath(UNRELATED)),
  'CSP3: /beacon.min.js/ must not match unrelated /not-beacon.min.js',
)
assert(
  !cspPathPartMatches(PREFIX, '/other.js'),
  'CSP3: /beacon.min.js/ must not match /other.js',
)
assert(
  !cspPathPartMatches(PREFIX, '/beacon.min.js.bak'),
  'CSP3: /beacon.min.js/ must not match /beacon.min.js.bak',
)

const headers = fs.readFileSync('public/_headers', 'utf8')
const cspLine = headers.match(/Content-Security-Policy:\s*(.+)/i)
assert(cspLine, `public/_headers must set Content-Security-Policy`)
const scriptSrc = cspLine[1].match(/script-src\s+([^;]+)/i)?.[1]?.trim() || ''
assert(
  /https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js(?:\s|$)/.test(scriptSrc),
  'public/_headers script-src must include exact unversioned beacon.min.js',
)
assert(
  scriptSrc.includes('https://static.cloudflareinsights.com/beacon.min.js/'),
  'public/_headers script-src must include /beacon.min.js/ directory prefix',
)
assert(!/'unsafe-inline'/.test(scriptSrc), 'public/_headers script-src must not include unsafe-inline')
assert(!/unsafe-eval/.test(cspLine[1]), 'public/_headers CSP must not include unsafe-eval')
assert(!/\*/.test(scriptSrc), 'public/_headers script-src must not use wildcards')
assert(
  !/https:\/\/static\.cloudflareinsights\.com(?:\s|;|$)/.test(cspLine[1]),
  'public/_headers must not allow the whole static.cloudflareinsights.com host',
)

const chrome =
  process.env.CHROME_BIN ||
  ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/local/bin/google-chrome'].find(
    (bin) => fs.existsSync(bin),
  )
assert(chrome, 'google-chrome is required for CSP enforcement (no box attach)')

const collectorJs = `
const blocked = [];
document.addEventListener('securitypolicyviolation', (event) => {
  const directive = String(event.effectiveDirective || event.violatedDirective || '');
  if (directive.startsWith('script-src')) blocked.push(event.blockedURI);
  render();
});
const targets = ${JSON.stringify({ VERSIONED, UNRELATED })};
function render() {
  document.documentElement.dataset.csp = JSON.stringify({ blocked });
  const out = document.getElementById('out');
  if (out) out.textContent = document.documentElement.dataset.csp;
}
function load(src) {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = src;
  script.onload = render;
  script.onerror = render;
  document.head.appendChild(script);
}
load(targets.VERSIONED);
load(targets.UNRELATED);
setTimeout(render, 2500);
render();
`

function serve(csp) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/collector.js') {
        res.writeHead(200, {
          'content-type': 'application/javascript; charset=utf-8',
          'cache-control': 'no-store',
        })
        res.end(collectorJs)
        return
      }
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'content-security-policy': csp,
        'cache-control': 'no-store',
      })
      res.end(`<!doctype html><html><head>
<script src="/collector.js"></script>
</head><body><pre id="out">{}</pre></body></html>`)
    })
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ server, url: `http://127.0.0.1:${port}/` })
    })
  })
}

function runChrome(url) {
  const userDataDir = fs.mkdtempSync(path.join('/tmp', 'csp-beacon-'))
  return new Promise((resolve, reject) => {
    const child = spawn(
      chrome,
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--user-data-dir=${userDataDir}`,
        '--virtual-time-budget=8000',
        '--timeout=15000',
        '--dump-dom',
        url,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    let out = ''
    let err = ''
    child.stdout.on('data', (chunk) => {
      out += chunk
    })
    child.stderr.on('data', (chunk) => {
      err += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      resolve({ code, out, err })
    })
  })
}

function parseBlocked(html) {
  const data = html.match(/data-csp="([^"]*)"/)
  const pre = html.match(/<pre id="out">([^<]*)<\/pre>/)
  const raw = data ? data[1].replaceAll('&quot;', '"') : pre ? pre[1] : ''
  if (!raw) return { blocked: [] }
  try {
    return JSON.parse(raw)
  } catch {
    return { blocked: [] }
  }
}

function blocked(result, uri) {
  return (result.blocked || []).some((item) => item === uri || item.startsWith(uri))
}

const productionCsp =
  "default-src 'none'; script-src 'self' https://static.cloudflareinsights.com/beacon.min.js https://static.cloudflareinsights.com/beacon.min.js/"
const exactOnlyCsp =
  "default-src 'none'; script-src 'self' https://static.cloudflareinsights.com/beacon.min.js"

const prod = await serve(productionCsp)
const old = await serve(exactOnlyCsp)
try {
  const [prodRun, oldRun] = await Promise.all([runChrome(prod.url), runChrome(old.url)])
  assert(prodRun.code === 0, `chrome production CSP dump failed (${prodRun.code}): ${prodRun.err}`)
  assert(oldRun.code === 0, `chrome exact-only CSP dump failed (${oldRun.code}): ${oldRun.err}`)
  const prodResult = parseBlocked(prodRun.out)
  const oldResult = parseBlocked(oldRun.out)
  assert(
    !blocked(prodResult, VERSIONED),
    `Chrome must ALLOW versioned beacon under /beacon.min.js/ prefix (blocked=${JSON.stringify(prodResult.blocked)})`,
  )
  assert(
    blocked(prodResult, UNRELATED),
    `Chrome must DENY unrelated script on the insights host (blocked=${JSON.stringify(prodResult.blocked)})`,
  )
  assert(
    blocked(oldResult, VERSIONED),
    `Chrome must DENY versioned beacon under exact /beacon.min.js with no trailing slash (blocked=${JSON.stringify(oldResult.blocked)})`,
  )
  console.log(
    'CSP beacon: spec path-part + Chrome headless — versioned /vce7018… allowed by /beacon.min.js/; unrelated script denied; exact-only policy still blocks versioned.',
  )
} finally {
  prod.server.close()
  old.server.close()
}
