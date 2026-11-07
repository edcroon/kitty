// Keeps a copy of Kitty on the phone so it opens instantly, even without signal.
const V='kitty-1794082034', EXT='kitty-ext';
const CORE=['./','./index.html','./shim.js','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==EXT).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    e.respondWith(caches.open(V).then(async c=>{
      const key=req.mode==='navigate'?'./index.html':req;
      const hit=await c.match(key,{ignoreSearch:true});
      const net=fetch(req).then(r=>{ if(r.ok) c.put(key,r.clone()); return r; }).catch(()=>hit);
      return hit||net;
    }));
  } else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$|(^|\.)cdnjs\.cloudflare\.com$/.test(u.hostname)){
    e.respondWith(caches.open(EXT).then(async c=>{ const hit=await c.match(req); if(hit) return hit; const r=await fetch(req); if(r.ok||r.type==='opaque') c.put(req,r.clone()); return r; }));
  }
});
