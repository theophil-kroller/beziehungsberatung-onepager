(function(){
  'use strict';
  const VAULT='http://127.0.0.1:47831';
  let aiStatus=null, aiDraft=null, dialogObserver=null;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function flowCurrent(){return window.BDFlowManager?.getCurrent?.()||null}
  function list(items){return Array.isArray(items)&&items.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="muted micro">—</p>'}
  function setStatus(el,text,kind='neutral'){if(!el)return;el.className='ai-local-state '+kind;el.textContent=text}

  async function getAiStatus(){
    const label=$('#flowAiState'), detail=$('#flowAiDetail');
    setStatus(label,'Lokale KI wird geprüft …','neutral');
    if(detail)detail.textContent='';
    try{
      const r=await fetch(VAULT+'/ai/status',{cache:'no-store'}),x=await r.json();
      aiStatus=x;
      if(!x.online){setStatus(label,'Lokale KI offline','err');if(detail)detail.textContent='Starte in Bionic/LM Studio die Local Model API auf localhost:1234 und prüfe erneut.';return x}
      if(!x.model){setStatus(label,'Local API erreichbar · kein Modell','warn');if(detail)detail.textContent='Lade bzw. aktiviere ein lokales Modell und prüfe erneut.';return x}
      setStatus(label,'Lokale KI bereit','ok');
      if(detail)detail.textContent=`Modell: ${x.model} · ${x.localOnly?'nur localhost':'Remote-Endpunkt'}`;
      return x;
    }catch(e){
      aiStatus={online:false,error:e.message};setStatus(label,'Lokale KI nicht erreichbar','err');if(detail)detail.textContent='Der Secure Vault ist nicht gestartet oder die lokale AI-Prüfung ist fehlgeschlagen.';return aiStatus
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
    const r=x?.result||{};
    host.classList.remove('hidden');
    host.innerHTML=`<div class="ai-result-head"><div><span class="ai-local-pill">lokal erzeugt</span><strong>Vorbereitungsvorschlag</strong><small>${esc(x.model||'lokales Modell')} · ${Number(x.sourceSessionCount||0)} Sitzungen berücksichtigt</small></div><button class="mini" id="flowAiPrepClear" type="button">Ausblenden</button></div>
      <div class="ai-prep-brief">${esc(r.brief||'')}</div>
      <div class="ai-grid">
        <section><h5>Schlüsselthemen</h5>${list(r.keyThemes)}</section>
        <section><h5>Entwicklung</h5>${list(r.progress)}</section>
        <section><h5>Offene Themen</h5>${list(r.openTopics)}</section>
        <section><h5>Vereinbarungen prüfen</h5>${list(r.agreementsToCheck)}</section>
        <section><h5>Möglicher Fokus</h5>${list(r.suggestedFocus)}</section>
        <section><h5>Vorsicht / Unklar</h5>${list(r.cautions)}</section>
      </div>
      <p class="ai-disclaimer">Arbeitsentwurf der lokalen KI. Bitte fachlich prüfen; es wird dadurch noch nichts in der Dokumentation gespeichert.</p>`;
    $('#flowAiPrepClear').onclick=()=>host.classList.add('hidden');
  }

  async function generatePrep(){
    const btn=$('#flowAiPrepBtn');if(!btn)return;btn.disabled=true;const old=btn.textContent;btn.textContent='Lokale KI arbeitet …';
    try{
      const c=await ensureClientRecord();
      const x=await window.BDVault.post('/ai/prepare',{ref:c.email});
      renderPrepResult(x);
    }catch(e){alert(e.message)}finally{btn.disabled=false;btn.textContent=old}
  }

  function draftSection(label,value){return `<section><h5>${esc(label)}</h5><p>${esc(value||'—')}</p></section>`}
  function renderDraft(x){
    aiDraft=x?.result||null;const host=$('#flowAiDraft');if(!host||!aiDraft)return;
    const r=aiDraft;
    host.classList.remove('hidden');
    host.innerHTML=`<div class="ai-result-head"><div><span class="ai-local-pill">Entwurf</span><strong>Strukturierte Sitzungsdokumentation</strong><small>${esc(x.model||'lokales Modell')}</small></div></div>
      <div class="ai-grid ai-draft-grid">
        ${draftSection('Fokus',r.focus)}${draftSection('Dynamik',r.dynamics)}
        <section><h5>Interventionen</h5>${list(r.interventions)}</section>
        ${draftSection('Reaktion / Entwicklung',r.response)}${draftSection('Vereinbarungen',r.agreements)}${draftSection('Nächster Fokus',r.nextFocus)}${draftSection('Vorbereitung für mich',r.privatePrep)}
        <section><h5>Unklarheiten</h5>${list(r.uncertainties)}</section>
      </div>
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
    const raw=String($('#flowRawNotes')?.value||'').trim();if(raw.length<8){alert('Gib zuerst ein paar Stichpunkte zur Sitzung ein.');return}
    const btn=$('#flowAiStructureBtn');btn.disabled=true;const old=btn.textContent;btn.textContent='Lokale KI strukturiert …';
    try{
      const c=await ensureClientRecord();
      const x=await window.BDVault.post('/ai/structure',{ref:c.email,rawNotes:raw});
      renderDraft(x);
    }catch(e){alert(e.message)}finally{btn.disabled=false;btn.textContent=old}
  }

  function injectUi(){
    const prep=$('#flowPanePrep'),post=$('#flowPanePost');if(!prep||!post||$('#flowAiPrepCard'))return;
    const hero=prep.querySelector('.flow-hero');
    hero?.insertAdjacentHTML('afterend',`<section class="flow-ai-card" id="flowAiPrepCard"><div class="flow-ai-head"><div><p class="eyebrow">Lokale KI · Vorbereitung</p><h3>Sitzung kompakt ins Gedächtnis holen</h3><p class="muted">Der Secure Vault stellt nur lokal gespeicherte Ziele und frühere Sitzungen bereit. Die Verarbeitung läuft über deine lokale Bionic/LM-Studio-API.</p></div><div class="flow-ai-status"><span id="flowAiState" class="ai-local-state neutral">Noch nicht geprüft</span><small id="flowAiDetail"></small></div></div><div class="dialog-actions" style="justify-content:flex-start"><button class="btn primary" id="flowAiPrepBtn" type="button">✨ Mit lokaler KI vorbereiten</button><button class="btn ghost" id="flowAiRefresh" type="button">KI-Status prüfen</button></div><div id="flowAiPrepResult" class="ai-result hidden"></div><div class="ai-privacy">🔒 Lokal verarbeitet · keine Beratungsinhalte werden für diese Funktion an Cloudflare gesendet.</div></section>`);

    const status=post.querySelector('#flowPostVaultStatus');
    status?.insertAdjacentHTML('afterend',`<section class="flow-ai-card ai-notes-card"><div class="flow-ai-head"><div><p class="eyebrow">Lokale KI · Nachbereitung</p><h3>Aus Stichpunkten einen Dokumentationsentwurf machen</h3><p class="muted">Schreibe so roh, wie es für dich schnell geht. Die lokale KI strukturiert nur einen Entwurf; du entscheidest, was übernommen wird.</p></div></div><label class="flow-field"><span>Rohnotizen / Stichpunkte</span><textarea id="flowRawNotes" rows="6" placeholder="z. B. Konflikt um Date, Sicherheit vs. Kontrolle, Skalierung gemacht, Vereinbarung …"></textarea></label><div class="dialog-actions" style="justify-content:flex-start"><button class="btn primary" id="flowAiStructureBtn" type="button">✨ Mit lokaler KI strukturieren</button></div><div id="flowAiDraft" class="ai-result hidden"></div><p id="flowAiReviewNote" class="ai-review-note"></p><div class="ai-privacy">🔒 Rohnotizen → Secure Vault → lokale KI auf diesem Computer → Entwurf zurück in diese Maske.</div></section>`);

    $('#flowAiPrepBtn').onclick=generatePrep;$('#flowAiRefresh').onclick=getAiStatus;$('#flowAiStructureBtn').onclick=structureNotes;
    getAiStatus();
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
    dialogObserver?.disconnect();dialogObserver=new MutationObserver(()=>{if(dlg.open){getAiStatus();setTimeout(()=>{const btn=$('#flowOpenVault');if(btn)btn.textContent='Vault hier entsperren →'},60)}});
    dialogObserver.observe(dlg,{attributes:true,attributeFilter:['open']});
  }

  function init(){injectUi();installUnlockInterceptor();watchDialog()}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
})();
