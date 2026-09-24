const CACHE='bd-capture-14-3-6';
const SHELL=['/capture.html','/capture.css?v=14-3-6','/capture.js?v=14-3-6','/capture-manifest.webmanifest','/booking-config.js?v=20260918-build8','/capture-icon-192.png','/capture-icon-512.png'];
const CAPTURE_PATHS=new Set(['/capture.html','/capture.css','/capture.js','/capture-manifest.webmanifest','/booking-config.js','/capture-icon-192.png','/capture-icon-512.png']);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key.startsWith('bd-capture-')).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  // The service worker lives at the site root, but must never turn the rest of
  // beziehungsdynamiken.at into the Capture PWA while offline.
  if(!CAPTURE_PATHS.has(url.pathname))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('/capture.html',copy));return response}).catch(()=>caches.match('/capture.html')));
    return;
  }
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(hit=>{
    const fresh=fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}).catch(()=>null);
    return hit||fresh;
  }));
});
