// ── Beautify App ──
function renderBeautifyApp(){
  var root=document.getElementById('beautify-root');
  if(!root)return;
  var savedTheme=localStorage.getItem('xsj_beautify_theme');
  var theme=savedTheme?JSON.parse(savedTheme):{};
  var appIconColor=theme.appIconColor||getComputedStyle(document.documentElement).getPropertyValue('--layer-3').trim()||'#d8d8d8';
  var cardColor=theme.cardColor||getComputedStyle(document.documentElement).getPropertyValue('--layer-1').trim()||'#f0f0f0';
  var bgColor=theme.bgColor||getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#fafafa';
  var appIconAppearance=theme.appIconAppearance||'glass';

  // Collect app icon data
  var appSlots=[
    {id:'settings',label:'设置'},
    {id:'worldbook',label:'世界书'},
    {id:'memory',label:'记忆'},
    {id:'chat',label:'Chat'},
    {id:'forum',label:'论坛'},
    {id:'game',label:'游戏'},
    {id:'beautify',label:'美化'},
    {id:'shop',label:'商城'},
    {id:'view',label:'查看(Dock)'},
    {id:'pet',label:'宠物(Dock)'},
    {id:'ao3',label:'AO3(Dock)'}
  ];

  var iconGridHTML=appSlots.map(function(s){
    var hasImg=theme['icon_'+s.id]?true:false;
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">'+
      '<div class="beautify-icon-slot" data-app="'+s.id+'" style="width:48px;height:48px;border-radius:14px;background:var(--layer-3);display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;position:relative;">'+
        (hasImg?'<img src="'+theme['icon_'+s.id]+'" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">':'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v14m-7-7h14"/></svg>')+
      '</div>'+
      '<span style="font-size:9px;color:var(--text-tertiary);">'+s.label+'</span>'+
    '</div>';
  }).join('');

  root.innerHTML=
    '<div style="display:flex;flex-direction:column;gap:18px;">'+
      // Section: App Icon Color
      '<div style="background:var(--layer-1);border-radius:20px;padding:18px;">'+
        '<div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:4px;">App 图标底色</div>'+
        '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:14px;">修改主屏幕所有 app 图标的背景颜色</div>'+
        '<div style="display:flex;align-items:center;gap:12px;">'+
          '<input type="color" id="beautify-icon-color" value="'+appIconColor+'" style="width:44px;height:44px;border:none;border-radius:12px;cursor:pointer;background:none;padding:0;">'+
          '<div style="flex:1;display:flex;gap:6px;flex-wrap:wrap;">'+
            '<div class="beautify-preset" data-color="#cccccc" style="width:28px;height:28px;border-radius:8px;background:#cccccc;cursor:pointer;"></div>'+
            '<div class="beautify-preset" data-color="#aaaaaa" style="width:28px;height:28px;border-radius:8px;background:#aaaaaa;cursor:pointer;"></div>'+
            '<div class="beautify-preset" data-color="#888888" style="width:28px;height:28px;border-radius:8px;background:#888888;cursor:pointer;"></div>'+
            '<div class="beautify-preset" data-color="#555555" style="width:28px;height:28px;border-radius:8px;background:#555555;cursor:pointer;"></div>'+
            '<div class="beautify-preset" data-color="#333333" style="width:28px;height:28px;border-radius:8px;background:#333333;cursor:pointer;"></div>'+
            '<div class="beautify-preset" data-color="#b8a9c9" style="width:28px;height:28px;border-radius:8px;background:#b8a9c9;cursor:pointer;"></div>'+
            '<div class="beautify-preset" data-color="#a9bdc9" style="width:28px;height:28px;border-radius:8px;background:#a9bdc9;cursor:pointer;"></div>'+
            '<div class="beautify-preset" data-color="#c9b8a9" style="width:28px;height:28px;border-radius:8px;background:#c9b8a9;cursor:pointer;"></div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      // Section: App Icon Appearance
      '<div style="background:var(--layer-1);border-radius:20px;padding:18px;">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:4px;">'+
          '<div style="font-size:14px;font-weight:500;color:var(--text);">App 外观</div>'+
          '<div style="font-size:10px;color:var(--text-muted);">当前：'+(appIconAppearance==='solid'?'纯色不透明':'透明毛玻璃')+'</div>'+
        '</div>'+
        '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:14px;">切换主屏幕和 Dock 图标背景，不影响头像、聊天、卡片等其他组件</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
          '<button class="beautify-appearance-btn" data-mode="glass" style="border:none;border-radius:16px;padding:12px 10px;font-family:inherit;cursor:pointer;color:var(--text);background:'+(appIconAppearance==='glass'?'var(--bg)':'var(--layer-2)')+';box-shadow:'+(appIconAppearance==='glass'?'0 1px 3px rgba(0,0,0,0.06)':'none')+';">'+
            '<div style="width:42px;height:42px;border-radius:13px;margin:0 auto 8px;background:rgba(255,255,255,0.34);backdrop-filter:blur(9px) saturate(1.8);-webkit-backdrop-filter:blur(9px) saturate(1.8);border:0.5px solid rgba(0,0,0,0.05);box-shadow:0 1px 2px rgba(0,0,0,0.03),inset 0 0 0 0.5px rgba(255,255,255,0.55);"></div>'+
            '<div style="font-size:12px;font-weight:600;">毛玻璃</div>'+
            '<div style="font-size:9px;color:var(--text-muted);margin-top:2px;">轻透、有模糊</div>'+
          '</button>'+
          '<button class="beautify-appearance-btn" data-mode="solid" style="border:none;border-radius:16px;padding:12px 10px;font-family:inherit;cursor:pointer;color:var(--text);background:'+(appIconAppearance==='solid'?'var(--bg)':'var(--layer-2)')+';box-shadow:'+(appIconAppearance==='solid'?'0 1px 3px rgba(0,0,0,0.06)':'none')+';">'+
            '<div style="width:42px;height:42px;border-radius:13px;margin:0 auto 8px;background:'+appIconColor+';border:0.5px solid rgba(0,0,0,0.04);"></div>'+
            '<div style="font-size:12px;font-weight:600;">纯色</div>'+
            '<div style="font-size:9px;color:var(--text-muted);margin-top:2px;">不透明、更干净</div>'+
          '</button>'+
        '</div>'+
      '</div>'+
      // Section: Card / Component Colors
      '<div style="background:var(--layer-1);border-radius:20px;padding:18px;">'+
        '<div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:4px;">组件底色</div>'+
        '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:14px;">修改卡片、面板、气泡的背景色</div>'+
        '<div style="display:flex;align-items:center;gap:16px;">'+
          '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">'+
            '<input type="color" id="beautify-bg-color" value="'+bgColor+'" style="width:38px;height:38px;border:none;border-radius:10px;cursor:pointer;background:none;padding:0;">'+
            '<span style="font-size:9px;color:var(--text-muted);">页面底</span>'+
          '</div>'+
          '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">'+
            '<input type="color" id="beautify-card-color" value="'+cardColor+'" style="width:38px;height:38px;border:none;border-radius:10px;cursor:pointer;background:none;padding:0;">'+
            '<span style="font-size:9px;color:var(--text-muted);">卡片底</span>'+
          '</div>'+
        '</div>'+
      '</div>'+
      // Section: Custom App Icons
      '<div style="background:var(--layer-1);border-radius:20px;padding:18px;">'+
        '<div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:4px;">自定义图标</div>'+
        '<div style="font-size:11px;color:var(--text-tertiary);margin-bottom:14px;">点击图标上传自定义图片替换</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-start;">'+iconGridHTML+'</div>'+
        '<input type="file" id="beautify-icon-input" accept="image/*" style="display:none;">'+
      '</div>'+
      // Reset
      '<div style="text-align:center;padding:8px;">'+
        '<span onclick="beautifyReset()" style="font-size:12px;color:var(--text-muted);cursor:pointer;">恢复默认</span>'+
      '</div>'+
    '</div>';

  // Bind events
  document.getElementById('beautify-icon-color').addEventListener('input',function(e){
    beautifyApplyIconColor(e.target.value);
  });
  document.querySelectorAll('.beautify-appearance-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      beautifySetIconAppearance(this.dataset.mode);
      renderBeautifyApp();
    });
  });
  document.getElementById('beautify-bg-color').addEventListener('input',function(e){
    document.documentElement.style.setProperty('--bg',e.target.value);
    beautifySave();
  });
  document.getElementById('beautify-card-color').addEventListener('input',function(e){
    document.documentElement.style.setProperty('--layer-1',e.target.value);
    document.documentElement.style.setProperty('--card-bg',e.target.value);
    document.documentElement.style.setProperty('--glass-bg',e.target.value);
    beautifySave();
  });
  document.querySelectorAll('.beautify-preset').forEach(function(p){
    p.addEventListener('click',function(){
      var c=this.dataset.color;
      document.getElementById('beautify-icon-color').value=c;
      beautifyApplyIconColor(c);
    });
  });
  // Icon upload slots
  var currentSlot=null;
  document.querySelectorAll('.beautify-icon-slot').forEach(function(slot){
    slot.addEventListener('click',function(){
      currentSlot=this.dataset.app;
      document.getElementById('beautify-icon-input').click();
    });
  });
  document.getElementById('beautify-icon-input').addEventListener('change',function(e){
    if(!e.target.files||!e.target.files[0]||!currentSlot)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      var url=ev.target.result;
      beautifyApplyCustomIcon(currentSlot,url);
      beautifySave();
      renderBeautifyApp();// refresh grid
    };
    reader.readAsDataURL(e.target.files[0]);
    e.target.value='';
  });
}
function beautifyHexToRgb(color){
  if(!color)return null;
  color=color.trim();
  if(color.indexOf('rgb')===0){
    var nums=color.match(/\d+(?:\.\d+)?/g);
    if(nums&&nums.length>=3)return {r:parseInt(nums[0],10),g:parseInt(nums[1],10),b:parseInt(nums[2],10)};
  }
  if(color[0]==='#'){
    if(color.length===4)color='#'+color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
    return {r:parseInt(color.slice(1,3),16),g:parseInt(color.slice(3,5),16),b:parseInt(color.slice(5,7),16)};
  }
  return null;
}
function beautifyDarkenColor(color,ratio){
  var rgb=beautifyHexToRgb(color)||{r:226,g:226,b:226};
  return '#'+Math.round(rgb.r*ratio).toString(16).padStart(2,'0')+Math.round(rgb.g*ratio).toString(16).padStart(2,'0')+Math.round(rgb.b*ratio).toString(16).padStart(2,'0');
}
function beautifyApplyIconAppearance(mode,color){
  mode=mode||'glass';
  color=color||getComputedStyle(document.documentElement).getPropertyValue('--layer-3').trim()||'#e2e2e2';
  var rgb=beautifyHexToRgb(color)||{r:226,g:226,b:226};
  if(mode==='solid'){
    document.documentElement.style.setProperty('--app-icon-bg',color);
    document.documentElement.style.setProperty('--app-icon-backdrop','none');
    document.documentElement.style.setProperty('--app-icon-border-color',window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.04)');
    document.documentElement.style.setProperty('--app-icon-shadow','none');
  }else{
    document.documentElement.style.setProperty('--app-icon-bg','rgba(255,255,255,0)');
    document.documentElement.style.setProperty('--app-icon-backdrop','blur(7px) saturate(1.55)');
    document.documentElement.style.setProperty('--app-icon-border-color',window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'rgba(255,255,255,0.10)':'rgba(255,255,255,0.22)');
    document.documentElement.style.setProperty('--app-icon-shadow','inset 0 0 0 0.5px rgba(255,255,255,0.45)');
  }
}
function beautifySetIconAppearance(mode){
  var theme=beautifyGetTheme();
  theme.appIconAppearance=mode;
  localStorage.setItem('xsj_beautify_theme',JSON.stringify(theme));
  beautifyApplyIconAppearance(mode,theme.appIconColor);
  beautifySave(mode);
  if(typeof toast==='function')toast(mode==='solid'?'已切换为纯色图标':'已切换为透明毛玻璃图标');
}
function beautifyApplyIconColor(color){
  document.documentElement.style.setProperty('--layer-3',color);
  document.documentElement.style.setProperty('--layer-4',beautifyDarkenColor(color,0.85));
  var theme=beautifyGetTheme();
  beautifyApplyIconAppearance(theme.appIconAppearance||'glass',color);
  beautifySave();
}
function beautifyApplyCustomIcon(appId,url){
  var theme=beautifyGetTheme();
  theme['icon_'+appId]=url;
  localStorage.setItem('xsj_beautify_theme',JSON.stringify(theme));
  // Apply to actual icons on main screen
  beautifyRefreshIcons();
}
function beautifyRefreshIcons(){
  var theme=beautifyGetTheme();
  document.querySelectorAll('.app-icon-wrap').forEach(function(wrap){
    var onclick=wrap.getAttribute('onclick')||'';
    var match=onclick.match(/openApp\('(\w+)'\)/);
    if(!match)return;
    var appId=match[1];
    var imgUrl=theme['icon_'+appId];
    var box=wrap.querySelector('.app-icon-box');
    if(!box)return;
    if(imgUrl){
      var existing=box.querySelector('.beautify-custom-img');
      if(!existing){
        var img=document.createElement('img');
        img.className='beautify-custom-img';
        img.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:inherit;';
        box.style.position='relative';
        box.style.overflow='hidden';
        box.appendChild(img);
      }
      (box.querySelector('.beautify-custom-img')).src=imgUrl;
    }else{
      var ci=box.querySelector('.beautify-custom-img');
      if(ci)ci.remove();
    }
  });
}
function beautifyGetTheme(){
  try{return JSON.parse(localStorage.getItem('xsj_beautify_theme'))||{};}catch(e){return {};}
}
function beautifySave(nextAppearance){
  var theme=beautifyGetTheme();
  theme.appIconColor=getComputedStyle(document.documentElement).getPropertyValue('--layer-3').trim();
  theme.cardColor=getComputedStyle(document.documentElement).getPropertyValue('--layer-1').trim();
  theme.bgColor=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  theme.appIconAppearance=nextAppearance||theme.appIconAppearance||'glass';
  localStorage.setItem('xsj_beautify_theme',JSON.stringify(theme));
}
function beautifyReset(){
  localStorage.removeItem('xsj_beautify_theme');
  document.documentElement.style.removeProperty('--bg');
  document.documentElement.style.removeProperty('--layer-1');
  document.documentElement.style.removeProperty('--layer-2');
  document.documentElement.style.removeProperty('--layer-3');
  document.documentElement.style.removeProperty('--layer-4');
  document.documentElement.style.removeProperty('--card-bg');
  document.documentElement.style.removeProperty('--glass-bg');
  document.documentElement.style.removeProperty('--app-icon-bg');
  document.documentElement.style.removeProperty('--app-icon-backdrop');
  document.documentElement.style.removeProperty('--app-icon-border-color');
  document.documentElement.style.removeProperty('--app-icon-shadow');
  document.querySelectorAll('.beautify-custom-img').forEach(function(i){i.remove();});
  renderBeautifyApp();
  if(typeof toast==='function')toast('已恢复默认');
}
// Load saved beautify theme on page load
function beautifyInit(){
  var theme=beautifyGetTheme();
  if(theme.appIconColor)beautifyApplyIconColor(theme.appIconColor);
  beautifyApplyIconAppearance(theme.appIconAppearance||'glass',theme.appIconColor);
  if(theme.bgColor)document.documentElement.style.setProperty('--bg',theme.bgColor);
  if(theme.cardColor){
    document.documentElement.style.setProperty('--layer-1',theme.cardColor);
    document.documentElement.style.setProperty('--card-bg',theme.cardColor);
    document.documentElement.style.setProperty('--glass-bg',theme.cardColor);
  }
  setTimeout(beautifyRefreshIcons,500);
}
setTimeout(beautifyInit,800);

