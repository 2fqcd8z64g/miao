const CACHE_NAME='xsj-v1';
const ASSETS=['./','./index.html','./manifest.json',
'./css/base.css','./css/chat.css','./css/conversation.css','./css/apps.css','./css/worldbook.css',
'./js/core.js','./js/settings.js','./js/beautify.js','./js/chat.js','./js/conversation.js','./js/patches.js','./js/worldbook.js'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(function(r){
      if(r)return r;
      return fetch(e.request).then(function(res){
        if(!res||res.status!==200)return res;
        var cl=res.clone();
        caches.open(CACHE_NAME).then(function(c){c.put(e.request,cl);});
        return res;
      }).catch(function(){return r;});
    })
  );
});
