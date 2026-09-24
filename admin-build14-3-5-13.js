(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const icons={
    check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>',
    package:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Zm0 0 8 4.5 8-4.5M12 12v9"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6.1 8.3A7 7 0 0 1 18.7 7M17.9 15.7A7 7 0 0 1 5.3 17"/></svg>',
    eye:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.7-6 9.5-6 9.5 6 9.5 6-3.7 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/></svg>',
    eyeOff:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 6.2A11.2 11.2 0 0 1 12 6c5.8 0 9.5 6 9.5 6a16.3 16.3 0 0 1-2.8 3.4M14.1 14.1A3 3 0 0 1 9.9 9.9M6.1 7.3C3.8 9 2.5 12 2.5 12s3.7 6 9.5 6c1.1 0 2.1-.2 3-.5"/></svg>'
  };
  function iconifyButton(btn,icon,label,extra=''){
    if(!btn)return;
    btn.classList.add('b143513-icon-button',extra);
    if(btn.dataset.b143513Icon!==icon||!btn.querySelector('svg')){btn.innerHTML=icons[icon]||'';btn.dataset.b143513Icon=icon;}
    btn.title=label;
    btn.setAttribute('aria-label',label);
  }
  function polishBriefing(){
    const b=$('#b139Approve');
    if(b&&!b.classList.contains('b143513-icon-button')) iconifyButton(b,'check','Als geprüft markieren','b143513-approve');
  }
  function polishClientActions(){
    $$('.client-command-actions [data-client-tab="bookings"]').forEach(b=>iconifyButton(b,'calendar','Termine','b143513-quick-action'));
    $$('.client-command-actions [data-client-tab="sales"]').forEach(b=>iconifyButton(b,'package','Angebot / Package','b143513-quick-action'));
    $$('.client-secondary-action-grid [data-client-tab="bookings"]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',icons.calendar)});
    $$('.client-secondary-action-grid [data-client-tab="sales"]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',icons.package)});
  }
  function polishRefresh(){
    iconifyButton($('#refreshBtn'),'refresh','Aktualisieren','b143513-refresh');
    iconifyButton($('#flowRefresh'),'refresh','Aktualisieren','b143513-refresh');
  }
  function polishPrivacy(){
    const b=$('#clientPrivacyToggle');
    if(!b)return;
    const pressed=b.getAttribute('aria-pressed')==='true';
    const label=pressed?'Klientendaten anzeigen':'Klientendaten ausblenden';
    b.classList.add('b143513-client-eye');
    const icon=pressed?'eye':'eyeOff';
    if(b.dataset.b143513Icon!==icon||!b.querySelector('svg')){b.innerHTML=icons[icon];b.dataset.b143513Icon=icon;}
    b.title=label;b.setAttribute('aria-label',label);
  }
  function apply(){polishBriefing();polishClientActions();polishRefresh();polishPrivacy()}
  const mo=new MutationObserver(()=>queueMicrotask(apply));
  mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-pressed']});
  document.addEventListener('click',()=>setTimeout(apply,0),true);
  document.addEventListener('bd:vault-record',()=>setTimeout(apply,120));
  apply();
})();
