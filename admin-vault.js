(function(){
  'use strict';
  const VAULT='http://127.0.0.1:47831';
  const TOKEN_KEY='bd_vault_token_v1';
  let token=sessionStorage.getItem(TOKEN_KEY)||'';
  let health={ok:false,setup:false,unlocked:false};
  let current={email:'',name:'',payload:null};
  let latestCloudSnapshot=null;
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=x=>x?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x)):'—';
  const fmtDate=x=>x?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium'}).format(new Date(String(x).length===10?x+'T12:00:00':x)):'—';

  function toast(text,kind='ok',target='#vaultViewMsg'){
    const el=$(target); if(!el)return; el.className='notice '+(kind==='err'?'err':'ok'); el.textContent=text;
  }
  async function request(path,opts={}){
    const headers={...(opts.headers||{})}; if(token)headers.Authorization='Bearer '+token;
    const r=await fetch(VAULT+path,{...opts,headers});
    const ct=r.headers.get('content-type')||''; const body=ct.includes('application/json')?await r.json():await r.blob();
    if(r.status===401){token='';sessionStorage.removeItem(TOKEN_KEY);health.unlocked=false;updateStatus()}
    if(!r.ok||body?.ok===false)throw new Error(body?.error||'Vault-Anfrage fehlgeschlagen');
    return body;
  }
  async function post(path,body){return request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
  async function del(path){return request(path,{method:'DELETE'})}

  function updateStatus(){
    const dot=$('#vaultStatusDot'),mini=$('#recordVaultDot'),nav=$('#vaultNavState'),text=$('#vaultStatusText'),detail=$('#vaultStatusDetail');
    [dot,mini].forEach(x=>x&&x.classList.remove('connected','locked'));
    if(!health.ok){ if(text)text.textContent='Lokaler Vault nicht gestartet'; if(detail)detail.textContent='Starte vault/start_vault.bat'; if(nav)nav.textContent='offline'; return; }
    if(!health.setup){dot?.classList.add('locked');mini?.classList.add('locked');if(text)text.textContent='Vault noch nicht eingerichtet';if(detail)detail.textContent='Einmalig ein starkes Passwort setzen';if(nav)nav.textContent='setup';return}
    if(!health.unlocked){dot?.classList.add('locked');mini?.classList.add('locked');if(text)text.textContent='Vault gesperrt';if(detail)detail.textContent='Lokal verbunden · Inhalte verschlüsselt';if(nav)nav.textContent='gesperrt';return}
    dot?.classList.add('connected');mini?.classList.add('connected');if(text)text.textContent='Vault entsperrt';if(detail)detail.textContent='Lokal · automatische Sperre nach 15 Min.';if(nav)nav.textContent='bereit';
  }
  async function checkHealth(){
    try{const r=await fetch(VAULT+'/health',{cache:'no-store'});const x=await r.json();health={...x,ok:r.ok&&x.ok}; if(token&&health.setup){try{await request('/backup-info');health.unlocked=true}catch(e){health.unlocked=false}}else health.unlocked=false}catch(e){health={ok:false,setup:false,unlocked:false}}
    updateStatus();return health;
  }

  function ensureAuthDialog(){
    if($('#vaultAuthDialog'))return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultAuthDialog" class="vault-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultAuthClose" type="button">×</button><p class="eyebrow">Secure Practice Vault</p><h2 id="vaultAuthTitle">Vault entsperren</h2><p class="muted" id="vaultAuthCopy">Das Passwort wird nur an den lokalen Dienst auf diesem Computer gesendet.</p><form id="vaultAuthForm" class="edit-form"><label class="edit-field">Vault-Passwort<input id="vaultPassword" type="password" autocomplete="current-password" minlength="12" required></label><label class="edit-field hidden" id="vaultPassword2Wrap">Passwort wiederholen<input id="vaultPassword2" type="password" minlength="12"></label><div id="vaultAuthWarning" class="vault-warning hidden"></div><div id="vaultAuthMsg"></div><div class="dialog-actions"><button class="btn ghost" type="button" id="vaultAuthCancel">Abbrechen</button><button class="btn primary" type="submit" id="vaultAuthSubmit">Entsperren</button></div></form></div></dialog>`);
    $('#vaultAuthClose').onclick=$('#vaultAuthCancel').onclick=()=>$('#vaultAuthDialog').close();
  }
  async function openAuth(){
    ensureAuthDialog();await checkHealth();
    if(!health.ok){toast('Der lokale Vault-Dienst ist nicht erreichbar. Starte zuerst vault/start_vault.bat.','err');return false}
    const setup=!health.setup;$('#vaultAuthTitle').textContent=setup?'Vault einmalig einrichten':'Vault entsperren';$('#vaultAuthCopy').textContent=setup?'Wähle ein starkes, nur dir bekanntes Passwort. Es gibt absichtlich keine Passwort-Wiederherstellung.':'Das Passwort wird nur an den lokalen Dienst auf diesem Computer gesendet.';$('#vaultPassword2Wrap').classList.toggle('hidden',!setup);$('#vaultPassword2').required=setup;$('#vaultAuthWarning').classList.toggle('hidden',!setup);$('#vaultAuthWarning').textContent=setup?'Wichtig: Ohne dieses Passwort können die verschlüsselten Beratungsdaten nicht wiederhergestellt werden. Bewahre es sicher in einem Passwortmanager auf.':'';$('#vaultAuthSubmit').textContent=setup?'Vault einrichten':'Entsperren';$('#vaultPassword').value='';$('#vaultPassword2').value='';$('#vaultAuthMsg').textContent='';
    return new Promise(resolve=>{
      const dlg=$('#vaultAuthDialog');
      const form=$('#vaultAuthForm');
      const close=()=>{form.onsubmit=null;resolve(false)};dlg.addEventListener('close',close,{once:true});
      form.onsubmit=async e=>{e.preventDefault();const password=$('#vaultPassword').value;if(setup&&password!==$('#vaultPassword2').value){toast('Die beiden Passwörter stimmen nicht überein.','err','#vaultAuthMsg');return}const btn=$('#vaultAuthSubmit');btn.disabled=true;btn.textContent='Bitte warten …';try{const x=await post(setup?'/setup':'/unlock',{password});token=x.token;sessionStorage.setItem(TOKEN_KEY,token);health.unlocked=true;health.setup=true;updateStatus();await syncOfflineSnapshot();form.onsubmit=null;dlg.removeEventListener('close',close);dlg.close();resolve(true)}catch(err){toast(err.message,'err','#vaultAuthMsg')}finally{btn.disabled=false;btn.textContent=setup?'Vault einrichten':'Entsperren'}};
      dlg.showModal();setTimeout(()=>$('#vaultPassword').focus(),50);
    });
  }
  async function ensureUnlocked(){await checkHealth();if(health.unlocked)return true;return openAuth()}

  function vaultLockedHtml(){return `<div class="vault-lock-panel"><strong>Secure Practice Vault ist ${health.ok?'gesperrt':'nicht gestartet'}.</strong><p class="muted">${health.ok?'Entsperre den lokalen Vault, um Ziele, Sitzungsverläufe und Artefakte zu sehen.':'Starte auf diesem Computer zuerst <code>vault/start_vault.bat</code>.'}</p><button class="btn primary" id="recordVaultUnlock" type="button">${health.setup?'Vault entsperren':'Vault einrichten'}</button></div>`}

  async function loadClient(email,name){
    current.email=email;current.name=name;
    const mount=$('#vaultRecordMount');if(!mount)return;
    await checkHealth();if(!health.unlocked){mount.innerHTML=vaultLockedHtml();$('#recordVaultUnlock').onclick=async()=>{if(await openAuth())loadClient(email,name)};return}
    try{let x=await request('/client?ref='+encodeURIComponent(email));if(!x.exists){await post('/client',{ref:email,displayName:name,overview:'',currentFocus:''});x=await request('/client?ref='+encodeURIComponent(email))}current.payload=x;renderClient()}catch(e){mount.innerHTML=`<div class="vault-empty">${esc(e.message)}</div>`}
  }

  function renderClient(){
    const m=$('#vaultRecordMount'),x=current.payload;if(!m||!x)return;const c=x.client||{};
    m.innerHTML=`<div class="vault-warning">Diese Inhalte werden ausschließlich aus dem lokalen Secure Practice Vault geladen. Sie werden nicht an Cloudflare/D1 übertragen.</div>
      <div class="vault-top-grid"><section class="vault-card"><h3>Beratungsziel / Prozessüberblick</h3><textarea id="vaultOverview" placeholder="Worum geht es in der Begleitung? Was soll sich verändern?">${esc(c.overview||'')}</textarea></section><section class="vault-card"><h3>Aktueller Fokus</h3><textarea id="vaultCurrentFocus" placeholder="Worauf möchtest du in der nächsten Sitzung besonders achten?">${esc(c.currentFocus||'')}</textarea></section></div>
      <div class="vault-form-actions"><button class="btn secondary" id="vaultSaveOverview" type="button">Überblick speichern</button></div>
      <section class="vault-card"><div class="vault-section-head"><h3>Ziele</h3><button class="mini edit" id="vaultAddGoal" type="button">+ Ziel</button></div><div id="vaultGoals" class="vault-goals"></div></section>
      <section class="vault-card"><div class="vault-section-head"><h3>Sitzungsverlauf</h3><button class="btn primary" id="vaultAddSession" type="button">+ Sitzung dokumentieren</button></div><div id="vaultSessions" class="vault-sessions"></div></section>
      <section class="vault-card"><div class="vault-section-head"><h3>Artefakte</h3><label class="mini edit vault-file">+ Foto / Datei<input id="vaultArtifactInput" type="file" accept="image/*,.pdf"></label></div><div class="vault-artifact-tools"><label>Zuordnen zu <select id="vaultArtifactSession"></select></label></div><p class="micro muted">Fotos von Aufstellungen, Worksheets oder andere fallbezogene Artefakte. Max. 12 MB pro Datei.</p><div id="vaultArtifacts" class="vault-artifacts"></div></section>
      <section class="vault-card"><div class="vault-section-head"><h3>Lokaler Audit Trail</h3><span class="micro muted">nur Dokumentation</span></div><div id="vaultAudit"></div></section>`;
    $('#vaultSaveOverview').onclick=saveOverview;$('#vaultAddGoal').onclick=()=>openGoalEditor();$('#vaultAddSession').onclick=()=>openSessionEditor();$('#vaultArtifactInput').onchange=uploadArtifact;
    const artifactSelect=$('#vaultArtifactSession');if(artifactSelect){const sessions=x.sessions||[];artifactSelect.innerHTML='<option value="">Keine Sitzung</option>'+sessions.map(s=>`<option value="${esc(s.id)}">${esc(fmtDate(s.date))} · ${esc(s.focus||'Sitzung')}</option>`).join('')}
    renderGoals();renderSessions();renderArtifacts();renderAudit();
  }
  async function refreshClient(){current.payload=await request('/client?ref='+encodeURIComponent(current.email));renderClient()}
  async function saveOverview(){const b=$('#vaultSaveOverview');b.disabled=true;try{await post('/client',{ref:current.email,displayName:current.name,overview:$('#vaultOverview').value,currentFocus:$('#vaultCurrentFocus').value});await refreshClient()}catch(e){alert(e.message)}finally{b.disabled=false}}

  function renderGoals(){const wrap=$('#vaultGoals'),rows=current.payload.goals||[];wrap.innerHTML=rows.length?rows.map(g=>`<div class="vault-goal"><div class="vault-goal-head"><div><strong>${esc(g.title)}</strong><div class="vault-note">${esc(g.detail||'')}</div></div><span class="vault-status-chip">${esc({active:'in Arbeit',achieved:'erreicht',changed:'verändert',closed:'abgeschlossen'}[g.status]||g.status)}</span></div><div class="row-actions" style="margin-top:9px"><button class="mini" data-goal-edit="${g.id}">Bearbeiten</button><button class="mini danger" data-goal-delete="${g.id}">Löschen</button></div></div>`).join(''):'<div class="vault-empty">Noch keine Ziele dokumentiert.</div>';wrap.querySelectorAll('[data-goal-edit]').forEach(b=>b.onclick=()=>openGoalEditor(rows.find(g=>g.id===b.dataset.goalEdit)));wrap.querySelectorAll('[data-goal-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Dieses Ziel wirklich löschen?'))return;await del('/goal?id='+encodeURIComponent(b.dataset.goalDelete));await refreshClient()})}

  function ensureGoalDialog(){if($('#vaultGoalDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultGoalDialog" class="vault-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultGoalClose" type="button">×</button><p class="eyebrow">Secure Vault</p><h2>Ziel dokumentieren</h2><form id="vaultGoalForm" class="edit-form"><input id="vaultGoalId" type="hidden"><label class="edit-field">Ziel<input id="vaultGoalTitle" required></label><label class="edit-field">Notiz<textarea id="vaultGoalDetail" rows="4"></textarea></label><label class="edit-field">Status<select id="vaultGoalStatus"><option value="active">in Arbeit</option><option value="achieved">erreicht</option><option value="changed">verändert</option><option value="closed">abgeschlossen</option></select></label><div class="dialog-actions"><button class="btn ghost" type="button" id="vaultGoalCancel">Abbrechen</button><button class="btn primary" type="submit">Speichern</button></div></form></div></dialog>`);$('#vaultGoalClose').onclick=$('#vaultGoalCancel').onclick=()=>$('#vaultGoalDialog').close();$('#vaultGoalForm').onsubmit=async e=>{e.preventDefault();try{await post('/goal',{id:$('#vaultGoalId').value||undefined,ref:current.email,displayName:current.name,title:$('#vaultGoalTitle').value,detail:$('#vaultGoalDetail').value,status:$('#vaultGoalStatus').value});$('#vaultGoalDialog').close();await refreshClient()}catch(err){alert(err.message)}}}
  function openGoalEditor(g=null){ensureGoalDialog();$('#vaultGoalId').value=g?.id||'';$('#vaultGoalTitle').value=g?.title||'';$('#vaultGoalDetail').value=g?.detail||'';$('#vaultGoalStatus').value=g?.status||'active';$('#vaultGoalDialog').showModal()}

  function renderSessions(){const wrap=$('#vaultSessions'),rows=current.payload.sessions||[];wrap.innerHTML=rows.length?rows.map(s=>`<article class="vault-session"><div class="vault-session-head"><div><strong>${esc(fmtDate(s.date))}${s.durationMinutes?' · '+s.durationMinutes+' Min.':''}</strong>${s.focus?`<div class="vault-note"><b>Fokus:</b> ${esc(s.focus)}</div>`:''}</div><div class="row-actions"><button class="mini" data-session-edit="${s.id}">Öffnen</button><button class="mini danger" data-session-delete="${s.id}">Löschen</button></div></div>${(s.interventions||[]).length?`<div class="vault-tags">${s.interventions.map(t=>`<span class="vault-tag">${esc(t)}</span>`).join('')}</div>`:''}<div class="vault-session-grid">${s.dynamics?`<div><strong>Dynamik</strong>${esc(s.dynamics)}</div>`:''}${s.response?`<div><strong>Reaktion / Entwicklung</strong>${esc(s.response)}</div>`:''}${s.agreements?`<div><strong>Vereinbarungen</strong>${esc(s.agreements)}</div>`:''}${s.nextFocus?`<div><strong>Nächster Fokus</strong>${esc(s.nextFocus)}</div>`:''}</div></article>`).join(''):'<div class="vault-empty">Noch keine Sitzungen dokumentiert.</div>';wrap.querySelectorAll('[data-session-edit]').forEach(b=>b.onclick=()=>openSessionEditor(rows.find(s=>s.id===b.dataset.sessionEdit)));wrap.querySelectorAll('[data-session-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Diese Sitzungsdokumentation wirklich löschen?'))return;await del('/session?id='+encodeURIComponent(b.dataset.sessionDelete));await refreshClient()})}

  function ensureSessionDialog(){if($('#vaultSessionDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultSessionDialog" class="vault-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultSessionClose" type="button">×</button><p class="eyebrow">Secure Practice Vault</p><h2>Sitzung dokumentieren</h2><form id="vaultSessionForm" class="vault-session-form"><input id="vaultSessionId" type="hidden"><div class="two"><label>Datum<input id="vaultSessionDate" type="date" required></label><label>Dauer (Min.)<input id="vaultSessionDuration" type="number" min="15" max="240" step="5"></label></div><label>Ausgangslage / aktueller Fokus<textarea id="vaultSessionFocus" rows="3"></textarea></label><label>Beobachtete Dynamik<textarea id="vaultSessionDynamics" rows="3"></textarea></label><label>Interventionen<input id="vaultSessionInterventions" placeholder="z. B. zirkuläre Fragen, Externalisierung, Emotionsfokussierung"></label><label>Reaktion / Entwicklung<textarea id="vaultSessionResponse" rows="3"></textarea></label><label>Vereinbarungen / bis nächstes Mal<textarea id="vaultSessionAgreements" rows="3"></textarea></label><label>Nächster Fokus<textarea id="vaultSessionNext" rows="2"></textarea></label><label>Vorbereitung / persönliche Gedankenstütze<textarea id="vaultSessionPrep" rows="2"></textarea></label><div class="vault-warning">Dokumentiere zweckgebunden und so knapp wie fachlich sinnvoll. Dieser Bereich ist bewusst vom Cloud-CRM getrennt.</div><div class="dialog-actions"><button class="btn ghost" type="button" id="vaultSessionCancel">Abbrechen</button><button class="btn primary" type="submit">Sitzung speichern</button></div></form></div></dialog>`);$('#vaultSessionClose').onclick=$('#vaultSessionCancel').onclick=()=>$('#vaultSessionDialog').close();$('#vaultSessionForm').onsubmit=async e=>{e.preventDefault();const interventions=$('#vaultSessionInterventions').value.split(',').map(x=>x.trim()).filter(Boolean);try{const saved=await post('/session',{id:$('#vaultSessionId').value||undefined,ref:current.email,displayName:current.name,date:$('#vaultSessionDate').value,durationMinutes:Number($('#vaultSessionDuration').value||0),focus:$('#vaultSessionFocus').value,dynamics:$('#vaultSessionDynamics').value,interventions,response:$('#vaultSessionResponse').value,agreements:$('#vaultSessionAgreements').value,nextFocus:$('#vaultSessionNext').value,privatePrep:$('#vaultSessionPrep').value});document.dispatchEvent(new CustomEvent('bd:session-saved',{detail:{email:current.email,name:current.name,aiSummaryQueued:!!saved?.aiSummaryQueued}}));$('#vaultSessionDialog').close();await refreshClient()}catch(err){alert(err.message)}}}
  function openSessionEditor(s=null){ensureSessionDialog();$('#vaultSessionId').value=s?.id||'';$('#vaultSessionDate').value=s?.date?.slice(0,10)||new Date().toISOString().slice(0,10);$('#vaultSessionDuration').value=s?.durationMinutes||'';$('#vaultSessionFocus').value=s?.focus||'';$('#vaultSessionDynamics').value=s?.dynamics||'';$('#vaultSessionInterventions').value=(s?.interventions||[]).join(', ');$('#vaultSessionResponse').value=s?.response||'';$('#vaultSessionAgreements').value=s?.agreements||'';$('#vaultSessionNext').value=s?.nextFocus||'';$('#vaultSessionPrep').value=s?.privatePrep||'';$('#vaultSessionDialog').showModal()}

  async function uploadArtifact(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;try{const buf=await file.arrayBuffer();let bin='';const bytes=new Uint8Array(buf);for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,Math.min(bytes.length,i+0x8000)));const b64=btoa(bin);const sid=$('#vaultArtifactSession')?.value||'';await post('/artifact',{ref:current.email,displayName:current.name,sessionId:sid||undefined,filename:file.name,mime:file.type||'application/octet-stream',dataBase64:b64});await refreshClient()}catch(err){alert(err.message)}}
  function renderArtifacts(){const wrap=$('#vaultArtifacts'),rows=current.payload.artifacts||[];wrap.innerHTML=rows.length?rows.map(a=>`<article class="vault-artifact"><div class="vault-artifact-head"><div><strong>${esc(a.filename)}</strong><div class="micro muted">${Math.ceil(Number(a.bytes||0)/1024)} KB · ${esc(fmt(a.createdAt))}</div></div><div class="row-actions"><button class="mini" data-artifact-open="${a.id}">Öffnen</button><button class="mini danger" data-artifact-delete="${a.id}">Löschen</button></div></div>${String(a.mime||'').startsWith('image/')?`<div data-artifact-preview="${a.id}"></div>`:''}</article>`).join(''):'<div class="vault-empty">Noch keine Artefakte hinterlegt.</div>';wrap.querySelectorAll('[data-artifact-open]').forEach(b=>b.onclick=()=>openArtifact(b.dataset.artifactOpen));wrap.querySelectorAll('[data-artifact-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Dieses Artefakt wirklich löschen?'))return;await del('/artifact?id='+encodeURIComponent(b.dataset.artifactDelete));await refreshClient()});rows.filter(a=>String(a.mime||'').startsWith('image/')).forEach(a=>loadArtifactPreview(a))}
  async function artifactBlob(id){const r=await fetch(VAULT+'/artifact?id='+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(r.status===401){token='';sessionStorage.removeItem(TOKEN_KEY);health.unlocked=false;updateStatus();throw new Error('Vault ist gesperrt.')}if(!r.ok)throw new Error('Artefakt konnte nicht geladen werden.');return r.blob()}
  async function loadArtifactPreview(a){const host=document.querySelector(`[data-artifact-preview="${CSS.escape(a.id)}"]`);if(!host)return;try{const blob=await artifactBlob(a.id),url=URL.createObjectURL(blob);host.innerHTML=`<img src="${url}" alt="${esc(a.filename)}">`;host.querySelector('img').onload=()=>setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(e){}}
  async function openArtifact(id){try{const a=(current.payload.artifacts||[]).find(x=>x.id===id),blob=await artifactBlob(id),url=URL.createObjectURL(blob),w=window.open(url,'_blank','noopener');if(!w){const link=document.createElement('a');link.href=url;link.download=a?.filename||'artifact';link.click()}setTimeout(()=>URL.revokeObjectURL(url),120000)}catch(e){alert(e.message)}}
  function renderAudit(){const wrap=$('#vaultAudit'),rows=(current.payload.audit||[]).slice(0,30);wrap.innerHTML=rows.length?`<div class="timeline">${rows.map(a=>`<div class="timeline-item"><div class="timeline-mark"></div><div class="timeline-copy"><strong>${esc({client_update:'Überblick aktualisiert',goal_create:'Ziel angelegt',goal_update:'Ziel geändert',goal_delete:'Ziel gelöscht',session_create:'Sitzung dokumentiert',session_update:'Sitzung geändert',session_delete:'Sitzung gelöscht',artifact_add:'Artefakt hinzugefügt',artifact_delete:'Artefakt gelöscht'}[a.action]||a.action)}</strong><span>${esc(fmt(a.createdAt))}${a.detail?' · '+esc(a.detail):''}</span></div></div>`).join('')}</div>`:'<div class="vault-empty">Noch keine lokalen Dokumentationsaktionen.</div>'}

  document.addEventListener('bd:vault-record',e=>{const {email,name}=e.detail||{};if(email)loadClient(email,name||email)});
  document.addEventListener('bd:cloud-snapshot',e=>{latestCloudSnapshot=e.detail||null;if(health.unlocked)syncOfflineSnapshot()});
  async function syncOfflineSnapshot(){
    if(!latestCloudSnapshot||!health.unlocked||!token)return false;
    const customers=(latestCloudSnapshot.customers||[]).filter(c=>c.publicId&&c.email).map(c=>({ref:c.email,publicId:c.publicId,customerId:c.id,name:c.name,contactEmail:c.contactEmail||'',isSandbox:!!c.isSandboxProfile}));
    const known=new Set(customers.map(c=>String(c.ref)));
    const bookings=(latestCloudSnapshot.bookings||[]).map(b=>({ref:b.customerIdentityEmail||b.email,eventId:b.eventId,start:b.start,end:b.end,typeLabel:b.typeLabel,locationLabel:b.locationLabel,status:b.status})).filter(b=>known.has(String(b.ref)));
    try{const x=await post('/offline/snapshot',{clients:customers,bookings});const info=$('#vaultSnapshotInfo');if(info)info.textContent=`Zuletzt lokal aktualisiert: ${fmt(x.syncedAt)} · ${x.clientCount} Personen · ${x.bookingCount} Termine`;return true}catch(e){return false}
  }
  $('#vaultUnlockBtn')?.addEventListener('click',async()=>{if(await openAuth())toast('Vault ist entsperrt.')});
  $('#vaultLockBtn')?.addEventListener('click',async()=>{try{await post('/lock',{})}catch(e){}token='';sessionStorage.removeItem(TOKEN_KEY);health.unlocked=false;updateStatus();toast('Vault wurde gesperrt.')});
  $('#vaultRefreshBtn')?.addEventListener('click',async()=>{await checkHealth();toast(health.ok?(health.unlocked?'Vault ist verbunden und entsperrt.':'Vault ist verbunden, aber gesperrt.'):'Vault-Dienst ist nicht erreichbar.',health.ok?'ok':'err')});
  $('#vaultBackupInfoBtn')?.addEventListener('click',async()=>{if(!await ensureUnlocked())return;try{const x=await request('/backup-info');$('#vaultBackupInfo').textContent=x.dataDirectory}catch(e){$('#vaultBackupInfo').textContent=e.message}});
  $('#vaultOfflineBtn')?.addEventListener('click',async()=>{if(!await ensureUnlocked())return;await syncOfflineSnapshot();window.open(VAULT+'/offline','_blank','noopener')});

  // BUILD 11: expose a tiny local-only bridge so the Session Flow Manager can
  // unlock the Vault in place and call local Vault/AI endpoints without
  // duplicating password handling. No password is exposed to other scripts.
  window.BDVault={
    ensureUnlocked,
    checkHealth,
    request,
    post,
    status:()=>({...health}),
    token:()=>token
  };
  checkHealth();
})();
