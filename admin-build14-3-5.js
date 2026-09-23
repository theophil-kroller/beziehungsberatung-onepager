/* BUILD 14.3.5 — simplify the client record around Übersicht → Dokumentation → Briefing.
   Additive UX layer; no Vault/CRM schemas or financial logic changed. */
(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=v=>{if(!v)return'';const raw=String(v),d=new Date(raw.length===10?raw+'T12:00:00':raw);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};
  const dateTime=v=>{if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?fmt(v):new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)};
  const ctx=()=>window.BDClientRecordContext?.()||null;
  let overviewBusy=false,docBusy=false;

  function coreTabs(){
    document.querySelectorAll('.record-tabs [data-record-tab="case-summary"]').forEach(x=>x.childNodes[0].nodeValue='Briefing');
  }
  function clickTab(tab){document.querySelector(`[data-record-tab="${CSS.escape(tab)}"]`)?.click()}

  function step(label,state,target='',sub=''){
    const icon=state==='done'?'✓':state==='current'?'●':state==='attention'?'!':state==='planned'?'•':'○';
    return `<div class="b1433-step b1435-step ${state}"${target?` data-b1435-target="${esc(target)}" tabindex="0" role="button"`:''}><span class="b1433-dot">${icon}</span><span class="b1433-label">${esc(label)}${sub?`<small style="display:block;font-weight:650;margin-top:2px;opacity:.72">${esc(sub)}</small>`:''}</span></div>`;
  }
  function pathModel(v,c){
    const consultations=(v.initialConsultations||[]).slice().sort((a,b)=>new Date(a.date||a.updatedAt||0)-new Date(b.date||b.updatedAt||0));
    const sessions=(v.sessions||[]).slice().sort((a,b)=>new Date(a.date||a.createdAt||0)-new Date(b.date||b.createdAt||0));
    const activities=c?.activities||[];
    const completed=String(c?.lifecycle?.clientStatus||'').toLowerCase()==='completed';
    const contact=activities.find(x=>/anfrage|kontakt|website|e-mail|email|telefon|whatsapp/i.test(`${x.title||''} ${x.detail||''}`));
    const nodes=[];
    nodes.push({label:'Kontaktaufnahme',state:(contact||activities.length||consultations.length||sessions.length)?'done':'open',target:''});
    const ic=consultations[0];
    nodes.push({label:ic?'Erstgespräch':'Erstgespräch fehlt',state:ic?'done':(sessions.length?'attention':'open'),target:ic?'consultation':'',sub:ic?fmt(ic.date||ic.updatedAt):''});
    const n=sessions.length;
    if(n<=20)sessions.forEach((s,i)=>nodes.push({label:`Sitzung ${i+1}`,state:i===n-1&&!completed?'current':'done',target:`session:${s.id}`,sub:fmt(s.date)}));
    else{
      const first=sessions.slice(0,20),current=sessions.at(-1);
      nodes.push({label:'Sitzungen 1–20',state:'done',target:`session:${first.at(-1).id}`,sub:`${fmt(first[0]?.date)} – ${fmt(first.at(-1)?.date)}`});
      nodes.push({label:`Aktuell · Sitzung ${n}`,state:completed?'done':'current',target:`session:${current.id}`,sub:fmt(current.date)});
    }
    if(c?.nextBooking&&!completed)nodes.push({label:'Nächster Termin',state:'planned',sub:fmt(c.nextBooking.start)});
    nodes.push({label:'Abschluss',state:completed?'done':'open'});
    return nodes;
  }
  function pathHtml(v,c){
    const nodes=pathModel(v,c),n=(v.sessions||[]).length;
    return `<section class="b1435-overview-path"><div class="b1433-path-card"><div class="b1433-path-head"><div><span class="b1433-card-kicker">Prozess</span><h4>Fallpfad</h4><p>Wo steht die Begleitung gerade? Erledigte Schritte öffnen direkt die zugehörige Dokumentation.</p></div><span class="b1433-path-meta">${n} ${n===1?'Sitzung':'Sitzungen'}</span></div><div class="b1433-path-scroll"><div class="b1433-path">${nodes.map(x=>step(x.label,x.state,x.target,x.sub)).join('')}</div></div></div></section>`;
  }
  function focusDocumentation(target){
    clickTab('documentation');
    setTimeout(()=>{
      const selector=target==='consultation'?'.vault-initial-card':`#vaultSessions [data-session-card="${CSS.escape(String(target).replace('session:',''))}"]`;
      const el=$(selector);if(!el)return;
      el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('b1434-session-focus');setTimeout(()=>el.classList.remove('b1434-session-focus'),1800);
    },240);
  }
  function bindPath(host){
    host.querySelectorAll('[data-b1435-target]').forEach(x=>{const go=()=>focusDocumentation(x.dataset.b1435Target);x.onclick=go;x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
  }

  function secondaryActions(){
    const old=$('.client-overview-more');if(!old||old.parentElement.querySelector('.client-secondary-actions'))return;
    old.insertAdjacentHTML('beforebegin',`<details class="client-secondary-actions"><summary>Weitere Aktionen</summary><div class="client-secondary-action-grid"><button class="mini" data-client-tab="bookings">Terminverwaltung</button><button class="mini" data-client-tab="invoices">Honorarnoten / Zahlung</button><button class="mini" data-client-tab="packages">Alle Packages</button><button class="mini offer" data-client-tab="sales">Angebot buchen</button><button class="mini" data-client-tab="journey">Journey</button></div></details>`);
    document.querySelectorAll('.client-secondary-actions [data-client-tab]').forEach(b=>b.onclick=()=>clickTab(b.dataset.clientTab));
  }
  async function enhanceOverview(){
    if(overviewBusy)return;
    const c=ctx(),content=$('#recordContent');if(!c||!content||!content.querySelector('.client-command-bar'))return;
    secondaryActions();
    const briefingBtn=content.querySelector('[data-client-tab="case-summary"]');if(briefingBtn)briefingBtn.textContent='Briefing';
    if(content.querySelector('.b1435-overview-path'))return;
    const anchor=content.querySelector('.client-command-bar');if(!anchor)return;
    if(!window.BDVault?.status?.()?.unlocked){
      anchor.insertAdjacentHTML('afterend','<section class="b1435-overview-path"><div class="b1435-path-lock"><div><strong>Fallpfad geschützt</strong><span>Vault entsperren, um Erstgespräch und Sitzungen im Prozess zu sehen.</span></div><button class="mini" data-b1435-unlock>Vault entsperren</button></div></section>');
      $('[data-b1435-unlock]')?.addEventListener('click',async()=>{await window.BDVault?.ensureUnlocked?.();document.querySelector('.b1435-overview-path')?.remove();enhanceOverview()});return;
    }
    overviewBusy=true;
    try{const v=await window.BDVault.request('/client?ref='+encodeURIComponent(c.email));anchor.insertAdjacentHTML('afterend',pathHtml(v,c));bindPath(content)}catch(_){/* overview stays operational without local clinical data */}finally{overviewBusy=false}
  }

  function classifyActivity(x){
    const t=`${x.title||''} ${x.detail||''}`.toLowerCase();
    if(/whatsapp/.test(t))return'whatsapp';
    if(/e-mail|email|mail /.test(t))return'email';
    if(/telefon|anruf/.test(t))return'phone';
    if(/zahlung|betrag erhalten|bezahlt|stripe|barzahlung|überweisung/.test(t))return'payment';
    if(/rechnung|honorar/.test(t))return'invoice';
    if(/termin|buchung|storn/.test(t))return'booking';
    if(/package|paket/.test(t))return'package';
    if(/anfrage|kontakt|website|nachricht/.test(t))return'contact';
    return'organization';
  }
  function iconFor(type){return({session:'📝',booking:'📅',email:'✉️',whatsapp:'💬',phone:'📞',invoice:'💶',payment:'🏦',note:'✍️',artifact:'📎',goal:'🎯',package:'📦',contact:'👤',manual:'🧭',organization:'•'})[type]||'•'}
  function iconLabel(type){return({session:'Sitzung',booking:'Termin',email:'E-Mail',whatsapp:'WhatsApp',phone:'Telefon',invoice:'Honorarnote',payment:'Zahlung',note:'Notiz',artifact:'Dokument',goal:'Ziel',package:'Package',contact:'Kontakt',manual:'Ereignis',organization:'Organisation'})[type]||'Ereignis'}
  function timelineEvents(v,c){
    const ev=[];const add=(type,date,title,detail='',target='')=>date&&ev.push({type,date,title,detail,target});
    (v.initialConsultations||[]).forEach(x=>add('session',x.date||x.updatedAt,'Erstgespräch',x.topic||x.mainProblem||x.reason||'', 'consultation'));
    (v.sessions||[]).forEach((x,i)=>add('session',x.date||x.updatedAt,`Sitzung ${i+1}${x.focus?` · ${x.focus}`:''}`,x.agreements||x.nextFocus||x.dynamics||x.dictatedNote||'',`session:${x.id}`));
    (v.caseNotes||[]).forEach(x=>add('note',x.createdAt,'Fallnotiz',x.body||''));
    (v.artifacts||[]).forEach(x=>add('artifact',x.createdAt,'Artefakt / Datei',x.filename||''));
    (v.goals||[]).forEach(x=>add('goal',x.updatedAt||x.createdAt,`Ziel: ${x.title||'Ziel'}`,x.detail||x.status||''));
    (v.timelineEvents||[]).forEach(x=>{const type=classifyActivity(x)==='organization'?'manual':classifyActivity(x);add(type,x.date||x.createdAt,x.title||'Timeline-Ereignis',x.detail||'')});
    (c.activities||[]).forEach(x=>add(classifyActivity(x),x.at,x.title||'CRM-Aktivität',x.detail||''));
    return ev.sort((a,b)=>new Date(b.date)-new Date(a.date));
  }
  function timelineHtml(events){
    if(!events.length)return'<div class="b1435-timeline-empty">Noch keine Ereignisse vorhanden.</div>';
    return events.map(x=>`<div class="b1435-timeline-row ${esc(x.type)}" data-event-type="${esc(x.type)}"><span class="b1435-timeline-date">${esc(dateTime(x.date))}</span><span class="b1435-timeline-icon" title="${esc(iconLabel(x.type))}" aria-label="${esc(iconLabel(x.type))}"><span class="b14352-symbol" aria-hidden="true">${iconFor(x.type)}</span></span><div class="b1435-timeline-copy"><strong>${esc(x.title)}</strong>${x.detail?`<p>${esc(String(x.detail).replace(/\s+/g,' ').slice(0,260))}</p>`:''}${x.target?`<button type="button" data-b1435-event-target="${esc(x.target)}">Dokumentation öffnen →</button>`:''}</div></div>`).join('');
  }
  async function addDocumentationTimeline(){
    if(docBusy)return;
    const c=ctx(),mount=$('#vaultRecordMount');if(!c||!mount||!mount.querySelector('#vaultSessions')||mount.querySelector('.b1435-full-timeline'))return;
    if(!mount.querySelector('.b1435-doc-intro'))mount.insertAdjacentHTML('afterbegin','<section class="b1435-doc-intro"><span>Fachliche Dokumentation</span><strong>Ziele, Verlauf und Sitzungen</strong><p>Der Sitzungsverlauf ist die primäre Arbeitsansicht. Einzelereignisse, Zahlungen, Nachrichten und Artefakte bleiben vollständig in der Timeline erhalten.</p></section>');
    docBusy=true;
    try{
      const v=await window.BDVault.request('/client?ref='+encodeURIComponent(c.email)),events=timelineEvents(v,c);
      const sessionsCard=[...mount.querySelectorAll('.vault-card')].find(card=>card.querySelector('h3')?.textContent.trim()==='Sitzungsverlauf');
      const details=document.createElement('details');details.className='b1435-full-timeline';details.innerHTML=`<summary><span>Vollständige Timeline</span><small>${events.length} Ereignisse · Kommunikation, Zahlungen, Dateien & Organisation</small></summary><div class="b1435-timeline-body">${timelineHtml(events)}</div>`;
      if(sessionsCard)sessionsCard.insertAdjacentElement('afterend',details);else mount.append(details);
      details.querySelectorAll('[data-b1435-event-target]').forEach(b=>b.onclick=()=>focusDocumentation(b.dataset.b1435EventTarget));
    }catch(_){/* existing Vault UI handles connectivity state */}finally{docBusy=false}
  }

  function enhanceBriefing(){
    const shell=$('.b139-shell');if(!shell)return;
    document.body.classList.add('b1435-briefing-mode');
    const intro=shell.querySelector('.b139-intro');if(intro){
      const h=intro.querySelector('h3');if(h)h.textContent='Briefing';
      const p=intro.querySelector('p:not(.eyebrow)');if(p)p.textContent='KI-gestützte Fallzusammenfassung und Vorbereitung für den nächsten fachlichen Schritt.';
      const eyebrow=intro.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='KLIENTENAKTE · LOKALE KI';
    }
    const briefTitle=shell.querySelector('.b139-brief .b139-section-title h3');if(briefTitle)briefTitle.textContent='Fallzusammenfassung';
  }
  function leaveBriefingIfNeeded(){
    const active=document.querySelector('.record-tabs button.active')?.dataset.recordTab;
    if(active!=='case-summary')document.body.classList.remove('b1435-briefing-mode');
  }

  function run(){
    coreTabs();leaveBriefingIfNeeded();
    const active=document.querySelector('.record-tabs button.active')?.dataset.recordTab;
    if(active==='overview')enhanceOverview();
    if(active==='documentation')addDocumentationTimeline();
    if(active==='case-summary')enhanceBriefing();
  }
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-record-tab],[data-client-tab]'))setTimeout(run,120)});
  const obs=new MutationObserver(()=>{clearTimeout(obs.t);obs.t=setTimeout(run,90)});
  function boot(){const r=$('#recordContent');if(r)obs.observe(r,{childList:true,subtree:true});coreTabs();run()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
