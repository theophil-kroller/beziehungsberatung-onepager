/* Beziehungsdynamiken Academy | Level 1 · 15.12.116.
   Private educational training with fictional vignettes; not clinical diagnosis.
   All answers and feedback are deterministic; no AI, no network. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const mk=(name,cls,value)=>{const x=document.createElement(name);if(cls)x.className=cls;if(value!==undefined)x.textContent=String(value);return x};
const text=x=>String(x||'').trim();
const safe=(scene,topic)=>/safety|violence|coerc|gefährd|gewalt|angst|suizid|akut|brustschmerz|notfall|zwang|kontrollverhalten/i.test([scene?.domain,scene?.pivot,scene?.line,scene?.reply,scene?.twist,topic?.name].join(' '));
const R={
 house:[
  ['„Wenn du das so sagst, merke ich, dass wir über etwas anderes sprechen als über den heutigen Abend.“','„Ich höre, dass du es anders erlebt hast. Ich will verstehen, was dir daran wichtig ist.“'],
  ['„Wir haben darüber schon öfter gesprochen, aber irgendwie kommt bei dir etwas anderes an.“','„Dann lass uns an einem konkreten Moment schauen, wo wir uns verlieren.“'],
  ['„Ich möchte nicht, dass wir sofort entscheiden, wer recht hat.“','„Mir hilft es, wenn ich erst sagen darf, was ich wahrgenommen habe.“'],
  ['„Wenn wir von dem gleichen Ereignis erzählen, klingt es wie zwei verschiedene Geschichten.“','„Vielleicht fehlen uns Informationen darüber, was beim anderen los war.“'],
  ['„Das klingt klein, aber es beschäftigt mich schon länger.“','„Ich habe die Wirkung nicht so eingeschätzt; ich würde sie gern besser verstehen.“']
 ],
 assessment:[
  ['„Mir ist noch nicht klar, was wir in diesem Termin überhaupt klären können.“','„Ich möchte, dass meine Perspektive dabei nicht untergeht.“'],
  ['„Für mich steht etwas anderes auf dem Spiel, als ich zuerst gesagt habe.“','„Ich möchte wissen, ob wir überhaupt dieselbe Frage besprechen.“'],
  ['„Ich bin unsicher, wie offen ich hier sprechen kann.“','„Mir ist wichtig, dass wir die Regeln des Gesprächs vorher verstehen.“'],
  ['„Bevor wir einen Rat bekommen, möchte ich sagen können, weshalb ich gekommen bin.“','„Und ich möchte auch sagen dürfen, was ich heute nicht entscheiden will.“'],
  ['„Wir beschreiben das Problem unterschiedlich, obwohl es um dieselbe Beziehung geht.“','„Vielleicht sollten wir zuerst sammeln, was jeder verändern möchte.“']
 ],
 history:[
  ['„An diesen Moment denke ich heute anders zurück als damals.“','„Ich erinnere mich an andere Einzelheiten, obwohl ich die Zeit ähnlich erlebt habe.“'],
  ['„Ich weiß, dass das nicht die ganze Geschichte ist.“','„Für mich gehört dazu, was kurz davor passiert ist.“'],
  ['„Wenn ich von früher erzähle, fällt mir auf, was sich verändert hat.“','„Ich denke manchmal eher daran, was uns trotzdem verbunden hat.“'],
  ['„Das war für mich ein wichtiger Punkt in unserer Geschichte.“','„Für mich war damals ein anderer Teil entscheidend.“'],
  ['„Ich finde es schwierig, diese Zeit in einem einzigen Satz zusammenzufassen.“','„Vielleicht dürfen hier zwei Erinnerungen nebeneinander stehen.“']
 ],
 plan:[
  ['„Ich möchte nicht, dass eine einzelne Beobachtung über unsere ganze Beziehung entscheidet.“','„Wir sollten auch besprechen, was hinter dieser Situation steckt.“'],
  ['„Mir erscheint das, was ich gesagt habe, unvollständig.“','„Ich habe in unterschiedlichen Gesprächen Unterschiedliches betont.“'],
  ['„Ich kann mit einem Ziel arbeiten, wenn wir beide wissen, worauf es sich bezieht.“','„Mir fehlt noch, ob wir dasselbe darunter verstehen.“'],
  ['„Ich wünsche mir, dass nicht über uns hinweg entschieden wird.“','„Und dass wir unterscheiden, was wir wissen und was wir nur vermuten.“'],
  ['„Ich will verstehen, wie die einzelnen Beobachtungen zusammenhängen.“','„Ich möchte dabei auch widersprechen dürfen.“']
 ],
 conflict:[
  ['„Wenn wir darüber reden, sind wir sofort wieder mitten im Streit.“','„Ich würde gern merken, an welchem Punkt das passiert.“'],
  ['„Ich höre, dass du eine Lösung willst. Für mich steht etwas anderes dahinter.“','„Ich will erst verstehen, was für dich so wichtig daran ist.“'],
  ['„Ich möchte über den Streit sprechen, ohne dass wir wieder gegeneinander argumentieren.“','„Dann müssen wir vielleicht langsamer werden als sonst.“'],
  ['„Bei dem Thema kann ich kaum noch ruhig zuhören.“','„Ich merke das auch und möchte wissen, wann eine Pause sinnvoll wäre.“'],
  ['„Ich glaube, wir machen aus einem konkreten Problem gleich die ganze Beziehung.“','„Ja, und danach wissen wir nicht mehr, womit wir anfangen sollen.“']
 ],
 conflict2:[
  ['„Ich will nicht, dass das Gespräch wieder festfährt.“','„Dann sollten wir verstehen, weshalb dieses Thema für uns so viel bedeutet.“'],
  ['„Ich fühle mich bei dem Thema schnell missverstanden.“','„Ich habe aber auch Angst, mich dann gar nicht mehr äußern zu können.“'],
  ['„Wir bleiben immer bei denselben Argumenten hängen.“','„Dabei habe ich noch nie richtig erklärt, wofür meine Position steht.“'],
  ['„Ich kann dir zuhören, wenn ich mich dabei nicht sofort verteidigen muss.“','„Ich kann versuchen, zuerst zu verstehen statt zu antworten.“'],
  ['„Ich frage mich, ob wir gerade ein Problem lösen oder um Anerkennung kämpfen.“','„Für mich fühlt es sich jedenfalls größer an als der eigentliche Anlass.“']
 ],
 friendship:[
  ['„Ich würde gern wieder öfter erfahren, was dich gerade beschäftigt.“','„Ich auch, aber bitte ohne dass wir daraus eine Pflicht machen.“'],
  ['„Das war ein kleiner Moment, trotzdem ist er mir im Gedächtnis geblieben.“','„Mir ist erst jetzt bewusst, wie das bei dir angekommen ist.“'],
  ['„Ich vermisse, dass wir uns manchmal einfach füreinander interessieren.“','„Ich wünsche mir, dass wir dafür auch im Alltag Platz finden.“'],
  ['„Ich weiß nicht, ob du gemerkt hast, dass ich dir etwas zeigen wollte.“','„Vielleicht nicht. Ich möchte die kleinen Signale besser verstehen.“'],
  ['„Es fällt mir leichter, wenn du eine konkrete Situation meinst.“','„Dann können wir gemeinsam schauen, was darin gelungen ist.“']
 ],
 mastery:[
  ['„Ich merke, wie schnell wir zu einer Lösung kommen wollen.“','„Und dabei vielleicht überspringen, was wir eigentlich brauchen.“'],
  ['„Ich habe den Eindruck, wir reden über zwei unterschiedliche Dinge.“','„Ich möchte erst verstehen, wo sich die Themen berühren.“'],
  ['„Für mich ist entscheidend, dass wir beide einbezogen werden.“','„Ja, und dass unsere Grenzen in dem Gespräch gelten.“'],
  ['„Ich kann erst mit einem Vorschlag etwas anfangen, wenn die Situation richtig verstanden ist.“','„Dann lass uns die Beobachtung vom Schluss trennen.“'],
  ['„Ich möchte über einen nächsten Schritt nachdenken, aber nicht vorschnell.“','„Vielleicht muss erst klar sein, was heute überhaupt möglich ist.“']
 ]
};
const TOPIC_DIALOGUES={
 conflicts:[
  ['„Ich merke, dass ich lauter werde, sobald ich mich unterbrochen fühle.“','„Und ich rede dann noch schneller, weil ich Angst habe, nicht gehört zu werden.“'],
  ['„Ich überlege beim Zuhören schon, was ich erwidern werde.“','„Das merke ich. Ich habe dann das Gefühl, mit meinem Punkt nicht anzukommen.“'],
  ['„Wenn das Thema wieder auftaucht, ist die Anspannung sofort da.“','„Ich merke, dass ich dann eher auf deinen Ton reagiere als auf den Inhalt.“'],
  ['„Ich möchte das klären, aber wir kommen schnell wieder an denselben Punkt.“','„Vielleicht könnten wir zuerst verstehen, was in dem Moment mit uns passiert.“'],
  ['„Wenn ich mich kritisiert fühle, verteidige ich mich fast automatisch.“','„Dann werde ich drängender, weil ich das Gefühl bekomme, du hörst gar nicht zu.“']
 ],
 bonds:[
  ['„Ich habe den Eindruck, wir wissen gerade wenig davon, was den anderen beschäftigt.“','„Ich dachte oft, du willst deine Sorgen lieber für dich behalten.“'],
  ['„Ich hätte gern, dass wir wieder auf die kleinen Dinge achten.“','„Manche Versuche, Kontakt aufzunehmen, erkenne ich erst viel später.“'],
  ['„Ich frage mich, wann wir aufgehört haben, neugierig aufeinander zu sein.“','„Ich glaube, im Alltag übersehen wir inzwischen viel.“'],
  ['„Das hat sich für mich nach wenig Interesse angefühlt.“','„Ich war mit etwas anderem beschäftigt, habe aber nicht gemerkt, wie es bei dir ankam.“'],
  ['„Ich möchte dir mehr von meiner Woche erzählen können.“','„Ich würde gern verstehen, wann dir das gut passt.“']
 ],
 meaning:[
  ['„Für mich geht es bei diesem Thema um etwas, das mir wirklich wichtig ist.“','„Ich habe lange gedacht, wir reden nur über eine praktische Entscheidung.“'],
  ['„Ich möchte, dass du verstehst, wofür mein Wunsch steht.“','„Vielleicht habe ich bisher nur gehört, was du von mir erwartest.“'],
  ['„Es berührt etwas Grundsätzliches für mich.“','„Ich glaube, das habe ich unterschätzt, weil wir über Details gestritten haben.“'],
  ['„Wenn du meinen Wunsch ablehnst, fühlt es sich an, als wäre ich dir weniger wichtig.“','„So war es nicht gemeint. Ich habe versucht, meine eigene Grenze zu erklären.“']
 ],
 process:[
  ['„Ich habe meinen Teil erzählt, aber wir scheinen daraus ganz unterschiedliche Schlüsse zu ziehen.“','„Ich wäre froh, wenn wir Beobachtung und Vermutung auseinanderhalten.“'],
  ['„Ich möchte, dass mein Anliegen hier genauso Platz hat.“','„Mir wäre wichtig, zuerst zu klären, wozu wir beide bereit sind.“'],
  ['„Ich kann über einen nächsten Schritt nachdenken, aber nicht über eine fertige Entscheidung.“','„Dann sollten wir zuerst prüfen, was wir eigentlich vereinbaren können.“'],
  ['„Ich weiß nicht, welche Informationen für diese Entscheidung entscheidend sind.“','„Vielleicht müssen wir unsere Erwartungen erst einzeln benennen.“']
 ]
};
function choiceDialogue(scene,module,topic){
 const label=[scene?.domain,scene?.topic,topic?.group,topic?.name,scene?.key].join(' ').toLowerCase();
 const quote=[scene?.line,scene?.reply].join(' ').toLowerCase();
 let family='';
 if(/streit|konflikt|conflict|horsemen|flood|critici|defensiv|stonewall|gridlock|perpetual|influence|escalat|rückzug|abwertung/.test(label))family='conflicts';
 else if(/freund|friend|love map|lovemap|fondness|admiration|turning|bids|vertrauen|trust|commit|kontakt|connection|sentiment|emotion/.test(label))family='bonds';
 else if(/shared meaning|sinn|traum|dream|werte|ritual|bedeutung/.test(label))family='meaning';
 else if(/assessment|auftrag|oral history|interview|anamnese|sicher|befund|plan|diagnos|feedback/.test(label))family='process';
 if(family==='conflicts'&&/laut|schrei|tonfall|gleichzeitig/.test(quote))return TOPIC_DIALOGUES.conflicts[0];
 if(family==='conflicts'&&/verteidig|rechtfertig|gegenargument|einwand/.test(quote))return TOPIC_DIALOGUES.conflicts[1];
 if(family==='bonds'&&/nicht (mehr )?wissen|kennst|interess|beschäftig/.test(quote))return TOPIC_DIALOGUES.bonds[0];
 const source=TOPIC_DIALOGUES[family]||R[module]||R.mastery;
 return source[seed(scene.id)%source.length];
}
const FOLLOWUP={
 conflicts:['„In dem Moment höre ich die eigentliche Aussage fast gar nicht mehr.“','„Ich versuche dann noch stärker zu erklären, was ich gemeint habe.“'],
 bonds:['„Vielleicht nehmen wir schneller etwas an, als wirklich nachzufragen.“','„Ich würde gern ausprobieren, ob wir das ohne Vorwurf klären können.“'],
 meaning:['„Wenn wir nur über die Entscheidung sprechen, bleibt für mich etwas Wichtiges ungesagt.“','„Ich glaube, ich habe die Bedeutung deiner Position noch nicht verstanden.“'],
 process:['„Ich möchte nicht, dass diese eine Aussage gleich als fertige Entscheidung gilt.“','„Dann sollten wir erst trennen, was wir wissen und was noch offen ist.“'],
 history:['„Ich erinnere mich an einen anderen Ausschnitt derselben Situation.“','„Vielleicht sollten wir beide erzählen, was uns daran damals wichtig war.“'],
 plan:['„Ich möchte eine konkrete Veränderung versuchen, aber erst wenn wir uns über das Ziel einig sind.“','„Dann lass uns prüfen, ob wir dieselbe Vorstellung davon haben.“'],
 friendship:['„Ich glaube, solche kleinen Momente sind uns in letzter Zeit oft entgangen.“','„Ich würde gern wieder aufmerksamer sein, ohne dass es zur Pflicht wird.“'],
 mastery:['„Bevor wir uns auf eine Lösung festlegen, möchte ich noch einmal nachfragen.“','„Ja. Ich möchte mitentscheiden, welcher nächste Schritt für uns passt.“']
};
function nextExchange(scene,module,topic){
 const label=[scene?.domain,topic?.name,topic?.group,scene?.key].join(' ').toLowerCase();
 if(/streit|konflikt|conflict|horsemen|flood|critic|defensiv|stonewall|gridlock|perpetual/.test(label))return FOLLOWUP.conflicts;
 if(/friend|lovemap|love map|fondness|turning|bids|vertrauen|trust|commit|kontakt/.test(label))return FOLLOWUP.bonds;
 if(/sinn|dream|shared meaning|bedeutung|wert|ritual/.test(label))return FOLLOWUP.meaning;
 if(module==='history')return FOLLOWUP.history;
 return FOLLOWUP[module]||FOLLOWUP.process;
}
function seed(s){let v=0;for(const c of String(s||''))v=(v*33+c.charCodeAt(0))>>>0;return v}
function meaningfulAlternatives(stage,scene,raw,topic,topics){
 const main=topic||{};const signal=text(main.signal||scene.key||scene.line);const core=text(main.core||scene.key||'');
 const correct=text(raw[0]);const question=stage===4?'Die zusätzliche Information lautet: '+text(scene.twist):'In der Szene sagt eine Person: „'+text(scene.line).slice(0,110)+'“';
 const values=[{text:correct,grade:3,target:main.name||scene.topic,why:`Hier ist „${main.name||scene.topic}“ vorrangig: ${core}. ${question} Deshalb passt dieser Schritt zu der konkret beobachteten Situation.`}];
 if(stage===4){
  values.push({text:'Die erste Einschätzung vorläufig stehen lassen, die neue Information jedoch ausdrücklich als offene Frage aufnehmen.',grade:2,why:`Das ist ein vorsichtiger und zunächst vertretbarer Zwischenschritt. Der Hinweis „${text(scene.twist)}“ kann die bisherige Hypothese aber unmittelbar verändern; das sollte jetzt aktiv geprüft werden.`});
  values.push({text:'Mit beiden Beteiligten die neue Information erkunden und erst danach entscheiden, welche Hypothese Vorrang hat.',grade:1,why:`Offene Erkundung ist sinnvoll. Hier fehlt allerdings die explizite Rückprüfung der bisherigen Einschätzung anhand des neuen Hinweises: ${text(scene.twist)}.`});
  values.push({text:'Zuerst den bisherigen Verlauf zusammenfassen und die zusätzliche Information für den weiteren Gesprächsverlauf vormerken.',grade:0,why:`Eine Zusammenfassung kann Orientierung schaffen. In dieser Situation würde sie den neuen relevanten Hinweis zu sehr vertagen: ${text(scene.twist)}.`});
  return values;
 }
 const ids=new Set(); const field=['name','signal','ask','best','name','caution','next'][stage];
 for(const t of topics||[]){if(t===main||!t?.[field])continue;ids.add(text(t[field]));}
 for(const candidate of raw.slice(1)){
  if(!text(candidate)||text(candidate)===correct||values.some(v=>v.text===text(candidate)))continue;
  const near=(topics||[]).find(x=>text(x[field])===text(candidate));
  const grade=values.length===1?2:values.length===2?1:0;
  values.push({text:text(candidate),grade,target:near?.name||'',why:`Diese Alternative kann unter anderen Umständen sinnvoll sein${near?' (Perspektive „'+near.name+'“)':''}. Hier spricht die konkrete Beobachtung jedoch stärker für „${main.name||scene.topic}“: ${signal}. ${core} Deshalb ist die gewählte Antwort weniger präzise.`});
  if(values.length===4)break;
 }
 const fallback={
  0:['Zunächst nur den Interaktionsablauf beschreiben, ohne eine Modellkomponente festzulegen.','Die Einordnung offenhalten und zuerst beide Perspektiven gleichwertig sammeln.','Nachfragen, ob dies ein einmaliger oder wiederkehrender Moment war.'],
  1:['Zunächst die subjektive Bedeutung dieses Moments erfragen.','Das Ereignis noch einmal verlangsamt rekonstruieren.','Beide Beschreibungen nebeneinander stehen lassen, bevor ein Muster benannt wird.'],
  2:['„Was ist Ihnen in diesem Gespräch zuerst aufgefallen?“','„Was würde Ihnen helfen, diesen Moment besser zu verstehen?“','„Was ist daran für jede Person besonders schwierig?“'],
  3:['Die beiden Perspektiven zunächst in eigenen Worten spiegeln.','Den beschriebenen Gesprächsablauf für einige Minuten verlangsamen.','Eine freiwillige kurze Unterbrechung anbieten, bevor weiter gesprochen wird.'],
  5:['Vor einer Intervention Freiwilligkeit und Grenzen ausdrücklich erfragen.','Die Annahmen über die Situation noch einmal mit beiden abgleichen.','Die eigene Zuständigkeit und mögliche weitere Hilfen prüfen.'],
  6:['Einen kleinen, freiwilligen nächsten Schritt vereinbaren und dessen Wirkung später überprüfen.','Zunächst sammeln, welche Teile des Gesprächs beide als hilfreich erlebten.','Die vereinbarte Richtung mit beiden einzeln auf Stimmigkeit prüfen.']
 };
 for(const candidate of fallback[stage]||[]){
  if(values.length>=4)break;
  if(values.some(v=>v.text===candidate||candidate===correct))continue;
  values.push({text:candidate,grade:Math.max(0,3-values.length),why:`Auch dieser Prozessschritt kann fachlich sinnvoll sein. In genau diesem Fall ist er allerdings allgemeiner als die auf „${main.name||scene.topic}“ gerichtete Antwort. Entscheidend bleibt die Beobachtung: ${signal}.`});
 }
 // No unsupported fake alternatives; never modify the correct original or add patient data.
 return values.slice(0,4)
}
function options({scene,stage,topic,topics,raw}){if(!scene||!Array.isArray(raw)||!raw.length)return [];
 const vals=meaningfulAlternatives(stage,scene,raw,topic,topics);
 if(vals.length!==4)throw Error('Level 1: unvollständige Antwortalternativen');
 return vals;
}
function decorateScene({scene,stage,people,module='mastery',topic}){
 const host=$('bd116Conversation');if(!host||!scene)return;
 const A=people?.A?.name||'Person A',B=people?.B?.name||'Person B';
 const frame=mk('section','bd116-scene');frame.setAttribute('aria-label','Fiktive Fallsequenz mit klar getrennten Gesprächsphasen');
 frame.append(mk('div','bd116-label','SZENE 1 · BEOBACHTETES PAARGESPRÄCH'));
 const dialogue=mk('div','bd116-chat');
 function turn(name,raw,right){if(!text(raw))return;const block=mk('div','bd116-turn'+(right?' right':''));block.append(mk('span','bd116-avatar',name.slice(0,1)));const bubble=mk('div','bd116-bubble');bubble.append(mk('strong',null,name),mk('span',null,raw));block.append(bubble);dialogue.append(block)}
 function action(raw){const note=mk('div','bd116-action');note.append(mk('b',null,'BEOBACHTETE HANDLUNG'),mk('p',null,raw));dialogue.append(note)}
 const actor=(raw)=>/^(?:[AB] (?:sagt|zeigt|schaut|tippt|nickt|dreht|fragt|wirkt|reagiert|sitzt|geht|senkt|zieht)\b|während\s+[AB]\b|als\s+[AB]\b)/i.test(text(raw));
 for(const [v,name,right] of [[scene.line,A,false],[scene.reply,B,true]]){if(actor(v)&&!/[„“]/.test(v))action(String(v).replace(/\bA\b/g,A).replace(/\bB\b/g,B));else turn(name,v,right)}
 if(!safe(scene,topic)){
  const scripts=choiceDialogue(scene,module,topic);
  const tag=mk('div','bd116-scriptmark','ERGÄNZTER FIKTIVER TRAININGSDIALOG');dialogue.append(tag);
  turn(A,scripts[0],false);turn(B,scripts[1],true);const more=nextExchange(scene,module,topic);turn(A,more[0],false);turn(B,more[1],true);
 }else{
  const safety=mk('div','bd116-risk','SICHERHEITSRELEVANTER HINWEIS · Eine zusätzliche Paardialog-Simulation wird hier bewusst nicht erfunden. Zuerst Vertraulichkeit, Freiwilligkeit und Gefährdung klären.');dialogue.append(safety);
 }
 frame.append(dialogue);
 const note=mk('div','bd116-observation');note.append(mk('strong',null,'BEOBACHTUNGSFOKUS'),mk('p',null,text(topic?.signal||scene.key||'Beschreibe, was du tatsächlich wahrnimmst.')));frame.append(note);
 if(stage>=4){const later=mk('section','bd116-later');later.append(mk('div','bd116-label','SZENE 2 · NEUE INFORMATION IM WEITEREN VERLAUF'),mk('p',null,text(scene.twist)),mk('small',null,'Du prüfst deine bisherige Einschätzung mit dem neuen Hinweis.'));frame.append(later)}
 else frame.append(mk('p','bd116-timeline','Du siehst bisher nur die erste Gesprächsphase. Die spätere Information bleibt zunächst verborgen.'));
 host.replaceChildren(frame);
}
function annotate(stage){const task=document.querySelector('.ga-task');if(!task)return;let h=$('bd116TaskContext');if(!h){h=mk('div','bd116-task-context');h.id='bd116TaskContext';task.prepend(h)}h.textContent=stage>=4?'JETZT · DU PRÜFST DEN NEUEN HINWEIS':'JETZT · DEINE BERATERISCHE ENTSCHEIDUNG';}
function knowledgeFeedback({selected,correct,why}){return selected===correct?text(why):`Du hast „${text(selected)}“ gewählt. Treffender ist „${text(correct)}“. ${text(why)} Achte darauf, welche Beobachtung die Unterscheidung stützt.`;}
window.BDLevel1Quality116={version:'15.12.116',options,decorateScene,annotate,knowledgeFeedback};
})();
