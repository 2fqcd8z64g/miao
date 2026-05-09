// ══ xsj-v10-worldbook-pet-patch ══

(function(){
  var PET_ORIGINAL_PATH='M353.28 939.008c-53.248 0-103.936-22.528-137.728-61.44-20.992-25.088-80.384-115.2 9.728-245.248C329.728 478.72 425.472 404.48 516.096 404.48c90.624 0 186.368 74.752 291.328 227.84 82.944 123.904 41.984 206.336 10.24 244.224-51.2 61.44-141.312 78.848-219.136 42.496-38.4-17.408-65.536-29.184-81.92-29.184-16.384 0-42.496 11.264-80.896 28.672-24.576 13.824-50.176 20.48-82.432 20.48z m162.816-460.8c-63.488 0-141.312 66.048-230.4 195.584-56.832 81.92-33.28 132.096-14.336 155.136 19.456 22.528 49.664 35.328 81.408 35.328 19.968 0 33.28-3.072 46.08-11.264l3.584-2.048c49.152-22.528 81.408-35.84 113.152-35.84 31.744 0 64 13.824 113.152 35.84 47.104 22.016 102.4 12.288 131.584-22.528 40.96-49.152 14.848-111.616-14.848-155.648-88.064-128.512-165.888-194.56-229.376-194.56z m374.784 118.272c-17.92 0-34.304-5.12-48.128-10.24l-5.12-2.048c-32.768-16.384-56.832-37.376-72.192-62.976-16.896-28.16-19.456-66.048-8.192-106.496 10.24-35.328 34.304-67.584 68.096-90.112 35.84-25.6 76.288-33.28 113.664-20.48l1.536 0.512c73.728 28.16 96.256 125.44 75.264 199.68l-1.536 4.608c-15.36 35.328-36.864 58.88-70.656 75.776l-4.608 2.048c-13.824 4.608-29.696 9.728-48.128 9.728z m-22.016-79.36c17.408 5.632 27.648 5.632 44.544 0 15.36-8.192 24.576-17.92 32.256-35.328 10.752-40.448 0-95.232-30.72-107.52-17.92-5.632-35.84 3.072-47.616 11.776-19.968 13.312-33.792 30.72-38.912 49.152-5.632 19.968-5.632 38.4 0 48.128 8.192 12.8 22.016 24.064 40.448 33.792zM145.408 596.48c-18.432 0-34.304-5.12-48.128-10.24l-5.12-2.048c-31.232-15.36-54.272-41.472-70.656-79.872-27.648-71.68-3.584-172.032 69.632-200.192 38.912-12.8 79.872-5.632 116.224 20.48 29.696 19.456 54.784 50.176 69.632 84.992l1.536 4.608c11.264 39.424 9.216 72.704-6.656 103.936l-1.536 2.56c-15.36 25.6-39.424 46.592-72.192 62.976l-4.608 2.048c-14.336 5.632-30.208 10.752-48.128 10.752zM122.88 517.12c17.408 5.632 27.136 5.632 44.544 0 17.92-9.216 31.232-20.48 38.912-32.256 6.144-13.824 6.656-27.648 1.536-47.104-9.216-20.992-24.576-38.912-42.496-51.2-12.8-9.216-31.232-17.92-49.152-11.776-29.184 11.264-39.424 67.072-26.112 102.4 8.704 19.456 18.944 32.256 32.768 39.936z m540.16-112.128L634.88 404.48c-77.824-16.896-121.856-86.528-105.984-169.472 10.752-52.736 43.008-103.936 82.944-130.048 26.624-17.408 55.296-23.552 83.456-17.408 44.544 12.8 76.288 42.496 92.16 84.48 11.264 39.424 14.336 76.8 10.24 111.104-4.608 38.912-24.064 73.728-54.272 97.792-22.528 16.384-49.152 24.064-80.384 24.064z m-16.384-74.24h15.872c15.36 0 27.136-3.072 34.816-8.704 9.728-7.68 23.04-23.04 26.112-48.128 3.072-24.576 0.512-52.224-7.168-78.848-8.192-22.016-26.112-31.744-39.936-35.84-0.512 0-10.24-2.048-25.088 7.68-23.04 14.848-44.544 49.664-50.688 81.92-7.168 41.984 9.728 72.704 46.08 81.92zM396.288 404.992h-23.04c-31.232 0-57.344-7.68-78.336-23.04-37.888-25.6-51.712-64-59.392-94.72l-1.024-4.608c-5.12-39.424 0-78.336 14.848-113.152 17.408-46.592 53.248-76.8 94.208-79.36 40.448-9.728 81.92 7.168 114.688 45.568C486.4 169.984 503.296 204.8 507.392 240.64c8.192 39.424 0 79.872-22.016 111.104-20.48 28.672-51.2 47.104-87.04 52.224l-2.048 1.024zM308.224 271.36c6.656 25.6 15.36 39.936 28.672 49.152l1.536 1.024c7.68 6.144 19.456 8.704 34.816 8.704h17.408c14.336-2.56 26.624-9.728 34.816-21.504 10.24-14.848 13.824-34.816 9.216-56.32-3.072-24.576-13.824-46.08-32.768-69.12-10.24-11.776-26.112-25.6-43.008-20.48l-10.24 1.536c-10.752 0-23.552 13.824-30.72 32.768-9.216 23.552-12.8 48.64-9.728 74.24z';
  function petSvg(size, extra){size=size||22;return '<svg class="xsj-pet-original-inline '+(extra||'')+'" width="'+size+'" height="'+size+'" viewBox="0 0 1024 1024" fill="currentColor" stroke="none"><path d="'+PET_ORIGINAL_PATH+'"></path></svg>';}
  function replaceNodeWithPet(svg, size, extra){if(!svg||svg.getAttribute('data-xsj-pet-original')==='1')return;var wrap=document.createElement('span');wrap.innerHTML=petSvg(size||20, extra||'');var ns=wrap.firstChild;ns.setAttribute('data-xsj-pet-original','1');svg.parentNode.replaceChild(ns,svg);}
  function restorePetIcons(){
    var box=document.querySelector('.dock .app-icon-wrap[onclick*="openApp(\'pet\')"] .app-icon-box');
    if(box){box.innerHTML=petSvg(24,'xsj-pet-original-dock');}
    document.querySelectorAll('svg.xsj-v7-svg').forEach(function(s){
      var h=s.innerHTML||'';
      if(h.indexOf('7.2')>-1 || h.indexOf('7.4 17.5')>-1 || h.indexOf('4.6-4.8')>-1){replaceNodeWithPet(s,20,'');}
    });
    document.querySelectorAll('.xsj-v7-pet-svg').forEach(function(s){replaceNodeWithPet(s,154,'xsj-v7-pet-svg');});
  }
  function icon(name){
    var p={
      book:'<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22V4.5z"></path><path d="M5 18.5A2.5 2.5 0 0 1 7.5 16H20"></path>',
      pen:'<path d="M4 20l4.8-1.2L19 8.6 15.4 5 5.2 15.2 4 20z"></path><path d="M13.8 6.6l3.6 3.6"></path>',
      plus:'<path d="M12 5v14M5 12h14"></path>',
      search:'<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path>',
      globe:'<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3c2.7 2.6 4 5.6 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.6-4-9s1.3-6.4 4-9z"></path>',
      user:'<circle cx="12" cy="8" r="4"></circle><path d="M4.5 21c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5"></path>',
      folder:'<path d="M3.5 6.5A2.5 2.5 0 0 1 6 4h4l2 2.5h6A2.5 2.5 0 0 1 20.5 9v8.5A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-11z"></path>',
      trigger:'<path d="M12 2v6"></path><path d="M12 16v6"></path><path d="M4.9 4.9l4.2 4.2"></path><path d="M14.9 14.9l4.2 4.2"></path><path d="M2 12h6"></path><path d="M16 12h6"></path><circle cx="12" cy="12" r="3"></circle>',
      layers:'<path d="M12 3 3 8l9 5 9-5-9-5z"></path><path d="m3 13 9 5 9-5"></path><path d="m3 17 9 5 9-5"></path>',
      settings:'<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-2 .1 1.7 1.7 0 0 0-.8 1.7V22H11v-.2a1.7 1.7 0 0 0-.9-1.6 1.7 1.7 0 0 0-2-.1l-.2.1-2-3.4.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.4-1.1H4v-4h.9a1.7 1.7 0 0 0 1.4-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3.4.2.1a1.7 1.7 0 0 0 2-.1A1.7 1.7 0 0 0 11 1.8V1h4v.8a1.7 1.7 0 0 0 .8 1.5 1.7 1.7 0 0 0 2 .1l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 9.8h1v4h-1a1.7 1.7 0 0 0-1.6 1.2z" opacity=".35"></path>',
      lock:'<rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>',
      import:'<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
      list:'<path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"></path>'
    };
    return '<svg class="xsj-wb10-svg" viewBox="0 0 24 24">'+(p[name]||p.book)+'</svg>';
  }
  var wbState={tab:'book',sub:'all'};
  function chip(label,active,onclick,ic){return '<button class="xsj-wb10-chip '+(active?'active':'')+'" '+(onclick?'onclick="'+onclick+'"':'')+'>'+(ic?icon(ic):'')+label+'</button>';}
  function depth(n){var out='<div class="xsj-wb10-depth">';for(var i=1;i<=6;i++)out+='<span class="'+(i<=n?'on':'')+'"></span>';return out+'</div>';}
  function bookCard(ic,name,meta,tags,status){return '<div class="xsj-wb10-book" onclick="xsjWB10Tab(\'entries\')"><div class="xsj-wb10-mark">'+icon(ic)+'</div><div><div class="xsj-wb10-book-name">'+name+'</div><div class="xsj-wb10-book-meta">'+meta+'</div><div class="xsj-wb10-book-tags">'+tags.map(function(t){return '<span class="xsj-wb10-tag">'+t+'</span>';}).join('')+'</div></div><div class="xsj-wb10-status">'+status+'</div></div>';}
  function entryCard(name,copy,status,d){return '<div class="xsj-wb10-entry"><div><div class="xsj-wb10-entry-title">'+name+'</div><div class="xsj-wb10-entry-copy">'+copy+'</div>'+depth(d)+'</div><div class="xsj-wb10-status">'+status+'</div></div>';}
  function head(){return '<div class="xsj-wb10-head"><div><div class="xsj-wb10-kicker">WORLDBOOK</div><div class="xsj-wb10-title">世界书</div></div><div class="xsj-wb10-actions"><div class="xsj-wb10-iconbtn">'+icon('search')+'</div><div class="xsj-wb10-iconbtn dark" onclick="xsjWB10Tab(\'new\')">'+icon('plus')+'</div></div></div>';}
  function seg(){return '<div class="xsj-wb10-seg"><button class="'+(wbState.tab==='book'?'active':'')+'" onclick="xsjWB10Mode(\'book\')">'+icon('book')+'世界书</button><button class="'+(wbState.tab==='style'?'active':'')+'" onclick="xsjWB10Mode(\'style\')">'+icon('pen')+'文风预设</button></div>';}
  function section(title,more,body){return '<div class="xsj-wb10-section"><div class="xsj-wb10-section-head"><div class="xsj-wb10-section-title">'+title+'</div><div class="xsj-wb10-section-more">'+(more||'')+'</div></div>'+body+'</div>';}
  function renderBookHome(){return '<div class="xsj-wb10-mini-tabs">'+chip('全部',wbState.sub==='all','xsjWB10Sub(\'all\')','layers')+chip('全局世界书',wbState.sub==='global','xsjWB10Sub(\'global\')','globe')+chip('局部世界书',wbState.sub==='local','xsjWB10Sub(\'local\')','user')+chip('分类',wbState.sub==='category','xsjWB10Sub(\'category\')','folder')+'</div><div class="xsj-wb10-hero"><div></div><div class="xsj-wb10-read-stack"><span class="xsj-wb10-read-pill strong">局部优先</span><span class="xsj-wb10-read-pill">注入深度 4</span><span class="xsj-wb10-read-pill">关键词触发</span></div></div><div class="xsj-wb10-grid3"><div class="xsj-wb10-card"><div class="xsj-wb10-card-title">全局</div><div class="xsj-wb10-stat">2</div><div class="xsj-wb10-stat-label">世界书</div></div><div class="xsj-wb10-card"><div class="xsj-wb10-card-title">局部</div><div class="xsj-wb10-stat">5</div><div class="xsj-wb10-stat-label">角色专属</div></div><div class="xsj-wb10-card"><div class="xsj-wb10-card-title">分类</div><div class="xsj-wb10-stat">8</div><div class="xsj-wb10-stat-label">可新增</div></div></div>'+section('世界书列表','新建分类','<div class="xsj-wb10-book-list">'+bookCard('globe','城市日常世界','全局世界书 · 42 条目 · 日常聊天读取',['生活','地点','关系网'],'启用')+bookCard('user','雨天便利店','局部世界书 · 当前角色 · 12 条目',['关键词','当前聊天'],'启用')+bookCard('folder','同居生活分类','分类 · 3 本世界书 · 28 条目',['可管理','可导入'],'分类')+'</div>')+'<div class="xsj-wb10-btnrow"><button class="xsj-wb10-btn ghost">'+icon('import')+'导入世界书</button><button class="xsj-wb10-btn" onclick="xsjWB10Tab(\'new\')">'+icon('plus')+'新建世界书</button></div>';}
  function renderEntries(){return '<div class="xsj-wb10-hero"><div><div class="xsj-wb10-hero-title">城市日常世界</div><div class="xsj-wb10-hero-copy">一个世界书可以拥有多个条目。每个条目都可以单独设置关键词、优先级、触发方式、注入深度和适用角色。</div></div><div class="xsj-wb10-read-stack"><span class="xsj-wb10-read-pill strong">42 条目</span><span class="xsj-wb10-read-pill">全局</span></div></div>'+section('条目','新建条目','<div class="xsj-wb10-book-list">'+entryCard('便利店门口','关键词：雨天、便利店、晚饭。触发后补充角色在雨天的行为习惯。','深度 4',4)+entryCard('关系边界','角色在靠近前会先观察用户情绪，不突然推进亲密关系。','深度 3',3)+entryCard('城市白色街区','位置卡片或线下模式触发，用于生成街区、灯光、回家路线。','深度 2',2)+'</div>')+'<div class="xsj-wb10-btnrow"><button class="xsj-wb10-btn ghost" onclick="xsjWB10Mode(\'book\')">返回总览</button><button class="xsj-wb10-btn">'+icon('plus')+'新建条目</button></div>';}
  function renderNewBook(){return '<div class="xsj-wb10-form"><div class="xsj-wb10-section-title">新建世界书</div><div class="xsj-wb10-field"><div class="xsj-wb10-label">世界书名称</div><input class="xsj-wb10-input" value="新的世界书"></div><div class="xsj-wb10-field"><div class="xsj-wb10-label">类型</div><div class="xsj-wb10-choice-grid"><div class="xsj-wb10-choice active">'+icon('globe')+'全局世界书</div><div class="xsj-wb10-choice">'+icon('user')+'局部世界书</div></div></div><div class="xsj-wb10-field"><div class="xsj-wb10-label">分类</div><input class="xsj-wb10-input" value="日常 / 城市 / 关系"></div><div class="xsj-wb10-field"><div class="xsj-wb10-label">触发方式</div><div class="xsj-wb10-choice-grid"><div class="xsj-wb10-choice active">'+icon('trigger')+'关键词触发</div><div class="xsj-wb10-choice">'+icon('layers')+'始终注入</div><div class="xsj-wb10-choice">'+icon('folder')+'场景触发</div><div class="xsj-wb10-choice">'+icon('lock')+'线下模式触发</div></div></div><div class="xsj-wb10-slider"><div class="xsj-wb10-slider-top"><span>注入深度</span><span>4 / 6</span></div>'+depth(4)+'<div class="xsj-wb10-card-sub">普通聊天建议 2 到 4；线下模式和长篇小说可以提高到 5 或 6。</div></div><div class="xsj-wb10-field"><div class="xsj-wb10-label">默认条目内容</div><textarea class="xsj-wb10-textarea">这里填写第一条世界书内容。后续可以继续添加多个条目，每个条目都能独立触发。</textarea></div><div class="xsj-wb10-btnrow"><button class="xsj-wb10-btn ghost" onclick="xsjWB10Mode(\'book\')">取消</button><button class="xsj-wb10-btn">保存世界书</button></div></div>';}
  function renderStyle(){return '<div class="xsj-wb10-hero"><div></div><div class="xsj-wb10-read-stack"><span class="xsj-wb10-read-pill strong">线下模式</span><span class="xsj-wb10-read-pill">旁白/心声/对话</span></div></div><div class="xsj-wb10-style-preview"><b>旁白</b><br>雨停得很慢，楼下的灯把水痕照得发白。<br><br><b>对话</b><br>先上去吧，别站在风口。<br><br><b>心声</b><br>他其实还想问你今天为什么突然安静。</div>'+section('预设列表','新建预设','<div class="xsj-wb10-book-list"><div class="xsj-wb10-style-card"><div class="xsj-wb10-style-head"><div class="xsj-wb10-style-title">日常细腻</div><div class="xsj-wb10-style-mode">线下模式</div></div><div class="xsj-wb10-card-sub">旁白克制、对话自然、心声少量出现，适合长篇日常剧情。</div><div class="xsj-wb10-book-tags"><span class="xsj-wb10-tag">旁白柔和</span><span class="xsj-wb10-tag">短句对话</span><span class="xsj-wb10-tag">低解释</span></div></div><div class="xsj-wb10-style-card"><div class="xsj-wb10-style-head"><div class="xsj-wb10-style-title">论坛体叙事</div><div class="xsj-wb10-style-mode">线下模式</div></div><div class="xsj-wb10-card-sub">用于生成论坛围观、路人评论、角色转发讨论等内容。</div><div class="xsj-wb10-book-tags"><span class="xsj-wb10-tag">多视角</span><span class="xsj-wb10-tag">路人感</span><span class="xsj-wb10-tag">评论区</span></div></div></div>')+'<div class="xsj-wb10-form"><div class="xsj-wb10-section-title">新建文风预设</div><input class="xsj-wb10-input" value="新的线下文风"><textarea class="xsj-wb10-textarea">旁白风格、心声风格、动作描写、对话长度、禁止使用的句式都可以写在这里。</textarea><div class="xsj-wb10-note">这个预设不会用于普通聊天，只会在线下模式生成长篇剧情时读取。</div><div class="xsj-wb10-btnrow"><button class="xsj-wb10-btn ghost">测试片段</button><button class="xsj-wb10-btn">保存预设</button></div></div>';}
  function renderWorldbook(){var root=document.getElementById('xsj-app-root-worldbook');if(!root)return;var body=wbState.tab==='style'?renderStyle():(wbState.sub==='new'?renderNewBook():wbState.sub==='entries'?renderEntries():renderBookHome());root.innerHTML='<div class="xsj-wb10">'+head()+seg()+body+'</div>';restorePetIcons();}
  window.xsjWB10Mode=function(tab){wbState.tab=tab;wbState.sub='all';renderWorldbook();};
  window.xsjWB10Sub=function(sub){wbState.sub=sub;renderWorldbook();};
  window.xsjWB10Tab=function(sub){wbState.tab='book';wbState.sub=sub;renderWorldbook();};
  var prevNav=window.xsjV7Nav;
  window.xsjV7Nav=function(app,view){
    if(app==='worldbook'){if(view==='style'){wbState.tab='style';wbState.sub='all';}else if(view==='edit'||view==='new'){wbState.tab='book';wbState.sub='new';}else if(view==='entries'){wbState.tab='book';wbState.sub='entries';}renderWorldbook();return;}
    var r=typeof prevNav==='function'?prevNav(app,view):undefined;
    setTimeout(restorePetIcons,0);
    return r;
  };
  function afterOpen(){setTimeout(function(){restorePetIcons();if(document.getElementById('xsj-app-root-worldbook'))renderWorldbook();},0);setTimeout(restorePetIcons,120);setTimeout(restorePetIcons,360);}
  document.addEventListener('DOMContentLoaded',afterOpen);
  if(document.readyState!=='loading')afterOpen();
})();


