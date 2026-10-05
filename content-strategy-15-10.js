(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=null,mode='board',area='all',lens='all',activeTopic=null,focusSuggestions=[];

async function vault(path,method='GET',body=null){
  if(!window.BDVault)throw new Error('Lokaler Vault nicht verfügbar.');
  await window.BDVault.checkHealth();
  if(!window.BDVault.status().unlocked)throw new Error('Lokaler Vault ist gesperrt.');
  return method==='POST'?window.BDVault.post(path,body||{}):window.BDVault.request(path);
}
function notice(msg,kind=''){const e=$('#hubNotice');if(!e)return;e.hidden=!msg;e.className='kh-notice '+kind;e.textContent=msg||''}
function pLabel(p){return p==='core'?'Core':p==='explore'?'Explore':'Important'}
function typeLabel(t){return ({article:'Artikel',video_script:'Short',carousel:'Carousel',newsletter:'Newsletter',social_post:'Social Post',youtube_longform:'YouTube',worksheet:'Worksheet',audio:'Audio'})[t]||t||'Content'}
function stageLabel(s){return ({explore:'Erkunden',research:'Recherchieren',synthesize:'Verdichten',produce:'Produzieren'})[s]||'Erkunden'}
function meter(score){return `<div class="strategy-meter1510"><i style="width:${Math.max(0,Math.min(100,score||0))}%"></i></div>`}
function topicOptions(selected=''){return `<option value="">Noch keinem Strategiethema zuordnen</option>`+(state?.topics||[]).filter(t=>t.status==='active').map(t=>`<option value="${esc(t.id)}" ${t.id===selected?'selected':''}>${esc(t.title)}</option>`).join('')}

function filtered(){
  if(!state)return[];
  const q=String($('#strategySearch1510')?.value||'').trim().toLowerCase();
  return (state.topics||[]).filter(t=>{
    if(t.status==='parked'&&mode!=='coverage')return false;
    if(area!=='all'&&!t.areaLinks?.some(a=>a.id===area))return false;
    if(lens!=='all'&&!t.lenses?.includes(lens))return false;
    if(q){const hay=[t.title,t.description,(t.keywords||[]).join(' '),(t.lenses||[]).join(' '),(t.authors||[]).map(a=>a.name+' '+a.theory).join(' ')].join(' ').toLowerCase();if(!hay.includes(q))return false}
    return true;
  });
}

function renderStats(){
  const x=state?.stats||{};
  $('#strategyStats1510').innerHTML=`<article class="strategy-stat1510"><span>Gesamt-Coverage</span><strong>${x.overallCoverage||0}%</strong></article><article class="strategy-stat1510"><span>Aktive Themen</span><strong>${x.topics||0}</strong></article><article class="strategy-stat1510"><span>Core Topics</span><strong>${x.core||0}</strong></article><article class="strategy-stat1510"><span>Priorisierte Themen</span><strong>${x.focus||0}</strong></article>`;
}
function renderAreas(){
  const host=$('#strategyAreas1510');
  host.innerHTML=`<button class="strategy-area1510 ${area==='all'?'active':''}" data-area1510="all"><div class="top"><h3>Alle Themen</h3><span class="coverage">${state?.stats?.overallCoverage||0}%</span></div><p>Gesamte Themenlandschaft – unabhängig vom aktuellen Arbeitsfokus.</p><div class="meta"><span>${state?.stats?.topics||0} Themen</span><span>·</span><span>${state?.stats?.focus||0} priorisiert</span></div></button>`+(state?.areas||[]).map(a=>`<button class="strategy-area1510 ${area===a.id?'active':''}" data-area1510="${esc(a.id)}"><div class="top"><h3>${esc(a.title)}</h3><span class="coverage">${a.coverage}%</span></div><p>${esc(a.description)}</p><div class="meta"><span>${a.topicCount} Themen</span><span>·</span><span>${a.focusCount} priorisiert</span></div></button>`).join('');
  host.querySelectorAll('[data-area1510]').forEach(b=>b.onclick=()=>{area=b.dataset.area1510;renderAll()});
}
function renderLenses(){
  const host=$('#strategyLenses1510');
  host.innerHTML=`<button class="strategy-lens1510 ${lens==='all'?'active':''}" data-lens1510="all">Alle</button>`+(state?.lenses||[]).map(x=>`<button class="strategy-lens1510 ${lens===x?'active':''}" data-lens1510="${esc(x)}">${esc(x)}</button>`).join('');
  host.querySelectorAll('[data-lens1510]').forEach(b=>b.onclick=()=>{lens=b.dataset.lens1510;renderAll()});
}
function topicCard(t){
  const a=(t.authors||[]).slice(0,2).map(x=>x.name).join(' · '),c=t.coverage||{};
  return `<article class="strategy-topic1510 ${t.focus?'focus':''}" data-topic1510="${esc(t.id)}"><div class="strategy-topic-top1510"><span class="strategy-priority1510 ${esc(t.priority)}">${esc(pLabel(t.priority))}</span>${t.focus?`<span class="strategy-focus1510" title="Priorisiertes Thema">★</span>`:''}</div><h4>${esc(t.title)}</h4><p>${esc(t.description)}</p>${meter(c.score)}<div class="strategy-topic-foot1510"><strong>${c.score||0}%</strong><span>${c.articles||0} Artikel</span><span>${c.derivatives||0} Derivate</span>${a?`<span class="strategy-author-mini1510">${esc(a)}</span>`:''}</div></article>`;
}
function boardTitle(rows){
  const title=area==='all'?'Themenlandkarte':state.areas.find(a=>a.id===area)?.title||'Themen';
  const subtitle=lens==='all'?`${rows.length} Themen · hier liegt die gesamte Struktur hinter deinem aktuellen Fokus.`:`${rows.length} Themen im Querschnitt „${lens}“`;
  return `<div class="strategy-board-title1510"><div><h3>${esc(title)}</h3><p>${esc(subtitle)}</p></div></div>`;
}
function renderBoard(){const rows=filtered();$('#strategyBoard1510').innerHTML=boardTitle(rows)+(rows.length?`<div class="strategy-topic-grid1510">${rows.map(topicCard).join('')}</div>`:'<div class="strategy-empty1510">Für diesen Filter gibt es noch keine Themen.</div>');bindTopicCards()}
function renderCoverage(){
  const rows=filtered().sort((a,b)=>(a.coverage?.score||0)-(b.coverage?.score||0));
  const head=`<div class="strategy-board-title1510"><div><h3>Coverage & Lücken</h3><p>Niedrige Werte zuerst. Der Score wächst mit Research, Concept, Leitartikel, Derivaten und Veröffentlichung.</p></div></div>`;
  const header='<div class="strategy-coverage-row1510 header"><span>Thema</span><span>Coverage</span><span>Research</span><span>Artikel</span><span>Derivate</span><span>Publiziert</span></div>';
  $('#strategyBoard1510').innerHTML=head+`<div class="strategy-coverage-table1510">${header}${rows.map(t=>{const c=t.coverage||{},gap=Math.max(0,(t.coverageTarget||75)-(c.score||0));return `<div class="strategy-coverage-row1510" data-topic1510="${esc(t.id)}"><div><strong>${esc(t.title)}</strong>${gap>0?`<div class="strategy-gap1510"><b>−${gap}</b><span>bis Ziel ${t.coverageTarget}%</span></div>`:''}</div><div>${meter(c.score)}<small>${c.score}% / ${t.coverageTarget}%</small></div><strong>${c.research||0}</strong><strong>${c.articles||0}</strong><strong>${c.derivatives||0}</strong><strong>${c.published||0}</strong></div>`}).join('')}</div>`;
  bindTopicCards();
}
function renderPriorityTopics(){
  const rows=filtered().filter(t=>t.focus).sort((a,b)=>(a.focus.priority||99)-(b.focus.priority||99));
  $('#strategyBoard1510').innerHTML=`<div class="strategy-board-title1510"><div><h3>Priorisierte Strategiethemen</h3><p>Das sind Themen, die du grundsätzlich höher gewichtet hast. Dein aktiver Arbeitsfokus steht oben auf der Seite.</p></div></div>`+(rows.length?`<div class="strategy-focus-grid1510">${rows.map(t=>`<article class="strategy-focus-card1510" data-topic1510="${esc(t.id)}"><span class="num">${t.focus.priority}</span><small>${esc(t.focus.period||'')}</small><h4>${esc(t.title)}</h4><p>${esc(t.description)}</p>${meter(t.coverage?.score||0)}<div class="strategy-topic-foot1510"><strong>${t.coverage?.score||0}%</strong><span>${t.coverage?.articles||0} Artikel</span><span>${t.coverage?.research||0} Research</span></div></article>`).join('')}</div>`:'<div class="strategy-empty1510">Noch kein Strategiethema priorisiert. Öffne ein Thema und markiere es mit ☆.</div>');
  bindTopicCards();
}
function bindTopicCards(){document.querySelectorAll('#strategyBoard1510 [data-topic1510]').forEach(x=>x.onclick=()=>openTopic(x.dataset.topic1510))}

function workFocusCounts(c={}){
  return `<div class="strategy-current-counts15103"><div><strong>${c.captures||0}</strong><span>Captures</span></div><div><strong>${c.research||0}</strong><span>Research</span></div><div><strong>${c.concepts||0}</strong><span>Concepts</span></div><div><strong>${c.articles||0}</strong><span>Artikel</span></div></div>`;
}
function stageRail(current){
  return `<div class="strategy-stage-rail15103" aria-label="Fokus-Workflow">${['explore','research','synthesize','produce'].map((s,i)=>`<button type="button" data-focus-stage15103="${s}" class="${current===s?'active':''}"><span>${i+1}</span>${stageLabel(s)}</button>`).join('')}</div>`;
}
function renderParkedFocus(items=[]){
  if(!items.length)return'';
  return `<details class="strategy-parked15103"><summary>${items.length} für später vorgemerkt</summary><div>${items.map(x=>`<article><div><strong>${esc(x.title)}</strong><small>${esc(stageLabel(x.stage))}${x.topicTitle?' · '+esc(x.topicTitle):''}</small></div><button type="button" class="kh-soft" data-focus-activate15103="${esc(x.id)}">Aktivieren</button></article>`).join('')}</div></details>`;
}
function renderSuggestions(meta={}){
  const host=$('#strategyFocusSuggestions15103'); if(!host)return;
  if(!focusSuggestions.length){host.innerHTML='';return}
  host.innerHTML=`${meta.message?`<p class="strategy-suggestion-note15103">${esc(meta.message)}</p>`:''}<div class="strategy-suggestion-grid15103">${focusSuggestions.map((s,i)=>{const c=s.coverage||{};return `<article class="strategy-suggestion15103"><span class="kh-eyebrow">VORSCHLAG ${i+1}</span><h4>${esc(s.title)}</h4><p>${esc(s.framing||s.whyNow||'')}</p><div class="strategy-why15103">${esc(s.whyNow||'')}</div>${s.topicTitle?`<small>${esc(s.topicTitle)} · ${c.captures||0} Captures · ${c.research||0} Research · ${c.articles||0} Artikel</small>`:''}<button type="button" class="kh-primary" data-focus-pick15103="${i}">Als Fokus setzen</button></article>`}).join('')}</div>`;
  host.querySelectorAll('[data-focus-pick15103]').forEach(b=>b.onclick=()=>pickSuggestion(Number(b.dataset.focusPick15103)));
}
function renderWorkFocus(){
  const host=$('#strategyWorkFocus15103'); if(!host)return;
  const wf=state?.workFocus||{},f=wf.current;
  if(!f){
    host.innerHTML=`<section class="strategy-focus-entry15103"><div class="strategy-focus-question15103"><span class="kh-eyebrow">START HIER</span><h3>Was beschäftigt dich gerade?</h3><p>Du brauchst noch keinen Content-Titel. Ein Gedanke oder eine Frage reicht.</p></div><div class="strategy-focus-paths15103"><article><span>01</span><h4>Ich weiß, woran ich arbeiten möchte.</h4><textarea id="strategyFocusInterest15103" rows="3" placeholder="Mich beschäftigt gerade …"></textarea><label>Passendes Strategiethema <select id="strategyFocusTopic15103">${topicOptions('')}</select></label><div class="strategy-focus-actions15103"><button id="strategyFocusSet15103" class="kh-primary" type="button">Fokus setzen</button><button id="strategyFocusSharpen15103" class="kh-soft" type="button">Mit lokaler KI schärfen</button></div></article><article><span>02</span><h4>Ich weiß gerade nicht, womit ich anfangen soll.</h4><p>Die lokale KI schaut auf deine Themenlandkarte und das Material, das bereits im Knowledge Hub liegt. Sie schlägt nur drei Fokusse vor.</p><button id="strategyFocusSuggest15103" class="kh-soft" type="button">Aus meinem Material Vorschläge machen</button></article></div><div id="strategyFocusSuggestions15103"></div></section>`;
    $('#strategyFocusSet15103')?.addEventListener('click',setManualFocus);
    $('#strategyFocusSharpen15103')?.addEventListener('click',()=>requestSuggestions('interest'));
    $('#strategyFocusSuggest15103')?.addEventListener('click',()=>requestSuggestions('discover'));
    renderSuggestions();
    return;
  }
  const c=f.coverage||{};
  host.innerHTML=`<section class="strategy-current15103"><div class="strategy-current-head15103"><div><span class="kh-eyebrow">GERADE IM FOKUS</span><h3>${esc(f.title)}</h3>${f.interest?`<blockquote>„${esc(f.interest)}“</blockquote>`:''}<div class="strategy-current-meta15103">${f.topicTitle?`<span>${esc(f.topicTitle)}</span>`:'<span>Noch keinem Strategiethema zugeordnet</span>'}<span>·</span><span>${esc(stageLabel(f.stage))}</span></div></div><button id="strategyFocusPark15103" class="kh-soft" type="button">Für später vormerken</button></div>${stageRail(f.stage)}<div class="strategy-current-body15103"><div>${workFocusCounts(c)}<div class="strategy-next15103"><span>Was jetzt sinnvoll wäre</span><p>${esc(f.nextStep||'')}</p></div>${(f.researchQuestions||[]).length?`<details class="strategy-research-questions15103"><summary>Recherchefragen</summary><ol>${f.researchQuestions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></details>`:''}<div class="strategy-focus-main-actions15103">${f.topicId?'<button id="strategyFocusResearch15103" class="kh-soft" type="button">Research vormerken</button><button id="strategyFocusMaterial15103" class="kh-soft" type="button">Material ansehen</button><button id="strategyFocusArticle15103" class="kh-primary" type="button">Leitartikel anlegen</button>':'<span class="strategy-suggestion-note15103">Ordne den Fokus einem Strategiethema zu, damit Material und Content automatisch zusammengeführt werden können.</span>'}</div></div><aside class="strategy-focus-edit15103"><span class="kh-eyebrow">FOKUS BEARBEITEN</span><label>Titel<input id="strategyFocusTitleEdit15103" value="${esc(f.title)}"></label><label>Mein ursprünglicher Gedanke<textarea id="strategyFocusInterestEdit15103" rows="3">${esc(f.interest||'')}</textarea></label><label>Strategiethema<select id="strategyFocusTopicEdit15103">${topicOptions(f.topicId||'')}</select></label><div class="strategy-focus-edit-actions15103"><button id="strategyFocusSaveEdit15103" class="kh-soft" type="button">Änderungen speichern</button><button id="strategyFocusComplete15103" class="kh-soft" type="button">Fokus abschließen</button></div></aside></div>${renderParkedFocus(wf.parked||[])}</section>`;
  $$('[data-focus-stage15103]').forEach(b=>b.onclick=()=>updateFocus({id:f.id,stage:b.dataset.focusStage15103}));
  $('#strategyFocusPark15103')?.addEventListener('click',()=>updateFocus({id:f.id,status:'parked'}));
  $('#strategyFocusSaveEdit15103')?.addEventListener('click',()=>updateFocus({id:f.id,title:$('#strategyFocusTitleEdit15103').value,interest:$('#strategyFocusInterestEdit15103').value,topicId:$('#strategyFocusTopicEdit15103').value}));
  $('#strategyFocusComplete15103')?.addEventListener('click',()=>updateFocus({id:f.id,status:'completed'}));
  $('#strategyFocusMaterial15103')?.addEventListener('click',()=>openTopic(f.topicId));
  $('#strategyFocusResearch15103')?.addEventListener('click',()=>createFromFocus('research'));
  $('#strategyFocusArticle15103')?.addEventListener('click',()=>createFromFocus('article'));
  $$('[data-focus-activate15103]').forEach(b=>b.onclick=()=>updateFocus({id:b.dataset.focusActivate15103,status:'active'}));
}

async function setManualFocus(){
  const interest=String($('#strategyFocusInterest15103')?.value||'').trim();
  if(!interest){notice('Schreib zuerst kurz hin, was dich gerade beschäftigt.','warn');return}
  try{await vault('/knowledge/strategy/work-focus','POST',{interest,title:interest,topicId:$('#strategyFocusTopic15103')?.value||'',status:'active',stage:'explore',source:'user',targetFormat:'article'});focusSuggestions=[];await load(true);notice('Arbeitsfokus gesetzt.')}catch(e){notice(e.message,'warn')}
}
async function updateFocus(payload){try{await vault('/knowledge/strategy/work-focus','POST',payload);await load(true);notice(payload.status==='parked'?'Fokus für später vorgemerkt.':'Fokus aktualisiert.')}catch(e){notice(e.message,'warn')}}
async function requestSuggestions(kind){
  const interest=String($('#strategyFocusInterest15103')?.value||'').trim();
  if(kind==='interest'&&!interest){notice('Schreib zuerst deinen Gedanken in das Feld.','warn');return}
  const host=$('#strategyFocusSuggestions15103');if(host)host.innerHTML='<div class="strategy-empty1510">Lokale KI schaut auf Themen und vorhandenes Material …</div>';
  try{const x=await vault('/knowledge/strategy/work-focus/suggest','POST',{mode:kind,interest});focusSuggestions=x.suggestions||[];renderSuggestions(x);if(!x.ai&&x.message)notice(x.message,'warn')}catch(e){focusSuggestions=[];renderSuggestions();notice(e.message,'warn')}
}
async function pickSuggestion(i){
  const s=focusSuggestions[i];if(!s)return;
  try{await vault('/knowledge/strategy/work-focus','POST',{title:s.title,interest:String($('#strategyFocusInterest15103')?.value||'').trim(),framing:s.framing||'',topicId:s.topicId||'',researchQuestions:s.researchQuestions||[],nextStep:s.nextStep||'',aiNote:s.whyNow||'',status:'active',stage:'research',source:'local_ai',targetFormat:'article'});focusSuggestions=[];await load(true);notice('Vorschlag als Arbeitsfokus übernommen.')}catch(e){notice(e.message,'warn')}
}
async function createFromFocus(kind){
  const f=state?.workFocus?.current;if(!f?.topicId)return;
  const labels={research:'Research-Idee',article:'Leitartikel'};
  try{await vault('/knowledge/strategy/create-content','POST',{topicId:f.topicId,kind,title:f.title});await load(true);notice(`${labels[kind]||'Inhalt'} angelegt und mit deinem Fokus verbunden.`)}catch(e){notice(e.message,'warn')}
}

function renderAll(){if(!state)return;renderWorkFocus();renderStats();renderAreas();renderLenses();if(mode==='coverage')renderCoverage();else if(mode==='focus')renderPriorityTopics();else renderBoard()}
async function load(force=false){
  const pill=$('#strategyVault1510');
  try{if(pill){pill.textContent='Lade Themen …';pill.className='kh-pill'}const x=await vault('/knowledge/strategy/overview');state=x;if(pill){pill.textContent='Knowledge Hub verbunden';pill.className='kh-pill ok'}renderAll()}
  catch(e){if(pill){pill.textContent=/gesperrt|locked/i.test(e.message||'')?'Vault entsperren':'Nicht verfügbar';pill.className='kh-pill warn'}$('#strategyWorkFocus15103').innerHTML=`<div class="strategy-empty1510">${esc(e.message)}</div>`;$('#strategyBoard1510').innerHTML=''}
}
function openTopic(id){
  activeTopic=(state?.topics||[]).find(t=>t.id===id);if(!activeTopic)return;
  const t=activeTopic,c=t.coverage||{};
  $('#strategyTopicTitle1510').textContent=t.title;$('#strategyTopicDescription1510').textContent=t.description||'';$('#strategyTopicScore1510').textContent=(c.score||0)+'%';$('#strategyTopicMeter1510').style.width=(c.score||0)+'%';$('#strategyTopicTarget1510').textContent=`Ziel ${t.coverageTarget}% · ${Math.max(0,t.coverageTarget-(c.score||0))} Punkte offen`;
  $('#strategyTopicCounts1510').innerHTML=`<div><span>Research</span><strong>${c.research||0}</strong></div><div><span>Concepts</span><strong>${c.concepts||0}</strong></div><div><span>Artikel</span><strong>${c.articles||0}</strong></div><div><span>Derivate</span><strong>${c.derivatives||0}</strong></div>`;
  $('#strategyTopicAuthors1510').innerHTML=(t.authors||[]).length?(t.authors||[]).map(a=>`<article class="strategy-author1510"><strong>${esc(a.name)}</strong><span>${esc(a.theory)}</span><p>${esc(a.notes||'')}</p></article>`).join(''):'<div class="kh-empty compact">Noch keine Theoriezuordnung.</div>';
  $('#strategyTopicContent1510').innerHTML=(t.recentContent||[]).length?t.recentContent.map(a=>`<div class="strategy-content-row1510"><div><strong>${esc(a.title)}</strong><small>${esc(typeLabel(a.type))} · ${esc(a.channel||'')}</small></div><span class="status-chip">${esc(a.status)}</span></div>`).join(''):'<div class="kh-empty compact">Noch kein Content zugeordnet. Das ist eine echte strategische Lücke.</div>';
  $('#strategyTopicPriority1510').value=t.priority;$('#strategyTopicTargetInput1510').value=t.coverageTarget;
  const fb=$('#strategyTopicFocus1510');fb.textContent=t.focus?'★ Priorität entfernen':'☆ Priorisieren';fb.dataset.active=t.focus?'1':'0';
  $('#strategyTopicDialog1510').showModal();
}
async function saveTopic(){if(!activeTopic)return;try{await vault('/knowledge/strategy/topic/update','POST',{id:activeTopic.id,priority:$('#strategyTopicPriority1510').value,coverageTarget:Number($('#strategyTopicTargetInput1510').value||75)});$('#strategyTopicDialog1510').close();await load(true);notice('Strategiethema gespeichert.')}catch(e){notice(e.message,'warn')}}
async function togglePriority(){if(!activeTopic)return;const isOn=$('#strategyTopicFocus1510').dataset.active==='1';try{await vault('/knowledge/strategy/focus','POST',{topicId:activeTopic.id,active:!isOn,period:'Q4 2026',priority:activeTopic.focus?.priority||((state?.stats?.focus||0)+1)});$('#strategyTopicDialog1510').close();await load(true);notice(isOn?'Priorität entfernt.':'Strategiethema priorisiert.')}catch(e){notice(e.message,'warn')}}
async function createFromTopic(kind){if(!activeTopic)return;const labels={idea:'Concept',research:'Research-Idee',article:'Leitartikel'};try{await vault('/knowledge/strategy/create-content','POST',{topicId:activeTopic.id,kind});$('#strategyTopicDialog1510').close();await load(true);notice(`${labels[kind]||'Inhalt'} angelegt und mit „${activeTopic.title}“ verbunden.`)}catch(e){notice(e.message,'warn')}}
function openNew(){if(!state)return;$('#strategyNewArea1510').innerHTML=(state.areas||[]).map(a=>`<option value="${esc(a.id)}">${esc(a.title)}</option>`).join('');$('#strategyNewForm1510').reset();$('#strategyNewDialog1510').showModal()}
async function createTopic(e){e.preventDefault();const split=v=>String(v||'').split(',').map(x=>x.trim()).filter(Boolean);try{await vault('/knowledge/strategy/topic/create','POST',{title:$('#strategyNewTitle1510').value,description:$('#strategyNewDescription1510').value,areaIds:[$('#strategyNewArea1510').value],lenses:split($('#strategyNewLenses1510').value),keywords:split($('#strategyNewKeywords1510').value)});$('#strategyNewDialog1510').close();await load(true);notice('Strategiethema angelegt.')}catch(err){notice(err.message,'warn')}}
function bind(){
  document.querySelector('.kh-tabs [data-view="strategy"]')?.addEventListener('click',()=>setTimeout(()=>load(false),0));
  $$('#strategyModes1510 [data-strategy-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.strategyMode;$$('#strategyModes1510 button').forEach(x=>x.classList.toggle('active',x===b));renderAll()});
  $('#strategySearch1510')?.addEventListener('input',renderAll);$('#strategyRefresh1510')?.addEventListener('click',()=>load(true));$('#strategyNewTopic1510')?.addEventListener('click',openNew);
  $('#strategyTopicClose1510')?.addEventListener('click',()=>$('#strategyTopicDialog1510').close());$('#strategyTopicSave1510')?.addEventListener('click',saveTopic);$('#strategyTopicFocus1510')?.addEventListener('click',togglePriority);
  $$('[data-strategy-create]').forEach(b=>b.onclick=()=>createFromTopic(b.dataset.strategyCreate));$('#strategyNewClose1510')?.addEventListener('click',()=>$('#strategyNewDialog1510').close());$('#strategyNewCancel1510')?.addEventListener('click',()=>$('#strategyNewDialog1510').close());$('#strategyNewForm1510')?.addEventListener('submit',createTopic);
  document.addEventListener('bd:vault-mutated',e=>{const p=String(e.detail?.path||'');if(p.startsWith('/knowledge')&&document.querySelector('[data-view-panel="strategy"]')?.classList.contains('active'))setTimeout(()=>load(false),220)});
}
function init(){bind();if(new URLSearchParams(location.search).get('view')==='strategy')setTimeout(()=>document.querySelector('.kh-tabs [data-view="strategy"]')?.click(),80)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BDContentStrategy1510={refresh:()=>load(true)};
})();
