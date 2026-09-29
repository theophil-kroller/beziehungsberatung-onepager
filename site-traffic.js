/* Anonymous, aggregated page-view counter for public content pages. */
(()=>{'use strict';
  if(!/^https:\/\/(?:www\.)?beziehungsdynamiken\.at$/i.test(location.origin))return;
  if(navigator.doNotTrack==='1'||window.doNotTrack==='1')return;
  let host='';try{host=new URL(document.referrer).hostname.toLowerCase()}catch(_){}
  const source=new URLSearchParams(location.search).get('utm_source')||'';
  const api=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'https://beziehungsdynamiken-booking.theophil-kroller.workers.dev').replace(/\/$/,'');
  fetch(api+'/site-traffic/view',{method:'POST',mode:'cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({source,referrerHost:host,language:navigator.language||''}),keepalive:true}).catch(()=>{});
})();
