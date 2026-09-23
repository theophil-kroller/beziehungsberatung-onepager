/* BUILD 14.3.1 — cross-workspace deep links. Visual/navigation helper only. */
(function(){
  'use strict';
  const allowed=new Set(['dashboard','clients','packages','programs','invoices','finance','vault','settings']);
  function openHashView(){
    const view=(location.hash||'').replace(/^#/,'').trim();
    if(!allowed.has(view))return;
    const btn=document.querySelector(`[data-view="${CSS.escape(view)}"]`);
    if(btn){setTimeout(()=>btn.click(),80)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openHashView,{once:true});else openHashView();
  window.addEventListener('hashchange',openHashView);
})();
