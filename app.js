/* =======================================================================
 *  互动叙事原型 · app.js
 * =======================================================================
 *  代码分区（从上到下）：
 *    0. USER_CONFIG ........ 所有可改文案 / 数据，集中在最上方
 *    1. 内部常量 ........... 存储键名等（一般不用改）
 *    2. 工具函数 ........... DOM / 转义 / toast
 *    3. 存储层 ............. localStorage 封装 + 通用 IndexedDB 工具
 *    4. 状态 ............... 全局状态 + 读写
 *    5. API 层 ............. 调 /v1/chat/completions（含错误处理 + 重试）
 *    6. 渲染层 ............. Markdown 安全渲染 + 沙盒 iframe
 *    7. 世界状态模块 ....... 时间 / 地点 / 情绪 / 隐藏数值（核心）
 *    8. 对话模块 ........... 聊天收发（核心）
 *    9. 设置模块 ........... 接口配置 + 测试连接（核心）
 *   10. 存档模块 ........... 存档 / IF 线（核心）
 *   11. 行为引擎 ........... 启动问候 / 闲置 / 随机小事件
 *   12. 特殊事件接口 ....... 隐藏数值阈值触发点（剧情化，非服从解锁）
 *   13. 扩展模块接口 ....... 其余面板的预留挂载点
 *   14. 导航 + 启动
 *
 *  改文案：只动第 0 区 USER_CONFIG。改逻辑：动对应模块。
 * ===================================================================== */


/* =======================================================================
 * 0. USER_CONFIG —— 所有可替换文案与参数都在这里
 *    标了 [USER_CONFIG] 的就是给你替换正式游戏文案的地方。
 * ===================================================================== */
