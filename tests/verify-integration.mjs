/**
 * 3D 作品集整合验证（章节流版）：第二屏 = 全屏 portfolio，懒加载，
 * 父子路由双向同步，滚离暂停，旧路由重定向
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

async function newPage(browser, viewport, extra = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...extra })
  const page = await ctx.newPage()
  soften(page)
  ctx.on('page', (p) => p.close().catch(() => {}))   // ⌘K 搜项目会开新标签（仓库页），测试里直接关掉
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => netProblems.push(`${r.url()} — ${r.failure()?.errorText}`))
  page.on('response', (r) => { if (r.status() >= 400) netProblems.push(`${r.url()} — HTTP ${r.status()}`) })
  return { ctx, page }
}

async function findFrame(page, timeoutMs = 20000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    const f = page.frames().find((x) => x.url().includes('assets/portfolio'))
    if (f) return f
    await page.waitForTimeout(150)
  }
  return null
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

/** 等待章节定位到顶部（平滑滚动需要时间）。
 *  手动轮询 + 墙钟计时：SwiftShader 冷启动时主线程会被 3D iframe 长时间占满，
 *  waitForFunction 注入的轮询回调会被饿死，明明已到顶却判超时。 */
async function waitAtTop(page, id, timeout = 8000) {
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

/* ============ 桌面 1440×900 ============ */
console.log('▶ 桌面 1440×900')
{
  const { ctx, page } = await newPage(browser, { width: 1440, height: 900 })
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
  await page.waitForTimeout(1200)

  check('首页标题含 #welcome', (await page.title()).includes('#welcome'))
  const order = await page.$$eval('.sidebar .channel', (ns) => ns.map((n) => n.getAttribute('data-channel')))
  check(
    '频道顺序 welcome→portfolio→about→experience→metrics→skills→contact',
    JSON.stringify(order) === JSON.stringify(['welcome', 'portfolio', 'about', 'experience', 'metrics', 'skills', 'contact']),
    order.join(',')
  )
  check('首屏未预载 iframe（懒加载）', (await page.locator('#portfolioFrame').count()) === 0)

  // 切到 portfolio：滚动到第二屏，懒加载触发
  await page.click('.sidebar .channel[data-channel="portfolio"]')
  const pframe = await findFrame(page)
  check('侧栏点击 → 滚动到作品集章节', await waitAtTop(page, 'portfolio'))
  check('iframe 已懒加载', !!pframe)

  check('作品集章节占满一屏', await page.evaluate(() => {
    const sc = document.querySelector('#scroller')
    const el = document.querySelector('#sec-portfolio')
    return Math.abs(el.getBoundingClientRect().height - sc.getBoundingClientRect().height) <= 2
  }))
  check('iframe 指向单文件产物', await page.evaluate(() =>
    (document.querySelector('#portfolioFrame').getAttribute('src') || '').includes('assets/portfolio/index.html?embed=1')
  ))
  check('悬浮「全屏打开」按钮存在', (await page.locator('.story-portfolio__full').count()) === 1)

  await pframe.locator('.a11y-card').first().waitFor({ timeout: 25000 }).catch(() => {})
  await page.waitForTimeout(2600)
  check('3D canvas 存在', (await pframe.locator('canvas').count()) > 0)
  check('桌面端走 3D 场景（无移动列表）', (await pframe.locator('.mlist').count()) === 0)

  const lit = await pframe.evaluate(async () => {
    const c = document.querySelector('canvas')
    if (!c) return -1
    const off = document.createElement('canvas')
    off.width = 200
    off.height = 125
    const ctx2 = off.getContext('2d')
    ctx2.drawImage(c, 0, 0, 200, 125)
    const d = ctx2.getImageData(0, 0, 200, 125).data
    let n = 0
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 40) n += 1
    return n
  })
  check('3D 画面非空白', lit > 200, `亮像素 ${lit}`)

  // 滚轮应滚动宿主页面（嵌入态已禁用相机缩放）
  const beforeWheel = await page.evaluate(() => document.querySelector('#scroller').scrollTop)
  const box = await page.locator('#sec-portfolio').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.wheel(0, 400)
  const wheelRolled = await page
    .waitForFunction((base) => document.querySelector('#scroller').scrollTop > base + 200, beforeWheel, { timeout: 4000, polling: 120 })
    .then(() => true)
    .catch(() => false)
  check('滚轮落在作品集屏 → 滚动宿主页面（滚动链未断）', wheelRolled)
  // 滚回去
  await page.click('.sidebar .channel[data-channel="portfolio"]')
  await page.waitForTimeout(1800)

  // iframe → 父页面：点击 a11y 卡片
  await pframe.evaluate(() => {
    const bs = document.querySelectorAll('.a11y-card')
    bs[bs.length - 1].click()
  })
  const cardSynced = await page
    .waitForFunction(() => /^#\/portfolio\/project\//.test(location.hash), null, { timeout: 15000, polling: 150 })
    .then(() => true)
    .catch(() => false)
  check('点击卡片 → 父页面 hash 同步为 #/portfolio/project/*', cardSynced, await page.evaluate(() => location.hash))
  // hash 是点击瞬间写入的，面板要等飞入动画结束才挂载：等待面板本身
  await pframe.locator('.detail').waitFor({ timeout: 20000 }).catch(() => {})
  check('详情面板已打开', (await pframe.locator('.detail').count()) > 0)

  // iframe 内部导航：关于 tab
  await pframe.evaluate(() => { document.querySelector('.nav__close')?.click() })
  await page.waitForTimeout(2200)
  await pframe.evaluate(() => { document.querySelectorAll('.nav__tab')[1].click() })
  await page.waitForTimeout(600)
  check('iframe 关于页 → 父页面 #/portfolio/about', (await page.evaluate(() => location.hash)) === '#/portfolio/about')

  // 宿主 → iframe：同文档 hash 深链
  await page.evaluate(() => { window.location.hash = '#/portfolio/project/avazone' })
  await pframe.locator('.detail').waitFor({ timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(1200)
  check('父页面深链 → iframe 打开对应详情', (await pframe.locator('.detail').count()) > 0)
  check('详情内容为 AVAZone', (await pframe.locator('.detail').innerText().catch(() => '')).includes('AVAZone'))

  // 旧路由重定向
  await page.goto(`${BASE}/index.html#/projects`, { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  check('旧路由 #/projects 重定向为 #/portfolio', (await page.evaluate(() => location.hash)) === '#/portfolio', await page.evaluate(() => location.hash))
  check('重定向后定位到作品集章节', await atTop(page, 'portfolio'))

  // ⌘K 搜索项目 → 滚动 + iframe 详情
  await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })
  await page.waitForTimeout(600)
  // 焦点可能还留在作品集 iframe 里（上一步刚操作过它），此时 Ctrl+K 会被
  // 送进 iframe、主页面收不到。先把它摘回主框架，再测热键本身。
  await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur() })
  await page.click('.topbar__title')
  await page.keyboard.press('Control+k')
  await page.locator('#modal.is-open').waitFor({ timeout: 3000 }).catch(() => {})
  await page.fill('#searchInput', 'LingMate')
  await page.waitForTimeout(300)
  await page.keyboard.press('Enter')
  const searchSynced = await page
    .waitForFunction(() => location.hash === '#/portfolio/project/lingmate', null, { timeout: 15000, polling: 150 })
    .then(() => true)
    .catch(() => false)
  check('⌘K 搜 LingMate → #/portfolio/project/lingmate', searchSynced, await page.evaluate(() => location.hash))

  const pframe3 = await findFrame(page)
  check('⌘K 后 iframe 显示 LingMate 详情', (await pframe3.locator('.detail').innerText().catch(() => '')).includes('lingmate'))

  // 滚离暂停：宿主下发 active=false（用轮询等待消息抵达，对慢环境鲁棒）
  await pframe3.evaluate(() => {
    window.__probe = []
    window.addEventListener('message', (e) => { if (e.data && e.data.source === 'host-site') window.__probe.push(e.data) })
  })
  const waitProbe = async (want, timeout = 6000) => {
    const t0 = Date.now()
    while (Date.now() - t0 < timeout) {
      const hit = await pframe3.evaluate((w) => (window.__probe || []).some((m) => m.active === w), want).catch(() => false)
      if (hit) return true
      await page.waitForTimeout(200)
    }
    return false
  }
  await page.click('.sidebar .channel[data-channel="experience"]')
  check('滚离作品集屏 → 宿主下发 active=false', await waitProbe(false))
  await page.click('.sidebar .channel[data-channel="portfolio"]')
  check('滚回作品集屏 → 宿主下发 active=true', await waitProbe(true))

  // 主题 / 语言
  const themes = new Set()
  for (let i = 0; i < 3; i += 1) {
    await page.click('.topbar [data-theme-toggle]')
    await page.waitForTimeout(120)
    themes.add(await page.evaluate(() => document.documentElement.getAttribute('data-theme')))
  }
  check('主题循环切换（system/dark/light）', themes.size >= 2, [...themes].join(','))

  await page.click('#langBtn')
  await page.waitForTimeout(600)
  check('语言切换后按钮为英文', (await page.locator('#pfFullLabel').innerText()).includes('Open fullscreen'))
  check('语言切换后 iframe 未重建（同一节点）', await page.evaluate(() => !!document.querySelector('#portfolioFrame')?.contentDocument))

  // 先关掉本上下文再跑冷启动：两个 SwiftShader 3D 场景并存会互相争抢
  // CPU，导致飞入动画等时序被拖慢（导致假阴性）
  await ctx.close()

  // 冷启动深链（全局刷新）
  const { ctx: ctx2, page: page2 } = await newPage(browser, { width: 1440, height: 900 })
  await page2.goto(`${BASE}/index.html#/portfolio/project/ava-truster`, { waitUntil: 'load' })
  const pframe2 = await findFrame(page2)
  check('冷启动深链 → 章节瞬时定位', await waitAtTop(page2, 'portfolio', 2500))
  await pframe2.locator('.detail').waitFor({ timeout: 45000 }).catch(() => {})
  check('冷启动深链直达详情', (await pframe2.locator('.detail').count()) > 0)
  check('冷启动详情内容为 AVA_Truster', (await pframe2.locator('.detail').innerText().catch(() => '')).includes('AVA_Truster'))
  await ctx2.close()
}

/* ============ 移动 390×844 ============ */
console.log('▶ 移动 390×844')
{
  const { ctx, page } = await newPage(browser, { width: 390, height: 844 }, { hasTouch: true })
  await page.goto(`${BASE}/index.html#/portfolio`, { waitUntil: 'load' })
  const pframe = await findFrame(page)
  check('深链直达作品集章节', await atTop(page, 'portfolio'))
  check('iframe 已加载', !!pframe)
  await pframe.locator('.mlist').waitFor({ timeout: 25000 }).catch(() => {})
  check('移动端走原生列表 .mlist', (await pframe.locator('.mlist').count()) > 0)
  check('移动端隐藏 a11y 层', (await pframe.locator('.a11y-layer').count()) === 0)

  await pframe.evaluate(() => { document.querySelectorAll('.mcard')[0].click() })
  await page.waitForTimeout(1200)
  check('点击列表项 → 详情打开', (await pframe.locator('.detail').count()) > 0)
  check('移动端父页面 hash 同步', /^#\/portfolio\/project\//.test(await page.evaluate(() => location.hash)))

  await page.click('#hamburger')
  await page.waitForTimeout(300)
  check('移动端抽屉可展开', await page.isVisible('#sidebar.is-open'))
  await ctx.close()
}

/* ============ file:// 协议 ============ */
console.log('▶ file:// 协议')
{
  const { ctx, page } = await newPage(browser, { width: 1280, height: 800 })
  await page.goto('file:///Users/Admin/Desktop/homepage/myweb/个人网站/index.html#/portfolio', {
    waitUntil: 'load',
  })
  const pframe = await findFrame(page)
  check('file:// 下 iframe 加载', !!pframe)
  if (pframe) {
    await pframe.locator('.a11y-card').first().waitFor({ timeout: 25000 }).catch(() => {})
    check('file:// 下 3D canvas 渲染', (await pframe.locator('canvas').count()) > 0)
    await pframe.evaluate(() => {
      const bs = document.querySelectorAll('.a11y-card')
      if (bs.length) bs[0].click()
    })
    await page.waitForTimeout(2200)
    check('file:// 下详情可打开', (await pframe.locator('.detail').count()) > 0)
  }
  await ctx.close()
}

await browser.close()

console.log('\n========== 汇总 ==========')
check('控制台零错误', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
check('网络零失败 / 404', netProblems.length === 0, netProblems.slice(0, 3).join(' | '))
console.log(`\n整合验证：${pass} 通过，${fail} 失败`)
if (fail > 0) {
  console.log('失败项：')
  failures.forEach((f) => console.log('  - ' + f))
  process.exit(1)
}
