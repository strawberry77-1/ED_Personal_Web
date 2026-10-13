/** 采样外壳收放过程：证明顶栏高度/列宽是渐变而非跳跃 */
import { chromium } from 'playwright-core'
const BASE = 'http://localhost:8123'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--no-sandbox', '--headless=new'],
})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.waitForTimeout(3200)

const sample = async (label, trigger) => {
  const r = await page.evaluate(async (tr) => {
    const sc = document.querySelector('#scroller')
    const app = document.querySelector('#app')
    const top = document.querySelector('.topbar')
    const cmp = document.querySelector('.composer')
    const out = []
    const t0 = performance.now()
    eval(tr)
    while (performance.now() - t0 < 620) {
      out.push({
        t: Math.round(performance.now() - t0),
        imm: app.getAttribute('data-immersive'),
        topH: +top.getBoundingClientRect().height.toFixed(1),
        cmpH: +cmp.getBoundingClientRect().height.toFixed(1),
        cols: getComputedStyle(app).gridTemplateColumns.split(' ').map((v) => Math.round(parseFloat(v) || 0)).join('/'),
      })
      await new Promise((r) => setTimeout(r, 45))
    }
    return out
  }, trigger)
  console.log(`\n== ${label} ==`)
  console.log('  t(ms) imm 顶栏高 输入区高  grid columns')
  r.forEach((s) => console.log(`  ${String(s.t).padStart(4)}  ${s.imm}   ${String(s.topH).padStart(5)}   ${String(s.cmpH).padStart(5)}   ${s.cols}`))
}

// 当前处于沉浸态（首屏）→ 向下跨过履历边界 = 外壳展开
await sample('外壳展开（离开沉浸：portfolio → about）', `
  const el = document.querySelector('[data-sec="about"]')
  sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top + 40
`)
await page.waitForTimeout(900)
// 再退回边界以上 = 外壳收起
await sample('外壳收起（回到沉浸：about → portfolio）', `
  const el = document.querySelector('[data-sec="portfolio"]')
  sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top
`)
await browser.close()