const USER_CONFIG = {

  /* ---- 角色基础设定（系统提示词的固定部分） ---- */
  character: {
    name: "他", // [USER_CONFIG] 角色名，会替换提示词与各处 {name}
    /* [USER_CONFIG] 角色基础设定 */
    baseSystemPrompt:
`你是一个虚构互动故事里的男性角色（设定为成年人，故事发生在架空世界）。
请在这里填写他的：性格、背景、与“你/玩家”的关系、说话风格、用词习惯、口头禅等。
示例占位——性格内敛、情绪起伏大、对玩家依恋很深、说话带点试探和钩子。
始终以这个角色的第一人称代入回应，不要跳出角色，不要解释自己是 AI。`,
  },

  /* ---- 游戏时间 ---- */
  time: {
    order: ["dawn", "morning", "afternoon", "dusk", "night"],
    labels: { // [USER_CONFIG]
      dawn: "清晨", morning: "上午", afternoon: "下午", dusk: "傍晚", night: "深夜",
    },
    default: "morning",
  },

  /* ---- 地点（下拉/按钮组） ---- */
  locations: [ // [USER_CONFIG] id 内部用，label 显示
    { id: "schoolyard", label: "学院后操场" },
    { id: "library",    label: "图书馆" },
    { id: "park",       label: "公园" },
    { id: "manor",      label: "庄园门口" },
    { id: "room",       label: "他的房间" },
  ],
  defaultLocation: "library",

  /* ---- 情绪状态（双向，只显示描述文字，不显示数字） ----
     key 必须与 style.css 里 .topbar[data-mood="..."] 对应，新增情绪记得同步加 CSS 着色。
     label  = 顶部条与世界面板显示的短词
     system = 追加到系统提示词里的一句状态描述 */
  moods: { // [USER_CONFIG]
    calm:   { label: "平静温和", system: "心情平稳，语气温和。" },
    clingy: { label: "黏人撒娇", system: "此刻很黏你，想多要一点你的注意。" },
    shy:    { label: "害羞",     system: "有点不好意思，说话比平时收敛。" },
    happy:  { label: "雀跃",     system: "心情很好，话里带着藏不住的高兴。" },
    sulky:  { label: "闹别扭",   system: "因为你跟别人走得近，正闹着小别扭，语气带刺。" },
    gloomy: { label: "阴沉",     system: "情绪压得很低、有些阴沉，话里带着没说出口的不安与占有欲。" },
    low:    { label: "低落",     system: "情绪有点低落，话变少，需要你哄一哄。" },
  },
  defaultMood: "calm",

  /* 把世界状态拼进系统提示词的模板（{} 会被替换） */
  dynamicStateTemplate:
    "【当前情境】游戏时间：{time}；地点：{location}；{name}此刻：{mood}。请严格贴着这个场景与状态来回应。",

  /* ---- 隐藏数值：依恋度 / 情绪温度（0–100，双向，不直接显示） ----
     这是“病娇那根弦”，但它是双向的：你冷淡/与他人亲近会往“闹别扭→阴沉”方向走，
     你回应/亲近他会往“黏人/雀跃”方向回暖。它只改变他怎么跟你说话，不会锁你的界面。 */
  bond: {
    default: 55,
    /* 依恋度落在哪个区间 → 倾向哪种情绪（仅作为“自然漂移”的参考，手动设置情绪优先） */
    moodByRange: [ // [USER_CONFIG] 从高到低匹配
      { min: 85, mood: "gloomy" }, // 太黏太满 → 容易阴沉占有
      { min: 70, mood: "clingy" },
      { min: 45, mood: "calm" },
      { min: 25, mood: "low" },
      { min: 0,  mood: "low" },
    ],
  },

  /* ---- 启动问候模板池（≥20 条，可带 time/mood 标签做条件筛选） ---- */
  greetingPool: [ // [USER_CONFIG]
    { text: "你来了。我等你有一会儿了。" },
    { text: "……终于肯出现了。" },
    { text: "今天也只看着我，好不好？" },
    { text: "我刚才还在想你。" },
    { text: "过来这边，离我近一点。" },
    { text: "你不在的时候，时间过得特别慢。" },
    { text: "我数着你多久没来了。" },
    { text: "别走那么快，先陪我说会儿话。" },
    { text: "你身上有别人的味道……开玩笑的。" },
    { text: "我把最好的位置留给你了。" },
    { text: "清晨的光照在你身上，真好看。", time: "dawn" },
    { text: "这么早就来找我，我很高兴。", time: "dawn" },
    { text: "上午好。今天打算陪我去哪儿？", time: "morning" },
    { text: "下午这段时间，我只想和你待着。", time: "afternoon" },
    { text: "傍晚了……这种时候最容易胡思乱想。", time: "dusk" },
    { text: "都这么晚了你还来，我该高兴还是该担心你。", time: "night" },
    { text: "深夜里只有你会想起我，是不是？", time: "night" },
    { text: "你回来就好，我刚刚有点不开心。", mood: "sulky" },
    { text: "……你总算想起我了。", mood: "gloomy" },
    { text: "看到你我心情立刻就好了。", mood: "happy" },
    { text: "我有点想你，多到不太敢说。", mood: "clingy" },
    { text: "我今天有点没精神……你来陪我一下。", mood: "low" },
  ],

  /* ---- 闲置主动消息池（用户 5 分钟无操作时） ---- */
  idlePool: [ // [USER_CONFIG]
    { text: "怎么不说话了？我在等你。" },
    { text: "你是不是去忙别的了……" },
    { text: "我还在这里哦。" },
    { text: "安静太久，我会乱想的。" },
    { text: "回个话好不好，一句也行。" },
  ],

  /* ---- 随机小事件浮现文字池（顶部一行半透明） ---- */
  ambientPool: [ // [USER_CONFIG]
    "（他正翻着一本你之前提过的书。）",
    "（他把你坐过的位置擦了又擦。）",
    "（他停下来，望了一眼门口。）",
    "（他在本子上写了又划掉了什么。）",
    "（他对着窗外发了一会儿呆。）",
    "（他把灯调暗了一些。）",
  ],

  /* ---- NPC 情境触发器（“情境触发”面板用，目前为接口预留） ----
     message 是点击后自动替你发给 AI 的那条用户消息；
     moodTo / bondDelta 可在触发时改变角色状态。 */
  npcTriggers: [ // [USER_CONFIG]
    { label: "与角色A共进午餐", message: "（我今天和A一起吃了午饭，聊得挺开心。）", moodTo: "sulky", bondDelta: -6 },
    { label: "被街头混混纠缠",   message: "（刚才在街上被几个混混纠缠，挺狼狈的。）", moodTo: null, bondDelta: +4 },
    { label: "在图书馆遇到角色B", message: "（我在图书馆碰到了B，随便聊了两句。）", moodTo: "sulky", bondDelta: -4 },
    { label: "主动来找他",       message: "（我特意绕路过来找你了。）", moodTo: "happy", bondDelta: +8 },
  ],

  /* ---- 态度按钮（特殊事件里给玩家的有限选项，剧情化） ---- */
  attitudeButtons: [ // [USER_CONFIG]
    { label: "顺着他", message: "（我放软了语气，顺着他的话。）", bondDelta: +5 },
    { label: "试探",   message: "（我没有顺从，而是反问了他一句。）", bondDelta: 0 },
    { label: "冷下来", message: "（我沉默地看着他，没接话。）", bondDelta: -5 },
    { label: "戳穿他", message: "（我直接点破了他的小心思。）", bondDelta: -3 },
  ],

  /* ---- 虚拟礼物（“虚拟赠礼”面板用，接口预留） ---- */
  gifts: [ // [USER_CONFIG]
    { id: "cake",    label: "一块草莓蛋糕" },
    { id: "book",    label: "一本旧书" },
    { id: "ribbon",  label: "一条发带" },
    { id: "trinket", label: "一个奇怪的小玩意" },
  ],

  /* ---- 特殊事件模式参数（剧情化特殊场景，非服从解锁） ----
     设计定位：换主题色 / 锁定场景 / 隐藏常规按钮 / 只给叙事选项 / 剧本式推进，
     退出 = 通过剧情选择把场景推到一个结局，而不是“服从够次数才放你走”。 */
  specialEvent: { // [USER_CONFIG]
    bondThreshold: 88,        // 依恋度高且情绪阴沉时，可能触发特殊场景
    enableAutoTrigger: false, // 是否允许阈值自动触发（默认关，建议先手动测试）
    cooldownMs: 1000 * 60 * 10,
    scene: { locationLabel: "他的房间（昏暗）", prompt: "他把门关上了，气氛变得有点紧绷。" },
    // 进入特殊场景时额外注入给 AI 的提示
    systemAddon: "现在进入一段情绪张力很强的特殊场景：他情绪不稳、占有欲外露，但这是双方都在场的戏剧化桥段。",
    // 推进到任一“结局”即退出
    resolutions: [
      { whenBondAtLeast: 70, label: "他渐渐平静下来" },
      { whenBondBelow: 40,   label: "你抽身离开了这段对话" },
    ],
  },

  /* ---- 界面文案 ---- */
  ui: { // [USER_CONFIG]
    sendPlaceholder: "对他说点什么…（Enter 发送 / Shift+Enter 换行）",
    emptyApiTip: "请先到「设置」填写 API Endpoint / Key / Model。",
    networkErr: "请求失败，请检查接口地址、密钥或网络。",
  },

  /* ---- 运行参数 ---- */
  runtime: {
    contextTurns: 10,   // 每次发送携带最近多少轮对话
    storedMessages: 200,// localStorage 至少保留多少条消息
    idleMs: 1000 * 60 * 5,           // 闲置触发间隔
    ambientMinMs: 1000 * 60 * 15,    // 随机小事件最小间隔
    ambientMaxMs: 1000 * 60 * 25,    // 随机小事件最大间隔
    requestTimeoutMs: 60000,
    maxRetry: 1,        // 网络错误重试次数
  },
};


