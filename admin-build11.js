(function(){
  'use strict';
  const VAULT='http://127.0.0.1:47831';
  let aiStatus=null, aiDraft=null, dialogObserver=null, activeAiJob=null;
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
    const x=await window.BDVault.request('/client?ref='+encodeURIComponent(c.email));
    if(!x.exists){await window.BDVault.post('/client',{ref:c.email,displayName:c.name,overview:'',currentFocus:''})}
    return c;
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
    $('#flowPrivatePrep').value=aiDraft.privatePrep||'';
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

  function injectUi(){
    const prep=$('#flowPanePrep'),post=$('#flowPanePost');if(!prep||!post||$('#flowAiPrepCard'))return;
    const hero=prep.querySelector('.flow-hero');
    hero?.insertAdjacentHTML('afterend',`<section class="flow-ai-card" id="flowAiPrepCard"><div class="flow-ai-head"><div><p class="eyebrow">Lokale KI · Vorbereitung</p><h3>Sitzung kompakt ins Gedächtnis holen</h3><p class="muted">Der Secure Vault stellt nur lokal gespeicherte Ziele und frühere Sitzungen bereit. Die Verarbeitung läuft über deine lokale Bionic/LM-Studio-API.</p></div><div class="flow-ai-status"><span id="flowAiState" class="ai-local-state neutral">Noch nicht geprüft</span><small id="flowAiDetail"></small></div></div><div class="ai-model-row"><label><span>Lokales Modell</span><select id="flowAiModel"><option>Modelle werden geladen …</option></select></label><small id="flowAiModelHint">Qwen3-1.7B wird bevorzugt. Andere lokale Modelle kannst du bei Bedarf auswählen.</small></div><div class="dialog-actions" style="justify-content:flex-start"><button class="btn primary" id="flowAiPrepBtn" type="button">✨ Mit lokaler KI vorbereiten</button><button class="btn ghost" id="flowAiRefresh" type="button">KI-Status prüfen</button></div><div id="flowAiPrepResult" class="ai-result hidden"></div><div class="ai-privacy">🔒 Lokal verarbeitet · keine Beratungsinhalte werden für diese Funktion an Cloudflare gesendet. Auch längere KI-Läufe werden nicht mehr durch einen Browser-Timeout abgebrochen.</div></section>`);

    const status=post.querySelector('#flowPostVaultStatus');
    status?.insertAdjacentHTML('afterend',`<section class="flow-ai-card ai-notes-card"><div class="flow-ai-head"><div><p class="eyebrow">Lokale KI · Nachbereitung</p><h3>Aus Stichpunkten einen Dokumentationsentwurf machen</h3><p class="muted">Schreibe so roh, wie es für dich schnell geht. Die lokale KI strukturiert nur einen Entwurf; du entscheidest, was übernommen wird.</p></div></div><label class="flow-field"><span>Rohnotizen / Stichpunkte</span><textarea id="flowRawNotes" rows="6" placeholder="z. B. Konflikt um Date, Sicherheit vs. Kontrolle, Skalierung gemacht, Vereinbarung …"></textarea></label><div class="dialog-actions" style="justify-content:flex-start"><button class="btn primary" id="flowAiStructureBtn" type="button">✨ Mit lokaler KI strukturieren</button></div><div id="flowAiDraft" class="ai-result hidden"></div><p id="flowAiReviewNote" class="ai-review-note"></p><div class="ai-privacy">🔒 Rohnotizen → Secure Vault → lokale KI auf diesem Computer → Entwurf zurück in diese Maske.</div></section>`);

    $('#flowAiPrepBtn').onclick=generatePrep;$('#flowAiRefresh').onclick=getAiStatus;$('#flowAiStructureBtn').onclick=structureNotes;
    getAiStatus();
  }

  function polishVaultState(){
    const st=window.BDVault?.status?.()||{},host=$('#flowVaultContext'),badge=host?.querySelector('.flow-local-status'),post=$('#flowPostVaultStatus .flow-local-status');
    if(st.ok&&st.unlocked){if(badge){badge.textContent='Vault entsperrt · lokal';badge.classList.add('ok')}if(post)post.textContent='✓ Vault entsperrt · Notizen werden ausschließlich lokal gespeichert.'}
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

  function init(){injectUi();installUnlockInterceptor();watchDialog();setTimeout(polishVaultState,120);const h=$('#flowVaultContext');if(h)new MutationObserver(()=>setTimeout(polishVaultState,0)).observe(h,{childList:true,subtree:true})}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
})();
