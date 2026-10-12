const CACHE='le-mie-rate-shell-v2';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil((async()=>{await self.clients.claim(); const keys=await caches.keys(); await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));})()); });
self.addEventListener('fetch', event => {
  const u=new URL(event.request.url);
  if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')) return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE); const cached=await cache.match(event.request); try{const response=await fetch(event.request); if(response.ok)cache.put(event.request,response.clone()); return response;}catch(e){return cached||cache.match('/');}})());
});
self.addEventListener('push', event => {
 let data={title:'Le mie rate',body:'Hai una rata in scadenza.',url:'/'};
 try{if(event.data)data={...data,...event.data.json()};}catch(e){if(event.data)data.body=event.data.text();}
 event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/icon-192.png',badge:'/icon-192.png',tag:'le-mie-rate-due',renotify:true,data:{url:data.url||'/'}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=event.notification.data?.url||'/';const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of clients){if('focus'in c){await c.focus();return;}}if(self.clients.openWindow)await self.clients.openWindow(url);})());});
