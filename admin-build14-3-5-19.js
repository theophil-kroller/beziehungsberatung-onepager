/* BUILD 14.3.5.19 — additive bookkeeping performance graphic.
   Extends the existing Buchhaltung page; it does not replace existing cards,
   cashflow, payment mix, projections, or E/A summary. */
(function(){
  'use strict';
  const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1';
  const FIXED_KEY='bd_finance_fixed_costs_v1';
  const VIEW_KEY='bd_finance_performance_view_v1';
  const YEAR_KEY='bd_finance_performance_year_v1';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const euroCents=c=>new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(c||0)/100);
  const num=n=>new Intl.NumberFormat('de-AT',{maximumFractionDigits:0}).format(Number(n||0));
  const monthNames=['Jän','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  const now=()=>new Date();

  async function dashboard(){
    const shared=window.BDAdminUX?.getData?.();
    if(shared?.bookings||shared?.payments||shared?.invoices)return shared;
    const session=sessionStorage.getItem(SESSION_KEY)||'';
    if(!session||!API)return null;
    const r=await fetch(API+'/admin/dashboard',{headers:{Authorization:'Bearer '+session},cache:'no-store'});
    if(!r.ok)return null;
    return r.json().catch(()=>null);
  }
  function viennaParts(value){
    if(!value)return null;
    const d=new Date(value);if(Number.isNaN(d.getTime()))return null;
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(x=>[x.type,x.value]));
    return {year:Number(p.year),month:Number(p.month)-1,day:Number(p.day)};
  }
  function currentViennaYear(){return viennaParts(new Date())?.year||new Date().getFullYear()}
  function fixedSettings(){try{return {...{enabled:false,monthly:150},...(JSON.parse(localStorage.getItem(FIXED_KEY)||'null')||{})}}catch(_){return{enabled:false,monthly:150}}}
  function isRealBooking(b){return !b?.isSandboxProfile}
  function isRealPayment(p){return !p?.isTest}
  function paymentCategory(x){
    const raw=`${x?.cardBrand||''} ${x?.paymentBrand||''} ${x?.paymentMethod||''} ${x?.provider||x?.paymentProvider||''} ${x?.reference||x?.paymentReference||''}`.toLowerCase();
    if(/mastercard|master card/.test(raw))return'mastercard';
    if(/visa/.test(raw))return'visa';
    if(/amex|american express/.test(raw))return'amex';
    if(/cash|bar/.test(raw))return'cash';
    if(/bank|überweisung|transfer/.test(raw))return'bank';
    if(/sumup/.test(raw))return'sumup';
    if(/stripe/.test(raw))return'stripe';
    if(/card|karte/.test(raw))return'card';
    return'other';
  }
  function paymentLabel(k){return({mastercard:'Mastercard',visa:'Visa',amex:'American Express',cash:'Bar',bank:'Überweisung',sumup:'SumUp',stripe:'Stripe/Karte',card:'Karte',other:'Sonstige'})[k]||k}
  function catalogFeeCents(d,type){
    const rows=d?.build9?.catalog||[];
    const ids=type==='couple'?['session-couple','couple']:['session-individual','individual'];
    const row=rows.find(x=>ids.includes(String(x.id||x.product_id||'')));
    return Number(row?.priceCents??row?.price_cents??0)||0;
  }
  function bookingValueCents(d,b,invoiceMap,packageMap){
    if(b?.creditId){
      const p=packageMap.get(Number(b.creditId));
      const amount=Number(p?.purchaseAmountCents||0),total=Math.max(1,Number(p?.total||0));
      if(amount>0&&total>0)return Math.round(amount/total);
    }
    if(b?.invoiceId){
      const inv=invoiceMap.get(Number(b.invoiceId));
      if(inv&&Number(inv.totalCents||0)>0)return Number(inv.totalCents||0);
    }
    return Number(b?.serviceValueCents||0)||catalogFeeCents(d,b?.type);
  }
  function classify(d,bookings,year){
    const months=Array.from({length:12},(_,i)=>({month:i,paidCents:0,unpaidCents:0,unbilledCents:0,plannedCents:0,paidCount:0,unpaidCount:0,unbilledCount:0,plannedCount:0}));
    const invoiceMap=new Map((d?.invoices||[]).map(x=>[Number(x.id),x]));
    const packageMap=new Map((d?.packages||[]).map(x=>[Number(x.creditId),x]));
    const nowMs=Date.now();
    bookings.forEach(b=>{
      if(b?.status!=='booked'||!b?.start)return;
      const parts=viennaParts(b.start);if(!parts||parts.year!==year)return;
      const m=months[parts.month],value=Math.max(0,bookingValueCents(d,b,invoiceMap,packageMap));
      if(new Date(b.start).getTime()>nowMs){m.plannedCount++;m.plannedCents+=value;return}
      if(b.creditId){m.paidCount++;m.paidCents+=value;return}
      const inv=b.invoiceId?invoiceMap.get(Number(b.invoiceId)):null;
      if(inv&&!['cancelled','canceled','void','refunded'].includes(String(inv.status||'').toLowerCase())){
        if(String(inv.status)==='paid'){m.paidCount++;m.paidCents+=value}
        else{m.unpaidCount++;m.unpaidCents+=value}
        return;
      }
      m.unbilledCount++;m.unbilledCents+=value;
    });
    return months;
  }
  function paymentSeries(payments,year){
    const months=Array.from({length:12},(_,i)=>({month:i,incomeCents:0,expenseCents:0}));
    payments.forEach(p=>{const parts=viennaParts(p.paidAt);if(parts&&parts.year===year)months[parts.month].incomeCents+=Number(p.amountCents||0)});
    const fixed=fixedSettings(),today=viennaParts(new Date());
    if(fixed.enabled){
      const cents=Math.round(Math.max(0,Number(fixed.monthly||0))*100);
      months.forEach(m=>{const elapsed=year<today.year||(year===today.year&&m.month<=today.month);m.expenseCents=elapsed?cents:0});
    }
    return months;
  }
  function availableYears(d){
    const y=new Set([currentViennaYear()]);
    ;[...(d?.bookings||[]).map(x=>x.start),...(d?.payments||[]).map(x=>x.paidAt),...(d?.invoices||[]).map(x=>x.invoiceDate)].forEach(v=>{const p=viennaParts(v);if(p)y.add(p.year)});
    return [...y].filter(Boolean).sort((a,b)=>b-a);
  }
  function chooseRows(real,test){
    if(real.length)return{rows:real,mode:'real'};
    if(test.length)return{rows:test,mode:'test'};
    return{rows:[],mode:'empty'};
  }
  function sum(rows,key){return rows.reduce((n,x)=>n+Number(x[key]||0),0)}
  function summaryHtml(view,rows){
    if(view==='count'){
      const total=sum(rows,'paidCount')+sum(rows,'unpaidCount')+sum(rows,'unbilledCount');
      return `<span>Geleistet <strong>${num(total)}</strong></span><span class="paid">Bezahlt <strong>${num(sum(rows,'paidCount'))}</strong></span><span class="unpaid">Unbezahlt <strong>${num(sum(rows,'unpaidCount'))}</strong></span><span class="unbilled">Nicht verrechnet <strong>${num(sum(rows,'unbilledCount'))}</strong></span><span class="planned">Geplant <strong>${num(sum(rows,'plannedCount'))}</strong></span>`;
    }
    if(view==='ea'){
      const income=sum(rows,'incomeCents'),expenses=sum(rows,'expenseCents'),result=income-expenses;
      return `<span class="paid">Einnahmen <strong>${euroCents(income)}</strong></span><span class="unpaid">Ausgaben <strong>${euroCents(expenses)}</strong></span><span>Überschuss <strong>${euroCents(result)}</strong></span>`;
    }
    const delivered=sum(rows,'paidCents')+sum(rows,'unpaidCents')+sum(rows,'unbilledCents');
    return `<span>Geleistet <strong>${euroCents(delivered)}</strong></span><span class="paid">Bezahlt <strong>${euroCents(sum(rows,'paidCents'))}</strong></span><span class="unpaid">Unbezahlt <strong>${euroCents(sum(rows,'unpaidCents'))}</strong></span><span class="unbilled">Nicht verrechnet <strong>${euroCents(sum(rows,'unbilledCents'))}</strong></span><span class="planned">Geplant <strong>${euroCents(sum(rows,'plannedCents'))}</strong></span>`;
  }
  function stackChart(rows,view){
    const count=view==='count';
    const keys=count?['paidCount','unpaidCount','unbilledCount','plannedCount']:['paidCents','unpaidCents','unbilledCents','plannedCents'];
    const max=Math.max(1,...rows.map(r=>keys.reduce((n,k)=>n+Number(r[k]||0),0)));
    return rows.map(r=>{
      const total=keys.reduce((n,k)=>n+Number(r[k]||0),0);
      const h=total?Math.max(5,total/max*100):0;
      const segs=keys.map((k,i)=>{const v=Number(r[k]||0);if(!v)return'';const pct=Math.max(2,v/total*100),cls=['paid','unpaid','unbilled','planned'][i];const title=`${monthNames[r.month]} · ${['Bezahlt','Unbezahlt','Nicht verrechnet','Geplant'][i]}: ${count?num(v):euroCents(v)}`;return `<i class="b143519-seg ${cls}" style="height:${pct}%" title="${title}"></i>`}).join('');
      return `<div class="b143519-month"><div class="b143519-column-wrap"><div class="b143519-total">${total?(count?num(total):euroCents(total)):''}</div><div class="b143519-stack" style="height:${h}%">${segs}</div></div><span>${monthNames[r.month]}</span></div>`;
    }).join('');
  }
  function eaChart(rows){
    const max=Math.max(1,...rows.flatMap(r=>[r.incomeCents,r.expenseCents]));
    return rows.map(r=>{
      const ih=r.incomeCents?Math.max(4,r.incomeCents/max*100):0,eh=r.expenseCents?Math.max(4,r.expenseCents/max*100):0;
      return `<div class="b143519-month"><div class="b143519-column-wrap"><div class="b143519-pair"><i class="income" style="height:${ih}%" title="${monthNames[r.month]} · Einnahmen: ${euroCents(r.incomeCents)}"></i><i class="expense" style="height:${eh}%" title="${monthNames[r.month]} · Ausgaben: ${euroCents(r.expenseCents)}"></i></div></div><span>${monthNames[r.month]}</span></div>`;
    }).join('');
  }
  function methodsHtml(payments,year){
    const groups={};payments.forEach(p=>{const parts=viennaParts(p.paidAt);if(!parts||parts.year!==year)return;const k=paymentCategory(p);groups[k]=(groups[k]||0)+Number(p.amountCents||0)});
    const rows=Object.entries(groups).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    if(!rows.length)return'<span class="muted">Noch keine Zahlungseingänge im gewählten Jahr.</span>';
    return rows.map(([k,v])=>`<span class="b143519-method"><strong>${paymentLabel(k)}</strong><em>${euroCents(v)}</em></span>`).join('');
  }
  function legend(view){
    if(view==='ea')return'<span><i class="paid"></i>Einnahmen</span><span><i class="unpaid"></i>Ausgaben</span>';
    return'<span><i class="paid"></i>Bezahlt / vorbezahlt</span><span><i class="unpaid"></i>Unbezahlt</span><span><i class="unbilled"></i>Nicht verrechnet</span><span><i class="planned"></i>Geplant</span>';
  }
  function caption(view,mode){
    const prefix=mode==='real'?'Reale Praxisdaten. ':mode==='test'?'Nur Sandbox/Testdaten sichtbar. ':'Noch keine Daten. ';
    if(view==='ea')return prefix+'Einnahmen folgen dem tatsächlichen Zahlungseingang. Als Ausgaben werden derzeit die bereits vorhandenen optionalen monatlichen Fixkosten verwendet; variable Ausgaben bleiben unverändert Teil des weiteren Buchhaltungs-Ausbaus.';
    return prefix+'Vergangene Termine gelten als geleistet. Package-Termine werden als vorbezahlt geführt; Einzelsitzungen mit Honorarnote nach deren Zahlungsstatus. Vergangene Termine ohne zugeordnete Honorarnote erscheinen als „Nicht verrechnet“.';
  }
  async function render(){
    const host=$('#financePerformanceChart');if(!host)return;
    const d=await dashboard();if(!d)return;
    const years=availableYears(d),select=$('#financePerformanceYear');
    const saved=Number(localStorage.getItem(YEAR_KEY)||0),year=years.includes(saved)?saved:years[0];
    select.innerHTML=years.map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('');
    const view=localStorage.getItem(VIEW_KEY)||'money';
    $$('[data-finance-performance-view]').forEach(b=>b.classList.toggle('active',b.dataset.financePerformanceView===view));
    let rows,selected;
    if(view==='ea'){
      selected=chooseRows((d?.payments||[]).filter(isRealPayment),(d?.payments||[]).filter(x=>!isRealPayment(x)));
      rows=paymentSeries(selected.rows,year);host.innerHTML=eaChart(rows);$('#financePerformanceMethods').hidden=false;$('#financePerformanceMethods').innerHTML=`<div class="b143519-method-head"><span>Zahlungswege ${year}</span><small>nur tatsächlich bekannte Zahlungsarten</small></div><div class="b143519-method-list">${methodsHtml(selected.rows,year)}</div>`;
    }else{
      selected=chooseRows((d?.bookings||[]).filter(isRealBooking),(d?.bookings||[]).filter(x=>!isRealBooking(x)));
      rows=classify(d,selected.rows,year);host.innerHTML=stackChart(rows,view);$('#financePerformanceMethods').hidden=true;
    }
    const badge=$('#financePerformanceMode');badge.textContent=selected.mode==='real'?'Reale Daten':selected.mode==='test'?'Sandbox/Test':'Noch keine Daten';badge.classList.toggle('real',selected.mode==='real');
    $('#financePerformanceSummary').innerHTML=summaryHtml(view,rows);
    $('#financePerformanceLegend').innerHTML=legend(view);
    $('#financePerformanceCaption').textContent=caption(view,selected.mode);
  }
  function bind(){
    $('#financePerformanceTabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-finance-performance-view]');if(!b)return;localStorage.setItem(VIEW_KEY,b.dataset.financePerformanceView);render()});
    $('#financePerformanceYear')?.addEventListener('change',e=>{localStorage.setItem(YEAR_KEY,e.target.value);render()});
    $('#financeFixedEnabled')?.addEventListener('change',()=>setTimeout(render,40));
    $('#financeFixedMonthly')?.addEventListener('change',()=>setTimeout(render,40));
    document.querySelector('[data-build10-finance-nav]')?.addEventListener('click',()=>setTimeout(render,140));
    document.querySelectorAll('[data-finance-open]').forEach(x=>x.addEventListener('click',()=>setTimeout(render,140)));
    setTimeout(render,320);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
