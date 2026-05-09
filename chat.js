function buildChatAppHTML(){
  return `<div class="chat-app-container">
  <div id="chat-hdr-wrap" class="chat-app-header glass-card" style="border-radius:28px 28px 0 0;border-left:none;border-right:none;border-top:none;transition:opacity 0.22s ease;">
    <div class="chat-hdr-top">
      <div class="app-back" style="margin-bottom:0;" onclick="closeChatApp()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </div>
      <span style="flex:1;text-align:center;font-size:20px;font-weight:500;letter-spacing:1px;color:var(--text);pointer-events:none;font-family:'Quicksand',sans-serif;" class="chat-hdr-title-text">Chat</span>
      <!-- Placeholder keeps spacing balanced -->
      <div style="width:20px;"></div>
    </div>
    <div class="chat-app-user-row">
      <div class="chat-app-avatar" id="chat-hdr-avatar" onclick="chatChangeAvatar()">
        <img id="chat-hdr-av-img" style="display:none;width:100%;height:100%;object-fit:cover;">
        <svg id="chat-hdr-av-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg>
      </div>
      <div class="chat-app-userinfo">
        <div style="display:flex;align-items:center;flex-wrap:nowrap;">
          <div class="chat-app-username" id="chat-hdr-name">用户名</div>
          <span class="chat-hdr-status-pill" id="chat-hdr-status" onclick="meEditStatus()">·在线</span>
        </div>
        <div id="chat-hdr-bio" style="font-size:12px;color:var(--text-tertiary);margin-top:2px;cursor:pointer;transition:opacity .15s;" onclick="meEditBio()">I loved you from the start...</div>
      </div>
      <!-- Three dots aligned with username row -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;align-self:center;margin-left:4px;">
        <circle cx="4" cy="10" r="2" fill="#3a3a3c"/>
        <circle cx="10" cy="10" r="2" fill="#3a3a3c"/>
        <circle cx="16" cy="10" r="2" fill="#3a3a3c"/>
      </svg>
    </div>
  </div>
  <!-- Subtab bar: only shown when currentTab=chats -->
  <div class="chat-subtab-bar" id="chat-subtab-bar">
    <div class="chat-subtab-tabs">
      <div class="chat-subtab-item active" id="csub-chats" onclick="chatSubSwitch('chats')">Chats</div>
      <div class="chat-subtab-item" id="csub-group" onclick="chatSubSwitch('group')">Group</div>
      <div class="chat-subtab-item" id="csub-friends" onclick="chatSubSwitch('friends')">Friends</div>
      <div class="chat-subtab-item" id="csub-all" onclick="chatAddNewGroup()" style="color:var(--text);font-weight:600;">+Add</div>
    </div>
    <div class="chat-subtab-search" onclick="chatToggleSearch()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
    </div>
  </div>
  <!-- Inline search bar (hidden by default) -->
  <div class="chat-search-bar" id="chat-search-bar" style="display:none;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
    <input class="chat-search-input" id="chat-search-input" placeholder="搜索聊天…" oninput="chatDoSearch(this.value)" autocomplete="off">
    <span class="chat-search-clear" onclick="chatClearSearch()">取消</span>
  </div>
  <div class="chat-app-body" id="chat-app-body"></div>
  <div class="chat-tabbar-fade"></div>
  <div class="chat-app-tabbar">
    <div class="chat-tab-item active" id="chat-tab-chats" onclick="chatSwitchTab('chats')">
      <svg class="chat-tab-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      <span class="chat-tab-label">Chats</span>
    </div>
    <div class="chat-tab-item" id="chat-tab-contacts" onclick="chatSwitchTab('contacts')">
      <!-- Double-person icon for Contacts -->
      <svg class="chat-tab-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="7.5" r="2.5" opacity=".6"/><path d="M21 21c0-2.5-1.8-4.5-4-5.2" opacity=".6"/></svg>
      <span class="chat-tab-label">Contacts</span>
    </div>
    <div class="chat-tab-item" id="chat-tab-discover" onclick="chatSwitchTab('discover')">
      <svg class="chat-tab-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
      <span class="chat-tab-label">Discover</span>
    </div>
    <div class="chat-tab-item" id="chat-tab-me" onclick="chatSwitchTab('me')">
      <!-- Gear icon for Me -->
      <svg class="chat-tab-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 005 15.4a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      <span class="chat-tab-label">Me</span>
    </div>
  </div>
  <input type="file" id="chat-av-file-input" accept="image/*" style="display:none;" onchange="chatHandleAvatarFile(this)">
</div>`;
}

