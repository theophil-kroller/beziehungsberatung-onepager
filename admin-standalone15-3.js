(function(){
'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const active=page==='methods.html'?'methods':page==='workshops.html'?'workshops':page==='newsletter-admin.html'?'newsletter':page==='hub.html'?'hub':page==='message-center.html'?'messages':'';
const icons={
 dashboard:'<path d="M4 4h6v7H4zM14 4h6v4h-6zM4 15h6v5H4zM14 12h6v8h-6z"/>',
 clients:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2c0-3 2.2-5 5.5-5s5.5 2 5.5 5v2M16 6.5a2.5 2.5 0 0 1 0 5M16.5 13.5c2.6.4 4 2 4 4.5v2"/>',
 calendar:'<path d="M5 3v3m14-3v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2z"/>',
 finance:'<path d="M4 19V9m5 10V5m5 14v-7m5 7V3M3 21h18"/>',
 hub:'<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4zm0 12h10a4 4 0 0 1 4 4M9 8h6m-6 4h6"/>',
 methods:'<path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5V3Z"/><path d="M10 8h4m-4 8h4"/>',
 workshops:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h3m4 0h3m-10 4h3"/>',
 newsletter:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
 messages:'<path d="M4 5h12a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H9l-5 3v-3a4 4 0 0 1-2-4V9a4 4 0 0 1 2-4Z"/>',
 vault:'<path d="M7 10V7a5 5 0 0 1 10 0v3m-11 0h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Zm6 4v3"/>',
 settings:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>'
};
function link(href,key,label,extra=''){return `<a href="${href}" ${active===key?'class="current" aria-current="page"':''} title="${label}" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg>${extra}</a>`}
function mount(){
 document.body.classList.add('bd153-standalone');
 document.querySelectorAll('.suite-rail').forEach(x=>x.remove());
 const rail=document.createElement('aside');rail.className='bd153-rail';rail.setAttribute('aria-label','Praxisnavigation');
 rail.innerHTML=`<a class="bd153-rail-logo" href="admin.html#dashboard" title="Beziehungsdynamiken"><img src="./public/Beziehungsdynmiken_logo_colour.png" alt=""></a><nav class="bd153-rail-nav">${link('admin.html#dashboard','dashboard','Dashboard')}${link('admin.html#clients','clients','Klient:innen')}${link('admin.html#bookings','calendar','Termine')}${link('admin.html#finance','finance','Finanzen')}<span class="bd153-rail-sep"></span>${link('hub.html','hub','Inhalte / Knowledge Hub')}${link('methods.html','methods','Methoden')}${link('workshops.html','workshops','Workshops')}${link('newsletter-admin.html','newsletter','Newsletter')}<span class="bd153-rail-sep"></span>${link('message-center.html','messages','Nachrichten · Beta','<i class="bd153-beta-dot" aria-hidden="true"></i>')}</nav><div class="bd153-rail-bottom">${link('admin.html#vault','vault','Secure Vault')}${link('admin.html#settings','settings','Administration')}</div>`;
 document.body.prepend(rail);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
