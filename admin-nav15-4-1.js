(function(){
'use strict';
if(!matchMedia('(min-width:761px)').matches)return;
const page=(location.pathname.split('/').pop()||'admin.html').toLowerCase();
const isMain=page==='admin.html'||page==='';
const icons={
 dashboard:'<path d="M4 4h6v7H4zM14 4h6v4h-6zM4 15h6v5H4zM14 12h6v8h-6z"/>',
 clients:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2c0-3 2.2-5 5.5-5s5.5 2 5.5 5v2M16 6.5a2.5 2.5 0 0 1 0 5M16.5 13.5c2.6.4 4 2 4 4.5v2"/>',
 calendar:'<path d="M5 3v3m14-3v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2z"/>',
 finance:'<path d="M4 19V9m5 10V5m5 14v-7m5 7V3M3 21h18"/>',
 invoice:'<path d="M6 3h9l3 3v15H6V3Zm9 0v4h4M9 11h6m-6 4h6"/>',
 content:'<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4zm0 12h10a4 4 0 0 1 4 4M9 8h6m-6 4h6"/>',
 package:'<path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/>',
 programs:'<path d="M4 5h16v14H4zM8 9h8M8 13h5"/>',
 hub:'<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4zm0 12h10a4 4 0 0 1 4 4M9 8h6m-6 4h6"/>',
 creator:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9ZM7 3v4m10-4v4"/>',
 methods:'<path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5V3Z"/><path d="M10 8h4m-4 8h4"/>',
 workshops:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h3m4 0h3m-10 4h3"/>',
 newsletter:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
 messages:'<path d="M4 5h12a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H9l-5 3v-3a4 4 0 0 1-2-4V9a4 4 0 0 1 2-4Z"/>',
 vault:'<path d="M7 10V7a5 5 0 0 1 10 0v3m-11 0h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Zm6 4v3"/>',
 settings:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>'
};
const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[k]}</svg>`;
function activeStandalone(key){
 if(page==='hub.html'){if(key==='creator')return location.hash==='#creator';if(key==='hub')return location.hash!=='#creator'}
 const map={
  'methods.html':'methods','workshops.html':'workshops','newsletter-admin.html':'newsletter','message-center.html':'messages'
 };
 return map[page]===key;
}
function mainTarget(view){return document.querySelector(`.nav-item[data-view="${CSS.escape(view)}"]`)}
function doMain(view){const el=mainTarget(view);if(el){el.click();history.replaceState(null,'','#'+view);syncActive();return true}return false}
function navAction({key,label,icon,view,href,beta=false}){
 const slot=document.createElement('div');slot.className='bd1541-slot direct';slot.dataset.label=label;slot.dataset.key=key;
 let el;
 if(isMain&&view){el=document.createElement('button');el.type='button';el.onclick=()=>doMain(view)}
 else{el=document.createElement('a');el.href=href||(view?`admin.html#${view}`:'#')}
 el.className='bd1541-item';el.setAttribute('aria-label',label);el.title=label;el.innerHTML=svg(icon)+(beta?'<i class="bd1541-beta-dot" aria-hidden="true"></i>':'');
 slot.appendChild(el);return slot;
}
function flyItem(item){
 let el;
 if(isMain&&item.view){el=document.createElement('button');el.type='button';el.onclick=()=>{doMain(item.view);closePinned()}}
 else{el=document.createElement('a');el.href=item.href||(item.view?`admin.html#${item.view}`:'#')}
 el.dataset.key=item.key;el.innerHTML=`${svg(item.icon)}<span>${item.label}</span>${item.note?`<small>${item.note}</small>`:''}`;return el;
}
function group({key,label,icon,items}){
 const slot=document.createElement('div');slot.className='bd1541-slot';slot.dataset.key=key;
 const toggle=document.createElement('button');toggle.type='button';toggle.className='bd1541-item';toggle.setAttribute('aria-label',label);toggle.setAttribute('aria-expanded','false');toggle.innerHTML=svg(icon);
 const fly=document.createElement('div');fly.className='bd1541-flyout';fly.setAttribute('role','menu');fly.innerHTML=`<div class="bd1541-flyout-head">${label}</div>`;items.forEach(x=>fly.appendChild(flyItem(x)));
 toggle.onclick=e=>{e.stopPropagation();const next=!slot.classList.contains('pinned');closePinned(slot);slot.classList.toggle('pinned',next);toggle.setAttribute('aria-expanded',String(next))};
 slot.addEventListener('mouseleave',()=>{if(!slot.classList.contains('pinned'))toggle.setAttribute('aria-expanded','false')});
 slot.append(toggle,fly);return slot;
}

