import fs from 'node:fs'
import path from 'node:path'

function mainInner(html) {
  const match = html.match(/<main\b[^>]*id="main-content"[^>]*>([\s\S]*?)<\/main>/i)
  return match ? match[1] : ''
}

function textOf(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const shells = [
  {
    file: 'dist/index.html',
    h1: 'Systems you own — not retainers that vanish.',
  },
  {
    file: 'dist/prerender/gtm-os.html',
    h1: 'Outbound that stays yours.',
  },
  {
    file: 'dist/prerender/store-os.html',
    h1: 'Make the store convert before you buy ads.',
  },
  {
    file: 'dist/prerender/nexus-os.html',
    h1: 'Agentic marketing — paper first, Ads only when signed.',
  },
  {
    file: 'dist/prerender/es.html',
    h1: 'Sistemas que usted posee — no iguala mensual que desaparece.',
  },
  {
    file: 'dist/prerender/es-gtm-os.html',
    h1: 'Prospección en frío que se queda con usted.',
  },
  {
    file: 'dist/prerender/es-store-os.html',
    h1: 'Haga que la tienda convierta antes de comprar anuncios.',
  },
  {
    file: 'dist/prerender/es-nexus-os.html',
    h1: 'Marketing agéntico — primero en papel, anuncios solo con GO.',
  },
  {
    file: 'dist/prerender/blog.html',
    h1: 'Systems you own — filtered for founders who install, not rent',
  },
  {
    file: 'dist/prerender/blog-icp-gated-cold-outbound-without-rented-sdr.html',
    h1: 'ICP-gated cold outbound without a rented SDR',
  },
  {
    file: 'dist/prerender/blog-shopify-admin-audit-before-ads.html',
    h1: 'Shopify Admin audit before you buy ads',
  },
  {
    file: 'dist/prerender/es-blog.html',
    h1: 'Sistemas que usted posee — filtrados para fundadores que instalan, no rentan',
  },
  {
    file: 'dist/prerender/es-blog-outbound-frio-con-icp-sin-sdr-rentado.html',
    h1: 'Prospección en frío con perfil de cliente ideal (ICP) — sin SDR rentado',
  },
  {
    file: 'dist/prerender/agents.html',
    h1: 'Public surfaces agents can read.',
  },
  {
    file: 'dist/prerender/agents-auth.html',
    h1: 'Public vs authenticated.',
  },
  {
    file: 'dist/prerender/es-agents.html',
    h1: 'Superficies públicas que un agente puede leer.',
  },
  {
    file: 'dist/prerender/es-agents-auth.html',
    h1: 'Público vs autenticado.',
  },
  {
    file: 'dist/404.html',
    h1: 'Page not found',
  },
]

const prerenderDir = 'dist/prerender'
const prerenderFiles = fs.existsSync(prerenderDir)
  ? fs.readdirSync(prerenderDir).filter((name) => name.endsWith('.html'))
  : []
const listed = new Set(shells.map((s) => path.basename(s.file)))
listed.add('index.html')
listed.add('404.html')
for (const name of prerenderFiles) {
  if (!listed.has(name)) {
    console.error(`assert-ssr-main missing prerender shell ${name}`)
    process.exit(1)
  }
}

const spanishDeep = shells.filter((s) => s.file.includes('/es') || s.file.includes('es-'))

for (const { file, h1 } of shells) {
  if (!fs.existsSync(file)) {
    console.error(`${file} missing — cannot check resolved #main-content.`)
    process.exit(1)
  }
  const html = fs.readFileSync(file, 'utf8')
  if (/<template\b/i.test(html)) {
    console.error(`${file} must not leave React streaming <template> placeholders.`)
    process.exit(1)
  }
  if (/\$RT\s*=|\$RB\s*=|\$RV\s*=/.test(html)) {
    console.error(`${file} must not emit streaming bootstrap ($RT/$RB/$RV).`)
    process.exit(1)
  }
  const main = mainInner(html)
  if (!main) {
    console.error(`${file} must have <main id="main-content">.`)
    process.exit(1)
  }
  if (!/<h1\b/i.test(main)) {
    console.error(`${file} #main-content must contain an <h1> (Suspense fallback is not enough).`)
    process.exit(1)
  }
  const visible = textOf(main)
  if (visible.length < 40) {
    console.error(`${file} #main-content is too short to be real page copy (${visible.length} chars).`)
    process.exit(1)
  }
  if (/aria-busy="true"/.test(main) && visible.length < 80) {
    console.error(`${file} #main-content is still the Suspense fallback.`)
    process.exit(1)
  }
  if (!main.includes(h1)) {
    console.error(`${file} #main-content must include h1 copy: ${h1}`)
    process.exit(1)
  }
}

if (spanishDeep.length < 7) {
  console.error(`expected Spanish deep-link shells, found ${spanishDeep.length}`)
  process.exit(1)
}

console.log(
  `ssr main/h1 resolved: ${shells.length} shells (no <template>, no aria-busy fallback); ${spanishDeep.length} Spanish deep links.`,
)
