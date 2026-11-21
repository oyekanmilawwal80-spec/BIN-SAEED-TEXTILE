/* BIN SAEED TEXTILE service worker. Bump VERSION on every release. */
const VERSION='v5',CACHE='bst-static-'+VERSION;
const ASSETS=['app.css','config-and-app.js','manifest.json','icon.svg','icon-180.png','icon-192.png','icon-512.png','icon-maskable-512.png','offline.html'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(a=>c.add(a).catch(()=>{})))));
 self.skipWaiting()});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('bst-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 // Only same-origin GETs. Supabase (login, database, orders, admin data) is cross-origin and is never touched or cached.
 if(r.method!=='GET'||u.origin!==location.origin)return;
 // Pages: always fresh from the network; show offline page if there is no connection. Pages are never stored.
 if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match('offline.html')));return}
 // Static files: serve cached copy fast, refresh it in the background.
 if(ASSETS.some(a=>u.pathname.endsWith('/'+a))){
  e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>{
   const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
   return hit||net})))}
});
self.addEventListener('push',e=>{const d=e.data?e.data.json():{title:'BIN SAEED TEXTILE',body:''};
 e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'icon-192.png',badge:'icon-192.png'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();
 e.waitUntil(clients.matchAll({type:'window'}).then(w=>w[0]?w[0].focus():clients.openWindow('index.html')))});
