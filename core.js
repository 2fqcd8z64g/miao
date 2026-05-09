const ANNI_DATE='2025-01-01';
const MONTHS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_CN=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
let currentPhotoIdx=-1, currentChatAvSide='';

function pad(n){return n<10?'0'+n:''+n;}

/* ── escHtml helper ── */
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* ── Unified localStorage helper (single source of truth for key names) ── */
const XSJ = {
  // Read a value; returns fallback if missing or parse error
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return (v === null || v === undefined) ? fallback : v;
    } catch(e) { return fallback; }
  },
  // Write a value; silently handles QuotaExceededError
  set(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch(e) {
      if(e && (e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED')){
        showToast('⚠️ 存储空间不足，请清理图片后重试');
      }
      return false;
    }
  },
  // Canonical key aliases — always use these, never raw strings scattered around
  AVATAR:   'xsj_avatar',
  NAME:     'xsj_name',
  BIO:      'xsj_bio',
  STATUS:   'userStatus',
  USER_ID:  'userId',
  USER_BIO: 'userBio',
};

/* ── Key-name migration: run once to merge legacy duplicate keys ── */
(function _migrateKeys(){
  try {
    // avatar: merge meAvatar → xsj_avatar
    const legacyAv = localStorage.getItem('meAvatar');
    if(legacyAv && !localStorage.getItem('xsj_avatar')) {
      localStorage.setItem('xsj_avatar', legacyAv);
    }
    localStorage.removeItem('meAvatar');  // remove legacy duplicate
    // name: merge userName → xsj_name
    const legacyName = localStorage.getItem('userName');
    if(legacyName && !localStorage.getItem('xsj_name')) {
      localStorage.setItem('xsj_name', legacyName);
    }
    localStorage.removeItem('userName');  // remove legacy duplicate
  } catch(e) {}
})();

/* ── Toast ── */
function showToast(msg,dur){
  const t=document.createElement('div');t.className='xsj-toast';t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>{t.style.animation='toastOut .25s ease forwards';setTimeout(()=>t.remove(),260);},(dur||2000));
}

/* ── Modal stack counter (prevents overflow flickering when modals overlap) ── */
let _modalOpenCount = 0;

/* ── Core showModal ── */
function showModal(opts){
  // opts: {title, subtitle, contentHtml, onConfirm, onCancel, showReset, onReset}
  const overlay=document.createElement('div');overlay.className='xsj-modal-overlay';
  const modal=document.createElement('div');modal.className='xsj-modal';

  const footerHTML=opts.showReset?`<div class="xsj-modal-footer"><div class="xsj-modal-reset-btn" id="xsj-reset-btn">恢复默认</div></div>`:'';

  modal.innerHTML=`
    <div class="xsj-modal-header">
      <div class="xsj-modal-btn" id="xsj-cancel-btn">取消</div>
      <div class="xsj-modal-title-wrap">
        <div class="xsj-modal-title">${opts.title||''}</div>
        ${opts.subtitle?`<div class="xsj-modal-subtitle">${opts.subtitle}</div>`:''}
      </div>
      <div class="xsj-modal-btn confirm" id="xsj-confirm-btn">确定</div>
    </div>
    <div class="xsj-modal-body" id="xsj-modal-body">${opts.contentHtml||''}</div>
    ${footerHTML}`;

  overlay.appendChild(modal);document.body.appendChild(overlay);
  _modalOpenCount++;
  document.body.style.overflow='hidden';

  // Focus first input
  setTimeout(()=>{const inp=modal.querySelector('input,select,textarea');if(inp)inp.focus();},80);

  function closeModal(){
    overlay.classList.add('closing');modal.classList.add('closing');
    setTimeout(()=>{
      overlay.remove();
      _modalOpenCount = Math.max(0, _modalOpenCount - 1);
      if(_modalOpenCount === 0) document.body.style.overflow='';
    },200);
  }
  function collectData(){
    const d={};
    modal.querySelectorAll('[data-field]').forEach(el=>{
      const k=el.dataset.field;
      if(el.type==='checkbox')d[k]=el.checked;
      else d[k]=el.value;
    });
    return d;
  }

  overlay.addEventListener('click',e=>{if(e.target===overlay){if(opts.onCancel)opts.onCancel();closeModal();}});
  modal.querySelector('#xsj-cancel-btn').addEventListener('click',()=>{if(opts.onCancel)opts.onCancel();closeModal();});
  modal.querySelector('#xsj-confirm-btn').addEventListener('click',()=>{if(opts.onConfirm)opts.onConfirm(collectData());closeModal();});
  if(opts.showReset&&modal.querySelector('#xsj-reset-btn')){
    modal.querySelector('#xsj-reset-btn').addEventListener('click',()=>{if(opts.onReset)opts.onReset(modal);});
  }
}

