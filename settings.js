const APPS={
  settings:{t:'设置',b:'<div id="settings-home-root"></div>'},
  worldbook:{t:'世界书',b:'<div class="glass-card" style="padding:20px;border-radius:18px;margin-bottom:16px;"><div style="font-size:15px;font-weight:500;margin-bottom:8px;">世界观设定</div><p style="font-size:13px;opacity:.6;line-height:1.7;">在这里编辑角色的世界观、背景故事。世界书帮助AI理解你的创作宇宙。</p></div><div class="glass-card" style="padding:16px;border-radius:18px;"><div style="font-size:13px;opacity:.4;">暂无条目</div></div>'},
  memory:{t:'记忆',b:'<div class="glass-card" style="padding:20px;border-radius:18px;margin-bottom:12px;"><div style="font-size:15px;font-weight:500;margin-bottom:6px;">长期记忆</div><p style="font-size:13px;opacity:.6;line-height:1.7;">AI会自动记住重要信息。</p></div><div class="glass-card" style="padding:14px;border-radius:14px;margin-bottom:8px;"><div style="font-size:11px;opacity:.4;">记忆 #1</div><div style="font-size:13px;margin-top:4px;">用户喜欢简洁的对话风格</div></div><div class="glass-card" style="padding:14px;border-radius:14px;"><div style="font-size:11px;opacity:.4;">记忆 #2</div><div style="font-size:13px;margin-top:4px;">用户的时区是 UTC+8</div></div>'},
  chat:{t:'Chat',b:'<div style="display:flex;flex-direction:column;gap:10px;"><div class="glass-card" style="padding:14px;border-radius:16px;display:flex;align-items:center;gap:12px;"><div style="width:40px;height:40px;border-radius:20px;background:var(--subtle);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg></div><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:500;">助手</div><div style="font-size:12px;opacity:.4;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">你好！有什么可以帮你的？</div></div><div style="font-size:10px;opacity:.3;flex-shrink:0;">刚刚</div></div><div class="glass-card" style="padding:14px;border-radius:16px;display:flex;align-items:center;gap:12px;"><div style="width:40px;height:40px;border-radius:20px;background:var(--subtle);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg></div><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:500;">创作伙伴</div><div style="font-size:12px;opacity:.4;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">上次的故事写得真好...</div></div><div style="font-size:10px;opacity:.3;flex-shrink:0;">3分钟</div></div></div>'},
  forum:{t:'论坛',b:'<div class="glass-card" style="padding:16px;border-radius:16px;margin-bottom:12px;"><div style="font-size:14px;font-weight:500;">热门话题</div><div style="margin-top:10px;font-size:13px;opacity:.6;line-height:2;">• 新角色分享<br>• 创作心得交流<br>• 世界观讨论</div></div><div class="glass-card" style="padding:14px;border-radius:14px;"><div style="font-size:12px;opacity:.4;margin-bottom:8px;">最新帖子</div><div style="font-size:13px;line-height:2;">「如何让AI角色更有深度？」— 12回复<br>「分享我的城市世界观」— 8回复</div></div>'},
  game:{t:'游戏',b:'<div style="text-align:center;padding:32px 0;"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity:.2;margin:0 auto;display:block;"><rect x="2" y="6" width="20" height="12" rx="3"/><circle cx="8" cy="12" r="1.5"/><path d="M15 10l1 1 1-1m-1 1v2"/></svg><div style="font-size:16px;font-weight:500;margin-top:16px;">互动游戏</div><div style="font-size:12px;opacity:.4;margin-top:6px;">文字冒险、角色扮演</div></div><div class="glass-card" style="padding:14px;border-radius:14px;margin-bottom:8px;"><div style="font-size:13px;font-weight:500;">文字冒险</div></div><div class="glass-card" style="padding:14px;border-radius:14px;"><div style="font-size:13px;font-weight:500;">猜谜挑战</div></div>'},
  beautify:{t:'美化',b:'<div id="beautify-root"></div>'},
  shop:{t:'商城',b:'<div class="glass-card" style="padding:18px;border-radius:16px;margin-bottom:16px;"><div style="font-size:15px;font-weight:500;">精选推荐</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><div class="glass-card" style="padding:16px;border-radius:16px;text-align:center;"><div style="width:40px;height:40px;border-radius:12px;background:var(--subtle);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg></div><div style="font-size:12px;font-weight:500;">角色包</div></div><div class="glass-card" style="padding:16px;border-radius:16px;text-align:center;"><div style="width:40px;height:40px;border-radius:12px;background:var(--subtle);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div><div style="font-size:12px;font-weight:500;">插件</div></div></div>'},
  view:{t:'查看',b:'<div class="glass-card" style="padding:18px;border-radius:16px;margin-bottom:12px;"><div style="font-size:15px;font-weight:500;margin-bottom:6px;">对话历史</div><p style="font-size:13px;opacity:.5;">查看和管理所有对话记录。</p></div><div class="glass-card" style="padding:12px 14px;border-radius:12px;margin-bottom:8px;display:flex;justify-content:space-between;"><span style="font-size:13px;">与「助手」的对话</span><span style="font-size:11px;opacity:.3;">今天</span></div><div class="glass-card" style="padding:12px 14px;border-radius:12px;margin-bottom:8px;display:flex;justify-content:space-between;"><span style="font-size:13px;">与「创作伙伴」的对话</span><span style="font-size:11px;opacity:.3;">昨天</span></div><div class="glass-card" style="padding:12px 14px;border-radius:12px;display:flex;justify-content:space-between;"><span style="font-size:13px;">群组讨论</span><span style="font-size:11px;opacity:.3;">3天前</span></div>'},
  pet:{t:'宠物',b:'<div style="text-align:center;padding:28px 0;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity:.2;margin:0 auto;display:block;"><ellipse cx="7" cy="5" rx="2.5" ry="3"/><ellipse cx="17" cy="5" rx="2.5" ry="3"/><ellipse cx="4" cy="12" rx="2" ry="2.5"/><ellipse cx="20" cy="12" rx="2" ry="2.5"/><path d="M8 17c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z"/></svg><div style="font-size:16px;font-weight:500;margin-top:14px;">我的宠物</div><div style="font-size:12px;opacity:.4;margin-top:6px;">领养AI宠物</div></div><div class="glass-card active-scale" style="padding:14px;border-radius:16px;text-align:center;cursor:pointer;"><div style="font-size:14px;font-weight:500;">开始领养</div></div>'},
  ao3:{t:'AO3',b:'<div class="glass-card" style="padding:18px;border-radius:16px;margin-bottom:12px;"><div style="font-size:15px;font-weight:500;margin-bottom:6px;">作品库</div><p style="font-size:13px;opacity:.5;line-height:1.6;">浏览和管理你的所有故事。</p></div><div class="glass-card" style="padding:14px;border-radius:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:13px;font-weight:500;">星辰之约</div><div style="font-size:11px;opacity:.4;margin-top:2px;">原创 · 12章</div></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></div><div class="glass-card" style="padding:14px;border-radius:14px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:13px;font-weight:500;">城市之光</div><div style="font-size:11px;opacity:.4;margin-top:2px;">同人 · 5章</div></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></div>'},
  search:{t:'搜索',b:'<div class="glass-card" style="padding:10px 14px;border-radius:16px;display:flex;align-items:center;gap:10px;margin-bottom:20px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg><input type="text" placeholder="搜索聊天、角色、设置..." style="border:none;background:none;outline:none;font-size:14px;width:100%;color:var(--text);font-family:inherit;"></div><div style="font-size:12px;opacity:.4;margin-bottom:10px;">最近搜索</div><div class="glass-card" style="padding:10px 14px;border-radius:12px;margin-bottom:6px;font-size:13px;">助手</div><div class="glass-card" style="padding:10px 14px;border-radius:12px;margin-bottom:6px;font-size:13px;">世界观设定</div><div class="glass-card" style="padding:10px 14px;border-radius:12px;font-size:13px;">创作伙伴</div>'}
};

