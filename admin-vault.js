(function(){
  'use strict';
  const VAULT='http://127.0.0.1:47831';
  const TOKEN_KEY='bd_vault_token_v1';
  let token=sessionStorage.getItem(TOKEN_KEY)||'';
  let health={ok:false,setup:false,unlocked:false};
  let current={email:'',name:'',payload:null};
  let latestCloudSnapshot=null;
  let pendingMasterEdit=false;
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
    const whisperInfo=$('#vaultWhisperInfo');
    [dot,mini].forEach(x=>x&&x.classList.remove('connected','locked'));
    if(!health.ok){ if(text)text.textContent='Lokaler Vault nicht gestartet'; if(detail)detail.textContent='Starte vault/start_vault.bat'; if(nav)nav.textContent='offline';if(whisperInfo)whisperInfo.textContent='Whisper-Status kann erst bei laufendem Vault geprüft werden.'; return; }
    if(whisperInfo){const w=health.whisper||{};whisperInfo.textContent=w.ready?`Whisper bereit · Modell ${w.model}${w.version?' · Version '+w.version:''} · Verarbeitung ausschließlich lokal`:w.available?'Whisper wurde gefunden, aber FFmpeg fehlt oder ist nicht im PATH.':'Whisper wurde vom lokalen Vault noch nicht gefunden.'}
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
    try{let x=await request('/client?ref='+encodeURIComponent(email));if(!x.exists){await post('/client',{ref:email,displayName:name,overview:'',currentFocus:''});x=await request('/client?ref='+encodeURIComponent(email))}current.payload=x;renderClient();if(pendingMasterEdit){pendingMasterEdit=false;openMasterDialog()}}catch(e){mount.innerHTML=`<div class="vault-empty">${esc(e.message)}</div>`}
  }

  async function openDictation(origin='case',session=null){
    const popup=window.open('about:blank','_blank');
    if(!await ensureUnlocked()){if(popup)popup.close();return}
    try{
      const x=await post('/dictation/start',{origin,ref:current.email,displayName:current.name,targetSessionId:session?.id||'',sessionDate:String(session?.date||new Date().toISOString()).slice(0,10),durationMinutes:Number(session?.durationMinutes||0),contextLabel:origin==='session'?`Sitzungsnotiz · ${fmtDate(session?.date)}`:`Fallnotiz · ${current.name}`,language:'de'});
      const url=VAULT+'/offline?dictation='+encodeURIComponent(x.dictation.id);
      if(popup)popup.location.href=url;else window.open(url,'_blank','noopener');
    }catch(e){if(popup)popup.close();alert(e.message)}
  }

  function ensureMasterDialog(){
    if($('#vaultMasterDialog'))return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultMasterDialog" class="vault-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultMasterClose" type="button">×</button><p class="eyebrow">Klientenakte · Stammdaten</p><h2>Kontakt &amp; Basisdaten</h2><p class="muted">Diese Stammdaten werden ausschließlich lokal im Secure Practice Vault gespeichert.</p><form id="vaultMasterForm" class="edit-form"><div class="vault-master-grid"><label>Name<input id="vaultMasterName" disabled></label><label>E-Mail<input id="vaultMasterEmail" disabled></label><label>Geburtsdatum<input id="vaultMasterBirth" type="date"></label><label>Telefon<input id="vaultMasterPhone" type="tel" placeholder="+43 …"></label><label class="wide">Straße / Hausnummer<input id="vaultMasterStreet"></label><label>PLZ<input id="vaultMasterPostal"></label><label>Ort<input id="vaultMasterCity"></label><label>Land<input id="vaultMasterCountry"></label></div><div class="dialog-actions"><button class="btn ghost" id="vaultMasterCancel" type="button">Abbrechen</button><button class="btn primary" type="submit">Stammdaten speichern</button></div></form></div></dialog>`);
    $('#vaultMasterClose').onclick=$('#vaultMasterCancel').onclick=()=>$('#vaultMasterDialog').close();
    $('#vaultMasterForm').onsubmit=async e=>{e.preventDefault();await saveMasterData()};
  }
  function openMasterDialog(){
    ensureMasterDialog();
    const c=current.payload?.client||{},md=c.masterData||{};
    $('#vaultMasterName').value=current.name||c.displayName||'';
    $('#vaultMasterEmail').value=current.email||'';
    $('#vaultMasterBirth').value=md.birthDate||'';
    $('#vaultMasterPhone').value=md.phone||'';
    $('#vaultMasterStreet').value=md.street||'';
    $('#vaultMasterPostal').value=md.postalCode||'';
    $('#vaultMasterCity').value=md.city||'';
    $('#vaultMasterCountry').value=md.country||'Österreich';
    $('#vaultMasterDialog').showModal();
  }
  function updateHeaderMaster(){
    const head=document.querySelector('#clientDialog .record-head>div:first-child');
    if(!head||!current.payload)return;
    const c=current.payload.client||{},md=c.masterData||{};
    let host=$('#recordMasterMeta');
    if(!host){host=document.createElement('div');host.id='recordMasterMeta';host.className='record-master-inline';head.append(host)}
    const addr=[md.street,[md.postalCode,md.city].filter(Boolean).join(' '),md.country].filter(Boolean).join(', ');
    const bits=[];
    if(md.phone)bits.push(`<span title="Telefon">☎ ${esc(md.phone)}</span>`);
    if(md.birthDate)bits.push(`<span title="Geburtsdatum">◷ ${esc(fmtDate(md.birthDate))}</span>`);
    if(addr)bits.push(`<span title="Adresse">⌂ ${esc(addr)}</span>`);
    host.innerHTML=`${bits.length?bits.join(''):'<span class="muted">Stammdaten noch unvollständig</span>'}<button type="button" class="record-master-edit" data-vault-master-edit>Stammdaten bearbeiten</button>`;
    host.querySelector('[data-vault-master-edit]')?.addEventListener('click',openMasterDialog);
  }
  function bindWorkspace(){
    const m=$('#vaultRecordMount');if(!m)return;
    m.querySelectorAll('[data-vault-doc-section]').forEach(btn=>btn.addEventListener('click',()=>{
      const section=btn.dataset.vaultDocSection;
      if(section==='finance'){
        document.querySelector('[data-record-tab="invoices"]')?.click();
        return;
      }
      m.querySelectorAll('[data-vault-doc-section]').forEach(x=>x.classList.toggle('active',x===btn));
      m.querySelectorAll('[data-vault-doc-panel]').forEach(x=>x.classList.toggle('active',x.dataset.vaultDocPanel===section));
    }));
  }

  function renderClient(){
    const m=$('#vaultRecordMount'),x=current.payload;if(!m||!x)return;const c=x.client||{};
    updateHeaderMaster();
    m.innerHTML=`<div class="vault-warning vault-warning-compact">Diese Dokumentation bleibt lokal im Secure Practice Vault und wird nicht an das Cloud-CRM übertragen.</div>
      <div class="vault-doc-workspace">
        <nav class="vault-doc-rail" aria-label="Dokumentationsbereiche">
          <button class="active" type="button" data-vault-doc-section="sessions" title="Sitzungsverlauf"><span aria-hidden="true">▤</span><small>Verlauf</small></button>
          <button type="button" data-vault-doc-section="goals" title="Beratungsziele"><span aria-hidden="true">◎</span><small>Ziele</small></button>
          <button type="button" data-vault-doc-section="notes" title="Fallnotizen"><span aria-hidden="true">✎</span><small>Notizen</small></button>
          <button type="button" data-vault-doc-section="artifacts" title="Artefakte und Dateien"><span aria-hidden="true">📎</span><small>Dateien</small></button>
          <button type="button" data-vault-doc-section="finance" title="Honorarnoten und Zahlungen"><span aria-hidden="true">€</span><small>Honorare</small></button>
        </nav>
        <div class="vault-doc-main">
          <section class="vault-doc-panel active vault-card vault-sessions-primary" data-vault-doc-panel="sessions">
            <div class="vault-section-head vault-section-head-prominent"><div><p class="eyebrow">Dokumentation</p><h3>Sitzungsverlauf</h3><p class="micro muted">Links die Chronologie, rechts die vollständigen Felder der ausgewählten Sitzung.</p></div><button class="btn primary" id="vaultAddSession" type="button">+ Sitzung dokumentieren</button></div>
            <div id="vaultSessions" class="vault-sessions"></div>
            <div data-vault-timeline-anchor></div>
          </section>
          <section class="vault-doc-panel vault-card" data-vault-doc-panel="goals">
            <div class="vault-section-head"><div><p class="eyebrow">Fachlicher Rahmen</p><h3>Beratungsziele &amp; Fokus</h3></div><button class="mini edit" id="vaultAddGoal" type="button">+ Ziel</button></div>
            <div class="vault-top-grid"><div><label class="vault-inline-label">Beratungsziel / Prozessüberblick<textarea id="vaultOverview" placeholder="Worum geht es in der Begleitung? Was soll sich verändern?">${esc(c.overview||'')}</textarea></label></div><div><label class="vault-inline-label">Aktueller Fokus<textarea id="vaultCurrentFocus" placeholder="Worauf möchtest du in der nächsten Sitzung besonders achten?">${esc(c.currentFocus||'')}</textarea></label></div></div>
            <div class="vault-form-actions"><button class="btn secondary" id="vaultSaveOverview" type="button">Überblick speichern</button></div><div id="vaultGoals" class="vault-goals"></div>
          </section>
          <section class="vault-doc-panel vault-card" data-vault-doc-panel="notes">
            <div class="vault-section-head"><div><p class="eyebrow">Persönliche Arbeitsnotizen</p><h3>Diktierte Fallnotizen</h3></div><div class="vault-form-actions inline"><button class="btn primary" id="vaultDictateCase" type="button">🎙 Fallnotiz diktieren</button><button class="btn ghost" id="vaultOpenOffline" type="button">Lokale Diktate</button></div></div><div id="vaultCaseNotes" class="vault-sessions"></div>
          </section>
          <section class="vault-doc-panel vault-card" data-vault-doc-panel="artifacts">
            <div class="vault-section-head"><div><p class="eyebrow">Materialien</p><h3>Artefakte &amp; Dateien</h3></div><label class="mini edit vault-file">+ Foto / Datei<input id="vaultArtifactInput" type="file" accept="image/*,.pdf"></label></div><div class="vault-artifact-tools"><label>Zuordnen zu <select id="vaultArtifactSession"></select></label></div><p class="micro muted">Fotos von Aufstellungen, Worksheets oder andere fallbezogene Artefakte. Max. 12 MB pro Datei.</p><div id="vaultArtifacts" class="vault-artifacts"></div><details class="vault-audit-disclosure"><summary>Lokalen Audit Trail anzeigen</summary><div id="vaultAudit"></div></details>
          </section>
        </div>
      </div>`;
    $('#vaultDictateCase').onclick=()=>openDictation('case');$('#vaultOpenOffline').onclick=()=>window.open(VAULT+'/offline','_blank','noopener');$('#vaultSaveOverview').onclick=saveOverview;$('#vaultAddGoal').onclick=()=>openGoalEditor();$('#vaultAddSession').onclick=()=>openSessionEditor();$('#vaultArtifactInput').onchange=uploadArtifact;
    const artifactSelect=$('#vaultArtifactSession');if(artifactSelect){const sessions=x.sessions||[];artifactSelect.innerHTML='<option value="">Keine Sitzung</option>'+sessions.map(s=>`<option value="${esc(s.id)}">${esc(fmtDate(s.date))} · ${esc(s.focus||'Sitzung')}</option>`).join('')}
    bindWorkspace();renderGoals();renderCaseNotes();renderSessions();renderArtifacts();renderAudit();
  }
  async function refreshClient(){current.payload=await request('/client?ref='+encodeURIComponent(current.email));renderClient()}
  async function saveOverview(){const b=$('#vaultSaveOverview');b.disabled=true;try{await post('/client',{ref:current.email,displayName:current.name,overview:$('#vaultOverview').value,currentFocus:$('#vaultCurrentFocus').value});await refreshClient()}catch(e){alert(e.message)}finally{b.disabled=false}}
  async function saveMasterData(){const b=$('#vaultMasterForm button[type="submit"]');if(b)b.disabled=true;try{await post('/client/master-data',{ref:current.email,displayName:current.name,masterData:{birthDate:$('#vaultMasterBirth').value,phone:$('#vaultMasterPhone').value,street:$('#vaultMasterStreet').value,postalCode:$('#vaultMasterPostal').value,city:$('#vaultMasterCity').value,country:$('#vaultMasterCountry').value}});$('#vaultMasterDialog')?.close();await refreshClient();updateHeaderMaster()}catch(e){alert(e.message)}finally{if(b)b.disabled=false}}

  function initialSummary(x){const bits=[x.topic,x.reason,x.mainProblem].map(v=>String(v||'').trim()).filter(Boolean);return bits[0]||'Erstgespräch dokumentiert'}
  function renderInitialConsultations(){const wrap=$('#vaultInitialConsultations');if(!wrap)return;const rows=(current.payload.initialConsultations||[]).slice().sort((a,b)=>new Date(b.date||b.updatedAt||0)-new Date(a.date||a.updatedAt||0));if(!rows.length){wrap.innerHTML='<div class="vault-empty vault-initial-missing"><strong>Erstgespräch noch nicht dokumentiert.</strong><span>Ältere Fälle wurden vor Einführung des strukturierten Erstgesprächs angelegt. Du kannst es hier jederzeit nachtragen.</span><button class="btn primary" type="button" data-vault-add-consultation>+ Erstgespräch nachtragen</button></div>';wrap.querySelector('[data-vault-add-consultation]')?.addEventListener('click',()=>openInitialConsultationEditor());return}wrap.innerHTML=rows.map((x,i)=>`<article class="vault-session vault-initial-entry"><div class="vault-session-head"><div><strong>${i?'Weiteres Erstgespräch':'Erstgespräch'} · ${esc(fmtDate(x.date||x.updatedAt))}</strong><div class="vault-note">${esc(initialSummary(x))}</div></div><div class="row-actions"><span class="vault-status-chip">${x.status==='final'?'final':'Entwurf'}</span><button class="mini" type="button" data-initial-edit="${esc(x.id)}">Öffnen</button></div></div>${x.goals?`<div class="vault-session-grid"><div><strong>Beratungsziele</strong>${esc(x.goals)}</div>${x.nextStep?`<div><strong>Nächster Schritt</strong>${esc(x.nextStep)}</div>`:''}</div>`:''}</article>`).join('');wrap.querySelectorAll('[data-initial-edit]').forEach(b=>b.onclick=()=>openInitialConsultationEditor(rows.find(x=>String(x.id)===String(b.dataset.initialEdit))))}

  function ensureInitialConsultationDialog(){if($('#vaultInitialDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultInitialDialog" class="vault-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultInitialClose" type="button">×</button><p class="eyebrow">Secure Practice Vault</p><h2>Erstgespräch ${'${'}$('#vaultInitialId')?.value?'bearbeiten':'nachtragen'}</h2><p class="muted">Das Erstgespräch wird lokal verschlüsselt gespeichert und kann auch bei älteren Fällen nachgetragen werden.</p><form id="vaultInitialForm" class="vault-session-form"><input id="vaultInitialId" type="hidden"><div class="two"><label>Datum<input id="vaultInitialDate" type="date" required></label><label>Setting<select id="vaultInitialMode"><option value="individual">Einzelberatung</option><option value="couple">Paar-/Beziehungsberatung</option><option value="family">Familienkonstellation</option></select></label></div><label>Thema / Beratungsanliegen<textarea id="vaultInitialTopic" rows="2"></textarea></label><label>Anlass des Erstgesprächs<textarea id="vaultInitialReason" rows="2"></textarea></label><label>Hauptproblem / Ausgangslage<textarea id="vaultInitialProblem" rows="3"></textarea></label><label>Beratungsziele<textarea id="vaultInitialGoals" rows="3"></textarea></label><label>Vereinbarungen<textarea id="vaultInitialAgreements" rows="2"></textarea></label><label>Nächster Schritt<textarea id="vaultInitialNext" rows="2"></textarea></label><div class="dialog-actions"><button class="btn ghost" type="button" id="vaultInitialCancel">Abbrechen</button><button class="btn primary" type="submit">Geprüft speichern</button></div></form></div></dialog>`);$('#vaultInitialClose').onclick=$('#vaultInitialCancel').onclick=()=>$('#vaultInitialDialog').close();$('#vaultInitialForm').onsubmit=async e=>{e.preventDefault();const existing=(current.payload.initialConsultations||[]).find(x=>String(x.id)===String($('#vaultInitialId').value));const body={id:$('#vaultInitialId').value||('manual-initial-'+Date.now()),ref:current.email,displayName:current.name,status:'final',reopen:!!existing,date:$('#vaultInitialDate').value,mode:$('#vaultInitialMode').value,topic:$('#vaultInitialTopic').value,reason:$('#vaultInitialReason').value,mainProblem:$('#vaultInitialProblem').value,goals:$('#vaultInitialGoals').value,agreements:$('#vaultInitialAgreements').value,nextStep:$('#vaultInitialNext').value};try{await post('/initial-consultation',body);$('#vaultInitialDialog').close();await refreshClient();document.dispatchEvent(new CustomEvent('bd:initial-consultation-saved',{detail:{email:current.email}}))}catch(err){alert(err.message)}}}
  function openInitialConsultationEditor(x=null){ensureInitialConsultationDialog();$('#vaultInitialId').value=x?.id||'';$('#vaultInitialDate').value=String(x?.date||new Date().toISOString()).slice(0,10);$('#vaultInitialMode').value=x?.mode||'individual';$('#vaultInitialTopic').value=x?.topic||'';$('#vaultInitialReason').value=x?.reason||'';$('#vaultInitialProblem').value=x?.mainProblem||'';$('#vaultInitialGoals').value=x?.goals||'';$('#vaultInitialAgreements').value=x?.agreements||'';$('#vaultInitialNext').value=x?.nextStep||'';$('#vaultInitialDialog').querySelector('h2').textContent=x?'Erstgespräch bearbeiten':'Erstgespräch nachtragen';$('#vaultInitialDialog').showModal()}

  function renderGoals(){const wrap=$('#vaultGoals'),rows=current.payload.goals||[];wrap.innerHTML=rows.length?rows.map(g=>`<div class="vault-goal"><div class="vault-goal-head"><div><strong>${esc(g.title)}</strong><div class="vault-note">${esc(g.detail||'')}</div></div><span class="vault-status-chip">${esc({active:'in Arbeit',achieved:'erreicht',changed:'verändert',closed:'abgeschlossen'}[g.status]||g.status)}</span></div><div class="row-actions" style="margin-top:9px"><button class="mini" data-goal-edit="${g.id}">Bearbeiten</button><button class="mini danger" data-goal-delete="${g.id}">Löschen</button></div></div>`).join(''):'<div class="vault-empty">Noch keine Ziele dokumentiert.</div>';wrap.querySelectorAll('[data-goal-edit]').forEach(b=>b.onclick=()=>openGoalEditor(rows.find(g=>g.id===b.dataset.goalEdit)));wrap.querySelectorAll('[data-goal-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Dieses Ziel wirklich löschen?'))return;await del('/goal?id='+encodeURIComponent(b.dataset.goalDelete));await refreshClient()})}

  function renderCaseNotes(){const wrap=$('#vaultCaseNotes');if(!wrap)return;const rows=current.payload.caseNotes||[];wrap.innerHTML=rows.length?rows.map(n=>`<article class="vault-session"><div class="vault-session-head"><strong>${esc(fmt(n.createdAt))} · Fallnotiz</strong><span class="vault-status-chip">lokal</span></div><div class="vault-note" style="white-space:pre-wrap;margin-top:10px">${esc(n.body)}</div></article>`).join(''):'<div class="vault-empty">Noch keine diktierten Fallnotizen übernommen.</div>'}

  function ensureGoalDialog(){if($('#vaultGoalDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultGoalDialog" class="vault-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultGoalClose" type="button">×</button><p class="eyebrow">Secure Vault</p><h2>Ziel dokumentieren</h2><form id="vaultGoalForm" class="edit-form"><input id="vaultGoalId" type="hidden"><label class="edit-field">Ziel<input id="vaultGoalTitle" required></label><label class="edit-field">Notiz<textarea id="vaultGoalDetail" rows="4"></textarea></label><label class="edit-field">Status<select id="vaultGoalStatus"><option value="active">in Arbeit</option><option value="achieved">erreicht</option><option value="changed">verändert</option><option value="closed">abgeschlossen</option></select></label><div class="dialog-actions"><button class="btn ghost" type="button" id="vaultGoalCancel">Abbrechen</button><button class="btn primary" type="submit">Speichern</button></div></form></div></dialog>`);$('#vaultGoalClose').onclick=$('#vaultGoalCancel').onclick=()=>$('#vaultGoalDialog').close();$('#vaultGoalForm').onsubmit=async e=>{e.preventDefault();try{await post('/goal',{id:$('#vaultGoalId').value||undefined,ref:current.email,displayName:current.name,title:$('#vaultGoalTitle').value,detail:$('#vaultGoalDetail').value,status:$('#vaultGoalStatus').value});$('#vaultGoalDialog').close();await refreshClient()}catch(err){alert(err.message)}}}
  function openGoalEditor(g=null){ensureGoalDialog();$('#vaultGoalId').value=g?.id||'';$('#vaultGoalTitle').value=g?.title||'';$('#vaultGoalDetail').value=g?.detail||'';$('#vaultGoalStatus').value=g?.status||'active';$('#vaultGoalDialog').showModal()}

  let selectedSessionKey='';
  function sessionExcerpt(s){
    return String(s?.focus||s?.dynamics||s?.agreements||s?.nextFocus||s?.dictatedNote||'Noch keine Kurzbeschreibung hinterlegt.').replace(/\s+/g,' ').trim();
  }
  function sessionValue(label,value,wide=false){
    const text=Array.isArray(value)?value.join(', '):String(value||'').trim();
    return `<div class="vault-session-field${wide?' wide':''}"><span>${esc(label)}</span><div>${text?esc(text):'<em>—</em>'}</div></div>`;
  }
  function consultationDetail(x){
    if(!x)return `<div class="vault-session-detail-empty"><strong>Erstgespräch fehlt</strong><p>Für diesen älteren Fall ist noch kein strukturiertes Erstgespräch hinterlegt.</p><button class="btn primary" type="button" data-split-add-consultation>+ Erstgespräch nachtragen</button></div>`;
    return `<div class="vault-session-detail-head"><div><p class="eyebrow">Start der Begleitung</p><h4>Erstgespräch</h4><p>${esc(fmtDate(x.date||x.updatedAt))}${x.mode?` · ${esc({individual:'Einzelberatung',couple:'Paar-/Beziehungsberatung',family:'Familienkonstellation'}[x.mode]||x.mode)}`:''}</p></div><button class="mini edit" type="button" data-split-consultation-edit="${esc(x.id)}">Bearbeiten</button></div><div class="vault-session-fields">${sessionValue('Thema / Beratungsanliegen',x.topic,true)}${sessionValue('Anlass',x.reason,true)}${sessionValue('Ausgangslage / Hauptproblem',x.mainProblem,true)}${sessionValue('Beratungsziele',x.goals,true)}${sessionValue('Vereinbarungen',x.agreements,true)}${sessionValue('Nächster Schritt',x.nextStep,true)}</div>`;
  }
  function sessionDetail(s,number){
    if(!s)return `<div class="vault-session-detail-empty"><strong>Sitzung auswählen</strong><p>Wähle links ein Erstgespräch oder eine Sitzung. Rechts erscheinen dann die strukturierten Inhalte.</p></div>`;
    return `<div class="vault-session-detail-head"><div><p class="eyebrow">Sitzungsdokumentation</p><h4>Sitzung ${number}</h4><p>${esc(fmtDate(s.date))}${s.durationMinutes?` · ${esc(s.durationMinutes)} Min.`:''}</p></div><div class="vault-session-detail-actions"><button class="mini edit" type="button" data-session-dictate="${esc(s.id)}">🎙 Diktieren</button><button class="mini" type="button" data-session-edit="${esc(s.id)}">Bearbeiten</button><button class="mini danger" type="button" data-session-delete="${esc(s.id)}">Löschen</button></div></div><div class="vault-session-fields">${sessionValue('Diktierte Sitzungsnotiz',s.dictatedNote,true)}${sessionValue('Ausgangslage / aktueller Fokus',s.focus,true)}${sessionValue('Beobachtete Dynamik',s.dynamics,true)}${sessionValue('Interventionen',s.interventions,true)}${sessionValue('Reaktion / Entwicklung',s.response,true)}${sessionValue('Vereinbarungen / bis nächstes Mal',s.agreements,true)}${sessionValue('Nächster Fokus',s.nextFocus,true)}${sessionValue('Vorbereitung / persönliche Gedankenstütze',s.privatePrep,true)}</div>`;
  }
  function bindSplitSessionActions(wrap,sessions,consultations){
    const chronological=sessions.slice().sort((a,b)=>new Date(a.date||a.createdAt||0)-new Date(b.date||b.createdAt||0));
    const byId=id=>chronological.find(x=>String(x.id)===String(id));
    const num=id=>Math.max(1,chronological.findIndex(x=>String(x.id)===String(id))+1);
    const detail=wrap.querySelector('[data-session-detail]');
    function activate(key){
      selectedSessionKey=key;
      wrap.querySelectorAll('[data-session-select]').forEach(b=>b.classList.toggle('active',b.dataset.sessionSelect===key));
      if(key==='consultation')detail.innerHTML=consultationDetail(consultations[0]||null);
      else{const id=key.replace('session:',''),s=byId(id);detail.innerHTML=sessionDetail(s,num(id))}
      bindDetailActions();
    }
    function bindDetailActions(){
      detail.querySelector('[data-split-add-consultation]')?.addEventListener('click',()=>openInitialConsultationEditor());
      detail.querySelector('[data-split-consultation-edit]')?.addEventListener('click',()=>openInitialConsultationEditor(consultations.find(x=>String(x.id)===String(detail.querySelector('[data-split-consultation-edit]')?.dataset.splitConsultationEdit))||consultations[0]||null));
      detail.querySelectorAll('[data-session-dictate]').forEach(b=>b.onclick=()=>openDictation('session',byId(b.dataset.sessionDictate)));
      detail.querySelectorAll('[data-session-edit]').forEach(b=>b.onclick=()=>openSessionEditor(byId(b.dataset.sessionEdit)));
      detail.querySelectorAll('[data-session-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Diese Sitzungsdokumentation wirklich löschen?'))return;await del('/session?id='+encodeURIComponent(b.dataset.sessionDelete));selectedSessionKey='';await refreshClient()});
    }
    wrap.querySelectorAll('[data-session-select]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.sessionSelect)));
    const fallback=chronological.length?`session:${chronological.at(-1).id}`:'consultation';
    const wanted=[...wrap.querySelectorAll('[data-session-select]')].some(b=>b.dataset.sessionSelect===selectedSessionKey)?selectedSessionKey:fallback;
    activate(wanted);
  }
  function renderSessions(){
    const wrap=$('#vaultSessions'),sessions=(current.payload.sessions||[]).slice(),consultations=(current.payload.initialConsultations||[]).slice().sort((a,b)=>new Date(a.date||a.updatedAt||0)-new Date(b.date||b.updatedAt||0));
    if(!wrap)return;
    const chronological=sessions.slice().sort((a,b)=>new Date(a.date||a.createdAt||0)-new Date(b.date||b.createdAt||0));
    const numbered=new Map(chronological.map((s,i)=>[String(s.id),i+1]));
    const display=chronological.slice().reverse();
    const consultation=consultations[0]||null;
    const consultationItem=`<button class="vault-session-nav-item consultation${consultation?'':' missing'}" type="button" data-session-select="consultation"><span class="vault-session-nav-title">${consultation?'Erstgespräch':'Erstgespräch fehlt'}</span><span class="vault-session-nav-meta">${consultation?esc(fmtDate(consultation.date||consultation.updatedAt)):'＋ nachtragen'}</span><span class="vault-session-nav-preview">${consultation?esc(initialSummary(consultation)):'Strukturierten Start der Begleitung ergänzen'}</span></button>`;
    const items=display.map(s=>`<button class="vault-session-nav-item" type="button" data-session-select="session:${esc(s.id)}" data-session-card="${esc(s.id)}"><span class="vault-session-nav-title">Sitzung ${numbered.get(String(s.id))}</span><span class="vault-session-nav-meta">${esc(fmtDate(s.date))}${s.durationMinutes?` · ${esc(s.durationMinutes)} Min.`:''}</span><span class="vault-session-nav-preview">${esc(sessionExcerpt(s).slice(0,180))}</span></button>`).join('');
    wrap.innerHTML=`<div class="vault-session-split"><aside class="vault-session-index"><div class="vault-session-index-scroll">${items||'<div class="vault-session-index-empty">Noch keine Sitzungen dokumentiert.</div>'}${consultationItem}</div></aside><section class="vault-session-detail" data-session-detail></section></div>`;
    bindSplitSessionActions(wrap,chronological,consultations);
  }

  function ensureSessionDialog(){if($('#vaultSessionDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultSessionDialog" class="vault-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultSessionClose" type="button">×</button><p class="eyebrow">Secure Practice Vault</p><h2>Sitzung dokumentieren</h2><form id="vaultSessionForm" class="vault-session-form"><input id="vaultSessionId" type="hidden"><div class="two"><label>Datum<input id="vaultSessionDate" type="date" required></label><label>Dauer (Min.)<input id="vaultSessionDuration" type="number" min="15" max="240" step="5"></label></div><label>Diktierte Sitzungsnotiz<textarea id="vaultSessionDictated" rows="6"></textarea></label><label>Ausgangslage / aktueller Fokus<textarea id="vaultSessionFocus" rows="3"></textarea></label><label>Beobachtete Dynamik<textarea id="vaultSessionDynamics" rows="3"></textarea></label><label>Interventionen<input id="vaultSessionInterventions" placeholder="z. B. zirkuläre Fragen, Externalisierung, Emotionsfokussierung"></label><label>Reaktion / Entwicklung<textarea id="vaultSessionResponse" rows="3"></textarea></label><label>Vereinbarungen / bis nächstes Mal<textarea id="vaultSessionAgreements" rows="3"></textarea></label><label>Nächster Fokus<textarea id="vaultSessionNext" rows="2"></textarea></label><label>Vorbereitung / persönliche Gedankenstütze<textarea id="vaultSessionPrep" rows="2"></textarea></label><div class="vault-warning">Dokumentiere zweckgebunden und so knapp wie fachlich sinnvoll. Dieser Bereich ist bewusst vom Cloud-CRM getrennt.</div><div class="dialog-actions"><button class="btn ghost" type="button" id="vaultSessionCancel">Abbrechen</button><button class="btn primary" type="submit">Sitzung speichern</button></div></form></div></dialog>`);$('#vaultSessionClose').onclick=$('#vaultSessionCancel').onclick=()=>$('#vaultSessionDialog').close();$('#vaultSessionForm').onsubmit=async e=>{e.preventDefault();const interventions=$('#vaultSessionInterventions').value.split(',').map(x=>x.trim()).filter(Boolean);try{const saved=await post('/session',{id:$('#vaultSessionId').value||undefined,ref:current.email,displayName:current.name,date:$('#vaultSessionDate').value,durationMinutes:Number($('#vaultSessionDuration').value||0),dictatedNote:$('#vaultSessionDictated').value,focus:$('#vaultSessionFocus').value,dynamics:$('#vaultSessionDynamics').value,interventions,response:$('#vaultSessionResponse').value,agreements:$('#vaultSessionAgreements').value,nextFocus:$('#vaultSessionNext').value,privatePrep:$('#vaultSessionPrep').value});document.dispatchEvent(new CustomEvent('bd:session-saved',{detail:{email:current.email,name:current.name,aiSummaryQueued:!!saved?.aiSummaryQueued}}));$('#vaultSessionDialog').close();await refreshClient()}catch(err){alert(err.message)}}}
  function openSessionEditor(s=null){ensureSessionDialog();$('#vaultSessionId').value=s?.id||'';$('#vaultSessionDate').value=s?.date?.slice(0,10)||new Date().toISOString().slice(0,10);$('#vaultSessionDuration').value=s?.durationMinutes||'';$('#vaultSessionDictated').value=s?.dictatedNote||'';$('#vaultSessionFocus').value=s?.focus||'';$('#vaultSessionDynamics').value=s?.dynamics||'';$('#vaultSessionInterventions').value=(s?.interventions||[]).join(', ');$('#vaultSessionResponse').value=s?.response||'';$('#vaultSessionAgreements').value=s?.agreements||'';$('#vaultSessionNext').value=s?.nextFocus||'';$('#vaultSessionPrep').value=s?.privatePrep||'';$('#vaultSessionDialog').showModal()}

  async function uploadArtifact(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;try{const buf=await file.arrayBuffer();let bin='';const bytes=new Uint8Array(buf);for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,Math.min(bytes.length,i+0x8000)));const b64=btoa(bin);const sid=$('#vaultArtifactSession')?.value||'';await post('/artifact',{ref:current.email,displayName:current.name,sessionId:sid||undefined,filename:file.name,mime:file.type||'application/octet-stream',dataBase64:b64});await refreshClient()}catch(err){alert(err.message)}}
  function renderArtifacts(){const wrap=$('#vaultArtifacts'),rows=current.payload.artifacts||[];wrap.innerHTML=rows.length?rows.map(a=>`<article class="vault-artifact"><div class="vault-artifact-head"><div><strong>${esc(a.filename)}</strong><div class="micro muted">${Math.ceil(Number(a.bytes||0)/1024)} KB · ${esc(fmt(a.createdAt))}</div></div><div class="row-actions"><button class="mini" data-artifact-open="${a.id}">Öffnen</button><button class="mini danger" data-artifact-delete="${a.id}">Löschen</button></div></div>${String(a.mime||'').startsWith('image/')?`<div data-artifact-preview="${a.id}"></div>`:''}</article>`).join(''):'<div class="vault-empty">Noch keine Artefakte hinterlegt.</div>';wrap.querySelectorAll('[data-artifact-open]').forEach(b=>b.onclick=()=>openArtifact(b.dataset.artifactOpen));wrap.querySelectorAll('[data-artifact-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Dieses Artefakt wirklich löschen?'))return;await del('/artifact?id='+encodeURIComponent(b.dataset.artifactDelete));await refreshClient()});rows.filter(a=>String(a.mime||'').startsWith('image/')).forEach(a=>loadArtifactPreview(a))}
  async function artifactBlob(id){const r=await fetch(VAULT+'/artifact?id='+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(r.status===401){token='';sessionStorage.removeItem(TOKEN_KEY);health.unlocked=false;updateStatus();throw new Error('Vault ist gesperrt.')}if(!r.ok)throw new Error('Artefakt konnte nicht geladen werden.');return r.blob()}
  async function loadArtifactPreview(a){const host=document.querySelector(`[data-artifact-preview="${CSS.escape(a.id)}"]`);if(!host)return;try{const blob=await artifactBlob(a.id),url=URL.createObjectURL(blob);host.innerHTML=`<img src="${url}" alt="${esc(a.filename)}">`;host.querySelector('img').onload=()=>setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(e){}}
  function isCaptureArtifact(a){return String(a?.mime||'').includes('application/json')&&/^capture-.*\.json$/i.test(String(a?.filename||''))}
  function captureDeviceLabel(value){return({s22:'Samsung / Smartphone',boox:'BOOX / E-Ink',other:'Anderes Gerät'}[value]||value||'Gerät')}
  function decodeCaptureBase64(value,mime){const raw=atob(String(value||'').replace(/-/g,'+').replace(/_/g,'/')),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Blob([bytes],{type:mime||'application/octet-stream'})}
  function drawCaptureInk(canvas,strokes){const rows=Array.isArray(strokes)?strokes.filter(s=>Array.isArray(s)&&s.length):[];if(!rows.length)return;const rect=canvas.getBoundingClientRect(),width=Math.max(320,Math.round(rect.width||760)),height=Math.max(360,Math.round(Math.min(620,width*.68))),ratio=Math.min(window.devicePixelRatio||1,2),ctx=canvas.getContext('2d');canvas.style.height=height+'px';canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.strokeStyle='#2f2623';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.lineJoin='round';for(const stroke of rows){if(!stroke.length)continue;ctx.beginPath();ctx.moveTo(Number(stroke[0].x||0)*width,Number(stroke[0].y||0)*height);for(const point of stroke.slice(1))ctx.lineTo(Number(point.x||0)*width,Number(point.y||0)*height);if(stroke.length===1){ctx.lineTo(Number(stroke[0].x||0)*width+.2,Number(stroke[0].y||0)*height+.2)}ctx.stroke()}}
  function ensureCaptureDialog(){if($('#vaultCaptureDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="vaultCaptureDialog" class="vault-dialog capture-viewer-dialog"><div class="dialog-shell"><button class="dialog-x" id="vaultCaptureClose" type="button">×</button><p class="eyebrow">Lokaler Secure Practice Vault</p><h2>Capture-Erfassung</h2><div id="vaultCaptureContent"></div><div class="dialog-actions capture-viewer-actions"><button class="btn ghost" id="vaultCaptureDownload" type="button">Originaldatei herunterladen</button><button class="btn primary" id="vaultCaptureDone" type="button">Schließen</button></div></div></dialog>`);$('#vaultCaptureClose').onclick=$('#vaultCaptureDone').onclick=()=>$('#vaultCaptureDialog').close()}
  function showCaptureArtifact(a,payload,blob){
    ensureCaptureDialog();
    const dlg=$('#vaultCaptureDialog'),host=$('#vaultCaptureContent'),audio=Array.isArray(payload.audio)?payload.audio:[],note=String(payload.noteText||'').trim();
    const pages=Array.isArray(payload.inkPages)&&payload.inkPages.length?payload.inkPages.map(page=>Array.isArray(page.strokes)?page.strokes:[]):[Array.isArray(payload.strokes)?payload.strokes:[]];
    const writtenPages=pages.filter(strokes=>strokes.length);
    const sessionOptions=(current.payload.sessions||[]).map(session=>`<option value="${esc(session.id)}">Sitzung ${esc(fmtDate(session.date))}${session.focus?' · '+esc(session.focus):''}</option>`).join('');
    host.innerHTML=`<div class="capture-viewer-meta"><div><span>Erfasst</span><strong>${esc(fmt(payload.createdAt||a.createdAt))}</strong></div><div><span>Gerät</span><strong>${esc(captureDeviceLabel(payload.deviceType))}</strong></div><div><span>Kürzel</span><strong>${esc(payload.label||'Nicht angegeben')}</strong></div></div><section class="capture-viewer-section"><h3>Getippte Notiz</h3><div class="capture-viewer-note${note?'':' empty'}">${note?esc(note):'Keine getippte Notiz vorhanden.'}</div></section>${writtenPages.map((strokes,index)=>`<section class="capture-viewer-section"><div class="capture-viewer-heading"><h3>Handschrift · Seite ${index+1}</h3><span>${strokes.length} Strich${strokes.length===1?'':'e'}</span></div><canvas class="vault-capture-ink" data-capture-page="${index}" aria-label="Handschriftliche Capture-Notiz, Seite ${index+1}"></canvas></section>`).join('')}${audio.length?`<section class="capture-viewer-section"><div class="capture-viewer-heading"><div><h3>Audioaufnahmen lokal transkribieren</h3><p class="micro muted">Whisper arbeitet ausschließlich auf diesem Computer. Vor der Übernahme kannst du jedes Transkript korrigieren.</p></div><button class="btn primary" id="vaultCaptureTranscribeAll" type="button">Alle transkribieren</button></div><label class="capture-transcript-target">Geprüfte Transkripte übernehmen als<select id="vaultCaptureTarget"><option value="">Fallnotiz</option>${sessionOptions}</select></label><div id="vaultCaptureAudio" class="capture-viewer-audio"></div></section>`:''}`;
    const urls=[];dlg.showModal();if(payload.sessionId&&$('#vaultCaptureTarget')?.querySelector(`option[value="${CSS.escape(String(payload.sessionId))}"]`))$('#vaultCaptureTarget').value=String(payload.sessionId);
    requestAnimationFrame(()=>writtenPages.forEach((strokes,index)=>drawCaptureInk(document.querySelector(`[data-capture-page="${index}"]`),strokes)));
    if(audio.length){const audioHost=$('#vaultCaptureAudio');for(const [index,item] of audio.entries()){try{const url=URL.createObjectURL(decodeCaptureBase64(item.dataBase64,item.mime));urls.push(url);audioHost.insertAdjacentHTML('beforeend',`<article class="capture-transcript-row" data-capture-audio="${index}"><div class="capture-audio-head"><strong>Aufnahme ${index+1}${item.durationSeconds?' · '+esc(item.durationSeconds)+' Sek.':''}</strong><span class="vault-status-chip" data-capture-status>nicht transkribiert</span></div><audio controls src="${url}"></audio><div class="capture-transcript-actions"><button class="btn secondary" data-capture-transcribe="${index}" type="button">Lokal transkribieren</button></div><p class="capture-transcript-state" data-capture-message></p><div class="capture-transcript-editor" data-capture-editor hidden><label>Transkript<textarea rows="7" data-capture-text></textarea></label><div class="capture-transcript-actions"><button class="btn ghost" data-capture-save="${index}" type="button">Korrektur speichern</button><button class="btn primary" data-capture-accept="${index}" type="button">Geprüft übernehmen</button></div></div></article>`)}catch(e){audioHost.insertAdjacentHTML('beforeend','<p class="muted">Eine Audioaufnahme konnte nicht dargestellt werden.</p>')}}hydrateCaptureTranscripts(a,payload);$('#vaultCaptureTranscribeAll').onclick=()=>transcribeAllCaptureAudio(a,payload)}
    const originalUrl=URL.createObjectURL(blob);urls.push(originalUrl);$('#vaultCaptureDownload').onclick=()=>{const link=document.createElement('a');link.href=originalUrl;link.download=a.filename||'capture.json';link.click()};dlg.addEventListener('close',()=>urls.forEach(url=>URL.revokeObjectURL(url)),{once:true});
  }
  function captureDictationMarker(a,index){return`[capture:${a.id}:${index}]`}
  function captureDictationFor(rows,a,index){const marker=captureDictationMarker(a,index);return(rows||[]).find(row=>String(row.contextLabel||'').includes(marker))||null}
  async function captureDictations(){const result=await request('/dictations?ref='+encodeURIComponent(current.email));return result.dictations||[]}
  async function hydrateCaptureTranscripts(a,payload){const rows=await captureDictations().catch(()=>[]);for(let index=0;index<(payload.audio||[]).length;index++)renderCaptureTranscriptRow(a,payload,index,captureDictationFor(rows,a,index))}
  function renderCaptureTranscriptRow(a,payload,index,row){const host=document.querySelector(`[data-capture-audio="${index}"]`);if(!host)return;const status=host.querySelector('[data-capture-status]'),message=host.querySelector('[data-capture-message]'),editor=host.querySelector('[data-capture-editor]'),text=host.querySelector('[data-capture-text]'),button=host.querySelector('[data-capture-transcribe]'),save=host.querySelector('[data-capture-save]'),accept=host.querySelector('[data-capture-accept]');const labels={recording:'Audio gespeichert',saved:'bereit',transcribing:'Whisper arbeitet',draft:'Transkriptentwurf',error:'Fehler',accepted:'übernommen'};status.textContent=row?labels[row.status]||row.status:'nicht transkribiert';message.textContent=row?.error||'';editor.hidden=!row||!['draft','accepted'].includes(row.status);if(row)text.value=row.editedTranscript||row.originalTranscript||'';text.disabled=row?.status==='accepted';save.hidden=!row||row.status!=='draft';accept.hidden=!row||row.status!=='draft';button.hidden=!!row&&['draft','accepted','transcribing'].includes(row.status);button.textContent=row?.status==='error'?'Erneut transkribieren':'Lokal transkribieren';button.onclick=()=>startCaptureTranscription(a,payload,index,row);if(row){save.onclick=()=>saveCaptureTranscript(row.id,text.value,message);accept.onclick=()=>acceptCaptureTranscript(row.id,text.value,a,payload)}}
  async function startCaptureTranscription(a,payload,index,existing=null){const item=payload.audio?.[index],host=document.querySelector(`[data-capture-audio="${index}"]`),message=host?.querySelector('[data-capture-message]'),button=host?.querySelector('[data-capture-transcribe]');if(!item||!host)return;button.disabled=true;try{let id=existing?.id;if(!id){const target=$('#vaultCaptureTarget')?.value||'',session=(current.payload.sessions||[]).find(row=>String(row.id)===String(target)),created=await post('/dictation/start',{origin:target?'session':'case',ref:current.email,displayName:current.name,targetSessionId:target||'',sessionDate:String(session?.date||payload.createdAt||new Date().toISOString()).slice(0,10),durationMinutes:Math.ceil(Number(item.durationSeconds||0)/60),contextLabel:`Capture-Aufnahme ${index+1} ${captureDictationMarker(a,index)}`,language:'de'});id=created.dictation.id;const raw=new Uint8Array(await decodeCaptureBase64(item.dataBase64,item.mime).arrayBuffer()),partSize=2*1024*1024;for(let offset=0,sequence=0;offset<raw.length;offset+=partSize,sequence++){message.textContent=`Audio wird lokal gesichert · Abschnitt ${sequence+1}`;const part=raw.subarray(offset,Math.min(raw.length,offset+partSize));let binary='';for(let pos=0;pos<part.length;pos+=0x8000)binary+=String.fromCharCode(...part.subarray(pos,pos+0x8000));await post('/dictation/chunk',{id,sequence,mime:item.mime||'audio/webm',dataBase64:btoa(binary)})}}message.textContent='Whisper transkribiert lokal …';await post('/dictation/transcribe',{id,language:'de',transcribe:true});let result=null;for(let count=0;count<360;count++){await new Promise(resolve=>setTimeout(resolve,1000));result=(await request('/dictation?id='+encodeURIComponent(id))).dictation;message.textContent=result.status==='transcribing'?`Whisper transkribiert lokal … ${count+1} s`:'';if(['draft','error'].includes(result.status))break}if(result?.status!=='draft')throw new Error(result?.error||'Die Transkription wurde nicht abgeschlossen. Das Audio bleibt erhalten.');renderCaptureTranscriptRow(a,payload,index,result)}catch(error){message.textContent=error.message}finally{button.disabled=false}}
  async function transcribeAllCaptureAudio(a,payload){const button=$('#vaultCaptureTranscribeAll');button.disabled=true;try{for(let index=0;index<(payload.audio||[]).length;index++){const rows=await captureDictations(),existing=captureDictationFor(rows,a,index);if(existing&&['draft','accepted'].includes(existing.status))continue;await startCaptureTranscription(a,payload,index,existing)}}finally{button.disabled=false;await hydrateCaptureTranscripts(a,payload)}}
  async function saveCaptureTranscript(id,text,message){try{await post('/dictation/update',{id,editedTranscript:text});message.textContent='Korrektur lokal gespeichert.'}catch(error){message.textContent=error.message}}
  async function acceptCaptureTranscript(id,text,a,payload){const rows=await captureDictations(),row=rows.find(item=>item.id===id),index=(payload.audio||[]).findIndex((item,i)=>captureDictationMarker(a,i)&&String(row?.contextLabel||'').includes(captureDictationMarker(a,i))),host=document.querySelector(`[data-capture-audio="${index}"]`),message=host?.querySelector('[data-capture-message]');try{await post('/dictation/update',{id,editedTranscript:text});await post('/dictation/accept',{id,autoDeleteAudio:true});current.payload=await request('/client?ref='+encodeURIComponent(current.email));message.textContent=row?.targetSessionId?'Geprüft in die Sitzungsnotiz übernommen.':'Geprüft als Fallnotiz übernommen.';await hydrateCaptureTranscripts(a,payload)}catch(error){message.textContent=error.message}}
  async function openArtifact(id){try{const a=(current.payload.artifacts||[]).find(x=>x.id===id),blob=await artifactBlob(id);if(isCaptureArtifact(a)){let payload;try{payload=JSON.parse(await blob.text())}catch(e){throw new Error('Die Capture-Erfassung konnte nicht gelesen werden.')}showCaptureArtifact(a,payload,blob);return}const url=URL.createObjectURL(blob),w=window.open(url,'_blank','noopener');if(!w){const link=document.createElement('a');link.href=url;link.download=a?.filename||'artifact';link.click()}setTimeout(()=>URL.revokeObjectURL(url),120000)}catch(e){alert(e.message)}}
  function renderAudit(){const wrap=$('#vaultAudit'),rows=(current.payload.audit||[]).slice(0,30);wrap.innerHTML=rows.length?`<div class="timeline">${rows.map(a=>`<div class="timeline-item"><div class="timeline-mark"></div><div class="timeline-copy"><strong>${esc({client_update:'Überblick aktualisiert',goal_create:'Ziel angelegt',goal_update:'Ziel geändert',goal_delete:'Ziel gelöscht',session_create:'Sitzung dokumentiert',session_update:'Sitzung geändert',session_delete:'Sitzung gelöscht',artifact_add:'Artefakt hinzugefügt',artifact_delete:'Artefakt gelöscht'}[a.action]||a.action)}</strong><span>${esc(fmt(a.createdAt))}${a.detail?' · '+esc(a.detail):''}</span></div></div>`).join('')}</div>`:'<div class="vault-empty">Noch keine lokalen Dokumentationsaktionen.</div>'}

  document.addEventListener('bd:vault-record',e=>{const {email,name}=e.detail||{};if(email)loadClient(email,name||email)});
  document.addEventListener('bd:edit-master-data',()=>{if(current.payload)openMasterDialog();else pendingMasterEdit=true});
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
