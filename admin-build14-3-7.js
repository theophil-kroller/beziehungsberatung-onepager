(function(){
  'use strict';
  const DOCUMENTATION_STEP_SEMANTICS=['Eingang','Zuordnung','Verarbeitung','Prüfung'];
  const LEGACY_DOCUMENTATION_COPY=['Zuordnen','Verarbeiten','Protokoll','Prüfen','Final prüfen & abschließen','Transkript erstellt und automatisch gespeichert','Zukünftige Termine ausnahmsweise anzeigen','Du darfst dieses Fenster und das CRM schließen','Geprüft & als Sitzungsprotokoll abschließen'];
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const apiBase=()=>String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const sessionToken=()=>sessionStorage.getItem('bd_admin_session_v1')||'';
  const VAULT='http://127.0.0.1:47831';
  const fmt=x=>{try{return x?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x)):'—'}catch(_){return String(x||'—')}};
  const fmtDate=x=>{try{return x?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium'}).format(new Date(String(x).length===10?x+'T12:00:00':x)):'—'}catch(_){return String(x||'—')}};
  const relTime=x=>{try{const d=new Date(x).getTime(),sec=Math.max(0,Math.round((Date.now()-d)/1000));if(sec<45)return'gerade eben';if(sec<3600)return`vor ${Math.max(1,Math.round(sec/60))} Min.`;if(sec<86400)return`vor ${Math.round(sec/3600)} Std.`;return fmt(x)}catch(_){return fmt(x)}};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const pendingKeys=()=>Object.keys(localStorage).filter(key=>key.startsWith('bd_capture_relay_'));
  let syncing=false,lastCloudCheck=0,workflowItem=null,workflowPayload=null,workflowTimer=null,workflowSecondsTimer=null,workflowStartedAt=0,activeHandoff=null,workflowActiveStep='assign';
  const localAutomationBusy=new Set();let localAutomationTimer=null;

  function b64bytes(value){let s=String(value||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const raw=atob(s),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
  function bytes64(bytes){let raw='';for(let i=0;i<bytes.length;i+=0x8000)raw+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(raw)}
  function randomSecret(){const bytes=crypto.getRandomValues(new Uint8Array(32));let raw='';bytes.forEach(x=>raw+=String.fromCharCode(x));return btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  async function loadLocalQr(){if(window.QRCode)return window.QRCode;return new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-bd-local-qr]');if(existing){existing.addEventListener('load',()=>window.QRCode?resolve(window.QRCode):reject(new Error('Lokale QR-Bibliothek ist nicht verfügbar.')),{once:true});existing.addEventListener('error',()=>reject(new Error('Lokale QR-Bibliothek konnte nicht geladen werden.')),{once:true});return}const s=document.createElement('script');s.src='qrcode-local.js?v=20260925-build14-3-7-1';s.dataset.bdLocalQr='1';s.onload=()=>window.QRCode?resolve(window.QRCode):reject(new Error('Lokale QR-Bibliothek ist nicht verfügbar.'));s.onerror=()=>reject(new Error('Lokale QR-Bibliothek konnte nicht geladen werden.'));document.head.appendChild(s)})}
  async function relayCiphertext(relay,result){if(result.status==='received')return String(result.ciphertext||'');if(result.status!=='chunked')return'';const parts=[];for(let part=0;part<Number(result.parts||0);part++){const r=await fetch(apiBase()+'/capture-transfer/pull-part?relay='+encodeURIComponent(relay)+'&part='+part,{headers:{Authorization:'Bearer '+sessionToken()}}),x=await r.json();if(!r.ok||!x.ok)throw new Error(x.error||`Capture-Abschnitt ${part+1} fehlt.`);parts.push(String(x.data||''))}return parts.join('')}
  async function decryptRelay(ciphertext,secret){const envelope=JSON.parse(new TextDecoder().decode(b64bytes(ciphertext))),key=await crypto.subtle.importKey('raw',b64bytes(secret),'AES-GCM',false,['decrypt']),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64bytes(envelope.iv)},key,b64bytes(envelope.ciphertext));return JSON.parse(new TextDecoder().decode(plain))}
  async function ackRelay(relay){const r=await fetch(apiBase()+'/capture-transfer/ack',{method:'POST',headers:{Authorization:'Bearer '+sessionToken(),'Content-Type':'application/json'},body:JSON.stringify({relay})}),x=await r.json().catch(()=>({}));if(!r.ok||x.ok===false)throw new Error(x.error||'Capture konnte am Relay noch nicht bestätigt werden.');return x}
  function resolvePending(meta){if(meta.ref)return meta;const bookings=window.BDAdminUX?.getData?.()?.bookings||[],booking=bookings.find(row=>String(row.eventId)===String(meta.eventId));if(!booking)return meta;return{...meta,ref:booking.customerIdentityEmail||booking.email||'',displayName:booking.name||'',sessionDate:String(booking.start||'').slice(0,10)}}
  function captureType(payload){if(['dictation','session','note'].includes(payload?.captureType))return payload.captureType;return(payload?.audio||[]).length?'dictation':'note'}
  function captureSummary(payload){const audio=(payload.audio||[]).length,pages=Array.isArray(payload.inkPages)?payload.inkPages.filter(page=>(page.strokes||[]).length).length:((payload.strokes||[]).length?1:0),photos=(payload.photos||[]).length,hasText=!!String(payload.noteText||'').trim();return[audio?`${audio} Audio`:null,pages?`${pages} Handschriftseite${pages===1?'':'n'}`:null,hasText?'Textnotiz':null,photos?`${photos} Foto${photos===1?'':'s'}`:null].filter(Boolean).join(' · ')||'Capture-Quelle'}

  async function loadArtifactPayload(id){
    if(!id)throw new Error('Keine Originalquelle gespeichert.');
    const token=window.BDVault?.token?.()||'';
    if(!token)throw new Error('Lokaler Vault ist gesperrt.');
    const r=await fetch(VAULT+'/artifact?id='+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token}});
    if(!r.ok)throw new Error('Originalquelle konnte nicht aus dem lokalen Vault geladen werden.');
    try{return JSON.parse(await r.text())}catch(_){throw new Error('Originalquelle ist kein lesbarer Capture-Datensatz.')}
  }

  async function storeIncoming(meta,payload){
    meta=resolvePending(meta||{});
    const assigned=!!meta.ref,ownerId=String(meta.ownerId||meta.owner||'practice'),ref=assigned?meta.ref:`__bd_inbox__:${ownerId}`;
    const displayName=assigned?(meta.displayName||meta.ref):'Dokumentations-Inbox';
    const captureId=String(payload.captureId||meta.relay||crypto.randomUUID()),existing=await window.BDVault.request('/documentation-inbox?captureId='+encodeURIComponent(captureId));
    if(existing.items?.length)return existing.items[0];
    const sessionId=assigned?String(meta.eventId||payload.sessionId||''):'',sessionDate=assigned?String(meta.sessionDate||payload.sessionDate||payload.createdAt||'').slice(0,10):'',safeId=captureId.replace(/[^a-zA-Z0-9_-]/g,'-'),filename=`capture-${safeId}.json`;
    let artifactId='';
    const bytes=new TextEncoder().encode(JSON.stringify({...payload,captureId,sessionId,sessionDate}));
    const stored=await window.BDVault.post('/artifact',{ref,displayName,filename,mime:'application/json',note:`BUILD 14.3.10 Capture-Quelle${sessionId?' für Session '+sessionId:''}`,dataBase64:bytes64(bytes)});artifactId=stored.id;
    const type=captureType(payload),label=type==='session'?'Sitzungsaufnahme':type==='dictation'?'Diktat':'Notiz / Anlage',pages=Array.isArray(payload.inkPages)?payload.inkPages.some(page=>(page.strokes||[]).length):!!(payload.strokes||[]).length;
    const saved=await window.BDVault.post('/documentation-inbox',{ref,displayName,captureId,sessionId,sessionDate,artifactId,captureType:type,status:'new',title:`${label}${assigned&&meta.displayName?' · '+meta.displayName:''}`,summary:captureSummary(payload),hasAudio:(payload.audio||[]).length>0,hasInk:pages,hasText:!!String(payload.noteText||'').trim(),hasPhotos:(payload.photos||[]).length>0,createdAt:payload.createdAt});
    setTimeout(()=>advanceLocalAutomation(saved.item,payload).catch(()=>{}),120);
    return saved.item;
  }

  async function syncSessionRelays(){
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
  }

  async function syncGenericInbox(){
    const r=await fetch(apiBase()+'/capture-transfer/inbox',{headers:{Authorization:'Bearer '+sessionToken()}}),x=await r.json().catch(()=>({}));
    if(!r.ok||x.ok===false)throw new Error(x.error||'Persönliche Dokumentations-Inbox konnte nicht abgefragt werden.');
    for(const row of (x.relays||[]).slice(0,20)){
      try{
        const pair=await window.BDVault.request('/capture-access-pair?id='+encodeURIComponent(row.pairId));
        const pullR=await fetch(apiBase()+'/capture-transfer/pull?relay='+encodeURIComponent(row.relay),{headers:{Authorization:'Bearer '+sessionToken()}}),pull=await pullR.json();
        if(!pullR.ok||pull.ok===false)throw new Error(pull.error||'Capture konnte nicht abgerufen werden.');
        if(!['received','chunked'].includes(pull.status))continue;
        const ciphertext=await relayCiphertext(row.relay,pull),payload=await decryptRelay(ciphertext,pair.pair.secret);
        await storeIncoming({relay:row.relay,ownerId:pair.pair.ownerId||x.owner||'',displayName:''},payload);
        await ackRelay(row.relay);
      }catch(error){
        if(/Pairing nicht im lokalen Vault/i.test(error.message||''))updateRelayHint('Ein Capture wartet für dieses Praxis-Login, aber der lokale Pairing-Schlüssel fehlt auf diesem Computer.');
      }
    }
  }

  async function syncPendingRelays({force=false}={}){
    if(syncing||!window.BDVault?.status?.().unlocked||!apiBase()||!sessionToken())return;
    if(!force&&Date.now()-lastCloudCheck<5*60*1000)return;
    lastCloudCheck=Date.now();syncing=true;updateRelayHint('Prüfe neue Captures für dieses Praxis-Login …');
    try{await syncSessionRelays();await syncGenericInbox()}catch(error){updateRelayHint('Cloud-Synchronisierung derzeit nicht möglich · lokale Capture-Kopien bleiben erhalten.')}finally{syncing=false;await renderInbox(false)}
  }

  function statusCopy(item){if(typeof item==='string')return({new:'Neu',processing:'In Bearbeitung',review:'Zur Prüfung',done:'Erledigt'}[item]||item);if(item?.status==='done')return'Erledigt';if(item?.aiDraft||item?.status==='review')return'Bereit zur Prüfung';if(item?.hasAudio&&!item?.transcript&&(item?.dictationIds||[]).length)return'Transkription läuft';if(item?.assigned&&item?.transcript&&!item?.aiDraft)return'Entwurf wird vorbereitet';if(!item?.assigned)return'Zuordnung nötig';return item?.status==='processing'?'Verarbeitung läuft':'Neu'}
  function typeIcon(item){return item.captureType==='session'?'🎧':item.captureType==='dictation'?'🎙':'✍️'}
  function sourceTags(item){return[item.hasAudio?'Audio':null,item.hasInk?'Handschrift':null,item.hasText?'Text':null,item.hasPhotos?'Foto':null].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}
  function updateRelayHint(text=''){const el=$('#documentationRelayHint');if(!el)return;const count=pendingKeys().length;el.textContent=text||(count?`${count} direkter Sitzungs-Transfer wartet noch auf sichere Übernahme. Zusätzlich wird die persönliche Inbox höchstens alle 5 Minuten geprüft.`:'Persönliche Capture-Inbox wird sparsam synchronisiert · keine permanente Cloud-Abfrage.');el.classList.toggle('has-pending',count>0)}

  function inboxStats(items){return{new:items.filter(x=>x.status==='new').length,processing:items.filter(x=>x.status==='processing').length,review:items.filter(x=>x.status==='review').length}}
  async function renderInbox(sync=true){
    const host=$('#documentationInboxList'),count=$('#documentationInboxCount');if(!host||!count)return;
    if(!window.BDVault){host.innerHTML='<div class="doc-inbox-empty">Lokaler Vault wird geladen …</div>';return}
    await window.BDVault.checkHealth();
    if(!window.BDVault.status().unlocked){count.textContent='—';host.innerHTML='<div class="doc-inbox-locked"><div><strong>Dokumentations-Inbox ist lokal geschützt.</strong><p>Vault entsperren, um Captures und ihren Bearbeitungsstand zu sehen.</p></div><button class="btn primary" id="documentationUnlock" type="button">Vault entsperren</button></div>';$('#documentationUnlock').onclick=async()=>{if(await window.BDVault.ensureUnlocked())renderInbox(true)};updateRelayHint();return}
    if(sync)await syncPendingRelays().catch(()=>{});
    try{
      const result=await window.BDVault.request('/documentation-inbox?status=open'),items=(result.items||[]).sort((a,b)=>new Date(b.receivedAt)-new Date(a.receivedAt)),stats=inboxStats(items);count.textContent=String(items.length);
      let statsHost=$('#documentationInboxStats');if(!statsHost){$('#documentationInboxList').insertAdjacentHTML('beforebegin','<div class="doc-inbox-stats" id="documentationInboxStats"></div>');statsHost=$('#documentationInboxStats')}
      statsHost.innerHTML=`<span><b>${stats.new}</b> Neu</span><span><b>${stats.processing}</b> In Bearbeitung</span><span class="review"><b>${stats.review}</b> Zur Prüfung</span>`;
      if(!items.length){host.innerHTML='<div class="doc-inbox-empty" id="documentationInboxBaseEmpty"><strong>Keine Capture-Eingänge offen.</strong><span>Vergangene Termine mit offener Nachbereitung werden darunter ergänzt.</span></div>';await window.BDDocumentationUX?.enrichInbox?.(host,items);if(host.querySelector('.b1438-open-task'))$('#documentationInboxBaseEmpty')?.remove();updateRelayHint();return}
      host.innerHTML=items.slice(0,12).map(item=>`<article class="doc-inbox-row" data-doc-item="${esc(item.id)}"><div class="doc-inbox-icon">${typeIcon(item)}</div><div class="doc-inbox-main"><div class="doc-inbox-title"><strong>${esc(item.title||'Capture-Eingang')}</strong><span class="doc-inbox-state ${esc(item.status)}">${esc(statusCopy(item))}</span></div><p>${esc(item.summary||'Capture-Quelle')}${item.sessionDate?' · Sitzung '+esc(fmtDate(item.sessionDate)):''}</p><div class="doc-inbox-tags">${sourceTags(item)}<span>${esc(relTime(item.receivedAt))}</span></div></div><div class="doc-inbox-actions"><button class="btn primary" type="button" data-doc-open="${esc(item.id)}">${!item.assigned?'Zuordnen':item.aiDraft||item.status==='review'?'Prüfen':'Status ansehen'}</button>${item.sessionId?`<button class="btn ghost" type="button" data-doc-session="${esc(item.id)}">Sitzung öffnen</button>`:''}</div></article>`).join('');
      host.querySelectorAll('[data-doc-open]').forEach(button=>button.onclick=()=>openWorkflow(items.find(x=>String(x.id)===button.dataset.docOpen)));
      host.querySelectorAll('[data-doc-session]').forEach(button=>button.onclick=()=>openSession(items.find(x=>String(x.id)===button.dataset.docSession)));
      await window.BDDocumentationUX?.enrichInbox?.(host,items);
      updateRelayHint();
      runLocalAutomationCycle(items).catch(()=>{});ensureLocalAutomationLoop();
    }catch(error){host.innerHTML=`<div class="doc-inbox-empty error"><strong>Inbox konnte nicht geladen werden.</strong><span>${esc(error.message)}</span></div>`}
  }

  async function mark(item,status,extra={}){if(!item)return null;const x=await window.BDVault.post('/documentation-inbox/update',{id:item.id,status,...extra});document.dispatchEvent(new CustomEvent('bd:documentation-inbox-updated',{detail:{item:x.item}}));return x.item}
  async function automationPayload(item,payload=null){if(payload)return payload;try{return await loadArtifactPayload(item.artifactId)}catch(_){return{}}}
  async function beginAutomaticTranscription(item,payload){
    if(!item?.hasAudio||item.transcript||(item.dictationIds||[]).length||!(payload?.audio||[]).length)return item;
    const ids=[];
    for(let index=0;index<payload.audio.length;index++){
      const audio=payload.audio[index];
      const created=await window.BDVault.post('/dictation/start',{origin:item.sessionId?'session':item.assigned?'case':'quick',ref:item.clientRef||'',displayName:item.clientName||'',targetSessionId:item.sessionId||'',sessionDate:item.sessionDate||String(payload.createdAt||new Date().toISOString()).slice(0,10),durationMinutes:Math.ceil(Number(audio.durationSeconds||0)/60),contextLabel:`Dokumentations-Inbox · Aufnahme ${index+1} · ${item.captureId}`,language:'de'});
      const id=created.dictation.id,raw=b64bytes(audio.dataBase64),partSize=2*1024*1024;
      for(let offset=0,sequence=0;offset<raw.length;offset+=partSize,sequence++)await window.BDVault.post('/dictation/chunk',{id,sequence,mime:audio.mime||'audio/webm',dataBase64:bytes64(raw.subarray(offset,Math.min(raw.length,offset+partSize)))});
      await window.BDVault.post('/dictation/finalize',{id,language:'de',transcribe:true});ids[index]=id;
    }
    return await mark(item,'processing',{dictationIds:ids,transcriptionStartedAt:new Date().toISOString(),processingError:''});
  }
  async function collectAutomaticTranscript(item){
    const ids=item?.dictationIds||[];if(!ids.length||item.transcript)return item;
    const rows=[];for(const id of ids){try{rows.push((await window.BDVault.request('/dictation?id='+encodeURIComponent(id))).dictation)}catch(e){rows.push({id,status:'error',error:e.message})}}
    for(const row of rows.filter(x=>x.status==='saved'))await window.BDVault.post('/dictation/transcribe',{id:row.id,language:'de',transcribe:true}).catch(()=>{});
    if(rows.some(x=>x.status==='error'))return await mark(item,'processing',{processingError:'Mindestens eine Audioquelle konnte noch nicht transkribiert werden.'});
    if(!rows.length||!rows.every(x=>['draft','accepted'].includes(x.status)))return item;
    const transcript=rows.map((x,i)=>`[Aufnahme ${i+1}]\n${x.editedTranscript||x.originalTranscript||''}`.trim()).join('\n\n');
    const elapsed=item.transcriptionStartedAt?Math.max(1,(Date.now()-new Date(item.transcriptionStartedAt).getTime())/1000):0;
    return await mark(item,'processing',{transcript,processingError:'',transcriptionSeconds:elapsed});
  }
  async function beginAutomaticAi(item,payload){
    if(!item?.assigned||item.aiDraft||item.aiStartedAt)return item;
    const raw=[String(item.transcript||'').trim(),String(payload?.noteText||'').trim()].filter(Boolean).join('\n\n');if(raw.length<8)return item;
    const x=await window.BDVault.post('/documentation-inbox/ai-start',{id:item.id,rawNotes:raw});
    return {...item,status:'processing',aiStartedAt:x.startedAt,processingError:''};
  }
  async function refreshAutomaticAi(item){
    if(!item?.aiStartedAt||item.aiDraft)return item;const items=(await window.BDVault.request('/documentation-inbox?status=all')).items||[];return items.find(x=>String(x.id)===String(item.id))||item;
  }
  async function advanceLocalAutomation(item,payload=null){
    if(!item||item.status==='done'||localAutomationBusy.has(String(item.id))||!window.BDVault?.status?.().unlocked)return item;
    localAutomationBusy.add(String(item.id));try{
      payload=await automationPayload(item,payload);
      if(item.hasAudio&&!item.transcript){item=await beginAutomaticTranscription(item,payload);item=await collectAutomaticTranscript(item);if(!item.transcript)return item}
      if(item.aiStartedAt&&!item.aiDraft)item=await refreshAutomaticAi(item);
      if(item.assigned&&!item.aiDraft&&!item.aiStartedAt)item=await beginAutomaticAi(item,payload);
      return item;
    }finally{localAutomationBusy.delete(String(item.id))}
  }
  async function runLocalAutomationCycle(items=null){
    if(!window.BDVault?.status?.().unlocked)return;const rows=items||(await window.BDVault.request('/documentation-inbox?status=open')).items||[];let changed=false;
    for(const item of rows.slice(0,8)){const next=await advanceLocalAutomation(item).catch(()=>item);if(next&&String(next.updatedAt)!==String(item.updatedAt))changed=true}
    if(changed)setTimeout(()=>renderInbox(false).catch(()=>{}),80);
  }
  function ensureLocalAutomationLoop(){if(localAutomationTimer)return;localAutomationTimer=setInterval(()=>{if(!document.hidden)runLocalAutomationCycle().catch(()=>{})},4000)}
  function dashboard(){return window.BDAdminUX?.getData?.()||{}}
  function looksTechnicalName(value){
    const x=String(value||'').trim();
    return !x||x.includes('@')||/^[0-9a-f-]{16,}$/i.test(x)||(/^\d[\d\s-]{12,}$/.test(x))||x.length>80;
  }
  function displayClientName(ref,...candidates){
    for(const value of candidates){const x=String(value||'').trim();if(x&&!looksTechnicalName(x))return x}
    const local=String(ref||'').split('@')[0].replace(/[._-]+/g,' ').trim();
    return local||'Unbekannte Person';
  }
  function customerOptions(selected=''){
    const seen=new Map(),bookings=dashboard().bookings||[];
    bookings.forEach(b=>{const ref=String(b.customerIdentityEmail||b.email||'').trim();if(!ref)return;const key=ref.toLowerCase(),name=displayClientName(ref,b.name);if(!seen.has(key)||looksTechnicalName(seen.get(key).name))seen.set(key,{ref,name})});
    (dashboard().customers||[]).forEach(c=>{const ref=String(c.customerIdentityEmail||c.email||'').trim();if(!ref)return;const key=ref.toLowerCase(),existing=seen.get(key),name=displayClientName(ref,c.name,c.displayName,existing?.name);seen.set(key,{ref,name})});
    const values=[...seen.values()].sort((a,b)=>a.name.localeCompare(b.name,'de'));
    const counts=values.reduce((m,x)=>(m.set(x.name,(m.get(x.name)||0)+1),m),new Map());
    return values.map(c=>`<option value="${esc(c.ref)}" ${c.ref===selected?'selected':''}>${esc(c.name)}${counts.get(c.name)>1?' · '+esc(c.ref):''}</option>`).join('');
  }
  function bookingsFor(ref,includeFuture=false){
    const key=String(ref||'').trim().toLowerCase(),now=Date.now();
    return (dashboard().bookings||[]).filter(b=>String(b.customerIdentityEmail||b.email||'').trim().toLowerCase()===key&&String(b.status||'').toLowerCase()!=='cancelled'&&(includeFuture||new Date(b.start).getTime()<=now+5*60*1000)).sort((a,b)=>new Date(b.start)-new Date(a.start));
  }
  function bookingOptions(ref,selected='',includeFuture=false){
    return '<option value="">Nur der Klientenakte zuordnen</option>'+bookingsFor(ref,includeFuture).map(b=>`<option value="${esc(b.eventId)}" data-date="${esc(String(b.start||'').slice(0,10))}" ${String(b.eventId)===String(selected)?'selected':''}>${esc(fmt(b.start))} · ${esc(b.typeLabel||'Sitzung')}</option>`).join('')+'<option value="__manual__">＋ Sitzung nachträglich erfassen …</option>';
  }
  function recommendedBooking(ref){
    const target=new Date(workflowPayload?.createdAt||workflowItem?.receivedAt||Date.now()).getTime();
    return bookingsFor(ref,false).sort((a,b)=>Math.abs(new Date(a.start).getTime()-target)-Math.abs(new Date(b.start).getTime()-target))[0]||null;
  }

  function ensureWorkflow(){
    if($('#documentationWorkflowDialog'))return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="documentationWorkflowDialog" class="doc-workflow-dialog"><div class="doc-workflow-shell"><button class="dialog-x" id="docWorkflowClose" type="button" aria-label="Schließen">×</button><header class="doc-workflow-top"><div><p class="eyebrow">Dokumentation</p><h2 id="docWorkflowTitle">Dokumentation bearbeiten</h2><p class="muted" id="docWorkflowSub"></p></div><span class="doc-workflow-state" id="docWorkflowState"></span></header><nav class="doc-stepper doc-stepper-four" id="docStepper" aria-label="Dokumentationsfortschritt"><button data-doc-step="source" disabled><b>1</b><span>Eingang</span></button><button data-doc-step="assign" disabled><b>2</b><span>Zuordnung</span></button><button data-doc-step="process" disabled><b>3</b><span>Verarbeitung</span></button><button data-doc-step="review" disabled><b>4</b><span>Prüfung</span></button></nav><div id="docWorkflowBody"></div></div></dialog>`);
    $('#docWorkflowClose').onclick=()=>$('#documentationWorkflowDialog').close();
    $('#documentationWorkflowDialog').addEventListener('close',()=>{clearWorkflowTimers();workflowItem=null;workflowPayload=null;workflowActiveStep='assign'});
  }
  function clearWorkflowTimers(){if(workflowTimer)clearInterval(workflowTimer);if(workflowSecondsTimer)clearInterval(workflowSecondsTimer);workflowTimer=workflowSecondsTimer=null}
  function stepState(item){if(!item?.assigned)return'assign';if(item?.aiDraft||item?.status==='review')return'review';return'process'}
  function completedSteps(item){return new Set(['source',...(item?.assigned?['assign']:[]),...(item?.aiDraft?['process']:[]),...(item?.status==='done'?['review']:[])])}
  function setStepper(active){
    workflowActiveStep=active;const done=completedSteps(workflowItem);
    $('#docStepper')?.querySelectorAll('button').forEach(b=>{const step=b.dataset.docStep;b.disabled=true;b.classList.toggle('active',step===active);b.classList.toggle('done',done.has(step)&&step!==active);b.setAttribute('aria-current',step===active?'step':'false')});
  }
  function workflowStatus(item){return statusCopy(item)}

  async function openWorkflow(item){
    if(!item)return;if(!await window.BDVault.ensureUnlocked())return;
    ensureWorkflow();clearWorkflowTimers();
    const all=(await window.BDVault.request('/documentation-inbox?status=all')).items||[];
    const latest=all.find(x=>String(x.id)===String(item.id))||item;workflowItem=latest;
    try{workflowPayload=await loadArtifactPayload(latest.artifactId)}catch(_){workflowPayload={}}
    const sourceLabel=latest.captureType==='session'?'Sitzungsaufnahme':latest.captureType==='dictation'?'Diktat':'Notiz / Anlage';
    $('#docWorkflowTitle').textContent=latest.assigned?(latest.clientName||'Klient:in')+' · Dokumentation':'Dokumentation bearbeiten';
    $('#docWorkflowSub').textContent=`${sourceLabel}${latest.sessionDate?' · Sitzung '+fmtDate(latest.sessionDate):''}${latest.receivedAt?' · '+fmt(latest.receivedAt):''}`;
    $('#docWorkflowState').textContent=workflowStatus(latest);
    $('#documentationWorkflowDialog').showModal();workflowItem=await advanceLocalAutomation(workflowItem,workflowPayload).catch(()=>workflowItem);showStep(stepState(workflowItem));ensureLocalAutomationLoop();
  }

  function captureContents(){const p=workflowPayload||{},audio=(p.audio||[]).length,pages=Array.isArray(p.inkPages)?p.inkPages.filter(x=>(x.strokes||[]).length).length:((p.strokes||[]).length?1:0),photos=(p.photos||[]).length,text=String(p.noteText||'').trim();return[audio?`${audio} Audio`:null,pages?`${pages} Handschriftseite${pages===1?'':'n'}`:null,text?'Textnotiz':null,photos?`${photos} Foto${photos===1?'':'s'}`:null].filter(Boolean).join(' · ')||'Quelle'}
  function sourcePreview(){return `<section class="doc-work-card doc-source-minimal"><div class="doc-mini-source"><span>${typeIcon(workflowItem)}</span><div><strong>${esc(workflowItem.captureType==='session'?'Sitzungsaufnahme':workflowItem.captureType==='dictation'?'Diktat':'Notiz')}</strong><small>${esc(captureContents())} · ${esc(fmt(workflowItem.receivedAt))}</small></div><b>✓ lokal</b></div></section>`}
  function assignView(){
    return `<section class="doc-work-card"><div class="doc-screen-head compact"><div><h3>Zuordnen</h3></div><span class="doc-soft-status">${esc(captureContents())}</span></div><div class="doc-form-stack compact"><label><span>Klient:in</span><select id="docAssignClient"><option value="">Bitte auswählen …</option>${customerOptions(workflowItem.clientRef||'')}</select></label><label><span>Sitzung</span><select id="docAssignSession"></select></label><div id="docManualSession" class="doc-manual-session" hidden><label><span>Datum der stattgefundenen Sitzung</span><input id="docManualSessionDate" type="date" max="${new Date().toISOString().slice(0,10)}"></label></div></div><details class="doc-assignment-options"><summary>Weitere Optionen</summary><label><input type="checkbox" id="docShowFuture"> Zukünftige Termine anzeigen</label><small>Zukünftige Termine können für Vorbereitung gewählt werden, aber nicht als bereits stattgefundenes Sitzungsprotokoll abgeschlossen werden.</small></details><div class="doc-assignment-current" id="docAssignmentCurrent"></div><div class="dialog-actions doc-action-bar"><button class="btn primary" id="docAssignSave" type="button">Weiter →</button></div></section>`;
  }
  function cleanDraftValue(value){const x=String(value??'').trim();return /^(leer|nicht dokumentiert|keine angabe|n\/a|—)$/i.test(x)?'':x}
  function draftFields(draft,review=false){
    draft=draft||{};const interventions=Array.isArray(draft.interventions)?draft.interventions.join(', '):draft.interventions||'';const uncertainties=Array.isArray(draft.uncertainties)?draft.uncertainties.join('\n'):draft.uncertainties||'';
    const field=(label,key,value,rows=3)=>`<label><span>${label}</span><textarea data-draft="${key}" rows="${rows}" placeholder="Nicht dokumentiert">${esc(cleanDraftValue(value))}</textarea></label>`;
    return `<div class="doc-editor ${review?'review':''}"><section><h4>Kern der Sitzung</h4>${field('Fokus','focus',draft.focus,3)}${field('Dynamik / relevante Beobachtungen','dynamics',draft.dynamics,4)}</section><section><h4>Arbeit in der Sitzung</h4>${field('Interventionen','interventions',interventions,3)}${field('Reaktion / Verlauf','response',draft.response,4)}</section><section><h4>Vereinbarungen & Ausblick</h4>${field('Vereinbarungen','agreements',draft.agreements,3)}${field('Nächster Fokus','nextFocus',draft.nextFocus,3)}</section><details class="doc-internal-notes" ${cleanDraftValue(draft.privatePrep)||cleanDraftValue(uncertainties)?'open':''}><summary>Interne Notizen</summary><div>${field('Interne Vorbereitung','privatePrep',draft.privatePrep,3)}${field('Unsicherheiten / prüfen','uncertainties',uncertainties,3)}</div></details></div>`;
  }
  function inkSvg(page,index){const strokes=Array.isArray(page?.strokes)?page.strokes:[];const lines=strokes.map(stroke=>{const pts=(stroke||[]).map(pt=>`${Math.max(0,Math.min(1,Number(pt.x)||0))*1000},${Math.max(0,Math.min(1,Number(pt.y)||0))*700}`).join(' ');return pts?`<polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`:''}).join('');return `<figure class="doc-ink-page"><figcaption>Seite ${index+1}</figcaption><svg viewBox="0 0 1000 700" role="img" aria-label="Handschriftseite ${index+1}">${lines}</svg></figure>`}
  function sourceList(){
    const p=workflowPayload||{},parts=[];
    if(workflowItem.transcript)parts.push(`<details class="doc-source-text"><summary><span>🎙 Transkript</span><small>Anzeigen</small></summary><pre>${esc(workflowItem.transcript)}</pre></details>`);
    if(String(p.noteText||'').trim())parts.push(`<details class="doc-source-text"><summary><span>📝 Textnotiz</span><small>Anzeigen</small></summary><pre>${esc(String(p.noteText||'').trim())}</pre></details>`);
    const inkPages=Array.isArray(p.inkPages)?p.inkPages.filter(x=>(x.strokes||[]).length):((p.strokes||[]).length?[{strokes:p.strokes}]:[]);
    if(inkPages.length)parts.push(`<details class="doc-source-text"><summary><span>✍️ Handschrift</span><small>${inkPages.length} Seite${inkPages.length===1?'':'n'}</small></summary><div class="doc-ink-grid">${inkPages.map(inkSvg).join('')}</div></details>`);
    if((p.photos||[]).length)parts.push(`<details class="doc-source-text"><summary><span>📎 Fotos</span><small>${(p.photos||[]).length}</small></summary><div class="doc-photo-grid">${(p.photos||[]).map((photo,i)=>`<figure><img src="data:${esc(photo.mime||'image/jpeg')};base64,${String(photo.dataBase64||'')}" alt="Anlage ${i+1}"><figcaption>${esc(photo.name||'Anlage '+(i+1))}</figcaption></figure>`).join('')}</div></details>`);
    return parts.join('')
  }
  function processingPhase(){if(workflowItem.processingError)return'error';if(workflowItem.aiDraft)return'ready';if(!workflowItem.hasAudio&&!workflowItem.hasText&&(workflowItem.hasInk||workflowItem.hasPhotos))return'attachment';if(workflowItem.aiStartedAt)return'ai';if(workflowItem.transcript&&workflowItem.assigned)return'ai';if(workflowItem.hasAudio)return'whisper';if(workflowItem.assigned)return'ai';return'waiting'}
  function processView(){
    const phase=processingPhase(),seconds=Number(workflowItem.transcriptionSeconds||0),transcript=String(workflowItem.transcript||'').trim();
    const timing=seconds?(seconds<60?Math.round(seconds)+' Sek.':Math.floor(seconds/60)+' Min. '+Math.round(seconds%60)+' Sek.'):'';
    const states=phase==='whisper'?['🎙','Transkription läuft','Whisper verarbeitet die Audioquelle lokal.']:phase==='ai'?['✨','Entwurf wird vorbereitet','Die lokale KI strukturiert die vorhandenen Quellen.']:phase==='ready'?['✓','Bereit zur Prüfung','Transkript und Entwurf sind vorbereitet.']:phase==='attachment'?['✓','Anlage bereit','Für diese Quelle ist keine Transkription erforderlich.']:phase==='error'?['!','Verarbeitung pausiert',workflowItem.processingError||'Lokale Verarbeitung konnte nicht fortgesetzt werden.']:['…','Wartet auf Zuordnung','Nach der Zuordnung wird die lokale Verarbeitung automatisch fortgesetzt.'];
    return `<section class="doc-work-card"><div class="doc-screen-head compact"><div><h3>Verarbeitung</h3></div></div><div class="doc-auto-pipeline"><div class="doc-pipeline-icon">${states[0]}</div><div><strong>${states[1]}</strong><span>${states[2]}</span>${phase==='whisper'?`<small id="docElapsed">${timing?'Bisher '+esc(timing):'läuft lokal …'}</small>`:''}</div></div>${transcript?`<details class="doc-transcript-disclosure"><summary>Transkript ansehen / korrigieren ${timing?'· '+esc(timing):''}</summary><label class="doc-transcript-label"><textarea id="docTranscript" rows="12">${esc(transcript)}</textarea><small id="docTranscriptSaveState">✓ automatisch gespeichert</small></label></details>`:''}<div class="doc-source-stack compact">${sourceList()}</div>${phase==='error'?'<button class="btn secondary" id="docRetryAutomation" type="button">Erneut versuchen</button>':''}<div class="dialog-actions doc-action-bar"><button class="btn ghost" id="docProcessBack" type="button">← Zuordnung</button><button class="btn primary" id="docProcessNext" type="button" ${['ready','attachment'].includes(phase)?'':'disabled'}>Zur Prüfung →</button></div></section>`;
  }
  function reviewView(){
    const draft=workflowItem.aiDraft||{},attachmentOnly=!workflowItem.hasAudio&&!workflowItem.hasText&&!workflowItem.aiDraft&&!!(workflowItem.hasInk||workflowItem.hasPhotos),canFinalize=!!(workflowItem.assigned&&workflowItem.sessionId&&workflowItem.sessionDate),future=workflowItem.sessionDate&&new Date(workflowItem.sessionDate+'T23:59:59').getTime()>Date.now();
    if(attachmentOnly)return `<section class="doc-work-card"><div class="doc-screen-head compact"><div><h3>Anlage prüfen</h3><p>${esc(workflowItem.clientName||'Klient:in')}</p></div><span class="doc-human-badge">Menschliche Freigabe</span></div><div class="doc-source-stack">${sourceList()}</div><div class="doc-review-summary"><strong>Als Fallanlage ablegen?</strong><span>Die Originalquelle bleibt unverändert im lokalen Vault und wird der Klientenakte zugeordnet.</span></div><div class="dialog-actions doc-action-bar final"><button class="btn ghost" id="docReviewBack" type="button">← Verarbeitung</button><button class="btn primary" id="docCompleteAttachment" type="button" ${workflowItem.assigned?'':'disabled'}>✓ Als Fallanlage ablegen</button></div></section>`;
    return `<section class="doc-work-card"><div class="doc-screen-head compact"><div><h3>Prüfen & abschließen</h3><p>${esc(workflowItem.clientName||'Klient:in')}${workflowItem.sessionDate?' · '+esc(fmtDate(workflowItem.sessionDate)):''}</p></div><span class="doc-human-badge">Menschliche Freigabe</span></div>${!workflowItem.sessionId?'<div class="doc-warning"><strong>Sitzung noch nicht gewählt.</strong><span>Ordne den tatsächlich stattgefundenen Termin zu oder erfasse ihn nachträglich.</span><button class="btn secondary" id="docReviewAssign" type="button">Zuordnung ändern</button></div>':''}${future?'<div class="doc-warning"><strong>Dieser Termin liegt in der Zukunft.</strong><span>Ein finales Sitzungsprotokoll kann erst für eine stattgefundene Sitzung abgeschlossen werden.</span><button class="btn secondary" id="docReviewAssignFuture" type="button">Zuordnung ändern</button></div>':''}<details class="doc-sources-disclosure final" open><summary>Quellen vergleichen</summary><div class="doc-source-stack">${sourceList()}</div></details>${draftFields(draft,true)}<div class="doc-autosave">Änderungen werden beim Abschluss gespeichert.</div><div class="dialog-actions doc-action-bar final"><button class="btn ghost" id="docReviewBack" type="button">← Verarbeitung</button><button class="btn primary" id="docFinalizeProtocol" type="button" ${canFinalize&&!future?'':'disabled'}>✓ Final ablegen</button></div></section>`;
  }
  function showStep(step){
    if(!workflowItem)return;workflowActiveStep=step;setStepper(step);const body=$('#docWorkflowBody');body.innerHTML=step==='source'?sourcePreview():step==='assign'?assignView():step==='process'?processView():reviewView();
    if(step==='assign')bindAssign();if(step==='process')bindProcess();if(step==='review')bindReview();
  }

  function bindAssign(){
    const client=$('#docAssignClient'),session=$('#docAssignSession'),future=$('#docShowFuture'),manual=$('#docManualSession'),manualDate=$('#docManualSessionDate');
    const selectedWasFuture=!!workflowItem.sessionId&&(dashboard().bookings||[]).some(b=>String(b.eventId)===String(workflowItem.sessionId)&&new Date(b.start).getTime()>Date.now()+5*60*1000);future.checked=selectedWasFuture;
    const updateSummary=()=>{const c=[...client.options].find(o=>o.value===client.value),opt=session.selectedOptions[0],isManual=session.value==='__manual__';manual.hidden=!isManual;if(isManual&&!manualDate.value)manualDate.value=String(workflowPayload?.createdAt||workflowItem.receivedAt||new Date().toISOString()).slice(0,10);$('#docAssignmentCurrent').innerHTML=client.value?`<strong>${esc(c?.textContent||client.value)}</strong><span>${isManual?'Sitzung wird nachträglich erfasst':session.value?esc(opt?.textContent||'Sitzung gewählt'):'Nur Klientenakte'}</span>`:''};
    const hydrate=(keep='')=>{const previous=keep||session.value||((client.value===workflowItem.clientRef)?workflowItem.sessionId:'');session.innerHTML=bookingOptions(client.value,previous,future.checked);if(String(previous||'').startsWith('manual-session:')){session.value='__manual__';manualDate.value=workflowItem.sessionDate||String(workflowPayload?.createdAt||workflowItem.receivedAt||new Date().toISOString()).slice(0,10)}else if(previous&&[...session.options].some(o=>o.value===String(previous)))session.value=String(previous);if(!session.value&&!workflowItem.sessionId&&client.value){const rec=recommendedBooking(client.value),captureAt=new Date(workflowPayload?.createdAt||workflowItem.receivedAt||Date.now()).getTime();if(rec&&Math.abs(new Date(rec.start).getTime()-captureAt)<72*3600*1000)session.value=String(rec.eventId)}updateSummary()};
    client.onchange=()=>hydrate('');session.onchange=updateSummary;future.onchange=()=>hydrate(session.value);hydrate(workflowItem.sessionId||'');
    $('#docAssignSave').onclick=async()=>{const ref=client.value;if(!ref){alert('Bitte Klient:in auswählen.');return}const c=[...client.options].find(o=>o.value===ref),name=String(c?.textContent||displayClientName(ref)).split(' · ')[0],opt=session.selectedOptions[0];let sessionId=session.value,sessionDate='';if(sessionId==='__manual__'){sessionDate=manualDate.value;if(!sessionDate){alert('Bitte das Datum der stattgefundenen Sitzung wählen.');return}if(new Date(sessionDate+'T23:59:59').getTime()>Date.now()){alert('Die nachträglich erfasste Sitzung darf nicht in der Zukunft liegen.');return}sessionId=String(workflowItem.sessionId||'').startsWith('manual-session:')?workflowItem.sessionId:'manual-session:'+workflowItem.captureId}else sessionDate=sessionId?String(opt?.dataset.date||''):'';const b=$('#docAssignSave');b.disabled=true;try{workflowItem=await mark(workflowItem,workflowItem.status==='new'?'processing':workflowItem.status,{ref,displayName:name,sessionId,sessionDate,clearSession:!sessionId});$('#docWorkflowState').textContent=workflowStatus(workflowItem);workflowItem=await advanceLocalAutomation(workflowItem,workflowPayload).catch(()=>workflowItem);showStep(workflowItem.aiDraft?'review':'process')}catch(e){alert(e.message)}finally{b.disabled=false}};
  }

  async function startAllTranscriptions(){
    if(!workflowPayload?.audio?.length)return;
    const button=$('#docTranscribeAll');if(button)button.disabled=true;const ids=[...(workflowItem.dictationIds||[])];
    try{
      for(let index=0;index<workflowPayload.audio.length;index++){
        if(ids[index])continue;const item=workflowPayload.audio[index];$('#docTranscribeState').textContent=`Audio ${index+1}/${workflowPayload.audio.length} wird verschlüsselt in den lokalen Vault übernommen …`;
        const created=await window.BDVault.post('/dictation/start',{origin:workflowItem.sessionId?'session':'case',ref:workflowItem.clientRef||'',displayName:workflowItem.clientName||'',targetSessionId:workflowItem.sessionId||'',sessionDate:workflowItem.sessionDate||String(workflowPayload.createdAt||new Date().toISOString()).slice(0,10),durationMinutes:Math.ceil(Number(item.durationSeconds||0)/60),contextLabel:`Dokumentations-Inbox · Aufnahme ${index+1} · ${workflowItem.captureId}`,language:'de'});const id=created.dictation.id,raw=b64bytes(item.dataBase64),partSize=2*1024*1024;
        for(let offset=0,sequence=0;offset<raw.length;offset+=partSize,sequence++){const part=raw.subarray(offset,Math.min(raw.length,offset+partSize));$('#docTranscribeState').textContent=`Audio ${index+1}: lokales Speichern · Abschnitt ${sequence+1}`;await window.BDVault.post('/dictation/chunk',{id,sequence,mime:item.mime||'audio/webm',dataBase64:bytes64(part)})}
        await window.BDVault.post('/dictation/finalize',{id,language:'de',transcribe:true});ids[index]=id;
      }
      workflowStartedAt=Date.now();workflowItem=await mark(workflowItem,'processing',{dictationIds:ids,transcriptionStartedAt:new Date().toISOString(),processingError:''});showCloseSafe();startTranscriptionWatcher();
    }catch(e){$('#docTranscribeState').textContent=e.message;if(button)button.disabled=false}
  }
  function showCloseSafe(){const box=$('#docCloseSafe');if(box)box.hidden=false;if(!workflowStartedAt)workflowStartedAt=workflowItem.transcriptionStartedAt?new Date(workflowItem.transcriptionStartedAt).getTime():Date.now();if(workflowSecondsTimer)clearInterval(workflowSecondsTimer);const update=()=>{const el=$('#docElapsed');if(el)el.textContent=`Läuft seit ${Math.max(0,Math.floor((Date.now()-workflowStartedAt)/1000))} Sekunden.`};update();workflowSecondsTimer=setInterval(update,1000)}
  async function refreshTranscriptions(){
    const ids=workflowItem.dictationIds||[];if(!ids.length)return false;const rows=[];for(const id of ids){try{rows.push((await window.BDVault.request('/dictation?id='+encodeURIComponent(id))).dictation)}catch(e){rows.push({id,status:'error',error:e.message})}}
    const running=rows.filter(x=>x.status==='transcribing').length,saved=rows.filter(x=>x.status==='saved').length,errors=rows.filter(x=>x.status==='error');
    if(saved){for(const row of rows.filter(x=>x.status==='saved'))await window.BDVault.post('/dictation/transcribe',{id:row.id,language:'de',transcribe:true}).catch(()=>{});}
    const state=$('#docTranscribeState');if(state)state.textContent=errors.length?`${errors.length} Aufnahme(n) mit Fehler. Audio bleibt gespeichert.`:running||saved?`Whisper arbeitet lokal · ${rows.length-running-saved}/${rows.length} fertig`:'Transkription abgeschlossen.';
    if(errors.length){const button=$('#docTranscribeAll');if(button){button.disabled=false;button.textContent='Fehlerhafte Transkription erneut versuchen'}}
    const complete=rows.length&&rows.every(x=>['draft','accepted'].includes(x.status));
    if(complete){const transcript=rows.map((x,i)=>`[Aufnahme ${i+1}]\n${x.editedTranscript||x.originalTranscript||''}`.trim()).join('\n\n'),elapsed=workflowItem.transcriptionStartedAt?Math.max(1,(Date.now()-new Date(workflowItem.transcriptionStartedAt).getTime())/1000):0;workflowItem=await mark(workflowItem,'processing',{transcript,processingError:'',transcriptionSeconds:elapsed});clearWorkflowTimers();showStep('process');return true}
    return false;
  }
  function startTranscriptionWatcher(){showCloseSafe();if(workflowTimer)clearInterval(workflowTimer);refreshTranscriptions();workflowTimer=setInterval(()=>{if($('#documentationWorkflowDialog')?.open)refreshTranscriptions().catch(()=>{})},2500)}
  function bindProcess(){
    const ta=$('#docTranscript');let saveTimer=null;
    const saveTranscript=async()=>{if(!ta)return;workflowItem=await mark(workflowItem,workflowItem.status==='new'?'processing':workflowItem.status,{transcript:ta.value,aiDraft:null,clearAiDraft:true,clearAiStarted:true});const state=$('#docTranscriptSaveState');if(state)state.textContent='✓ gespeichert · Entwurf wird neu vorbereitet';workflowItem=await advanceLocalAutomation(workflowItem,workflowPayload).catch(()=>workflowItem)};
    ta?.addEventListener('input',()=>{const state=$('#docTranscriptSaveState');if(state)state.textContent='wird gespeichert …';clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveTranscript().catch(()=>{if(state)state.textContent='⚠ Speichern fehlgeschlagen'}),650)});
    $('#docProcessBack')?.addEventListener('click',()=>showStep('assign'));
    $('#docProcessNext')?.addEventListener('click',()=>showStep('review'));
    $('#docRetryAutomation')?.addEventListener('click',async()=>{workflowItem=await mark(workflowItem,'processing',{processingError:'',clearAiStarted:true});workflowItem=await advanceLocalAutomation(workflowItem,workflowPayload).catch(()=>workflowItem);showStep('process')});
    clearWorkflowTimers();workflowStartedAt=workflowItem.transcriptionStartedAt?new Date(workflowItem.transcriptionStartedAt).getTime():Date.now();workflowSecondsTimer=setInterval(()=>{const el=$('#docElapsed');if(el)el.textContent=`läuft seit ${Math.max(0,Math.floor((Date.now()-workflowStartedAt)/1000))} Sek.`},1000);workflowTimer=setInterval(async()=>{if(!$('#documentationWorkflowDialog')?.open)return;const latest=await advanceLocalAutomation(workflowItem,workflowPayload).catch(()=>workflowItem);if(latest&&String(latest.updatedAt)!==String(workflowItem.updatedAt)){workflowItem=latest;$('#docWorkflowState').textContent=workflowStatus(workflowItem);if(workflowItem.aiDraft){clearWorkflowTimers();showStep('review')}else showStep('process')}},3000);
  }

  function readDraftFromForm(){const get=k=>String(document.querySelector(`[data-draft="${k}"]`)?.value||'').trim();return{focus:get('focus'),dynamics:get('dynamics'),interventions:get('interventions').split(',').map(x=>x.trim()).filter(Boolean),response:get('response'),agreements:get('agreements'),nextFocus:get('nextFocus'),privatePrep:get('privatePrep'),uncertainties:get('uncertainties').split(/\n+/).map(x=>x.trim()).filter(Boolean)}}
  async function bestEffortCompleteCloudFlow(){
    try{const b=(dashboard().bookings||[]).find(x=>String(x.eventId)===String(workflowItem.sessionId));if(!b)return;const t=new Date().toISOString(),payload={bookingEventId:b.eventId,customerId:b.customerId||null,customerEmail:b.customerIdentityEmail||b.email,customerName:b.name,sessionStart:b.start,sessionEnd:b.end,state:'completed',notesSavedAt:t,completedAt:t,parkedAt:null,remindAt:null,eventType:'notes_saved'};await fetch(apiBase()+'/admin/flow/upsert',{method:'POST',headers:{Authorization:'Bearer '+sessionToken(),'Content-Type':'application/json'},body:JSON.stringify(payload)})}catch(_){}
  }
  function successView(){return `<section class="doc-work-card doc-success"><div class="doc-success-icon">✓</div><h3>Dokumentation abgeschlossen</h3><p>${esc(workflowItem.clientName||'Klient:in')}${workflowItem.sessionDate?' · '+esc(fmtDate(workflowItem.sessionDate)):''}</p><span>Protokoll und Originalquellen liegen sicher im lokalen Vault.</span><div class="dialog-actions"><button class="btn primary" id="docSuccessInbox" type="button">Zur Dokumentations-Inbox →</button><button class="btn secondary" id="docSuccessProtocol" type="button">Protokoll ansehen</button><button class="btn ghost" id="docSuccessClient" type="button">Klientenakte</button></div></section>`}
  function openClientAfterSuccess(tab='documentation'){$('#documentationWorkflowDialog')?.close();if(!workflowItem?.clientRef)return;window.BDAdminUX?.openClient?.(workflowItem.clientRef);setTimeout(()=>document.querySelector(`[data-record-tab="${tab}"]`)?.click(),180)}
  async function finalizeProtocol(){
    if(!workflowItem.sessionId||!workflowItem.sessionDate){showStep('assign');return}if(new Date(workflowItem.sessionDate+'T23:59:59').getTime()>Date.now()){alert('Für ein finales Protokoll bitte eine bereits stattgefundene Sitzung wählen.');showStep('assign');return}
    const btn=$('#docFinalizeProtocol');if(btn)btn.disabled=true;
    try{
      const d=readDraftFromForm(),booking=(dashboard().bookings||[]).find(x=>String(x.eventId)===String(workflowItem.sessionId)),duration=booking?.start&&booking?.end?Math.max(1,Math.round((new Date(booking.end)-new Date(booking.start))/60000)):0;
      const x=await window.BDVault.post('/documentation-inbox/finalize',{id:workflowItem.id,ref:workflowItem.clientRef,displayName:workflowItem.clientName,sessionId:workflowItem.sessionId,sessionDate:workflowItem.sessionDate,durationMinutes:duration,dictatedNote:workflowItem.transcript||'',draft:d});
      workflowItem=x.item||{...workflowItem,status:'done',aiDraft:d};await bestEffortCompleteCloudFlow();document.dispatchEvent(new CustomEvent('bd:documentation-inbox-updated',{detail:{item:workflowItem}}));setStepper('review');$('#docWorkflowBody').innerHTML=successView();$('#docSuccessProtocol').onclick=()=>openClientAfterSuccess('documentation');$('#docSuccessClient').onclick=()=>openClientAfterSuccess('overview');$('#docSuccessInbox').onclick=()=>{$('#documentationWorkflowDialog').close();document.querySelector('#documentationInboxList')?.scrollIntoView({behavior:'smooth',block:'start'})};renderInbox(false);
    }catch(e){alert(e.message);if(btn)btn.disabled=false}
  }
  function bindReview(){
    $('#docFinalizeProtocol')?.addEventListener('click',finalizeProtocol);$('#docReviewBack')?.addEventListener('click',()=>showStep('process'));$('#docReviewAssign')?.addEventListener('click',()=>showStep('assign'));$('#docReviewAssignFuture')?.addEventListener('click',()=>showStep('assign'));
    $('#docCompleteAttachment')?.addEventListener('click',async()=>{if(!workflowItem.assigned){showStep('assign');return}if(!confirm('Diese Quelle als Fallanlage abschließen?'))return;workflowItem=await mark(workflowItem,'done');setStepper('review');$('#docWorkflowBody').innerHTML=successView();$('#docSuccessProtocol')?.remove();$('#docSuccessClient').onclick=()=>openClientAfterSuccess('documentation');$('#docSuccessInbox').onclick=()=>{$('#documentationWorkflowDialog').close();document.querySelector('#documentationInboxList')?.scrollIntoView({behavior:'smooth',block:'start'})};renderInbox(false)});
  }
  async function openSession(item){if(!item?.clientRef)return;window.BDAdminUX?.openClient?.(item.clientRef);setTimeout(()=>document.querySelector('[data-record-tab="case-summary"]')?.click(),180)}
  function decorateFlowForDocumentation(){}
  function restoreFlowButton(){}


  async function createAccessPairing(){
    if(!await window.BDVault?.ensureUnlocked?.())return;if(!apiBase()||!sessionToken()){alert('Cloudflare-API oder Admin-Login ist nicht verfügbar.');return}
    const btn=$('#captureAccessPairBtn');if(btn)btn.disabled=true;
    try{
      const r=await fetch(apiBase()+'/capture-access/create',{method:'POST',headers:{Authorization:'Bearer '+sessionToken(),'Content-Type':'application/json'},body:'{}'}),x=await r.json();if(!r.ok||!x.ok)throw new Error(x.error||'Capture-Gerät konnte nicht gekoppelt werden.');
      const secret=randomSecret();await window.BDVault.post('/capture-access-pair',{pairId:x.pairId,ownerId:x.owner,secret});
      const url=x.captureUrl+'&key='+encodeURIComponent(secret)+'&owner='+encodeURIComponent(x.owner||'');
      const dlg=document.createElement('dialog');dlg.className='doc-pair-dialog';dlg.innerHTML=`<div class="doc-pair-shell"><button class="dialog-x" type="button">×</button><p class="eyebrow">Access Pairing</p><h2>Capture-Gerät koppeln</h2><div class="doc-pair-owner"><span>Praxis-Login</span><strong>${esc(x.owner||'')}</strong></div><p>Scanne diesen Code einmal mit Smartphone oder BOOX. Danach kann das Gerät Captures direkt an <strong>deine persönliche Dokumentations-Inbox</strong> senden – auch ohne Sitzungs-QR.</p><canvas id="docPairQr"></canvas><p class="micro muted">🔒 Dieses Pairing ist deinem aktuell angemeldeten Praxis-Login zugeordnet.</p><div class="dialog-actions"><button class="btn primary" type="button" id="docPairDone">Fertig</button></div></div>`;document.body.appendChild(dlg);dlg.querySelector('.dialog-x').onclick=()=>dlg.close();dlg.querySelector('#docPairDone').onclick=()=>dlg.close();dlg.addEventListener('close',()=>dlg.remove(),{once:true});dlg.showModal();
      try{const QR=await loadLocalQr();await QR.toCanvas(dlg.querySelector('#docPairQr'),url,{width:290,margin:2})}catch(error){dlg.querySelector('#docPairQr').hidden=true;const note=document.createElement('div');note.className='doc-warning';note.innerHTML='<strong>QR-Code konnte nicht erzeugt werden.</strong><br>Die lokale QR-Komponente wurde nicht geladen. Bitte einmal Strg+F5 ausführen. Der geheime Pairing-Link wird weiterhin nicht an externe Dienste gesendet.';dlg.querySelector('#docPairQr').after(note);console.error('BD local QR error',error)}
    }catch(e){alert(e.message)}finally{if(btn)btn.disabled=false}
  }

  function injectPairButton(){const actions=$('.workspace-head .head-actions');if(actions&&!$('#captureAccessPairBtn')){const b=document.createElement('button');b.className='btn ghost';b.id='captureAccessPairBtn';b.type='button';b.textContent='📱 Gerät verbinden';b.onclick=createAccessPairing;actions.prepend(b)}const inboxActions=$('.documentation-inbox-head .panel-head-actions');if(inboxActions&&!$('#captureAccessPairInboxBtn')){const b=document.createElement('button');b.className='btn ghost';b.id='captureAccessPairInboxBtn';b.type='button';b.textContent='Gerät verbinden';b.onclick=createAccessPairing;inboxActions.insertBefore(b,$('#documentationInboxRefresh'))}}

  function stampInboxCheck(){const t=$('#documentationInboxLastChecked');if(t)t.textContent='Zuletzt geprüft: '+new Date().toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'})}
  function bind(){
    injectPairButton();
    $('#documentationInboxRefresh')?.addEventListener('click',()=>{lastCloudCheck=0;const b=$('#documentationInboxRefresh');if(b)b.textContent='Prüfe …';syncPendingRelays({force:true}).finally(()=>{if(b)b.textContent='Neue Eingänge prüfen';stampInboxCheck()})});
    document.addEventListener('bd:vault-unlocked',()=>{lastCloudCheck=0;renderInbox(true).then(stampInboxCheck);ensureLocalAutomationLoop()});
    document.addEventListener('bd:documentation-inbox-updated',()=>renderInbox(false));
    window.addEventListener('online',()=>{lastCloudCheck=0;syncPendingRelays({force:true}).then(stampInboxCheck)});
    window.addEventListener('focus',()=>{if(Date.now()-lastCloudCheck>60000)syncPendingRelays({force:true}).finally(stampInboxCheck)});
    ensureLocalAutomationLoop();setTimeout(()=>renderInbox(true).then(stampInboxCheck),1100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  window.BDDocumentationInbox={refresh:()=>renderInbox(false),sync:()=>syncPendingRelays({force:true}),open:openWorkflow,pair:createAccessPairing};
})();
