(function(){
'use strict';
const pathname=String(location.pathname||'/').replace(/\/{2,}/g,'/');
const isRoot=pathname==='/'||pathname.toLowerCase()==='/index.html';
const path=(pathname.split('/').filter(Boolean).pop()||'index.html').toLowerCase();
const INTERNAL=new Set(['admin.html','capture.html','hub.html','methods.html','workshops.html','message-center.html','newsletter-admin.html','mobile-admin.html','desktop-login.html']);
if(INTERNAL.has(path))return;
const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'https://beziehungsdynamiken-booking.theophil-kroller.workers.dev').replace(/\/$/,'');
const PRACTICE_ONLY=new Set(['angebote.html','offers.html','booking.html','booking-en.html','cart.html','cart-en.html','payment-success.html','termin.html','zugang.html','access.html','workshop.html','widerruf.html','withdrawal.html']);
const LEGAL=new Set(['impressum.html','datenschutz.html']);
const preview=new URLSearchParams(location.search).get('bd_preview')||'';
const style=document.createElement('style');style.id='bdSiteModeBoot';style.textContent='html.bd-site-pending body{visibility:hidden!important}.bd-site-mode-screen{min-height:100vh;background:#fff7ed;color:#2f2623;font-family:Arial,sans-serif;display:grid;place-items:center;padding:28px}.bd-site-mode-card{max-width:720px;background:white;border:1px solid #ead4c0;border-radius:24px;padding:clamp(28px,6vw,58px);box-shadow:0 22px 60px rgba(47,38,35,.08)}.bd-site-mode-card .eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.14em;font-weight:800;color:#aa543d}.bd-site-mode-card h1{font-family:Georgia,serif;font-size:clamp(2.3rem,7vw,4.8rem);line-height:1.02;margin:.25em 0}.bd-site-mode-card p{font-size:17px;line-height:1.65;color:#6d5a53}.bd-site-mode-card a{display:inline-block;margin-top:10px;color:#aa543d;font-weight:800;text-decoration:none}.bd-preview-ribbon{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:99999;background:#2f2623;color:#fff7ed;padding:7px 12px;border-radius:999px;font:700 11px/1 Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.18)}';document.head.appendChild(style);document.documentElement.classList.add('bd-site-pending');
function robots(value){let m=document.querySelector('meta[name="robots"]');if(!m){m=document.createElement('meta');m.name='robots';document.head.appendChild(m)}m.content=value}
function carry(url){if(!preview)return url;const u=new URL(url,location.href);u.searchParams.set('bd_preview',preview);return u.href}
function screen(kind){document.documentElement.classList.remove('bd-site-pending');robots('noindex,nofollow');const privateMode=kind==='private';document.body.innerHTML=`<main class="bd-site-mode-screen"><section class="bd-site-mode-card"><div class="eyebrow">Beziehungsdynamiken</div><h1>${privateMode?'Hier entsteht etwas.':'Diese Seite ist noch nicht öffentlich.'}</h1><p>${privateMode?'Die Website befindet sich derzeit in Vorbereitung.':'Der Wissensbereich ist bereits geöffnet. Beratung, Angebote und Buchung werden erst mit dem Praxisstart freigeschaltet.'}</p>${privateMode?'':`<a href="${carry('/wissen/')}">Zum Wissensbereich →</a>`}</section></main>`}
function knowledgeClean(){
  document.querySelectorAll('a').forEach(a=>{let p='';try{p=(new URL(a.href,location.href).pathname.split('/').pop()||'index.html').toLowerCase()}catch(_){return}if(PRACTICE_ONLY.has(p)){const li=a.closest('li');if(li&&li.children.length===1)li.remove();else a.remove()}});
  document.querySelectorAll('.wa-premium,a[href*="wa.me/"],a[href*="api.whatsapp.com/"],a[aria-label="Warenkorb"],a[title="Warenkorb"],[role="note"][aria-label="Praxisinformation"]').forEach(x=>x.remove());
  document.querySelectorAll('[data-practice-only]').forEach(x=>x.remove());
}
function previewRibbon(mode){if(!preview)return;const b=document.createElement('div');b.className='bd-preview-ribbon';b.textContent='Vorschau · '+(mode==='practice'?'Praxis live':mode==='knowledge'?'Wissensmodus':'Privat');document.body.appendChild(b)}
function enablePreviewPropagation(){if(!preview)return;const nativeFetch=window.fetch.bind(window);window.fetch=(input,init)=>{try{const raw=typeof input==='string'?input:input?.url||'',u=new URL(raw,location.href);if(u.origin===new URL(API).origin&&!u.searchParams.has('bd_preview'))u.searchParams.set('bd_preview',preview);if(typeof input==='string')return nativeFetch(u.toString(),init);if(input instanceof Request)return nativeFetch(new Request(u.toString(),input),init)}catch(_){}return nativeFetch(input,init)};const rewrite=()=>document.querySelectorAll('a[href]').forEach(a=>{try{const u=new URL(a.href,location.href);if(u.origin===location.origin&&!u.searchParams.has('bd_preview')){u.searchParams.set('bd_preview',preview);a.href=u.toString()}}catch(_){}});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rewrite,{once:true});else rewrite()}
async function boot(){
  try{
    const q=preview?'?preview='+encodeURIComponent(preview):'';const r=await fetch(API+'/public/site-mode'+q,{cache:'no-store'});if(!r.ok)throw new Error();const x=await r.json(),mode=x.mode||'private';window.BD_SITE_MODE=x;document.documentElement.dataset.siteMode=mode;
    enablePreviewPropagation();
    if(mode==='private'&&!LEGAL.has(path)){screen('private');return}
    if(mode==='knowledge'&&PRACTICE_ONLY.has(path)){screen('knowledge');return}
    if(mode==='knowledge'&&isRoot){location.replace(carry('/wissen/'));return}
    if(mode==='knowledge')knowledgeClean();
    robots(preview?'noindex,nofollow':mode==='practice'?'index,follow':'index,follow');
    document.documentElement.classList.remove('bd-site-pending');previewRibbon(mode);
  }catch(_){if(LEGAL.has(path))document.documentElement.classList.remove('bd-site-pending');else screen('private')}
}
boot();
})();
