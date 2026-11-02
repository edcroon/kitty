// Test build: stands in for the Claude runtime and keeps all data on this device (localStorage).
(function(){
  const KEY='kitty-test-db';
  let data={};
  try{ data=JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ data={}; }
  const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} };
  const listeners=[];
  const parent=p=>p.split('/').slice(0,-1).join('/');
  const clone=o=>JSON.parse(JSON.stringify(o));
  const meta={fromCache:false,hasPendingWrites:false};
  function snapDoc(path){ const d=data[path]; return {id:path.split('/').pop(),exists:!!d,data:()=>d?clone(d):undefined,metadata:meta}; }
  function snapCol(path){ const docs=Object.keys(data).filter(k=>parent(k)===path).sort().map(snapDoc); return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:meta}; }
  function fire(path){ setTimeout(()=>{ listeners.slice().forEach(l=>{ if(l.kind==='col'&&l.path===parent(path)) l.cb(snapCol(l.path)); if(l.kind==='doc'&&l.path===path) l.cb(snapDoc(path)); }); },0); }
  function merge(a,b){ const o=Object.assign({},a); Object.keys(b).forEach(k=>{ const v=b[k]; if(v&&typeof v==='object'&&!Array.isArray(v)&&o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])) o[k]=merge(o[k],v); else o[k]=v; }); return o; }
  function sub(kind,path,cb){ const l={kind,path,cb}; listeners.push(l); setTimeout(()=>cb(kind==='col'?snapCol(path):snapDoc(path)),0); return ()=>{ const i=listeners.indexOf(l); if(i>=0) listeners.splice(i,1); }; }
  function docRef(path){ return {id:path.split('/').pop(),path,
    get:async()=>snapDoc(path),
    set:async d=>{ data[path]=clone(d); save(); fire(path); },
    update:async d=>{ if(!data[path]) throw {code:'invalid_argument'}; data[path]=merge(data[path],clone(d)); save(); fire(path); },
    delete:async()=>{ delete data[path]; save(); fire(path); },
    onSnapshot:(cb)=>sub('doc',path,cb),
    collection:s=>colRef(path+'/'+s)}; }
  function colRef(path){ return {path,doc:id=>docRef(path+'/'+(id||Math.random().toString(36).slice(2,12))),onSnapshot:(cb)=>sub('col',path,cb),get:async()=>snapCol(path)}; }
  const db={doc:docRef,collection:colRef};
  const user={id:async()=>'me',can:async()=>true,profiles:async ids=>{ const o={}; ids.forEach(i=>o[i]={name:''}); return o; },isOwner:()=>true,canEdit:()=>true};
  window.claude={use:async n=>({db,user})[n]||null};
})();
