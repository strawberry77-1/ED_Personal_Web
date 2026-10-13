/* ============================================================
 *  app.js — Discord 风格个人网站（中 / 英双语）
 *  纯原生 JS（无构建、无依赖、file:// 可直接打开）
 * ============================================================ */
(function () {
  "use strict";

  var LANGS = window.LANGS;
  var CV = window.CV;          // 当前语言数据（setLang 时整体替换）
  var P = CV.profile;
  var U = CV.ui;

  /* ============================================================
   * 0. 图标
   * ============================================================ */
  var ICONS = {
    home: '<path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-4.2v-6H9.2v6H5a1 1 0 0 1-1-1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21v-.8A5.7 5.7 0 0 1 10.2 14.5h3.6a5.7 5.7 0 0 1 5.7 5.7V21"/>',
    briefcase: '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/><path d="M3 12.5h18"/>',
    chart: '<path d="M3 20.5h18"/><path d="M5.5 20.5V11.5"/><path d="M11 20.5V4.5"/><path d="M16.5 20.5v-6"/><path d="M22 20.5"/>',
    rocket: '<path d="M12 3c3.4 1.6 5.4 4.9 5.4 8.4 0 1.9-.9 3.4-1 5.3H7.6c-.1-1.9-1-3.4-1-5.3C6.6 7.9 8.6 4.6 12 3z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 19.6c.6 1.7 1.6 2.4 3 2.4s2.4-.7 3-2.4"/>',
    toolbox: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8.5 8V6.2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8"/><path d="M3 12.5h18"/><path d="M10.5 12.5v3h3v-3"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.8 7.2 12 13.4l9.2-6.2"/>',
    hash: '<path d="M9.5 3 7.5 21"/><path d="M16.5 3l-2 18"/><path d="M4 8.5h16"/><path d="M3 15.5h16"/>',
    chevronDown: '<path d="M6 9.5 12 15l6-5.5"/>',
    chevronRight: '<path d="M9.5 6 15 12l-5.5 6"/>',
    arrowRight: '<path d="M5 12h13"/><path d="m12 5 7 7-7 7"/>',
    monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 21h7"/><path d="M12 17.5V21"/>',
    moon: '<path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/>',
    send: '<path d="M21.5 2.5 10.8 13.2"/><path d="M21.5 2.5 14.8 21.5l-4-8.3-8.3-4z"/>',
    plus: '<circle cx="12" cy="12" r="9.5"/><path d="M12 8v8M8 12h8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 16 16"/>',
    menu: '<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5.5 15H4.5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1H14a1 1 0 0 1 1 1v1"/>',
    globe: '<circle cx="12" cy="12" r="9.3"/><path d="M2.8 12h18.4"/><path d="M12 2.7c2.6 2.6 3.9 5.9 3.9 9.3s-1.3 6.7-3.9 9.3c-2.6-2.6-3.9-5.9-3.9-9.3S9.4 5.3 12 2.7z"/>',
    download: '<path d="M12 3.5v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M4 19.5h16"/>',
    pin: '<path d="M9.5 3.5h5l-.7 5.2 3 2.8v1.5H7.2V11.5l3-2.8z"/><path d="M12 13v7.5"/>',
    check: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
    zap: '<path d="M13.5 2.5 4.5 14h6l-1 7.5 9-11.5h-6z"/>',
    cpu: '<rect x="4.5" y="4.5" width="15" height="15" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    robot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V5.2"/><circle cx="12" cy="3.6" r="1.2"/><circle cx="9.2" cy="13" r="1.15" fill="currentColor" stroke="none"/><circle cx="14.8" cy="13" r="1.15" fill="currentColor" stroke="none"/><path d="M9.6 16.4h4.8"/><path d="M2.2 12.5v3M21.8 12.5v3"/>',
    cube: '<path d="M12 2.6 20.4 7.2v9.6L12 21.4 3.6 16.8V7.2z"/><path d="M3.6 7.2 12 11.8l8.4-4.6M12 11.8v9.6"/>'
  };

  var FILLED = {
    github: '<path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58l-.01-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/>',
    x: '<path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.4L2.2 2h6.4l4.6 6.1z"/>'
  };

  function svg(name, size, extra) {
    size = size || 20;
    var cls = "ico" + (extra ? " " + extra : "");
    if (FILLED[name]) {
      return '<svg class="' + cls + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + FILLED[name] + "</svg>";
    }
    var body = ICONS[name] || "";
    return (
      '<svg class="' + cls + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body + "</svg>"
    );
  }

  /* ============================================================
   * 1. 工具函数
   * ============================================================ */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  /** 允许在文本里使用 `code`、**粗体** 与 @提及 */
  function rich(s) {
    var out = esc(s);
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--text-strong)">$1</strong>');
    out = out.replace(/@(Edwards|许航)/g, '<span class="mention" data-goto="contact">@$1</span>');
    return out;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var toastTimer = null;
  function toast(text) {
    var node = $("#toast");
    node.innerHTML = text;
    node.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.classList.remove("is-open"); }, 2400);
  }

  function copyText(text, okMsg) {
    var done = function () { toast(okMsg || U.copied); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed — please select manually"); }
      document.body.removeChild(ta);
    }
  }

  function nowClock() {
    var d = new Date();
    return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  /* ============================================================
   * 2. HTML 构件
   * ============================================================ */
  function divider(label) {
    return '<div class="divider"><span>' + esc(label) + "</span></div>";
  }
  function line(text, cls) {
    return '<div class="msg__text' + (cls ? " " + cls : "") + '">' + (text.indexOf("<") === 0 ? text : rich(text)) + "</div>";
  }
  function field(name, value, muted) {
    return (
      '<div class="field"><div class="field__name">' + esc(name) + "</div>" +
      '<div class="field__value' + (muted ? " field__value--muted" : "") + '">' + rich(value) + "</div></div>"
    );
  }
  function chips(list, brand) {
    if (!list || !list.length) return "";
    return '<div class="chips">' + list.map(function (t) {
      return '<span class="chip' + (brand ? " chip--brand" : "") + '">' + esc(t) + "</span>";
    }).join("") + "</div>";
  }
  /** embed({accent,icon,title,titleTag,tagClass,desc:[],quote,fieldsHtml,chips,chipsBrand,buttons,footer,footerRight,html,wide}) */
  function embed(o) {
    o = o || {};
    var h = '<div class="embed' + (o.wide ? " embed--wide" : "") + '"' +
      (o.accent ? ' style="--embed-accent:' + o.accent + '"' : "") + ">";
    if (o.author) {
      h += '<div class="embed__author"><img src="' + P.avatar + '" alt=""><span>' + esc(o.author) + "</span></div>";
    }
    if (o.title) {
      h += '<div class="embed__title">';
      if (o.icon) h += svg(o.icon, 18);
      h += rich(o.title);
      if (o.titleTag) h += '<span class="tag ' + (o.tagClass || "") + '">' + esc(o.titleTag) + "</span>";
      h += "</div>";
    }
    (o.desc || []).forEach(function (d) { h += '<p class="embed__desc">' + rich(d) + "</p>"; });
    if (o.quote) h += '<blockquote class="embed__quote">' + rich(o.quote) + "</blockquote>";
    if (o.html) h += o.html;
    if (o.fieldsHtml) h += '<div class="embed__fields">' + o.fieldsHtml + "</div>";
    if (o.chips) h += chips(o.chips, o.chipsBrand);
    if (o.buttons) h += '<div class="btnrow">' + o.buttons + "</div>";
    if (o.footer) {
      h += '<div class="embed__footer">' + svg("pin", 14) + esc(o.footer) +
        (o.footerRight ? '<span style="margin-left:auto">' + esc(o.footerRight) + "</span>" : "") + "</div>";
    }
    return h + "</div>";
  }
  function btn(label, attrs) {
    return "<button class=\"btn " + (attrs.cls || "btn--secondary btn--sm") + "\" " + (attrs.data || "") + ">" +
      (attrs.icon ? svg(attrs.icon, 15) : "") + esc(label) + "</button>";
  }
  function linkBtn(label, href, icon) {
    return '<a class="btn btn--secondary btn--sm" href="' + href + '" target="_blank" rel="noopener">' +
      (icon ? svg(icon, 15) : "") + esc(label) + "</a>";
  }
  /** msg({author,authorClass,tag,tagClass,time,avatar,avatarIcon,body,reactions,compact}) */
  function msg(o) {
    var av;
    if (o.avatarIcon) {
      av = '<div class="msg__avatar msg__avatar--icon">' + svg(o.avatarIcon, 20) + "</div>";
    } else if (o.avatar === false) {
      av = '<div class="msg__avatar" style="background:none"></div>';
    } else {
      av = '<div class="msg__avatar"><img src="' + P.avatar + '" alt="' + esc(P.name) + '"></div>';
    }
    var head = '<div class="msg__head"><span class="msg__author ' + (o.authorClass || "") + '">' + esc(o.author) + "</span>";
    if (o.tag) head += '<span class="tag ' + (o.tagClass || "") + '">' + esc(o.tag) + "</span>";
    head += '<span class="msg__time">' + esc(o.time || nowClock()) + "</span></div>";
    var reactions = "";
    if (o.reactions) {
      reactions = '<div class="msg__reactions">' + o.reactions.map(function (r) {
        return '<button class="reaction" data-reaction>' + esc(r[0]) + " <span>" + r[1] + "</span></button>";
      }).join("") + "</div>";
    }
    return '<div class="msg' + (o.compact ? " msg--compact" : "") + '">' + av +
      '<div class="msg__body">' + head + (o.body || "") + reactions + "</div></div>";
  }
  function skillBar(name, level, color) {
    var segs = "";
    for (var i = 1; i <= 5; i++) {
      var on = i <= level;
      segs += '<span class="skill__seg' + (on ? " is-on" : "") + '"' +
        (on && color ? ' style="background:' + color + '"' : "") + "></span>";
    }
    return '<div class="skill"><span class="skill__name">' + esc(name) + '</span><span class="skill__bar">' +
      segs + '</span><span class="skill__pct">' + Math.round((level / 5) * 100) + "%</span></div>";
  }
  function statGrid(items) {
    return '<div class="statgrid">' + items.map(function (m) {
      return '<div class="stat" style="--stat-accent:' + m.color + '">' +
        '<div class="stat__value">' + esc(m.value) + "</div>" +
        '<div class="stat__label">' + esc(m.label) + "</div>" +
        '<div class="stat__note">' + esc(m.note) + "</div></div>";
    }).join("") + "</div>";
  }

  /* ============================================================
   * 3. 各频道视图
   * ============================================================ */
  var VIEWS = {};

  VIEWS.welcome = function () {
    /* HERO 章节的内部结构（外壳 <section class="hero"> 由 render() 包裹）。
       结构 / 样式 / 交互均移植自 discord-hero
       （assets/css/hero.css + assets/js/hero.js），文案随语言切换。
       板块图标与侧栏频道图标一一对应，保证两套导航语言一致。 */
    var h = U.hero;
    var boards = h.boards.map(function (b) {
      return '<a class="board" role="listitem" href="#/' + b.channel + '" data-goto="' + b.channel + '" data-spark aria-label="' + esc(b.label) + '">' +
        svg(b.icon, 30) + "<small>" + esc(b.label) + "</small><em>" + esc(b.note) + "</em></a>";
    }).join("");

    /* .hero__stage 是「舞台」：所有视觉层（光晕 / 网格 / 噪点 / 粒子 / 内容）
       都装在里面，过场时由 hero.js 整层反向补偿滚动位移，让首屏在被第二屏
       盖住之前几乎钉在原地 —— 没有它各层只能各自平移，拼不出整幕切换。 */
    return (
      '<div class="hero__stage" id="heroStage">' +
        '<div class="glow" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="hero__grid" aria-hidden="true"></div>' +
        '<div class="hero__veil" aria-hidden="true"></div>' +
        '<div class="hero__grain" aria-hidden="true"></div>' +
        '<div class="hero__dim" aria-hidden="true"></div>' +
        '<div class="hero__inner" id="heroInner">' +
          '<p class="pill rise d1"><i class="dot"></i><b>' + esc(P.availability) + "</b> · " + esc(P.locationLabel) + "</p>" +
          '<h1 class="rise d2">' + esc(h.brand) + "</h1>" +
          '<p class="hero__role rise d2">' + esc(h.role) + "</p>" +
          '<p class="sub rise d3">' + h.sub.map(esc).join("<br>") + "</p>" +
          '<div class="cta rise d4">' +
            '<a class="btn btn--primary" href="#/experience" data-goto="experience" data-spark data-magnet>' +
              svg("arrowRight", 19) + "<span>" + esc(h.ctaExp) + "</span></a>" +
            '<a class="btn btn--ghost" href="#/contact" data-goto="contact" data-spark data-magnet>' +
              svg("mail", 18) + "<span>" + esc(h.ctaContact) + "</span></a>" +
          "</div>" +
          '<div class="boards rise d5" role="list" aria-label="' + esc(h.boardsLabel) + '">' + boards +
            '<button class="board board--search" type="button" role="listitem" data-quicksearch data-spark aria-label="' + esc(h.boardSearch) + '">' +
              svg("search", 30) + "<small>" + esc(h.boardSearch) + "</small><em>" + esc(h.boardSearchNote) + "</em></button>" +
          "</div>" +
          '<p class="boards__hint rise d6">' + esc(h.hint) + "</p>" +
        "</div>" +
        '<a class="cue" href="#/portfolio" id="cue" data-spark><span>' + esc(h.cue) + "</span>" + svg("chevronDown", 20) + "</a>" +
        '<canvas id="fx" aria-hidden="true"></canvas>' +
      "</div>"
    );
  };

  VIEWS.about = function () {
    var w = U.about;
    var focusRows = CV.focus.map(function (f) {
      return '<div class="focusrow"><span class="focusrow__dot" style="background:' + f.color + '"></span>' +
        "<div><div class=\"focusrow__title\">" + esc(f.title) + '</div><div class="focusrow__desc">' + esc(f.desc) + "</div></div></div>";
    }).join("");

    var langHtml = CV.languages.map(function (l) {
      var segs = "";
      var filled = Math.round((l.pct / 100) * 5);
      for (var i = 1; i <= 5; i++) segs += '<span class="skill__seg' + (i <= filled ? " is-on" : "") + '"></span>';
      return '<div class="skill"><span class="skill__name">' + esc(l.name) + '</span><span class="skill__bar">' +
        segs + '</span><span class="skill__pct">' + l.pct + "%</span></div>" +
        '<div class="langdesc">' + esc(l.desc) + "</div>";
    }).join("");

    var principleHtml = "<ul style=\"margin:10px 0 0\">" + CV.principles.map(function (p) {
      return '<li style="display:flex;gap:8px;padding:3px 0;font-size:14px;color:var(--text)">' +
        '<span style="color:var(--green);flex:0 0 auto">' + svg("check", 15) + "</span><span>" + rich(p) + "</span></li>";
    }).join("") + "</ul>";

    return (
      divider(w.divider) +
      msg({
        author: P.displayName,
        authorClass: "msg__author--brand",
        tag: w.tag,
        tagClass: "tag--green",
        body:
          embed({
            accent: "#5865f2",
            title: w.titleAbout,
            desc: [P.bio],
            quote: P.bioAlt,
            footer: P.bioAltLabel + (currentLang === "en" ? " version" : " 版本")
          }) +
          embed({ accent: "#23a55a", icon: "zap", title: w.titleFocus, html: "<div style=\"margin-top:6px\">" + focusRows + "</div>" }) +
          embed({ accent: "#00a8fc", icon: "globe", title: w.titleLang, html: '<div class="skills">' + langHtml + "</div>" }) +
          embed({ accent: "#f0b232", icon: "check", title: w.titleWork, html: principleHtml }),
        reactions: [["🔥", 3], ["💡", 2]]
      }) +
      msg({
        compact: true,
        author: U.botName,
        authorClass: "msg__author--yellow",
        avatarIcon: "zap",
        body: embed({
          accent: "#5865f2",
          desc: [w.note],
          buttons:
            btn(w.btnExp, { data: 'data-goto="experience"', cls: "btn btn--sm", icon: "briefcase" }) +
            btn(w.btnMetrics, { data: 'data-goto="metrics"', cls: "btn--secondary btn--sm", icon: "chart" })
        })
      })
    );
  };

  VIEWS.experience = function () {
    var w = U.exp;
    var out = divider(w.divider);
    CV.experience.forEach(function (job, idx) {
      var timeline = '<div class="timeline">' + job.points.map(function (p) {
        return '<div class="tlitem" style="--tl-accent:' + job.color + '">' +
          '<div class="tlitem__text">' + rich(p.text) +
          (p.metric ? ' <span class="tlitem__metric">' + esc(p.metric) + "</span>" : "") +
          "</div></div>";
      }).join("") + "</div>";

      var isLast = idx === CV.experience.length - 1;
      out += msg({
        author: P.displayName,
        authorClass: "msg__author--brand",
        tag: w.tag,
        tagClass: job.color === "#5865f2" ? "" : "tag--green",
        body: embed({
          accent: job.color,
          title: job.role,
          titleTag: job.period,
          tagClass: "tag--outline",
          desc: [job.summary],
          fieldsHtml: field(w.loc, job.location) + field(w.time, job.period) + field(w.scope, job.scope),
          html: timeline,
          chips: job.tags
        })
      });
      out += msg({
        compact: true,
        author: P.displayName,
        authorClass: "msg__author--brand",
        avatar: false,
        body: embed({
          accent: "#3f4147",
          desc: [isLast ? w.tail : w.next],
          buttons: isLast
            ? btn(w.btnMetrics, { data: 'data-goto="metrics"', cls: "btn btn--sm", icon: "chart" }) +
              btn(w.btnProjects, { data: 'data-goto="portfolio"', cls: "btn--secondary btn--sm", icon: "cube" })
            : ""
        })
      });
    });
    return out;
  };

  VIEWS.metrics = function () {
    var w = U.metrics;
    return (
      divider(w.divider) +
      msg({
        author: P.displayName,
        authorClass: "msg__author--brand",
        tag: w.tag,
        body:
          embed({ accent: "#5865f2", title: w.title1, desc: [w.desc1] }) +
          embed({
            accent: "#23a55a",
            icon: "chart",
            title: w.title2,
            wide: true,
            html: statGrid(CV.metrics),
            footer: w.footer
          }),
        reactions: [["📈", 2], ["⚡", 1]]
      }) +
      msg({
        compact: true,
        author: U.botName,
        authorClass: "msg__author--yellow",
        avatarIcon: "zap",
        body: embed({
          accent: "#f0b232",
          desc: [w.note],
          buttons: btn(w.btnBack, { data: 'data-goto="experience"', cls: "btn btn--sm", icon: "briefcase" })
        })
      })
    );
  };

  /* ============================================================
   * 3.9 portfolio —— 3D 作品集单文件产物路径
   *
   * 章节本体（全屏 iframe 槽位 + 全屏打开按钮）由 render() 的
   * portfolioSectionHtml() 装配；iframe 的懒加载、父子路由同步与
   * 滚离暂停见 §7.6。产物由 portfolio3d 构建（npm run build:embed）。
   * ============================================================ */
  var PORTFOLIO_URL = "assets/portfolio/index.html";

  VIEWS.skills = function () {
    var w = U.skills;
    var out = divider(w.divider) +
      msg({
        author: P.displayName,
        authorClass: "msg__author--brand",
        tag: w.tag,
        body: embed({
          accent: "#5865f2",
          icon: "toolbox",
          title: w.title,
          desc: [w.desc1, w.desc2],
          fieldsHtml:
            field(w.fieldGroups, w.fieldGroupsVal) +
            field(w.fieldMain, w.fieldMainVal) +
            field(w.fieldTop, w.fieldTopVal)
        })
      });

    CV.skillGroups.forEach(function (g) {
      out += msg({
        compact: true,
        author: P.displayName,
        authorClass: "msg__author--brand",
        avatar: false,
        body: embed({
          accent: g.color,
          icon: g.icon,
          title: g.name,
          html: '<div class="skills">' + g.items.map(function (it) {
            return skillBar(it.name, it.level, g.color);
          }).join("") + "</div>"
        })
      });
    });

    out += msg({
      compact: true,
      author: U.botName,
      authorClass: "msg__author--yellow",
      avatarIcon: "zap",
      body: embed({
        accent: "#00a8fc",
        desc: [w.tail],
        buttons: btn(w.btnMetrics, { data: 'data-goto="metrics"', cls: "btn btn--sm", icon: "chart" })
      })
    });
    return out;
  };

  VIEWS.contact = function () {
    var w = U.contact;
    return (
      divider(w.divider) +
      msg({
        author: P.displayName,
        authorClass: "msg__author--brand",
        tag: "Open to work",
        tagClass: "tag--green",
        body: embed({
          accent: "#23a55a",
          icon: "mail",
          title: w.title,
          desc: [w.desc1, w.desc2],
          fieldsHtml:
            field(w.fieldEmail, P.email + "（" + P.emailNote + "）") +
            field(w.fieldX, P.xHandle) +
            field(w.fieldGH, P.githubHandle) +
            field(w.fieldLoc, P.locationLabel),
          buttons:
            '<a class="btn btn--sm" href="mailto:' + P.email + '">' + svg("mail", 15) + esc(w.btnSendMail) + "</a>" +
            btn(w.btnCopyMail, { data: 'data-copy="' + P.email + '"', cls: "btn--secondary btn--sm", icon: "copy" }) +
            linkBtn("X / Twitter", P.x, "x") +
            linkBtn("GitHub", P.github, "github"),
          footer: w.footer,
          footerRight: w.footerRight
        }),
        reactions: [["🤝", 2], ["📮", 1]]
      }) +
      msg({
        compact: true,
        author: U.botName,
        authorClass: "msg__author--yellow",
        avatarIcon: "zap",
        body: embed({
          accent: "#5865f2",
          desc: [w.note1, w.note2],
          buttons: btn(w.btnHome, { data: 'data-goto="welcome"', cls: "btn btn--sm", icon: "home" })
        })
      })
    );
  };

  /* ============================================================
   * 4. 自动回复（演示用，走 U.replies）
   * ============================================================ */
  function autoReply(text) {
    var t = String(text).toLowerCase();
    var list = U.replies || [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r.multi) continue;
      var hit = (r.keys || []).some(function (k) { return t.indexOf(k) > -1; });
      if (hit) return r;
    }
    return list[list.length - 1] || { lines: ["…"], multi: true };
  }

  /* ============================================================
   * 5. 主题
   * ============================================================ */
  var THEME_KEY = "edwards-site-theme";
  var themeModes = ["system", "dark", "light"];
  var themeIcons = { system: "monitor", dark: "moon", light: "sun" };
  var currentMode = "system";

  function themeLabel(mode) {
    return { system: U.themeSystem, dark: U.themeDark, light: U.themeLight }[mode] || mode;
  }
  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function applyTheme(mode, silent, persist) {
    currentMode = mode;
    var resolved = mode === "system" ? systemTheme() : mode;
    document.documentElement.setAttribute("data-theme", resolved);
    /* 手机浏览器地址栏配色跟随主题（index.html 里只给了一个暗色默认值 ——
       首帧够用，手动切主题后必须由这里同步，否则地址栏颜色会停在旧色） */
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", resolved === "light" ? "#e3e5e8" : "#1e1f22");
    if (persist !== false) {
      try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
    }
    $$("[data-theme-toggle]").forEach(function (b) {
      b.innerHTML = svg(themeIcons[mode], 18);
      var prefix = currentLang === "en" ? "Theme: " : "主题：";
      b.setAttribute("title", prefix + themeLabel(mode));
      b.setAttribute("aria-label", prefix + themeLabel(mode));
      b.classList.toggle("is-on", mode === "light");
    });
    var label = $("#userSub");
    if (label) label.textContent = P.availability + " · " + themeLabel(mode) + U.userPanelSuffix;
    if (!silent) {
      toast(currentLang === "en"
        ? "Theme: " + themeLabel(mode)
        : "已切换到「" + themeLabel(mode) + "」主题");
    }
  }
  function cycleTheme() {
    applyTheme(themeModes[(themeModes.indexOf(currentMode) + 1) % themeModes.length]);
  }

  /* ============================================================
   * 6. 语言
   * ============================================================ */
  var LANG_KEY = "edwards-site-lang";
  var currentLang = "zh";

  /** persist=false 时（首屏自动判定）不写 localStorage，避免把"猜的"语言固化成偏好 */
  function setLang(lang, silent, persist) {
    if (!LANGS[lang]) lang = "zh";
    currentLang = lang;
    CV = LANGS[lang];
    window.CV = CV;
    P = CV.profile;
    U = CV.ui;

    document.documentElement.setAttribute("lang", U.htmlLang);
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", U.metaDesc);
    /* 分享卡片文案跟着语言走：index.html 里写的是中文默认值，
       切到英文后 title / description / locale / twitter:* 都要同步，
       否则英文用户转发的链接卡片还是中文。 */
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", P.displayName + " · " + P.title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", U.metaDesc);
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "zh_CN");
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", P.displayName + " · " + P.title);
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", U.metaDesc);
    if (persist !== false) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    }

    buildRail();
    buildSidebar();
    buildMembers();
    buildIndex();
    applyTheme(currentMode, true, false);

    var input = $("#composerInput");
    if (input) input.placeholder = U.composerPlaceholder;
    $("#composerHint").innerHTML = U.composerHint;
    $("#searchInput").placeholder = U.searchPlaceholder;
    render();
    if (!silent) toast(U.langToast);
  }
  function toggleLang() { setLang(currentLang === "zh" ? "en" : "zh"); }

  /* ============================================================
   * 7. 路由 = 滚动锚点
   *
   * 单页是一段纵向滚动的章节流：
   *   #/welcome（HERO，第一屏）→ #/portfolio（3D 作品集，第二屏，全屏）
   *   → #/about → #/experience → #/metrics → #/skills → #/contact
   *
   * go(id) 不再切换视图，而是滚动到对应章节；滚动时 scroll-spy 反写
   * 地址栏与侧栏激活态（history.replaceState，不压历史栈）。
   * ============================================================ */
  var state = { channel: "welcome", sub: "", targetY: null, lockUntil: 0 };
  var SECTION_ORDER = ["welcome", "portfolio", "about", "experience", "metrics", "skills", "contact"];
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---- 沉浸态：首屏 / 作品集屏全屏展示，Discord 外壳让位（§7.7） ---- */
  var immersiveOn = false;      // 与 #app[data-immersive] 同步
  var zoneEnd = 0;              // 沉浸区终点 = about 章节顶部（内容坐标），measureSections 更新
  var IMMERSIVE_SECTIONS = { welcome: true, portfolio: true };

  /** 旧路由 → 新路由重定向表：#projects 频道已被 portfolio 完整替换 */
  var REDIRECTS = { projects: "portfolio" };

  /** 解析 location.hash → { channel, sub }（channel 与章节 data-sec 一一对应）
   *  '#/portfolio/project/avazone' → { channel:'portfolio', sub:'project/avazone' }
   *  '#/welcome'                   → { channel:'welcome',   sub:'' } */
  function parseRoute() {
    var raw = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
    var parts = raw.split("/");
    var channel = parts[0] || "welcome";
    var sub = parts.slice(1).join("/");
    if (REDIRECTS[channel]) { channel = REDIRECTS[channel]; sub = ""; }
    return { channel: channel, sub: sub };
  }
  function routeId(r) { return r.channel + (r.sub ? "/" + r.sub : ""); }

  function channelById(id) {
    for (var i = 0; i < CV.channels.length; i++) if (CV.channels[i].id === id) return CV.channels[i];
    return null;
  }
  function sectionEl(id) { return document.querySelector('[data-sec="' + id + '"]'); }

  /** go(id)：id 可带子路径，如 'portfolio' 或 'portfolio/project/avazone' */
  function go(id, opts) {
    var parts = String(id || "").split("/");
    var channel = parts[0] || "welcome";
    var sub = parts.slice(1).join("/");
    if (REDIRECTS[channel]) { channel = REDIRECTS[channel]; sub = ""; }
    if (!channelById(channel)) { channel = "welcome"; sub = ""; }
    var from = state.channel;   // 「出发地」：沉浸态切换的补偿锚点
    state.channel = channel;
    state.sub = channel === "portfolio" ? sub : "";
    var hash = "#/" + channel + (state.sub ? "/" + state.sub : "");
    if ((location.hash || "") !== hash) {
      try { history.replaceState(null, "", hash); } catch (e) { location.hash = hash; }
    }
    if (channel === "portfolio") ensurePortfolioFrame(state.sub);
    setActive(channel);
    scrollToSection(channel, opts, from);
    closeSidebar();
  }

  /* ============================================================
   * 7.2 沉浸态：首屏 / 作品集屏全屏，Discord 外壳让位
   *
   * 目标：第一屏 HERO、第二屏 3D 作品集占满整个视口（左右栏 / 顶栏 /
   * 输入区全部让位），滚入履历章节时外壳收回。两种触发路径：
   *   自然滚动跨界 → updateImmersive()：列宽动画收放，形成「外壳开合」动效；
   *   导航（go / 深链 / 回复按钮）→ syncImmersiveForSection()：先瞬时完成
   *     布局切换（is-layout-snap）再起飞，落点用最终布局计算，精确无漂移。
   * 两条路径都做「锚点补偿」：切换瞬间钉住当前视口所在章节的屏幕位置，
   * 外壳高度变化不产生任何跳变。
   * ============================================================ */

  /** 切换沉浸态并补偿：把当前视口所在章节钉在原屏幕位置 */
  function toggleImmersive(on) {
    var app = $("#app"), sc = $("#scroller");
    if (!app || !sc || immersiveOn === !!on) return;
    var anchor = sectionEl(state.channel) || sectionEl("welcome");
    var before = anchor ? anchor.getBoundingClientRect().top : 0;
    immersiveOn = !!on;
    app.setAttribute("data-immersive", on ? "1" : "0");
    var after = anchor ? anchor.getBoundingClientRect().top : 0;
    var delta = after - before;
    if (delta) sc.scrollTop += delta;
    /* 外壳开合期间把 3D 屏按住：列宽动画会让 iframe 逐帧改变尺寸，每一帧
       都要重配 WebGL framebuffer；暂停它的渲染循环等于把这段开销清零。
       此时第二屏正在被履历屏推出画面，停帧看不出来（见 §7.6 holdPortfolioFrame）。 */
    holdPortfolioFrame();
  }

  /** 导航前对齐沉浸态（瞬时版）：布局变化放在飞行之前，锚点是「出发地」 */
  function syncImmersiveForSection(id, fromId) {
    var desired = !!IMMERSIVE_SECTIONS[id];
    if (desired === immersiveOn) return;
    var app = $("#app"), sc = $("#scroller");
    if (!app || !sc) return;
    var anchor = sectionEl(fromId) || sectionEl(state.channel) || sectionEl("welcome");
    var before = anchor ? anchor.getBoundingClientRect().top : 0;
    app.classList.add("is-layout-snap");
    immersiveOn = desired;
    app.setAttribute("data-immersive", desired ? "1" : "0");
    var after = anchor ? anchor.getBoundingClientRect().top : 0;   // 强制布局：snap 已生效
    app.classList.remove("is-layout-snap");
    var delta = after - before;
    if (delta) sc.scrollTop += delta;
  }

  /* ============================================================
   * 7.2b 首屏 ↔ 第二屏 过场（scroll-linked）
   *
   * q = 第二屏在视口中的覆盖率 0→1（顶边从视口底走到视口顶）：`--qc` 是原始几何，
   * `--q` 是经过缓动的实际进度（见下）。位移 / 缩放 / 接缝光带都跟着几何走，
   * 因此任何滚动速度下所见即当前进度，回滚自然倒放。
   *
   * 流畅度的两条硬约束：
   *  ① 滚动回调里**不读几何**（getBoundingClientRect / clientHeight）——值
   *     全靠 measureSections() 缓存；否则每帧都会强制同步布局（ layout thrashing），
   *     外壳因为有列宽动画本就在逐帧重排，叠加起来就是肉眼可见的顿挫。
   *  ② 派生视觉量走缓动曲线而非线性：线性进度在两端导数不为 0，进入/退出
   *     那一帧会有「拐点」，看起来像被推一下；smoothstep 两端导数为 0，进出平滑。
   * ============================================================ */
  /** smoothstep：两端导数为 0 的标准缓动，用于消除 linear 的进出拐点 */
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  var pfSec = null, pfDocTop = 0, viewH = 0;   // 缓存：作品集屏顶（内容坐标）+ 消息区视高

  function updateStoryMotion() {
    if (reduceMotion) return;                  // 减动效：留在纯 CSS 的 .is-near 兜底档
    var sc = $("#scroller");
    if (!sc) return;
    if (!pfSec) pfSec = sectionEl("portfolio");
    if (!pfSec) return;
    if (!viewH) measureSections();             // 首次 / 内容高度变了：先量一次
    var q = 1 - (pfDocTop - sc.scrollTop) / viewH;
    if (q < 0) q = 0; else if (q > 1) q = 1;
    pfSec.style.setProperty("--qc", q.toFixed(4));      // 原始覆盖率（定位/断言用）
    pfSec.style.setProperty("--q", smoothstep(q).toFixed(4));
    pfSec.classList.add("is-linked");
  }

  /* ============================================================
   * 7.2c 磁吸翻页（原生 scroll-snap）
   *
   * snap 点 = 首屏顶 / 作品集屏顶 / 履历首章顶（CSS 里声明），三点间距都
   * 恰好一整屏 ⇒ 松手必然停在某一屏的顶边，一次手势翻一屏。惯性与手感
   * 交给浏览器原生实现，不劫持滚轮、不改自由滚动的物理。
   *
   * 开关阈值：越过履历首章顶（zoneEnd）即解除。其后章节高度不等于一屏，
   * 而 mandatory 会强制停在**最近的** snap 点 —— 常开会让它们无处停留，
   * 每次都被拽回上一屏。
   * 程序化滚动（go / 深链，state.targetY != null）期间同样解除：snap 的
   * 终点判定与 scrollTo 的目标是两套独立机制，并存会互相抢终点。
   *
   * 开 / 关都只在滚动过程中发生（静止时位置不变则状态不变），因此不会
   * 踩到「修改 scroll-snap-type 立即 re-snap 造成跳变」那个坑。
   * ============================================================ */
  var snapOn = false;
  function updateSnap() {
    var sc = $("#scroller");
    if (!sc) return;
    var next = !!zoneEnd && state.targetY == null && sc.scrollTop < zoneEnd - 2;
    if (next === snapOn) return;
    snapOn = next;
    sc.classList.toggle("is-snap", next);
  }

  /** 自然滚动跨界评估（含回差）：离开沉浸区要等作品集屏基本离场，
   *  回到沉浸区更靠后触发，避免在边界上抖动；
   *  补偿把滚动量往远离阈值方向推，天然防回弹。 */
  function updateImmersive() {
    var sc = $("#scroller");
    if (!sc || !zoneEnd) return;
    var h = sc.clientHeight || 1;
    var edge = zoneEnd - h * (immersiveOn ? 0.6 : 0.85);
    var next = sc.scrollTop < edge;
    if (next === immersiveOn) return;
    toggleImmersive(next);
  }

  /** 把指定章节滚到消息区顶部（平滑；深链 / 减动效偏好为瞬时）
   *  末章节（contact）短于视口时顶部不可达：目标钳制到最大滚动值，
   *  避免 spy 锁等待超时才解锁。fromId = 出发地章节（沉浸态补偿锚点）。 */
  function scrollToSection(id, opts, fromId) {
    var el = sectionEl(id);
    var sc = $("#scroller");
    if (!el || !sc) return;
    syncImmersiveForSection(id, fromId);
    var top = sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
    var maxTop = Math.max(0, sc.scrollHeight - sc.clientHeight);
    if (top > maxTop) top = maxTop;
    if ((opts && opts.instant) || reduceMotion) {
      state.targetY = null;
      sc.scrollTop = top;
      updateSnap();
      return;
    }
    if (Math.abs(sc.scrollTop - top) < 2) { state.targetY = null; updateSnap(); return; }
    state.targetY = top;
    state.lockUntil = performance.now() + 1500;
    updateSnap();                     // 程序化滚动期间解除磁吸（见 §7.2c）
    try { sc.scrollTo({ top: top, behavior: "smooth" }); } catch (e) { sc.scrollTop = top; state.targetY = null; updateSnap(); }
  }

  /** 顶栏 / 侧栏 / 服务器栏 / 标题 的激活态 */
  function setActive(id) {
    var ch = channelById(id) || CV.channels[0];
    $$(".channel").forEach(function (n) {
      n.classList.toggle("is-active", n.getAttribute("data-channel") === ch.id);
    });
    $$(".rail__item[data-channel]").forEach(function (n) {
      var on = n.getAttribute("data-channel") === ch.id;
      n.classList.toggle("is-active", on);
      n.setAttribute("aria-current", on ? "page" : "false");
    });
    $("#topHash").innerHTML = svg("hash", 20);
    $("#topTitle").textContent = ch.name;
    $("#topTopic").textContent = ch.topic;
    document.title = "#" + ch.name + " · " + P.displayName + " — " + P.title;
    // 注意：属性名用 data-view 而非 data-channel——全局点击委托按
    // closest('[data-channel]') 捕获频道跳转，#app 是全场祖先，
    // 若用 data-channel 会让任何点击都误触发一次 go(当前频道)。
    var app = $("#app");
    if (app) app.setAttribute("data-view", ch.id);
  }

  /* ---- 滚动监听：scroll-spy（章节顶部位置缓存，避免滚动时反复取 rect） ---- */
  var sectionTops = [];
  function measureSections() {
    var sc = $("#scroller"), app = $("#app");
    if (!sc) return;
    var base = sc.getBoundingClientRect().top - sc.scrollTop;
    function contentTop(id) {
      var el = sectionEl(id);
      return el ? el.getBoundingClientRect().top - base : null;
    }
    sectionTops = SECTION_ORDER.map(function (id) {
      var t = contentTop(id);
      return t == null ? null : { id: id, top: t };
    }).filter(Boolean);
    // 沉浸区终点 = 履历首章（about）顶部。其上只有两张整屏（HERO / 作品集，
    // 均恒为 100dvh），因此该值与当前是否沉浸无关，切布局时无需重算。
    var z = contentTop("about");
    if (z != null) zoneEnd = z;
    // 过场用心跳数据：作品集屏顶的内容坐标 + 消息区视高。缓存下来，滚动回调
    // 里就能纯算术推进，不再每帧读 rect（见 §7.2b 流畅度硬约束①）
    var p = contentTop("portfolio");
    if (p != null) pfDocTop = p;
    viewH = sc.clientHeight || 1;
    // 输入区的自然高度：只在它可见时量（收起后读到的是 0，会把测得值冲掉）。
    // 首次 render() 里 measureSections 跑在 updateImmersive 之前，正好赶上未收起状态。
    var cmp = $(".composer");
    if (cmp && (!app || app.getAttribute("data-immersive") !== "1")) {
      var ch = cmp.offsetHeight;
      if (ch > 8) cmp.style.setProperty("--cmp-h", ch + "px");
    }
    updateSnap();                     // zoneEnd 变了，磁吸的解除边界要跟着重算
  }
  function onStoryScroll() {
    var sc = $("#scroller");
    if (!sc) return;
    // 过场驱动要在 spy 锁之前：程序化平滑滚动期间也必须跟着画帧更新
    updateStoryMotion();
    updateSnap();
    // 程序化滚动（go / 深链定位）期间锁住 spy，避免标题与激活态中途闪动
    if (state.targetY != null) {
      if (Math.abs(sc.scrollTop - state.targetY) < 3 || performance.now() > state.lockUntil) {
        state.targetY = null;
        updateSnap();                 // 抵达后立刻恢复磁吸（此时位置已在 snap 点上，无跳变）
      }
      else return;
    }
    if (!sectionTops.length) measureSections();
    // 自然滚动跨界：外壳列宽动画开合（导航走的是 syncImmersiveForSection，瞬时）
    updateImmersive();
    var mid = sc.scrollTop + sc.clientHeight * 0.5;
    var current = SECTION_ORDER[0];
    for (var i = 0; i < sectionTops.length; i++) {
      if (sectionTops[i].top <= mid) current = sectionTops[i].id;
    }
    // 触底时直接归到最后章节（contact 较短，视口中线可能仍落在 skills 内）
    if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) current = SECTION_ORDER[SECTION_ORDER.length - 1];
    if (current !== state.channel) {
      state.channel = current;
      var hash = "#/" + current + (current === "portfolio" && state.sub ? "/" + state.sub : "");
      if ((location.hash || "") !== hash) {
        try { history.replaceState(null, "", hash); } catch (e) {}
      }
      setActive(current);
    }
  }

  /* ============================================================
   * 7.5 章节流装配：HERO → 3D 作品集（懒加载）→ 履历章节
   *
   * 章节只装配一次；语言切换走 refreshStory() 只重填内容，
   * portfolio 章节的 iframe 一律不重建（3D 状态保留）。
   * ============================================================ */
  var storyBuilt = false;

  function portfolioSectionHtml() {
    return (
      '<section class="story-sec story-sec--portfolio" data-sec="portfolio" id="sec-portfolio" aria-label="' + esc(U.portfolio.title) + '">' +
        '<div class="story-portfolio__frame" id="portfolioSlot"></div>' +
        '<a class="story-portfolio__full" href="' + PORTFOLIO_URL + '" target="_blank" rel="noopener" ' +
          'title="' + esc(U.portfolio.openFullTitle) + '" aria-label="' + esc(U.portfolio.openFullTitle) + '">' +
          svg("globe", 15) + '<span id="pfFullLabel">' + esc(U.portfolio.openFull) + '</span><span class="story-portfolio__full-arrow" aria-hidden="true">&nbsp;↗</span></a>' +
      "</section>"
    );
  }

  function render() {
    if (!storyBuilt) {
      var html =
        '<section class="hero" id="hero" data-sec="welcome" aria-label="' + esc(U.hero.brand) + '">' + VIEWS.welcome() + "</section>" +
        portfolioSectionHtml();
      ["about", "experience", "metrics", "skills", "contact"].forEach(function (id) {
        html += '<section class="story-sec" data-sec="' + id + '" id="sec-' + id + '">' + VIEWS[id]() + "</section>";
      });
      html += '<div class="story-sec story-sec--chat" data-sec="chat" id="sec-chat" aria-live="polite"></div>';
      $("#messages").innerHTML = html;
      storyBuilt = true;
      initPortfolioObservers();
      initSectionReveal();
      if (window.HERO) window.HERO.mount();
    } else {
      refreshStory();
    }
    bindDynamic($("#messages"));
    var frame = $("#portfolioFrame");
    if (frame) frame.title = U.portfolio.title;
    measureSections();
    updateImmersive();       // 内容高度可能因语言切换而变，重新判定沉浸区
    updateStoryMotion();     // 章节几何变了，重算第二屏覆盖率
    setActive(state.channel);
  }

  /** 语言切换：只重填各章节内容；portfolio 章节（iframe）保持不动 */
  function refreshStory() {
    if (window.HERO) window.HERO.unmount();
    var hero = $("#hero");
    if (hero) hero.innerHTML = VIEWS.welcome();
    ["about", "experience", "metrics", "skills", "contact"].forEach(function (id) {
      var el = sectionEl(id);
      if (el) el.innerHTML = VIEWS[id]();
    });
    var label = $("#pfFullLabel");
    if (label) label.textContent = U.portfolio.openFull;
    if (window.HERO) window.HERO.mount();
  }

  /* ============================================================
   * 7.6 portfolio 章节：懒加载 + 滚离暂停
   *
   * 双向通道均走 postMessage（不受同源策略限制，file:// 下同样可用）：
   *   iframe → 父页面：3D 页每次写 hash 后上报，父页面 replaceState
   *           同步地址栏（不压历史栈；iframe 内部的前进后退由它自己管）。
   *   父页面 → iframe：粘贴深链 / ⌘K 搜索跳转下发 hash；章节滚离视口
   *           时下发 active=false，3D 页暂停渲染，不空转 GPU。
   * ============================================================ */
  var pfLazyIO = null, pfActiveIO = null, pfNearIO = null;

  function initPortfolioObservers() {
    var sec = sectionEl("portfolio");
    var sc = $("#scroller");
    if (!sec) return;
    if (!("IntersectionObserver" in window)) {
      ensurePortfolioFrame(state.sub);
      sec.classList.add("is-near");   // 无 IO 则直接常显，不做入场动效
      return;
    }
    // 入场动效：作品集屏露出约四分之一时淡入上浮（.is-near），与 HERO 的
    // 分层退场（--p 视差）衔接成「首屏 → 第二屏」的完整滚动切换节奏。
    // 深链直达时该屏开局就在视口内，IO 立即触发，动画同样成立。
    pfNearIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          sec.classList.add("is-near");
          if (pfNearIO) { pfNearIO.disconnect(); pfNearIO = null; }
        }
      });
    }, { root: sc, rootMargin: "0px 0px -25% 0px", threshold: 0 });
    pfNearIO.observe(sec);
    // 懒加载：作品集屏起步于首屏正下方（屏顶正好在视口边缘）。rootMargin
    // 底部内缩 24px——零距离「边缘相触」IO 也会判相交，会把 1.1MB 的
    // iframe 拖进首屏渲染；内缩后滚动一点点才开始加载，滚过 HERO 退场
    // 动画的时间足够就绪，同时不与首屏抢带宽
    pfLazyIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          ensurePortfolioFrame(state.sub);
          if (pfLazyIO) { pfLazyIO.disconnect(); pfLazyIO = null; }
        }
      });
    }, { root: sc, rootMargin: "0px 0px -24px 0px" });
    pfLazyIO.observe(sec);
    // 章节可见性 → 通知 3D 页暂停 / 恢复（滚离这一屏别空转 GPU）
    pfActiveIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var frame = $("#portfolioFrame");
        if (!frame || !frame.contentWindow) return;
        frame.contentWindow.postMessage({ source: "host-site", active: !!en.isIntersecting }, "*");
      });
    }, { root: sc, threshold: 0 });
    pfActiveIO.observe(sec);
  }

  /* ---- 履历章节入场：滚到章节时内容逐条淡入（一次性） ----
   * 前两屏有磁吸和镜头语言，about 之后原本是「哑」的：.msg 自身那条 msgIn
   * 在页面加载时就播完了，用户滚到时只剩静态。
   * 两条硬约束：
   *   ① 只作用于章节的**直接子元素**。section 自身的 rect 绝对不能动 ——
   *      measureSections / 磁吸判定 / scroll-spy 全都依赖它，动了会全盘错位。
   *   ② 一次性（加类后不复位）：来回滚动不重播，否则整页都在动。
   * 减动效偏好下整段跳过，元素保持原样常显。 */
  var secRevealIO = null;
  function initSectionReveal() {
    var sc = $("#scroller");
    if (!sc || secRevealIO || reduceMotion || !("IntersectionObserver" in window)) return;
    secRevealIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        secRevealIO.unobserve(en.target);   // 只播一次
      });
    }, { root: sc, rootMargin: "0px 0px -10% 0px", threshold: 0 });
    ["about", "experience", "metrics", "skills", "contact"].forEach(function (id) {
      var el = sectionEl(id);
      if (el) secRevealIO.observe(el);
    });
  }

  /** 首次接近 portfolio 章节时创建 iframe；之后只同步内部 hash，不重建 */
  function ensurePortfolioFrame(sub) {
    var slot = $("#portfolioSlot");
    var frame = $("#portfolioFrame");
    if (!slot) return;
    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "portfolioFrame";
      frame.title = U.portfolio.title;
      frame.src = PORTFOLIO_URL + "?embed=1" + (sub ? "#/" + sub : "");
      slot.appendChild(frame);
    } else {
      syncFrameHash(sub);
    }
  }

  var pfHoldTimer = 0;
  /** 外壳动画的时长（读 .app 的 --t-shell，避免 JS 与 CSS 两边写得不一致） */
  function shellDurMs() {
    var app = $("#app");
    if (!app) return 440;
    var d = (getComputedStyle(app).transitionDuration || "0.44s").split(",")[0];
    var v = parseFloat(d) || 0.44;
    return /ms/.test(d) ? v : v * 1000;
  }
  function setPortfolioActive(on) {
    var f = $("#portfolioFrame");
    if (f && f.contentWindow) f.contentWindow.postMessage({ source: "host-site", active: !!on }, "*");
  }
  /** 外壳收放的这段时间里挂起 3D 渲染，动画结束（= 一次外壳时长 + 余量）自动恢复 */
  function holdPortfolioFrame() {
    if (!$("#portfolioFrame")) return;
    setPortfolioActive(false);
    clearTimeout(pfHoldTimer);
    pfHoldTimer = setTimeout(function () { pfHoldTimer = 0; setPortfolioActive(true); }, shellDurMs() + 80);
  }

  /** 把宿主路由的 sub 同步给 iframe（读不到 hash 时盲发，由 iframe 侧去重） */
  function syncFrameHash(sub) {
    var frame = $("#portfolioFrame");
    if (!frame || !frame.contentWindow) return;
    var desired = sub ? "#/" + sub : "";
    try {
      if (frame.contentWindow.location.hash === desired) return;
    } catch (e) { /* file:// 下读不到 iframe hash，继续下发 */ }
    frame.contentWindow.postMessage({ source: "host-site", hash: desired }, "*");
  }

  /** iframe → 宿主：3D 页内部导航时同步地址栏（仅当用户正停留在 portfolio 章节） */
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.source !== "portfolio3d" || typeof d.hash !== "string") return;
    if (state.channel !== "portfolio") return;
    var sub = String(d.hash).replace(/^#!?\/?/, "").split("?")[0];
    state.sub = sub;
    var target = "#/portfolio" + (sub ? "/" + sub : "");
    if (location.hash !== target) {
      try { history.replaceState(null, "", target); } catch (err) {}
    }
  });

  /* ============================================================
   * 8. 侧栏 / 服务器栏 / 成员栏
   * ============================================================ */
  function buildRail() {
    var items = CV.channels.map(function (c) {
      return '<button class="rail__item" data-channel="' + c.id + '" aria-label="' + esc(c.name) + '">' +
        svg(c.icon, 24) + '<span class="rail__pill">#' + esc(c.name) + "</span></button>";
    }).join("");

    $("#rail").innerHTML =
      '<button class="rail__item rail__avatar" data-goto="welcome" aria-label="home">' +
      '<img src="' + P.avatar + '" alt="' + esc(P.handle) + '"><span class="rail__dot"></span></button>' +
      '<div class="rail__sep"></div>' +
      items +
      '<div class="rail__sep"></div>' +
      '<button class="rail__item" data-quicksearch aria-label="search">' + svg("search", 22) +
      '<span class="rail__pill">' + (currentLang === "en" ? "Search · ⌘K" : "搜索 / 快速跳转 ⌘K") + "</span></button>" +
      '<a class="rail__item" href="' + P.github + '" target="_blank" rel="noopener" aria-label="GitHub">' + svg("github", 22) +
      '<span class="rail__pill">GitHub</span></a>' +
      '<button class="rail__item rail__lang" data-lang-toggle aria-label="' + esc(U.langSwitchTitle) + '">' +
      '<span class="rail__langtext">' + esc(U.langSwitchTo) + "</span>" +
      '<span class="rail__pill">' + esc(U.langSwitchTitle) + "</span></button>" +
      '<div class="rail__spacer"></div>' +
      '<button class="rail__item" data-theme-toggle aria-label="theme">' + svg("moon", 22) +
      '<span class="rail__pill">' + (currentLang === "en" ? "Theme" : "切换主题") + "</span></button>";
  }

  function buildSidebar() {
    var cats = [];
    CV.channels.forEach(function (c) {
      var cat = cats[cats.length - 1];
      if (!cat || cat.name !== c.category) { cat = { name: c.category, items: [] }; cats.push(cat); }
      cat.items.push(c);
    });

    var body = cats.map(function (cat) {
      return '<div class="cat"><div class="cat__title">' + svg("chevronDown", 12) + "<span>" + esc(cat.name) + "</span></div>" +
        cat.items.map(function (c) {
          return '<button class="channel" data-channel="' + c.id + '" title="' + esc(c.topic) + '">' +
            '<span class="channel__hash">' + svg("hash", 18) + '</span><span class="channel__label">' + esc(c.name) + "</span>" +
            (c.id === "contact" ? '<span class="channel__badge">1</span>' : "") + "</button>";
        }).join("") + "</div>";
    }).join("");

    $("#sidebarBody").innerHTML = body;
    $("#sidebarHeader").innerHTML =
      '<div class="sidebar__brand">' + svg("zap", 18) + "<strong>" + esc(P.displayName) + "</strong></div>" +
      '<span class="sidebar__chev">' + svg("chevronDown", 18) + "</span>";

    $("#userpanel").innerHTML =
      '<div class="userpanel__avatar"><img src="' + P.avatar + '" alt=""><span class="rail__dot" style="border-color:var(--rail)"></span></div>' +
      '<div class="userpanel__meta"><div class="userpanel__name">' + esc(P.displayName) + "</div>" +
      '<div class="userpanel__sub" id="userSub">' + esc(P.availability) + "</div></div>" +
      '<div class="userpanel__actions">' +
      '<button class="iconbtn" data-theme-toggle aria-label="theme"></button>' +
      '<a class="iconbtn" href="' + P.github + '" target="_blank" rel="noopener" aria-label="GitHub">' + svg("github", 18) + "</a>" +
      '<a class="iconbtn topbar__mail" href="mailto:' + P.email + '" aria-label="mail">' + svg("mail", 18) + "</a>" +
      "</div>";
  }

  function buildMembers() {
    var focusTop = CV.focus.slice(0, 5);
    var roles = focusTop.map(function (f) {
      return '<div class="member__role"><span class="dot" style="background:' + f.color + '"></span>' + esc(f.title) + "</div>";
    }).join("");

    var topSkills = [];
    CV.skillGroups.forEach(function (g) {
      g.items.forEach(function (it) { if (it.level === 5) topSkills.push({ n: it.name, c: g.color }); });
    });
    var skillChips = topSkills.map(function (s) {
      return '<span class="minichip"><span class="dot" style="background:' + s.c + '"></span>' + esc(s.n) + "</span>";
    }).join("");

    var stats = CV.metrics.slice(0, 4).map(function (m) {
      return '<div class="member__role"><span class="dot" style="background:' + m.color + '"></span>' +
        "<span><strong style=\"color:var(--text-strong)\">" + esc(m.value) + "</strong> " + esc(m.label) + "</span></div>";
    }).join("");

    $("#members").innerHTML =
      '<div class="members__title">' + esc(U.membersRoles) + " — " + focusTop.length + "</div>" + roles +
      '<div class="members__sep"></div>' +
      '<div class="members__title">' + esc(U.membersOne) + " — 1</div>" +
      '<div class="member">' +
      '<div class="member__avatar"><img src="' + P.avatar + '" alt=""><span class="member__dot"></span></div>' +
      '<div><div class="member__name">' + esc(P.displayName) + "</div>" +
      '<div class="member__sub">' + esc(P.availability) + "</div></div></div>" +
      '<div class="members__sep"></div>' +
      '<div class="members__title">' + esc(U.membersCore) + "</div>" +
      "<div style=\"padding:0 8px\">" + skillChips + "</div>" +
      '<div class="members__sep"></div>' +
      '<div class="members__title">' + esc(U.membersStats) + "</div>" + stats;
  }

  /* ============================================================
   * 9. 交互
   * ============================================================ */
  function closeSidebar() {
    $("#sidebar").classList.remove("is-open");
    $("#scrim").classList.remove("is-open");
  }
  function toggleSidebar() {
    var open = $("#sidebar").classList.toggle("is-open");
    $("#scrim").classList.toggle("is-open", open);
  }

  function bindDynamic(root) {
    $$("[data-goto]", root).forEach(function (n) {
      n.addEventListener("click", function (e) { e.preventDefault(); go(n.getAttribute("data-goto")); });
    });
    $$("[data-copy]", root).forEach(function (n) {
      if (n.__bound) return; n.__bound = true;
      n.addEventListener("click", function () { copyText(n.getAttribute("data-copy"), U.copiedWith + n.getAttribute("data-copy")); });
    });
    $$("[data-reaction]", root).forEach(function (n) {
      if (n.__bound) return; n.__bound = true;
      n.addEventListener("click", function () {
        var span = n.querySelector("span");
        var n0 = parseInt(span.textContent, 10) || 0;
        var on = n.classList.toggle("is-on");
        span.textContent = on ? n0 + 1 : Math.max(0, n0 - 1);
      });
    });
  }

  function bindGlobal() {
    $("#hamburger").innerHTML = svg("menu", 20);
    $("#searchBtn").innerHTML = svg("search", 18);
    $$("[data-quicksearch]").forEach(function (b) { b.innerHTML = svg("search", 18); });
    $$("[data-menu-toggle]").forEach(function (b) { b.innerHTML = svg("menu", 18); });
    $("#composerPlus").innerHTML = svg("plus", 20);
    $("#composerSend").innerHTML = svg("send", 18);
    var topMail = $(".topbar__actions a.iconbtn");
    if (topMail) topMail.innerHTML = svg("mail", 18);

    document.addEventListener("click", function (e) {
      var t = e.target.closest
        ? e.target.closest("[data-goto],[data-channel],[data-theme-toggle],[data-quicksearch],[data-lang-toggle],[data-menu-toggle]")
        : null;
      if (!t) return;
      if (t.hasAttribute("data-goto")) { e.preventDefault(); go(t.getAttribute("data-goto")); return; }
      if (t.hasAttribute("data-channel")) { e.preventDefault(); go(t.getAttribute("data-channel")); return; }
      if (t.hasAttribute("data-theme-toggle")) { e.preventDefault(); cycleTheme(); return; }
      if (t.hasAttribute("data-lang-toggle")) { e.preventDefault(); toggleLang(); return; }
      if (t.hasAttribute("data-quicksearch")) { e.preventDefault(); openSearch(); return; }
      if (t.hasAttribute("data-menu-toggle")) { e.preventDefault(); toggleSidebar(); return; }
    });

    $("#hamburger").addEventListener("click", toggleSidebar);
    $("#scrim").addEventListener("click", closeSidebar);
    $("#sidebarHeader").addEventListener("click", function () { toast(U.toastBrand); });

    var input = $("#composerInput");
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && input.value.trim()) {
        e.preventDefault();
        sendUserMessage(input.value.trim());
        input.value = "";
      }
    });
    $("#composerSend").addEventListener("click", function () {
      if (input.value.trim()) { sendUserMessage(input.value.trim()); input.value = ""; }
      else { input.focus(); toast(U.toastComposerEmpty); }
    });
    $("#composerPlus").addEventListener("click", function () {
      input.focus();
      toast(U.toastComposerHint);
    });

    document.addEventListener("keydown", function (e) {
      var meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); return; }
      if (e.key === "Escape") { closeSearch(); closeSidebar(); return; }
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "/") { e.preventDefault(); input.focus(); }
    });

    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: light)");
      var onChange = function () { if (currentMode === "system") applyTheme("system", true, false); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    window.addEventListener("hashchange", function () {
      // 手动改地址栏 / 前进后退 → 滚动到对应章节（go 内部处理重定向与规范化）
      go(routeId(parseRoute()));
    });

    // 章节流：滚动 → scroll-spy；窗口尺寸变化 → 重新测量章节位置
    var sc = $("#scroller");
    if (sc) sc.addEventListener("scroll", onStoryScroll, { passive: true });
    // 视口变化 → 重测章节位置并重新评估沉浸态（屏幕高度决定两张整屏的高度）
    window.addEventListener("resize", function () { measureSections(); updateImmersive(); updateStoryMotion(); onStoryScroll(); });
    // 外壳开合动画结束 → 消息区高度已定型，重测一次（.app 的过渡会冒泡到这里）
    var appEl = $("#app");
    if (appEl) appEl.addEventListener("transitionend", function (e) {
      if (e.target !== appEl && e.propertyName !== "grid-template-columns") return;
      measureSections(); updateStoryMotion();
    });
    // 字体 / 图片 / 作品集 iframe 就位后内容高度才最终确定，再测一次
    window.addEventListener("load", function () { measureSections(); updateImmersive(); updateStoryMotion(); onStoryScroll(); });
  }

  function sendUserMessage(text) {
    /* 自动回复落在页面末尾的 #sec-chat（章节流之外），发送后滚过去；
       回复里的按钮是跳转按钮，指向各履历章节 */
    var box = $("#sec-chat") || $("#messages");
    var wrap = document.createElement("div");
    wrap.innerHTML = msg({
      author: U.visitor,
      tag: U.demoTag,
      tagClass: "tag--gray",
      avatar: false,
      body: line(text)
    });
    box.appendChild(wrap.firstChild);
    scrollToSection("chat");

    setTimeout(function () {
      var r = autoReply(text);
      var lines = (r.lines || [])
        .map(function (l) { return line(l.replace("{text}", String(text).slice(0, 60))); })
        .join("");
      var buttons = "";
      if (r.go) buttons += btn("#" + r.go, { data: 'data-goto="' + r.go + '"', cls: "btn btn--sm", icon: "chevronRight" });
      if (r.copy) buttons += btn(U.btnCopyMail, { data: 'data-copy="' + P.email + '"', cls: "btn--secondary btn--sm", icon: "copy" });
      if (r.multi) {
        buttons += btn("#experience", { data: 'data-goto="experience"', cls: "btn--secondary btn--sm", icon: "briefcase" }) +
          btn("#portfolio", { data: 'data-goto="portfolio"', cls: "btn--secondary btn--sm", icon: "cube" }) +
          btn("#contact", { data: 'data-goto="contact"', cls: "btn btn--sm", icon: "mail" });
      }
      if (!buttons) {
        buttons = btn(U.btnCopyMail, { data: 'data-copy="' + P.email + '"', cls: "btn--ghost btn--sm", icon: "copy" });
      }

      var wrap2 = document.createElement("div");
      wrap2.innerHTML = msg({
        author: P.displayName,
        authorClass: "msg__author--brand",
        tag: U.autoTag,
        tagClass: "tag--gray",
        avatarIcon: "zap",
        body: lines + embed({ accent: "#5865f2", buttons: buttons, footer: U.autoFooter })
      });
      box.appendChild(wrap2.firstChild);
      bindDynamic(box.lastChild);
      scrollToSection("chat");
    }, 420);
  }

  /* ============================================================
   * 10. 快速切换（⌘K）
   * ============================================================ */
  var searchIndex = [];
  function buildIndex() {
    searchIndex = [];
    CV.channels.forEach(function (c) {
      searchIndex.push({ group: U.groupChannel, label: "#" + c.name, hint: c.topic, go: c.id });
    });
    CV.experience.forEach(function (j) {
      searchIndex.push({ group: U.groupExp, label: j.role, hint: j.period + " · " + j.location, go: "experience" });
    });
    CV.projects.forEach(function (p) {
      searchIndex.push({ group: U.groupProject, label: p.name, hint: p.tagline, go: "portfolio/project/" + p.id, url: p.url });
    });
    CV.skillGroups.forEach(function (g) {
      g.items.forEach(function (it) {
        searchIndex.push({ group: U.groupSkill, label: it.name, hint: g.name, go: "skills" });
      });
    });
    searchIndex.push({ group: U.groupAction, label: U.cmdCopyEmail, hint: P.email, copy: P.email });
    searchIndex.push({ group: U.groupAction, label: U.cmdTheme, hint: "dark / light / system", theme: true });
    searchIndex.push({ group: U.groupAction, label: U.cmdPrint, hint: "⌘P / Ctrl+P", print: true });
    searchIndex.push({
      group: U.groupAction,
      label: currentLang === "en" ? "Switch language" : "切换语言",
      hint: "EN / CN · " + U.langShort,
      lang: true
    });
  }

  var searchActive = 0;
  var searchResults = [];

  function openSearch() {
    $("#modal").classList.add("is-open");
    var i = $("#searchInput");
    i.value = "";
    runSearch("");
    setTimeout(function () { i.focus(); }, 30);
  }
  function closeSearch() { $("#modal").classList.remove("is-open"); }

  function runSearch(q) {
    q = (q || "").trim().toLowerCase();
    searchResults = searchIndex.filter(function (it) {
      if (!q) return true;
      return (it.label + " " + it.hint + " " + it.group).toLowerCase().indexOf(q) > -1;
    }).slice(0, 40);
    searchActive = 0;

    if (!searchResults.length) {
      $("#searchList").innerHTML = '<div class="modal__empty">' + esc(U.modalEmpty) + "</div>";
      return;
    }
    var ICON_BY_GROUP = {};
    ICON_BY_GROUP[U.groupChannel] = "hash";
    ICON_BY_GROUP[U.groupProject] = "rocket";
    ICON_BY_GROUP[U.groupSkill] = "toolbox";
    ICON_BY_GROUP[U.groupExp] = "briefcase";

    var html = "", lastGroup = "";
    searchResults.forEach(function (it, idx) {
      if (it.group !== lastGroup) {
        html += '<div class="modal__group">' + esc(it.group) + "</div>";
        lastGroup = it.group;
      }
      html += '<button class="modal__item' + (idx === 0 ? " is-active" : "") + '" data-idx="' + idx + '">' +
        svg(ICON_BY_GROUP[it.group] || "zap", 16) +
        "<span>" + esc(it.label) + '</span><span class="k">' + esc(it.hint) + "</span></button>";
    });
    $("#searchList").innerHTML = html;
    $$("#searchList .modal__item").forEach(function (n) {
      n.addEventListener("click", function () { pickSearch(parseInt(n.getAttribute("data-idx"), 10)); });
      n.addEventListener("mousemove", function () {
        searchActive = parseInt(n.getAttribute("data-idx"), 10);
        highlightSearch();
      });
    });
  }
  function highlightSearch() {
    $$("#searchList .modal__item").forEach(function (n, i) {
      n.classList.toggle("is-active", i === searchActive);
    });
  }
  function pickSearch(idx) {
    var it = searchResults[idx];
    if (!it) return;
    closeSearch();
    if (it.copy) { copyText(it.copy, U.copiedWith + it.copy); return; }
    if (it.theme) { cycleTheme(); return; }
    if (it.lang) { toggleLang(); return; }
    if (it.print) { window.print(); return; }
    if (it.url) { go(it.go); setTimeout(function () { window.open(it.url, "_blank", "noopener"); }, 60); return; }
    go(it.go);
  }
  function bindSearch() {
    var input = $("#searchInput");
    input.addEventListener("input", function () { runSearch(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); searchActive = Math.min(searchActive + 1, searchResults.length - 1); highlightSearch(); scrollActive(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); searchActive = Math.max(searchActive - 1, 0); highlightSearch(); scrollActive(); }
      else if (e.key === "Enter") { e.preventDefault(); pickSearch(searchActive); }
    });
    $("#modal").addEventListener("click", function (e) { if (e.target === $("#modal")) closeSearch(); });
    var b = $("#searchBtn");
    if (b) b.addEventListener("click", openSearch);
  }
  function scrollActive() {
    var node = $$("#searchList .modal__item")[searchActive];
    if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
  }

  /* ============================================================
   * 11. 启动
   * ============================================================ */
  function boot() {
    bindSearch();
    bindGlobal();

    // 语言：URL 参数 → localStorage → 浏览器语言 → 中文
    var qLang = null;
    try { qLang = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    var savedLang = null;
    try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) {}
    // 浏览器语言：中文环境 → 中文版，其他环境 → 英文版（与简历投放口径一致）
    var nav = (navigator.language || navigator.browserLanguage || "zh").toLowerCase();
    var navLang = nav.indexOf("zh") === 0 ? "zh" : "en";
    var initial = (qLang === "en" || qLang === "zh") ? qLang
      : (savedLang === "en" || savedLang === "zh") ? savedLang
      : navLang;

    var qTheme = null;
    try { qTheme = new URLSearchParams(location.search).get("theme"); } catch (e) {}
    var savedTheme = null;
    try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}

    /* 开场先戴上瞬时档：首帧把外壳从「在场」切到「让位」属于状态初始化，
       不该被当成一次切换 —— 否则开站会看到外壳自己塌下去一小段动画。
       两帧后摘掉，其后所有进出都是带曲线的收放。 */
    var app0 = $("#app");
    if (app0) app0.classList.add("is-layout-snap");

    setLang(initial, true, false);

    if (qTheme === "light" || qTheme === "dark") applyTheme(qTheme, true, false);
    else applyTheme(themeModes.indexOf(savedTheme) > -1 ? savedTheme : "system", true, false);

    // 深链定位：章节流已装配（setLang → render），直接瞬时滚到目标章节
    go(routeId(parseRoute()), { instant: true });

    if (app0) requestAnimationFrame(function () {
      requestAnimationFrame(function () { app0.classList.remove("is-layout-snap"); });
    });

    setTimeout(function () { toast(U.toastWelcome); }, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
