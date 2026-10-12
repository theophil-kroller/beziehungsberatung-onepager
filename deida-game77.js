/* Deida-inspired practice simulations · 15.12.77.1. No AI scoring / no diagnostics. */
(()=>{'use strict';
const data=window.BDDeida77, chars=window.BDMastery72?.characters;
if(!data||!Array.isArray(chars))return;
const $=id=>document.getElementById(id), PREFIX='bd-deida77-', LEVELS=20;
const quota=n=>n<=5?10:n<=10?12:n<=15?15:18;
const diversity=n=>n<=5?5:n<=10?6:n<=15?8:10;
const PHASE=['Wahrnehmen','Hypothesen entwickeln','Interventionen','Repair & Retry','Selbst formulieren','Paargespräche halten','Perspektivenwechsel'];
let feedbackSelected=null,feedbackScore=0,originalFreeText="",dialogueVariant=0;let profile='ich',state=null,level=1,encounter=null,part=0,mode=0,currentTask=null,choice=-1,passedFirst=false,completeReady=false,turns=Math.floor(Math.random()*50);
const defaultState=()=>({version:1,level:1,levels:{},xp:0,history:[]});
function load(){try{const s=JSON.parse(localStorage.getItem(PREFIX+profile)||'null');state=s?.version===1&&s.levels?{...defaultState(),...s}:defaultState()}catch{state=defaultState()}level=state.level}
function save(){try{localStorage.setItem(PREFIX+profile,JSON.stringify(state));window.BDCloud78?.onSaved('deida',PREFIX+profile)}catch{}}
function record(n){return state.levels[n]||(state.levels[n]={completed:[]})}
function completed(n){return record(n).completed}
function isPassed(n){return completed(n).length>=quota(n)&&new Set(completed(n).map(r=>r.lead)).size>=diversity(n)}
function hash(s){return [...s].reduce((a,x)=>(a*31+x.charCodeAt(0))%10000,11)}
function rotate(arr,n){const k=((n%arr.length)+arr.length)%arr.length;return [...arr.slice(k),...arr.slice(0,k)]}
function paintLevels(){const host=$('diLevels');host.replaceChildren();for(let n=1;n<=LEVELS;n++){const btn=document.createElement('button');btn.type='button';btn.textContent=n<state.level?'✓':n;btn.className=n===level?'current':n<state.level?'done':'';btn.title=`Level ${n} – ${data.levels[n-1]} (${quota(n)} verschiedene Fälle)`;btn.disabled=n>state.level;btn.onclick=()=>{level=n;$('diLevelsPanel').close();begin();};host.append(btn)}const rec=completed(level);$('diQuota').textContent=`${rec.length} / ${quota(level)} Fälle`;$('diDiversity').textContent=`${new Set(rec.map(x=>x.lead)).size} / ${diversity(level)} Personen`;$('diLevelTitle').textContent=`Level ${level} / 20 · ${data.levels[level-1]}`;$('diXp').textContent=`${state.xp} XP`;$('diFill').style.width=`${Math.min(100,rec.length/quota(level)*100)}%`}
function nextEncounter(){
 // 15.12.80: alte Lernstände behalten; über alle Level zuerst noch unbekannte Szenen,
 // danach gleichmäßige Wiederholung. Die aktuelle Szene bei "Anderer Fall" meiden.
 const seenLevel=new Set(completed(level).map(x=>x.id));
 const freq=new Map();for(const h of state.history||[])freq.set(h.id,(freq.get(h.id)||0)+1);
 let options=data.cases.filter(c=>!seenLevel.has(c.id));if(!options.length)options=data.cases.slice();
 const least=Math.min(...options.map(c=>freq.get(c.id)||0));options=options.filter(c=>(freq.get(c.id)||0)===least);
 const groupFreq=new Map();for(const h of state.history||[]){const c=data.cases.find(x=>x.id===h.id);if(!c)continue;const t=c.theme||c.category;groupFreq.set(t,(groupFreq.get(t)||0)+1)}
 const ng=Math.min(...options.map(c=>groupFreq.get(c.theme||c.category)||0));options=options.filter(c=>(groupFreq.get(c.theme||c.category)||0)===ng);
 if(encounter&&options.length>1){const fresh=options.filter(c=>c.id!==encounter.c.id);if(fresh.length)options=fresh}
 const c=options[Math.floor(Math.random()*options.length)];
 const counter={};completed(level).forEach(x=>counter[x.lead]=(counter[x.lead]||0)+1);
 const ranked=rotate(chars,level+turns).sort((a,b)=>(counter[a.id]||0)-(counter[b.id]||0));
 const a=ranked[0],b=chars[(chars.findIndex(x=>x.id===a.id)+5+(turns%4))%chars.length];
 return {c,a,b:a.id===b.id?chars[(chars.findIndex(x=>x.id===a.id)+1)%chars.length]:b};
}
function presentDialogue(){const {c,a,b}=encounter;$('diSceneTitle').textContent=c.topic;$('diContext').textContent=`${c.categoryTitle} · Gespräch mit ${a.name} und ${b.name} · ${c.bookChapters?`Buch Kap. ${c.bookChapters}`:"fiktiver Trainingsfall"}`;$('diAImg').src=`training-assets/characters/${a.id}.webp`;$('diBImg').src=`training-assets/characters/${b.id}.webp`;$('diAImg').alt=`Illustration von ${a.name}`;$('diBImg').alt=`Illustration von ${b.name}`;$('diAName').textContent=a.name;$('diBName').textContent=b.name;$('diASpeaker').textContent=a.name.toUpperCase();$('diBSpeaker').textContent=b.name.toUpperCase();const variant=window.BDExercise79?.dialogue(c,a,dialogueVariant)||{line:c.line,reply:c.reply};$('diALine').textContent=variant.line;$('diBLine').textContent=variant.reply;}
function choiceTask(question,kind,correct,wrong,explainer){return {question,kind,options:[{text:correct,good:true},...wrong.map(text=>({text,good:false}))],explainer,kindId:'choice'};}
function freeTask(c){return {question:'Wie würdest du die Situation jetzt in eigenen Worten ansprechen?',kind:'Freie Intervention · Selbstvergleich',options:[],explainer:`Eine mögliche Formulierung lautet: „${c.question}“\n${c.theory}\nFreitexte werden nicht automatisch fachlich bewertet. Die strukturierte Erstaufgabe musste korrekt bearbeitet sein; deine Formulierung dient der Selbstreflexion.`,kindId:'free'};}
function makeTask(c,m,step){const category=data.groups[c.category];
 if(step===0){if(m===0||m===5)return choiceTask('Welche Beobachtung ist aus dem Gespräch ableitbar?','Wahrnehmen',c.cue,[`Die Person ist eindeutig ${c.category==='scham'?'schuldig':'nicht mehr verliebt'}.`,'Eine Polaritätsstörung ist bewiesen.','Das Gespräch enthält keinerlei Hinweis auf unterschiedliche Erfahrungen.'],`Wahrnehmung: ${c.cue} Die innere Ursache bleibt offen.`);
 if(m===1||m===6)return choiceTask('Welche Deutung bleibt eine vorsichtige Arbeitshypothese?','Hypothesen',c.hypothesis,[`Die Ursache ist sicher eine maskulin-feminine Fehlverteilung.`,`Die zweite Person muss sich ändern, sonst kann kein Begehren entstehen.`,`Aus einer Aussage kann man keine einzige Frage mehr stellen.`],`Denkbar: ${c.hypothesis} Ebenso denkbar: ${c.alternative}`);
 if(m===2)return choiceTask('Welches alternative Erklärungsangebot sollten wir offenhalten?','Kontext prüfen',c.alternative,['Begehren wird ausschließlich vom Geschlecht bestimmt.','Sobald jemand sich zurückzieht, ist die Liebe vorbei.','Die Frage nach dem Kontext lenkt von der einzig richtigen Lösung ab.'],`Die Deida-Linse darf nicht den Blick auf Alltag, Schutz, Gesundheit und autonome Wünsche versperren.`);
 if(m===3)return choiceTask('Welche Aussage ist als voreilige Festlegung problematisch?','Vorschnelle Deutung',c.bad,[c.question,`Ich würde gerne verstehen, wie das für Sie beide ist.`,`Wir dürfen an dieser Stelle auch langsamer werden.`],`Problematisch: „${c.bad}“ – eine pauschale Deutung ohne Zustimmung und Überprüfung.`);
 if(m===4)return choiceTask('Welche vorsichtige Frage eignet sich als nächster Schritt?','Intervention wählen',c.question,[c.bad,`Dann einigen Sie sich am besten auf eine feste Häufigkeit für Sex.`,`Wer von Ihnen hat die Beziehung denn kaputt gemacht?`],`Eine offene Frage ermöglicht Erkundung: ${c.question}`);
 return choiceTask('Woran erkennst du, dass du beide Personen mitdenken musst?','Zwei Perspektiven',`Beide Äußerungen spiegeln ein eigenes Erleben: ${c.cue}`,[`Die erste Person hat immer recht, weil sie zuerst gesprochen hat.`,`Die zweite Person sollte im Gespräch grundsätzlich schweigen.`,`Wer die stärkere Reaktion zeigt, trägt die alleinige Verantwortung.`],`Würdige beide Perspektiven, ohne aus dem kurzen Ausschnitt eine Diagnose abzuleiten.`);
 }
 if(m===0)return choiceTask('Welche weitere Frage überprüft deine Wahrnehmung?','Nachfragen',c.question,[c.bad,'Warum sind Sie nicht einfach spontaner?','Wollen Sie zugeben, dass Sie keine Polarität mehr haben?'],`Eine Frage öffnet die Bedeutung, statt sie festzulegen: ${c.question}`);
 if(m===1)return choiceTask('Was wäre als nächster Schritt fachlich verantwortbar?','Intervention wählen',c.question,[c.bad,'Hier reicht eine starre Zuordnung von feminin und maskulin.','Die Beziehung wäre erotischer, wenn niemand mehr Nein sagt.'],`Intervention: ${c.question}`);
 if(m===2)return choiceTask('Was könnte einen möglichen Deutungsfehler korrigieren?','Repair & Retry',c.repair,[c.bad,'Ich bleibe bei meiner ursprünglichen Erklärung, das ist sicher richtig.','Das Problem ist eindeutig eine Geschlechterfrage.'],`Repair: ${c.repair}`);
 if(m===3)return choiceTask('Wie reparierst du eine voreilige Polaritätsdeutung?','Repair & Retry',c.repair,['Ich habe recht; Sie müssen die Polarisierung eben akzeptieren.',c.bad,'Ich würde die zweite Person nicht weiter hören.'],`Repair: ${c.repair}`);
 if(m===4)return freeTask(c);
 if(m===5)return choiceTask('Welche Intervention hält beide Stimmen im Gespräch?','Paargespräch',`Ich möchte zuerst ${encounter.a.name}s Erfahrung aufnehmen, danach ${encounter.b.name}s – ohne dass daraus eine Verpflichtung entsteht.`,[c.bad,`Ich frage nur ${encounter.a.name}, denn die erste Aussage erklärt die gesamte Dynamik.`,`Zuerst muss geklärt werden, wer den höheren Sexualtrieb hat.`],`Die Moderation hält zwei Erfahrungen auseinander und schützt Einwilligung. ${c.question}`);
 return choiceTask('Wie kannst du den Perspektivenwechsel nutzen?','Perspektivenwechsel',`Das Erleben von ${encounter.a.name} und ${encounter.b.name} kann gleichzeitig wahr sein; ich frage nach der Bedeutung für beide.`,[c.bad,`Eine Person lügt offenbar; ich muss sie überzeugen.`,`Ich entscheide, wer die erotische Führung zu übernehmen hat.`],`Perspektivenwechsel heißt nicht, alle Handlungen für gleichermaßen sicher zu erklären. Die Grenzen bleiben wichtig.`);
}
function showTask(){$('diResultOverlay').hidden=true;choice=-1;completeReady=false;currentTask=makeTask(encounter.c,mode,part);if(window.BDExercise79&&currentTask.kindId==='choice')currentTask=window.BDExercise79.deida(encounter.c,currentTask,level,mode,part);$('diTaskStep').textContent=`SCHRITT ${part+1} / 2`;$('diTaskKind').textContent=currentTask.kind;$('diMode').textContent=PHASE[mode].toUpperCase();$('diQuestion').textContent=currentTask.question;$('diInstruction').textContent=part===0?'Trenne Beobachtung und Deutung. Eine klare Frage ist oft hilfreicher als eine schnelle Erklärung.':currentTask.kindId==='free'?'Schreibe mindestens 20 Zeichen und vergleiche anschließend selbst mit einer fachlich begründeten Beispielintervention.':'Wähle die professionellste nächste Handlung. Es geht um Timing und Offenheit.';
const host=$('diChoices');host.replaceChildren();const input=$('diFree');input.hidden=currentTask.kindId!=='free';input.value='';
if(currentTask.kindId==='choice'){const options=window.BDExercise79?currentTask.options:rotate(currentTask.options,hash(encounter.c.id+level+part+mode)%currentTask.options.length);options.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.className='di-choice';b.textContent=o.text;b.dataset.correct=String(o.good);b.dataset.score=String(o.score??(o.good?3:0));b.dataset.reason=o.reason||'';b.onclick=()=>{if(completeReady)return;choice=i;host.querySelectorAll('.di-choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('diCheck').disabled=false};host.append(b)});}else input.oninput=()=>{$('diCheck').disabled=input.value.trim().length<20};
$('diCheck').hidden=false;$('diCheck').disabled=true;$('diCheck').textContent=currentTask.kindId==='free'?'Beispiel & Kriterien ansehen':'Antwort prüfen';$('diContinue').hidden=true;$('diFeedback').hidden=true;$('diFeedback').replaceChildren();}
function renderFeedback(correct,isFree){
 const el=$('diFeedback');el.replaceChildren();
 const h=document.createElement('strong');h.textContent=isFree?'Deine Formulierung im Vergleich':feedbackScore===3?'Besonders passend':feedbackScore===2?'Vertretbar – mit Vorbehalt':feedbackScore===1?'Teilweise hilfreich':'Noch nicht passend';el.append(h);
 const comp=document.createElement('div');comp.className='di-compare';
 const best=currentTask.options.find(o=>o.good)||currentTask.options.find(o=>o.score===3);
 function col(name,text){const box=document.createElement('div');box.className='di-compare-col';const title=document.createElement('b');title.textContent=name;const p=document.createElement('p');p.textContent=text;box.append(title,p);comp.append(box)}
 col('Deine Antwort',isFree?originalFreeText:feedbackSelected?.textContent?.trim()||'Keine Auswahl');
 col('Mögliche Intervention',isFree||currentTask.kind==='Vorschnelle Deutung'?encounter.c.question:best?.text||currentTask.explainer);
 el.append(comp);
 const why=document.createElement('p');why.className='di-why';const ratedReason=feedbackSelected?.dataset.reason;
 why.textContent=(isFree?'Vergleiche Offenheit, Konkretheit, Tempo und mögliche Wirkung. Deine Formulierung wird nicht automatisch bewertet.':ratedReason||currentTask.explainer)+(isFree?'':`  •  Fachliche Einordnung: ${currentTask.explainer}`);el.append(why);
 if(!correct&&!isFree){const n=document.createElement('p');n.className='di-review-note';n.textContent=feedbackScore===2?'Diese Variante ist begründbar, wird aber zur Festigung im 💪-Training vorgemerkt und zählt noch nicht als vollständig gemeistert.':'Diese Antwort kommt ins 💪-Training. Die Szene kannst du noch einmal üben.';el.append(n)}
 el.hidden=false;
}
function evaluate(){if(completeReady)return;const isFree=currentTask.kindId==='free';const boxes=[...$('diChoices').querySelectorAll('button')];
 if(!isFree&&choice<0)return;if(isFree&&$('diFree').value.trim().length<20)return;
 completeReady=true;feedbackSelected=isFree?null:boxes[choice];feedbackScore=isFree?3:Number(feedbackSelected.dataset.score||0);originalFreeText=isFree?$('diFree').value.trim():'';
 const correct=isFree||feedbackScore===3;const canAdvance=isFree||feedbackScore>=2;
 if(!isFree&&feedbackScore<3){try{window.BDMuscle78?.record({module:'deida',caseId:encounter.c.id,stage:part,question:currentTask.question,options:boxes.map(b=>b.textContent.trim()),correct:boxes.map((b,i)=>Number(b.dataset.score)>=3?i:-1).filter(i=>i>=0),explanation:feedbackSelected.dataset.reason||currentTask.explainer,context:encounter.c.line+' — '+encounter.c.reply});}catch(err){console.warn('[Academy] Muskel-Speicherung fehlgeschlagen, Training bleibt bedienbar.',err)}}
 if(!isFree){boxes.forEach((b,i)=>{b.disabled=true;const flag=Number(b.dataset.score)>=3?'correct':i===choice?'incorrect':null;if(flag)b.classList.add(flag)})}
 renderFeedback(correct,isFree);$('diCheck').hidden=true;$('diContinue').hidden=false;$('diResultOverlay').hidden=false;$('diContinue').focus({preventScroll:true});if(part===0)passedFirst=correct;
 if(part===1){const success=passedFirst&&correct;$('diContinue').textContent=success?'Fall abschließen →':'Erneut üben →';$('diContinue').dataset.success=String(success)}else $('diContinue').textContent=canAdvance?'Nächster Schritt →':'Fall neu versuchen →';
}
function advance(){if(!completeReady)return;$('diResultOverlay').hidden=true;const correct=(currentTask.kindId==='free'||feedbackScore>=2);if(part===0){if(correct){part=1;showTask()}else{part=0;showTask()}return}
if($('diContinue').dataset.success==='true'){const rec=completed(level);if(!rec.some(x=>x.id===encounter.c.id)){rec.push({id:encounter.c.id,lead:encounter.a.id,time:new Date().toISOString(),mode,reviewed:currentTask.kindId==='free'});state.xp+=15;state.history.push({id:encounter.c.id,level,mode,reviewed:currentTask.kindId==='free'});if(state.history.length>500)state.history=state.history.slice(-500);if(isPassed(level)&&level===state.level&&state.level<LEVELS){state.level++;level=state.level;}save();}}begin();}
function begin(){$('diResultOverlay').hidden=true;part=0;passedFirst=false;turns++;dialogueVariant=turns%3;encounter=nextEncounter();mode=(hash(encounter.c.id)+level)%PHASE.length;presentDialogue();paintLevels();showTask();}
$('diCheck').addEventListener('click',evaluate);$('diContinue').addEventListener('click',advance);$('diNextCase').addEventListener('click',()=>{try{speechSynthesis.cancel()}catch{}begin()});$('diProfile').addEventListener('change',e=>{profile=e.target.value;load();begin()});$('diVoice').addEventListener('click',()=>window.BDVoice73?.showManager());
function panel(id,open,close){const d=$(id);$(open).addEventListener('click',()=>d.showModal());$(close).addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()})}
panel('diLevelsPanel','diLevelsToggle','diLevelsClose');panel('diTheoryPanel','diInfo','diTheoryClose');
$('diCloseFeedback').addEventListener('click',advance);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('diResultOverlay').hidden){e.preventDefault();advance();} });$('diSpeakA').addEventListener('click',()=>window.BDVoice73?.speak(encounter.a.id,encounter.c.line));$('diSpeakB').addEventListener('click',()=>window.BDVoice73?.speak(encounter.b.id,encounter.c.reply));window.addEventListener('pagehide',()=>{try{speechSynthesis.cancel()}catch{}});
load();begin();
})();
