/**
 * 沉浸全屏 + 首屏↔第二屏切换动效 验证
 * 桌面 1440×900 / 移动 390×844 两套视口
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

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--headless=new'],
})

/* ---------- 通用探针 ---------- */
const probe = () => {
  const app = document.querySelector('#app')
  const sc = document.querySelector('#scroller')
  const hero = document.querySelector('#hero')
  const pf = document.querySelector('#sec-portfolio')
  const top = document.querySelector('.topbar')
  const cmp = document.querySelector('.composer')
  const rail = document.querySelector('#rail')
  const sb = document.querySelector('#sidebar')
  const mem = document.querySelector('#members')
  const bar = document.querySelector('#immersiveBar')
  const r = (el) => (el ? el.getBoundingClientRect() : null)
  return {
    immersive: app.getAttribute('data-immersive'),
    vh: window.innerHeight,
    vw: window.innerWidth,
    hero: r(hero) && { top: Math.round(r(hero).top), h: Math.round(r(hero).height) },
    pf: r(pf) && { top: Math.round(r(pf).top), h: Math.round(r(pf).height) },
    scH: sc.clientHeight,
    scrollTop: Math.round(sc.scrollTop),
    topH: Math.round(top.getBoundingClientRect().height),
    cmpH: Math.round(cmp.getBoundingClientRect().height),
    railVis: getComputedStyle(rail).visibility,
    sbVis: getComputedStyle(sb).visibility,
    memVis: getComputedStyle(mem).visibility,
    barVis: getComputedStyle(bar).visibility,
    barOpacity: Number(getComputedStyle(bar).opacity),
    cols: getComputedStyle(app).gridTemplateColumns,
    colTransition: getComputedStyle(app).transitionProperty + ' ' + getComputedStyle(app).transitionDuration,
    colTiming: getComputedStyle(app).transitionTimingFunction,
    topbarTransition: getComputedStyle(document.querySelector('.topbar')).transition,
    cmpTransition: getComputedStyle(document.querySelector('.composer')).transition,
    cmpNatural: document.querySelector('.composer').style.getPropertyValue('--cmp-h'),
    pfNear: pf.classList.contains('is-near'),
    pfOpacity: Number(getComputedStyle(document.querySelector('.story-portfolio__frame')).opacity),
  }
}

async function scrollToSec(page, id, instant = true) {
  await page.evaluate((sid) => {
    const sc = document.querySelector('#scroller')
    const el = document.querySelector(`[data-sec="${sid}"]`)
    sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top
  }, id)
  await page.waitForTimeout(instant ? 900 : 900)
}

/* ============================================================
 * 1. 桌面 1440×900
 * ============================================================ */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))

await page.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await page.waitForTimeout(1200)

let s = await page.evaluate(probe)
check('首屏进入沉浸态', s.immersive === '1', String(s.immersive))
check('HERO 顶边贴视口顶部', Math.abs(s.hero.top) <= 2, `top=${s.hero.top}`)
check('HERO 高度 = 整屏视口（真正全屏）', Math.abs(s.hero.h - s.vh) <= 2, `${s.hero.h} vs ${s.vh}`)
check('顶栏已让位（高度 0）', s.topH === 0, String(s.topH))
check('输入区已让位（高度 0）', s.cmpH === 0, String(s.cmpH))
check('服务器栏隐藏', s.railVis === 'hidden', s.railVis)
check('频道栏隐藏', s.sbVis === 'hidden', s.sbVis)
check('成员栏隐藏', s.memVis === 'hidden', s.memVis)
check('沉浸浮动控件浮现', s.barVis === 'visible' && s.barOpacity > 0.9, `${s.barVis}/${s.barOpacity}`)
check('沉浸态列宽收为 0', /^0px 0px/.test(s.cols), s.cols)
check('.app 具备列宽过渡（外壳开合动画）', /grid-template-columns/.test(s.colTransition) && /0\.44s/.test(s.colTransition), s.colTransition)
check('.app 外壳动画走统一缓动曲线 --ease-out', /0\.22, 0\.61, 0\.36, 1/.test(s.colTiming), s.colTiming)
// 顶栏有确定高度 → 空间真的被「推」走（高度参与动画）；输入区是 auto 高度不可插值
// → 走「先淡出、随后收空间」的顺序编排，同样不产生可见跳变
check('顶栏空间参与收放（height/flex-basis 有过渡）',
  /height/.test(s.topbarTransition) && /flex-basis/.test(s.topbarTransition) && /0\.44s/.test(s.topbarTransition), s.topbarTransition)
