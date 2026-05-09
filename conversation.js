const CONV_STATE={
  activeName:null,
  plusOpen:false,
  offline:false,
  quote:null,
  edit:null,
};

function chatShowMsg(name){
  // Look up contact (for avatar / AI flag); fall back to a minimal stub
  let contact=null;
  try{contact=chatGetAllContacts().find(c=>c.name===name)||null;}catch(e){contact=null;}

  CONV_STATE.activeName=name;
  CONV_STATE.plusOpen=false;
  CONV_STATE.offline=false;
  CONV_STATE.quote=null;
  CONV_STATE.edit=null;

  // Inject the conversation overlay into the chat app container
  const container=document.querySelector('.chat-app-container');
  if(!container){showToast('无法打开聊天'); return;}

  // Remove any existing overlay first
  const old=document.getElementById('conv-overlay');
  if(old)old.remove();

  const html=buildConvHTML(name,contact);
  container.insertAdjacentHTML('beforeend',html);
  convAttachMessageActions();
  setTimeout(()=>{convRenderComposerState();convInputChanged();},0);

  // Trigger slide-in
  const ov=document.getElementById('conv-overlay');
  requestAnimationFrame(()=>{ov.classList.add('show');});

  // Scroll messages to bottom
  setTimeout(()=>{
    const body=document.getElementById('conv-body');
    if(body)body.scrollTop=body.scrollHeight;
  },50);
}

function convClose(){
  const ov=document.getElementById('conv-overlay');
  if(!ov)return;
  // If plus panel is open, close it first instead of leaving
  if(CONV_STATE.plusOpen){convTogglePlus(false);return;}
  ov.classList.remove('show');
  setTimeout(()=>{ov.remove();CONV_STATE.activeName=null;CONV_STATE.quote=null;CONV_STATE.edit=null;},340);
}

function buildConvHTML(name,contact){
  const safeName=escHtml(name);
  const avatarUrl=contact&&contact.avatar?contact.avatar:'';
  const initial=name?escHtml(name[0]):'?';
  const isAi=contact&&contact.isAi;
  const myAvatar=XSJ.get(XSJ.AVATAR,'');

  // Sample messages with new time format
  const sampleMsgs=[
    {side:'recv',text:'嗨～在忙吗？',time:'PM 10:14'},
    {side:'sent',text:'刚下班，怎么了？',time:'PM 10:15'},
    {side:'recv',text:'明天有空一起吃饭吗',time:''},
    {side:'recv',text:'新开了一家小馆子，听说不错。',time:'PM 10:16'},
    {side:'sent',text:'好啊，几点？',time:''},
    {side:'sent',text:'地点发我。',time:'PM 10:17'},
    {side:'recv',text:'七点，地址我等下发你定位～',time:'AM 9:02'},
  ];

  const contactAvHTML=avatarUrl
    ? `<img src="${escHtml(avatarUrl)}" alt="">`
    : initial;
  const myAvHTML=myAvatar
    ? `<img src="${escHtml(myAvatar)}" alt="">`
    : '我';

  const msgsHTML=convBuildGroupedMsgs(sampleMsgs,contactAvHTML,myAvHTML);

  // IG-style solid icons
  const iconBack='<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14.7 5.3a1 1 0 010 1.4L9.4 12l5.3 5.3a1 1 0 11-1.4 1.4l-6-6a1 1 0 010-1.4l6-6a1 1 0 011.4 0z"/></svg>';

  // 线下模式: solid filled pin
  const iconOffline='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>';

  // 聊天设置: 3 solid dots
  const iconSettings='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';

  // Status
  const statusHTML=isAi?`<div class="conv-nav-status">online</div>`:'';

  return `
  <div id="conv-overlay" class="conv-overlay" role="dialog" aria-label="${safeName} 聊天">
    <!-- Top nav -->
    <div class="conv-nav">
      <div class="conv-nav-back" onclick="convClose()" aria-label="返回">${iconBack}</div>
      <div class="conv-nav-actions">
        <div class="conv-nav-btn" id="conv-offline-btn" onclick="convToggleOffline()" aria-label="线下模式" title="线下模式">${iconOffline}</div>
        <div class="conv-nav-btn" onclick="convAction('settings')" aria-label="聊天设置" title="聊天设置">${iconSettings}</div>
      </div>
      <div class="conv-nav-center">
        <div class="conv-avatar-pair">
          <div class="conv-av-left">${contactAvHTML}</div>
        </div>
        <div class="conv-nav-name">${safeName}</div>
        ${statusHTML}
      </div>
    </div>

    <!-- Body -->
    <div id="conv-body" class="conv-body">
      <div class="conv-day-divider">Yesterday</div>
      ${msgsHTML}
    </div>

    <!-- Plus backdrop catcher -->
    <div id="conv-plus-backdrop" class="conv-plus-backdrop" onclick="convTogglePlus(false)"></div>

    <!-- Plus panel -->
    <div id="conv-plus-panel" class="conv-plus-panel">
      <div class="conv-plus-handle"></div>
      <div class="conv-plus-grid">
        ${convBuildPlusItems()}
      </div>
    </div>

    <!-- Shortcut icons (IG-style: 5 solid icons) -->
    <div class="conv-shortcut-bar">
      <div class="conv-shortcut-btn" onclick="convAction('voice-msg','语音消息')" title="语音消息">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm6-3a6 6 0 01-12 0H4a8 8 0 007 7.9V21h2v-2.1A8 8 0 0020 11h-2z"/></svg>
      </div>
      <div class="conv-shortcut-btn" onclick="convAction('emoji','表情')" title="表情">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-3.5 7a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm7 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 17a5 5 0 01-4.6-3h9.2a5 5 0 01-4.6 3z"/></svg>
      </div>
      <div class="conv-shortcut-btn" onclick="convAction('photos','照片')" title="照片">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM5 18l4-5 3 3 4-6 4 8H5z"/></svg>
      </div>
      <div class="conv-shortcut-btn" onclick="convAction('transfer','转账')" title="转账">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8a1 1 0 011-1h13.6L16 5.4a1 1 0 011.4-1.4l3.3 3.3a1 1 0 010 1.4L17.4 12a1 1 0 11-1.4-1.4L17.6 9H4a1 1 0 01-1-1zm18 8a1 1 0 01-1 1H6.4l1.6 1.6a1 1 0 11-1.4 1.4l-3.3-3.3a1 1 0 010-1.4L6.6 12a1 1 0 011.4 1.4L6.4 15H20a1 1 0 011 1z"/></svg>
      </div>
      <div class="conv-shortcut-btn" onclick="convAction('red-packet','红包')" title="红包">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4H5a2 2 0 00-2 2v3h18V6a2 2 0 00-2-2zM3 11v8a2 2 0 002 2h14a2 2 0 002-2v-8H3zm9 5a2 2 0 110-4 2 2 0 010 4z"/></svg>
      </div>
    </div>

    <!-- Floating input bar -->
    <div class="conv-input-wrap">
      <div id="conv-compose-state-wrap"></div>
      <div class="conv-input-row">
        <div id="conv-plus-btn" class="conv-input-btn" onclick="convTogglePlus()" aria-label="更多功能">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z"/></svg>
        </div>
        <textarea id="conv-input-field" class="conv-input-field" rows="1" placeholder="say something..." onfocus="if(CONV_STATE.plusOpen)convTogglePlus(false)" oninput="convInputChanged()" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();convSendMessage();}"></textarea>
        <div class="conv-input-btn" onclick="convAction('receive-message')" aria-label="接收信息" title="接收信息">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.4 0 .75.27.86.65l1.4 4.7 4.7 1.4a.9.9 0 010 1.72l-4.7 1.4-1.4 4.7a.9.9 0 01-1.72 0l-1.4-4.7-4.7-1.4a.9.9 0 010-1.72l4.7-1.4 1.4-4.7c.11-.38.46-.65.86-.65zM18.5 14.5c.3 0 .56.2.65.5l.62 2.08 2.08.62a.68.68 0 010 1.3l-2.08.62-.62 2.08a.68.68 0 01-1.3 0l-.62-2.08-2.08-.62a.68.68 0 010-1.3l2.08-.62.62-2.08a.68.68 0 01.65-.5z"/></svg>
        </div>
        <div class="conv-send-btn" onclick="convSendMessage()" aria-label="发送信息" title="发送信息">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4l17.5-7.5a1 1 0 000-1.8L3.4 3.6a1 1 0 00-1.4 1.1L4 11l9 1-9 1-2 6.3a1 1 0 001.4 1.1z"/></svg>
        </div>
      </div>
    </div>
  </div>`;
}

/* Build iMessage-style grouped bubbles */
function convBuildGroupedMsgs(msgs,contactAvHTML,myAvHTML){
  let html='';
  let i=0;
  while(i<msgs.length){
    const side=msgs[i].side;
    // Collect consecutive messages from same side
    const group=[];
    while(i<msgs.length && msgs[i].side===side){
      group.push(msgs[i]);
      i++;
    }
    const sent=side==='sent';
    const avHTML=sent?myAvHTML:contactAvHTML;
    const lastTime=group[group.length-1].time||'';
    
    html+=`<div class="conv-group ${sent?'sent':''}">`;
    html+=`<div class="conv-group-av">${avHTML}</div>`;
    html+=`<div class="conv-group-bubbles">`;
    group.forEach((m,idx)=>{
      let posClass;
      if(group.length===1) posClass=sent?'sent-single':'recv-single';
      else if(idx===0) posClass=sent?'sent-first':'recv-first';
      else if(idx===group.length-1) posClass=sent?'sent-last':'recv-last';
      else posClass=sent?'sent-mid':'recv-mid';
      html+=`<div class="conv-bubble ${posClass}" data-msg-text="${escHtml(m.text)}" data-msg-side="${sent?'sent':'recv'}"><div class="conv-bubble-main">${escHtml(m.text)}</div></div>`;
    });
    if(lastTime) html+=`<div class="conv-group-time">${escHtml(lastTime)}</div>`;
    html+=`</div></div>`;
  }
  return html;
}

function convBuildMsgHTML(m,avContent){
  const sent=m.side==='sent';
  const av=sent
    ? `<div class="conv-group-av" style="background:#2C2C2E;color:#fff;">我</div>`
    : `<div class="conv-group-av">${avContent}</div>`;
  return `
    <div class="conv-group ${sent?'sent':''}">
      ${av}
      <div class="conv-group-bubbles">
        <div class="conv-bubble ${sent?'sent-single':'recv-single'}" data-msg-text="${escHtml(m.text)}" data-msg-side="${sent?'sent':'recv'}"><div class="conv-bubble-main">${escHtml(m.text)}</div></div>
        ${m.time?`<div class="conv-group-time">${escHtml(m.time)}</div>`:''}
      </div>
    </div>`;
}

/* Plus-panel items (shortcuts moved to bar above input) */
function convBuildPlusItems(){
  const items=[
    {key:'voice-call', label:'语音通话', svg:'<path d="M20.5 16.9l-3.4-1.5a1.5 1.5 0 00-1.7.4l-1.1 1.3a11 11 0 01-5.4-5.4l1.3-1.1a1.5 1.5 0 00.4-1.7L9.1 5.5a1.5 1.5 0 00-1.7-.9l-3 .7A1.5 1.5 0 003.2 7c.9 8.3 7.5 14.9 15.8 15.8a1.5 1.5 0 001.7-1.2l.7-3a1.5 1.5 0 00-.9-1.7z"/>'},
    {key:'video-call', label:'视频通话', svg:'<path d="M17 10.5V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2v-3.5l5 4v-11l-5 4z"/>'},
    {key:'listen-together', label:'一起听歌', svg:'<path d="M9 17V5l12-2v12.5a3.5 3.5 0 11-2-3.16V5.7L11 7.3V19a3 3 0 11-2-2.83z"/>'},
    {key:'couple-space', label:'情侣空间', svg:'<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0116.5 3 5.5 5.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>'},
    {key:'camera', label:'拍照', svg:'<path d="M20 5h-3.2L15 3H9L7.2 5H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-8 12a5 5 0 110-10 5 5 0 010 10z"/><circle cx="12" cy="12" r="3"/>'},
    {key:'location', label:'位置', svg:'<path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>'},
    {key:'shopping', label:'购物', svg:'<path d="M19 7h-3V6a4 4 0 00-8 0v1H5a1 1 0 00-1 1v11a2 2 0 002 2h12a2 2 0 002-2V8a1 1 0 00-1-1zM10 6a2 2 0 014 0v1h-4V6zm6 5a4 4 0 01-8 0V9h2v2a2 2 0 004 0V9h2v2z"/>'},
    {key:'read-together', label:'一起阅读', svg:'<path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-2 0-4.15.4-5.5 1.5-1.35-1.1-3.5-1.5-5.5-1.5S2.45 4.9 1.1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c2 0 4.15.4 5.5 1.5 1.25-.8 3.5-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>'},
  ];
  return items.map(it=>`
    <div class="conv-plus-item" onclick="convAction('${it.key}','${escHtml(it.label)}')">
      <div class="conv-plus-icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">${it.svg}</svg>
      </div>
      <div class="conv-plus-label">${escHtml(it.label)}</div>
    </div>`).join('');
}

function convTogglePlus(force){
  const panel=document.getElementById('conv-plus-panel');
  const backdrop=document.getElementById('conv-plus-backdrop');
  const btn=document.getElementById('conv-plus-btn');
  if(!panel||!backdrop||!btn)return;
  const next=(typeof force==='boolean')?force:!CONV_STATE.plusOpen;
  CONV_STATE.plusOpen=next;
  panel.classList.toggle('show',next);
  backdrop.classList.toggle('show',next);
  btn.classList.toggle('plus-active',next);
  // Blur input when opening panel
  if(next){
    const inp=document.getElementById('conv-input-field');
    if(inp)inp.blur();
  }
}

function convToggleOffline(){
  CONV_STATE.offline=!CONV_STATE.offline;
  const btn=document.getElementById('conv-offline-btn');
  if(btn)btn.classList.toggle('offline-on',CONV_STATE.offline);
  showToast(CONV_STATE.offline?'已进入线下模式':'已退出线下模式');
}

function convSendMessage(){
  const inp=document.getElementById('conv-input-field');
  if(!inp)return;
  const text=(inp.value||'').trim();
  if(!text){showToast(CONV_STATE.edit?'请输入修改内容':'请输入消息内容'); return;}

  // Save an edited message instead of sending a new one
  if(CONV_STATE.edit&&CONV_STATE.edit.bubble&&CONV_STATE.edit.bubble.isConnected){
    convSetBubbleContent(CONV_STATE.edit.bubble,text,true);
    CONV_STATE.edit=null;
    CONV_STATE.quote=null;
    inp.value='';
    convRenderComposerState();
    convInputChanged();
    showToast('已保存修改');
    return;
  }

  const body=document.getElementById('conv-body');
  if(body){
    const now=new Date();
    const hh=now.getHours();
    const mm=String(now.getMinutes()).padStart(2,'0');
    const ampm=hh>=12?'PM':'AM';
    const h12=hh%12||12;
    const timeStr=`${ampm} ${h12}:${mm}`;
    const myAvatar=XSJ.get(XSJ.AVATAR,'');
    const myAvHTML=myAvatar?`<img src="${escHtml(myAvatar)}" alt="">`:'我';
    const quote=CONV_STATE.quote?{...CONV_STATE.quote}:null;

    // Check if previous group is also 'sent' — append to it
    const groups=[].slice.call(body.querySelectorAll('.conv-group.sent'));
    const lastGroup=groups.length?groups[groups.length-1]:null;
    if(lastGroup&&lastGroup.nextElementSibling===null){
      const bubbles=lastGroup.querySelector('.conv-group-bubbles');
      if(bubbles){
        // Update previous last bubble's radius to mid
        const prevBubbles=bubbles.querySelectorAll('.conv-bubble');
        prevBubbles.forEach(b=>{
          if(b.classList.contains('sent-single')){b.classList.remove('sent-single');b.classList.add('sent-first');}
          if(b.classList.contains('sent-last')){b.classList.remove('sent-last');b.classList.add('sent-mid');}
        });
        // Remove old time
        const oldTime=bubbles.querySelector('.conv-group-time');
        if(oldTime)oldTime.remove();
        // Add new bubble
        const newBubble=document.createElement('div');
        newBubble.className='conv-bubble sent-last';
        newBubble.dataset.msgText=text;
        newBubble.dataset.msgSide='sent';
        if(quote){
          newBubble.dataset.quoteText=quote.text||'';
          newBubble.dataset.quoteAuthor=quote.author||'';
        }
        newBubble.innerHTML=convBuildBubbleContent(text,quote,false);
        bubbles.appendChild(newBubble);
        // Add time
        const timeEl=document.createElement('div');
        timeEl.className='conv-group-time';
        timeEl.textContent=`${timeStr}`;
        bubbles.appendChild(timeEl);
        body.scrollTop=body.scrollHeight;
        inp.value='';
        CONV_STATE.quote=null;
        convRenderComposerState();
        convInputChanged();
        if(CONV_STATE.plusOpen)convTogglePlus(false);
        return;
      }
    }
    // Otherwise create new group
    const wrap=document.createElement('div');
    const quoteAttrs=quote?` data-quote-text="${escHtml(quote.text||'')}" data-quote-author="${escHtml(quote.author||'')}"`:'';
    wrap.innerHTML=`<div class="conv-group sent">
      <div class="conv-group-av" style="background:#2C2C2E;color:#fff;">${myAvHTML}</div>
      <div class="conv-group-bubbles">
        <div class="conv-bubble sent-single" data-msg-text="${escHtml(text)}" data-msg-side="sent"${quoteAttrs}>${convBuildBubbleContent(text,quote,false)}</div>
        <div class="conv-group-time">${timeStr}</div>
      </div>
    </div>`;
    while(wrap.firstChild)body.appendChild(wrap.firstChild);
    body.scrollTop=body.scrollHeight;
  }
  inp.value='';
  CONV_STATE.quote=null;
  convRenderComposerState();
  convInputChanged();
  if(CONV_STATE.plusOpen)convTogglePlus(false);
}

/* Step 1: long-press menu for conversation messages */
let _convMsgPressTimer=null;
let _convMsgPressStart=null;

function convAttachMessageActions(){
  const body=document.getElementById('conv-body');
  if(!body||body._convMsgActionsBound)return;
  body._convMsgActionsBound=true;

  body.addEventListener('pointerdown',function(e){
    const bubble=e.target.closest&&e.target.closest('.conv-bubble');
    if(!bubble||!body.contains(bubble))return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    _convMsgPressStart={x:e.clientX,y:e.clientY,bubble};
    clearTimeout(_convMsgPressTimer);
    _convMsgPressTimer=setTimeout(function(){
      if(_convMsgPressStart&&_convMsgPressStart.bubble===bubble){
        convShowMessageMenu(bubble);
      }
    },520);
  });

  body.addEventListener('pointermove',function(e){
    if(!_convMsgPressStart)return;
    const dx=Math.abs(e.clientX-_convMsgPressStart.x);
    const dy=Math.abs(e.clientY-_convMsgPressStart.y);
    if(dx>8||dy>8)convClearMessagePress();
  },{passive:true});

  ['pointerup','pointercancel','pointerleave'].forEach(function(type){
    body.addEventListener(type,convClearMessagePress,{passive:true});
  });

  body.addEventListener('contextmenu',function(e){
    const bubble=e.target.closest&&e.target.closest('.conv-bubble');
    if(!bubble||!body.contains(bubble))return;
    e.preventDefault();
    convShowMessageMenu(bubble);
  });
}

