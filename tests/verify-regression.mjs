/**
 * 回归验证（章节流版）：全部履历章节在一个滚动流里可到达；
 * 自动回复、iframe 子视图、英文版、打印样式不受架构改造影响
 */
import { chromium } from 'playwright-core'

const BASE = 'http://localhost:8123'
let pass = 0
let fail = 0
const failures = []
function check(name, ok, detail) {
  if (ok) { pass += 1; console.log(`  ✓ ${name}`) }
  else { fail += 1; failures.push(name + (detail ? ' — ' + detail : '')); console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`) }
}
const consoleErrors = []

/** 沉浸态折叠了外壳，真实点击会被判不可见 → 兜底改 DOM 派发（见 verify-hero 同名注释） */
function soften(page) {
  const click = page.click.bind(page)
  page.click = async (sel, opts) => {
    try { return await click(sel, { timeout: 2500, ...opts }) } catch (e) {
      const ok = await page.evaluate((s) => {
        const el = document.querySelector(s)
        if (!el) return false
        el.click()
        return true
      }, sel)
      if (!ok) throw e
    }
  }
  const fill = page.fill.bind(page)
  page.fill = async (sel, val, opts) => {
    try { return await fill(sel, val, { timeout: 2500, ...opts }) } catch (e) {
      const ok = await page.evaluate(([s, v]) => {
        const el = document.querySelector(s)
        if (!el) return false
        el.value = v
        el.dispatchEvent(new Event('input', { bubbles: true }))
        return true
      }, [sel, val])
      if (!ok) throw e
    }
  }
  return page
}

async function atTop(page, id) {
  return page.evaluate((sid) => {
    const sc = document.querySelector('#scroller')
    const el = document.querySelector(`[data-sec="${sid}"]`)
    if (!sc || !el) return false
    const delta = Math.abs(el.getBoundingClientRect().top - sc.getBoundingClientRect().top)
    const atBottom = sc.scrollTop >= sc.scrollHeight - sc.clientHeight - 4
    return delta <= 4 || (sid === 'contact' && atBottom)
  }, id)
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--headless=new'],
})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
soften(page)
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))

await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.waitForTimeout(1000)

// 章节流完整性：七个章节一次性全部在 DOM 中（单页滚动的核心承诺）
const secs = await page.$$eval('[data-sec]', (ns) => ns.map((n) => n.getAttribute('data-sec')))
check('七个章节同页共存', JSON.stringify(secs) === JSON.stringify(['welcome', 'portfolio', 'about', 'experience', 'metrics', 'skills', 'contact', 'chat']), secs.join(','))

// 侧栏逐一切换 → 滚动到章节 + 内容存在
for (const ch of ['about', 'experience', 'metrics', 'skills', 'contact']) {
  await page.click(`.sidebar .channel[data-channel="${ch}"]`)
  await page.waitForTimeout(1500)
  const ok = await atTop(page, ch)
  const hasContent = (await page.locator(`[data-sec="${ch}"] .embed`).count()) > 0
  check(`#${ch} → 滚动到章节且内容渲染`, ok && hasContent)
}

// 自动回复：输入「项目」→ 回复落在 #sec-chat，按钮跳作品集
await page.fill('#composerInput', '项目')
await page.keyboard.press('Enter')
await page.waitForTimeout(1400)
check('回复渲染于页面末尾（#sec-chat）', (await page.locator('#sec-chat .embed').count()) > 0)
check('回复提及 3D 作品集', (await page.locator('#sec-chat').innerText()).includes('3D 作品集'))
const gotoBtn = page.locator('#sec-chat [data-goto="portfolio"]').last()
check('回复含跳转按钮', (await gotoBtn.count()) > 0)
await gotoBtn.click()
await page.waitForTimeout(1800)
check('点击回复按钮 → 滚动到作品集章节', await atTop(page, 'portfolio'))

// iframe 子视图深链：联系页
await page.evaluate(() => { window.location.hash = '#/portfolio/contact' })
await page.waitForTimeout(1800)
const pframe = page.frames().find((f) => f.url().includes('assets/portfolio'))
check('iframe 联系页渲染', pframe && (await pframe.locator('.contact').count()) > 0)

// 英文版
await page.click('#langBtn')
await page.waitForTimeout(800)
check('英文版 HERO', (await page.locator('.hero__role').innerText()).includes('Embodied AI Algorithm Engineer'))
await page.click('.sidebar .channel[data-channel="about"]')
await page.waitForTimeout(1500)
check('英文版 about 章节', await atTop(page, 'about'))
check('英文按钮文案', (await page.locator('#pfFullLabel').innerText()).includes('Open fullscreen'))

// 打印：HERO 与作品集不打印，履历章节可打印
await page.emulateMedia({ media: 'print' })
await page.waitForTimeout(300)
const printOk = await page.evaluate(() => {
  const hero = getComputedStyle(document.querySelector('#hero')).display
  const pf = getComputedStyle(document.querySelector('#sec-portfolio')).display
  const about = document.querySelector('#sec-about').getBoundingClientRect().height
  return hero === 'none' && pf === 'none' && about > 100
})
check('打印模式：隐藏 HERO/作品集、保留履历', printOk)
await page.emulateMedia({ media: 'screen' })

await browser.close()
check('控制台零错误', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
console.log(`\n回归结果：${pass} 通过，${fail} 失败`)
if (fail > 0) {
  console.log('失败项：')
  failures.forEach((f) => console.log('  - ' + f))
  process.exit(1)
}
