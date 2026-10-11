/* Beziehungsdynamiken 15.12.55b — reliable, quiet cockpit welcome. */
(()=>{'use strict';
  const KEY='bd1555b_cockpit_welcome_played';
  const LOGIN_KEY='bd_admin_session_v1';
  const PREVIEW=new URLSearchParams(location.search).get('cockpit-bubbles')==='preview';
  let previewPlayed=false;
  let activeHost=null;
  const colors=[
    'rgba(201,107,75,.64)','rgba(245,230,211,.86)',
    'rgba(210,154,116,.62)','rgba(255,247,237,.90)'
  ];
  function reduced(){return !!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('bd_reduce_motion')==='1');}
  function canPlay(){
    if(!sessionStorage.getItem(LOGIN_KEY)||document.visibilityState==='hidden')return null;
    const app=document.querySelector('#appShell');
    if(!app||app.classList.contains('hidden'))return null;
    return document.querySelector('#view-dashboard.active .cockpit-attention');
  }
  function tryPlay(){
    const target=canPlay();
    if(!target)return false;
    if(PREVIEW?previewPlayed:!!sessionStorage.getItem(KEY))return true;
    if(reduced()){
      if(PREVIEW)previewPlayed=true;
      else sessionStorage.setItem(KEY,'reduced');
      return true;
    }
    // Mark before DOM changes so class observers cannot trigger a second animation.
    if(PREVIEW)previewPlayed=true;
    else sessionStorage.setItem(KEY,'played');
    if(activeHost)activeHost.remove();
    const host=document.createElement('div');
    host.className='bd1555-bubbles';
    host.setAttribute('aria-hidden','true');
    const positions=[5,16,27,38,50,62,74,84,94];
    positions.forEach((x,i)=>{
      const bubble=document.createElement('span');
      bubble.className='bd1555-bubble';
      bubble.style.setProperty('--x',x+'%');
      bubble.style.setProperty('--size',(20+(i%4)*11)+'px');
      bubble.style.setProperty('--tint',colors[i%colors.length]);
      bubble.style.setProperty('--dur',(2.6+(i%3)*.27)+'s');
      bubble.style.setProperty('--delay',(i%4)*.1+'s');
      bubble.style.setProperty('--drift',((i%2?1:-1)*(8+i%3*6))+'px');
      host.appendChild(bubble);
    });
    activeHost=host;
    target.prepend(host);
    setTimeout(()=>{host.remove();if(activeHost===host)activeHost=null;},3900);
    return true;
  }
  function ready(){
    const app=document.querySelector('#appShell');
    const dashboard=document.querySelector('#view-dashboard');
    if(!app||!dashboard)return;
    // Unlike a short polling window, this also works after a slow MFA/login flow.
    const observer=new MutationObserver(tryPlay);
    observer.observe(app,{attributes:true,attributeFilter:['class']});
    observer.observe(dashboard,{attributes:true,attributeFilter:['class']});
    document.addEventListener('bd:desktop-ready',tryPlay);
    window.addEventListener('hashchange',tryPlay);
    document.addEventListener('visibilitychange',tryPlay);
    document.getElementById('logoutBtn')?.addEventListener('click',()=>sessionStorage.removeItem(KEY),{capture:true});
    tryPlay();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