// 输入区高度是 auto 无法插值 → JS 量出自然高度写进 --cmp-h，改由 flex-basis 参与插值，
// 与外壳同曲线同时长；量不到才退化回「一步到位」（见 style.css .composer 注释）
check('输入区空间参与收放（flex-basis 有过渡，与外壳同曲线同时长）',
  /flex-basis/.test(s.cmpTransition) && /0\.44s/.test(s.cmpTransition) && /opacity/.test(s.cmpTransition), s.cmpTransition)
check('输入区已量出可插值的自然高度 --cmp-h', /^\d+(\.\d+)?px$/.test(s.cmpNatural) && parseFloat(s.cmpNatural) > 8, String(s.cmpNatural))

// 第二屏：作品集
await scrollToSec(page, 'portfolio')
s = await page.evaluate(probe)
check('作品集屏仍在沉浸态', s.immersive === '1', String(s.immersive))
check('作品集屏高度 = 整屏视口', Math.abs(s.pf.h - s.vh) <= 2, `${s.pf.h} vs ${s.vh}`)
check('作品集屏顶边贴视口顶部', Math.abs(s.pf.top) <= 2, `top=${s.pf.top}`)
check('作品集入场动效已触发（.is-near）', s.pfNear === true)
// 沉浸浮动控件不得压住作品集屏自己的「全屏打开」入口（两者曾同为右上角）
const overlap = await page.evaluate(() => {
  const a = document.querySelector('#immersiveBar').getBoundingClientRect()
  const b = document.querySelector('.story-portfolio__full').getBoundingClientRect()
  const hit = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
              Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return { hit, a: { x: Math.round(a.x), y: Math.round(a.y) }, b: { x: Math.round(b.x), y: Math.round(b.y) } }
})
check('浮动控件未遮挡「全屏打开」入口', overlap.hit === 0, JSON.stringify(overlap))
check('作品集画框已淡入到位', s.pfOpacity > 0.95, String(s.pfOpacity))
await page.waitForTimeout(600)
check('作品集 iframe 已挂载', (await page.locator('#portfolioFrame').count()) === 1)
const pfFrame = page.frames().find((f) => f.url().includes('assets/portfolio'))
check('3D 场景渲染出画布', !!pfFrame && (await pfFrame.locator('canvas').count()) > 0)

// 履历区：外壳收回
await scrollToSec(page, 'about')
s = await page.evaluate(probe)
check('滚入履历区 → 退出沉浸态', s.immersive === '0', String(s.immersive))
check('顶栏收回（高度 > 0）', s.topH > 20, String(s.topH))
check('输入区收回（高度 > 0）', s.cmpH > 20, String(s.cmpH))
check('频道栏恢复可见', s.sbVis === 'visible', s.sbVis)
check('浮动控件收起', s.barVis === 'hidden', s.barVis)

/* ---- 自然滚动跨界：列宽是「动画」收放而非瞬切 ---- */
await scrollToSec(page, 'experience')
// 注意：is-layout-snap 是「同步加、同步删」，MutationObserver 回调触发时类已移除，
// 因此只能从 attributeOldValue 里回溯（删除记录的老值必然带上它）
await page.evaluate(() => {
  window.__snapSeen = false
  new MutationObserver((ms) => {
    ms.forEach((m) => {
      if ((m.oldValue || '').includes('is-layout-snap')) window.__snapSeen = true
    })
  }).observe(document.querySelector('#app'), { attributes: true, attributeFilter: ['class'], attributeOldValue: true })
})
// 缓慢向上滚过边界。小步赋值在 mandatory 下会被拉回 snap 点 —— 那是磁吸的
// 正确行为，但这里要测的是「外壳列宽走动画」，得真能跨越边界：临时解除磁吸
const noSnapNatural = await page.addStyleTag({ content: '.scroller.is-snap { scroll-snap-type: none !important; }' })
await page.evaluate(async () => {
  const sc = document.querySelector('#scroller')
  const target = 0
  const step = () => new Promise((r) => requestAnimationFrame(r))
  let guard = 0
  while (sc.scrollTop > target && guard++ < 900) {
    sc.scrollTop = Math.max(target, sc.scrollTop - 46)
    await step()
  }
})
await page.waitForTimeout(500)
const snapSeenNatural = await page.evaluate(() => window.__snapSeen)
s = await page.evaluate(probe)
check('自然滚动跨界 → 未使用瞬时档（走动画）', snapSeenNatural === false)
check('自然滚动跨界 → 回到沉浸态', s.immersive === '1', String(s.immersive))
await noSnapNatural.evaluate((n) => n.remove())

