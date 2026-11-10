import React, { Suspense, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { lazyPage } from '../src/lib/lazyPage.ts'

function Fallback() {
  return <div aria-busy="true">loading</div>
}

function shell(child: ReactNode) {
  return <Suspense fallback={<Fallback />}>{child}</Suspense>
}

let pass = 0
function ok(cond: unknown, msg: string) {
  if (!cond) {
    console.error(msg)
    process.exit(1)
  }
  pass += 1
}

const Alpha = lazyPage(async () => ({
  default: function Alpha() {
    return <h1>Alpha route</h1>
  },
}))
const Bravo = lazyPage(async () => ({
  default: function Bravo() {
    return <h1>Bravo route</h1>
  },
}))
const EsDeep = lazyPage(async () => ({
  default: function EsDeep() {
    return <main id="main-content"><h1>Prospección en frío</h1></main>
  },
}))
const Boom = lazyPage(() => Promise.reject(new Error('chunk failed')))

await Alpha.preload()
const preloaded = renderToString(shell(<Alpha />))
ok(preloaded.includes('Alpha route'), 'preloaded route must emit h1')
ok(!preloaded.includes('aria-busy'), 'preloaded route must not emit Suspense fallback')

const unloaded = renderToString(shell(<Bravo />))
ok(unloaded.includes('aria-busy'), 'unloaded route must still hit Suspense (lazy nav)')
ok(!unloaded.includes('Bravo route'), 'unloaded route must not already be in the tree')

await Bravo.preload()
const afterNav = renderToString(shell(<Bravo />))
ok(afterNav.includes('Bravo route'), 'preload of a second route must then emit its h1')
ok(!afterNav.includes('aria-busy'), 'navigated route must not keep the fallback')

await EsDeep.preload()
const es = renderToString(shell(<EsDeep />))
ok(es.includes('Prospección en frío'), 'Spanish deep-link preload must emit h1')
ok(es.includes('id="main-content"'), 'Spanish deep-link preload must emit main')

let firstReject = ''
try {
  await Boom.preload()
} catch (err) {
  firstReject = err instanceof Error ? err.message : String(err)
}
ok(firstReject === 'chunk failed', 'preload rejection must surface, not swallow')

let secondReject = ''
try {
  await Boom.preload()
} catch (err) {
  secondReject = err instanceof Error ? err.message : String(err)
}
ok(secondReject === 'chunk failed', 'failed preload must be retryable')

const boomHtml = renderToString(shell(<Boom />))
ok(boomHtml.includes('aria-busy'), 'rejected module must not blank the shell')

console.log(`lazyPage preload/nav/reject: ${pass} checks`)