function settingsIconSvg(type){
  const icons={
    api:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14.78 3.03a3.75 3.75 0 015.3 5.3l-2.83 2.83a3.75 3.75 0 01-5.12.18l-.18-.18a1 1 0 00-1.42 1.42 5.75 5.75 0 008.12 0l2.83-2.83a5.75 5.75 0 00-8.13-8.13L12 2.97a1 1 0 001.41 1.42l1.37-1.36zM9.22 20.97a3.75 3.75 0 01-5.3-5.3l2.83-2.83a3.75 3.75 0 015.3 0 1 1 0 001.42-1.42 5.75 5.75 0 00-8.13 0L2.52 14.25a5.75 5.75 0 008.13 8.13L12 21.03a1 1 0 00-1.42-1.42l-1.36 1.36z"/></svg>',
    wallpaper:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    full:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    font:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.93 13.5h4.14L12 7.98 9.93 13.5zM20 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/></svg>',
    display:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77a1 1 0 00-.75 1.67c.4.44.52.98.52 1.33 0 1.1-.9 2-2 2zm0-18a8 8 0 100 16c0-.22-.06-.33-.06-.33a3 3 0 012.83-3.67H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></svg>',
    density:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/></svg>',
    storage:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/></svg>',
    notification:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
    privacy:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
    info:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
  };
  return icons[type]||icons.info;
}
function settingsArrowSvg(){
  return '<svg width="12" height="12" viewBox="0 0 24 24" fill="#cccccf"><path d="M9.29 6.71a1 1 0 011.42 0l4.58 4.58a1 1 0 010 1.42l-4.58 4.58a1 1 0 01-1.42-1.42L13.17 12 9.29 8.12a1 1 0 010-1.41z"/></svg>';
}
function settingsRow(key,icon,name,desc,value){
  return `<div class="settings-row" onclick="openSettingsDetail('${key}')">
    <div class="settings-icon">${settingsIconSvg(icon)}</div>
    <div class="settings-main"><div class="settings-name">${name}</div></div>
    <div class="settings-trailing">${value?`<div class="settings-value">${value}</div>`:''}<div class="settings-arrow">${settingsArrowSvg()}</div></div>
  </div>`;
}
function renderSettingsHome(){
  const root=document.getElementById('settings-home-root');
  if(!root)return;
  root.innerHTML=`
  <div class="settings-app-root">
    <div class="settings-hero">
      <div class="settings-hero-kicker">Preferences</div>
      <div class="settings-hero-title">设置</div>
    </div>
    <div class="settings-search">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#b8b8bc"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1114 9.5 4.49 4.49 0 019.5 14z"/></svg>
      <input type="text" placeholder="搜索设置">
    </div>
    <div class="settings-section">
      <div class="settings-section-head"><div class="settings-section-title">General</div></div>
      <div class="settings-pill-group">
        ${settingsRow('api','api','API 设置','', '已配置')}
        ${settingsRow('wallpaper','wallpaper','壁纸设置','', '锁屏 / 主屏')}
        ${settingsRow('fullscreen','full','全屏设置','', '开启')}
        ${settingsRow('font','font','字体设置','', '默认')}
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-head"><div class="settings-section-title">Style</div></div>
      <div class="settings-pill-group">
        ${settingsRow('display','display','界面主题','', '经典白')}
        ${settingsRow('density','density','排版密度','', '舒适')}
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-section-head"><div class="settings-section-title">System</div></div>
      <div class="settings-pill-group">
        ${settingsRow('notification','notification','消息推送','', '可设置')}
        ${settingsRow('storage','storage','内存与储存','', '42%')}
        ${settingsRow('privacy','privacy','隐私权限','', '')}
        ${settingsRow('about','info','关于本机','', 'v1.0')}
      </div>
    </div>
  </div>`;
}
function settingsSwitch(on=true){
  return `<div class="settings-switch ${on?'on':''}" onclick="event.stopPropagation();this.classList.toggle('on')"></div>`;
}