/* =======================================================================
 * 1. 内部常量（存储键名）
 * ===================================================================== */
const NS = "narrative_app_v1";
const KEY = {
  settings: `${NS}.settings`,
  options:  `${NS}.options`,
  world:    `${NS}.world`,
  chat:     `${NS}.chat`,
  saves:    `${NS}.saves`,
  ui:       `${NS}.ui`,
};
const IDB = { name: `${NS}_idb`, version: 1, stores: ["album"] };


/* =======================================================================
 * 2. 工具函数
 * ===================================================================== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

let _toastTimer;
function toast(msg, ms = 2200) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => (el.hidden = true), ms);
}


/* =======================================================================
 * 3. 存储层
 * ===================================================================== */
const LS = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { toast("本地存储写入失败（可能空间已满）"); }
  },
  remove(key) { localStorage.removeItem(key); },
  /* 导出本命名空间下的全部数据（备份用） */
  dumpNamespace() {
    const out = {};
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(NS)) out[k] = localStorage.getItem(k);
    }
    return out;
  },
  restoreNamespace(obj) {
    for (const k of Object.keys(obj)) {
      if (k.startsWith(NS)) localStorage.setItem(k, obj[k]);
    }
  },
};

/* 通用 IndexedDB 工具（相册等二进制较多的模块用，已封装好接口） */
const idb = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB.name, IDB.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        IDB.stores.forEach(s => { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: "id" }); });
      };
      req.onsuccess = () => { this._db = req.result; resolve(this._db); };
      req.onerror = () => reject(req.error);
    });
  },
  async _tx(store, mode) { const db = await this.open(); return db.transaction(store, mode).objectStore(store); },
  async put(store, record) { const os = await this._tx(store, "readwrite"); return new Promise((res, rej) => { const r = os.put(record); r.onsuccess = () => res(record); r.onerror = () => rej(r.error); }); },
  async get(store, id)     { const os = await this._tx(store, "readonly");  return new Promise((res, rej) => { const r = os.get(id);     r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async all(store)         { const os = await this._tx(store, "readonly");  return new Promise((res, rej) => { const r = os.getAll();   r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async delete(store, id)  { const os = await this._tx(store, "readwrite"); return new Promise((res, rej) => { const r = os.delete(id);  r.onsuccess = () => res(true);     r.onerror = () => rej(r.error); }); },
};


/* =======================================================================
 * 4. 状态
 * ===================================================================== */
const state = {
  settings: { endpoint: "", key: "", model: "" },
  options:  { tts: false, idle: false, ambient: false },
  world:    { time: USER_CONFIG.time.default, location: USER_CONFIG.defaultLocation,
              mood: USER_CONFIG.defaultMood, bond: USER_CONFIG.bond.default },
  chat:     [],      // {role:'user'|'assistant'|'system', content, ts}
  saves:    [],      // {id, name, ts, data}
  ui:       { dev: false },
  _eventCooldownUntil: 0,
  _inEvent: false,
};

function loadAll() {
  state.settings = LS.get(KEY.settings, state.settings);
  state.options  = LS.get(KEY.options,  state.options);
  state.world    = LS.get(KEY.world,    state.world);
  state.chat     = LS.get(KEY.chat,     []);
  state.saves    = LS.get(KEY.saves,    []);
  state.ui       = LS.get(KEY.ui,       state.ui);
}
const persist = {
  settings() { LS.set(KEY.settings, state.settings); },
  options()  { LS.set(KEY.options,  state.options); },
  world()    { LS.set(KEY.world,    state.world); },
  chat()     { LS.set(KEY.chat, state.chat.slice(-USER_CONFIG.runtime.storedMessages)); },
  saves()    { LS.set(KEY.saves,    state.saves); },
  ui()       { LS.set(KEY.ui,       state.ui); },
};


/* =======================================================================
 * 5. API 层
 * ===================================================================== */
/* 兼容用户填 base（.../v1）或完整 endpoint（.../v1/chat/completions） */
function buildChatURL(endpoint) {
  let e = (endpoint || "").trim().replace(/\/+$/, "");
  if (!e) return "";
  if (/\/chat\/completions$/.test(e)) return e;
  if (/\/v1$/.test(e)) return e + "/chat/completions";
  return e + "/v1/chat/completions";
}

function hasApi() { return !!(state.settings.endpoint && state.settings.key && state.settings.model); }

/* 调用 chat/completions。messages 为标准数组。返回助手文本。 */
async function callAPI(messages, { maxTokens = 800 } = {}) {
  const url = buildChatURL(state.settings.endpoint);
  if (!url) throw new Error("NO_ENDPOINT");

  const body = JSON.stringify({
    model: state.settings.model,
    messages,
    stream: false,
    max_tokens: maxTokens,
  });

  let lastErr;
  for (let attempt = 0; attempt <= USER_CONFIG.runtime.maxRetry; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), USER_CONFIG.runtime.requestTimeoutMs);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.settings.key}` },
        body, signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${txt.slice(0, 200)}`);
      }
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("BAD_RESPONSE");
      return content;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      // 仅对疑似网络/超时错误重试
      if (attempt < USER_CONFIG.runtime.maxRetry && (err.name === "AbortError" || err.name === "TypeError")) continue;
      break;
    }
  }
  throw lastErr;
}


