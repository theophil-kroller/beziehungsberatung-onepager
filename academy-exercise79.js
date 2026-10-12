/* Academy Exercise Engine 15.12.79 – adaptive four-option bank, local selection, no AI evaluation. */
(()=>{'use strict';
const DOMAIN={
 naehe:{open:['Wie erleben Sie Vertrautheit und Lust jeweils für sich?','Wann fühlt sich Berührung willkommen an, ohne weitere Erwartungen?','Welche Momente der Eigenständigkeit sind Ihnen in Ihrer Beziehung wichtig?','Was würde Entlastung ermöglichen, bevor Sie gemeinsam über Begehren sprechen?'],close:['Wäre mehr Abwechslung nicht schon die Lösung?','Braucht eine stabile Beziehung nicht automatisch mehr Erotik?']},
 sehnsucht:{open:['Wie erleben Sie eine Einladung, wenn sie ohne Erwartung bleibt?','Welche unerfüllte Sehnsucht liegt möglicherweise unter dem Vorwurf?','Können Sie beide beschreiben, woran Sie Zuwendung erkennen?','Was war beim letzten Versuch, einander zu erreichen, unterschiedlich?'],close:['Sollten Sie sich nicht einfach gegenseitig mehr Initiative versprechen?','Ist die leisere Person nicht offensichtlich weniger interessiert?']},
 rueckzug:{open:['Was passiert unmittelbar vor dem Moment des Rückzugs?','Was würde ein Gespräch ermöglichen, in dem kein Ergebnis erwartet wird?','Wie könnten Sie ein Nein hören, ohne daraus eine Aussage über die Liebe zu machen?','Welche Signale würden Ihnen helfen, ohne Leistungsdruck im Kontakt zu bleiben?'],close:['Sollte die zurückgezogene Person sich nicht einfach mehr überwinden?','Wenn Sie wieder öfter darüber reden, wird sich die Angst doch verlieren?']},
 sicherheit:{open:['Welche Grenzen sollten wir klären, bevor wir über neue Nähe sprechen?','Was genau bedeutet Verlässlichkeit für jede Person in dieser Situation?','Wo erleben Sie im Alltag Freiwilligkeit und genügend Zeit?','Was ließe sich an den Rahmenbedingungen ändern, ohne Ihre Wünsche zu übergehen?'],close:['Wäre es nicht Zeit, die Kontrolle bewusst aufzugeben?','Könnte man fehlende Spontaneität nicht einfach wegtrainieren?']},
 rollen:{open:['Wann wird Initiative zu einer Einladung und wann zu einer Verpflichtung?','Wie könnte jede Person auf ihre Weise einen Wunsch äußern?','Welche Form von Führung ist für beide ausdrücklich erwünscht?','Wo wird eine vertraute Rolle derzeit enger, als sie sein müsste?'],close:['Würde eine feste Rollenverteilung nicht alle Missverständnisse lösen?','Wer übernimmt denn nun die männliche Rolle?']},
 scham:{open:['Was wäre ein sicheres Tempo, um etwas Persönliches auszusprechen?','Wie könnten wir mit möglicher Beschämung im Gespräch umgehen?','Welche Reaktion Ihres Gegenübers wäre im Moment entlastend?','Ist es in Ordnung, dass Sie dazu heute noch nichts Konkretes sagen?'],close:['Würde Offenheit nicht automatisch alle Unsicherheit beseitigen?','Könnten Sie sich nicht einfach ein bisschen mutiger zeigen?']},
 konflikt:{open:['Welche Form von Direktheit wäre lebendig, ohne verletzend zu werden?','Wann spüren Sie nach einem Konflikt Verbindung und wann eher Angst?','Wie könnten Sie Spannung erleben, ohne auf Eskalation angewiesen zu sein?','Müssen wir zuerst untersuchen, wie sicher sich beide im Streit fühlen?'],close:['Wäre ein bisschen mehr Streit nicht förderlich für die Erotik?','Sollte eine Person nicht stärker konfrontieren, um Spannung herzustellen?']},
 ambivalenz:{open:['Welche beiden Wünsche sollen hier gleichzeitig Platz haben?','Woran merken Sie, dass eine Einladung offen und freiwillig bleibt?','Wie könnten Nähe und eigenständiger Freiraum zusammenpassen?','Welche Ihrer Grenzen möchten Sie nicht verhandeln?'],close:['Müsste die Person sich nicht endlich entscheiden, was sie will?','Würde eine eindeutige Beziehungsrolle die Ambivalenz nicht beseitigen?']}
};
const SAFE_EXPLANATION='Eine Alternative kann in dieser Szene vertretbar sein, prüft jedoch einen anderen Ausschnitt. Achte darauf, ob sie die konkrete Frage beantwortet und das Timing wahrt.';
const EARLY_EXPLANATION='Dieser Vorschlag ist nicht zwingend falsch, verengt aber die Exploration oder überspringt einen relevanten Zwischenschritt.';
const RISK_EXPLANATION='Die Schlussfolgerung ist nicht aus dem Gespräch belegt und kann Druck, Rollenstereotype oder eine vorschnelle Festlegung verstärken.';
const labelScore=s=>s>=3?'Besonders passend':s===2?'Vertretbar, mit Vorbehalt':s===1?'Teilweise hilfreich':'Zu früh oder nicht passend';
function unique(arr){const seen=new Set();return arr.filter(o=>{const k=String(o.text||'').trim().toLocaleLowerCase('de');if(!k||seen.has(k))return false;seen.add(k);return true})}
function rand(max){return Math.floor(Math.random()*max)}
function randomize(xs){const a=[...xs];for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function choose(xs,need,exclude){return randomize(xs.filter(x=>!exclude.has(x.text))).slice(0,need)}
// Exactly four options; strongest option is always present. Beginner / expert distributions differ.
function select(pool,level,token=''){const sorted=unique(pool).filter(x=>Number.isFinite(x.score)&&x.score>=0&&x.score<=3);const best=sorted.filter(x=>x.score===3),plausible=sorted.filter(x=>x.score===2),mid=sorted.filter(x=>x.score===1),bad=sorted.filter(x=>x.score===0);
if(!best.length)throw Error('Exercise79: no best answer for '+token);const sel=[best[rand(best.length)]],excluded=new Set(sel.map(x=>x.text));
const ranges=level<=5?[[[0,2],[1,1]],[[0,1],[1,2]]]:level<=10?[[[2,1],[0,1],[1,1]],[[2,1],[1,2]]]:level<=15?[[[2,2],[1,1]],[[2,1],[1,2]]]:[[[2,2],[1,1]],[[2,3]]];
const tags=ranges[rand(ranges.length)];for(const [grade,count] of tags){const group=grade===2?plausible:grade===1?mid:bad;for(const x of choose(group,count,excluded)){sel.push(x);excluded.add(x.text)}}
for(const x of choose(sorted.filter(x=>x.score<3),4-sel.length,excluded)){sel.push(x);excluded.add(x.text)}
if(sel.length!==4||new Set(sel.map(x=>x.text)).size!==4)throw Error('Exercise79: insufficient distinct options '+token);
return {options:randomize(sel),poolSize:sorted.length,level,caseId:token};}
function deida(c,t,level,mode,part){if(t.kindId!=='choice')return t;const theme=DOMAIN[c.category]||DOMAIN.naehe,kind=t.kind;
const inverse=kind==='Vorschnelle Deutung';if(inverse)return t;const base=t.options.map((o,i)=>({text:o.text,score:o.good?3:i===1?1:0,reason:o.good?t.explainer:i===1?EARLY_EXPLANATION:RISK_EXPLANATION}));
let more=[];
if(inverse){more=[
 {text:'Das Muster lässt sich nur mit einer festen maskulin-femininen Rollenverteilung erklären.',score:2,reason:'Auch dies ist eine problematische Verengung; der Ausgangssatz ist hier die noch direktere Festlegung.'},
 {text:'Ein Rückzug zeigt doch immer, dass jemand keine Liebe mehr empfindet.',score:2,reason:'Diese Aussage ist ebenfalls unzulässig pauschal. Sie ist kein Beleg für die eigentliche Szene.'},
 {text:'Vielleicht wäre für beide hilfreich, zuerst zu beschreiben, was konkret geschieht.',score:0,reason:'Das ist eine vorsichtige Einladung, keine Festlegung.'},
 ...theme.open.map(text=>({text,score:0,reason:'Dies ist eine offene Frage und keine voreilige Diagnose.'})),
 ...theme.close.map(text=>({text,score:1,reason:'Lenkt bereits in eine Richtung; weniger absolut als die zugespitzte Ausgangsaussage.'})),
 {text:'Das würde ich zunächst als Hypothese im Raum stehen lassen, ohne jemanden festzulegen.',score:0,reason:'Eine Hypothese bleibt überprüfbar.'},
 {text:'Es gibt wahrscheinlich mehrere mögliche Erklärungen; welche Erfahrungen machen Sie?',score:0,reason:'Das ist eine offene Klärung.'}];
}else if(['Wahrnehmen','Zwei Perspektiven','Hypothesen','Kontext prüfen'].includes(kind)){
more=[{text:c.alternative,score:kind==='Hypothesen'||kind==='Kontext prüfen'?2:1,reason:SAFE_EXPLANATION},
 {text:c.hypothesis,score:kind==='Hypothesen'?2:1,reason:SAFE_EXPLANATION},
 {text:c.cue,score:kind==='Wahrnehmen'||kind==='Zwei Perspektiven'?2:1,reason:SAFE_EXPLANATION},
 {text:'Die Aussagen zeigen unterschiedliche Wahrnehmungen; über ihre Ursache wissen wir noch zu wenig.',score:2,reason:SAFE_EXPLANATION},
 {text:'Eine Person äußert einen Wunsch; die andere reagiert mit einer eigenen Bedeutung oder Sorge.',score:2,reason:SAFE_EXPLANATION},
 {text:'Ein möglicher Kontextfaktor sollte erfragt werden, bevor wir eine Beziehungserklärung festlegen.',score:2,reason:SAFE_EXPLANATION},
 {text:'Das Muster beweist, dass die beiden sich sexuell nicht mehr begehren.',score:0,reason:RISK_EXPLANATION},
 {text:'Der Konflikt ist sicherlich eine Folge von fehlender Polarität.',score:0,reason:RISK_EXPLANATION},
 {text:'Ein Wunsch nach Sicherheit könnte möglicherweise relevant sein, müsste aber überprüft werden.',score:1,reason:EARLY_EXPLANATION},
 {text:'Die Rollen im Gespräch müssen umgekehrt werden, dann löst sich die Spannung.',score:0,reason:RISK_EXPLANATION},
 {text:'Eine abweichende Deutung muss nicht automatisch einen Mangel an Verbindung bedeuten.',score:1,reason:EARLY_EXPLANATION},
 {text:'Erst die nächsten Gesprächsminuten können klären, welche Vermutung trägt.',score:1,reason:EARLY_EXPLANATION}];
}else if(kind==='Repair & Retry'){
more=[{text:'Ich habe zu schnell interpretiert. Können Sie korrigieren, wo ich Sie falsch verstanden habe?',score:2,reason:SAFE_EXPLANATION},
 {text:'Die Erklärung war von mir zu weit gefasst. Was ist für Sie tatsächlich wichtig?',score:2,reason:SAFE_EXPLANATION},
 {text:'Ich möchte erst den unmittelbaren Moment besser verstehen, bevor ich etwas einordne.',score:2,reason:SAFE_EXPLANATION},
 {text:'Vielleicht war ich mit meiner Vermutung zu schnell; wir können beim konkreten Erleben bleiben.',score:2,reason:SAFE_EXPLANATION},
 ...theme.open.map(text=>({text,score:1,reason:'Die Frage kann helfen, aber die vorangegangene Fehldeutung sollte erst anerkannt werden.'})),
 ...theme.close.map(text=>({text,score:0,reason:RISK_EXPLANATION})),
 {text:'Ich bleibe trotzdem bei meiner Theorie – warten wir ab, ob Sie mir zustimmen.',score:0,reason:RISK_EXPLANATION}];
}else {
more=[...theme.open.map(text=>({text,score:2,reason:SAFE_EXPLANATION})),
 {text:c.question,score:2,reason:SAFE_EXPLANATION},
 {text:'Darf ich bei dem Moment bleiben, in dem Ihre Erfahrungen auseinandergehen?',score:2,reason:SAFE_EXPLANATION},
 {text:'Welche konkrete Szene aus der letzten Woche könnten wir gemeinsam ansehen?',score:2,reason:SAFE_EXPLANATION},
 {text:'Wäre es hilfreich, zunächst Ihre unterschiedlichen Bedeutungen zu sammeln?',score:1,reason:EARLY_EXPLANATION},
 {text:'Können Sie sich auf einen festen nächsten Schritt einigen?',score:1,reason:EARLY_EXPLANATION},
 ...theme.close.map(text=>({text,score:0,reason:RISK_EXPLANATION})),
 {text:'Wenn das nicht von selbst funktioniert, braucht es eine klare Pflicht zur Annäherung.',score:0,reason:RISK_EXPLANATION}];
}
const selected=select([...base,...more],level,c.id+':'+mode+':'+part);return {...t,options:selected.options.map(o=>({...o,good:o.score===3,reason:o.reason})),poolSize:selected.poolSize};}
const MASTERY_NEAR={
alliance:['Ich würdige zuerst, dass mein letzter Satz Sie offenbar verunsichert hat, und bitte um ein konkretes Beispiel.','Ich frage, woran Sie im Gespräch merken, dass ich Ihrer Sicht ausreichend Platz gebe.','Ich erkläre zunächst meine Absicht und frage erst anschließend nach der Wirkung auf Sie.'],
self:['Ich benenne meine eigene Reaktion als Hypothese und richte die Aufmerksamkeit wieder auf das Gegenüber.','Ich bemerke innerlich meine Aktivierung und erkundige mich nach der Wirkung meiner Aussage.','Ich frage nach einer Pause, ohne zuvor die Dynamik im Raum zu markieren.'],
limits:['Ich würdige das Schutzbedürfnis und erkunde, welche Grenze die eigene Autonomie schützt.','Ich unterscheide eine freiwillige Vereinbarung von einer Kontrollregel.','Ich rate sofort zu einer festen Regel, bevor beide die Bedeutung geklärt haben.'],
mental:['Ich trenne zunächst Beobachtung und Schlussfolgerung und lade zu einer alternativen Sicht ein.','Ich frage, was die Person tatsächlich gesehen oder gehört hat.','Ich liste mehrere Erklärungen auf, bevor die Person sich verstanden fühlt.'],
trust:['Ich würdige den Vertrauensbruch und kläre, ob es bereits Verantwortungsübernahme gibt.','Ich frage zuerst, was gerade notwendig ist, damit das Gespräch sicher genug bleibt.','Ich dränge auf eine gemeinsame Zukunftsentscheidung, sobald beide Gefühle ausgedrückt haben.'],
jealousy:['Ich erkunde das Gefühl und die konkrete Vereinbarung getrennt.','Ich frage nach Sicherheit, Verantwortung und möglichen Minderheitenbelastungen.','Ich normalisiere das Gefühl und empfehle unmittelbar ein Ablenkungstraining.'],
grief:['Ich würdige den Verlust und frage, welche Form von Begleitung heute möglich ist.','Ich frage, was besonders schwer auszuhalten ist und was schon Halt gibt.','Ich stelle rasch eine Perspektive auf Wachstum und Neubeginn in Aussicht.'],
safety:['Ich frage vorsichtig, aber direkt nach akuter Sicherheit, Grenzen und Freiwilligkeit.','Ich unterbreche bei Bedarf eine Paarübung und kläre individuelle Sicherheit.','Ich beruhige beide erst mit einem Kommunikationsritual, bevor ich Risiken prüfe.'],
entitlement:['Ich würdige das Bedürfnis hinter dem Anspruch und frage gleichzeitig nach den Grenzen des Gegenübers.','Ich unterscheide gegenseitige Wünsche von beanspruchter Verfügbarkeit.','Ich empfehle sofort eine ausgleichende Vereinbarung, um den Anspruch zu befrieden.']};
function mastery(skill,choices,level,caseId){const base=choices.map((raw,i)=>{const o=Array.isArray(raw)?{text:raw[0],score:raw[1],why:raw[2],key:i}:raw;return {text:o.text,score:o.score===2?3:o.score===1?1:0,reason:o.why,original:o}});const extra=(MASTERY_NEAR[skill]||MASTERY_NEAR.alliance).map((t,i)=>({text:t,score:i<2?2:1,reason:i<2?SAFE_EXPLANATION:EARLY_EXPLANATION}));const universal=[
 {text:'Darf ich nachfragen, wie mein letzter Beitrag bei Ihnen angekommen ist?',score:2,reason:SAFE_EXPLANATION},
 {text:'Bevor ich etwas festlege, möchte ich die unterschiedlichen Bedeutungen prüfen.',score:2,reason:SAFE_EXPLANATION},
 {text:'Könnten Sie ein konkretes Beispiel beschreiben, bevor wir interpretieren?',score:2,reason:SAFE_EXPLANATION},
 {text:'Ich fasse die wesentlichen Anliegen zusammen und frage, was ich noch nicht verstanden habe.',score:2,reason:SAFE_EXPLANATION},
 {text:'Ich bin sicher, dass ich Ihre Situation bereits richtig durchschaut habe.',score:0,reason:RISK_EXPLANATION},
 {text:'Wir sollten jetzt rasch zu einer Lösung kommen, bevor es schwierig wird.',score:1,reason:EARLY_EXPLANATION},
 {text:'Ich erkläre gleich die passende Theorie und frage später, ob sie zutrifft.',score:1,reason:EARLY_EXPLANATION},
 {text:'Die Person, die ruhiger wirkt, wird die verlässlichere Sicht haben.',score:0,reason:RISK_EXPLANATION}];
const pick=select([...base,...extra,...universal],level,caseId);
return {...pick,options:pick.options.map(o=>({text:o.text,score:o.score===3?2:o.score===2?1:0,why:o.reason,key:o.original?.key??-1}))};}
function between(scene,stage,level){const opts=stage===0?[{text:scene.tentative,score:3,reason:'Überprüfbare Hypothese, die an ein Signal anschließt.'},{text:scene.alternative,score:3,reason:'Gleichzeitig denkbare alternative Erklärung.'},{text:'Die Person zeigt damit eindeutig eine tief sitzende Persönlichkeitsstörung.',score:0,reason:RISK_EXPLANATION},{text:'Nur das wörtlich Gesagte zählt; Zwischentöne sind prinzipiell irrelevant.',score:1,reason:EARLY_EXPLANATION}]:[{text:scene.intervention,score:3,reason:scene.feedback},{text:scene.overreach,score:0,reason:RISK_EXPLANATION},{text:scene.surface,score:1,reason:EARLY_EXPLANATION},{text:scene.safety?'Ich beginne mit einer Paarübung, bevor ich ein mögliches Risiko anspreche.':'Ich erkläre, was die Person wirklich meint, ohne danach zu fragen.',score:0,reason:RISK_EXPLANATION}];
const more=stage===0?[
 {text:'Der Hinweis könnte mit dem aktuellen Kontext zu tun haben; wir sollten das nachfragen.',score:2,reason:SAFE_EXPLANATION},
 {text:'Vielleicht sucht die Person gerade nach einer Form, ihr Erleben sicher mitzuteilen.',score:2,reason:SAFE_EXPLANATION},
 {text:'Es ist offen, ob der Satz Schutz, Höflichkeit oder ein ungelöstes Bedürfnis ausdrückt.',score:2,reason:SAFE_EXPLANATION},
 {text:'Eine abweichende Stimmung könnte andere Gründe haben als der erste Eindruck.',score:2,reason:SAFE_EXPLANATION},
 {text:'Das beobachtete Zeichen beweist eine bestimmte Bindungsstörung.',score:0,reason:RISK_EXPLANATION},
 {text:'Einzelne nonverbale Hinweise dürfen nicht als eindeutiger Gefühlsbeweis gelten.',score:1,reason:EARLY_EXPLANATION},
 {text:'Ich würde die Beobachtung wortwörtlich mitteilen und fragen, ob sie zutrifft.',score:1,reason:EARLY_EXPLANATION},
 {text:'Die Aussage lässt höchstens eine vorsichtige Vermutung zu.',score:1,reason:EARLY_EXPLANATION},
 {text:'Wer ausweicht, verbirgt fast immer die Wahrheit.',score:0,reason:RISK_EXPLANATION}
]:[
 {text:'Darf ich kurz nachfragen, wie das gerade für Sie ist?',score:2,reason:SAFE_EXPLANATION},
 {text:'Ich höre Ihre Worte und möchte die Bedeutung nicht für Sie bestimmen.',score:2,reason:SAFE_EXPLANATION},
 {text:'Ich möchte prüfen, ob ich Sie richtig verstanden habe, bevor wir weitergehen.',score:2,reason:SAFE_EXPLANATION},
 {text:'Können wir einen Schritt langsamer gehen, damit Sie Ihr Tempo behalten?',score:2,reason:SAFE_EXPLANATION},
 {text:'Wäre es in Ordnung, die Wirkung meiner Frage auf Sie genauer anzusehen?',score:2,reason:SAFE_EXPLANATION},
 {text:'Ich sage Ihnen jetzt, welches Muster hier eindeutig sichtbar wird.',score:0,reason:RISK_EXPLANATION},
 {text:'Vielleicht wäre es gut, zuerst einen allgemeinen Tipp auszuprobieren.',score:1,reason:EARLY_EXPLANATION},
 {text:'Ich erkläre zunächst das theoretische Modell und komme dann zurück zur Erfahrung.',score:1,reason:EARLY_EXPLANATION},
 {text:'Sie sollten sich jetzt überwinden und das Thema offenlegen.',score:0,reason:RISK_EXPLANATION}
];return select([...opts,...more],level,scene.id+':'+stage);}
const DIALOG_PREFIX={
 cautious:['Ich möchte das wirklich vorsichtig formulieren. ','Es fällt mir schwer, das anzusprechen. '],
 direct:['Ich sage es ganz direkt: ','Ich möchte das nicht länger verschweigen: '],
 vulnerable:['Das macht mich verletzlich, aber: ','Ich weiß nicht, wie ich es besser sagen kann: ']
};
function dialogue(c,character,turn){
 const variants=[{line:c.line,reply:c.reply,label:'Originaldialog'}];
 const style=String(character?.style||'').toLowerCase();
 const prefix=/(direkt|konfront|dominant|klar|stark)/.test(style)?DIALOG_PREFIX.direct:/(vorsicht|zurück|bedacht|ruhig|ängst)/.test(style)?DIALOG_PREFIX.cautious:DIALOG_PREFIX.vulnerable;
 variants.push({line:prefix[0]+c.line,reply:c.reply,label:'Persönliche Öffnung'});
 variants.push({line:c.line,reply:prefix[1]+c.reply,label:'Betonte Rückmeldung'});
 // Variant is presentation-only: the underlying case and clinical scoring stay fixed.
 return variants[((turn%variants.length)+variants.length)%variants.length];
}
window.BDExercise79=Object.freeze({version:'15.12.79',deida,mastery,between,dialogue,select,labelScore,bankCounts:()=>Object.fromEntries(Object.keys(DOMAIN).map(k=>[k,DOMAIN[k].open.length+DOMAIN[k].close.length]))});
})();