function closeChatApp(){
  const ct=document.getElementById('app-content');
  ct.classList.remove('chat-overlay-bg');
  ct.style.padding='';ct.style.overflow='';ct.style.display='';ct.style.flexDirection='';ct.style.height='';
  closeApp();
}

function chatInitHeader(){
  const name=XSJ.get(XSJ.NAME,''),status=XSJ.get(XSJ.STATUS,'·在线');
  const bio=XSJ.get(XSJ.USER_BIO,'I loved you from the start...');
  const avatar=XSJ.get(XSJ.AVATAR,'');
  const hn=document.getElementById('chat-hdr-name');if(hn&&name)hn.textContent=name;
  const hs=document.getElementById('chat-hdr-status');if(hs)hs.textContent=status;
  const hb=document.getElementById('chat-hdr-bio');if(hb)hb.textContent=bio;
  if(avatar){
    const img=document.getElementById('chat-hdr-av-img'),svg=document.getElementById('chat-hdr-av-svg');
    if(img){img.src=avatar;img.style.display='block';}
    if(svg)svg.style.display='none';
  }
}

function chatSwitchTab(tab){
  CHAT_STATE.currentTab=tab;
  // Reset search when switching main tabs
  CHAT_STATE.searchQuery='';CHAT_STATE.searchVisible=false;
  // Reset contacts state when leaving contacts
  if(tab!=='contacts'){CHAT_STATE.contactsDeleteMode=false;CHAT_STATE.contactsSearch='';}
  ['chats','contacts','discover','me'].forEach(t=>{
    const el=document.getElementById('chat-tab-'+t);
    if(el)el.classList.toggle('active',t===tab);
  });
  // Show/hide header for discover and me tabs
  const hdrWrap=document.getElementById('chat-hdr-wrap');
  if(hdrWrap){
    const hideHdr=(tab==='discover'||tab==='me');
    hdrWrap.style.display=hideHdr?'none':'block';
  }
  // Show subtab bar only for chats tab
  const subtab=document.getElementById('chat-subtab-bar');
  const searchBar=document.getElementById('chat-search-bar');
  if(subtab)subtab.style.display=tab==='chats'?'flex':'none';
  if(searchBar)searchBar.style.display='none';
  const body=document.getElementById('chat-app-body');if(!body)return;
  // Adjust body padding for discover tab (hero extends to edges)
  body.style.padding=tab==='discover'?'0':'';
  // For me tab: full height flex column, no overflow
  if(tab==='me'){
    body.style.display='flex';body.style.flexDirection='column';body.style.alignItems='';body.style.justifyContent='';body.style.overflow='hidden';body.style.height='100%';body.style.padding='0';
  } else {
    body.style.display='';body.style.flexDirection='';body.style.alignItems='';body.style.justifyContent='';body.style.overflow='';body.style.height='';body.style.padding='';
  }
  const page=document.createElement('div');page.className='chat-page';
  if(tab==='discover')page.style.padding='0';
  if(tab==='me'){page.style.padding='0';page.style.height='100%';page.style.overflow='hidden';}
  if(tab==='chats')page.innerHTML=chatBuildChats();
  else if(tab==='contacts')page.innerHTML=chatBuildContacts();
  else if(tab==='discover')page.innerHTML=chatBuildDiscover();
  else if(tab==='me')page.innerHTML=chatBuildMe();
  body.innerHTML='';body.appendChild(page);body.scrollTop=0;
  if(tab==='discover'){
    requestAnimationFrame(()=>{
      const savedBg=localStorage.getItem('discoverBg');
      if(savedBg){const bgEl=document.getElementById('dsc-hero-bg');if(bgEl)_safeBgUrl(bgEl,savedBg);}
    });
  }
  if(tab==='chats')setTimeout(chatAttachLongPress,50);
  if(tab==='contacts')setTimeout(chatAttachContactsLongPress,50);
}

