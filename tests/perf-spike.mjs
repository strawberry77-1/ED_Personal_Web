/** 场景 A 跑两遍：第二次时 iframe 已挂载 → 若尖峰消失说明是 3D 冷启动，而非动画 */
import { chromium } from 'playwright-core'
const BASE = 'http://localhost:8123'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--no-sandbox', '--headless=new'],
})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.waitForTimeout(3000)

const run = () => page.evaluate(async () => {
  window.__f = []
  window.__last = performance.now()
  window.__rec = true
  const tick = (t) => { window.__f.push(t - window.__last); window.__last = t; if (window.__rec) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
  const sc = document.querySelector('#scroller')
  sc.scrollTop = 0
  await new Promise((r) => requestAnimationFrame(r))
  const target = document.querySelector('[data-sec="about"]').offsetTop
  const step = () => new Promise((r) => requestAnimationFrame(r))
  let guard = 0
  while (sc.scrollTop < target - 120 && guard++ < 600) {
    sc.scrollTop = Math.min(target - 120, sc.scrollTop + 26)
    await step()
  }
  await new Promise((r) => setTimeout(r, 700))
  window.__rec = false
  const f = window.__f.slice(2).sort((a, b) => a - b)
  return {
    frames: f.length,
    p95: Math.round(f[Math.floor(f.length * 0.95)]),
    max: Math.round(Math.max(...f)),
    top5: f.slice(-5).map((d) => Math.round(d)),
    over32: f.filter((d) => d > 32).length,
    iframe: !!document.querySelector('#portfolioFrame'),
  }
})

for (let i = 1; i <= 3; i++) {
  const r = await run()
  console.log(`第 ${i} 遍：帧 ${r.frames} | p95 ${r.p95}ms | 最大 ${r.max}ms | 最长 5 帧 ${r.top5.join(',')} | >32ms ${r.over32} | iframe=${r.iframe}`)
}
await browser.close()
