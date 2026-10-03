const CACHE='bd-admin-mobile-static-15.4.5';
const ASSETS=['/mobile/','/mobile/app.css?v=15.4.5','/mobile/app.js?v=15.4.5','/mobile/manifest.webmanifest','/mobile/icon-192.png','/mobile/icon-512.png','/booking-config.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('bd-admin-mobile-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const u=new URL(event.request.url);
  if(event.request.method!=='GET'||u.pathname.startsWith('/admin/')||u.pathname.startsWith('/public/'))return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(r=>{if(r.ok&&u.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return r})));
});
