(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const apiBase=()=>String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const sessionToken=()=>sessionStorage.getItem('bd_admin_session_v1')||'';
  const fmt=x=>{try{return new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x))}catch(_){return String(x||'')}};
  const pendingKeys=()=>Object.keys(localStorage).filter(key=>key.startsWith('bd_capture_relay_'));
  let syncing=false,lastCloudCheck=0;

  function b64bytes(value){let s=String(value||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const raw=atob(s),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
  function bytes64(bytes){let raw='';for(let i=0;i<bytes.length;i+=0x8000)raw+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(raw)}
  async function relayCiphertext(relay,result){if(result.status==='received')return String(result.ciphertext||'');if(result.status!=='chunked')return'';const parts=[];for(let part=0;part<Number(result.parts||0);part++){const r=await fetch(apiBase()+'/capture-transfer/pull-part?relay='+encodeURIComponent(relay)+'&part='+part,{headers:{Authorization:'Bearer '+sessionToken()}}),x=await r.json();if(!r.ok||!x.ok)throw new Error(x.error||`Capture-Abschnitt ${part+1} fehlt.`);parts.push(String(x.data||''))}return parts.join('')}
  async function decryptRelay(ciphertext,secret){const envelope=JSON.parse(new TextDecoder().decode(b64bytes(ciphertext))),key=await crypto.subtle.importKey('raw',b64bytes(secret),'AES-GCM',false,['decrypt']),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64bytes(envelope.iv)},key,b64bytes(envelope.ciphertext));return JSON.parse(new TextDecoder().decode(plain))}
  async function ackRelay(relay){const r=await fetch(apiBase()+'/capture-transfer/ack',{method:'POST',headers:{Authorization:'Bearer '+sessionToken(),'Content-Type':'application/json'},body:JSON.stringify({relay})}),x=await r.json().catch(()=>({}));if(!r.ok||x.ok===false)throw new Error(x.error||'Capture konnte am Relay noch nicht bestätigt werden.');return x}
  function resolvePending(meta){if(meta.ref)return meta;const bookings=window.BDAdminUX?.getData?.()?.bookings||[],booking=bookings.find(row=>String(row.eventId)===String(meta.eventId));if(!booking)return meta;return{...meta,ref:booking.customerIdentityEmail||booking.email||'',displayName:booking.name||'',sessionDate:String(booking.start||'').slice(0,10)}}
  function captureType(payload){if(['dictation','session','note'].includes(payload?.captureType))return payload.captureType;return(payload?.audio||[]).length?'dictation':'note'}
  function captureSummary(payload){const audio=(payload.audio||[]).length,pages=Array.isArray(payload.inkPages)?payload.inkPages.filter(page=>(page.strokes||[]).length).length:((payload.strokes||[]).length?1:0),photos=(payload.photos||[]).length,hasText=!!String(payload.noteText||'').trim();return[audio?`${audio} Audio`:null,pages?`${pages} Handschriftseite${pages===1?'':'n'}`:null,hasText?'Textnotiz':null,photos?`${photos} Foto${photos===1?'':'s'}`:null].filter(Boolean).join(' · ')||'Capture-Quelle'}

  async function storeIncoming(meta,payload){
    meta=resolvePending(meta);if(!meta.ref)throw new Error('Der Capture kann noch keiner Klient:innenakte zugeordnet werden. Öffne die zugehörige Sitzung und prüfe den Transfer dort.');
    const captureId=String(payload.captureId||meta.relay||crypto.randomUUID()),existing=await window.BDVault.request('/documentation-inbox?captureId='+encodeURIComponent(captureId));
    if(existing.items?.length)return existing.items[0];
    const sessionId=String(meta.eventId||payload.sessionId||''),sessionDate=String(meta.sessionDate||payload.sessionDate||payload.createdAt||'').slice(0,10),safeId=captureId.replace(/[^a-zA-Z0-9_-]/g,'-'),filename=`capture-${safeId}.json`;
    let artifactId='';
    const client=await window.BDVault.request('/client?ref='+encodeURIComponent(meta.ref)).catch(()=>({exists:false,artifacts:[]}));
    const known=(client.artifacts||[]).find(a=>String(a.filename||'')===filename);if(known)artifactId=known.id;
    if(!artifactId){
      const clean={...payload,captureId,sessionId,sessionDate,photos:undefined},bytes=new TextEncoder().encode(JSON.stringify(clean));
      const stored=await window.BDVault.post('/artifact',{ref:meta.ref,displayName:meta.displayName||meta.ref,filename,mime:'application/json',note:`BUILD 14.3.6 Capture-Quelle${sessionId?' für Session '+sessionId:''}`,dataBase64:bytes64(bytes)});artifactId=stored.id;
      for(let i=0;i<(payload.photos||[]).length;i++){const photo=payload.photos[i],raw=b64bytes(photo.dataBase64),name=photo.name||`capture-${safeId}-foto-${i+1}.jpg`;await window.BDVault.post('/artifact',{ref:meta.ref,displayName:meta.displayName||meta.ref,filename:name,mime:photo.mime||'image/jpeg',note:`BUILD 14.3.6 Capture-Foto${sessionId?' für Session '+sessionId:''}`,dataBase64:bytes64(raw)})}
    }
    const type=captureType(payload),label=type==='session'?'Sitzungsaufnahme':type==='dictation'?'Diktat':'Notiz / Anlage',pages=Array.isArray(payload.inkPages)?payload.inkPages.some(page=>(page.strokes||[]).length):!!(payload.strokes||[]).length;
    const saved=await window.BDVault.post('/documentation-inbox',{ref:meta.ref,displayName:meta.displayName||meta.ref,captureId,sessionId,sessionDate,artifactId,captureType:type,status:'new',title:`${label}${meta.displayName?' · '+meta.displayName:''}`,summary:captureSummary(payload),hasAudio:(payload.audio||[]).length>0,hasInk:pages,hasText:!!String(payload.noteText||'').trim(),hasPhotos:(payload.photos||[]).length>0,createdAt:payload.createdAt});
    return saved.item;
  }

  async function syncPendingRelays({force=false}={}){
    if(syncing||!window.BDVault?.status?.().unlocked||!apiBase()||!sessionToken())return;
    if(!force&&Date.now()-lastCloudCheck<5*60*1000)return;
    lastCloudCheck=Date.now();syncing=true;updateRelayHint('Prüfe sicher übertragene Captures …');
    try{
      const keys=pendingKeys().slice(0,8);
      for(const key of keys){
        let meta;try{meta=JSON.parse(localStorage.getItem(key)||'{}')}catch(_){continue}
        if(!meta.relay||!meta.secret)continue;
        try{
          const r=await fetch(apiBase()+'/capture-transfer/pull?relay='+encodeURIComponent(meta.relay),{headers:{Authorization:'Bearer '+sessionToken()}}),x=await r.json();
          if(!r.ok||x.ok===false)throw new Error(x.error||'Cloud-Synchronisierung nicht erreichbar.');
          if(x.status==='expired'){localStorage.removeItem(key);continue}
          if(!['received','chunked'].includes(x.status))continue;
          const ciphertext=await relayCiphertext(meta.relay,x);if(!ciphertext)continue;
          const payload=await decryptRelay(ciphertext,meta.secret);await storeIncoming(meta,payload);await ackRelay(meta.relay);localStorage.removeItem(key);
        }catch(error){updateRelayHint('Cloud-Synchronisierung derzeit nicht vollständig möglich · lokale Capture-Kopien bleiben erhalten.');break}
      }
    }finally{syncing=false;await renderInbox(false)}
  }

  function statusCopy(status){return({new:'Neu · bereit zur Verarbeitung',processing:'In Bearbeitung',review:'Zur Prüfung',done:'Erledigt'}[status]||status)}
  function typeIcon(item){return item.captureType==='session'?'🎧':item.captureType==='dictation'?'🎙':'✍️'}
  function sourceTags(item){return[item.hasAudio?'Audio':null,item.hasInk?'Handschrift':null,item.hasText?'Text':null,item.hasPhotos?'Foto':null].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}
  function updateRelayHint(text=''){const el=$('#documentationRelayHint');if(!el)return;const count=pendingKeys().length;el.textContent=text||(count?`${count} Geräte-Transfer${count===1?'':'s'} wartet/warten noch auf sichere Übernahme. Die Cloud wird nicht permanent abgefragt.`:'Keine offenen Geräte-Transfers auf diesem Browser.');el.classList.toggle('has-pending',count>0)}

  async function renderInbox(sync=true){
    const host=$('#documentationInboxList'),count=$('#documentationInboxCount');if(!host||!count)return;
    if(!window.BDVault){host.innerHTML='<div class="doc-inbox-empty">Lokaler Vault wird geladen …</div>';return}
    await window.BDVault.checkHealth();
    if(!window.BDVault.status().unlocked){count.textContent='—';host.innerHTML='<div class="doc-inbox-locked"><div><strong>Dokumentations-Inbox ist lokal geschützt.</strong><p>Vault entsperren, um neue Captures und deren Verarbeitungsstatus zu sehen.</p></div><button class="btn primary" id="documentationUnlock" type="button">Vault entsperren</button></div>';$('#documentationUnlock').onclick=async()=>{if(await window.BDVault.ensureUnlocked())renderInbox(true)};updateRelayHint();return}
    if(sync)await syncPendingRelays().catch(()=>{});
    try{
      const result=await window.BDVault.request('/documentation-inbox?status=open'),items=result.items||[];count.textContent=String(items.length);
      if(!items.length){host.innerHTML='<div class="doc-inbox-empty"><strong>Alles verarbeitet.</strong><span>Neue Diktate, Sitzungsaufnahmen oder handschriftliche Capture-Notizen erscheinen hier nach der sicheren Übernahme.</span></div>';updateRelayHint();return}
      host.innerHTML=items.slice(0,10).map(item=>`<article class="doc-inbox-row" data-doc-item="${esc(item.id)}"><div class="doc-inbox-icon">${typeIcon(item)}</div><div class="doc-inbox-main"><div class="doc-inbox-title"><strong>${esc(item.title||'Capture-Eingang')}</strong><span class="doc-inbox-state ${esc(item.status)}">${esc(statusCopy(item.status))}</span></div><p>${esc(item.summary||'Capture-Quelle')}${item.sessionDate?' · Sitzung '+esc(new Intl.DateTimeFormat('de-AT',{dateStyle:'medium'}).format(new Date(item.sessionDate+'T12:00:00'))):''}</p><div class="doc-inbox-tags">${sourceTags(item)}<span>${esc(fmt(item.receivedAt))}</span></div></div><div class="doc-inbox-actions"><button class="btn primary" type="button" data-doc-open="${esc(item.id)}">${item.status==='new'?'Verarbeiten':'Weiter'}</button>${item.sessionId?`<button class="btn ghost" type="button" data-doc-session="${esc(item.id)}">Sitzung öffnen</button>`:''}<button class="text-button doc-done" type="button" data-doc-done="${esc(item.id)}">Als erledigt markieren</button></div></article>`).join('');
      host.querySelectorAll('[data-doc-open]').forEach(button=>button.onclick=()=>openItem(items.find(x=>String(x.id)===button.dataset.docOpen)));
      host.querySelectorAll('[data-doc-session]').forEach(button=>button.onclick=()=>openSession(items.find(x=>String(x.id)===button.dataset.docSession)));
      host.querySelectorAll('[data-doc-done]').forEach(button=>button.onclick=()=>completeItem(items.find(x=>String(x.id)===button.dataset.docDone)));
      updateRelayHint();
    }catch(error){host.innerHTML=`<div class="doc-inbox-empty error"><strong>Inbox konnte nicht geladen werden.</strong><span>${esc(error.message)}</span></div>`}
  }
  async function mark(item,status){if(!item)return null;const x=await window.BDVault.post('/documentation-inbox/update',{id:item.id,status});document.dispatchEvent(new CustomEvent('bd:documentation-inbox-updated',{detail:{item:x.item}}));return x.item}
  async function openItem(item){if(!item)return;try{if(item.status==='new')item=await mark(item,'processing');await window.BDVault.openArtifactForClient(item.clientRef,item.clientName,item.artifactId);await renderInbox(false)}catch(error){alert(error.message)}}
  async function openSession(item){if(!item?.sessionId)return;try{if(item.status==='new')await mark(item,'processing');if(window.BDFlowManager?.openFlow)window.BDFlowManager.openFlow(item.sessionId);else alert('Session Flow ist noch nicht bereit.')}catch(error){alert(error.message)}}
  async function completeItem(item){if(!item)return;if(!confirm('Diesen Dokumentationseingang als erledigt markieren? Die Originalquelle bleibt im lokalen Vault erhalten.'))return;try{await mark(item,'done');await renderInbox(false)}catch(error){alert(error.message)}}

  function bind(){
    $('#documentationInboxRefresh')?.addEventListener('click',()=>{lastCloudCheck=0;renderInbox(false).then(()=>syncPendingRelays({force:true}))});
    document.addEventListener('bd:vault-unlocked',()=>{lastCloudCheck=0;renderInbox(true)});
    document.addEventListener('bd:documentation-inbox-updated',()=>renderInbox(false));
    window.addEventListener('focus',()=>renderInbox(false));
    window.addEventListener('online',()=>{lastCloudCheck=0;syncPendingRelays({force:true})});
    setTimeout(()=>renderInbox(true),900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  window.BDDocumentationInbox={refresh:()=>renderInbox(false),sync:()=>syncPendingRelays({force:true})};
})();