/* ── Chats Tab ── */
function chatBuildChats(){
  // Build msgs from contacts + CHAT_MESSAGES extras
  const allContacts=chatGetAllContacts();
  let msgs=allContacts.map(c=>({
    id:c.id,
    name:c.name,
    preview:c.isAi?'你好！我是AI助手 ✨':'暂无消息',
    time:'',
    type:'friend',
    isTop:c.isTop||false,
    isAi:c.isAi||false,
    avatar:c.avatar||''
  }));
  // Add extra CHAT_MESSAGES that aren't already in contacts
  CHAT_MESSAGES.forEach(m=>{if(!msgs.find(x=>x.name===m.name))msgs.push({...m,isTop:false,isAi:false,avatar:'',id:''});});
  // Filter by subtab
  if(CHAT_STATE.chatSubTab==='group') msgs=msgs.filter(m=>m.type==='group');
  else if(CHAT_STATE.chatSubTab==='friends') msgs=msgs.filter(m=>m.type==='friend');
  // Filter by search
  if(CHAT_STATE.searchQuery){
    const q=CHAT_STATE.searchQuery.toLowerCase();
    msgs=msgs.filter(m=>m.name.toLowerCase().includes(q)||(m.preview||'').toLowerCase().includes(q));
  }
  // Sort: topped first
  msgs.sort((a,b)=>{if(a.isTop&&!b.isTop)return -1;if(!a.isTop&&b.isTop)return 1;return 0;});
  if(!msgs.length){return `<div style="height:8px;"></div><div style="text-align:center;padding:48px 0;color:var(--text-muted);font-size:14px;">无聊天记录</div>`;}
  const items=msgs.map(m=>{
    const avContent=m.avatar
      ?`<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
      :m.isAi
        ?`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg>`
        :m.type==='group'
          ?`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="8" r="2.5"/><path d="M3 20c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="17" cy="8" r="2.5" opacity=".7"/><path d="M21 20c0-2.8-1.8-4.5-4-5.2" opacity=".7"/></svg>`
          :`<span style="font-size:16px;font-weight:600;color:#fff;">${m.name[0]}</span>`;
    const topBadge=m.isTop?`<svg width="14" height="14" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style="margin-left:4px;vertical-align:middle;flex-shrink:0;pointer-events:none;"><path d="M557.728 688v288.384H466.24V688H227.52c-9.6 0-18.048-3.712-24.96-11.264A37.824 37.824 0 0 1 192 649.984c0-48.768 14.432-92.704 43.584-131.84 29.12-38.976 61.92-58.56 98.56-58.56V200.512c-19.296 0-35.84-7.552-50.048-22.656a76.16 76.16 0 0 1-21.12-53.6c0-20.672 7.04-38.4 21.12-53.6 13.984-14.976 30.72-22.656 50.048-22.656h355.584c19.296 0 35.84 7.552 50.048 22.656 13.984 15.104 21.152 32.928 21.152 53.6 0 20.672-7.04 38.4-21.12 53.6-14.112 15.232-30.784 22.656-50.08 22.656v258.944c36.64 0 69.568 19.584 98.56 58.56A215.424 215.424 0 0 1 832 649.984c0 10.272-3.456 19.328-10.528 26.752-7.04 7.424-15.36 11.264-24.96 11.264H557.76z" fill="#9C9C9C"/></svg>`:'';
    return `<div class="chat-list-item" data-contact-name="${escHtml(m.name)}" data-is-top="${m.isTop?'1':'0'}" data-is-ai="${m.isAi?'1':'0'}" onclick="chatShowMsg('${escHtml(m.name)}')" >
      <div class="chat-list-av" style="overflow:hidden;">${avContent}</div>
      <div class="chat-list-info">
        <div class="chat-list-name" style="display:flex;align-items:center;">${escHtml(m.name)}${topBadge}</div>
        <div class="chat-list-preview">${escHtml(m.preview||'')}</div>
      </div>
      <div class="chat-list-time">${m.time||''}</div>
    </div>`;
  }).join('');
  return `<div style="height:20px;"></div><div class="chat-list-card" id="chat-list-card">${items}</div>`;
}
/* ════════════════════════════════════════════════════════════
   CHAT CONVERSATION VIEW — opens when a chat list item is tapped
   Pure UI — actions are stubbed (toast / console).
   ════════════════════════════════════════════════════════════ */
