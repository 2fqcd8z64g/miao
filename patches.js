// ══ patch ══

/* ── Step 10: image message cleanup + chat image compression ── */
(function(){
  function s10EnsureState(){
    if(window.CONV_STATE && !Array.isArray(CONV_STATE.imageDraft)) CONV_STATE.imageDraft=[];
  }
  function s10ReadAsDataURL(file){
    return new Promise(function(resolve){
      const reader=new FileReader();
      reader.onload=function(e){resolve(e.target.result||'');};
      reader.onerror=function(){resolve('');};
      reader.readAsDataURL(file);
    });
  }
  function s10DataUrlBytes(dataUrl){
    try{
      const base=String(dataUrl||'').split(',')[1]||'';
      return Math.round(base.length*3/4);
    }catch(e){return 0;}
  }
  function s10HasAlpha(ctx,w,h){
    try{
      const data=ctx.getImageData(0,0,w,h).data;
      for(let i=3;i<data.length;i+=16){
        if(data[i] < 250) return true;
      }
    }catch(e){return false;}
    return false;
  }
  function s10CompressOne(file){
    return new Promise(function(resolve){
      if(!file || !/^image\//.test(file.type||'')){resolve(null);return;}
      const name=file.name||'image';
      const type=(file.type||'').toLowerCase();
      const isSvg=type.indexOf('svg')>-1 || /\.svg$/i.test(name);
      const isGif=type.indexOf('gif')>-1 || /\.gif$/i.test(name);
      // SVG/GIF：保持原文件，避免破坏透明和动图；其他位图进入压缩。
      if(isSvg || isGif){
        s10ReadAsDataURL(file).then(function(src){
          if(!src){resolve(null);return;}
          resolve({name:name,src:src,transparent:true,compressed:isSvg?false:false,originalBytes:file.size||0,compressedBytes:s10DataUrlBytes(src)});
        });
        return;
      }
      const reader=new FileReader();
      reader.onerror=function(){resolve(null);};
      reader.onload=function(e){
        const original=e.target.result||'';
        const img=new Image();
        img.onerror=function(){
          resolve({name:name,src:original,transparent:/png|webp/i.test(type)||/\.(png|webp)$/i.test(name),compressed:false,originalBytes:file.size||0,compressedBytes:s10DataUrlBytes(original)});
        };
        img.onload=function(){
          try{
            const maxSide=1500;
            const largest=Math.max(img.width||1,img.height||1);
            const scale=Math.min(1,maxSide/largest);
            const w=Math.max(1,Math.round((img.width||1)*scale));
            const h=Math.max(1,Math.round((img.height||1)*scale));
            const canvas=document.createElement('canvas');
            canvas.width=w;canvas.height=h;
            const ctx=canvas.getContext('2d',{willReadFrequently:true});
            ctx.clearRect(0,0,w,h);
            ctx.drawImage(img,0,0,w,h);
            const transparent=s10HasAlpha(ctx,w,h);
            let outType=transparent?'image/png':'image/jpeg';
            let data=canvas.toDataURL(outType,transparent?undefined:0.78);
            // 无透明图压到 JPEG 后若比原图还大，就保留原图；透明图必须保留 alpha。
            const originalBytes=file.size||s10DataUrlBytes(original);
            const compressedBytes=s10DataUrlBytes(data);
            if(!transparent && originalBytes && compressedBytes>originalBytes){
              data=original;
            }
            resolve({
              name:name,
              src:data,
              transparent:transparent,
              compressed:data!==original,
              originalBytes:originalBytes,
              compressedBytes:s10DataUrlBytes(data)
            });
          }catch(err){
            resolve({name:name,src:original,transparent:/png|webp/i.test(type)||/\.(png|webp)$/i.test(name),compressed:false,originalBytes:file.size||0,compressedBytes:s10DataUrlBytes(original)});
          }
        };
        img.src=original;
      };
      reader.readAsDataURL(file);
    });
  }
  function s10ImageCellHTML(img){
    const transparentClass=img&&img.transparent?' is-transparent':'';
    const name=escHtml((img&&img.name)||'image');
    return '<div class="conv-image-cell'+transparentClass+'"><img src="'+((img&&img.src)||'')+'" alt="'+name+'" loading="lazy" decoding="async"></div>';
  }
  function s10ImageBubbleHTML(list){
    const safe=(list||[]).slice(0,4);
    const n=safe.length||1;
    const cells=safe.map(s10ImageCellHTML).join('');
    return '<div class="conv-bubble sent-single conv-media-bubble conv-image-bubble" data-msg-text="[图片 '+n+'张]" data-msg-side="sent" data-msg-type="image"><div class="conv-image-grid n'+n+'">'+cells+'</div></div>';
  }
  function s10TextBubbleHTML(text){
    const t=escHtml(String(text||'').trim());
    return '<div class="conv-bubble sent-single" data-msg-text="'+t+'" data-msg-side="sent"><div class="conv-bubble-main">'+t.replace(/\n/g,'<br>')+'</div></div>';
  }
  function s10MyAvatarHTML(){
    const myAvatar=(typeof XSJ!=='undefined'&&XSJ.get)?XSJ.get(XSJ.AVATAR,''):'';
    return myAvatar?'<img src="'+escHtml(myAvatar)+'" alt="">':'我';
  }
  function s10CreateSentGroup(bubblesHTML,isImage){
    const body=document.getElementById('conv-body');
    if(!body)return null;
    const group=document.createElement('div');
    group.className='conv-group sent'+(isImage?' conv-image-group':'');
    group.innerHTML='<div class="conv-group-av" style="background:#2C2C2E;color:#fff;">'+s10MyAvatarHTML()+'</div><div class="conv-group-bubbles">'+bubblesHTML+'</div>';
    body.appendChild(group);
    if(typeof convNormalizeBubbleCorners==='function')convNormalizeBubbleCorners(group);
    if(typeof convAttachMessageActions==='function')convAttachMessageActions();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
    body.scrollTop=body.scrollHeight;
    return group;
  }
  function s10NormalizeImageGroups(){
    document.querySelectorAll('#conv-overlay .conv-group').forEach(function(group){
      group.classList.toggle('conv-image-group',!!group.querySelector('.conv-image-bubble'));
    });
  }

  const oldSetImageDraft=window.convSetImageDraft;
  window.convSetImageDraft=function(list){
    s10EnsureState();
    if(typeof oldSetImageDraft==='function') oldSetImageDraft(list);
    else { CONV_STATE.imageDraft=(list||[]).slice(0,4); if(typeof convRenderImageDraft==='function')convRenderImageDraft(); }
  };

  window.convSendImageMessages=function(files){
    s10EnsureState();
    files=[].slice.call(files||[]).filter(function(f){return /^image\//.test(f.type||'');}).slice(0,4);
    if(!files.length)return;
    const tooLarge=files.find(function(f){return f.size>25*1024*1024;});
    if(tooLarge){showToast('图片过大，请选择 25MB 以内的图片');return;}
    showToast('正在处理图片');
    Promise.all(files.map(s10CompressOne)).then(function(list){
      list=list.filter(Boolean).slice(0,4);
      if(!list.length){showToast('图片读取失败');return;}
      convSetImageDraft(list);
      const inp=document.getElementById('conv-input-field');
      if(inp){inp.placeholder='add a caption...';inp.focus();}
      const compressed=list.some(function(x){return x.compressed;});
      showToast(compressed?'图片已压缩并放入预览':'图片已放入预览');
      s10NormalizeImageGroups();
    });
  };

  const oldSendMessage=window.convSendMessage;
  window.convSendMessage=function(){
    s10EnsureState();
    const draft=(CONV_STATE&&CONV_STATE.imageDraft)||[];
    const inp=document.getElementById('conv-input-field');
    const caption=inp?(inp.value||'').trim():'';
    if(draft.length && !(CONV_STATE.edit&&CONV_STATE.edit.bubble)){
      // 图片只显示图片本身；文字说明如果有，作为独立文字气泡，不再贴成图片灰色底部。
      const html=s10ImageBubbleHTML(draft)+(caption?s10TextBubbleHTML(caption):'');
      s10CreateSentGroup(html,true);
      CONV_STATE.imageDraft=[];
      CONV_STATE.quote=null;
      if(inp){inp.value='';inp.placeholder='say something...';}
      if(typeof convRenderImageDraft==='function')convRenderImageDraft();
      if(typeof convRenderComposerState==='function')convRenderComposerState();
      if(typeof convInputChanged==='function')convInputChanged();
      if(CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
      showToast(draft.length>1?'已发送 '+draft.length+' 张图片':'已发送图片');
      s10NormalizeImageGroups();
      return;
    }
    if(typeof oldSendMessage==='function')oldSendMessage();
    setTimeout(s10NormalizeImageGroups,0);
  };

  const oldChatShowMsg=window.chatShowMsg;
  if(typeof oldChatShowMsg==='function'){
    window.chatShowMsg=function(name){
      oldChatShowMsg(name);
      setTimeout(s10NormalizeImageGroups,0);
    };
  }
  setTimeout(s10NormalizeImageGroups,0);
})();


// ══ patch ══

/* ── Step 11: voice transcript UI normalization + reliable multi-select ── */
(function(){
  function s11TranscriptIcon(open){
    if(open){
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M8 8l4 4-4 4"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h5"/><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>';
  }
  function s11NormalizeVoiceUI(root){
    (root||document).querySelectorAll('.conv-voice-bubble').forEach(function(bubble){
      const btn=bubble.querySelector('.conv-voice-transcribe-btn');
      if(btn){
        const open=bubble.classList.contains('transcribed');
        btn.innerHTML=s11TranscriptIcon(open);
        btn.setAttribute('title',open?'收起文字':'转文字');
        btn.setAttribute('aria-label',open?'收起文字':'转文字');
      }
      const src=bubble.querySelector('.conv-voice-source');
      if(src)src.textContent='';
    });
  }
  window.convToggleVoiceTranscript=function(e,btn){
    if(e){e.preventDefault();e.stopPropagation();}
    const bubble=btn&&btn.closest?btn.closest('.conv-voice-bubble'):null;
    if(!bubble)return;
    bubble.classList.toggle('transcribed');
    s11NormalizeVoiceUI(bubble);
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
  };

  const oldSubmitVoice=window.convSubmitVoiceComposer;
  if(typeof oldSubmitVoice==='function'){
    window.convSubmitVoiceComposer=function(){
      oldSubmitVoice();
      setTimeout(function(){s11NormalizeVoiceUI(document);},0);
    };
  }
  const oldOpenVoice=window.convOpenVoiceComposer;
  if(typeof oldOpenVoice==='function'){
    window.convOpenVoiceComposer=function(side,options){
      oldOpenVoice(side,options);
      setTimeout(function(){
        const title=document.querySelector('.conv-voice-sheet-title');
        const note=document.querySelector('.conv-voice-sheet-note');
        const meta=document.querySelector('.conv-voice-sheet-meta span:first-child');
        if(title && title.textContent==='语音消息')title.textContent='发送语音';
        if(note)note.textContent='无声语音气泡，可展开文字';
        if(meta)meta.textContent='输入内容会作为语音转文字保存，后续可接入 MiniMax 生成真实声音。';
      },0);
    };
  }

  function s11EnsureMultiState(){
    if(!window.CONV_STATE)return;
    if(!CONV_STATE.selectedBubbles)CONV_STATE.selectedBubbles=new Set();
  }
  function s11SelectedItems(){
    s11EnsureMultiState();
    const dom=[].slice.call(document.querySelectorAll('#conv-overlay .conv-bubble.conv-selected')).filter(function(b){return b&&b.isConnected;});
    if(window.CONV_STATE)CONV_STATE.selectedBubbles=new Set(dom);
    return dom;
  }
  function s11SideLabel(bubble){
    const group=bubble&&bubble.closest?bubble.closest('.conv-group'):null;
    return group&&group.classList.contains('sent')?'我':((window.CONV_STATE&&CONV_STATE.activeName)||'对方');
  }
  function s11TextOfBubble(bubble){
    if(!bubble)return'';
    const type=(bubble.dataset&&bubble.dataset.msgType)||'';
    if(type==='voice'){
      return (bubble.dataset.msgTranscript||bubble.dataset.msgText||'[语音]').trim() || '[语音]';
    }
    if(type==='image'){
      return (bubble.dataset.msgText&&bubble.dataset.msgText.indexOf('[图片')>-1)?bubble.dataset.msgText:'[图片]';
    }
    if(typeof convGetBubbleMainText==='function'){
      const text=convGetBubbleMainText(bubble);
      if(text)return text;
    }
    return (bubble.innerText||bubble.textContent||'').trim();
  }
  function s11Transcript(items){
    return (items||[]).map(function(b){return s11SideLabel(b)+'：'+s11TextOfBubble(b);}).join('\n');
  }
  function s11CopyText(text,ok){
    text=String(text||'');
    function fallback(){
      const ta=document.createElement('textarea');
      ta.value=text;
      ta.setAttribute('readonly','');
      ta.style.position='fixed';
      ta.style.left='-9999px';
      document.body.appendChild(ta);
      ta.select();
      let done=false;
      try{done=document.execCommand('copy');}catch(e){done=false;}
      ta.remove();
      if(done){showToast(ok||'已复制');}else{showToast('复制失败，请手动复制');}
    }
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(text).then(function(){showToast(ok||'已复制');}).catch(fallback);
    }else fallback();
  }
  function s11SaveFavorite(text,count){
    try{
      const key='XSJ_CHAT_FAVORITES';
      const arr=JSON.parse(localStorage.getItem(key)||'[]');
      arr.unshift({time:Date.now(),chat:(window.CONV_STATE&&CONV_STATE.activeName)||'',count:count,text:text});
      localStorage.setItem(key,JSON.stringify(arr.slice(0,80)));
      showToast('已收藏 '+count+' 条');
    }catch(e){
      showToast('已收藏 '+count+' 条');
    }
  }
  function s11RefreshMultiUI(){
    s11EnsureMultiState();
    const items=s11SelectedItems();
    const count=items.length;
    const pill=document.getElementById('conv-multi-count-pill');
    if(pill)pill.textContent=count?'已选择 '+count+' 条':'选择消息';
    const nameEl=document.querySelector('#conv-overlay .conv-nav-name');
    if(nameEl&&window.CONV_STATE&&CONV_STATE.multiSelect){
      if(!nameEl.dataset.originalText)nameEl.dataset.originalText=nameEl.textContent||CONV_STATE.activeName||'';
      nameEl.textContent=count?'已选择 '+count+' 条':'选择消息';
    }
    document.querySelectorAll('#conv-multi-bar .conv-multi-btn').forEach(function(btn){
      btn.disabled=!count;
      btn.classList.toggle('is-ready',!!count);
      btn.style.opacity=count?'1':'.34';
      btn.style.pointerEvents=count?'auto':'none';
    });
  }
  const oldToggleSelect=window.convToggleSelectBubble;
  if(typeof oldToggleSelect==='function'){
    window.convToggleSelectBubble=function(bubble,force){
      oldToggleSelect(bubble,force);
      setTimeout(s11RefreshMultiUI,0);
    };
  }
  const oldEnterMulti=window.convEnterMultiSelect;
  if(typeof oldEnterMulti==='function'){
    window.convEnterMultiSelect=function(bubble){
      oldEnterMulti(bubble);
      setTimeout(s11RefreshMultiUI,0);
    };
  }
  const oldExitMulti=window.convExitMultiSelect;
  if(typeof oldExitMulti==='function'){
    window.convExitMultiSelect=function(){
      oldExitMulti();
      setTimeout(s11RefreshMultiUI,0);
    };
  }
  window.convUpdateMultiUI=s11RefreshMultiUI;
  window.convMultiAction=function(type){
    const items=s11SelectedItems();
    const count=items.length;
    if(!count){showToast('请选择消息');return;}
    const text=s11Transcript(items);
    if(type==='copy'){
      s11CopyText(text,'已复制 '+count+' 条聊天');
      convExitMultiSelect();
      return;
    }
    if(type==='save'){
      s11SaveFavorite(text,count);
      convExitMultiSelect();
      return;
    }
    if(type==='forward'){
      if(window.CONV_STATE){
        CONV_STATE.quote={text:text,author:'聊天记录',side:'multi'};
      }
      convExitMultiSelect();
      if(typeof convRenderComposerState==='function')convRenderComposerState();
      if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
      const inp=document.getElementById('conv-input-field');
      if(inp){inp.placeholder='添加一句话再发送...';inp.focus();}
      showToast('已放入引用栏');
      return;
    }
    if(type==='delete'){
      items.forEach(function(b){if(b&&b.isConnected&&typeof convDeleteMessageBubble==='function')convDeleteMessageBubble(b);});
      convExitMultiSelect();
      if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
      showToast('已删除 '+count+' 条');
      return;
    }
  };

  const oldChatShow=window.chatShowMsg;
  if(typeof oldChatShow==='function'){
    window.chatShowMsg=function(name){
      oldChatShow(name);
      setTimeout(function(){s11NormalizeVoiceUI(document);s11RefreshMultiUI();},0);
    };
  }
  setTimeout(function(){s11NormalizeVoiceUI(document);s11RefreshMultiUI();},0);
})();


// ══ patch ══

/* ── Step 12: single source of truth for multi-select + smaller image display ── */
(function(){
  function ensureState(){
    if(!window.CONV_STATE)window.CONV_STATE={};
    if(!CONV_STATE.selectedBubbles)CONV_STATE.selectedBubbles=new Set();
  }
  function ensureMultiBar(){
    const ov=document.getElementById('conv-overlay');
    if(!ov)return;
    if(!document.getElementById('conv-multi-count-pill')){
      ov.insertAdjacentHTML('beforeend','<div id="conv-multi-count-pill" class="conv-multi-count-pill">选择消息</div>');
    }
    if(!document.getElementById('conv-multi-bar')){
      ov.insertAdjacentHTML('beforeend',`<div id="conv-multi-bar" class="conv-multi-bar" aria-label="多选消息操作栏">
        <button class="conv-multi-btn" type="button" onclick="convMultiAction('copy')" aria-label="复制">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"/></svg><span>复制</span>
        </button>
        <button class="conv-multi-btn" type="button" onclick="convMultiAction('forward')" aria-label="转发">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l7 7-7 7"/><path d="M21 12H8a5 5 0 00-5 5v2"/></svg><span>转发</span>
        </button>
        <button class="conv-multi-btn" type="button" onclick="convMultiAction('save')" aria-label="收藏">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg><span>收藏</span>
        </button>
        <button class="conv-multi-btn danger" type="button" onclick="convMultiAction('delete')" aria-label="删除">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6M14 11v6"/></svg><span>删除</span>
        </button>
      </div>`);
    }
  }
  function selectableFromTarget(target){
    if(!target||!target.closest)return null;
    if(target.closest('#conv-multi-bar,#conv-multi-count-pill,.conv-input-wrap,.conv-msg-menu,.conv-plus-panel,.conv-image-preview,.conv-voice-sheet'))return null;
    const bubble=target.closest('#conv-overlay .conv-bubble, #conv-overlay .conv-media-bubble, #conv-overlay .conv-voice-bubble');
    if(!bubble)return null;
    if(!document.getElementById('conv-body') || !document.getElementById('conv-body').contains(bubble))return null;
    return bubble;
  }
  function getSelected(){
    const nodes=[].slice.call(document.querySelectorAll('#conv-overlay .conv-bubble.conv-selected, #conv-overlay .conv-media-bubble.conv-selected, #conv-overlay .conv-voice-bubble.conv-selected')).filter(function(b){return b&&b.isConnected;});
    const seen=new Set();
    const unique=[];
    nodes.forEach(function(b){if(!seen.has(b)){seen.add(b);unique.push(b);}});
    if(window.CONV_STATE)CONV_STATE.selectedBubbles=new Set(unique);
    return unique;
  }
  function setBubbleSelected(bubble,selected){
    if(!bubble)return;
    bubble.classList.toggle('conv-selected',!!selected);
    ensureState();
    const items=getSelected();
    CONV_STATE.selectedBubbles=new Set(items);
    updateUI();
  }
  window.convToggleSelectBubble=function(bubble,force){
    if(!bubble||!bubble.isConnected)return;
    const next=(typeof force==='boolean')?force:!bubble.classList.contains('conv-selected');
    setBubbleSelected(bubble,next);
  };
  function currentName(){return (window.CONV_STATE&&CONV_STATE.activeName)||'对方';}
  function sideLabel(bubble){
    const group=bubble&&bubble.closest?bubble.closest('.conv-group'):null;
    return group&&group.classList.contains('sent')?'我':currentName();
  }
  function mainText(bubble){
    if(!bubble)return'';
    const type=(bubble.dataset&&bubble.dataset.msgType)||'';
    if(type==='voice')return (bubble.dataset.msgTranscript||bubble.dataset.msgText||'[语音]').trim()||'[语音]';
    if(type==='image')return (bubble.dataset.msgText&&bubble.dataset.msgText.trim())||'[图片]';
    if(typeof window.convGetBubbleMainText==='function'){
      const t=convGetBubbleMainText(bubble);
      if(t)return t;
    }
    const clone=bubble.cloneNode(true);
    clone.querySelectorAll('.conv-quote-in-bubble,.conv-voice-transcribe-btn,.conv-voice-transcript,.conv-edited-mark').forEach(function(n){n.remove();});
    return (clone.innerText||clone.textContent||'').trim();
  }
  function transcript(items){
    return items.map(function(b){return sideLabel(b)+'：'+(mainText(b)||'[消息]');}).join('\n');
  }
  function copyText(text,ok){
    text=String(text||'');
    function fallback(){
      const ta=document.createElement('textarea');
      ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';
      document.body.appendChild(ta);ta.select();
      let done=false;try{done=document.execCommand('copy');}catch(e){done=false;}
      ta.remove();
      if(typeof showToast==='function')showToast(done?(ok||'已复制'):'复制失败，请手动复制');
    }
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(text).then(function(){if(typeof showToast==='function')showToast(ok||'已复制');}).catch(fallback);
    }else fallback();
  }
  function saveFavorite(text,count){
    try{
      const key='XSJ_CHAT_FAVORITES';
      const arr=JSON.parse(localStorage.getItem(key)||'[]');
      arr.unshift({time:Date.now(),chat:currentName(),count:count,text:text});
      localStorage.setItem(key,JSON.stringify(arr.slice(0,100)));
    }catch(e){}
    if(typeof showToast==='function')showToast('已收藏 '+count+' 条');
  }
  function deleteBubble(bubble){
    if(!bubble||!bubble.isConnected)return;
    if(typeof window.convDeleteMessageBubble==='function'){
      convDeleteMessageBubble(bubble);
      return;
    }
    const bubbles=bubble.closest('.conv-group-bubbles');
    const group=bubble.closest('.conv-group');
    bubble.remove();
    if(bubbles&&!bubbles.querySelector('.conv-bubble,.conv-media-bubble,.conv-voice-bubble')&&group)group.remove();
  }
  function updateUI(){
    ensureState();ensureMultiBar();
    const items=getSelected();
    const count=items.length;
    const pill=document.getElementById('conv-multi-count-pill');
    if(pill)pill.textContent=count?'已选择 '+count+' 条':'选择消息';
    const nameEl=document.querySelector('#conv-overlay .conv-nav-name');
    if(nameEl&&CONV_STATE.multiSelect){
      if(!nameEl.dataset.originalText)nameEl.dataset.originalText=CONV_STATE.activeName||nameEl.textContent||'';
      nameEl.textContent=count?'已选择 '+count+' 条':'选择消息';
    }
    document.querySelectorAll('#conv-multi-bar .conv-multi-btn').forEach(function(btn){
      btn.disabled=!count;
      btn.classList.toggle('is-ready',!!count);
      btn.style.opacity=count?'1':'.34';
      btn.style.pointerEvents=count?'auto':'none';
    });
  }
  window.convUpdateMultiUI=updateUI;
  window.convEnterMultiSelect=function(bubble){
    ensureState();ensureMultiBar();
    if(typeof window.convCloseMessageMenu==='function')convCloseMessageMenu();
    if(window.CONV_STATE){
      CONV_STATE.multiSelect=true;
      CONV_STATE.quote=null;
      CONV_STATE.edit=null;
      CONV_STATE.selectedBubbles=new Set();
    }
    document.querySelectorAll('#conv-overlay .conv-selected').forEach(function(el){el.classList.remove('conv-selected');});
    const ov=document.getElementById('conv-overlay');
    if(ov)ov.classList.add('multi-mode');
    if(typeof window.convRenderComposerState==='function')convRenderComposerState();
    if(bubble)setBubbleSelected(bubble,true);
    updateUI();
  };
  window.convExitMultiSelect=function(){
    ensureState();
    CONV_STATE.multiSelect=false;
    CONV_STATE.selectedBubbles=new Set();
    document.querySelectorAll('#conv-overlay .conv-selected').forEach(function(el){el.classList.remove('conv-selected');});
    const ov=document.getElementById('conv-overlay');
    if(ov)ov.classList.remove('multi-mode');
    const nameEl=document.querySelector('#conv-overlay .conv-nav-name');
    if(nameEl){nameEl.textContent=CONV_STATE.activeName||nameEl.dataset.originalText||nameEl.textContent;}
    const pill=document.getElementById('conv-multi-count-pill');
    if(pill)pill.textContent='选择消息';
    updateUI();
    if(typeof window.convUpdateBodyPadding==='function')convUpdateBodyPadding();
  };
  window.convMultiAction=function(type){
    const items=getSelected();
    const count=items.length;
    if(!count){if(typeof showToast==='function')showToast('请选择消息');return;}
    const text=transcript(items);
    if(type==='copy'){
      copyText(text,'已复制 '+count+' 条聊天');
      convExitMultiSelect();
      return;
    }
    if(type==='save'){
      saveFavorite(text,count);
      convExitMultiSelect();
      return;
    }
    if(type==='forward'){
      if(window.CONV_STATE)CONV_STATE.quote={text:text,author:'聊天记录',side:'multi'};
      convExitMultiSelect();
      if(typeof window.convRenderComposerState==='function')convRenderComposerState();
      if(typeof window.convUpdateBodyPadding==='function')convUpdateBodyPadding();
      const inp=document.getElementById('conv-input-field');
      if(inp){inp.placeholder='添加一句话再发送...';inp.focus();}
      if(typeof showToast==='function')showToast('已放入引用栏');
      return;
    }
    if(type==='delete'){
      items.forEach(deleteBubble);
      const deleted=count;
      convExitMultiSelect();
      if(typeof window.convAttachMessageActions==='function')convAttachMessageActions();
      if(typeof window.convUpdateBodyPadding==='function')convUpdateBodyPadding();
      if(typeof showToast==='function')showToast('已删除 '+deleted+' 条');
    }
  };
  document.addEventListener('click',function(e){
    if(!window.CONV_STATE||!CONV_STATE.multiSelect)return;
    const bubble=selectableFromTarget(e.target);
    if(!bubble)return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    window.convToggleSelectBubble(bubble);
  },true);
  const oldShow=window.chatShowMsg;
  if(typeof oldShow==='function'){
    window.chatShowMsg=function(name){
      oldShow(name);
      setTimeout(function(){ensureMultiBar();updateUI();},0);
    };
  }
  setTimeout(function(){ensureMultiBar();updateUI();},0);
})();


// ══ patch ══

/* Step 13: my manual fake voice only; opponent voice follows context and is MiniMax-ready later. */
(function(){
  function htmlEsc(v){
    if(typeof escHtml==='function')return escHtml(v||'');
    return String(v||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});
  }
  function toast(msg){if(typeof showToast==='function')showToast(msg);}
  function durationFromText(text){
    var len=String(text||'').replace(/\s+/g,'').length;
    var sec=Math.max(2,Math.min(58,Math.round(len/3.6)+2));
    return '0:'+String(sec).padStart(2,'0');
  }
  function waveSvg(){
    return '<svg class="conv-voice-wave" viewBox="0 0 58 20" aria-hidden="true"><rect x="2" y="7" width="4" height="6" rx="2"/><rect x="12" y="4" width="4" height="12" rx="2"/><rect x="22" y="8" width="4" height="4" rx="2"/><rect x="32" y="3" width="4" height="14" rx="2"/><rect x="42" y="6" width="4" height="8" rx="2"/><rect x="52" y="9" width="4" height="2" rx="2"/></svg>';
  }
  function transcriptIcon(open){
    if(open){
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14"/><path d="M5 12h10"/><path d="M5 17h7"/></svg>';
  }
  function voiceBubbleHTML(side,text,open){
    var raw=htmlEsc(text||'');
    var safe=raw.replace(/\n/g,'<br>');
    var dur=durationFromText(text);
    var sent=side==='sent';
    var openClass=open?' transcribed':'';
    return '<div class="conv-bubble '+(sent?'sent-single':'recv-single')+' conv-voice-bubble'+openClass+'" data-msg-text="'+raw+'" data-msg-transcript="'+raw+'" data-msg-side="'+(sent?'sent':'recv')+'" data-msg-type="voice" data-audio-status="silent-simulated" data-audio-provider="minimax-pending" onclick="convToggleVoicePlay(event,this)">'+
      '<div class="conv-voice-line">'+waveSvg()+'<span class="conv-voice-time">'+htmlEsc(dur)+'</span><button type="button" class="conv-voice-transcribe-btn" aria-label="转文字" title="转文字" onclick="convToggleVoiceTranscript(event,this)">'+transcriptIcon(false)+'</button></div>'+
      '<div class="conv-voice-transcript">'+safe+'</div>'+
    '</div>';
  }
  function contactAvatarHTML(){
    var left=document.querySelector('#conv-overlay .conv-av-left');
    return left?(left.innerHTML||'AI'):'AI';
  }
  function myAvatarHTML(){
    var myAvatar='';
    try{myAvatar=(typeof XSJ!=='undefined'&&XSJ.get)?XSJ.get(XSJ.AVATAR,''):'';}catch(e){}
    return myAvatar?'<img src="'+htmlEsc(myAvatar)+'" alt="">':'我';
  }
  function appendGroup(side,bubbleHTML){
    var body=document.getElementById('conv-body');
    if(!body)return null;
    var sent=side==='sent';
    var group=document.createElement('div');
    group.className='conv-group'+(sent?' sent':'');
    var av=sent?myAvatarHTML():contactAvatarHTML();
    group.innerHTML='<div class="conv-group-av"'+(sent?' style="background:#2C2C2E;color:#fff;"':'')+'>'+av+'</div><div class="conv-group-bubbles">'+bubbleHTML+'</div>';
    body.appendChild(group);
    if(typeof convAttachMessageActions==='function')convAttachMessageActions();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
    body.scrollTop=body.scrollHeight;
    return group;
  }
  function lastSentText(){
    var nodes=[].slice.call(document.querySelectorAll('#conv-overlay .conv-group.sent .conv-bubble, #conv-overlay .conv-group.sent .conv-media-bubble, #conv-overlay .conv-group.sent .conv-voice-bubble'));
    var last=nodes[nodes.length-1];
    if(!last)return '';
    if(typeof convGetBubbleMainText==='function')return convGetBubbleMainText(last)||'';
    return (last.dataset&&last.dataset.msgText)||last.textContent||'';
  }
  function contextWantsVoice(text){
    text=String(text||'');
    return /语音|声音|说给我听|说一下|说句话|想听|听你|发个音|讲给我|念一下|读给我/.test(text);
  }
  function aiTextReply(context){
    var replies=[
      '我在，你慢慢说。',
      '嗯，我听着。你不用急着整理好再讲。',
      '可以，我们就按你舒服的节奏来。',
      '这句话我记住了。',
      '我懂你的意思，会一直陪着你。'
    ];
    if(/累|难受|崩溃|烦|委屈|不开心/.test(context||''))return '先不用撑着，我陪你安静待一会儿。';
    if(/睡|晚安|困/.test(context||''))return '那就慢慢放松下来，我在这里陪你。';
    return replies[Math.floor(Math.random()*replies.length)];
  }
  function aiVoiceReply(context){
    if(/晚安|睡|困/.test(context||''))return '晚安，我在。你可以安心睡一会儿。';
    if(/累|难受|不开心|委屈/.test(context||''))return '我听见了。先别急着解释，我陪你。';
    if(/想听|声音|语音|说/.test(context||''))return '嗯，我用语音陪你一下。你慢慢说，我在听。';
    return '我在这里。你说什么都可以。';
  }
  function showTyping(){
    if(typeof convShowAiTyping==='function')return convShowAiTyping();
    var bubble='<div class="conv-bubble recv-single conv-typing-bubble" data-msg-text="正在输入" data-msg-side="recv" data-msg-type="typing"><span class="conv-typing-dot"></span><span class="conv-typing-dot"></span><span class="conv-typing-dot"></span></div>';
    return appendGroup('recv',bubble);
  }

  window.convOpenVoiceComposer=function(side,options){
    options=options||{};
    if(window.CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
    document.querySelectorAll('.conv-voice-sheet,.conv-voice-sheet-backdrop').forEach(function(el){el.remove();});
    var editing=!!(options.bubble&&options.bubble.isConnected);
    var isRecv=editing && options.bubble.closest('.conv-group') && !options.bubble.closest('.conv-group').classList.contains('sent');
    if(isRecv){toast('对方语音会根据语境生成，不能手动控制');return;}
    var initialText=editing?((options.bubble.dataset&&options.bubble.dataset.msgTranscript)||((typeof convGetBubbleMainText==='function')?convGetBubbleMainText(options.bubble):'')):'';
    if(window.CONV_STATE)CONV_STATE.voiceDraft={side:'sent',editBubble:editing?options.bubble:null};
    var backdrop=document.createElement('div');
    backdrop.className='conv-voice-sheet-backdrop';
    backdrop.onclick=convCloseVoiceComposer;
    var sheet=document.createElement('div');
    sheet.className='conv-voice-sheet';
    sheet.innerHTML='<div class="conv-voice-sheet-handle"></div>'+
      '<div class="conv-voice-sheet-head"><div><div class="conv-voice-sheet-title">'+(editing?'修改我的语音':'发送我的语音')+'</div><div class="conv-voice-sheet-note">输入内容会作为语音转文字展示，暂不生成真实声音</div></div><div class="conv-voice-sheet-close" onclick="convCloseVoiceComposer()" aria-label="关闭"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div></div>'+
      '<textarea id="conv-voice-draft-field" class="conv-voice-draft-field" placeholder="输入要说出的内容..." oninput="convVoiceDraftChanged()">'+htmlEsc(initialText)+'</textarea>'+
      '<div class="conv-voice-sheet-meta"><span>发送后显示为语音气泡，可展开转文字。</span><span id="conv-voice-estimate" class="conv-voice-estimate">'+durationFromText(initialText)+'</span></div>'+
      '<div class="conv-voice-sheet-actions"><button type="button" class="conv-voice-action cancel" onclick="convCloseVoiceComposer()">取消</button><button type="button" class="conv-voice-action send" onclick="convSubmitVoiceComposer()">'+(editing?'保存':'发送')+'</button></div>';
    document.body.appendChild(backdrop);document.body.appendChild(sheet);
    requestAnimationFrame(function(){backdrop.classList.add('show');sheet.classList.add('show');});
    setTimeout(function(){var f=document.getElementById('conv-voice-draft-field');if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length);if(typeof convVoiceDraftChanged==='function')convVoiceDraftChanged();}},60);
  };
  window.convCloseVoiceComposer=function(){
    document.querySelectorAll('.conv-voice-sheet,.conv-voice-sheet-backdrop').forEach(function(el){el.classList.remove('show');setTimeout(function(){if(el&&el.isConnected)el.remove();},160);});
  };
  window.convVoiceDraftChanged=function(){
    var field=document.getElementById('conv-voice-draft-field');
    var est=document.getElementById('conv-voice-estimate');
    if(field){field.style.height='88px';field.style.height=Math.min(148,Math.max(88,field.scrollHeight))+'px';}
    if(est)est.textContent=durationFromText(field?field.value:'');
  };
  window.convSubmitVoiceComposer=function(){
    var field=document.getElementById('conv-voice-draft-field');
    var text=(field&&field.value?field.value:'').trim();
    if(!text){toast('请输入语音内容');return;}
    var editBubble=window.CONV_STATE&&CONV_STATE.voiceDraft&&CONV_STATE.voiceDraft.editBubble;
    if(editBubble&&editBubble.isConnected){
      var open=editBubble.classList.contains('transcribed');
      var wrap=document.createElement('div');
      wrap.innerHTML=voiceBubbleHTML('sent',text,open);
      editBubble.replaceWith(wrap.firstElementChild);
      toast('已保存语音');
    }else{
      appendGroup('sent',voiceBubbleHTML('sent',text,false));
      toast('已发送语音');
    }
    convCloseVoiceComposer();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
  };
  window.convToggleVoiceTranscript=function(e,btn){
    if(e){e.preventDefault();e.stopPropagation();}
    var bubble=btn&&btn.closest?btn.closest('.conv-voice-bubble'):null;
    if(!bubble)return;
    var open=!bubble.classList.contains('transcribed');
    bubble.classList.toggle('transcribed',open);
    btn.innerHTML=transcriptIcon(open);
    btn.setAttribute('aria-label',open?'收起转文字':'转文字');
    btn.setAttribute('title',open?'收起':'转文字');
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
  };
  window.convToggleVoicePlay=function(e,bubble){
    if(e&&e.target&&e.target.closest&&e.target.closest('.conv-voice-transcribe-btn'))return;
    if(!bubble)return;
    bubble.classList.toggle('playing');
    if(bubble.classList.contains('playing'))setTimeout(function(){if(bubble&&bubble.isConnected)bubble.classList.remove('playing');},1400);
  };

  var oldGetText=window.convGetBubbleMainText;
  window.convGetBubbleMainText=function(bubble){
    if(bubble&&bubble.dataset&&bubble.dataset.msgType==='voice')return (bubble.dataset.msgTranscript||bubble.dataset.msgText||'[语音]').trim();
    return typeof oldGetText==='function'?oldGetText(bubble):'';
  };
  var oldStartEdit=window.convStartEdit;
  window.convStartEdit=function(bubble){
    if(bubble&&bubble.dataset&&bubble.dataset.msgType==='voice'){
      var isSent=bubble.closest('.conv-group')&&bubble.closest('.conv-group').classList.contains('sent');
      if(!isSent){toast('对方语音会根据语境生成，不能手动控制');return;}
      convOpenVoiceComposer('sent',{bubble:bubble});return;
    }
    if(typeof oldStartEdit==='function')oldStartEdit(bubble);
  };

  window.convSendAiReply=function(){
    if(window.CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);
    var status=document.querySelector('#conv-overlay .conv-nav-status');
    var oldStatus=status?status.textContent:'';
    if(status)status.textContent='typing';
    var typing=showTyping();
    var context=lastSentText();
    var shouldVoice=contextWantsVoice(context);
    setTimeout(function(){
      if(typing&&typing.isConnected)typing.remove();
      if(status)status.textContent=oldStatus||'online';
      if(shouldVoice){
        appendGroup('recv',voiceBubbleHTML('recv',aiVoiceReply(context),false));
        toast('对方发来语音');
      }else{
        var text=aiTextReply(context);
        var bubble='<div class="conv-bubble recv-single" data-msg-text="'+htmlEsc(text)+'" data-msg-side="recv"><div class="conv-bubble-main">'+htmlEsc(text)+'</div></div>';
        appendGroup('recv',bubble);
      }
      if(typeof convAttachMessageActions==='function')convAttachMessageActions();
    },760);
  };
  var oldAction=window.convAction;
  window.convAction=function(key,label){
    if(key==='voice-msg'||key==='voice-call'){convOpenVoiceComposer('sent');return;}
    if(key==='receive-voice'){toast('对方语音会根据语境自动出现');return;}
    if(key==='receive-message'){convSendAiReply();return;}
    if(typeof oldAction==='function')oldAction(key,label);
  };
})();


// ══ patch ══

/* ── Step 14: 照片 = 真实图片；拍照 = 文字描述画面；AI 后续可按语境发送“画面描述” ── */
(function(){
  function toast(msg){ if(typeof showToast==='function')showToast(msg); }
  function esc(s){
    if(typeof escHtml==='function')return escHtml(s);
    return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});
  }
  function closePlus(){ if(window.CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false); }
  function myAvatarHTML(){
    var my=(typeof XSJ!=='undefined'&&XSJ.get)?XSJ.get(XSJ.AVATAR,''):'';
    return my?'<img src="'+esc(my)+'" alt="">':'我';
  }
  function contactAvatarHTML(){
    var left=document.querySelector('#conv-overlay .conv-av-left');
    if(!left)return esc((window.CONV_STATE&&CONV_STATE.activeName&&CONV_STATE.activeName[0])||'');
    return left.innerHTML||esc((window.CONV_STATE&&CONV_STATE.activeName&&CONV_STATE.activeName[0])||'');
  }
  function normalize(group){
    if(group&&typeof convNormalizeBubbleCorners==='function')convNormalizeBubbleCorners(group);
    if(typeof convAttachMessageActions==='function')convAttachMessageActions();
    if(typeof convUpdateBodyPadding==='function')convUpdateBodyPadding();
  }
  function appendGroup(side,bubbleHTML,extraClass){
    var body=document.getElementById('conv-body');
    if(!body)return null;
    var sent=side==='sent';
    var group=document.createElement('div');
    group.className='conv-group '+(sent?'sent':'')+(extraClass?' '+extraClass:'');
    var av=sent?('<div class="conv-group-av" style="background:#2C2C2E;color:#fff;">'+myAvatarHTML()+'</div>'):
      ('<div class="conv-group-av">'+contactAvatarHTML()+'</div>');
    group.innerHTML=av+'<div class="conv-group-bubbles">'+bubbleHTML+'</div>';
    body.appendChild(group);
    normalize(group);
    body.scrollTop=body.scrollHeight;
    return group;
  }
  function cameraIcon(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.2h3.1L9.2 5h5.6l2.1 3.2H20a1.8 1.8 0 011.8 1.8v7.2A1.8 1.8 0 0120 19H4a1.8 1.8 0 01-1.8-1.8V10A1.8 1.8 0 014 8.2z"/><circle cx="12" cy="13.4" r="3.35"/></svg>';
  }
  function cameraBubbleHTML(side,text,mode){
    var clean=String(text||'').trim();
    var sent=side==='sent';
    var label=sent?'拍照描述':'画面描述';
    var data='['+label+'] '+clean;
    return '<div class="conv-bubble '+(sent?'sent-single':'recv-single')+' conv-camera-desc-bubble" data-msg-type="camera-desc" data-msg-side="'+(sent?'sent':'recv')+'" data-msg-text="'+esc(data)+'" data-msg-transcript="'+esc(clean)+'">'+
      '<div class="conv-camera-desc-head">'+cameraIcon()+'<span>'+label+'</span></div>'+
      '<div class="conv-bubble-main conv-camera-desc-text">'+esc(clean).replace(/\n/g,'<br>')+'</div>'+ 
    '</div>';
  }
  function removeCameraSheet(){
    document.querySelectorAll('#conv-overlay .conv-camera-sheet,#conv-overlay .conv-camera-sheet-backdrop').forEach(function(el){
      el.classList.remove('show');
      setTimeout(function(){ if(el&&el.isConnected)el.remove(); },170);
    });
  }
  window.convCloseCameraComposer=function(){ removeCameraSheet(); };
  window.convOpenCameraComposer=function(options){
    options=options||{};
    closePlus();
    removeCameraSheet();
    var editing=!!(options.bubble&&options.bubble.isConnected);
    var initial=editing?((options.bubble.dataset&&options.bubble.dataset.msgTranscript)||''):'';
    if(window.CONV_STATE)CONV_STATE.cameraDraft={editBubble:editing?options.bubble:null};
    var overlay=document.getElementById('conv-overlay');
    if(!overlay){toast('请先打开聊天');return;}
    var backdrop=document.createElement('div');
    backdrop.className='conv-camera-sheet-backdrop';
    backdrop.onclick=removeCameraSheet;
    var sheet=document.createElement('div');
    sheet.className='conv-camera-sheet';
    sheet.innerHTML='<div class="conv-camera-sheet-handle"></div>'+ 
      '<div class="conv-camera-sheet-head"><div><div class="conv-camera-sheet-title">'+(editing?'修改拍照描述':'拍照描述')+'</div><div class="conv-camera-sheet-note">这里不会上传真实图片，只记录你想拍下的画面。</div></div><div class="conv-camera-sheet-close" onclick="convCloseCameraComposer()" aria-label="关闭"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div></div>'+ 
      '<textarea id="conv-camera-desc-field" class="conv-camera-field" placeholder="描述这张照片里会出现什么，比如：窗边的白色杯子、下午的光、她低头看手机的侧脸。" oninput="convCameraDraftChanged()">'+esc(initial)+'</textarea>'+ 
      '<div class="conv-camera-sheet-meta"><span>照片入口发送真实图片；拍照入口只发送画面描述。</span><span id="conv-camera-count">0</span></div>'+ 
      '<div class="conv-camera-actions"><button type="button" class="conv-camera-action cancel" onclick="convCloseCameraComposer()">取消</button><button type="button" class="conv-camera-action send" onclick="convSubmitCameraComposer()">'+(editing?'保存':'发送描述')+'</button></div>';
    overlay.appendChild(backdrop);overlay.appendChild(sheet);
    requestAnimationFrame(function(){backdrop.classList.add('show');sheet.classList.add('show');});
    setTimeout(function(){var f=document.getElementById('conv-camera-desc-field');if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length);if(typeof convCameraDraftChanged==='function')convCameraDraftChanged();}},60);
  };
  window.convCameraDraftChanged=function(){
    var f=document.getElementById('conv-camera-desc-field');
    var c=document.getElementById('conv-camera-count');
    if(f){f.style.height='88px';f.style.height=Math.min(148,Math.max(88,f.scrollHeight))+'px';}
    if(c)c.textContent=String((f&&f.value?f.value.trim().length:0))+' 字';
  };
  window.convSubmitCameraComposer=function(){
    var f=document.getElementById('conv-camera-desc-field');
    var text=(f&&f.value?f.value:'').trim();
    if(!text){toast('请输入拍照描述');return;}
    var editBubble=window.CONV_STATE&&CONV_STATE.cameraDraft&&CONV_STATE.cameraDraft.editBubble;
    if(editBubble&&editBubble.isConnected){
      var wrap=document.createElement('div');
      wrap.innerHTML=cameraBubbleHTML('sent',text,'camera');
      editBubble.replaceWith(wrap.firstElementChild);
      toast('已保存拍照描述');
    }else{
      appendGroup('sent',cameraBubbleHTML('sent',text,'camera'),'conv-camera-desc-group');
      toast('已发送拍照描述');
    }
    removeCameraSheet();
  };
  function lastSentText(){
    var nodes=[].slice.call(document.querySelectorAll('#conv-overlay .conv-group.sent .conv-bubble'));
    var last=nodes[nodes.length-1];
    if(!last)return '';
    if(typeof convGetBubbleMainText==='function')return convGetBubbleMainText(last)||'';
    return (last.dataset&&last.dataset.msgText)||last.textContent||'';
  }
  function wantsVisual(text){
    text=String(text||'');
    return /照片|图片|拍照|相片|发张图|发个图|给我看|想看|自拍|合照|画面|风景/.test(text);
  }
  function visualReply(context){
    context=String(context||'');
    if(/自拍|你自己|你的样子|看看你/.test(context))return '我靠在窗边，穿着简单的白色上衣，头发有点松，光从侧面落下来。';
    if(/晚安|睡|夜/.test(context))return '床头灯很暗，窗帘只留了一条缝，房间安静得像被柔软地包住。';
    if(/吃|饭|咖啡|喝/.test(context))return '桌上是白色杯子和一小盘甜点，旁边有一点自然光，画面很干净。';
    return '一张很安静的生活画面，浅色背景，光线柔和，像随手拍下来的日常瞬间。';
  }
  function showTyping(){
    var bubble='<div class="conv-bubble recv-single conv-typing-bubble" data-msg-text="正在输入" data-msg-side="recv" data-msg-type="typing"><span class="conv-typing-dot"></span><span class="conv-typing-dot"></span><span class="conv-typing-dot"></span></div>';
    return appendGroup('recv',bubble,'conv-typing-group');
  }
  var oldGet=window.convGetBubbleMainText;
  window.convGetBubbleMainText=function(bubble){
    if(bubble&&bubble.dataset&&bubble.dataset.msgType==='camera-desc')return (bubble.dataset.msgTranscript||bubble.dataset.msgText||'').trim();
    return typeof oldGet==='function'?oldGet(bubble):((bubble&&bubble.textContent)||'');
  };
  var oldStartEdit=window.convStartEdit;
  window.convStartEdit=function(bubble){
    if(bubble&&bubble.dataset&&bubble.dataset.msgType==='camera-desc'){
      var isSent=bubble.closest('.conv-group')&&bubble.closest('.conv-group').classList.contains('sent');
      if(!isSent){toast('对方画面描述由语境生成，不能手动控制');return;}
      convOpenCameraComposer({bubble:bubble});return;
    }
    if(typeof oldStartEdit==='function')oldStartEdit(bubble);
  };
  var oldAi=window.convSendAiReply;
  window.convSendAiReply=function(){
    var context=lastSentText();
    if(wantsVisual(context) && !/语音|声音|听你|说给我听/.test(context)){
      closePlus();
      var status=document.querySelector('#conv-overlay .conv-nav-status');
      var oldStatus=status?status.textContent:'';
      if(status)status.textContent='typing';
      var typing=showTyping();
      setTimeout(function(){
        if(typing&&typing.isConnected)typing.remove();
        if(status)status.textContent=oldStatus||'online';
        appendGroup('recv',cameraBubbleHTML('recv',visualReply(context),'ai-visual'),'conv-camera-desc-group');
        toast('对方发来画面描述');
      },720);
      return;
    }
    if(typeof oldAi==='function')return oldAi();
  };
  var oldAction=window.convAction;
  window.convAction=function(key,label){
    if(key==='camera'){
      convOpenCameraComposer();
      return;
    }
    if(key==='photos'){
      closePlus();
      if(typeof convOpenPhotoPicker==='function'){convOpenPhotoPicker();return;}
      var input=document.getElementById('conv-photo-input');
      if(input){input.click();return;}
    }
    if(key==='receive-image'||key==='ai-image'){
      toast('AI 后续可按语境发送画面描述，不直接发送真实图片');
      return;
    }
    if(typeof oldAction==='function')oldAction(key,label);
  };
  var oldChatShow=window.chatShowMsg;
  if(typeof oldChatShow==='function'){
    window.chatShowMsg=function(name){
      oldChatShow(name);
      setTimeout(function(){
        document.querySelectorAll('#conv-overlay .conv-plus-item').forEach(function(item){
          var label=item.querySelector('.conv-plus-label');
          if(label&&label.textContent.trim()==='拍照')item.setAttribute('title','拍照描述，不上传真实图片');
        });
      },0);
    };
  }
})();