function convClearMessagePress(){
  clearTimeout(_convMsgPressTimer);
  _convMsgPressTimer=null;
  _convMsgPressStart=null;
}

function convCloseMessageMenu(){
  document.querySelectorAll('.conv-msg-menu,.conv-msg-menu-backdrop').forEach(function(el){el.remove();});
  document.querySelectorAll('.conv-bubble-active').forEach(function(el){el.classList.remove('conv-bubble-active');});
}

function convShowMessageMenu(bubble){
  if(!bubble||!bubble.isConnected)return;
  convClearMessagePress();
  convCloseMessageMenu();
  if(CONV_STATE.plusOpen)convTogglePlus(false);

  const group=bubble.closest('.conv-group');
  const sent=!!(group&&group.classList.contains('sent'));
  bubble.classList.add('conv-bubble-active');

  const backdrop=document.createElement('div');
  backdrop.className='conv-msg-menu-backdrop';
  backdrop.addEventListener('click',convCloseMessageMenu);
  document.body.appendChild(backdrop);

  const menu=document.createElement('div');
  menu.className='conv-msg-menu';
  const items=[
    {key:'quote',label:'引用'},
    {key:'copy',label:'复制'},
    {key:'edit',label:'修改'},
    {key:'delete',label:'删除',danger:true},
    {key:'multi',label:'多选'}
  ];

  items.forEach(function(item){
    const btn=document.createElement('div');
    btn.className='conv-msg-menu-btn'+(item.danger?' danger':'');
    btn.setAttribute('title',item.label);
    btn.setAttribute('aria-label',item.label);
    btn.innerHTML=convMenuIcon(item.key)+'<span>'+escHtml(item.label)+'</span>';
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      const target=bubble;
      convCloseMessageMenu();
      convHandleMessageAction(item.key,target,item.label);
    });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);

  requestAnimationFrame(function(){
    const r=bubble.getBoundingClientRect();
    const mW=menu.offsetWidth||260;
    const mH=menu.offsetHeight||48;
    const viewportW=window.innerWidth;
    const viewportH=window.innerHeight;
    let left=sent?(r.right-mW):(r.left);
    left=Math.max(8,Math.min(left,viewportW-mW-8));
    let top=r.top-mH-9;
    if(top<8)top=Math.min(r.bottom+9,viewportH-mH-8);
    menu.style.left=left+'px';
    menu.style.top=top+'px';
    requestAnimationFrame(function(){menu.classList.add('visible');});
  });
}

function convMenuIcon(key){
  const icons={
    quote:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10 7L5 12l5 5"/><path d="M5.5 12H15a5 5 0 015 5v1"/></svg>',
    copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    delete:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6M14 11v6"/></svg>',
    multi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><path d="M15 17l2 2 4-5"/></svg>',
    forward:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l7 7-7 7"/><path d="M21 12H8a5 5 0 00-5 5v2"/></svg>'
  };
  return icons[key]||'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8"/></svg>';
}

function convHandleMessageAction(key,bubble,label){
  if(!bubble||!bubble.isConnected)return;
  const text=convGetBubbleMainText(bubble);
  if(key==='copy'){
    convCopyMessageText(text);
    return;
  }
  if(key==='delete'){
    convDeleteMessageBubble(bubble);
    showToast('已删除');
    return;
  }
  if(key==='quote'){
    convStartQuote(bubble);
    return;
  }
  if(key==='edit'){
    convStartEdit(bubble);
    return;
  }
  const nextMap={multi:'多选消息',forward:'转发消息'};
  showToast((nextMap[key]||label||'消息操作')+' · 下一步接入');
}

function convGetBubbleMainText(bubble){
  if(!bubble)return'';
  if(bubble.dataset&&bubble.dataset.msgText)return bubble.dataset.msgText;
  const clone=bubble.cloneNode(true);
  clone.querySelectorAll('.conv-quote-in-bubble,.conv-edited-mark').forEach(function(el){el.remove();});
  return (clone.innerText||clone.textContent||'').trim();
}

function convShortText(text,max){
  text=String(text||'').replace(/\s+/g,' ').trim();
  max=max||28;
  return text.length>max?text.slice(0,max)+'…':text;
}

function convStartQuote(bubble){
  const group=bubble.closest('.conv-group');
  const sent=!!(group&&group.classList.contains('sent'));
  CONV_STATE.edit=null;
  CONV_STATE.quote={
    text:convGetBubbleMainText(bubble),
    author:sent?'我':(CONV_STATE.activeName||'对方'),
    side:sent?'sent':'recv'
  };
  convRenderComposerState();
  const inp=document.getElementById('conv-input-field');
  if(inp){inp.focus();convInputChanged();}
}

function convStartEdit(bubble){
  const group=bubble.closest('.conv-group');
  const text=convGetBubbleMainText(bubble);
  CONV_STATE.quote=null;
  CONV_STATE.edit={bubble:bubble,original:text};
  const inp=document.getElementById('conv-input-field');
  if(inp){inp.value=text;inp.focus();}
  convRenderComposerState();
  convInputChanged();
}

function convCancelComposerState(){
  const inp=document.getElementById('conv-input-field');
  if(CONV_STATE.edit&&inp)inp.value='';
  CONV_STATE.quote=null;
  CONV_STATE.edit=null;
  convRenderComposerState();
  convInputChanged();
}

function convRenderComposerState(){
  const wrap=document.getElementById('conv-compose-state-wrap');
  if(!wrap)return;
  if(CONV_STATE.edit){
    wrap.innerHTML=`<div class="conv-compose-state edit">
      <div class="conv-compose-line"></div>
      <div class="conv-compose-copy">
        <div class="conv-compose-title">正在修改消息</div>
        <div class="conv-compose-preview">${escHtml(convShortText(CONV_STATE.edit.original,36))}</div>
      </div>
      <div class="conv-compose-close" onclick="convCancelComposerState()" aria-label="取消修改">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </div>
    </div>`;
  }else if(CONV_STATE.quote){
    wrap.innerHTML=`<div class="conv-compose-state quote">
      <div class="conv-compose-line"></div>
      <div class="conv-compose-copy">
        <div class="conv-compose-title">回复 ${escHtml(CONV_STATE.quote.author||'对方')}</div>
        <div class="conv-compose-preview">${escHtml(convShortText(CONV_STATE.quote.text,38))}</div>
      </div>
      <div class="conv-compose-close" onclick="convCancelComposerState()" aria-label="取消引用">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </div>
    </div>`;
  }else{
    wrap.innerHTML='';
  }
  convUpdateSendButton();
  convUpdateBodyPadding();
}

function convInputChanged(){
  convAutosizeInput();
  convUpdateSendButton();
  convUpdateBodyPadding();
}

function convAutosizeInput(){
  const inp=document.getElementById('conv-input-field');
  if(!inp)return;
  inp.style.height='30px';
  const max=94;
  const next=Math.min(max,Math.max(30,inp.scrollHeight));
  inp.style.height=next+'px';
  inp.style.overflowY=inp.scrollHeight>max?'auto':'hidden';
}

function convUpdateSendButton(){
  const btn=document.querySelector('.conv-send-btn');
  const inp=document.getElementById('conv-input-field');
  if(!btn||!inp)return;
  const hasText=!!(inp.value||'').trim();
  btn.classList.toggle('ready',hasText);
  btn.classList.toggle('save-mode',!!CONV_STATE.edit);
  btn.setAttribute('title',CONV_STATE.edit?'保存修改':'发送信息');
  btn.setAttribute('aria-label',CONV_STATE.edit?'保存修改':'发送信息');
  btn.innerHTML=CONV_STATE.edit
    ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l3 9-3 9 19-9z"/><path d="M6 12h13"/></svg>';
}

function convUpdateBodyPadding(){
  const body=document.getElementById('conv-body');
  const input=document.querySelector('.conv-input-wrap');
  if(!body||!input)return;
  const extra=Math.max(114,input.offsetHeight+74);
  body.style.setProperty('padding-bottom',extra+'px','important');
  body.scrollTop=body.scrollHeight;
}

function convBuildBubbleContent(text,quote,edited){
  let html='';
  if(quote&&quote.text){
    html+=`<div class="conv-quote-in-bubble"><div class="conv-quote-author">回复 ${escHtml(quote.author||'对方')}</div><div class="conv-quote-text">${escHtml(convShortText(quote.text,42))}</div></div>`;
  }
  html+=`<div class="conv-bubble-main">${escHtml(text).replace(/\n/g,'<br>')}</div>`;
  if(edited)html+='<span class="conv-edited-mark">已编辑</span>';
  return html;
}

function convSetBubbleContent(bubble,text,edited){
  const quoteText=bubble.dataset?bubble.dataset.quoteText:'';
  const quoteAuthor=bubble.dataset?bubble.dataset.quoteAuthor:'';
  const quote=quoteText?{text:quoteText,author:quoteAuthor}:null;
  bubble.dataset.msgText=text;
  bubble.innerHTML=convBuildBubbleContent(text,quote,edited);
}

function convCopyMessageText(text){
  if(!text){showToast('没有可复制内容');return;}
  function fallback(){
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.style.position='fixed';
    ta.style.left='-9999px';
    document.body.appendChild(ta);
    ta.select();
    try{document.execCommand('copy');showToast('已复制');}
    catch(e){showToast('复制失败');}
    ta.remove();
  }
  if(navigator.clipboard&&window.isSecureContext){
    navigator.clipboard.writeText(text).then(function(){showToast('已复制');}).catch(fallback);
  }else{
    fallback();
  }
}

function convDeleteMessageBubble(bubble){
  if(CONV_STATE.edit&&CONV_STATE.edit.bubble===bubble){CONV_STATE.edit=null;convRenderComposerState();}
  const group=bubble.closest('.conv-group');
  const bubblesWrap=bubble.closest('.conv-group-bubbles');
  bubble.remove();
  if(!group||!bubblesWrap)return;
  const bubbles=[].slice.call(bubblesWrap.querySelectorAll('.conv-bubble'));
  if(bubbles.length===0){group.remove();return;}
  convNormalizeBubbleCorners(group);
}

function convNormalizeBubbleCorners(group){
  if(!group)return;
  const sent=group.classList.contains('sent');
  const bubbles=[].slice.call(group.querySelectorAll('.conv-bubble'));
  const removeClasses=['recv-single','recv-first','recv-mid','recv-last','sent-single','sent-first','sent-mid','sent-last'];
  bubbles.forEach(function(b,idx){
    removeClasses.forEach(function(c){b.classList.remove(c);});
    let suffix='single';
    if(bubbles.length>1){
      if(idx===0)suffix='first';
      else if(idx===bubbles.length-1)suffix='last';
      else suffix='mid';
    }
    b.classList.add((sent?'sent':'recv')+'-'+suffix);
  });
}

function convAction(key,label){
  // Generic stub for plus-panel + nav action buttons. UI only.
  const map={
    'voice-memo':'心声记录',
    'settings':'聊天设置',
    'receive-message':'接收信息',
  };
  const friendly=label||map[key]||key;
  console.log('[conv-action]',key,friendly);
  showToast(`${friendly} · 已打开预览`);
  // Auto-close plus panel after picking an item
  if(CONV_STATE.plusOpen)setTimeout(()=>convTogglePlus(false),120);
}

/* ── Long-press bubble menu ── */
let _longPressTimer=null;
function chatAttachLongPress(){
  document.querySelectorAll('#chat-list-card .chat-list-item').forEach(el=>{
    if(el._lpBound) return;   // ← 防止重复绑定
    el._lpBound = true;
    el.addEventListener('touchstart',function(e){
      const name=el.dataset.contactName;
      _longPressTimer=setTimeout(()=>{chatLongPressMenu(name,el);},500);
    },{passive:true});
    el.addEventListener('touchend',()=>clearTimeout(_longPressTimer),{passive:true});
    el.addEventListener('touchmove',()=>clearTimeout(_longPressTimer),{passive:true});
  });
}
function chatAttachContactsLongPress(){
  document.querySelectorAll('.contacts-item-new[data-contact-name]').forEach(el=>{
    if(el._lpBound) return;   // ← 防止重复绑定
    el._lpBound = true;
    el.addEventListener('touchstart',function(e){
      const name=el.dataset.contactName;
      _longPressTimer=setTimeout(()=>{chatLongPressMenu(name,el);},500);
    },{passive:true});
    el.addEventListener('touchend',()=>clearTimeout(_longPressTimer),{passive:true});
    el.addEventListener('touchmove',()=>clearTimeout(_longPressTimer),{passive:true});
  });
}
function chatLongPressMenu(nameOrEvt,nameOrEl,elArg){
  // Support old (e, name, el) and new (name, el) call signatures
  let name, el;
  if(typeof nameOrEvt==='string'){name=nameOrEvt;el=nameOrEl;}
  else{name=nameOrEl;el=elArg;}
  document.querySelectorAll('.chat-bubble-menu').forEach(m=>m.remove());
  document.querySelectorAll('.chat-bubble-overlay').forEach(m=>m.remove());
  const isTop=(el&&el.dataset&&el.dataset.isTop)==='1';

  // Overlay backdrop
  const overlay=document.createElement('div');
  overlay.className='chat-bubble-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:8999;background:rgba(0,0,0,0.25);';

  const isDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;
  const menuBg=isDark?'rgba(40,40,42,0.9)':'rgba(255,255,255,0.9)';
  const menuBorder=isDark?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.6)';
  const textColor=isDark?'#f5f5f7':'#1c1c1e';
  const sepColor=isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.1)';

  const menu=document.createElement('div');
  menu.className='chat-bubble-menu';
  menu.style.cssText=`
    position:fixed;z-index:9000;
    top:0;left:0;
    display:flex;flex-direction:row;align-items:center;gap:4px;
    background:${isDark?'rgba(0,0,0,0.4)':'rgba(255,255,255,0.3)'};
    backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
    border:1px solid ${menuBorder};
    border-radius:24px;
    padding:6px 12px;
    box-shadow:0 4px 24px rgba(0,0,0,0.18);
    min-width:0;
    opacity:0;
    transition:opacity 0.25s ease-out,transform 0.25s ease-out;
    transform:translateY(-6px);
    pointer-events:none;
  `;
  // Position after append so we know menu dimensions
  document.body.appendChild(menu);

  const menuItems=[
    {label:isTop?'取消置顶':'置顶',icon:'<svg width="16" height="16" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M557.728 688v288.384H466.24V688H227.52c-9.6 0-18.048-3.712-24.96-11.264A37.824 37.824 0 0 1 192 649.984c0-48.768 14.432-92.704 43.584-131.84 29.12-38.976 61.92-58.56 98.56-58.56V200.512c-19.296 0-35.84-7.552-50.048-22.656a76.16 76.16 0 0 1-21.12-53.6c0-20.672 7.04-38.4 21.12-53.6 13.984-14.976 30.72-22.656 50.048-22.656h355.584c19.296 0 35.84 7.552 50.048 22.656 13.984 15.104 21.152 32.928 21.152 53.6 0 20.672-7.04 38.4-21.12 53.6-14.112 15.232-30.784 22.656-50.08 22.656v258.944c36.64 0 69.568 19.584 98.56 58.56A215.424 215.424 0 0 1 832 649.984c0 10.272-3.456 19.328-10.528 26.752-7.04 7.424-15.36 11.264-24.96 11.264H557.76z" fill="currentColor"/></svg>',action:()=>chatToggleTop(name)},
    {label:'删除',icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>',action:()=>contactsDeleteItemByName(name),danger:true}
  ];

  menuItems.forEach((item,i)=>{
    if(i>0){
      const sep=document.createElement('div');
      sep.style.cssText=`width:1px;height:32px;background:${sepColor};flex-shrink:0;`;
      menu.appendChild(sep);
    }
    const btn=document.createElement('div');
    btn.style.cssText=`display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 14px;cursor:pointer;color:${item.danger?'#ff3b30':textColor};-webkit-tap-highlight-color:transparent;min-width:60px;`;
    btn.innerHTML=`<span style="color:${item.danger?'#ff3b30':(isDark?'#aaa':'#555')};display:flex;align-items:center;">${item.icon}</span><span style="font-size:12px;font-weight:500;white-space:nowrap;">${item.label}</span>`;
    btn.addEventListener('click',()=>{overlay.remove();menu.remove();item.action();});
    menu.appendChild(btn);
  });

  overlay.addEventListener('click',()=>{overlay.remove();menu.remove();});
  document.body.appendChild(overlay);
  // Position menu relative to target element
  requestAnimationFrame(()=>{
    const mW=menu.offsetWidth||160;
    const mH=menu.offsetHeight||48;
    let top,left;
    if(el&&el.getBoundingClientRect){
      const r=el.getBoundingClientRect();
      left=r.left+r.width/2-mW/2;
      top=r.top-mH-8;
      if(top<8)top=r.bottom+8;
      left=Math.max(8,Math.min(left,window.innerWidth-mW-8));
    } else {
      top=window.innerHeight/2-mH/2;
      left=window.innerWidth/2-mW/2;
    }
    menu.style.top=top+'px';
    menu.style.left=left+'px';
    menu.style.pointerEvents='auto';
    requestAnimationFrame(()=>{
      menu.style.opacity='1';
      menu.style.transform='translateY(0)';
    });
  });
}
function chatToggleTop(name){
  const data=chatGetData();
  data.contacts.groups.forEach(g=>g.contacts.forEach(c=>{if(c.name===name)c.isTop=!c.isTop;}));
  chatSaveData(data);
  if(CHAT_STATE.currentTab==='chats'){
    const body=document.getElementById('chat-app-body');if(!body)return;
    const page=document.createElement('div');page.className='chat-page';
    page.innerHTML=chatBuildChats();body.innerHTML='';body.appendChild(page);
    setTimeout(chatAttachLongPress,50);
  } else {_contactsRefresh();}
}
function contactsDeleteItemByName(name){
  showModal({
    title:'删除联系人',subtitle:'Delete Contact',
    contentHtml:`<div class="xsj-confirm-text">确认删除联系人<br><strong>「${escHtml(name)}」</strong> 吗？<br><span style="font-size:13px;color:var(--text-tertiary);">此操作无法撤销</span></div>`,
    onConfirm(){
      const data=chatGetData();
      data.contacts.groups.forEach(g=>{g.contacts=g.contacts.filter(c=>c.name!==name);});
      chatSaveData(data);
      if(CHAT_STATE.currentTab==='chats'){
        const body=document.getElementById('chat-app-body');if(!body)return;
        const page=document.createElement('div');page.className='chat-page';
        page.innerHTML=chatBuildChats();body.innerHTML='';body.appendChild(page);
        setTimeout(chatAttachLongPress,50);
      } else {_contactsRefresh();}
    }
  });
}

