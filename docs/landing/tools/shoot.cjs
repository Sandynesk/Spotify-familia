// Capturas da landing para revisão visual.
// Preparação (uma vez, numa pasta FORA do projeto):
//   mkdir _shots-tool && cd _shots-tool && npm init -y && npm i playwright-core && copie este arquivo para lá
// Uso:
//   LANDING_URL=http://localhost:3100/ node shoot.cjs <pastaSaida> [desktop|mobile] [reduced]
// Requer o Google Chrome instalado (channel: 'chrome'); WebGL via SwiftShader.
// Saída: 01-hero … 07-paid-3 (beats da narrativa), 08-everyone/detalhes/numbers/cta/footer
// + JSON com horizontalOverflowPx (deve ser 0) e logs de erro do console.
const { chromium } = require('playwright-core')
const path = require('path')
const fs = require('fs')

const [, , outDir, device = 'desktop', reduced] = process.argv
const URL = process.env.LANDING_URL || 'http://localhost:3100/'
fs.mkdirSync(outDir, { recursive: true })

;(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  const viewport = device === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: device === 'mobile' ? 2 : 1,
    hasTouch: device === 'mobile',
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`) })
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3500) // entrada do 3D

  const vh = viewport.height
  const shots = [
    ['01-hero', 0],
    ['02-slots-1', vh * 1],
    ['03-slots-2', vh * 2],
    ['04-slots-3', vh * 3],
    ['05-paid-1', vh * 4],
    ['06-paid-2', vh * 5],
    ['07-paid-3', vh * 6],
  ]
  for (const [name, y] of shots) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(2200)
    await page.screenshot({ path: path.join(outDir, `${name}.png`) })
  }
  for (const id of ['everyone', 'detalhes', 'numbers', 'cta', 'footer']) {
    const sel = { everyone: 'main > section:nth-of-type(1)', detalhes: '#detalhes', numbers: 'main > section:nth-of-type(3)', cta: 'main > section:nth-of-type(4)', footer: 'footer' }[id]
    const el = await page.$(sel)
    if (!el) { logs.push(`missing ${sel}`); continue }
    await el.scrollIntoViewIfNeeded()
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start', behavior: 'instant' }), sel)
    await page.waitForTimeout(1800)
    await page.screenshot({ path: path.join(outDir, `08-${id}.png`) })
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(JSON.stringify({ device, reduced: !!reduced, horizontalOverflowPx: overflow, logs: logs.slice(0, 20) }, null, 1))
  await browser.close()
})()
