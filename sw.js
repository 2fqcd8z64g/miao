const CACHE_NAME='oc-vn-ai-v34';
const STATIC_ASSETS=[
  './',
  './index.html',
  './app.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req);
        const cache=await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone());
        return fresh;
      }catch(err){
        const cached=await caches.match('./index.html');
        return cached||Response.error();
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached)return cached;
    try{
      const fresh=await fetch(req);
      if(fresh && fresh.ok && (url.pathname.endsWith('.png')||url.pathname.endsWith('.webmanifest')||url.pathname.endsWith('.html')||url.pathname.endsWith('.json'))){
        const cache=await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    }catch(err){
      const fallback=await caches.match(req);
      return fallback||Response.error();
    }
  })());
});