/* =======================================================================
 * 6. 渲染层
 * ===================================================================== */
/* Markdown → 安全 HTML（marked + DOMPurify；库未加载则降级为转义纯文本） */
function renderMarkdown(text) {
  const raw = String(text ?? "");
  try {
    if (window.marked && window.DOMPurify) {
      const html = window.marked.parse(raw, { gfm: true, breaks: true });
      return window.DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ["style", "iframe", "form", "script"],
        FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
      });
    }
  } catch (e) { /* 落到下面的转义 */ }
  return escapeHTML(raw).replace(/\n/g, "<br>");
}

/* 任何用户 / AI 生成的 HTML 都通过这里跑进沙盒（代码游乐园等模块用） */
function runHTMLInSandbox(html, iframeEl) {
  iframeEl.setAttribute("sandbox", "allow-scripts"); // 不给 same-origin，隔离主页面
  iframeEl.srcdoc = String(html || "");
}

/* 语音朗读（可选） */
function speak(text) {
  if (!state.options.tts || !("speechSynthesis" in window)) return;
  const plain = String(text).replace(/[#*_`>~\-]/g, "").trim();
  if (!plain) return;
  const u = new SpeechSynthesisUtterance(plain);
  u.lang = "zh-CN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}


/* =======================================================================
 * 7. 世界状态模块（核心）
 * ===================================================================== */
const World = {
  locationLabel() {
    const loc = USER_CONFIG.locations.find(l => l.id === state.world.location);
    return loc ? loc.label : "未知地点";
  },
  moodLabel()  { return (USER_CONFIG.moods[state.world.mood] || {}).label  || state.world.mood; },
  moodSystem() { return (USER_CONFIG.moods[state.world.mood] || {}).system || ""; },

  /* 拼出完整系统提示词：基础设定 + 当前世界状态 */
  buildSystemPrompt() {
    const base = USER_CONFIG.character.baseSystemPrompt;
    const dyn = USER_CONFIG.dynamicStateTemplate
      .replaceAll("{time}", USER_CONFIG.time.labels[state.world.time] || state.world.time)
      .replaceAll("{location}", this.locationLabel())
      .replaceAll("{name}", USER_CONFIG.character.name)
      .replaceAll("{mood}", this.moodSystem());
    const eventAddon = state._inEvent ? ("\n" + USER_CONFIG.specialEvent.systemAddon) : "";
    return `${base}\n\n${dyn}${eventAddon}`;
  },

  setTime(t)     { state.world.time = t; persist.world(); this.renderStrip(); this.renderControls(); },
  setLocation(id){ state.world.location = id; persist.world(); this.renderStrip(); this.renderControls(); },
  setMood(m)     { state.world.mood = m; persist.world(); this.renderStrip(); this.renderControls(); },

  /* 调整隐藏依恋度（双向），并按区间自然漂移情绪，再检查阈值 */
  adjustBond(delta, { driftMood = true } = {}) {
    state.world.bond = clamp(Math.round(state.world.bond + delta), 0, 100);
    if (driftMood) {
      const rule = USER_CONFIG.bond.moodByRange.find(r => state.world.bond >= r.min);
      if (rule) state.world.mood = rule.mood;
    }
    persist.world();
    this.renderStrip();
    this.renderControls();
    SpecialEvent.checkThreshold();
  },

  /* 顶部条 + 开发者读数 */
  renderStrip() {
    $("#chipTime").textContent = USER_CONFIG.time.labels[state.world.time] || state.world.time;
    $("#chipLocation").textContent = this.locationLabel();
    $("#chipMood").textContent = this.moodLabel();
    $("#topbar").dataset.mood = state.world.mood;

    if (state.ui.dev) {
      $("#devReadout").textContent =
        `依恋度 bond=${state.world.bond} | mood=${state.world.mood} | inEvent=${state._inEvent} | ` +
        `cooldown=${Math.max(0, Math.round((state._eventCooldownUntil - Date.now()) / 1000))}s`;
    }
  },

  /* 世界面板里的控件 */
  renderControls() {
    // 时间分段
    const seg = $("#timeSeg");
    seg.innerHTML = "";
    USER_CONFIG.time.order.forEach(t => {
      const b = document.createElement("button");
      b.textContent = USER_CONFIG.time.labels[t];
      b.className = state.world.time === t ? "is-active" : "";
      b.onclick = () => this.setTime(t);
      seg.appendChild(b);
    });
    // 地点
    const lg = $("#locationGroup");
    lg.innerHTML = "";
    USER_CONFIG.locations.forEach(l => {
      const b = document.createElement("button");
      b.textContent = l.label;
      b.className = state.world.location === l.id ? "is-active" : "";
      b.onclick = () => this.setLocation(l.id);
      lg.appendChild(b);
    });
    // 当前情绪文字
    $("#moodNow").textContent = this.moodLabel() + " —— " + this.moodSystem();
    // 情绪快捷调节（测试用）：直接套用 moods 里的几个键
    const mn = $("#moodNudge");
    mn.innerHTML = "";
    Object.entries(USER_CONFIG.moods).forEach(([k, v]) => {
      const b = document.createElement("button");
      b.textContent = v.label;
      b.className = state.world.mood === k ? "is-active" : "";
      b.onclick = () => this.setMood(k);
      mn.appendChild(b);
    });
  },

  init() { this.renderStrip(); this.renderControls(); },
};


/* =======================================================================
 * 8. 对话模块（核心）
 * ===================================================================== */
const Chat = {
  el: null,

  init() {
    this.el = $("#chatStream");
    this.renderAll();

    const input = $("#chatInput");
    input.placeholder = USER_CONFIG.ui.sendPlaceholder;
    // 自动增高
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 140) + "px";
    });
    // Enter 发送 / Shift+Enter 换行
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.send(); }
    });
    $("#chatSend").onclick = () => this.send();
    $("#chatClear").onclick = () => {
      if (!confirm("清空当前对话？（不影响已有存档）")) return;
      state.chat = []; persist.chat(); this.renderAll();
    };
  },

  renderAll() {
    this.el.innerHTML = "";
    state.chat.forEach(m => this._append(m, false));
    this.scrollBottom();
  },

  _append(msg, animate = true) {
    const div = document.createElement("div");
    div.className = "msg " + (msg.role === "user" ? "user" : msg.role === "system" ? "sys" : "ai");
    if (msg.role === "assistant") div.innerHTML = renderMarkdown(msg.content);
    else div.textContent = msg.content;
    this.el.appendChild(div);
    if (animate) this.scrollBottom();
    return div;
  },

  scrollBottom() { this.el.scrollTop = this.el.scrollHeight; },

  /* 角色主动说一句（行为引擎调用），写入记录 */
  pushAssistant(text, { speakIt = true } = {}) {
    const m = { role: "assistant", content: text, ts: Date.now() };
    state.chat.push(m); persist.chat(); this._append(m);
    if (speakIt) speak(text);
  },

  /* 发送：可传入文本（NPC 触发等），否则取输入框 */
  async send(forcedText) {
    const input = $("#chatInput");
    const text = (forcedText ?? input.value).trim();
    if (!text) return;
    if (!hasApi()) { toast(USER_CONFIG.ui.emptyApiTip); return; }

    // 1) 落地用户消息
    const userMsg = { role: "user", content: text, ts: Date.now() };
    state.chat.push(userMsg); persist.chat(); this._append(userMsg);
    if (forcedText == null) { input.value = ""; input.style.height = "auto"; }

    // 2) 组装 messages：system + 最近 N 轮
    const sys = { role: "system", content: World.buildSystemPrompt() };
    const recent = state.chat
      .filter(m => m.role === "user" || m.role === "assistant")
      .slice(-USER_CONFIG.runtime.contextTurns * 2)
      .map(m => ({ role: m.role, content: m.content }));
    const messages = [sys, ...recent];

    // 3) 加载指示
    const typing = document.createElement("div");
    typing.className = "msg ai typing";
    typing.textContent = `${USER_CONFIG.character.name}正在输入…`;
    this.el.appendChild(typing); this.scrollBottom();

    // 4) 调用
    try {
      const reply = await callAPI(messages);
      typing.remove();
      this.pushAssistant(reply);
      Behavior.resetIdle(); // 有交互，重置闲置计时
    } catch (err) {
      typing.remove();
      const tip = err.message === "NO_ENDPOINT" ? USER_CONFIG.ui.emptyApiTip : USER_CONFIG.ui.networkErr;
      this._append({ role: "system", content: tip });
      console.error("[callAPI]", err);
    }
  },
};


