/**
 * 动效流畅度基线：逐帧间隔 + CDP 的 LayoutCount / RecalcStyleCount
 * 场景 A：自然滚动跨过「沉浸 → 履历」边界（外壳开合，grid-template-columns 动画）
 * 场景 B：首屏 ↔ 第二屏 过场（纯 transform/opacity）
 */
import { chromium } from 'playwright-core'
const BASE = 'http://localhost:8123'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--no-sandbox', '--headless=new'],
})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('Performance.enable')
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]))

await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.waitForTimeout(3000)

const startRec = () => page.evaluate(() => {
  window.__f = []
  window.__last = performance.now()
  window.__rec = true
  const tick = (t) => { window.__f.push(t - window.__last); window.__last = t; if (window.__rec) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
})
const stopRec = () => page.evaluate(() => {
  window.__rec = false
  const f = window.__f.slice(2)
  const sorted = [...f].sort((a, b) => a - b)
  const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))]
  return {
    frames: f.length,
    p50: Math.round(p(0.5)),
    p95: Math.round(p(0.95)),
    max: Math.round(Math.max(...f)),
    over32: f.filter((d) => d > 32).length,
    over50: f.filter((d) => d > 50).length,
  }
})

const stat = async (name, fn) => {
  const before = await metrics()
  await startRec()
  await fn()
  const r = await stopRec()
  const after = await metrics()
  console.log(`\n== ${name} ==`)
  console.log(`  帧数 ${r.frames} | 中位 ${r.p50}ms | p95 ${r.p95}ms | 最大 ${r.max}ms | >32ms ${r.over32} | >50ms ${r.over50}`)
  console.log(`  LayoutCount +${Math.round(after.LayoutCount - before.LayoutCount)}  RecalcStyleCount +${Math.round(after.RecalcStyleCount - before.RecalcStyleCount)}  LayoutDuration +${(after.LayoutDuration - before.LayoutDuration).toFixed(3)}s  RecalcStyleDuration +${(after.RecalcStyleDuration - before.RecalcStyleDuration).toFixed(3)}s`)
}

/* ---- 场景 A：自然滚动跨界（外壳开合） ---- */
await stat('A 外壳开合（触发列宽动画跨ポートフォリオ→about）', async () => {
  await page.evaluate(async () => {
    const sc = document.querySelector('#scroller')
    sc.scrollTop = 0
    await new Promise((r) => requestAnimationFrame(r))
    const target = document.querySelector('[data-sec="about"]').offsetTop
    const step = () => new Promise((r) => requestAnimationFrame(r))
    let guard = 0
    // 慢速滚动，正好跨过沉浸边界（约 60% 视口处）
    while (sc.scrollTop < target - 120 && guard++ < 600) {
      sc.scrollTop = Math.min(target - 120, sc.scrollTop + 26)
      await step()
    }
    await new Promise((r) => setTimeout(r, 700))
  })
})

/* ---- 场景 A2：反向（回到沉浸） ---- */
await stat('A2 外壳张开（about → 回到沉浸）', async () => {
  await page.evaluate(async () => {
    const sc = document.querySelector('#scroller')
    const step = () => new Promise((r) => requestAnimationFrame(r))
    let guard = 0
    while (sc.scrollTop > 200 && guard++ < 600) {
      sc.scrollTop = Math.max(200, sc.scrollTop - 26)
      await step()
    }
    await new Promise((r) => setTimeout(r, 700))
  })
})

/* ---- 场景 B：首屏 ↔ 第二屏 过场 ---- */
await stat('B 首屏↔第二屏过场（0 → 一屏）', async () => {
  await page.evaluate(async () => {
    const sc = document.querySelector('#scroller')
    sc.scrollTop = 0
    await new Promise((r) => requestAnimationFrame(r))
    const step = () => new Promise((r) => requestAnimationFrame(r))
    for (let i = 0; i < 40; i++) { sc.scrollTop = i * 22; await step() }
  })
})

await browser.close()
