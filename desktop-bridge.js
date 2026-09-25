(function(){
  'use strict';
  const isDesktop = (location.hostname==='127.0.0.1'||location.hostname==='localhost') && location.port==='47832';
  const desktop = {
    isDesktop,
    version:'14.4.0-beta',
    async status(){
      if(!isDesktop) return {ok:false,isDesktop:false};
      const r=await fetch('/desktop/status',{cache:'no-store'});return r.json();
    },
    async startVault(){
      if(!isDesktop) return {ok:false,error:'Desktop-Shell ist nicht aktiv.'};
      const r=await fetch('/desktop/start-vault',{method:'POST',cache:'no-store'});const x=await r.json();
      if(!r.ok) throw new Error(x.error||'Vault konnte nicht gestartet werden.');
      return x;
    }
  };
  window.BDDesktop=desktop;
  if(!isDesktop) return;
  document.documentElement.classList.add('bd-desktop-shell');
  async function pollDesktopLogin(){
    if(!isDesktop || new URL(location.href).searchParams.get('login')) return;
    try{
      const r=await fetch('/desktop/login-token',{cache:'no-store'}),x=await r.json();
      if(x?.token){ location.href='/admin.html?desktop=1&login='+encodeURIComponent(x.token); return; }
    }catch(_){}
    setTimeout(pollDesktopLogin,1800);
  }
  pollDesktopLogin();

  if(window.BD_BOOKING_CONFIG){
    window.BD_BOOKING_CONFIG.apiBaseUrl=location.origin+'/desktop/cloud';
  }
  window.addEventListener('DOMContentLoaded',()=>document.body?.classList.add('bd-desktop-shell'));
})();
