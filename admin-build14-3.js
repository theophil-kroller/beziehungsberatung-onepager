(function(){
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

  function setupOfferGroup(){
    const group=$('[data-nav-group="offers"]');
    if(!group)return;
    const toggle=group.querySelector('.nav-group-toggle');
    const setOpen=open=>{group.classList.toggle('open',open);toggle?.setAttribute('aria-expanded',String(open))};
    toggle?.addEventListener('click',()=>setOpen(!group.classList.contains('open')));
    group.querySelectorAll('.nav-subitem').forEach(b=>b.addEventListener('click',()=>setOpen(true)));
    const observer=new MutationObserver(()=>{
      const active=!!group.querySelector('.nav-subitem.active');
      if(active)setOpen(true);
    });
    group.querySelectorAll('.nav-subitem').forEach(b=>observer.observe(b,{attributes:true,attributeFilter:['class']}));
  }

  function keepFlowPanelNearCalendar(){
    // BUILD 10 injects the open-flow panel dynamically. Keep it beside the
    // dashboard calendar, not as a permanent navigation destination.
    const move=()=>{
      const calendar=$('.dashboard-calendar'),panel=$('.flow-dashboard-panel');
      if(calendar&&panel&&panel.previousElementSibling!==calendar)calendar.insertAdjacentElement('afterend',panel);
    };
    move();setTimeout(move,250);setTimeout(move,900);
  }

  function improveLabels(){
    // Preserve internal/API vocabulary; only visible UI text changes.
    $$('.stat-card span').forEach(el=>{
      if(el.textContent.trim()==='Nächste 7 Tage')el.textContent='Diese Woche';
      if(el.textContent.trim()==='Aktive Klient:innen')el.textContent='Aktive Klient:innen';
      if(el.textContent.trim()==='Offene Forderungen')el.textContent='Offene Honorarnoten';
    });
  }

  function boot(){setupOfferGroup();keepFlowPanelNearCalendar();improveLabels()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
