# 验证脚本

本站是零构建静态站，没有编译期检查 —— **回归防线全在这几套 Playwright 脚本上**。
改完站点（或重新 `build:embed` 之后）应当全跑一遍。

## 前置

- 本地服务：`python3 -m http.server 8123`（工作目录 = 仓库根；或双击 `启动网站.command`）
- 运行时：本机 Chrome + `playwright-core`。**复用 `../portfolio3d/node_modules`**，
  不要另装一套（版本跟随 3D 子项目）
- 脚本里 `BASE` 固定为 `http://localhost:8123`

## 跑法

```bash
cd <仓库根>
NODE_PATH=../portfolio3d/node_modules node tests/verify-hero.mjs
```

## 五套脚本

| 脚本 | 项数 | 覆盖 |
| --- | --- | --- |
| `verify-hero.mjs` | 40 | HERO 首屏：装配、粒子、滚动视差、板块导航、响应式、减动效 |
| `verify-integration.mjs` | 41 | 整合：3D 作品集嵌入、父子路由双向同步、懒加载、深链、搜索 |
| `verify-regression.mjs` | 16 | 回归：主题 / 语言持久化、打印样式、章节流基础 |
| `verify-immersive.mjs` | 64 | 沉浸全屏、磁吸翻页（scroll-snap）、首屏↔第二屏过场、移动端 |
| `verify-optimize.mjs` | 30 | 分享卡片、防主题闪烁、头像 WebP、移动端手势让出、章节入场 |

合计 **191 项**。任一项失败都应视为真实回归，先看脚本再看站点。

## 性能与探针

| 脚本 | 用途 |
| --- | --- |
| `perf-transition.mjs` | 外壳开合 / 过场的逐帧间隔 + CDP LayoutCount |
| `perf-spike.mjs` | 三遍连测，区分「冷启动尖峰」与「动画掉帧」 |
| `probe-shell.mjs` | 采样外壳收放过程的中栏高度 / 列宽中间值，确认是渐变而非跳变 |

## 已知陷阱（改脚本前必读）

- **`scroll-snap` 会让「停在中途」失败**：`mandatory` 下小幅小步赋值 `scrollTop`、
  或间隔 40ms 的连续 `mouse.wheel` 都会被弹回当前屏顶。要在两屏之间停住，
  必须临时解除磁吸（等价于一帧内滚动尚未结束）：
  ```js
  await page.addStyleTag({ content: '.scroller.is-snap { scroll-snap-type: none !important; }' })
  ```
  单次 `wheel` 须 **大于半屏** 才翻得过去。**这类失败是测试方式问题，不是站点缺陷。**
- **慢环境（SwiftShader）会饿死等待回调**：`waitForFunction` 的轮询可能被主线程长任务
  拖住，章节定位类断言请用「手动轮询 + 墙钟预算」而非固定 sleep。
- **外壳折叠后点击会「不可见」**：脚本里用 `soften(page)`（真实点击失败即回落 DOM 派发）
  适配，不是站点缺陷。
- **测试探针别重名**：新增字段与既有字段同名会静默覆盖 → 假失败。