/* ── Anniversary editor ── */
function editAnni(){
  const savedTitle=localStorage.getItem('xsj_anni_title')||'此处添加纪念日';
  const savedDate=localStorage.getItem('xsj_anni_date')||'2025-01-01';
  showModal({
    title:'新建纪念日',subtitle:'Create Anniversary',
    showReset:true,
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">纪念日名称</div><input class="xsj-input" data-field="anniTitle" placeholder="如：恋爱纪念日" value="${escHtml(savedTitle)}" autocomplete="off"></div>
    <div class="xsj-field-wrap"><div class="xsj-field-label">纪念日日期</div><input class="xsj-input" type="date" data-field="anniDate" value="${escHtml(savedDate)}"></div>`,
    onConfirm(d){
      const title=d.anniTitle.trim()||'此处添加纪念日';
      const dateStr=d.anniDate||'2025-01-01';
      localStorage.setItem('xsj_anni_title',title);
      localStorage.setItem('xsj_anni_date',dateStr);
      const tEl=document.getElementById('anni-title');if(tEl)tEl.textContent=title;
      const [yy,mm,dd]=dateStr.split('-');
      const dlEl=document.getElementById('anni-date-label');if(dlEl)dlEl.textContent=yy+'年'+parseInt(mm)+'月'+parseInt(dd)+'日';
      const t=new Date(dateStr),n=new Date();
      const days=Math.floor((n-t)/864e5);
      document.getElementById('anni-days').textContent=Math.abs(days);
    },
    onReset(modal){
      const ti=modal.querySelector('[data-field="anniTitle"]');if(ti)ti.value='此处添加纪念日';
      const di=modal.querySelector('[data-field="anniDate"]');if(di)di.value='2025-01-01';
    }
  });
}

function updateTimes(){
  const now=new Date(), h=pad(now.getHours()), m=pad(now.getMinutes());
  const lh=document.getElementById('lock-hour'),lm=document.getElementById('lock-min');
  if(lh)lh.textContent=h; if(lm)lm.textContent=m;
  const he=document.getElementById('home-time');if(he)he.textContent=h+':'+m;
  const mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const ld=document.getElementById('lock-info-date');
  if(ld)ld.textContent=mn[now.getMonth()]+' '+now.getDate();
  const hd=document.getElementById('home-date');
  if(hd) hd.textContent=(now.getMonth()+1)+'月'+now.getDate()+'日 '+DAYS_CN[now.getDay()];
  // Full date row on lock screen
  const ldf=document.getElementById('lock-date-full');
  if(ldf){const yy=now.getFullYear(),mm=pad(now.getMonth()+1),dd=pad(now.getDate());ldf.textContent=yy+'年'+mm+'月'+dd+'日 · '+DAYS_CN[now.getDay()];}
}
function updateAnni(){
  const dateStr=localStorage.getItem('xsj_anni_date')||ANNI_DATE;
  const title=localStorage.getItem('xsj_anni_title')||'此处添加纪念日';
  const t=new Date(dateStr),n=new Date();
  document.getElementById('anni-days').textContent=Math.abs(Math.floor((n-t)/864e5));
  const tEl=document.getElementById('anni-title');if(tEl)tEl.textContent=title;
  const [yy,mm,dd]=dateStr.split('-');
  const dlEl=document.getElementById('anni-date-label');if(dlEl)dlEl.textContent=yy+'年'+parseInt(mm)+'月'+parseInt(dd)+'日';
}

// Boot
window.addEventListener('DOMContentLoaded',()=>{
  updateTimes(); setInterval(updateTimes,10000);
  updateAnni(); loadUserData(); loadPhotos(); loadChatData(); buildCalendar();
  loadWallpapers();
  setTimeout(()=>{
    const ls=document.getElementById('loading-screen');
    ls.classList.add('fade-out');
    setTimeout(()=>{
      ls.style.display='none';
      const lk=document.getElementById('lock-screen');
      lk.style.display='flex';
      requestAnimationFrame(()=>requestAnimationFrame(()=>lk.classList.add('visible')));
    },300);
  },2500);
});

// Lock slider
(function(){
  const track=document.getElementById('unlock-track'),thumb=document.getElementById('unlock-thumb');
  let dragging=false,sx=0,tl=0;
  // Guard: ensure maxT is always a positive number; if track is hidden offsetWidth=0
  const maxT=()=>Math.max(20, track.offsetWidth - thumb.offsetWidth - 6);
  function start(e){
    // Only allow dragging when lock screen is actually visible
    const lk=document.getElementById('lock-screen');
    if(!lk||lk.style.display==='none')return;
    dragging=true;sx=e.touches?e.touches[0].clientX:e.clientX;tl=0;e.preventDefault();
  }
  function move(e){if(!dragging)return;const cx=e.touches?e.touches[0].clientX:e.clientX;let dx=Math.max(0,Math.min(cx-sx,maxT()));thumb.style.transform='translateX('+dx+'px)';tl=dx;e.preventDefault();}
  function end(){
    if(!dragging)return;dragging=false;
    const mt=maxT();
    if(mt > 10 && tl >= mt * 0.8){
      const lk=document.getElementById('lock-screen');
      const ms=document.getElementById('main-screen');
      lk.classList.remove('visible');
      ms.style.display='block';
      ms.classList.add('entering');
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        ms.classList.remove('entering');
      }));
      setTimeout(()=>{lk.style.display='none';},400);
    }else{
      thumb.style.transition='transform .3s ease';
      thumb.style.transform='translateX(0)';
      setTimeout(()=>{thumb.style.transition='';},300);
    }
  }
  thumb.addEventListener('mousedown',start);
  thumb.addEventListener('touchstart',start,{passive:false});
  document.addEventListener('mousemove',move);
  document.addEventListener('touchmove',move,{passive:false});
  document.addEventListener('mouseup',end);
  document.addEventListener('touchend',end);
})();

// Scroll → fixed dots
const pc=document.getElementById('pages-container');
pc.addEventListener('scroll',()=>{
  const idx=Math.round(pc.scrollLeft/pc.offsetWidth);
  document.getElementById('page-dots').querySelectorAll('.page-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
});

// Calendar
var calAgendaOffset=0;
var DAYS_SHORT=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function buildCalendar(){
  var now=new Date();
  now.setDate(now.getDate()+calAgendaOffset);
  var monthEl=document.getElementById('cal-agenda-month');
  if(monthEl) monthEl.textContent=MONTHS_EN[now.getMonth()]+' '+now.getFullYear();
  var strip=document.getElementById('cal-week-strip');
  if(!strip) return;
  strip.innerHTML='';
  var dow=now.getDay(),weekStart=new Date(now);weekStart.setDate(now.getDate()-dow);
  var today=new Date();
  for(var i=0;i<5;i++){
    var dt=new Date(weekStart);dt.setDate(weekStart.getDate()+i+1);
    var isToday=dt.getDate()===today.getDate()&&dt.getMonth()===today.getMonth()&&dt.getFullYear()===today.getFullYear();
    var isSelected=dt.getDate()===now.getDate()&&dt.getMonth()===now.getMonth();
    var d=document.createElement('div');d.className='cal-week-day'+(isSelected?' active':'');
    d.innerHTML='<div class="cal-wd-label">'+DAYS_SHORT[dt.getDay()]+'</div><div class="cal-wd-num">'+String(dt.getDate()).padStart(2,'0')+'</div>';
    if(isToday&&!isSelected){d.querySelector('.cal-wd-num').style.fontWeight='600';d.querySelector('.cal-wd-num').style.color='var(--text)';}
    strip.appendChild(d);
  }
  var list=document.getElementById('cal-agenda-list');
  if(list){
    var events=calAgendaOffset===0?[{t:'周末计划',time:'10:00 – 12:00',bar:'#111'},{t:'下午茶',time:'14:30 – 15:30',bar:'#ccc'}]:[{t:'空闲',time:'暂无日程',bar:'#ddd'}];
    list.innerHTML='';
    events.forEach(function(ev){
      var item=document.createElement('div');item.className='cal-agenda-item active-scale';
      item.innerHTML='<div class="cal-agenda-bar" style="background:'+ev.bar+'"></div><div><div class="cal-agenda-title">'+ev.t+'</div><div class="cal-agenda-time">'+ev.time+'</div></div>';
      list.appendChild(item);
    });
  }
  var footer=document.getElementById('cal-agenda-footer');
  if(footer) footer.textContent=calAgendaOffset===0?(events?events.length:0)+' events today':'No events';
}
function calAgendaNav(dir){calAgendaOffset+=dir;buildCalendar();}
function switchCalTab(){}

// ── Image compression utility ──
function compressImage(file, maxW, quality, cb, onError) {
  const _fail = function(msg) {
    showToast(msg || '图片处理失败，请重试');
    if (typeof onError === 'function') onError(msg);
  };
  // Guard: 15 MB hard limit before reading
  if (file && file.size > 15 * 1024 * 1024) {
    _fail('图片过大，请选择 15MB 以内的图片');
    return;
  }
  const reader = new FileReader();
  reader.onerror = function() { _fail('图片读取失败'); };
  reader.onload = function(ev) {
    const img = new Image();
    img.onerror = function() { _fail('图片格式不支持，请使用 JPG / PNG / WebP'); };
    img.onload = function() {
      try {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        // Keep PNG for transparency, otherwise JPEG
        const isTransparentPng = file.type === 'image/png';
        const dataUrl = isTransparentPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', quality);
        cb(dataUrl);
      } catch(e) {
        _fail('图片压缩失败，可能是图片尺寸过大');
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// User data
function loadUserData(){
  const n=XSJ.get(XSJ.NAME,''), b=XSJ.get(XSJ.BIO,''), a=XSJ.get(XSJ.AVATAR,'');
  if(n) document.getElementById('username').textContent=n;
  if(b) document.getElementById('user-bio').textContent=b;
  if(a){const img=document.getElementById('avatar-img');img.src=a;img.style.display='block';document.getElementById('avatar-placeholder').style.display='none';}
  const pn=localStorage.getItem('xsj_photo_note');
  if(pn){const el=document.getElementById('photo-note-text');el.textContent=pn;el.style.opacity='.8';}
  const la=localStorage.getItem('xsj_lock_avatar');
  if(la){const li=document.getElementById('lock-av-img');if(li){li.src=la;li.style.display='block';}}
  // Load anni card background
  const anniBg=localStorage.getItem('xsj_anni_bg');
  if(anniBg) setAnniBg(anniBg);
}
document.getElementById('avatar-input').addEventListener('change',function(e){
  const f=e.target.files[0];if(!f)return;
  compressImage(f,200,0.75,function(d){
    const img=document.getElementById('avatar-img');img.src=d;img.style.display='block';
    document.getElementById('avatar-placeholder').style.display='none';
    XSJ.set(XSJ.AVATAR,d);
  });
  this.value='';
});
document.getElementById('lock-av-input').addEventListener('change',function(e){
  const f=e.target.files[0];if(!f)return;
  compressImage(f,200,0.75,function(d){
    const li=document.getElementById('lock-av-img');if(li){li.src=d;li.style.display='block';}
    localStorage.setItem('xsj_lock_avatar',d);
  });
  this.value='';
});
// ── Safe CSS url() setter — escapes double-quotes to prevent CSS injection ──
function _safeBgUrl(el, src) {
  if(!el||!src)return;
  el.style.backgroundImage='url("'+src.replace(/"/g,'%22')+'")';
  el.style.backgroundSize='cover';
  el.style.backgroundPosition='center';
}
function loadWallpapers(){
  const lw=localStorage.getItem('xsj_wp_lock'),mw=localStorage.getItem('xsj_wp_main');
  if(lw) _safeBgUrl(document.getElementById('lock-screen'),lw);
  if(mw) _safeBgUrl(document.getElementById('main-screen'),mw);
}
document.getElementById('wp-lock-input').addEventListener('change',function(e){
  const f=e.target.files[0];if(!f)return;
  compressImage(f,800,0.8,function(d){
    _safeBgUrl(document.getElementById('lock-screen'),d);
    localStorage.setItem('xsj_wp_lock',d);
  });
  this.value='';
});
document.getElementById('wp-main-input').addEventListener('change',function(e){
  const f=e.target.files[0];if(!f)return;
  compressImage(f,800,0.8,function(d){
    _safeBgUrl(document.getElementById('main-screen'),d);
    localStorage.setItem('xsj_wp_main',d);
  });
  this.value='';
});
function editPhotoNote(){
  const el=document.getElementById('photo-note-text');
  const cur=el.textContent==='记录此刻的心情...'?'':el.textContent;
  showModal({
    title:'记录心情',subtitle:'Capture the Moment',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">心情备注</div><input class="xsj-input" data-field="note" placeholder="记录此刻的心情..." value="${escHtml(cur)}" autocomplete="off"></div>`,
    onConfirm(d){
      const v=d.note||'';
      if(v.trim()){el.textContent=v.trim();el.style.opacity='1';}
      else{el.textContent='记录此刻的心情...';el.style.opacity='.55';}
      localStorage.setItem('xsj_photo_note',v.trim());
    }
  });
}
document.getElementById('username').addEventListener('click',()=>{
  const c=document.getElementById('username').textContent;
  showModal({
    title:'编辑用户名',subtitle:'Edit Username',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">用户名</div><input class="xsj-input" data-field="val" placeholder="请输入用户名" value="${escHtml(c)}" autocomplete="off"></div>`,
    onConfirm(d){if(d.val&&d.val.trim()){document.getElementById('username').textContent=d.val.trim();localStorage.setItem('xsj_name',d.val.trim());}}
  });
});
document.getElementById('user-bio').addEventListener('click',()=>{
  const c=document.getElementById('user-bio').textContent;
  showModal({
    title:'编辑签名',subtitle:'Edit Bio',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">个人签名</div><input class="xsj-input" data-field="val" placeholder="请输入签名..." value="${escHtml(c)}" autocomplete="off"></div>`,
    onConfirm(d){document.getElementById('user-bio').textContent=d.val.trim()||'点击编辑签名';localStorage.setItem('xsj_bio',d.val.trim());}
  });
});

