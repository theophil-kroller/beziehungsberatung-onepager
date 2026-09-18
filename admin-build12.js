(function(){
  'use strict';
  const API=(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1';
  let pollTimer=null,lastIntelligence=null;
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtSeconds=s=>{s=Math.max(0,Number(s||0));return s<60?`${s.toFixed(s<10?1:0)} s`:`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')} min`};
  const fmtDateTime=x=>x?new Intl.DateTimeFormat('de-AT',{timeZone:'Europe/Vienna',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(x)):'—';
  const money=c=>new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(Number(c||0)/100);
  const current=()=>window.BDFlowManager?.getCurrent?.()||null;
  const isFlowOpen=()=>!!$('#flowDialog')?.open;
  const list=a=>Array.isArray(a)&&a.filter(Boolean).length?`<ul>${a.filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';

  function ensureUi(){
    const prep=$('#flowAiPrepCard');
    if(prep&&!$('#flowPracticeIntelligence')){
      prep.insertAdjacentHTML('afterend',`<section class="flow-intelligence-card" id="flowPracticeIntelligence"><div class="flow-intelligence-head"><div><p class="eyebrow">Practice Intelligence · Hintergrund</p><h3>Vorbereitet, bevor du es brauchst</h3><p class="muted">Nach dem Speichern einer Sitzung erstellt der lokale Vault automatisch eine Arbeitszusammenfassung. Danach wird die nächste Vorbereitung im Hintergrund aktualisiert.</p></div><span id="flowIntelligenceState" class="ai-local-state neutral">Noch nicht geprüft</span></div><div id="flowIntelligenceBody" class="flow-intelligence-body"><p class="muted micro">Vault entsperren, um vorbereitete Inhalte zu sehen.</p></div></section>`);
    }
    const next=$('#flowNextActions');
    if(next&&!$('#flowCashShortcut')){
      next.insertAdjacentHTML('afterend',`<section class="flow-cash-shortcut" id="flowCashShortcut"><div><strong>Barzahlung nach der Sitzung?</strong><span>Eine offene Rechnung kann hier direkt als bar bezahlt verbucht werden.</span></div><button class="btn secondary" id="flowCashBtn" type="button">💶 Barzahlung erfassen</button><small id="flowCashMsg"></small></section>`);
      $('#flowCashBtn').onclick=openCashDialog;
    }
  }

  function renderCachedPreparation(cached){
    if(!cached?.result)return '';
    const r=cached.result,parts=[];
    const add=(title,a)=>{if(Array.isArray(a)&&a.filter(Boolean).length)parts.push(`<section><h5>${esc(title)}</h5>${list(a)}</section>`)};
    add('Schlüsselthemen',r.keyThemes);add('Entwicklung',r.progress);add('Offene Themen',r.openTopics);add('Vereinbarungen prüfen',r.agreementsToCheck);add('Möglicher Fokus',r.suggestedFocus);
    const timing=[cached.processingSeconds?`KI ${fmtSeconds(cached.processingSeconds)}`:'',cached.modelLoadSeconds?`Laden ${fmtSeconds(cached.modelLoadSeconds)}`:''].filter(Boolean).join(' · ');
    return `<div class="flow-cached-prep"><div class="flow-cached-head"><div><span class="ai-local-pill">bereits vorbereitet</span><strong>Vorbereitung liegt bereit</strong><small>${esc(fmtDateTime(cached.updatedAt))} · ${esc(cached.model||'lokales Modell')}${timing?' · '+esc(timing):''}</small></div></div><p>${esc(r.brief||'')}</p>${parts.length?`<div class="ai-grid">${parts.join('')}</div>`:''}<p class="micro muted">Arbeitsentwurf der lokalen KI. Originaldokumentation bleibt unverändert.</p></div>`;
  }

  function renderIntelligence(x){
    lastIntelligence=x;const state=$('#flowIntelligenceState'),body=$('#flowIntelligenceBody');if(!state||!body)return;
    const pending=Number(x?.pendingJobs||0),jobs=x?.jobs||[],summaries=x?.summaries||[];
    if(pending){state.className='ai-local-state warn';state.textContent=`${pending} Hintergrundauftrag${pending===1?'':'e'}`}
    else{state.className='ai-local-state ok';state.textContent='Hintergrund bereit'}
    const active=jobs.find(j=>['running','queued','waiting'].includes(j.state));
    const jobHtml=active?`<div class="flow-bg-job ${active.state}"><span class="ai-spinner" aria-hidden="true"></span><div><strong>${esc(active.stage||'Hintergrund-KI arbeitet …')}</strong><small>${active.kind==='summary'?'Sitzungszusammenfassung':active.kind==='prepare_cached'?'Vorbereitung aktualisieren':esc(active.kind)}${active.model?' · '+esc(active.model):''}</small></div></div>`:'';
    const latest=summaries[0];
    const summaryHtml=latest?`<div class="flow-summary-ready"><strong>Letzte KI-Arbeitszusammenfassung</strong><span>${esc(String(latest.date||'').slice(0,10))} · ${esc(latest.result?.brief||'Zusammenfassung erstellt')}</span><small>${esc(latest.model||'lokales Modell')} · ${fmtSeconds(latest.processingSeconds||0)} · Status: KI-Entwurf</small></div>`:'';
    body.innerHTML=`${jobHtml}${renderCachedPreparation(x?.cachedPreparation)}${summaryHtml}${!jobHtml&&!x?.cachedPreparation&&!latest?'<p class="muted micro">Noch keine Hintergrund-Zusammenfassung vorhanden. Sie wird nach dem nächsten Speichern einer Sitzung automatisch erstellt.</p>':''}`;
  }

  async function refreshIntelligence(){
    clearTimeout(pollTimer);ensureUi();const c=current();if(!c||!isFlowOpen())return;
    const st=window.BDVault?.status?.()||{};
    if(!st.unlocked){const s=$('#flowIntelligenceState'),b=$('#flowIntelligenceBody');if(s){s.className='ai-local-state neutral';s.textContent='Vault gesperrt'}if(b)b.innerHTML='<p class="muted micro">Vault entsperren, um Hintergrund-KI und vorbereitete Inhalte zu sehen.</p>';return}
    try{
      const x=await window.BDVault.request('/ai/intelligence?ref='+encodeURIComponent(c.email));renderIntelligence(x);
      pollTimer=setTimeout(refreshIntelligence,Number(x.pendingJobs||0)>0?2500:15000);
    }catch(e){const s=$('#flowIntelligenceState');if(s){s.className='ai-local-state err';s.textContent='Hintergrundstatus nicht verfügbar'}const b=$('#flowIntelligenceBody');if(b)b.innerHTML=`<p class="muted micro">${esc(e.message)}</p>`}
  }

  function viennaParts(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return{date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`}}
  function viennaIso(date,time){const probe=new Date(`${date}T12:00:00Z`);const name=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Vienna',timeZoneName:'shortOffset'}).formatToParts(probe).find(x=>x.type==='timeZoneName')?.value||'GMT+1';const m=name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);const off=m?`${m[1]}${String(m[2]).padStart(2,'0')}:${m[3]||'00'}`:'+01:00';return new Date(`${date}T${time}:00${off}`).toISOString()}
  async function adminApi(path,options={}){const token=sessionStorage.getItem(SESSION_KEY)||'';const r=await fetch(API+path,{...options,headers:{Authorization:'Bearer '+token,...(options.headers||{})}});const x=await r.json().catch(()=>({}));if(!r.ok)throw new Error(x.error||'CRM-Anfrage fehlgeschlagen.');return x}

  function ensureCashDialog(){
    if($('#flowCashDialog'))return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="flowCashDialog"><div class="dialog-shell compact"><button class="dialog-x" id="flowCashClose" type="button">×</button><p class="eyebrow">Zahlung</p><h2>Barzahlung erfassen</h2><p class="muted" id="flowCashClient">—</p><form id="flowCashForm" class="edit-form"><div class="edit-grid"><label class="edit-field" style="grid-column:1/-1">Offene Rechnung<select id="flowCashInvoice" required></select></label><label class="edit-field">Datum<input id="flowCashDate" type="date" required></label><label class="edit-field">Uhrzeit<input id="flowCashTime" type="time" required></label><label class="edit-field" style="grid-column:1/-1">Referenz / Notiz<input id="flowCashReference" placeholder="z. B. bar nach Sitzung"></label></div><div class="dialog-actions"><button class="btn ghost" id="flowCashCancel" type="button">Abbrechen</button><button class="btn primary" type="submit">Barzahlung verbuchen</button></div><div id="flowCashDialogMsg"></div></form></div></dialog>`);
    $('#flowCashClose').onclick=$('#flowCashCancel').onclick=()=>$('#flowCashDialog').close();
    $('#flowCashForm').onsubmit=submitCash;
  }
  async function openCashDialog(){
    const c=current(),msg=$('#flowCashMsg');if(!c)return;ensureCashDialog();if(msg)msg.textContent='Prüfe offene Rechnungen …';
    try{
      const d=await adminApi('/admin/dashboard');const invoices=(d.invoices||[]).filter(x=>String(x.customerEmail||'').toLowerCase()===String(c.email||'').toLowerCase()&&!['paid','void','cancelled','canceled','refunded'].includes(String(x.status||'').toLowerCase()));
      if(!invoices.length){if(msg)msg.textContent='Keine unbezahlte Rechnung für diese Person gefunden.';return}
      const sel=$('#flowCashInvoice');sel.innerHTML=invoices.map(x=>`<option value="${esc(x.id)}">${esc(x.invoiceNumber||'#'+x.id)} · ${esc(money(x.totalCents))}${x.dbStatus==='test'?' · Sandbox/Test':''}</option>`).join('');
      const vp=viennaParts();$('#flowCashDate').value=vp.date;$('#flowCashTime').value=vp.time;$('#flowCashReference').value='Barzahlung nach Sitzung';$('#flowCashClient').textContent=`${c.name} · ${c.email}`;$('#flowCashDialogMsg').textContent='';$('#flowCashDialog').showModal();if(msg)msg.textContent='';
    }catch(e){if(msg)msg.textContent=e.message}
  }
  async function submitCash(e){
    e.preventDefault();const btn=e.submitter;btn.disabled=true;const msg=$('#flowCashDialogMsg');msg.textContent='Verbuchen …';
    try{const date=$('#flowCashDate').value,time=$('#flowCashTime').value;await adminApi('/admin/invoice/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({invoiceId:Number($('#flowCashInvoice').value),paid:true,paymentMethod:'cash',paymentDate:date,paymentDateTime:viennaIso(date,time),reference:$('#flowCashReference').value.trim()})});msg.textContent='Barzahlung wurde verbucht.';setTimeout(()=>$('#flowCashDialog').close(),650);$('#refreshBtn')?.click();setTimeout(refreshIntelligence,500)}catch(err){msg.textContent=err.message}finally{btn.disabled=false}}

  function watch(){
    ensureUi();const dlg=$('#flowDialog');if(dlg)new MutationObserver(()=>{if(dlg.open)setTimeout(refreshIntelligence,120);else clearTimeout(pollTimer)}).observe(dlg,{attributes:true,attributeFilter:['open']});
    document.addEventListener('bd:session-saved',()=>setTimeout(refreshIntelligence,250));
    document.addEventListener('click',e=>{if(e.target?.closest?.('#flowOpenVault'))setTimeout(refreshIntelligence,700)},true);
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(watch,60));
})();