/* ── Subtab switch ── */
function chatSubSwitch(sub){
  CHAT_STATE.chatSubTab=sub;
  ['chats','group','friends'].forEach(s=>{
    const el=document.getElementById('csub-'+s);
    if(el)el.classList.toggle('active',s===sub);
  });
  const body=document.getElementById('chat-app-body');
  if(!body)return;
  const page=document.createElement('div');page.className='chat-page';
  page.innerHTML=chatBuildChats();
  body.innerHTML='';body.appendChild(page);body.scrollTop=0;
  setTimeout(chatAttachLongPress,50);
}

/* ── Add new chat entry (+Add button) ── */
function chatAddChatEntry(){
  showModal({
    title:'新建对话',subtitle:'New Chat',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">联系人 / 群组名称</div><input class="xsj-input" data-field="name" placeholder="请输入名称..." autocomplete="off"></div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">类型</div><select class="xsj-select" data-field="type"><option value="friend">好友</option><option value="group">群聊</option></select></div>`,
    onConfirm(d){
      if(!d.name||!d.name.trim())return;
      const now=new Date();
      const timeStr=now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
      CHAT_MESSAGES.unshift({name:d.name.trim(),preview:'新对话',time:timeStr,type:d.type||'friend'});
      try{
        const saved=JSON.parse(localStorage.getItem('xsj_extra_msgs')||'[]');
        saved.unshift({name:d.name.trim(),preview:'新对话',time:timeStr,type:d.type||'friend'});
        localStorage.setItem('xsj_extra_msgs',JSON.stringify(saved));
      }catch(e){}
      const body=document.getElementById('chat-app-body');
      if(body){const page=document.createElement('div');page.className='chat-page';page.innerHTML=chatBuildChats();body.innerHTML='';body.appendChild(page);}
    }
  });
}

/* ── Add new group (+Add button in Chats tab) ── */
function chatAddNewGroup(){
  showModal({
    title:'新建分组',subtitle:'New Group',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">分组名称</div><input class="xsj-input" data-field="gname" placeholder="请输入分组名称" autocomplete="off"></div>`,
    onConfirm(d){
      const name=(d.gname||'').trim();
      if(!name){showToast('分组名称不能为空');return;}
      const data=chatGetData();
      if(data.contacts.groups.find(g=>g.name===name)){showToast('分组名称已存在');return;}
      data.contacts.groups.push({name:name,contacts:[]});
      chatSaveData(data);
      showToast('分组「'+name+'」已创建 ✓');
    }
  });
}

function chatToggleSearch(){
  CHAT_STATE.searchVisible=!CHAT_STATE.searchVisible;
  const bar=document.getElementById('chat-search-bar');
  if(!bar)return;
  bar.style.display=CHAT_STATE.searchVisible?'flex':'none';
  if(CHAT_STATE.searchVisible){
    setTimeout(()=>{const inp=document.getElementById('chat-search-input');if(inp)inp.focus();},50);
  } else {
    chatClearSearch();
  }
}
function chatDoSearch(val){
  CHAT_STATE.searchQuery=val;
  if(CHAT_STATE.currentTab==='chats'){
    const body=document.getElementById('chat-app-body');
    if(!body)return;
    const page=document.createElement('div');page.className='chat-page';
    page.innerHTML=chatBuildChats();
    body.innerHTML='';body.appendChild(page);
  }
}
function chatClearSearch(){
  CHAT_STATE.searchQuery='';CHAT_STATE.searchVisible=false;
  const bar=document.getElementById('chat-search-bar');if(bar)bar.style.display='none';
  const inp=document.getElementById('chat-search-input');if(inp)inp.value='';
  if(CHAT_STATE.currentTab==='chats'){
    const body=document.getElementById('chat-app-body');
    if(!body)return;
    const page=document.createElement('div');page.className='chat-page';
    page.innerHTML=chatBuildChats();
    body.innerHTML='';body.appendChild(page);
  }
}

/* ── Contacts Tab (Redesigned) ── */
function chatBuildContacts(){
  const data=chatGetData();
  const groups=data.contacts.groups;
  const allContacts=groups.reduce((a,g)=>a.concat(g.contacts),[]);
  const dm=CHAT_STATE.contactsDeleteMode;
  const sq=CHAT_STATE.contactsSearch||'';
  const selGroup=CHAT_STATE.contactsGroup||'all';

  // Scrollable avatar row
  let avRowHTML='';
  allContacts.forEach(c=>{
    const init=(c.name||'?')[0];
    const avImg=c.avatar?`<img src="${c.avatar}" style="width:100%;height:100%;object-fit:cover;">`:`<span style="font-size:16px;font-weight:700;color:#fff;">${init}</span>`;
    avRowHTML+=`<div class="contacts-av-item" onclick="chatShowContact('${escHtml(c.name)}')">
      <div class="contacts-av-circle">${avImg}</div>
      <div class="contacts-av-label">${escHtml(c.name)}</div>
    </div>`;
  });

  // Group tabs
  let tabsHTML=`<div class="contacts-group-tab ${selGroup==='all'?'active':''}" onclick="contactsSwitchGroup('all')">全部</div>`;
  groups.forEach(g=>{
    tabsHTML+=`<div class="contacts-group-tab ${selGroup===g.name?'active':''}" onclick="contactsSwitchGroup('${escHtml(g.name)}')">${escHtml(g.name)}</div>`;
  });

  // Filter contacts
  let filtered=selGroup==='all'?allContacts:((groups.find(g=>g.name===selGroup)||{contacts:[]}).contacts);
  if(sq)filtered=filtered.filter(c=>c.name.toLowerCase().includes(sq.toLowerCase()));

  // Contact list
  let listHTML='';
  if(!filtered.length){
    listHTML=`<div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:14px;font-style:italic;">暂无联系人</div>`;
  } else {
    filtered.forEach(c=>{
      const init=(c.name||'?')[0];
      const avImg=c.avatar?`<img src="${c.avatar}" style="width:100%;height:100%;object-fit:cover;">`:`<span style="font-size:16px;font-weight:700;color:#fff;">${init}</span>`;
      const aiTag=c.isAi?`<span style="font-size:10px;background:rgba(0,122,255,0.15);color:#007aff;border-radius:6px;padding:1px 6px;margin-left:6px;">AI</span>`:'';
      const topBadgeC=c.isTop?`<svg width="13" height="13" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style="margin-left:4px;vertical-align:middle;flex-shrink:0;pointer-events:none;"><path d="M557.728 688v288.384H466.24V688H227.52c-9.6 0-18.048-3.712-24.96-11.264A37.824 37.824 0 0 1 192 649.984c0-48.768 14.432-92.704 43.584-131.84 29.12-38.976 61.92-58.56 98.56-58.56V200.512c-19.296 0-35.84-7.552-50.048-22.656a76.16 76.16 0 0 1-21.12-53.6c0-20.672 7.04-38.4 21.12-53.6 13.984-14.976 30.72-22.656 50.048-22.656h355.584c19.296 0 35.84 7.552 50.048 22.656 13.984 15.104 21.152 32.928 21.152 53.6 0 20.672-7.04 38.4-21.12 53.6-14.112 15.232-30.784 22.656-50.08 22.656v258.944c36.64 0 69.568 19.584 98.56 58.56A215.424 215.424 0 0 1 832 649.984c0 10.272-3.456 19.328-10.528 26.752-7.04 7.424-15.36 11.264-24.96 11.264H557.76z" fill="#9C9C9C"/></svg>`:'';
      let rightEl='';
      if(dm){
        rightEl=`<div class="contacts-delete-indicator" onclick="contactsDeleteItem('${escHtml(c.name)}',event)" style="cursor:pointer;padding:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></div>`;
      } else {
        rightEl=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>`;
      }
      const subText=c.persona?`<div class="contacts-item-sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${escHtml(c.persona)}</div>`:'';
      listHTML+=`<div class="contacts-item-new${dm?' delete-mode':''}" data-contact-name="${escHtml(c.name)}" data-is-top="${c.isTop?'1':'0'}" onclick="${dm?'':'chatShowContact(\''+escHtml(c.name)+'\')'}">
        <div class="contacts-item-av">${avImg}</div>
        <div class="contacts-item-info">
          <div class="contacts-item-name" style="display:flex;align-items:center;">${escHtml(c.name)}${topBadgeC}${aiTag}</div>
          ${subText}
        </div>
        ${rightEl}
      </div>`;
    });
  }

  return `<div class="contacts-page-wrap">
    <div class="contacts-serif-title">Contacts</div>
    <div class="contacts-avatar-scroll-outer"><div class="contacts-avatar-scroll">${avRowHTML||'<div style="color:var(--text-muted);font-size:13px;padding:16px 0;">暂无联系人</div>'}</div></div>
    <div class="contacts-action-row">
      <div class="contacts-action-icon-btn" title="添加联系人" onclick="chatAddContact()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14m-7-7h14"/></svg>
      </div>
      <div class="contacts-manage-btn" onclick="contactsManageGroups()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        管理分组
      </div>
      <div class="contacts-action-icon-btn${dm?' delete-active':''}" title="删除模式" onclick="contactsToggleDelete()">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${dm?'#ff3b30':'currentColor'}" stroke-width="1.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </div>
    </div>
    <div class="contacts-search-wrap">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
      <input class="contacts-search-input" id="contacts-search-inp" placeholder="搜索联系人…" value="${sq}" oninput="contactsDoSearch(this.value)" autocomplete="off">
    </div>
    <div class="contacts-group-tabs">${tabsHTML}</div>
    <div class="contacts-list-wrap">${listHTML}</div>
  </div>`;
}

function contactsSwitchGroup(g){
  CHAT_STATE.contactsGroup=g;
  _contactsRefresh();
}
function contactsToggleDelete(){
  CHAT_STATE.contactsDeleteMode=!CHAT_STATE.contactsDeleteMode;
  _contactsRefresh();
}
function contactsDoSearch(val){
  CHAT_STATE.contactsSearch=val;
  _contactsRefresh();
}
function contactsManageGroups(){
  const data=chatGetData();
  // Build a live list with delete buttons inside the modal
  function buildGroupRows(groups){
    return groups.map((g,i)=>`<div class="xsj-group-row" id="xsj-grow-${i}">
      <span class="xsj-group-name">${escHtml(g.name)}</span>
      <div class="xsj-group-del" onclick="_modalDelGroup(${i})" title="删除">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </div>
    </div>`).join('');
  }
  let workingGroups=data.contacts.groups.map(g=>({name:g.name,contacts:g.contacts}));
  // Use a closure-scoped function instead of window._modalDelGroup to avoid global pollution
  function _localDelGroup(idx){
    workingGroups.splice(idx,1);
    const listEl=document.getElementById('xsj-groups-list');
    if(listEl)listEl.innerHTML=buildGroupRows(workingGroups);
  }
  // Expose temporarily so inline onclick in the generated HTML can call it
  window._modalDelGroup=_localDelGroup;
  showModal({
    title:'管理分组',subtitle:'Manage Groups',
    contentHtml:`<div id="xsj-groups-list">${buildGroupRows(workingGroups)}</div>
    <div style="margin-top:8px;font-size:12px;color:var(--text-muted);text-align:center;">如需新增分组，请在 Chats 页面点击「+Add」按钮</div>`,
    onConfirm(){
      const d=chatGetData();
      // Merge: keep contacts from existing groups, new groups get empty contacts
      const merged=workingGroups.map(wg=>{
        const orig=d.contacts.groups.find(g=>g.name===wg.name);
        return {name:wg.name,contacts:orig?orig.contacts:[]};
      });
      d.contacts.groups=merged;
      chatSaveData(d);
      _contactsRefresh();
    }
  });
}
function contactsDeleteItem(name,ev){
  if(ev)ev.stopPropagation();
  showModal({
    title:'删除联系人',subtitle:'Delete Contact',
    contentHtml:`<div class="xsj-confirm-text">确认删除联系人<br><strong>「${escHtml(name)}」</strong> 吗？<br><span style="font-size:13px;color:var(--text-tertiary);">此操作无法撤销</span></div>`,
    onConfirm(){
      const data=chatGetData();
      data.contacts.groups.forEach(g=>{g.contacts=g.contacts.filter(c=>c.name!==name);});
      chatSaveData(data);_contactsRefresh();
    }
  });
}
function _contactsRefresh(){
  const body=document.getElementById('chat-app-body');if(!body)return;
  const page=document.createElement('div');page.className='chat-page';
  page.innerHTML=chatBuildContacts();
  body.innerHTML='';body.appendChild(page);
  setTimeout(chatAttachContactsLongPress,50);
  if(CHAT_STATE.contactsSearch){const inp=document.getElementById('contacts-search-inp');if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}}
}

function chatAddContact(){
  const data=chatGetData();
  // Only non-AI groups
  const eligibleGroups=data.contacts.groups.filter(g=>g.name!=='AI');
  const groupOpts=eligibleGroups.length
    ?eligibleGroups.map((g,i)=>`<option value="${escHtml(g.name)}">${escHtml(g.name)}</option>`).join('')
    :`<option value="">（无分组，请先创建分组）</option>`;
  // Mask options (placeholder for user masks feature)
  const maskOpts=`<option value="">无</option><option value="默认">默认面具</option>`;
  let _newAvatar='';
  let _newWorldBook='';
  const bodyHtml=`
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:16px;">
      <div id="nc-av-preview" onclick="document.getElementById('nc-av-file').click()" style="width:80px;height:80px;border-radius:50%;background:var(--layer-2);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;border:2px dashed rgba(142,142,147,0.4);transition:opacity .2s;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">点击更换头像</div>
      <input type="file" id="nc-av-file" accept="image/*" style="display:none" onchange="(function(inp){const f=inp.files[0];if(!f)return;compressImage(f,200,0.8,function(s){window._newAvatar=s;const p=document.getElementById('nc-av-preview');if(p){p.innerHTML='';const img=document.createElement('img');img.src=s;img.style.cssText='width:100%;height:100%;object-fit:cover;';p.appendChild(img);}});inp.value='';})(this)">
    </div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">姓名 <span style="color:#cc3333">*</span></div><input class="xsj-input" data-field="ncname" placeholder="请输入姓名" autocomplete="off"></div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">性别</div>
      <div style="display:flex;gap:12px;padding:8px 0;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="nc-gender" value="男" data-field="ncgender" style="accent-color:var(--text);"> 男</label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="nc-gender" value="女" data-field="ncgender" checked style="accent-color:var(--text);"> 女</label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="nc-gender" value="其他" data-field="ncgender" style="accent-color:var(--text);"> 其他</label>
      </div>
    </div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">具体人设</div><textarea class="xsj-textarea" data-field="ncpersona" placeholder="描述具体的人物性格、背景等" rows="3" style="resize:none;"></textarea></div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">关联的user面具</div><select class="xsj-select" data-field="ncmask">${maskOpts}</select></div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">关联的世界书</div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span id="nc-wb-label" style="font-size:13px;color:var(--text-tertiary);flex:1;">未选择</span>
        <div class="xsj-upload-btn" onclick="chatSelectWorldBook()" style="white-space:nowrap;">选择世界书</div>
      </div>
    </div>
    <div class="xsj-field-wrap"><div class="xsj-field-label" style="display:flex;align-items:center;justify-content:space-between;">接入 MiniMax 语音 <div id="nc-voice-toggle" class="app-toggle" onclick="this.classList.toggle('on')"></div></div></div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">分组</div><select class="xsj-select" data-field="ncgroup">${groupOpts}</select></div>
  `;
  window._newAvatar='';
  window._newWorldBook='';
  showModal({
    title:'新建联系人',subtitle:'Add Contact',
    contentHtml:bodyHtml,
    onConfirm(d){
      if(!d.ncname||!d.ncname.trim()){showToast('请输入联系人姓名');return;}
      const data2=chatGetData();
      // Find gender from radio button
      const genderRadio=document.querySelector('input[name="nc-gender"]:checked');
      const gender=genderRadio?genderRadio.value:'其他';
      const voiceEl=document.getElementById('nc-voice-toggle');
      const voiceEnabled=voiceEl?voiceEl.classList.contains('on'):false;
      const wbLabel=document.getElementById('nc-wb-label');
      const worldBook=wbLabel&&wbLabel.textContent!=='未选择'?wbLabel.textContent:'';
      const newContact={
        id:chatGenId(),
        name:d.ncname.trim(),
        avatar:window._newAvatar||'',
        gender:gender,
        persona:(d.ncpersona||'').trim(),
        mask:d.ncmask||'',
        worldBook:worldBook,
        voiceEnabled:voiceEnabled,
        isAi:false,
        isTop:false,
        addedTime:Date.now()
      };
      // Find group
      const targetGroupName=d.ncgroup||(eligibleGroups[0]?eligibleGroups[0].name:'');
      let targetGroup=data2.contacts.groups.find(g=>g.name===targetGroupName);
      if(!targetGroup){targetGroup={name:targetGroupName||'好友',contacts:[]};data2.contacts.groups.push(targetGroup);}
      targetGroup.contacts.push(newContact);
      chatSaveData(data2);
      CHAT_STATE.contactsGroup=targetGroup.name;
      _contactsRefresh();
      showToast('联系人「'+newContact.name+'」已添加 ✓');
    }
  });
}

function chatSelectWorldBook(){
  // World book selection sub-modal
  const books=[
    {name:'幻想世界观'},
    {name:'现代都市设定'},
    {name:'科幻背景'},
  ];
  const opts=books.map((b,i)=>`<div class="xsj-field-wrap" style="margin-bottom:4px;"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;"><input type="radio" name="wb-sel" value="${escHtml(b.name)}" ${i===0?'checked':''} style="accent-color:var(--text);"> ${escHtml(b.name)}</label></div>`).join('');
  showModal({
    title:'选择世界书',subtitle:'Select World Book',
    contentHtml:`${opts}<div class="xsj-field-wrap"><div class="xsj-field-label" style="color:var(--text-muted);">暂无更多世界书，可在设置中创建</div></div>`,
    onConfirm(){
      const sel=document.querySelector('input[name="wb-sel"]:checked');
      if(sel){
        const lbl=document.getElementById('nc-wb-label');
        if(lbl)lbl.textContent=sel.value;
        window._newWorldBook=sel.value;
      }
    }
  });
}

