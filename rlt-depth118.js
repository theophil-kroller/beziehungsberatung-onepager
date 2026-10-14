/* Beziehungsdynamiken · RLT Deep Practice 15.12.118
   Public file contains only fictional scenario expansions and coaching rationale,
   no client/patient data, no private RLT course transcripts.
   Source case data remain in rlt-data83.js. */
(()=>{'use strict';
const SCENES={
 'rlt-01-01':[
  ['A','Du bist in der letzten Zeit so selten erreichbar, wenn es mir schlecht geht.'],
  ['B','Ich ziehe mich zurück, weil ich Angst habe, dass aus jeder Bitte ein Streit wird.'],
  ['A','Für mich ist dein Rückzug gerade der Streit. Ich fühle mich alleingelassen.'],
  ['B','Und ich wünsche mir einen Abend, an dem ich nicht sofort das Gefühl habe, versagt zu haben.']
 ],
 'rlt-01-02':[
  ['A','Ich vermisse körperliche Nähe. Es fühlt sich an, als hätten wir ein Stück Beziehung verloren.'],
  ['B','Ich habe Angst, dass meine Bitte um Verlässlichkeit dabei untergeht.'],
  ['A','Ich wollte keinen Druck machen, aber ich verstehe noch nicht, warum du mich auf Abstand hältst.'],
  ['B','Wenn ich mich in Absprachen sicher fühle, kann ich über Nähe sprechen. Gerade fällt mir das schwer.']
 ],
 'rlt-01-03':[
  ['A','Seit dem Umzug klingt jedes Gespräch wie eine Liste von Problemen.'],
  ['B','Ich habe hier kaum jemanden. Wenn wir darüber streiten, fühle ich mich noch einsamer.'],
  ['A','Ich dachte, wir streiten über die Organisation unseres Alltags.'],
  ['B','Ich spreche darüber, dass ich meinen Platz in dieser Stadt noch suche.']
 ],
 'rlt-01-04':[
  ['A','Ich mache mir Sorgen, wenn du trinkst, und ich weiß nicht, wie ich darüber reden soll.'],
  ['B','Wenn du mich kontrollierst, höre ich nur noch eine Anklage.'],
  ['A','Für mich geht es auch darum, ob wir uns aufeinander verlassen können.'],
  ['B','Und für mich darum, ob ich noch selbst entscheiden darf. Beides muss auf den Tisch.']
 ],
 'rlt-02-03':[
  ['A','Ich frage jeden Abend nach den Medikamenten, weil ich nicht weiß, ob du sie genommen hast.'],
  ['B','Ich merke, dass ich gerade zusätzliche fachliche Unterstützung brauche.'],
  ['A','Mir fällt schwer zu unterscheiden, ob ich helfen oder kontrollieren soll.'],
  ['B','Ich möchte Verantwortung übernehmen, aber das geht gerade nicht allein über unsere Gespräche.']
 ],
 'rlt-02-05':[
  ['A','Sobald wir streiten, bekomme ich kaum noch Luft und kann nicht mehr antworten.'],
  ['B','Ich dachte bisher, du würdest mich ignorieren. Jetzt sehe ich, dass du überfordert bist.'],
  ['A','Ich will die Beziehung klären, aber in solchen Momenten kann ich gar nicht zuhören.'],
  ['B','Dann brauchen wir zuerst einen sicheren Umgang mit solchen Situationen.']
 ],
 'rlt-03-01':[
  ['A','Ich habe zweimal nach dem Termin gefragt. Warum antwortest du nicht?'],
  ['B','Weil ich dann das Gefühl bekomme, sofort funktionieren zu müssen.'],
  ['A','Und wenn du still wirst, frage ich immer öfter nach.'],
  ['B','Je öfter du fragst, desto schwerer wird es für mich, wieder einzusteigen.']
 ],
 'rlt-03-03':[
  ['A','Wenn ich traurig werde, antwortest du, als würden wir eine Rechnung prüfen.'],
  ['B','Ich will es nicht schlimmer machen. Deshalb versuche ich sachlich zu bleiben.'],
  ['A','Aber dann werde ich noch lauter, damit du merkst, wie wichtig es mir ist.'],
  ['B','Und genau dann ziehe ich mich noch stärker auf Fakten zurück.']
 ],
 'rlt-04-01':[
  ['A','Ich kann dir Punkt für Punkt erklären, warum meine Sicht stimmt.'],
  ['B','Ich möchte nicht noch eine Beweisführung. Ich möchte wissen, ob dich meine Verletzung erreicht.'],
  ['A','Wenn ich meine Sicht nicht verteidige, habe ich Angst, dass alles an mir hängen bleibt.'],
  ['B','Und deine Verteidigung lässt mich so fühlen, als wäre mein Erleben falsch.']
 ],
 'rlt-04-03':[
  ['A','Ich sage meinen Ärger lieber sofort. Sonst staut er sich auf.'],
  ['B','Wenn du ihn so herauslässt, gehe ich innerlich zu.'],
  ['A','Ich habe Angst, dass eine Pause wieder bedeutet, dass wir schweigen.'],
  ['B','Ich wäre für ein Gespräch bereit, wenn wir beide darin sicher bleiben.']
 ],
 'rlt-05-01':[
  ['A','Wenn jemand enttäuscht ist, glaube ich sofort, ich müsste alles reparieren.'],
  ['B','Ich möchte nicht, dass du meine Gefühle für mich tragen musst.'],
  ['A','Zu Hause war es früher meine Aufgabe, die Stimmung zusammenzuhalten.'],
  ['B','Vielleicht dürfen wir hier üben, dass jeder sein eigenes Gefühl haben kann.']
 ],
 'rlt-05-03':[
  ['A','Sobald du einen Fehler ansprichst, höre ich, dass ich nicht genüge.'],
  ['B','Ich habe eine konkrete Bitte – ich bewerte dich als Mensch gar nicht.'],
  ['A','Früher war Kritik fast immer mit Abwertung verbunden.'],
  ['B','Ich möchte verstehen, was das auslöst, ohne dass wir den heutigen Anlass verlieren.']
 ],
 'rlt-06-01':[
  ['A','Wenn ich unterbrochen werde, fühle ich mich klein und werde dann noch deutlicher.'],
  ['B','Wenn du mich unfähig nennst, komme ich mit meinem Anliegen gar nicht mehr vor.'],
  ['A','Ich dachte, ich müsste mich nur stärker behaupten.'],
  ['B','Für mich wäre Stärke, wenn wir beide sprechen könnten, ohne einander abzuwerten.']
 ],
 'rlt-06-08':[
  ['A','Ich brauche in diesem Bereich Privatsphäre und möchte dir sagen, warum.'],
  ['B','Ich bin enttäuscht, aber du erklärst deine Grenze ohne mich anzugreifen.'],
  ['A','Deine Enttäuschung darf da sein. Mein Nein gilt trotzdem.'],
  ['B','So können wir wenigstens offen darüber sprechen, was jeder braucht.']
 ],
 'rlt-07-03':[
  ['A','Ich will mit deinen Freundinnen und Freunden nichts zu tun haben.'],
  ['B','Es geht mir nicht darum, dass du alle mögen musst. Ich brauche Respekt für meine Kontakte.'],
  ['A','Ich sehe, dass ich meine Ablehnung manchmal wie eine Regel für dich formuliere.'],
  ['B','Genau das macht es schwer, frei zu entscheiden, wen ich treffe.']
 ],
 'rlt-07-07':[
  ['A','Ich erkläre es noch einmal. Du verstehst den sachlichen Punkt nicht.'],
  ['B','Wenn du so mit mir redest, fühle ich mich nicht wie eine gleichwertige Person.'],
  ['A','Ich dachte, meine Erklärung würde helfen, die Sache zu klären.'],
  ['B','Die Erklärung wird zum Problem, wenn ich darin gar nicht als Gegenüber vorkomme.']
 ],
 'rlt-08-01':[
  ['A','Nach der Arbeit bin ich erschöpft und möchte meine Ruhe.'],
  ['B','Ich hatte heute ebenfalls Arbeit – nur einen großen Teil davon ohne Bezahlung.'],
  ['A','Ich habe diese Aufgaben bisher oft als selbstverständlich gesehen.'],
  ['B','Dann lass uns besprechen, wie wir Belastung und Erholung fair verteilen.']
 ],
 'rlt-08-04':[
  ['A','Wenn ich das Wort in meiner Sprache verwende, ist es eine Bitte, kein Vorwurf.'],
  ['B','Für mich klingt dieselbe Formulierung sehr hart.'],
  ['A','Ich hatte gar nicht bemerkt, was bei dir ankommt.'],
  ['B','Vielleicht können wir uns gegenseitig fragen, welche Bedeutung wir hören.']
 ]
};
const FALLBACK={
 0:[
  [['A','Ich möchte, dass mein Anliegen wirklich gehört wird, bevor wir über Lösungen sprechen.'],['B','Ich habe ebenfalls einen Grund, warum ich dieses Gespräch brauche.'],['A','Wenn wir gleich nach einer Lösung suchen, geht für mich etwas Wichtiges verloren.'],['B','Ich würde gern erst verstehen, worum es uns beiden jeweils geht.']],
  [['A','Wir sprechen offenbar über dasselbe Problem, meinen aber Unterschiedliches.'],['B','Ja, und sobald wir das vermischen, fühle ich mich übergangen.'],['A','Ich wünsche mir, dass du meinen Punkt nicht gleich widerlegst.'],['B','Dann sollten wir zuerst beide Anliegen nebeneinander stehen lassen.']]
 ],
 1:[
  [['A','Ich möchte an unserer Beziehung arbeiten, bin im Moment aber nicht sicher, ob ich dazu bereit bin.'],['B','Ich merke, dass es Dinge gibt, die eine gewöhnliche Gesprächsübung nicht lösen kann.'],['A','Ich brauche zuerst einen Rahmen, in dem meine Grenzen gelten.'],['B','Dann sollten wir klären, welche Unterstützung und welche Form von Gespräch passend sind.']],
  [['A','Ich hätte gern eine schnelle Lösung für uns.'],['B','Ich frage mich, ob gerade überhaupt beide frei zustimmen können.'],['A','Das sollten wir nicht überspringen, nur weil wir uns Veränderung wünschen.'],['B','Ich wäre bereit, zuerst die Voraussetzungen sorgfältig anzuschauen.']]
 ],
 2:[
  [['A','Wenn du das tust, ziehe ich mich sofort zurück.'],['B','Und dein Rückzug macht mich noch unruhiger.'],['A','Dann verhalte ich mich noch stärker so, wie du es an mir kritisierst.'],['B','Es ist, als würden wir beide etwas schützen und den Kreislauf damit verstärken.']],
  [['A','Ich beginne den Streit selten mit der Absicht, dich zu verletzen.'],['B','Trotzdem reagiere ich auf dich, als müsste ich mich verteidigen.'],['A','Meine nächste Reaktion bestätigt dir dann, was du schon befürchtet hast.'],['B','Vielleicht müssen wir genau diese Abfolge verstehen.']]
 ],
 3:[
  [['A','Im Moment hilft mir diese Reaktion, nicht hilflos zu sein.'],['B','Bei mir hinterlässt sie aber Abstand und Ärger.'],['A','Ich merke, dass ich damit kurzfristig Kontrolle gewinne.'],['B','Und langfristig verlieren wir gerade die Verbindung, die wir beide möchten.']],
  [['A','Ich kann diese Strategie im Streit fast nicht stoppen.'],['B','Ich sehe, dass du etwas schützen willst – trotzdem trifft es mich.'],['A','Es fühlt sich für einen Moment richtig an.'],['B','Später merken wir beide, welchen Preis wir dafür zahlen.']]
 ],
 4:[
  [['A','Wenn die Spannung steigt, reagiere ich automatisch wie früher.'],['B','Ich möchte verstehen, was das mit heute zu tun hat.'],['A','Diese Rolle hat mir einmal geholfen, mit schwierigen Situationen umzugehen.'],['B','Und vielleicht brauchen wir heute eine andere Antwort, die beiden gerecht wird.']],
  [['A','Ein Teil von mir erwartet sofort, dass ich etwas falsch gemacht habe.'],['B','Ich will dich nicht in diese alte Rolle zurückdrängen.'],['A','Es ist schwer, die Gegenwart von den alten Erfahrungen zu trennen.'],['B','Wir könnten neugierig sein, ohne die Ursache schon zu kennen.']]
 ],
 5:[
  [['A','Wenn ich mich unter Druck fühle, verliere ich meine Grenzen aus dem Blick.'],['B','Ich möchte dir nahe sein, aber auch als eigenständige Person vorkommen.'],['A','Ich versuche gerade, für mich einzustehen, ohne dich abzuwerten.'],['B','Dann können wir über gleichwertigen Kontakt sprechen.']],
  [['A','Ich merke, wie schnell ich mich entweder größer oder kleiner mache.'],['B','Und dann ist für unsere unterschiedlichen Grenzen kaum Platz.'],['A','Ich will üben, bei meinem Wert zu bleiben, auch wenn du Nein sagst.'],['B','Ich möchte gleichzeitig deinen Wert und meine Grenze achten.']]
 ],
 6:[
  [['A','Ich dachte lange, dass meine Sicht im Streit automatisch mehr Gewicht hat.'],['B','Ich brauche Raum, in dem meine Erfahrung nicht sofort korrigiert wird.'],['A','Es fällt mir schwer, meine Position zu hinterfragen.'],['B','Ich möchte, dass wir erst prüfen, wie frei beide tatsächlich sprechen können.']],
  [['A','Wenn wir streiten, verteidige ich meine Position sehr stark.'],['B','Ich frage mich, ob meine Stimme dann überhaupt noch zählt.'],['A','Ich möchte verstehen, wann mein Auftreten zu Druck wird.'],['B','Dann sollten wir auch auf die Folgen unserer unterschiedlichen Macht achten.']]
 ],
 7:[
  [['A','Wir bringen beide Erfahrungen mit, die über unseren konkreten Streit hinausgehen.'],['B','Trotzdem möchte ich nicht auf Herkunft oder Rolle reduziert werden.'],['A','Es könnte helfen, diese Erwartungen anzusprechen, wenn du das möchtest.'],['B','Ja, solange wir selbst entscheiden können, welche Bedeutung das für uns hat.']],
  [['A','Im Alltag wirken Erwartungen auf uns, die ich lange nicht bemerkt habe.'],['B','Ich möchte aber auch meine individuelle Sicht erklären dürfen.'],['A','Vielleicht können wir beides untersuchen, ohne einfache Zuschreibungen.'],['B','Dann fühle ich mich eher verstanden, statt in eine Schublade gesteckt.']]
 ]
};
const OPTIONS={
 0:[
  ['Ich lasse mir zuerst eine konkrete Szene schildern und kläre die unterschiedlichen Ziele erst im Anschluss.','Ein konkreter Ablauf kann nützlich sein. Ohne die beiden Aufträge zu unterscheiden, könnte die Szene aber wieder nur zum Streit über eine Sichtweise werden.',2],
  ['Ich fasse die gemeinsame Belastung zusammen und suche zuerst nach einem geteilten Ziel.','Ein gemeinsames Ziel kann verbinden. Hier laufen die individuellen Anliegen aber Gefahr, erneut unter dieser Überschrift zu verschwinden.',2],
  ['Ich beginne mit einer kurzen Zukunftsfrage, damit beide wissen, worauf sie hinarbeiten möchten.','Eine Zukunftsfrage kann motivieren. Wenn sich die Menschen noch nicht gehört fühlen, greift sie für diesen Schritt wahrscheinlich vor.',1]
 ],
 1:[
  ['Ich frage zunächst in einem geschützten Rahmen nach Freiwilligkeit, Unterstützung und möglichen Risiken.','Das ist ebenfalls ein hilfreicher erster Schritt. Je nach Lage braucht es ausdrücklich eine getrennte, vertrauliche Abklärung und geeignete externe Hilfe.',2],
  ['Ich beschreibe den geplanten Ablauf einer Paararbeit und kläre vorher, ob alle Voraussetzungen erfüllt sind.','Orientierung ist hilfreich. Das ausdrückliche Benennen konkreter Risiken und der Möglichkeit, die gemeinsame Arbeit auszusetzen, muss dabei im Zentrum stehen.',2],
  ['Ich lasse zunächst beide ihre Hoffnungen an die Paararbeit formulieren und schiebe die Sicherheitsprüfung auf den nächsten Termin.','Der Wunsch nach einem konstruktiven Einstieg ist verständlich. Bei Warnhinweisen wäre das Aufschieben einer Sicherheitsabklärung fachlich nicht vertretbar.',0]
 ],
 2:[
  ['Ich erkunde den frühesten Auslöser und frage danach, wie jede Reaktion die nächste wahrscheinlicher macht.','Der erste Auslöser hilft beim Verstehen. Entscheidend ist zusätzlich die rekursive Abfolge – wer reagiert worauf, und wie verändert das wiederum den anderen?',2],
  ['Ich validiere zuerst die Gefühle beider Menschen, bevor wir gemeinsam den Kreislauf nachzeichnen.','Validierung kann die Bereitschaft zur Reflexion erhöhen. Der Lernfokus dieses Falls liegt allerdings auf der Wechselwirkung der Schutzpositionen.',2],
  ['Ich empfehle eine vereinbarte Streitpause und untersuche das Muster bei der nächsten Sitzung.','Eine Pause kann sinnvoll sein, wenn die Erregung hoch ist. Sie ersetzt jedoch nicht die konkrete Kartierung der wiederkehrenden Abfolge.',1]
 ],
 3:[
  ['Ich würdige die Schutzabsicht und untersuche mit beiden, welchen kurzfristigen Gewinn die Reaktion hat.','Das ist ein tragfähiger Einstieg. Der zweite Teil – die langfristigen Beziehungskosten – muss anschließend ausdrücklich mit der Reaktion verbunden werden.',2],
  ['Ich frage nach der verletzlichen Emotion unmittelbar vor der gewählten Strategie.','Die Emotion hinter einer Reaktion zu erkunden ist sinnvoll. Der Schwerpunkt hier ist jedoch die Losing Strategy als wiederkehrender Preis für die Beziehung.',2],
  ['Ich vereinbare eine konkrete alternative Reaktion für den nächsten Konflikt und reflektiere das Muster danach.','Ein Verhaltensexperiment kann helfen. Ohne das Schutzmotiv und die Beziehungskosten zu verstehen, könnte es für die Person zu früh sein.',1]
 ],
 4:[
  ['Ich frage nach einer früheren Erfahrung, die sich ähnlich angefühlt hat, und lasse die Person entscheiden, wie tief sie gehen möchte.','Die biografische Öffnung ist plausibel. Entscheidend ist, nur eine Hypothese zu entwickeln und den Bezug zu heutiger Verantwortung nicht zu verlieren.',2],
  ['Ich benenne vorsichtig, dass eine früh hilfreiche Rolle heute Kosten haben könnte, und prüfe die Resonanz.','Das respektiert die frühere Schutzfunktion. Eine voreilige Zuordnung sollte durch konkrete Beispiele und die eigene Perspektive der Person ergänzt werden.',2],
  ['Ich rege eine Herkunftsfamilien-Übung an, um die vermutete Rolle genauer zu verstehen.','Vertiefung kann später hilfreich sein. In diesem Moment sollten Freiwilligkeit und die überprüfbare Verbindung zum gegenwärtigen Verhalten zuerst stehen.',1]
 ],
 5:[
  ['Ich erkunde zuerst, ob die Person sich in dieser Situation eher gleichwertig oder unterlegen erlebt.','Die Selbstwertdimension ist wichtig. Ebenso notwendig ist aber die zweite Achse: Wie werden Grenzen wahrgenommen und gewahrt?',2],
  ['Ich frage nach dem Umgang mit einem Nein, bevor wir die Selbstwertposition besprechen.','Grenzen sind hier zentral. Ein isolierter Grenzfokus kann die gleichzeitige One-up/One-down-Dynamik übersehen.',2],
  ['Ich lasse eine respektvolle Bitte formulieren und sehe erst später auf Selbstwert und Grenzen.','Eine Ich-Bitte kann kommunikativ helfen. Die hier relevante Differenzierung der beiden Achsen bleibt dadurch zunächst aus.',1]
 ],
 6:[
  ['Ich frage nach Situationen, in denen jemand frei widersprechen konnte, und nach den Folgen eines Neins.','Das erfasst Freiwilligkeit und Machtunterschiede gut. Zusätzlich sollte auf subtilen Druck und die konkrete Entscheidungsstruktur geachtet werden.',2],
  ['Ich benenne die wahrgenommene Ungleichheit vorsichtig und lade die Beteiligten ein, ihre Wirkung zu beschreiben.','Eine vorsichtige Benennung kann hilfreich sein. Vor gemeinsamem Vertiefen ist zu prüfen, ob freies Sprechen sicher möglich ist.',2],
  ['Ich untersuche zunächst, wie beide unbewusst zur Eskalation beitragen, und komme später auf Macht zurück.','Ein Wechselwirkungsmodell kann bei gleichwertigen Konflikten helfen. Bei tatsächlicher Asymmetrie könnte es Verantwortung verwischen.',1]
 ],
 7:[
  ['Ich frage offen, ob gesellschaftliche Erwartungen für dieses Paar überhaupt eine Rolle spielen.','Das lässt die Deutungshoheit bei den Beteiligten. Anschließend braucht es konkrete Beispiele statt vorschneller Kategorien.',2],
  ['Ich erkunde eine konkrete Alltagssituation und frage danach, welche äußeren Erwartungen darin spürbar waren.','Ein konkretes Beispiel reduziert Zuschreibungen. Es sollte offenbleiben, ob die Personen diese Erklärung teilen.',2],
  ['Ich biete eine mögliche gesellschaftliche Deutung an und prüfe danach, wie sie ankommt.','Die Hypothese kann anregen. Wenn sie zuerst von der beratenden Person kommt, kann sie den eigenen Deutungen des Paars zu viel Raum nehmen.',1]
 ]
};
const TOKENS=['Ich möchte einen Moment bei dieser Stelle bleiben.','Das ist für mich anders, als du es gerade beschreibst.','Ich merke, dass es hier gerade eng wird.','Ich möchte, dass du verstehst, weshalb das für mich so wichtig ist.'];
const lineHasRisk=x=>/droh|gewalt|verletz|überwach|zwang|kontrollier|kein nein|nein gesagt|sexuell[e ]+handlung|kinder verstecken|angst vor ihm|angst vor ihr|selbstverletz|suizid|nicht frei sprechen|passwörter|finanzielle isolation|isoliert|geld und mobilität|möglichkeit.*gefährd|schubst|abhängig.*angst|wutausbr|einverständnis.*fehlt|gefährd|unter druck|nötigung/i.test(x||'');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function sensitive(c){return Boolean(c.safety)||lineHasRisk(c.line+' '+c.reply)}
function scene(c,personA,personB){const risk=sensitive(c),idx=Number(c.id.split('-')[2])||0;const source=SCENES[c.id]||FALLBACK[c.domain]?.[idx%2]||[];
 return {risk,initial:[{label:'Fallkontext',text:c.line},{label:'Aus dem Gespräch',text:c.reply}],turns:risk?[]:source.map((p,i)=>({who:p[0]==='A'?personA:personB,text:p[1],align:p[0]==='A'?'a':'b'})),curated:!!SCENES[c.id]};}
function options(c,domain,phase){if(phase===0){if(sensitive(c)){
 const arr=[
  {x:'Ich prüfe zuerst Sicherheit, Freiwilligkeit und möglichen Unterstützungsbedarf – gegebenenfalls in getrennten Gesprächen.',g:3,why:'Sicherheit und Wahlfreiheit sind hier vorrangig. Eine gemeinsame Paarintervention wäre erst nach geeigneter Risiko- und Rahmeneinschätzung zu erwägen.'},
  {x:'Ich beginne mit einer vertraulichen Abklärung, ob beide frei sprechen können und welche Unterstützung nötig ist.',g:2,why:'Die vertrauliche Abklärung ist sinnvoll. Es fehlt noch die explizite Entscheidung, die Paararbeit bei Risiken auszusetzen oder andere Hilfe einzubeziehen.'},
  {x:'Ich erkunde zunächst das wiederkehrende Muster, unterbreche aber bei Hinweisen auf Druck sofort.',g:1,why:'Das Unterbrechen ist richtig; bei bereits vorliegenden Warnhinweisen beginnt die Arbeit jedoch mit Sicherheit und nicht mit einer gemeinsamen Mustersuche.'},
  {x:'Ich bitte beide um je eine kurze Ich-Botschaft und kläre dann die Sicherheitslage.',g:0,why:'Eine strukturierte Ich-Botschaft wirkt zunächst deeskalierend. Sie ist aber kein Ersatz für die vorgelagerte Abklärung möglicher Gewalt, Drohung oder fehlender Freiwilligkeit.'}
 ];return {question:'Welche Voraussetzung muss zuerst geklärt werden?',instruction:'Warnhinweise können das Vorgehen grundlegend verändern. Sicherheit hat Vorrang vor einer Paarübung.',options:arr,best:arr[0].x,kind:'Sicherheit vor Methode',reference:domain.caution};}
 const related={0:[2,7,4],1:[6,2,0],2:[3,5,0],3:[2,5,4],4:[3,5,2],5:[6,3,4],6:[5,1,2],7:[0,4,5]};const alt=(related[c.domain]||[1,2,3]).map(i=>window.BDRLT83.domains[i]);const arr=[{x:domain.title,g:3,why:`Hier sind die Hinweise im Fall besonders auf ${domain.objective.toLowerCase()} gerichtet. Die anderen Linsen können ergänzend nützlich sein.`},
 {x:alt[0].title,g:2,why:`Auch ${alt[0].title} kann anschließen: ${alt[0].objective}. Der unmittelbar zu prüfende Fokus ist hier jedoch ${domain.title}.`},
 {x:alt[1].title,g:2,why:`${alt[1].title} wäre als zweite Arbeitshypothese plausibel. Vorrangig braucht dieser Fall zunächst ${domain.objective.toLowerCase()}.`},
 {x:alt[2].title,g:1,why:`Die Perspektive ${alt[2].title} ist nicht grundsätzlich falsch. Für den ersten Schritt führt sie von den zentralen Hinweisen dieses Falls eher weg.`}];return {question:'Welche RLT-Linse ist für den Einstieg am hilfreichsten?',instruction:'Mehrere Linsen sind denkbar. Wähle die Perspektive, die in diesem Fall zuerst überprüft werden sollte.',options:arr,best:domain.title,kind:'Fokus erkennen',reference:domain.objective};
 }
 const alternative=OPTIONS[c.domain]||OPTIONS[0];const arr=[{x:c.good,g:3,why:`Diese Reaktion prüft den für den Fall zentralen Fokus: ${domain.objective}. Die Intervention bleibt eine Arbeitshypothese, keine Diagnose.`},...alternative.map(x=>({x:x[0],g:x[2],why:x[1]}))];
 if(sensitive(c)){
  arr[0]={x:'Ich kläre Sicherheit, Freiwilligkeit und geeignete Unterstützung, bevor ich weitere Paarinterventionen anbiete.',g:3,why:'Die Warnhinweise verlangen eine Risikoprüfung und gegebenenfalls getrennte oder andere fachliche Unterstützung. Paarbezogene Techniken sind hier nachrangig.'};
  arr[1]={x:'Ich biete zuerst ein getrenntes Gespräch zur Abklärung des Sicherheits- und Unterstützungsbedarfs an.',g:2,why:'Das schützt einen möglichen vertraulichen Zugang. Zusätzlich muss deutlich werden, ob die gemeinsame Arbeit vorerst ungeeignet ist.'};
  arr[2]={x:'Ich spreche das beobachtete Muster vorsichtig an, ohne die beteiligten Personen zu gemeinsamen Offenlegungen zu drängen.',g:1,why:'Zurückhaltung ist gut. Bereits bekannte Gefährdungshinweise dürfen aber nicht nur als Prozessmuster behandelt werden.'};
  arr[3]={x:'Ich beginne mit einer kurzen gemeinsamen Vereinbarung zu Respekt und Streitpausen und prüfe Sicherheit danach.',g:0,why:'Ein klarer Rahmen ist wichtig. Das gemeinsame Vorgehen vor einer Sicherheitsprüfung kann bei Druck oder Gewalt riskant sein.'};
 }
 return {question:'Was wäre deine nächste beraterische Intervention?',instruction:'Alle Antworten haben einen nachvollziehbaren Ansatz. Entscheidend ist, welche Intervention in diesem Moment zuerst passt.',options:arr,best:arr[0].x,kind:'Intervention & Timing',reference:domain.caution};}
function renderScene(target,c,a,b){if(!target)return;const info=scene(c,a.name,b.name);target.replaceChildren();const tag=document.createElement('div');tag.className='rlt118-tag';tag.textContent=info.risk?'SICHERHEITSHINWEIS':'SZENE 2 · FIKTIVE TRAININGSFORTSETZUNG';target.append(tag);
 if(info.risk){const warn=document.createElement('p');warn.className='rlt118-safety';warn.textContent='Bei diesem Fall liegen Hinweise auf Gefährdung, Druck oder fehlende Freiwilligkeit vor. Eine fortgesetzte gemeinsame Paarszene wäre als Training irreführend. Zuerst wird der sichere Rahmen geprüft.';target.append(warn);return;}
 const wrap=document.createElement('div');wrap.className='rlt118-turns';info.turns.forEach(t=>{const row=document.createElement('div');row.className='rlt118-turn '+t.align;const lbl=document.createElement('strong');lbl.textContent=t.who;const p=document.createElement('p');p.textContent=t.text;row.append(lbl,p);wrap.append(row)});target.append(wrap);
 const note=document.createElement('p');note.className='rlt118-origin';note.textContent='Zusätzliche, fiktive Gesprächsbeiträge zur Übung – keine Originalaussagen aus dem Fallmaterial.';target.append(note);
}
function feedback(task,selection,c,domain){const pick=task.options[selection];if(!pick)return '';const grade=pick.g;const heading=grade===3?'Gut begründeter erster Schritt':grade===2?'Plausibel, aber nicht vorrangig':grade===1?'Nachvollziehbar – zu früh oder zu eng':'Hier ist der Rahmen entscheidend';
 return `<h2>${esc(heading)}</h2><p class="rlt118-feedback-choice">${esc(pick.x)}</p><section class="rlt118-feedback-signal"><h3>Konkretes Signal aus dem Fall</h3><p>${esc(c.line)} ${esc(c.reply)}</p></section><section class="rlt118-feedback-why"><h3>Warum diese Wahl?</h3><p>${esc(pick.why)}</p></section><section class="rlt118-feedback-next"><h3>Worauf du achten solltest</h3><p>${esc(task.reference)} Für diesen fiktiven Fall ist als erster Schwerpunkt besonders passend: <strong>${esc(task.best)}</strong></p></section><p class="rlt118-feedback-caveat">Die Bewertung dient der Übung von Wahrnehmung und Timing. Sie ersetzt weder fachliche Fallbesprechung noch Risikoabklärung.</p>`;}
window.BDRLTDeep118={sensitive,scene,renderScene,options,feedback,version:'15.12.118'};
})();
