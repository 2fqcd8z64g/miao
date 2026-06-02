/* =======================================================================
   shop.js  v2  —  YIMO「商城」板块：装入外卖 App (foodie.html)
   修复点：YIMO 代码把 'shop' 放进了"禁用名单"(DISABLED_APPS)，导致点商城被拦截、什么都不做。
          本文件改为「自己直接打开商城页面」绕过禁用，再装入 foodie.html。
   放法：foodie.html / shop.js / 主文件 放同一文件夹；主文件 </body> 前已加 <script src="shop.js"></script>
   只改本文件即可，主文件和 foodie.html 都不用动。外卖跑在独立 iframe 里，和 YIMO 互不干扰。
   ======================================================================= */
(function(){
  'use strict';
  var BACK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';

  function injectStyle(){
    if (document.getElementById('shop-frame-style')) return;
    var s = document.createElement('style');
    s.id = 'shop-frame-style';
    s.textContent =
      '#shop-root{padding:0;margin:0;}'
      + '#shop-frame{display:block;width:100%;border:0;background:var(--bg,#fff);'
      +   'height:calc(100vh - 92px);height:calc(100dvh - 92px);}';
    document.head.appendChild(s);
  }

  function renderShopBoard(){
    var ct = document.getElementById('app-content'); if (!ct) return;
    injectStyle();
    var root = ct.querySelector('#shop-root');
    if (!root){ ct.insertAdjacentHTML('beforeend','<div id="shop-root"></div>'); root = ct.querySelector('#shop-root'); }
    if (!root.querySelector('#shop-frame')){
      root.innerHTML = '<iframe id="shop-frame" src="foodie.html" title="商城" allow="clipboard-write"></iframe>';
    }
  }

  /* 自己打开商城浮层（绕过 DISABLED_APPS 的拦截），再装入外卖 */
  function openShop(){
    var ov = document.getElementById('app-overlay');
    var ct = document.getElementById('app-content');
    if (!ov || !ct) return;
    ov.classList.remove('settings-mode','beautify-mode','xsj-premium-app-mode','xsj-smooth-open','xsj-v4-app','xsj-v5-app','xsj-v7-app');
    ct.innerHTML = '<div class="app-back" onclick="closeApp()" style="z-index:10">' + BACK + '</div>'
                 + '<div class="app-title">商城</div>'
                 + '<div id="shop-root"></div>';
    ov.style.display = 'block';
    requestAnimationFrame(function(){ ov.classList.add('show'); });
    renderShopBoard();
  }
  window.openShopBoard = openShop;

  /* 1) 点"商城"图标 → 抢在 YIMO 的"禁用"处理之前，自己打开 */
  document.addEventListener('click', function(e){
    var icon = e.target.closest ? e.target.closest('[data-app-id="shop"]') : null;
    if (!icon) return;
    e.preventDefault();
    e.stopPropagation();
    openShop();
  }, true);

  /* 2) 万一别处用 openApp('shop') 调用，也让它能开（绕过禁用） */
  var prev = window.openApp;
  if (typeof prev === 'function' && !prev._shopBoard){
    window.openApp = function(name){
      if (name === 'shop'){ openShop(); return; }
      return prev(name);
    };
    window.openApp._shopBoard = true;
  }

  /* 下一步用：外卖下单 → 变成聊天里的代付/礼物卡片（先收消息弹提示，证明通道通） */
  window.addEventListener('message', function(e){
    var d = e && e.data;
    if (!d || d.type !== 'foodie-order') return;
    if (typeof window.showToast === 'function') window.showToast('收到外卖订单（下一步会发到聊天）');
  });
})();