function chatShowContact(name){
  const c=chatGetAllContacts().find(x=>x.name===name);
  if(!c){showToast('联系人不存在');return;}
  const avContent=c.avatar
    ?`<img src="${c.avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`
    :`<div style="width:80px;height:80px;border-radius:50%;background:var(--layer-2);display:flex;align-items:center;justify-content:center;"><span style="font-size:28px;font-weight:700;color:#fff;">${(c.name||'?')[0]}</span></div>`;
  const aiTag=c.isAi?`<div style="display:inline-block;background:rgba(0,122,255,0.12);color:#007aff;border-radius:8px;padding:2px 10px;font-size:11px;margin-top:4px;">AI助手</div>`:'';
  const editIcon=`<div onclick="chatEditContact('${escHtml(c.name)}')" style="position:absolute;bottom:0;right:0;width:24px;height:24px;border-radius:50%;background:#007aff;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid var(--bg);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>`;
  const rows=[
    c.gender?`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);"><span style="font-size:13px;color:var(--text-tertiary);">性别</span><span style="font-size:13px;">${escHtml(c.gender)}</span></div>`:'',
    c.persona?`<div style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);"><div style="font-size:13px;color:var(--text-tertiary);margin-bottom:4px;">人设</div><div style="font-size:13px;line-height:1.6;">${escHtml(c.persona)}</div></div>`:'',
    c.mask?`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);"><span style="font-size:13px;color:var(--text-tertiary);">关联面具</span><span style="font-size:13px;">${escHtml(c.mask)}</span></div>`:'',
    c.worldBook?`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);"><span style="font-size:13px;color:var(--text-tertiary);">世界书</span><span style="font-size:13px;">${escHtml(c.worldBook)}</span></div>`:'',
    `<div style="display:flex;justify-content:space-between;padding:10px 0;"><span style="font-size:13px;color:var(--text-tertiary);">语音接入</span><span style="font-size:13px;">${c.voiceEnabled?'已启用':'未启用'}</span></div>`
  ].filter(Boolean).join('');
  showModal({
    title:'联系人资料',subtitle:'Contact Info',
    contentHtml:`
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:16px;">
        <div style="position:relative;display:inline-block;">
          ${avContent}
          ${editIcon}
        </div>
        <div style="font-size:18px;font-weight:600;margin-top:6px;">${escHtml(c.name)}</div>
        ${aiTag}
      </div>
      <div style="border-radius:12px;background:var(--layer-1);padding:0 12px;">${rows}</div>
    `,
    onConfirm(){}
  });
}