// ══ patch ══

/* XSJ Advanced UI Layer - high fidelity additive pages */
(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function notice(text){if(typeof showToast==='function')showToast(text);else console.log(text);}
  window.xsjSoftNotice=notice;
  function backSvg(){return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';}
  function head(title,kicker,sub,action){return '<div class="xsj-app-head"><div class="xsj-kicker">'+esc(kicker||'Studio')+'</div><div class="xsj-title-row"><div><div class="xsj-title">'+esc(title)+'</div>'+(sub?'<div class="xsj-title-sub">'+esc(sub)+'</div>':'')+'</div>'+(action?'<div class="xsj-head-action" onclick="xsjSoftNotice(\''+esc(action)+'\')">'+esc(action)+'</div>':'')+'</div></div>';}
  function row(title,sub,side,mark){return '<div class="xsj-row"><div class="xsj-row-icon">'+esc(mark||'')+'</div><div class="xsj-row-main"><div class="xsj-row-title">'+esc(title)+'</div><div class="xsj-row-sub">'+esc(sub||'')+'</div></div>'+(side?'<div class="xsj-row-side">'+esc(side)+'</div>':'')+'</div>';}
  function chip(items,active){return '<div class="xsj-chip-row">'+items.map(function(it,i){return '<div class="xsj-chip '+(i===active?'active':'')+'">'+esc(it)+'</div>';}).join('')+'</div>';}
  function segment(items,active){return '<div class="xsj-segment">'+items.map(function(it,i){return '<div class="xsj-seg-item '+(i===active?'active':'')+'">'+esc(it)+'</div>';}).join('')+'</div>';}
  function stat(num,label,pct){return '<div class="xsj-stat"><div><div class="xsj-stat-num">'+esc(num)+'</div><div class="xsj-stat-label">'+esc(label)+'</div></div>'+(pct!=null?'<div class="xsj-mini-progress"><span style="width:'+pct+'%"></span></div>':'')+'</div>';}

  var appPages={
    worldbook:function(){return '<div class="xsj-page-root">'+head('世界书','Worldbook','全局世界、局部角色和线下文风都集中在这里。','新建')+segment(['全局','局部','文风'],0)+'<div class="xsj-hero"><div><div class="xsj-hero-title">当前注入配置</div><div class="xsj-hero-desc">生成时会读取已启用条目、触发关键词、角色范围和注入深度。页面先搭好，后续可以直接接真实注入逻辑。</div></div><div class="xsj-hero-meta"><span class="xsj-chip active">深度 4</span><span class="xsj-chip">关键词触发</span><span class="xsj-chip">全局启用</span></div></div><div class="xsj-section"><div class="xsj-section-head"><div class="xsj-section-title">世界书分类</div><div class="xsj-section-more">管理</div></div><div class="xsj-grid-2">'+stat('12','全局条目',72)+stat('7','局部条目',45)+'</div></div><div class="xsj-section"><div class="xsj-section-head"><div class="xsj-section-title">最近使用</div><div class="xsj-section-more">导入</div></div><div class="xsj-list">'+row('城市日常世界','地点、生活习惯、朋友圈氛围','启用','全')+row('恋爱文风预设','旁白柔和，心声细腻，对话自然','线下','文')+row('角色私密设定','仅对当前角色生效，避免串台','局部','局')+'</div></div><div class="xsj-card"><div class="xsj-section-title" style="margin-bottom:12px;">条目编辑预览</div><div class="xsj-form"><div class="xsj-field"><div class="xsj-label">触发关键词</div><input class="xsj-input" value="雨天, 回家, 晚安"></div><div class="xsj-field"><div class="xsj-label">注入内容</div><textarea class="xsj-textarea">角色在雨天会更安静，说话会放慢，倾向于先确认用户是否安全到家。</textarea></div><div class="xsj-btn-row"><button class="xsj-btn">保存条目</button><button class="xsj-btn secondary">测试触发</button></div></div></div></div>';},
    memory:function(){return '<div class="xsj-page-root">'+head('记忆','Memory','查看、确认和总结每个角色的长期记忆。','总结')+chip(['全部','重要','待确认','剧情','关系'],1)+'<div class="xsj-grid-3">'+stat('38','长期记忆',82)+stat('9','重要约定',60)+stat('4','待确认',28)+'</div><div class="xsj-card"><div class="xsj-section-title" style="margin-bottom:8px;">今日自动总结</div><div class="xsj-note">用户更喜欢自然、像真人一样的互动；角色主动信息需要有时间感和生活感，避免公式化回复。</div><div class="xsj-btn-row" style="margin-top:14px;"><button class="xsj-btn">保存为长期记忆</button><button class="xsj-btn secondary">修改</button></div></div><div class="xsj-section"><div class="xsj-section-head"><div class="xsj-section-title">角色记忆</div><div class="xsj-section-more">筛选角色</div></div><div class="xsj-list">'+row('重要约定','晚上消息要更轻，不要突然转移话题','固定','重')+row('关系进展','已经开启情侣空间邀请，等待确认','关系','关')+row('剧情摘要','线下模式剧情停在雨夜回家之后','剧情','剧')+'</div></div></div>';},
    forum:function(){return '<div class="xsj-page-root">'+head('论坛','Forum','广场、信息和个人主页都保持灰白社交感。','发帖')+segment(['广场','关注','信息','我的'],0)+'<div class="xsj-card"><input class="xsj-input" placeholder="想发点什么，或让某个角色参与讨论"></div><div class="xsj-post-card"><div class="xsj-post-top"><div class="xsj-avatar">路</div><div><div class="xsj-post-name">灰白广场</div><div class="xsj-post-time">12分钟前 · 来自广场</div></div></div><div class="xsj-post-body">有没有人也喜欢把角色的朋友圈、手机记录和聊天线索串起来？这样会感觉他真的在生活。</div><div class="xsj-post-actions"><span>转发 24</span><span>评论 18</span><span>喜欢 96</span></div></div><div class="xsj-post-card"><div class="xsj-post-top"><div class="xsj-avatar">角</div><div><div class="xsj-post-name">角色动态 bot</div><div class="xsj-post-time">刚刚 · 角色互动</div></div></div><div class="xsj-post-body">可以把帖子转发给角色，角色会根据帖子内容继续聊天或写一段回应。</div><div class="xsj-post-actions"><span>转给角色</span><span>评论</span><span>收藏</span></div></div></div>';},
    shop:function(){return '<div class="xsj-page-root">'+head('商城','Store','系统扩展、美化和角色资源集中管理。','订单')+chip(['推荐','角色','美化','插件','字体'],0)+'<div class="xsj-card"><input class="xsj-input" placeholder="搜索角色包、气泡、世界书模板"></div><div class="xsj-grid-2"><div class="xsj-card"><div class="xsj-product-img">角色包</div><div class="xsj-row-title">日常陪伴角色</div><div class="xsj-row-sub">含朋友圈、记忆模板、通话语气</div><div class="xsj-price" style="margin-top:8px;">28</div></div><div class="xsj-card"><div class="xsj-product-img">美化</div><div class="xsj-row-title">灰白气泡套装</div><div class="xsj-row-sub">含聊天 CSS 与字体预览</div><div class="xsj-price" style="margin-top:8px;">12</div></div></div><div class="xsj-section"><div class="xsj-section-head"><div class="xsj-section-title">系统插件</div><div class="xsj-section-more">全部</div></div><div class="xsj-list">'+row('主动消息插件','后台保活、角色主动发消息、通知提示','未安装','插')+row('世界书模板包','线下模式写作预设与注入模板','已收藏','书')+'</div></div></div>';},
    view:function(){return '<div class="xsj-page-root">'+head('查看','Phone View','查看角色手机，支持批量生成和单独生成。','生成')+'<div class="xsj-hero"><div><div class="xsj-hero-title">角色手机</div><div class="xsj-hero-desc">微信联系人、通话记录、备忘录、购物记录、浏览器和相册会以真实手机界面呈现。</div></div><div class="xsj-hero-meta"><span class="xsj-chip active">当前角色</span><span class="xsj-chip">2分钟前更新</span></div></div><div class="xsj-phone-mock"><div class="xsj-phone-screen"><div class="xsj-phone-grid">'+['微信','通话','备忘','购物','钱包','浏览','相册','论坛','游戏','小红书','直播','设置'].map(function(x){return '<div class="xsj-phone-app"><div class="xsj-phone-app-i">'+x.slice(0,1)+'</div><div>'+x+'</div></div>';}).join('')+'</div></div></div><div class="xsj-section"><div class="xsj-section-head"><div class="xsj-section-title">最近生成</div><div class="xsj-section-more">批量管理</div></div><div class="xsj-list">'+row('微信聊天记录','12 个联系人，3 条未读','今天','微')+row('浏览器记录','搜索了附近甜品店和雨天歌单','昨天','浏')+row('相册','新增 8 张生活照片描述','更新','相')+'</div></div></div>';},
    pet:function(){return '<div class="xsj-page-root">'+head('宠物','Pet Room','和角色共同领养、喂养、玩耍和对话。','记录')+'<div class="xsj-pet-stage"><div class="xsj-pet-body"><div class="xsj-pet-mouth"></div></div></div><div class="xsj-grid-3">'+stat('82','饱食',82)+stat('67','心情',67)+stat('91','亲密',91)+'</div><div class="xsj-card"><div class="xsj-section-title" style="margin-bottom:8px;">今天的宠物</div><div class="xsj-note">他刚刚喂过一次，宠物现在比较黏人。下一次互动可以选择玩耍或让宠物插入聊天。</div></div><div class="xsj-grid-2"><button class="xsj-btn secondary">喂养</button><button class="xsj-btn secondary">玩耍</button><button class="xsj-btn secondary">散步</button><button class="xsj-btn secondary">一起说话</button></div></div>';},
    ao3:function(){return '<div class="xsj-page-root">'+head('AO3','Archive','写同人文、发布、阅读和转发给角色讨论。','发布')+segment(['推荐','分类','我的','收藏'],0)+'<div class="xsj-card"><input class="xsj-input" placeholder="搜索作品、标签、角色或文风"></div><div class="xsj-book-card xsj-card"><div class="xsj-book-cover">WORK</div><div style="flex:1;min-width:0;"><div class="xsj-row-title">雨夜之后</div><div class="xsj-row-sub">日常 · 细腻 · 12,420 字</div><div class="xsj-note muted" style="margin-top:10px;">他们没有立刻说清楚，只是在门口站了很久，像把所有情绪都放进了沉默里。</div><div class="xsj-chip-row" style="margin-top:12px;"><span class="xsj-chip">评论 128</span><span class="xsj-chip">喜欢 2.1k</span></div></div></div><div class="xsj-book-card xsj-card"><div class="xsj-book-cover">FIC</div><div style="flex:1;min-width:0;"><div class="xsj-row-title">城市背面</div><div class="xsj-row-sub">论坛体 · 悬疑 · 5 章</div><div class="xsj-note muted" style="margin-top:10px;">可以转发给角色，让他点评剧情或继续写下一章。</div></div></div></div>';},
    game:function(){return '<div class="xsj-page-root">'+head('游戏','Interactive','文字冒险和角色扮演可以共用线下模式设定。','新游戏')+chip(['文字冒险','猜谜','跑团','日常挑战'],0)+'<div class="xsj-hero"><div><div class="xsj-hero-title">雨夜回家</div><div class="xsj-hero-desc">当前存档停在楼下便利店，角色正在等你选择下一步行动。</div></div><div class="xsj-hero-meta"><span class="xsj-chip active">继续</span><span class="xsj-chip">导入世界书</span></div></div><div class="xsj-list">'+row('文字冒险','分支选择、状态记录、道具栏','继续','游')+row('角色扮演','使用我的面具和角色设定','新建','扮')+row('剧情挑战','每天生成一个短任务','今日','任')+'</div></div>';}
  };

  function renderApp(name){var root=document.getElementById('xsj-app-root-'+name);if(root&&appPages[name])root.innerHTML=appPages[name]();}
  function installAppOverrides(){
    try{
      if(typeof APPS!=='undefined'){
        ['worldbook','memory','forum','game','shop','view','pet','ao3'].forEach(function(name){if(APPS[name])APPS[name].b='<div id="xsj-app-root-'+name+'"></div>';});
      }
    }catch(e){}
    var oldOpen=window.openApp;
    if(typeof oldOpen==='function'&&!oldOpen._xsjAdvanced){
      window.openApp=function(name){oldOpen(name);setTimeout(function(){renderApp(name);},0);};
      window.openApp._xsjAdvanced=true;
    }
  }

  function ensureFeature(){
    var ov=document.getElementById('xsj-feature-overlay');
    if(ov)return ov;
    ov=document.createElement('div');
    ov.id='xsj-feature-overlay';
    ov.innerHTML='<div class="xsj-feature-inner"><div class="xsj-feature-nav"><div class="xsj-feature-back" onclick="xsjCloseFeature()">'+backSvg()+'</div><div class="xsj-feature-title-wrap"><div id="xsj-feature-title" class="xsj-feature-title">Feature</div><div id="xsj-feature-sub" class="xsj-feature-sub">high fidelity preview</div></div><div class="xsj-feature-action" onclick="xsjSoftNotice(\'已保存\')">save</div></div><div id="xsj-feature-body" class="xsj-feature-body"></div></div>';
    document.body.appendChild(ov);
    return ov;
  }
  window.xsjCloseFeature=function(){var ov=document.getElementById('xsj-feature-overlay');if(!ov)return;ov.classList.remove('show');setTimeout(function(){ov.style.display='none';},240);};
  function featureShell(title,sub,body){return {title:title,sub:sub,body:body};}
  function featureTemplate(key,label){
    if(key==='voice-call')return featureShell('语音通话','文字输入 · 通话转写','<div class="xsj-call-wrap"><div style="text-align:center;"><div class="xsj-call-avatar"><span>TA</span></div><div class="xsj-call-name">'+esc(label||'语音通话')+'</div><div class="xsj-call-status">正在通话 02:14 · 对方正在听你说</div></div><div class="xsj-call-transcript"><div class="xsj-call-line"><b>我</b> 今天有点累，想听你说话。</div><div class="xsj-call-line"><b>TA</b> 那你先不用组织语言，我在这边陪你。你慢慢说就好。</div><input class="xsj-input" placeholder="输入你想说的话"></div><div class="xsj-call-controls"><div class="xsj-call-btn">静音</div><div class="xsj-call-btn">免提</div><div class="xsj-call-btn end" onclick="xsjCloseFeature()">结束</div></div></div>');
    if(key==='video-call')return featureShell('视频通话','文字输入 · 视频界面','<div class="xsj-video-bg"><div class="xsj-video-self">我的画面</div><div style="text-align:center;"><div class="xsj-video-person">TA</div><div class="xsj-call-status" style="margin-top:14px;">摄像头已开启 · 正在看向你</div></div><div class="xsj-video-caption">TA：我看见你了。今天的光线很柔和，你像是刚刚坐下来。</div><div class="xsj-video-input"><input placeholder="输入你要说的话"><button class="xsj-btn">发送</button></div></div>');
    if(key==='listen-together')return featureShell('一起听歌','网易云式独立页面 · 灰白版','<div class="xsj-page-root"><div class="xsj-hero" style="align-items:center;text-align:center;"><div class="music-disc spinning" style="width:160px;height:160px;background:var(--layer-2);"></div><div><div class="xsj-hero-title">在一起听</div><div class="xsj-hero-desc" style="max-width:100%;">灰白歌单界面，可连接网易云，角色会围绕歌词、曲风和你的状态讨论。</div></div></div><div class="xsj-lyrics"><div>晚风把城市吹得很轻</div><div class="active">这一句像你今天没有说出口的话</div><div>我们慢慢走，不急着回家</div></div><div class="xsj-card"><div class="xsj-section-title" style="margin-bottom:8px;">TA 的评论</div><div class="xsj-note">这首歌适合放在雨夜剧情里，歌词的留白感很强，不需要解释太多。</div></div><div class="xsj-bottom-bar"><button class="xsj-btn secondary">新建歌单</button><button class="xsj-btn">转发到聊天</button></div></div>');
    if(key==='couple-space')return featureShell('情侣空间','邀请 · 悄悄话 · 情书','<div class="xsj-page-root"><div class="xsj-hero"><div><div class="xsj-hero-title">只属于你们的空间</div><div class="xsj-hero-desc">邀请发送后，对方接受即可开启纪念日、留言、情书、共同相册和悄悄话。</div></div><div class="xsj-hero-meta"><span class="xsj-chip active">等待邀请</span><span class="xsj-chip">Private Room</span></div></div><div class="xsj-grid-2">'+stat('0','关系天数',0)+stat('3','未写情书',30)+'</div><div class="xsj-list">'+row('悄悄话','只显示给当前角色，可保存为记忆','进入','悄')+row('留言板','日常留言、角色回复、置顶留言','进入','留')+row('情书','写给角色，也可以让角色回信','进入','信')+'</div><button class="xsj-btn">发送情侣空间邀请</button></div>');
    if(key==='location')return featureShell('位置','灰阶地图 · 发送定位','<div class="xsj-page-root"><div class="xsj-card"><input class="xsj-input" placeholder="搜索地点或输入定位说明"></div><div class="xsj-map"><div class="xsj-map-pin"></div></div><div class="xsj-card"><div class="xsj-row-title">当前位置</div><div class="xsj-row-sub">白色街区 · 距离角色 2.4km</div><div class="xsj-note" style="margin-top:10px;">发送后会在聊天中显示地图卡片，角色可以根据时间地点主动回应。</div></div><button class="xsj-btn">发送给角色</button></div>');
    if(key==='shopping')return featureShell('购物','送礼 · 代付 · 打车','<div class="xsj-page-root"><div class="xsj-card"><input class="xsj-input" placeholder="搜索商品、礼物或打车目的地"></div>'+chip(['推荐','礼物','代付','打车','订单'],0)+'<div class="xsj-grid-2"><div class="xsj-card"><div class="xsj-product-img">礼物</div><div class="xsj-row-title">白色围巾</div><div class="xsj-row-sub">可送给角色</div><div class="xsj-price">39</div></div><div class="xsj-card"><div class="xsj-product-img">甜点</div><div class="xsj-row-title">草莓蛋糕</div><div class="xsj-row-sub">找角色代付</div><div class="xsj-price">26</div></div></div><div class="xsj-list">'+row('购物车','3 件商品，1 件可送礼','查看','车')+row('我的订单','待付款、待收货、礼物记录','查看','单')+'</div></div>');
    if(key==='read-together')return featureShell('一起阅读','导入小说 · 角色共读','<div class="xsj-page-root"><div class="xsj-card"><div class="xsj-section-title" style="margin-bottom:8px;">正在阅读</div><div class="xsj-note">窗外下着雨，他在便利店门口停了一下，像是忽然想起了什么。</div></div><div class="xsj-card soft"><div class="xsj-row-title">TA 的想法</div><div class="xsj-note" style="margin-top:8px;">这段情绪很克制，适合让角色只说一句很轻的话，而不是直接解释。</div></div><div class="xsj-list">'+row('导入小说','支持本地文本，后续可做章节管理','导入','书')+row('标记这一段','保存书摘并转发给角色讨论','标记','摘')+row('让角色续写','接入线下模式文风预设','续写','续')+'</div></div>');
    if(key==='offline')return featureShell('线下模式','长篇小说 · 世界书 · 文风预设','<div class="xsj-page-root"><div class="xsj-hero"><div><div class="xsj-hero-title">Story Mode</div><div class="xsj-hero-desc">旁白、心声、动作和对话使用不同层级，支持世界书、记忆、文风预设和注入深度。</div></div><div class="xsj-hero-meta"><span class="xsj-chip active">日常细腻</span><span class="xsj-chip">世界书 3</span><span class="xsj-chip">记忆 12</span></div></div><div class="xsj-card"><div class="xsj-note muted">旁白</div><div class="xsj-note" style="margin-top:8px;">雨停得很慢，楼下的灯把水痕照得发白。他没有立刻说话，只是把伞往你这边偏了一点。</div><div class="xsj-note" style="margin-top:12px;color:var(--text);font-weight:620;">TA：先上去吧，别站在风口。</div><div class="xsj-note muted" style="margin-top:12px;">心声：他其实还想问你今天为什么突然安静，但没有马上问出口。</div></div><div class="xsj-form"><textarea class="xsj-textarea" placeholder="继续这一段剧情..."></textarea><div class="xsj-btn-row"><button class="xsj-btn">生成</button><button class="xsj-btn secondary">重写</button><button class="xsj-btn secondary">设置</button></div></div></div>');
    if(key==='settings')return featureShell('聊天设置','角色级设置 · 不影响全局','<div class="xsj-page-root">'+chip(['基础','表现','记忆','导出'],0)+'<div class="xsj-list">'+row('头像与备注','开启头像、换头像、修改备注','编辑','头')+row('聊天背景','单独更换当前角色背景','编辑','背')+row('在线状态','显示在线、正在输入、刚刚在线','开启','在')+row('世界书','绑定全局或局部世界书','3 本','书')+row('我的面具','选择当前对话使用的人设','默认','我')+row('时间戳与已读','位置、是否显示、是否模拟已读','开启','时')+row('主动消息','角色是否主动发信息、频率和静默时间','允许','主')+row('导入导出','聊天记录、剧情摘要、记忆备份','管理','导')+row('清空与拉黑','危险操作单独确认','进入','禁')+'</div></div>');
    if(key==='red-packet')return featureShell('红包','仿微信红包 · 灰白版','<div class="xsj-page-root"><div class="xsj-hero"><div><div class="xsj-hero-title">发红包</div><div class="xsj-hero-desc">用于剧情互动和关系表达，可以生成红包留言并发送到聊天。</div></div></div><div class="xsj-form"><div class="xsj-field"><div class="xsj-label">金额</div><input class="xsj-input" value="52.00"></div><div class="xsj-field"><div class="xsj-label">留言</div><input class="xsj-input" value="今天也想让你开心一点"></div><button class="xsj-btn">塞进红包</button></div></div>');
    if(key==='transfer')return featureShell('转账','转账卡片 · 关系互动','<div class="xsj-page-root"><div class="xsj-card"><div class="xsj-section-title" style="margin-bottom:8px;">转账给 TA</div><div class="xsj-price" style="font-size:42px;">128.00</div><div class="xsj-row-sub">可作为剧情记录保存进钱包流水</div></div><div class="xsj-form"><input class="xsj-input" value="晚餐钱"><button class="xsj-btn">确认转账</button></div></div>');
    if(key==='voice-memo')return featureShell('心声记录','查看这一轮回复背后的状态','<div class="xsj-page-root"><div class="xsj-card"><div class="xsj-section-title" style="margin-bottom:8px;">这一刻的 TA</div><div class="xsj-note">心声：他想靠近一点，但又怕你觉得突然。动作：低头看了一眼手机，停顿后才回复。状态：在意你的情绪变化。</div></div><div class="xsj-btn-row"><button class="xsj-btn">保存为记忆</button><button class="xsj-btn secondary">手动修改</button></div></div>');
    if(key==='receive-message')return featureShell('接收信息','模拟角色主动发来消息','<div class="xsj-page-root"><div class="xsj-empty">这里会显示角色主动消息、后台通知和未读提醒。后续接入后台保活后，可以在这里查看触发原因。</div><button class="xsj-btn">生成一条主动消息</button></div>');
    return featureShell(label||'功能','高保真静态页面','<div class="xsj-empty">这个入口已经接入高保真页面容器，下一步可以继续补具体交互。</div>');
  }
  window.xsjOpenFeature=function(key,label){
    try{if(window.CONV_STATE&&CONV_STATE.plusOpen&&typeof convTogglePlus==='function')convTogglePlus(false);}catch(e){}
    var tpl=featureTemplate(key,label);
    var ov=ensureFeature();
    document.getElementById('xsj-feature-title').textContent=tpl.title;
    document.getElementById('xsj-feature-sub').textContent=tpl.sub;
    document.getElementById('xsj-feature-body').innerHTML=tpl.body;
    ov.style.display='block';requestAnimationFrame(function(){ov.classList.add('show');});
  };

  function installConvOverrides(){
    var prevAction=window.convAction;
    var featureKeys={'voice-call':1,'video-call':1,'listen-together':1,'couple-space':1,'location':1,'shopping':1,'read-together':1,'settings':1,'red-packet':1,'transfer':1,'voice-memo':1,'receive-message':1};
    window.convAction=function(key,label){
      if(featureKeys[key]){window.xsjOpenFeature(key,label);return;}
      if(typeof prevAction==='function')return prevAction(key,label);
      window.xsjOpenFeature(key,label);
    };
    var prevOffline=window.convToggleOffline;
    window.convToggleOffline=function(){
      try{if(window.CONV_STATE)window.CONV_STATE.offline=true;var btn=document.getElementById('conv-offline-btn');if(btn)btn.classList.add('offline-on');}catch(e){}
      window.xsjOpenFeature('offline','线下模式');
    };
  }

  installAppOverrides();
  installConvOverrides();
  document.addEventListener('DOMContentLoaded',function(){installAppOverrides();installConvOverrides();});
})();


