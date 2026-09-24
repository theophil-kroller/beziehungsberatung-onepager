(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1', VAULT='http://127.0.0.1:47831', VAULT_TOKEN='bd_vault_token_v1';
  const gear='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12 1 2.1 2.3.6 2-1.2 1.8 1.8-1.2 2 .6 2.3 2.1 1v2.6l-2.1 1-.6 2.3 1.2 2-1.8 1.8-2-1.2-2.3.6-1 2.1H9.4l-1-2.1-2.3-.6-2 1.2-1.8-1.8 1.2-2-.6-2.3-2.1-1v-2.6l2.1-1 .6-2.3-1.2-2L4.1 5l2 1.2 2.3-.6 1-2.1H12Z" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"/></svg>';
  const closeIcon='×';
  let applying=false;

  function session(){return sessionStorage.getItem(SESSION_KEY)||''}
  async function crmPost(path,body){
    if(!API)throw new Error('CRM-API ist nicht konfiguriert.');
    const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session()},body:JSON.stringify(body)});
    const ct=r.headers.get('content-type')||'',x=ct.includes('application/json')?await r.json():{error:await r.text()};
    if(!r.ok||x?.ok===false)throw new Error(x?.error||'CRM-Anfrage fehlgeschlagen.');
    return x;
  }
  async function vaultMasterData(email,name,masterData){
    const token=sessionStorage.getItem(VAULT_TOKEN)||'';
    if(!token)throw new Error('Secure Vault ist gesperrt. Stammdaten bitte nach dem Entsperren ergänzen.');
    const r=await fetch(VAULT+'/client/master-data',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({ref:email,displayName:name,masterData})});
    let x={};try{x=await r.json()}catch(_){ }
    if(!r.ok||x?.ok===false)throw new Error(x?.error||'Lokale Stammdaten konnten nicht gespeichert werden.');
    return x;
  }

  function moveWeather(){
    const w=$('#dashboardWeather'),head=$('.workspace-head .head-actions');if(!w||!head)return;
    let slot=$('.b143515-weather-slot');
    if(!slot){slot=document.createElement('div');slot.className='b143515-weather-slot';slot.title='Wetter · klicken für 3 Tage';head.prepend(slot)}
    if(w.parentElement!==slot)slot.appendChild(w);
  }

  function polishDashboard(){
    const panel=$('#view-dashboard .attention-panel');
    if(panel){const eye=panel.querySelector('.eyebrow'),h=panel.querySelector('h2');if(eye)eye.textContent='Heute';if(h)h.textContent='Heute zu erledigen'}
    const quick=$('.b143514-quick-actions');
    if(quick){
      const bs=$$('.b143514-icon-btn',quick);
      if(bs[0]&&!bs[0].dataset.b143515Client){bs[0].dataset.b143515Client='1';bs[0].title='Neue Klient:in';bs[0].setAttribute('aria-label','Neue Klient:in');bs[0].addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openNewClient()},true)}
      if(bs[1]){bs[1].title='Termin planen';bs[1].setAttribute('aria-label','Termin planen')}
      if(bs[2]&&!bs[2].classList.contains('b143515-gear')){bs[2].classList.add('b143515-gear');bs[2].innerHTML=gear;bs[2].title='Cockpit anpassen';bs[2].setAttribute('aria-label','Cockpit anpassen')}
    }
    moveWeather();
  }

  function ensureNewClient(){
    if($('#b143515NewClient'))return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="b143515NewClient" class="b143515-client-dialog"><form id="b143515NewClientForm" class="b143515-client-card"><button type="button" class="b143514-icon-btn b143514-dialog-close" data-new-client-close title="Schließen" aria-label="Schließen">${closeIcon}</button><p class="eyebrow">Klient:innen</p><h2>Neue Klient:in</h2><p>Kontakt- und Basisdaten direkt beim Anlegen erfassen. Nur Name und E-Mail sind erforderlich.</p><div class="b143515-client-grid"><label>Name<input id="b143515Name" autocomplete="name" required></label><label>E-Mail<input id="b143515Email" type="email" autocomplete="email" required></label><label>Telefon<input id="b143515Phone" type="tel" autocomplete="tel" placeholder="+43 …"></label><label>Geburtsdatum<input id="b143515Birth" type="date"></label><label class="wide">Straße / Hausnummer<input id="b143515Street" autocomplete="street-address"></label><label>PLZ<input id="b143515Postal" autocomplete="postal-code"></label><label>Ort<input id="b143515City" autocomplete="address-level2"></label><label>Land<input id="b143515Country" autocomplete="country-name" value="Österreich"></label></div><div id="b143515ClientMsg" class="b143515-client-msg"></div><div class="dialog-actions"><button class="btn ghost" type="button" data-new-client-cancel>Abbrechen</button><button class="btn primary" type="submit">Klient:in anlegen</button></div></form></dialog>`);
    const d=$('#b143515NewClient'),form=$('#b143515NewClientForm');
    $('[data-new-client-close]',d).onclick=$('[data-new-client-cancel]',d).onclick=()=>d.close();
    form.addEventListener('submit',async e=>{
      e.preventDefault();const btn=form.querySelector('button[type="submit"]'),msg=$('#b143515ClientMsg');
      const name=$('#b143515Name').value.trim(),email=$('#b143515Email').value.trim().toLowerCase();
      const masterData={birthDate:$('#b143515Birth').value,phone:$('#b143515Phone').value.trim(),street:$('#b143515Street').value.trim(),postalCode:$('#b143515Postal').value.trim(),city:$('#b143515City').value.trim(),country:$('#b143515Country').value.trim()};
      btn.disabled=true;btn.textContent='Lege an …';msg.className='b143515-client-msg';msg.textContent='';
      try{
        await crmPost('/admin/crm/inquiry/create',{name,email,source:'Manuell',journeyStage:'consultation'});
        let vaultWarning='';
        if(Object.values(masterData).some(Boolean)){try{await vaultMasterData(email,name,masterData)}catch(err){vaultWarning=err.message}}
        if(vaultWarning){msg.classList.add('warn');msg.textContent='Klient:in wurde im CRM angelegt. '+vaultWarning;setTimeout(()=>{d.close();$('#refreshBtn')?.click();setTimeout(()=>document.querySelector('[data-view="clients"]')?.click(),450)},1500)}
        else{d.close();$('#refreshBtn')?.click();setTimeout(()=>document.querySelector('[data-view="clients"]')?.click(),450)}
      }catch(err){msg.classList.add('err');msg.textContent=err.message}
      finally{btn.disabled=false;btn.textContent='Klient:in anlegen'}
    });
  }
  function openNewClient(){ensureNewClient();const d=$('#b143515NewClient');$('#b143515NewClientForm').reset();$('#b143515Country').value='Österreich';$('#b143515ClientMsg').textContent='';d.showModal();setTimeout(()=>$('#b143515Name')?.focus(),60)}

  function offerTabs(view,active){
    if(!view||view.querySelector('.b143515-offer-tabs'))return;
    const tabs=document.createElement('div');tabs.className='b143515-offer-tabs';tabs.innerHTML=`<button type="button" data-offer-tab="packages" class="${active==='packages'?'active':''}">Packages</button><button type="button" data-offer-tab="programs" class="${active==='programs'?'active':''}">Gruppen & Programme</button>`;
    view.prepend(tabs);
    tabs.addEventListener('click',e=>{const b=e.target.closest('[data-offer-tab]');if(!b)return;document.querySelector(`.nav-subitem[data-view="${b.dataset.offerTab}"]`)?.click()});
  }
  function setupOffers(){
    const group=$('.nav-group[data-nav-group="offers"]'),toggle=group?.querySelector('.nav-group-toggle');
    if(toggle&&!toggle.dataset.b143515Bound){toggle.dataset.b143515Bound='1';toggle.title='Angebote';toggle.setAttribute('aria-label','Angebote');toggle.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.querySelector('.nav-subitem[data-view="packages"]')?.click()},true)}
    offerTabs($('#view-packages'),'packages');offerTabs($('#view-programs'),'programs');
  }

  function updateRoadmap(){const p=$('.roadmap-current strong'),value='Aktuell: BUILD 14.3.5.15';if(p&&p.textContent!==value)p.textContent=value}
  function sync(){if(applying)return;applying=true;try{polishDashboard();ensureNewClient();setupOffers();updateRoadmap()}finally{applying=false}}
  let syncQueued=false;
  function scheduleSync(){if(syncQueued)return;syncQueued=true;requestAnimationFrame(()=>{syncQueued=false;sync()})}
  const mo=new MutationObserver(scheduleSync);mo.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('click',()=>setTimeout(sync,0),true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