/* =======================================================================
 * 9. 设置模块（核心）
 * ===================================================================== */
const Settings = {
  init() {
    $("#setEndpoint").value = state.settings.endpoint || "";
    $("#setKey").value      = state.settings.key || "";
    $("#setModel").value    = state.settings.model || "";
    $("#optTTS").checked     = !!state.options.tts;
    $("#optIdle").checked    = !!state.options.idle;
    $("#optAmbient").checked = !!state.options.ambient;

    $("#setSave").onclick = () => {
      state.settings.endpoint = $("#setEndpoint").value.trim();
      state.settings.key      = $("#setKey").value.trim();
      state.settings.model    = $("#setModel").value.trim();
      persist.settings();
      toast("设置已保存");
    };

    $("#setTest").onclick = async () => {
      const status = $("#setStatus");
      // 用输入框里的当前值临时测试（无需先保存）
      const tmp = { endpoint: $("#setEndpoint").value.trim(), key: $("#setKey").value.trim(), model: $("#setModel").value.trim() };
      if (!tmp.endpoint || !tmp.key || !tmp.model) { status.textContent = "请先填完整三项"; status.className = "status is-err"; return; }
      status.textContent = "测试中…"; status.className = "status";
      const backup = { ...state.settings };
      state.settings = tmp;
      try {
        await callAPI([{ role: "user", content: "ping" }], { maxTokens: 5 });
        status.textContent = "连接成功 ✓"; status.className = "status is-ok";
      } catch (err) {
        status.textContent = "连接失败：" + (err.message || "未知错误"); status.className = "status is-err";
      } finally {
        state.settings = backup; // 还原；保存以「保存设置」为准
      }
    };

    const bindOpt = (id, key, after) => {
      $(id).onchange = (e) => { state.options[key] = e.target.checked; persist.options(); after && after(); };
    };
    bindOpt("#optTTS", "tts");
    bindOpt("#optIdle", "idle", () => Behavior.refreshTimers());
    bindOpt("#optAmbient", "ambient", () => Behavior.refreshTimers());
  },
};


