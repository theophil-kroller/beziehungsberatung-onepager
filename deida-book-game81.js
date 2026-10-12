/* Deida Deep Mastery 15.12.81: all 51 chapters, concept drill, critical transfer, delayed exam feedback, chapter compass. */
(()=>{'use strict';
const src80=window.BDDeidaKnowledge80||[],src81=window.BDDeidaKnowledge81||[];
const bank=[...src80.map(q=>({...q,track:'review',chapterNo:null,page:null,source:'Bisherige Buchwissenfrage (15.12.80)'})),...src81];
if(bank.length<100)return;
const $=id=>document.getElementById(id); const dlg=$('diBookPanel');if(!dlg)return;
const CHAPTERS=src81.filter(q=>q.track==='theory').sort((a,b)=>a.chapterNo-b.chapterNo);
const AREAS=[{label:'Lebensausrichtung & Authentizität',start:1,end:14},{label:'Emotionen, Lob & Herausforderungen',start:15,end:22},{label:'Polarität, Anziehung & Partnerwahl',start:23,end:29},{label:'Wünsche, Kritik & Richtung',start:30,end:34},{label:'Freiheit, Intensität & Begehren',start:35,end:43},{label:'Körperpraktiken (Quellenkritik)',start:44,end:46},{label:'Intimität, Verantwortung & Wachstum',start:47,end:51}];
let profile='ich',state={},exams=[],mode='practice',chapterFilter=null,q=null,order=[],chosen=-1,answered=false,exam=null,lastId=null;
const key=()=>`bd-deida-book80-${profile}`,examKey=()=>`bd-deida-exam81-${profile}`;
function load(){try{state=JSON.parse(localStorage.getItem(key())||'{}')||{}}catch{state={}}try{exams=JSON.parse(localStorage.getItem(examKey())||'[]')||[]}catch{exams=[]} }
function save(){try{localStorage.setItem(key(),JSON.stringify(state))}catch(e){console.warn('Deida local speichern fehlgeschlagen:',e)}}
function saveExam(){try{localStorage.setItem(examKey(),JSON.stringify(exams.slice(-15)))}catch(e){console.warn(e)}}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function attempt(item,correct){const x=state[item.id]||{seen:0,correct:0,streak:0};x.seen++;if(correct){x.correct++;x.streak=(x.streak||0)+1;if(x.lastCorrectAt&&Date.now()-x.lastCorrectAt>=20*3600000)x.spacedGood=true;if(!x.firstCorrectAt)x.firstCorrectAt=Date.now();x.lastCorrectAt=Date.now()}else{x.streak=0;x.spacedGood=false}x.last=Date.now();const days=correct?[1,3,7,14,30,60][Math.min(x.streak-1,5)]:0;x.due=x.last+days*86400000;state[item.id]=x;save();if(!correct)muscle(item);}
function muscle(item){try{window.BDMuscle78?.record({module:'deida',caseId:item.id,stage:0,question:item.question,options:item.answers,correct:[0],explanation:item.explanation,context:(item.chapter||'Buchwissen')+' · '+(item.source||'Deida-Lernaufgabe')})}catch(e){console.warn('Muskel-Speicherfehler ohne Trainingsabbruch:',e)}}
function progress(){const n=bank.filter(x=>state[x.id]?.seen>0).length,done=CHAPTERS.filter(x=>state[x.id]?.seen>0).length;return {n,done}}
function severity(item){const x=state[item.id];if(!x)return 2;if(x.correct<x.seen&&(!x.due||x.due<=Date.now()))return 7;if((x.due||0)<=Date.now())return 5;return 1}
function choose(){let pool=bank;if(chapterFilter!==null)pool=pool.filter(x=>x.chapterNo===chapterFilter);if(mode==='weak'){
  const weak=bank.filter(x=>state[x.id]?.seen>0&&((state[x.id].correct||0)<state[x.id].seen||((state[x.id].due||0)<=Date.now())));
  pool=weak.length?weak:bank.filter(x=>state[x.id]?.seen===0);
}
if(!pool.length)pool=bank;
const scored=pool.map(x=>({x,weight:severity(x)+(x.id===lastId?-30:0)+(x.track==='theory'&&!state[x.id]?.seen?3:0)}));const max=Math.max(...scored.map(v=>v.weight));const top=shuffle(scored.filter(v=>v.weight>=max-1).map(v=>v.x));return top[0]||bank[0];}
function setMode(next){mode=next;chapterFilter=null;exam=null;for(const [v,id] of [['practice','diBookPracticeMode'],['weak','diBookWeakMode'],['compass','diBookCompassMode'],['exam','diBookExamMode']])$(id).setAttribute('aria-pressed',String(v===mode));
$('diBookOverview').hidden=!(mode==='compass'||mode==='exam');$('diBookExercise').hidden=(mode==='compass'||mode==='exam');
if(mode==='compass')renderCompass();else if(mode==='exam')renderExamIntro();else present();}
function renderQuestion(item){q=item;lastId=item.id;chosen=-1;answered=false;order=shuffle([0,1,2,3]);
$('diBookChapter').textContent=item.chapter+(item.page?' · Buchseite '+item.page:'');$('diBookQuestion').textContent=item.question;
$('diBookProgress').textContent=exam?`Prüfungsfrage ${exam.index+1} / ${exam.items.length} · Rückmeldung erst am Ende`:`${progress().n}/${bank.length} Fragen bearbeitet · ${progress().done}/51 Kapitel kennengelernt`;
$('diBookHint').textContent=exam?'Bewusst entscheiden · keine Sofortkorrektur':item.track==='theory'?'Deidas Aussage verstehen':item.track==='transfer'?'Beratungstransfer · eigenes Trainingsszenario':'Zusätzliches Buchwissen';
const host=$('diBookOptions');host.replaceChildren();for(const idx of order){const b=document.createElement('button');b.type='button';b.className='di-book-option';b.textContent=item.answers[idx];b.setAttribute('aria-pressed','false');b.onclick=()=>{if(answered)return;chosen=idx;for(const n of host.children)n.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true');$('diBookCheck').disabled=false};host.append(b)}
$('diBookFeedback').hidden=true;$('diBookFeedback').replaceChildren();$('diBookCheck').hidden=false;$('diBookCheck').textContent=exam?'Antwort merken →':'Antwort prüfen';$('diBookCheck').disabled=true;$('diBookNext').hidden=true;
}
function present(){exam=null;const item=choose();renderQuestion(item)}
function check(){if(answered||chosen<0)return;answered=true;const correct=chosen===0;
 if(exam){exam.responses.push({id:q.id,answer:chosen,correct,chapterNo:q.chapterNo,track:q.track});exam.index++;if(exam.index<exam.items.length){renderQuestion(exam.items[exam.index]);return}finishExam();return;}
 attempt(q,correct);const host=$('diBookOptions');for(let i=0;i<host.children.length;i++){const b=host.children[i];b.disabled=true;if(order[i]===0)b.dataset.result='correct'}
 const fb=$('diBookFeedback');const title=document.createElement('b');title.textContent=correct?'Richtig zugeordnet':'Noch nicht – hier ist der fachliche Unterschied';
 const answer=document.createElement('p');answer.textContent=(correct?'Deidas Gedanke: ':'Passendere Antwort: ')+q.answers[0];
 const note=document.createElement('p');note.textContent=q.explanation;
 const src=document.createElement('small');src.textContent=q.source||'';fb.replaceChildren(title,answer,note,src);fb.hidden=false;$('diBookCheck').hidden=true;$('diBookNext').hidden=false;$('diBookNext').focus({preventScroll:true});
}
function chapterSummary(n){const qs=src81.filter(x=>x.chapterNo===n);const tried=qs.filter(x=>state[x.id]?.seen>0);const good=tried.filter(x=>(state[x.id].streak||0)>=2&&state[x.id].correct===state[x.id].seen&&state[x.id].seen>=2&&state[x.id].spacedGood);
 return {tried:tried.length,total:qs.length,good:good.length,errors:tried.filter(x=>state[x.id].correct<state[x.id].seen).length};}
function mk(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n}
function button(label,fn,cl='di-master-action'){const b=mk('button',label,cl);b.type='button';b.onclick=fn;return b}
function renderCompass(){const host=$('diBookOverview');host.replaceChildren();host.append(mk('h3','🧭 Lernkompass · 51 Kapitel'));const st=progress();host.append(mk('p',`Du hast ${st.done} von 51 Kapiteln mindestens einmal geprüft. Ein einzelner Treffer zählt noch nicht als langfristig gesichert. „Gefestigt“ erfordert mindestens zwei richtige Abrufe mit zeitlichem Abstand (mindestens 20 Stunden).`));
 const cards=mk('div','','di-compass-stat');for(const [n,s] of [[st.done,'Kapitel gesehen'],[CHAPTERS.filter(x=>chapterSummary(x.chapterNo).good>0).length,'Kapitel vorläufig gefestigt'],[bank.filter(x=>state[x.id]&&state[x.id].correct<state[x.id].seen).length,'Karten mit Fehlern']]){const el=document.createElement('div');el.append(mk('strong',String(n)),mk('small',s));cards.append(el)}host.append(cards);
 host.append(button('💪 Unsichere Fragen wiederholen',()=>setMode('weak')));
 AREAS.forEach(area=>{host.append(mk('h3',area.label));for(let n=area.start;n<=area.end;n++){const item=CHAPTERS[n-1];const d=chapterSummary(n);const row=mk('div','','di-chapter-row');const label=mk('div','');label.append(mk('b',`Kap. ${n} · ${item.topic}`),mk('small',`Buchseite ${item.page} · ${d.tried}/${d.total} Fragen gesehen · ${d.good>0?'vorläufig gefestigt':d.errors?'Wiederholung sinnvoll':'noch offen'}`));row.append(label,button('Üben',()=>{chapterFilter=n;mode='practice';$('diBookPracticeMode').setAttribute('aria-pressed','true');$('diBookCompassMode').setAttribute('aria-pressed','false');$('diBookOverview').hidden=true;$('diBookExercise').hidden=false;present()}));host.append(row)}});
}
function planExam(){const base=shuffle(src81.filter(x=>x.track==='theory'));const byArea=AREAS.map(a=>shuffle(base.filter(x=>x.chapterNo>=a.start&&x.chapterNo<=a.end)));let theory=[];let j=0;while(theory.length<14){let pool=byArea[j%byArea.length];const n=pool.shift();if(n)theory.push(n);j++;if(j>200)break;}
const transfer=shuffle(src81.filter(x=>x.track==='transfer')).slice(0,8);const old=shuffle(src80.map(x=>({...x,track:'review',chapterNo:null,source:'Bisherige Buchwissenfrage (15.12.80)'}))).slice(0,2);
const selected=shuffle([...theory,...transfer,...old]);if(selected.length!==24)throw Error('Exam pool incomplete');return selected;}
function renderExamIntro(){const host=$('diBookOverview');host.replaceChildren();host.append(mk('h3','🎓 Deida Mastery-Prüfung'));
 host.append(mk('p','24 zufällig zusammengestellte Aufgaben: 14 Kapiteltheorie, 8 kritische Beratungstransfers, 2 Wiederholungsfragen. Die richtige Antwort und ihre Begründung siehst du erst nach dem Abschluss. Das Ergebnis ist eine Wissensstandsanzeige, kein Berufsqualifikationsnachweis.'));
 if(exams.length){const last=exams[exams.length-1];host.append(mk('p',`Letzter Durchlauf: ${last.correct} / ${last.total} korrekt · ${Math.round(last.correct/last.total*100)} % · ${new Date(last.at).toLocaleDateString('de-AT')}`));}
 host.append(button('24 Fragen starten →',startExam));}
function startExam(){exam={items:planExam(),responses:[],index:0};$('diBookOverview').hidden=true;$('diBookExercise').hidden=false;renderQuestion(exam.items[0]);}
function finishExam(){const result=exam;exam=null;let correct=0;for(const res of result.responses){const item=bank.find(x=>x.id===res.id);if(!item)continue;if(res.correct)correct++;attempt(item,res.correct)}
 const entry={at:Date.now(),total:result.responses.length,correct,responses:result.responses.map(x=>({id:x.id,correct:x.correct,chapterNo:x.chapterNo}))};exams.push(entry);saveExam();
 $('diBookExercise').hidden=true;$('diBookOverview').hidden=false;const host=$('diBookOverview');host.replaceChildren();host.append(mk('h3',`🎓 Prüfung abgeschlossen · ${correct}/${entry.total} (${Math.round(100*correct/entry.total)} %)`));host.append(mk('p','Dies misst den aktuellen Abruf im Fragenformat. Bei Fehlern wird eine Wiederholungskarte für den 💪-Trainingsmuskel angelegt. Wiederhole nach einigen Tagen, um zu prüfen, was geblieben ist.'));
 const wrong=result.responses.filter(x=>!x.correct);host.append(mk('h3',wrong.length?'Diese Themen solltest du nacharbeiten':'Alle Fragen in diesem Durchlauf richtig'));
 if(wrong.length===0)host.append(mk('p','Sehr gut in diesem Durchlauf. Zur Festigung solltest du später andere Kapitel und Situationen erneut bearbeiten.'));
 for(const res of wrong){const item=bank.find(x=>x.id===res.id);if(!item)continue;const row=mk('div','','di-exam-item');row.append(mk('b',item.chapter));row.append(mk('p',item.question));row.append(mk('p','Fachlich passende Antwort: '+item.answers[0]));row.append(mk('p',item.explanation));host.append(row)}
 host.append(button('💪 Fehler festigen',()=>setMode('weak')));host.append(mk('span','  '));host.append(button('Neue Prüfung starten',startExam));
}
function onOpen(){profile=$('diProfile')?.value||'ich';load();setMode('practice');dlg.showModal()}
$('diBookToggle').addEventListener('click',onOpen);$('diBookClose').addEventListener('click',()=>dlg.close());$('diBookPracticeMode').addEventListener('click',()=>setMode('practice'));$('diBookWeakMode').addEventListener('click',()=>setMode('weak'));$('diBookCompassMode').addEventListener('click',()=>setMode('compass'));$('diBookExamMode').addEventListener('click',()=>setMode('exam'));$('diBookCheck').addEventListener('click',check);$('diBookNext').addEventListener('click',present);
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});$('diProfile').addEventListener('change',e=>{profile=e.target.value;load();if(dlg.open)setMode('practice')});
window.BDDeidaMastery81={questionCount:bank.length,chapterCount:CHAPTERS.length,getProgress:()=>progress(),getExamHistory:()=>[...exams]};
})();
