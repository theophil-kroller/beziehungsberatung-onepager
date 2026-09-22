(function(){
  'use strict';
  const VAULT='http://127.0.0.1:47831';
  let aiStatus=null, aiDraft=null, dialogObserver=null, activeAiJob=null;
  let activeDictation=null, dictationRecorder=null, dictationStream=null, dictationUpload=Promise.resolve(), dictationSequence=0, dictationTimer=null, dictationProcessTimer=null, dictationSeconds=0, dictationPoll=null, dictationAudioUrl='', draftSaveTimer=null;
  const AI_MODEL_PREF_KEY='bd_local_ai_model_v2';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const fmtSeconds=s=>{s=Math.max(0,Number(s||0));return s<60?`${s.toFixed(s<10?1:0)} s`:`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')} min`};
  function timingText(x){const load=Number(x?.modelLoadSeconds||0),work=Number(x?.processingSeconds||0),total=Number(x?.elapsedSeconds||0);const parts=[];if(load>.15)parts.push(`Modell laden ${fmtSeconds(load)}`);if(work>.15)parts.push(`KI-Verarbeitung ${fmtSeconds(work)}`);if(total>.15)parts.push(`gesamt ${fmtSeconds(total)}`);return parts.join(' · ')}
  function friendlyAiError(msg){msg=String(msg||'Unbekannter Fehler');if(/timed out|timeout/i.test(msg))return 'Die lokale KI hat länger gebraucht. BUILD 11.2 lässt solche Aufträge im Hintergrund weiterlaufen; bitte den Vault neu starten, falls du noch die alte Version verwendest.';if(/arbeitsspeicher|load model|Failed to load/i.test(msg))return 'Das Modell konnte nicht geladen werden. Schließe andere große Programme oder wähle ein kleineres lokales Modell.';return msg}

  function flowCurrent(){return window.BDFlowManager?.getCurrent?.()||null}
  function list(items){return Array.isArray(items)&&items.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="muted micro">—</p>'}
  function nonEmpty(items){return Array.isArray(items)?items.map(x=>String(x||'').trim()).filter(Boolean):[]}
  function selectedModel(){return $('#flowAiModel')?.value||localStorage.getItem(AI_MODEL_PREF_KEY)||''}
  function preferredModel(models){const saved=localStorage.getItem(AI_MODEL_PREF_KEY);if(saved&&models.includes(saved))return saved;const prefs=['qwen3-1.7b','qwen3-1_7b','qwen3-1.7','qwen3-4b-2507','qwen3-4b','gemma-4-e4b','gemma'];for(const pref of prefs){const hit=models.find(m=>m.toLowerCase().includes(pref));if(hit)return hit}return models[0]||''}
  function populateModelSelect(status){const sel=$('#flowAiModel');if(!sel)return;const models=(status?.chatModels||status?.models||[]).filter(m=>!/embed|embedding/i.test(m));const chosen=preferredModel(models);sel.innerHTML=models.length?models.map(m=>`<option value="${esc(m)}"${m===chosen?' selected':''}>${esc(m)}${/qwen3-1\.7b/i.test(m)?' · empfohlen':''}</option>`).join(''):'<option value="">Kein Chat-Modell gefunden</option>';if(chosen)localStorage.setItem(AI_MODEL_PREF_KEY,chosen);sel.onchange=()=>{localStorage.setItem(AI_MODEL_PREF_KEY,sel.value);const d=$('#flowAiModelHint');if(d)d.textContent=/qwen3-1\.7b/i.test(sel.value)?'Ressourcenschonende Voreinstellung für deinen X1.':'Für den nächsten KI-Lauf ausgewählt.'}}
  function setStatus(el,text,kind='neutral'){if(!el)return;el.className='ai-local-state '+kind;el.textContent=text}

  async function getAiStatus(){
    const label=$('#flowAiState'), detail=$('#flowAiDetail');
    setStatus(label,'Lokale KI wird geprüft …','neutral');
    if(detail)detail.textContent='';
    try{
      const r=await fetch(VAULT+'/ai/status',{cache:'no-store'}),x=await r.json();
      aiStatus=x;
      if(!x.online){setStatus(label,'Lokale KI offline','err');if(detail)detail.textContent='Bionic/LM Studio ist gerade nicht erreichbar. Starte die Local Model API und prüfe erneut.';return x}
      if(!x.model){setStatus(label,'Lokale KI erreichbar · kein Modell','warn');if(detail)detail.textContent='Es wurde noch kein lokales Chat-Modell gefunden.';return x}
      populateModelSelect(x);
      const chosen=selectedModel()||x.model;
      const loaded=(x.loadedModels||[]).some(m=>m===chosen||m.toLowerCase().includes(String(chosen).toLowerCase())||String(chosen).toLowerCase().includes(m.toLowerCase()));
      setStatus(label,loaded?'Lokale KI bereit · Modell geladen':'Lokale KI bereit','ok');
      if(detail)detail.textContent=`${chosen||x.model}${loaded?' · im Arbeitsspeicher':' · wird bei Bedarf geladen'} · nur localhost`;
      return x;
    }catch(e){
      aiStatus={online:false,error:e.message};setStatus(label,'Lokale KI nicht erreichbar','err');if(detail)detail.textContent='Der lokale KI-Dienst antwortet nicht.';return aiStatus
    }
  }

  async function ensureVaultInFlow(){
    if(!window.BDVault){alert('Vault-Modul wurde noch nicht geladen. Bitte Seite neu laden.');return false}
    const ok=await window.BDVault.ensureUnlocked();
    if(ok){
      await window.BDFlowManager?.loadVaultContext?.();
      await getAiStatus();
    }
    return ok;
  }

  async function ensureClientRecord(){
    const c=flowCurrent();if(!c)throw new Error('Kein aktueller Session Flow geöffnet.');
    if(!await ensureVaultInFlow())throw new Error('Secure Vault ist nicht entsperrt.');
    const ref=c.customerIdentityEmail||c.email;
    const x=await window.BDVault.request('/client?ref='+encodeURIComponent(ref));
    if(!x.exists){await window.BDVault.post('/client',{ref,displayName:c.name,overview:'',currentFocus:''})}
    return {...c,email:ref};
  }

  function renderPrepResult(x){
    const host=$('#flowAiPrepResult');if(!host)return;
    const r=x?.result||{}, sections=[];
    const add=(title,items)=>{items=nonEmpty(items);if(items.length)sections.push(`<section><h5>${esc(title)}</h5>${list(items)}</section>`)};
    add('Schlüsselthemen',r.keyThemes);add('Entwicklung',r.progress);add('Offene Themen',r.openTopics);add('Vereinbarungen prüfen',r.agreementsToCheck);add('Möglicher Fokus',r.suggestedFocus);add('Vorsicht / Unklar',r.cautions);
    const timing=timingText(x);
    const sparse=!sections.length;
    host.classList.remove('hidden');
    host.innerHTML=`<div class="ai-result-head"><div><span class="ai-local-pill">lokal erzeugt</span><strong>Vorbereitungsvorschlag</strong><small>${esc(x.model||'lokales Modell')} · ${Number(x.sourceSessionCount||0)} Sitzungen berücksichtigt${timing?' · '+esc(timing):''}</small></div><button class="mini" id="flowAiPrepClear" type="button">Ausblenden</button></div>
      <div class="ai-prep-brief">${esc(r.brief||'Keine belastbaren Inhalte ableitbar.')}</div>
      ${sections.length?`<div class="ai-grid">${sections.join('')}</div>`:''}
      ${sparse?'<p class="ai-sparse-note">Noch wenig Vault-Kontext vorhanden – deshalb zeigt die KI bewusst keine erfundenen Detailfelder.</p>':''}
      ${timing?`<div class="ai-timing">⏱ ${esc(timing)}</div>`:''}
      <p class="ai-disclaimer">Arbeitsentwurf der lokalen KI. Bitte fachlich prüfen; es wird dadurch noch nichts in der Dokumentation gespeichert.</p>`;
    $('#flowAiPrepClear').onclick=()=>host.classList.add('hidden');
  }

  function setJobProgress(host,stage,elapsed){
    if(!host)return;
    host.classList.remove('hidden');
    host.innerHTML=`<div class="ai-job-progress"><span class="ai-spinner" aria-hidden="true"></span><div><strong>${esc(stage||'Lokale KI arbeitet …')}</strong><small>läuft seit ${esc(fmtSeconds(elapsed||0))} · der Auftrag läuft lokal im Hintergrund weiter</small></div></div>`;
  }

  function setJobError(host,message){
    if(!host)return;
    host.classList.remove('hidden');
    host.innerHTML=`<div class="ai-inline-error"><strong>Das hat noch nicht geklappt.</strong><span>${esc(friendlyAiError(message))}</span><small>Deine Vault-Daten wurden dadurch nicht verändert.</small></div>`;
  }

  async function runAiJob(kind,body,btn,host,onDone){
    const old=btn.textContent;btn.disabled=true;
    let localTimer=null,start=Date.now();
    try{
      const created=await window.BDVault.post('/ai/job',{kind,...body});
      activeAiJob=created.jobId;
      setJobProgress(host,created.stage||'Lokale KI wird vorbereitet …',0);
      localTimer=setInterval(()=>setJobProgress(host,host?.dataset?.stage||'Lokale KI arbeitet …',(Date.now()-start)/1000),1000);
      for(;;){
        await sleep(1200);
        const job=await window.BDVault.request('/ai/job?id='+encodeURIComponent(created.jobId));
        if(host)host.dataset.stage=job.stage||'Lokale KI arbeitet …';
        setJobProgress(host,job.stage||'Lokale KI arbeitet …',job.elapsedSeconds||((Date.now()-start)/1000));
        if(job.state==='done'){
          clearInterval(localTimer);localTimer=null;activeAiJob=null;
          await getAiStatus();
          onDone(job.result||{});
          return;
        }
        if(job.state==='error'){
          throw new Error(job.error||'Lokale KI konnte den Auftrag nicht abschließen.');
        }
      }
    }catch(e){
      setJobError(host,e.message);
    }finally{
      if(localTimer)clearInterval(localTimer);
      activeAiJob=null;btn.disabled=false;btn.textContent=old;
    }
  }

  async function generatePrep(){
    const btn=$('#flowAiPrepBtn'),host=$('#flowAiPrepResult');if(!btn)return;
    try{
      const c=await ensureClientRecord();
      await runAiJob('prepare',{ref:c.email,model:selectedModel()},btn,host,renderPrepResult);
    }catch(e){setJobError(host,e.message)}
  }

  function draftSection(label,value){return `<section><h5>${esc(label)}</h5><p>${esc(value||'—')}</p></section>`}
  function renderDraft(x){
    aiDraft=x?.result||null;const host=$('#flowAiDraft');if(!host||!aiDraft)return;
    const r=aiDraft;
    host.classList.remove('hidden');
    host.innerHTML=`<div class="ai-result-head"><div><span class="ai-local-pill">Entwurf</span><strong>Strukturierte Sitzungsdokumentation</strong><small>${esc(x.model||'lokales Modell')}${timingText(x)?` · ${esc(timingText(x))}`:''}</small></div></div>
      <div class="ai-grid ai-draft-grid">
        ${draftSection('Fokus',r.focus)}${draftSection('Dynamik',r.dynamics)}
        <section><h5>Interventionen</h5>${list(r.interventions)}</section>
        ${draftSection('Reaktion / Entwicklung',r.response)}${draftSection('Vereinbarungen',r.agreements)}${draftSection('Nächster Fokus',r.nextFocus)}${draftSection('Vorbereitung für mich',r.privatePrep)}
        <section><h5>Unklarheiten</h5>${list(r.uncertainties)}</section>
      </div>
      ${timingText(x)?`<div class="ai-timing">⏱ ${esc(timingText(x))}</div>`:''}
      <div class="dialog-actions ai-approve-actions"><button class="btn ghost" id="flowAiDraftDiscard" type="button">Verwerfen</button><button class="btn primary" id="flowAiDraftApply" type="button">Entwurf in Felder übernehmen</button></div>
      <p class="ai-disclaimer">Die KI speichert nichts automatisch. Erst nach deiner Prüfung und dem normalen Speichern landet der Text im Vault.</p>`;
    $('#flowAiDraftDiscard').onclick=()=>{aiDraft=null;host.classList.add('hidden')};
    $('#flowAiDraftApply').onclick=applyDraft;
  }

  function applyDraft(){
    if(!aiDraft)return;
    const ids=['flowFocus','flowDynamics','flowInterventions','flowResponse','flowAgreements','flowNextFocus','flowPrivatePrep'];
    const hasExisting=ids.some(id=>String($('#'+id)?.value||'').trim());
    if(hasExisting&&!confirm('In den Dokumentationsfeldern stehen bereits Inhalte. Den KI-Entwurf darüber übernehmen?'))return;
    $('#flowFocus').value=aiDraft.focus||'';
    $('#flowDynamics').value=aiDraft.dynamics||'';
    $('#flowInterventions').value=Array.isArray(aiDraft.interventions)?aiDraft.interventions.join(', '):'';
    $('#flowResponse').value=aiDraft.response||'';
    $('#flowAgreements').value=aiDraft.agreements||'';
    $('#flowNextFocus').value=aiDraft.nextFocus||'';
    $('#flowPrivatePrep').value=aiDraft.privatePrep||'';scheduleDraftSave();
    $('#flowAiDraft').classList.add('hidden');
    $('#flowAiReviewNote').textContent='KI-Entwurf übernommen · bitte prüfen und bei Bedarf bearbeiten.';
    aiDraft=null;
  }

  async function structureNotes(){
    const raw=String($('#flowRawNotes')?.value||'').trim(),host=$('#flowAiDraft');if(raw.length<8){setJobError(host,'Gib zuerst ein paar Stichpunkte zur Sitzung ein.');return}
    const btn=$('#flowAiStructureBtn');
    try{
      const c=await ensureClientRecord();
      await runAiJob('structure',{ref:c.email,rawNotes:raw,model:selectedModel()},btn,host,renderDraft);
    }catch(e){setJobError(host,e.message)}
  }

  function dictationMessage(text,kind='ok'){const el=$('#flowDictationMessage');if(!el)return;el.className='ai-dictation-message '+kind;el.textContent=text||''}
  function dictationMime(){for(const type of ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'])if(window.MediaRecorder?.isTypeSupported?.(type))return type;return ''}
  async function dictationB64(blob){const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)));return btoa(binary)}
  async function uploadFlowChunk(blob,sequence,mime){await window.BDVault.post('/dictation/chunk',{id:activeDictation.id,sequence,mime,dataBase64:await dictationB64(blob)});const safety=$('#flowDictationSafety');if(safety)safety.textContent=`${sequence+1} Abschnitt${sequence?'e':''} verschlüsselt gespeichert.`}
  function clearDictationTimer(){if(dictationTimer){clearInterval(dictationTimer);dictationTimer=null}if(dictationPoll){clearTimeout(dictationPoll);dictationPoll=null}}
  function clearDictationProcessTimer(){if(dictationProcessTimer){clearInterval(dictationProcessTimer);dictationProcessTimer=null}}
  function startDictationProcessTimer(d){
    clearDictationProcessTimer();const el=$('#flowDictationTimer');if(!el)return;const started=Date.parse(d?.updatedAt||'')||Date.now();
    const tick=()=>{const seconds=Math.max(0,Math.floor((Date.now()-started)/1000));el.hidden=false;el.textContent=`Verarbeitung ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`};
    tick();dictationProcessTimer=setInterval(tick,1000);
  }
  function renderFlowDictation(d){
    const card=$('#flowDictationCard');if(!card)return;const hasText=!!(d?.editedTranscript||d?.originalTranscript),hasAudio=!!d?.audioAvailable,isLive=!!dictationRecorder&&['recording','paused'].includes(dictationRecorder.state),timer=$('#flowDictationTimer');
    $('#flowDictationState').textContent=d?({recording:isLive?'Aufnahme läuft':'Unterbrochene Aufnahme gefunden',saved:'Gespeicherte Aufnahme gefunden',transcribing:'Whisper Turbo arbeitet lokal …',draft:'Transkriptentwurf bereit',error:'Audio gesichert · Transkription fehlgeschlagen',accepted:'In Sitzung gespeichert'}[d.status]||d.status):'Noch keine Aufnahme';
    $('#flowDictationStart').hidden=!!d||!navigator.mediaDevices?.getUserMedia;$('#flowDictationNew').hidden=!d||d?.status==='transcribing'||d?.status==='accepted';$('#flowDictationTranscribe').hidden=!d||!hasAudio||!['saved','error','recording'].includes(d.status);$('#flowDictationRetry').hidden=!hasAudio||d?.status==='transcribing'||d?.status==='accepted';$('#flowDictationPlay').hidden=!hasAudio;$('#flowDictationDiscard').hidden=!d||d?.status==='accepted'||d?.status==='transcribing';$('#flowDictationAccept').hidden=!hasText||d?.status==='accepted';$('#flowDictationTranscriptPanel').hidden=!hasText;
    if(hasText&&!$('#flowDictationTranscript').matches(':focus'))$('#flowDictationTranscript').value=d.editedTranscript||d.originalTranscript||'';
    if(d?.status==='transcribing'){startDictationProcessTimer(d);clearTimeout(dictationPoll);dictationPoll=setTimeout(()=>reloadFlowDictation(),1200)}else{clearDictationProcessTimer();if(timer&&!isLive){timer.hidden=true;timer.textContent=''}}
    const safety=$('#flowDictationSafety');if(safety&&d?.chunkCount&&!isLive)safety.textContent=`${d.chunkCount} Abschnitt${d.chunkCount===1?'':'e'} verschlüsselt im lokalen Vault gespeichert.`;
    if(d?.status==='transcribing')dictationMessage('Whisper Turbo verarbeitet die gesicherte Aufnahme. Beim ersten Einsatz kann das Modell zunächst heruntergeladen werden; der Zähler läuft währenddessen sichtbar weiter.','working');else if(d?.status==='recording'&&!isLive)dictationMessage('Eine unterbrochene, lokal gesicherte Aufnahme wurde gefunden. Es läuft gerade keine Aufnahme. Du kannst sie transkribieren, löschen oder bewusst eine neue Aufnahme beginnen.','warn');else if(d?.status==='error')dictationMessage(d.error||'Die Aufnahme bleibt erhalten. Bitte erneut transkribieren.','error');else if(d?.status==='accepted')dictationMessage('Geprüft übernommen und in dieser Sitzung gespeichert. Die Rohnotizen bleiben unten sichtbar.','ok');else if(d?.status==='draft')dictationMessage('Bitte Transkript prüfen. Danach als Rohnotizen übernehmen und anschließend mit lokaler KI strukturieren.','ok');else if(d?.status==='saved')dictationMessage('Eine bereits gespeicherte Aufnahme wurde geöffnet. Es läuft gerade keine Aufnahme. Wähle „Transkribieren“ oder beginne bewusst eine neue Aufnahme.','warn');else if(!d)dictationMessage('Klicke auf „Aufnahme starten“. Der Timer erscheint erst, sobald das Mikrofon tatsächlich aufzeichnet.','ok');
  }
  async function reloadFlowDictation(){if(!activeDictation)return;try{const x=await window.BDVault.request('/dictation?id='+encodeURIComponent(activeDictation.id));activeDictation=x.dictation;renderFlowDictation(activeDictation)}catch(e){dictationMessage(e.message,'error')}}
  async function openFlowDictationInPlace(booking){
    const card=$('#flowDictationCard');if(!card)return false;if(!await ensureVaultInFlow())return false;const ref=booking.customerIdentityEmail||booking.email;
    try{const rows=(await window.BDVault.request('/dictations?ref='+encodeURIComponent(ref)+'&pending=true')).dictations||[];const existing=rows.find(d=>d.origin==='session'&&String(d.targetSessionId||'')===String(booking.eventId||''));activeDictation=existing?(await window.BDVault.request('/dictation?id='+encodeURIComponent(existing.id))).dictation:null;renderFlowDictation(activeDictation);return true}catch(e){dictationMessage(e.message,'error');return false}
  }
  async function startFlowDictation(){
    const booking=flowCurrent();if(!booking)return;const btn=$('#flowDictationStart');btn.disabled=true;
    try{await ensureVaultInFlow();const x=await window.BDVault.post('/dictation/start',{origin:'session',ref:booking.customerIdentityEmail||booking.email,displayName:booking.name,targetSessionId:booking.eventId,sessionDate:String(booking.start||'').slice(0,10),durationMinutes:60,contextLabel:`Sitzungsnotiz · ${booking.name}`,language:'de'});activeDictation=x.dictation;dictationSequence=0;dictationUpload=Promise.resolve();dictationSeconds=0;dictationStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});const mime=dictationMime();dictationRecorder=new MediaRecorder(dictationStream,mime?{mimeType:mime}:undefined);
      dictationRecorder.ondataavailable=e=>{if(e.data?.size){const n=dictationSequence++;dictationUpload=dictationUpload.then(()=>uploadFlowChunk(e.data,n,dictationRecorder.mimeType||e.data.type||'audio/webm')).catch(err=>dictationMessage('Ein Aufnahmeabschnitt konnte nicht gespeichert werden: '+err.message,'error'))}};
      dictationRecorder.onstop=async()=>{clearDictationTimer();dictationStream?.getTracks().forEach(t=>t.stop());dictationStream=null;try{await dictationUpload;await window.BDVault.post('/dictation/finalize',{id:activeDictation.id,language:'de',transcribe:false});dictationMessage('Aufnahme gesichert. Klicke jetzt auf „Transkribieren“.','ok');await reloadFlowDictation()}catch(e){dictationMessage('Die Aufnahme bleibt lokal erhalten. '+e.message,'error')}};
      dictationRecorder.start(5000);const timer=$('#flowDictationTimer');if(timer){timer.hidden=false;timer.textContent='Aufnahme 0:00'};dictationTimer=setInterval(()=>{dictationSeconds++;const el=$('#flowDictationTimer');if(el)el.textContent=`Aufnahme ${Math.floor(dictationSeconds/60)}:${String(dictationSeconds%60).padStart(2,'0')}`},1000);$('#flowDictationStart').hidden=true;$('#flowDictationNew').hidden=true;$('#flowDictationStop').hidden=false;$('#flowDictationPause').hidden=false;$('#flowDictationState').textContent='● Aufnahme läuft';$('#flowDictationCard')?.classList.add('is-recording');$('#flowInlineMic')?.classList.add('is-recording');dictationMessage('Aufnahme läuft – sprich frei. Jeder Abschnitt wird sofort verschlüsselt gespeichert.','ok');
    }catch(e){dictationMessage(e.message==='Permission denied'?'Mikrofonzugriff wurde nicht erlaubt.':e.message,'error')}finally{btn.disabled=false}
  }
  function stopFlowDictation(){if(dictationRecorder&&dictationRecorder.state!=='inactive')dictationRecorder.stop();$('#flowDictationStop').hidden=true;$('#flowDictationPause').hidden=true;$('#flowDictationCard')?.classList.remove('is-recording');$('#flowInlineMic')?.classList.remove('is-recording')}
  async function acceptFlowDictation(){if(!activeDictation)return;const text=String($('#flowDictationTranscript').value||'').trim();if(text.length<2){dictationMessage('Bitte zuerst einen Text prüfen.','error');return}const raw=$('#flowRawNotes'),existing=String(raw?.value||'').trim();if(existing&&existing!==text&&!confirm('Die vorhandenen Rohnotizen durch das geprüfte Transkript ersetzen?'))return;try{await window.BDVault.post('/dictation/update',{id:activeDictation.id,editedTranscript:text});const x=await window.BDVault.post('/dictation/accept',{id:activeDictation.id,autoDeleteAudio:$('#flowDictationAutoDelete').checked});activeDictation=x.dictation;if(raw)raw.value=text;scheduleDraftSave();renderFlowDictation(activeDictation);$('#flowDictationCard').hidden=true;$('#flowAiReviewNote').textContent='Transkript übernommen · jetzt „Mit lokaler KI strukturieren“ wählen, Entwurf prüfen und anschließend speichern.';raw?.scrollIntoView({behavior:'smooth',block:'center'});$('#flowAiStructureBtn')?.focus()}catch(e){dictationMessage(e.message,'error')}}
  async function playFlowDictation(){if(!activeDictation)return;try{const blob=await window.BDVault.request('/dictation/audio?id='+encodeURIComponent(activeDictation.id)+'&playback=1');if(dictationAudioUrl)URL.revokeObjectURL(dictationAudioUrl);dictationAudioUrl=URL.createObjectURL(blob);const audio=$('#flowDictationAudio');audio.src=dictationAudioUrl;audio.hidden=false;await audio.play()}catch(e){dictationMessage(e.message,'error')}}
  async function beginFlowTranscription(){if(!activeDictation)return;const previous={...activeDictation};activeDictation={...activeDictation,status:'transcribing',updatedAt:new Date().toISOString(),error:''};renderFlowDictation(activeDictation);try{await window.BDVault.post('/dictation/transcribe',{id:activeDictation.id,language:'de'});await reloadFlowDictation()}catch(e){activeDictation=previous;renderFlowDictation(activeDictation);dictationMessage(e.message,'error')}}
  async function retryFlowDictation(){await beginFlowTranscription()}
  async function transcribeFlowDictation(){await beginFlowTranscription()}
  async function startNewFlowDictation(){if(activeDictation?.status==='transcribing'){dictationMessage('Bitte warte, bis die laufende Transkription beendet ist.','warn');return}if(activeDictation&&!confirm('Die vorhandene Aufnahme samt Entwurf löschen und eine neue Aufnahme beginnen?'))return;try{if(activeDictation)await window.BDVault.request('/dictation?id='+encodeURIComponent(activeDictation.id)+'&scope=all',{method:'DELETE'});activeDictation=null;renderFlowDictation(null);await startFlowDictation()}catch(e){dictationMessage(e.message,'error')}}
  async function discardFlowDictation(){if(!activeDictation||!confirm('Dieses Diktat inklusive Aufnahme und Entwurf löschen?'))return;try{await window.BDVault.request('/dictation?id='+encodeURIComponent(activeDictation.id)+'&scope=all',{method:'DELETE'});activeDictation=null;renderFlowDictation(null);dictationMessage('Diktat gelöscht.','ok')}catch(e){dictationMessage(e.message,'error')}}
  function draftPayload(){const c=flowCurrent();if(!c)return null;return {id:c.eventId,ref:c.customerIdentityEmail||c.email,displayName:c.name,date:String(c.start||'').slice(0,10),durationMinutes:60,dictatedNote:$('#flowRawNotes')?.value||'',focus:$('#flowFocus')?.value||'',dynamics:$('#flowDynamics')?.value||'',interventions:String($('#flowInterventions')?.value||'').split(',').map(x=>x.trim()).filter(Boolean),response:$('#flowResponse')?.value||'',agreements:$('#flowAgreements')?.value||'',nextFocus:$('#flowNextFocus')?.value||'',privatePrep:$('#flowPrivatePrep')?.value||''}}
  function scheduleDraftSave(){clearTimeout(draftSaveTimer);draftSaveTimer=setTimeout(async()=>{const st=window.BDVault?.status?.(),payload=draftPayload();if(!payload||!st?.unlocked)return;try{await window.BDVault.post('/session-draft',payload);const note=$('#flowDraftSaveState');if(note)note.textContent='Entwurf automatisch lokal gespeichert'}catch(e){const note=$('#flowDraftSaveState');if(note)note.textContent='Entwurf konnte noch nicht gespeichert werden'}},700)}
  async function clearFlowDraft(){const c=flowCurrent();if(!c)return;try{await window.BDVault.request('/session-draft?id='+encodeURIComponent(c.eventId)+'&ref='+encodeURIComponent(c.customerIdentityEmail||c.email),{method:'DELETE'})}catch(e){}}

  function injectUi(){
    const prep=$('#flowPanePrep'),post=$('#flowPanePost');if(!prep||!post||$('#flowAiPrepCard'))return;
    const hero=prep.querySelector('.flow-hero');
    hero?.insertAdjacentHTML('afterend',`<section class="flow-ai-card" id="flowAiPrepCard"><div class="flow-ai-head"><div><p class="eyebrow">Lokale KI · Vorbereitung</p><h3>Sitzung kompakt ins Gedächtnis holen</h3><p class="muted">Der Secure Vault stellt nur lokal gespeicherte Ziele und frühere Sitzungen bereit. Die Verarbeitung läuft über deine lokale Bionic/LM-Studio-API.</p></div><div class="flow-ai-status"><span id="flowAiState" class="ai-local-state neutral">Noch nicht geprüft</span><small id="flowAiDetail"></small></div></div><div class="ai-model-row"><label><span>Lokales Modell</span><select id="flowAiModel"><option>Modelle werden geladen …</option></select></label><small id="flowAiModelHint">Qwen3-1.7B wird bevorzugt. Andere lokale Modelle kannst du bei Bedarf auswählen.</small></div><div class="dialog-actions" style="justify-content:flex-start"><button class="btn primary" id="flowAiPrepBtn" type="button">✨ Mit lokaler KI vorbereiten</button><button class="btn ghost" id="flowAiRefresh" type="button">KI-Status prüfen</button></div><div id="flowAiPrepResult" class="ai-result hidden"></div><div class="ai-privacy">🔒 Lokal verarbeitet · keine Beratungsinhalte werden für diese Funktion an Cloudflare gesendet. Auch längere KI-Läufe werden nicht mehr durch einen Browser-Timeout abgebrochen.</div></section>`);

    const status=post.querySelector('#flowPostVaultStatus');
    status?.insertAdjacentHTML('afterend',`<section class="flow-ai-card flow-dictation-card" id="flowDictationCard"><div class="flow-ai-head"><div><p class="eyebrow">Lokale Spracheingabe</p><h3>Stichpunkte direkt aus dem Diktat übernehmen</h3><p class="muted">Die Aufnahme bleibt verschlüsselt im lokalen Vault. Danach startest du die Transkription, prüfst den Text und übernimmst ihn als Rohnotizen.</p></div><span class="ai-local-state neutral" id="flowDictationState">Noch keine Aufnahme</span></div><div class="flow-dictation-controls"><button class="btn primary" id="flowDictationStart" type="button">🎙 Aufnahme starten</button><button class="btn ghost" id="flowDictationNew" type="button" hidden>Neue Aufnahme beginnen</button><button class="btn ghost" id="flowDictationPause" type="button" hidden>Pause</button><button class="btn secondary" id="flowDictationStop" type="button" hidden>Aufnahme beenden</button><button class="btn secondary" id="flowDictationTranscribe" type="button" hidden>Transkribieren</button><span id="flowDictationTimer" class="flow-dictation-timer" hidden></span></div><small id="flowDictationSafety" class="muted">Jeder Abschnitt wird sofort verschlüsselt gespeichert.</small><div id="flowDictationMessage" class="ai-dictation-message"></div><section id="flowDictationTranscriptPanel" class="ai-result" hidden><div class="ai-result-head"><div><span class="ai-local-pill">Prüfen</span><strong>Transkriptentwurf</strong></div></div><textarea id="flowDictationTranscript" rows="8" placeholder="Das lokale Whisper-Transkript erscheint hier."></textarea><label class="flow-dictation-check"><input id="flowDictationAutoDelete" type="checkbox" checked><span>Audio nach erfolgreicher Übernahme löschen</span></label><div class="dialog-actions" style="justify-content:flex-start"><button class="btn ghost" id="flowDictationPlay" type="button" hidden>Aufnahme anhören</button><button class="btn ghost" id="flowDictationRetry" type="button" hidden>Erneut transkribieren</button><button class="btn ghost danger" id="flowDictationDiscard" type="button" hidden>Diktat löschen</button><button class="btn primary" id="flowDictationAccept" type="button" hidden>Geprüft als Rohnotizen übernehmen</button></div><audio id="flowDictationAudio" controls hidden></audio></section></section>`);
    status?.insertAdjacentHTML('afterend',`<section class="flow-ai-card ai-notes-card"><div class="flow-ai-head"><div><p class="eyebrow">Lokale KI · Nachbereitung</p><h3>Aus Stichpunkten einen Dokumentationsentwurf machen</h3><p class="muted">Schreibe so roh, wie es für dich schnell geht. Die lokale KI strukturiert nur einen Entwurf; du entscheidest, was übernommen wird.</p></div><span id="flowDraftSaveState" class="ai-local-state neutral">Noch nicht bearbeitet</span></div><label class="flow-field"><span>Rohnotizen / Stichpunkte <button class="inline-mic" id="flowInlineMic" type="button" title="Diktat starten">🎙</button></span><textarea id="flowRawNotes" rows="6" placeholder="z. B. Konflikt um Date, Sicherheit vs. Kontrolle, Skalierung gemacht, Vereinbarung …"></textarea></label><div class="dialog-actions" style="justify-content:flex-start"><button class="btn primary" id="flowAiStructureBtn" type="button">✨ Mit lokaler KI strukturieren</button></div><div id="flowAiDraft" class="ai-result hidden"></div><p id="flowAiReviewNote" class="ai-review-note"></p><div class="ai-privacy">🔒 Rohnotizen → Secure Vault → lokale KI auf diesem Computer → Entwurf zurück in diese Maske.</div></section>`);

    // Keep microphone, recording state, timer and transcript in one visual place.
    // The previous layout inserted the recorder after the complete AI result and
    // made users scroll away from the active microphone to find the stop button.
    const rawField=$('#flowRawNotes')?.closest('.flow-field'),dictationCard=$('#flowDictationCard');
    if(rawField&&dictationCard)rawField.insertAdjacentElement('afterend',dictationCard);

    $('#flowAiPrepBtn').onclick=generatePrep;$('#flowAiRefresh').onclick=getAiStatus;$('#flowAiStructureBtn').onclick=structureNotes;$('#flowDictationStart').onclick=startFlowDictation;$('#flowDictationNew').onclick=startNewFlowDictation;$('#flowDictationStop').onclick=stopFlowDictation;$('#flowDictationTranscribe').onclick=transcribeFlowDictation;$('#flowDictationAccept').onclick=acceptFlowDictation;$('#flowDictationPlay').onclick=playFlowDictation;$('#flowDictationRetry').onclick=retryFlowDictation;$('#flowDictationDiscard').onclick=discardFlowDictation;$('#flowDictationPause').onclick=()=>{if(!dictationRecorder)return;if(dictationRecorder.state==='recording'){dictationRecorder.pause();clearDictationTimer();$('#flowDictationPause').textContent='Fortsetzen'}else if(dictationRecorder.state==='paused'){dictationRecorder.resume();$('#flowDictationPause').textContent='Pause';dictationTimer=setInterval(()=>{dictationSeconds++;const el=$('#flowDictationTimer');if(el)el.textContent=`Aufnahme ${Math.floor(dictationSeconds/60)}:${String(dictationSeconds%60).padStart(2,'0')}`},1000)}};
    $('#flowDictationCard').hidden=true;
    $('#flowInlineMic').onclick=async()=>{const ok=await openFlowDictationInPlace(flowCurrent());if(ok){const card=$('#flowDictationCard');card.hidden=false;card.scrollIntoView({behavior:'smooth',block:'center'});if(!activeDictation)await startFlowDictation();else renderFlowDictation(activeDictation)}};
    ['flowRawNotes','flowFocus','flowDynamics','flowInterventions','flowResponse','flowAgreements','flowNextFocus','flowPrivatePrep'].forEach(id=>$('#'+id)?.addEventListener('input',scheduleDraftSave));
    document.addEventListener('bd:session-saved',async()=>{const p=draftPayload();if(p&&window.BDVault?.status?.()?.unlocked){try{await window.BDVault.post('/session',p)}catch(e){}}await clearFlowDraft()},{once:false});
    getAiStatus();
  }

  function polishVaultState(){
    const st=window.BDVault?.status?.()||{},host=$('#flowVaultContext'),badge=host?.querySelector('.flow-local-status'),post=$('#flowPostVaultStatus .flow-local-status');
    const gate=$('#flowPostVaultStatus');
    if(st.ok&&st.unlocked){if(badge){badge.textContent='Vault entsperrt · lokal';badge.classList.add('ok')}if(post)post.textContent='✓ Vault entsperrt · Notizen werden ausschließlich lokal gespeichert.';if(gate&&!gate.querySelector('#flowUnlockInline'))gate.innerHTML='<span class="flow-local-status ok">✓ Vault entsperrt · lokale Speicherung bereit.</span>';if($('#flowInlineMic')){$('#flowInlineMic').disabled=false;$('#flowInlineMic').title='Diktat starten'};['flowRawNotes','flowFocus','flowDynamics','flowInterventions','flowResponse','flowAgreements','flowNextFocus','flowPrivatePrep','flowAiStructureBtn'].forEach(id=>{const el=$('#'+id);if(el)el.disabled=false})}
    else {if(gate)gate.innerHTML=`<span class="flow-local-status err">🔒 Vault ${st.ok?'ist gesperrt':'ist nicht erreichbar'} – Dokumentation und Autosave sind blockiert.</span><button class="mini edit" id="flowUnlockInline" type="button">Vault entsperren</button>`;if($('#flowInlineMic')){$('#flowInlineMic').disabled=true;$('#flowInlineMic').title='Vault zuerst entsperren'};['flowRawNotes','flowFocus','flowDynamics','flowInterventions','flowResponse','flowAgreements','flowNextFocus','flowPrivatePrep','flowAiStructureBtn'].forEach(id=>{const el=$('#'+id);if(el)el.disabled=true});$('#flowUnlockInline')?.addEventListener('click',()=>ensureVaultInFlow(),{once:true})}
    const b=$('#flowOpenVault');if(b)b.textContent=st.ok?'Vault hier entsperren →':'Vault ist offline · Hilfe anzeigen →';
  }

  function installUnlockInterceptor(){
    document.addEventListener('click',async e=>{
      const t=e.target?.closest?.('#flowOpenVault');if(!t)return;
      e.preventDefault();e.stopImmediatePropagation();
      await ensureVaultInFlow();
    },true);
  }

  function watchDialog(){
    const dlg=$('#flowDialog');if(!dlg)return;
    dialogObserver?.disconnect();dialogObserver=new MutationObserver(()=>{if(dlg.open){getAiStatus();setTimeout(polishVaultState,80)}});
    dialogObserver.observe(dlg,{attributes:true,attributeFilter:['open']});
  }

  window.BDFlowDictation={open:openFlowDictationInPlace};
  function init(){injectUi();installUnlockInterceptor();watchDialog();setTimeout(polishVaultState,120);const h=$('#flowVaultContext');if(h)new MutationObserver(()=>setTimeout(polishVaultState,0)).observe(h,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();
