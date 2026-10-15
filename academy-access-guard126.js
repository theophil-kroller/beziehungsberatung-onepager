/* Build 15.12.126 – Owner/Practitioner Academy start guard.
 * This is UI access control, not confidentiality of public GitHub Pages or files distributed in a desktop ZIP.
 * No exercise JavaScript runs until the Worker explicitly authorizes the signed-in user.
 */
(()=>{'use strict';
const guard=document.currentScript;
let id=String(guard?.dataset?.bdModule||'');
if(id==='mastery-dynamic'){
 const skill=new URLSearchParams(location.search).get('skill')||'alliance';
 id={alliance:'alliance',self:'self',mental:'perspective',limits:'boundaries',safety:'conflict',entitlement:'entitlement',trust:'affairs',grief:'grief',jealousy:'poly'}[skill]||'';
 if(skill==='safety'&&new URLSearchParams(location.search).get('academyModule')==='safemastery')id='safemastery';
}
const BASE=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'https://beziehungsdynamiken-booking.theophil-kroller.workers.dev').replace(/\/$/,'');
function addAcademyNavigation(){
 // Only decorate pages lacking a direct Academy route; no overlay over exercise controls.
 if(document.querySelector('a[href^="academy-journey15-12-74.html"],a[href^="academy-world15-12-74.html"]'))return;
 const header=document.querySelector('header');if(!header||document.getElementById('bd129-academy-back'))return;
 const back=document.createElement('a');back.id='bd129-academy-back';back.href='academy-journey15-12-74.html';
 back.textContent='← Academy';back.title='Zur Academy-Übersicht';
 back.style.cssText='display:inline-flex;align-items:center;white-space:nowrap;flex:none;gap:6px;font:600 12px/1.3 system-ui,sans-serif;padding:9px 11px;border-radius:12px;border:1px solid currentColor;color:inherit;text-decoration:none;opacity:.82;background:transparent;';
 header.insertBefore(back,header.firstChild);
}
function showLock(title,detail){
 const s=document.createElement('section');s.id='bd126-access-root';
 s.style.cssText='box-sizing:border-box;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 30% 0%,#343052 0%,#171829 70%);padding:24px;color:#f9eee8;font:16px/1.5 system-ui';
 const box=document.createElement('article');box.style.cssText='max-width:480px;width:100%;padding:28px;border:1px solid #ffffff33;border-radius:22px;background:#ffffff0c;text-align:center';
 const icon=document.createElement('div');icon.textContent='🔒';icon.style.fontSize='44px';
 const h=document.createElement('h1');h.textContent=title;h.style.cssText='font:600 27px Georgia,serif;margin:12px 0';
 const p=document.createElement('p');p.textContent=detail;p.style.cssText='color:#d6ced6';
 const links=document.createElement('p');links.style.cssText='display:flex;gap:12px;justify-content:center;flex-wrap:wrap';
 for(const [text,href] of [['Zur Academy','academy-journey15-12-74.html'],['Zum Praxis-Login','admin.html']]){
  const a=document.createElement('a');a.textContent=text;a.href=href;a.style.cssText='display:inline-block;padding:10px 14px;border:1px solid #c96b4b;border-radius:12px;color:#ffd4bf;text-decoration:none';links.append(a);
 }
 box.append(icon,h,p,links);s.append(box);document.body.replaceChildren(s);
 document.getElementById('bd126-gate-hide')?.remove();
}
async function run(){
 const token=sessionStorage.getItem('bd_admin_session_v1');
 if(!id||!token){showLock('Anmeldung erforderlich','Melde dich im Praxis-Cockpit mit deinem eigenen Konto an. Ohne geprüfte Freigabe wird dieses Training nicht gestartet.');return;}
 try{
  const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),12000);
  let response;
  try{response=await fetch(BASE+'/admin/academy/access?module='+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:ctl.signal});}
  finally{clearTimeout(timeout);}
  const answer=await response.json().catch(()=>null);
  if(!response.ok||answer?.ok!==true)throw Error(answer?.error||'Freigabeprüfung nicht erreichbar');
  if(answer.module!==id||answer.allowed!==true){showLock('Modul nicht freigeschaltet','Dieses Training wurde für dein Konto noch nicht freigegeben. Der Owner kann es unter „Academy verwalten“ aktivieren.');return;}
  // Execute the original classic-script dependencies in DOM order only after a positive server verdict.
  const scripts=[...document.querySelectorAll('script[data-bd-deferred-src]')];
  for(const pending of scripts){
   const src=pending.getAttribute('data-bd-deferred-src');if(!src)continue;
   await new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.async=false;
    s.onload=resolve;s.onerror=()=>reject(Error('Trainingsdatei fehlt: '+src));
    pending.replaceWith(s);
   });
  }
  document.getElementById('bd126-gate-hide')?.remove();
  addAcademyNavigation();
 }catch(e){showLock('Training derzeit gesperrt','Die Freigabe konnte nicht verlässlich geprüft werden ('+String(e.message).slice(0,130)+'). Bitte erneut anmelden oder später versuchen. Vorhandene Lernstände bleiben bestehen.');}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
