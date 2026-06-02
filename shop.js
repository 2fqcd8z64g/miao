/* =======================================================================
   shop.js  —  YIMO「商城」板块：把你的外卖 App(foodie.html) 装进一个内嵌小窗
   放法：① 把 foodie.html 和本文件、主文件放同一文件夹
        ② 主文件 </body> 前加：<script src="shop.js"></script>
   原理：用主程序最常用的「包住 openApp」写法，点商城时把 foodie.html 显示在板块里。
        外卖跑在独立 iframe 里，和 YIMO 完全隔离，不会互相干扰，坏不了。
   ======================================================================= */
(function(){
  'use strict';

  function injectStyle(){
    if (document.getElementById('shop-frame-style')) return;
    var s = document.createElement('style');
    s.id = 'shop-frame-style';
    s.textContent =
      '#shop-root{padding:0;margin:0;}'
      + '#shop-frame{display:block;width:100%;border:0;background:var(--bg,#fff);'
      +   'height:calc(100vh - 96px);height:calc(100dvh - 96px);}';
    document.head.appendChild(s);
  }

  function renderShopBoard(){
    var ct = document.getElementById('app-content');     // 主程序打开 App 用的容器
    if (!ct) return;
    injectStyle();
    var root = ct.querySelector('#shop-root');
    if (!root){ ct.insertAdjacentHTML('beforeend','<div id="shop-root"></div>'); root = ct.querySelector('#shop-root'); }
    if (!root.querySelector('#shop-frame')){
      root.innerHTML = '<iframe id="shop-frame" src="foodie.html" title="商城" allow="clipboard-write"></iframe>';
    }
  }

  /* 下一步用：外卖里下单时会通过 postMessage 通知这里，再变成聊天里的代付/礼物卡片。
     现在先收个消息弹个提示，证明通道是通的。 */
  window.addEventListener('message', function(e){
    var d = e && e.data;
    if (!d || d.type !== 'foodie-order') return;
    if (typeof window.showToast === 'function') window.showToast('收到外卖订单（下一步会发到聊天）');
  });

  /* 连接点：包住 openApp（与主程序现有 10 处写法一致） */
  var prevOpen = window.openApp;
  if (typeof prevOpen === 'function' && !prevOpen._shopBoard){
    window.openApp = function(name){
      prevOpen(name);
      if (name === 'shop') setTimeout(renderShopBoard, 0);
    };
    window.openApp._shopBoard = true;
  }

  /* 安全网：无论商城图标怎么触发，点它后都补渲染一次 */
  document.addEventListener('click', function(e){
    var icon = e.target.closest ? e.target.closest('[data-app-id="shop"]') : null;
    if (icon) setTimeout(renderShopBoard, 40);
  }, true);
})();
