(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  function formatDate(){
    const el=$('#b14407TodayDate'); if(!el)return;
    try{el.textContent=new Intl.DateTimeFormat('de-AT',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date())}
    catch(_){el.textContent=new Date().toLocaleDateString('de-AT')}
  }
  function syncLocalState(){
    const src=$('#localProcessingSummaryText'),dst=$('#b14407LocalState');if(!dst)return;
    const raw=String(src?.textContent||'Lokal bereit').trim();
    dst.querySelector('span').textContent=raw||'Lokal bereit';
    dst.classList.toggle('working',/aktiv|läuft|transkr|ki|verarbeit/i.test(raw));
    dst.classList.toggle('warn',/wart|gesperrt|fehler|nicht/i.test(raw));
  }
  function decorateNext(){
    const rows=[...document.querySelectorAll('#nextBookings .b143516-next-row')];
    rows.forEach((r,i)=>{r.classList.toggle('b14407-next-primary',i===0);r.classList.toggle('b14407-next-secondary',i>0)});
  }
  function start(){
    formatDate(); syncLocalState(); decorateNext();
    const status=$('#localProcessingSummaryText');if(status)new MutationObserver(syncLocalState).observe(status,{childList:true,subtree:true,characterData:true});
    const next=$('#nextBookings');if(next)new MutationObserver(decorateNext).observe(next,{childList:true,subtree:false});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