// ══ xsj-v11-worldbook-logic-script ══

(function(){
  var KEY='xsj_worldbook_v11_empty_logic';
  var rootId='xsj-app-root-worldbook';
  var state=loadState();
  function defaultState(){return {mode:'book',filter:'all',selectedBook:null,books:[],categories:[],styles:[]};}
  function loadState(){try{var raw=localStorage.getItem(KEY);if(raw){var s=JSON.parse(raw);s.mode=s.mode||'book';s.filter=s.filter||'all';s.books=Array.isArray(s.books)?s.books:[];s.categories=Array.isArray(s.categories)?s.categories:[];s.styles=Array.isArray(s.styles)?s.styles:[];return s;}}catch(e){}return defaultState();}
  function saveState(){try{localStorage.setItem(KEY,JSON.stringify({mode:state.mode,filter:state.filter,selectedBook:state.selectedBook,books:state.books,categories:state.categories,styles:state.styles}));}catch(e){}}
  function uid(prefix){return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function val(id){var el=document.getElementById(id);return el?el.value.trim():'';}
  function icon(name){var p={
    book:'<path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 0-3 3V4z"></path><path d="M5 4v16a3 3 0 0 1 3-3h11"></path>',
    pen:'<path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4z"></path><path d="M13 6l5 5"></path>',
    plus:'<path d="M12 5v14M5 12h14"></path>',
    search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
    folder:'<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"></path>',
    globe:'<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"></path>',
    user:'<circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.6-4 4.2-6 8-6s6.4 2 8 6"></path>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5z"></path><path d="m3 12 9 5 9-5"></path><path d="m3 17 9 5 9-5"></path>',
    trigger:'<path d="M4 12h8"></path><path d="M12 4v16"></path><path d="M16 8l4 4-4 4"></path>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>',
    list:'<path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"></path>',
    trash:'<path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="M7 7l1 14h8l1-14"></path>',
    import:'<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
    close:'<path d="M6 6l12 12M18 6 6 18"></path>',
    more:'<circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle>',
    check:'<path d="m5 13 4 4L19 7"></path>',
    arrow:'<path d="M9 6l6 6-6 6"></path>'
  };return '<svg viewBox="0 0 24 24">'+(p[name]||p.book)+'</svg>';}
  function depth(n){var out='<div class="xsj-wb11-depth">';for(var i=1;i<=6;i++)out+='<span class="'+(i<=Number(n)?'on':'')+'"></span>';return out+'</div>';}
  function countEntries(){return state.books.reduce(function(sum,b){return sum+(Array.isArray(b.entries)?b.entries.length:0);},0);}
  function booksFiltered(){return state.books.filter(function(b){if(state.filter==='global')return b.type==='global';if(state.filter==='local')return b.type==='local';if(state.filter.indexOf('cat:')===0)return b.category===state.filter.slice(4);return true;});}
  function currentBook(){return state.books.find(function(b){return b.id===state.selectedBook;})||null;}
  function head(){return '<div class="xsj-wb11-head"><div><div class="xsj-wb11-kicker">WORLDBOOK</div><div class="xsj-wb11-title">世界书</div></div><div class="xsj-wb11-head-actions"><div class="xsj-wb11-iconbtn" onclick="xsjWB11OpenModal(\'search\')">'+icon('search')+'</div><div class="xsj-wb11-iconbtn dark" onclick="xsjWB11QuickNew()">'+icon('plus')+'</div></div></div>';}
  function seg(){return '<div class="xsj-wb11-seg"><button class="'+(state.mode==='book'?'active':'')+'" onclick="xsjWB11Mode(\'book\')">'+icon('book')+'世界书</button><button class="'+(state.mode==='style'?'active':'')+'" onclick="xsjWB11Mode(\'style\')">'+icon('pen')+'文风预设</button></div>';}
  function chip(label,active,on,ic){return '<button class="xsj-wb11-chip '+(active?'active':'')+'" onclick="'+on+'">'+(ic?icon(ic):'')+esc(label)+'</button>';}
  function section(title,more,body,on){return '<div class="xsj-wb11-section"><div class="xsj-wb11-section-head"><div class="xsj-wb11-section-title">'+esc(title)+'</div><div class="xsj-wb11-section-more" '+(on?'onclick="'+on+'"':'')+'>'+more+'</div></div>'+body+'</div>';}
  function emptyState(type){if(type==='style')return '<div class="xsj-wb11-empty"><div class="xsj-wb11-empty-icon">'+icon('pen')+'</div><div class="xsj-wb11-empty-title">还没有文风预设</div><div class="xsj-wb11-empty-copy">文风预设只给线下模式使用，用来控制旁白、心声、动作描写和对话风格。</div></div>';return '<div class="xsj-wb11-empty"><div class="xsj-wb11-empty-icon">'+icon('book')+'</div><div class="xsj-wb11-empty-title">还没有世界书</div><div class="xsj-wb11-empty-copy">可以先新建分类，再创建全局或局部世界书。每个世界书都可以继续添加多个条目。</div></div>';}
  function toolbarItem(label,sub,active,on,ic){return '<button class="xsj-wb23-filter-chip '+(active?'active':'')+'" onclick="'+on+'"><span class="xsj-wb23-chip-ic">'+icon(ic)+'</span><span class="xsj-wb23-chip-text"><b>'+esc(label)+'</b><em>'+esc(sub)+'</em></span></button>';}
  function renderToolbar(){var total=state.books.length;var globalCount=state.books.filter(function(b){return b.type==='global';}).length;var localCount=state.books.filter(function(b){return b.type==='local';}).length;var h='<div class="xsj-wb23-filter"><div class="xsj-wb23-filter-head"><div><div class="xsj-wb23-filter-title">筛选</div><div class="xsj-wb23-filter-sub">按使用范围查看世界书</div></div><button class="xsj-wb23-cat-button '+(state.filter==='category'?'active':'')+'" onclick="xsjWB11Filter(\'category\')">'+icon('folder')+'<span>分类</span></button></div><div class="xsj-wb23-filter-row">';h+=toolbarItem('全部',total+' 本',state.filter==='all','xsjWB11Filter(\'all\')','layers');h+=toolbarItem('全局',globalCount+' 本',state.filter==='global','xsjWB11Filter(\'global\')','globe');h+=toolbarItem('局部',localCount+' 本',state.filter==='local','xsjWB11Filter(\'local\')','user');h+='</div>';if(state.categories.length){h+='<div class="xsj-wb23-cat-row">'+state.categories.map(function(c){var active=state.filter==='cat:'+c.id;return '<button class="'+(active?'active':'')+'" onclick="xsjWB11Filter(\'cat:'+c.id+'\')">'+esc(c.name)+'</button>';}).join('')+'</div>';}return h+'</div>';}
  function renderHero(){return '';}
  function renderStats(){return '';}
  function bookCard(b){var ic=b.type==='global'?'globe':'user';var entries=Array.isArray(b.entries)?b.entries:[];var source=entries.find(function(e){return e&&String(e.content||'').trim();})||entries.find(function(e){return e&&String(e.title||e.keywords||'').trim();})||{};var preview=String(source.content||source.title||source.keywords||'').trim();if(!preview&&String(b.keywords||'').trim())preview='关键词：'+String(b.keywords).trim();if(!preview)preview='还没有条目内容，进入后可以继续添加。';if(preview.length>58)preview=preview.slice(0,58)+'...';return '<div class="xsj-wb11-card xsj-wb11-card-clean xsj-wb11-card-preview" onclick="xsjWB11OpenBook(\''+b.id+'\')"><div class="xsj-wb11-mark">'+icon('book')+'</div><div class="xsj-wb11-card-main"><div class="xsj-wb11-name-row"><div class="xsj-wb11-name">'+esc(b.name)+'</div><span class="xsj-wb11-type-icon" aria-label="'+esc(b.type==='global'?'全局世界书':'局部世界书')+'">'+icon(ic)+'</span></div><div class="xsj-wb11-preview">'+esc(preview)+'</div></div><div class="xsj-wb11-go" aria-label="打开世界书">'+icon('arrow')+'</div></div>';}
  function triggerText(t){return {keyword:'关键词触发',always:'始终注入',scene:'场景触发',offline:'线下模式'}[t]||'关键词触发';}
  function renderBookHome(){var h=renderToolbar();if(state.filter==='category')return h+renderCategoryManager();var list=booksFiltered();h+=renderHero()+renderStats();if(!state.books.length)h+=emptyState('book');else h+=section('世界书列表','',list.length?'<div class="xsj-wb11-list">'+list.map(bookCard).join('')+'</div>':'<div class="xsj-wb11-empty"><div class="xsj-wb11-empty-icon">'+icon('folder')+'</div><div class="xsj-wb11-empty-title">这个筛选下没有内容</div><div class="xsj-wb11-empty-copy">可以切回全部，或新建一个属于当前分类的世界书。</div></div>','');h+='<div class="xsj-wb11-btnrow"><button class="xsj-wb11-btn ghost" onclick="xsjWB11OpenModal(\'category\')">'+icon('folder')+'新建分类</button><button class="xsj-wb11-btn" onclick="xsjWB11OpenModal(\'book\')">'+icon('plus')+'新建世界书</button></div>';return h;}
  function renderCategoryManager(){var body='';if(!state.categories.length)body='<div class="xsj-wb11-empty xsj-wb11-empty-compact"><div class="xsj-wb11-empty-icon">'+icon('folder')+'</div><div class="xsj-wb11-empty-title">还没有分类</div><div class="xsj-wb11-empty-copy">新建分类后，可以在创建世界书时选择对应分类。</div></div>';else body='<div class="xsj-wb11-cat-grid">'+state.categories.map(function(c){var n=state.books.filter(function(b){return b.category===c.id;}).length;return '<div class="xsj-wb11-cat"><div class="xsj-wb11-cat-top"><div class="xsj-wb11-cat-name">'+esc(c.name)+'</div><button class="xsj-wb11-close" onclick="xsjWB11DeleteCategory(\''+c.id+'\')">'+icon('trash')+'</button></div><div class="xsj-wb11-cat-sub">'+n+' 本世界书</div><button class="xsj-wb11-btn plain" onclick="xsjWB11Filter(\'cat:'+c.id+'\')">查看</button></div>';}).join('')+'</div>';return section('分类','',body,'')+'<div class="xsj-wb11-btnrow"><button class="xsj-wb11-btn ghost" onclick="xsjWB11Filter(\'all\')">返回全部</button><button class="xsj-wb11-btn" onclick="xsjWB11OpenModal(\'category\')">'+icon('plus')+'新建分类</button></div>';}
  function renderBookDetail(){var b=currentBook();if(!b){state.selectedBook=null;return renderBookHome();}var cat=state.categories.find(function(c){return c.id===b.category;});var entries=Array.isArray(b.entries)?b.entries:[];var preview='';if(String(b.keywords||'').trim())preview='关键词：'+String(b.keywords).trim();if(!preview&&entries.length){var first=entries.find(function(e){return e&&String(e.content||e.title||e.keywords||'').trim();})||{};preview=String(first.content||first.title||first.keywords||'').trim();}if(!preview)preview='还没有填写世界书内容，可以先添加条目或默认关键词。';if(preview.length>70)preview=preview.slice(0,70)+'...';var h='<div class="xsj-wb23-detail-card"><div class="xsj-wb23-detail-main"><div class="xsj-wb23-detail-mark">'+icon(b.type==='global'?'globe':'user')+'</div><div class="xsj-wb23-detail-text"><div class="xsj-wb23-detail-title-row"><div class="xsj-wb23-detail-title">'+esc(b.name)+'</div><span class="xsj-wb23-status-dot '+(b.active?'on':'off')+'"></span></div><div class="xsj-wb23-detail-meta">'+(b.type==='global'?'全局':'局部')+' · '+esc(cat?cat.name:'未分类')+' · '+triggerText(b.trigger)+' · 深度 '+esc(b.depth)+'</div><div class="xsj-wb23-detail-preview">'+esc(preview)+'</div></div><div class="xsj-wb23-detail-actions"><button class="xsj-wb11-close" onclick="xsjWB11OpenModal(\'book\',\''+b.id+'\')" aria-label="编辑">'+icon('pen')+'</button><button class="xsj-wb11-close" onclick="xsjWB11DeleteBook(\''+b.id+'\')" aria-label="删除">'+icon('trash')+'</button></div></div></div>';if(!entries.length)h+= '<div class="xsj-wb11-empty"><div class="xsj-wb11-empty-icon">'+icon('list')+'</div><div class="xsj-wb11-empty-title">还没有条目</div><div class="xsj-wb11-empty-copy">一个世界书可以有多个条目。条目可以单独设置关键词、触发方式、内容和注入深度。</div></div>';else h+=section('条目','','<div class="xsj-wb11-list">'+entries.map(function(e){return '<div class="xsj-wb11-entry xsj-wb23-entry"><div><div class="xsj-wb11-entry-title">'+esc(e.title)+'</div><div class="xsj-wb11-entry-copy">'+esc(e.content||e.keywords||'暂无内容预览')+'</div>'+depth(e.depth||b.depth)+'</div><div class="xsj-wb11-entry-actions"><div class="xsj-wb11-status">'+triggerText(e.trigger||b.trigger)+'</div><button class="xsj-wb11-close" onclick="xsjWB11DeleteEntry(\''+b.id+'\',\''+e.id+'\')">'+icon('trash')+'</button></div></div>';}).join('')+'</div>','');h+='<div class="xsj-wb11-btnrow"><button class="xsj-wb11-btn ghost" onclick="xsjWB11BackList()">返回列表</button><button class="xsj-wb11-btn" onclick="xsjWB11OpenModal(\'entry\')">'+icon('plus')+'新建条目</button></div>';return h;}
  function renderStyle(){var h='';if(!state.styles.length)return h+emptyState('style');h+=section('文风预设','','<div class="xsj-wb23-style-list">'+state.styles.map(function(s){var n=String(s.narration||'未填写旁白风格').trim();var d=String(s.dialogue||'未填写对话风格').trim();if(n.length>48)n=n.slice(0,48)+'...';if(d.length>48)d=d.slice(0,48)+'...';return '<div class="xsj-wb23-style-card"><div class="xsj-wb23-style-top"><div class="xsj-wb23-style-title-wrap"><div class="xsj-wb23-style-title">'+esc(s.name)+'</div><div class="xsj-wb23-style-meta">线下模式专用 · 旁白 / 对话 / 心声 / 动作</div></div><div class="xsj-wb23-style-actions"><button class="xsj-wb11-close" onclick="xsjWB11OpenModal(\'style\',\''+s.id+'\')" aria-label="编辑">'+icon('pen')+'</button><button class="xsj-wb11-close" onclick="xsjWB11DeleteStyle(\''+s.id+'\')" aria-label="删除">'+icon('trash')+'</button></div></div><div class="xsj-wb23-style-preview"><div><b>旁白</b><span>'+esc(n)+'</span></div><div><b>对话</b><span>'+esc(d)+'</span></div></div></div>';}).join('')+'</div>','');h+='<div class="xsj-wb11-btnrow"><button class="xsj-wb11-btn ghost" onclick="xsjWB11Mode(\'book\')">返回世界书</button><button class="xsj-wb11-btn" onclick="xsjWB11OpenModal(\'style\')">'+icon('plus')+'新建预设</button></div>';return h;}
  function render(){var root=document.getElementById(rootId);if(!root)return;var body=head()+seg();body+=state.mode==='style'?renderStyle():(state.selectedBook?renderBookDetail():renderBookHome());root.innerHTML='<div class="xsj-wb11">'+body+'</div>';saveState();}
  function catOptions(selected){var h='<option value="">未分类</option>';state.categories.forEach(function(c){h+='<option value="'+esc(c.id)+'" '+(selected===c.id?'selected':'')+'>'+esc(c.name)+'</option>';});return h;}
  function modal(title,sub,content,actions){closeModal(false);var mask=document.createElement('div');mask.className='xsj-wb11-modal-mask show';mask.id='xsj-wb11-modal';mask.innerHTML='<div class="xsj-wb11-sheet"><div class="xsj-wb11-sheet-handle"></div><div class="xsj-wb11-sheet-head"><div><div class="xsj-wb11-sheet-title">'+esc(title)+'</div>'+(sub?'<div class="xsj-wb11-sheet-sub">'+esc(sub)+'</div>':'')+'</div><button class="xsj-wb11-close" onclick="xsjWB11CloseModal()">'+icon('close')+'</button></div><div class="xsj-wb11-sheet-body">'+content+'</div>'+(actions||'')+'</div>';mask.addEventListener('click',function(e){if(e.target===mask)closeModal(true);});document.body.appendChild(mask);setTimeout(function(){var first=mask.querySelector('input, textarea, select');if(first&&window.innerWidth>520)first.focus();},80);}
  function closeModal(save){var old=document.getElementById('xsj-wb11-modal');if(old)old.remove();if(save)render();}
  function setChoice(group,val){var hid=document.getElementById('xsj-wb11-'+group);if(hid)hid.value=val;var wrap=document.querySelector('[data-wb11-choice="'+group+'"]');if(wrap){wrap.querySelectorAll('.xsj-wb11-choice').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-val')===val);});}}
  function openBookModal(id){var b=state.books.find(function(x){return x.id===id;})||{name:'',type:'global',category:'',trigger:'keyword',depth:4,keywords:'',active:true};var content='<div class="xsj-wb11-form"><input type="hidden" id="xsj-wb11-book-id" value="'+esc(id||'')+'"><input type="hidden" id="xsj-wb11-type" value="'+esc(b.type)+'"><input type="hidden" id="xsj-wb11-trigger" value="'+esc(b.trigger)+'"><div class="xsj-wb11-field"><div class="xsj-wb11-label">世界书名称</div><input class="xsj-wb11-input" id="xsj-wb11-book-name" placeholder="例如：校园世界 / 同居生活 / 城市日常" value="'+esc(b.name)+'"></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">类型</div><div class="xsj-wb11-choicegrid" data-wb11-choice="type"><button type="button" class="xsj-wb11-choice '+(b.type==='global'?'active':'')+'" data-val="global" onclick="xsjWB11SetChoice(\'type\',\'global\')">'+icon('globe')+'全局世界书</button><button type="button" class="xsj-wb11-choice '+(b.type==='local'?'active':'')+'" data-val="local" onclick="xsjWB11SetChoice(\'type\',\'local\')">'+icon('user')+'局部世界书</button></div></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">分类</div><div class="xsj-wb11-inline-row"><select class="xsj-wb11-select" id="xsj-wb11-book-category">'+catOptions(b.category)+'</select><button class="xsj-wb11-close" type="button" onclick="xsjWB11OpenModal(\'category\')">'+icon('plus')+'</button></div></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">触发方式</div><div class="xsj-wb11-choicegrid" data-wb11-choice="trigger"><button type="button" class="xsj-wb11-choice '+(b.trigger==='keyword'?'active':'')+'" data-val="keyword" onclick="xsjWB11SetChoice(\'trigger\',\'keyword\')">'+icon('trigger')+'关键词</button><button type="button" class="xsj-wb11-choice '+(b.trigger==='always'?'active':'')+'" data-val="always" onclick="xsjWB11SetChoice(\'trigger\',\'always\')">'+icon('layers')+'始终注入</button><button type="button" class="xsj-wb11-choice '+(b.trigger==='scene'?'active':'')+'" data-val="scene" onclick="xsjWB11SetChoice(\'trigger\',\'scene\')">'+icon('folder')+'场景触发</button><button type="button" class="xsj-wb11-choice '+(b.trigger==='offline'?'active':'')+'" data-val="offline" onclick="xsjWB11SetChoice(\'trigger\',\'offline\')">'+icon('lock')+'线下模式</button></div></div><div class="xsj-wb11-range"><div class="xsj-wb11-range-top"><span>注入深度</span><span id="xsj-wb11-depth-num">'+esc(b.depth)+'/6</span></div><input id="xsj-wb11-depth" type="range" min="1" max="6" value="'+esc(b.depth)+'" oninput="document.getElementById(\'xsj-wb11-depth-num\').textContent=this.value+\'/6\'"><div class="xsj-wb11-mini-note">普通聊天建议 2 到 4；线下模式和长篇剧情可以提高到 5 或 6。</div></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">默认关键词</div><input class="xsj-wb11-input" id="xsj-wb11-book-keywords" placeholder="逗号分隔，如：雨天, 回家, 晚安" value="'+esc(b.keywords||'')+'"></div><div class="xsj-wb11-switch"><button class="'+(b.active?'active':'')+'" onclick="xsjWB11SetActive(true);return false;">启用</button><button class="'+(!b.active?'active':'')+'" onclick="xsjWB11SetActive(false);return false;">停用</button></div><input type="hidden" id="xsj-wb11-active" value="'+(b.active?'1':'0')+'"></div>';modal(id?'编辑世界书':'新建世界书','一个世界书可以包含多个条目，保存后可继续进入详情添加条目。',content,'<div class="xsj-wb11-actions"><button class="xsj-wb11-btn ghost" onclick="xsjWB11CloseModal()">取消</button><button class="xsj-wb11-btn" onclick="xsjWB11SaveBook()">保存世界书</button></div>');}
  function openEntryModal(){var b=currentBook();if(!b)return;var content='<div class="xsj-wb11-form"><div class="xsj-wb11-field"><div class="xsj-wb11-label">条目标题</div><input class="xsj-wb11-input" id="xsj-wb11-entry-title" placeholder="例如：便利店门口"></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">触发关键词</div><input class="xsj-wb11-input" id="xsj-wb11-entry-keywords" placeholder="雨天, 便利店, 晚饭"></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">注入内容</div><textarea class="xsj-wb11-textarea" id="xsj-wb11-entry-content" placeholder="填写 AI 需要读取的设定内容。"></textarea></div><div class="xsj-wb11-range"><div class="xsj-wb11-range-top"><span>条目注入深度</span><span id="xsj-wb11-entry-depth-num">'+esc(b.depth||4)+'/6</span></div><input id="xsj-wb11-entry-depth" type="range" min="1" max="6" value="'+esc(b.depth||4)+'" oninput="document.getElementById(\'xsj-wb11-entry-depth-num\').textContent=this.value+\'/6\'"></div></div>';modal('新建条目','条目属于当前世界书，可单独设置关键词和注入深度。',content,'<div class="xsj-wb11-actions"><button class="xsj-wb11-btn ghost" onclick="xsjWB11CloseModal()">取消</button><button class="xsj-wb11-btn" onclick="xsjWB11SaveEntry()">保存条目</button></div>');}
  function openCategoryModal(){var list=state.categories.length?'<div class="xsj-wb11-modal-list-title">已有分类</div><div class="xsj-wb11-list xsj-wb11-modal-list">'+state.categories.map(function(c){return '<div class="xsj-wb11-entry xsj-wb11-category-entry"><div><div class="xsj-wb11-entry-title">'+esc(c.name)+'</div><div class="xsj-wb11-entry-copy">'+state.books.filter(function(b){return b.category===c.id;}).length+' 本世界书正在使用</div></div><button class="xsj-wb11-close" onclick="xsjWB11DeleteCategory(\''+c.id+'\')">'+icon('trash')+'</button></div>';}).join('')+'</div>':'<div class="xsj-wb11-empty xsj-wb11-empty-compact"><div class="xsj-wb11-empty-icon">'+icon('folder')+'</div><div class="xsj-wb11-empty-title">暂无分类</div><div class="xsj-wb11-empty-copy">创建分类后，可在新建世界书时选择。</div></div>';var content='<div class="xsj-wb11-form xsj-wb11-category-form"><div class="xsj-wb11-field"><div class="xsj-wb11-label">分类名称</div><input class="xsj-wb11-input" id="xsj-wb11-cat-name" placeholder="例如：日常 / 城市 / 关系"></div><button class="xsj-wb11-btn" onclick="xsjWB11SaveCategory()">'+icon('plus')+'新增分类</button></div>'+list;modal('分类管理','',content,'<div class="xsj-wb11-actions xsj-wb11-actions-single"><button class="xsj-wb11-btn ghost" onclick="xsjWB11CloseModal()">完成</button></div>');}
  function openStyleModal(id){var s=state.styles.find(function(x){return x.id===id;})||{name:'',narration:'',dialogue:'',inner:'',action:''};var content='<div class="xsj-wb11-form"><input type="hidden" id="xsj-wb11-style-id" value="'+esc(id||'')+'"><div class="xsj-wb11-field"><div class="xsj-wb11-label">预设名称</div><input class="xsj-wb11-input" id="xsj-wb11-style-name" placeholder="例如：日常细腻 / 论坛体 / 疏离克制" value="'+esc(s.name)+'"></div><div class="xsj-wb11-mini-note">文风预设只在线下模式使用，不会默认影响线上聊天。</div><div class="xsj-wb11-field"><div class="xsj-wb11-label">旁白风格</div><textarea class="xsj-wb11-textarea" id="xsj-wb11-style-narration" placeholder="例如：旁白克制、画面感强、少解释。">'+esc(s.narration)+'</textarea></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">对话风格</div><textarea class="xsj-wb11-textarea" id="xsj-wb11-style-dialogue" placeholder="例如：对话短一点，自然，不说教。">'+esc(s.dialogue)+'</textarea></div><div class="xsj-wb11-field"><div class="xsj-wb11-label">心声 / 动作</div><textarea class="xsj-wb11-textarea" id="xsj-wb11-style-inner" placeholder="例如：心声少量出现，动作细节自然。">'+esc(s.inner)+'</textarea></div></div>';modal(id?'编辑文风预设':'新建文风预设','保存后会出现在文风预设列表中，供线下模式读取。',content,'<div class="xsj-wb11-actions"><button class="xsj-wb11-btn ghost" onclick="xsjWB11CloseModal()">取消</button><button class="xsj-wb11-btn" onclick="xsjWB11SaveStyle()">保存预设</button></div>');}
  function openSearchModal(){var content='<div class="xsj-wb11-form"><input class="xsj-wb11-input" id="xsj-wb11-search-input" placeholder="搜索世界书、条目、分类、文风预设" oninput="xsjWB11Search(this.value)"><div id="xsj-wb11-search-results" class="xsj-wb11-list"></div></div>';modal('搜索','仅搜索当前已创建的世界书、条目、分类和文风预设。',content,'<div class="xsj-wb11-actions"><button class="xsj-wb11-btn ghost" onclick="xsjWB11CloseModal()">关闭</button><button class="xsj-wb11-btn" onclick="xsjWB11SearchFromInput()">搜索</button></div>');setTimeout(function(){xsjWB11Search('');},0);}
  window.xsjWB11Search=function(q){q=String(q||'').toLowerCase();var out=[];state.books.forEach(function(b){if(!q||b.name.toLowerCase().indexOf(q)>-1)out.push('<div class="xsj-wb11-entry"><div><div class="xsj-wb11-entry-title">'+esc(b.name)+'</div><div class="xsj-wb11-entry-copy">世界书 · '+triggerText(b.trigger)+'</div></div><button class="xsj-wb11-entry-go" aria-label="打开世界书" onclick="xsjWB11CloseModal();xsjWB11OpenBook(\''+b.id+'\')">'+icon('arrow')+'</button></div>');(b.entries||[]).forEach(function(e){if(q&&(e.title+e.keywords+e.content).toLowerCase().indexOf(q)>-1)out.push('<div class="xsj-wb11-entry"><div><div class="xsj-wb11-entry-title">'+esc(e.title)+'</div><div class="xsj-wb11-entry-copy">条目 · '+esc(b.name)+'</div></div></div>');});});state.categories.forEach(function(c){if(!q||c.name.toLowerCase().indexOf(q)>-1)out.push('<div class="xsj-wb11-entry"><div><div class="xsj-wb11-entry-title">'+esc(c.name)+'</div><div class="xsj-wb11-entry-copy">分类</div></div></div>');});state.styles.forEach(function(s){if(!q||s.name.toLowerCase().indexOf(q)>-1)out.push('<div class="xsj-wb11-entry"><div><div class="xsj-wb11-entry-title">'+esc(s.name)+'</div><div class="xsj-wb11-entry-copy">文风预设 · 线下模式</div></div></div>');});var el=document.getElementById('xsj-wb11-search-results');if(el)el.innerHTML=out.length?out.join(''):'<div class="xsj-wb11-mini-note">没有找到内容。</div>';};
  window.xsjWB11SearchFromInput=function(){var el=document.getElementById('xsj-wb11-search-input');window.xsjWB11Search(el?el.value:'');};
  window.xsjWB11QuickNew=function(){state.mode==='style'?openStyleModal():openBookModal();};
  window.xsjWB11Mode=function(m){state.mode=m;state.selectedBook=null;state.filter='all';render();};
  window.xsjWB11Filter=function(f){state.filter=f;state.selectedBook=null;render();};
  window.xsjWB11OpenBook=function(id){state.mode='book';state.selectedBook=id;render();};
  window.xsjWB11BackList=function(){state.selectedBook=null;render();};
  window.xsjWB11OpenModal=function(type,id){if(type==='book')return openBookModal(id);if(type==='entry')return openEntryModal();if(type==='category')return openCategoryModal();if(type==='style')return openStyleModal(id);if(type==='search')return openSearchModal();};
  window.xsjWB11CloseModal=function(){closeModal(true);};
  window.xsjWB11SetChoice=setChoice;
  window.xsjWB11SetActive=function(v){var el=document.getElementById('xsj-wb11-active');if(el)el.value=v?'1':'0';var sw=document.querySelector('.xsj-wb11-switch');if(sw){sw.querySelectorAll('button').forEach(function(b,i){b.classList.toggle('active',v?i===0:i===1);});}};
  window.xsjWB11SaveCategory=function(){var name=val('xsj-wb11-cat-name');if(!name)return;state.categories.push({id:uid('cat'),name:name});saveState();openCategoryModal();};
  window.xsjWB11DeleteCategory=function(id){state.categories=state.categories.filter(function(c){return c.id!==id;});state.books.forEach(function(b){if(b.category===id)b.category='';});saveState();var modalOpen=document.getElementById('xsj-wb11-modal');if(modalOpen)openCategoryModal();else render();};
  window.xsjWB11SaveBook=function(){var id=val('xsj-wb11-book-id')||uid('book');var existing=state.books.find(function(b){return b.id===id;});var item=existing||{id:id,entries:[]};item.name=val('xsj-wb11-book-name')||'未命名世界书';item.type=val('xsj-wb11-type')||'global';item.category=val('xsj-wb11-book-category');item.trigger=val('xsj-wb11-trigger')||'keyword';item.depth=Number(val('xsj-wb11-depth')||4);item.keywords=val('xsj-wb11-book-keywords');item.active=val('xsj-wb11-active')!=='0';if(!existing)state.books.unshift(item);state.selectedBook=item.id;closeModal(false);render();};
  window.xsjWB11DeleteBook=function(id){state.books=state.books.filter(function(b){return b.id!==id;});if(state.selectedBook===id)state.selectedBook=null;render();};
  window.xsjWB11SaveEntry=function(){var b=currentBook();if(!b)return;var entry={id:uid('entry'),title:val('xsj-wb11-entry-title')||'未命名条目',keywords:val('xsj-wb11-entry-keywords'),content:val('xsj-wb11-entry-content'),trigger:b.trigger,depth:Number(val('xsj-wb11-entry-depth')||b.depth||4)};b.entries=b.entries||[];b.entries.unshift(entry);closeModal(false);render();};
  window.xsjWB11DeleteEntry=function(bookId,entryId){var b=state.books.find(function(x){return x.id===bookId;});if(b){b.entries=(b.entries||[]).filter(function(e){return e.id!==entryId;});render();}};
  window.xsjWB11SaveStyle=function(){var id=val('xsj-wb11-style-id')||uid('style');var existing=state.styles.find(function(s){return s.id===id;});var item=existing||{id:id};item.name=val('xsj-wb11-style-name')||'未命名文风';item.narration=val('xsj-wb11-style-narration');item.dialogue=val('xsj-wb11-style-dialogue');item.inner=val('xsj-wb11-style-inner');item.action=val('xsj-wb11-style-action');if(!existing)state.styles.unshift(item);state.mode='style';closeModal(false);render();};
  window.xsjWB11DeleteStyle=function(id){state.styles=state.styles.filter(function(s){return s.id!==id;});render();};
  var prevNav=window.xsjV7Nav;
  window.xsjV7Nav=function(app,view){if(app==='worldbook'){state.mode=view==='style'?'style':'book';state.selectedBook=null;render();return;}return typeof prevNav==='function'?prevNav(app,view):undefined;};
  var prevWB10Mode=window.xsjWB10Mode;
  window.xsjWB10Mode=function(tab){state.mode=tab==='style'?'style':'book';state.selectedBook=null;render();if(typeof prevWB10Mode==='function'&&false)prevWB10Mode(tab);};
  function boot(){setTimeout(function(){if(document.getElementById(rootId))render();},0);}
  document.addEventListener('DOMContentLoaded',boot);
  if(document.readyState!=='loading')boot();
})();


// ══ xsj-wb11-modal-clarity-script ══

(function(){
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function markField(el,label){if(el&&!el.getAttribute('data-step'))el.setAttribute('data-step',label);}
  function organize(){
    var modal=document.getElementById('xsj-wb11-modal');
    if(!modal)return;
    var sheet=q('.xsj-wb11-sheet',modal);
    if(!sheet)return;
    var isBook=!!q('#xsj-wb11-book-name',modal);
    var isStyle=!!q('#xsj-wb11-style-name',modal);
    if(!isBook&&!isStyle)return;
    sheet.classList.add('xsj-wb11-sheet-organized');
    if(isBook){
      var name=q('#xsj-wb11-book-name',modal);
      var type=q('[data-wb11-choice="type"]',modal);
      var cat=q('#xsj-wb11-book-category',modal);
      var trigger=q('[data-wb11-choice="trigger"]',modal);
      var depth=q('#xsj-wb11-depth',modal);
      var keywords=q('#xsj-wb11-book-keywords',modal);
      var active=q('#xsj-wb11-active',modal);
      markField(name&&name.closest('.xsj-wb11-field'),'01 \u57fa\u672c\u4fe1\u606f');
      markField(type&&type.closest('.xsj-wb11-field'),'02 \u4f7f\u7528\u8303\u56f4');
      markField(cat&&cat.closest('.xsj-wb11-field'),'03 \u5206\u7c7b\u5f52\u6863');
      markField(trigger&&trigger.closest('.xsj-wb11-field'),'04 \u89e6\u53d1\u65b9\u5f0f');
      markField(depth&&depth.closest('.xsj-wb11-range'),'05 \u6ce8\u5165\u6df1\u5ea6');
      markField(keywords&&keywords.closest('.xsj-wb11-field'),'06 \u9ed8\u8ba4\u5173\u952e\u8bcd');
      markField(active&&active.previousElementSibling,'07 \u542f\u7528\u72b6\u6001');
    }
    if(isStyle){
      var sName=q('#xsj-wb11-style-name',modal);
      var note=q('.xsj-wb11-mini-note',modal);
      var narration=q('#xsj-wb11-style-narration',modal);
      var dialogue=q('#xsj-wb11-style-dialogue',modal);
      var inner=q('#xsj-wb11-style-inner',modal);
      markField(sName&&sName.closest('.xsj-wb11-field'),'01 \u9884\u8bbe\u540d\u79f0');
      markField(note,'02 \u4f7f\u7528\u8bf4\u660e');
      markField(narration&&narration.closest('.xsj-wb11-field'),'03 \u65c1\u767d\u98ce\u683c');
      markField(dialogue&&dialogue.closest('.xsj-wb11-field'),'04 \u5bf9\u8bdd\u98ce\u683c');
      markField(inner&&inner.closest('.xsj-wb11-field'),'05 \u5fc3\u58f0\u548c\u52a8\u4f5c');
    }
    qa('.xsj-wb11-choice',modal).forEach(function(btn){btn.setAttribute('type','button');});
  }
  var mo=new MutationObserver(function(){setTimeout(organize,0);});
  mo.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(organize,0);},true);
  setTimeout(organize,0);
})();


// ══ xsj-wb11-delete-confirm-v21 ══

(function(){
  var bypassDepth=0;
  function trashIcon(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6M14 11v6"/></svg>';
  }
  function closeConfirm(){
    var old=document.getElementById('xsj-delete-confirm-mask');
    if(old)old.remove();
  }
  window.xsjRunAfterDeleteConfirm=function(fn){
    bypassDepth++;
    try{if(typeof fn==='function')fn();}
    finally{bypassDepth=Math.max(0,bypassDepth-1);}
  };
  window.xsjShowDeleteConfirm=function(opts,onConfirm){
    closeConfirm();
    opts=opts||{};
    var mask=document.createElement('div');
    mask.id='xsj-delete-confirm-mask';
    mask.className='xsj-delete-confirm-mask';
    mask.innerHTML='<div class="xsj-delete-confirm-box" role="dialog" aria-modal="true">'
      +'<div class="xsj-delete-confirm-icon">'+trashIcon()+'</div>'
      +'<div class="xsj-delete-confirm-title">'+(opts.title||'确认删除')+'</div>'
      +'<div class="xsj-delete-confirm-copy">'+(opts.copy||'删除后无法恢复，为了避免误删，请再次确认。')+'</div>'
      +'<div class="xsj-delete-confirm-actions">'
      +'<button class="xsj-delete-confirm-btn cancel" type="button">取消</button>'
      +'<button class="xsj-delete-confirm-btn confirm" type="button">确认删除</button>'
      +'</div></div>';
    mask.addEventListener('click',function(e){if(e.target===mask)closeConfirm();});
    document.body.appendChild(mask);
    var cancel=mask.querySelector('.xsj-delete-confirm-btn.cancel');
    var confirm=mask.querySelector('.xsj-delete-confirm-btn.confirm');
    if(cancel)cancel.addEventListener('click',closeConfirm);
    if(confirm)confirm.addEventListener('click',function(){
      closeConfirm();
      window.xsjRunAfterDeleteConfirm(function(){if(typeof onConfirm==='function')onConfirm();});
    });
  };
  function wrapDelete(name,title,copy){
    var fn=window[name];
    if(typeof fn!=='function'||fn._xsjDeleteConfirmWrapped)return;
    var original=fn;
    var wrapped=function(){
      var args=Array.prototype.slice.call(arguments);
      if(bypassDepth>0)return original.apply(window,args);
      window.xsjShowDeleteConfirm({title:title,copy:copy},function(){original.apply(window,args);});
    };
    wrapped._xsjDeleteConfirmWrapped=true;
    wrapped._xsjOriginalDelete=original;
    window[name]=wrapped;
  }
  function wrapConvSingle(){
    if(typeof window.convDeleteMessageBubble!=='function'||window.convDeleteMessageBubble._xsjDeleteConfirmWrapped)return;
    var original=window.convDeleteMessageBubble;
    var wrapped=function(){
      var args=Array.prototype.slice.call(arguments);
      if(bypassDepth>0)return original.apply(window,args);
      window.xsjShowDeleteConfirm({title:'删除消息',copy:'这条消息删除后无法恢复，请确认是否继续。'},function(){original.apply(window,args);});
    };
    wrapped._xsjDeleteConfirmWrapped=true;
    wrapped._xsjOriginalDelete=original;
    window.convDeleteMessageBubble=wrapped;
    try{convDeleteMessageBubble=wrapped;}catch(e){}
  }
  function wrapMulti(){
    if(typeof window.convMultiAction!=='function'||window.convMultiAction._xsjDeleteConfirmWrapped)return;
    var convOriginal=window.convMultiAction;
    window.convMultiAction=function(type){
      var args=Array.prototype.slice.call(arguments);
      if(type==='delete'&&bypassDepth===0){
        return window.xsjShowDeleteConfirm({title:'删除消息',copy:'选中的消息删除后无法恢复，请确认是否继续。'},function(){convOriginal.apply(window,args);});
      }
      return convOriginal.apply(window,args);
    };
    window.convMultiAction._xsjDeleteConfirmWrapped=true;
  }
  function wrapAll(){
    wrapDelete('xsjWB11DeleteCategory','删除分类','分类删除后不会删除世界书，相关世界书会移动到未分类。');
    wrapDelete('xsjWB11DeleteBook','删除世界书','这个世界书和它下面的条目会一起删除，删除后无法恢复。');
    wrapDelete('xsjWB11DeleteEntry','删除条目','这个条目会从当前世界书里移除，删除后无法恢复。');
    wrapDelete('xsjWB11DeleteStyle','删除文风预设','这个文风预设会从线下模式预设列表里移除。');
    wrapConvSingle();
    wrapMulti();
  }
  wrapAll();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrapAll);
  setTimeout(wrapAll,120);
  setTimeout(wrapAll,600);
})();