function accountSlot(){
 const slot=document.createElement('div');slot.className='bd1541-slot';slot.dataset.key='account';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='bd1541-item';toggle.setAttribute('aria-label','Konto');toggle.setAttribute('aria-expanded','false');toggle.innerHTML='<span class="bd1541-avatar">BD</span>';
 const fly=document.createElement('div');fly.className='bd1541-flyout';fly.innerHTML='<div class="bd1541-flyout-head">Konto</div>';
 const dash=document.createElement('a');dash.href='admin.html#settings';dash.innerHTML=`${svg('settings')}<span>Administration</span>`;
 const web=document.createElement('a');web.href='index.html';web.innerHTML=`${svg('dashboard')}<span>Zur Website</span>`;
 fly.append(dash,web);
 if(isMain){const out=document.createElement('button');out.type='button';out.innerHTML=`${svg('messages')}<span>Abmelden</span>`;out.onclick=()=>document.querySelector('#logoutBtn')?.click();fly.append(out);
   const id=document.querySelector('#adminIdentity');const update=()=>{const raw=(id?.textContent||'').trim();if(raw&&raw!=='—'){const v=raw.split('@')[0].split(/[ ._-]+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();if(v)toggle.querySelector('.bd1541-avatar').textContent=v}};update();if(id)new MutationObserver(update).observe(id,{childList:true,subtree:true,characterData:true});
 }
 toggle.onclick=e=>{e.stopPropagation();const next=!slot.classList.contains('pinned');closePinned(slot);slot.classList.toggle('pinned',next);toggle.setAttribute('aria-expanded',String(next))};
 slot.append(toggle,fly);return slot
}
function closePinned(except){document.querySelectorAll('.bd1541-slot.pinned').forEach(x=>{if(x!==except){x.classList.remove('pinned');x.querySelector('.bd1541-item')?.setAttribute('aria-expanded','false')}})}
function currentMainView(){return document.querySelector('.nav-item[data-view].active')?.dataset.view||(location.hash||'#dashboard').slice(1)}
function syncActive(){
 const v=isMain?currentMainView():null;
 document.querySelectorAll('.bd1541-item.current,.bd1541-slot.group-current,.bd1541-flyout .current').forEach(x=>x.classList.remove('current','group-current'));
 document.querySelectorAll('.bd1541-slot').forEach(slot=>{
  const direct=slot.querySelector(':scope>.bd1541-item');const key=slot.dataset.key;
  if((isMain&&key===v)||(!isMain&&activeStandalone(key)))direct?.classList.add('current');
  let childActive=false;
  slot.querySelectorAll('.bd1541-flyout [data-key]').forEach(el=>{
   const itemKey=el.dataset.key;const match=isMain?(itemKey===v):activeStandalone(itemKey);el.classList.toggle('current',match);if(match)childActive=true
  });
  slot.classList.toggle('group-current',childActive)
 })
}
function ensureSecurityStrip(){
 if(document.querySelector('.security-strip'))return;
 const strip=document.createElement('div');strip.className='security-strip';
 strip.innerHTML='<div class="security-brand"><img src="./public/Beziehungsdynmiken_logo_colour.png" alt=""><div><strong>Beziehungsdynamiken</strong><span>Praxis-Plattform</span></div></div><span class="security-strip-label">Interne Praxisverwaltung · geschützter Zugang</span>';
 document.body.prepend(strip);
}
function mount(){
 ensureSecurityStrip();
 document.querySelectorAll('.bd1541-rail,.bd153-rail,.suite-rail').forEach(x=>x.remove());
 document.body.classList.remove('bd153-standalone');document.body.classList.add(isMain?'bd1541-main':'bd1541-standalone');
 const rail=document.createElement('aside');rail.className='bd1541-rail';rail.setAttribute('aria-label','Praxisnavigation');
 const logo=document.createElement('a');logo.className='bd1541-logo';logo.href=isMain?'#dashboard':'admin.html#dashboard';logo.title='Beziehungsdynamiken';logo.innerHTML='<img src="./public/Beziehungsdynmiken_logo_colour.png" alt="">';if(isMain)logo.onclick=e=>{e.preventDefault();doMain('dashboard')};rail.appendChild(logo);
 const nav=document.createElement('nav');nav.className='bd1541-nav';
 nav.append(
  navAction({key:'dashboard',label:'Dashboard',icon:'dashboard',view:'dashboard'}),
  navAction({key:'clients',label:'Klient:innen',icon:'clients',view:'clients'}),
  navAction({key:'bookings',label:'Termine',icon:'calendar',view:'bookings'}),
  group({key:'finance-group',label:'Finanzen',icon:'finance',items:[
   {key:'invoices',label:'Honorarnoten',icon:'invoice',view:'invoices'},
   {key:'finance',label:'Buchhaltung',icon:'finance',view:'finance'}
  ]}),
  group({key:'content-group',label:'Inhalte & Angebote',icon:'content',items:[
   {key:'packages',label:'Packages',icon:'package',view:'packages'},
   {key:'programs',label:'Programme & Gruppen',icon:'programs',view:'programs'},
   {key:'newsletter',label:'Newsletter',icon:'newsletter',href:'newsletter-admin.html'},
   {key:'hub',label:'Knowledge Hub',icon:'hub',href:'hub.html'},
   {key:'creator',label:'Creator Studio',icon:'creator',href:'hub.html#creator'},
   {key:'methods',label:'Methoden',icon:'methods',href:'methods.html'},
   {key:'workshops',label:'Workshops',icon:'workshops',href:'workshops.html'}
  ]}),
  navAction({key:'messages',label:'Nachrichten',icon:'messages',href:'message-center.html',beta:true})
 );
 rail.appendChild(nav);
 const bottom=document.createElement('div');bottom.className='bd1541-bottom';bottom.append(
  navAction({key:'vault',label:'Secure Vault',icon:'vault',view:'vault'}),
  navAction({key:'settings',label:'Administration',icon:'settings',view:'settings'}),
  accountSlot()
 );rail.appendChild(bottom);document.body.prepend(rail);
 if(isMain){const shell=document.querySelector('#appShell');const syncShell=()=>rail.classList.toggle('is-hidden',!!shell?.classList.contains('hidden'));syncShell();if(shell)new MutationObserver(syncShell).observe(shell,{attributes:true,attributeFilter:['class']})}
 document.addEventListener('click',e=>{if(!e.target.closest('.bd1541-slot'))closePinned()});
 if(isMain){
  const old=document.querySelector('.side-nav');if(old)new MutationObserver(syncActive).observe(old,{subtree:true,attributes:true,attributeFilter:['class']});
 }
 window.addEventListener('hashchange',()=>setTimeout(syncActive,0));
 syncActive();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,20),{once:true});else setTimeout(mount,20);
})();