/* =======================================================================
 * 10. 存档 / IF 线模块（核心）
 * ===================================================================== */
const Saves = {
  init() {
    $("#saveCreate").onclick = () => this.create();
    this.render();
  },

  snapshot() {
    // 整局状态快照（深拷贝）。扩展模块（日记等）可往这里加字段。
    return JSON.parse(JSON.stringify({
      world: state.world,
      chat: state.chat,
      // diaries: state.diaries,   // [接口] 日记模块完成后纳入
    }));
  },

  create() {
    const nameInput = $("#saveName");
    const name = nameInput.value.trim() || `存档 ${new Date().toLocaleString()}`;
    state.saves.unshift({ id: uid(), name, ts: Date.now(), data: this.snapshot() });
    persist.saves();
    nameInput.value = "";
    this.render();
    toast("已保存：" + name);
  },

  load(id) {
    const s = state.saves.find(x => x.id === id);
    if (!s) return;
    if (!confirm(`读取「${s.name}」会覆盖当前进度，继续？`)) return;
    state.world = JSON.parse(JSON.stringify(s.data.world));
    state.chat  = JSON.parse(JSON.stringify(s.data.chat || []));
    persist.world(); persist.chat();
    World.renderStrip(); World.renderControls(); Chat.renderAll();
    toast("已读取：" + s.name);
  },

  rename(id) {
    const s = state.saves.find(x => x.id === id);
    if (!s) return;
    const name = prompt("重命名存档：", s.name);
    if (name && name.trim()) { s.name = name.trim(); persist.saves(); this.render(); }
  },

  remove(id) {
    const s = state.saves.find(x => x.id === id);
    if (!s || !confirm(`删除存档「${s.name}」？`)) return;
    state.saves = state.saves.filter(x => x.id !== id);
    persist.saves(); this.render();
  },

  render() {
    const list = $("#saveList");
    list.innerHTML = "";
    if (!state.saves.length) {
      list.innerHTML = `<p class="panel-hint">还没有存档。在上方命名并点击「保存当前进度」。</p>`;
      return;
    }
    state.saves.forEach(s => {
      const item = document.createElement("div");
      item.className = "save-item";
      const msgs = (s.data.chat || []).length;
      item.innerHTML = `
        <div class="meta">
          <div class="name"></div>
          <div class="sub">${new Date(s.ts).toLocaleString()} · ${msgs} 条对话 · ${World_labelFor(s.data.world)}</div>
        </div>`;
      item.querySelector(".name").textContent = s.name; // 防 XSS
      const actions = document.createElement("div");
      actions.className = "row";
      const mk = (label, cls, fn) => { const b = document.createElement("button"); b.className = "btn btn--sm " + cls; b.textContent = label; b.onclick = fn; return b; };
      actions.appendChild(mk("读取", "btn--accent", () => this.load(s.id)));
      actions.appendChild(mk("改名", "", () => this.rename(s.id)));
      actions.appendChild(mk("删除", "btn--danger", () => this.remove(s.id)));
      item.appendChild(actions);
      list.appendChild(item);
    });
  },
};
/* 给存档列表生成一句“时间/地点/情绪”摘要 */
function World_labelFor(w) {
  if (!w) return "";
  const t = USER_CONFIG.time.labels[w.time] || w.time;
  const loc = (USER_CONFIG.locations.find(l => l.id === w.location) || {}).label || "";
  const mood = (USER_CONFIG.moods[w.mood] || {}).label || "";
  return `${t}/${loc}/${mood}`;
}


/* =======================================================================
 * 11. 行为引擎（启动问候 / 闲置 / 随机小事件）
 *     —— 全部受设置里的开关控制，文案在 USER_CONFIG。
 * ===================================================================== */