/* ---- 导航切换：走瞬时档且不跳变（沉浸屏 → 履历章节，必须切换布局） ---- */
await scrollToSec(page, 'portfolio')
const jump = await page.evaluate(async () => {
  const sc = document.querySelector('#scroller')
  const app = document.querySelector('#app')
  window.__snapSeen = false
  new MutationObserver((ms) => {
    ms.forEach((m) => { if ((m.oldValue || '').includes('is-layout-snap')) window.__snapSeen = true })
  }).observe(app, { attributes: true, attributeFilter: ['class'], attributeOldValue: true })
  const anchor = document.querySelector('[data-sec="portfolio"]')
  const before = anchor.getBoundingClientRect().top
  document.querySelector('.sidebar .channel[data-channel="metrics"]').click()
  await new Promise((r) => setTimeout(r, 60))
  const after = anchor.getBoundingClientRect().top
  return { delta: Math.abs(after - before), snap: window.__snapSeen }
})
check('导航切换使用瞬时档 .is-layout-snap', jump.snap === true)
check('导航切换布局跳变被补偿（≤60px）', jump.delta <= 60, `${Math.round(jump.delta)}px`)
await page.waitForTimeout(1600)
const atMetrics = await page.evaluate(() => {
  const sc = document.querySelector('#scroller')
  const el = document.querySelector('[data-sec="metrics"]')
  return Math.abs(el.getBoundingClientRect().top - sc.getBoundingClientRect().top) <= 6
})
check('导航落点精确（章节顶对齐）', atMetrics)

/* ---- 首屏 ↔ 第二屏 过场（磁吸档）----
   磁吸翻页下首屏**刚性跟随**滚动（不再反向补偿钉住），两屏无缝拼接，翻页的
   落位感交给 scroll-snap。这里只校验「镜头语言」：内容淡出、整屏渐暗、第二屏
   收敛位移；三者都由几何逐帧驱动，任何滚动速度下都看得到。

   注：过场断言要停在两屏之间的任意位置，而磁吸会把非 snap 点拉回整屏边界 ——
   临时解除磁吸（等价于一帧内滚动尚未结束），这一段测完即移除。 */
const noSnap = await page.addStyleTag({ content: '.scroller.is-snap { scroll-snap-type: none !important; }' })
const atProg = async (r) => {
  await page.evaluate((rr) => {
    const sc = document.querySelector('#scroller')
    const hero = document.querySelector('#hero')
    sc.scrollTop = Math.round(hero.offsetHeight * rr)
  }, r)
  await page.waitForTimeout(320)
}
const motion = () => page.evaluate(() => {
  const sc = document.querySelector('#scroller')
  const hero = document.querySelector('#hero')
  const h1 = hero.querySelector('h1')
  const pf = document.querySelector('#sec-portfolio')
  const fr = pf.querySelector('.story-portfolio__frame')
  const sr = sc.getBoundingClientRect()
  const rel = (el) => el.getBoundingClientRect().top - sr.top
  return {
    y: sc.scrollTop,
    vh: sc.clientHeight,
    h1vp: rel(h1),
    heroBottom: rel(hero) + hero.getBoundingClientRect().height,
    sy: parseFloat(hero.style.getPropertyValue('--sy') || '0'),
    ss: parseFloat(getComputedStyle(hero).getPropertyValue('--ss') || '1'),
    dim: Number(getComputedStyle(hero.querySelector('.hero__dim')).opacity),
    q: parseFloat(pf.style.getPropertyValue('--q') || '0'),
    qc: parseFloat(pf.style.getPropertyValue('--qc') || '0'),
    linked: pf.classList.contains('is-linked'),
    frH: fr.getBoundingClientRect().height,
    frTop: rel(fr),
    pfH: pf.getBoundingClientRect().height,
    pfTop: rel(pf),
  }
})

await atProg(0)
const m0 = await motion()
await atProg(0.85)
const m85 = await motion()
check('过场：首屏刚性跟随滚动（不再反向补偿钉住）',
  Math.abs(m85.h1vp - m0.h1vp) >= m85.y * 0.9,
  `h1 ${Math.round(m0.h1vp)} → ${Math.round(m85.h1vp)}；滚动量 ${Math.round(m85.y)}px`)
