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
    const icon=state==='done'?'✓':state==='current'?'●':state==='attention'?'+':state==='planned'?'•':'○';
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
    nodes.push({label:ic?'Erstgespräch':'Erstgespräch fehlt',state:ic?'done':'attention',target:ic?'consultation':'add-consultation',sub:ic?fmt(ic.date||ic.updatedAt):'nachtragen'});
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
  function updateRecordHeaderMeta(v,c){
    const recordHead=document.querySelector('#clientDialog .record-head');
    const identity=recordHead?.querySelector(':scope>div:first-child');
    if(!recordHead||!identity)return;
    const md=v?.client?.masterData||{};
    const place=[md.postalCode,md.city].filter(Boolean).join(' ');
    const meaningfulAddress=[md.street,place].filter(Boolean).join(', ');
    const fullAddress=meaningfulAddress?[meaningfulAddress,md.country].filter(Boolean).join(', '):'';
    let host=document.querySelector('#recordMasterMeta');

    const facts=[];
    if(md.phone)facts.push(['☎',md.phone,'Telefon']);
    if(md.birthDate)facts.push(['◷',fmt(md.birthDate),'Geburtsdatum']);
    if(fullAddress)facts.push(['⌂',fullAddress,'Adresse']);

    // A lone default country is not useful enough to occupy premium header space.
    if(!facts.length){host?.remove();return}
    if(!host){
      host=document.createElement('section');
      host.id='recordMasterMeta';
      host.className='record-master-top-card';
    }
    const rename=recordHead.querySelector('#recordRenameBtn');
    const status=recordHead.querySelector('.record-status');
    const before=rename||status||null;
    if(host.parentElement!==recordHead)recordHead.insertBefore(host,before);
    else if(before&&host.nextSibling!==before)recordHead.insertBefore(host,before);

    host.innerHTML=`<div class="record-master-facts">${facts.map(([i,val,label])=>`<span class="record-master-fact" title="${esc(label)}"><span aria-hidden="true">${i}</span>${esc(val)}</span>`).join('')}</div>`;
  }

  function pathHtml(v,c){
    const nodes=pathModel(v,c),n=(v.sessions||[]).length;
    return `<section class="b1435-overview-path"><div class="b1433-path-card"><div class="b1433-path-head"><div><span class="b1433-card-kicker">Prozess</span><h4>Fallpfad</h4><p>Wo steht die Begleitung gerade? Erledigte Schritte öffnen direkt die zugehörige Dokumentation.</p></div><span class="b1433-path-meta">${n} ${n===1?'Sitzung':'Sitzungen'}</span></div><div class="b1433-path-scroll"><div class="b1433-path">${nodes.map(x=>step(x.label,x.state,x.target,x.sub)).join('')}</div></div></div></section>`;
  }
  function focusDocumentation(target){
    clickTab('documentation');
    let tries=0;
    const find=()=>{
      tries++;
      if(target==='add-consultation'){
        const add=document.querySelector('[data-vault-add-consultation],#vaultAddInitial');
        if(add){add.scrollIntoView({behavior:'smooth',block:'center'});add.click();return}
      }else{
        const selector=target==='consultation'?'#vaultSessions [data-session-select="consultation"]':`#vaultSessions [data-session-card="${CSS.escape(String(target).replace('session:',''))}"]`;
        const el=$(selector);if(el){el.click?.();el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('b1434-session-focus');setTimeout(()=>el.classList.remove('b1434-session-focus'),1800);return}
      }
      if(tries<24)setTimeout(find,120);
    };
    setTimeout(find,120);
  }
  function bindPath(host){
    host.querySelectorAll('[data-b1435-target]').forEach(x=>{const go=()=>focusDocumentation(x.dataset.b1435Target);x.onclick=go;x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
  }


  function simplifyOverviewQuickActions(){
    const content=$('#recordContent');
    if(!content)return;
    // Briefing already has its own primary record tab; Honorare live in the Documentation rail.
    content.querySelector('.client-command-actions [data-client-tab="case-summary"]')?.remove();
    content.querySelector('.client-command-actions [data-client-tab="invoices"]')?.remove();
  }

  function secondaryActions(){
    const old=$('.client-overview-more');if(!old||old.parentElement.querySelector('.client-secondary-actions'))return;
    old.insertAdjacentHTML('beforebegin',`<details class="client-secondary-actions"><summary>Weitere Aktionen</summary><div class="client-secondary-action-grid"><button class="mini" data-client-tab="bookings">Terminverwaltung</button><button class="mini" data-client-tab="invoices">Honorarnoten / Zahlung</button><button class="mini" data-client-tab="packages">Alle Packages</button><button class="mini offer" data-client-tab="sales">Angebot buchen</button><button class="mini" data-client-tab="journey">Journey</button><button class="mini" data-client-master-edit>Stammdaten</button></div></details>`);
    document.querySelectorAll('.client-secondary-actions [data-client-tab]').forEach(b=>b.onclick=()=>clickTab(b.dataset.clientTab));
    document.querySelector('.client-secondary-actions [data-client-master-edit]')?.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('bd:edit-master-data')));
  }
  async function enhanceOverview(){
    if(overviewBusy)return;
    const c=ctx(),content=$('#recordContent');if(!c||!content||!content.querySelector('.client-command-bar'))return;
    secondaryActions();
    simplifyOverviewQuickActions();
    const briefingBtn=content.querySelector('[data-client-tab="case-summary"]');if(briefingBtn)briefingBtn.textContent='Briefing';
    if(content.querySelector('.b1435-overview-path'))return;
    const anchor=content.querySelector('.client-command-bar');if(!anchor)return;
    if(!window.BDVault?.status?.()?.unlocked){
      anchor.insertAdjacentHTML('afterend','<section class="b1435-overview-path"><div class="b1435-path-lock"><div><strong>Fallpfad geschützt</strong><span>Vault entsperren, um Erstgespräch und Sitzungen im Prozess zu sehen.</span></div><button class="mini" data-b1435-unlock>Vault entsperren</button></div></section>');
      $('[data-b1435-unlock]')?.addEventListener('click',async()=>{await window.BDVault?.ensureUnlocked?.();document.querySelector('.b1435-overview-path')?.remove();enhanceOverview()});return;
    }
    overviewBusy=true;
    try{const v=await window.BDVault.request('/client?ref='+encodeURIComponent(c.email));updateRecordHeaderMeta(v,c);anchor.insertAdjacentHTML('afterend',pathHtml(v,c));bindPath(content)}catch(_){/* overview stays operational without local clinical data */}finally{overviewBusy=false}
  }

  function classifyActivity(x){
    const t=`${x.title||''} ${x.detail||''}`.toLowerCase();
    if(/whatsapp/.test(t))return'whatsapp';
    if(/e-mail|email|mail /.test(t))return'email';
    if(/telefon|anruf/.test(t))return'phone';
    if(/zahlungserinnerung|mahnung|erinnerung.*zahlung/.test(t))return'alert';
    if(/zahlungsziel|fälligkeit|fällig/.test(t))return'invoice';
    if(/zahlung|betrag erhalten|bezahlt|stripe|barzahlung|überweisung/.test(t))return'payment';
    if(/rechnung|honorar/.test(t))return'invoice';
    if(/termin|buchung|storn/.test(t))return'booking';
    if(/package|paket/.test(t))return'package';
    if(/anfrage|kontakt|website|nachricht/.test(t))return'contact';
    return'organization';
  }
  function iconFor(type){return({session:'📝',booking:'📅',email:'✉️',whatsapp:'💬',phone:'📞',invoice:'💶',payment:'🏦',alert:'❗',note:'✍️',artifact:'📎',goal:'🎯',package:'📦',contact:'👤',manual:'🧭',organization:'•'})[type]||'•'}
  function iconLabel(type){return({session:'Sitzung',booking:'Termin',email:'E-Mail',whatsapp:'WhatsApp',phone:'Telefon',invoice:'Honorarnote',payment:'Zahlung',alert:'Zahlungserinnerung',note:'Notiz',artifact:'Dokument',goal:'Ziel',package:'Package',contact:'Kontakt',manual:'Ereignis',organization:'Organisation'})[type]||'Ereignis'}
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
    docBusy=true;
    try{
      const v=await window.BDVault.request('/client?ref='+encodeURIComponent(c.email)),events=timelineEvents(v,c);
      const timelineAnchor=mount.querySelector('[data-vault-timeline-anchor]');
      const details=document.createElement('details');details.className='b1435-full-timeline';details.innerHTML=`<summary><span>Vollständige Timeline</span><small>${events.length} Ereignisse · Kommunikation, Zahlungen, Dateien & Organisation</small></summary><div class="b1435-timeline-body">${timelineHtml(events)}</div>`;
      if(timelineAnchor)timelineAnchor.append(details);else mount.append(details);
      details.querySelectorAll('[data-b1435-event-target]').forEach(b=>b.onclick=()=>focusDocumentation(b.dataset.b1435EventTarget));
    }catch(_){/* existing Vault UI handles connectivity state */}finally{docBusy=false}
  }

  function enhanceBriefing(){
    const shell=$('.b139-shell');if(!shell)return;
    document.body.classList.add('b1435-briefing-mode','b14358-briefing-mode');

    const intro=shell.querySelector('.b139-intro');
    let briefingActions=null;
    if(intro){
      const actions=intro.querySelector('.b139-actions');
      if(actions){
        actions.querySelector('[data-b1434-doc]')?.remove();
        actions.querySelector('#b141AddEvent')?.remove();
        const generate=actions.querySelector('#b139Generate');
        if(generate){generate.classList.remove('primary');generate.classList.add('secondary','b14358-generate');generate.textContent=generate.textContent.includes('erstellen')?'Fallbriefing erstellen':'Fallbriefing aktualisieren'}
        const reload=actions.querySelector('#b139Reload');
        if(reload)reload.classList.add('b14358-native-reload');
        if(!actions.querySelector('.b14358-more')){
          const more=document.createElement('details');more.className='b14358-more';
          more.innerHTML='<summary title="Weitere Optionen" aria-label="Weitere Optionen">⋯</summary><div><button type="button" data-b14358-reload>↻ Neu laden</button></div>';
          actions.append(more);
          more.querySelector('[data-b14358-reload]')?.addEventListener('click',()=>{reload?.click();more.removeAttribute('open')});
        }
        briefingActions=actions;
      }
      intro.remove();
    }

    shell.querySelector('.b139-warning')?.remove();
    shell.querySelector('.b139-timeline-card')?.remove();

    const brief=shell.querySelector('.b139-brief');
    if(brief){
      brief.classList.add('b14358-brief','b14359-brief');
      // Der fachliche Inhalt beginnt sofort mit dem aktuellen Stand. Eine zusätzliche
      // Überschrift "Fallbriefing" würde nur dieselbe Information noch einmal rahmen.
      brief.querySelector('.b139-section-title')?.remove();
      const body=brief.querySelector('#b139BriefBody');
      if(body){
        const lead=body.querySelector('.b139-lead');
        const meta=body.querySelector('.b139-brief-head');
        if(lead&&body.firstElementChild!==lead)body.insertBefore(lead,body.firstElementChild);
        if(meta){
          meta.classList.add('b14359-brief-meta');
          const technical=meta.querySelector('small');
          if(technical&&!body.querySelector('.b14359-tech')){
            const details=document.createElement('details');
            details.className='b14359-tech';
            details.innerHTML=`<summary>Technische Details</summary><p>${esc(technical.textContent||'Lokale KI')}</p>`;
            technical.remove();
            meta.insertAdjacentElement('afterend',details);
          }
          if(briefingActions){
            briefingActions.classList.add('b143510-inline-actions');
            meta.append(briefingActions);
            briefingActions=null;
          }
        }else if(briefingActions){
          const row=document.createElement('div');row.className='b143510-inline-actions-row';row.append(briefingActions);body.append(row);briefingActions=null;
        }
      }
      const sources=brief.querySelector('.b139-sources');
      if(sources&&!sources.closest('.b14358-sources-disclosure')){
        const details=document.createElement('details');details.className='b14358-sources-disclosure';
        details.innerHTML='<summary>Verwendete Quellen anzeigen</summary>';
        sources.parentNode.insertBefore(details,sources);details.append(sources);
      }
    }

    const prep=shell.querySelector('.b141-prep');
    if(prep){prep.classList.add('b14358-prep');if(brief&&prep.previousElementSibling!==brief)brief.insertAdjacentElement('afterend',prep)}
  }
  function leaveBriefingIfNeeded(){
    const active=document.querySelector('.record-tabs button.active')?.dataset.recordTab;
    if(active!=='case-summary')document.body.classList.remove('b1435-briefing-mode','b14358-briefing-mode');
  }

  function compactGlobalNavigation(){
    document.querySelectorAll('.side-nav .nav-item').forEach(item=>{
      const label=item.querySelector(':scope>span:not(.nav-chevron)')?.textContent?.trim();
      if(label){if(!item.getAttribute('title'))item.setAttribute('title',label);if(!item.getAttribute('aria-label'))item.setAttribute('aria-label',label)}
    });
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

  document.addEventListener('bd:initial-consultation-saved',()=>{
    if(document.querySelector('.record-tabs [data-record-tab="overview"].active')){
      document.querySelector('.b1435-overview-path')?.remove();enhanceOverview();
    }
  });

  function boot(){const r=$('#recordContent');if(r)obs.observe(r,{childList:true,subtree:true});compactGlobalNavigation();coreTabs();run()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