// ── Chat App Module ──
const CHAT_STATE={currentTab:'chats',chatSubTab:'chats',searchQuery:'',searchVisible:false,contactsGroup:'all',contactsDeleteMode:false,contactsSearch:''};

const CHAT_MESSAGES=[];

// ── AI Assistant constant ──
const AI_ASSISTANT_ID = '__ai_assistant__';
const AI_ASSISTANT = {
  id: AI_ASSISTANT_ID,
  name: 'AI Assistant',
  avatar: '',
  gender: '其他',
  persona: '智能AI助手，温柔友善，博学多才，随时为你提供帮助。',
  mask: '',
  worldBook: '',
  voiceEnabled: false,
  isAi: true,
  isTop: false,
  addedTime: 0
};

function chatGetData(){
  try{
    const s=localStorage.getItem('xsj_chat_module');
    if(s){
      const d=JSON.parse(s);
      // ── Version migration ──
      if(!d.version){ d.version=1; }
      // Ensure required keys exist (safe migration)
      if(!d.contacts){ d.contacts={groups:[]}; }
      if(!Array.isArray(d.contacts.groups)){ d.contacts.groups=[]; }
      if(!d.discovers){ d.discovers=[]; }
      return d;
    }
  }catch(e){}
  // Default: only AI assistant, no preset friends
  return {
    version:1,
    contacts:{groups:[
      {name:'AI',contacts:[{...AI_ASSISTANT}]}
    ]},
    discovers:[]
  };
}
// Migration: clear any old preset data on first load
(function(){
  try{
    const s=localStorage.getItem('xsj_chat_module');
    if(!s){
      // Also clear extra msgs
      localStorage.removeItem('xsj_extra_msgs');
    }
  }catch(e){}
})();
function chatSaveData(data){
  try {
    localStorage.setItem('xsj_chat_module', JSON.stringify(data));
  } catch(e) {
    if (e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      showToast('⚠️ 存储空间不足，请到「我」→ 设置中清理图片后重试');
    } else {
      showToast('数据保存失败，请重试');
    }
  }
}

// Generate unique ID
function chatGenId(){return 'c_'+Date.now()+'_'+Math.floor(Math.random()*10000);}

// Get all contacts as flat array
function chatGetAllContacts(){
  const data=chatGetData();
  return data.contacts.groups.reduce((a,g)=>a.concat(g.contacts),[]);
}

function openChatApp(){
  const ov=document.getElementById('app-overlay'),ct=document.getElementById('app-content');
  ct.classList.add('chat-overlay-bg');
  ct.style.padding='0';
  ct.style.paddingTop='env(safe-area-inset-top, 0px)';
  ct.style.overflow='hidden';ct.style.display='flex';ct.style.flexDirection='column';ct.style.height='100%';
  ct.innerHTML=buildChatAppHTML();
  ov.style.display='block';
  requestAnimationFrame(()=>ov.classList.add('show'));
  chatInitHeader();
  // Load persisted extra chat messages
  try{const extra=JSON.parse(localStorage.getItem('xsj_extra_msgs')||'[]');extra.forEach(m=>{if(!CHAT_MESSAGES.find(x=>x.name===m.name))CHAT_MESSAGES.unshift(m);});}catch(e){}
  chatSwitchTab('chats');
}