// ══ patch ══

/* XSJ cleanup pass v2 - keep one title source and neutralize unfinished-copy toasts */
(function(){
  var premiumApps={worldbook:1,memory:1,forum:1,game:1,shop:1,view:1,pet:1,ao3:1};
  var prevOpen=window.openApp;
  if(typeof prevOpen==='function'&&!prevOpen._xsjCleanupV2){
    window.openApp=function(name){
      var ov=document.getElementById('app-overlay');
      if(ov)ov.classList.toggle('xsj-premium-app-mode',!!premiumApps[name]);
      prevOpen(name);
      setTimeout(function(){
        var overlay=document.getElementById('app-overlay');
        if(!overlay)return;
        overlay.classList.toggle('xsj-premium-app-mode',!!premiumApps[name]);
        if(premiumApps[name]){
          var title=overlay.querySelector('.app-title');
          if(title)title.setAttribute('aria-hidden','true');
        }
      },0);
    };
    window.openApp._xsjCleanupV2=true;
  }
  var prevToast=window.showToast;
  if(typeof prevToast==='function'&&!prevToast._xsjCleanupV2){
    window.showToast=function(msg){
      msg=String(msg||'').replace(/功能开发中/g,'已进入预览').replace(/该功能开发中\.\.\./g,'该入口已保留');
      return prevToast(msg);
    };
    window.showToast._xsjCleanupV2=true;
  }
  var prevMeFeature=window.meFeatureClick;
  window.meFeatureClick=function(label){
    if(typeof window.xsjOpenFeature==='function'){
      var map={'用户面具':'settings','我的钱包':'transfer','我的收藏':'settings','表情包管理':'settings'};
      window.xsjOpenFeature(map[label]||'settings',label||'详情');
      return;
    }
    if(typeof prevMeFeature==='function')return prevMeFeature(label);
  };
})();


// ══ patch ══

/* XSJ v3 - differentiated UI pages */
(function(){
  function forumPage(){
    return '<div class="xsj-wb-root">'
      +'<div class="xsj-wb-top"><div class="xsj-wb-titlebar"><div class="xsj-wb-title">论坛</div><div class="xsj-wb-action" onclick="xsjSoftNotice(\'打开发帖面板\')">发帖</div></div>'
      +'<div class="xsj-wb-tabs"><div class="xsj-wb-tab active">广场</div><div class="xsj-wb-tab">关注</div><div class="xsj-wb-tab">角色</div><div class="xsj-wb-tab">同城</div><div class="xsj-wb-tab">信息</div><div class="xsj-wb-tab">我的</div></div>'
      +'<div class="xsj-wb-search">搜索帖子、角色动态、路人评论</div><div class="xsj-wb-hot"><span>热议 角色主动发消息</span><span>新帖 朋友圈联动</span><span>讨论 线下模式文风</span></div></div>'
      +'<div class="xsj-wb-feed">'
      +wbCard('灰白广场','12分钟前 · 来自广场','有没有人也喜欢把角色的朋友圈、手机记录和聊天线索串起来？这样会感觉他真的在生活，而不是只在聊天框里等我。','路人','转发 24','评论 18','喜欢 96',true)
      +wbCard('角色动态 bot','刚刚 · 角色互动','可以把帖子转发给角色，角色会根据帖子内容继续聊天、吐槽，或者把观点保存成一段关系记忆。','角色','转给角色','评论 6','收藏 12',false)
      +wbCard('日常剧情研究所','35分钟前 · 关注','线下模式最好不要每次都写很满。留一点空白，角色才会像真人一样有停顿、有试探、有没说出口的话。','研','转发 41','评论 33','喜欢 188',true)
      +'</div><div class="xsj-wb-compose" onclick="xsjSoftNotice(\'打开发帖面板\')">写</div></div>';
  }
  function wbCard(name,time,text,av,a,b,c,imgs){
    return '<div class="xsj-wb-card"><div class="xsj-wb-user"><div class="xsj-wb-avatar">'+av+'</div><div><div class="xsj-wb-name-row"><div class="xsj-wb-name">'+name+'</div><div class="xsj-wb-badge">社交</div></div><div class="xsj-wb-time">'+time+'</div></div><div class="xsj-wb-more">···</div></div><div class="xsj-wb-text">'+text+'</div>'
      +(imgs?'<div class="xsj-wb-imggrid"><div class="xsj-wb-img">图一</div><div class="xsj-wb-img">图二</div><div class="xsj-wb-img">图三</div></div>':'<div class="xsj-wb-repost">转发给当前聊天角色后，会生成一条带观点的聊天卡片，也可以让角色参与评论区。</div>')
      +'<div class="xsj-wb-comment"><div><b>我：</b>这个可以转给角色继续讨论吗？</div><div><b>'+name+'：</b>可以，转发后会保留帖子语境。</div></div><div class="xsj-wb-actions"><span>'+a+'</span><span>'+b+'</span><span>'+c+'</span><span>转给 TA</span></div></div>';
  }
  function shopPage(title,forChat){
    var channels=forChat?['礼物','代付','打车','订单','购物车']:['推荐','角色','美化','插件','字体'];
    var products=forChat?[
      ['白色围巾','可送给角色 · 亲密度记录','39','送礼'],['草莓蛋糕','找角色代付 · 聊天卡片','26','代付'],['夜间打车','让角色帮忙叫车','18','打车'],['小熊挂件','情侣空间共同物品','22','礼物']
    ]:[
      ['日常陪伴角色包','朋友圈、记忆、通话语气','28','角色'],['灰白气泡套装','聊天 CSS 与字体预览','12','美化'],['主动消息插件','后台保活、主动通知','19','插件'],['世界书模板包','线下模式注入预设','16','模板']
    ];
    return '<div class="xsj-tb-root"><div class="xsj-tb-top"><div class="xsj-tb-searchrow"><div class="xsj-tb-search">搜索'+(forChat?'礼物、代付、打车':'角色包、美化、世界书模板')+'</div><div class="xsj-tb-cart">车</div></div>'
      +'<div class="xsj-tb-channels">'+channels.map(function(x){return '<div class="xsj-tb-channel"><div class="xsj-tb-channel-i">'+x.slice(0,1)+'</div><div>'+x+'</div></div>';}).join('')+'</div></div>'
      +'<div class="xsj-tb-banner"><div class="xsj-tb-banner-text"><div class="xsj-tb-kicker">'+(forChat?'Chat Shopping':'Soft Store')+'</div><div class="xsj-tb-title">'+title+'</div><div class="xsj-tb-desc">'+(forChat?'像淘宝一样挑选商品，但保留送礼、代付、订单和聊天转发闭环。':'系统商城更像真实购物平台，资源、插件、美化和角色包都走同一套订单体验。')+'</div></div><div class="xsj-tb-tag">今日推荐</div></div>'
      +'<div class="xsj-tb-strip"><div class="xsj-tb-chip active">猜你喜欢</div><div class="xsj-tb-chip">最近浏览</div><div class="xsj-tb-chip">可转发</div><div class="xsj-tb-chip">角色适用</div><div class="xsj-tb-chip">我的订单</div></div>'
      +'<div class="xsj-tb-waterfall">'+products.map(function(p){return '<div class="xsj-tb-item"><div class="xsj-tb-img">'+p[3]+'</div><div class="xsj-tb-name">'+p[0]+'</div><div class="xsj-tb-sub">'+p[1]+'</div><div class="xsj-tb-price-row"><div class="xsj-tb-price">'+p[2]+'</div><div class="xsj-tb-mini">加入</div></div></div>';}).join('')+'</div>'
      +'<div class="xsj-tb-bottom"><div class="active">首页</div><div>分类</div><div>订单</div><div>我的</div></div></div>';
  }
  function renderDiverse(name){
    var root=document.getElementById('xsj-app-root-'+name);
    if(!root)return;
    if(name==='forum'){root.innerHTML=forumPage();var ov=document.getElementById('app-overlay');if(ov)ov.classList.add('xsj-diverse-mode');}
    if(name==='shop'){root.innerHTML=shopPage('灰白资源商城',false);var ov2=document.getElementById('app-overlay');if(ov2)ov2.classList.add('xsj-diverse-mode');}
  }
  var prevOpen=window.openApp;
  if(typeof prevOpen==='function'&&!prevOpen._xsjDiversifiedV3){
    window.openApp=function(name){prevOpen(name);setTimeout(function(){renderDiverse(name);},20);};
    window.openApp._xsjDiversifiedV3=true;
  }
  var oldFeature=window.xsjOpenFeature;
  window.xsjOpenFeature=function(key,label){
    if(key==='shopping'){
      if(typeof oldFeature==='function')oldFeature(key,label||'购物');
      setTimeout(function(){
        var body=document.getElementById('xsj-feature-body');
        var title=document.getElementById('xsj-feature-title');
        var sub=document.getElementById('xsj-feature-sub');
        if(title)title.textContent='购物';
        if(sub)sub.textContent='taobao-like chat shopping';
        if(body){body.classList.add('xsj-shopping-mode');body.innerHTML=shopPage('聊天购物',true);}
      },0);
      return;
    }
    var body=document.getElementById('xsj-feature-body');
    if(body)body.classList.remove('xsj-shopping-mode');
    if(typeof oldFeature==='function')return oldFeature(key,label);
  };
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){try{renderDiverse('forum');renderDiverse('shop');}catch(e){}},50);});
})();


