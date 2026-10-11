/* Beziehungsdynamiken 15.12.55 — quiet cockpit welcome, once per login session. */
(()=>{'use strict';
 const KEY='bd1555_cockpit_welcome_played';
 const palette=['rgba(201,107,75,.30)','rgba(245,230,211,.77)','rgba(210,154,116,.23)','rgba(255,247,237,.83)'];
 function start(){
   if(!sessionStorage.getItem('bd_admin_session_v1'))return false;
   if(sessionStorage.getItem(KEY))return true;
   if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('bd_reduce_motion')==='1'){sessionStorage.setItem(KEY,'reduced');return true}
   const cockpit=document.querySelector('#view-dashboard.active .cockpit-attention');if(!cockpit)return false;
   const host=document.createElement('div');host.className='bd1555-bubbles';host.setAttribute('aria-hidden','true');
   // Deterministic positions keep a consistent low-distraction visual.
   const xs=[4,17,29,43,58,73,85,94];
   xs.forEach((x,i)=>{const bubble=document.createElement('span');bubble.className='bd1555-bubble';bubble.style.setProperty('--x',x+'%');bubble.style.setProperty('--size',(22+(i%4)*9)+'px');bubble.style.setProperty('--tint',palette[i%palette.length]);bubble.style.setProperty('--dur',(2.2+(i%3)*.28)+'s');bubble.style.setProperty('--delay',(i%4)*.1+'s');bubble.style.setProperty('--drift',((i%2?1:-1)*(7+i%3*7))+'px');host.appendChild(bubble)});
   cockpit.prepend(host);sessionStorage.setItem(KEY,'played');
   setTimeout(()=>host.remove(),3400);return true;
 }
 function schedule(){if(start())return;let attempts=0;const id=setInterval(()=>{if(start()||++attempts>22)clearInterval(id)},380)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 document.addEventListener('bd:desktop-ready',start,{once:true});
})();
