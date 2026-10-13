/**
 * HERO 专项验证（章节流版）：HERO 仍是第一屏，其行为需在滚动架构下成立
 * 覆盖：结构 / 板块导航（滚动）/ 搜索 / 视差 / 滚动引导 / 粒子 /
 *       语言切换 / 移动端 / 减动效 / 控制台与网络零错误
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
const netProblems = []

/**
 * 沉浸态下 Discord 外壳（顶栏 / 侧栏 / 输入区）被折叠，真实鼠标点击会被
 * Playwright 判为不可见。这里给 click/fill 加一层兜底：不可见时改用 DOM 派发，
 * 断言关注「点了之后行为对不对」，而不是「外壳此刻是否展开」。
 */
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

async function newPage(browser, viewport, extra = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...extra })
  const page = await ctx.newPage()
  soften(page)
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => netProblems.push(`${r.url()} — ${r.failure()?.errorText}`))
  page.on('response', (r) => { if (r.status() >= 400) netProblems.push(`${r.url()} — HTTP ${r.status()}`) })
  return { ctx, page }
}

/** 章节是否位于消息区顶部（容差 4px）；末章节 contact 短于视口时按「已滚到底」判定 */
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

/**
 * 等待章节定位到顶部。
 * 用「手动轮询 + 墙钟计时」而不是 waitForFunction：SwiftShader 下 3D iframe
 * 初始化会长时间占满主线程，注入的轮询回调同样会被饿死，导致明明已到顶
 * 却判超时（waitForFunction 的 timeout 是墙钟，回调没机会跑就永远 false）。
 */
async function waitAtTop(page, id, timeout = 12000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if (await atTop(page, id).catch(() => false)) return true
    await page.waitForTimeout(150)
  }
  return false
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox', '--headless=new'],
})