check('过场：舞台位移归零（--sy 恒 0，两屏无缝拼接）', m85.sy === 0, String(m85.sy))
check('过场：两屏刚性拼接无错位（首屏底边 = 第二屏顶边）',
  Math.abs(m85.heroBottom - m85.pfTop) <= 1,
  `hero 底 ${Math.round(m85.heroBottom)} vs portfolio 顶 ${Math.round(m85.pfTop)}`)
check('过场：整层不再缩放（--ss 恒 1，避免边缘露缝）', Math.abs(m85.ss - 1) < 0.001, String(m85.ss))
check('过场：首屏渐暗层随进度压暗', m85.dim > 0.35, String(m85.dim))
check('过场：第二屏进入联动档 .is-linked', m85.linked === true)
// --qc = 原始覆盖（必须严格贴合几何）；--q = 其 smoothstep（§7.2b 流畅度约束②）
check('过场：原始覆盖 --qc 贴合几何', Math.abs(m85.qc - (1 - m85.pfTop / m85.vh)) < 0.05, `qc=${m85.qc} pfTop=${Math.round(m85.pfTop)}`)
check('过场：--q 是 --qc 的 smoothstep（两端无拐点）',
  Math.abs(m85.q - m85.qc * m85.qc * (3 - 2 * m85.qc)) < 0.002, `q=${m85.q} qc=${m85.qc}`)
check('过场：第二屏到位时 --q 饱和到 1', Math.abs(m85.q - 0.9395) < 0.01, String(m85.q))

await atProg(1)
const mFull = await motion()
check('过场：缓动进度两端贴死（0→0, 1→1）', Math.abs(m0.q) < 0.002 && Math.abs(mFull.q - 1) < 0.002, `${m0.q} / ${mFull.q}`)
check('第二屏到位后满幅无黑边',
  Math.abs(mFull.frTop - mFull.pfTop) <= 2 && Math.abs(mFull.frH - mFull.pfH) <= 2,
  `frame=${Math.round(mFull.frTop)}/${Math.round(mFull.frH)} sec=${Math.round(mFull.pfTop)}/${Math.round(mFull.pfH)}`)
await atProg(0)
const mBack = await motion()
check('过场可逆（滚回首屏 --q 归零）', mBack.q < 0.02, String(mBack.q))
await noSnap.evaluate((n) => n.remove())

/* ---- 磁吸翻页（原生 scroll-snap）----
   用手势（wheel）驱动，才能真正触发浏览器的 snap 判定：程序化赋值 scrollTop
   也会被 mandatory 拉回，但它绕过了「一次手势翻一屏」的手感验证。 */
console.log('▶ 磁吸翻页（原生 scroll-snap）')
const VP = page.viewportSize()
const VW = VP.width, VH = VP.height
const snapState = () => page.evaluate(() => {
  const sc = document.querySelector('#scroller')
  const at = (id) => {
    const el = document.querySelector(`[data-sec="${id}"]`)
    return el ? Math.round(el.getBoundingClientRect().top - sc.getBoundingClientRect().top) : null
  }
  return { y: Math.round(sc.scrollTop), on: sc.classList.contains('is-snap'), type: getComputedStyle(sc).scrollSnapType, vh: sc.clientHeight, dw: at('welcome'), dp: at('portfolio'), da: at('about') }
})
/** 单次手势：一次 wheel 即一次滚动操作（多次小 wheel 会被判为多次手势，各自回弹） */
const flick = async (d) => {
  await page.mouse.move(Math.round(VW / 2), Math.round(VH / 2))
  await page.mouse.wheel(0, d)
  await page.waitForTimeout(1600)
  return snapState()
}
await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })
await page.waitForTimeout(900)
const s0 = await snapState()
check('磁吸在沉浸区开启（y mandatory）', s0.on === true && s0.type === 'y mandatory', `${s0.on} / ${s0.type}`)
check('三个 snap 点间距都恰好一整屏', s0.dw === 0 && Math.abs(s0.dp - s0.vh) <= 2 && Math.abs(s0.da - s0.vh * 2) <= 2,
  `welcome=${s0.dw} portfolio=${s0.dp} about=${s0.da} vh=${s0.vh}`)

const sSmall = await flick(Math.round(VH * 0.3))
check('不足半屏 → 回弹到当前屏顶（翻页失败）', Math.abs(sSmall.dw) <= 2, `welcome 偏移 ${sSmall.dw}px`)

