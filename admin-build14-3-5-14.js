(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1', PREF_KEY='bd_cockpit_preferences_v1', EA_KEY='bd_dashboard_ea_range_v1', FIXED_KEY='bd_finance_fixed_costs_v1';
  async function waitForSharedDashboard(){for(let i=0;i<25;i++){const shared=window.BDAdminUX?.getData?.();if(shared?.bookings||shared?.payments||shared?.invoices)return shared;await new Promise(r=>setTimeout(r,80))}return null}
  const icons={
    personPlus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19a6 6 0 0 0-12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-5v6m-3-3h6"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm7 7v5m-2.5-2.5h5"/></svg>',
    settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>',
    file:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Zm8 0v5h5M9 13h6m-6 4h6"/></svg>',
    due:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm7 7v3l2 1"/></svg>',
    euro:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 5.5A7 7 0 1 0 17 18M5 10h9M5 14h8"/></svg>',
    alert:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4L12 3Zm0 6v5m0 3h.01"/></svg>',
    open:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5H5v14h14v-4m-7-6 7-7m-5 0h5v5"/></svg>',
    upload:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-4 4 4-4 4 4M5 14v6h14v-6"/></svg>',
    lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    unlock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7-2"/></svg>',
    offer:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6.1 8.3A7 7 0 0 1 18.7 7M17.9 15.7A7 7 0 0 1 5.3 17"/></svg>'
  };
  const defaults={weather:true,attention:true,calendar:true,finance:true,metrics:true};
  function prefs(){try{return {...defaults,...(JSON.parse(localStorage.getItem(PREF_KEY)||'null')||{})}}catch(_){return{...defaults}}}
  function savePrefs(x){localStorage.setItem(PREF_KEY,JSON.stringify(x))}
  function iconButton(icon,label,extra=''){const b=document.createElement('button');b.type='button';b.className='b143514-icon-btn '+extra;b.innerHTML=icons[icon]||'';b.title=label;b.setAttribute('aria-label',label);return b}
  function isDash(){return $('#view-dashboard')?.classList.contains('active')}
  function syncDashClass(){document.body.classList.toggle('b143514-dashboard-active',!!isDash())}

  function quickActions(){
    const host=$('.workspace-head .head-actions');if(!host||host.querySelector('.b143514-quick-actions'))return;
    const wrap=document.createElement('div');wrap.className='b143514-quick-actions';
    const addClient=iconButton('personPlus','Neue Klient:in erfassen','primary');
    addClient.addEventListener('click',()=>{
      $('#newInquiryBtn')?.click();
      setTimeout(()=>{const dlg=$('#inquiryDialog'),stage=$('#inqStage'),title=dlg?.querySelector('h2');if(stage)stage.value='consultation';if(title)title.textContent='Neue Klient:in erfassen';},0);
    });
    const cal=iconButton('calendar','Neuen Termin / Kalender öffnen');cal.addEventListener('click',()=>document.querySelector('[data-view="bookings"]')?.click());
    const offer=iconButton('offer','Angebote öffnen');offer.classList.add('b143516-offer-action');offer.addEventListener('click',()=>document.querySelector('.nav-subitem[data-view="packages"]')?.click());
    const cfg=iconButton('settings','Cockpit anpassen');cfg.addEventListener('click',()=>openCockpitSettings());
    wrap.append(addClient,cal,offer,cfg);host.appendChild(wrap);
  }

  function ensureCockpitDialog(){
    if($('#b143514CockpitDialog'))return;
    document.body.insertAdjacentHTML('beforeend',`<dialog id="b143514CockpitDialog" class="b143514-cockpit-dialog"><div class="b143514-cockpit-card"><button type="button" class="b143514-icon-btn b143514-dialog-close" data-cockpit-close aria-label="Schließen" title="Schließen">×</button><p class="eyebrow">Praxis-Cockpit</p><h2>Cockpit anpassen</h2><p>Zeige nur die Informationen, die du im Alltag wirklich brauchst.</p><div class="b143514-cockpit-options"><label><span>Wetter</span><input type="checkbox" data-cockpit-pref="weather"></label><label><span>Was noch offen ist</span><input type="checkbox" data-cockpit-pref="attention"></label><label><span>Terminkalender</span><input type="checkbox" data-cockpit-pref="calendar"></label><label><span>Einnahmen & Ausgaben</span><input type="checkbox" data-cockpit-pref="finance"></label><label><span>Kennzahlen</span><input type="checkbox" data-cockpit-pref="metrics"></label></div><div class="dialog-actions"><button type="button" class="btn primary" data-cockpit-done>Übernehmen</button></div></div></dialog>`);
    const d=$('#b143514CockpitDialog');d.querySelector('[data-cockpit-close]').onclick=()=>d.close();d.querySelector('[data-cockpit-done]').onclick=()=>{const p={};d.querySelectorAll('[data-cockpit-pref]').forEach(i=>p[i.dataset.cockpitPref]=i.checked);savePrefs({...prefs(),...p});applyCockpitPrefs();d.close()};
  }
  function openCockpitSettings(){ensureCockpitDialog();const d=$('#b143514CockpitDialog'),p=prefs();d.querySelectorAll('[data-cockpit-pref]').forEach(i=>i.checked=!!p[i.dataset.cockpitPref]);d.showModal()}
  function applyCockpitPrefs(){
    const p=prefs(), map={weather:'#dashboardWeather',attention:'.attention-panel',calendar:'.dashboard-calendar',finance:'.dashboard-finance-snapshot',metrics:'.dashboard-metrics-wrap'};
    Object.entries(map).forEach(([k,s])=>$(s)?.classList.toggle('b143514-dashboard-hidden',!p[k]));
    if(p.finance)renderDashboardFinance();
  }

  function bindWeatherExpand(){const w=$('#dashboardWeather');if(!w||w.dataset.b143514Bound)return;w.dataset.b143514Bound='1';w.tabIndex=0;w.title='Klicken für 3-Tage-Vorschau';w.addEventListener('click',e=>{if(e.target.closest('button,input,form'))return;w.classList.toggle('weather-expanded')})}

  async function dashboardData(){const shared=await waitForSharedDashboard();if(shared)return shared;const session=sessionStorage.getItem(SESSION_KEY)||'';if(!session||!API)return null;try{const r=await fetch(API+'/admin/dashboard',{headers:{Authorization:'Bearer '+session},cache:'no-store'});return r.ok?await r.json():null}catch(_){return null}}
  const euro=n=>new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n||0));
  const monthStart=d=>new Date(d.getFullYear(),d.getMonth(),1), addMonths=(d,n)=>new Date(d.getFullYear(),d.getMonth()+n,1);
  function paidDate(p){const d=new Date(p?.paidAt||'');return isNaN(d)?null:d}
  function fixed(){try{return {...{enabled:false,monthly:150},...(JSON.parse(localStorage.getItem(FIXED_KEY)||'null')||{})}}catch(_){return{enabled:false,monthly:150}}}
  function bounds(kind,payments){const now=new Date(),end=new Date(now.getFullYear(),now.getMonth()+1,1);if(kind==='month')return{start:monthStart(now),end,months:1};const n=Number(kind);if(Number.isFinite(n)&&n>0)return{start:addMonths(monthStart(now),-(n-1)),end,months:n};const ds=payments.map(paidDate).filter(Boolean).sort((a,b)=>a-b),start=monthStart(ds[0]||now);return{start,end,months:Math.max(1,(end.getFullYear()-start.getFullYear())*12+(end.getMonth()-start.getMonth()))}}
  function ensureDashboardFinance(){
    if($('.dashboard-finance-snapshot'))return;
    const cal=$('.dashboard-calendar');if(!cal)return;
    cal.insertAdjacentHTML('afterend',`<section class="panel dashboard-finance-snapshot"><div class="panel-head"><div><p class="eyebrow">Finanzen</p><h2>Einnahmen & Ausgaben</h2><p class="muted">Kompakter Praxisüberblick</p></div><select id="b143514FinanceRange" class="b143514-finance-range" aria-label="Zeitraum"><option value="month">Monat</option><option value="3">3 Monate</option><option value="6">6 Monate</option><option value="12">1 Jahr</option><option value="all">Seit Beginn</option></select></div><div class="b143514-finance-values"><div><span>Einnahmen</span><strong id="b143514Income">—</strong></div><div><span>Ausgaben</span><strong id="b143514Expenses">—</strong></div><div class="result"><span>Überschuss</span><strong id="b143514Result">—</strong></div></div></section>`);
    const sel=$('#b143514FinanceRange');sel.value=localStorage.getItem(EA_KEY)||'month';sel.addEventListener('change',()=>{localStorage.setItem(EA_KEY,sel.value);renderDashboardFinance()});
  }
  let financeCache=null,financeCacheAt=0;
  async function renderDashboardFinance(){ensureDashboardFinance();if(!$('#b143514Income'))return;let d=financeCache;if(!d||Date.now()-financeCacheAt>30000){d=await dashboardData();financeCache=d;financeCacheAt=Date.now()}if(!d)return;const payments=d.payments||[],real=payments.filter(p=>!p.isTest&&paidDate(p)),test=payments.filter(p=>p.isTest&&paidDate(p)),use=real.length?real:test,range=$('#b143514FinanceRange')?.value||'month',b=bounds(range,use);const income=use.reduce((s,p)=>{const dt=paidDate(p);return s+(dt&&dt>=b.start&&dt<b.end?Number(p.amountCents||0)/100:0)},0),fs=fixed(),expenses=fs.enabled?Math.max(0,Number(fs.monthly||0))*b.months:0,result=income-expenses;$('#b143514Income').textContent=euro(income);$('#b143514Expenses').textContent=euro(expenses);const r=$('#b143514Result');r.textContent=euro(result);r.classList.toggle('negative',result<0);r.classList.toggle('positive',result>=0)}

  function utilityButton(btn,icon,label,extra=''){if(!btn)return;if(btn.dataset.b143514Icon===icon&&btn.classList.contains('b143514-table-icon'))return;btn.classList.add('b143514-table-icon',extra);btn.innerHTML=icons[icon]||'';btn.dataset.b143514Icon=icon;btn.title=label;btn.setAttribute('aria-label',label)}
  function polishInvoices(){
    $$('#invoicesTable button').forEach(b=>{const t=b.textContent.trim().toLowerCase();if(t==='pdf')utilityButton(b,'file','PDF öffnen');else if(t.includes('zahlungsziel'))utilityButton(b,'due','Zahlungsziel ändern');else if(t.includes('zahlung erfassen'))utilityButton(b,'euro','Zahlung erfassen');else if(t.includes('erinnerung')||t.includes('mahnung'))utilityButton(b,'alert','Zahlungserinnerung / Mahnung','danger')});
    const label=$('#view-invoices .bank-sync .file-btn');if(label&&!label.classList.contains('b143514-table-icon')){const inp=label.querySelector('input');label.classList.add('b143514-table-icon');label.title='Bank-CSV importieren';label.setAttribute('aria-label','Bank-CSV importieren');label.innerHTML=icons.upload;inp&&label.appendChild(inp)}
  }
  function polishClientOpeners(){$$('#clientsTable button').forEach(b=>{if(b.textContent.trim().toLowerCase()==='akte öffnen'){b.classList.add('b143514-open-record');b.innerHTML=icons.open;b.title='Akte öffnen';b.setAttribute('aria-label','Akte öffnen')}})}
  function polishVault(){const map=[['#vaultLockBtn','lock','Vault sperren'],['#vaultRefreshBtn','refresh','Vault-Status prüfen'],['#vaultUnlockBtn','unlock','Vault entsperren']];map.forEach(([s,i,l])=>{const b=$(s);if(!b||b.classList.contains('b143514-vault-icon'))return;b.classList.add('b143514-vault-icon');b.innerHTML=icons[i];b.title=l;b.setAttribute('aria-label',l)})}
  function updateRoadmap(){const p=$('.roadmap-current strong');if(p)p.textContent='Aktuell: BUILD 14.3.6.1'}

  function apply(){syncDashClass();quickActions();ensureCockpitDialog();ensureDashboardFinance();applyCockpitPrefs();bindWeatherExpand();polishInvoices();polishClientOpeners();polishVault();updateRoadmap()}
  const mo=new MutationObserver(()=>queueMicrotask(apply));mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',()=>setTimeout(apply,0),true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(renderDashboardFinance,250)},{once:true});else{apply();setTimeout(renderDashboardFinance,250)}
})();