// ══ patch ══

/* XSJ v4 - richer SVG icons and differentiated renderers */
(function(){
  var I={
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>',
    plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
    edit:'<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z"></path><path d="m13 6 5 5"></path></svg>',
    book:'<svg viewBox="0 0 24 24"><path d="M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4 0V4Z"></path><path d="M5 4v16"></path></svg>',
    memory:'<svg viewBox="0 0 24 24"><path d="M12 4a6 6 0 0 0-6 6v2a6 6 0 0 0 12 0v-2a6 6 0 0 0-6-6Z"></path><path d="M8 20h8M9 10h.01M15 10h.01M9 14c1.8 1.4 4.2 1.4 6 0"></path></svg>',
    message:'<svg viewBox="0 0 24 24"><path d="M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"></path></svg>',
    heart:'<svg viewBox="0 0 24 24"><path d="M20.5 8.5c0 6-8.5 11-8.5 11s-8.5-5-8.5-11A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8.5 2.5Z"></path></svg>',
    repeat:'<svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"></path><path d="M3 11V9a3 3 0 0 1 3-3h15"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a3 3 0 0 1-3 3H3"></path></svg>',
    comment:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4V5Z"></path></svg>',
    share:'<svg viewBox="0 0 24 24"><path d="M4 12v7h16v-7"></path><path d="M12 4v12"></path><path d="m7 9 5-5 5 5"></path></svg>',
    cart:'<svg viewBox="0 0 24 24"><path d="M4 5h2l2 11h10l2-8H7"></path><circle cx="10" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle></svg>',
    gift:'<svg viewBox="0 0 24 24"><path d="M4 10h16v10H4V10Z"></path><path d="M3 7h18v3H3V7Z"></path><path d="M12 7v13"></path><path d="M12 7s-1-4-4-3c-3 1 0 3 4 3Z"></path><path d="M12 7s1-4 4-3c3 1 0 3-4 3Z"></path></svg>',
    bag:'<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8Z"></path><path d="M9 8a3 3 0 0 1 6 0"></path></svg>',
    car:'<svg viewBox="0 0 24 24"><path d="M5 12 7 7h10l2 5"></path><path d="M4 12h16v6H4v-6Z"></path><circle cx="7" cy="18" r="1.5"></circle><circle cx="17" cy="18" r="1.5"></circle></svg>',
    phone:'<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path></svg>',
    image:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="m4 15 4-4 4 4 3-3 5 5"></path><circle cx="15" cy="9" r="1.5"></circle></svg>',
    wallet:'<svg viewBox="0 0 24 24"><path d="M4 7h15a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13"></path><path d="M16 13h5"></path></svg>',
    globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path></svg>',
    pet:'<svg viewBox="0 0 24 24"><path d="M8 11a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM20 11a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM18 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"></path><path d="M8 17c0-2 2-4 4-4s4 2 4 4-2 3-4 3-4-1-4-3Z"></path></svg>',
    pen:'<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"></path></svg>',
    play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5Z"></path></svg>',
    mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"></path></svg>',
    video:'<svg viewBox="0 0 24 24"><rect x="4" y="6" width="12" height="12" rx="2"></rect><path d="m16 10 5-3v10l-5-3"></path></svg>',
    music:'<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="17" cy="16" r="3"></circle></svg>',
    map:'<svg viewBox="0 0 24 24"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"></path><path d="M9 3v15M15 6v15"></path></svg>',
    read:'<svg viewBox="0 0 24 24"><path d="M4 5h7a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H4V5Z"></path><path d="M20 5h-6a3 3 0 0 0-3 3"></path></svg>',
    lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>',
    spark:'<svg viewBox="0 0 24 24"><path d="M4 20 20 4"></path><path d="M15 4.5 19.5 9"></path></svg>',
    dots:'<svg viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01"></path></svg>',
    user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>'
  };
  function icon(k,c){return '<span class="xsj-ico '+(c||'')+'">'+(I[k]||I.spark)+'</span>';}
  window.xsjIcon=icon;
  function t(s){return s;}
  function top(title,kicker,sub,act,actIcon){return '<div class="xsj-v4-top"><div class="xsj-v4-head"><div class="xsj-v4-titlebox"><div class="xsj-v4-kicker">'+kicker+'</div><div class="xsj-v4-title">'+title+'</div><div class="xsj-v4-sub">'+sub+'</div></div><div class="xsj-v4-iconbtn dark" onclick="xsjSoftNotice(\'saved\')">'+icon(actIcon||'plus')+'</div></div></div>';}
  function search(ph){return '<div class="xsj-v4-search">'+icon('search','s16')+'<span>'+ph+'</span></div>';}
  function tab(arr,idx){return '<div class="xsj-v4-tabs">'+arr.map(function(x,i){return '<div class="xsj-v4-tab '+(i===idx?'active':'')+'">'+(x[1]?icon(x[1],'s16'):'')+'<span>'+x[0]+'</span></div>';}).join('')+'</div>';}
  function row(ic,title,desc,side,alt){return '<div class="xsj-v4-row '+(alt?'alt':'')+'"><div class="xsj-v4-rowicon">'+icon(ic)+'</div><div class="xsj-v4-rowmain"><div class="xsj-v4-rowtitle">'+title+'</div><div class="xsj-v4-rowdesc">'+desc+'</div></div><div class="xsj-v4-side">'+side+'</div></div>';}
  function section(title,more,body){return '<div class="xsj-v4-section"><div class="xsj-v4-section-head"><div class="xsj-v4-section-title">'+title+'</div><div class="xsj-v4-section-more">'+more+icon('dots','s16')+'</div></div>'+body+'</div>';}
  function pills(arr,active){return '<div class="xsj-v4-pills">'+arr.map(function(x,i){return '<div class="xsj-v4-pill '+(i===active?'dark':'')+'">'+x+'</div>';}).join('')+'</div>';}
  function metric(n,l){return '<div class="xsj-v4-metric"><div class="xsj-v4-metric-num">'+n+'</div><div class="xsj-v4-metric-label">'+l+'</div></div>';}
  function worldbook(){return '<div class="xsj-v4-root">'+top('\u4e16\u754c\u4e66','WORLD BOOK','\u5168\u5c40\u4e0e\u5c40\u90e8\u8bbe\u5b9a\uff0c\u63a7\u5236 AI \u751f\u6210\u65f6\u8bfb\u53d6\u7684\u80cc\u666f\u4e0e\u6587\u98ce','new','book')+search('\u641c\u7d22\u4e16\u754c\u4e66\u3001\u6761\u76ee\u3001\u89e6\u53d1\u8bcd')+tab([['\u5168\u5c40','globe'],['\u5c40\u90e8','user'],['\u6587\u98ce','pen'],['\u5206\u7c7b','book']],0)+'<div class="xsj-v4-grid2">'+metric('12','\u542f\u7528\u6761\u76ee')+metric('4','\u6ce8\u5165\u6df1\u5ea6')+'</div><div class="xsj-v4-card"><div class="xsj-v4-section-title">\u5f53\u524d\u6ce8\u5165\u9884\u89c8</div><div class="xsj-v4-note" style="margin-top:10px;">\u4f1a\u5728\u89d2\u8272\u56de\u590d\u524d\u8bfb\u53d6\u4e16\u754c\u89c2\u3001\u5173\u7cfb\u7ea6\u5b9a\u3001\u573a\u666f\u9650\u5236\u548c\u6587\u98ce\u8981\u6c42\uff0c\u4f46\u4e0d\u4f1a\u76f4\u63a5\u9732\u51fa\u8bbe\u5b9a\u6587\u672c\u3002</div><div style="margin-top:12px;">'+pills(['\u5173\u952e\u8bcd\u89e6\u53d1','\u89d2\u8272\u9650\u5b9a','\u7ebf\u4e0b\u6a21\u5f0f','\u4f18\u5148\u7ea7 8'],0)+'</div></div>'+section('\u6761\u76ee\u7ba1\u7406','\u7f16\u8f91',row('book','\u6821\u56ed\u65e5\u5e38\u4e16\u754c','\u8bfe\u8868\u3001\u793e\u56e2\u3001\u5bbf\u820d\u3001\u5173\u7cfb\u7f51','\u542f\u7528')+row('lock','\u9690\u85cf\u7ea6\u5b9a','\u4ec5\u5728\u7279\u5b9a\u89d2\u8272\u4e0e\u7ebf\u4e0b\u6a21\u5f0f\u89e6\u53d1','\u5c40\u90e8',true)+row('pen','\u7ec6\u817b\u65e5\u5e38\u6587\u98ce','\u65c1\u767d\u514b\u5236\uff0c\u5bf9\u8bdd\u7559\u767d\uff0c\u5fc3\u58f0\u8f7b\u5199','\u6587\u98ce'))+'<div class="xsj-v4-dual"><button class="xsj-v4-btn ghost">'+icon('share')+'\u5bfc\u5165</button><button class="xsj-v4-btn">'+icon('plus')+'\u65b0\u5efa\u6761\u76ee</button></div></div>';}
  function memory(){return '<div class="xsj-v4-root">'+top('\u8bb0\u5fc6','MEMORY','\u4ece\u804a\u5929\u63d0\u53d6\u5173\u952e\u8bb0\u5fc6\uff0c\u4e5f\u53ef\u624b\u52a8\u6dfb\u52a0\u548c\u603b\u7ed3','sum','memory')+search('\u641c\u7d22\u89d2\u8272\u8bb0\u5fc6\u3001\u7ea6\u5b9a\u3001\u5267\u60c5')+tab([['\u5168\u90e8','memory'],['\u5f85\u786e\u8ba4','spark'],['\u5267\u60c5','read'],['\u5173\u7cfb','heart']],1)+'<div class="xsj-v4-card soft"><div class="xsj-v4-section-title">\u5f85\u786e\u8ba4\u8bb0\u5fc6</div><div class="xsj-v4-note" style="margin-top:10px;">\u4ece\u6700\u8fd1\u804a\u5929\u4e2d\u63d0\u53d6\u5230\uff1a\u4f60\u5e0c\u671b\u89d2\u8272\u4e3b\u52a8\u8054\u7cfb\u65f6\u8981\u6709\u65f6\u95f4\u548c\u60c5\u7eea\u903b\u8f91\uff0c\u4e0d\u8981\u7a81\u7136\u51fa\u73b0\u3002</div><div class="xsj-v4-dual" style="margin-top:12px;"><button class="xsj-v4-btn ghost">\u4fee\u6539</button><button class="xsj-v4-btn">\u4fdd\u5b58</button></div></div><div class="xsj-v4-grid3">'+metric('48','\u957f\u671f\u8bb0\u5fc6')+metric('9','\u91cd\u8981\u7ea6\u5b9a')+metric('6','\u5267\u60c5\u6458\u8981')+'</div>'+section('\u89d2\u8272\u8bb0\u5fc6','\u7ba1\u7406',row('heart','\u5173\u7cfb\u504f\u597d','\u559c\u6b22\u6162\u4e00\u70b9\u3001\u66f4\u50cf\u771f\u4eba\u7684\u56de\u5e94','\u9ad8')+row('read','\u5267\u60c5\u8fdb\u5ea6','\u96e8\u591c\u540e\u7684\u5bf9\u8bdd\u5df2\u8fdb\u5165\u7b2c\u4e8c\u5929\u4e0a\u5348','\u65b0',true)+row('lock','\u91cd\u8981\u7ea6\u5b9a','\u4e0d\u5728\u804a\u5929\u4e2d\u76f4\u63a5\u6253\u7834\u89d2\u8272\u72b6\u6001','\u56fa\u5b9a'))+'<button class="xsj-v4-btn">'+icon('spark')+'\u81ea\u52a8\u603b\u7ed3\u672c\u8f6e\u804a\u5929</button></div>';}
  function forumPost(name,time,text,withImg){return '<div class="xsj-wb-v4-post"><div class="xsj-wb-v4-user"><div class="xsj-wb-v4-av">'+icon('user')+'</div><div style="flex:1"><div class="xsj-wb-v4-name">'+name+'</div><div class="xsj-wb-v4-time">'+time+'</div></div><div class="xsj-v4-iconbtn" style="width:30px;height:30px;">'+icon('dots','s16')+'</div></div><div class="xsj-wb-v4-text">'+text+'</div>'+(withImg?'<div class="xsj-wb-v4-grid"><div class="xsj-wb-v4-img">'+icon('image')+'</div><div class="xsj-wb-v4-img">'+icon('image')+'</div><div class="xsj-wb-v4-img">'+icon('image')+'</div></div>':'<div class="xsj-wb-v4-ref">\u8f6c\u53d1\u5230\u804a\u5929\u540e\uff0c\u89d2\u8272\u4f1a\u6839\u636e\u5e16\u5b50\u5185\u5bb9\u7ee7\u7eed\u8ba8\u8bba\u3001\u5410\u69fd\u6216\u4fdd\u5b58\u4e3a\u5173\u7cfb\u8bb0\u5fc6\u3002</div>')+'<div class="xsj-wb-v4-comment"><div><b>\u6211\uff1a</b>\u8fd9\u4e2a\u53ef\u4ee5\u8f6c\u7ed9\u89d2\u8272\u8ba8\u8bba\u5417\uff1f</div><div><b>'+name+'\uff1a</b>\u53ef\u4ee5\uff0c\u4f1a\u4fdd\u7559\u5e16\u5b50\u8bed\u5883\u3002</div></div><div class="xsj-wb-v4-actions"><div class="xsj-wb-v4-act">'+icon('repeat','s16')+'24</div><div class="xsj-wb-v4-act">'+icon('comment','s16')+'18</div><div class="xsj-wb-v4-act">'+icon('heart','s16')+'96</div><div class="xsj-wb-v4-act">'+icon('share','s16')+'TA</div></div></div>';}
  function forum(){return '<div class="xsj-v4-root xsj-wb-v4">'+top('\u8bba\u575b','SOCIAL FORUM','\u50cf\u5fae\u535a\u4e00\u6837\u7684\u5e7f\u573a\uff0c\u89d2\u8272\u548c\u8def\u4eba\u90fd\u53ef\u4ee5\u53c2\u4e0e\u4e92\u52a8','post','edit')+'<div class="xsj-wb-v4-channel"><span class="active">\u5e7f\u573a</span><span>\u5173\u6ce8</span><span>\u89d2\u8272</span><span>\u540c\u57ce</span><span>\u4fe1\u606f</span><span>\u6211\u7684</span></div>'+search('\u641c\u7d22\u5e16\u5b50\u3001\u89d2\u8272\u52a8\u6001\u3001\u8def\u4eba\u8bc4\u8bba')+'<div class="xsj-wb-v4-hot"><span>\u70ed\u8bae \u89d2\u8272\u4e3b\u52a8\u53d1\u4fe1\u606f</span><span>\u65b0\u5e16 \u670b\u53cb\u5708\u8054\u52a8</span><span>\u8ba8\u8bba \u7ebf\u4e0b\u6a21\u5f0f\u6587\u98ce</span></div><div class="xsj-wb-v4-feed">'+forumPost('\u7070\u767d\u5e7f\u573a','12\u5206\u949f\u524d \u00b7 \u6765\u81ea\u5e7f\u573a','\u6709\u6ca1\u6709\u4eba\u4e5f\u559c\u6b22\u628a\u89d2\u8272\u7684\u670b\u53cb\u5708\u3001\u624b\u673a\u8bb0\u5f55\u548c\u804a\u5929\u7ebf\u7d22\u4e32\u8d77\u6765\uff1f\u8fd9\u6837\u4f1a\u611f\u89c9\u4ed6\u771f\u7684\u5728\u751f\u6d3b\u3002',true)+forumPost('\u89d2\u8272\u52a8\u6001 bot','\u521a\u521a \u00b7 \u89d2\u8272\u4e92\u52a8','\u53ef\u4ee5\u628a\u5e16\u5b50\u8f6c\u53d1\u7ed9\u89d2\u8272\uff0c\u89d2\u8272\u4f1a\u6839\u636e\u5185\u5bb9\u7ee7\u7eed\u804a\u5929\u3002',false)+forumPost('\u65e5\u5e38\u5267\u60c5\u7814\u7a76\u6240','35\u5206\u949f\u524d \u00b7 \u5173\u6ce8','\u7ebf\u4e0b\u6a21\u5f0f\u6700\u597d\u4e0d\u8981\u6bcf\u6b21\u90fd\u5199\u5f88\u6ee1\u3002\u7559\u4e00\u70b9\u7a7a\u767d\uff0c\u89d2\u8272\u624d\u4f1a\u50cf\u771f\u4eba\u3002',true)+'</div><div class="xsj-v4-fab">'+icon('pen','s24')+'</div></div>';}
  function product(p){return '<div class="xsj-tb-v4-item"><div class="xsj-tb-v4-img">'+icon(p[3],'s28')+'</div><div class="xsj-tb-v4-name">'+p[0]+'</div><div class="xsj-tb-v4-sub">'+p[1]+'</div><div class="xsj-tb-v4-price"><div class="xsj-tb-v4-num">'+p[2]+'</div><div class="xsj-tb-v4-add">'+icon('plus','s16')+'</div></div></div>';}
  function shop(forChat){var ch=forChat?[['\u793c\u7269','gift'],['\u4ee3\u4ed8','wallet'],['\u6253\u8f66','car'],['\u8ba2\u5355','bag'],['\u8d2d\u7269\u8f66','cart']]:[['\u63a8\u8350','spark'],['\u89d2\u8272','user'],['\u7f8e\u5316','pen'],['\u63d2\u4ef6','play'],['\u5b57\u4f53','book']];var ps=forChat?[["\u767d\u8272\u56f4\u5dfe","\u53ef\u9001\u7ed9\u89d2\u8272 \u00b7 \u5173\u7cfb\u8bb0\u5f55","39","gift"],["\u8349\u8393\u86cb\u7cd5","\u627e\u89d2\u8272\u4ee3\u4ed8 \u00b7 \u804a\u5929\u5361\u7247","26","wallet"],["\u591c\u95f4\u6253\u8f66","\u8ba9\u89d2\u8272\u5e2e\u5fd9\u53eb\u8f66","18","car"],["\u5c0f\u718a\u6302\u4ef6","\u60c5\u4fa3\u7a7a\u95f4\u5171\u540c\u7269\u54c1","22","heart"]]:[["\u65e5\u5e38\u966a\u4f34\u89d2\u8272\u5305","\u670b\u53cb\u5708\u3001\u8bb0\u5fc6\u3001\u901a\u8bdd\u8bed\u6c14","28","user"],["\u7070\u767d\u6c14\u6ce1\u5957\u88c5","\u804a\u5929 CSS \u4e0e\u5b57\u4f53\u9884\u89c8","12","message"],["\u4e3b\u52a8\u6d88\u606f\u63d2\u4ef6","\u540e\u53f0\u4fdd\u6d3b\u3001\u4e3b\u52a8\u901a\u77e5","19","spark"],["\u4e16\u754c\u4e66\u6a21\u677f\u5305","\u7ebf\u4e0b\u6a21\u5f0f\u6ce8\u5165\u9884\u8bbe","16","book"]];return '<div class="xsj-v4-root xsj-tb-v4">'+top(forChat?'\u8d2d\u7269':'\u5546\u57ce',forChat?'CHAT SHOPPING':'SOFT STORE',forChat?'\u50cf\u6dd8\u5b9d\u4e00\u6837\u6311\u9009\u793c\u7269\u3001\u4ee3\u4ed8\u548c\u6253\u8f66':'\u7cfb\u7edf\u8d44\u6e90\u3001\u7f8e\u5316\u3001\u63d2\u4ef6\u548c\u89d2\u8272\u5305','cart','cart')+'<div class="xsj-tb-v4-searchrow">'+search(forChat?'\u641c\u7d22\u793c\u7269\u3001\u4ee3\u4ed8\u3001\u6253\u8f66':'\u641c\u7d22\u89d2\u8272\u5305\u3001\u7f8e\u5316\u3001\u4e16\u754c\u4e66')+'<div class="xsj-v4-iconbtn dark">'+icon('cart')+'</div></div><div class="xsj-tb-v4-channels">'+ch.map(function(x){return '<div class="xsj-tb-v4-channel">'+icon(x[1],'s20')+'<span>'+x[0]+'</span></div>';}).join('')+'</div><div class="xsj-tb-v4-banner"><div><div class="xsj-v4-kicker">'+(forChat?'FOR CHAT':'TODAY')+'</div><div class="xsj-tb-v4-title">'+(forChat?'\u804a\u5929\u91cc\u7684\u771f\u5b9e\u8d2d\u7269\u95ed\u73af':'\u7070\u767d\u9ad8\u7ea7\u7248\u8d44\u6e90\u5546\u57ce')+'</div><div class="xsj-tb-v4-desc">'+(forChat?'\u9001\u793c\u3001\u4ee3\u4ed8\u3001\u8ba2\u5355\u3001\u8d2d\u7269\u8f66\u90fd\u4f1a\u4ee5\u804a\u5929\u5361\u7247\u5f62\u5f0f\u7559\u75d5\u3002':'\u53ef\u8d2d\u4e70\u89d2\u8272\u3001\u63d2\u4ef6\u3001\u5b57\u4f53\u3001\u4e16\u754c\u4e66\u548c\u7f8e\u5316\u9884\u8bbe\u3002')+'</div></div><div class="xsj-v4-pill dark">\u63a8\u8350</div></div>'+pills(['\u731c\u4f60\u559c\u6b22','\u6700\u8fd1\u6d4f\u89c8','\u53ef\u8f6c\u53d1','\u89d2\u8272\u9002\u7528','\u6211\u7684\u8ba2\u5355'],0)+'<div class="xsj-tb-v4-waterfall">'+ps.map(product).join('')+'</div><div class="xsj-tb-v4-bottom"><div class="active">'+icon('spark','s16')+'\u9996\u9875</div><div>'+icon('book','s16')+'\u5206\u7c7b</div><div>'+icon('bag','s16')+'\u8ba2\u5355</div><div>'+icon('user','s16')+'\u6211\u7684</div></div></div>';}
  function view(){var apps=[['\u5fae\u4fe1','message'],['\u901a\u8bdd','phone'],['\u5907\u5fd8\u5f55','pen'],['\u76f8\u518c','image'],['\u94b1\u5305','wallet'],['\u6d4f\u89c8\u5668','globe'],['\u8d2d\u7269','cart'],['\u6e38\u620f','play']];return '<div class="xsj-v4-root">'+top('\u67e5\u770b','ROLE PHONE','\u67e5\u770b\u89d2\u8272\u7684\u624b\u673a\u8bb0\u5f55\uff0c\u53ef\u6279\u91cf\u6216\u5355\u72ec\u751f\u6210','scan','phone')+'<div class="xsj-v4-phone"><div class="xsj-v4-phone-screen"><div class="xsj-v4-statusbar"><span>09:41</span><span>TA phone</span></div><div class="xsj-v4-miniapp-grid">'+apps.map(function(a){return '<div class="xsj-v4-miniapp"><div class="xsj-v4-miniapp-i">'+icon(a[1])+'</div><span>'+a[0]+'</span></div>';}).join('')+'</div><div class="xsj-v4-card soft" style="margin-top:auto;"><div class="xsj-v4-section-title">\u6700\u8fd1\u751f\u6210</div><div class="xsj-v4-note" style="margin-top:8px;">\u5fae\u4fe1\u804a\u5929\u8bb0\u5f55 18 \u6761\uff0c\u5907\u5fd8\u5f55 3 \u6761\uff0c\u76f8\u518c 12 \u5f20\u3002</div></div></div></div>'+section('\u53ef\u751f\u6210\u5185\u5bb9','\u6279\u91cf',row('message','\u5fae\u4fe1\u8054\u7cfb\u4eba\u548c\u804a\u5929\u8bb0\u5f55','\u5173\u7cfb\u7f51\u3001\u672a\u8bfb\u3001\u7f6e\u9876\u3001\u901a\u8bdd\u75d5\u8ff9','\u751f\u6210')+row('image','\u76f8\u518c\u548c\u8bba\u575b\u53d1\u8a00','\u751f\u6d3b\u7167\u3001\u622a\u56fe\u3001\u8def\u4eba\u4e92\u52a8','\u9884\u89c8',true)+row('globe','\u6d4f\u89c8\u5668\u548c\u8d2d\u7269\u8bb0\u5f55','\u641c\u7d22\u8bb0\u5f55\u3001\u5546\u54c1\u8bb0\u5f55\u3001\u8ba2\u5355','\u751f\u6210'))+'</div>';}
  function pet(){return '<div class="xsj-v4-root">'+top('\u5ba0\u7269','PET ROOM','\u548c\u89d2\u8272\u5171\u540c\u9886\u517b\uff0c\u5ba0\u7269\u53ef\u4ee5\u63d2\u8bdd\u548c\u7559\u4e0b\u72b6\u6001','feed','pet')+'<div class="xsj-pet-stage"><div class="xsj-pet-figure"><div class="xsj-pet-ear left"></div><div class="xsj-pet-ear right"></div><div class="xsj-pet-mouth"></div></div></div><div class="xsj-v4-grid2"><div class="xsj-v4-card"><div class="xsj-v4-rowtitle">\u9971\u98df\u5ea6</div><div class="xsj-pet-bar"><span style="width:72%"></span></div></div><div class="xsj-v4-card"><div class="xsj-v4-rowtitle">\u4eb2\u5bc6\u5ea6</div><div class="xsj-pet-bar"><span style="width:86%"></span></div></div></div><div class="xsj-pet-actions"><div class="xsj-pet-action">'+icon('gift')+'\u5582\u517b</div><div class="xsj-pet-action">'+icon('play')+'\u73a9\u800d</div><div class="xsj-pet-action">'+icon('map')+'\u6563\u6b65</div><div class="xsj-pet-action">'+icon('message')+'\u5bf9\u8bdd</div></div><div class="xsj-v4-card"><div class="xsj-v4-section-title">\u4eca\u65e5\u52a8\u6001</div><div class="xsj-v4-note" style="margin-top:8px;">TA \u521a\u521a\u5582\u8fc7\u5ba0\u7269\uff0c\u5ba0\u7269\u60f3\u628a\u4e00\u53e5\u8bdd\u5e26\u5230\u4f60\u4eec\u7684\u804a\u5929\u91cc\u3002</div></div></div>';}
  function ao3(){return '<div class="xsj-v4-root">'+top('AO3','FAN WORKS','\u5199\u540c\u4eba\u6587\u3001\u53d1\u5e03\u4f5c\u54c1\uff0c\u4e5f\u53ef\u4ee5\u8f6c\u53d1\u7ed9\u89d2\u8272\u8ba8\u8bba','write','pen')+search('\u641c\u7d22\u4f5c\u54c1\u3001CP\u3001\u6807\u7b7e\u3001\u4f5c\u8005')+tab([['\u63a8\u8350','spark'],['\u5206\u7c7b','book'],['\u6211\u7684\u4f5c\u54c1','pen'],['\u6536\u85cf','heart']],0)+'<div class="xsj-v4-card"><div class="xsj-v4-kicker">FEATURED WORK</div><div class="xsj-v4-title" style="font-size:22px;margin-top:8px;">\u96e8\u591c\u540e\u7684\u4e00\u5c01\u56de\u4fe1</div><div class="xsj-v4-note" style="margin-top:10px;">\u65e5\u5e38\u3001\u6162\u70ed\u3001\u60c5\u7eea\u7559\u767d\uff0c\u53ef\u8ba9\u89d2\u8272\u70b9\u8bc4\u3001\u7eed\u5199\u6216\u8f6c\u5165\u7ebf\u4e0b\u6a21\u5f0f\u3002</div><div style="margin-top:12px;">'+pills(['G','\u65e5\u5e38','\u4e66\u4fe1','\u6162\u70ed'],1)+'</div></div>'+section('\u4f5c\u54c1\u5217\u8868','\u66f4\u591a',row('book','\u4fbf\u5229\u5e97\u95e8\u53e3','\u5b57\u6570 4.2k \u00b7 \u8bc4\u8bba 28 \u00b7 \u70ed\u5ea6 136','\u9605\u8bfb')+row('pen','\u672a\u53d1\u9001\u7684\u8bed\u97f3','\u53ef\u4f5c\u4e3a\u8bed\u97f3\u901a\u8bdd\u5267\u60c5\u7d20\u6750','\u7eed\u5199',true)+row('share','\u8f6c\u7ed9 TA \u8ba8\u8bba','\u89d2\u8272\u53ef\u8bc4\u8bba\u5267\u60c5\u548c\u6587\u98ce','\u8f6c\u53d1'))+'</div>';}
  function game(){return '<div class="xsj-v4-root">'+top('\u6e38\u620f','GAME LOG','\u8bb0\u5f55\u89d2\u8272\u7684\u6e38\u620f\u72b6\u6001\u3001\u6218\u7ee9\u548c\u5f00\u9ed1\u9080\u8bf7','play','play')+'<div class="xsj-v4-card"><div class="xsj-v4-section-title">\u6b63\u5728\u6e38\u73a9</div><div class="xsj-v4-note" style="margin-top:8px;">\u4ed6\u5df2\u7ecf\u5728\u623f\u95f4\u91cc\u7b49\u4e86 12 \u5206\u949f\uff0c\u53ef\u4ee5\u53d1\u9001\u7ec4\u961f\u9080\u8bf7\u5230\u804a\u5929\u3002</div></div><div class="xsj-v4-grid3">'+metric('76','\u80dc\u7387')+metric('4','\u8fde\u80dc')+metric('12m','\u5728\u7ebf')+'</div>'+section('\u6700\u8fd1\u8bb0\u5f55','\u5168\u90e8',row('play','\u6df1\u591c\u6392\u4f4d','\u8f93\u4e86\u4e00\u5c40\uff0c\u4f46\u6700\u540e\u8fd8\u5728\u7b49\u4f60\u4e0a\u7ebf','\u521a\u521a')+row('message','\u7ec4\u961f\u9080\u8bf7','\u53ef\u4ee5\u4e00\u952e\u53d1\u5230\u804a\u5929','\u9080\u8bf7',true)+row('spark','\u89d2\u8272\u53cd\u5e94','\u8d62\u4e86\u4f1a\u9ad8\u5174\uff0c\u8f93\u4e86\u4f1a\u77ed\u6682\u6c89\u9ed8','\u8bbe\u7f6e'))+'</div>';}
  var renderers={worldbook:worldbook,memory:memory,forum:forum,shop:function(){return shop(false);},view:view,pet:pet,ao3:ao3,game:game};
  function render(name){var r=document.getElementById('xsj-app-root-'+name);if(!r||!renderers[name])return;var ov=document.getElementById('app-overlay');if(ov){ov.classList.add('xsj-v4-app');ov.classList.toggle('xsj-v4-forum',name==='forum');ov.classList.toggle('xsj-v4-shop',name==='shop');}r.innerHTML=renderers[name]();}
  var prevOpen=window.openApp;
  if(typeof prevOpen==='function'&&!prevOpen._xsjV4){window.openApp=function(name){prevOpen(name);setTimeout(function(){render(name);},30);};window.openApp._xsjV4=true;}
  var oldFeature=window.xsjOpenFeature;
  function setFeature(title,sub,html){if(typeof oldFeature==='function')oldFeature('xsj-v4-placeholder',title);setTimeout(function(){var ov=document.getElementById('xsj-feature-overlay');if(ov)ov.classList.add('xsj-feature-overlay-v4');var tt=document.getElementById('xsj-feature-title'),ss=document.getElementById('xsj-feature-sub'),bb=document.getElementById('xsj-feature-body');if(tt)tt.innerHTML=title;if(ss)ss.innerHTML=sub;if(bb)bb.innerHTML=html;},0);}
  function feature(key,label){
    if(key==='shopping'){setFeature('\u8d2d\u7269','taobao-like chat shopping',shop(true));return true;}
    if(key==='voice-call'){setFeature('\u8bed\u97f3\u901a\u8bdd','live call with text input','<div class="xsj-fv4-call"><div><div class="xsj-fv4-call-avatar">'+icon('mic','s28')+'</div><div class="xsj-v4-title" style="font-size:24px;text-align:center;">'+(label||'TA')+'</div><div class="xsj-v4-sub" style="text-align:center;margin-top:6px;">\u6b63\u5728\u901a\u8bdd 02:14 \u00b7 \u5bf9\u65b9\u6b63\u5728\u542c\u4f60\u8bf4</div></div><div class="xsj-v4-card"><div class="xsj-v4-note"><b>\u6211</b> \u4eca\u5929\u6709\u70b9\u7d2f\uff0c\u60f3\u542c\u4f60\u8bf4\u8bdd\u3002</div><div class="xsj-v4-note" style="margin-top:10px;"><b>TA</b> \u90a3\u4f60\u5148\u4e0d\u7528\u7ec4\u7ec7\u8bed\u8a00\uff0c\u6211\u5728\u8fd9\u8fb9\u966a\u4f60\u3002</div><input class="xsj-v4-input" style="margin-top:12px;" placeholder="\u8f93\u5165\u4f60\u60f3\u8bf4\u7684\u8bdd"></div><div class="xsj-fv4-controls"><div class="xsj-fv4-control">'+icon('mic')+'\u9759\u97f3</div><div class="xsj-fv4-control">'+icon('phone')+'\u514d\u63d0</div><div class="xsj-fv4-control end" onclick="xsjCloseFeature()">'+icon('phone')+'\u7ed3\u675f</div></div></div>');return true;}
    if(key==='video-call'){setFeature('\u89c6\u9891\u901a\u8bdd','video call interface','<div class="xsj-fv4-video"><div class="xsj-fv4-self">'+icon('user','s24')+'<br>\u6211\u7684\u753b\u9762</div><div>'+icon('video','s28')+'<div style="margin-top:12px;">TA \u6b63\u5728\u770b\u5411\u4f60</div></div><div class="xsj-fv4-caption">TA\uff1a\u6211\u770b\u89c1\u4f60\u4e86\u3002\u4eca\u5929\u7684\u5149\u7ebf\u5f88\u67d4\u548c\uff0c\u4f60\u50cf\u662f\u521a\u521a\u5750\u4e0b\u6765\u3002</div><div class="xsj-fv4-inputbar"><input placeholder="\u8f93\u5165\u4f60\u8981\u8bf4\u7684\u8bdd"><button class="xsj-v4-btn" style="width:74px;height:42px;">\u53d1\u9001</button></div></div>');return true;}
    if(key==='listen-together'){setFeature('\u4e00\u8d77\u542c\u6b4c','netease-like music room','<div class="xsj-v4-root"><div class="xsj-fv4-music-disc"></div><div style="text-align:center;"><div class="xsj-v4-title" style="font-size:23px;">\u5728\u4e00\u8d77\u542c</div><div class="xsj-v4-sub">\u8fde\u63a5\u7f51\u6613\u4e91\u540e\uff0c\u89d2\u8272\u4f1a\u56f4\u7ed5\u6b4c\u8bcd\u3001\u66f2\u98ce\u548c\u4f60\u7684\u72b6\u6001\u8ba8\u8bba\u3002</div></div><div class="xsj-fv4-lyric"><div>\u665a\u98ce\u628a\u57ce\u5e02\u5439\u5f97\u5f88\u8f7b</div><div class="active">\u8fd9\u4e00\u53e5\u50cf\u4f60\u4eca\u5929\u6ca1\u6709\u8bf4\u51fa\u53e3\u7684\u8bdd</div><div>\u6211\u4eec\u6162\u6162\u8d70\uff0c\u4e0d\u6025\u7740\u56de\u5bb6</div></div><div class="xsj-v4-dual"><button class="xsj-v4-btn ghost">'+icon('music')+'\u65b0\u5efa\u6b4c\u5355</button><button class="xsj-v4-btn">'+icon('share')+'\u8f6c\u53d1</button></div></div>');return true;}
    if(key==='location'){setFeature('\u4f4d\u7f6e','greyscale map card','<div class="xsj-v4-root"><div class="xsj-v4-search">'+icon('search')+'<span>\u641c\u7d22\u5730\u70b9\u6216\u8f93\u5165\u5b9a\u4f4d\u8bf4\u660e</span></div><div class="xsj-fv4-map"><div class="xsj-fv4-map-pin"></div></div><div class="xsj-v4-card"><div class="xsj-v4-rowtitle">\u5f53\u524d\u4f4d\u7f6e</div><div class="xsj-v4-rowdesc">\u767d\u8272\u8857\u533a \u00b7 \u8ddd\u79bb\u89d2\u8272 2.4km</div><div class="xsj-v4-note" style="margin-top:10px;">\u53d1\u9001\u540e\u4f1a\u5728\u804a\u5929\u4e2d\u663e\u793a\u5730\u56fe\u5361\u7247\uff0c\u89d2\u8272\u53ef\u4ee5\u6839\u636e\u65f6\u95f4\u5730\u70b9\u4e3b\u52a8\u56de\u5e94\u3002</div></div><button class="xsj-v4-btn">'+icon('share')+'\u53d1\u9001\u7ed9\u89d2\u8272</button></div>');return true;}
    return false;
  }
  window.xsjOpenFeature=function(key,label){if(feature(key,label))return;if(typeof oldFeature==='function')return oldFeature(key,label);};
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){try{['worldbook','memory','forum','shop','view','pet','ao3','game'].forEach(render);}catch(e){}},80);});
})();


