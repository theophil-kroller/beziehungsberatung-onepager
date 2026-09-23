(function(){
  'use strict';
  const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=v=>{if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:String(v).includes('T')?'short':undefined}).format(d)};
  let record=null, vault=null, events=[], activeFilter='all', loading=false;

  function context(){return window.BDClientRecordContext?.()||null}
  function textPreview(v,n=180){const s=String(v||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s}
  function addEvent(type,id,date,title,detail='',meta={}){if(!date)return;events.push({type,id,date,title,detail,...meta})}
  function buildTimeline(){
    events=[];
    (vault.initialConsultations||[]).forEach(x=>addEvent('consultation','consultation:'+x.id,x.date||x.finalizedAt||x.updatedAt,x.status==='final'?'Erstgespräch durchgeführt':'Erstgespräch als Entwurf gespeichert',textPreview(x.topic||x.mainProblem||x.reason),{local:true}));
    (vault.sessions||[]).forEach(x=>addEvent('session','session:'+x.id,x.date||x.updatedAt,x.focus||'Sitzung dokumentiert',textPreview(x.agreements||x.nextFocus||x.dynamics||x.dictatedNote),{local:true}));
    (vault.caseNotes||[]).forEach(x=>addEvent('note','note:'+x.id,x.createdAt,'Fallnotiz übernommen',textPreview(x.body),{local:true}));
    (vault.artifacts||[]).forEach(x=>addEvent('artifact','artifact:'+x.id,x.createdAt,'Artefakt hinzugefügt',x.filename||'Datei',{local:true}));
    (vault.goals||[]).forEach(x=>addEvent('goal','goal:'+x.id,x.updatedAt||x.createdAt,'Ziel: '+(x.title||'Ziel'),textPreview(x.detail||x.status),{local:true}));
    const seen=new Set(events.map(x=>x.id+'|'+String(x.date).slice(0,10)));
    (record?.activities||[]).forEach((x,i)=>{const key='crm:'+i+'|'+String(x.at).slice(0,10);if(!seen.has(key))addEvent('organization','crm:'+i,x.at,x.title||'CRM-Aktivität',x.detail||'',{local:false})});
    events.sort((a,b)=>new Date(b.date)-new Date(a.date));
  }
  const labels={all:'Alles',session:'Sitzungen',consultation:'Erstgespräch',note:'Fallnotizen',artifact:'Artefakte',goal:'Ziele',organization:'Organisation'};
  function filters(){return Object.entries(labels).map(([k,v])=>`<button class="b139-filter ${activeFilter===k?'active':''}" data-b139-filter="${k}" type="button">${v}</button>`).join('')}
  function timelineHtml(){const rows=activeFilter==='all'?events:events.filter(x=>x.type===activeFilter);return rows.length?`<div class="b139-timeline">${rows.map(x=>`<article class="b139-event ${x.local?'local':'cloud'}" id="b139-${esc(x.id)}" data-source-id="${esc(x.id)}"><div class="b139-event-marker"></div><div><div class="b139-event-head"><strong>${esc(x.title)}</strong><span>${fmt(x.date)}</span></div>${x.detail?`<p>${esc(x.detail)}</p>`:''}<small>${x.local?'🔒 lokal im Vault':'organisatorische CRM-Daten'}</small></div></article>`).join('')}</div>`:'<div class="empty">Für diesen Filter gibt es noch keine Einträge.</div>'}
  function list(items){return Array.isArray(items)&&items.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="b139-empty-value">Noch nicht dokumentiert</p>'}
  function briefingHtml(b){
    if(!b)return `<div class="b139-empty-brief"><strong>Noch keine Fallzusammenfassung vorhanden.</strong><p>Die lokale KI kann die vorhandenen Vault-Quellen zu einer prüfbaren Arbeitsübersicht verdichten. Originaldokumente und Timeline bleiben unverändert.</p></div>`;
    const r=b.result||{}, sources=(b.sources||[]).slice(0,16), approved=b.reviewStatus==='approved';
    return `<div class="b139-brief-head"><div><span class="b139-status ${approved?'approved':'draft'}">${approved?'Geprüft':'KI-Entwurf – bitte prüfen'}</span><small>${esc(b.model||'lokale KI')} · ${fmt(b.updatedAt)}</small></div>${!approved?`<button class="btn secondary" id="b139Approve" type="button">Als geprüft markieren</button>`:''}</div>
      <section class="b139-lead"><h4>Aktueller Stand</h4><p>${esc(r.currentSituation||'Noch nicht ausreichend dokumentiert.')}</p></section>
      <div class="b139-brief-grid">
        <section><h4>Zentrale Themen</h4>${list(r.keyThemes)}</section><section><h4>Beobachtete Muster</h4>${list(r.observedPatterns)}</section>
        <section><h4>Entwicklung</h4>${list(r.progress)}</section><section><h4>Aktive Ziele</h4>${list(r.activeGoals)}</section>
        <section><h4>Vereinbarungen</h4>${list(r.agreements)}</section><section><h4>Offene Themen</h4>${list(r.openTopics)}</section>
        <section><h4>Nächster Fokus</h4>${list(r.nextFocus)}</section><section class="b139-uncertainties"><h4>Unklarheiten</h4>${list(r.uncertainties)}</section>
      </div><div class="b139-sources"><strong>Verwendete lokale Quellen (${b.sources?.length||0})</strong><div>${sources.map(s=>`<button type="button" data-b139-source="${esc(s.id)}">${esc(s.type)} · ${fmt(s.date)}</button>`).join('')}${(b.sources?.length||0)>16?`<span>+ ${(b.sources.length-16)} weitere</span>`:''}</div></div>`;
  }
  function shell(){
    const host=$('#recordContent');if(!host)return;
    host.innerHTML=`<div class="b139-shell"><div class="b139-intro"><div><p class="eyebrow">BUILD 13.9 · lokaler Klientenakt</p><h3>Fallübersicht & Timeline</h3><p>Der aktuelle Stand, die Entwicklung und die zugrunde liegenden Dokumente an einem Ort.</p></div><div class="b139-actions"><button class="btn ghost" id="b139Reload" type="button">Neu laden</button><button class="btn primary" id="b139Generate" type="button">${vault.caseBriefing?'Fallbriefing aktualisieren':'Lokales KI-Fallbriefing erstellen'}</button></div></div>
      <div class="b139-warning">Die KI verdichtet ausschließlich Inhalte aus dem lokalen Vault. Sie darf nichts erfinden; du prüfst und bestätigst den Entwurf.</div>
      <section class="b139-brief"><div class="b139-section-title"><div><p class="eyebrow">Wo stehen wir gerade?</p><h3>Arbeitsübersicht</h3></div></div><div id="b139BriefBody">${briefingHtml(vault.caseBriefing)}</div><div id="b139Message"></div></section>
      <section class="b139-timeline-card"><div class="b139-section-title"><div><p class="eyebrow">Chronologie</p><h3>Fall-Timeline</h3></div><span>${events.length} Ereignisse</span></div><div class="b139-filters">${filters()}</div><div id="b139Timeline">${timelineHtml()}</div></section></div>`;
    bind();
  }
  function message(text,kind='ok'){const el=$('#b139Message');if(el){el.className='notice '+kind;el.textContent=text}}
  function bind(){
    $('#b139Reload')?.addEventListener('click',load);
    $('#b139Generate')?.addEventListener('click',generate);
    $('#b139Approve')?.addEventListener('click',approve);
    document.querySelectorAll('[data-b139-filter]').forEach(b=>b.onclick=()=>{activeFilter=b.dataset.b139Filter;document.querySelectorAll('[data-b139-filter]').forEach(x=>x.classList.toggle('active',x===b));$('#b139Timeline').innerHTML=timelineHtml()});
    document.querySelectorAll('[data-b139-source]').forEach(b=>b.onclick=()=>{activeFilter='all';$('#b139Timeline').innerHTML=timelineHtml();const el=document.getElementById('b139-'+b.dataset.b139Source);el?.scrollIntoView({behavior:'smooth',block:'center'});el?.classList.add('highlight');setTimeout(()=>el?.classList.remove('highlight'),1800)});
  }
  async function unlock(){if(window.BDVault?.status?.()?.unlocked)return true;return !!(await window.BDVault?.ensureUnlocked?.())}
  async function load(){
    if(loading)return;loading=true;record=context();const host=$('#recordContent');if(!record||!host){loading=false;return}
    host.innerHTML='<div class="b139-loading"><strong>Fallübersicht wird lokal geladen …</strong><span>Keine Beratungsinhalte werden an das Cloud-CRM übertragen.</span></div>';
    try{if(!await unlock())throw new Error('Vault ist gesperrt. Bitte zuerst entsperren.');vault=await window.BDVault.request('/client?ref='+encodeURIComponent(record.email));if(!vault.exists){await window.BDVault.post('/client',{ref:record.email,displayName:record.name,overview:'',currentFocus:''});vault=await window.BDVault.request('/client?ref='+encodeURIComponent(record.email))}buildTimeline();shell()}catch(e){host.innerHTML=`<div class="vault-lock-panel"><strong>Fallübersicht nicht verfügbar</strong><p class="muted">${esc(e.message)}</p><button class="btn primary" id="b139Unlock" type="button">Vault entsperren</button></div>`;$('#b139Unlock')?.addEventListener('click',load)}finally{loading=false}
  }
  async function generate(){const btn=$('#b139Generate');if(!btn)return;btn.disabled=true;btn.textContent='Lokale KI erstellt die Fallübersicht …';message('Je nach lokalem Modell kann das etwa eine Minute dauern.','ok');try{const x=await window.BDVault.post('/case-briefing/generate',{ref:record.email,displayName:record.name});vault.caseBriefing=x.caseBriefing;$('#b139BriefBody').innerHTML=briefingHtml(vault.caseBriefing);bind();message(x.unchanged?'Seit der letzten Fallübersicht wurden keine Quellen verändert.':'Neuer KI-Entwurf erstellt. Bitte inhaltlich prüfen.','ok');injectFlowBrief(true)}catch(e){message(e.message,'err')}finally{btn.disabled=false;btn.textContent='Fallbriefing aktualisieren'}}
  async function approve(){const b=vault?.caseBriefing;if(!b)return;try{const x=await window.BDVault.post('/case-briefing/review',{ref:record.email,id:b.id,status:'approved'});vault.caseBriefing=x.caseBriefing;$('#b139BriefBody').innerHTML=briefingHtml(vault.caseBriefing);bind();message('Fallübersicht als geprüft markiert. Sie erscheint nun kompakt in der Sitzungsvorbereitung.','ok');injectFlowBrief(true)}catch(e){message(e.message,'err')}}

  async function injectFlowBrief(force=false){
    const host=$('#flowVaultContext'),c=window.BDFlowManager?.getCurrent?.();if(!host||!c||!window.BDVault?.status?.()?.unlocked)return;
    const ref=c.customerIdentityEmail||c.email;if(!force&&host.dataset.b139Brief===ref)return;
    try{const x=await window.BDVault.request('/client?ref='+encodeURIComponent(ref)),b=x.caseBriefing;host.querySelector('.b139-flow-brief')?.remove();if(!b)return;const r=b.result||{};host.insertAdjacentHTML('beforeend',`<aside class="b139-flow-brief"><div><strong>Fallbriefing ${b.reviewStatus==='approved'?'· geprüft':'· KI-Entwurf'}</strong><span>${esc(textPreview(r.currentSituation,220)||'Noch kein aktueller Stand formuliert.')}</span></div>${(r.nextFocus||[]).length?`<ul>${r.nextFocus.slice(0,3).map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:''}<button type="button" data-b139-open-record>Fallübersicht öffnen →</button></aside>`);host.dataset.b139Brief=ref;host.querySelector('[data-b139-open-record]')?.addEventListener('click',()=>document.querySelector('[data-record-tab="case-summary"]')?.click())}catch(e){}
  }
  document.addEventListener('click',e=>{const tab=e.target.closest?.('[data-record-tab="case-summary"]');if(tab)setTimeout(load,0);const flow=e.target.closest?.('[data-flow-open],[data-flow-client-section]');if(flow)setTimeout(()=>injectFlowBrief(),500)});
  const observer=new MutationObserver(()=>{clearTimeout(observer.timer);observer.timer=setTimeout(()=>injectFlowBrief(),250)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{const h=$('#flowVaultContext');if(h)observer.observe(h,{childList:true,subtree:true})},{once:true});else{const h=$('#flowVaultContext');if(h)observer.observe(h,{childList:true,subtree:true})}
})();
