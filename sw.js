/* Little Genius service worker: always fetch the newest files when online, fall back to the saved copy when offline. */
const V='lg-v2',FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  /* cache each file on its own, so one missing file can never block the install */
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(
    /* cache:'no-store' skips the browser's own 10-minute copy, so a new GitHub version shows straight away */
    fetch(e.request,{cache:'no-store'}).then(r=>{
      if(r&&r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}
      return r;
    }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html')))
  );
});