// ══ patch ══

(function(){
  function svg(body,cls){return '<span class="xsj-v5-ico '+(cls||'')+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+body+'</svg></span>';}
  var P={
    settings:'<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1.08H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z"></path>',
    world:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M8 7h7"></path><path d="M8 11h9"></path><path d="M8 15h5"></path>',
    memory:'<path d="M9 3h6a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"></path><path d="M9 8h6"></path><path d="M9 12h3"></path><path d="M15.5 14.5 18 17"></path><circle cx="14" cy="13" r="2.5"></circle>',
    chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path>',
    forum:'<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h9"></path><circle cx="18" cy="19" r="2"></circle>',
    game:'<rect x="2.5" y="7" width="19" height="10" rx="3"></rect><path d="M7 12h4"></path><path d="M9 10v4"></path><path d="M16 11h.01"></path><path d="M19 13h.01"></path>',
    beautify:'<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path><path d="M14 6l4 4"></path>',
    shop:'<path d="M6 7h12l-1 13H7z"></path><path d="M9 7a3 3 0 0 1 6 0"></path><path d="M9 11h.01"></path><path d="M15 11h.01"></path>',
    view:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>',
    pet:'<path d="M8 5c-1.6-2-4-1.4-4 1.2 0 1.8 1.4 3.1 3 3.8"></path><path d="M16 5c1.6-2 4-1.4 4 1.2 0 1.8-1.4 3.1-3 3.8"></path><path d="M6 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6z"></path><path d="M10 14h.01"></path><path d="M14 14h.01"></path><path d="M10.5 17c.8.6 2.2.6 3 0"></path>',
    ao3:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M9 7h7"></path><path d="M9 11h4"></path><path d="M16 15l1 1 2-2"></path>',
    search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',cart:'<path d="M6 6h15l-2 9H8L6 3H3"></path><circle cx="9" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle>',bag:'<path d="M6 7h12l-1 13H7z"></path><path d="M9 7a3 3 0 0 1 6 0"></path>',shirt:'<path d="M8 4 5 6 3 10l4 2v8h10v-8l4-2-2-4-3-2a4 4 0 0 1-8 0z"></path>',phone:'<rect x="6" y="2" width="12" height="20" rx="3"></rect><path d="M10 18h4"></path>',makeup:'<path d="M8 3h8v5l-2 3v10h-4V11L8 8z"></path><path d="M10 7h4"></path>',snack:'<path d="M7 3h10l1 18H6z"></path><path d="M8 7h8"></path><path d="M9 12h6"></path>',home:'<path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M10 20v-6h4v6"></path>',flower:'<path d="M12 12c3-3 6-1 6 2s-3 4-6 1c-3 3-6 1-6-2s3-4 6-1z"></path><path d="M12 12c-3-3-1-6 2-6s4 3 1 6c3 3 1 6-2 6s-4-3-1-6z"></path>',gift:'<path d="M20 12v8H4v-8"></path><path d="M2 7h20v5H2z"></path><path d="M12 7v13"></path><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5L12 7zm0 0h3.5A2.5 2.5 0 1 0 13 4.5L12 7z"></path>',car:'<path d="M5 12 7 6h10l2 6"></path><path d="M3 12h18v6H3z"></path><path d="M7 18v2"></path><path d="M17 18v2"></path><path d="M7 15h.01"></path><path d="M17 15h.01"></path>',heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>',message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>',share:'<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="M8.6 10.6 15.4 6.4"></path><path d="M8.6 13.4 15.4 17.6"></path>',repeat:'<path d="M17 2l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>',plus:'<path d="M12 5v14"></path><path d="M5 12h14"></path>',pen:'<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path>',user:'<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',music:'<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',map:'<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>',mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><path d="M12 19v3"></path>',video:'<rect x="3" y="6" width="13" height="12" rx="2"></rect><path d="m16 10 5-3v10l-5-3z"></path>',trash:'<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 15H6L5 6"></path>',spark:'<path d="M4 20 20 4"></path><path d="M14.5 4.5 19.5 9.5"></path>',list:'<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>',wallet:'<path d="M3 7a3 3 0 0 1 3-3h13v16H6a3 3 0 0 1-3-3z"></path><path d="M16 12h5v5h-5a2.5 2.5 0 0 1 0-5z"></path>',clock:'<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>'
  };
  function ico(k,c){return svg(P[k]||P.spark,c);}
  window.xsjV5Icon=ico;
  var state={shop:'home',forum:'home',ao3:'home',pet:'home',view:'home',worldbook:'home',memory:'home',game:'home'};
  function head(title,kicker,sub,actions){return '<div class="xsj-v5-head"><div class="xsj-v5-titlebar"><div class="xsj-v5-titlebox"><div class="xsj-v5-kicker">'+kicker+'</div><div class="xsj-v5-title">'+title+'</div><div class="xsj-v5-sub">'+sub+'</div></div><div class="xsj-v5-actions">'+(actions||'')+'</div></div></div>';}
  function search(ph){return '<div class="xsj-v5-search">'+ico('search')+'<input placeholder="'+ph+'"></div>';}
  function tab(app,arr,active){return '<div class="xsj-v5-tabs">'+arr.map(function(a){return '<div class="xsj-v5-tab '+(a[0]===active?'active':'')+'" onclick="xsjV5Nav(\''+app+'\',\''+a[0]+'\')">'+ico(a[2]||'spark','s14')+a[1]+'</div>';}).join('')+'</div>';}
  function bottom(app,arr,active){return '<div class="xsj-v5-bottomnav">'+arr.map(function(a){return '<div class="xsj-v5-bottomitem '+(a[0]===active?'active':'')+'" onclick="xsjV5Nav(\''+app+'\',\''+a[0]+'\')">'+ico(a[2]||'spark','s16')+'<span>'+a[1]+'</span></div>';}).join('')+'</div>';}
  function pill(t,d){return '<span class="xsj-v5-pill '+(d?'dark':'')+'">'+t+'</span>';}
  function pills(arr,idx){return '<div class="xsj-v5-pills">'+arr.map(function(t,i){return pill(t,i===idx);}).join('')+'</div>';}
  function section(t,m,body){return '<div class="xsj-v5-section"><div class="xsj-v5-section-head"><div class="xsj-v5-section-title">'+t+'</div><div class="xsj-v5-section-more">'+(m||'')+'</div></div>'+body+'</div>';}
  function row(ic,t,d,s,alt,onclick){return '<div class="xsj-v5-row '+(alt?'alt':'')+'" '+(onclick?'onclick="'+onclick+'"':'')+'><div class="xsj-v5-rowicon">'+ico(ic)+'</div><div class="xsj-v5-rowmain"><div class="xsj-v5-rowtitle">'+t+'</div><div class="xsj-v5-rowdesc">'+d+'</div></div><div class="xsj-v5-side">'+s+'</div></div>';}
  var products=[
    ['shirt','奶白色针织开衫','128','2.4k','衣服','可送TA'],['phone','轻薄无线耳机','199','8.8k','数码','一起听歌'],['makeup','低饱和口红礼盒','89','1.2k','美妆','礼物'],['snack','夜宵零食组合','39.9','5.1k','零食','即时配送'],['home','云朵抱枕毯','76','3.3k','家居','情侣空间'],['flower','白色小花束','58','960','鲜花','送TA'],['gift','手写情书礼盒','45','2.1k','礼物','可留言'],['car','夜间打车券','24','12k','出行','帮忙打车'],['pet','宠物粮试吃装','26','840','宠物','一起喂养'],['bag','灰白通勤托特包','139','1.8k','包袋','日常']
  ];
  function productCard(p){return '<div class="xsj-v5-product" onclick="xsjV5ProductDetail(\''+p[1]+'\',\''+p[2]+'\',\''+p[0]+'\')"><div class="xsj-v5-product-img">'+ico(p[0],'s28')+'</div><div class="xsj-v5-product-name">'+p[1]+'</div><div class="xsj-v5-product-meta"><div class="xsj-v5-price">￥'+p[2]+'</div><div class="xsj-v5-sold">已售 '+p[3]+'</div></div><div class="xsj-v5-product-tags"><span class="xsj-v5-product-tag">'+p[4]+'</span><span class="xsj-v5-product-tag">'+p[5]+'</span></div></div>';}
  function shop(view,compact){view=view||state.shop;var top=head(compact?'购物':'商城','MARKET','像淘宝一样买真实商品，可送角色、找角色代付、查看订单','<div class="xsj-v5-iconbtn">'+ico('bell')+'</div><div class="xsj-v5-iconbtn dark" onclick="xsjV5Nav(\'shop\',\'cart\')">'+ico('cart')+'</div>');var tabs=tab('shop',[['home','首页','home'],['category','分类','list'],['cart','购物车','cart'],['orders','订单','bag'],['me','我的','user']],view);var html='';
    if(view==='home')html='<div class="xsj-v5-shopbar">'+search('搜索衣服、耳机、零食、鲜花、打车券')+'<div class="xsj-v5-iconbtn">'+ico('camera')+'</div></div><div class="xsj-v5-shop-catgrid">'+[['衣服','shirt'],['数码','phone'],['美妆','makeup'],['零食','snack'],['家居','home'],['鲜花','flower'],['礼物','gift'],['打车','car'],['宠物','pet'],['包袋','bag']].map(function(c){return '<div class="xsj-v5-shop-cat" onclick="xsjV5Nav(\'shop\',\'category\')">'+ico(c[1])+'<span>'+c[0]+'</span></div>';}).join('')+'</div><div class="xsj-v5-shop-hero"><div><h3>今晚也可以给TA挑点东西</h3><p>商品会以聊天卡片发送，可选择代付、送礼、一起挑选或加入购物车。</p></div><div class="xsj-v5-shop-bag">'+ico('bag','s28')+'</div></div>'+pills(['猜你喜欢','送TA礼物','附近配送','低价好物','购物车同款'],0)+'<div class="xsj-v5-product-grid">'+products.slice(0,8).map(productCard).join('')+'</div>';
    if(view==='category')html=search('在分类里搜索')+'<div class="xsj-v5-grid2">'+[['服饰穿搭','shirt','开衫、裙子、托特包、睡衣'],['数码影音','phone','耳机、充电器、拍立得、键盘'],['零食饮料','snack','夜宵、甜点、咖啡、茶包'],['家居生活','home','抱枕、香薰、床品、灯具'],['鲜花礼物','flower','花束、情书、手作小物'],['出行服务','car','打车券、酒店、路线规划']].map(function(c,i){return '<div class="xsj-v5-card '+(i%2?'soft':'')+'"><div class="xsj-v5-rowicon">'+ico(c[1])+'</div><div class="xsj-v5-section-title" style="margin-top:12px;">'+c[0]+'</div><div class="xsj-v5-rowdesc" style="white-space:normal;">'+c[2]+'</div></div>';}).join('')+'</div>'+section('分类推荐','全部','<div class="xsj-v5-product-grid">'+products.slice(2,10).map(productCard).join('')+'</div>');
    if(view==='cart')html='<div class="xsj-v5-cart-list">'+products.slice(0,4).map(function(p,i){return '<div class="xsj-v5-cart-item"><div class="xsj-v5-cart-thumb">'+ico(p[0])+'</div><div style="flex:1;min-width:0;"><div class="xsj-v5-rowtitle">'+p[1]+'</div><div class="xsj-v5-rowdesc">'+p[4]+' · '+p[5]+'</div><div class="xsj-v5-product-meta"><div class="xsj-v5-price">￥'+p[2]+'</div><div class="xsj-v5-pill">x '+(i+1)+'</div></div></div></div>';}).join('')+'</div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">'+ico('share')+'找TA代付</button><button class="xsj-v5-btn">'+ico('cart')+'结算</button></div>';
    if(view==='orders')html='<div class="xsj-v5-root" style="gap:10px;">'+['待付款','配送中','已送达'].map(function(s,i){var p=products[i+4];return '<div class="xsj-v5-order-card"><div class="xsj-v5-order-top"><span>订单 '+(240500+i)+'</span><span>'+s+'</span></div><div class="xsj-v5-cart-item" style="background:var(--layer-2);padding:10px;"><div class="xsj-v5-cart-thumb" style="background:var(--bg);">'+ico(p[0])+'</div><div style="flex:1;"><div class="xsj-v5-rowtitle">'+p[1]+'</div><div class="xsj-v5-rowdesc">收货备注：可作为聊天礼物卡</div><div class="xsj-v5-price" style="margin-top:6px;">￥'+p[2]+'</div></div></div></div>';}).join('')+'</div>';
    if(view==='me')html='<div class="xsj-v5-grid3"><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">12</div><div class="xsj-v5-rowdesc">收藏</div></div><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">8</div><div class="xsj-v5-rowdesc">订单</div></div><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">3</div><div class="xsj-v5-rowdesc">代付</div></div></div>'+section('我的购物','管理',row('cart','购物车','衣服、耳机、花束等 4 件商品','查看')+row('gift','送礼记录','送给角色的礼物、情书和花束','查看',true)+row('car','打车记录','角色帮忙叫车或路线规划记录','查看'));
    return '<div class="xsj-v5-root xsj-v5-shop">'+top+tabs+html+(compact?'':bottom('shop',[['home','首页','home'],['category','分类','list'],['cart','购物车','cart'],['orders','订单','bag'],['me','我的','user']],view))+'</div>';
  }
  function forum(view){view=view||state.forum;var channels=[['home','广场'],['follow','关注'],['role','角色'],['near','同城'],['message','信息'],['profile','我的']];var ch='<div class="xsj-v5-wb-channel">'+channels.map(function(c){return '<span class="'+(c[0]===view?'active':'')+'" onclick="xsjV5Nav(\'forum\',\''+c[0]+'\')">'+c[1]+'</span>';}).join('')+'</div>';var top=head('论坛','SOCIAL PLAZA','微博式广场、信息流、评论转发和角色路人互动','<div class="xsj-v5-iconbtn">'+ico('search')+'</div><div class="xsj-v5-iconbtn dark" onclick="xsjV5ForumCompose()">'+ico('pen')+'</div>')+ch+'<div class="xsj-v5-hotline">'+ico('bell','s14')+'热议  如何让角色更像真实联系人  ·  情侣空间邀请  ·  今日剧情</div>';var posts=[['林间来信','15分钟前','今天试着让角色主动发朋友圈，发现频率不能太高。真正像活人的感觉，反而来自“偶尔出现”的细节。','世界书读取了咖啡店设定，所以TA在评论里提到了窗边座位。'],['路人账号 A','28分钟前','有人做过角色手机吗？我想看TA的备忘录、浏览器记录和购物车，但是不想做成后台管理器。','评论区：做成手机壳里的二级 App 会更自然。'],['白色街区','1小时前','转发一段同人文给角色讨论，TA居然开始分析文风和心声描写。','来自 AO3 · 雨夜后的一封回信']];var feed='<div class="xsj-v5-wb-feed">'+posts.map(function(p,i){return '<div class="xsj-v5-wb-post"><div class="xsj-v5-wb-user"><div class="xsj-v5-wb-av">'+ico(i===1?'user':'forum')+'</div><div style="flex:1;"><div class="xsj-v5-wb-name">'+p[0]+'</div><div class="xsj-v5-wb-time">'+p[1]+' · '+(i===1?'路人互动':'角色可见')+'</div></div><div class="xsj-v5-iconbtn" style="width:30px;height:30px;">'+ico('list','s14')+'</div></div><div class="xsj-v5-wb-text">'+p[2]+'</div>'+(i===0?'<div class="xsj-v5-wb-imgs"><div class="xsj-v5-wb-img">'+ico('camera')+'</div><div class="xsj-v5-wb-img">'+ico('message')+'</div><div class="xsj-v5-wb-img">'+ico('heart')+'</div></div>':'<div class="xsj-v5-wb-ref">'+p[3]+'</div>')+'<div class="xsj-v5-wb-actions"><div class="xsj-v5-wb-act">'+ico('repeat','s14')+'转发</div><div class="xsj-v5-wb-act">'+ico('message','s14')+'评论</div><div class="xsj-v5-wb-act">'+ico('heart','s14')+'喜欢</div><div class="xsj-v5-wb-act">'+ico('share','s14')+'给TA</div></div><div class="xsj-v5-wb-comments"><div><b>角色</b>：这个设定我会记得，下次聊天时会自然提到。</div><div><b>路人</b>：不要太满，留一点空白会更真。</div></div></div>';}).join('')+'</div><div class="xsj-v5-floating-compose" onclick="xsjV5ForumCompose()">'+ico('pen')+'</div>';var page=feed;
    if(view==='message')page=section('消息','全部',row('message','评论','角色回复了你转发的帖子','2 条')+row('heart','点赞','路人账号 A 喜欢了你的发言','刚刚',true)+row('share','转发','你的帖子被转给角色讨论','12 分钟'));
    if(view==='profile')page='<div class="xsj-v5-card" style="text-align:center;"><div class="xsj-v5-wb-av" style="width:78px;height:78px;margin:0 auto 12px;">'+ico('user','s24')+'</div><div class="xsj-v5-section-title">我的论坛主页</div><div class="xsj-v5-sub" style="margin-top:4px;">帖子 18 · 评论 96 · 角色互动 34</div></div>'+section('我的帖子','管理',row('forum','角色像真人的 UI 细节','已被 3 个角色评论','置顶')+row('message','聊天设置怎么分层','24 条回复','编辑',true));
    return '<div class="xsj-v5-root xsj-v5-forum">'+top+page+'</div>';
  }
  function worldbook(view){view=view||state.worldbook;var top=head('世界书','WORLD BOOK','全局、局部、分类、条目和注入规则管理','<div class="xsj-v5-iconbtn">'+ico('search')+'</div><div class="xsj-v5-iconbtn dark" onclick="xsjV5Nav(\'worldbook\',\'edit\')">'+ico('plus')+'</div>');var tabs=tab('worldbook',[['home','总览','world'],['entries','条目','book'],['edit','编辑','pen'],['style','文风','pen']],view);var html='';
    if(view==='home')html='<div class="xsj-v5-world-graph"><div class="xsj-v5-node dark" style="left:18px;top:22px;">全局世界书</div><div class="xsj-v5-node" style="right:20px;top:34px;">校园分类</div><div class="xsj-v5-node" style="left:52px;bottom:24px;">角色关系</div><div class="xsj-v5-node" style="right:36px;bottom:28px;">线下文风</div><div class="xsj-v5-node-line" style="left:100px;top:55px;width:110px;transform:rotate(8deg);"></div><div class="xsj-v5-node-line" style="left:83px;top:122px;width:120px;transform:rotate(-18deg);"></div></div><div class="xsj-v5-grid3"><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">4</div><div class="xsj-v5-rowdesc">分类</div></div><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">28</div><div class="xsj-v5-rowdesc">条目</div></div><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">6</div><div class="xsj-v5-rowdesc">深度</div></div></div>'+section('最近启用','查看',row('world','白色街区','全局世界书 · 始终注入','启用')+row('book','咖啡店座位','关键词触发：窗边、拿铁、下雨','局部',true));
    if(view==='entries')html=search('搜索条目、关键词、分类')+section('条目列表','新建',row('book','城市背景','注入深度 4 · 优先级高 · 全局','启用')+row('message','角色关系','触发：吃醋、冷淡、约定、未读','启用',true)+row('map','地点设定','咖啡店、学校、便利店、街角','编辑'));
    if(view==='edit')html='<div class="xsj-v5-editor"><input value="雨天便利店"><input value="关键词：雨、便利店、夜宵、伞"><textarea>条目内容：当聊天出现雨天或夜间外出时，角色会自然联想到便利店的灯光、热饮、屋檐下短暂停留。不要强行说明设定，要通过动作和细节体现。</textarea><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">'+ico('trash')+'删除</button><button class="xsj-v5-btn">'+ico('book')+'保存条目</button></div></div>';
    if(view==='style')html='<div class="xsj-v5-card"><div class="xsj-v5-section-title">线下模式文风预设</div><div class="xsj-v5-note" style="margin-top:8px;">旁白偏细腻，心声使用浅灰斜体，对话更短，动作描写避免堆砌形容词。</div></div>'+section('文风模块','导入',row('pen','日常细腻','适合情侣空间、一起阅读、线下剧情','启用')+row('spark','冷淡留白','适合暧昧、拉扯、慢热剧情','预览',true));
    return '<div class="xsj-v5-root">'+top+tabs+html+'</div>';
  }
  function memory(view){view=view||state.memory;var top=head('记忆','MEMORY','查看、确认和总结角色记忆，减少聊天失忆','<div class="xsj-v5-iconbtn">'+ico('search')+'</div><div class="xsj-v5-iconbtn dark" onclick="xsjV5Nav(\'memory\',\'summary\')">'+ico('memory')+'</div>');var tabs=tab('memory',[['home','记忆','memory'],['pending','待确认','bell'],['summary','总结','memory'],['rules','规则','settings']],view);var html='';
    if(view==='home')html='<div class="xsj-v5-memory-card"><div class="xsj-v5-memory-source">'+ico('heart','s14')+'重要记忆 · 关系</div><div class="xsj-v5-note">用户不喜欢角色突然冷淡，除非剧情里有明确原因；如果情绪变化，需要在动作或心声中留下线索。</div><div>'+pills(['固定','全角色','聊天可用'],0)+'</div></div><div class="xsj-v5-memory-card"><div class="xsj-v5-memory-source">'+ico('message','s14')+'聊天总结 · 昨天</div><div class="xsj-v5-note">约定下次一起阅读《便利店门口》第二章，角色会主动提到书里那句关于雨夜的台词。</div></div>'+section('角色记忆','全部',row('user','助手','长期记忆 14 条 · 剧情摘要 3 条','查看')+row('user','创作伙伴','长期记忆 9 条 · 待确认 2 条','查看',true));
    if(view==='pending')html='<div class="xsj-v5-memory-card"><div class="xsj-v5-memory-source">'+ico('bell','s14')+'从聊天提取到</div><div class="xsj-v5-note">用户希望角色主动发信息，但频率不要太高，最好像真实联系人一样偶尔出现。</div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">忽略</button><button class="xsj-v5-btn">保存</button></div></div><div class="xsj-v5-memory-card"><div class="xsj-v5-memory-source">'+ico('book','s14')+'从线下模式提取到</div><div class="xsj-v5-note">雨天便利店是重要场景，适合后续被世界书触发。</div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">修改</button><button class="xsj-v5-btn">保存</button></div></div>';
    if(view==='summary')html='<div class="xsj-v5-timeline"><div class="xsj-v5-timeitem"><div class="xsj-v5-rowtitle">总结聊天</div><div class="xsj-v5-rowdesc">提取关键约定、关系变化、用户偏好</div></div><div class="xsj-v5-timeitem"><div class="xsj-v5-rowtitle">总结剧情</div><div class="xsj-v5-rowdesc">将线下模式长剧情压缩为可读取摘要</div></div><div class="xsj-v5-timeitem"><div class="xsj-v5-rowtitle">生成长期记忆</div><div class="xsj-v5-rowdesc">写入角色长期记忆，并可手动确认</div></div></div><button class="xsj-v5-btn">'+ico('memory')+'开始总结</button>';
    if(view==='rules')html=section('记忆规则','编辑',row('settings','自动提取','聊天超过 20 轮后提取待确认记忆','开启')+row('book','世界书联动','地点、关系、长期设定可转入世界书','开启',true)+row('trash','清理旧记忆','低重要度记忆 30 天后提示清理','关闭'));
    return '<div class="xsj-v5-root">'+top+tabs+html+'</div>';
  }
  function viewApp(view){
    view=view||state.view;
    var platformTabs=tab('view',[
      ['home','总览','home'],['phone','角色手机','phone'],['redbook','小红书','heart'],['live','抖音直播','video'],['batch','批量生成','settings']
    ],view);
    var top=head('查看','VIEW HUB','不只是角色手机，也包含小红书、抖音直播和外部平台式浏览入口','<div class="xsj-v5-iconbtn" onclick="xsjV5Nav(\'view\',\'home\')">'+ico('home')+'</div><div class="xsj-v5-iconbtn dark" onclick="xsjV5Nav(\'view\',\'batch\')">'+ico('settings')+'</div>');
    function phoneShell(content,cls){return '<div class="xsj-v6-phone-shell '+(cls||'')+'"><div class="xsj-v6-phone-screen"><div class="xsj-v6-phone-status"><span>9:41</span><span>'+ico('phone','s14')+'</span></div>'+content+'</div></div>';}
    function appTile(label,ic,target,sub){return '<div class="xsj-v6-app-tile" onclick="xsjV5Nav(\'view\',\''+target+'\')"><div class="xsj-v6-app-ico">'+ico(ic)+'</div><div><div class="xsj-v6-app-title">'+label+'</div><div class="xsj-v6-app-sub">'+sub+'</div></div></div>';}
    function phoneApp(label,ic,target){return '<div class="xsj-v5-phone-app" onclick="xsjV5Nav(\'view\',\''+target+'\')"><div class="xsj-v5-phone-app-i">'+ico(ic)+'</div><span>'+label+'</span></div>';}
    var html='';
    if(view==='home'){
      html='<div class="xsj-v6-view-hero"><div><div class="xsj-v5-kicker">MULTI VIEW</div><div class="xsj-v6-view-title">查看中心</div><div class="xsj-v6-view-desc">角色手机是其中一个入口；小红书、抖音直播、论坛发言、购物浏览都可以作为独立平台生成和查看。</div></div><div class="xsj-v6-view-mark">'+ico('view','s28')+'</div></div>'+
      '<div class="xsj-v6-view-grid">'+
        '<div class="xsj-v6-view-card tall" onclick="xsjV5Nav(\'view\',\'phone\')"><div class="xsj-v6-card-top"><span>角色手机</span>'+ico('phone','s16')+'</div><p>微信联系人、通话、备忘录、相册、钱包、浏览器、购物记录。</p><div class="xsj-v6-card-foot">进入手机桌面</div></div>'+
        '<div class="xsj-v6-view-card" onclick="xsjV5Nav(\'view\',\'redbook\')"><div class="xsj-v6-card-top"><span>小红书</span>'+ico('heart','s16')+'</div><p>笔记流、种草、评论、收藏和转发给角色讨论。</p></div>'+
        '<div class="xsj-v6-view-card" onclick="xsjV5Nav(\'view\',\'live\')"><div class="xsj-v6-card-top"><span>抖音直播</span>'+ico('video','s16')+'</div><p>直播间、弹幕、礼物、连麦和角色旁白评论。</p></div>'+
      '</div>'+
      section('最近查看','管理',row('message','角色微信记录','12 个联系人，3 条未读，2 条语音','刚刚')+row('heart','小红书笔记','深夜便利店穿搭、雨天歌单、城市散步','15 分钟',true)+row('video','直播回放','角色在直播间停留 18 分钟，发过 4 条弹幕','昨天'));
    }
    if(view==='phone'){
      var apps=[['微信','message','chat'],['通话','phone','calls'],['备忘录','book','notes'],['购物','bag','orders'],['钱包','wallet','wallet'],['浏览器','search','browser'],['相册','camera','album'],['论坛','message','forum'],['游戏','spark','game'],['小红书','heart','redbook'],['直播','video','live'],['地图','map','map']];
      html=phoneShell('<div class="xsj-v5-phone-grid">'+apps.map(function(a){return phoneApp(a[0],a[1],a[2]);}).join('')+'</div><div class="xsj-v5-card soft" style="margin-top:auto;"><div class="xsj-v5-section-title">角色手机桌面</div><div class="xsj-v5-note" style="margin-top:8px;">这里负责生成角色自己的手机数据；小红书和直播也可以从桌面进入，但它们同时也是查看中心的独立平台。</div></div>','role-phone')+
      section('手机数据','批量生成',row('message','微信联系人和聊天记录','联系人、置顶、未读、通话痕迹','生成')+row('camera','相册和备忘录','生活照描述、截图、未发送文本','预览',true)+row('search','浏览器和购物记录','搜索记录、商品浏览、订单','生成'));
    }
    if(view==='redbook'){
      html='<div class="xsj-v6-redbook"><div class="xsj-v6-rb-head"><div>'+search('搜索笔记、穿搭、歌单、地点')+'</div><div class="xsj-v5-iconbtn dark">'+ico('plus')+'</div></div><div class="xsj-v6-rb-tabs"><span class="active">推荐</span><span>关注</span><span>附近</span><span>收藏</span><span>角色看过</span></div><div class="xsj-v6-rb-grid">'+
        ['雨天便利店穿搭','今天适合一起听的歌','白色街区咖啡店','送给TA的小东西','凌晨两点的散步','角色收藏的句子'].map(function(t,i){return '<div class="xsj-v6-rb-card"><div class="xsj-v6-rb-img">'+ico(i%2?'camera':'heart','s24')+'</div><div class="xsj-v6-rb-title">'+t+'</div><div class="xsj-v6-rb-meta"><span>角色可见</span><span>'+((i+1)*12)+'</span></div></div>';}).join('')+
      '</div></div>'+section('互动能力','设置',row('message','评论角色笔记','可点赞、收藏、转发到聊天继续讨论','开启')+row('share','转发笔记给TA','角色会围绕图文内容、地点和文案回应','发送',true)+row('spark','生成角色笔记','按角色性格主动发布小红书风格笔记','生成'));
    }
    if(view==='live'){
      html='<div class="xsj-v6-live"><div class="xsj-v6-live-stage"><div class="xsj-v6-live-host">'+ico('video','s28')+'<span>直播中</span></div><div class="xsj-v6-live-badge">18.2k watching</div><div class="xsj-v6-live-caption">主播正在讲夜间歌单，角色在旁边小声评价歌词。</div></div><div class="xsj-v6-live-body"><div class="xsj-v6-danmaku"><div>路人：这首歌好适合下雨天</div><div>角色：这一句像她今天没有说出口的话</div><div>我：转发到聊天一起听</div></div><div class="xsj-v6-live-actions"><button class="xsj-v5-btn ghost">'+ico('message')+'发弹幕</button><button class="xsj-v5-btn">'+ico('share')+'转给TA</button></div></div></div>'+section('直播功能','管理',row('video','看直播','直播间 UI、弹幕、礼物、连麦记录','进入')+row('gift','打赏记录','可进入钱包流水，也能成为聊天事件','查看',true)+row('music','转去一起听歌','把直播背景音乐发到一起听歌','转发'));
    }
    if(view==='batch'){
      html='<div class="xsj-v6-batch"><div class="xsj-v6-batch-title">批量生成</div><div class="xsj-v6-batch-desc">可以一次性生成角色手机数据，也可以单独生成小红书笔记、直播记录、论坛发言和购物浏览痕迹。</div>'+['微信联系人聊天记录','通话记录','备忘录','购物记录','钱包流水','浏览器记录','相册','论坛发言','游戏记录','小红书笔记','抖音直播记录'].map(function(t,i){return '<div class="xsj-v6-batch-row"><span>'+t+'</span><span>'+(i%3===0?'已选':'可选')+'</span></div>';}).join('')+'<div class="xsj-v5-grid2" style="margin-top:12px;"><button class="xsj-v5-btn ghost">单独生成</button><button class="xsj-v5-btn">开始批量生成</button></div></div>';
    }
    if(view==='chat')html=phoneShell('<div class="xsj-v5-mini-chat"><div class="xsj-v5-mini-bubble">你到家了吗？外面还在下雨。</div><div class="xsj-v5-mini-bubble right">快了，在便利店门口。</div><div class="xsj-v5-mini-bubble">那我等你消息，别淋雨。</div></div>','role-phone');
    if(view==='album')html=phoneShell('<div class="xsj-v5-gallery">'+Array.from({length:9}).map(function(_,i){return '<div class="xsj-v5-gallery-cell">'+ico(i%3===0?'camera':i%3===1?'heart':'map')+'</div>';}).join('')+'</div>','role-phone');
    if(view==='notes')html=phoneShell(row('book','未发送的备忘录','下雨的时候别忘了问她有没有带伞','今天')+row('pen','购物清单','耳机、热饮、宠物粮、白色花束','昨天',true),'role-phone');
    if(!html)html=phoneShell(section('角色手机记录','返回桌面',row('clock','最近记录','该 App 记录可批量生成，也可单独补写','生成')+row('share','转发到聊天','可把记录作为聊天卡片发送给用户','发送',true)+row('spark','自动补全','根据角色设定生成真实使用痕迹','开启')),'role-phone');
    return '<div class="xsj-v5-root xsj-v6-view-root">'+top+platformTabs+html+'</div>';
  }

  function pet(view){view=view||state.pet;var top=head('宠物','PET ROOM','和角色共同领养，宠物可以参与聊天','<div class="xsj-v5-iconbtn">'+ico('camera')+'</div><div class="xsj-v5-iconbtn dark">'+ico('gift')+'</div>');var tabs=tab('pet',[['home','房间','pet'],['care','照顾','heart'],['album','相册','camera'],['log','记录','book']],view);var html='';
    if(view==='home')html='<div class="xsj-v5-pet-room"><div class="xsj-v5-pet-body"><div class="xsj-v5-pet-face"><span class="xsj-v5-pet-eye"></span><span class="xsj-v5-pet-eye"></span><span class="xsj-v5-pet-mouth"></span></div></div><div><div class="xsj-v5-section-title" style="text-align:center;">云团</div><div class="xsj-v5-sub" style="text-align:center;">TA 今天已经喂过一次</div></div></div><div class="xsj-v5-grid2"><div class="xsj-v5-card"><div class="xsj-v5-rowtitle">饱食度</div><div class="xsj-v5-pet-bar" style="margin-top:12px;"><span style="width:72%"></span></div></div><div class="xsj-v5-card"><div class="xsj-v5-rowtitle">亲密度</div><div class="xsj-v5-pet-bar" style="margin-top:12px;"><span style="width:86%"></span></div></div></div>';
    if(view==='care')html='<div class="xsj-v5-pet-actions"><div class="xsj-v5-pet-action">'+ico('gift')+'喂养</div><div class="xsj-v5-pet-action">'+ico('heart')+'玩耍</div><div class="xsj-v5-pet-action">'+ico('map')+'散步</div><div class="xsj-v5-pet-action">'+ico('message')+'对话</div></div>'+section('今日任务','全部',row('snack','喂一次晚饭','完成后角色会收到提醒','待完成')+row('camera','拍一张合照','可发到情侣空间或朋友圈','可做',true));
    if(view==='album')html='<div class="xsj-v5-gallery">'+Array.from({length:9}).map(function(_,i){return '<div class="xsj-v5-gallery-cell">'+ico(i%2?'pet':'camera')+'</div>';}).join('')+'</div>';
    if(view==='log')html='<div class="xsj-v5-timeline"><div class="xsj-v5-timeitem"><div class="xsj-v5-rowtitle">TA 喂了宠物</div><div class="xsj-v5-rowdesc">今天 18:20 · 留言：别让它太晚睡</div></div><div class="xsj-v5-timeitem"><div class="xsj-v5-rowtitle">宠物插话</div><div class="xsj-v5-rowdesc">在聊天里说：你们两个不要又冷战</div></div></div>';
    return '<div class="xsj-v5-root">'+top+tabs+html+'</div>';
  }
  function ao3(view){view=view||state.ao3;var top=head('AO3','FAN WORKS','写同人文、看 AI 生成作品，并转发给角色讨论','<div class="xsj-v5-iconbtn">'+ico('search')+'</div><div class="xsj-v5-iconbtn dark" onclick="xsjV5Nav(\'ao3\',\'write\')">'+ico('pen')+'</div>');var tabs=tab('ao3',[['home','推荐','book'],['tags','分类','list'],['write','写作','pen'],['mine','我的','user'],['reader','阅读','book']],view);var html='';
    if(view==='home')html='<div class="xsj-v5-ao3-cover"><div><div class="xsj-v5-kicker">FEATURED WORK</div><div class="xsj-v5-title" style="margin-top:8px;">雨夜后的一封回信</div></div><div class="xsj-v5-note">日常、慢热、书信体。可让角色点评文风、续写或转入线下模式。</div></div>'+section('作品列表','更多','<div class="xsj-v5-work"><div class="xsj-v5-work-title">便利店门口</div><div class="xsj-v5-work-summary">字数 4.2k · 评论 28 · 适合和角色讨论台词、动作和心声。</div>'+pills(['G','日常','慢热','雨夜'],1)+'</div><div class="xsj-v5-work"><div class="xsj-v5-work-title">未发送的语音</div><div class="xsj-v5-work-summary">可作为语音通话剧情素材，也可以导入线下模式续写。</div>'+pills(['T','语音','暧昧','独白'],0)+'</div>');
    if(view==='tags')html=pills(['日常','慢热','书信','吃醋','重逢','论坛体','聊天体'],0)+section('分类榜单','全部',row('book','聊天体','像真实聊天记录一样推进剧情','136 篇')+row('pen','论坛体','路人和角色共同参与讨论','89 篇',true)+row('heart','情侣空间','留言、情书、悄悄话','42 篇'));
    if(view==='write')html='<div class="xsj-v5-editor"><input placeholder="作品标题" value="便利店门口"><input placeholder="CP / 角色 / 标签" value="日常，慢热，雨夜"><textarea>正文从这里开始。可以切换旁白、心声、对话字体，也可以读取文风预设。</textarea><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">保存草稿</button><button class="xsj-v5-btn">发布</button></div></div>';
    if(view==='mine')html=section('我的作品','管理',row('book','星辰之约','原创 · 12 章 · 可转发给角色','编辑')+row('pen','城市之光','同人 · 5 章 · 评论 18','继续写',true));
    if(view==='reader')html='<div class="xsj-v5-reader">雨停下来的时候，便利店门口只剩下一小片白色的灯光。<br><br>他没有立刻说话，只是把伞往你这边偏了一点。那一瞬间，你忽然觉得有些话不必马上问出口。</div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">'+ico('message')+'评论</button><button class="xsj-v5-btn">'+ico('share')+'转给TA</button></div>';
    return '<div class="xsj-v5-root">'+top+tabs+html+'</div>';
  }
  function game(){return '<div class="xsj-v5-root">'+head('游戏','GAME CENTER','记录角色游戏状态、战绩、开黑邀请和游戏内聊天','<div class="xsj-v5-iconbtn dark">'+ico('game')+'</div>')+'<div class="xsj-v5-card"><div class="xsj-v5-section-title">正在游玩</div><div class="xsj-v5-note" style="margin-top:8px;">TA 已经在房间里等了 12 分钟，可以一键发送组队邀请到聊天。</div></div><div class="xsj-v5-grid3"><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">76</div><div class="xsj-v5-rowdesc">胜率</div></div><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">4</div><div class="xsj-v5-rowdesc">连胜</div></div><div class="xsj-v5-card tight"><div class="xsj-v5-title" style="font-size:22px;">12m</div><div class="xsj-v5-rowdesc">在线</div></div></div>'+section('最近记录','全部',row('game','深夜排位','输了会短暂沉默，赢了会主动发截图','刚刚')+row('message','组队邀请','可以一键发到聊天','邀请',true)+row('heart','角色反应','根据胜负调整语气和主动消息','设置'))+'</div>';}
  var renderers={shop:shop,forum:forum,worldbook:worldbook,memory:memory,view:viewApp,pet:pet,ao3:ao3,game:game};
  function render(name,view){if(view)state[name]=view;var root=document.getElementById('xsj-app-root-'+name);if(!root||!renderers[name])return;var ov=document.getElementById('app-overlay');if(ov){ov.classList.add('xsj-v5-app');ov.classList.toggle('xsj-v5-shop-overlay',name==='shop');ov.classList.toggle('xsj-v5-forum-overlay',name==='forum');}root.innerHTML=renderers[name](state[name]);}
  window.xsjV5Nav=function(app,view){state[app]=view;render(app,view);};
  window.xsjV5ProductDetail=function(name,price,ic){setFeature('商品详情','product detail','<div class="xsj-v5-root"><div class="xsj-v5-product-img" style="height:260px;border-radius:30px;">'+ico(ic,'s28')+'</div><div class="xsj-v5-card"><div class="xsj-v5-title" style="font-size:24px;">'+name+'</div><div class="xsj-v5-price" style="font-size:26px;margin-top:8px;">￥'+price+'</div><div class="xsj-v5-note" style="margin-top:10px;">可作为聊天商品卡片发送，也可以选择送给角色、找角色代付、加入购物车或加入情侣空间礼物记录。</div></div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">'+ico('share')+'发给TA</button><button class="xsj-v5-btn">'+ico('cart')+'加入购物车</button></div></div>');};
  window.xsjV5ForumCompose=function(){setFeature('发帖','forum compose','<div class="xsj-v5-root"><div class="xsj-v5-editor"><textarea placeholder="分享一点想法，角色和路人都可以互动。"></textarea><input value="可见范围：广场 / 角色可见"><input value="添加话题：真实聊天感"><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">存草稿</button><button class="xsj-v5-btn">发布</button></div></div></div>');};
  function polishHomeIcons(){
    // v6: keep the original SVG icons written in the base file.
    // Only re-apply user-uploaded custom icons from Beautify, if any.
    if(typeof beautifyRefreshIcons==='function')beautifyRefreshIcons();
  }
  var priorOpen=window.openApp;if(typeof priorOpen==='function'&&!priorOpen._xsjV5){window.openApp=function(name){priorOpen(name);setTimeout(function(){render(name);polishHomeIcons();},90);};window.openApp._xsjV5=true;}
  function setFeature(title,sub,html){var old=window.xsjOpenFeature&&window.xsjOpenFeature._xsjV5Base;if(!old)old=window.xsjV5OldFeature||window.xsjOpenFeature; if(typeof old==='function')old('xsj-v4-placeholder',title);setTimeout(function(){var ov=document.getElementById('xsj-feature-overlay'),tt=document.getElementById('xsj-feature-title'),ss=document.getElementById('xsj-feature-sub'),bb=document.getElementById('xsj-feature-body');if(ov)ov.classList.add('xsj-feature-overlay-v5');if(tt)tt.innerHTML=title;if(ss)ss.innerHTML=sub;if(bb){bb.classList.remove('xsj-shopping-mode');bb.innerHTML=html;}},0);}
  window.xsjV5OldFeature=window.xsjV5OldFeature||window.xsjOpenFeature;
  var baseFeature=window.xsjOpenFeature;
  window.xsjOpenFeature=function(key,label){var nm=label||'';
    if(key==='shopping')return setFeature('购物','taobao-like shopping panel',shop('home',true));
    if(key==='red-packet')return setFeature('红包','wechat-like red packet','<div class="xsj-v5-root"><div class="xsj-v5-card" style="text-align:center;padding:28px;"><div class="xsj-v5-iconbtn dark" style="width:74px;height:74px;border-radius:28px;margin:0 auto;">'+ico('gift','s28')+'</div><div class="xsj-v5-title" style="font-size:24px;margin-top:16px;">发一个红包</div><div class="xsj-v5-sub" style="margin-top:6px;">可写祝福语，红包记录会进入钱包流水。</div></div><div class="xsj-v5-editor"><input value="￥ 52.00"><input value="写一点悄悄话"><button class="xsj-v5-btn">发送红包</button></div></div>');
    if(key==='transfer')return setFeature('转账','wechat-like transfer','<div class="xsj-v5-root"><div class="xsj-v5-card"><div class="xsj-v5-section-title">转账给TA</div><div class="xsj-v5-price" style="font-size:34px;margin-top:14px;">￥128.00</div><div class="xsj-v5-note" style="margin-top:8px;">可添加备注，角色会根据关系和金额给出自然回应。</div></div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">修改金额</button><button class="xsj-v5-btn">确认转账</button></div></div>');
    if(key==='voice-call')return setFeature('语音通话','live call with text input','<div class="xsj-v5-call-page"><div><div class="xsj-v5-call-avatar">'+ico('mic','s28')+'</div><div class="xsj-v5-title" style="font-size:24px;text-align:center;">'+(nm||'TA')+'</div><div class="xsj-v5-sub" style="text-align:center;margin-top:6px;">正在通话 02:14 · 对方正在听你说</div></div><div class="xsj-v5-card"><div class="xsj-v5-note"><b>我</b> 今天有点累，想听你说话。</div><div class="xsj-v5-note" style="margin-top:10px;"><b>TA</b> 那你先不用组织语言，我在这边陪你。</div><div class="xsj-v5-search" style="margin-top:12px;">'+ico('message')+'<input placeholder="输入你想说的话"></div></div><div class="xsj-v5-call-controls"><div class="xsj-v5-call-ctrl">'+ico('mic')+'静音</div><div class="xsj-v5-call-ctrl">'+ico('phone')+'免提</div><div class="xsj-v5-call-ctrl end" onclick="xsjCloseFeature()">'+ico('phone')+'结束</div></div></div>');
    if(key==='video-call')return setFeature('视频通话','video call interface','<div class="xsj-v5-video-room"><div class="xsj-v5-video-self">'+ico('user','s24')+'我的画面</div><div>'+ico('video','s28')+'<div style="margin-top:12px;">TA 正在看向你</div></div><div class="xsj-v5-caption">TA：我看见你了。今天的光线很柔和，你像是刚刚坐下来。</div><div class="xsj-v5-video-input"><input placeholder="输入你要说的话"><button class="xsj-v5-btn" style="width:74px;height:42px;">发送</button></div></div>');
    if(key==='listen-together')return setFeature('一起听歌','music room','<div class="xsj-v5-music-room"><div class="xsj-v5-disc">'+ico('music','s28')+'</div><div><div class="xsj-v5-title" style="font-size:24px;">在一起听</div><div class="xsj-v5-sub">连接网易云后，角色会围绕歌词、曲风和你的状态讨论。</div></div><div class="xsj-v5-lyrics"><div>晚风把城市吹得很轻</div><div class="active">这一句像你今天没有说出口的话</div><div>我们慢慢走，不急着回家</div></div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">'+ico('music')+'新建歌单</button><button class="xsj-v5-btn">'+ico('share')+'转发</button></div></div>');
    if(key==='location')return setFeature('位置','greyscale map card','<div class="xsj-v5-root">'+search('搜索地点或输入定位说明')+'<div class="xsj-v5-map-panel"><div class="xsj-v5-map-pin"></div></div><div class="xsj-v5-card"><div class="xsj-v5-rowtitle">当前位置</div><div class="xsj-v5-rowdesc">白色街区 · 距离角色 2.4km</div><div class="xsj-v5-note" style="margin-top:10px;">发送后会在聊天中显示地图卡片，角色可以根据时间地点主动回应。</div></div><button class="xsj-v5-btn">'+ico('share')+'发送给角色</button></div>');
    if(key==='reading')return setFeature('一起阅读','shared reader','<div class="xsj-v5-root"><div class="xsj-v5-reader">雨停下来的时候，便利店门口只剩下一小片白色的灯光。你把书页往下压，听见TA在旁边轻轻说，这段写得像你。</div><div class="xsj-v5-card"><div class="xsj-v5-section-title">TA 的旁注</div><div class="xsj-v5-note" style="margin-top:8px;">这段适合保存为剧情记忆，也可以转入线下模式继续写。</div></div><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">标记这一段</button><button class="xsj-v5-btn">问TA怎么看</button></div></div>');
    if(key==='couple-space')return setFeature('情侣空间','private relationship room','<div class="xsj-v5-root"><div class="xsj-v5-card" style="text-align:center;"><div class="xsj-v5-grid2"><div><div class="xsj-v5-call-avatar" style="width:74px;height:74px;margin:0 auto;">'+ico('user')+'</div><div class="xsj-v5-rowdesc">我</div></div><div><div class="xsj-v5-call-avatar" style="width:74px;height:74px;margin:0 auto;">'+ico('heart')+'</div><div class="xsj-v5-rowdesc">TA</div></div></div><div class="xsj-v5-title" style="font-size:26px;margin-top:14px;">相识 128 天</div></div>'+section('空间功能','设置',row('message','悄悄话','只有你们两个能看到','进入')+row('pen','情书','保存未发送的长文','写一封',true)+row('camera','共同相册','聊天照片、宠物合照、礼物记录','查看'))+'</div>');
    if(key==='offline')return setFeature('线下模式','long-form story mode','<div class="xsj-v5-root"><div class="xsj-v5-card"><div class="xsj-v5-kicker">STORY MODE</div><div class="xsj-v5-title" style="font-size:24px;margin-top:8px;">雨天便利店</div><div class="xsj-v5-note" style="margin-top:12px;">旁白使用细腻灰字，对话短一点，心声独立显示。已读取世界书 4 条、记忆 7 条、文风预设 1 个。</div></div><div class="xsj-v5-reader">他把伞收起来，雨水沿着伞骨落到便利店门口。<br><br>“你是不是又没吃晚饭？”他说。</div><div class="xsj-v5-editor"><textarea placeholder="继续这一段剧情..."></textarea><div class="xsj-v5-grid2"><button class="xsj-v5-btn ghost">重写</button><button class="xsj-v5-btn">生成</button></div></div></div>');
    if(key==='chat-settings')return setFeature('聊天设置','conversation controls','<div class="xsj-v5-root">'+section('聊天外观','',row('user','头像和备注','更换头像、昵称、聊天背景','进入')+row('clock','时间戳和已读','显示位置、样式、是否开启','设置',true)+row('message','戳一戳和置顶','聊天互动和会话优先级','设置'))+section('角色行为','',row('bell','主动发信息','频率、静默时间、后台保活','开启')+row('video','主动语音视频','允许角色主动发起通话邀请','可选',true)+row('map','时间地点感知','根据定位、时间和天气回应','开启'))+section('数据','',row('book','世界书和记忆','绑定局部世界书、自动总结聊天','管理')+row('search','查找聊天记录','按内容、图片、语音、红包搜索','查找',true)+row('trash','清空或拉黑','危险操作集中在底部','管理'))+'</div>');
    if(key==='thoughts')return setFeature('心声记录','hidden state card','<div class="xsj-v5-root"><div class="xsj-v5-card"><div class="xsj-v5-section-title">这一轮回复的心声</div><div class="xsj-v5-note" style="margin-top:8px;">他其实有点担心你今天不开心，但没有直接问出口，所以先用比较轻的语气陪你。</div></div>'+section('状态','保存',row('heart','情绪','克制、担心、想靠近','可编辑')+row('map','动作','低头看手机，停顿了一会儿才回复','可编辑',true)+row('memory','触发记忆','用户不喜欢突然冷淡','保存'))+'</div>');
    if(key==='receive')return setFeature('主动消息','background notification','<div class="xsj-v5-root"><div class="xsj-v5-card"><div class="xsj-v5-section-title">后台保活</div><div class="xsj-v5-note" style="margin-top:8px;">开启后，角色可以根据时间、记忆、朋友圈和线下剧情主动发消息。</div></div>'+section('推送规则','设置',row('bell','主动消息频率','低、中、高；支持每个角色单独设置','中')+row('clock','静默时间','夜间不打扰，除非剧情紧急','开启',true)+row('message','通知预览','锁屏显示角色消息摘要','开启'))+'</div>');
    return typeof baseFeature==='function'?baseFeature(key,label):undefined;
  };
  window.xsjOpenFeature._xsjV5Base=baseFeature;
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){polishHomeIcons();['shop','forum','worldbook','memory','view','pet','ao3','game'].forEach(function(n){render(n);});},160);});
})();


