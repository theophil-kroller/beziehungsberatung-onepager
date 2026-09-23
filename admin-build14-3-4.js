/* BUILD 14.3.4 — client-record focus.
   Makes the documentation/session sequence the primary clinical view without removing any capability. */
(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];

  function openRecordTab(name){
    const b=document.querySelector(`[data-record-tab="${CSS.escape(name)}"]`);
    if(b)b.click();
  }
  function waitFor(selector,cb,tries=50){
    const el=$(selector);if(el){cb(el);return}
    if(tries<=0)return;
    setTimeout(()=>waitFor(selector,cb,tries-1),80);
  }
  function focusDocTarget(target){
    openRecordTab('documentation');
    const id=String(target||'').replace(/^session:/,'');
    const selector=target.startsWith('session:')?`#vaultSessions [data-session-card="${CSS.escape(id)}"]`:'#vaultSessions .vault-initial-card';
    waitFor(selector,el=>{
      el.scrollIntoView({behavior:'smooth',block:'center'});
      el.classList.add('b1434-session-focus');
      setTimeout(()=>el.classList.remove('b1434-session-focus'),1800);
    });
  }

  // Case-path nodes are now navigational shortcuts into the structured documentation,
  // not into a single low-level timeline event.
  document.addEventListener('click',e=>{
    const step=e.target.closest?.('.b1433-step[data-target]');
    if(!step)return;
    const target=String(step.dataset.target||'');
    if(!target.startsWith('session:')&&!target.startsWith('consultation:'))return;
    e.preventDefault();e.stopImmediatePropagation();
    focusDocTarget(target.startsWith('session:')?target:'consultation');
  },true);
  document.addEventListener('keydown',e=>{
    const step=e.target.closest?.('.b1433-step[data-target]');
    if(!step||!['Enter',' '].includes(e.key))return;
    const target=String(step.dataset.target||'');
    if(!target.startsWith('session:')&&!target.startsWith('consultation:'))return;
    e.preventDefault();e.stopImmediatePropagation();
    focusDocTarget(target.startsWith('session:')?target:'consultation');
  },true);

  function enhanceCaseSummary(){
    const shell=$('.b139-shell');if(!shell)return;
    const pathCopy=shell.querySelector('.b1433-path-head p');if(pathCopy)pathCopy.textContent='Auf Erstgespräch oder Sitzung klicken, um direkt in den strukturierten Dokumentationsverlauf zu wechseln.';
    const intro=shell.querySelector('.b139-intro');
    if(intro&&!intro.querySelector('[data-b1434-doc]')){
      const actions=intro.querySelector('.b139-actions');
      if(actions)actions.insertAdjacentHTML('afterbegin','<button class="btn secondary" type="button" data-b1434-doc>Dokumentation / Sitzungsverlauf</button>');
      intro.querySelector('[data-b1434-doc]')?.addEventListener('click',()=>openRecordTab('documentation'));
    }
    const timeline=shell.querySelector('.b139-timeline-card');
    if(timeline&&!timeline.closest('.b1434-timeline-disclosure')){
      const count=timeline.querySelector('.b141-range span')?.textContent?.trim()||'';
      const details=document.createElement('details');details.className='b1434-timeline-disclosure';
      const summary=document.createElement('summary');summary.innerHTML=`<span>Vollständige Fall-Timeline</span><small>${count||'Alle Einzelereignisse bei Bedarf anzeigen'}</small>`;
      timeline.parentNode.insertBefore(details,timeline);details.append(summary,timeline);
    }
  }

  function cardByTitle(title){return $$('#vaultRecordMount .vault-card').find(card=>card.querySelector('h3')?.textContent.trim()===title)||null}
  function wrapSecondary(card,label){
    if(!card||card.closest('.b1434-doc-secondary'))return;
    const d=document.createElement('details');d.className='b1434-doc-secondary';
    const s=document.createElement('summary');s.textContent=label;card.parentNode.insertBefore(d,card);d.append(s,card);
  }
  function enhanceDocumentation(){
    const mount=$('#vaultRecordMount');if(!mount||!mount.querySelector('#vaultSessions'))return;
    const goals=cardByTitle('Ziele'),sessions=cardByTitle('Sitzungsverlauf');
    if(goals&&sessions&&goals.nextElementSibling!==sessions)goals.insertAdjacentElement('afterend',sessions);
    wrapSecondary(cardByTitle('Diktierte Fallnotizen'),'Weitere Fallnotizen');
    wrapSecondary(cardByTitle('Artefakte'),'Artefakte & Dateien');
    wrapSecondary(cardByTitle('Lokaler Audit Trail'),'Lokaler Audit Trail');
    const head=sessions?.querySelector('.vault-section-head');
    if(head&&!head.querySelector('.b1434-session-helper')){
      head.querySelector('div')?.remove();
      const h=head.querySelector('h3');
      if(h)h.insertAdjacentHTML('afterend','<span class="b1434-session-helper">Neueste Sitzung oben · Klick öffnet die vollständige Dokumentation</span>');
    }
  }

  function run(){enhanceCaseSummary();enhanceDocumentation()}
  const obs=new MutationObserver(run);
  function boot(){const root=$('#clientDialog');if(root)obs.observe(root,{childList:true,subtree:true});run()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* --- BUILD 14.3.4 bookkeeping E/A summary ------------------------------ */
(function(){
  'use strict';
  const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1';
  const FIXED_KEY='bd_finance_fixed_costs_v1';
  const RANGE_KEY='bd_finance_ea_range_v1';
  const $=s=>document.querySelector(s);
  const euro=n=>new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n||0));
  const monthStart=d=>new Date(d.getFullYear(),d.getMonth(),1);
  const addMonths=(d,n)=>new Date(d.getFullYear(),d.getMonth()+n,1);
  const fixed=()=>{try{return {...{enabled:false,monthly:150},...(JSON.parse(localStorage.getItem(FIXED_KEY)||'null')||{})}}catch(_){return{enabled:false,monthly:150}}};
  async function data(){
    const session=sessionStorage.getItem(SESSION_KEY)||'';if(!session||!API)return null;
    const r=await fetch(API+'/admin/dashboard',{headers:{Authorization:'Bearer '+session},cache:'no-store'});if(!r.ok)return null;
    return r.json().catch(()=>null);
  }
  function paidDate(p){const d=new Date(p?.paidAt||'');return isNaN(d)?null:d}
  function rangeBounds(kind,payments){
    const now=new Date(),end=new Date(now.getFullYear(),now.getMonth()+1,1);
    if(kind==='month')return{start:monthStart(now),end,months:1,label:'aktuellen Monat'};
    const n=Number(kind);
    if(Number.isFinite(n)&&n>0)return{start:addMonths(monthStart(now),-(n-1)),end,months:n,label:n===12?'letzten 12 Monate':`letzten ${n} Monate`};
    const ds=payments.map(p=>paidDate(p)).filter(Boolean).sort((a,b)=>a-b),first=ds[0]||monthStart(now),start=monthStart(first);
    const months=Math.max(1,(end.getFullYear()-start.getFullYear())*12+(end.getMonth()-start.getMonth()));
    return{start,end,months,label:'Zeitraum seit Beginn'};
  }
  function inRange(d,b){return d&&d>=b.start&&d<b.end}
  async function renderEA(){
    const host=$('#financeEaIncome');if(!host)return;
    const d=await data();if(!d)return;
    const payments=(d.payments||[]),real=payments.filter(p=>!p.isTest&&paidDate(p)),test=payments.filter(p=>p.isTest&&paidDate(p));
    const use=real.length?real:test,mode=real.length?'real':(test.length?'test':'empty');
    const range=localStorage.getItem(RANGE_KEY)||'month',bounds=rangeBounds(range,use);
    const income=use.reduce((sum,p)=>sum+(inRange(paidDate(p),bounds)?Number(p.amountCents||0)/100:0),0);
    const fs=fixed(),expenses=fs.enabled?Math.max(0,Number(fs.monthly||0))*bounds.months:0,result=income-expenses;
    $('#financeEaIncome').textContent=euro(income);$('#financeEaExpenses').textContent=euro(expenses);$('#financeEaResult').textContent=euro(result);
    $('#financeEaResult').classList.toggle('negative',result<0);$('#financeEaResult').classList.toggle('positive',result>=0);
    const badge=$('#financeEaMode');if(badge){badge.textContent=mode==='real'?'Reale Einnahmen':mode==='test'?'Sandbox/Test':'Noch keine Einnahmen';badge.classList.toggle('real',mode==='real')}
    const cap=$('#financeEaCaption');if(cap){
      const base=`${bounds.label}: Zahlungseingänge ${mode==='real'?'aus realen Daten':mode==='test'?'aus Sandbox/Testdaten':'noch ohne Buchungen'}.`;
      cap.textContent=fs.enabled?`${base} Als Ausgaben werden derzeit ${euro(fs.monthly)} monatliche Fixkosten berücksichtigt. Variable Ausgaben folgen mit der Ausgabenbuchung bzw. dem Bankimport.`:`${base} Ausgaben sind noch nicht aktiviert; optional kannst du oben monatliche Fixkosten berücksichtigen.`;
    }
    document.querySelectorAll('[data-ea-range]').forEach(b=>b.classList.toggle('active',b.dataset.eaRange===range));
  }
  function bindEA(){
    $('#financeEaRange')?.addEventListener('click',e=>{const b=e.target.closest('[data-ea-range]');if(!b)return;localStorage.setItem(RANGE_KEY,b.dataset.eaRange);renderEA()});
    $('#financeFixedEnabled')?.addEventListener('change',()=>setTimeout(renderEA,30));$('#financeFixedMonthly')?.addEventListener('change',()=>setTimeout(renderEA,30));
    document.querySelector('[data-build10-finance-nav]')?.addEventListener('click',()=>setTimeout(renderEA,150));
    document.querySelectorAll('[data-finance-open]').forEach(x=>x.addEventListener('click',()=>setTimeout(renderEA,150)));
    setTimeout(renderEA,280);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindEA,{once:true});else bindEA();
})();