function chatEditContact(name){
  // Close any open modal first, reset counter
  document.querySelectorAll('.xsj-modal-overlay').forEach(m=>m.remove());
  _modalOpenCount=0;
  document.body.style.overflow='';
  // Slight delay then open edit modal
  setTimeout(()=>{
    const c=chatGetAllContacts().find(x=>x.name===name);
    if(!c){showToast('联系人不存在');return;}
    const maskOpts=`<option value="" ${!c.mask?'selected':''}>无</option><option value="默认" ${c.mask==='默认'?'selected':''}>默认面具</option>`;
    window._editAvatar=c.avatar||'';
    window._editWorldBook=c.worldBook||'';
    const avPreview=c.avatar
      ?`<img src="${escHtml(c.avatar)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
      :`<div style="width:100%;height:100%;border-radius:50%;background:var(--layer-2);display:flex;align-items:center;justify-content:center;"><span style="font-size:28px;font-weight:700;color:#fff;">${escHtml((c.name||'?')[0])}</span></div>`;
    const bodyHtml=`
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:16px;">
        <div id="ec-av-preview" onclick="document.getElementById('ec-av-file').click()" style="width:80px;height:80px;border-radius:50%;cursor:pointer;overflow:hidden;border:2px dashed rgba(142,142,147,0.4);display:flex;align-items:center;justify-content:center;background:rgba(142,142,147,0.12);flex-shrink:0;">${avPreview}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">点击更换头像</div>
        <input type="file" id="ec-av-file" accept="image/*" style="display:none" onchange="_ecAvatarChange(this)">
      </div>
      <div class="xsj-field-wrap"><div class="xsj-field-label">姓名 <span style="color:#cc3333">*</span></div><input class="xsj-input" data-field="ecname" value="${escHtml(c.name)}" autocomplete="off"></div>
      <div class="xsj-field-wrap"><div class="xsj-field-label">性别</div>
        <div style="display:flex;gap:12px;padding:8px 0;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="ec-gender" value="男" ${c.gender==='男'?'checked':''} style="accent-color:var(--text);"> 男</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="ec-gender" value="女" ${c.gender==='女'?'checked':''} style="accent-color:var(--text);"> 女</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="ec-gender" value="其他" ${c.gender==='其他'||!c.gender?'checked':''} style="accent-color:var(--text);"> 其他</label>
        </div>
      </div>
      <div class="xsj-field-wrap"><div class="xsj-field-label">具体人设</div><textarea class="xsj-textarea" data-field="ecpersona" rows="3" style="resize:none;">${escHtml(c.persona||'')}</textarea></div>
      <div class="xsj-field-wrap"><div class="xsj-field-label">关联的user面具</div><select class="xsj-select" data-field="ecmask">${maskOpts}</select></div>
      <div class="xsj-field-wrap"><div class="xsj-field-label">关联的世界书</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span id="ec-wb-label" style="font-size:13px;color:var(--text-tertiary);flex:1;">${c.worldBook||'未选择'}</span>
          <div class="xsj-upload-btn" onclick="chatSelectWorldBookEdit()" style="white-space:nowrap;">选择</div>
        </div>
      </div>
      <div class="xsj-field-wrap"><div class="xsj-field-label" style="display:flex;align-items:center;justify-content:space-between;">接入语音 <div id="ec-voice-toggle" class="app-toggle ${c.voiceEnabled?'on':''}" onclick="this.classList.toggle('on')"></div></div></div>
    `;
    showModal({
      title:'编辑联系人',subtitle:'Edit Contact',
      contentHtml:bodyHtml,
      onConfirm(d){
        if(!d.ecname||!d.ecname.trim()){showToast('姓名不能为空');return;}
        const genderRadio=document.querySelector('input[name="ec-gender"]:checked');
        const gender=genderRadio?genderRadio.value:'其他';
        const voiceEl=document.getElementById('ec-voice-toggle');
        const voiceEnabled=voiceEl?voiceEl.classList.contains('on'):false;
        const wbLabel=document.getElementById('ec-wb-label');
        const worldBook=wbLabel&&wbLabel.textContent!=='未选择'?wbLabel.textContent:'';
        const data2=chatGetData();
        data2.contacts.groups.forEach(g=>{
          g.contacts=g.contacts.map(x=>{
            if(x.name===name){
              return {...x,name:d.ecname.trim(),avatar:window._editAvatar||x.avatar,gender,persona:(d.ecpersona||'').trim(),mask:d.ecmask||'',worldBook,voiceEnabled};
            }
            return x;
          });
        });
        chatSaveData(data2);
        _contactsRefresh();
        showToast('联系人已更新 ✓');
      }
    });
  },100);
}

function _ecAvatarChange(inp){
  const f=inp.files[0];if(!f)return;
  compressImage(f,200,0.8,function(s){
    window._editAvatar=s;
    const p=document.getElementById('ec-av-preview');
    if(p){p.innerHTML='';const img=document.createElement('img');img.src=s;img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:50%;';p.appendChild(img);}
  });
  inp.value='';
}
function chatSelectWorldBookEdit(){
  const books=[{name:'幻想世界观'},{name:'现代都市设定'},{name:'科幻背景'}];
  const opts=books.map((b,i)=>`<div class="xsj-field-wrap" style="margin-bottom:4px;"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;"><input type="radio" name="wbe-sel" value="${escHtml(b.name)}" ${i===0?'checked':''} style="accent-color:var(--text);"> ${escHtml(b.name)}</label></div>`).join('');
  showModal({
    title:'选择世界书',subtitle:'Select World Book',
    contentHtml:opts,
    onConfirm(){
      const sel=document.querySelector('input[name="wbe-sel"]:checked');
      if(sel){const lbl=document.getElementById('ec-wb-label');if(lbl)lbl.textContent=sel.value;window._editWorldBook=sel.value;}
    }
  });
}

/* ── Discover Tab (Redesigned Personal Moments Page) ── */

/* ── Pinyin conversion (common chars) ── */
const PINYIN_MAP=(function(){
  const m={};
  const entries=[
    ['小','XIAO'],['美','MEI'],['云','YUN'],['朵','DUO'],['鹿','LU'],
    ['夜','YE'],['行','XING'],['者','ZHE'],['大','DA'],['中','ZHONG'],
    ['小','XIAO'],['明','MING'],['红','HONG'],['花','HUA'],['草','CAO'],
    ['木','MU'],['水','SHUI'],['火','HUO'],['土','TU'],['山','SHAN'],
    ['海','HAI'],['天','TIAN'],['地','DI'],['人','REN'],['心','XIN'],
    ['风','FENG'],['雨','YU'],['雪','XUE'],['月','YUE'],['星','XING'],
    ['光','GUANG'],['影','YING'],['梦','MENG'],['情','QING'],['爱','AI'],
    ['生','SHENG'],['命','MING'],['春','CHUN'],['夏','XIA'],['秋','QIU'],
    ['冬','DONG'],['龙','LONG'],['凤','FENG'],['鸟','NIAO'],['鱼','YU'],
    ['白','BAI'],['黑','HEI'],['青','QING'],['蓝','LAN'],['绿','LV'],
    ['紫','ZI'],['金','JIN'],['银','YIN'],['玉','YU'],['石','SHI'],
    ['阳','YANG'],['阴','YIN'],['静','JING'],['动','DONG'],['晴','QING'],
    ['雷','LEI'],['电','DIAN'],['冰','BING'],['霜','SHUANG'],['露','LU'],
    ['芸','YUN'],['萱','XUAN'],['薇','WEI'],['菊','JU'],['荷','HE'],
    ['兰','LAN'],['梅','MEI'],['竹','ZHU'],['菊','JU'],['桃','TAO'],
    ['李','LI'],['杏','XING'],['柳','LIU'],['松','SONG'],['柏','BAI'],
    ['枫','FENG'],['橘','JU'],['桂','GUI'],['莲','LIAN'],['荷','HE'],
    ['燕','YAN'],['鹰','YING'],['虎','HU'],['狼','LANG'],['熊','XIONG'],
    ['猫','MAO'],['狗','GOU'],['兔','TU'],['鼠','SHU'],['牛','NIU'],
    ['马','MA'],['羊','YANG'],['猪','ZHU'],['鸡','JI'],['蛇','SHE'],
    ['猴','HOU'],['龟','GUI'],['鹤','HE'],['孔','KONG'],['雀','QUE'],
    ['好','HAO'],['乐','LE'],['欢','HUAN'],['喜','XI'],['悦','YUE'],
    ['怡','YI'],['安','AN'],['宁','NING'],['康','KANG'],['健','JIAN'],
    ['勤','QIN'],['勇','YONG'],['智','ZHI'],['仁','REN'],['义','YI'],
    ['礼','LI'],['信','XIN'],['忠','ZHONG'],['孝','XIAO'],['廉','LIAN'],
    ['诗','SHI'],['书','SHU'],['画','HUA'],['乐','LE'],['舞','WU'],
    ['琴','QIN'],['棋','QI'],['墨','MO'],['笔','BI'],['纸','ZHI'],
    ['灵','LING'],['魂','HUN'],['神','SHEN'],['仙','XIAN'],['道','DAO'],
    ['德','DE'],['慧','HUI'],['聪','CONG'],['睿','RUI'],['哲','ZHE'],
    ['晨','CHEN'],['曦','XI'],['暮','MU'],['昕','XIN'],['昱','YU'],
    ['晴','QING'],['霖','LIN'],['霞','XIA'],['霓','NI'],['彩','CAI'],
    ['峰','FENG'],['岚','LAN'],['溪','XI'],['涛','TAO'],['浪','LANG'],
    ['江','JIANG'],['河','HE'],['湖','HU'],['泉','QUAN'],['潮','CHAO'],
    ['我','WO'],['你','NI'],['他','TA'],['她','TA'],['它','TA'],
    ['用','YONG'],['户','HU'],['名','MING'],['号','HAO'],['昵','NI'],
    ['称','CHENG'],['字','ZI'],['语','YU'],['话','HUA'],['声','SHENG'],
  ];
  entries.forEach(([c,p])=>{m[c]=p;});
  return m;
})();

function nameToPinyin(name){
  if(!name)return'USER';
  let result='';
  for(let i=0;i<name.length;i++){
    const ch=name[i];
    if(/[a-zA-Z]/.test(ch)){result+=ch.toUpperCase();}
    else if(PINYIN_MAP[ch]){result+=PINYIN_MAP[ch];}
    else if(/[\u4e00-\u9fff]/.test(ch)){
      // Unknown CJK: use unicode codepoint rough approximation
      const cp=ch.codePointAt(0);
      const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      result+=letters[(cp-0x4e00)%26];
    }
    // skip spaces/punctuation
  }
  return result||'USER';
}

function formatMomentTime(ts){
  const d=new Date(ts);
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const day=days[d.getDay()];
  const hh=String(d.getHours()).padStart(2,'0');
  const mm=String(d.getMinutes()).padStart(2,'0');
  return day+' · '+hh+':'+mm;
}

function dscEnsureSamplePosts(){
  const data=chatGetData();
  if(!data.discovers){data.discovers=[];chatSaveData(data);}
}

function dscBuildMomentCard(post){
  const name=post.authorName||post.user||'用户';
  const pid='@_'+nameToPinyin(name);
  const avatar=post.authorAvatar||post.img||'';
  const avContent=avatar
    ?`<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;">`
    :`<span style="font-size:15px;font-weight:700;color:#fff;">${escHtml(name[0]||'?')}</span>`;
  const timeStr=post.time?formatMomentTime(post.time):'';
  const content=post.content||'';
  const images=post.images||[];
  if(post.img&&post.img&&!images.length){images.push(post.img);}

  let imgGridHTML='';
  if(images.length>0){
    const nc=images.length===1?'n1':images.length<=3?'n'+images.length:'many';
    imgGridHTML=`<div class="dsc-mc-imgs ${nc}">`;
    images.forEach((item,i)=>{
      const src=typeof item==='string'?item:(item&&item.type==='photo'?item.url:null);
      if(src){
        imgGridHTML+=`<div class="dsc-mc-img-cell" onclick="showToast('图片详情')"><img src="${escHtml(src)}" loading="lazy"></div>`;
      } else if(item&&typeof item==='object'&&item.type==='text'){
        imgGridHTML+=`<div class="dsc-mc-img-cell" style="background:#f0f0f2;flex-direction:column;gap:4px;" onclick="showToast('图片描述')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1.5" stroke-linecap="round" opacity=".6"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span style="font-size:9px;color:var(--text-tertiary);text-align:center;padding:0 4px;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${escHtml((item.description||'').substring(0,40))}</span></div>`;
      } else {
        imgGridHTML+=`<div class="dsc-mc-img-cell" onclick="showToast('图片详情')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".3"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`;
      }
    });
    imgGridHTML+=`</div>`;
  }

  const postId=post.id||'';
  return `<div class="dsc-mc">
    <div class="dsc-mc-hdr">
      <div class="dsc-mc-av">${avContent}</div>
      <div class="dsc-mc-meta">
        <div class="dsc-mc-name-row">
          <span class="dsc-mc-name">${escHtml(name)}</span>
          <span class="dsc-mc-id">${escHtml(pid)}</span>
        </div>
        ${content?`<div class="dsc-mc-text">${escHtml(content)}</div>`:''}
      </div>
      <div class="dsc-mc-actions" style="margin-top:-2px;margin-right:-2px;">
        <div class="dsc-mc-dots-btn" title="更多" onclick="dscShowPostMenu('${escHtml(postId)}',this)">
          <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="5" r="2.2" fill="#555"/><circle cx="12" cy="12" r="2.2" fill="#555"/><circle cx="12" cy="19" r="2.2" fill="#555"/></svg>
        </div>
      </div>
    </div>
    ${imgGridHTML}
    <div class="dsc-mc-footer">
      <span class="dsc-mc-time">${escHtml(timeStr)}</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="dsc-mc-btn" title="点赞" onclick="dscToggleLike('${escHtml(postId)}',this)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
        <div class="dsc-mc-btn" title="评论" onclick="showToast('评论面板已准备')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.7 1.2 5.12 3.12 6.82L4 22l4.36-2.18A10.6 10.6 0 0012 20c5.52 0 10-4.03 10-9s-4.48-9-10-9z"/><path d="M8 11h.01M12 11h.01M16 11h.01" stroke-width="2.5"/></svg>
        </div>
      </div>
    </div>
  </div>`;
}

function chatBuildDiscover(){
  const data=chatGetData();
  dscEnsureSamplePosts();
  const discovers=(chatGetData()).discovers||[];

  const dName=localStorage.getItem('discoverName')||localStorage.getItem('xsj_discover_name')||'用户昵称';
  const dBio=localStorage.getItem('discoverBio')||localStorage.getItem('xsj_discover_bio')||'记录生活的每一刻';
  const dAvatar=localStorage.getItem('discoverAvatar')||localStorage.getItem('xsj_avatar')||'';
  const dBg=localStorage.getItem('discoverBg')||'';

  const avHTML=dAvatar
    ?`<img src="${dAvatar}" style="width:100%;height:100%;object-fit:cover;">`
    :`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg>`;
  const bgStyleStr=dBg
    ?`background-image:url("${dBg.replace(/"/g,'%22')}");background-size:cover;background-position:center;`
    :`background:var(--layer-2);`;

  // My posts grid (up to 3) — only user posts, no AI
  const myPosts=discovers.filter(p=>p.isAi!==true).slice(0,3);
  const postsCount=discovers.filter(p=>p.isAi!==true).length;
  let gridHTML='';
  for(let i=0;i<3;i++){
    const post=myPosts[i];
    const firstImgRaw=post&&post.images&&post.images[0]?post.images[0]:post&&post.img?post.img:'';
    const firstImg=typeof firstImgRaw==='string'?firstImgRaw:(firstImgRaw&&firstImgRaw.type==='photo'?firstImgRaw.url:'');
    const postText=post?(post.content||'').substring(0,20):'';
    const postPlaceholder='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
    // Text-type image placeholder in grid
    const hasTextImg=post&&post.images&&post.images[0]&&typeof post.images[0]==='object'&&post.images[0].type==='text';
    gridHTML+=`<div class="dsc-post-card" onclick="dscPostCardClick(${i})" data-post-idx="${i}">
      ${firstImg?`<img src="${escHtml(firstImg)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`:''}
      ${!post ? postPlaceholder : ''}
      ${post&&hasTextImg?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:6px;text-align:center;font-size:10px;color:inherit;line-height:1.4;">${escHtml((post.images[0].description||'').substring(0,30))}</div>`:''}
      ${post&&!firstImg&&!hasTextImg?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:8px;text-align:center;font-size:11px;color:inherit;line-height:1.4;">${escHtml(postText)}</div>`:''}
    </div>`;
  }

  // Friends dynamic feed (all discovers)
  let friendsHTML='';
  // Ensure all posts have stable ids, then persist once if any were missing
  let _needsSave = false;
  discovers.forEach(post=>{
    if(!post.id){
      post.id='p_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
      _needsSave=true;
    }
  });
  if(_needsSave){ const _d=chatGetData(); _d.discovers=discovers; chatSaveData(_d); }

  if(discovers.length===0){
    friendsHTML=`<div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:14px;">暂无动态，发布第一条吧 ✨</div>`;
  } else {
    discovers.forEach(post=>{
      friendsHTML+=dscBuildMomentCard(post);
    });
  }

  return `<div class="dsc-page" id="dsc-page-wrap">
    <!-- Top section: white bg with bottom radius -->
    <div class="dsc-top-section">
    <!-- Title bar floating above hero -->
    <div class="dsc-title-bar">
      <span class="dsc-title-text">MOMENTS</span>
    </div>
    <!-- Hero background -->
    <div class="dsc-hero-bg" id="dsc-hero-bg" style="${bgStyleStr}" onclick="document.getElementById('dsc-bg-input').click()"></div>
    <input type="file" id="dsc-bg-input" accept="image/*" style="display:none;" onchange="dscHandleBg(this)">
    <!-- Avatar + profile -->
    <div class="dsc-avatar-area">
      <div class="dsc-avatar" id="dsc-avatar" onclick="document.getElementById('dsc-av-input').click()">
        ${avHTML}
      </div>
      <input type="file" id="dsc-av-input" accept="image/*" style="display:none;" onchange="dscHandleAvatar(this)">
      <div class="dsc-username" id="dsc-username" onclick="dscEditName()">${escHtml(dName)}</div>
      <div class="dsc-bio" id="dsc-bio" onclick="dscEditBio()">${escHtml(dBio)}</div>
      <div class="dsc-capsule-bar">
        <div class="dsc-capsule-item dsc-capsule-selected">Document life</div>
        <div class="dsc-capsule-item">Weather</div>
        <div class="dsc-capsule-item">Mood</div>
      </div>
    </div>
    </div><!-- /dsc-top-section -->
    <!-- My posts section -->
    <div style="margin-top:-4px;">
    <div class="dsc-section-header">
      <span class="dsc-section-title">social media</span>
      <div class="dsc-section-right" onclick="showToast('全量朋友圈')">
        <span id="dsc-posts-count">${postsCount} posts</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </div>
    <div class="dsc-posts-grid" id="dsc-posts-grid">${gridHTML}</div>
    </div>
    <!-- Divider -->
    <div class="dsc-section-divider"></div>
    <!-- Friends section -->
    <div class="dsc-section-header">
      <span class="dsc-section-title" style="font-family:'Quicksand',sans-serif;">Friends</span>
    </div>
    <div class="dsc-friends-list">${friendsHTML}</div>
    <!-- FAB -->
    <div class="dsc-fab" onclick="dscPostNew()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14m-7-7h14"/></svg>
    </div>
  </div>`;
}

function dscHandleBg(input){
  const f=input.files[0];if(!f)return;
  compressImage(f,800,0.82,function(src){
    try{
      localStorage.setItem('discoverBg',src);
    }catch(e){
      showToast('⚠️ 存储空间不足，背景图无法持久化');
    }
    const bg=document.getElementById('dsc-hero-bg');
    if(bg){ _safeBgUrl(bg, src); }
  });
  input.value='';
}
function dscHandleAvatar(input){
  const f=input.files[0];if(!f)return;
  compressImage(f,200,0.82,function(src){
    localStorage.setItem('discoverAvatar',src);
    // Sync to main avatar key so new posts use the latest discover avatar
    XSJ.set(XSJ.AVATAR,src);
    const av=document.getElementById('dsc-avatar');
    if(av){av.innerHTML=`<img src="${src.replace(/"/g,'&quot;')}" style="width:100%;height:100%;object-fit:cover;">`;}
  });
  input.value='';
}
function dscEditName(){
  const cur=localStorage.getItem('discoverName')||'用户昵称';
  showModal({
    title:'编辑昵称',subtitle:'Edit Name',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">昵称</div><input class="xsj-input" data-field="val" placeholder="请输入昵称..." value="${escHtml(cur)}" autocomplete="off"></div>`,
    onConfirm(d){
      const name=(d.val||'').trim()||'用户昵称';
      localStorage.setItem('discoverName',name);
      const el=document.getElementById('dsc-username');if(el)el.textContent=name;
    }
  });
}
function dscEditBio(){
  const cur=localStorage.getItem('discoverBio')||'记录生活的每一刻';
  showModal({
    title:'编辑简介',subtitle:'Edit Bio',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">个人简介</div><input class="xsj-input" data-field="val" placeholder="请输入简介..." value="${escHtml(cur)}" autocomplete="off"></div>`,
    onConfirm(d){
      const bio=(d.val||'').trim()||'记录生活的每一刻';
      localStorage.setItem('discoverBio',bio);
      const el=document.getElementById('dsc-bio');if(el)el.textContent=bio;
    }
  });
}
function dscPostCardClick(idx){
  const data=chatGetData();
  const post=data.discovers&&data.discovers[idx];
  if(post){showToast('详情：'+((post.content||'').substring(0,20)||'无内容'));}
}
// dscUpdatePostImg kept for legacy compat (no longer used by new FAB)
function dscUpdatePostImg(input,idx){
  const f=input.files[0];if(!f)return;
  compressImage(f,400,0.82,function(src){
    const data=chatGetData();
    if(!data.discovers)data.discovers=[];
    if(!data.discovers[idx]){
      const myName=localStorage.getItem('xsj_name')||'我';
      data.discovers[idx]={id:'p_'+Date.now(),authorId:'me',authorName:myName,authorAvatar:localStorage.getItem('xsj_avatar')||'',content:'',images:[src],time:Date.now(),likes:0,comments:[]};
    } else {
      if(!data.discovers[idx].images)data.discovers[idx].images=[];
      data.discovers[idx].images[0]=src;
    }
    chatSaveData(data);
    chatSwitchTab('discover');
  });
  input.value='';
}

/* ── Three-dot floating menu for moment cards ── */
let _dscActiveMenu=null;
let _dscMenuOverlay=null;
function dscShowPostMenu(postId, btnEl){
  // Remove any existing menu
  if(_dscActiveMenu){_dscActiveMenu.remove();_dscActiveMenu=null;}
  if(_dscMenuOverlay){_dscMenuOverlay.remove();_dscMenuOverlay=null;}

  const isDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;

  // Backdrop overlay (invisible, just for outside-click detection)
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:9099;';
  _dscMenuOverlay=overlay;
  document.body.appendChild(overlay);

  // Build menu
  const menu=document.createElement('div');
  menu.className='dsc-post-menu';
  _dscActiveMenu=menu;

  const items=[
    {label:'编辑',icon:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,action:()=>{closeDscMenu();dscEditPost(postId);}},
    {label:'删除',icon:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,danger:true,action:()=>{closeDscMenu();dscDeletePost(postId);}}
  ];

  items.forEach((item,i)=>{
    if(i>0){
      const sep=document.createElement('div');
      sep.className='dsc-post-menu-sep';
      menu.appendChild(sep);
    }
    const btn=document.createElement('div');
    btn.className='dsc-post-menu-item'+(item.danger?' danger':'');
    btn.innerHTML=`<span style="display:flex;align-items:center;">${item.icon}</span><span>${item.label}</span>`;
    btn.addEventListener('click',(e)=>{e.stopPropagation();item.action();});
    menu.appendChild(btn);
  });

  document.body.appendChild(menu);

  // Position near the button
  requestAnimationFrame(()=>{
    const mW=menu.offsetWidth||120;
    const mH=menu.offsetHeight||50;
    const r=btnEl.getBoundingClientRect();
    let top=r.bottom+6;
    let left=r.right-mW;
    if(top+mH>window.innerHeight-8)top=r.top-mH-6;
    left=Math.max(8,Math.min(left,window.innerWidth-mW-8));
    menu.style.top=top+'px';
    menu.style.left=left+'px';
    requestAnimationFrame(()=>menu.classList.add('visible'));
  });

  overlay.addEventListener('click',closeDscMenu);
}
function closeDscMenu(){
  if(_dscActiveMenu){
    _dscActiveMenu.classList.remove('visible');
    const m=_dscActiveMenu;
    setTimeout(()=>{if(m.parentNode)m.remove();},200);
    _dscActiveMenu=null;
  }
  if(_dscMenuOverlay){_dscMenuOverlay.remove();_dscMenuOverlay=null;}
}

/* ── Post: New ── */
function dscSetImageMode(mode){
  window._dscImageMode=mode;
  const btnPhoto=document.getElementById('dsc-mode-photo');
  const btnText=document.getElementById('dsc-mode-text');
  const photoArea=document.getElementById('dsc-photo-upload-area');
  const textArea=document.getElementById('dsc-text-desc-area');
  const activeBg='rgba(0,0,0,0.12)';
  const inactiveBg='rgba(0,0,0,0.04)';
  if(btnPhoto)btnPhoto.style.background=mode==='photo'?activeBg:inactiveBg;
  if(btnText)btnText.style.background=mode==='text'?activeBg:inactiveBg;
  if(btnPhoto)btnPhoto.style.fontWeight=mode==='photo'?'600':'400';
  if(btnText)btnText.style.fontWeight=mode==='text'?'600':'400';
  if(photoArea)photoArea.style.display=mode==='photo'?'block':'none';
  if(textArea)textArea.style.display=mode==='text'?'block':'none';
}

function dscPostNew(){
  window._dscNewImages=[];
  window._dscImageMode='photo';
  const myName=localStorage.getItem('xsj_name')||'我';
  const imgPreviewId='dsc-new-imgs-wrap';
  showModal({
    title:'发布动态',subtitle:'New Moment',
    contentHtml:`
    <div class="xsj-field-wrap">
      <div class="xsj-field-label">动态内容</div>
      <textarea class="xsj-textarea" data-field="content" id="dsc-new-content" placeholder="分享你的动态..." rows="3" style="resize:none;"></textarea>
    </div>
    <div class="xsj-field-wrap">
      <div class="xsj-field-label" style="margin-bottom:8px;">选择图片模式</div>
      <div style="display:flex;gap:8px;">
        <div id="dsc-mode-photo" onclick="dscSetImageMode('photo')" style="flex:1;padding:8px 0;border-radius:12px;background:rgba(0,0,0,0.12);text-align:center;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent;">📷 真实照片</div>
        <div id="dsc-mode-text" onclick="dscSetImageMode('text')" style="flex:1;padding:8px 0;border-radius:12px;background:rgba(0,0,0,0.04);text-align:center;font-size:13px;font-weight:400;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent;">✏️ 文字描述</div>
      </div>
    </div>
    <div id="dsc-photo-upload-area">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div class="xsj-field-label" style="margin-bottom:0;">图片（可多选）</div>
        <div id="dsc-ai-desc-btn" onclick="dscAiDescribeImages()" style="display:none;align-items:center;gap:5px;padding:5px 12px;border-radius:14px;background:rgba(0,122,255,0.10);color:#007aff;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(0,122,255,0.18);-webkit-tap-highlight-color:transparent;transition:opacity .15s;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          AI 描述图片
        </div>
      </div>
      <div id="${imgPreviewId}" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;"></div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div onclick="document.getElementById('dsc-new-img-multi').click()" style="width:56px;height:56px;border-radius:10px;background:var(--layer-2);display:flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px dashed rgba(0,0,0,0.15);flex-shrink:0;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v14m-7-7h14"/></svg>
        </div>
        <input type="file" id="dsc-new-img-multi" accept="image/*" multiple style="display:none;" onchange="dscHandleNewImages(this)">
        <span style="font-size:12px;color:var(--text-muted);">点击添加图片（可多选）</span>
      </div>
    </div>
    <div id="dsc-text-desc-area" style="display:none;">
      <div class="xsj-field-label" style="margin-bottom:8px;">图片描述</div>
      <div style="border-radius:10px;background:rgba(0,0,0,0.04);border:1.5px dashed rgba(0,0,0,0.12);padding:12px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;min-height:60px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1" stroke-linecap="round" opacity=".5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      </div>
      <textarea class="xsj-textarea" id="dsc-img-desc-input" placeholder="请输入图片描述…" rows="3" style="resize:none;"></textarea>
    </div>`,
    onConfirm(d){
      const content=(d.content||'').trim();
      const mode=window._dscImageMode||'photo';
      let images=[];
      if(mode==='photo'){
        images=window._dscNewImages||[];
        if(!content&&!images.length){showToast('请输入内容或添加图片');return;}
      } else {
        const descEl=document.getElementById('dsc-img-desc-input');
        const desc=(descEl?descEl.value:'').trim();
        if(!content&&!desc){showToast('请输入内容或图片描述');return;}
        if(desc)images=[{type:'text',description:desc,placeholderImage:true}];
      }
      const data=chatGetData();
      if(!data.discovers)data.discovers=[];
      const myAvatar=XSJ.get(XSJ.AVATAR,'');
      const newPost={
        id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
        authorId:'me',
        authorName:myName,
        authorAvatar:myAvatar,
        content:content,
        images:images,
        time:Date.now(),
        likes:0,
        comments:[],
        isAi:false,
        isUser:true
      };
      data.discovers.unshift(newPost);
      chatSaveData(data);
      window._dscNewImages=[];
      chatSwitchTab('discover');
    }
  });
}

/* ── AI Image Description ── */
async function dscAiDescribeImages(){
  const imgs=window._dscNewImages||[];
  if(!imgs.length){showToast('请先上传图片');return;}
  const btn=document.getElementById('dsc-ai-desc-btn');
  const ta=document.getElementById('dsc-new-content');
  if(!btn||!ta)return;
  btn.style.opacity='0.5';
  btn.style.pointerEvents='none';
  btn.innerHTML=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" dur="0.8s" values="0 12 12;360 12 12" repeatCount="indefinite"/></circle></svg> AI 描述中…`;

  // ── AbortController：15 秒超时 ──
  const controller = new AbortController();
  const timeoutId = setTimeout(()=>controller.abort(), 15000);

  try {
    // Build content array with the first image (or all images)
    const imageContents=imgs.slice(0,3).map(src=>{
      // src is a data URL like "data:image/jpeg;base64,..."
      const match=src.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if(!match)return null;
      return {type:'image',source:{type:'base64',media_type:match[1],data:match[2]}};
    }).filter(Boolean);

    if(!imageContents.length){showToast('图片格式解析失败，请重新上传');return;}

    imageContents.push({type:'text',text:'请用中文简洁描述这张（或这几张）图片的内容，适合作为朋友圈动态文字，50字以内，不要带引号。'});

    // ⚠️  注意：Anthropic API 不支持浏览器直接跨域调用。
    //     实际部署时请将此请求改为通过你自己的后端服务中转，
    //     并在后端添加 "x-api-key" 请求头。
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      signal: controller.signal,
      headers:{
        'Content-Type':'application/json',
        'anthropic-version':'2023-06-01'
        // 'x-api-key': 'YOUR_KEY'  ← 必须通过后端代理传入，请勿在前端硬编码密钥
      },
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:200,
        messages:[{role:'user',content:imageContents}]
      })
    });

    if(!resp.ok){
      const errBody = await resp.json().catch(()=>({}));
      const errType = errBody && errBody.error && errBody.error.type;
      if(resp.status===401||errType==='authentication_error'){
        showToast('AI 调用失败：需要通过后端代理并配置 API 密钥');
      } else if(resp.status===429){
        showToast('AI 请求过于频繁，请稍后重试');
      } else {
        showToast('AI 描述失败（' + resp.status + '），请重试');
      }
      return;
    }

    const json=await resp.json();
    const text=(json.content||[]).map(c=>c.type==='text'?c.text:'').join('').trim();
    if(text){
      ta.value=text;
      // Also set the data-field value by dispatching input event
      ta.dispatchEvent(new Event('input',{bubbles:true}));
      showToast('AI描述已填入 ✓');
    } else {
      showToast('AI描述失败，请重试');
    }
  } catch(e){
    if(e && e.name === 'AbortError'){
      showToast('AI 描述超时（15s），请检查网络后重试');
    } else {
      showToast('网络请求失败，请检查网络连接');
    }
  } finally {
    clearTimeout(timeoutId);
    if(btn){
      btn.style.opacity='1';btn.style.pointerEvents='auto';
      btn.innerHTML=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg> AI 描述图片`;
    }
  }
}

/* ── Toggle Like ── */
function dscToggleLike(postId,btnEl){
  const data=chatGetData();
  if(!data.discovers)return;
  const post=data.discovers.find(p=>p.id===postId);
  if(!post)return;
  post._liked=!post._liked;
  post.likes=(post.likes||0)+(post._liked?1:-1);
  if(post.likes<0)post.likes=0;
  chatSaveData(data);
  // Animate the like button
  const svg=btnEl&&btnEl.querySelector('svg');
  if(svg)svg.style.fill=post._liked?'#ff3b30':'none';
  if(svg)svg.style.stroke=post._liked?'#ff3b30':'currentColor';
}
window.dscHandleNewImages=function(input){
  const files=Array.from(input.files);
  if(!files.length)return;
  const wrap=document.getElementById('dsc-new-imgs-wrap');
  files.forEach(f=>{
    compressImage(f,600,0.82,function(src){
      window._dscNewImages=window._dscNewImages||[];
      window._dscNewImages.push(src);
      if(wrap){
        const cell=document.createElement('div');
        cell.style.cssText='width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0;position:relative;';
        const img=document.createElement('img');img.src=src;img.style.cssText='width:100%;height:100%;object-fit:cover;';
        cell.appendChild(img);wrap.appendChild(cell);
      }
      // Show AI describe button once at least one image is added
      const aiBtn=document.getElementById('dsc-ai-desc-btn');
      if(aiBtn)aiBtn.style.display='flex';
    });
  });
  input.value='';
};

/* ── Post: Edit ── */
function dscEditPost(postId){
  const data=chatGetData();
  if(!data.discovers)return;
  const postIdx=data.discovers.findIndex(p=>p.id===postId);
  if(postIdx<0){showToast('动态不存在');return;}
  const post=data.discovers[postIdx];
  window._dscEditImages=(post.images||[]).slice();
  if(post.img&&!window._dscEditImages.length)window._dscEditImages=[post.img];

  let previewHTML='';
  window._dscEditImages.forEach((src,i)=>{
    previewHTML+=`<div style="width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0;position:relative;"><img src="${escHtml(src)}" style="width:100%;height:100%;object-fit:cover;"></div>`;
  });

  showModal({
    title:'编辑动态',subtitle:'Edit Moment',
    contentHtml:`
    <div class="xsj-field-wrap">
      <div class="xsj-field-label">动态内容</div>
      <textarea class="xsj-textarea" data-field="econtent" rows="3" style="resize:none;">${escHtml(post.content||'')}</textarea>
    </div>
    <div class="xsj-field-label" style="margin-bottom:8px;">图片</div>
    <div id="dsc-edit-imgs-wrap" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">${previewHTML}</div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div onclick="document.getElementById('dsc-edit-img-multi').click()" style="width:56px;height:56px;border-radius:10px;background:var(--layer-2);display:flex;align-items:center;justify-content:center;cursor:pointer;border:1.5px dashed rgba(0,0,0,0.15);flex-shrink:0;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" stroke-width="1.5" stroke-linecap="round"><path d="M12 5v14m-7-7h14"/></svg>
      </div>
      <input type="file" id="dsc-edit-img-multi" accept="image/*" multiple style="display:none;" onchange="dscHandleEditImages(this)">
      <span style="font-size:12px;color:var(--text-muted);">添加更多图片</span>
      <span style="font-size:12px;color:#cc3333;cursor:pointer;" onclick="window._dscEditImages=[];document.getElementById('dsc-edit-imgs-wrap').innerHTML='';">清空</span>
    </div>`,
    onConfirm(d){
      const content=(d.econtent||'').trim();
      if(!content&&(!window._dscEditImages||!window._dscEditImages.length)){showToast('请输入内容或添加图片');return;}
      data.discovers[postIdx]={
        ...post,
        content:content,
        images:window._dscEditImages||[],
        img:window._dscEditImages&&window._dscEditImages[0]||post.img||''
      };
      chatSaveData(data);
      window._dscEditImages=[];
      chatSwitchTab('discover');
      showToast('动态已更新 ✓');
    }
  });
}
window.dscHandleEditImages=function(input){
  const files=Array.from(input.files);
  if(!files.length)return;
  const wrap=document.getElementById('dsc-edit-imgs-wrap');
  files.forEach(f=>{
    compressImage(f,600,0.82,function(src){
      window._dscEditImages=window._dscEditImages||[];
      window._dscEditImages.push(src);
      if(wrap){
        const cell=document.createElement('div');
        cell.style.cssText='width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0;position:relative;';
        const img=document.createElement('img');img.src=src;img.style.cssText='width:100%;height:100%;object-fit:cover;';
        cell.appendChild(img);wrap.appendChild(cell);
      }
    });
  });
  input.value='';
};

/* ── Post: Delete ── */
function dscDeletePost(postId){
  showModal({
    title:'删除动态',subtitle:'Delete Moment',
    contentHtml:`<div class="xsj-confirm-text">确认删除这条动态吗？<br><span style="font-size:13px;color:var(--text-tertiary);">此操作无法撤销</span></div>`,
    onConfirm(){
      const data=chatGetData();
      if(!data.discovers)return;
      data.discovers=data.discovers.filter(p=>p.id!==postId);
      chatSaveData(data);
      chatSwitchTab('discover');
      showToast('动态已删除');
    }
  });
}

// Legacy compat
function chatPostDiscover(){dscPostNew();}
function chatHandleMomentsBg(input){dscHandleBg(input);}
function discoverEditName(){dscEditName();}
function discoverEditBio(){dscEditBio();}
function discoverHandleAvatar(input){dscHandleAvatar(input);}

/* ── Me Tab ── */
function chatBuildMe(){
  const name=XSJ.get(XSJ.NAME,'用户名');
  const status=XSJ.get(XSJ.STATUS,'·在线');
  const userId=XSJ.get(XSJ.USER_ID,'@username');
  const bio=XSJ.get(XSJ.USER_BIO,'I loved you from the start...');
  const avatar=XSJ.get(XSJ.AVATAR,'');
  const avHTML=avatar
    ?`<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">`
    :`<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/></svg>`;

  const featureItems=[
    {icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 010 7.75" opacity=".4"/></svg>`,label:'用户面具',key:'mask'},
    {icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" opacity=".3"/><path d="M2 10h20"/></svg>`,label:'我的钱包',key:'wallet'},
    {icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,label:'我的收藏',key:'favorites'},
    {icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="9" height="9" rx="2"/><rect x="13" y="2" width="9" height="9" rx="2"/><rect x="2" y="13" width="9" height="9" rx="2"/><rect x="13" y="13" width="9" height="9" rx="2"/></svg>`,label:'表情包管理',key:'emoji'}
  ];

  const featuresHTML=featureItems.map(f=>`
    <div class="me-feature-row" onclick="meFeatureClick('${f.label}')">
      <span style="color:#6e6e73;display:flex;align-items:center;flex-shrink:0;">${f.icon}</span>
      <span style="font-size:15px;font-weight:400;color:var(--text);flex:1;margin-left:12px;">${f.label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
    </div>`).join('');

  return `
  <div class="me-page-outer">

    <!-- ── Card 1: Profile info ── -->
    <div class="me-profile-card">
      <!-- Title -->
      <div style="font-family:'Quicksand',sans-serif;font-size:27px;font-weight:500;text-align:center;color:var(--text);margin-bottom:14px;letter-spacing:-.3px;">Personal Profile</div>

      <!-- Avatar -->
      <div class="me-avatar-circle" id="me-av-circle" onclick="meTriggerAvatar()">
        <div class="me-av-hover"></div>
        ${avHTML}
      </div>
      <input type="file" id="me-av-input" accept="image/*" style="display:none;" onchange="meHandleAvatar(this)">

      <!-- Username -->
      <div style="display:flex;align-items:center;justify-content:center;margin-top:12px;">
        <span id="me-card-name" style="font-family:'Quicksand',sans-serif;font-size:20px;font-weight:600;color:var(--text);white-space:nowrap;cursor:pointer;" onclick="meEditName()">${escHtml(name)}</span>
      </div>

      <!-- Status pill (centered, own line) -->
      <div style="display:flex;justify-content:center;margin-top:6px;">
        <span class="me-status-pill" id="me-card-status" onclick="meEditStatus()" style="margin-left:0;">${escHtml(status)}</span>
      </div>

      <!-- Bio / Signature -->
      <div style="text-align:center;margin-top:6px;">
        <span id="me-card-bio" style="font-size:13px;color:var(--text-tertiary);cursor:pointer;transition:opacity .15s;" onclick="meEditBio()">${escHtml(bio)}</span>
      </div>

      <!-- User ID -->
      <div style="text-align:center;margin-top:6px;">
        <span id="me-card-userid" style="font-family:'Quicksand',sans-serif;font-size:13px;color:#6e6e73;cursor:pointer;" onclick="meEditUserId()">${escHtml(userId)}</span>
      </div>

      <!-- Stats row -->
      <div style="display:flex;align-items:center;margin-top:14px;">
        <div class="me-stat-col">
          <div class="me-stat-num" style="font-family:'Quicksand',sans-serif;">123</div>
          <div class="me-stat-label" style="font-family:'Quicksand',sans-serif;">posts</div>
        </div>
        <div class="me-stat-col">
          <div class="me-stat-num" style="font-family:'Quicksand',sans-serif;">456</div>
          <div class="me-stat-label" style="font-family:'Quicksand',sans-serif;">followers</div>
        </div>
        <div class="me-stat-col">
          <div class="me-stat-num" style="font-family:'Quicksand',sans-serif;">789</div>
          <div class="me-stat-label" style="font-family:'Quicksand',sans-serif;">following</div>
        </div>
        <!-- Settings gear -->
        <div style="flex-shrink:0;margin-left:14px;color:#6e6e73;display:flex;align-items:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 005 15.4a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="display:flex;align-items:center;gap:8px;margin-top:12px;">
        <div class="me-act-btn" style="flex:2;background:#000000;color:#fff;font-family:'Quicksand',sans-serif;">FOLLOW</div>
        <div class="me-act-btn" style="flex:2;background:var(--layer-2);color:var(--text);font-family:'Quicksand',sans-serif;">SHARE</div>
        <div class="me-act-btn" style="width:42px;flex-shrink:0;background:var(--layer-2);color:var(--text);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
      </div>
    </div>

    <!-- ── Card 2: Feature list ── -->
    <div class="me-features-card">
      ${featuresHTML}
    </div>

  </div>`;
}

/* ── Me page interaction helpers ── */
function meTriggerAvatar(){document.getElementById('me-av-input').click();}
function meHandleAvatar(input){
  const f=input.files[0];if(!f)return;
  compressImage(f,200,0.82,function(src){
    XSJ.set(XSJ.AVATAR,src);
    // Update card avatar
    const circle=document.getElementById('me-av-circle');
    if(circle){
      let img=circle.querySelector('img');
      if(!img){img=document.createElement('img');img.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';circle.appendChild(img);}
      img.src=src;
      const svg=circle.querySelector('svg');if(svg)svg.style.display='none';
    }
    // Sync chat header avatar
    const hi=document.getElementById('chat-hdr-av-img'),hs=document.getElementById('chat-hdr-av-svg');
    if(hi){hi.src=src;hi.style.display='block';}if(hs)hs.style.display='none';
    // Sync main screen avatar
    const mai=document.getElementById('avatar-img');if(mai){mai.src=src;mai.style.display='block';}
    const map=document.getElementById('avatar-placeholder');if(map)map.style.display='none';
    showToast('头像已更新 ✓');
  });
  input.value='';
}
function meEditName(){
  const cur=XSJ.get(XSJ.NAME,'')||'用户名';
  showModal({
    title:'修改用户名',subtitle:'Edit Username',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">用户名</div><input class="xsj-input" data-field="val" placeholder="请输入用户名..." value="${escHtml(cur)}" autocomplete="off"></div>`,
    onConfirm(d){
      if(!d.val||!d.val.trim())return;
      const name=d.val.trim();
      XSJ.set(XSJ.NAME,name);
      const cn=document.getElementById('me-card-name');if(cn)cn.textContent=name;
      const hn=document.getElementById('chat-hdr-name');if(hn)hn.textContent=name;
      const mn=document.getElementById('me-page-name');if(mn)mn.textContent=name;
      const mu=document.getElementById('username');if(mu)mu.textContent=name;
    }
  });
}
function meEditStatus(){
  const cur=XSJ.get(XSJ.STATUS,'·在线');
  showModal({
    title:'修改状态',subtitle:'Edit Status',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">状态</div><input class="xsj-input" data-field="val" placeholder="请输入状态..." value="${escHtml(cur)}" autocomplete="off"></div>`,
    onConfirm(d){
      const status=(d.val||'').trim()||'·在线';
      XSJ.set(XSJ.STATUS,status);
      const cs=document.getElementById('me-card-status');if(cs)cs.textContent=status;
      const hs=document.getElementById('chat-hdr-status');if(hs)hs.textContent=status;
    }
  });
}
function meEditUserId(){
  const cur=XSJ.get(XSJ.USER_ID,'@username');
  showModal({
    title:'修改用户ID',subtitle:'Edit User ID',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">用户ID（仅限字母、数字、下划线）</div><input class="xsj-input" data-field="val" placeholder="@username" value="${escHtml(cur)}" autocomplete="off"></div>`,
    onConfirm(d){
      let uid=(d.val||'').trim();
      if(!uid){return;}
      // Strip leading @ for validation
      const raw=uid.startsWith('@')?uid.slice(1):uid;
      if(!/^[a-zA-Z0-9_]+$/.test(raw)){showToast('ID只能含字母、数字、下划线');return;}
      const finalId='@'+raw;
      XSJ.set(XSJ.USER_ID,finalId);
      const el=document.getElementById('me-card-userid');if(el)el.textContent=finalId;
    }
  });
}
function meEditBio(){
  const cur=XSJ.get(XSJ.USER_BIO,'I loved you from the start...');
  showModal({
    title:'修改签名',subtitle:'Edit Bio',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">个人签名</div><input class="xsj-input" data-field="val" placeholder="请输入签名..." value="${escHtml(cur)}" autocomplete="off"></div>`,
    onConfirm(d){
      const bio=(d.val||'').trim()||'I loved you from the start...';
      XSJ.set(XSJ.USER_BIO,bio);
      const el=document.getElementById('me-card-bio');if(el)el.textContent=bio;
      const hb=document.getElementById('chat-hdr-bio');if(hb)hb.textContent=bio;
    }
  });
}
function meFeatureClick(label){
  showModal({
    title:label,subtitle:'Feature',
    contentHtml:`<div class="xsj-confirm-text">该入口已保留，下一步可接入真实数据。</div>`,
    onConfirm(){}
  });
}
function chatHandleAvatarFile(input){
  const f=input.files[0];if(!f)return;
  compressImage(f,200,0.75,function(src){
    XSJ.set(XSJ.AVATAR,src);
    // Update chat header avatar
    const img=document.getElementById('chat-hdr-av-img'),svg=document.getElementById('chat-hdr-av-svg');
    if(img){img.src=src;img.style.display='block';}
    if(svg)svg.style.display='none';
    // Update main screen avatar
    const mai=document.getElementById('avatar-img');if(mai){mai.src=src;mai.style.display='block';}
    const map=document.getElementById('avatar-placeholder');if(map)map.style.display='none';
    // Re-render me tab if open
    if(CHAT_STATE.currentTab==='me')chatSwitchTab('me');
  });
  input.value='';
}

// ── Music Panel ── REMOVED ──

/* ── Step 3: multi-select behavior + composer shortcut positioning ── */
(function(){
  function convStep3EnsureState(){
    if(!CONV_STATE)return;
    if(typeof CONV_STATE.multiSelect==='undefined')CONV_STATE.multiSelect=false;
    if(!CONV_STATE.selectedBubbles)CONV_STATE.selectedBubbles=new Set();
  }

  window.convStep3ApplyHeader = function(){
    const back=document.querySelector('#conv-overlay .conv-nav-back');
    if(back&&!back.querySelector('.conv-nav-back-label')){
      back.insertAdjacentHTML('beforeend','<span class="conv-nav-back-label">back</span>');
    }
  };

  window.convStep3EnsureMultiBar = function(){
    const ov=document.getElementById('conv-overlay');
    if(!ov||document.getElementById('conv-multi-bar'))return;
    ov.insertAdjacentHTML('beforeend',`<div id="conv-multi-bar" class="conv-multi-bar" aria-label="多选消息操作栏">
      <button class="conv-multi-btn" type="button" onclick="convMultiAction('forward')" aria-label="转发">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.06v3.42c-5.7.13-9.4 2.9-10.83 7.92a.75.75 0 001.32.65c1.86-2.13 4.39-3.27 7.6-3.4l1.91-.07v3.42a.75.75 0 001.24.57l7.5-6.5a.75.75 0 000-1.14l-7.5-6.5a.75.75 0 00-1.24.57z"/></svg>
        <span>转发</span>
      </button>
      <button class="conv-multi-btn" type="button" onclick="convMultiAction('save')" aria-label="收藏">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2.75A2.25 2.25 0 008 0h8a2.25 2.25 0 012.25 2.25v18.5a.75.75 0 01-1.16.62L12 18.27l-5.09 3.1A.75.75 0 015.75 20.75V2.75z" transform="translate(0 1)"/></svg>
        <span>收藏</span>
      </button>
      <button class="conv-multi-btn danger" type="button" onclick="convMultiAction('delete')" aria-label="删除">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.75 3A1.75 1.75 0 008 4.75v.75H4.75a.75.75 0 000 1.5h.81l.85 13.07A2.25 2.25 0 008.66 22h6.68a2.25 2.25 0 002.25-2.93l.85-13.07h.81a.75.75 0 000-1.5H16v-.75A1.75 1.75 0 0014.25 3h-4.5zm.25 2.5h4V5h-4v.5zM10 9.5a.5.5 0 011 0v8a.5.5 0 01-1 0v-8zm3 0a.5.5 0 011 0v8a.5.5 0 01-1 0v-8z"/></svg>
        <span>删除</span>
      </button>
    </div>`);
  };

  window.convSyncShortcutPosition = function(){
    const ov=document.getElementById('conv-overlay');
    const input=document.querySelector('#conv-overlay .conv-input-wrap');
    if(!ov||!input)return;
    const h=Math.max(48,Math.ceil(input.offsetHeight||48));
    ov.style.setProperty('--conv-input-h',h+'px');
  };

  const _chatShowMsg=window.chatShowMsg;
  window.chatShowMsg=function(name){
    convStep3EnsureState();
    CONV_STATE.multiSelect=false;
    CONV_STATE.selectedBubbles=new Set();
    _chatShowMsg(name);
    setTimeout(function(){
      convStep3ApplyHeader();
      convStep3EnsureMultiBar();
      convSyncShortcutPosition();
    },0);
  };

  const _convAttachMessageActions=window.convAttachMessageActions;
  window.convAttachMessageActions=function(){
    _convAttachMessageActions();
    const body=document.getElementById('conv-body');
    if(!body||body._convMultiBound)return;
    body._convMultiBound=true;
    body.addEventListener('click',function(e){
      convStep3EnsureState();
      if(!CONV_STATE.multiSelect)return;
      const bubble=e.target.closest&&e.target.closest('.conv-bubble');
      if(!bubble||!body.contains(bubble))return;
      e.preventDefault();
      e.stopPropagation();
      convToggleSelectBubble(bubble);
    },true);
  };

  const _convHandleMessageAction=window.convHandleMessageAction;
  window.convHandleMessageAction=function(key,bubble,label){
    if(key==='multi'){
      convEnterMultiSelect(bubble);
      return;
    }
    _convHandleMessageAction(key,bubble,label);
  };

  const _convClose=window.convClose;
  window.convClose=function(){
    convStep3EnsureState();
    if(CONV_STATE.multiSelect){
      convExitMultiSelect();
      return;
    }
    _convClose();
  };

  const _convInputChanged=window.convInputChanged;
  window.convInputChanged=function(){
    _convInputChanged();
    convSyncShortcutPosition();
  };

  const _convRenderComposerState=window.convRenderComposerState;
  window.convRenderComposerState=function(){
    _convRenderComposerState();
    convSyncShortcutPosition();
  };

  const _convUpdateBodyPadding=window.convUpdateBodyPadding;
  window.convUpdateBodyPadding=function(){
    _convUpdateBodyPadding();
    convSyncShortcutPosition();
  };

  window.convEnterMultiSelect=function(bubble){
    if(!bubble||!bubble.isConnected)return;
    convStep3EnsureState();
    convCloseMessageMenu();
    if(CONV_STATE.plusOpen)convTogglePlus(false);
    CONV_STATE.quote=null;
    CONV_STATE.edit=null;
    CONV_STATE.multiSelect=true;
    CONV_STATE.selectedBubbles=new Set();
    convStep3EnsureMultiBar();
    const ov=document.getElementById('conv-overlay');
    if(ov)ov.classList.add('multi-mode');
    convRenderComposerState();
    convToggleSelectBubble(bubble,true);
    convUpdateMultiUI();
  };

  window.convExitMultiSelect=function(){
    convStep3EnsureState();
    CONV_STATE.multiSelect=false;
    document.querySelectorAll('#conv-overlay .conv-bubble.conv-selected').forEach(function(el){el.classList.remove('conv-selected');});
    CONV_STATE.selectedBubbles=new Set();
    const ov=document.getElementById('conv-overlay');
    if(ov)ov.classList.remove('multi-mode');
    const nameEl=document.querySelector('#conv-overlay .conv-nav-name');
    if(nameEl&&nameEl.dataset.originalText){
      nameEl.textContent=nameEl.dataset.originalText;
    }else if(nameEl&&CONV_STATE.activeName){
      nameEl.textContent=CONV_STATE.activeName;
    }
    convUpdateBodyPadding();
  };

  window.convToggleSelectBubble=function(bubble,force){
    convStep3EnsureState();
    if(!bubble||!bubble.isConnected)return;
    const selected=(typeof force==='boolean')?force:!bubble.classList.contains('conv-selected');
    bubble.classList.toggle('conv-selected',selected);
    if(selected)CONV_STATE.selectedBubbles.add(bubble);
    else CONV_STATE.selectedBubbles.delete(bubble);
    convUpdateMultiUI();
  };

  window.convUpdateMultiUI=function(){
    convStep3EnsureState();
    const connected=[].slice.call(CONV_STATE.selectedBubbles||[]).filter(function(b){return b&&b.isConnected;});
    CONV_STATE.selectedBubbles=new Set(connected);
    const count=connected.length;
    const nameEl=document.querySelector('#conv-overlay .conv-nav-name');
    if(nameEl){
      if(!nameEl.dataset.originalText)nameEl.dataset.originalText=nameEl.textContent||CONV_STATE.activeName||'';
      if(CONV_STATE.multiSelect)nameEl.textContent='已选择 '+count+' 条';
    }
    document.querySelectorAll('#conv-multi-bar .conv-multi-btn').forEach(function(btn){
      btn.style.opacity=count? '1':'.38';
      btn.style.pointerEvents=count? 'auto':'none';
    });
  };

  window.convMultiAction=function(type){
    convStep3EnsureState();
    const items=[].slice.call(CONV_STATE.selectedBubbles||[]).filter(function(b){return b&&b.isConnected;});
    if(!items.length){showToast('请选择消息');return;}
    if(type==='delete'){
      items.forEach(function(b){if(b&&b.isConnected)convDeleteMessageBubble(b);});
      showToast('已删除 '+items.length+' 条');
      convExitMultiSelect();
      return;
    }
    if(type==='save'){
      showToast('已收藏 '+items.length+' 条');
      convExitMultiSelect();
      return;
    }
    if(type==='forward'){
      showToast('转发 '+items.length+' 条 · 下一步接入');
      convExitMultiSelect();
    }
  };
})();

/* ── Step 4: photo sending + voice message simulation + multi-select polish ── */
(function(){
  function convStep4EnsurePhotoInput(){
    let input=document.getElementById('conv-photo-input');
    if(input)return input;
    input=document.createElement('input');
    input.type='file';
    input.accept='image/*';
    input.multiple=true;
    input.id='conv-photo-input';
    input.style.display='none';
    input.addEventListener('change',function(){
      const files=[].slice.call(input.files||[]).filter(function(f){return /^image\//.test(f.type||'');}).slice(0,4);
      if(!files.length){input.value='';return;}
      convSendImageMessages(files);
      input.value='';
    });
    document.body.appendChild(input);
    return input;
  }

  function convCreateSentGroupWithBubble(bubbleHTML){
    const body=document.getElementById('conv-body');
    if(!body)return null;
    const myAvatar=(typeof XSJ!=='undefined'&&XSJ.get)?XSJ.get(XSJ.AVATAR,''):'';
    const myAvHTML=myAvatar?`<img src="${escHtml(myAvatar)}" alt="">`:'我';
    const group=document.createElement('div');
    group.className='conv-group sent';
    group.innerHTML=`<div class="conv-group-av" style="background:#2C2C2E;color:#fff;">${myAvHTML}</div><div class="conv-group-bubbles">${bubbleHTML}</div>`;
    body.appendChild(group);
    convUpdateBodyPadding&&convUpdateBodyPadding();
    body.scrollTop=body.scrollHeight;
    return group;
  }

  window.convOpenPhotoPicker=function(){
    if(CONV_STATE&&CONV_STATE.plusOpen)convTogglePlus(false);
    const input=convStep4EnsurePhotoInput();
    input.click();
  };

  window.convSendImageMessages=function(files){
    if(!files||!files.length)return;
    const readers=files.map(function(file){
      return new Promise(function(resolve){
        const reader=new FileReader();
        reader.onload=function(e){resolve({name:file.name||'image',src:e.target.result});};
        reader.onerror=function(){resolve(null);};
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(function(list){
      list=list.filter(Boolean);
      if(!list.length){showToast('图片读取失败');return;}
      const n=Math.min(list.length,4);
      const cells=list.slice(0,4).map(function(img){
        return `<div class="conv-image-cell"><img src="${img.src}" alt="${escHtml(img.name)}"></div>`;
      }).join('');
      const bubble=`<div class="conv-bubble sent-single conv-media-bubble conv-image-bubble" data-msg-text="[图片 ${n}张]" data-msg-side="sent" data-msg-type="image"><div class="conv-image-grid n${n}">${cells}</div></div>`;
      convCreateSentGroupWithBubble(bubble);
      showToast(n>1?'已发送 '+n+' 张图片':'已发送图片');
    });
  };

  window.convSendVoiceMessage=function(){
    if(CONV_STATE&&CONV_STATE.plusOpen)convTogglePlus(false);
    const duration='0:08';
    const wave='<svg class="conv-voice-wave" viewBox="0 0 60 22" aria-hidden="true"><rect x="0" y="9" width="3" height="4" rx="1.5"/><rect x="5" y="6" width="3" height="10" rx="1.5"/><rect x="10" y="3" width="3" height="16" rx="1.5"/><rect x="15" y="7" width="3" height="8" rx="1.5"/><rect x="20" y="2" width="3" height="18" rx="1.5"/><rect x="25" y="5" width="3" height="12" rx="1.5"/><rect x="30" y="8" width="3" height="6" rx="1.5"/><rect x="35" y="4" width="3" height="14" rx="1.5"/><rect x="40" y="6" width="3" height="10" rx="1.5"/><rect x="45" y="3" width="3" height="16" rx="1.5"/><rect x="50" y="7" width="3" height="8" rx="1.5"/><rect x="55" y="9" width="3" height="4" rx="1.5"/></svg>';
    const bubble=`<div class="conv-bubble sent-single conv-voice-bubble" data-msg-text="[语音 ${duration}]" data-msg-side="sent" data-msg-type="voice" onclick="this.classList.toggle('playing')"><div class="conv-voice-line">${wave}<span class="conv-voice-time">${duration}</span></div></div>`;
    convCreateSentGroupWithBubble(bubble);
    showToast('已发送语音消息');
  };

  const oldAction=window.convAction;
  window.convAction=function(key,label){
    if(key==='photos'||key==='camera'){
      convOpenPhotoPicker();
      return;
    }
    if(key==='voice-msg'){
      convSendVoiceMessage();
      return;
    }
    oldAction(key,label);
  };

  const oldMultiAction=window.convMultiAction;
  window.convMultiAction=function(type){
    if(type==='forward'){
      const items=[].slice.call((CONV_STATE&&CONV_STATE.selectedBubbles)||[]).filter(function(b){return b&&b.isConnected;});
      if(!items.length){showToast('请选择消息');return;}
      const text=items.map(function(b){return convGetBubbleMainText(b);}).join(' / ');
      convExitMultiSelect();
      CONV_STATE.quote={text:text,author:'聊天记录',side:'multi'};
      convRenderComposerState();
      const inp=document.getElementById('conv-input-field');
      if(inp)inp.focus();
      showToast('已放入引用，可继续发送');
      return;
    }
    oldMultiAction(type);
  };
})();

/* ── Step 5: transparent image sending + image preview + soft AI reply ── */
(function(){
  function convStep5EnsurePhotoInput(){
    let input=document.getElementById('conv-photo-input');
    if(input)return input;
    input=document.createElement('input');
    input.type='file';
    input.accept='image/*';
    input.multiple=true;
    input.id='conv-photo-input';
    input.style.display='none';
    input.addEventListener('change',function(){
      const files=[].slice.call(input.files||[]).filter(function(f){return /^image\//.test(f.type||'');}).slice(0,4);
      if(!files.length){input.value='';return;}
      convSendImageMessages(files);
      input.value='';
    });
    document.body.appendChild(input);
    return input;
  }

  function convStep5CreateSentGroupWithBubble(bubbleHTML){
    const body=document.getElementById('conv-body');
    if(!body)return null;
    const myAvatar=(typeof XSJ!=='undefined'&&XSJ.get)?XSJ.get(XSJ.AVATAR,''):'';
    const myAvHTML=myAvatar?`<img src="${escHtml(myAvatar)}" alt="">`:'我';
    const group=document.createElement('div');
    group.className='conv-group sent';
    group.innerHTML=`<div class="conv-group-av" style="background:#2C2C2E;color:#fff;">${myAvHTML}</div><div class="conv-group-bubbles">${bubbleHTML}</div>`;
    body.appendChild(group);
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
    body.scrollTop=body.scrollHeight;
    return group;
  }

  function convStep5CreateRecvGroupWithBubble(bubbleHTML){
    const body=document.getElementById('conv-body');
    if(!body)return null;
    const left=document.querySelector('#conv-overlay .conv-av-left');
    const avHTML=left?(left.innerHTML||'AI'):'AI';
    const group=document.createElement('div');
    group.className='conv-group';
    group.innerHTML=`<div class="conv-group-av">${avHTML}</div><div class="conv-group-bubbles">${bubbleHTML}</div>`;
    body.appendChild(group);
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
    body.scrollTop=body.scrollHeight;
    return group;
  }

  window.convOpenPhotoPicker=function(){
    if(window.CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
    const input=convStep5EnsurePhotoInput();
    input.click();
  };

  window.convSendImageMessages=function(files){
    if(!files||!files.length)return;
    const readers=files.map(function(file){
      return new Promise(function(resolve){
        const reader=new FileReader();
        reader.onload=function(e){
          const type=(file.type||'').toLowerCase();
          const transparent=/png|webp|svg/.test(type) || /\.(png|webp|svg)$/i.test(file.name||'');
          resolve({name:file.name||'image',src:e.target.result,transparent:transparent});
        };
        reader.onerror=function(){resolve(null);};
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(function(list){
      list=list.filter(Boolean);
      if(!list.length){showToast('图片读取失败');return;}
      const n=Math.min(list.length,4);
      const cells=list.slice(0,4).map(function(img){
        const transparentClass=img.transparent?' is-transparent':'';
        return `<div class="conv-image-cell${transparentClass}"><img src="${img.src}" alt="${escHtml(img.name)}"></div>`;
      }).join('');
      const bubble=`<div class="conv-bubble sent-single conv-media-bubble conv-image-bubble" data-msg-text="[图片 ${n}张]" data-msg-side="sent" data-msg-type="image"><div class="conv-image-grid n${n}">${cells}</div></div>`;
      convStep5CreateSentGroupWithBubble(bubble);
      showToast(n>1?'已发送 '+n+' 张图片':'已发送图片');
    });
  };

  window.convOpenImagePreview=function(src){
    if(!src)return;
    document.querySelectorAll('.conv-image-preview').forEach(function(el){el.remove();});
    const overlay=document.createElement('div');
    overlay.className='conv-image-preview';
    overlay.innerHTML=`<div class="conv-image-preview-close" aria-label="关闭预览"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div><img src="${src}" alt="image preview">`;
    overlay.addEventListener('click',function(e){
      if(e.target===overlay||e.target.closest('.conv-image-preview-close')){
        overlay.classList.remove('show');
        setTimeout(function(){overlay.remove();},180);
      }
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){overlay.classList.add('show');});
  };

  function convStep5BindImagePreview(){
    const body=document.getElementById('conv-body');
    if(!body||body._convImagePreviewBound)return;
    body._convImagePreviewBound=true;
    body.addEventListener('click',function(e){
      const img=e.target.closest&&e.target.closest('.conv-image-cell img');
      if(!img||!body.contains(img))return;
      if(window.CONV_STATE&&CONV_STATE.multiSelect)return;
      e.preventDefault();
      e.stopPropagation();
      convOpenImagePreview(img.src);
    },true);
  }

  window.convShowAiTyping=function(){
    const bubble='<div class="conv-bubble recv-single conv-typing-bubble" data-msg-text="正在输入" data-msg-side="recv" data-msg-type="typing"><span class="conv-typing-dot"></span><span class="conv-typing-dot"></span><span class="conv-typing-dot"></span></div>';
    return convStep5CreateRecvGroupWithBubble(bubble);
  };

  window.convSendAiReply=function(){
    if(window.CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
    const status=document.querySelector('#conv-overlay .conv-nav-status');
    const oldStatus=status?status.textContent:'';
    if(status)status.textContent='typing';
    const typingGroup=convShowAiTyping();
    const replies=[
      '我在，你慢慢说。',
      '刚刚这句话我记住了。',
      '听起来你今天有点累，我陪你待一会儿。',
      '可以，我们就按你舒服的节奏来。',
      '我懂你的意思，不用急着解释。'
    ];
    const text=replies[Math.floor(Math.random()*replies.length)];
    setTimeout(function(){
      if(typingGroup&&typingGroup.isConnected)typingGroup.remove();
      if(status)status.textContent=oldStatus||'online';
      const bubble=`<div class="conv-bubble recv-single" data-msg-text="${escHtml(text)}" data-msg-side="recv"><div class="conv-bubble-main">${escHtml(text)}</div></div>`;
      convStep5CreateRecvGroupWithBubble(bubble);
      if(typeof convAttachMessageActions==='function')convAttachMessageActions();
    },720);
  };

  const oldAction=window.convAction;
  window.convAction=function(key,label){
    if(key==='photos'||key==='camera'){convOpenPhotoPicker();return;}
    if(key==='receive-message'){convSendAiReply();return;}
    oldAction(key,label);
  };

  const oldChatShowMsg=window.chatShowMsg;
  if(typeof oldChatShowMsg==='function'){
    window.chatShowMsg=function(name){
      oldChatShowMsg(name);
      setTimeout(function(){
        convStep5BindImagePreview();
        if(typeof convSyncShortcutPosition==='function')convSyncShortcutPosition();
      },0);
    };
  }
  setTimeout(convStep5BindImagePreview,0);
})();

/* ── Step 6: improved multi-select + image draft sending ── */
(function(){
  function step6EnsureState(){
    if(!window.CONV_STATE)return;
    if(!Array.isArray(CONV_STATE.imageDraft))CONV_STATE.imageDraft=[];
    if(!CONV_STATE.selectedBubbles)CONV_STATE.selectedBubbles=new Set();
  }

  function step6CreateSentGroupWithBubble(bubbleHTML){
    const body=document.getElementById('conv-body');
    if(!body)return null;
    const myAvatar=(typeof XSJ!=='undefined'&&XSJ.get)?XSJ.get(XSJ.AVATAR,''):'';
    const myAvHTML=myAvatar?`<img src="${escHtml(myAvatar)}" alt="">`:'我';
    const group=document.createElement('div');
    group.className='conv-group sent';
    group.innerHTML=`<div class="conv-group-av" style="background:#2C2C2E;color:#fff;">${myAvHTML}</div><div class="conv-group-bubbles">${bubbleHTML}</div>`;
    body.appendChild(group);
    if(typeof convAttachMessageActions==='function')convAttachMessageActions();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
    body.scrollTop=body.scrollHeight;
    return group;
  }

  function step6ImageCellHTML(img){
    const transparentClass=img&&img.transparent?' is-transparent':'';
    return `<div class="conv-image-cell${transparentClass}"><img src="${img.src}" alt="${escHtml(img.name||'image')}"></div>`;
  }

  function step6ImageBubbleHTML(list,caption){
    const safe=list.slice(0,4);
    const n=safe.length;
    const cells=safe.map(step6ImageCellHTML).join('');
    const cap=(caption||'').trim();
    const capHTML=cap?`<div class="conv-image-caption">${escHtml(cap).replace(/\n/g,'<br>')}</div>`:'';
    const msgText=cap || `[图片 ${n}张]`;
    return `<div class="conv-bubble sent-single conv-media-bubble conv-image-bubble" data-msg-text="${escHtml(msgText)}" data-msg-side="sent" data-msg-type="image"><div class="conv-image-grid n${n}">${cells}</div>${capHTML}</div>`;
  }

  window.convStep6EnsureMultiBar=function(){
    const ov=document.getElementById('conv-overlay');
    if(!ov)return;
    const old=document.getElementById('conv-multi-bar');
    if(old)old.remove();
    ov.insertAdjacentHTML('beforeend',`<div id="conv-multi-count-pill" class="conv-multi-count-pill">已选择 0 条</div><div id="conv-multi-bar" class="conv-multi-bar" aria-label="多选消息操作栏">
      <button class="conv-multi-btn" type="button" onclick="convMultiAction('copy')" aria-label="复制">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4a2 2 0 00-2 2v13a1 1 0 102 0V3h12a1 1 0 100-2zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"/></svg>
        <span>复制</span>
      </button>
      <button class="conv-multi-btn" type="button" onclick="convMultiAction('forward')" aria-label="转发">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.3 4.3a1 1 0 011.4 0l7 7a1 1 0 010 1.4l-7 7a1 1 0 11-1.4-1.4L18.6 13H5a3 3 0 00-3 3v3a1 1 0 11-2 0v-3a5 5 0 015-5h13.6l-5.3-5.3a1 1 0 010-1.4z"/></svg>
        <span>转发</span>
      </button>
      <button class="conv-multi-btn" type="button" onclick="convMultiAction('save')" aria-label="收藏">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c1.74 0 3.41.81 4.5 2.09A5.99 5.99 0 0116.5 3 5.5 5.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span>收藏</span>
      </button>
      <button class="conv-multi-btn danger" type="button" onclick="convMultiAction('delete')" aria-label="删除">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3a1 1 0 00-.95.68L7.28 6H4a1 1 0 100 2h.13l.93 12.07A2 2 0 007.05 22h9.9a2 2 0 001.99-1.93L19.87 8H20a1 1 0 100-2h-3.28l-.77-2.32A1 1 0 0015 3H9zm.72 2h4.56l.34 1H9.38l.34-1zM9 11a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1zm5 0a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1z"/></svg>
        <span>删除</span>
      </button>
    </div>`);
  };

  function step6SelectedItems(){
    step6EnsureState();
    return [].slice.call(CONV_STATE.selectedBubbles||[]).filter(function(b){return b&&b.isConnected;});
  }

  function step6BubbleLabel(bubble){
    const group=bubble.closest('.conv-group');
    const sent=!!(group&&group.classList.contains('sent'));
    return sent?'我':(CONV_STATE.activeName||'对方');
  }

  function step6Transcript(items){
    return items.map(function(b){
      const type=(b.dataset&&b.dataset.msgType)||'';
      let text=convGetBubbleMainText(b);
      if(type==='image'&&!text)text='[图片]';
      if(type==='voice'&&!text)text='[语音]';
      return step6BubbleLabel(b)+'：'+text;
    }).join('\n');
  }

  const oldChatShowMsg=window.chatShowMsg;
  if(typeof oldChatShowMsg==='function'){
    window.chatShowMsg=function(name){
      step6EnsureState();
      CONV_STATE.imageDraft=[];
      oldChatShowMsg(name);
      setTimeout(function(){
        convStep6EnsureMultiBar();
        convRenderImageDraft();
        if(typeof convUpdateMultiUI==='function')convUpdateMultiUI();
      },0);
    };
  }

  const oldEnterMulti=window.convEnterMultiSelect;
  window.convEnterMultiSelect=function(bubble){
    step6EnsureState();
    convStep6EnsureMultiBar();
    if(typeof oldEnterMulti==='function')oldEnterMulti(bubble);
    const ov=document.getElementById('conv-overlay');
    if(ov)ov.classList.add('multi-mode');
    convUpdateMultiUI();
    showToast('已进入多选');
  };

  const oldUpdateMultiUI=window.convUpdateMultiUI;
  window.convUpdateMultiUI=function(){
    step6EnsureState();
    if(typeof oldUpdateMultiUI==='function')oldUpdateMultiUI();
    const items=step6SelectedItems();
    CONV_STATE.selectedBubbles=new Set(items);
    const count=items.length;
    const pill=document.getElementById('conv-multi-count-pill');
    if(pill)pill.textContent='已选择 '+count+' 条';
    const nameEl=document.querySelector('#conv-overlay .conv-nav-name');
    if(nameEl&&CONV_STATE.multiSelect)nameEl.textContent=count?'已选择 '+count+' 条':'选择消息';
    document.querySelectorAll('#conv-multi-bar .conv-multi-btn').forEach(function(btn){
      btn.style.opacity=count?'1':'.36';
      btn.style.pointerEvents=count?'auto':'none';
    });
  };

  const oldExitMulti=window.convExitMultiSelect;
  window.convExitMultiSelect=function(){
    if(typeof oldExitMulti==='function')oldExitMulti();
    const pill=document.getElementById('conv-multi-count-pill');
    if(pill)pill.textContent='已选择 0 条';
  };

  window.convMultiAction=function(type){
    step6EnsureState();
    const items=step6SelectedItems();
    if(!items.length){showToast('请选择消息');return;}
    if(type==='copy'){
      convCopyMessageText(step6Transcript(items));
      convExitMultiSelect();
      return;
    }
    if(type==='delete'){
      items.forEach(function(b){if(b&&b.isConnected)convDeleteMessageBubble(b);});
      showToast('已删除 '+items.length+' 条');
      convExitMultiSelect();
      return;
    }
    if(type==='save'){
      showToast('已收藏 '+items.length+' 条');
      convExitMultiSelect();
      return;
    }
    if(type==='forward'){
      const text=step6Transcript(items);
      convExitMultiSelect();
      CONV_STATE.quote={text:text,author:'聊天记录',side:'multi'};
      convRenderComposerState();
      const inp=document.getElementById('conv-input-field');
      if(inp)inp.focus();
      showToast('已整理为引用');
    }
  };

  window.convSetImageDraft=function(list){
    step6EnsureState();
    CONV_STATE.imageDraft=(list||[]).slice(0,4);
    convRenderImageDraft();
    if(typeof convInputChanged==='function')convInputChanged();
  };

  window.convCancelImageDraft=function(){
    step6EnsureState();
    CONV_STATE.imageDraft=[];
    convRenderImageDraft();
    if(typeof convInputChanged==='function')convInputChanged();
  };

  window.convRemoveImageDraft=function(index){
    step6EnsureState();
    CONV_STATE.imageDraft.splice(index,1);
    convRenderImageDraft();
    if(typeof convInputChanged==='function')convInputChanged();
  };

  window.convRenderImageDraft=function(){
    step6EnsureState();
    const wrap=document.querySelector('#conv-overlay .conv-input-wrap');
    const stateWrap=document.getElementById('conv-compose-state-wrap');
    if(!wrap||!stateWrap)return;
    let box=document.getElementById('conv-image-draft-wrap');
    const draft=CONV_STATE.imageDraft||[];
    if(!draft.length){
      if(box)box.remove();
      return;
    }
    if(!box){
      box=document.createElement('div');
      box.id='conv-image-draft-wrap';
      box.className='conv-image-draft-wrap';
      wrap.insertBefore(box,stateWrap);
    }
    const thumbs=draft.map(function(img,idx){
      const transparentClass=img.transparent?' is-transparent':'';
      return `<div class="conv-image-draft-thumb${transparentClass}">
        <img src="${img.src}" alt="${escHtml(img.name||'image')}">
        <div class="conv-image-draft-remove" onclick="convRemoveImageDraft(${idx})" aria-label="移除图片"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div>
      </div>`;
    }).join('');
    box.innerHTML=`<div class="conv-image-draft-head"><div class="conv-image-draft-title">图片预览 · ${draft.length}</div><div class="conv-image-draft-close" onclick="convCancelImageDraft()" aria-label="取消图片"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div></div><div class="conv-image-draft-grid">${thumbs}</div>`;
    if(typeof convSyncShortcutPosition==='function')convSyncShortcutPosition();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
  };

  window.convSendImageMessages=function(files){
    if(!files||!files.length)return;
    const readers=files.map(function(file){
      return new Promise(function(resolve){
        const reader=new FileReader();
        reader.onload=function(e){
          const type=(file.type||'').toLowerCase();
          const transparent=/png|webp|svg/.test(type) || /\.(png|webp|svg)$/i.test(file.name||'');
          resolve({name:file.name||'image',src:e.target.result,transparent:transparent});
        };
        reader.onerror=function(){resolve(null);};
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(function(list){
      list=list.filter(Boolean).slice(0,4);
      if(!list.length){showToast('图片读取失败');return;}
      convSetImageDraft(list);
      const inp=document.getElementById('conv-input-field');
      if(inp){inp.placeholder='add a caption...';inp.focus();}
      showToast('图片已放入预览');
    });
  };

  const oldSendMessage=window.convSendMessage;
  window.convSendMessage=function(){
    step6EnsureState();
    const draft=CONV_STATE.imageDraft||[];
    const inp=document.getElementById('conv-input-field');
    const caption=inp?(inp.value||'').trim():'';
    if(draft.length && !(CONV_STATE.edit&&CONV_STATE.edit.bubble)){
      step6CreateSentGroupWithBubble(step6ImageBubbleHTML(draft,caption));
      CONV_STATE.imageDraft=[];
      CONV_STATE.quote=null;
      if(inp){inp.value='';inp.placeholder='say something...';}
      convRenderImageDraft();
      if(typeof convRenderComposerState==='function')convRenderComposerState();
      if(typeof convInputChanged==='function')convInputChanged();
      if(CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
      showToast(draft.length>1?'已发送 '+draft.length+' 张图片':'已发送图片');
      return;
    }
    if(typeof oldSendMessage==='function')oldSendMessage();
  };

  const oldUpdateSendButton=window.convUpdateSendButton;
  window.convUpdateSendButton=function(){
    if(typeof oldUpdateSendButton==='function')oldUpdateSendButton();
    step6EnsureState();
    const btn=document.querySelector('#conv-overlay .conv-send-btn');
    const inp=document.getElementById('conv-input-field');
    if(!btn||!inp)return;
    const hasText=!!(inp.value||'').trim();
    const hasDraft=!!(CONV_STATE.imageDraft&&CONV_STATE.imageDraft.length);
    btn.classList.toggle('ready',hasText||hasDraft||!!CONV_STATE.edit);
    if(hasDraft&&!CONV_STATE.edit){
      btn.setAttribute('title','发送图片');
      btn.setAttribute('aria-label','发送图片');
    }
  };

  const oldRenderComposerState=window.convRenderComposerState;
  window.convRenderComposerState=function(){
    if(typeof oldRenderComposerState==='function')oldRenderComposerState();
    convRenderImageDraft();
  };

  const oldInputChanged=window.convInputChanged;
  window.convInputChanged=function(){
    if(typeof oldInputChanged==='function')oldInputChanged();
    convRenderImageDraft();
  };

  const oldAction=window.convAction;
  window.convAction=function(key,label){
    if(key==='photos'||key==='camera'){
      if(CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
      const input=document.getElementById('conv-photo-input');
      if(input){input.click();return;}
    }
    if(typeof oldAction==='function')oldAction(key,label);
  };

  setTimeout(function(){
    step6EnsureState();
    convStep6EnsureMultiBar();
    convRenderImageDraft();
  },0);
})();

/* ── Step 7: fake voice composer + voice-to-text for both sides ── */
(function(){
  function step7EnsureState(){
    if(!window.CONV_STATE)return;
    if(!CONV_STATE.voiceDraft)CONV_STATE.voiceDraft={side:'sent',editBubble:null};
  }
  function step7WaveSvg(){
    return '<svg class="conv-voice-wave" viewBox="0 0 60 22" aria-hidden="true"><rect x="0" y="9" width="3" height="4" rx="1.5"/><rect x="5" y="6" width="3" height="10" rx="1.5"/><rect x="10" y="3" width="3" height="16" rx="1.5"/><rect x="15" y="7" width="3" height="8" rx="1.5"/><rect x="20" y="2" width="3" height="18" rx="1.5"/><rect x="25" y="5" width="3" height="12" rx="1.5"/><rect x="30" y="8" width="3" height="6" rx="1.5"/><rect x="35" y="4" width="3" height="14" rx="1.5"/><rect x="40" y="6" width="3" height="10" rx="1.5"/><rect x="45" y="3" width="3" height="16" rx="1.5"/><rect x="50" y="7" width="3" height="8" rx="1.5"/><rect x="55" y="9" width="3" height="4" rx="1.5"/></svg>';
  }
  function step7Duration(text){
    const len=String(text||'').replace(/\s+/g,'').length;
    const sec=Math.max(2,Math.min(59,Math.round(len/3.2)+2));
    return '0:'+String(sec).padStart(2,'0');
  }
  function step7SideLabel(side){return side==='sent'?'我':(CONV_STATE&&CONV_STATE.activeName?CONV_STATE.activeName:'对方');}
  function step7ContactAvatarHTML(){
    const left=document.querySelector('#conv-overlay .conv-av-left');
    return left?(left.innerHTML||'AI'):'AI';
  }
  function step7MyAvatarHTML(){
    const myAvatar=(typeof XSJ!=='undefined'&&XSJ.get)?XSJ.get(XSJ.AVATAR,''):'';
    return myAvatar?`<img src="${escHtml(myAvatar)}" alt="">`:'我';
  }
  function step7VoiceBubbleHTML(side,text,duration,open){
    const safeText=escHtml(text||'').replace(/\n/g,'<br>');
    const raw=escHtml(text||'');
    const dur=duration||step7Duration(text);
    const sideAttr=side==='sent'?'sent':'recv';
    const openClass=open?' transcribed':'';
    return `<div class="conv-bubble ${side==='sent'?'sent-single':'recv-single'} conv-voice-bubble${openClass}" data-msg-text="${raw}" data-msg-transcript="${raw}" data-msg-side="${sideAttr}" data-msg-type="voice" data-audio-status="mock" data-audio-provider="minimax-pending" onclick="convToggleVoicePlay(event,this)">
      <div class="conv-voice-line">${step7WaveSvg()}<span class="conv-voice-time">${escHtml(dur)}</span><button type="button" class="conv-voice-transcribe-btn" onclick="convToggleVoiceTranscript(event,this)">转文字</button></div>
      <div class="conv-voice-transcript">${safeText}</div>
      <div class="conv-voice-source">mock voice · minimax ready</div>
    </div>`;
  }
  function step7CreateGroup(side,bubbleHTML){
    const body=document.getElementById('conv-body');
    if(!body)return null;
    const sent=side==='sent';
    const group=document.createElement('div');
    group.className='conv-group'+(sent?' sent':'');
    const avHTML=sent?step7MyAvatarHTML():step7ContactAvatarHTML();
    group.innerHTML=`<div class="conv-group-av"${sent?' style="background:#2C2C2E;color:#fff;"':''}>${avHTML}</div><div class="conv-group-bubbles">${bubbleHTML}</div>`;
    body.appendChild(group);
    if(typeof convAttachMessageActions==='function')convAttachMessageActions();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
    body.scrollTop=body.scrollHeight;
    return group;
  }
  function step7ReplaceVoiceBubble(bubble,side,text){
    if(!bubble||!bubble.isConnected)return;
    const dur=step7Duration(text);
    const wasOpen=bubble.classList.contains('transcribed');
    const wrap=document.createElement('div');
    wrap.innerHTML=step7VoiceBubbleHTML(side,text,dur,wasOpen).trim();
    const next=wrap.firstElementChild;
    bubble.replaceWith(next);
    showToast('已保存语音内容');
  }
  function step7RemoveSheet(){
    document.querySelectorAll('.conv-voice-sheet,.conv-voice-sheet-backdrop').forEach(function(el){
      el.classList.remove('show');
      setTimeout(function(){if(el&&el.isConnected)el.remove();},180);
    });
  }
  window.convCloseVoiceComposer=function(){step7RemoveSheet();};
  window.convSetVoiceComposerSide=function(side){
    step7EnsureState();
    CONV_STATE.voiceDraft.side=side;
    document.querySelectorAll('.conv-voice-seg-btn').forEach(function(btn){btn.classList.toggle('active',btn.dataset.side===side);});
    const send=document.querySelector('.conv-voice-action.send');
    if(send)send.textContent=side==='sent'?'发送我的语音':'发送对方语音';
  };
  window.convVoiceDraftChanged=function(){
    const field=document.getElementById('conv-voice-draft-field');
    const est=document.getElementById('conv-voice-estimate');
    if(field){
      field.style.height='90px';
      field.style.height=Math.min(150,Math.max(90,field.scrollHeight))+'px';
    }
    if(est)est.textContent=step7Duration(field?field.value:'');
  };
  window.convOpenVoiceComposer=function(side,options){
    step7EnsureState();
    options=options||{};
    if(window.CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
    step7RemoveSheet();
    const editing=!!(options.bubble&&options.bubble.isConnected);
    const initialText=editing?((options.bubble.dataset&&options.bubble.dataset.msgTranscript)||convGetBubbleMainText(options.bubble)):'';
    const initialSide=editing?((options.bubble.closest('.conv-group')&&options.bubble.closest('.conv-group').classList.contains('sent'))?'sent':'recv'):(side||'sent');
    CONV_STATE.voiceDraft={side:initialSide,editBubble:editing?options.bubble:null};
    const backdrop=document.createElement('div');
    backdrop.className='conv-voice-sheet-backdrop';
    backdrop.onclick=convCloseVoiceComposer;
    const sheet=document.createElement('div');
    sheet.className='conv-voice-sheet';
    sheet.innerHTML=`<div class="conv-voice-sheet-handle"></div>
      <div class="conv-voice-sheet-head">
        <div><div class="conv-voice-sheet-title">${editing?'修改语音内容':'语音消息'}</div><div class="conv-voice-sheet-note">当前为无声模拟 · 可转文字 · MiniMax 声音预留</div></div>
        <div class="conv-voice-sheet-close" onclick="convCloseVoiceComposer()" aria-label="关闭"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div>
      </div>
      <div class="conv-voice-segment">
        <button type="button" class="conv-voice-seg-btn${initialSide==='sent'?' active':''}" data-side="sent" onclick="convSetVoiceComposerSide('sent')">我</button>
        <button type="button" class="conv-voice-seg-btn${initialSide==='recv'?' active':''}" data-side="recv" onclick="convSetVoiceComposerSide('recv')">对方</button>
      </div>
      <textarea id="conv-voice-draft-field" class="conv-voice-draft-field" placeholder="输入要假装说出的语音内容..." oninput="convVoiceDraftChanged()">${escHtml(initialText)}</textarea>
      <div class="conv-voice-sheet-meta"><span>发送后是语音气泡，不生成真实声音；点转文字显示内容。</span><span id="conv-voice-estimate" class="conv-voice-estimate">${step7Duration(initialText)}</span></div>
      <div class="conv-voice-sheet-actions"><button type="button" class="conv-voice-action cancel" onclick="convCloseVoiceComposer()">取消</button><button type="button" class="conv-voice-action send" onclick="convSubmitVoiceComposer()">${initialSide==='sent'?'发送我的语音':'发送对方语音'}</button></div>`;
    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
    requestAnimationFrame(function(){backdrop.classList.add('show');sheet.classList.add('show');});
    setTimeout(function(){const f=document.getElementById('conv-voice-draft-field');if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length);convVoiceDraftChanged();}},60);
  };
  window.convSubmitVoiceComposer=function(){
    step7EnsureState();
    const field=document.getElementById('conv-voice-draft-field');
    const text=(field&&field.value?field.value:'').trim();
    if(!text){showToast('请输入语音内容');return;}
    const side=CONV_STATE.voiceDraft&&CONV_STATE.voiceDraft.side?CONV_STATE.voiceDraft.side:'sent';
    const editBubble=CONV_STATE.voiceDraft&&CONV_STATE.voiceDraft.editBubble;
    if(editBubble&&editBubble.isConnected){
      step7ReplaceVoiceBubble(editBubble,side,text);
    }else{
      step7CreateGroup(side,step7VoiceBubbleHTML(side,text,step7Duration(text),false));
      showToast(side==='sent'?'已发送语音':'对方已发送语音');
    }
    step7RemoveSheet();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
  };
  window.convToggleVoicePlay=function(e,bubble){
    if(e&&e.target&&e.target.closest&&e.target.closest('.conv-voice-transcribe-btn'))return;
    if(!bubble)return;
    bubble.classList.toggle('playing');
    if(bubble.classList.contains('playing')){
      setTimeout(function(){if(bubble&&bubble.isConnected)bubble.classList.remove('playing');},1400);
    }
  };
  window.convToggleVoiceTranscript=function(e,btn){
    if(e){e.preventDefault();e.stopPropagation();}
    const bubble=btn&&btn.closest?btn.closest('.conv-voice-bubble'):null;
    if(!bubble)return;
    bubble.classList.toggle('transcribed');
    btn.textContent=bubble.classList.contains('transcribed')?'收起':'转文字';
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
  };
  const oldGetText=window.convGetBubbleMainText;
  window.convGetBubbleMainText=function(bubble){
    if(bubble&&bubble.dataset&&bubble.dataset.msgType==='voice'){
      return (bubble.dataset.msgTranscript||bubble.dataset.msgText||'[语音]').trim();
    }
    return typeof oldGetText==='function'?oldGetText(bubble):'';
  };
  const oldStartEdit=window.convStartEdit;
  window.convStartEdit=function(bubble){
    if(bubble&&bubble.dataset&&bubble.dataset.msgType==='voice'){
      const side=(bubble.closest('.conv-group')&&bubble.closest('.conv-group').classList.contains('sent'))?'sent':'recv';
      convOpenVoiceComposer(side,{bubble:bubble});
      return;
    }
    if(typeof oldStartEdit==='function')oldStartEdit(bubble);
  };
  window.convSendVoiceMessage=function(){convOpenVoiceComposer('sent');};
  const oldAction=window.convAction;
  window.convAction=function(key,label){
    if(key==='voice-msg'||key==='voice-call'){
      convOpenVoiceComposer('sent');
      return;
    }
    if(key==='receive-voice'){
      convOpenVoiceComposer('recv');
      return;
    }
    if(typeof oldAction==='function')oldAction(key,label);
  };
})();