// ══ xsj-v7-script ══

(function(){
  function svg(path, cls){return '<svg class="xsj-v7-svg '+(cls||'')+'" width="20" height="20" viewBox="0 0 24 24">'+path+'</svg>';}
  var paths={
    search:'<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path>',
    cart:'<path d="M6 7h14l-1.4 8.5a2 2 0 0 1-2 1.7H9a2 2 0 0 1-2-1.7L5.5 4H3"></path><circle cx="9" cy="20" r="1"></circle><circle cx="17" cy="20" r="1"></circle>',
    order:'<path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2z"></path><path d="M9 8h6M9 12h6M9 16h3"></path>',
    user:'<circle cx="12" cy="8" r="4"></circle><path d="M4.5 21c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5"></path>',
    shirt:'<path d="M9 4l3 2 3-2 4 2.5-2 4V21H7V10.5l-2-4L9 4z"></path><path d="M9 4c.8 1.2 1.8 1.8 3 1.8S14.2 5.2 15 4"></path>',
    phone:'<rect x="7" y="2.8" width="10" height="18.4" rx="2.4"></rect><path d="M10.5 18h3"></path>',
    makeup:'<path d="M8 21h8v-9H8v9z"></path><path d="M10 12V6a2 2 0 0 1 4 0v6"></path><path d="M8 15h8"></path>',
    snack:'<path d="M7 4h10l-1 17H8L7 4z"></path><path d="M7 8h10"></path><path d="M10 12h4"></path>',
    home:'<path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V21h13V10.5"></path><path d="M9.5 21v-6h5v6"></path>',
    flower:'<circle cx="12" cy="8" r="2.2"></circle><path d="M12 10.5v10"></path><path d="M12 15c-3 0-5-1.2-6-3 3-.3 5 1 6 3z"></path><path d="M12 16c3 0 5-1.2 6-3-3-.3-5 1-6 3z"></path><path d="M9.8 8c-2.6-.8-2.4-3.8.1-4.3 1.4-.2 2.1.8 2.1 2.1"></path><path d="M14.2 8c2.6-.8 2.4-3.8-.1-4.3-1.4-.2-2.1.8-2.1 2.1"></path>',
    gift:'<rect x="4" y="9" width="16" height="11" rx="2"></rect><path d="M4 13h16M12 9v11"></path><path d="M12 9c-2.4 0-4.2-.9-4.2-2.4A1.9 1.9 0 0 1 9.7 4.7C11.5 4.7 12 9 12 9z"></path><path d="M12 9c2.4 0 4.2-.9 4.2-2.4a1.9 1.9 0 0 0-1.9-1.9C12.5 4.7 12 9 12 9z"></path>',
    car:'<path d="M6 17h12l1-5-2.2-4H7.2L5 12l1 5z"></path><path d="M7 17v2M17 17v2M7.5 12h9"></path><circle cx="8" cy="15" r="1"></circle><circle cx="16" cy="15" r="1"></circle>',
    bag:'<path d="M6 8h12l-1 13H7L6 8z"></path><path d="M9 8a3 3 0 0 1 6 0"></path>',
    pet:'<circle cx="7.2" cy="8.1" r="2.05"></circle><circle cx="12" cy="6.6" r="2.15"></circle><circle cx="16.8" cy="8.1" r="2.05"></circle><circle cx="8.9" cy="12.4" r="1.9"></circle><circle cx="15.1" cy="12.4" r="1.9"></circle><path d="M7.4 17.5c0-2.7 2.1-4.8 4.6-4.8s4.6 2.1 4.6 4.8c0 1.8-1.4 3.1-3.1 2.4-.9-.4-2.1-.4-3 0-1.8.7-3.1-.6-3.1-2.4z"></path>',
    memory:'<path d="M8.5 3.5h7A3.5 3.5 0 0 1 19 7v10a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 5 17V7a3.5 3.5 0 0 1 3.5-3.5z"></path><path d="M9 8h6M9 12h3"></path><circle cx="14.5" cy="14.5" r="2.4"></circle><path d="M16.2 16.2 18.5 18.5"></path>',
    book:'<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22V4.5z"></path><path d="M5 18.5A2.5 2.5 0 0 1 7.5 16H20"></path>',
    pen:'<path d="M4 20l4.8-1.2L19 8.6 15.4 5 5.2 15.2 4 20z"></path><path d="M13.8 6.6l3.6 3.6"></path>',
    comment:'<path d="M21 14.5a3.5 3.5 0 0 1-3.5 3.5H9l-5 3V6.5A3.5 3.5 0 0 1 7.5 3h10A3.5 3.5 0 0 1 21 6.5v8z"></path>',
    message:'<path d="M21 14.5a3.5 3.5 0 0 1-3.5 3.5H9l-5 3V6.5A3.5 3.5 0 0 1 7.5 3h10A3.5 3.5 0 0 1 21 6.5v8z"></path><path d="M8 9.5h8M8 13h5"></path>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3M9 21h6"></path>',
    music:'<path d="M9 18V5l11-2v12"></path><circle cx="6" cy="18" r="3"></circle><circle cx="17" cy="15" r="3"></circle>',
    repeat:'<path d="M17 3l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 21l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>',
    view:'<path d="M2.5 12s3.6-6.2 9.5-6.2S21.5 12 21.5 12s-3.6 6.2-9.5 6.2S2.5 12 2.5 12z"></path><circle cx="12" cy="12" r="3"></circle>',
    repost:'<path d="M17 2.8 21 6.8l-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 21.2l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>',
    heart:'<path d="M20.5 6.8c0 5.4-8.5 10.9-8.5 10.9S3.5 12.2 3.5 6.8A4.1 4.1 0 0 1 7.6 2.8c2 0 3.2 1.1 4.4 2.5 1.2-1.4 2.4-2.5 4.4-2.5a4.1 4.1 0 0 1 4.1 4z"></path>',
    share:'<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path><path d="M12 16V3"></path><path d="M7 8l5-5 5 5"></path>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M9.8 20a2.3 2.3 0 0 0 4.4 0"></path>',
    camera:'<path d="M4 8a3 3 0 0 1 3-3h1.8L10.5 3h3L15.2 5H17a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8z"></path><circle cx="12" cy="12.5" r="3.5"></circle>',
    video:'<rect x="3" y="6" width="13" height="12" rx="3"></rect><path d="M16 10l5-3v10l-5-3"></path>',
    live:'<rect x="4" y="5" width="16" height="12" rx="3"></rect><path d="M9 21h6"></path><path d="M12 17v4"></path><path d="M9.5 10.5c1.3-1.2 3.7-1.2 5 0"></path><path d="M11 13c.6-.5 1.4-.5 2 0"></path>',
    map:'<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"></path><path d="M9 3v15M15 6v15"></path>',
    clock:'<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    settings:'<circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"></path>',
    xhs:'<rect x="4" y="4" width="16" height="16" rx="4"></rect><path d="M8 9h8M8 13h5M8 17h7"></path>',
    phonecall:'<path d="M6.5 4h4l1 4-2.4 1.4a12 12 0 0 0 5.5 5.5L16 12.5l4 1v4a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"></path>',
    browser:'<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"></path>',
    game:'<rect x="3" y="8" width="18" height="10" rx="4"></rect><path d="M8 13h3M9.5 11.5v3M15.5 12h.01M18 14h.01"></path>',
    plus:'<path d="M12 5v14M5 12h14"></path>',
    spark:'<path d="M4 20 20 4"></path><path d="M14.5 4.5 19.5 9.5"></path><path d="M6.5 8.5l1.2-2.6 1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z"></path>',
    trash:'<path d="M4 7h16"></path><path d="M10 11v6M14 11v6"></path><path d="M6 7l1 14h10l1-14"></path><path d="M9 7V4h6v3"></path>',
    list:'<path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h.01M3 12h.01M3 18h.01"></path>'
  };
  function ico(name,size){return svg(paths[name]||paths.spark, size==='s24'?'':(size==='s16'?'':'')).replace('width="20" height="20"', size==='s24'?'width="24" height="24"':size==='s16'?'width="16" height="16"':size==='s28'?'width="28" height="28"':'width="20" height="20"');}
  function head(title,kicker,sub,actions){return '<div class="xsj-v7-head"><div><div class="xsj-v7-kicker">'+kicker+'</div><div class="xsj-v7-title">'+title+'</div><div class="xsj-v7-sub">'+sub+'</div></div><div class="xsj-v7-head-actions">'+(actions||'')+'</div></div>';}
  function tabs(app,items,active){return '<div class="xsj-v7-tabs">'+items.map(function(it){return '<div class="xsj-v7-tab '+(it[0]===active?'active':'')+'" onclick="xsjV7Nav(\''+app+'\',\''+it[0]+'\')">'+ico(it[2],'s16')+'<span>'+it[1]+'</span></div>';}).join('')+'</div>';}
  function pills(arr,idx){return '<div class="xsj-v7-pills">'+arr.map(function(x,i){return '<div class="xsj-v7-pill '+(i===idx?'active':'')+'">'+x+'</div>';}).join('')+'</div>';}
  function search(ph){return '<div class="xsj-v7-search">'+ico('search')+'<input placeholder="'+ph+'"></div>';}
  function section(title,more,body){return '<div class="xsj-v7-section"><div class="xsj-v7-section-head"><div class="xsj-v7-section-title">'+title+'</div><div class="xsj-v7-more">'+(more||'')+'</div></div><div class="xsj-v7-list">'+body+'</div></div>';}
  function row(ic,title,desc,right,click){return '<div class="xsj-v7-row" '+(click?'onclick="'+click+'"':'')+'><div class="xsj-v7-row-ico">'+ico(ic)+'</div><div class="xsj-v7-row-main"><div class="xsj-v7-row-title">'+title+'</div><div class="xsj-v7-row-desc">'+desc+'</div></div><div class="xsj-v7-row-right">'+(right||'')+'</div></div>';}
  function btns(a,b){return '<div class="xsj-v7-grid2"><button class="xsj-v7-btn ghost">'+a+'</button><button class="xsj-v7-btn">'+b+'</button></div>';}

  var state={shop:'home',forum:'home',view:'home',pet:'home',memory:'home',worldbook:'home',ao3:'home',game:'home'};
  var products=[
    ['shirt','奶白色针织开衫','128','2.4k','衣服','送给TA'],['bag','灰白通勤托特包','139','1.8k','包袋','可代付'],['phone','轻薄无线耳机','199','8.8k','数码','一起听歌'],['makeup','低饱和口红礼盒','89','1.2k','美妆','礼物'],['snack','夜宵零食组合','39.9','5.1k','零食','即时配送'],['home','云朵抱枕毯','76','3.3k','家居','情侣空间'],['flower','白色小花束','58','960','鲜花','送TA'],['gift','手写情书礼盒','45','2.1k','礼物','可留言'],['car','夜间打车券','24','12k','出行','帮忙打车'],['pet','宠物粮试吃装','26','840','宠物','一起喂养'],['shirt','软糯睡衣套装','118','4.4k','衣服','日常'],['home','桌面香薰小灯','69','900','家居','氛围']
  ];
  function productCard(p){return '<div class="xsj-v7-product" onclick="xsjV7Product(\''+p[1]+'\',\''+p[2]+'\',\''+p[0]+'\')"><div class="xsj-v7-product-img">'+ico(p[0],'s28')+'</div><div class="xsj-v7-product-name">'+p[1]+'</div><div class="xsj-v7-product-meta"><div class="xsj-v7-price">￥'+p[2]+'</div><div class="xsj-v7-badge">'+p[5]+'</div></div><div class="xsj-v7-row-desc">'+p[3]+' 人想要 · '+p[4]+'</div></div>';}
  function shop(view){view=view||state.shop;var body='';
    if(view==='home')body=head('商城','SHOPPING','像淘宝一样买日常商品，可送角色、找角色代付、加入购物车或发到聊天。','<div class="xsj-v7-iconbtn">'+ico('camera')+'</div><div class="xsj-v7-iconbtn dark" onclick="xsjV7Nav(\'shop\',\'cart\')">'+ico('cart')+'</div>')+search('搜索衣服、耳机、零食、鲜花、打车券')+'<div class="xsj-v7-catgrid">'+[['衣服','shirt'],['数码','phone'],['美妆','makeup'],['零食','snack'],['家居','home'],['鲜花','flower'],['礼物','gift'],['打车','car'],['宠物','pet'],['包袋','bag']].map(function(c){return '<div class="xsj-v7-cat" onclick="xsjV7Nav(\'shop\',\'category\')">'+ico(c[1])+'<span>'+c[0]+'</span></div>';}).join('')+'</div><div class="xsj-v7-shop-hero"><div><h3>今晚也可以给 TA 挑点东西</h3><p>商品卡片会进入聊天，可选择代付、送礼、一起挑选或查看物流。</p></div></div>'+pills(['猜你喜欢','送TA礼物','附近配送','低价好物','购物车同款'],0)+'<div class="xsj-v7-product-grid">'+products.map(productCard).join('')+'</div>';
    if(view==='category')body=head('分类','CATEGORY','按真实购物平台分类浏览，不再卖预设或插件。','<div class="xsj-v7-iconbtn">'+ico('search')+'</div>')+pills(['全部','衣服','数码','美妆','零食','家居','出行'],0)+'<div class="xsj-v7-product-grid">'+products.slice(0,10).map(productCard).join('')+'</div>';
    if(view==='cart')body=head('购物车','CART','可以合并结算，也可以把某件商品发给角色代付。','<div class="xsj-v7-iconbtn">'+ico('order')+'</div>')+section('待结算','管理',row('shirt','奶白色针织开衫','已选 M 码 · 可送给 TA','￥128')+row('phone','轻薄无线耳机','适合一起听歌 · 支持代付','￥199',true))+btns('找TA代付','去结算');
    if(view==='orders')body=head('订单','ORDERS','查看购买记录、礼物记录、打车记录和代付记录。','<div class="xsj-v7-iconbtn">'+ico('search')+'</div>')+section('最近订单','筛选',row('flower','白色小花束','已送达 · 角色已回复','完成')+row('car','夜间打车券','已使用 · 路线已保存到聊天','完成',true)+row('snack','夜宵零食组合','配送中 · 预计 21:30 到','配送中'));
    if(view==='mine')body=head('我的','MY SHOP','收货地址、足迹、收藏、礼物记录和钱包流水。','<div class="xsj-v7-iconbtn">'+ico('settings')+'</div>')+'<div class="xsj-v7-grid3"><div class="xsj-v7-card tight"><div class="xsj-v7-price">12</div><div class="xsj-v7-row-desc">收藏</div></div><div class="xsj-v7-card tight"><div class="xsj-v7-price">4</div><div class="xsj-v7-row-desc">订单</div></div><div class="xsj-v7-card tight"><div class="xsj-v7-price">8</div><div class="xsj-v7-row-desc">礼物</div></div></div>'+section('我的服务','',row('bag','收货地址','管理地址、角色地址和虚拟地址','进入')+row('gift','礼物记录','送给角色的商品会自动归档','查看',true)+row('clock','浏览足迹','最近看过的商品','查看'));
    return '<div class="xsj-v7-root">'+body+'<div class="xsj-v7-bottomnav">'+[['home','首页','home'],['category','分类','list'],['cart','购物车','cart'],['orders','订单','order'],['mine','我的','user']].map(function(it){return '<div class="xsj-v7-tab '+(it[0]===view?'active':'')+'" onclick="xsjV7Nav(\'shop\',\''+it[0]+'\')">'+ico(it[2],'s16')+'<span>'+it[1]+'</span></div>';}).join('')+'</div></div>';
  }
  function forum(view){view=view||state.forum;var top='<div class="xsj-v7-forum-top">'+head('论坛','SOCIAL PLAZA','微博式广场，可发帖、评论、转发，也能转给角色一起讨论。','<div class="xsj-v7-iconbtn">'+ico('bell')+'</div><div class="xsj-v7-iconbtn dark" onclick="xsjV7Compose()">'+ico('pen')+'</div>')+tabs('forum',[['home','广场','comment'],['follow','关注','heart'],['role','角色','user'],['city','同城','map'],['msg','信息','bell'],['mine','我的','user']],view)+search('搜帖子、角色、话题')+'</div>';var body='';
    if(view==='home'||view==='follow'||view==='role'||view==='city')body='<div class="xsj-v7-hot"><div class="xsj-v7-hotitem">真实聊天感 12.4w</div><div class="xsj-v7-hotitem">角色主动消息</div><div class="xsj-v7-hotitem">雨夜便利店</div><div class="xsj-v7-hotitem">一起听歌</div></div>'+post('角色动态 bot','刚刚','如果角色主动发消息，不应该像通知模板，而应该像一个真的人想起你。','comment')+post('路人甲','12 分钟前','有没有人也觉得线下模式更适合写长剧情？旁白和心声分开真的会自然很多。','book')+post('TA','23 分钟前','刚刚看到你转来的歌，歌词第二段很像你今天没说出口的话。','music');
    if(view==='msg')body=section('消息','全部',row('comment','评论','TA 回复了你的论坛转发','刚刚')+row('heart','喜欢','3 个角色赞了你的帖子','12m',true)+row('repost','转发','路人把你的帖子转到了广场','1h'));
    if(view==='mine')body='<div class="xsj-v7-card"><div class="xsj-v7-post-head"><div class="xsj-v7-avatar">'+ico('user')+'</div><div><div class="xsj-v7-post-name">我的主页</div><div class="xsj-v7-post-time">帖子 18 · 收藏 42 · 草稿 3</div></div></div></div>'+section('我的内容','管理',row('pen','草稿箱','未发布帖子和长评','3')+row('heart','收藏','收藏帖子、角色评论和路人观点','42',true)+row('settings','论坛设置','路人互动、角色可见范围、屏蔽词','进入'));
    return '<div class="xsj-v7-root">'+top+body+'<div class="xsj-v7-fab" onclick="xsjV7Compose()">'+ico('pen')+'</div></div>';
  }
  function post(name,time,text,ic){return '<div class="xsj-v7-post"><div class="xsj-v7-post-head"><div class="xsj-v7-avatar">'+ico(ic)+'</div><div><div class="xsj-v7-post-name">'+name+'</div><div class="xsj-v7-post-time">'+time+' · 来自论坛广场</div></div></div><div class="xsj-v7-post-text">'+text+'</div><div class="xsj-v7-post-imgs"><div class="xsj-v7-post-img">'+ico('book')+'</div><div class="xsj-v7-post-img">'+ico('message')+'</div><div class="xsj-v7-post-img">'+ico('camera')+'</div></div><div class="xsj-v7-commentbox">TA：这条可以转给我，我想接着聊。</div><div class="xsj-v7-post-actions"><div class="xsj-v7-post-act">'+ico('repost','s16')+'转发</div><div class="xsj-v7-post-act">'+ico('comment','s16')+'评论</div><div class="xsj-v7-post-act">'+ico('heart','s16')+'喜欢</div><div class="xsj-v7-post-act">'+ico('share','s16')+'给TA</div></div></div>';}

  function petSvg(){return '<svg class="xsj-v7-pet-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38 105c4-27 26-47 55-47 25 0 44 14 49 35 5 23-13 44-45 47-35 3-65-9-59-35z" fill="var(--layer-2)" stroke="currentColor" stroke-width="3.2" opacity=".9"/><path d="M49 86c-10-11-7-25 5-31 8 11 11 21 7 31" fill="var(--layer-1)" stroke="currentColor" stroke-width="3" opacity=".78"/><path d="M124 90c6-10 5-21-3-31-9 8-13 18-11 30" fill="var(--layer-1)" stroke="currentColor" stroke-width="3" opacity=".78"/><path d="M70 96c3-3 8-3 11 0" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".45"/><path d="M96 96c3-3 8-3 11 0" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".45"/><circle cx="77" cy="103" r="3" fill="currentColor" opacity=".62"/><circle cx="101" cy="103" r="3" fill="currentColor" opacity=".62"/><path d="M86 115c4 3.4 10 3.4 14 0" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M55 122c12 10 54 13 75-6" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".32"/><path d="M35 118c-8 4-14 8-18 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".24"/><path d="M127 116c9 3 15 7 20 13" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".24"/><path d="M60 135c8 5 17 7 27 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".22"/></svg>';}
  function pet(view){view=view||state.pet;var top=head('宠物','PET ROOM','和角色共同领养，宠物可以参与聊天、情侣空间和朋友圈。','<div class="xsj-v7-iconbtn">'+ico('camera')+'</div><div class="xsj-v7-iconbtn dark">'+ico('gift')+'</div>')+tabs('pet',[['home','房间','pet'],['care','照顾','heart'],['album','相册','camera'],['log','记录','book']],view);var body='';
    if(view==='home')body='<div class="xsj-v7-pet-room">'+petSvg()+'<div class="xsj-v7-pet-name"><div class="xsj-v7-section-title">云团</div><div class="xsj-v7-sub" style="margin:4px auto 0;">TA 今天已经喂过一次，现在想插入聊天。</div></div></div><div class="xsj-v7-grid3"><div class="xsj-v7-card tight"><div class="xsj-v7-row-title">饱食</div><div class="xsj-v7-bar" style="margin-top:10px"><span style="width:76%"></span></div></div><div class="xsj-v7-card tight"><div class="xsj-v7-row-title">心情</div><div class="xsj-v7-bar" style="margin-top:10px"><span style="width:88%"></span></div></div><div class="xsj-v7-card tight"><div class="xsj-v7-row-title">亲密</div><div class="xsj-v7-bar" style="margin-top:10px"><span style="width:92%"></span></div></div></div>'+section('今日状态','设置',row('heart','宠物想靠近你们','可以让它在下一轮聊天里插话','可用')+row('gift','TA 留下的喂养记录','别让它太晚睡，等你回来再玩','刚刚',true));
    if(view==='care')body='<div class="xsj-v7-pet-actions"><div class="xsj-v7-pet-action">'+ico('gift')+'喂养</div><div class="xsj-v7-pet-action">'+ico('heart')+'玩耍</div><div class="xsj-v7-pet-action">'+ico('map')+'散步</div><div class="xsj-v7-pet-action">'+ico('comment')+'对话</div></div>'+section('照顾任务','全部',row('snack','喂一次晚饭','完成后角色会收到提醒','待完成')+row('camera','拍一张合照','可发到情侣空间或朋友圈','可做',true)+row('message','让宠物插话','宠物可以加入当前聊天','可用'));
    if(view==='album')body='<div class="xsj-v7-gallery">'+Array.from({length:9}).map(function(_,i){return '<div class="xsj-v7-gallery-cell">'+ico(i%3===0?'pet':'camera')+'</div>';}).join('')+'</div>';
    if(view==='log')body='<div class="xsj-v7-card"><div class="xsj-v7-note">宠物记录不只是喂养流水，也会影响角色主动消息和聊天语气。</div></div>'+section('最近记录','全部',row('gift','TA 喂了宠物','今天 18:20 · 留言：别让它太晚睡','刚刚')+row('comment','宠物插话','在聊天里说：你们两个不要又冷战','昨天',true)+row('camera','共同相册','已保存一张合照到情侣空间','昨天'));
    return '<div class="xsj-v7-root">'+top+body+'</div>';
  }
  function memory(view){view=view||state.memory;var top=head('记忆','MEMORY','查看、确认、总结各个角色的长期记忆，防止聊天失忆。','<div class="xsj-v7-iconbtn">'+ico('search')+'</div><div class="xsj-v7-iconbtn dark" onclick="xsjV7Nav(\'memory\',\'summary\')">'+ico('memory')+'</div>')+tabs('memory',[['home','记忆','memory'],['pending','待确认','bell'],['summary','总结','memory'],['roles','角色','user'],['rules','规则','settings']],view);var body='';
    if(view==='home')body='<div class="xsj-v7-card"><div class="xsj-v7-kicker">IMPORTANT MEMORY</div><div class="xsj-v7-note" style="margin-top:10px">用户不喜欢角色突然冷淡；如果剧情需要冷淡，必须在动作、心声或状态里留下原因。</div>'+pills(['固定','全角色','聊天可读'],0)+'</div>'+section('长期记忆','全部',row('heart','重要约定','晚上消息要更轻，不要突然转移话题','固定')+row('book','剧情摘要','线下模式剧情停在雨夜回家之后','剧情',true)+row('comment','聊天偏好','回复要自然，不要像模板或客服','偏好'));
    if(view==='pending')body='<div class="xsj-v7-card"><div class="xsj-v7-kicker">FROM CHAT</div><div class="xsj-v7-note" style="margin-top:10px">用户希望角色主动发消息，但频率不要太高，要像真实联系人偶尔想起她。</div>'+btns('忽略','保存')+'</div><div class="xsj-v7-card"><div class="xsj-v7-kicker">FROM STORY MODE</div><div class="xsj-v7-note" style="margin-top:10px">雨天便利店是重要场景，适合转入世界书，后续可触发。</div>'+btns('修改','保存')+'</div>';
    if(view==='summary')body='<div class="xsj-v7-card"><div class="xsj-v7-section-title">自动总结</div><div class="xsj-v7-note" style="margin-top:8px">可以总结聊天、剧情、关键约定、关系变化，再生成待确认记忆。</div></div>'+section('总结类型','',row('comment','总结聊天','提取关键约定、关系变化、用户偏好','开始')+row('book','总结剧情','压缩线下模式长剧情，供下次读取','开始',true)+row('memory','生成长期记忆','写入角色记忆，支持手动确认','开始'));
    if(view==='roles')body=section('角色记忆','管理',row('user','助手','长期记忆 14 条 · 剧情摘要 3 条','查看')+row('user','创作伙伴','长期记忆 9 条 · 待确认 2 条','查看',true)+row('user','恋人角色','关系记忆 18 条 · 重要约定 5 条','查看'));
    if(view==='rules')body=section('记忆规则','编辑',row('settings','自动提取','聊天超过 20 轮后提取待确认记忆','开启')+row('book','世界书联动','地点、关系、长期设定可转入世界书','开启',true)+row('trash','清理旧记忆','低重要度记忆 30 天后提示清理','关闭'));
    return '<div class="xsj-v7-root">'+top+body+'</div>';
  }
  function viewApp(view){view=view||state.view;var top=head('查看','VIEW CENTER','不仅是角色手机，也可以看小红书、抖音直播和批量生成记录。','<div class="xsj-v7-iconbtn">'+ico('search')+'</div>')+tabs('view',[['home','总览','search'],['phone','角色手机','phone'],['xhs','小红书','xhs'],['live','抖音直播','live'],['batch','批量生成','settings']],view);var body='';
    if(view==='home')body='<div class="xsj-v7-view-hero"><div><div class="xsj-v7-section-title">查看中心</div><div class="xsj-v7-note" style="margin-top:8px">角色手机、小红书、抖音直播是平级入口，不会压到一个页面里。</div></div><div class="xsj-v7-mini-phone"><div class="xsj-v7-mini-app">'+ico('comment')+'</div><div class="xsj-v7-mini-app">'+ico('xhs')+'</div><div class="xsj-v7-mini-app">'+ico('live')+'</div><div class="xsj-v7-mini-app">'+ico('camera')+'</div><div class="xsj-v7-mini-app">'+ico('cart')+'</div><div class="xsj-v7-mini-app">'+ico('game')+'</div></div></div>'+section('入口','全部',row('phone','查看角色手机','微信、通话、备忘录、购物、钱包、浏览器、相册等','进入','xsjV7Nav(\'view\',\'phone\')')+row('xhs','小红书','看笔记、收藏、评论，并转发给角色讨论','进入','xsjV7Nav(\'view\',\'xhs\')')+row('live','抖音直播','看直播、弹幕、打赏记录和角色反应','进入','xsjV7Nav(\'view\',\'live\')')+row('settings','批量生成','批量生成手机记录、社交记录、浏览轨迹','进入','xsjV7Nav(\'view\',\'batch\')'));
    if(view==='phone')body='<div class="xsj-v7-phone-shell"><div class="xsj-v7-phone-inner"><div class="xsj-v7-grid3">'+[['comment','微信'],['phonecall','通话'],['book','备忘录'],['cart','购物'],['bag','钱包'],['browser','浏览器'],['camera','相册'],['comment','论坛'],['game','游戏'],['xhs','小红书'],['live','直播'],['map','地图']].map(function(a){return '<div class="xsj-v7-cat">'+ico(a[0])+'<span>'+a[1]+'</span></div>';}).join('')+'</div></div></div>'+section('最近生成','全部',row('comment','微信聊天记录','和 3 个联系人有新消息','刚刚')+row('book','备忘录','新增一条未发送的备忘录','今天',true)+row('cart','购物记录','浏览过耳机、花束、宠物粮','昨天'));
    if(view==='xhs')body=search('搜索笔记、角色看过、收藏')+pills(['推荐','关注','附近','收藏','角色看过'],0)+'<div class="xsj-v7-xhs-grid">'+[['camera','雨天便利店拍照构图'],['shirt','灰白系穿搭记录'],['flower','送花不用太正式'],['home','小房间布置灵感']].map(function(a){return '<div class="xsj-v7-xhs-card"><div class="xsj-v7-xhs-cover">'+ico(a[0],'s28')+'</div><div class="xsj-v7-product-name">'+a[1]+'</div><div class="xsj-v7-row-desc">收藏 128 · 评论 24 · 可转给TA</div></div>';}).join('')+'</div>';
    if(view==='live')body='<div class="xsj-v7-live-room"><div><div class="xsj-v7-live-title">抖音直播间</div><div style="font-size:12px;opacity:.68;margin-top:5px;">12.8w 正在看 · TA 也在旁边看</div></div><div class="xsj-v7-live-bubbles"><div class="xsj-v7-live-bubble">路人：这个歌单好适合晚上听</div><div class="xsj-v7-live-bubble">TA：这句歌词我想转给你</div><div class="xsj-v7-live-bubble">系统：已记录打赏和评论</div></div><div class="xsj-v7-search" style="background:rgba(255,255,255,.16);color:var(--bg);"><input style="color:var(--bg)" placeholder="发一条弹幕或转给TA讨论"></div></div>'+section('直播记录','全部',row('gift','打赏记录','小礼物 3 次，已进入钱包流水','查看')+row('comment','弹幕摘录','TA 对歌词和主播评论有反应','查看',true)+row('music','转去一起听歌','把直播里的歌加入歌单','可用'));
    if(view==='batch')body='<div class="xsj-v7-card"><div class="xsj-v7-section-title">批量生成</div><div class="xsj-v7-note" style="margin-top:8px">可一次生成角色手机、小红书、直播、购物、浏览器、论坛、游戏记录。</div></div>'+section('生成模块','选择',row('phone','角色手机','微信联系人、聊天记录、通话、备忘录','已选')+row('xhs','小红书','笔记、评论、收藏、浏览记录','已选',true)+row('live','抖音直播','直播间、弹幕、打赏、观看记录','已选')+row('browser','浏览器','搜索记录、网页记录、收藏夹','可选'))+btns('保存模板','开始生成');
    return '<div class="xsj-v7-root">'+top+body+'</div>';
  }
  function worldbook(view){view=view||state.worldbook;var top=head('世界书','WORLDBOOK','管理全局和局部世界书，控制触发、注入深度和写作风格。','<div class="xsj-v7-iconbtn">'+ico('search')+'</div><div class="xsj-v7-iconbtn dark" onclick="xsjV7Nav(\'worldbook\',\'edit\')">'+ico('plus')+'</div>')+tabs('worldbook',[['home','总览','book'],['entries','条目','list'],['edit','编辑','pen'],['style','文风','pen'],['inject','注入','settings']],view);var body='';
    if(view==='home')body='<div class="xsj-v7-card"><div class="xsj-v7-section-title">当前读取</div><div class="xsj-v7-note" style="margin-top:8px">全局世界书 2 本，当前角色局部世界书 1 本，线下模式文风预设 1 个。</div>'+pills(['全局','局部','文风','已启用'],0)+'</div>'+section('世界书分类','管理',row('book','校园世界','全局 · 42 条 · 注入深度 4','启用')+row('book','雨天便利店','局部 · 12 条 · 当前聊天触发','启用',true)+row('pen','日常细腻文风','线下模式专用 · 旁白/心声/对话分层','启用'));
    if(view==='entries')body=section('条目列表','新建',row('book','便利店门口','关键词：雨、便利店、没吃晚饭','深度 4')+row('heart','关系边界','角色靠近前会先观察用户情绪','深度 3',true)+row('map','城市白色街区','位置卡片触发，影响线下模式场景','深度 2'));
    if(view==='edit')body='<input class="xsj-v7-input" value="新条目标题"><input class="xsj-v7-input" value="关键词：雨天，便利店，晚饭"><textarea class="xsj-v7-textarea">这里填写世界书正文。可以选择触发方式、注入深度、适用角色和插入位置。</textarea>'+section('触发设置','',row('settings','触发方式','关键词触发 / 始终注入 / 场景触发','关键词')+row('user','适用角色','当前角色 / 全角色 / 分组角色','当前',true)+row('book','插入位置','系统前置 / 最近对话前 / 线下模式旁白前','最近'))+btns('取消','保存条目');
    if(view==='style')body='<div class="xsj-v7-reader">旁白：雨停得很慢，楼下的灯把水痕照得发白。<br><br>对话：先上去吧，别站在风口。<br><br>心声：他其实还想问你今天为什么突然安静。</div>'+section('文风参数','编辑',row('pen','旁白风格','细腻、克制、生活化','开启')+row('comment','对话风格','短句、自然停顿、少解释','开启',true)+row('heart','心声风格','独立显示，不直接泄露过多','开启'));
    if(view==='inject')body='<div class="xsj-v7-rule-card"><div class="xsj-v7-row-title">注入深度</div><div class="xsj-v7-depth"><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span></span><span></span></div><div class="xsj-v7-note" style="margin-top:12px">当前推荐深度 4。线下模式可更深，普通聊天建议浅一点。</div></div>'+section('注入规则','',row('book','全局世界书','始终可读，优先级较低','开启')+row('user','局部世界书','当前角色优先读取','开启',true)+row('pen','文风预设','仅线下模式读取','开启'));
    return '<div class="xsj-v7-root">'+top+body+'</div>';
  }
  function ao3(view){view=view||state.ao3;var top=head('AO3','FAN WORKS','写同人文、看 AI 生成作品，也能转发给角色讨论。','<div class="xsj-v7-iconbtn">'+ico('search')+'</div><div class="xsj-v7-iconbtn dark" onclick="xsjV7Nav(\'ao3\',\'write\')">'+ico('pen')+'</div>')+tabs('ao3',[['home','推荐','book'],['tags','分类','list'],['write','写作','pen'],['mine','我的','user'],['reader','阅读','book']],view);var body='';
    if(view==='home')body='<div class="xsj-v7-work"><div class="xsj-v7-kicker">FEATURED WORK</div><div class="xsj-v7-work-title">雨夜后的一封回信</div><div class="xsj-v7-work-summary">日常、慢热、书信体。可让角色点评文风、续写或转入线下模式。</div>'+pills(['G','日常','慢热','雨夜'],1)+'</div>'+section('作品列表','更多',row('book','便利店门口','字数 4.2k · 评论 28 · 可转给角色','阅读','xsjV7Nav(\'ao3\',\'reader\')')+row('pen','未发送的语音','语音通话剧情素材，可续写','阅读',true)+row('comment','论坛体：他们都在看','路人和角色一起互动','阅读'));
    if(view==='tags')body=pills(['日常','慢热','书信','吃醋','重逢','论坛体','聊天体'],0)+section('分类榜单','全部',row('book','聊天体','像真实聊天记录一样推进剧情','136 篇')+row('pen','论坛体','路人和角色共同参与讨论','89 篇',true)+row('heart','情侣空间','留言、情书、悄悄话','42 篇'));
    if(view==='write')body='<input class="xsj-v7-input" value="便利店门口"><input class="xsj-v7-input" value="日常，慢热，雨夜"><textarea class="xsj-v7-textarea">正文从这里开始。可切换旁白、心声、对话字体，也可以读取文风预设。</textarea>'+btns('保存草稿','发布');
    if(view==='mine')body=section('我的作品','管理',row('book','星辰之约','原创 · 12 章 · 可转发给角色','编辑')+row('pen','城市之光','同人 · 5 章 · 评论 18','继续写',true)+row('heart','收藏作品','喜欢、稍后读、角色推荐','查看'));
    if(view==='reader')body='<div class="xsj-v7-reader">雨停下来的时候，便利店门口只剩下一小片白色的灯光。<br><br>他没有立刻说话，只是把伞往你这边偏了一点。那一瞬间，你忽然觉得有些话不必马上问出口。</div>'+section('互动','',row('comment','评论','写短评或让角色评论这段','进入')+row('share','转给TA','发到聊天里一起讨论','发送',true)+row('pen','续写','转入线下模式继续生成','开始'));
    return '<div class="xsj-v7-root">'+top+body+'</div>';
  }
  function game(view){return '<div class="xsj-v7-root">'+head('游戏','GAME CENTER','记录角色游戏状态、战绩、开黑邀请和游戏内聊天。','<div class="xsj-v7-iconbtn dark">'+ico('game')+'</div>')+'<div class="xsj-v7-card"><div class="xsj-v7-section-title">正在游玩</div><div class="xsj-v7-note" style="margin-top:8px">TA 已经在房间里等了 12 分钟，可以一键发送组队邀请到聊天。</div></div><div class="xsj-v7-grid3"><div class="xsj-v7-card tight"><div class="xsj-v7-price">76</div><div class="xsj-v7-row-desc">胜率</div></div><div class="xsj-v7-card tight"><div class="xsj-v7-price">4</div><div class="xsj-v7-row-desc">连胜</div></div><div class="xsj-v7-card tight"><div class="xsj-v7-price">12m</div><div class="xsj-v7-row-desc">在线</div></div></div>'+section('最近记录','全部',row('game','深夜排位','输了会短暂沉默，赢了会主动发截图','刚刚')+row('comment','组队邀请','可以一键发到聊天','邀请',true)+row('heart','角色反应','根据胜负调整语气和主动消息','设置'))+'</div>';}

  var renderers={shop:shop,forum:forum,view:viewApp,pet:pet,memory:memory,worldbook:worldbook,ao3:ao3,game:game};
  function render(app,view){if(view)state[app]=view;var root=document.getElementById('xsj-app-root-'+app);if(root&&renderers[app])root.innerHTML=renderers[app](state[app]);fixCriticalIcons();}
  window.xsjV7Nav=function(app,view){render(app,view);};
  window.xsjV7Product=function(name,price,ic){var old=window.xsjOpenFeature; if(typeof old==='function')old('xsj-v4-placeholder','商品详情');setTimeout(function(){var tt=document.getElementById('xsj-feature-title'),ss=document.getElementById('xsj-feature-sub'),bb=document.getElementById('xsj-feature-body');if(tt)tt.textContent='商品详情';if(ss)ss.textContent='product detail';if(bb)bb.innerHTML='<div class="xsj-v7-root"><div class="xsj-v7-product-img" style="height:260px;border-radius:30px">'+ico(ic,'s28')+'</div><div class="xsj-v7-card"><div class="xsj-v7-title" style="font-size:24px">'+name+'</div><div class="xsj-v7-price" style="font-size:26px;margin-top:8px">￥'+price+'</div><div class="xsj-v7-note" style="margin-top:10px">可作为聊天商品卡片发送，也可以选择送给角色、找角色代付、加入购物车或加入礼物记录。</div></div><div class="xsj-v7-grid2"><button class="xsj-v7-btn ghost">'+ico('share')+'发给TA</button><button class="xsj-v7-btn">'+ico('cart')+'加入购物车</button></div></div>';},0);};
  window.xsjV7Compose=function(){var old=window.xsjOpenFeature; if(typeof old==='function')old('xsj-v4-placeholder','发帖');setTimeout(function(){var tt=document.getElementById('xsj-feature-title'),ss=document.getElementById('xsj-feature-sub'),bb=document.getElementById('xsj-feature-body');if(tt)tt.textContent='发帖';if(ss)ss.textContent='forum compose';if(bb)bb.innerHTML='<div class="xsj-v7-root"><textarea class="xsj-v7-textarea" placeholder="分享一点想法，角色和路人都可以互动。"></textarea><input class="xsj-v7-input" value="可见范围：广场 / 角色可见"><input class="xsj-v7-input" value="添加话题：真实聊天感"><div class="xsj-v7-grid2"><button class="xsj-v7-btn ghost">存草稿</button><button class="xsj-v7-btn">发布</button></div></div>';},0);};
  function patchIcon(selector,name){var box=document.querySelector(selector+' .app-icon-box');if(!box)return;box.innerHTML=ico(name,'s24');box.dataset.xsjV7Icon='fixed';}
  function fixCriticalIcons(){
    patchIcon('.app-icon-wrap[onclick*="openApp(\'memory\')"]','memory');
    patchIcon('.app-icon-wrap[onclick*="openApp(\'pet\')"]','pet');
    document.querySelectorAll('.app-icon-box svg').forEach(function(s){s.style.display='block';});
  }
  var oldOpen=window.openApp;if(typeof oldOpen==='function'&&!oldOpen._xsjV7){window.openApp=function(name){oldOpen(name);setTimeout(function(){render(name);fixCriticalIcons();},120);};window.openApp._xsjV7=true;}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){fixCriticalIcons();['shop','forum','view','pet','memory','worldbook','ao3','game'].forEach(function(a){render(a);});},260);});
})();


