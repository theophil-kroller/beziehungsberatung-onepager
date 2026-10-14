/* Beziehungsdynamiken 15.12.121 · Gesprächsführung-Lab; fiction-only, local scoring. */
(()=>{'use strict';
const cases=window.BDTalk121Cases||[], $=id=>document.getElementById(id);
const expected=11;
if(cases.length!==expected || !cases.every(c=>c.rounds?.length===4&&c.rounds.every(r=>r.options?.length===4))){$('cards').textContent='Die Gesprächsfälle konnten nicht vollständig geladen werden.';return;}
const categories={kontakt:['vorwurf','wut','scham','schweigen'],beziehung:['affaire','druck','grenze'],risiko:['suizid','kontrolle','panik','drohung']};
const grades=['Sehr passend','Gut vertretbar','Mit wichtiger Einschränkung','Hier wenig passend'];
const score=[3,2,1,0];
const stateLabel=['Kontakt öffnet sich','Gespräch bleibt möglich','Kontakt wird fragiler','Spannung oder Risiko steigt'];
const key=()=>`bd-talklab121-${$('profile').value}`;
const blank=()=>({schema:1,done:{},attempts:{}});
const escapeText=x=>String(x??'');
let current=null,run=null,progress=load(),filter='alle';
function load(){try{const v=JSON.parse(localStorage.getItem(key())||'null');return v?.schema===1&&v.done&&v.attempts?v:blank()}catch{return blank()}}
function save(){try{localStorage.setItem(key(),JSON.stringify(progress))}catch{}}
function h(s){let x=2166136261;for(const ch of s){x=Math.imul(x^ch.charCodeAt(0),16777619)}return x>>>0}
function order(c,round){const seed=`${c.id}:${round}:${progress.attempts[c.id]||0}`;return [0,1,2,3].sort((a,b)=>h(seed+':'+a)-h(seed+':'+b))}
function el(tag,cls,value){const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x}
function button(txt,klass,cb){const x=el('button',klass,txt);x.type='button';x.addEventListener('click',cb);return x}
function scrollToDecision(){ $('decision').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}) }
function count(){return Object.keys(progress.done).length}
function updateTotals(){const n=count();$('countDone').textContent=`${n} von ${cases.length} Fällen bearbeitet`;$('finished').textContent=`${n}/${cases.length}`}
function showHome(){current=null;run=null;$('simulation').hidden=true;$('overview').hidden=false;drawCards();window.scrollTo({top:0,behavior:'instant'})}
function drawCards(){updateTotals();$('cards').replaceChildren();cases.filter(c=>filter==='alle'||(categories[filter]||[]).includes(c.id)).forEach(c=>{
 const card=el('button','case-card');card.type='button';const top=el('div','case-top');top.append(el('span','case-tag',c.category));if(c.level===4)top.append(el('span','danger-tag','⛨ Sicherheit'));card.append(top,el('h3','',c.title),el('div','description',c.goal));
 const bottom=el('div','card-bottom');const done=progress.done[c.id];bottom.append(el('span','',done?'↻ Erneut trainieren':'Gespräch starten ↗'),el('small','',done?`✓ Bestwert ${done.best}/12`:'4 Gesprächsrunden · 4 Optionen'));card.append(bottom);
 card.setAttribute('aria-label',`${c.title} – 4 Gesprächsrunden starten`);card.addEventListener('click',()=>start(c));$('cards').append(card);
 });}
