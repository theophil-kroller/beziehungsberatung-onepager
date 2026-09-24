/* BUILD 14.3.5.11 — privacy toggle for the client record.
   Default: hidden on every open. No data is changed; this is presentation-only. */
(function(){
  'use strict';
  const dlg=document.getElementById('clientDialog');
  const btn=document.getElementById('recordPrivacyToggle');
  if(!dlg||!btn)return;

  function setHidden(hidden){
    dlg.classList.toggle('record-private-hidden',!!hidden);
    btn.classList.toggle('is-hidden',!!hidden);
    btn.setAttribute('aria-pressed',hidden?'true':'false');
    const label=hidden?'Klientendaten anzeigen':'Klientendaten ausblenden';
    btn.setAttribute('title',label);
    btn.setAttribute('aria-label',label);
  }

  btn.addEventListener('click',()=>setHidden(!dlg.classList.contains('record-private-hidden')));

  // Every newly opened client record starts privacy-protected. The user explicitly reveals it.
  const observer=new MutationObserver(muts=>{
    for(const m of muts){
      if(m.type==='attributes'&&m.attributeName==='open'&&dlg.hasAttribute('open')){
        setHidden(true);
        break;
      }
    }
  });
  observer.observe(dlg,{attributes:true,attributeFilter:['open']});

  if(dlg.hasAttribute('open'))setHidden(true);
})();