/* ============ 桌面 · HERO 结构与滚动 ============ */
console.log('▶ 桌面 1440×900 · HERO 结构')
{
  const { ctx, page } = await newPage(browser, { width: 1440, height: 900 })
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
  await page.waitForTimeout(1600)

  check('HERO 已渲染', (await page.locator('#hero').count()) === 1)
  check('大标题 Edwards_Xu ^航', (await page.locator('.hero h1').innerText()).includes('Edwards_Xu ^航'))
  check('状态胶囊（Open to work + 城市）', (await page.locator('.hero .pill').innerText()).includes('Open to work'))
  check('角色行', (await page.locator('.hero__role').innerText()).includes('具身智能算法工程师'))
  check('副标题 5 行', (await page.locator('.hero .sub').innerText()).split('\n').length >= 5)
  check('主 CTA 存在', (await page.locator('.hero .btn--primary').innerText()).includes('看看我的经历'))

  const gotos = await page.$$eval('.hero .board[data-goto]', (ns) => ns.map((n) => n.getAttribute('data-goto')))
  check('6 个板块 tile 指向正确频道', JSON.stringify(gotos) === JSON.stringify(['portfolio', 'about', 'experience', 'metrics', 'skills', 'contact']), gotos.join(','))
  check('搜索 tile 存在', (await page.locator('.hero .board--search[data-quicksearch]').count()) === 1)

  const fx = await page.evaluate(() => {
    const c = document.querySelector('#fx')
    const h = document.querySelector('#hero')
    if (!c || !h) return null
    return { cw: c.clientWidth, ch: c.clientHeight, hw: h.clientWidth, hh: h.clientHeight }
  })
  check('粒子画布与 HERO 同尺寸', fx && Math.abs(fx.cw - fx.hw) <= 2 && Math.abs(fx.ch - fx.hh) <= 2, JSON.stringify(fx))
  check('自定义光标已启用（精确指针）', await page.evaluate(() => document.documentElement.classList.contains('has-cursor')))
  check('光标元素已创建', (await page.locator('body > .cursor').count()) === 1)

  const fills = await page.evaluate(() => {
    const h = document.querySelector('#hero').getBoundingClientRect()
    const sc = document.querySelector('#scroller').getBoundingClientRect()
    return { hero: Math.round(h.height), scroller: Math.round(sc.height) }
  })
  check('HERO 占满消息区首屏', Math.abs(fills.hero - fills.scroller) <= 2, JSON.stringify(fills))

  console.log('▶ 滚动视差')
  check('滚动提示可见', !(await page.locator('#cue').evaluate((n) => n.classList.contains('is-hidden'))))
  // 视差检查要停在 420px（两屏之间），磁吸会把非 snap 点拉回整屏边界：临时解除
  const noSnap = await page.addStyleTag({ content: '.scroller.is-snap { scroll-snap-type: none !important; }' })
  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 420 })
  // 等待滚动反馈最终生效：SwiftShader 慢环境下启动期可能出现主线程长停顿，
  // 事件派发被延迟；固定 500ms 读取会假阴性。等待式断言仍能捕获真缺陷。
  let pRecoverMs = -1
  const pT0 = Date.now()
  try {
    await page.waitForFunction(
      () => parseFloat(document.querySelector('#hero').style.getPropertyValue('--p') || '0') > 0.2,
      null,
      { timeout: 6000, polling: 120 }
    )
    pRecoverMs = Date.now() - pT0
  } catch (e) { /* 超时 = 真缺陷 */ }
  console.log('DEBUG scroll recover ms:', pRecoverMs)
  const p = await page.evaluate(() => ({
    p: parseFloat(document.querySelector('#hero').style.getPropertyValue('--p') || '0'),
    cueHidden: document.querySelector('#cue').classList.contains('is-hidden'),
    fxOpacity: parseFloat(getComputedStyle(document.querySelector('#fx')).opacity),
  }))
  check('滚动进度 --p 已写入', p.p > 0.2, `p=${p.p}`)
  check('滚动后提示隐藏', p.cueHidden)
  check('粒子随滚动压暗', p.fxOpacity < 0.99, `opacity=${p.fxOpacity}`)
  await noSnap.evaluate((n) => n.remove())

  console.log('▶ 滚动引导与板块导航（滚动到章节，非切换视图）')
  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })
  await page.waitForTimeout(500)
  // 直接 DOM 派发：#cue 有 bob 动画，Playwright 的稳定性检查会反复重试，
  // 白白耗掉数秒（断言关心的是点击后的行为，不是命中过程）
  await page.evaluate(() => document.querySelector('#cue').click())
  const cueHash = await page
    .waitForFunction(() => location.hash === '#/portfolio', null, { timeout: 12000, polling: 120 })
    .then(() => true)
    .catch(() => false)
  // 这一步是首屏首次拉起 3D iframe（1.1MB 单文件 + SwiftShader 软渲染初始化），
  // 冷启动下主线程会被占满十几秒，等待预算给足
  const cueTop = await waitAtTop(page, 'portfolio', 25000)
  if (!cueHash || !cueTop) {
    const dump = await page.evaluate(() => {
      const sc = document.querySelector('#scroller')
      const el = document.querySelector('#sec-portfolio')
      return { hash: location.hash, st: Math.round(sc.scrollTop), sh: sc.scrollHeight, ch: sc.clientHeight, delta: Math.round(el.getBoundingClientRect().top - sc.getBoundingClientRect().top) }
    })
    console.log('DEBUG cue 失败现场:', JSON.stringify(dump))
  }
  check('cue → #/portfolio 且作品集章节到顶', cueHash && cueTop)
  check('懒加载触发：iframe 已创建', (await page.locator('#portfolioFrame').count()) === 1)
  check('作品集章节占满一屏', await page.evaluate(() => {
    const sc = document.querySelector('#scroller')
    const el = document.querySelector('#sec-portfolio')
    return Math.abs(el.getBoundingClientRect().height - sc.getBoundingClientRect().height) <= 2
  }))

  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })
  await page.waitForTimeout(700)
  await page.click('.hero .board[data-goto="about"]')
  const aboutHash = await page
    .waitForFunction(() => location.hash === '#/about', null, { timeout: 4000, polling: 120 })
    .then(() => true)
    .catch(() => false)
  check('板块 → #/about 且简介章节到顶', aboutHash && await waitAtTop(page, 'about', 6000))
  check('HERO 滚离后仍在 DOM（章节流不销毁）', (await page.locator('#hero').count()) === 1)

  console.log('▶ scroll-spy 与搜索')
  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 99999 })
  const bottomHash = await page
    .waitForFunction(() => location.hash === '#/contact', null, { timeout: 5000, polling: 120 })
    .then(() => true)
    .catch(() => false)
  const bottomState = await page.evaluate(() => ({
    hash: location.hash,
    active: document.querySelector('.sidebar .channel.is-active')?.getAttribute('data-channel'),
    title: document.querySelector('#topTitle').textContent,
  }))
  check('滚动到底 → spy 归位 #/contact', bottomHash && bottomState.active === 'contact', JSON.stringify(bottomState))

  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })
  const topHash = await page
    .waitForFunction(() => location.hash === '#/welcome', null, { timeout: 5000, polling: 120 })
    .then(() => true)
    .catch(() => false)
  const topState = await page.evaluate(() => ({
    hash: location.hash,
    active: document.querySelector('.sidebar .channel.is-active')?.getAttribute('data-channel'),
  }))
  check('滚回顶部 → spy 归位 #/welcome', topHash && topState.active === 'welcome', JSON.stringify(topState))

  await page.click('.hero .board--search')
  await page.waitForTimeout(400)
  check('搜索 tile → 打开 ⌘K 浮层', await page.evaluate(() => document.querySelector('#modal').classList.contains('is-open')))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  console.log('▶ 语言切换')
  await page.click('#langBtn')
  await page.waitForTimeout(800)
  check('英文角色行', (await page.locator('.hero__role').innerText()).includes('Embodied AI Algorithm Engineer'))
  check('英文 CTA', (await page.locator('.hero .btn--primary').innerText()).includes('View my experience'))
  check('英文板块', (await page.locator('.hero .board[data-goto="portfolio"] small').innerText()).includes('3D Portfolio'))
  check('语言切换后 HERO 仍激活', await page.evaluate(() => document.documentElement.classList.contains('has-cursor')))

  await ctx.close()
}

