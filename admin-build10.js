(function(){
  'use strict';
  const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1',VAULT='http://127.0.0.1:47831',VAULT_TOKEN_KEY='bd_vault_token_v1';
  let session=sessionStorage.getItem(SESSION_KEY)||'',dashboard=null,flows=[],current=null,vaultData=null,refreshTimer=null;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').trim().toLowerCase();
  const dt=x=>x?new Intl.DateTimeFormat('de-AT',{timeZone:'Europe/Vienna',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(x)):'—';
  const money=c=>new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(Number(c||0)/100);
  const now=()=>Date.now();
  async function api(path,opts={}){session=sessionStorage.getItem(SESSION_KEY)||session;const headers={...(opts.headers||{})};if(session)headers.Authorization='Bearer '+session;const r=await fetch(API+path,{...opts,headers,cache:'no-store'});const x=await r.json().catch(()=>({}));if(!r.ok||x.ok===false)throw new Error(x.error||'Anfrage fehlgeschlagen');return x}
  const post=(path,body)=>api(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  function stateLabel(s){return ({planned:'Vorbereitung offen',ready:'Vorbereitet',post_session:'Nachbereitung offen',parked:'Geparkt',completed:'Abgeschlossen',cancelled:'Storniert'})[s]||s||'Offen'}
  function bookingEnd(b){if(b.end)return new Date(b.end).getTime();const mins=String(b.type||'').includes('couple')||String(b.typeLabel||'').includes('90')?90:60;return new Date(b.start).getTime()+mins*60000}
  function flowFor(b){return flows.find(f=>String(f.bookingEventId)===String(b.eventId))||null}
  function derivedState(b,f){if(f?.state==='completed')return'completed';if(f?.state==='parked')return'parked';if(f?.state==='ready'&&bookingEnd(b)<=now())return'post_session';if(f?.state)return f.state;return bookingEnd(b)<=now()?'post_session':'planned'}
  function relevantBookings(){const rows=(dashboard?.bookings||[]).filter(b=>b.status==='booked'&&b.start);const lower=now()-7*86400000,upper=now()+7*86400000;return rows.filter(b=>new Date(b.start).getTime()>=lower&&new Date(b.start).getTime()<=upper).sort((a,b)=>new Date(a.start)-new Date(b.start))}
  function pendingRows(){return relevantBookings().filter(b=>{const s=derivedState(b,flowFor(b));return s!=='completed'&&bookingEnd(b)<=now()})}
  function upcomingRows(){return relevantBookings().filter(b=>new Date(b.start).getTime()>=now())}

  function sameViennaMonth(iso){
    if(!iso)return false;
    const f=x=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit'}).formatToParts(new Date(x)).map(p=>[p.type,p.value]));
    const a=f(iso),b=f(new Date());
    return a.year===b.year&&a.month===b.month;
  }
  function financeData(){
    const invoices=(dashboard?.invoices||[]).filter(x=>x.dbStatus!=='test');
    const paidMonth=invoices.filter(x=>x.status==='paid'&&sameViennaMonth(x.paidAt));
    const received=paidMonth.reduce((n,x)=>n+Number(x.paidAmountCents??x.totalCents??0),0);
    const methods={stripe:0,bank_transfer:0,cash:0,sumup:0,other:0};
    paidMonth.forEach(x=>{const k=['stripe','bank_transfer','cash','sumup'].includes(x.paymentMethod)?x.paymentMethod:'other';methods[k]+=Number(x.paidAmountCents??x.totalCents??0)});
    const horizon=Date.now()+30*86400000;
    const expectedInvoices=invoices.filter(x=>(x.status==='open'||x.status==='overdue')&&x.dueDate&&new Date(String(x.dueDate).slice(0,10)+'T23:59:59').getTime()<=horizon).reduce((n,x)=>n+Number(x.totalCents||0),0);
    const subs=(dashboard?.build9?.subscriptions||[]).filter(x=>['active','trialing'].includes(String(x.status||'').toLowerCase()));
    const recurring=subs.reduce((n,x)=>{const end=x.current_period_end||x.currentPeriodEnd;if(end&&new Date(end).getTime()>horizon)return n;return n+Number(x.amount_cents??x.amountCents??0)},0);
    const packages=(dashboard?.packages||[]).filter(x=>Number(x.remaining)>0&&!['test','pending'].includes(String(x.purchaseStatus||'').toLowerCase()));
    const packageValue=packages.reduce((n,x)=>{const total=Math.max(1,Number(x.total||1)),remaining=Math.max(0,Number(x.remaining||0)),amount=Number(x.purchaseAmountCents||0);return n+Math.round(amount*remaining/total)},0);
    return {received,methods,expected30:expectedInvoices+recurring,expectedInvoices,recurring,packageValue,paidMonth};
  }
  function methodLabel(k){return ({stripe:'Stripe',bank_transfer:'Überweisung',cash:'Bar',sumup:'SumUp',other:'Sonstiges'})[k]||k}
  function openFinanceView(){
    $$('.nav-item[data-view], [data-build10-flow-nav], [data-build10-finance-nav]').forEach(b=>b.classList.toggle('active',b.hasAttribute('data-build10-finance-nav')));
    $$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-finance'));
    $('#viewEyebrow').textContent='Finanzcockpit';$('#viewTitle').textContent='Finanzen';$('#viewSubtitle').textContent='Einnahmen, offene Forderungen und planbare Umsätze auf einen Blick.';$('#newInquiryBtn').style.display='none';renderFinance();
  }
  function renderFinance(){
    if(!dashboard||!$('#financeCockpit'))return;
    const f=financeData(),bi=dashboard?.build9?.bankImport||{},max=Math.max(1,...Object.values(f.methods));
    $('#financeMonthReceived').textContent=money(f.received);
    $('#financeExpected30').textContent=money(f.expected30);
    $('#financePackageValue').textContent=money(f.packageValue);
    $('#financeOpen').textContent=money((dashboard?.overview?.openInvoicesCents)||0);
    $('#financeBreakdown').innerHTML=Object.entries(f.methods).map(([k,v])=>`<div class="finance-method"><div><strong>${esc(methodLabel(k))}</strong><span>${money(v)}</span></div><div class="finance-bar"><i style="width:${Math.round(v/max*100)}%"></i></div></div>`).join('');
    $('#financeProjectionCopy').innerHTML=`<strong>Nächste 30 Tage:</strong> ${money(f.expectedInvoices)} aus offenen Rechnungen${f.recurring?` + ${money(f.recurring)} erwartete Abo-Zahlungen`:''}.<br><strong>Noch zu erbringender Package-Wert:</strong> ${money(f.packageValue)} – bereits verkauft, also keine zusätzliche offene Forderung.`;
    $('#financeBankStatus').textContent=bi.lastImportedAt?`Letzter Bank-CSV-Import: ${dt(bi.lastImportedAt)} · ${bi.importedCount||0} Zahlungen übernommen`:'Noch kein Bank-CSV-Import protokolliert.';
    $('#financeRecent').innerHTML=f.paidMonth.length?f.paidMonth.slice(0,12).map(x=>`<div class="finance-payment"><div><strong>${esc(x.customerName)}</strong><span>${esc(x.invoiceNumber)} · ${esc(dt(x.paidAt))}</span></div><div><strong>${money(x.paidAmountCents??x.totalCents)}</strong><span>${esc(methodLabel(x.paymentMethod||'other'))}</span></div></div>`).join(''):'<div class="empty">Diesen Monat noch keine echten Zahlungen verbucht.</div>';
    const d=financeData();
    if($('#statMonthIncome'))$('#statMonthIncome').textContent=money(d.received);
    if($('#statExpected30'))$('#statExpected30').textContent=money(d.expected30);
  }
  function ensureUi(){
    if($('#view-flow'))return;
    const defs=$('.svg-defs');
    if(defs)defs.insertAdjacentHTML('beforeend','<symbol id="i-flow" viewBox="0 0 24 24"><path d="M4 5h4v4H4V5Zm0 10h4v4H4v-4Zm12-5h4v4h-4v-4ZM8 7h3a3 3 0 0 1 3 3v1m0 2v1a3 3 0 0 1-3 3H8"/></symbol><symbol id="i-finance" viewBox="0 0 24 24"><path d="M4 19V9m5 10V5m5 14v-7m5 7V3M3 21h18"/></symbol>');
    const bookingsNav=$('.nav-item[data-view="bookings"]');
    if(bookingsNav)bookingsNav.insertAdjacentHTML('afterend','<button class="nav-item flow-nav-special" data-build10-flow-nav type="button"><svg><use href="#i-flow"/></svg><span>Session Flow</span><em class="flow-nav-badge" id="flowNavCount">0</em></button>');
    const invoicesNav=$('.nav-item[data-view="invoices"]');
    if(invoicesNav)invoicesNav.insertAdjacentHTML('afterend','<button class="nav-item" data-build10-finance-nav type="button"><svg><use href="#i-finance"/></svg><span>Finanzcockpit</span></button>');
    const workspace=$('.workspace');
    if(workspace)workspace.insertAdjacentHTML('beforeend',`
      <section class="view flow-manager-view" id="view-flow"><section class="panel flow-manager-shell"><div class="panel-head"><div><p class="eyebrow">Session Flow Manager</p><h2>Ein klarer Ablauf rund um jede Sitzung.</h2><p class="muted">Vorbereiten → Buchung & Angebote → Nachbereiten. Offene Schritte bleiben sichtbar.</p></div><button class="btn ghost" id="flowRefresh" type="button">Aktualisieren</button></div><div class="flow-summary-grid"><article class="flow-mini-stat"><span>Vorbereitung offen</span><strong id="flowPrepCount">0</strong></article><article class="flow-mini-stat"><span>Nachbereitung offen</span><strong id="flowPostCount">0</strong></article><article class="flow-mini-stat"><span>Geparkt</span><strong id="flowParkCount">0</strong></article></div><div class="flow-board" style="margin-top:18px"><section><div class="panel-head"><div><p class="eyebrow">Jetzt relevant</p><h3>Offene Session Flows</h3></div></div><div id="flowMainList" class="flow-list"></div></section></div></section></section>
      <section class="view" id="view-finance"><section class="panel" id="financeCockpit"><div class="panel-head"><div><p class="eyebrow">Finanzcockpit</p><h2>Was bereits eingegangen ist – und was planbar ist.</h2><p class="muted">Cashflow und bereits verkaufte Leistung werden bewusst getrennt dargestellt.</p></div><button class="btn secondary" id="financeToInvoices" type="button">Rechnungen öffnen</button></div><div class="finance-stat-grid"><article><span>Eingegangen diesen Monat</span><strong id="financeMonthReceived">—</strong></article><article><span>Erwartet nächste 30 Tage</span><strong id="financeExpected30">—</strong></article><article><span>Offene Forderungen</span><strong id="financeOpen">—</strong></article><article><span>Restwert aktiver Packages</span><strong id="financePackageValue">—</strong></article></div><div class="finance-grid"><section class="finance-box"><p class="eyebrow">Zahlungswege</p><h3>Einnahmen diesen Monat</h3><div id="financeBreakdown"></div></section><section class="finance-box"><p class="eyebrow">Projektion</p><h3>Was als Nächstes kommt</h3><p id="financeProjectionCopy" class="finance-copy"></p><p id="financeBankStatus" class="finance-bank"></p><button class="mini" id="financeCsvJump" type="button">Bank-CSV importieren</button></section></div><section class="finance-box" style="margin-top:16px"><p class="eyebrow">Aktuelle Zahlungen</p><h3>Diesen Monat verbucht</h3><div id="financeRecent"></div></section></section></section>`);
    const openCard=$('#statOpen')?.closest('.stat-card');
    if(openCard){
      openCard.classList.add('finance-stat-link','finance-open-card');
      openCard.setAttribute('data-finance-open','');
      openCard.title='Finanzcockpit öffnen';
      if(!openCard.querySelector('.stat-finance-links'))openCard.insertAdjacentHTML('beforeend',`
        <div class="stat-finance-links">
          <button class="stat-finance-sub-link" type="button"><span>Einnahmen Monat</span><strong id="statMonthIncome">—</strong></button>
          <button class="stat-finance-sub-link" type="button"><span>Planbar 30 Tage</span><strong id="statExpected30">—</strong></button>
        </div>
        <small class="stat-finance-more">Finanzdetails öffnen →</small>`);
    }
    const dashGrid=$('#view-dashboard .dash-grid');
    if(dashGrid)dashGrid.insertAdjacentHTML('afterend',`<section class="panel flow-dashboard-panel flow-dashboard-green"><div class="panel-head"><div><p class="eyebrow">Session Flow</p><h2>Vor- & Nachbereitung</h2><p class="muted">Was vor dem nächsten Termin wichtig ist und welche Dokumentation noch offen ist.</p></div><button class="text-button" id="flowOpenView" type="button">Flow Manager →</button></div><div id="flowDashList" class="flow-list"></div></section>`);
    document.body.insertAdjacentHTML('beforeend',`<dialog id="flowDialog" class="flow-dialog"><div class="dialog-shell wide flow-green-shell"><button class="dialog-x" id="flowClose" type="button">×</button><p class="eyebrow">Session Flow Manager</p><h2 id="flowDialogTitle">Session vorbereiten</h2><p class="muted" id="flowDialogMeta">—</p>
      <div class="flow-process" aria-label="Session Flow">
        <button type="button" data-flow-tab="prep" class="active"><b>1</b><span>Vorbereitung</span></button><i>→</i>
        <button type="button" data-flow-tab="sales"><b>2</b><span>Buchung & Angebote</span></button><i>→</i>
        <button type="button" data-flow-tab="post"><b>3</b><span>Nachbereitung</span></button>
      </div>
      <section id="flowPanePrep" class="flow-pane active"><div id="flowPrepAlert"></div><div class="flow-hero"><div class="flow-context"><h3>Was du vor der Sitzung wissen solltest</h3><div id="flowCloudContext"></div></div><div class="flow-local"><h3>Secure Vault · bisheriger Verlauf</h3><div id="flowVaultContext"><span class="flow-local-status">Lade …</span></div></div></div><div class="flow-step-card"><h3>Gesprächsanker für heute</h3><div class="flow-note">Organisatorische bzw. verkaufsbezogene Erinnerung. Beratungsinhalte bleiben im lokalen Secure Practice Vault.</div><div class="flow-field"><span>Was möchtest du ansprechen?</span><textarea id="flowCommercialPrompt" placeholder="z. B. Fortsetzungs-Paket ansprechen"></textarea></div><div class="dialog-actions"><button class="btn primary" id="flowPrepDone" type="button">Vorbereitung abgeschlossen</button><button class="btn secondary" id="flowPrepToSales" type="button">Weiter zu Buchung & Angeboten →</button></div></div></section>
      <section id="flowPaneSales" class="flow-pane"><div class="flow-step-card"><div class="panel-head"><div><p class="eyebrow">Schritt 2</p><h3>Buchungs- & Angebotsmöglichkeiten</h3><p class="muted">Nur wenn es zur Sitzung passt. Du musst hier nichts auswählen.</p></div></div><div id="flowSalesCards" class="flow-sales-grid"></div><div class="dialog-actions"><button class="btn ghost" id="flowSalesSkip" type="button">Keine Aktion nötig</button><button class="btn primary" id="flowSalesToPost" type="button">Weiter zur Nachbereitung →</button></div></div></section>
      <section id="flowPanePost" class="flow-pane"><div class="flow-step-card"><div class="panel-head"><div><p class="eyebrow">Schritt 3</p><h3>Sitzung dokumentieren</h3><p class="muted">Diese Inhalte werden direkt im lokalen Secure Practice Vault gespeichert – nicht in Cloudflare/D1.</p></div></div><div id="flowPostVaultStatus" class="flow-note"></div><div class="flow-two"><div class="flow-field"><span>Fokus der Sitzung</span><textarea id="flowFocus"></textarea></div><div class="flow-field"><span>Beobachtete Dynamik</span><textarea id="flowDynamics"></textarea></div></div><div class="flow-field"><span>Interventionen</span><input id="flowInterventions" placeholder="durch Komma trennen"></div><div class="flow-two"><div class="flow-field"><span>Reaktion / Entwicklung</span><textarea id="flowResponse"></textarea></div><div class="flow-field"><span>Vereinbarungen / bis nächstes Mal</span><textarea id="flowAgreements"></textarea></div></div><div class="flow-two"><div class="flow-field"><span>Nächster Fokus</span><textarea id="flowNextFocus"></textarea></div><div class="flow-field"><span>Vorbereitung für mich</span><textarea id="flowPrivatePrep"></textarea></div></div><div class="flow-post-actions"><button class="btn primary" id="flowSaveNotes" type="button">Notizen speichern & Flow abschließen</button></div><div class="flow-park-row"><label>Oder für später parken<select id="flowParkDelay"><option value="2">in 2 Stunden erinnern</option><option value="6">in 6 Stunden erinnern</option><option value="18">morgen / später erinnern</option><option value="24">in 24 Stunden erinnern</option></select></label><button class="btn secondary" id="flowPark" type="button">Für später parken</button></div><div class="flow-next-actions hidden" id="flowNextActions"><h4>Ist administrativ noch etwas zu tun?</h4><div class="dialog-actions" style="justify-content:flex-start"><button class="btn ghost" data-flow-next="none">Nein, fertig</button><button class="btn secondary" data-flow-next="bookings">Termin</button><button class="btn secondary" data-flow-next="sales">Angebot / Package</button><button class="btn secondary" data-flow-next="invoices">Rechnung / Zahlung</button></div></div></div></section><div id="flowMsg"></div></div></dialog>`);
    $('[data-build10-flow-nav]')?.addEventListener('click',openFlowView);$('#flowOpenView')?.addEventListener('click',openFlowView);$('#flowRefresh')?.addEventListener('click',refresh);$('#flowClose')?.addEventListener('click',()=>$('#flowDialog').close());
    $('[data-build10-finance-nav]')?.addEventListener('click',openFinanceView);$$('[data-finance-open]').forEach(x=>x.addEventListener('click',openFinanceView));$$('.stat-finance-sub-link').forEach(x=>x.addEventListener('click',e=>{e.stopPropagation();openFinanceView()}));
    $('#financeToInvoices')?.addEventListener('click',()=>document.querySelector('.nav-item[data-view="invoices"]')?.click());
    $('#financeCsvJump')?.addEventListener('click',()=>{document.querySelector('.nav-item[data-view="invoices"]')?.click();setTimeout(()=>document.querySelector('#bankCsvInput')?.click(),80)});
    $$('[data-flow-tab]').forEach(b=>b.onclick=()=>setFlowTab(b.dataset.flowTab));
    $('#flowPrepDone').onclick=savePrep;$('#flowPrepToSales').onclick=()=>setFlowTab('sales');$('#flowSalesSkip').onclick=()=>setFlowTab('post');$('#flowSalesToPost').onclick=()=>setFlowTab('post');$('#flowPark').onclick=parkFlow;$('#flowSaveNotes').onclick=saveNotes;$$('[data-flow-next]').forEach(b=>b.onclick=()=>nextAction(b.dataset.flowNext));
  }
  function openFlowView(){ $$('.nav-item[data-view], [data-build10-flow-nav], [data-build10-finance-nav]').forEach(b=>b.classList.toggle('active',b.hasAttribute('data-build10-flow-nav')));$$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-flow'));$('#viewEyebrow').textContent='Session Flow Manager';$('#viewTitle').textContent='Session Flow';$('#viewSubtitle').textContent='Vorbereitung, Nachbereitung und offene Dokumentation an einem Ort.';$('#newInquiryBtn').style.display='none';refresh() }
  async function refresh(){if(!sessionStorage.getItem(SESSION_KEY))return;try{const [d,f]=await Promise.all([api('/admin/dashboard'),api('/admin/flows')]);dashboard=d;flows=f.flows||[];render();renderFinance()}catch(e){console.error('Build10 flow refresh',e)}}
  function render(){const all=relevantBookings(),pending=pendingRows(),upcoming=upcomingRows();$('#flowNavCount').textContent=String(pending.length);$('#flowPrepCount').textContent=String(upcoming.filter(b=>derivedState(b,flowFor(b))==='planned').length);$('#flowPostCount').textContent=String(pending.filter(b=>derivedState(b,flowFor(b))!=='parked').length);$('#flowParkCount').textContent=String(pending.filter(b=>derivedState(b,flowFor(b))==='parked').length);const main=[...pending,...upcoming.filter(b=>!pending.includes(b))].slice(0,18);$('#flowMainList').innerHTML=main.length?main.map(flowRow).join(''):'<div class="empty">Aktuell keine offenen Session Flows.</div>';const dash=[...pending,...upcoming].filter((b,i,a)=>a.findIndex(x=>x.eventId===b.eventId)===i).slice(0,5);$('#flowDashList').innerHTML=dash.length?dash.map(b=>flowRow(b,true)).join(''):'<div class="empty">Alles erledigt. ✓</div>';bindFlowButtons();appendAttention(pending)}
  function flowRow(b,compact=false){const f=flowFor(b),s=derivedState(b,f),past=bookingEnd(b)<=now(),urgent=past&&s!=='completed';return `<article class="flow-row ${urgent?'urgent':''} ${s==='completed'?'done':''}"><div class="flow-person"><strong>${esc(b.name)}</strong><span>${esc(dt(b.start))} · ${esc(b.typeLabel||'Termin')} · ${esc(b.locationLabel||'')}</span>${f?.commercialPrompt?`<span>Hinweis: ${esc(f.commercialPrompt)}</span>`:''}</div>${compact?'':`<div><span class="flow-state ${s==='ready'?'ready':s==='parked'?'parked':s==='completed'?'completed':urgent?'open':''}">${esc(stateLabel(s))}</span>${f?.remindAt&&s==='parked'?`<span class="flow-meta">Erinnerung ${esc(dt(f.remindAt))}</span>`:''}</div>`}<div class="flow-actions"><button class="mini edit" data-flow-open="${esc(b.eventId)}">${past?'Nachbereiten':'Vorbereiten'}</button></div></article>`}
  function bindFlowButtons(){$$('[data-flow-open]').forEach(b=>b.onclick=()=>openFlow(b.dataset.flowOpen))}
  function appendAttention(pending){const host=$('#attention');if(!host)return;host.querySelectorAll('[data-build10-flow-attention]').forEach(x=>x.remove());if(!pending.length)return;host.querySelectorAll('.empty').forEach(x=>x.remove());const parked=pending.filter(b=>derivedState(b,flowFor(b))==='parked').length;host.insertAdjacentHTML('afterbegin',`<div class="attention-item orange" data-build10-flow-attention><div><strong>${pending.length} Session-Dokumentation${pending.length===1?'':'en'} offen</strong><span>${parked?parked+' davon geparkt · ':''}Flow Manager öffnen und abschließen.</span></div><button class="mini flow-attention-link" id="flowAttentionOpen">Flow Manager</button></div>`);$('#flowAttentionOpen').onclick=openFlowView;const badge=$('#attentionCount');if(badge){const base=[...host.children].filter(x=>!x.hasAttribute('data-build10-flow-attention')).length;badge.textContent=String(base+1)}}
  async function openFlow(eventId){current=(dashboard?.bookings||[]).find(b=>String(b.eventId)===String(eventId));if(!current)return;const f=flowFor(current);$('#flowDialogTitle').textContent=current.name;$('#flowDialogMeta').textContent=`${dt(current.start)} · ${current.typeLabel||'Termin'} · ${current.locationLabel||''}`;$('#flowCommercialPrompt').value=f?.commercialPrompt||'';renderCloudContext();renderFlowSales();vaultData=null;loadVaultContext();const isPast=bookingEnd(current)<=now();setFlowTab(isPast?'post':'prep');$('#flowNextActions').classList.add('hidden');$('#flowMsg').textContent='';$('#flowDialog').showModal();if(isPast)await markPostStarted()}
  function renderCloudContext(){
    const email=norm(current.email),packages=(dashboard.packages||[]).filter(x=>norm(x.customerEmail)===email&&Number(x.remaining)>0),invoices=(dashboard.invoices||[]).filter(x=>norm(x.customerEmail)===email&&(x.status==='open'||x.status==='overdue')),past=(dashboard.bookings||[]).filter(x=>norm(x.email)===email&&x.status==='booked'&&new Date(x.start)<new Date(current.start)).sort((a,b)=>new Date(b.start)-new Date(a.start));
    const pkg=packages.sort((a,b)=>Number(a.remaining)-Number(b.remaining))[0]||null;
    const expiring=pkg&&(Number(pkg.remaining)<=1||(pkg.expiresAt&&new Date(pkg.expiresAt).getTime()<Date.now()+30*86400000));
    $('#flowCloudContext').innerHTML=`<dl class="flow-kv"><dt>Letzter Termin</dt><dd>${past[0]?esc(dt(past[0].start)):'Noch keiner'}</dd><dt>Aktives Package</dt><dd>${pkg?esc(pkg.productName)+' · '+pkg.remaining+'/'+pkg.total:'Keines'}</dd><dt>Gültig bis</dt><dd>${pkg?.expiresAt?esc(dt(pkg.expiresAt)):'—'}</dd><dt>Offene Rechnungen</dt><dd>${invoices.length?invoices.map(x=>esc(x.invoiceNumber)+' · '+money(x.totalCents)).join('<br>'):'Keine'}</dd></dl>`;
    const alert=$('#flowPrepAlert');
    alert.innerHTML=expiring?`<div class="flow-prep-alert"><div><strong>Fortsetzung im Blick behalten</strong><span>${esc(pkg.productName)} hat nur noch ${pkg.remaining}/${pkg.total} Einheiten${pkg.expiresAt?` · gültig bis ${esc(dt(pkg.expiresAt))}`:''}.</span></div><button class="mini edit" id="flowRenewalJump" type="button">Angebote ansehen →</button></div>`:'';
    $('#flowRenewalJump')?.addEventListener('click',()=>setFlowTab('sales'));
  }
  function renderFlowSales(){
    const host=$('#flowSalesCards');if(!host)return;
    const catalog=(dashboard?.build9?.catalog||[]).filter(x=>Number(x.priceCents??x.price_cents??0)>0);
    const preferred=['continuation-3','process-5','poly-starter','continuity-monthly'];
    const rows=[...catalog].sort((a,b)=>preferred.indexOf(a.id)-preferred.indexOf(b.id)).filter(x=>preferred.includes(x.id)).slice(0,5);
    const appointment=`<article class="flow-sales-card"><span class="flow-sales-tag">Termin</span><h4>Nächsten Termin organisieren</h4><p>Terminübersicht der Klientin bzw. des Klienten öffnen.</p><button class="mini edit" data-flow-client-section="bookings">Termine öffnen →</button></article>`;
    const cards=rows.map(p=>{const price=Number(p.priceCents??p.price_cents??0),regular=Number(p.regularAmountCents||0),isSub=p.product_kind==='subscription';return `<article class="flow-sales-card ${isSub?'subscription':''}"><span class="flow-sales-tag">${isSub?'internes Abo':'Package'}</span><h4>${esc(p.name_de||p.id)}</h4><p>${p.sessions_total?`${p.sessions_total} × ${p.session_minutes} Min. · `:''}<strong>${money(price)}</strong>${regular>price?` · statt ${money(regular)}`:''}</p><button class="mini edit" data-flow-sales-product="${esc(p.id)}">${isSub?'Abo ansehen':'Angebot / Bestellung →'}</button></article>`}).join('');
    host.innerHTML=appointment+cards;
    $$('[data-flow-client-section]').forEach(b=>b.onclick=()=>openClientSection(b.dataset.flowClientSection));
    $$('[data-flow-sales-product]').forEach(b=>b.onclick=()=>openClientSection('sales',b.dataset.flowSalesProduct));
  }
  function openClientSection(tab,productId=null){
    $('#flowDialog')?.close();
    const opener=[...document.querySelectorAll('[data-open-client]')].find(x=>norm(x.dataset.openClient)===norm(current.email));
    if(!opener){alert('Klientenakte von '+current.name+' konnte nicht direkt geöffnet werden.');return}
    opener.click();
    setTimeout(()=>{
      document.querySelector(`[data-record-tab="${tab}"]`)?.click();
      if(productId)setTimeout(()=>document.querySelector(`[data-sales-order="${CSS.escape(productId)}"],[data-sales-sub="${CSS.escape(productId)}"]`)?.click(),120);
    },120);
  }
  async function vaultRequest(path,opts={}){const token=sessionStorage.getItem(VAULT_TOKEN_KEY)||'';const headers={...(opts.headers||{})};if(token)headers.Authorization='Bearer '+token;const r=await fetch(VAULT+path,{...opts,headers,cache:'no-store'});const x=await r.json().catch(()=>({}));if(!r.ok||x.ok===false)throw new Error(x.error||(r.status===401?'Vault gesperrt':'Vault nicht erreichbar'));return x}
  async function loadVaultContext(){const host=$('#flowVaultContext'),postStatus=$('#flowPostVaultStatus');try{const x=await vaultRequest('/client?ref='+encodeURIComponent(current.email));vaultData=x;const c=x.client||{},goals=(x.goals||[]).filter(g=>g.status!=='completed').slice(0,4),sessions=(x.sessions||[]).slice(0,3);host.innerHTML=`<span class="flow-local-status ok">Vault verbunden</span><div class="flow-kv" style="margin-top:10px"><dt>Beratungsziel</dt><dd>${esc(c.overview||'Noch nicht hinterlegt')}</dd><dt>Aktueller Fokus</dt><dd>${esc(c.currentFocus||'Noch nicht hinterlegt')}</dd></div>${goals.length?`<div class="flow-goals">${goals.map(g=>`<span class="flow-goal">${esc(g.title||g.text||'Ziel')}</span>`).join('')}</div>`:''}${sessions.length?`<div class="flow-last-sessions">${sessions.map(s=>`<div class="flow-last-session"><strong>${esc(String(s.date||'').slice(0,10))} · ${esc(s.focus||'Sitzung')}</strong><span>${esc(s.nextFocus||s.agreements||s.response||'')}</span></div>`).join('')}</div>`:'<p class="muted micro">Noch keine Sitzungsdokumentation.</p>'}`;postStatus.innerHTML='<span class="flow-local-status ok">✓ Vault ist entsperrt. Die folgenden Notizen werden ausschließlich lokal gespeichert.</span>';prefillPostFromVault(sessions[0])}catch(e){host.innerHTML=`<span class="flow-local-status err">${esc(e.message)}</span><p class="muted micro">Für den Verlauf muss der lokale Vault entsperrt sein.</p><button class="mini edit" id="flowOpenVault" type="button">Dokumentation öffnen & Vault entsperren →</button>`;setTimeout(()=>$('#flowOpenVault')?.addEventListener('click',()=>openClientSection('documentation')),0);postStatus.innerHTML=`<span class="flow-local-status err">${esc(e.message)} – Notizen können noch nicht lokal gespeichert werden.</span>`}}
  function prefillPostFromVault(last){if(!last)return;$('#flowNextFocus').placeholder=last.nextFocus?`Letzter nächster Fokus: ${last.nextFocus}`:'';$('#flowPrivatePrep').placeholder=last.privatePrep?`Letzte Vorbereitung: ${last.privatePrep}`:''}
  function setFlowTab(tab){$$('[data-flow-tab]').forEach(b=>b.classList.toggle('active',b.dataset.flowTab===tab));$('#flowPanePrep').classList.toggle('active',tab==='prep');$('#flowPaneSales').classList.toggle('active',tab==='sales');$('#flowPanePost').classList.toggle('active',tab==='post')}
  function flowPayload(extra={}){const f=flowFor(current);return {bookingEventId:current.eventId,customerId:current.customerId||null,customerEmail:current.email,customerName:current.name,sessionStart:current.start,sessionEnd:current.end,commercialPrompt:$('#flowCommercialPrompt').value.trim(),state:f?.state||'planned',...extra}}
  async function savePrep(){const btn=$('#flowPrepDone');btn.disabled=true;try{const x=await post('/admin/flow/upsert',flowPayload({state:'ready',prepCompletedAt:new Date().toISOString(),eventType:'prep_completed'}));mergeFlow(x.flow);msg('Vorbereitung gespeichert. Weiter mit Buchung & Angeboten.','ok');render();setFlowTab('sales')}catch(e){msg(e.message,'err')}finally{btn.disabled=false}}
  async function markPostStarted(){const f=flowFor(current);if(f?.postStartedAt)return;try{const x=await post('/admin/flow/upsert',flowPayload({state:f?.state==='parked'?'parked':'post_session',postStartedAt:new Date().toISOString(),eventType:'post_started'}));mergeFlow(x.flow)}catch(e){}}
  async function parkFlow(){const h=Number($('#flowParkDelay').value||2),t=new Date(Date.now()+h*3600000).toISOString(),btn=$('#flowPark');btn.disabled=true;try{const x=await post('/admin/flow/upsert',flowPayload({state:'parked',parkedAt:new Date().toISOString(),remindAt:t,eventType:'post_parked'}));mergeFlow(x.flow);msg(`Geparkt. Erinnerung im Dashboard ab ${dt(t)}.`,'ok');render();$('#flowDialog').close()}catch(e){msg(e.message,'err')}finally{btn.disabled=false}}
  async function saveNotes(){const btn=$('#flowSaveNotes');btn.disabled=true;try{const token=sessionStorage.getItem(VAULT_TOKEN_KEY)||'';if(!token)throw new Error('Secure Vault ist nicht entsperrt. Bitte zuerst in der Klientenakte unter Dokumentation entsperren.');const interventions=$('#flowInterventions').value.split(',').map(x=>x.trim()).filter(Boolean);const vaultSaved=await vaultRequest('/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ref:current.email,displayName:current.name,date:String(current.start).slice(0,10),durationMinutes:Math.round((bookingEnd(current)-new Date(current.start).getTime())/60000),focus:$('#flowFocus').value,dynamics:$('#flowDynamics').value,interventions,response:$('#flowResponse').value,agreements:$('#flowAgreements').value,nextFocus:$('#flowNextFocus').value,privatePrep:$('#flowPrivatePrep').value})});const t=new Date().toISOString(),x=await post('/admin/flow/upsert',flowPayload({state:'completed',notesSavedAt:t,completedAt:t,parkedAt:null,remindAt:null,eventType:'notes_saved'}));mergeFlow(x.flow);msg(vaultSaved?.aiSummaryQueued?'Dokumentation lokal gespeichert. Die KI-Arbeitszusammenfassung läuft im Hintergrund.':'Dokumentation lokal gespeichert und Session Flow abgeschlossen.','ok');document.dispatchEvent(new CustomEvent('bd:session-saved',{detail:{email:current.email,name:current.name,aiSummaryQueued:!!vaultSaved?.aiSummaryQueued}}));$('#flowNextActions').classList.remove('hidden');render()}catch(e){msg(e.message,'err')}finally{btn.disabled=false}}
  function nextAction(tab){if(tab==='none'){$('#flowDialog').close();return}openClientSection(tab)}
  function mergeFlow(f){if(!f)return;const i=flows.findIndex(x=>String(x.bookingEventId)===String(f.bookingEventId));if(i>=0)flows[i]={...flows[i],...f};else flows.push(f)}
  function msg(text,kind='ok'){const el=$('#flowMsg');el.className='notice '+kind;el.textContent=text}
  function observeAdmin(){const target=$('#statToday');if(!target)return;const ob=new MutationObserver(()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,180)});ob.observe(target,{childList:true,characterData:true,subtree:true});setTimeout(refresh,500);setInterval(()=>{if(!document.hidden&&sessionStorage.getItem(SESSION_KEY))refresh()},60000)}

  // BUILD 11 extension points for the local AI layer.
  window.BDFlowManager={
    loadVaultContext,
    setFlowTab,
    getCurrent:()=>current,
    getVaultData:()=>vaultData,
    refresh
  };
  document.addEventListener('DOMContentLoaded',()=>{ensureUi();observeAdmin()});
})();