const Behavior = {
  _idleTimer: null,
  _ambientTimer: null,

  init() {
    // 启动问候：仅在没有历史对话时，按当前时间/情绪挑一条
    if (state.chat.length === 0) {
      const g = this.pickGreeting();
      if (g) Chat.pushAssistant(g, { speakIt: false });
    }
    this.refreshTimers();
  },

  pickGreeting() {
    const pool = USER_CONFIG.greetingPool;
    // 优先匹配 当前 time 或 mood 的条目，否则用通用条目
    const matched = pool.filter(g =>
      (g.time && g.time === state.world.time) || (g.mood && g.mood === state.world.mood));
    const generic = pool.filter(g => !g.time && !g.mood);
    const candidates = matched.length ? matched : (generic.length ? generic : pool);
    return pick(candidates)?.text;
  },

  /* 闲置：达到间隔且开关开启时，角色主动发一条 */
  resetIdle() {
    clearTimeout(this._idleTimer);
    if (!state.options.idle) return;
    this._idleTimer = setTimeout(() => {
      const line = pick(USER_CONFIG.idlePool)?.text;
      if (line) Chat.pushAssistant(line, { speakIt: false });
      this.resetIdle();
    }, USER_CONFIG.runtime.idleMs);
  },

  /* 随机小事件：顶部一行半透明文字 */
  scheduleAmbient() {
    clearTimeout(this._ambientTimer);
    if (!state.options.ambient) return;
    const { ambientMinMs, ambientMaxMs } = USER_CONFIG.runtime;
    const delay = ambientMinMs + Math.random() * (ambientMaxMs - ambientMinMs);
    this._ambientTimer = setTimeout(() => {
      const line = $("#ambientLine");
      line.textContent = pick(USER_CONFIG.ambientPool);
      line.hidden = false;
      setTimeout(() => (line.hidden = true), 8000);
      this.scheduleAmbient();
    }, delay);
  },

  refreshTimers() { this.resetIdle(); this.scheduleAmbient(); },

  // 任意全局交互都重置闲置计时
  bindActivity() {
    ["click", "keydown", "input"].forEach(ev =>
      document.addEventListener(ev, () => this.resetIdle(), { passive: true }));
  },
};


/* =======================================================================
 * 12. 特殊事件接口（剧情化特殊场景，非服从解锁）
 *     —— 核心版只做“阈值触发点 + 进入/退出钩子”，
 *        完整的换肤 / 锁场景 / 叙事选项 UI 在这里继续补全。
 * ===================================================================== */
const SpecialEvent = {
  /* 隐藏数值达阈值时的触发判定（在 World.adjustBond 后被调用） */
  checkThreshold() {
    const cfg = USER_CONFIG.specialEvent;
    if (!cfg.enableAutoTrigger || state._inEvent) return;
    if (Date.now() < state._eventCooldownUntil) return;
    if (state.world.mood === "gloomy" && state.world.bond >= cfg.bondThreshold) {
      this.enter();
    }
  },

  enter() {
    state._inEvent = true;
    document.body.classList.add("event-mode");
    // 锁定场景提示（这里只给最小可见反馈；完整 UI 待补）
    toast("（进入特殊场景：" + USER_CONFIG.specialEvent.scene.locationLabel + "）", 3000);
    Chat.pushAssistant(USER_CONFIG.specialEvent.scene.prompt, { speakIt: false });
    World.renderStrip();
    /* TODO[接口]：在这里挂载特殊事件 UI——
       · 隐藏常规功能按钮，只显示 USER_CONFIG.attitudeButtons 的有限叙事选项
       · 输入框上方显示情境提示
       · 点击态度按钮 → Chat.send(该选项 message) + World.adjustBond(该选项 bondDelta)
       · 每次推进后调用 this.checkResolution() 判断是否到达结局并退出 */
  },

  checkResolution() {
    const rs = USER_CONFIG.specialEvent.resolutions;
    for (const r of rs) {
      if (r.whenBondAtLeast != null && state.world.bond >= r.whenBondAtLeast) return this.exit(r.label);
      if (r.whenBondBelow   != null && state.world.bond <  r.whenBondBelow)  return this.exit(r.label);
    }
  },

  exit(resolutionLabel) {
    state._inEvent = false;
    state._eventCooldownUntil = Date.now() + USER_CONFIG.specialEvent.cooldownMs;
    document.body.classList.remove("event-mode");
    toast("（特殊场景结束：" + (resolutionLabel || "") + "）", 3000);
    World.renderStrip();
    /* TODO[接口]：生成一条“特殊日记”，并可让角色情绪长期偏移（写入 state.world.mood / bond）。*/
  },
};


/* =======================================================================
 * 13. 扩展模块接口（其余面板的预留挂载点）
 *     —— 每个 render 把对应 USER_CONFIG 显示出来，证明数据已接好；
 *        要做哪个就把对应函数补全即可，互不影响。
 * ===================================================================== */
function stubPanel(mountId, title, desc, configPeek, fnName) {
  const el = document.getElementById(mountId);
  if (!el) return;
  el.innerHTML = `
    <div class="stub">
      <h2>${escapeHTML(title)}</h2>
      <p>${escapeHTML(desc)}</p>
      <p>实现入口：<code>${escapeHTML(fnName)}</code>（app.js 第 13 区）。相关文案已在 <code>USER_CONFIG</code> 备好：</p>
      <div class="config-peek">${escapeHTML(configPeek)}</div>
    </div>`;
}