// Chat bubbles + avatars
function loadChatData(){
  const br=localStorage.getItem('xsj_bubbleR'),bl=localStorage.getItem('xsj_bubbleL');
  if(br) document.getElementById('bubbleR').textContent=br;
  if(bl) document.getElementById('bubbleL').textContent=bl;
  const ar=localStorage.getItem('xsj_chatAvR'),al=localStorage.getItem('xsj_chatAvL');
  if(ar) setChatAvImg('R',ar);
  if(al) setChatAvImg('L',al);
}
function editBubble(side){
  const el=document.getElementById('bubble'+side);
  showModal({
    title:'编辑消息',subtitle:'Edit Message',
    contentHtml:`<div class="xsj-field-wrap"><div class="xsj-field-label">消息内容</div><input class="xsj-input" data-field="val" placeholder="请输入消息..." value="${escHtml(el.textContent)}" autocomplete="off"></div>`,
    onConfirm(d){if(d.val&&d.val.trim()){el.textContent=d.val.trim();localStorage.setItem('xsj_bubble'+side,d.val.trim());}}
  });
}
function changeChatAvatar(side){currentChatAvSide=side;document.getElementById('chatav-input').click();}
document.getElementById('chatav-input').addEventListener('change',function(e){
  const f=e.target.files[0];if(!f||!currentChatAvSide)return;
  compressImage(f,200,0.75,function(d){setChatAvImg(currentChatAvSide,d);localStorage.setItem('xsj_chatAv'+currentChatAvSide,d);});
  this.value='';
});
function setChatAvImg(side,src){
  const el=document.getElementById('chatAv'+side);
  const svg=el.querySelector('.chat-av-svg');if(svg)svg.style.display='none';
  let img=el.querySelector('img');if(!img){img=document.createElement('img');el.appendChild(img);}img.src=src;
}

// Photos
function uploadPhoto(i){currentPhotoIdx=i;document.getElementById('photo-input').click();}
document.getElementById('photo-input').addEventListener('change',function(e){
  const f=e.target.files[0];if(!f||currentPhotoIdx<0)return;
  compressImage(f,400,0.8,function(d){setPhoto(currentPhotoIdx,d);localStorage.setItem('xsj_p'+currentPhotoIdx,d);});
  this.value='';
});
function setPhoto(i,src){document.getElementById('photo'+i).innerHTML='<img src="'+src+'">';}
function loadPhotos(){for(let i=0;i<3;i++){const d=localStorage.getItem('xsj_p'+i);if(d)setPhoto(i,d);}}

// Anni card background
function setAnniBg(src){
  const area=document.getElementById('anni-img-area');
  if(!area)return;
  _safeBgUrl(area, src);
  // Hide the default SVG
  const svg=area.querySelector('svg:first-child');
  if(svg)svg.style.display='none';
}
document.getElementById('anni-bg-input').addEventListener('change',function(e){
  const f=e.target.files[0];if(!f)return;
  compressImage(f,600,0.8,function(d){setAnniBg(d);localStorage.setItem('xsj_anni_bg',d);});
  this.value='';
});

// App overlay
