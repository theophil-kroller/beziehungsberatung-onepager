/* Microinteraction: a single soft ripple on deliberate login input, never at high frequency. */
(()=>{'use strict';const init=()=>{const login=document.querySelector('#loginView');if(!login)return;let last=0,timer=null;
const ripple=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(Date.now()-last<1800)return;last=Date.now();login.classList.remove('bd103-ripple');void login.offsetWidth;login.classList.add('bd103-ripple');clearTimeout(timer);timer=setTimeout(()=>login.classList.remove('bd103-ripple'),2750)};
document.querySelector('#loginEmail')?.addEventListener('focus',ripple);
document.querySelector('#loginBtn')?.addEventListener('click',ripple);
};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()})();