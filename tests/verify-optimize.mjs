/**
 * B / C 组优化项验证
 *   B3 分享卡片（og:image 绝对化、twitter card、locale、theme-color 跟随主题）
 *   B4 防主题闪烁（head 预置脚本先于样式表）
 *   B5 头像 WebP 化
 *   C6 移动端作品集让出手势（产物中不再有切断滚动链的 overscroll-behavior）
 *   C7 履历章节进入视口才播入场动画（且不动 section 几何）
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

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--headless=new'],
})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errs = []
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.waitForTimeout(1500)

/* ---------------- B3 分享卡片 ---------------- */
console.log('▶ B3 分享卡片')
const m = await page.evaluate(() => {
  const g = (sel, attr = 'content') => { const el = document.querySelector(sel); return el ? el.getAttribute(attr) : null }
  return {
    ogImage: g('meta[property="og:image"]'),
    ogUrl: g('meta[property="og:url"]'),
    ogLocale: g('meta[property="og:locale"]'),
    ogSite: g('meta[property="og:site_name"]'),
    ogW: g('meta[property="og:image:width"]'),
    twCard: g('meta[name="twitter:card"]'),
    twImage: g('meta[name="twitter:image"]'),
    twTitle: g('meta[name="twitter:title"]'),
    canonical: (document.querySelector('link[rel="canonical"]') || {}).href,
  }
})
check('og:image 为绝对 URL', /^https:\/\/\S+\.(jpg|jpeg|png|webp)$/i.test(m.ogImage || ''), m.ogImage)
check('og:url 为绝对 URL', /^https:\/\//.test(m.ogUrl || ''), m.ogUrl)
check('twitter:card 已声明且为 summary', m.twCard === 'summary', m.twCard)
check('twitter:image 为绝对 URL', /^https:\/\//.test(m.twImage || ''), m.twImage)
check('canonical 已声明', /^https:\/\//.test(m.canonical || ''), m.canonical)
check('og:locale / og:site_name / 图像尺寸齐备',
  !!m.ogLocale && !!m.ogSite && m.ogW === '512', `${m.ogLocale} / ${m.ogSite} / ${m.ogW}`)

// theme-color 跟随主题（用 ?theme= 直连，避开三态循环的干扰）
const themeColorOf = async (q) => {
  await page.goto(`${BASE}/index.html?theme=${q}`, { waitUntil: 'load' })
  await page.waitForTimeout(900)
  return page.evaluate(() => ({
    resolved: document.documentElement.getAttribute('data-theme'),
    tc: (document.querySelector('meta[name="theme-color"]') || {}).content,
  }))
}
const darkR = await themeColorOf('dark')
const lightR = await themeColorOf('light')
check('暗色下 theme-color 为暗色值', darkR.tc === '#1e1f22', `${darkR.resolved} / ${darkR.tc}`)
check('亮色下 theme-color 随主题切换', lightR.tc === '#e3e5e8', `${lightR.resolved} / ${lightR.tc}`)

// 切英文后分享卡片文案与 locale 同步
await page.goto(`${BASE}/index.html?lang=en`, { waitUntil: 'load' })
await page.waitForTimeout(1200)
const en = await page.evaluate(() => ({
  locale: (document.querySelector('meta[property="og:locale"]') || {}).content,
  title: (document.querySelector('meta[name="twitter:title"]') || {}).content,
  desc: (document.querySelector('meta[name="twitter:description"]') || {}).content,
  htmlLang: document.documentElement.getAttribute('lang'),
}))
check('英文态 og:locale 切到 en_US', en.locale === 'en_US', en.locale)
check('英文态 twitter 卡片文案同步', /Edwards/i.test(en.title || '') && !/具身智能/.test(en.desc || ''), `${en.title} | ${String(en.desc).slice(0, 40)}`)
check('html lang 同步', en.htmlLang === 'en', en.htmlLang)

/* ---------------- B4 防主题闪烁 ---------------- */
console.log('▶ B4 防主题闪烁')
const raw = await (await fetch(`${BASE}/index.html`)).text()
const inlinePos = raw.indexOf('edwards-site-theme')
const cssPos = raw.indexOf('<link rel="stylesheet"')
check('head 内含主题预置脚本', inlinePos > 0)
check('预置脚本位于样式表之前（解析阶段即定主题）', inlinePos > 0 && inlinePos < cssPos, `script@${inlinePos} css@${cssPos}`)

// 行为：本地偏好为 light 时，加载后主题就是 light（且脚本与 app.js 同源）
await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.evaluate(() => { try { localStorage.setItem('edwards-site-theme', 'light') } catch (e) {} })
await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' })
const earlyTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
check('本地偏好 light → 较早时机即为 light', earlyTheme === 'light', String(earlyTheme))
await page.evaluate(() => { try { localStorage.removeItem('edwards-site-theme') } catch (e) {} })

/* ---------------- B5 头像 WebP ---------------- */
console.log('▶ B5 头像 WebP')
await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.waitForTimeout(1200)
const avatars = await page.evaluate(() => [...document.querySelectorAll('img')].map((i) => i.getAttribute('src')).filter((s) => s && /avatar/.test(s)))
check('页面内头像全部走 WebP', avatars.length > 0 && avatars.every((s) => /\.webp$/.test(s)), [...new Set(avatars)].join(', '))
const imgSizes = await page.evaluate(async () => {
  const out = {}
  for (const f of ['assets/img/avatar-192.webp', 'assets/img/avatar.jpg']) {
    const r = await fetch(f)
    const b = await r.blob()
    out[f] = { ok: r.ok, kb: +(b.size / 1024).toFixed(1) }
  }
  return out
})
check('WebP 头像存在且显著小于 JPEG',
  imgSizes['assets/img/avatar-192.webp'].ok && imgSizes['assets/img/avatar-192.webp'].kb < 10,
  `${imgSizes['assets/img/avatar-192.webp'].kb} KB`)
check('og:image 仍保留 JPEG（社交平台兼容）',
  imgSizes['assets/img/avatar.jpg'].ok && /\.jpg$/i.test(m.ogImage || ''), m.ogImage)

/* ---------------- C6 移动端让出手势 ---------------- */
console.log('▶ C6 移动端作品集让出手势')
const prod = await page.evaluate(async () => {
  const r = await fetch('assets/portfolio/index.html')
  const t = await r.text()
  return { ok: r.ok, hasNone: /overscroll-behavior\s*:\s*none/.test(t) }
})
check('3D 产物已就绪', prod.ok)
check('产物中不再有切断滚动链的 overscroll-behavior: none', !prod.hasNone)

// 行为验证：移动端列表已在底部时，一次滚动手势应直接带动宿主页面。
// 改前 body 上的 overscroll-behavior:none 会把这段滚动吞掉（列表到底即停）。
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const mp = await mctx.newPage()
await mp.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await mp.waitForTimeout(3500)
await mp.evaluate(() => { document.querySelector('#scroller').scrollTop = 844 })   // 第二屏顶
await mp.waitForTimeout(3000)
const mY0 = await mp.evaluate(() => Math.round(document.querySelector('#scroller').scrollTop))
const listBottom = await mp.evaluate(() => {
  const l = document.querySelector('#portfolioFrame')?.contentDocument?.querySelector('.mlist')
  if (!l) return null
  l.scrollTop = l.scrollHeight            // 先把列表滚到底，聚焦测「到底之后」
  return Math.round(l.scrollTop)
})
await mp.waitForTimeout(400)
await mp.mouse.move(195, 420)
await mp.mouse.wheel(0, 700)
await mp.waitForTimeout(2200)
const mY1 = await mp.evaluate(() => Math.round(document.querySelector('#scroller').scrollTop))
check('移动端列表到底后手势带动宿主页面', listBottom !== null && mY1 > mY0 + 300,
  `${mY0} → ${mY1}（列表已到底 ${listBottom}px）`)
await mctx.close()

/* ---------------- C7 履历章节入场 ---------------- */
console.log('▶ C7 履历章节入场')
const beforeIn = await page.evaluate(() => ({
  welcome: document.querySelector('[data-sec="welcome"]')?.classList.contains('is-in'),
  portfolio: document.querySelector('[data-sec="portfolio"]')?.classList.contains('is-in'),
}))
check('首屏 / 第二屏不受章节入场影响', !beforeIn.welcome && !beforeIn.portfolio,
  `welcome=${beforeIn.welcome} portfolio=${beforeIn.portfolio}`)

// 滚到 about（第一节履历章）——用赋值而非手势，避免受磁吸回弹影响
const secTop = await page.evaluate(() => {
  const sc = document.querySelector('#scroller')
  const el = document.querySelector('[data-sec="about"]')
  return el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop
})
await page.evaluate((y) => { document.querySelector('#scroller').scrollTop = y }, secTop)
await page.waitForTimeout(1200)

const aboutState = await page.evaluate(() => {
  const el = document.querySelector('[data-sec="about"]')
  const kids = [...el.children]
  const first = kids[0]
  const cs = first ? getComputedStyle(first) : null
  return {
    hasIn: el.classList.contains('is-in'),
    anim: cs ? cs.animationName : null,
    animDur: cs ? cs.animationDuration : null,
    fill: cs ? cs.animationFillMode : null,
    childCount: kids.length,
    delays: kids.slice(0, 4).map((k) => getComputedStyle(k).animationDelay),
  }
})
check('滚到 about 后章节获得 .is-in', aboutState.hasIn === true)
check('子元素播放 secIn 入场动画', aboutState.anim === 'secIn', String(aboutState.anim))
check('用 both 填充（延迟期间不闪露）', aboutState.fill === 'both', String(aboutState.fill))
check('动效按序错开', new Set(aboutState.delays).size > 1, aboutState.delays.join(' / '))

// 关键：动画不能影响 section 自身的几何（否则 measureSections / 磁吸全乱）
const geo = await page.evaluate(() => {
  const sc = document.querySelector('#scroller')
  const el = document.querySelector('[data-sec="about"]')
  const scRect = sc.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  return { deltaTop: Math.round(r.top - scRect.top), animOnSection: getComputedStyle(el).animationName }
})
check('履历章节顶部精确对齐（动画未污染几何）', Math.abs(geo.deltaTop) <= 4, `delta=${geo.deltaTop}px`)
check('section 自身无动画（只动子元素）', geo.animOnSection === 'none', String(geo.animOnSection))

// 一次性：滚走再回来不重播（类保持、动画不重启）
await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })
await page.waitForTimeout(900)
await page.evaluate((y) => { document.querySelector('#scroller').scrollTop = y }, secTop)
await page.waitForTimeout(700)
const again = await page.evaluate(() => document.querySelector('[data-sec="about"]').classList.contains('is-in'))
check('来回滚动不重播（类保持为一次性）', again === true)

// 后续章节同样会被观察（滚到 skills 验证）
const skillsTop = await page.evaluate(() => {
  const sc = document.querySelector('#scroller')
  const el = document.querySelector('[data-sec="skills"]')
  return el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop
})
await page.evaluate((y) => { document.querySelector('#scroller').scrollTop = y }, skillsTop)
await page.waitForTimeout(1000)
const skillsIn = await page.evaluate(() => document.querySelector('[data-sec="skills"]').classList.contains('is-in'))
check('经验 / 技能等后续章节同样入场', skillsIn === true)

check('控制台零错误', errs.length === 0, errs.slice(0, 3).join(' | '))

console.log(`\n优化项验证结果：${pass} 通过，${fail} 失败`)
if (failures.length) { console.log('失败项：'); failures.forEach((f) => console.log('  - ' + f)) }
await browser.close()
process.exit(fail ? 1 : 0)
