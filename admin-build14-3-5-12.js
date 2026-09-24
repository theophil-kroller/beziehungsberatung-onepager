/* BUILD 14.3.5.12 — icon-only utility actions + reliable record close.
   Presentation and interaction hardening only; no persistence/schema changes. */
(function(){
  'use strict';

  const dlg=document.getElementById('clientDialog');
  if(!dlg)return;

  const icons={
    edit:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    mic:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/></svg>',
    trash:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>',
    open:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5"/></svg>',
    close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>'
  };

  function iconize(el,label,icon){
    if(!el)return;
    if(!el.classList.contains('b143512-icon-action'))el.classList.add('b143512-icon-action');
    el.setAttribute('title',label);
    el.setAttribute('aria-label',label);
    if(el.dataset.b143512Icon!==icon){
      el.innerHTML=icons[icon]||icons.open;
      el.dataset.b143512Icon=icon;
    }
  }

  function decorate(){
    iconize(document.getElementById('recordRenameBtn'),'Name korrigieren','edit');
    const close=document.getElementById('clientDialogClose');
    if(close && close.dataset.b143512CloseIcon!=='1'){
      close.innerHTML=icons.close;
      close.setAttribute('title','Klientenakte schließen');
      close.setAttribute('aria-label','Klientenakte schließen');
      close.dataset.b143512CloseIcon='1';
    }
    const status=document.getElementById('recordStatus');
    if(status)status.setAttribute('aria-label','Klientenstatus');

    const specs=[
      ['[data-session-dictate]','Diktieren','mic'],
      ['[data-session-edit]','Sitzung bearbeiten','edit'],
      ['[data-session-delete]','Sitzung löschen','trash'],
      ['[data-split-consultation-edit]','Erstgespräch bearbeiten','edit'],
      ['[data-goal-edit]','Ziel bearbeiten','edit'],
      ['[data-goal-delete]','Ziel löschen','trash'],
      ['[data-artifact-open]','Datei öffnen','open'],
      ['[data-artifact-delete]','Datei löschen','trash']
    ];
    specs.forEach(([selector,label,icon])=>dlg.querySelectorAll(selector).forEach(el=>iconize(el,label,icon)));
  }

  /* The legacy close handler can be lost or shadowed after repeated UI refactors.
     This capture-phase fallback makes the visible X authoritative. */
  document.addEventListener('click',function(ev){
    const close=ev.target.closest?.('#clientDialogClose');
    if(!close)return;
    ev.preventDefault();
    ev.stopPropagation();
    try{ if(dlg.open)dlg.close(); }
    catch(_){ dlg.removeAttribute('open'); }
  },true);

  dlg.addEventListener('cancel',function(ev){
    ev.preventDefault();
    try{dlg.close()}catch(_){dlg.removeAttribute('open')}
  });

  /* Optional native-dialog behavior: click only the backdrop area to close. */
  dlg.addEventListener('click',function(ev){
    if(ev.target!==dlg)return;
    const r=dlg.getBoundingClientRect();
    const inside=ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;
    if(!inside){try{dlg.close()}catch(_){dlg.removeAttribute('open')}}
  });

  const observer=new MutationObserver(()=>decorate());
  observer.observe(dlg,{subtree:true,childList:true});
  decorate();
})();
