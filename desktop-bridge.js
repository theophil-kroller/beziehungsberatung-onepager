(function(){
  'use strict';
  const isDesktop = (location.hostname==='127.0.0.1'||location.hostname==='localhost') && location.port==='47832';
  const pageName=(location.pathname.split('/').pop()||'').toLowerCase();
  const isAdminPage=pageName==='admin.html';
  const SESSION_KEY='bd_admin_session_v1';
  const desktop = {
    isDesktop,
    version:'14.7.2-beta',
    async status(){
      if(!isDesktop) return {ok:false,isDesktop:false};
      const r=await fetch('/desktop/status',{cache:'no-store'});return r.json();
    },
    async startVault(){
      if(!isDesktop) return {ok:false,error:'Desktop-Shell ist nicht aktiv.'};
      const r=await fetch('/desktop/start-vault',{method:'POST',cache:'no-store'});const x=await r.json();
      if(!r.ok) throw new Error(x.error||'Vault konnte nicht gestartet werden.');
      return x;
    },
    async log(stage,detail=''){
      if(!isDesktop)return;
      try{await fetch('/desktop/client-log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({stage,detail:String(detail||'')})})}catch(_){}
    }
  };
  window.BDDesktop=desktop;
  if(!isDesktop) return;
  document.documentElement.classList.add('bd-desktop-shell');

  // The web CRM contains several historical MutationObservers. In a normal web
  // deployment their callbacks are naturally spread out by network/UI timing. When
  // all embedded assets render locally in the desktop shell, large synchronous DOM
  // updates can otherwise create a microtask storm before the browser has a chance
  // to paint. Desktop Beta coalesces observer callbacks onto a short macrotask.
  const NativeMutationObserver=window.MutationObserver;
  if(isAdminPage && NativeMutationObserver && !window.__BD_DESKTOP_SAFE_MUTATIONS__){
    window.__BD_DESKTOP_SAFE_MUTATIONS__=true;
    window.MutationObserver=class DesktopSafeMutationObserver{
      constructor(callback){
        this._callback=callback;this._pending=[];this._timer=null;
        this._native=new NativeMutationObserver((records)=>{
          this._pending.push(...records);
          if(this._timer!==null)return;
          this._timer=setTimeout(()=>{
            this._timer=null;
            const batch=this._pending.splice(0);
            try{this._callback(batch,this)}catch(error){desktop.log('observer_callback_error',error?.stack||error?.message||String(error));setTimeout(()=>{throw error},0)}
          },90);
        });
      }
      observe(target,options){return this._native.observe(target,options)}
      disconnect(){if(this._timer!==null){clearTimeout(this._timer);this._timer=null}this._pending.length=0;return this._native.disconnect()}
      takeRecords(){return this._native.takeRecords()}
    };
  }

  function bootOverlay(){
    // The bootstrap overlay belongs only to the heavy CRM dashboard. Workspaces
    // such as Message Center and Knowledge Hub have their own UI and must remain
    // immediately interactive when navigating inside the desktop shell.
    if(!isAdminPage||!sessionStorage.getItem(SESSION_KEY)||document.getElementById('bdDesktopBootOverlay'))return;
    const style=document.createElement('style');style.id='bdDesktopBootStyle';style.textContent=`#bdDesktopBootOverlay{position:fixed;inset:0;z-index:2147483646;background:#fff7ed;display:grid;place-items:center;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#2f2623}#bdDesktopBootOverlay .bd-boot-card{width:min(560px,calc(100vw - 44px));background:#fff;border:1px solid #ead9c8;border-radius:26px;padding:34px;box-shadow:0 18px 60px rgba(74,52,40,.09)}#bdDesktopBootOverlay .bd-boot-mark{width:42px;height:42px;border-radius:50%;border:4px solid #ecd9cd;border-top-color:#c56546;animation:bdspin .9s linear infinite;margin-bottom:20px}@keyframes bdspin{to{transform:rotate(360deg)}}#bdDesktopBootOverlay h1{font:700 34px/1.08 Georgia,serif;margin:0 0 10px}#bdDesktopBootOverlay p{margin:0;color:#75645d;line-height:1.5}#bdDesktopBootOverlay small{display:block;margin-top:18px;color:#9a887f}`;
    document.head.appendChild(style);
    const el=document.createElement('div');el.id='bdDesktopBootOverlay';el.innerHTML='<div class="bd-boot-card"><div class="bd-boot-mark"></div><h1>Praxisverwaltung wird vorbereitet.</h1><p id="bdDesktopBootText">Lokale Anwendung wird gestartet …</p><small>Deine lokalen Praxisdaten bleiben im Secure Vault.</small></div>';
    document.body.appendChild(el);
  }
  function setBootText(text){const el=document.getElementById('bdDesktopBootText');if(el)el.textContent=text}
  function clearBootOverlay(){document.getElementById('bdDesktopBootOverlay')?.remove();document.getElementById('bdDesktopBootStyle')?.remove()}

  window.addEventListener('error',e=>desktop.log('window_error',e.error?.stack||e.message||'window error'));
  window.addEventListener('unhandledrejection',e=>desktop.log('unhandled_rejection',e.reason?.stack||e.reason?.message||String(e.reason||'')));
  document.addEventListener('bd:desktop-stage',e=>{const stage=String(e.detail?.stage||'stage');const detail=String(e.detail?.detail||'');setBootText(detail||stage);desktop.log(stage,detail)});

  // Compatibility path: a token can still arrive while admin.html is already open.
  async function pollDesktopLogin(){
    if(!isDesktop || new URL(location.href).searchParams.get('login') || sessionStorage.getItem(SESSION_KEY)) return;
    try{
      const r=await fetch('/desktop/login-token',{cache:'no-store'}),x=await r.json();
      if(x?.token){ location.href='/desktop-login.html'; return; }
    }catch(_){}
    setTimeout(pollDesktopLogin,1800);
  }
  pollDesktopLogin();

  if(window.BD_BOOKING_CONFIG){
    window.BD_BOOKING_CONFIG.apiBaseUrl=location.origin+'/desktop/cloud';
  }
  bootOverlay();
  desktop.log(isAdminPage?'admin_shell_loaded':'workspace_shell_loaded',isAdminPage?'desktop bridge 14.4.1.1':location.pathname);
  window.addEventListener('DOMContentLoaded',()=>{document.body?.classList.add('bd-desktop-shell');desktop.log(isAdminPage?'admin_dom_ready':'workspace_dom_ready',location.pathname)});
  window.addEventListener('load',()=>desktop.log(isAdminPage?'admin_window_loaded':'workspace_window_loaded',location.pathname));
  if(isAdminPage){
    document.addEventListener('bd:desktop-ready',()=>{setBootText('Praxisverwaltung ist bereit.');setTimeout(clearBootOverlay,120);desktop.log('admin_ready','dashboard rendered')});
  }
})();