// ══ xsj-v9-smooth-patch ══

(function(){
  var PET_ORIGINAL_SVG='<svg width="22" height="22" viewBox="0 0 1024 1024" fill="currentColor" stroke="none"><path d="M353.28 939.008c-53.248 0-103.936-22.528-137.728-61.44-20.992-25.088-80.384-115.2 9.728-245.248C329.728 478.72 425.472 404.48 516.096 404.48c90.624 0 186.368 74.752 291.328 227.84 82.944 123.904 41.984 206.336 10.24 244.224-51.2 61.44-141.312 78.848-219.136 42.496-38.4-17.408-65.536-29.184-81.92-29.184-16.384 0-42.496 11.264-80.896 28.672-24.576 13.824-50.176 20.48-82.432 20.48z m162.816-460.8c-63.488 0-141.312 66.048-230.4 195.584-56.832 81.92-33.28 132.096-14.336 155.136 19.456 22.528 49.664 35.328 81.408 35.328 19.968 0 33.28-3.072 46.08-11.264l3.584-2.048c49.152-22.528 81.408-35.84 113.152-35.84 31.744 0 64 13.824 113.152 35.84 47.104 22.016 102.4 12.288 131.584-22.528 40.96-49.152 14.848-111.616-14.848-155.648-88.064-128.512-165.888-194.56-229.376-194.56z m374.784 118.272c-17.92 0-34.304-5.12-48.128-10.24l-5.12-2.048c-32.768-16.384-56.832-37.376-72.192-62.976-16.896-28.16-19.456-66.048-8.192-106.496 10.24-35.328 34.304-67.584 68.096-90.112 35.84-25.6 76.288-33.28 113.664-20.48l1.536 0.512c73.728 28.16 96.256 125.44 75.264 199.68l-1.536 4.608c-15.36 35.328-36.864 58.88-70.656 75.776l-4.608 2.048c-13.824 4.608-29.696 9.728-48.128 9.728z m-22.016-79.36c17.408 5.632 27.648 5.632 44.544 0 15.36-8.192 24.576-17.92 32.256-35.328 10.752-40.448 0-95.232-30.72-107.52-17.92-5.632-35.84 3.072-47.616 11.776-19.968 13.312-33.792 30.72-38.912 49.152-5.632 19.968-5.632 38.4 0 48.128 8.192 12.8 22.016 24.064 40.448 33.792zM145.408 596.48c-18.432 0-34.304-5.12-48.128-10.24l-5.12-2.048c-31.232-15.36-54.272-41.472-70.656-79.872-27.648-71.68-3.584-172.032 69.632-200.192 38.912-12.8 79.872-5.632 116.224 20.48 29.696 19.456 54.784 50.176 69.632 84.992l1.536 4.608c11.264 39.424 9.216 72.704-6.656 103.936l-1.536 2.56c-15.36 25.6-39.424 46.592-72.192 62.976l-4.608 2.048c-14.336 5.632-30.208 10.752-48.128 10.752zM122.88 517.12c17.408 5.632 27.136 5.632 44.544 0 17.92-9.216 31.232-20.48 38.912-32.256 6.144-13.824 6.656-27.648 1.536-47.104-9.216-20.992-24.576-38.912-42.496-51.2-12.8-9.216-31.232-17.92-49.152-11.776-29.184 11.264-39.424 67.072-26.112 102.4 8.704 19.456 18.944 32.256 32.768 39.936z m540.16-112.128L634.88 404.48c-77.824-16.896-121.856-86.528-105.984-169.472 10.752-52.736 43.008-103.936 82.944-130.048 26.624-17.408 55.296-23.552 83.456-17.408 44.544 12.8 76.288 42.496 92.16 84.48 11.264 39.424 14.336 76.8 10.24 111.104-4.608 38.912-24.064 73.728-54.272 97.792-22.528 16.384-49.152 24.064-80.384 24.064z m-16.384-74.24h15.872c15.36 0 27.136-3.072 34.816-8.704 9.728-7.68 23.04-23.04 26.112-48.128 3.072-24.576 0.512-52.224-7.168-78.848-8.192-22.016-26.112-31.744-39.936-35.84-0.512 0-10.24-2.048-25.088 7.68-23.04 14.848-44.544 49.664-50.688 81.92-7.168 41.984 9.728 72.704 46.08 81.92zM396.288 404.992h-23.04c-31.232 0-57.344-7.68-78.336-23.04-37.888-25.6-51.712-64-59.392-94.72l-1.024-4.608c-5.12-39.424 0-78.336 14.848-113.152 17.408-46.592 53.248-76.8 94.208-79.36 40.448-9.728 81.92 7.168 114.688 45.568C486.4 169.984 503.296 204.8 507.392 240.64c8.192 39.424 0 79.872-22.016 111.104-20.48 28.672-51.2 47.104-87.04 52.224l-2.048 1.024zM308.224 271.36c6.656 25.6 15.36 39.936 28.672 49.152l1.536 1.024c7.68 6.144 19.456 8.704 34.816 8.704h17.408c14.336-2.56 26.624-9.728 34.816-21.504 10.24-14.848 13.824-34.816 9.216-56.32-3.072-24.576-13.824-46.08-32.768-69.12-10.24-11.776-26.112-25.6-43.008-20.48l-10.24 1.536c-10.752 0-23.552 13.824-30.72 32.768-9.216 23.552-12.8 48.64-9.728 74.24z"/></svg>';
  function restoreOriginalPetIcon(){
    var box=document.querySelector('.dock .app-icon-wrap[onclick*="openApp(\'pet\')"] .app-icon-box');
    if(box && box.innerHTML.indexOf('viewBox="0 0 1024 1024"')===-1){
      box.innerHTML=PET_ORIGINAL_SVG;
      box.dataset.xsjPetOriginal='1';
    }
  }
  function scheduleRestorePetIcon(){
    restoreOriginalPetIcon();
    [0,60,160,320,640].forEach(function(ms){setTimeout(restoreOriginalPetIcon,ms);});
  }
  function resetAppContent(ct){
    ct.classList.remove('chat-overlay-bg');
    ct.removeAttribute('style');
    ct.scrollTop=0;
  }
  function backSvg(){
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
  }
  var enhanced={worldbook:1,memory:1,forum:1,game:1,shop:1,view:1,pet:1,ao3:1};
  var fallbackOpen=window.openApp;
  window.openApp=function(name){
    name=String(name||'');
    if(name==='chat' && typeof window.openChatApp==='function'){
      scheduleRestorePetIcon();
      return window.openChatApp();
    }
    if(enhanced[name] && typeof window.xsjV7Nav==='function'){
      var ov=document.getElementById('app-overlay');
      var ct=document.getElementById('app-content');
      if(!ov||!ct){ if(typeof fallbackOpen==='function')return fallbackOpen(name); return; }
      ov.classList.remove('show','settings-mode','xsj-v4-forum','xsj-v4-shop','xsj-v5-shop-overlay','xsj-v5-forum-overlay');
      ov.classList.add('xsj-premium-app-mode','xsj-smooth-open');
      resetAppContent(ct);
      ct.innerHTML='<div class="app-back" onclick="closeApp()">'+backSvg()+'</div><div id="xsj-app-root-'+name+'"></div>';
      ov.style.display='block';
      window.xsjV7Nav(name);
      scheduleRestorePetIcon();
      requestAnimationFrame(function(){ov.classList.add('show');});
      return;
    }
    var ov2=document.getElementById('app-overlay');
    if(ov2)ov2.classList.remove('xsj-premium-app-mode','xsj-smooth-open');
    var result=typeof fallbackOpen==='function'?fallbackOpen(name):undefined;
    scheduleRestorePetIcon();
    return result;
  };
  window.openApp._xsjAdvanced=true;
  window.openApp._xsjV7=true;
  var fallbackClose=window.closeApp;
  window.closeApp=function(){
    var ov=document.getElementById('app-overlay');
    if(ov)ov.classList.remove('xsj-premium-app-mode','xsj-smooth-open','xsj-v4-app','xsj-v5-app','xsj-v7-app');
    if(typeof fallbackClose==='function')return fallbackClose();
  };
  document.addEventListener('DOMContentLoaded',scheduleRestorePetIcon);
  if(document.readyState!=='loading')scheduleRestorePetIcon();
})();