function start(c){current=c;run={index:0,history:[],chosen:null,score:0,unsafe:false};$('overview').hidden=true;$('simulation').hidden=false;render();window.scrollTo({top:0,behavior:'instant'})}
function markHistory(){const turns=$('turns');turns.replaceChildren();const make=(speaker,text,klass)=>{const node=el('div','turn '+klass);node.append(el('span','speaker',speaker),el('p','',text));turns.append(node)};
 make('KLIENT:IN',current.opening,'client');
 for(const rec of run.history){make(`DU ALS BERATER:IN · RUNDE ${rec.round}`,rec.option.say,'advisor');make('KLIENT:IN · REAKTION',rec.option.reply,'client')}
}
function render(){if(!current||!run)return;
 const c=current,idx=run.index,end=idx===4;
 $('stepLabel').textContent=end?'Gespräch abgeschlossen':`Runde ${idx+1} von 4`;
 $('progressTrack').setAttribute('aria-valuenow',String(idx));$('progressFill').style.width=`${25*idx}%`;
 $('caseCategory').textContent=c.category+' · '+c.goal;$('caseTitle').textContent=c.title;$('caseContext').textContent=c.context;$('caseAnchor').textContent=c.anchor;
 $('safety').hidden=c.level!==4;if(c.level===4)$('safetyText').textContent=c.guard;
 markHistory();const stage=$('stage');stage.replaceChildren();
 if(end){renderResults(stage);return;}
 const r=c.rounds[idx];stage.append(el('span','eyebrow',`RUNDE ${idx+1} / 4 · ${r.focus}`),el('h2','',idx===0?'Was antwortest du jetzt?':'Wie führst du das Gespräch weiter?'));
 stage.append(el('p','prompt',idx===0?'Lies die aktuelle Aussage und wähle eine der vier Interventionen.':`Deine letzte Antwort hat die Reaktion beeinflusst. Aktueller Kontakt: ${stateLabel[run.history.at(-1).choice]}. Wähle, wie du darauf eingehst.`));
 const options=el('div','options');const choices=order(c,idx);
 choices.forEach((o,i)=>{const entry=r.options[o];const btn=button('', 'option',()=>choose(o));btn.append(el('span','letter',String.fromCharCode(65+i)),el('span','',entry.say));btn.dataset.choice=String(o);options.append(btn)});stage.append(options);
 if(run.chosen!==null){options.querySelectorAll('button').forEach(x=>{x.disabled=true;x.classList.toggle('selected',Number(x.dataset.choice)===run.chosen)});
 const chosenOption=r.options[run.chosen],reaction=el('div','reaction');reaction.append(el('strong','','Klient:in reagiert auf deine Worte'),el('p','',chosenOption.reply));stage.append(reaction);
 if(c.level===4&&run.chosen>1)stage.append(el('div','warn','Sicherheitsrelevante Entscheidung: In einer realen Situation dürften notwendige Schutz- oder Notfallschritte dadurch nicht verzögert werden. Die Simulation ist kein Ersatz für Krisenprotokolle.'));
 stage.append(button(idx===3?'Gespräch auswerten →':'Nächste Gesprächsrunde →','primary next',advance));
 }
}
function choose(ix){if(!current||run?.chosen!==null||run.index>=4)return;run.chosen=ix;render();const r=$('stage').querySelector('.reaction');r?.scrollIntoView({behavior:'smooth',block:'nearest'})}
function advance(){if(run.chosen===null)return;const ix=run.chosen;run.history.push({round:run.index+1,choice:ix,option:current.rounds[run.index].options[ix]});run.score+=score[ix];if(current.level===4&&ix>=2)run.unsafe=true;run.index++;run.chosen=null;if(run.index===4){const old=progress.done[current.id];progress.done[current.id]={best:Math.max(run.score,old?.best||0),last:run.score,lastAt:new Date().toISOString()};progress.attempts[current.id]=(progress.attempts[current.id]||0)+1;save()}render();scrollToDecision()}
function renderResults(host){let headline='';if(current.level===4&&run.unsafe)headline='Sicherheitskritische Entscheidungen – Fall erneut prüfen';else if(run.score>=11)headline='Sehr stimmige Gesprächsführung';else if(run.score>=8)headline='Gute Gesprächsbasis';else headline='Gezielte Übung lohnt sich';
 host.append(el('span','eyebrow','FACHLICHE REFLEXION'),el('h2','',headline));const scorebox=el('div','result-score');scorebox.append(el('strong','',`${run.score} / 12`),el('p','',current.level===4?'Fiktiver Übungswert – KEINE Bestätigung von Krisenkompetenz. Eine ausgelassene Sicherheitsmaßnahme kann nicht durch andere Punkte ausgeglichen werden.':'Didaktischer Vergleichswert – kein objektives Kompetenzgutachten.'));host.append(scorebox);
 const list=el('div','review');run.history.forEach((item,i)=>{const box=el('div','review-item');box.append(el('b','',`Runde ${i+1}: ${grades[item.choice]}`),el('p','',`Deine Wahl: ${item.option.say}`),el('p','',item.option.why));if(item.choice!==0)box.append(el('p','best',`In dieser Szene besonders passend: ${current.rounds[i].options[0].say}`));list.append(box)});host.append(list);
 const act=el('div','result-actions');act.append(button('Anderen Verlauf versuchen ↻','primary',()=>start(current)),button('Alle Fälle ansehen','secondary',showHome));const next=cases.find(x=>!progress.done[x.id]&&x.id!==current.id);if(next)act.append(button('Nächster untrainierter Fall ↗','secondary',()=>start(next)));host.append(act);
 host.append(el('p','prompt',`Theoriekompass: ${current.anchor}`));$('progressFill').style.width='100%';}
$('startFirst').addEventListener('click',()=>start(cases.find(c=>!progress.done[c.id])||cases[0]));$('toOverview').addEventListener('click',showHome);$('restart').addEventListener('click',()=>{if(current)start(current)});$('jumpChoice').addEventListener('click',scrollToDecision);$('profile').addEventListener('change',()=>{progress=load();showHome()});
$('filters').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$('filters').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));drawCards()}));
showHome();
})();