function settingsApiFetchModels(){
  const input=document.getElementById('settings-model-input');
  if(input && !input.value.trim()) input.value='gpt-4o-mini';
  showToast('已拉取模型');
}
function settingsApiTestConnection(){showToast('连接成功');}
function settingsApiConfirm(){showToast('已确认配置');}
function settingsApiSavePreset(){
  try{
    const data={
      apiUrl:document.getElementById('settings-api-url')?.value||'',
      apiKey:document.getElementById('settings-api-key')?.value||'',
      model:document.getElementById('settings-model-input')?.value||'',
      temp:document.getElementById('settings-temp-range')?.value||'0.8',
      topP:document.getElementById('settings-top-p')?.value||'1.0',
      maxTokens:document.getElementById('settings-max-tokens')?.value||'1024'
    };
    localStorage.setItem('xsj_api_preset', JSON.stringify(data));
  }catch(e){}
  showToast('已保存预设');
}
function settingsApiSyncRange(id,labelId){
  const el=document.getElementById(id),lab=document.getElementById(labelId);if(el&&lab)lab.textContent=el.value;
}
function openSettingsDetail(key){
  const ct=document.getElementById('app-content');
  if(!ct)return;
  const pages={
    api:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Connection</div>
          <div class="settings-page-title">API 设置</div>
        </div>
        <div class="settings-form-card">
          <div class="settings-form-grid">
            <div class="settings-form-section">
              <div class="settings-form-label">API 地址</div>
              <input id="settings-api-url" class="settings-input" placeholder="https://api.example.com/v1">
            </div>
            <div class="settings-form-section">
              <div class="settings-form-label">API 密钥</div>
              <input id="settings-api-key" class="settings-input" placeholder="sk-..." type="password">
            </div>
            <div class="settings-form-section">
              <div class="settings-form-label">当前模型</div>
              <input id="settings-model-input" class="settings-input" placeholder="输入或拉取模型" value="gpt-4o-mini">
            </div>
          </div>
          <div class="settings-inline-actions">
            <div class="settings-pill-btn secondary" onclick="settingsApiFetchModels()">拉取模型</div>
            <div class="settings-pill-btn secondary" onclick="settingsApiTestConnection()">测试连接</div>
            <div class="settings-pill-btn" onclick="settingsApiConfirm()">确认</div>
            <div class="settings-pill-btn ghost" onclick="settingsApiSavePreset()">保存预设</div>
          </div>
        </div>
        <div class="settings-page-grid-2">
          <div class="settings-feature-card settings-feature-soft">
            <div>
              <div class="settings-feature-meta">Temperature</div>
              <div class="settings-feature-title">模型回复温度</div>
            </div>
            <div class="settings-range-row">
              <input id="settings-temp-range" class="settings-range" type="range" min="0" max="2" step="0.1" value="0.8" oninput="settingsApiSyncRange('settings-temp-range','settings-temp-val')">
              <div id="settings-temp-val" class="settings-range-val">0.8</div>
            </div>
          </div>
          <div class="settings-feature-card settings-feature-mid">
            <div>
              <div class="settings-feature-meta">Top P</div>
              <div class="settings-feature-title">采样范围</div>
            </div>
            <div class="settings-range-row">
              <input id="settings-top-p" class="settings-range" type="range" min="0" max="1" step="0.05" value="1" oninput="settingsApiSyncRange('settings-top-p','settings-top-p-val')">
              <div id="settings-top-p-val" class="settings-range-val">1</div>
            </div>
          </div>
        </div>
        <div class="settings-feature-card">
          <div>
            <div class="settings-feature-meta">Advanced</div>
            <div class="settings-feature-title">更多参数</div>
          </div>
          <div class="settings-chip-row tight">
            <div class="settings-chip active">流式输出</div>
            <div class="settings-chip">函数调用</div>
            <div class="settings-chip">JSON 模式</div>
          </div>
          <div class="settings-form-section">
            <div class="settings-form-label">最大回复长度</div>
            <input id="settings-max-tokens" class="settings-input" value="1024">
          </div>
        </div>
      </div>`},
    wallpaper:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Wallpaper</div>
          <div class="settings-page-title">壁纸设置</div>
        </div>
        <div class="settings-preview-split">
          <div class="settings-preview-card">
            <div>
              <div class="settings-feature-meta">Lock Screen</div>
              <div class="settings-feature-title">锁屏</div>
            </div>
            <div class="settings-preview-box">Lock Preview</div>
            <div class="settings-button-row"><div class="settings-pill-btn" onclick="document.getElementById('wp-lock-input').click()">更换</div></div>
          </div>
          <div class="settings-preview-card soft">
            <div>
              <div class="settings-feature-meta">Home Screen</div>
              <div class="settings-feature-title">主屏</div>
            </div>
            <div class="settings-preview-box">Home Preview</div>
            <div class="settings-button-row"><div class="settings-pill-btn" onclick="document.getElementById('wp-main-input').click()">更换</div></div>
          </div>
        </div>
        <div class="settings-toggle-list">
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('display')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">显示方式</div></div><div class="settings-value">适应</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
          <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('display')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">模糊强度</div></div><div class="settings-value">关闭</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('display')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">暗化程度</div></div><div class="settings-value">轻</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
        </div>
      </div>`},
    fullscreen:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Display</div>
          <div class="settings-page-title">全屏设置</div>
        </div>
        <div class="settings-hero-panel soft">
          <div>
            <div class="settings-feature-meta">Immersive</div>
            <div class="settings-feature-title">沉浸模式</div>
          </div>
          <div class="settings-toggle-list">
            <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('full')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">沉浸全屏</div></div>${settingsSwitch(true)}</div>
            <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('density')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">状态栏融合</div></div>${settingsSwitch(true)}</div>
            <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('display')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">底部安全区</div></div>${settingsSwitch(true)}</div>
          </div>
        </div>
      </div>`},
    font:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Typography</div>
          <div class="settings-page-title">字体设置</div>
        </div>
        <div class="settings-font-sample">
          <div class="settings-font-line-a">小手机</div>
          <div class="settings-font-line-b">Quiet · Soft · Premium</div>
        </div>
        <div class="settings-feature-card settings-feature-soft">
          <div class="settings-feature-meta">Style</div>
          <div class="settings-chip-row tight">
            <div class="settings-chip active">默认</div>
            <div class="settings-chip">柔和</div>
            <div class="settings-chip">干净</div>
          </div>
        </div>
        <div class="settings-toggle-list">
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('font')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">字号</div></div><div class="settings-value">标准</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
          <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('font')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">字重</div></div><div class="settings-value">柔和</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('font')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">字间距</div></div><div class="settings-value">默认</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
        </div>
      </div>`},
    display:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Theme</div>
          <div class="settings-page-title">界面主题</div>
        </div>
        <div class="settings-feature-card">
          <div>
            <div class="settings-feature-meta">Palette</div>
            <div class="settings-feature-title">主题选择</div>
          </div>
          <div class="settings-theme-palette">
            <div class="settings-theme-swatch one">经典白</div>
            <div class="settings-theme-swatch two">冷灰白</div>
            <div class="settings-theme-swatch three">深灰</div>
          </div>
        </div>
        <div class="settings-toggle-list">
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('display')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">灰阶层级</div></div>${settingsSwitch(true)}</div>
          <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('density')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">降低细线</div></div>${settingsSwitch(true)}</div>
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('display')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">柔和圆角</div></div>${settingsSwitch(true)}</div>
        </div>
      </div>`},
    density:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Layout</div>
          <div class="settings-page-title">排版密度</div>
        </div>
        <div class="settings-feature-card settings-feature-soft">
          <div>
            <div class="settings-feature-meta">Density</div>
            <div class="settings-feature-title">界面节奏</div>
          </div>
          <div class="settings-chip-row tight">
            <div class="settings-chip">紧凑</div>
            <div class="settings-chip active">舒适</div>
            <div class="settings-chip">宽松</div>
          </div>
        </div>
      </div>`},
    notification:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Notification</div>
          <div class="settings-page-title">消息推送</div>
        </div>
        <div class="settings-hero-panel">
          <div class="settings-toggle-list">
            <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('notification')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">消息推送</div></div>${settingsSwitch(true)}</div>
            <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('notification')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">后台提醒</div></div>${settingsSwitch(true)}</div>
            <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('notification')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">静默时段</div></div><div class="settings-value">23:00 - 08:00</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
            <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('notification')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">锁屏预览</div></div><div class="settings-value">角色名</div><div class="settings-arrow">${settingsArrowSvg()}</div></div>
          </div>
        </div>
      </div>`},
    storage:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Storage</div>
          <div class="settings-page-title">内存与储存</div>
        </div>
        <div class="settings-memory-panel">
          <div class="settings-storage-row">
            <div>
              <div class="settings-storage-big">42%</div>
              <div class="settings-storage-small">26.9 GB / 64 GB</div>
            </div>
            <div class="settings-storage-small">可用 37.1 GB</div>
          </div>
          <div class="settings-bar"><div class="settings-bar-fill" style="width:42%"></div></div>
          <div class="settings-meter-list">
            <div class="settings-meter-item"><span>聊天数据</span><span>4.2 GB</span></div>
            <div class="settings-meter-item"><span>图片缓存</span><span>1.8 GB</span></div>
            <div class="settings-meter-item"><span>系统资源</span><span>20.9 GB</span></div>
          </div>
        </div>
        <div class="settings-dual-stat">
          <div class="settings-stat-card">
            <div class="settings-stat-label">Memory</div>
            <div class="settings-stat-value">1.6 GB</div>
            <div class="settings-stat-note">当前内存占用</div>
          </div>
          <div class="settings-stat-card soft">
            <div class="settings-stat-label">Cache</div>
            <div class="settings-stat-value">1.8 GB</div>
            <div class="settings-stat-note">可清理图片缓存</div>
          </div>
        </div>
      </div>`},
    privacy:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">Privacy</div>
          <div class="settings-page-title">隐私权限</div>
        </div>
        <div class="settings-toggle-list">
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('privacy')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">相册权限</div></div>${settingsSwitch(true)}</div>
          <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('privacy')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">麦克风权限</div></div>${settingsSwitch(false)}</div>
          <div class="settings-toggle-item"><div class="settings-icon">${settingsIconSvg('privacy')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">本地存储</div></div>${settingsSwitch(true)}</div>
          <div class="settings-toggle-item soft"><div class="settings-icon">${settingsIconSvg('notification')}</div><div class="settings-toggle-copy"><div class="settings-toggle-name">通知权限</div></div>${settingsSwitch(true)}</div>
        </div>
      </div>`},
    about:{body:`
      <div class="settings-page-stack">
        <div class="settings-page-intro">
          <div class="settings-page-kicker">About</div>
          <div class="settings-page-title">关于本机</div>
        </div>
        <div class="settings-about-card">
          <div class="settings-about-mark">${settingsIconSvg('info')}</div>
          <div class="settings-about-name">小手机</div>
          <div class="settings-about-meta"><span>v1.0</span><span>•</span><span>高保真</span><span>•</span><span>AI Companion</span></div>
          <div class="settings-about-list">
            <div class="settings-about-item"><span>系统版本</span><span>v1.0</span></div>
            <div class="settings-about-item"><span>接口状态</span><span>待接入</span></div>
            <div class="settings-about-item"><span>构建模式</span><span>高保真</span></div>
          </div>
        </div>
      </div>`}
  };
  const p=pages[key]||pages.about;
  ct.innerHTML=`<div class="app-back" onclick="openApp('settings')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></div><div class="settings-detail-root">${p.body}</div>`;
}
function openApp(name){
  if(name==='chat'){openChatApp();return;}
  const app=APPS[name];if(!app)return;
  const ov=document.getElementById('app-overlay'),ct=document.getElementById('app-content');
  ov.classList.toggle('settings-mode',name==='settings');
  ct.innerHTML='<div class="app-back" onclick="closeApp()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></div><div class="app-title">'+app.t+'</div>'+app.b;
  if(name==='settings'){renderSettingsHome();}
  if(name==='beautify'){renderBeautifyApp();}
  ov.style.display='block';requestAnimationFrame(()=>ov.classList.add('show'));
}
function closeApp(){const ov=document.getElementById('app-overlay');ov.classList.remove('show');ov.classList.remove('settings-mode');setTimeout(()=>ov.style.display='none',250);}
