/* Beziehungsdynamiken 15.12.103 · session-validated workspace gate (not a server-side protection of static assets) */
(()=>{'use strict';
 const host=location.hostname.toLowerCase(),isLocal=host==='127.0.0.1'||host==='localhost';
 const target=location.pathname.split('/').pop().toLowerCase();
 const allowed=new Set(['hub.html','message-center.html','methods.html','workshops.html','newsletter-admin.html','assessments.html']);
 if(!allowed.has(target))return;
 const tokenKey='bd_admin_session_v1';
 const API=(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
 // Local desktop has a separate offline-first protection model (CRM + local Vault).
 if(isLocal && location.port==='47832'){document.documentElement.classList.remove('bd103-guard-pending');return;}
 const page=document.documentElement;
 page.classList.add('bd103-guard-pending');
 const back=()=>{
   const dest=location.pathname+location.search+location.hash;
   location.replace('admin.html?next='+encodeURIComponent(dest));
 };
 const token=(()=>{try{return sessionStorage.getItem(tokenKey)||''}catch(_){return''}})();
 if(!token||!API){back();return}
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8500);
 fetch(API+'/admin/me',{method:'GET',headers:{Authorization:'Bearer '+token},cache:'no-store',signal:controller.signal})
 .then(async r=>{
  let body=null;try{body=await r.json()}catch(_){body={}}
  if(!r.ok||body?.ok!==true||!body.user)throw Error('Unauthorized');
  page.classList.remove('bd103-guard-pending');page.classList.add('bd103-guard-verified');
  // On return from background, revalidate before exposing a potentially stale UI.
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible' && Date.now()-(window.__BD103ValidatedAt||0)>60000){
      page.classList.remove('bd103-guard-verified');page.classList.add('bd103-guard-pending');
      const stored=sessionStorage.getItem(tokenKey)||'';
      if(stored!==token){back();return}
      fetch(API+'/admin/me',{headers:{Authorization:'Bearer '+token},cache:'no-store'})
        .then(r=>r.ok?r.json():Promise.reject(Error('Unauthorized')))
        .then(d=>{if(d?.ok!==true||!d.user)throw Error('Unauthorized');window.__BD103ValidatedAt=Date.now();page.classList.remove('bd103-guard-pending');page.classList.add('bd103-guard-verified')})
        .catch(back);
    }
  });
  window.__BD103ValidatedAt=Date.now();
  // Catch server-side revocation even in a foreground tab without user navigation.
  setInterval(()=>{
    if(document.visibilityState==='hidden')return;
    const stored=sessionStorage.getItem(tokenKey)||'';
    if(stored!==token){page.classList.remove('bd103-guard-verified');page.classList.add('bd103-guard-pending');back();return}
    fetch(API+'/admin/me',{headers:{Authorization:'Bearer '+token},cache:'no-store'})
      .then(async r=>{if(!r.ok)throw Error('Unauthorized');const x=await r.json();if(x?.ok!==true||!x.user)throw Error('Unauthorized');window.__BD103ValidatedAt=Date.now()})
      .catch(()=>{page.classList.remove('bd103-guard-verified');page.classList.add('bd103-guard-pending');back()});
  },120000);
 })
 .catch(()=>{back()})
 .finally(()=>clearTimeout(timeout));
})();