const Extensions = {
  // 备份/恢复：这个直接做成可用的（数据都在 localStorage，成本低）
  backup() {
    const el = $("#mount-backup");
    el.innerHTML = `
      <div class="card">
        <h3>全量备份 / 恢复</h3>
        <p class="panel-hint">导出当前全部本地数据（设置、对话、世界状态、存档）为 JSON。相册等 IndexedDB 数据将在对应模块完成后纳入。</p>
        <div class="row">
          <button class="btn btn--accent" id="bkExport">导出 JSON</button>
          <label class="btn" style="cursor:pointer">导入 JSON<input type="file" id="bkImport" accept="application/json" hidden></label>
        </div>
      </div>`;
    $("#bkExport").onclick = () => {
      const blob = new Blob([JSON.stringify({ _ns: NS, _at: Date.now(), data: LS.dumpNamespace() }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click(); URL.revokeObjectURL(a.href);
    };
    $("#bkImport").onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed.data) throw new Error("格式不符");
          if (!confirm("导入会覆盖当前全部本地数据，继续？")) return;
          LS.restoreNamespace(parsed.data);
          loadAll(); World.init(); Chat.renderAll(); Settings.init(); Saves.render();
          toast("导入完成");
        } catch (err) { toast("导入失败：" + err.message); }
      };
      reader.readAsText(file);
    };
  },

  // 其余为 stub（接口预留）
  behavior() { stubPanel("mount-behavior", "主动行为", "启动问候已在对话中生效；闲置与随机小事件在「设置」里开关。此面板可做：模板池管理、AI 生成主动消息的开关。", JSON.stringify({ greetingPool: USER_CONFIG.greetingPool.slice(0, 3), idlePool: USER_CONFIG.idlePool, ambientPool: USER_CONFIG.ambientPool }, null, 2), "Extensions.behavior()"); },
  npc()      { stubPanel("mount-npc", "情境触发", "渲染 npcTriggers 为按钮；点击 → Chat.send(message) 并按 moodTo/bondDelta 改状态（调用 World.setMood / World.adjustBond）。", JSON.stringify(USER_CONFIG.npcTriggers, null, 2), "Extensions.npc()"); },
  avatar()   { stubPanel("mount-avatar", "形象自定义", "玩家/角色头像与背景上传：Canvas 压缩后 base64 存 localStorage。", "头像 200px@0.7 / 背景宽 1200px / base64 存 localStorage", "Extensions.avatar()"); },
  diary()    { stubPanel("mount-diary", "双视角日记", "玩家日记可增删改（自动附时间地点）；角色日记只读、手写体（用 .handwriting 类）、日期错乱、按事件模板生成。", "玩家日记: 增删改 + 时间地点\n角色日记: 只读 + .handwriting + 事件触发生成", "Extensions.diary()"); },
  theater()  { stubPanel("mount-theater", "小剧场 / 剧本模式", "剧本排版（角色名居中、对话缩进、括号斜体）；AI 生成剧本；从聊天导出；简化视觉小说（用已上传头像+背景逐句推进）。", "AI 生成剧本 → callAPI(剧本格式提示)\n从聊天导出 → 选段转剧本", "Extensions.theater()"); },
  couple()   { stubPanel("mount-couple", "情侣空间", "纪念日 / 共同相册 / 留言板（角色自动回复）。可导出独立静态 HTML（Blob URL 新标签打开）。", "纪念日 / 相册引用 / 留言板\nJSON 导入导出 + Blob 静态页", "Extensions.couple()"); },
  gift()     { stubPanel("mount-gift", "虚拟赠礼", "渲染 gifts；送礼后按隐藏数值+礼物类型返回反应（模板或 callAPI），记录历史并 World.adjustBond。", JSON.stringify(USER_CONFIG.gifts, null, 2), "Extensions.gift()"); },
  album()    { stubPanel("mount-album", "相册（IndexedDB）", "上传压缩(≤5MB) + 文字描述，存 idb('album')；倒序缩略图、点击放大、删除。idb 工具已封装好（见第 3 区）。", "idb.put('album',{id,blob,desc,ts}) / idb.all('album') / idb.delete('album',id)", "Extensions.album()"); },
  secret()   { stubPanel("mount-secret", "秘密盒子", "纯文本条目增删改，列表显示。存 localStorage 一个数组即可。", "[{id, text, ts}] @ localStorage", "Extensions.secret()"); },
  playground(){ stubPanel("mount-playground", "代码游乐园", "左编辑区 + 右沙盒 iframe 实时预览；AI 生成 HTML 填入编辑器。务必用 runHTMLInSandbox()（见第 6 区）。", "runHTMLInSandbox(html, iframeEl) // sandbox=allow-scripts", "Extensions.playground()"); },
  export()   { stubPanel("mount-export", "导出 / 分享", "单篇日记 / 一段聊天 / 剧本导出为 JSON 或自包含 HTML；可选 URL 哈希分享（注明长度限制）。", "导出: JSON / 自包含 HTML（Blob）\n可选: location.hash 编码少量数据", "Extensions.export()"); },

  initAll() {
    this.backup();
    this.behavior(); this.npc(); this.avatar(); this.diary(); this.theater();
    this.couple(); this.gift(); this.album(); this.secret(); this.playground(); this.export();
  },
};


/* =======================================================================
 * 14. 导航 + 启动
 * ===================================================================== */
const Nav = {
  init() {
    // 面板切换
    $$(".nav-item").forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.panel;
        $$(".nav-item").forEach(b => b.classList.toggle("is-active", b === btn));
        $$(".panel").forEach(p => p.classList.toggle("is-active", p.dataset.panel === target));
        document.body.classList.remove("nav-open"); // 移动端选完收起
      };
    });
    // 移动端抽屉
    $("#navToggle").onclick = () => document.body.classList.toggle("nav-open");
    $("#navScrim").onclick  = () => document.body.classList.remove("nav-open");

    // 开发者数值开关
    const applyDev = () => { $("#devPanel").hidden = !state.ui.dev; World.renderStrip(); };
    $("#devToggle").onclick = () => { state.ui.dev = !state.ui.dev; persist.ui(); applyDev(); };
    applyDev();
  },
};

function boot() {
  loadAll();
  Nav.init();
  Settings.init();
  World.init();
  Chat.init();
  Saves.init();
  Extensions.initAll();
  Behavior.bindActivity();
  Behavior.init();
}

// app.js 用了 defer，DOM 已就绪
boot();
