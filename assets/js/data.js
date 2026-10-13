/* ============================================================
 *  data.js — 站点内容层（双语：中文 zh / 英文 en）
 *  内容来源：/Users/Admin/Desktop/homepage/cv/cv_Edwards.md
 *  纯静态数据，无任何外部依赖
 *
 *  window.LANGS = { zh: {...}, en: {...} }
 *  window.CV    = 当前语言的数据对象（app.js 切换语言时整体替换）
 * ============================================================ */
window.LANGS = (function () {
  "use strict";

  /* ============================================================
   * 中文
   * ============================================================ */
  var zh = {
    ui: {
      htmlLang: "zh-CN",
      langLabel: "中文",
      langShort: "CN",
      langSwitchTo: "EN",
      langSwitchTitle: "切换语言：English",
      langToast: "已切换为 中文",

      ownerTag: "本站主人",
      botName: "Edwards 助手",
      botTag: "助手",
      visitor: "访客（你）",
      demoTag: "本机演示",
      autoTag: "自动回复",
      autoFooter: "自动回复为静态演示逻辑 · 内容不会离开本机",

      btnSendMail: "发送邮件",
      btnCopyMail: "复制邮箱",
      btnCopyLink: "复制链接",
      btnViewRepo: "查看仓库",
      copied: "已复制到剪贴板",
      copiedWith: "已复制：",

      toastWelcome: "欢迎 👋 向下滚动浏览全部内容 · 右下角圆钮或 ⌘K 快速跳转 · 同处可切换亮暗主题与语言",
      toastComposerEmpty: "随便说点什么，演示自动回复会接话",
      toastComposerHint: "试试输入「邮箱」「岗位」「项目」「技能」",
      toastBrand: "许航（Edwards）· 具身智能算法工程师",

      composerPlaceholder: "给 #Edwards 发消息…（试试输入「邮箱」「岗位」「项目」后回车）",
      composerHint: "本页为纯本地静态站点，消息不会离开浏览器 · <kbd>⌘K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> 搜索 · <kbd>⌘P</kbd> 打印为 PDF · 真实联系请用 <a href=\"mailto:strawberry.77.111@gmail.com\">邮箱</a>",
      searchPlaceholder: "搜索频道、经历、项目、技能或指令…",
      modalEmpty: "没有匹配结果，试试「经历」「项目」「邮箱」",

      groupChannel: "频道", groupExp: "经历", groupProject: "项目", groupSkill: "技能", groupAction: "操作",
      cmdCopyEmail: "复制邮箱", cmdTheme: "切换主题", cmdPrint: "打印为 PDF",
      themeSystem: "跟随系统", themeDark: "暗色", themeLight: "亮色",

      membersRoles: "身份标签", membersOne: "成员", membersCore: "核心技能 — 熟练度 5/5", membersStats: "关键数据",
      userPanelSuffix: "主题",

      welcome: {
        greet: "欢迎来到我的主页 👋 这里用一条 Discord 服务器的方式装载我的履历。",
        hint: "左侧是频道列表，**点击即可切换**；右上角可以切换亮色 / 暗色主题与语言；按 `Ctrl` + `K` 可以快速跳转。",
        footer: "许航（Edwards）· 软件工程 · 致力于 VLA / AGI 落地",
        footerRight: "更新于 2026.09",
        tip: "下面这个输入框可以试用：随便打一句话并回车，我会给你一个自动回复（演示用，消息仅停留在你本机浏览器）。",
        btnContact: "去 #contact 拿联系方式"
      },
      about: {
        divider: "个人简介",
        tag: "Embodied AI",
        titleAbout: "关于我 / About",
        titleFocus: "当前聚焦",
        titleLang: "语言能力",
        titleWork: "工作方式",
        note: "想看具体的产出与指标？直接跳到这两个频道：",
        btnExp: "#experience 工作经历",
        btnMetrics: "#metrics 亮眼数据"
      },
      exp: {
        divider: "工作经历",
        tag: "经历",
        loc: "🏢 地点", time: "🗓 时间", scope: "🧩 范围",
        next: "下一段经历 ↓",
        tail: "两段经历构成一条完整的链路：**先把 Agent 应用层跑通，再把具身感知层做深**。想快速看成果数字，去 #metrics。",
        btnMetrics: "查看亮眼数据", btnProjects: "查看 3D 作品集"
      },
      metrics: {
        divider: "成果数据",
        tag: "数据",
        title1: "用数字说话",
        desc1: "以下指标均来自实际项目中的性能优化与交付记录，覆盖检索质量、渲染性能、工程效率三类。",
        title2: "核心指标总览",
        footer: "数据来源：企业级 Agentic-RAG 知识库 · 机械臂 VLA 数据与感知工具链",
        note: "这些数字背后的实现细节，都写在 #experience 的条目里。",
        btnBack: "#experience 回到经历"
      },
      portfolio: {
        tag: "3D",
        title: "3D 作品集 · Portfolio",
        desc: "全部项目收在一座可旋转的卡片星座里：拖拽旋转、滚轮推拉、点击卡片沿贝塞尔曲线飞入详情；支持 URL 深链，可以把某个项目直接分享给任何人。移动端自动切换为原生列表。",
        openFull: "全屏打开",
        openFullTitle: "在新标签页打开独立版 3D 作品集",
        github: "GitHub 主页"
      },

      /* #welcome 首屏 HERO（移植自 discord-hero）
       * sub 为刻意保留的英文五行自我介绍（个人风格文案，中英一致）；
       * 其余字段随语言切换。boards[].channel 必须与 channels[].id 一致。 */
      hero: {
        brand: "Edwards_Xu ^航",
        role: "具身智能算法工程师 / Embodied AI Algorithm Engineer",
        sub: [
          "Ex-Algorithm Engineer at an embodied-AI unicorn",
          "Investor of NYSE/NAS | Quant Novice",
          "🐱 Cat&Dog Enthusiast",
          "Building AI-native intelligent hardware",
          "Keen to explore AI frontiers and AGI deployment"
        ],
        ctaExp: "看看我的经历",
        ctaContact: "联系我",
        boardsLabel: "内容板块导航",
        boards: [
          { channel: "portfolio", icon: "cube", label: "3D 作品集", note: "#portfolio" },
          { channel: "about", icon: "user", label: "详细介绍", note: "#about" },
          { channel: "experience", icon: "briefcase", label: "工作经历", note: "#experience" },
          { channel: "metrics", icon: "chart", label: "成果数据", note: "#metrics" },
          { channel: "skills", icon: "toolbox", label: "Tech Stack", note: "#skills" },
          { channel: "contact", icon: "mail", label: "CONTACT", note: "#contact" }
        ],
        boardSearch: "搜索",
        boardSearchNote: "⌘K",
        hint: "点击图标进入对应频道 · 或按 ⌘K 搜索全部内容",
        cue: "向下滚动 · 进入 3D 作品集"
      },
      skills: {
        divider: "技术栈总览",
        tag: "技能",
        title: "Tech Stack",
        desc1: "按「能用 → 能独立交付」排序，5 段条形代表熟练度自评：**5/5 = 可独立设计与交付，3/5 = 会用、能改**。",
        desc2: "下面 7 个分组覆盖我目前完整的工作面：从 VLA / 世界模型、语言基础，到机器人视觉与数据基础设施。",
        fieldGroups: "分组数", fieldGroupsVal: "7 类 · 共 32 项",
        fieldMain: "主力方向", fieldMainVal: "Python · AI Agent · 视觉工程",
        fieldTop: "自评 5/5 项", fieldTopVal: "10 项（见右栏）",
        tail: "技术栈是工具，真正交付的是**结果**：同样一份技能，在我的经历里对应着具体的毫秒、帧率与召回率。",
        btnMetrics: "看成果数据"
      },
      contact: {
        divider: "联系方式",
        title: "找我聊点什么",
        desc1: "开放 **AI Agent / 具身智能 / Web3 / Quant** 相关岗位与项目合作；也欢迎交流 VLA、Agentic-RAG、链上 Agent 基础设施。",
        desc2: "邮件为商务首选渠道，社媒适合随时闲聊。",
        fieldEmail: "📬 邮箱", fieldX: "🐦 X / Twitter", fieldGH: "💻 GitHub", fieldLoc: "📍 常驻",
        footer: "回复通常在 24 小时内",
        footerRight: "Shenzhen · GMT+8",
        note1: "这个站点是一个**纯本地静态页面**：没有后端、没有埋点、没有外部请求，所有内容都来自简历。",
        note2: "按 `Ctrl` + `P` 可以把当前频道打印成 PDF。",
        btnHome: "回到首页"
      },
      replies: [
        {
          keys: ["邮箱", "email", "mail", "联系", "contact", "怎么找"],
          lines: ["我的商务邮箱是 `strawberry.77.111@gmail.com`（仅商务用途）。社媒随时可以闲聊。"],
          go: "contact"
        },
        {
          keys: ["岗位", "招聘", "机会", "合作", "面试", "job", "hire", "offer", "内推"],
          lines: [
            "目前开放 **AI Agent / 具身智能 / Web3 / Quant** 方向的机会，常驻深圳，可接受深圳 / 广州 / 中国香港 / 新加坡。",
            "把 JD 发到邮箱即可，我会尽快回复。"
          ],
          go: "contact"
        },
        {
          keys: ["简历", "cv", "resume", "pdf"],
          lines: ["本站内容全部来自我的简历；如需 .docx / .pdf 版本，发邮件给我，我可以按岗位定制一版。"],
          copy: true
        },
        {
          keys: ["项目", "project", "开源", "github", "黑客松", "hackathon", "作品集", "portfolio", "3d"],
          lines: ["全部项目都收在 3D 作品集里：AVAZone、LingMate、AVA_Truster、SuperMeow、Go Wallet Signer、MetaEarth 3D 等。点开卡片看详情，也可以直接把某个项目的链接分享给别人。"],
          go: "portfolio"
        },
        {
          keys: ["技能", "技术", "stack", "skill", "会什么"],
          lines: ["主攻 Python + AI Agent 全栈，同时具备 PyQt5 / OpenGL 机器人可视化与传感感知经验。"],
          go: "skills"
        },
        {
          keys: ["你好", "hi", "hello", "在吗", "hey", "嗨"],
          lines: ["你好 👋 我是许航（Edwards）。本页是静态演示，想聊正事建议直接发邮件。"],
          go: "experience"
        },
        {
          keys: [],
          lines: ["收到！（演示自动回复）我读到的内容是：「{text}」。", "想聊具体的事情，推荐这几个入口："],
          multi: true
        }
      ],
      metaDesc: "许航（Edwards）— 具身智能算法工程师。VLA 模型、视觉/触觉感知、Agentic-RAG 全栈系统。深圳，开放 AI Agent / 具身智能 / Web3 / Quant 机会。"
    },

    profile: {
      name: "许航",
      nameEn: "Xu Hang",
      handle: "Edwards",
      displayName: "许航（Edwards）",
      title: "具身智能算法工程师",
      titleEn: "Embodied AI Algorithm Engineer",
      headline: "构建 VLA 模型、触觉 / 视觉感知、世界模型与 Agentic-RAG 全栈系统",
      status: "开放 AI Agent / 具身智能 / Web3 / Quant 岗位机会",
      availability: "Open to work",
      locations: ["深圳", "广州", "中国香港", "新加坡"],
      email: "strawberry.77.111@gmail.com",
      emailNote: "仅商务",
      x: "https://x.com/strawberry_1_77",
      xHandle: "@strawberry_1_77",
      github: "https://github.com/strawberry77-1",
      githubHandle: "strawberry77-1",
      avatar: "assets/img/avatar-192.webp",
      bio: "我工作在具身智能与 LLM Agent 的交叉地带：从 VLA 模型的视觉-触觉双模态数据采集，到企业级 Agentic-RAG 产品。能独立负责全流程 —— 算法设计、工程化部署、性能优化 —— 并熟练使用 Agentic 编码工具高效交付。",
      bioAlt: "I work at the intersection of embodied AI and LLM agents: from vision-tactile bimodal data collection for VLA models, to enterprise-grade Agentic-RAG products. I own the full pipeline — algorithm design, engineering deployment, performance optimization — and ship fast with Agentic coding tools (Claude Code / Codex).",
      bioAltLabel: "EN",
      bioShort: "软件工程背景，同时具备「机器人感知算法」与「LLM Agent 全栈工程」两条完整落地经验。习惯以数据与指标驱动迭代，喜欢把原型推到能真跑、能量化的状态。",
      locationLabel: "深圳 / 广州 / 中国香港 / 新加坡",
      major: "软件工程",
      mission: "致力于 VLA / AGI 落地"
    },

    focus: [
      { title: "具身智能 / VLA", desc: "RGB + 阵列触觉双模态数据采集、真机测试、sim-to-real", color: "#5865f2" },
      { title: "AI Agent", desc: "LangGraph 多智能体编排、Hybrid Search、RAG 评估闭环", color: "#23a55a" },
      { title: "触觉与视觉感知", desc: "接触 / 滑移检测、稠密光流加速、特征自适应归一化", color: "#f0b232" },
      { title: "图像算法工程", desc: "PyQt5 / OpenGL 实时可视化、并发优化、全栈流式交互", color: "#eb459e" },
      { title: "世界模型", desc: "面向具身决策的环境建模与生成式场景构建", color: "#00a8fc" },
      { title: "Web3 & 量化", desc: "Agent 经济基础设施、链上验证、量化策略探索", color: "#f23f43" }
    ],

    languages: [
      { name: "中文", level: "母语 / Native", desc: "技术方案撰写、跨团队协作、对外讲解", pct: 100 },
      { name: "英语", level: "CET-6 · 口语接近母语", desc: "可流畅阅读英文技术文档、进行全英技术交流，适应英语工作环境", pct: 82 }
    ],

    experience: [
      {
        role: "AI Agent 工程师", roleEn: "AI Agent Engineer", scope: "全栈",
        location: "深圳", period: "2026.01 – 2026.04",
        summary: "从零构建企业级 Agentic-RAG 知识库：上传 → 三级分块 → 向量库 → 流式问答，端到端独立交付。",
        points: [
          { text: "设计 Dense(BGE-m3) + BM25 双塔 Hybrid Search，采用 RRF(k=60) 融合与 Corrective RAG；Hybrid recall@3 达 48/50（Dense 43、BM25 45）", metric: "recall@3 48/50" },
          { text: "解决国内模型加载阻塞问题：经 ModelScope 拉取 bge-m3（2.27GB）实现完全本地部署，移除 HuggingFace 依赖", metric: "全本地部署" },
          { text: "适配 DeepSeek 系列模型与 LangChain 结构化输出；通过 function_calling + extra_body 修复 thinking 与 tool_choice 冲突", metric: "结构化输出" },
          { text: "搭建离线 RAG 评估闭环（50 条标注查询）：BM25 约 8ms vs Dense 192ms，检索侧提速约 23×", metric: "23× 检索提速" },
          { text: "全栈流式交互：SSE 逐 token 推送 + AbortController 中断；每次中断节省约 75% token 消耗", metric: "省 75% token" },
          { text: "工程化：JWT + RBAC 中间件、Redis 多级缓存（P95 < 15ms）；3 周独立交付 25k+ 行全栈代码", metric: "25k+ 行 / 3 周" }
        ],
        tags: ["Python", "LangChain", "Milvus", "Redis", "FastAPI", "SSE", "RAG"],
        color: "#5865f2"
      },
      {
        role: "具身智能算法工程师", roleEn: "Embodied AI Algorithm Engineer", scope: "算法 + 工程",
        location: "深圳", period: "2026.04 – 2026.07",
        summary: "为 VLA 模型研发闭环（机械臂接触密集任务）构建数据与感知工具链。",
        points: [
          { text: "开发 RGB + 阵列触觉双模态数据采集与真机测试工具（PyQt5 + OpenCV），采集 → 校验 → 迭代周期缩短 60%", metric: "周期 -60%" },
          { text: "重构可视化 GUI（约 1900 行，PyQt5 + OpenGL）：主线程帧耗时 60–110ms → 10–25ms，FPS 12–18 → 25–30（约 4×）", metric: "FPS 约 4×" },
          { text: "优化 Farneback 稠密光流至 0.05ms/帧（数量级提升）；修复 3000+ mN 空闲力与去皮死循环缺陷", metric: "0.05ms/帧" },
          { text: "重写接触 / 滑移检测：以像素计数门控替代 fz 标量门控，消除环境光误触发", metric: "误触发消除" },
          { text: "设计 17 维触觉特征自适应归一化方案，运行时跟踪最大值，无需先验量程", metric: "17 维自适应" }
        ],
        tags: ["PyQt5", "OpenGL", "OpenCV", "VLA", "Tactile", "Sim-to-Real"],
        color: "#23a55a"
      }
    ],

    /* 项目索引：仅服务于 ⌘K 搜索深链（跳转 #/portfolio/project/<id>）。
       项目的完整内容（简介 / 高亮 / 指标 / 链接）由 3D 作品集页承载
       （构建自 portfolio3d，单文件位于 assets/portfolio/index.html），
       不在此重复维护，避免两处数据不一致。id 须与作品集数据一致。 */
    projects: [
      { id: "avazone", name: "AVAZone", tagline: "AI Agent 经济特区", url: "https://github.com/strawberry77-1/AVAZone" },
      { id: "lingmate", name: "LingMate", tagline: "面向老人的 AI 语音生活助手", url: "https://github.com/strawberry77-1/lingmate" },
      { id: "ava-truster", name: "AVA_Truster", tagline: "Agent-to-Agent 交易验证框架", url: "https://github.com/strawberry77-1/AVA_Truster" },
      { id: "supermeow", name: "SuperMeow", tagline: "Graph-RAG 企业级知识库实验场", url: "https://github.com/strawberry77-1/SuperMeow" },
      { id: "go-signer", name: "Go Wallet Signer", tagline: "Agent 自主签名服务", url: "" },
      { id: "metaearth3d", name: "MetaEarth 3D", tagline: "生成式大规模 3D 场景", url: "" },
      { id: "discord-hero", name: "Discord Hero", tagline: "品牌展示页 · Canvas 粒子系统", url: "" },
      { id: "discord-cv", name: "Discord CV", tagline: "履历站的界面隐喻", url: "" }
    ],

    skillGroups: [
      { name: "VLA / 世界模型", icon: "robot", color: "#2dd4bf", items: [
        { name: "VLA 数据集构建", level: 5 }, { name: "Sim-to-Real", level: 5 },
        { name: "视觉-触觉双模态采集", level: 5 }, { name: "世界模型 / 环境建模", level: 4 },
        { name: "真机部署与测试", level: 4 }, { name: "接触 / 滑移检测", level: 4 } ] },
      { name: "编程语言", icon: "code", color: "#5865f2", items: [
        { name: "Python", level: 5 }, { name: "TypeScript", level: 4 }, { name: "Java", level: 3 },
        { name: "Go", level: 3 }, { name: "Solidity", level: 3 } ] },
      { name: "前端", icon: "layout", color: "#eb459e", items: [
        { name: "React", level: 4 }, { name: "Vue3", level: 4 }, { name: "Vite", level: 4 },
        { name: "HTML / CSS", level: 3 } ] },
      { name: "后端与框架", icon: "server", color: "#23a55a", items: [
        { name: "FastAPI", level: 5 }, { name: "Spring Boot", level: 3 },
        { name: "SSE / 流式接口", level: 4 }, { name: "JWT / RBAC", level: 4 } ] },
      { name: "AI 与 Agent", icon: "spark", color: "#f0b232", items: [
        { name: "LangChain", level: 5 }, { name: "LangGraph", level: 5 }, { name: "vLLM", level: 4 },
        { name: "BGE-m3 / BM25", level: 4 }, { name: "Agentic-RAG", level: 5 } ] },
      { name: "机器人与视觉", icon: "cpu", color: "#00a8fc", items: [
        { name: "OpenCV", level: 5 }, { name: "OpenGL", level: 4 }, { name: "PyQt5", level: 5 },
        { name: "光学 / 触觉传感", level: 4 } ] },
      { name: "数据与基础设施", icon: "database", color: "#f23f43", items: [
        { name: "PostgreSQL", level: 4 }, { name: "Milvus", level: 4 }, { name: "Redis", level: 4 },
        { name: "Docker", level: 3 } ] }
    ],

    metrics: [
      { value: "48/50", label: "Hybrid recall@3", note: "Dense 43 · BM25 45", color: "#5865f2" },
      { value: "23×", label: "检索侧提速", note: "BM25 8ms vs Dense 192ms", color: "#23a55a" },
      { value: "4×", label: "可视化帧率提升", note: "FPS 12–18 → 25–30", color: "#f0b232" },
      { value: "25k+", label: "行全栈代码 / 3 周", note: "独立交付", color: "#eb459e" },
      { value: "1.2s", label: "语音交互端到端延迟", note: "LingMate 三节点", color: "#00a8fc" },
      { value: "-60%", label: "采集迭代周期", note: "双模态工具链", color: "#f23f43" },
      { value: "0.05ms", label: "稠密光流单帧耗时", note: "Farneback 优化", color: "#5865f2" },
      { value: "P95<15ms", label: "Redis 多级缓存", note: "问答链路", color: "#23a55a" }
    ],

    principles: [
      "指标优先：每个优化都落到可复现的数字（FPS、ms、recall、token）",
      "端到端负责：算法设计 → 工程落地 → 性能调优，独立走完全流程",
      "工程审美：能跑的 Demo 只是起点，可维护与可观测才是交付标准",
      "Agent 协同：熟练以 Claude Code / Codex 驱动开发，把重复劳动交给工具"
    ],

    channels: [
      { id: "welcome", name: "welcome", icon: "home", topic: "欢迎来到 Edwards 的主页 · 快速了解我", category: "开始" },
      { id: "portfolio", name: "portfolio", icon: "cube", topic: "3D 卡片作品集 · 拖拽旋转 · 点击展开 · 支持深链", category: "开始" },
      { id: "about", name: "about", icon: "user", topic: "个人简介 · 当前聚焦 · 语言能力", category: "开始" },
      { id: "experience", name: "experience", icon: "briefcase", topic: "两段深圳工作经历 · 从算法到全栈落地", category: "职业" },
      { id: "metrics", name: "metrics", icon: "chart", topic: "用数字说话：性能优化与交付成果", category: "职业" },
      { id: "skills", name: "skills", icon: "toolbox", topic: "技术栈总览", category: "作品" },
      { id: "contact", name: "contact", icon: "mail", topic: "联系方式 · 合作与机会", category: "联系" }
    ]
  };

  /* ============================================================
   * English
   * ============================================================ */
  var en = {
    ui: {
      htmlLang: "en",
      langLabel: "English",
      langShort: "EN",
      langSwitchTo: "CN",
      langSwitchTitle: "Switch language: 中文",
      langToast: "Switched to English",

      ownerTag: "OWNER",
      botName: "Edwards Bot",
      botTag: "BOT",
      visitor: "Visitor (you)",
      demoTag: "LOCAL DEMO",
      autoTag: "AUTO REPLY",
      autoFooter: "Auto-reply is a static demo · nothing leaves your browser",

      btnSendMail: "Email me",
      btnCopyMail: "Copy email",
      btnCopyLink: "Copy link",
      btnViewRepo: "View repo",
      copied: "Copied to clipboard",
      copiedWith: "Copied: ",

      toastWelcome: "Welcome 👋 scroll through everything · bottom-right buttons or ⌘K to jump · theme & language live there too",
      toastComposerEmpty: "Type anything — the demo auto-reply will answer",
      toastComposerHint: "Try typing \"email\", \"job\", \"projects\" or \"skills\"",
      toastBrand: "Xu Hang (Edwards) · Embodied AI Algorithm Engineer",

      composerPlaceholder: "Message #Edwards… (try \"email\", \"job\", \"projects\" then Enter)",
      composerHint: "Purely local static site — messages never leave your browser · <kbd>⌘K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> to search · <kbd>⌘P</kbd> to print as PDF · reach me via <a href=\"mailto:strawberry.77.111@gmail.com\">email</a>",
      searchPlaceholder: "Search channels, roles, projects, skills or commands…",
      modalEmpty: "No matches — try \"experience\", \"projects\" or \"email\"",

      groupChannel: "Channels", groupExp: "Experience", groupProject: "Projects", groupSkill: "Skills", groupAction: "Actions",
      cmdCopyEmail: "Copy email", cmdTheme: "Switch theme", cmdPrint: "Print as PDF",
      themeSystem: "System", themeDark: "Dark", themeLight: "Light",

      membersRoles: "ROLES", membersOne: "MEMBERS", membersCore: "CORE SKILLS — 5/5", membersStats: "KEY NUMBERS",
      userPanelSuffix: "theme",

      welcome: {
        greet: "Welcome to my homepage 👋 it's a Discord server carrying my whole résumé.",
        hint: "Channel list on the left — **click to switch**; top-right toggles light / dark theme and language; press `Ctrl` + `K` to jump anywhere.",
        footer: "Xu Hang (Edwards) · Software Engineering · shipping VLA / AGI",
        footerRight: "Updated 2026.09",
        tip: "The input below is live: type anything and hit Enter — you'll get an auto-reply (demo only, nothing leaves your browser).",
        btnContact: "Get my contacts in #contact"
      },
      about: {
        divider: "About",
        tag: "Embodied AI",
        titleAbout: "About me",
        titleFocus: "Now focusing on",
        titleLang: "Languages",
        titleWork: "How I work",
        note: "Want the concrete outputs and numbers? Jump straight to these two channels:",
        btnExp: "#experience Experience",
        btnMetrics: "#metrics Highlights"
      },
      exp: {
        divider: "Experience",
        tag: "ROLE",
        loc: "📍 Location", time: "🗓 Period", scope: "🧩 Scope",
        next: "Next role ↓",
        tail: "These two roles form one chain: **first make the Agent application layer work end-to-end, then go deep on embodied perception**. For the numbers, see #metrics.",
        btnMetrics: "See the numbers", btnProjects: "See the 3D portfolio"
      },
      metrics: {
        divider: "Results",
        tag: "DATA",
        title1: "Numbers first",
        desc1: "All figures come from real performance work and delivery records: retrieval quality, rendering performance, engineering throughput.",
        title2: "Key metrics",
        footer: "Source: enterprise Agentic-RAG knowledge base · robot-arm VLA data & perception toolchain",
        note: "The implementation details behind these numbers are in #experience.",
        btnBack: "#experience Back to experience"
      },
      portfolio: {
        tag: "3D",
        title: "3D Portfolio",
        desc: "Every project lives on a draggable card constellation: drag to rotate, scroll to zoom, click a card to fly into its detail view. Deep links supported — share any single project directly. Mobile falls back to a native list.",
        openFull: "Open fullscreen",
        openFullTitle: "Open the standalone 3D portfolio in a new tab",
        github: "GitHub profile"
      },

      /* #welcome HERO first screen (ported from discord-hero).
       * `sub` intentionally stays English in both languages (personal-brand copy);
       * everything else follows the language toggle. */
      hero: {
        brand: "Edwards_Xu ^航",
        role: "Embodied AI Algorithm Engineer",
        sub: [
          "Ex-Algorithm Engineer at an embodied-AI unicorn",
          "Investor of NYSE/NAS | Quant Novice",
          "🐱 Cat&Dog Enthusiast",
          "Building AI-native intelligent hardware",
          "Keen to explore AI frontiers and AGI deployment"
        ],
        ctaExp: "View my experience",
        ctaContact: "Get in touch",
        boardsLabel: "Section navigation",
        boards: [
          { channel: "portfolio", icon: "cube", label: "3D Portfolio", note: "#portfolio" },
          { channel: "about", icon: "user", label: "About", note: "#about" },
          { channel: "experience", icon: "briefcase", label: "Experience", note: "#experience" },
          { channel: "metrics", icon: "chart", label: "Highlights", note: "#metrics" },
          { channel: "skills", icon: "toolbox", label: "Tech Stack", note: "#skills" },
          { channel: "contact", icon: "mail", label: "Contact", note: "#contact" }
        ],
        boardSearch: "Search",
        boardSearchNote: "⌘K",
        hint: "Click a tile to open that channel · or press ⌘K to search everything",
        cue: "Scroll down · 3D portfolio"
      },
      skills: {
        divider: "Tech stack",
        tag: "SKILLS",
        title: "Tech Stack",
        desc1: "Sorted by \"can use it → can ship it myself\"; the 5-segment bar is a self-assessment: **5/5 = I can design and deliver it myself, 3/5 = I can use and modify it**.",
        desc2: "Seven groups cover my full working surface: VLA & world models, languages, frontend, backend, AI agents, robotics vision and data infrastructure.",
        fieldGroups: "Groups", fieldGroupsVal: "7 groups · 32 items",
        fieldMain: "Main focus", fieldMainVal: "Python · AI Agent · Vision engineering",
        fieldTop: "Self-rated 5/5", fieldTopVal: "10 items (see right panel)",
        tail: "The stack is a tool; what ships is **results** — the same skills produced specific milliseconds, frame rates and recall in my work.",
        btnMetrics: "See the numbers"
      },
      contact: {
        divider: "Contact",
        title: "Let's talk",
        desc1: "Open to roles and collaborations in **AI Agent / embodied AI / Web3 / Quant**; happy to discuss VLA, Agentic-RAG and on-chain agent infrastructure.",
        desc2: "Email for anything business; socials for casual chat.",
        fieldEmail: "📬 Email", fieldX: "🐦 X / Twitter", fieldGH: "💻 GitHub", fieldLoc: "📍 Based in",
        footer: "Usually replies within 24h",
        footerRight: "Shenzhen · GMT+8",
        note1: "This site is a **purely local static page**: no backend, no tracking, no external requests — all content comes from my CV.",
        note2: "Press `Ctrl` + `P` to print the current channel as PDF.",
        btnHome: "Back to top"
      },
      replies: [
        {
          keys: ["邮箱", "email", "mail", "联系", "contact"],
          lines: ["My business email is `strawberry.77.111@gmail.com` (business only). Socials are fine for casual chat."],
          go: "contact"
        },
        {
          keys: ["岗位", "招聘", "机会", "合作", "面试", "job", "hire", "offer", "role", "opportunity"],
          lines: [
            "Currently open to **AI Agent / embodied AI / Web3 / Quant** roles — based in Shenzhen, open to Shenzhen / Guangzhou / Hong Kong SAR / Singapore.",
            "Send the JD to my email and I'll get back to you quickly."
          ],
          go: "contact"
        },
        {
          keys: ["简历", "cv", "resume", "pdf"],
          lines: ["Everything here comes from my CV — for .docx / .pdf versions, email me and I'll tailor one for the role."],
          copy: true
        },
        {
          keys: ["项目", "project", "开源", "github", "黑客松", "hackathon", "作品集", "portfolio", "3d"],
          lines: ["Every project lives in the 3D portfolio: AVAZone, LingMate, AVA_Truster, SuperMeow, Go Wallet Signer, MetaEarth 3D and more. Click a card for details — or share a direct link to any single project."],
          go: "portfolio"
        },
        {
          keys: ["技能", "技术", "stack", "skill"],
          lines: ["Python plus AI Agent full-stack, with PyQt5 / OpenGL robotics visualization and tactile-vision perception on top."],
          go: "skills"
        },
        {
          keys: ["你好", "hi", "hello", "在吗", "hey", "嗨"],
          lines: ["Hey 👋 I'm Xu Hang (Edwards). This page is a static demo — for real business, email is the fastest way."],
          go: "experience"
        },
        {
          keys: [],
          lines: ["Got it! (demo auto-reply) I read: \"{text}\".", "For anything specific, start here:"],
          multi: true
        }
      ],
      metaDesc: "Xu Hang (Edwards) — Embodied AI Algorithm Engineer building VLA models, tactile/vision perception and Agentic-RAG full-stack systems. Based in Shenzhen; open to AI Agent / embodied AI / Web3 / Quant roles."
    },

    profile: {
      name: "Xu Hang",
      nameEn: "Xu Hang",
      handle: "Edwards",
      displayName: "Xu Hang (Edwards)",
      title: "Embodied AI Algorithm Engineer",
      titleEn: "Embodied AI Algorithm Engineer",
      headline: "Building VLA models, tactile / vision perception, world models and Agentic-RAG full-stack systems",
      status: "Open to AI Agent / embodied AI / Web3 / Quant roles",
      availability: "Open to work",
      locations: ["Shenzhen", "Guangzhou", "Hong Kong SAR", "Singapore"],
      email: "strawberry.77.111@gmail.com",
      emailNote: "business only",
      x: "https://x.com/strawberry_1_77",
      xHandle: "@strawberry_1_77",
      github: "https://github.com/strawberry77-1",
      githubHandle: "strawberry77-1",
      avatar: "assets/img/avatar-192.webp",
      bio: "I work at the intersection of embodied AI and LLM agents: from vision-tactile bimodal data collection for VLA models, to enterprise-grade Agentic-RAG products. I own the full pipeline — algorithm design, engineering deployment, performance optimization — and ship fast with Agentic coding tools (Claude Code / Codex).",
      bioAlt: "我工作在具身智能与 LLM Agent 的交叉地带：从 VLA 模型的视觉-触觉双模态数据采集，到企业级 Agentic-RAG 产品。能独立负责全流程 —— 算法设计、工程化部署、性能优化 —— 并熟练使用 Agentic 编码工具高效交付。",
      bioAltLabel: "中文",
      bioShort: "Software engineering background with two complete delivery tracks — robot perception algorithms and LLM Agent full-stack engineering. I iterate on data and metrics, and push prototypes until they actually run and can be measured.",
      locationLabel: "Shenzhen / Guangzhou / Hong Kong SAR / Singapore",
      major: "Software Engineering",
      mission: "Shipping VLA / AGI"
    },

    focus: [
      { title: "Embodied AI / VLA", desc: "RGB + array-tactile bimodal data collection, real-robot testing, sim-to-real", color: "#5865f2" },
      { title: "AI Agent", desc: "LangGraph multi-agent orchestration, Hybrid Search, RAG evaluation loops", color: "#23a55a" },
      { title: "Tactile & vision perception", desc: "Contact / slip detection, dense optical-flow acceleration, adaptive feature normalization", color: "#f0b232" },
      { title: "Vision engineering", desc: "PyQt5 / OpenGL real-time visualization, concurrency, full-stack streaming", color: "#eb459e" },
      { title: "World model", desc: "Environment modeling and generative scene construction for embodied decisions", color: "#00a8fc" },
      { title: "Web3 & quant", desc: "Agent economy infrastructure, on-chain verification, quant strategies", color: "#f23f43" }
    ],

    languages: [
      { name: "Chinese", level: "Native", desc: "Technical writing, cross-team collaboration, external talks", pct: 100 },
      { name: "English", level: "CET-6 · near-native speaking", desc: "Reads English technical docs fluently; comfortable with full-English technical discussion and English-speaking work environments", pct: 82 }
    ],

    experience: [
      {
        role: "AI Agent Engineer", roleEn: "AI Agent Engineer", scope: "Full-stack",
        location: "Shenzhen", period: "2026.01 – 2026.04",
        summary: "Built an enterprise-grade Agentic-RAG knowledge base from scratch: upload → 3-level chunking → vector store → streaming QA, delivered end to end solo.",
        points: [
          { text: "Designed Dense(BGE-m3) + BM25 dual-tower Hybrid Search with RRF(k=60) fusion and Corrective RAG; Hybrid recall@3 reached 48/50 (vs 43 Dense, 45 BM25)", metric: "recall@3 48/50" },
          { text: "Solved model-loading blockage in China: pulled bge-m3 (2.27GB) via ModelScope for fully local deployment, removing the HuggingFace dependency", metric: "fully local" },
          { text: "Adapted DeepSeek-series models with LangChain structured output; fixed thinking / tool_choice conflicts via function_calling + extra_body", metric: "structured output" },
          { text: "Built an offline RAG eval loop (50 labeled queries): BM25 ~8ms vs Dense 192ms — about 23× faster retrieval", metric: "23× faster" },
          { text: "Full-stack streaming: SSE token-by-token push + AbortController; ~75% token savings per abort", metric: "−75% tokens" },
          { text: "Engineering: JWT + RBAC middleware, Redis multi-level cache (P95 < 15ms); shipped 25k+ lines of full-stack code solo in 3 weeks", metric: "25k+ lines / 3 wks" }
        ],
        tags: ["Python", "LangChain", "Milvus", "Redis", "FastAPI", "SSE", "RAG"],
        color: "#5865f2"
      },
      {
        role: "Embodied AI Algorithm Engineer", roleEn: "Embodied AI Algorithm Engineer", scope: "Algorithms + engineering",
        location: "Shenzhen", period: "2026.04 – 2026.07",
        summary: "Built the data and perception toolchain for a VLA model R&D loop (robot-arm contact-intensive tasks).",
        points: [
          { text: "Developed RGB + array-tactile bimodal data-collection and real-robot testing tools (PyQt5 + OpenCV); cut the collect → verify → iterate cycle by 60%", metric: "cycle −60%" },
          { text: "Refactored the visualization GUI (~1,900 lines) with PyQt5 + OpenGL: main-thread frame time 60–110ms → 10–25ms, FPS 12–18 → 25–30 (~4×)", metric: "FPS ~4×" },
          { text: "Optimized Farneback dense optical flow to 0.05ms/frame (orders of magnitude); fixed 3000+ mN idle-force and tare dead-loop defects", metric: "0.05ms/frame" },
          { text: "Rewrote contact / slip detection: pixel-count gating replaced fz-scalar gating, eliminating ambient-light false triggers", metric: "no false triggers" },
          { text: "Designed 17-dimensional tactile-feature adaptive normalization with runtime max-tracking (no prior range needed)", metric: "17-dim adaptive" }
        ],
        tags: ["PyQt5", "OpenGL", "OpenCV", "VLA", "Tactile", "Sim-to-Real"],
        color: "#23a55a"
      }
    ],

    /* 项目索引：仅服务于 ⌘K 搜索深链（跳转 #/portfolio/project/<id>）。
       项目的完整内容由 3D 作品集页承载（构建自 portfolio3d，单文件位于
       assets/portfolio/index.html），不在此重复维护。id 须与作品集数据一致。 */
    projects: [
      { id: "avazone", name: "AVAZone", tagline: "A Special Economic Zone for AI Agents", url: "https://github.com/strawberry77-1/AVAZone" },
      { id: "lingmate", name: "LingMate", tagline: "AI voice life assistant for the elderly", url: "https://github.com/strawberry77-1/lingmate" },
      { id: "ava-truster", name: "AVA_Truster", tagline: "Agent-to-agent transaction verification framework", url: "https://github.com/strawberry77-1/AVA_Truster" },
      { id: "supermeow", name: "SuperMeow", tagline: "Enterprise Graph-RAG knowledge base", url: "https://github.com/strawberry77-1/SuperMeow" },
      { id: "go-signer", name: "Go Wallet Signer", tagline: "Controlled signing service for AI agents", url: "" },
      { id: "metaearth3d", name: "MetaEarth 3D", tagline: "Generative large-scale 3D scenes", url: "" },
      { id: "discord-hero", name: "Discord Hero", tagline: "Brand landing page · Canvas particles", url: "" },
      { id: "discord-cv", name: "Discord CV", tagline: "A résumé as a Discord-style site", url: "" }
    ],

    skillGroups: [
      { name: "VLA & world models", icon: "robot", color: "#2dd4bf", items: [
        { name: "VLA datasets", level: 5 }, { name: "Sim-to-real", level: 5 },
        { name: "Vision-tactile bimodal capture", level: 5 }, { name: "World models", level: 4 },
        { name: "Real-robot deployment & testing", level: 4 }, { name: "Contact / slip detection", level: 4 } ] },
      { name: "Languages", icon: "code", color: "#5865f2", items: [
        { name: "Python", level: 5 }, { name: "TypeScript", level: 4 }, { name: "Java", level: 3 },
        { name: "Go", level: 3 }, { name: "Solidity", level: 3 } ] },
      { name: "Frontend", icon: "layout", color: "#eb459e", items: [
        { name: "React", level: 4 }, { name: "Vue3", level: 4 }, { name: "Vite", level: 4 },
        { name: "HTML / CSS", level: 3 } ] },
      { name: "Backend & frameworks", icon: "server", color: "#23a55a", items: [
        { name: "FastAPI", level: 5 }, { name: "Spring Boot", level: 3 },
        { name: "SSE / streaming APIs", level: 4 }, { name: "JWT / RBAC", level: 4 } ] },
      { name: "AI & agents", icon: "spark", color: "#f0b232", items: [
        { name: "LangChain", level: 5 }, { name: "LangGraph", level: 5 }, { name: "vLLM", level: 4 },
        { name: "BGE-m3 / BM25", level: 4 }, { name: "Agentic-RAG", level: 5 } ] },
      { name: "Robotics & vision", icon: "cpu", color: "#00a8fc", items: [
        { name: "OpenCV", level: 5 }, { name: "OpenGL", level: 4 }, { name: "PyQt5", level: 5 },
        { name: "Optical / tactile sensing", level: 4 } ] },
      { name: "Data & infrastructure", icon: "database", color: "#f23f43", items: [
        { name: "PostgreSQL", level: 4 }, { name: "Milvus", level: 4 }, { name: "Redis", level: 4 },
        { name: "Docker", level: 3 } ] }
    ],

    metrics: [
      { value: "48/50", label: "Hybrid recall@3", note: "Dense 43 · BM25 45", color: "#5865f2" },
      { value: "23×", label: "retrieval speed-up", note: "BM25 8ms vs Dense 192ms", color: "#23a55a" },
      { value: "4×", label: "visualization FPS", note: "FPS 12–18 → 25–30", color: "#f0b232" },
      { value: "25k+", label: "lines of code / 3 weeks", note: "solo delivery", color: "#eb459e" },
      { value: "1.2s", label: "voice E2E latency", note: "LingMate 3-node", color: "#00a8fc" },
      { value: "-60%", label: "data iteration cycle", note: "bimodal toolchain", color: "#f23f43" },
      { value: "0.05ms", label: "dense optical flow / frame", note: "Farneback optimized", color: "#5865f2" },
      { value: "P95<15ms", label: "Redis multi-level cache", note: "QA pipeline", color: "#23a55a" }
    ],

    principles: [
      "Metrics first: every optimization lands on a reproducible number (FPS, ms, recall, tokens)",
      "End-to-end ownership: algorithm design → engineering → performance tuning, all by myself",
      "Engineering taste: a running demo is just the start; maintainability and observability are the delivery bar",
      "Agent collaboration: drive development with Claude Code / Codex and hand repetitive work to tools"
    ],

    channels: [
      { id: "welcome", name: "welcome", icon: "home", topic: "Welcome to Edwards' homepage · quick overview", category: "START" },
      { id: "portfolio", name: "portfolio", icon: "cube", topic: "3D card portfolio · drag to rotate · click to expand · deep links", category: "START" },
      { id: "about", name: "about", icon: "user", topic: "Bio · current focus · languages", category: "START" },
      { id: "experience", name: "experience", icon: "briefcase", topic: "Two roles in Shenzhen · from algorithms to full-stack delivery", category: "CAREER" },
      { id: "metrics", name: "metrics", icon: "chart", topic: "Numbers only: performance and delivery results", category: "CAREER" },
      { id: "skills", name: "skills", icon: "toolbox", topic: "Tech stack at a glance", category: "WORK" },
      { id: "contact", name: "contact", icon: "mail", topic: "Contacts · collaboration and opportunities", category: "CONNECT" }
    ]
  };

  return { zh: zh, en: en };
})();

/* 当前语言数据（app.js 切换语言时替换该引用） */
window.CV = window.LANGS.zh;