// ══ xsj-wb26-force-modal-accent-script ══

(function(){
  var ACCENT = '#555555';
  function forceModalAccent(){
    var modal = document.getElementById('xsj-wb11-modal');
    if(!modal) return;
    var active = modal.querySelectorAll('.xsj-wb11-choice.active,.xsj-wb11-switch button.active,.xsj-wb11-btn:not(.ghost):not(.plain):not(.danger)');
    active.forEach(function(el){
      el.style.setProperty('background', ACCENT, 'important');
      el.style.setProperty('background-color', ACCENT, 'important');
      el.style.setProperty('color', '#ffffff', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
      el.querySelectorAll('svg').forEach(function(svg){
        svg.style.setProperty('color', '#ffffff', 'important');
        svg.style.setProperty('stroke', '#ffffff', 'important');
      });
    });
    var inactive = modal.querySelectorAll('.xsj-wb11-choice:not(.active),.xsj-wb11-switch button:not(.active)');
    inactive.forEach(function(el){
      el.style.removeProperty('background');
      el.style.removeProperty('background-color');
      el.style.removeProperty('color');
      el.style.removeProperty('box-shadow');
    });
    modal.querySelectorAll('input[type="range"]').forEach(function(el){
      el.style.setProperty('accent-color', ACCENT, 'important');
    });
  }
  ['click','input','change'].forEach(function(evt){
    document.addEventListener(evt,function(e){
      if(e.target && e.target.closest && e.target.closest('#xsj-wb11-modal')){
        setTimeout(forceModalAccent,0);
      }
    },true);
  });
  var obs = new MutationObserver(function(){setTimeout(forceModalAccent,0);});
  obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  window.xsjWB26ForceModalAccent = forceModalAccent;
  setTimeout(forceModalAccent,0);
})();
