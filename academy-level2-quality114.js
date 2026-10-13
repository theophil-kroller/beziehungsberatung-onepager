/* Academy Level 2 · 15.12.114. Reusable, offline-only case/feedback presentation.
   Educational grading remains in the original trainer. No AI / API / client data. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function node(tag,klass,text){const e=document.createElement(tag);if(klass)e.className=klass;if(text!==undefined)e.textContent=String(text);return e}
function named(text,A,B){return String(text||'').replace(/\bA\b/g,A||'Person A').replace(/\bB\b/g,B||'Person B')}
function unique(choices){const output=[];const seen=new Set();for(const v of choices){if(!v||!v.text)continue;const k=v.text.trim().toLocaleLowerCase('de');if(!k||seen.has(k))continue;seen.add(k);output.push(v)}return output}
function options({scene,stage,topic,pivot,topics,raw=[],strictSafety=false}){
 if(!scene||!topic||!pivot||!Array.isArray(topics))return raw.map((text,i)=>({text,grade:3-i}));
 const idMap=new Map(topics.map(t=>[t.id,t]));const main=(stage>=4)?pivot:topic;
 const near=(main.near||[]).map(id=>idMap.get(id)).filter(Boolean);
 const initialNear=(topic.near||[]).map(id=>idMap.get(id)).filter(Boolean);
 const nearby=(stage>=4)?near:initialNear;
 const core=stage>=4?pivot.core:topic.core;
 const evidence=scene.evidence||scene.observation||topic.signal;
 const twist=scene.twist||'';
 const support=stage>=4?'Der neue Hinweis ist entscheidend: '+twist:'Beachte das konkret sichtbare Signal: '+evidence;
 const correct=String(raw[0]||'').trim();
 const base={text:correct,grade:3,why:`Diese Entscheidung greift das zentrale Kompetenzfeld „${main.name}“ auf. ${core} ${support}`,target:main.id};
 const out=[base];
 function candidate(text,grade,other,reason){if(!text||String(text).trim()===correct)return;out.push({text:String(text).trim(),grade,target:other?.id||main.id,why:reason})}
 function different(field,prefer,grade){const x=prefer.find(t=>t&&t[field]&&t[field]!==correct);if(!x)return;candidate(x[field],grade,x,`Der Fokus „${x.name}“ ist als Arbeitshypothese nachvollziehbar. In diesem Fall steht jedoch „${main.name}“ im Vordergrund. ${support} Entscheidend ist: ${core}`)}
 if(stage===0||stage===4){
  const candidates=nearby.filter(t=>t.id!==main.id);
  for(let i=0;i<3;i++){const t=candidates[i];if(t)candidate(t.name,Math.max(0,2-i),t,`„${t.name}“ liegt fachlich nahe und ist daher eine ernst zu nehmende Alternative. Die genauere Beobachtung spricht hier eher für „${main.name}“: ${support} ${core}`)}
 }else if(stage===1){
  for(let i=0;i<3;i++){const t=nearby[i];if(t)candidate(t.signal,Math.max(0,2-i),t,`Diese Beobachtung würde eher die Hypothese „${t.name}“ stützen. Für die vorliegende Szene ist vor allem dieses Detail entscheidend: ${evidence} ${core}`)}
 }else if(stage===2){
  // All are potentially appropriate clarification questions; distinguish their focus.
  different('ask',nearby,2);
  candidate('Was ist für Sie beide an diesem konkreten Moment besonders bedeutsam?',1,null,`Diese Frage kann die subjektive Bedeutung erkunden. Sie ist hier aber weiter gefasst als die für „${main.name}“ gezielte Abklärung. ${support}`);
  candidate('Was würden Sie sich für das nächste Gespräch miteinander wünschen?',0,null,`Die Zukunftsfrage ist grundsätzlich respektvoll und nützlich. Bevor ein Transfer geplant wird, sollte in dieser Szene die offene Frage zu „${main.name}“ geklärt werden. ${support}`);
 }else if(stage===3){
  different('best',nearby,2);
  candidate('Zunächst genauer nachfragen: '+topic.ask,1,topic,`Mehr Kontext einzuholen ist sinnvoll. Hier gibt es jedoch bereits den entscheidenden Anhaltspunkt für den spezifischen nächsten Schritt. ${support} ${core}`);
  candidate(topic.next,0,topic,`Ein konkreter Transfer kann später hilfreich sein. Als erste Intervention greift er zu weit vor, bevor der beobachtete Prozess bearbeitet wurde. ${support}`);
 }else if(stage===5){
  candidate(topic.caution,2,topic,`Diese Grenze ist weiterhin wichtig, bezieht sich aber auf die erste Hypothese. Nach der neuen Information muss zusätzlich der Risikohinweis aus „${pivot.name}“ berücksichtigt werden: ${twist}`);
  different('caution',nearby,1);
  candidate('Eine gemeinsame Übung nur dann anbieten, wenn beide ihr freiwillig zustimmen.',0,null,`Freiwilligkeit ist immer notwendig. Hier genügt sie allein nicht, weil die spezifische Grenze von „${pivot.name}“ vor der Übung geprüft werden muss. ${twist}`);
 }else if(stage===6){
  candidate(topic.next,2,topic,`Dieser Transfer würde zur ursprünglichen Einordnung passen. Durch den neuen Hinweis verschiebt sich jedoch die Priorität hin zu „${pivot.name}“. ${twist}`);
  different('next',nearby,1);
  candidate('Zunächst einen kleinen, freiwilligen Schritt für das nächste Paargespräch vereinbaren.',0,null,`Ein kleiner Schritt ist an sich sinnvoll. Er muss aber zur veränderten Situation und gegebenenfalls zur notwendigen Sicherheitsabklärung passen. ${twist}`);
 }
 // Fill only from semantically adjacent dimensions; never arbitrary unrelated topics.
 const field=["name","signal","ask","best","name","caution","next"][stage];
 for(let i=0;out.length<4&&i<nearby.length;i++){
  const t=nearby[i];candidate(t[field],Math.max(0,2-i),t,`Das ist eine nachvollziehbare, aber weniger zielgenaue Antwort aus dem Bereich „${t.name}“. ${support} Die passende Priorität ist „${main.name}“: ${core}`);
 }
 let final=unique(out);
 if(final.length<4){
  // Distinct legitimate *process* proposals are safer than unrelated theory terms.
  // They are intentionally less specific than the case's documented boundary / transfer.
  const extras=stage===5?[
   'Vor der nächsten Intervention zunächst genauer nach dem eigenen Erleben beider Personen fragen.',
   'Die ursprüngliche Deutung zusammenfassen und dann nach ihrer Bedeutung für die beiden fragen.',
   'Eine gemeinsame Vereinbarung erst besprechen, wenn der Rahmen dafür geklärt ist.'
  ]:stage===6?[
   'Vor einer neuen Vereinbarung erst überprüfen, was beide aus der bisherigen Situation mitgenommen haben.',
   'Die ursprünglich erwogene Übung noch einmal auf Freiwilligkeit und Passung überprüfen.',
   'Zunächst nachfragen, ob eine weitere Sitzung mit verändertem Schwerpunkt sinnvoll wäre.'
  ]:[];
  for(const text of [...raw.slice(1),...extras]){
   final=unique([...final,{text,grade:0,target:null,why:`Der Gedanke hat einen fachlichen Kern, bleibt hier aber zu allgemein beziehungsweise übergeht die veränderte Priorität. ${support} ${core}`}]);if(final.length>=4)break;
  }
 }
 if(strictSafety && stage>=3)final=final.map((o,i)=>i>0?{...o,grade:0,why:o.why+' Bei Sicherheitsfragen wird eine Alternative ohne entsprechende Abklärung nicht als ausreichend gewertet.'}:o);
 return final.slice(0,4);
}
function assessGrade({scene,stage,pick,highRisk}){
 if(!pick)return 0;
 if(pick.grade===3||!highRisk)return pick.grade;
 if(pick.grade<=0)return 0;
 const v=String(pick.text).toLowerCase();
 // Preserve *partial credit* for a safe adjacent professional response.
 // Risky joint exercises, confrontation or rushed homework stay unsuccessful.
 if(stage>=3 && /(?:gemeinsame übung|paarübung|intimitätsübung|sexuelle übung|gemeinsame konfrontation|im paarsetting um einen beweis|nächstes paargespräch vereinbaren)/i.test(v))return 0;
 return pick.grade;
}
function decorateScene({scene,stage,people,topic}){
 const host=$('bd114Conversation');if(!host||!scene)return;
 const A=people?.A?.name||'Person A', B=people?.B?.name||'Person B';
 const section=node('section','bd114-scene');section.setAttribute('aria-label','Fiktives Paargespräch und Beobachtungsnotizen');
 section.append(node('div','bd114-stage','SZENE 1 · BEOBACHTETES PAARGESPRÄCH'));
 const turns=scene.dialogue?.length?scene.dialogue:[{who:'A',text:scene.line},{who:'B',text:scene.reply}];
 const chat=node('div','bd114-chat');turns.forEach((v,i)=>{
  if(!v?.text||!['A','B','C'].includes(v.who))return;
  const who=v.who, whoName=who==='A'?A:who==='B'?B:'Beratende Person';
  let raw=String(v.text).trim().replace(/^\s*[AB]\s*:\s*/,'');
  // Descriptive actions are observations, NOT words spoken by a partner.
  const quote=raw.match(/[„“”"]([^„“”"]+)[“”"]/) ;
  const hasNarrator=/^(?:[AB] (?:sagt|antwortet|zeigt|schaut|tippt|nickt|dreht|fragt|wirkt|reagiert|sitzt|geht)\b|beim [^ ]+ (?:sagt|antwortet|erzählt)\b|(?:als|während) [AB]\b|später (?:sagt|erzählt|ergänzt) [AB]\b)/i.test(raw);
  if(hasNarrator && !quote){const action=node('div','bd114-action');action.append(node('b',null,'BEOBACHTETE HANDLUNG'),node('p',null,named(raw,A,B)));chat.append(action);return;}
  if(hasNarrator&&quote)raw=quote[1];
  const row=node('div','bd114-turn '+(who==='B'?'right':who==='C'?'counselor':'left'));
  row.append(node('span','bd114-avatar',whoName.slice(0,1)));
  const bubble=node('div','bd114-bubble');bubble.append(node('b',null,whoName),node('span',null,named(raw,A,B)));row.append(bubble);chat.append(row)
 });section.append(chat);
 const observed=scene.observation||scene.evidence||'';
 if(observed){const note=node('div','bd114-observation');note.append(node('b',null,'BEOBACHTUNG · keine gesprochene Aussage'),node('p',null,named(observed,A,B)));section.append(note)}
 if(stage>=4&&scene.twist){
  const reveal=node('section','bd114-later');reveal.append(node('div','bd114-stage','SZENE 2 · SPÄTERER HINWEIS IM GESPRÄCH'),node('p',null,named(scene.twist,A,B)));
  const action=node('p','bd114-stage-context','Du beurteilst die Situation mit der neuen Information erneut.');reveal.append(action);section.append(reveal);
 }
 if(stage<4){section.append(node('p','bd114-stage-context','Du entscheidest auf Basis dieser Beobachtung. Die späteren Informationen sind noch nicht bekannt.'))}
 host.replaceChildren(section);
 const original=document.querySelector('.ga-people');if(original)original.setAttribute('aria-hidden','true');
}
function annotate(stage){const task=document.querySelector('.ga-task');if(!task)return;let t=$('bd114TaskContext');if(!t){t=node('div','bd114-task-context');t.id='bd114TaskContext';task.insertBefore(t,task.firstChild)}t.textContent=stage>=4?'JETZT · EIN NEUER HINWEIS VERÄNDERT DEINE EINSCHÄTZUNG':'JETZT · DEINE BERATERISCHE ENTSCHEIDUNG';}
function knowledgeFeedback({question,selected,correct,why}){
 const base=why||'';if(selected===correct)return base;
 return `Deine Wahl: „${selected}“. Die Frage zielt auf: „${correct}“. ${base} Vergleiche den genauen Unterschied und prüfe, welches konkrete Fallmerkmal die Einordnung trägt.`;
}
window.BDLevel2Quality114={version:'15.12.114',options,assessGrade,decorateScene,annotate,knowledgeFeedback};
})();
