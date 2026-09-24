/* BUILD 14.3.2 — weather + bookkeeping visuals. Additive only. */
(function(){
  'use strict';
  const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1';
  const WEATHER_KEY='bd_dashboard_weather_location_v1';
  const FIXED_KEY='bd_finance_fixed_costs_v1';
  const $=s=>document.querySelector(s);
  async function waitForSharedDashboard(){for(let i=0;i<25;i++){const shared=window.BDAdminUX?.getData?.();if(shared?.bookings||shared?.payments||shared?.invoices)return shared;await new Promise(r=>setTimeout(r,80))}return null}
  const moneyEuro=n=>new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n||0));
  const normMonth=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const monthLabel=d=>new Intl.DateTimeFormat('de-AT',{month:'short'}).format(d).replace('.','');

  async function dashboard(){
    const shared=await waitForSharedDashboard();
    if(shared)return shared;
    const session=sessionStorage.getItem(SESSION_KEY)||'';
    if(!session||!API) return null;
    const r=await fetch(API+'/admin/dashboard',{headers:{Authorization:'Bearer '+session},cache:'no-store'});
    if(!r.ok)return null;
    return r.json().catch(()=>null);
  }

  // --- 3-day weather -------------------------------------------------------
  function weatherCode(code){
    code=Number(code);
    if(code===0)return['☀️','Klar'];
    if([1,2].includes(code))return['🌤️','Heiter'];
    if(code===3)return['☁️','Bewölkt'];
    if([45,48].includes(code))return['🌫️','Nebel'];
    if([51,53,55,56,57].includes(code))return['🌦️','Niesel'];
    if([61,63,65,66,67,80,81,82].includes(code))return['🌧️','Regen'];
    if([71,73,75,77,85,86].includes(code))return['🌨️','Schnee'];
    if([95,96,99].includes(code))return['⛈️','Gewitter'];
    return['🌥️','Wetter'];
  }
  function weatherConfig(){
    try{return JSON.parse(localStorage.getItem(WEATHER_KEY)||'null')||{label:'Graz, Österreich',latitude:47.0707,longitude:15.4395}}catch(_){return{label:'Graz, Österreich',latitude:47.0707,longitude:15.4395}}
  }
  function saveWeatherConfig(x){localStorage.setItem(WEATHER_KEY,JSON.stringify(x))}
  async function renderWeather(){
    const host=$('#weatherDays'),label=$('#weatherLocationLabel');if(!host||!label)return;
    const cfg=weatherConfig();label.textContent=cfg.label;$('#weatherLocationInput').value=cfg.label;
    host.innerHTML='<span class="weather-loading">Wetter wird geladen …</span>';
    try{
      const q=new URLSearchParams({latitude:String(cfg.latitude),longitude:String(cfg.longitude),daily:'weather_code,temperature_2m_max,temperature_2m_min',timezone:'auto',forecast_days:'3'});
      const r=await fetch('https://api.open-meteo.com/v1/forecast?'+q.toString(),{cache:'no-store'});if(!r.ok)throw new Error('Wetterdienst nicht erreichbar');
      const x=await r.json(),d=x.daily||{},days=d.time||[];
      host.innerHTML=days.slice(0,3).map((iso,i)=>{const date=new Date(iso+'T12:00:00'),name=i===0?'Heute':new Intl.DateTimeFormat('de-AT',{weekday:'short'}).format(date),[icon,desc]=weatherCode(d.weather_code?.[i]);return `<div class="weather-day" title="${desc}"><span class="weather-icon">${icon}</span><div><strong>${name}</strong><span class="weather-low">${desc}</span></div><span class="weather-temp">${Math.round(d.temperature_2m_max?.[i]??0)}° <span class="weather-low">/ ${Math.round(d.temperature_2m_min?.[i]??0)}°</span></span></div>`}).join('');
    }catch(e){host.innerHTML='<span class="weather-error">Wetter derzeit nicht verfügbar.</span>'}
  }
  async function changeWeatherLocation(name){
    const q=new URLSearchParams({name, count:'1', language:'de', format:'json'});
    const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+q.toString(),{cache:'no-store'});if(!r.ok)throw new Error('Ort konnte nicht gesucht werden.');
    const x=await r.json(),g=x.results?.[0];if(!g)throw new Error('Ort nicht gefunden.');
    const parts=[g.name,g.admin1,g.country].filter(Boolean),label=[...new Set(parts)].join(', ');
    saveWeatherConfig({label,latitude:g.latitude,longitude:g.longitude});await renderWeather();
  }
  function bindWeather(){
    $('#weatherEditBtn')?.addEventListener('click',()=>$('#weatherLocationForm')?.classList.toggle('hidden'));
    $('#weatherLocationCancel')?.addEventListener('click',()=>$('#weatherLocationForm')?.classList.add('hidden'));
    $('#weatherLocationForm')?.addEventListener('submit',async e=>{e.preventDefault();const input=$('#weatherLocationInput'),btn=e.submitter;const value=String(input?.value||'').trim();if(!value)return;btn&&(btn.disabled=true);try{await changeWeatherLocation(value);$('#weatherLocationForm').classList.add('hidden')}catch(err){alert(err.message)}finally{btn&&(btn.disabled=false)}});
    renderWeather();
  }

  // --- bookkeeping visuals ------------------------------------------------
  function fixedSettings(){try{return {...{enabled:false,monthly:150},...(JSON.parse(localStorage.getItem(FIXED_KEY)||'null')||{})}}catch(_){return{enabled:false,monthly:150}}}
  function saveFixedSettings(x){localStorage.setItem(FIXED_KEY,JSON.stringify(x))}
  function months6(){const out=[];const now=new Date();for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:normMonth(d),label:monthLabel(d),date:d})}return out}
  function paidMonthKey(x){if(!x?.paidAt)return'';const d=new Date(x.paidAt);return isNaN(d)?'':normMonth(d)}
  function aggregatePayments(payments){const ms=months6(),map=Object.fromEntries(ms.map(m=>[m.key,0]));payments.forEach(p=>{const k=paidMonthKey(p);if(k in map)map[k]+=Number(p.amountCents||0)/100});return ms.map(m=>({...m,value:Math.round((map[m.key]||0)*100)/100}))}
  function demoSeries(){const vals=[2160,2790,3240,2880,3690,3150];return months6().map((m,i)=>({...m,value:vals[i]}))}
  function chooseSeries(d){
    const payments=d?.payments||[];
    const real=aggregatePayments(payments.filter(p=>!p.isTest)),test=aggregatePayments(payments.filter(p=>p.isTest));
    const active=a=>a.filter(x=>x.value>0).length;
    if(active(real)>=2)return{series:real,mode:'real'};
    if(active(test)>=2)return{series:test,mode:'test'};
    return{series:demoSeries(),mode:'demo'};
  }
  function renderMonthlyChart(series,mode,settings){
    const host=$('#financeMonthlyChart'),badge=$('#financeChartMode');if(!host||!badge)return;
    const fixed=settings.enabled?Math.max(0,Number(settings.monthly||0)):0,max=Math.max(1,...series.map(x=>x.value),fixed)*1.12;
    host.innerHTML=series.map(m=>{const inc=Math.max(3,Math.round(m.value/max*100)),fix=fixed?Math.max(3,Math.round(fixed/max*100)):3;return `<div class="finance-month"><div class="finance-bars"><div class="finance-column income" style="height:${inc}%"><b>${Math.round(m.value)}</b></div>${settings.enabled?`<div class="finance-column fixed" style="height:${fix}%"><b>${Math.round(fixed)}</b></div>`:''}</div><div class="finance-month-label">${m.label}</div></div>`}).join('');
    const labels={real:'Reale Daten',test:'Sandbox/Test',demo:'Sandbox/Test-Vorschau'};badge.textContent=labels[mode]||mode;badge.classList.toggle('real',mode==='real');
    const current=series.at(-1)?.value||0;$('#financeAfterFixed').textContent=moneyEuro(current-(settings.enabled?fixed:0));
  }
  function paymentMix(d,mode){
    const payments=d?.payments||[],now=new Date(),key=normMonth(new Date(now.getFullYear(),now.getMonth(),1));
    let rows=payments.filter(p=>paidMonthKey(p)===key&&(mode==='real'?!p.isTest:p.isTest));
    let groups={stripe:0,bank:0,cash:0,card:0,other:0};
    rows.forEach(p=>{const m=String(p.paymentMethod||'other');const k=m==='stripe'?'stripe':m==='bank_transfer'?'bank':m==='cash'?'cash':['sumup','card'].includes(m)?'card':'other';groups[k]+=Number(p.amountCents||0)/100});
    if(!Object.values(groups).some(Boolean)&&mode==='demo')groups={stripe:810,bank:1530,cash:540,card:270,other:0};
    const total=Object.values(groups).reduce((a,b)=>a+b,0),donut=$('#financePaymentDonut');if(!donut)return;
    if(!total){donut.style.background='#eee7e1';donut.querySelector('span').textContent='noch keine Daten';return}
    const colors={stripe:'#7c8fb6',bank:'#5f8a69',cash:'#c47a5f',card:'#c2a35c',other:'#9a8b83'};let cursor=0,parts=[];
    Object.entries(groups).forEach(([k,v])=>{if(!v)return;const start=cursor,end=cursor+v/total*360;parts.push(`${colors[k]} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`);cursor=end});
    donut.style.background=`conic-gradient(${parts.join(',')})`;donut.querySelector('span').textContent=moneyEuro(total);
  }
  async function renderFinanceVisuals(){
    if(!$('#financeMonthlyChart'))return;
    const d=await dashboard();if(!d)return;
    const settings=fixedSettings();$('#financeFixedEnabled').checked=!!settings.enabled;$('#financeFixedMonthly').value=Number(settings.monthly||150);
    const chosen=chooseSeries(d);renderMonthlyChart(chosen.series,chosen.mode,settings);paymentMix(d,chosen.mode);
  }
  function bindFinance(){
    const enabled=$('#financeFixedEnabled'),monthly=$('#financeFixedMonthly');
    function update(){const s={enabled:!!enabled?.checked,monthly:Math.max(0,Number(monthly?.value||0))};saveFixedSettings(s);renderFinanceVisuals()}
    enabled?.addEventListener('change',update);monthly?.addEventListener('change',update);
    document.querySelector('[data-build10-finance-nav]')?.addEventListener('click',()=>setTimeout(renderFinanceVisuals,120));
    document.querySelectorAll('[data-finance-open]').forEach(x=>x.addEventListener('click',()=>setTimeout(renderFinanceVisuals,120)));
  }

  function boot(){bindWeather();bindFinance();setTimeout(renderFinanceVisuals,250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