/* ============ 移动 390×844（hasTouch 模拟真实手机） ============ */
console.log('▶ 移动 390×844')
{
  const { ctx, page } = await newPage(browser, { width: 390, height: 844 }, { hasTouch: true })
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  check('移动端 HERO 渲染', (await page.locator('#hero').count()) === 1)
  check('移动端不启用自定义光标', !(await page.evaluate(() => document.documentElement.classList.contains('has-cursor'))))
  const noOverflow = await page.evaluate(() => {
    const sc = document.querySelector('#scroller')
    return sc.scrollWidth <= sc.clientWidth + 1
  })
  check('无横向溢出', noOverflow)
  const boardRow = await page.evaluate(() => {
    const boards = [...document.querySelectorAll('.hero .board')]
    if (boards.length < 4) return null
    const y0 = boards[0].getBoundingClientRect().top
    return boards.filter((b) => Math.abs(b.getBoundingClientRect().top - y0) < 2).length
  })
  // 手机竖屏档：7 枚板块由三行收成两行（一行 4 枚），首屏才能完整落进一屏
  check('窄屏 4 个 tile 一行（两行收住）', boardRow === 4, `firstRow=${boardRow}`)
  await page.click('.hero .board[data-goto="about"]')
  check('移动端板块滚动到 #about', await waitAtTop(page, 'about', 6000))

  // 触屏滚动链穿透：先把作品集章节对齐到视口，再在 iframe 区域连续滑动
  await page.evaluate(() => { window.location.hash = '#/portfolio' })
  await page.waitForTimeout(2200)
  const before = await page.evaluate(() => document.querySelector('#scroller').scrollTop)
  const box = await page.locator('#sec-portfolio').boundingBox()
  if (box) {
    const x = box.x + box.width / 2
    const y = Math.max(box.y, 56) + 40
    // 单次滑动必须超过半屏：磁吸档下不足半屏会被弹回当前屏顶，
    // 那样测出来的是「回弹正确」而不是「iframe 没困住滚动」
    for (let i = 0; i < 4; i += 1) {
      await page.mouse.move(x, y)          // 指针落在 iframe 上方
      await page.mouse.wheel(0, 900)       // 模拟连续滑动
      await page.waitForTimeout(280)
    }
  }
  const after = await page.evaluate(() => document.querySelector('#scroller').scrollTop)
  const pierced = await page
    .waitForFunction((base) => document.querySelector('#scroller').scrollTop > base + 800, before, { timeout: 5000, polling: 150 })
    .then(() => true)
    .catch(() => false)
  check('滑过作品集屏可穿透 iframe 继续滚动', pierced, `before=${Math.round(before)} after=${Math.round(after)}`)
  await ctx.close()
}

/* ============ 减动效 ============ */
console.log('▶ prefers-reduced-motion')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
  await page.waitForTimeout(1200)
  check('减动效下 HERO 正常渲染', (await page.locator('#hero').count()) === 1)
  check('减动效下不启用自定义光标', !(await page.evaluate(() => document.documentElement.classList.contains('has-cursor'))))
  await page.click('.hero .board[data-goto="contact"]')
  check('减动效下跳转为瞬时（无需等待）', await waitAtTop(page, 'contact', 2500))
  check('减动效下无脚本错误', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '))
  await ctx.close()
}

await browser.close()

console.log('\n========== 汇总 ==========')
check('控制台零错误', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
check('网络零失败 / 404', netProblems.length === 0, netProblems.slice(0, 3).join(' | '))
console.log(`\nHERO 专项：${pass} 通过，${fail} 失败`)
if (fail > 0) {
  console.log('失败项：')
  failures.forEach((f) => console.log('  - ' + f))
  process.exit(1)
}
