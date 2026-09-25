(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const apiBase=()=>String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const sessionToken=()=>sessionStorage.getItem('bd_admin_session_v1')||'';
  const VAULT='http://127.0.0.1:47831';
  const fmt=x=>{try{return x?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x)):'—'}catch(_){return String(x||'—')}};
  const fmtDate=x=>{try{return x?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium'}).format(new Date(String(x).length===10?x+'T12:00:00':x)):'—'}catch(_){return String(x||'—')}};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const pendingKeys=()=>Object.keys(localStorage).filter(key=>key.startsWith('bd_capture_relay_'));
  let syncing=false,lastCloudCheck=0,workflowItem=null,workflowPayload=null,workflowTimer=null,workflowSecondsTimer=null,workflowStartedAt=0,activeHandoff=null;

  function b64bytes(value){let s=String(value||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const raw=atob(s),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
  function bytes64(bytes){let raw='';for(let i=0;i<bytes.length;i+=0x8000)raw+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(raw)}
  function randomSecret(){const bytes=crypto.getRandomValues(new Uint8Array(32));let raw='';bytes.forEach(x=>raw+=String.fromCharCode(x));return btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
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
    const stored=await window.BDVault.post('/artifact',{ref,displayName,filename,mime:'application/json',note:`BUILD 14.3.7 Capture-Quelle${sessionId?' für Session '+sessionId:''}`,dataBase64:bytes64(bytes)});artifactId=stored.id;
    const type=captureType(payload),label=type==='session'?'Sitzungsaufnahme':type==='dictation'?'Diktat':'Notiz / Anlage',pages=Array.isArray(payload.inkPages)?payload.inkPages.some(page=>(page.strokes||[]).length):!!(payload.strokes||[]).length;
    const saved=await window.BDVault.post('/documentation-inbox',{ref,displayName,captureId,sessionId,sessionDate,artifactId,captureType:type,status:'new',title:`${label}${assigned&&meta.displayName?' · '+meta.displayName:''}`,summary:captureSummary(payload),hasAudio:(payload.audio||[]).length>0,hasInk:pages,hasText:!!String(payload.noteText||'').trim(),hasPhotos:(payload.photos||[]).length>0,createdAt:payload.createdAt});
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

  function statusCopy(status){return({new:'Neu',processing:'In Bearbeitung',review:'Zur Prüfung',done:'Erledigt'}[status]||status)}
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
      const result=await window.BDVault.request('/documentation-inbox?status=open'),items=result.items||[],stats=inboxStats(items);count.textContent=String(items.length);
      let statsHost=$('#documentationInboxStats');if(!statsHost){$('#documentationInboxList').insertAdjacentHTML('beforebegin','<div class="doc-inbox-stats" id="documentationInboxStats"></div>');statsHost=$('#documentationInboxStats')}
      statsHost.innerHTML=`<span><b>${stats.new}</b> Neu</span><span><b>${stats.processing}</b> In Bearbeitung</span><span class="review"><b>${stats.review}</b> Zur Prüfung</span>`;
      if(!items.length){host.innerHTML='<div class="doc-inbox-empty"><strong>Alles verarbeitet.</strong><span>Neue Diktate, Sitzungsaufnahmen oder handschriftliche Capture-Notizen erscheinen hier.</span></div>';updateRelayHint();return}
      host.innerHTML=items.slice(0,12).map(item=>`<article class="doc-inbox-row" data-doc-item="${esc(item.id)}"><div class="doc-inbox-icon">${typeIcon(item)}</div><div class="doc-inbox-main"><div class="doc-inbox-title"><strong>${esc(item.title||'Capture-Eingang')}</strong><span class="doc-inbox-state ${esc(item.status)}">${esc(statusCopy(item.status))}</span>${!item.assigned?'<span class="doc-inbox-state assignment">Zuordnung nötig</span>':''}</div><p>${esc(item.summary||'Capture-Quelle')}${item.sessionDate?' · Sitzung '+esc(fmtDate(item.sessionDate)):''}</p><div class="doc-inbox-tags">${sourceTags(item)}<span>${esc(fmt(item.receivedAt))}</span></div></div><div class="doc-inbox-actions"><button class="btn primary" type="button" data-doc-open="${esc(item.id)}">${!item.assigned?'Zuordnen':item.status==='review'?'Prüfen':'Weiter'}</button>${item.sessionId?`<button class="btn ghost" type="button" data-doc-session="${esc(item.id)}">Sitzung öffnen</button>`:''}</div></article>`).join('');
      host.querySelectorAll('[data-doc-open]').forEach(button=>button.onclick=()=>openWorkflow(items.find(x=>String(x.id)===button.dataset.docOpen)));
      host.querySelectorAll('[data-doc-session]').forEach(button=>button.onclick=()=>openSession(items.find(x=>String(x.id)===button.dataset.docSession)));
      updateRelayHint();
    }catch(error){host.innerHTML=`<div class="doc-inbox-empty error"><strong>Inbox konnte nicht geladen werden.</strong><span>${esc(error.message)}</span></div>`}
  }

  async function mark(item,status,extra={}){if(!item)return null;const x=await window.BDVault.post('/documentation-inbox/update',{id:item.id,status,...extra});document.dispatchEvent(new CustomEvent('bd:documentation-inbox-updated',{detail:{item:x.item}}));return x.item}
  function dashboard(){return window.BDAdminUX?.getData?.()||{}}
  function customerOptions(selected=''){const seen=new Map();(dashboard().customers||[]).forEach(c=>{const ref=String(c.customerIdentityEmail||c.email||'').trim();if(ref&&!seen.has(ref.toLowerCase()))seen.set(ref.toLowerCase(),{ref,name:c.name||c.displayName||ref})});(dashboard().bookings||[]).forEach(b=>{const ref=String(b.customerIdentityEmail||b.email||'').trim();if(ref&&!seen.has(ref.toLowerCase()))seen.set(ref.toLowerCase(),{ref,name:b.name||ref})});return [...seen.values()].sort((a,b)=>a.name.localeCompare(b.name,'de')).map(c=>`<option value="${esc(c.ref)}" ${c.ref===selected?'selected':''}>${esc(c.name)} · ${esc(c.ref)}</option>`).join('')}
  function bookingOptions(ref,selected=''){const key=String(ref||'').trim().toLowerCase(),rows=(dashboard().bookings||[]).filter(b=>String(b.customerIdentityEmail||b.email||'').trim().toLowerCase()===key).sort((a,b)=>new Date(b.start)-new Date(a.start));return '<option value="">Nur der Klient:innenakte zuordnen</option>'+rows.map(b=>`<option value="${esc(b.eventId)}" data-date="${esc(String(b.start||'').slice(0,10))}" ${String(b.eventId)===String(selected)?'selected':''}>${esc(fmt(b.start))} · ${esc(b.typeLabel||'Sitzung')}</option>`).join('')}

  function ensureWorkflow(){
    if($('#documentationWorkflowDialog'))return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="documentationWorkflowDialog" class="doc-workflow-dialog"><div class="doc-workflow-shell"><button class="dialog-x" id="docWorkflowClose" type="button">×</button><div class="doc-workflow-top"><div><p class="eyebrow">Dokumentationsprozess</p><h2 id="docWorkflowTitle">Capture verarbeiten</h2><p class="muted" id="docWorkflowSub"></p></div><span class="doc-workflow-state" id="docWorkflowState"></span></div><nav class="doc-stepper" id="docStepper"><button data-doc-step="source">1 <span>Eingang</span></button><button data-doc-step="assign">2 <span>Zuordnen</span></button><button data-doc-step="process">3 <span>Verarbeiten</span></button><button data-doc-step="draft">4 <span>Protokoll</span></button><button data-doc-step="review">5 <span>Prüfen</span></button></nav><div id="docWorkflowBody"></div></div></dialog>`);
    $('#docWorkflowClose').onclick=()=>$('#documentationWorkflowDialog').close();
    $('#documentationWorkflowDialog').addEventListener('close',()=>{clearWorkflowTimers();workflowItem=null;workflowPayload=null});
    $('#docStepper').addEventListener('click',e=>{const b=e.target.closest('[data-doc-step]');if(b)showStep(b.dataset.docStep)});
  }
  function clearWorkflowTimers(){if(workflowTimer)clearInterval(workflowTimer);if(workflowSecondsTimer)clearInterval(workflowSecondsTimer);workflowTimer=workflowSecondsTimer=null}
  function stepState(item){if(!item?.assigned)return'assign';if(item.aiDraft)return'review';if(item.transcript||(!item.hasAudio&&(item.hasText||item.hasInk)))return'draft';if(item.hasAudio)return'process';return'review'}
  function setStepper(active){const order=['source','assign','process','draft','review'],current=order.indexOf(active);$('#docStepper')?.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===current);b.classList.toggle('done',i<current)})}
  function workflowStatus(item){return `${statusCopy(item.status)}${item.assigned?' · zugeordnet':' · noch nicht zugeordnet'}`}

  async function openWorkflow(item){
    if(!item)return;if(!await window.BDVault.ensureUnlocked())return;
    ensureWorkflow();clearWorkflowTimers();
    const latest=(await window.BDVault.request('/documentation-inbox?status=all')).items.find(x=>String(x.id)===String(item.id))||item;workflowItem=latest;
    try{workflowPayload=await loadArtifactPayload(latest.artifactId)}catch(_){workflowPayload={}}
    $('#docWorkflowTitle').textContent=latest.title||'Capture verarbeiten';$('#docWorkflowSub').textContent=`${latest.summary||'Capture-Quelle'} · eingegangen ${fmt(latest.receivedAt)}`;$('#docWorkflowState').textContent=workflowStatus(latest);
    $('#documentationWorkflowDialog').showModal();showStep(stepState(latest));
  }

  function sourcePreview(){
    const p=workflowPayload||{},audio=(p.audio||[]).length,pages=Array.isArray(p.inkPages)?p.inkPages.filter(x=>(x.strokes||[]).length).length:((p.strokes||[]).length?1:0),photos=(p.photos||[]).length,text=String(p.noteText||'').trim();
    return `<section class="doc-work-card"><div class="doc-source-grid"><div><span>Typ</span><strong>${esc(workflowItem.captureType==='session'?'Sitzungsaufnahme':workflowItem.captureType==='dictation'?'Diktat':'Notiz / Anlage')}</strong></div><div><span>Eingang</span><strong>${esc(fmt(workflowItem.receivedAt))}</strong></div><div><span>Audio</span><strong>${audio}</strong></div><div><span>Handschrift</span><strong>${pages} Seite${pages===1?'':'n'}</strong></div></div>${text?`<div class="doc-note-preview"><strong>Textnotiz</strong><p>${esc(text)}</p></div>`:''}${photos?`<p class="muted micro">Zusätzlich ${photos} Foto${photos===1?'':'s'} in der Originalquelle.</p>`:''}<div class="doc-safe-note"><strong>✓ Originalquelle sicher im lokalen Vault.</strong><span>Die Inbox steuert nur die Bearbeitung; die Quelle selbst bleibt als Artefakt erhalten.</span></div><div class="dialog-actions"><button class="btn primary" data-doc-next="assign">Weiter zur Zuordnung →</button></div></section>`
  }

  function assignView(){
    return `<section class="doc-work-card"><div class="doc-section-head"><div><p class="eyebrow">Schritt 2</p><h3>Klient:in und Sitzung zuordnen</h3></div>${workflowItem.assigned?'<span class="doc-ok">✓ bereits zugeordnet</span>':''}</div><p class="muted">Ein allgemeiner Capture darf zuerst in deiner persönlichen Inbox landen. Die konkrete Sitzung kannst du hier nachträglich wählen.</p><label>Klient:in<select id="docAssignClient"><option value="">Bitte auswählen …</option>${customerOptions(workflowItem.clientRef||'')}</select></label><label>Sitzung <span class="micro muted">optional</span><select id="docAssignSession"></select></label><div class="doc-assignment-current" id="docAssignmentCurrent"></div><div class="dialog-actions"><button class="btn ghost" data-doc-next="source">← Eingang</button><button class="btn primary" id="docAssignSave" type="button">Zuordnung speichern & weiter</button></div></section>`
  }

  function processView(){
    const ids=workflowItem.dictationIds||[],hasTranscript=!!String(workflowItem.transcript||'').trim();
    return `<section class="doc-work-card"><div class="doc-section-head"><div><p class="eyebrow">Schritt 3</p><h3>Quellen verarbeiten</h3></div></div>${workflowItem.hasAudio?`<div class="doc-processing-box"><strong>🎙 Audio → lokales Whisper</strong><p id="docTranscribeState">${hasTranscript?'Transkript vorhanden.':ids.length?'Whisper-Auftrag vorhanden. Status wird geprüft …':'Die Audioquelle ist bereit zur lokalen Transkription.'}</p><div class="doc-close-safe" id="docCloseSafe" ${ids.length&&!hasTranscript?'':'hidden'}><strong>Du darfst dieses Fenster und das CRM schließen.</strong><span>Whisper läuft im lokalen Vault weiter, solange der Computer und der Vault-Dienst laufen. Wird der Computer ausgeschaltet, bleibt das Audio gespeichert und kann später fortgesetzt werden.</span><span class="doc-elapsed" id="docElapsed"></span></div><button class="btn primary" id="docTranscribeAll" type="button">${ids.length?'Status prüfen / fortsetzen':'Alle Audios lokal transkribieren'}</button></div>`:'<div class="doc-safe-note"><strong>Keine Audioquelle.</strong><span>Handschrift, Text oder Fotos können als Anlage erhalten bleiben und – sofern Text vorhanden ist – in den Protokollentwurf einfließen.</span></div>'}<label class="doc-transcript-label" ${hasTranscript?'':'hidden'} id="docTranscriptWrap">Transkript<textarea id="docTranscript" rows="11"></textarea></label><div class="dialog-actions"><button class="btn ghost" data-doc-next="assign">← Zuordnung</button><button class="btn ghost" id="docTranscriptSave" type="button" ${hasTranscript?'':'hidden'}>Transkript speichern</button><button class="btn primary" id="docProcessNext" type="button" ${workflowItem.hasAudio&&!hasTranscript?'disabled':''}>Weiter zum Protokoll →</button></div></section>`
  }

  function draftFields(draft){draft=draft||{};const interventions=Array.isArray(draft.interventions)?draft.interventions.join(', '):'';return `<div class="doc-draft-grid"><label>Fokus<textarea data-draft="focus" rows="2">${esc(draft.focus||'')}</textarea></label><label>Dynamik / relevante Beobachtungen<textarea data-draft="dynamics" rows="3">${esc(draft.dynamics||'')}</textarea></label><label>Interventionen<textarea data-draft="interventions" rows="2">${esc(interventions)}</textarea></label><label>Reaktion / Verlauf<textarea data-draft="response" rows="3">${esc(draft.response||'')}</textarea></label><label>Vereinbarungen<textarea data-draft="agreements" rows="2">${esc(draft.agreements||'')}</textarea></label><label>Nächster Fokus<textarea data-draft="nextFocus" rows="2">${esc(draft.nextFocus||'')}</textarea></label><label>Interne Vorbereitung<textarea data-draft="privatePrep" rows="2">${esc(draft.privatePrep||'')}</textarea></label><label>Unsicherheiten / prüfen<textarea data-draft="uncertainties" rows="2">${esc(Array.isArray(draft.uncertainties)?draft.uncertainties.join('\n'):draft.uncertainties||'')}</textarea></label></div>`}
  function draftView(){
    const raw=[workflowItem.transcript,String(workflowPayload?.noteText||'').trim()].filter(Boolean).join('\n\n');
    return `<section class="doc-work-card"><div class="doc-section-head"><div><p class="eyebrow">Schritt 4</p><h3>Protokollentwurf</h3></div>${workflowItem.aiDraft?'<span class="doc-ok">✓ KI-Entwurf vorhanden</span>':''}</div><p class="muted">Der lokale KI-Entwurf verwendet ausschließlich das Transkript bzw. vorhandene Textnotizen. Er bleibt ein Entwurf und muss fachlich geprüft werden.</p>${!workflowItem.assigned?'<div class="doc-warning">Bitte zuerst einer Klient:innenakte zuordnen.</div>':''}${raw?'<details class="doc-source-text"><summary>Verwendete Rohnotizen / Transkript anzeigen</summary><pre>'+esc(raw)+'</pre></details>':'<div class="doc-warning">Noch kein maschinenlesbarer Text vorhanden. Handschrift bleibt als Anlage erhalten; für einen KI-Entwurf braucht es Text oder ein Transkript.</div>'}<div id="docAiState"></div>${workflowItem.aiDraft?draftFields(workflowItem.aiDraft):''}<div class="dialog-actions"><button class="btn ghost" data-doc-next="process">← Verarbeitung</button>${workflowItem.aiDraft?'<button class="btn ghost" id="docDraftSave" type="button">Entwurf speichern</button>':''}<button class="btn primary" id="docAiStart" type="button" ${(!workflowItem.assigned||!raw||workflowItem.aiDraft)?'disabled':''}>✨ Protokollentwurf lokal erstellen</button><button class="btn primary" id="docDraftNext" type="button" ${workflowItem.aiDraft?'':'disabled'}>Weiter zur Prüfung →</button></div></section>`
  }
  function reviewView(){
    const draft=workflowItem.aiDraft;
    return `<section class="doc-work-card"><div class="doc-section-head"><div><p class="eyebrow">Schritt 5</p><h3>Prüfen & abschließen</h3></div><span class="doc-workflow-final">Menschliche Freigabe</span></div>${draft?`<div class="doc-review-summary"><strong>KI-Entwurf ist vorbereitet.</strong><span>Öffne den Session Flow, prüfe jedes Feld und speichere erst danach als finale Sitzungsdokumentation.</span></div>`:'<div class="doc-review-summary"><strong>Quelle als Anlage abschließen.</strong><span>Wenn kein Protokollentwurf benötigt wird, kann die Quelle nach der Zuordnung als Fallanlage abgeschlossen werden.</span></div>'}<div class="doc-review-meta"><span>Klient:in <b>${esc(workflowItem.clientName||'—')}</b></span><span>Sitzung <b>${esc(workflowItem.sessionDate?fmtDate(workflowItem.sessionDate):'nicht gewählt')}</b></span></div><div class="dialog-actions"><button class="btn ghost" data-doc-next="draft">← Protokoll</button>${workflowItem.sessionId&&draft?'<button class="btn primary" id="docOpenSessionReview" type="button">Session Flow öffnen · prüfen & abschließen →</button>':'<button class="btn primary" id="docCompleteAttachment" type="button">Als Anlage abschließen</button>'}</div></section>`
  }

  function showStep(step){
    if(!workflowItem)return;setStepper(step);const body=$('#docWorkflowBody');
    body.innerHTML=step==='source'?sourcePreview():step==='assign'?assignView():step==='process'?processView():step==='draft'?draftView():reviewView();
    body.querySelectorAll('[data-doc-next]').forEach(b=>b.onclick=()=>showStep(b.dataset.docNext));
    if(step==='assign')bindAssign();if(step==='process')bindProcess();if(step==='draft')bindDraft();if(step==='review')bindReview();
  }

  function bindAssign(){
    const client=$('#docAssignClient'),session=$('#docAssignSession');
    const hydrate=()=>{session.innerHTML=bookingOptions(client.value,client.value===workflowItem.clientRef?workflowItem.sessionId:'');const c=[...client.options].find(o=>o.value===client.value);$('#docAssignmentCurrent').innerHTML=client.value?`<strong>${esc(c?.textContent||client.value)}</strong><span>${session.value?'Direkte Sitzung gewählt':'Nur Fallzuordnung; Sitzung kann später gewählt werden.'}</span>`:'<span>Noch keine Zuordnung.</span>'};client.onchange=hydrate;session.onchange=hydrate;hydrate();
    $('#docAssignSave').onclick=async()=>{const ref=client.value;if(!ref){alert('Bitte zuerst eine Klientin oder einen Klienten auswählen.');return}const c=[...client.options].find(o=>o.value===ref),name=(c?.textContent||ref).split(' · ')[0],opt=session.selectedOptions[0],sessionId=session.value,sessionDate=sessionId?String(opt?.dataset.date||''):'';const b=$('#docAssignSave');b.disabled=true;try{workflowItem=await mark(workflowItem,workflowItem.status==='new'?'processing':workflowItem.status,{ref,displayName:name,sessionId,sessionDate});$('#docWorkflowState').textContent=workflowStatus(workflowItem);showStep(workflowItem.hasAudio&&!workflowItem.transcript?'process':workflowItem.aiDraft?'review':'draft')}catch(e){alert(e.message)}finally{b.disabled=false}};
  }

  async function startAllTranscriptions(){
    if(!workflowPayload?.audio?.length)return;
    const button=$('#docTranscribeAll');button.disabled=true;const ids=[...(workflowItem.dictationIds||[])];
    try{
      for(let index=0;index<workflowPayload.audio.length;index++){
        if(ids[index])continue;const item=workflowPayload.audio[index];$('#docTranscribeState').textContent=`Audio ${index+1}/${workflowPayload.audio.length} wird verschlüsselt in den lokalen Vault übernommen …`;
        const created=await window.BDVault.post('/dictation/start',{origin:workflowItem.sessionId?'session':'case',ref:workflowItem.clientRef||'',displayName:workflowItem.clientName||'',targetSessionId:workflowItem.sessionId||'',sessionDate:workflowItem.sessionDate||String(workflowPayload.createdAt||new Date().toISOString()).slice(0,10),durationMinutes:Math.ceil(Number(item.durationSeconds||0)/60),contextLabel:`Dokumentations-Inbox · Aufnahme ${index+1} · ${workflowItem.captureId}`,language:'de'});const id=created.dictation.id,raw=b64bytes(item.dataBase64),partSize=2*1024*1024;
        for(let offset=0,sequence=0;offset<raw.length;offset+=partSize,sequence++){const part=raw.subarray(offset,Math.min(raw.length,offset+partSize));$('#docTranscribeState').textContent=`Audio ${index+1}: lokales Speichern · Abschnitt ${sequence+1}`;await window.BDVault.post('/dictation/chunk',{id,sequence,mime:item.mime||'audio/webm',dataBase64:bytes64(part)})}
        await window.BDVault.post('/dictation/finalize',{id,language:'de',transcribe:true});ids[index]=id;
      }
      workflowStartedAt=Date.now();workflowItem=await mark(workflowItem,'processing',{dictationIds:ids,transcriptionStartedAt:new Date().toISOString(),processingError:''});showCloseSafe();startTranscriptionWatcher();
    }catch(e){$('#docTranscribeState').textContent=e.message;button.disabled=false}
  }
  function showCloseSafe(){const box=$('#docCloseSafe');if(box)box.hidden=false;if(!workflowStartedAt)workflowStartedAt=workflowItem.transcriptionStartedAt?new Date(workflowItem.transcriptionStartedAt).getTime():Date.now();if(workflowSecondsTimer)clearInterval(workflowSecondsTimer);const update=()=>{const el=$('#docElapsed');if(el)el.textContent=`Läuft seit ${Math.max(0,Math.floor((Date.now()-workflowStartedAt)/1000))} Sekunden.`};update();workflowSecondsTimer=setInterval(update,1000)}
  async function refreshTranscriptions(){
    const ids=workflowItem.dictationIds||[];if(!ids.length)return false;const rows=[];for(const id of ids){try{rows.push((await window.BDVault.request('/dictation?id='+encodeURIComponent(id))).dictation)}catch(e){rows.push({id,status:'error',error:e.message})}}
    const running=rows.filter(x=>x.status==='transcribing').length,saved=rows.filter(x=>x.status==='saved').length,errors=rows.filter(x=>x.status==='error');
    if(saved){for(const row of rows.filter(x=>x.status==='saved'))await window.BDVault.post('/dictation/transcribe',{id:row.id,language:'de',transcribe:true}).catch(()=>{});}
    const state=$('#docTranscribeState');if(state)state.textContent=errors.length?`${errors.length} Aufnahme(n) mit Fehler. Audio bleibt gespeichert.`:running||saved?`Whisper arbeitet lokal · ${rows.length-running-saved}/${rows.length} fertig`:'Transkription abgeschlossen.';
    if(errors.length){const button=$('#docTranscribeAll');if(button){button.disabled=false;button.textContent='Fehlerhafte Transkription erneut versuchen'}}
    const complete=rows.length&&rows.every(x=>['draft','accepted'].includes(x.status));
    if(complete){const transcript=rows.map((x,i)=>`[Aufnahme ${i+1}]\n${x.editedTranscript||x.originalTranscript||''}`.trim()).join('\n\n');workflowItem=await mark(workflowItem,'review',{transcript,processingError:''});if(workflowTimer)clearInterval(workflowTimer);if(workflowSecondsTimer)clearInterval(workflowSecondsTimer);workflowTimer=workflowSecondsTimer=null;showStep('process');return true}
    return false;
  }
  function startTranscriptionWatcher(){showCloseSafe();if(workflowTimer)clearInterval(workflowTimer);refreshTranscriptions();workflowTimer=setInterval(()=>{if($('#documentationWorkflowDialog')?.open)refreshTranscriptions().catch(()=>{})},2500)}
  function bindProcess(){
    const ta=$('#docTranscript');if(ta)ta.value=workflowItem.transcript||'';
    $('#docTranscribeAll')?.addEventListener('click',()=>workflowItem.dictationIds?.length?startTranscriptionWatcher():startAllTranscriptions());
    $('#docTranscriptSave')?.addEventListener('click',async()=>{workflowItem=await mark(workflowItem,'review',{transcript:ta.value});$('#docTranscribeState').textContent='Transkript gespeichert.'});
    $('#docProcessNext')?.addEventListener('click',()=>showStep('draft'));
    if(workflowItem.dictationIds?.length&&!workflowItem.transcript)startTranscriptionWatcher();
  }

  function readDraftFromForm(){const get=k=>String(document.querySelector(`[data-draft="${k}"]`)?.value||'').trim();return{focus:get('focus'),dynamics:get('dynamics'),interventions:get('interventions').split(',').map(x=>x.trim()).filter(Boolean),response:get('response'),agreements:get('agreements'),nextFocus:get('nextFocus'),privatePrep:get('privatePrep'),uncertainties:get('uncertainties').split(/\n+/).map(x=>x.trim()).filter(Boolean)}}
  async function refreshAi(){const items=(await window.BDVault.request('/documentation-inbox?status=all')).items||[],latest=items.find(x=>String(x.id)===String(workflowItem.id));if(!latest)return;if(latest.aiDraft){workflowItem=latest;if(workflowTimer)clearInterval(workflowTimer);if(workflowSecondsTimer)clearInterval(workflowSecondsTimer);workflowTimer=workflowSecondsTimer=null;showStep('draft')}else{workflowItem=latest;const host=$('#docAiState');if(host)host.innerHTML=latest.processingError?`<div class="doc-warning">${esc(latest.processingError)}</div>`:`<div class="doc-close-safe"><strong>Lokale KI arbeitet …</strong><span>Du darfst dieses Fenster schließen. Der Auftrag läuft im lokalen Vault weiter, solange Computer und Vault-Dienst laufen.</span><span class="doc-elapsed" id="docElapsed"></span></div>`}}
  function startAiWatcher(){if(workflowTimer)clearInterval(workflowTimer);workflowStartedAt=workflowItem.aiStartedAt?new Date(workflowItem.aiStartedAt).getTime():Date.now();if(workflowSecondsTimer)clearInterval(workflowSecondsTimer);workflowSecondsTimer=setInterval(()=>{const el=$('#docElapsed');if(el)el.textContent=`Läuft seit ${Math.floor((Date.now()-workflowStartedAt)/1000)} Sekunden.`},1000);workflowTimer=setInterval(()=>{if($('#documentationWorkflowDialog')?.open)refreshAi().catch(()=>{})},3000)}
  function bindDraft(){
    $('#docDraftSave')?.addEventListener('click',async()=>{workflowItem=await mark(workflowItem,'review',{aiDraft:readDraftFromForm()});$('#docAiState').innerHTML='<div class="doc-ok">✓ Entwurf gespeichert.</div>'});
    $('#docAiStart')?.addEventListener('click',async()=>{const raw=[workflowItem.transcript,String(workflowPayload?.noteText||'').trim()].filter(Boolean).join('\n\n');const btn=$('#docAiStart');btn.disabled=true;try{const x=await window.BDVault.post('/documentation-inbox/ai-start',{id:workflowItem.id,rawNotes:raw});workflowItem={...workflowItem,status:'processing',aiStartedAt:x.startedAt};$('#docAiState').innerHTML='<div class="doc-close-safe"><strong>Lokale KI erstellt den Protokollentwurf.</strong><span>Du darfst dieses Fenster und das CRM schließen. Der Vault speichert das Ergebnis in der Dokumentations-Inbox.</span><span class="doc-elapsed" id="docElapsed"></span></div>';startAiWatcher()}catch(e){$('#docAiState').innerHTML=`<div class="doc-warning">${esc(e.message)}</div>`;btn.disabled=false}});
    $('#docDraftNext')?.addEventListener('click',async()=>{try{if($('#docDraftSave'))workflowItem=await mark(workflowItem,'review',{aiDraft:readDraftFromForm()});showStep('review')}catch(e){alert(e.message)}});
    if(workflowItem.aiStartedAt&&!workflowItem.aiDraft&&workflowItem.status==='processing')startAiWatcher();
  }

  async function handoffToSession(){
    if(!workflowItem.sessionId||!workflowItem.clientRef||!workflowItem.aiDraft)return;const d=workflowItem.aiDraft;
    await window.BDVault.post('/session-draft',{id:workflowItem.sessionId,ref:workflowItem.clientRef,displayName:workflowItem.clientName,date:workflowItem.sessionDate||new Date().toISOString().slice(0,10),dictatedNote:workflowItem.transcript||'',focus:d.focus||'',dynamics:d.dynamics||'',interventions:Array.isArray(d.interventions)?d.interventions:[],response:d.response||'',agreements:d.agreements||'',nextFocus:d.nextFocus||'',privatePrep:d.privatePrep||''});
    activeHandoff={id:workflowItem.id,sessionId:workflowItem.sessionId,clientRef:workflowItem.clientRef};$('#documentationWorkflowDialog').close();
    if(window.BDFlowManager?.openFlow){window.BDFlowManager.openFlow(workflowItem.sessionId);setTimeout(()=>{window.BDFlowManager?.setFlowTab?.('post');decorateFlowForDocumentation()},400)}else alert('Session Flow ist noch nicht bereit.');
  }
  function decorateFlowForDocumentation(){if(!activeHandoff)return;const pane=$('#flowPanePost'),save=$('#flowSaveNotes');if(!pane||!save)return;pane.querySelector('.doc-flow-handoff')?.remove();pane.insertAdjacentHTML('afterbegin','<div class="doc-flow-handoff"><strong>📥 Dokumentations-Inbox → finale Prüfung</strong><span>Transkript und KI-Entwurf wurden als lokaler Sitzungsentwurf übernommen. Bitte fachlich prüfen und erst dann abschließen.</span></div>');save.dataset.originalLabel=save.dataset.originalLabel||save.textContent;save.textContent='✓ Geprüft speichern & Dokumentation abschließen'}
  function restoreFlowButton(){const save=$('#flowSaveNotes');if(save?.dataset.originalLabel){save.textContent=save.dataset.originalLabel;delete save.dataset.originalLabel}document.querySelector('.doc-flow-handoff')?.remove()}
  function bindReview(){
    $('#docOpenSessionReview')?.addEventListener('click',()=>handoffToSession().catch(e=>alert(e.message)));
    $('#docCompleteAttachment')?.addEventListener('click',async()=>{if(!workflowItem.assigned){alert('Bitte zuerst einer Klient:innenakte zuordnen.');showStep('assign');return}if(!confirm('Diesen Eingang als verarbeitet abschließen? Die Originalquelle bleibt im lokalen Vault erhalten.'))return;workflowItem=await mark(workflowItem,'done');$('#documentationWorkflowDialog').close();renderInbox(false)});
  }
  async function openSession(item){if(!item?.sessionId)return;if(window.BDFlowManager?.openFlow)window.BDFlowManager.openFlow(item.sessionId);else alert('Session Flow ist noch nicht bereit.')}

  async function createAccessPairing(){
    if(!await window.BDVault?.ensureUnlocked?.())return;if(!apiBase()||!sessionToken()){alert('Cloudflare-API oder Admin-Login ist nicht verfügbar.');return}
    const btn=$('#captureAccessPairBtn');if(btn)btn.disabled=true;
    try{
      const r=await fetch(apiBase()+'/capture-access/create',{method:'POST',headers:{Authorization:'Bearer '+sessionToken(),'Content-Type':'application/json'},body:'{}'}),x=await r.json();if(!r.ok||!x.ok)throw new Error(x.error||'Capture-Gerät konnte nicht gekoppelt werden.');
      const secret=randomSecret();await window.BDVault.post('/capture-access-pair',{pairId:x.pairId,ownerId:x.owner,secret});
      const url=x.captureUrl+'&key='+encodeURIComponent(secret)+'&owner='+encodeURIComponent(x.owner||'');
      const dlg=document.createElement('dialog');dlg.className='doc-pair-dialog';dlg.innerHTML=`<div class="doc-pair-shell"><button class="dialog-x" type="button">×</button><p class="eyebrow">Access Pairing</p><h2>Capture-Gerät koppeln</h2><div class="doc-pair-owner"><span>Praxis-Login</span><strong>${esc(x.owner||'')}</strong></div><p>Scanne diesen Code einmal mit Smartphone oder BOOX. Danach kann das Gerät Captures direkt an <strong>deine persönliche Dokumentations-Inbox</strong> senden – auch ohne Sitzungs-QR.</p><canvas id="docPairQr"></canvas><img id="docPairQrImg" alt="QR-Code" hidden><p class="micro muted">Das Pairing ist an diesen angemeldeten Praxis-Login gebunden. Eine spätere Partnerin erhält mit ihrem Login eine eigene Inbox und eigene Pairings.</p><div class="dialog-actions"><button class="btn primary" type="button" id="docPairDone">Fertig</button></div></div>`;document.body.appendChild(dlg);dlg.querySelector('.dialog-x').onclick=()=>dlg.close();dlg.querySelector('#docPairDone').onclick=()=>dlg.close();dlg.addEventListener('close',()=>dlg.remove(),{once:true});dlg.showModal();
      try{if(!window.QRCode){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}await window.QRCode.toCanvas(dlg.querySelector('#docPairQr'),url,{width:290,margin:2})}catch(_){dlg.querySelector('#docPairQr').hidden=true;dlg.querySelector('#docPairQrImg').hidden=true;const note=document.createElement('div');note.className='doc-warning';note.innerHTML='<strong>QR-Code konnte lokal nicht erzeugt werden.</strong><br>Aus Sicherheitsgründen wird der geheime Pairing-Link nicht an einen externen QR-Dienst gesendet. Bitte Seite neu laden und erneut versuchen.';dlg.querySelector('#docPairQrImg').after(note)}
    }catch(e){alert(e.message)}finally{if(btn)btn.disabled=false}
  }

  function injectPairButton(){const actions=$('.workspace-head .head-actions');if(actions&&!$('#captureAccessPairBtn')){const b=document.createElement('button');b.className='btn ghost';b.id='captureAccessPairBtn';b.type='button';b.textContent='📱 Capture-Gerät koppeln';b.onclick=createAccessPairing;actions.prepend(b)}const inboxActions=$('.documentation-inbox-head .panel-head-actions');if(inboxActions&&!$('#captureAccessPairInboxBtn')){const b=document.createElement('button');b.className='btn ghost';b.id='captureAccessPairInboxBtn';b.type='button';b.textContent='Gerät koppeln';b.onclick=createAccessPairing;inboxActions.insertBefore(b,$('#documentationInboxRefresh'))}}

  function bind(){
    injectPairButton();
    $('#documentationInboxRefresh')?.addEventListener('click',()=>{lastCloudCheck=0;renderInbox(false).then(()=>syncPendingRelays({force:true}))});
    document.addEventListener('bd:vault-unlocked',()=>{lastCloudCheck=0;renderInbox(true)});
    document.addEventListener('bd:documentation-inbox-updated',()=>renderInbox(false));
    document.addEventListener('bd:flow-opened',()=>setTimeout(decorateFlowForDocumentation,80));
    document.addEventListener('bd:session-saved',async()=>{if(!activeHandoff)return;try{const all=(await window.BDVault.request('/documentation-inbox?status=all')).items||[],item=all.find(x=>String(x.id)===String(activeHandoff.id));if(item)await mark(item,'done')}catch(e){}finally{activeHandoff=null;restoreFlowButton();renderInbox(false)}});
    window.addEventListener('online',()=>{lastCloudCheck=0;syncPendingRelays({force:true})});
    setTimeout(()=>renderInbox(true),1100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  window.BDDocumentationInbox={refresh:()=>renderInbox(false),sync:()=>syncPendingRelays({force:true}),open:openWorkflow,pair:createAccessPairing};
})();
