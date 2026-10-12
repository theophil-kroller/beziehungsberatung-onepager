/* Deida 15.12.80 - ergänzender Buchwissen-Drill, pro lokalem Lernprofil */
(()=>{'use strict';
const questions=window.BDDeidaKnowledge80;if(!Array.isArray(questions)||!questions.length)return;
const $=id=>document.getElementById(id),dlg=$('diBookPanel');if(!dlg)return;
let profile='ich',state={};let question=null,selected=-1,order=[],answered=false;
const k=()=>`bd-deida-book80-${profile}`;
function load(){try{state=JSON.parse(localStorage.getItem(k())||'{}')||{}}catch{state={}}}
function store(){try{localStorage.setItem(k(),JSON.stringify(state))}catch{}}
function shuffle(xs){const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function choose(){
 const min=Math.min(...questions.map(q=>(state[q.id]?.seen||0)));
 let pool=questions.filter(q=>(state[q.id]?.seen||0)===min);
 if(pool.length>1&&question)pool=pool.filter(q=>q.id!==question.id).length?pool.filter(q=>q.id!==question.id):pool;
 return pool[Math.floor(Math.random()*pool.length)];
}
function present(){
 question=choose();selected=-1;answered=false;order=shuffle([0,1,2,3]);
 $('diBookQuestion').textContent=question.question;
 $('diBookChapter').textContent='DAVID DEIDA · '+question.chapter;
 $('diBookProgress').textContent=`${Object.keys(state).filter(x=>state[x]?.seen).length} / ${questions.length} Fragen mindestens einmal beantwortet · Falsche Antworten ins 💪-Training`;
 const host=$('diBookOptions');host.replaceChildren();
 order.forEach((index,i)=>{const b=document.createElement('button');b.type='button';b.className='di-book-option';b.textContent=question.answers[index];b.setAttribute('aria-pressed','false');b.onclick=()=>{if(answered)return;selected=i;[...host.children].forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');$('diBookCheck').disabled=false};host.append(b)});
 $('diBookFeedback').hidden=true;$('diBookFeedback').replaceChildren();$('diBookCheck').hidden=false;$('diBookCheck').disabled=true;$('diBookNext').hidden=true;
}
function check(){if(answered||selected<0)return;answered=true;
 const correct=order[selected]===0;const rec=state[question.id]||{seen:0,correct:0};rec.seen++;if(correct)rec.correct++;rec.last=Date.now();state[question.id]=rec;store();
 const host=$('diBookOptions');[...host.children].forEach((b,i)=>{b.disabled=true;if(order[i]===0)b.dataset.result='correct'});
 const fb=$('diBookFeedback');const title=document.createElement('b');title.textContent=correct?'Richtig eingeordnet.':'Noch nicht. Zum Vergleichen:';
 const answer=document.createElement('p');answer.textContent=(correct?'':'Passendere Antwort: ')+question.answers[0];
 const note=document.createElement('p');note.textContent=question.explanation;fb.replaceChildren(title,answer,note);fb.hidden=false;
 if(!correct){try{window.BDMuscle78?.record({module:'deida',caseId:question.id,stage:0,question:question.question,options:order.map(i=>question.answers[i]),correct:[order.indexOf(0)],explanation:question.explanation,context:'Deida-Buchwissen · '+question.chapter});}catch{}}
 $('diBookCheck').hidden=true;$('diBookNext').hidden=false;$('diBookNext').focus({preventScroll:true});
}
function close(){dlg.close()}
$('diBookToggle').addEventListener('click',()=>{profile=$('diProfile')?.value||'ich';load();present();dlg.showModal()});
$('diBookClose').addEventListener('click',close);$('diBookCheck').addEventListener('click',check);$('diBookNext').addEventListener('click',present);
dlg.addEventListener('click',e=>{if(e.target===dlg)close()});
})();
