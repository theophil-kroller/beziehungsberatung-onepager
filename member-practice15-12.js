(()=>{'use strict';
const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'https://beziehungsdynamiken-booking.theophil-kroller.workers.dev').replace(/\/$/, '');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search), token=params.get('token')||'', previewEmail=params.get('member_preview')||'', preview=!!previewEmail;
const BREATHS={
  diaphragmatic:{id:'diaphragmatic',title:'Ruhige Bauchatmung',short:'Den Atem in den Bauch sinken lassen und bewusst verlangsamen.',access:'standard',defaultMinutes:3,phases:[['Einatmen',4,'inhale'],['Ausatmen',6,'exhale']],guidance:'Atme so, dass sich vor allem dein Bauch sanft hebt und senkt.',explainerType:'torso',explainerLead:'Bauch hebt sich beim Einatmen. Beim Ausatmen sinkt er wieder weich zurück.'},
  extended_exhale:{id:'extended_exhale',title:'Verlängerte Ausatmung 4 / 6',short:'Vier Sekunden ein, sechs Sekunden aus.',access:'standard',defaultMinutes:5,phases:[['Einatmen',4,'inhale'],['Ausatmen',6,'exhale']],guidance:'Lass die Ausatmung etwas länger werden als die Einatmung.',explainerType:'long-exhale',explainerLead:'Die Ausatmung dauert sichtbar länger als die Einatmung.'},
  coherence:{id:'coherence',title:'Kohärenzatmung 5 / 5',short:'Ruhige, gleichmäßige Atmung im 10-Sekunden-Rhythmus.',access:'standard',defaultMinutes:5,phases:[['Einatmen',5,'inhale'],['Ausatmen',5,'exhale']],guidance:'Nicht möglichst tief atmen – ruhig und angenehm reicht.',explainerType:'coherence',explainerLead:'Ein- und Ausatmung sind gleich lang und gleichmäßig.'},
  box:{id:'box',title:'Box Breathing 4 / 4 / 4 / 4',short:'Vier gleich lange Phasen mit kurzen Atempausen.',access:'standard',defaultMinutes:3,phases:[['Einatmen',4,'inhale'],['Halten',4,'hold'],['Ausatmen',4,'exhale'],['Pause',4,'pause']],guidance:'Wenn sich Atempausen unangenehm anfühlen, wähle lieber eine Übung ohne Halten.',explainerType:'box',explainerLead:'Jede Seite der Box steht für eine Phase: einatmen, halten, ausatmen, halten.'},
  mindful:{id:'mindful',title:'Atem beobachten',short:'Ohne Vorgabe beim natürlichen Atem bleiben.',access:'standard',defaultMinutes:5,phases:[['Atem wahrnehmen',8,'pause']],guidance:'Du musst den Atem nicht verändern. Beobachte nur, wie er gerade kommt und geht.',explainerType:'mindful',explainerLead:'Kein Rhythmus vorgegeben – einfach den Atem kommen und gehen lassen.'},
  physiological_sigh:{id:'physiological_sigh',title:'Doppeltes Einatmen, langes Ausatmen',short:'Zwei kurze Einatemimpulse, danach eine längere Ausatmung.',access:'assignable',defaultMinutes:1,phases:[['Einatmen',2,'inhale'],['Noch ein kleiner Atemzug',1,'inhale'],['Lang ausatmen',6,'exhale']],guidance:'Ruhig durchführen. Bei Schwindel abbrechen und normal weiteratmen.',explainerType:'sigh',explainerLead:'Zwei kleine Hebungen beim Einatmen, dann ein langes Ausatmen.'},
  holotropic:{id:'holotropic',title:'Holotropes Atmen',short:'Intensive Breathwork-Praxis – nicht als selbstgeführte Member-Übung aktiviert.',access:'admin_only',defaultMinutes:0,phases:[],guidance:'Nur als interner Bibliothekseintrag. Die interaktive Selbstanleitung ist in dieser Version absichtlich deaktiviert.',selfGuided:false}
};
window.BD_BREATH_PRESETS=BREATHS;
window.BDMemberPractice={breaths:BREATHS};
let data=null, run=null;
function fmtDate(v){if(!v)return'';try{return new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit'}).format(new Date(v+'T12:00:00'))}catch(_){return v}}
function ensureUi(){
  if($('#memberPractice')) return;
  const grid=$('.grid'); if(!grid) return;
  const card=document.createElement('section');
  card.id='memberPractice'; card.className='card full member-practice-card';
  card.innerHTML='<div class="member-practice-head"><div><div class="eyebrow">Übungen & Regulation</div><h2>Für zwischen den Sitzungen</h2><p>Hier findest du freigeschaltete Übungen und einen kleinen Atemraum.</p></div></div><div id="memberStandardTools" class="member-practice-tools"></div><div id="memberAssignments"></div>';
  grid.prepend(card);
  const dlg=document.createElement('dialog'); dlg.id='breathDialog'; dlg.className='breath-dialog';
  dlg.innerHTML='<div class="breath-shell"><div class="breath-top"><div><div class="eyebrow">Atemraum</div><h2 id="breathTitle">Atemübung</h2><p class="muted" id="breathIntro"></p></div><button class="breath-close" id="breathClose" type="button" aria-label="Schließen">×</button></div><div class="breath-explain-switch"><label><input id="breathExplainToggle" type="checkbox"> Erklärung einblenden</label></div><div class="breath-explainer" id="breathExplainer" hidden></div><div class="breath-stage" id="breathStage"><div class="breath-countdown" id="breathCountdown">03:00</div><div class="breath-visual bubbles" id="breathVisual"><i class="breath-bubble"></i><i class="breath-bubble"></i><i class="breath-bubble"></i><i class="breath-bubble"></i></div><div class="breath-phase" id="breathPhase">Bereit<small id="breathPhaseSeconds"></small></div></div><div class="breath-controls"><label>Dauer<select id="breathDuration"><option value="1">1 Minute</option><option value="3">3 Minuten</option><option value="5">5 Minuten</option><option value="10">10 Minuten</option></select></label><label>Visualisierung<select id="breathVisualMode"><option value="bubbles">Bubbles</option><option value="blob">Organisch</option><option value="minimal">Minimal</option></select></label><label>Audio<select id="breathAudio" disabled><option>Stimme & Sound – vorbereitet, noch deaktiviert</option></select></label></div><div class="breath-audio-note"><strong>Voice Guidance vorbereitet:</strong> Die Engine kennt bereits modulare Voice-Clips und Sound-Ducking. Audio ist in diesem Build absichtlich deaktiviert, bis die eigenen Aufnahmen vorliegen.</div><div class="breath-actions"><button id="breathStop" type="button">Stopp</button><button class="primary" id="breathStart" type="button">Start</button></div></div>';
  document.body.appendChild(dlg);
  $('#breathClose').onclick=closeBreath;
  $('#breathStop').onclick=stopBreath;
  $('#breathStart').onclick=()=>run?stopBreath():startBreath();
  $('#breathVisualMode').onchange=e=>{const v=$('#breathVisual');v.classList.remove('bubbles','blob','minimal');v.classList.add(e.target.value)};
  $('#breathExplainToggle').onchange=e=>{ $('#breathExplainer').hidden=!e.target.checked; };
  if(preview){document.body.insertAdjacentHTML('afterbegin','<div class="member-preview-banner">PREVIEW · Memberbereich <small>Änderungen am Fortschritt sind deaktiviert.</small></div>')}
  window.BDMemberLayout?.refresh(data);
}
function standardBreaths(){const extra=new Set((data?.memberPractice?.breathAccess||[]).filter(x=>x.active!==0).map(x=>x.breath_id));return Object.values(BREATHS).filter(x=>x.access==='standard'||extra.has(x.id)).filter(x=>x.selfGuided!==false)}
function previewSvg(id){
  const svgs={
    diaphragmatic:'<svg viewBox="0 0 90 56" aria-hidden="true"><path d="M20 18c4-8 12-12 25-12s21 4 25 12"/><path d="M24 46c2-12 9-18 21-18s19 6 21 18"/><path class="accent" d="M28 38c4-4 10-6 17-6s13 2 17 6"/></svg>',
    extended_exhale:'<svg viewBox="0 0 90 56" aria-hidden="true"><path d="M10 36c8-18 18-18 26 0"/><path class="accent" d="M42 30c10-20 24-20 38 0"/></svg>',
    coherence:'<svg viewBox="0 0 90 56" aria-hidden="true"><path d="M8 30c8 0 8-14 16-14s8 24 16 24 8-24 16-24 8 14 16 14 8 0 10 0"/></svg>',
    box:'<svg viewBox="0 0 90 56" aria-hidden="true"><rect x="24" y="8" width="42" height="42" rx="8"/><circle class="accent fill" cx="24" cy="29" r="4"/></svg>',
    mindful:'<svg viewBox="0 0 90 56" aria-hidden="true"><path d="M10 30c10-6 18-6 28 0s18 6 28 0 10-6 14-4"/></svg>',
    physiological_sigh:'<svg viewBox="0 0 90 56" aria-hidden="true"><path d="M10 38c6-12 12-12 18 0"/><path d="M32 34c4-8 8-8 12 0"/><path class="accent" d="M48 24c10 20 20 20 32 0"/></svg>'
  };
  return '<div class="member-tool-preview">'+(svgs[id]||svgs.mindful)+'</div>';
}
function explainerHtml(b){
  const figs={
    torso:'<div class="explainer-figure torso"><div class="torso-outline"></div><div class="torso-belly"></div></div>',
    'long-exhale':'<div class="explainer-figure long-exhale"><span class="bar inhale"></span><span class="bar exhale"></span></div>',
    coherence:'<div class="explainer-figure coherence"><span></span><span></span><span></span></div>',
    box:'<div class="explainer-figure box"><div class="box-shape"></div><div class="box-dot"></div></div>',
    mindful:'<div class="explainer-figure mindful"><div class="mindful-line"></div></div>',
    sigh:'<div class="explainer-figure sigh"><span class="b1"></span><span class="b2"></span><span class="b3"></span></div>'
  };
  return '<div class="breath-explainer-card">'+(figs[b.explainerType]||'')+'<div><strong>So geht\'s</strong><p>'+esc(b.explainerLead||b.guidance||b.short)+'</p></div></div>';
}
function renderPractice(){
  ensureUi();
  const tools=$('#memberStandardTools');
  tools.innerHTML=standardBreaths().map(b=>'<article class="member-tool">'+previewSvg(b.id)+'<div class="member-tool-main"><h3>'+esc(b.title)+'</h3><p>'+esc(b.short)+'</p></div><button data-breath="'+esc(b.id)+'" type="button">Öffnen</button></article>').join('');
  tools.querySelectorAll('[data-breath]').forEach(b=>b.onclick=()=>openBreath(b.dataset.breath));
  const host=$('#memberAssignments'), items=data?.memberPractice?.assignments||[];
  host.innerHTML=items.length?'<div class="member-assignments-wrap"><div class="eyebrow">Meine Hausübungen</div>'+items.map(assignmentHtml).join('')+'</div>':'';
  host.querySelectorAll('[data-assignment-breath]').forEach(b=>b.onclick=()=>openBreath(b.dataset.assignmentBreath));
  host.querySelectorAll('[data-routine-check]').forEach(b=>b.onclick=()=>toggleCheck(b));
  window.BDMemberLayout?.refresh(data);
}
function assignmentHtml(a){const isBreath=a.content_kind==='breath',checks=new Set((a.checks||[]).map(x=>x.date_key)),days=lastDays(a.start_date,a.end_date,7);const tracker=(a.schedule_type==='daily'||a.schedule_type==='weekly'||a.schedule_type==='repeat')?'<div class="routine-days">'+days.map(d=>'<button '+(preview?'disabled':'')+' type="button" class="routine-day '+(checks.has(d)?'done':'')+'" data-routine-check="'+a.id+'" data-date="'+d+'">'+fmtDate(d)+(checks.has(d)?' ✓':'')+'</button>').join('')+'</div>':'';return '<article class="member-assignment"><div class="member-assignment-head"><div><h3>'+esc(a.title)+'</h3><div class="member-assignment-meta">'+esc(scheduleLabel(a))+'</div></div>'+(isBreath?'<button data-assignment-breath="'+esc(a.source_id)+'" type="button">Übung starten</button>':'')+'</div>'+(a.description?'<p>'+esc(a.description)+'</p>':'')+(a.client_instructions?'<p>'+esc(a.client_instructions)+'</p>':'')+tracker+'</article>'}
function scheduleLabel(a){const s={once:'Einmalig',daily:'Täglich',weekly:'Mehrmals pro Woche',repeat:'Wiederkehrend'}[a.schedule_type]||'Hausübung';return [s,a.end_date?'bis '+fmtDate(a.end_date):''].filter(Boolean).join(' · ')}
function lastDays(start,end,count){const today=new Date(),out=[];for(let i=count-1;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const y=d.toISOString().slice(0,10);if(start&&y<start)continue;if(end&&y>end)continue;out.push(y)}return out}
async function toggleCheck(btn){if(preview)return;const a=Number(btn.dataset.routineCheck),date=btn.dataset.date,completed=!btn.classList.contains('done');btn.disabled=true;try{const r=await fetch(API+'/member-practice/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,assignmentId:a,date,completed})}),x=await r.json();if(!r.ok||!x.ok)throw Error(x.error||'Konnte nicht gespeichert werden.');await loadPracticeOnly()}catch(e){alert(e.message)}finally{btn.disabled=false}}
async function loadPracticeOnly(){const r=await fetch(API+'/package-access?token='+encodeURIComponent(token),{cache:'no-store'}),x=await r.json();if(r.ok&&x.ok){data=x;renderPractice()}}
function openBreath(id){const b=BREATHS[id];if(!b||b.selfGuided===false)return;ensureUi();stopBreath();$('#breathTitle').textContent=b.title;$('#breathIntro').textContent=b.guidance||b.short;$('#breathDialog').dataset.breath=id;$('#breathDuration').value=String(b.defaultMinutes||3);$('#breathCountdown').textContent=String(b.defaultMinutes||3).padStart(2,'0')+':00';$('#breathPhase').childNodes[0].textContent='Bereit';$('#breathPhaseSeconds').textContent='';$('#breathExplainer').innerHTML=explainerHtml(b);$('#breathExplainer').hidden=true;$('#breathExplainToggle').checked=false;$('#breathDialog').showModal()}
function closeBreath(){stopBreath();$('#breathDialog')?.close()}
function stopBreath(){if(run){clearTimeout(run.timer);run=null}const btn=$('#breathStart');if(btn)btn.textContent='Start';const v=$('#breathVisual');if(v){v.classList.remove('inhale','exhale','hold','pause');v.style.removeProperty('--phase-ms')}if($('#breathPhase')){$('#breathPhase').childNodes[0].textContent='Bereit';$('#breathPhaseSeconds').textContent=''}}
function startBreath(){const dlg=$('#breathDialog'),b=BREATHS[dlg?.dataset.breath];if(!b?.phases?.length)return;const total=Number($('#breathDuration').value||b.defaultMinutes||3)*60,started=Date.now();run={b,index:0,started,total,timer:null};$('#breathStart').textContent='Stopp';advancePhase()}
function advancePhase(){if(!run)return;const elapsed=(Date.now()-run.started)/1000,remaining=Math.max(0,run.total-elapsed);$('#breathCountdown').textContent=Math.floor(remaining/60).toString().padStart(2,'0')+':'+Math.ceil(remaining%60).toString().padStart(2,'0');if(remaining<=0){stopBreath();$('#breathPhase').childNodes[0].textContent='Fertig';return}const [label,seconds,cls]=run.b.phases[run.index%run.b.phases.length],v=$('#breathVisual');v.classList.remove('inhale','exhale','hold','pause');v.style.setProperty('--phase-ms',seconds*1000+'ms');void v.offsetWidth;v.classList.add(cls);$('#breathPhase').childNodes[0].textContent=label;$('#breathPhaseSeconds').textContent=seconds+' Sek.';const stepStarted=Date.now();const tick=()=>{if(!run)return;const spent=(Date.now()-stepStarted)/1000,left=Math.max(0,seconds-spent),overall=Math.max(0,run.total-(Date.now()-run.started)/1000);$('#breathCountdown').textContent=Math.floor(overall/60).toString().padStart(2,'0')+':'+Math.ceil(overall%60).toString().padStart(2,'0');$('#breathPhaseSeconds').textContent=Math.ceil(left)+' Sek.';if(left>0&&overall>0){run.timer=setTimeout(tick,200);return}run.index++;advancePhase()};run.timer=setTimeout(tick,200)}
function boot(){ensureUi();if(window.__BD_MEMBER_DATA){data=window.__BD_MEMBER_DATA;renderPractice();return}document.addEventListener('bd:member-data',e=>{data=e.detail;renderPractice()},{once:true})}
boot();
})();
