(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  function icon(id){return `<svg><use href="#${id}"/></svg>`}
  function group(label,iconId,items,name){
    const wrap=document.createElement('div');wrap.className='bd1521-nav-group';wrap.dataset.bd1521Group=name;
    const toggle=document.createElement('button');toggle.type='button';toggle.className='nav-item bd1521-nav-toggle';toggle.setAttribute('aria-expanded','false');toggle.innerHTML=`${icon(iconId)}<span>${label}</span><span class="bd1521-nav-chevron">⌄</span>`;
    const sub=document.createElement('div');sub.className='bd1521-nav-subitems';items.filter(Boolean).forEach(el=>sub.appendChild(el));wrap.append(toggle,sub);
    const setOpen=open=>{wrap.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open))};
    toggle.addEventListener('click',()=>setOpen(!wrap.classList.contains('open')));
    sub.addEventListener('click',()=>setOpen(true));
    const sync=()=>setOpen(!!sub.querySelector('.nav-item.active'));
    items.filter(Boolean).forEach(el=>new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']}));
    return wrap;
  }
  function buildNavigation(){
    const nav=$('.side-nav'),bottom=$('.sidebar-bottom');if(!nav||!bottom||nav.dataset.bd1521Done)return;nav.dataset.bd1521Done='1';
    const utility=nav.querySelector('.ux-utility-nav');
    const dashboard=nav.querySelector('[data-view="dashboard"]'),clients=nav.querySelector('[data-view="clients"]'),bookings=document.querySelector('.nav-item[data-view="bookings"]');
    const invoices=nav.querySelector('[data-view="invoices"]'),finance=nav.querySelector('[data-view="finance"]');
    const offers=nav.querySelector('[data-nav-group="offers"]'),packages=offers?.querySelector('[data-view="packages"]'),programs=offers?.querySelector('[data-view="programs"]'),newsletter=offers?.querySelector('a[href="newsletter-admin.html"]');
    const message=nav.querySelector('a[href="message-center.html"]'),hub=nav.querySelector('a[href="hub.html"]'),methods=nav.querySelector('a[href="methods.html"]'),workshops=nav.querySelector('a[href="workshops.html"]');
    const vault=nav.querySelector('[data-view="vault"]'),settings=nav.querySelector('[data-view="settings"]');
    [dashboard,clients,bookings,invoices,finance,packages,programs,newsletter,message,hub,methods,workshops,vault,settings].filter(Boolean).forEach(x=>x.remove());
    nav.replaceChildren();
    [dashboard,clients,bookings].filter(Boolean).forEach(x=>{x.classList.remove('nav-subitem');nav.appendChild(x)});
    const f=group('Finanzen','i-finance',[invoices,finance],'finance');nav.appendChild(f);
    const c=group('Inhalte','i-knowledge',[packages,programs,newsletter,hub,methods,workshops],'content');nav.appendChild(c);
    if(utility)nav.appendChild(utility);
    const system=document.createElement('div');system.className='bd1521-system-links';
    [vault,settings].filter(Boolean).forEach(x=>{x.classList.remove('nav-subitem');system.appendChild(x)});
    if(message){message.className='bd1521-beta-link';message.innerHTML='Nachrichten / Message Center <span>Beta</span>';system.appendChild(message)}
    bottom.prepend(system);
  }
  function roadmap(){
    const p=$('.roadmap-current');if(p){p.className='roadmap-current-1521';p.innerHTML='<strong>Aktuell: BUILD 15.2.1 Frontend & UX Polish</strong><br><span>Multi-User, Vault-Lifecycle und Compliance aus 15.2 bleiben unverändert. Dieser Build räumt Navigation und öffentliche Angebotsdarstellung auf.</span>'}
    const list=$('.roadmap-list');if(list)list.innerHTML='<li><strong>Als Nächstes · Kalender & Integrationen</strong><span>Verfügbarkeit in Beziehungsdynamiken verwalten; Google Calendar pro Practitioner nur für Sync und Konfliktprüfung anbinden.</span></li><li><strong>Danach</strong><span>WhatsApp Business / echte Kommunikations-Inbox, Mac-Desktop-App und weitere Buchhaltungsautomation.</span></li>';
    const h=$('#view-settings .panel .roadmap-current-1521')?.closest('.panel')?.querySelector('h2');if(h)h.textContent='Systemstand & nächste Schritte';
  }
  function boot(){buildNavigation();roadmap()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();