const sBig = await flick(Math.round(VH * 0.7))
check('过半屏 → 吸附到下一屏顶（一次一屏）', Math.abs(sBig.dp) <= 2, `portfolio 偏移 ${sBig.dp}px`)

const sAbout = await flick(Math.round(VH * 0.7))
check('再翻一次 → 吸附到履历首章顶', Math.abs(sAbout.da) <= 2, `about 偏移 ${sAbout.da}px`)
check('越过履历首章后解除磁吸（交还自由滚动）', sAbout.on === false && sAbout.type === 'none', `${sAbout.on} / ${sAbout.type}`)

const sFree = await flick(Math.round(VH * 0.45))
check('履历区可自由停留（不被拽回整屏边界）', Math.abs(sFree.y - (sAbout.y + Math.round(VH * 0.45))) <= 8,
  `y ${sAbout.y} + ${Math.round(VH * 0.45)} → ${sFree.y}`)

// 回滚同样一次一屏：先吸回履历首章顶（距离最近），再翻回作品集屏顶
const sBack1 = await flick(-Math.round(VH * 0.45))
check('回滚一次 → 吸附回履历首章顶', Math.abs(sBack1.da) <= 2, `about 偏移 ${sBack1.da}px`)

const sBack = await flick(-Math.round(VH * 0.7))
check('再回滚一次 → 吸附回作品集屏顶', Math.abs(sBack.dp) <= 2, `portfolio 偏移 ${sBack.dp}px`)
check('回到沉浸区重新开启磁吸', sBack.on === true, String(sBack.on))

/* ---- 沉浸态功能入口可用 ---- */
await page.evaluate(() => { document.querySelector('#scroller').scrollTop = 0 })
await page.waitForTimeout(1400)
const langBefore = await page.locator('.hero__role').innerText()
await page.click('#immersiveLang')
await page.waitForTimeout(700)
const langAfter = await page.locator('.hero__role').innerText()
check('沉浸态语言按钮生效', langBefore !== langAfter, `${langBefore} → ${langAfter}`)
await page.click('#immersiveLang')
await page.waitForTimeout(600)

await page.screenshot({ path: '/tmp/p3d-verify/im-desktop-hero.png' })
await scrollToSec(page, 'portfolio')
await page.waitForTimeout(900)
await page.screenshot({ path: '/tmp/p3d-verify/im-desktop-portfolio.png' })
await scrollToSec(page, 'about')
await page.waitForTimeout(900)
await page.screenshot({ path: '/tmp/p3d-verify/im-desktop-resume.png' })
await ctx.close()

/* ============================================================
 * 2. 移动 390×844
 * ============================================================ */
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const mpage = await mctx.newPage()
mpage.on('pageerror', (e) => consoleErrors.push(`mobile pageerror: ${e.message}`))
await mpage.goto(`${BASE}/index.html`, { waitUntil: 'load' })
await mpage.waitForTimeout(1200)

let m = await mpage.evaluate(probe)
check('移动端首屏沉浸态', m.immersive === '1', String(m.immersive))
check('移动端 HERO 整屏', Math.abs(m.hero.h - m.vh) <= 2, `${m.hero.h} vs ${m.vh}`)
check('移动端顶栏让位', m.topH === 0, String(m.topH))
const barBox = await mpage.locator('#immersiveBar').boundingBox()
check('移动端浮动控件靠右下（避让作品集导航）', barBox && barBox.y + barBox.height > m.vh * 0.7, JSON.stringify(barBox))
await scrollToSec(mpage, 'portfolio')
m = await mpage.evaluate(probe)
check('移动端作品集屏整屏', Math.abs(m.pf.h - m.vh) <= 2, `${m.pf.h} vs ${m.vh}`)
check('移动端作品集屏沉浸', m.immersive === '1', String(m.immersive))
await scrollToSec(mpage, 'about')
m = await mpage.evaluate(probe)
check('移动端滚入履历退出沉浸', m.immersive === '0', String(m.immersive))
await mpage.screenshot({ path: '/tmp/p3d-verify/im-mobile-hero.png' })
await mctx.close()

await browser.close()
check('控制台零错误', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
console.log(`\n沉浸全屏 / 切换动效结果：${pass} 通过，${fail} 失败`)
if (fail > 0) {
  console.log('失败项：')
  failures.forEach((f) => console.log('  - ' + f))
  process.exit(1)
}
