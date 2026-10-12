/* Build 15.12.56 – local bubble pause; no worker requests, no client data.
   The 5-second dashboard greeting remains separate in cockpit-bubbles15-12-55.js. */
(()=>{'use strict';
 const TAU=Math.PI*2,clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const rand=(a,b)=>a+Math.random()*(b-a);
 const PALETTE=[[201,107,75],[175,153,197],[139,179,182],[205,167,125]];
 const SPECIAL_BONUS=12;
 // Curated sentences, never assembled from unrelated random grammar fragments.
 const PHRASES=[
  [
    "Heute darf’s",
    "auch mal",
    "leicht sein."
  ],
  [
    "Mehr Luft.",
    "Mehr Leichtigkeit.",
    "Mehr du."
  ],
  [
    "Ein bisschen Unsinn",
    "tut manchmal",
    "richtig gut."
  ],
  [
    "Freude braucht",
    "nicht immer",
    "einen Anlass."
  ],
  [
    "Nicht alles",
    "muss heute",
    "wichtig sein."
  ],
  [
    "Du musst",
    "gerade gar",
    "nichts."
  ],
  [
    "Nicht alles",
    "braucht jetzt",
    "eine Lösung."
  ],
  [
    "Ein guter Moment",
    "ist schon",
    "etwas wert."
  ],
  [
    "Heute ist",
    "Platz für",
    "etwas Schönes."
  ],
  [
    "Man darf",
    "sich auch",
    "einfach freuen."
  ],
  [
    "Es muss",
    "nicht immer",
    "sinnvoll sein."
  ],
  [
    "Ein bisschen",
    "Leichtsinn kann",
    "befreien."
  ],
  [
    "Heute darfst du",
    "mal über",
    "dich lachen."
  ],
  [
    "Es darf",
    "auch mal",
    "Spaß machen."
  ],
  [
    "Du bist",
    "keine",
    "To-do-Liste."
  ],
  [
    "Auch Nähe",
    "darf ganz",
    "leicht sein."
  ],
  [
    "Mehr Spielraum.",
    "Weniger Müssen.",
    "Mehr Leben."
  ],
  [
    "Nicht alles",
    "muss gleich",
    "entschieden werden."
  ],
  [
    "Du darfst",
    "deine Meinung",
    "ändern."
  ],
  [
    "Manchmal reicht",
    "es, einfach",
    "da zu sein."
  ],
  [
    "Du darfst",
    "dir Zeit",
    "lassen."
  ],
  [
    "Ein ehrliches Wort",
    "kann viel",
    "verändern."
  ],
  [
    "Nicht jeder Streit",
    "muss gewonnen",
    "werden."
  ],
  [
    "Ein kleiner Schritt",
    "ist auch",
    "ein Schritt."
  ],
  [
    "Du musst",
    "nicht alle",
    "überzeugen."
  ],
  [
    "Du darfst",
    "auch Nein",
    "sagen."
  ],
  [
    "Du darfst",
    "um Hilfe",
    "bitten."
  ],
  [
    "Zuneigung braucht",
    "keine perfekte",
    "Formulierung."
  ],
  [
    "Ein bisschen",
    "Wärme verändert",
    "den Raum."
  ],
  [
    "Auch leise Menschen",
    "haben viel",
    "zu sagen."
  ],
  [
    "Du musst",
    "nicht sein",
    "wie alle."
  ],
  [
    "Anders sein",
    "ist nicht",
    "falsch."
  ],
  [
    "Deine Ecken",
    "dürfen ruhig",
    "bleiben."
  ],
  [
    "Das Normale",
    "ist manchmal",
    "überbewertet."
  ],
  [
    "Du darfst",
    "seltsam",
    "sein."
  ],
  [
    "Ein bisschen wild",
    "steht dir",
    "gut."
  ],
  [
    "Nicht perfekt.",
    "Nicht glatt.",
    "Aber echt."
  ],
  [
    "Du darfst",
    "aus der Reihe",
    "tanzen."
  ],
  [
    "Du musst",
    "nicht überall",
    "hineinpassen."
  ],
  [
    "Bleib ruhig",
    "ein",
    "Original."
  ],
  [
    "Nicht jeder",
    "muss dich",
    "verstehen."
  ],
  [
    "Es muss",
    "nicht allen",
    "gefallen."
  ],
  [
    "Manche Wege",
    "passen eben",
    "nur zu dir."
  ],
  [
    "Mehr Mut",
    "zur eigenen",
    "Spur."
  ],
  [
    "Ein bisschen",
    "verrückt kann",
    "schön sein."
  ],
  [
    "Heute schon",
    "etwas",
    "Unvernünftiges gelacht?"
  ],
  [
    "Du darfst",
    "Raum",
    "einnehmen."
  ],
  [
    "Dein Tempo",
    "ist auch",
    "ein Tempo."
  ],
  [
    "Man darf",
    "sich neu",
    "erfinden."
  ],
  [
    "Manchmal ist",
    "der Umweg",
    "der schönere Weg."
  ],
  [
    "Nicht jeder Tag",
    "braucht",
    "einen Plan."
  ],
  [
    "Ein Lächeln",
    "ist kein",
    "kleiner Anfang."
  ],
  [
    "Ein guter Witz",
    "kann viel",
    "Luft machen."
  ],
  [
    "Auch Quatsch",
    "hat seinen",
    "Platz."
  ],
  [
    "Du bist",
    "kein Projekt,",
    "das fertig sein muss."
  ],
  [
    "Du darfst",
    "Dinge einfach",
    "ausprobieren."
  ],
  [
    "Mut fühlt sich",
    "nicht immer",
    "mutig an."
  ],
  [
    "Du kannst",
    "neu",
    "anfangen."
  ],
  [
    "Heute zählt",
    "nicht nur",
    "die Leistung."
  ],
  [
    "Lass dir",
    "ein bisschen",
    "Spielraum."
  ],
  [
    "Ein Fehler",
    "ist noch",
    "kein Urteil."
  ],
  [
    "Du darfst",
    "auch mal",
    "unsicher sein."
  ],
  [
    "Es darf",
    "unordentlich",
    "lebendig sein."
  ],
  [
    "Ein neuer Blick",
    "ändert manchmal",
    "alles."
  ],
  [
    "Schritt für Schritt",
    "ist auch",
    "vorwärts."
  ],
  [
    "Nicht jeder Gedanke",
    "verdient",
    "deine Zeit."
  ],
  [
    "Aufatmen.",
    "Weitersehen.",
    "Vielleicht lächeln."
  ],
  [
    "Kleine Freuden",
    "sind auch",
    "große Sachen."
  ],
  [
    "Du darfst",
    "dich selbst",
    "überraschen."
  ],
  [
    "Gute Dinge",
    "brauchen manchmal",
    "ein bisschen Zeit."
  ],
  [
    "Manches wird",
    "leichter, wenn man",
    "es teilt."
  ],
  [
    "Neugier ist",
    "manchmal besser",
    "als Gewissheit."
  ],
  [
    "Wer nie abbiegt,",
    "sieht selten",
    "neue Wege."
  ],
  [
    "Du darfst",
    "etwas anders",
    "machen."
  ],
  [
    "Auch ein Nein",
    "kann freundlich",
    "sein."
  ],
  [
    "Lachen geht",
    "auch ohne",
    "besonderen Grund."
  ],
  [
    "Manchmal ist",
    "weniger müssen",
    "mehr leben."
  ],
  [
    "Noch ist",
    "nicht alles",
    "geschrieben."
  ],
  [
    "Ein bisschen",
    "Frechheit macht",
    "die Welt bunter."
  ],
  [
    "Du darfst",
    "die Dinge",
    "locker nehmen."
  ],
  [
    "Siebenmal hinfallen.",
    "Achtmal",
    "aufstehen."
  ],
  [
    "Auch ein langer Weg",
    "beginnt mit",
    "einem Schritt."
  ],
  [
    "Wer langsam geht,",
    "kommt manchmal",
    "weiter."
  ],
  [
    "Stück für Stück",
    "baut der Vogel",
    "sein Nest."
  ],
  [
    "Gut Ding",
    "braucht",
    "Weile."
  ],
  [
    "Schritt für Schritt",
    "kommt man",
    "weit."
  ]
];
 // Traditional proverb adaptations: Japan (nanakorobi yaoki), China (Dao De Jing 64),
 // Italy (chi va piano), France (petit a petit l'oiseau fait son nid), German proverb, Spanish poco a poco.
 const ORIGINS={
   'Siebenmal hinfallen. Achtmal aufstehen.':'Japanisches Sprichwort',
   'Auch ein langer Weg beginnt mit einem Schritt.':'Chinesische Weisheit',
   'Wer langsam geht, kommt manchmal weiter.':'Nach einem italienischen Sprichwort',
   'Stück für Stück baut der Vogel sein Nest.':'Französisches Sprichwort',
   'Gut Ding braucht Weile.':'Deutsches Sprichwort',
   'Schritt für Schritt kommt man weit.':'Spanisches Sprichwort'
 };
 const GOOD_WORDS=['Zuversicht','Freude','Lebenslust','Leichtigkeit','Wärme','Mut','Lachen','Neugier','Vertrauen','Nähe','Kraft','Gelassenheit','Freiheit','Spielraum','Hoffnung','Lebendigkeit','Offenheit','Zärtlichkeit','Aufatmen','Verbundenheit'];
 const SABOTEURS=[
 {
  "kind": "spike",
  "thought": "Du bist nicht gut genug.",
  "answer": "Du musst nicht perfekt sein."
 },
 {
  "kind": "fog",
  "thought": "Das schaffst du nie.",
  "answer": "Vielleicht geht mehr, als du denkst."
 },
 {
  "kind": "knot",
  "thought": "Du musst es allen recht machen.",
  "answer": "Du darfst Nein sagen."
 },
 {
  "kind": "stone",
  "thought": "Andere sind besser als du.",
  "answer": "Du gehst deinen eigenen Weg."
 },
 {
  "kind": "vortex",
  "thought": "Was, wenn alles schiefgeht?",
  "answer": "Du musst nicht alles vorher wissen."
 },
 {
  "kind": "spike",
  "thought": "Du bist zu viel.",
  "answer": "Du darfst Raum einnehmen."
 },
 {
  "kind": "fog",
  "thought": "Du wirst dich blamieren.",
  "answer": "Du darfst es trotzdem versuchen."
 },
 {
  "kind": "knot",
  "thought": "Du darfst niemanden enttäuschen.",
  "answer": "Du kannst nicht für alle leben."
 },
 {
  "kind": "stone",
  "thought": "Du bist zu spät dran.",
  "answer": "Du bestimmst deinen Zeitpunkt."
 },
 {
  "kind": "vortex",
  "thought": "Alle werden dich beurteilen.",
  "answer": "Nicht jeder Blick zählt."
 },
 {
  "kind": "spike",
  "thought": "Du machst immer alles falsch.",
  "answer": "Ein Fehler ist kein Urteil."
 },
 {
  "kind": "fog",
  "thought": "Das hat doch keinen Sinn.",
  "answer": "Vielleicht zeigt sich der Sinn später."
 },
 {
  "kind": "knot",
  "thought": "Du musst alles kontrollieren.",
  "answer": "Ein bisschen Ungewissheit darf sein."
 },
 {
  "kind": "stone",
  "thought": "Du kommst nie voran.",
  "answer": "Auch kleine Schritte zählen."
 },
 {
  "kind": "vortex",
  "thought": "Du musst schneller sein.",
  "answer": "Du hast dein eigenes Tempo."
 },
 {
  "kind": "spike",
  "thought": "Sei nicht so empfindlich.",
  "answer": "Du darfst etwas fühlen."
 },
 {
  "kind": "fog",
  "thought": "Das wird bestimmt nichts.",
  "answer": "Du darfst dich überraschen lassen."
 },
 {
  "kind": "knot",
  "thought": "Sag bloß nichts Falsches.",
  "answer": "Du darfst ehrlich sein."
 },
 {
  "kind": "stone",
  "thought": "Du bist nicht interessant.",
  "answer": "Du musst niemanden beeindrucken."
 },
 {
  "kind": "vortex",
  "thought": "Du musst perfekt wirken.",
  "answer": "Echt ist genug."
 },
 {
  "kind": "spike",
  "thought": "Reiß dich zusammen!",
  "answer": "Du darfst auch müde sein."
 },
 {
  "kind": "fog",
  "thought": "Du wirst immer scheitern.",
  "answer": "Eine Erfahrung ist kein Schicksal."
 },
 {
  "kind": "knot",
  "thought": "Du darfst nicht Nein sagen.",
  "answer": "Deine Grenze zählt."
 },
 {
  "kind": "stone",
  "thought": "Du bist zu alt dafür.",
  "answer": "Neugier hat kein Ablaufdatum."
 },
 {
  "kind": "vortex",
  "thought": "Alle anderen können das.",
  "answer": "Du musst niemandem nachlaufen."
 }
];
 const speedNames=n=>n<20?'Sehr ruhig':n<45?'Entspannt':n<70?'Lebendig':n<90?'Schnell':'Herausfordernd';
 // Zero disables the mode. First upgrade imports the previous checkbox preference.
 let saboteurLevel=0;
 try{
   const saved=localStorage.getItem('bd1562_bubble_saboteur_level');
   saboteurLevel=saved!==null?clamp(Math.round(Number(saved)||0),0,5):(localStorage.getItem('bd1561_bubble_saboteurs')==='on'?2:0);
 }catch{}
 let motionEffects=true;
 try{motionEffects=localStorage.getItem('bd1562_bubble_motion')!=='off'}catch{}
 const enemiesOn=()=>saboteurLevel>0;
 // 1 = an occasional thought; 5 = five simultaneous, swiftly replenished.
 const enemyInterval=()=>[Infinity,20,12,8.5,6.5,5][saboteurLevel];
 const enemyDelay=()=>enemyInterval()*rand(.85,1.38); // irregular, never machine-gun waves
 let speedSetting=35;
 try{const n=Number(localStorage.getItem('bd1560_bubble_speed'));if(Number.isFinite(n)&&localStorage.getItem('bd1560_bubble_speed')!==null)speedSetting=clamp(Math.round(n),0,100)}catch{}
 const speedFactor=()=>.38+speedSetting*1.8/100;

 let dialog,canvas,ctx,scoreEl,clockEl,bestEl,wordLineEl,wordHintEl,speedInput,speedValue,saboteurSlider,saboteurValue,motionSwitch,phraseBox,scene=null,lastFocused=null;
 let audioCtx=null,soundButton=null,soundEnabled=true;
 // Separate background atmosphere: never carries personal records or auth tokens.
 // Explicit opening of the game is the user gesture that permits playback.
 const MUSIC_TRACKS={light:'assets/audio/breath/soundscapes/cc0/first_light.mp3',calm:'assets/audio/breath/soundscapes/cc0/calm_track.mp3'};
 let musicEnabled=true,musicTrack='light',musicVolume=10,musicEl=null,musicButton=null,musicSelect=null,musicSlider=null,musicNote=null,musicFadeTimer=0,musicPlaying=false;
 try{
   musicEnabled=localStorage.getItem('bd1560_bubble_music')!=='off';
   const track=localStorage.getItem('bd1560_bubble_track');if(Object.prototype.hasOwnProperty.call(MUSIC_TRACKS,track))musicTrack=track;
   const volume=Number(localStorage.getItem('bd1560_bubble_music_volume'));if(Number.isFinite(volume)&&volume>=0&&volume<=100&&localStorage.getItem('bd1560_bubble_music_volume')!==null)musicVolume=volume;
 }catch{}
 function musicUi(){
   if(musicButton){musicButton.textContent=musicEnabled?'Musik an':'Musik aus';musicButton.setAttribute('aria-pressed',String(musicEnabled));}
   if(musicSelect)musicSelect.value=musicTrack;
   if(musicSlider){musicSlider.value=String(musicVolume);musicSlider.disabled=!musicEnabled;}
 }
 function noteMusic(msg){if(musicNote)musicNote.textContent=msg||'';}
 function clearMusicFade(){if(musicFadeTimer){clearInterval(musicFadeTimer);musicFadeTimer=0;}}
 function fadeMusic(target,ms,finish){
   if(!musicEl)return;clearMusicFade();const el=musicEl,from=el.volume,at=Date.now();
   musicFadeTimer=setInterval(()=>{
     if(el!==musicEl){clearMusicFade();return}
     const u=Math.min(1,(Date.now()-at)/ms);
     el.volume=clamp(from+(target-from)*u,0,1);
     if(u>=1){clearMusicFade();if(finish)finish();}
   },35);
 }
 function stopMusic(){
   musicPlaying=false;
   if(!musicEl)return;
   const el=musicEl;
   fadeMusic(0,260,()=>{el.pause();try{el.currentTime=0}catch{}});
 }
 function startMusic(reset=false){
   if(!dialog?.open||!musicEnabled||document.hidden)return;
   const path=MUSIC_TRACKS[musicTrack];
   if(!musicEl){musicEl=new Audio();musicEl.loop=true;musicEl.preload='none';musicEl.addEventListener('error',()=>noteMusic('Musikdatei gerade nicht verfügbar.'))}
   if(musicEl.getAttribute('src')!==path){clearMusicFade();musicEl.pause();musicEl.setAttribute('src',path);musicEl.load();reset=true;}
   if(reset){try{musicEl.currentTime=0}catch{}}
   clearMusicFade();musicEl.volume=0;
   musicPlaying=true;
   const current=musicEl;
   current.play().then(()=>{if(current!==musicEl||!musicPlaying||!dialog?.open){current.pause();return;}noteMusic('');fadeMusic(clamp(musicVolume/100,0,.25),450);}).catch(()=>{
     if(musicPlaying)noteMusic('Musik konnte nicht starten – tippe auf „Musik an“.');musicPlaying=false;
   });
 }

 try{soundEnabled=localStorage.getItem('bd1558_bubble_sound')!=='off'}catch{}
 const AudioCtor=window.AudioContext||window.webkitAudioContext;
 function enableAudio(){
   if(!AudioCtor||!soundEnabled)return;
   try{if(!audioCtx)audioCtx=new AudioCtor();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});}catch{}
 }
 function audioUi(){
   if(!soundButton)return;
   soundButton.textContent=soundEnabled?'Plopp-Ton an':'Plopp-Ton aus';
   soundButton.setAttribute('aria-pressed',String(soundEnabled));
   soundButton.title=soundEnabled?'Plopp-Ton ausschalten':'Plopp-Ton einschalten';
 }
 function playPop(radius){
   if(!soundEnabled||!audioCtx||audioCtx.state!=='running')return;
   try{
     const t=audioCtx.currentTime, duration=.105;
     const note=audioCtx.createOscillator(),gain=audioCtx.createGain();
     note.type='sine';
     const pitch=370+Math.min(170,Math.max(0,44-radius)*4.2);
     note.frequency.setValueAtTime(pitch,t);
     note.frequency.exponentialRampToValueAtTime(Math.max(120,pitch*.43),t+.079);
     gain.gain.setValueAtTime(.0001,t);
     gain.gain.exponentialRampToValueAtTime(.105,t+.007);
     gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
     note.connect(gain).connect(audioCtx.destination);note.start(t);note.stop(t+duration+.005);
     note.onended=()=>{try{note.disconnect();gain.disconnect()}catch{}};
     // A tiny airy film break, generated offline with no external audio asset.
     const buffer=audioCtx.createBuffer(1,Math.ceil(audioCtx.sampleRate*.037),audioCtx.sampleRate);
     const data=buffer.getChannelData(0);
     for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);
     const noise=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),ng=audioCtx.createGain();
     noise.buffer=buffer;filter.type='bandpass';filter.frequency.value=1350;filter.Q.value=.85;
     ng.gain.setValueAtTime(.014,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.035);
     noise.connect(filter).connect(ng).connect(audioCtx.destination);noise.start(t);noise.stop(t+.037);
     noise.onended=()=>{try{noise.disconnect();filter.disconnect();ng.disconnect()}catch{}};
   }catch{}
 }


 // Distinct reward: short, airy three-tone glass chime (Web Audio, offline, no samples).
 function playSpecialChime(){
   if(!soundEnabled||!audioCtx||audioCtx.state!=='running')return;
   try{
     const t=audioCtx.currentTime;
     // C6 + E6 + G6 with faint bell partials; gentle transient, long bright tail.
     [1046.50,1318.51,1567.98].forEach((f,i)=>{
       const at=t+i*.077;
       [1,2.01].forEach((h,j)=>{
         const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
         osc.type='sine';osc.frequency.setValueAtTime(f*h,at);
         gain.gain.setValueAtTime(.0001,at);
         gain.gain.exponentialRampToValueAtTime(j?.012:.055,at+.012);
         gain.gain.exponentialRampToValueAtTime(.0001,at+(j?.35:.78));
         osc.connect(gain).connect(audioCtx.destination);osc.start(at);osc.stop(at+(j?.37:.81));
         osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch{}};
       });
     });
   }catch{}
 }

 function playSentenceChime(){
   if(!soundEnabled||!audioCtx||audioCtx.state!=='running')return;
   try{
     const t=audioCtx.currentTime;
     [659.25,783.99,987.77].forEach((f,i)=>{
       const o=audioCtx.createOscillator(),g=audioCtx.createGain(),at=t+i*.12;
       o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,at);
       g.gain.exponentialRampToValueAtTime(.037,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+1.25);
       o.connect(g).connect(audioCtx.destination);o.start(at);o.stop(at+1.3);
       o.onended=()=>{o.disconnect();g.disconnect()};
     });
   }catch{}
 }
 function makeDialog(){
   const btn=document.getElementById('bdBubbleGameOpen');
   if(!btn||document.getElementById('bd1556GameDialog'))return;
   dialog=document.createElement('dialog');dialog.id='bd1556GameDialog';dialog.setAttribute('aria-labelledby','bd1556GameTitle');
   dialog.innerHTML=`<div class="bd1556-shell"><div class="bd1556-top"><div><div class="bd1556-kicker">Eine kleine Auszeit</div><h2 id="bd1556GameTitle">Seifenblasen-Pause</h2></div><div class="bd1556-stats"><span class="bd1556-stat"><strong id="bd1556Score">0</strong><small>Punkte</small></span><span class="bd1556-stat"><strong id="bd1556Time">0:00</strong><small>Spielzeit</small></span><span class="bd1556-stat"><strong id="bd1556Best">0</strong><small>Rekord</small></span></div><button type="button" class="bd1556-close" aria-label="Seifenblasen-Pause schließen" title="Schließen">×</button></div><div class="bd1561-phrase" id="bd1561Phrase" role="status" aria-live="polite"><div class="bd1560-phrase-parts" id="bd1560PhraseParts"></div></div><div class="bd1556-field" id="bd1556Field" aria-label="Spielfeld: Blasen durch Klicken oder Tippen platzen lassen"><canvas id="bd1556Canvas" aria-hidden="true"></canvas><div class="bd1556-nozzle" aria-hidden="true"></div></div><div class="bd1556-bottom"><label class="bd1560-speed-label" for="bd1560Speed">Tempo <span id="bd1560SpeedValue">35 · Entspannt</span><input id="bd1560Speed" type="range" min="0" max="100" step="1" value="35" aria-label="Geschwindigkeit der Seifenblasen von 0 bis 100"><span class="bd1560-speed-ends"><small>0 · Ganz ruhig</small><small>100 · Schnell</small></span></label><div class="bd1558-controls"><label class="bd1562-enemy-level" for="bd1562EnemyLevel">Saboteure <output id="bd1562EnemyValue">0 · Aus</output><input type="range" id="bd1562EnemyLevel" min="0" max="5" step="1" value="0" aria-label="Anzahl der Saboteure gleichzeitig, 0 schaltet sie aus"></label><label class="bd1562-shake-choice" title="Kurzer Wackeleffekt beim Auflösen innerer Saboteure"><input type="checkbox" id="bd1562Shake" checked><span>Wackeln</span></label><div class="bd1560-music-controls"><button type="button" class="bd1560-music" aria-pressed="true">Musik an</button><label class="bd1560-music-choice">Hintergrund<select id="bd1560MusicTrack" aria-label="Musik im Hintergrund"><option value="light">First Light</option><option value="calm">Calm Track</option></select></label><label class="bd1560-music-level" title="Lautstärke Hintergrundmusik">Lautstärke<input type="range" min="0" max="25" step="1" value="10" id="bd1560MusicLevel" aria-label="Lautstärke der Hintergrundmusik (0 bis 25 Prozent)"></label></div><span class="bd1560-music-status" aria-live="polite"></span><button type="button" class="bd1558-sound" aria-pressed="true">Plopp-Ton an</button><button type="button" class="bd1556-restart">Neue Runde</button></div></div></div>`;
   document.body.appendChild(dialog);
   canvas=dialog.querySelector('canvas');ctx=canvas.getContext('2d',{alpha:true});
   scoreEl=dialog.querySelector('#bd1556Score');clockEl=dialog.querySelector('#bd1556Time');bestEl=dialog.querySelector('#bd1556Best');soundButton=dialog.querySelector('.bd1558-sound');audioUi();
   wordLineEl=dialog.querySelector('#bd1560PhraseParts');phraseBox=dialog.querySelector('#bd1561Phrase');
   saboteurSlider=dialog.querySelector('#bd1562EnemyLevel');saboteurValue=dialog.querySelector('#bd1562EnemyValue');
   motionSwitch=dialog.querySelector('#bd1562Shake');motionSwitch.checked=motionEffects;
   saboteurSlider.value=String(saboteurLevel);updateEnemyUi();
   saboteurSlider.addEventListener('input',()=>{
     const prev=saboteurLevel;saboteurLevel=clamp(Math.round(Number(saboteurSlider.value)||0),0,5);
     try{localStorage.setItem('bd1562_bubble_saboteur_level',String(saboteurLevel));localStorage.setItem('bd1561_bubble_saboteurs',enemiesOn()?'on':'off')}catch{}
     updateEnemyUi();
     if(scene){
       if(!enemiesOn()){
         scene.bubbles=scene.bubbles.filter(b=>!b.enemy);scene.enemyResolve=null;
         scene.antiMessage='';scene.antiThought='';scene.antiUntil=0;scene.pauseUntil=0;
         dialog.querySelector('.bd1556-shell')?.classList.remove('bd1562-shudder');renderPhrase(scene);
       }else{
         // Drop oldest excess enemies when reducing the density; none are spawned immediately at 0.
         let count=0;scene.bubbles=scene.bubbles.filter(b=>!b.enemy||++count<=saboteurLevel);
         scene.enemyTimer=(prev===0||saboteurLevel>prev)?Math.min(scene.enemyTimer,1.0):Math.max(scene.enemyTimer,enemyInterval()*.45);
       }
     }
   });
   motionSwitch.addEventListener('change',()=>{motionEffects=motionSwitch.checked;try{localStorage.setItem('bd1562_bubble_motion',motionEffects?'on':'off')}catch{};
     if(!motionEffects)dialog.querySelector('.bd1556-shell')?.classList.remove('bd1562-shudder');});
   speedInput=dialog.querySelector('#bd1560Speed');speedValue=dialog.querySelector('#bd1560SpeedValue');
   musicButton=dialog.querySelector('.bd1560-music');musicSelect=dialog.querySelector('#bd1560MusicTrack');musicSlider=dialog.querySelector('#bd1560MusicLevel');
   musicNote=dialog.querySelector('.bd1560-music-status');musicUi();
   musicButton.addEventListener('click',()=>{musicEnabled=!musicEnabled;try{localStorage.setItem('bd1560_bubble_music',musicEnabled?'on':'off')}catch{};musicUi();if(musicEnabled)startMusic();else stopMusic();});
   musicSelect.addEventListener('change',()=>{musicTrack=musicSelect.value;try{localStorage.setItem('bd1560_bubble_track',musicTrack)}catch{};if(musicEnabled)startMusic(true)});
   musicSlider.addEventListener('input',()=>{musicVolume=clamp(Number(musicSlider.value),0,25);try{localStorage.setItem('bd1560_bubble_music_volume',String(musicVolume))}catch{};if(musicEl&&!musicEl.paused){clearMusicFade();musicEl.volume=musicVolume/100;}});
   speedInput.value=String(speedSetting);updateSpeedUi();
   speedInput.addEventListener('input',()=>{speedSetting=clamp(Number(speedInput.value)||0,0,100);updateSpeedUi();try{localStorage.setItem('bd1560_bubble_speed',String(speedSetting))}catch{}});
   dialog.querySelector('.bd1556-close').addEventListener('click',()=>dialog.close());
   dialog.querySelector('.bd1556-restart').addEventListener('click',()=>{flushBest();enableAudio();newRound()});
   soundButton?.addEventListener('click',()=>{soundEnabled=!soundEnabled;try{localStorage.setItem('bd1558_bubble_sound',soundEnabled?'on':'off')}catch{};audioUi();if(soundEnabled)enableAudio();});
   dialog.addEventListener('close',()=>{flushBest();stop();stopMusic();lastFocused?.focus?.();});
   dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
   canvas.addEventListener('pointerdown',onPointer);
   const openGame=()=>{if(!dialog.open){lastFocused=btn;recordFetchFailed=false;recordUserId=null;recordPending=0;enableAudio();dialog.showModal();newRound();startMusic();syncBest();}};
   btn.addEventListener('click',openGame);
   window.BDOpenBubbleGame=openGame;
   window.addEventListener('resize',()=>{if(scene)resize()},{passive:true});
   document.addEventListener('visibilitychange',()=>{
     if(document.hidden){clearMusicFade();if(musicEl)musicEl.pause();}
     else if(dialog?.open&&musicEnabled)startMusic();
   });
 }
 function updateEnemyUi(){
   if(!saboteurValue)return;
   saboteurValue.textContent=saboteurLevel?`bis zu ${saboteurLevel}`:'0 · Aus';
   if(saboteurSlider){saboteurSlider.style.setProperty('--progress',(saboteurLevel*20)+'%');saboteurSlider.setAttribute('aria-valuetext',saboteurLevel?`bis zu ${saboteurLevel} Saboteure gleichzeitig`:'Aus');}
 }
 function reducedMotion(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
 function shudder(){
   if(!motionEffects||reducedMotion()||!dialog?.open)return;
   const shell=dialog.querySelector('.bd1556-shell');if(!shell)return;
   shell.classList.remove('bd1562-shudder');void shell.offsetWidth;shell.classList.add('bd1562-shudder');
 }
 function updateSpeedUi(){
   if(!speedValue)return;
   speedValue.textContent=speedSetting+' · '+speedNames(speedSetting);
   if(speedInput){speedInput.style.setProperty('--progress',speedSetting+'%');speedInput.setAttribute('aria-valuetext',String(speedSetting)+' von 100, '+speedNames(speedSetting));}
 }
 function renderPhrase(s){
   if(!wordLineEl||!phraseBox)return;
   wordLineEl.replaceChildren();
   const activeThought=!!(s.antiThought&&performance.now()<s.antiUntil);
   const showAnswer=activeThought&&!!s.antiMessage;
   if(activeThought){
     const wrap=document.createElement('div');wrap.className='bd1563-reframe'+(showAnswer?' has-answer':' is-unraveling');
     const thought=document.createElement('span');thought.className='bd1563-thought';thought.textContent=s.antiThought;
     wrap.appendChild(thought);
     const bridge=document.createElement('span');bridge.className='bd1563-bridge';bridge.textContent='→';bridge.setAttribute('aria-hidden','true');wrap.appendChild(bridge);
     const answer=document.createElement('span');answer.className='bd1563-answer';answer.textContent=showAnswer?s.antiMessage:'· · ·';wrap.appendChild(answer);
     wordLineEl.appendChild(wrap);
   }else for(let i=0;i<3;i++){
     const el=document.createElement('span');el.className='bd1560-phrase-part'+(i<s.partIndex?' is-revealed':'');
     el.textContent=i<s.partIndex?s.phrase[i]:'·';wordLineEl.appendChild(el);
   }
   phraseBox.classList.toggle('is-celebrating',s.partIndex===3&&!activeThought);
   phraseBox.classList.toggle('is-antidote',activeThought);
   const oldOrigin=phraseBox.querySelector('.bd1561-origin');if(oldOrigin)oldOrigin.remove();
   const origin=s.partIndex===3&&ORIGINS[s.phrase.join(' ')];
   if(origin){const note=document.createElement('small');note.className='bd1561-origin';note.textContent=origin;phraseBox.appendChild(note);}
   wordLineEl.setAttribute('aria-label',activeThought?`${s.antiThought} – ${s.antiMessage||'wird aufgelöst'}`:(s.partIndex===3?s.phrase.join(' '):'Satz wird gesammelt'));
 }
 // New users have separate cloud records. Legacy local scores are imported once.
 let recordUserId=null,recordPending=0,recordLastSent=0,recordFetchFailed=false,recordSyncing=false;
 const legacyKey='bd1556_bubble_best';
 const ownKey=()=>recordUserId?'bd1561_bubble_best_'+recordUserId:legacyKey;
 function best(){try{return Number(localStorage.getItem(ownKey())||0)||0}catch{return 0}}
 function saveBest(n){
   const x=Math.max(0,Math.floor(Number(n)||0));
   try{if(x>best())localStorage.setItem(ownKey(),String(x))}catch{}
   recordPending=Math.max(recordPending,x);
   if(Date.now()-recordLastSent>30000)flushBest();
 }
 function gameApi(){return String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'')}
 function gameToken(){try{return sessionStorage.getItem('bd_admin_session_v1')||''}catch{return ''}}
 async function syncBest(){
   if(recordSyncing||recordFetchFailed||!gameToken()||!gameApi())return;
   recordSyncing=true;
   try{
     const res=await fetch(gameApi()+'/admin/game/record',{headers:{Authorization:'Bearer '+gameToken()},cache:'no-store'});
     if(!res.ok)throw Error('record cloud unavailable');const data=await res.json();
     if(!data.ok||!Number.isSafeInteger(Number(data.userId)))throw Error('invalid record response');
     recordUserId=Number(data.userId);
     const saved=Number(localStorage.getItem(ownKey())||0)||0;
     const claimed=localStorage.getItem('bd1561_bubble_legacy_claimed');
     const legacy=(!claimed||claimed===String(recordUserId))?(Number(localStorage.getItem(legacyKey)||0)||0):0;
     const max=Math.max(Number(data.best)||0,saved,legacy,recordPending);
     localStorage.setItem('bd1561_bubble_legacy_claimed',String(recordUserId));
     localStorage.setItem(ownKey(),String(max));recordPending=max>Number(data.best||0)?max:0;
     if(bestEl)bestEl.textContent=String(max);
     recordLastSent=0;
   }catch{recordFetchFailed=true}
   finally{recordSyncing=false}
   if(recordPending)flushBest();
 }
 async function flushBest(){
   const n=recordPending;
   if(!recordUserId||!n||!gameApi()||!gameToken()||recordFetchFailed)return;
   if(recordSyncing)return;
   recordSyncing=true;recordPending=0;recordLastSent=Date.now();
   try{
     const res=await fetch(gameApi()+'/admin/game/record',{method:'POST',headers:{Authorization:'Bearer '+gameToken(),'Content-Type':'application/json'},body:JSON.stringify({best:n}),cache:'no-store'});
     if(!res.ok)throw Error('record save failed');const data=await res.json();if(!data.ok)throw Error('record save failed');
     const merged=Math.max(best(),Number(data.best)||0);
     localStorage.setItem(ownKey(),String(merged));if(bestEl)bestEl.textContent=String(merged);
   }catch{recordPending=Math.max(recordPending,n);recordFetchFailed=true}
   finally{recordSyncing=false}
 }
 function stop(){if(scene){scene.dead=true;cancelAnimationFrame(scene.raf);scene=null;}dialog?.querySelector('.bd1556-shell')?.classList.remove('bd1562-shudder');}
 function resize(){
   if(!scene||!canvas)return;
   const rect=canvas.parentElement.getBoundingClientRect(),oldW=scene.width||rect.width,oldH=scene.height||rect.height;
   const dpr=clamp(window.devicePixelRatio||1,1,2);
   scene.width=Math.max(250,rect.width);scene.height=Math.max(240,rect.height);
   for(const b of scene.bubbles){b.x*=scene.width/oldW;b.y*=scene.height/oldH;}
   canvas.width=Math.round(scene.width*dpr);canvas.height=Math.round(scene.height*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 function newRound(){
   stop();if(!ctx)return;
   scene={dead:false,width:0,height:0,raf:0,bubbles:[],bursts:[],score:0,seconds:0,spawn:0,last:0,spawnTotal:0,nextSpecial:Math.floor(rand(15,23)),specialActive:false,nextEnemy:Math.floor(rand(8,15)),enemyCount:0,enemyTimer:rand(3,6),lastEnemyKind:'',lastEnemyThought:'',enemyResolve:null,pauseUntil:0,antiMessage:'',antiThought:'',antiUntil:0,
     pops:0,nextWordPop:5,phrase:PHRASES[Math.floor(rand(0,PHRASES.length))],partIndex:0,lastPhraseIndex:-1};
   renderPhrase(scene);
   resize();
   // A lively starting group, already inside the playing field – no waiting at the nozzle.
   for(let i=0;i<6;i++){spawn(scene,true);const b=scene.bubbles[scene.bubbles.length-1];b.x=scene.width*(.15+i*.096);b.y=scene.height*(.25+(i%4)*.155);b.life=.8+i*.2;}
   scoreEl.textContent='0';clockEl.textContent='0:00';bestEl.textContent=String(best());
   scene.raf=requestAnimationFrame(frame);
 }
 function spawn(s,initial=false){
   const isSpecial=!initial && !s.specialActive && (++s.spawnTotal>=s.nextSpecial);
   if(isSpecial){s.specialActive=true;s.spawnTotal=0;s.nextSpecial=Math.floor(rand(17,24));}
   const size=isSpecial?rand(20,29):rand(15,43),speed=rand(43,104);
   const gentle=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   s.bubbles.push({x:42,y:s.height*.5+rand(-s.height*.27,s.height*.27),r:size,speed:gentle?speed*.55:speed,
     vY:rand(-24,21),phase:rand(0,TAU),life:0,tone:Math.floor(rand(0,PALETTE.length)),warp:rand(.02,.055),special:isSpecial});
 }
 function paint(b,s,now){
   const t=b.life,p=PALETTE[b.tone];
   const radius=b.r*(1+Math.sin(t*1.45+b.phase)*.09);
   const cx=b.x,cy=b.y,opacity=clamp(t/.38,0,1)*clamp((s.width+80-b.x)/90,0,1);
   if(!opacity)return;
   ctx.save();ctx.globalAlpha=opacity;ctx.translate(cx,cy);ctx.rotate(Math.sin(now*.00028+b.phase)*.15);
   ctx.beginPath();const segments=44;
   for(let i=0;i<=segments;i++){const a=i/segments*TAU;
     const rim=b.special?(.014*Math.sin(6*a+t*.34+b.phase)+.007*Math.sin(13*a+t*.2)):b.warp*Math.sin(3*a+t*.8+b.phase);
     const r=radius*(1+rim);
     const x=Math.cos(a)*r,y=Math.sin(a)*r;
     i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
   }ctx.closePath();
   const g=ctx.createRadialGradient(-radius*.39,-radius*.48,1,0,0,radius*1.16);
   g.addColorStop(0,'rgba(255,255,255,.34)');
   g.addColorStop(.57,`rgba(${p.join(',')},.075)`);g.addColorStop(.88,`rgba(${p.join(',')},.18)`);g.addColorStop(1,`rgba(${p.join(',')},.27)`);
   ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=b.special?'rgba(201,170,116,.72)':`rgba(${p.join(',')},.78)`;ctx.lineWidth=b.special?1.8:1.6;ctx.stroke();
   if(b.special){
     ctx.save();ctx.setLineDash([1.2,5]);ctx.rotate(-.03);ctx.beginPath();ctx.arc(0,0,radius*.78,0,TAU);
     ctx.strokeStyle='rgba(231,184,111,.50)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
     const glimmer=Math.sin(t*3.1+b.phase)*.5+.5;
     ctx.fillStyle=`rgba(255,244,208,${.24+glimmer*.28})`;
     ctx.beginPath();ctx.arc(radius*.42,-radius*.37,2.6+glimmer*1.7,0,TAU);ctx.fill();
   }
   ctx.beginPath();ctx.ellipse(-radius*.19,-radius*.35,radius*.50,radius*.23,-.55,3.25,5.65);
   ctx.strokeStyle='rgba(255,255,255,.93)';ctx.lineWidth=Math.max(1.8,radius*.053);ctx.stroke();
   ctx.beginPath();ctx.ellipse(radius*.30,radius*.34,radius*.47,radius*.23,-.6,.13,1.42);
   ctx.strokeStyle=`rgba(${p.join(',')},.45)`;ctx.lineWidth=1.1;ctx.stroke();
   ctx.restore();
 }
 function spawnEnemy(s){
   // A new thought should feel discovered rather than arrive in an identical wave.
   const options=SABOTEURS.filter(v=>v.kind!==s.lastEnemyKind&&v.thought!==s.lastEnemyThought);
   const v=options[Math.floor(rand(0,options.length))]||SABOTEURS[0];
   s.lastEnemyKind=v.kind;s.lastEnemyThought=v.thought;
   const variant=Math.floor(rand(0,4)),r=clamp(rand(48,65),43,Math.min(65,s.height*.19));
   const y=clamp(rand(r+12,s.height-r-12),r+5,s.height-r-5);
   // A few curved translucent looks, not a recurring dark gray identical token.
   s.bubbles.push({x:-r*.2,y,r,speed:rand(22,46),vY:rand(-9,9),phase:rand(0,TAU),life:0,
     enemy:v,variant,warp:rand(.02,.065),tone:Math.floor(rand(0,PALETTE.length)),special:false});
 }
 function paintEnemy(b,s,t){
   const x=b.x,y=b.y,r=b.r,k=b.enemy.kind,v=b.variant||0;
   const hue=PALETTE[b.tone]||PALETTE[0],tint=hue.join(',');
   ctx.save();ctx.translate(x,y);
   ctx.rotate(Math.sin(t*.00031+b.phase)*(.055+v*.018));
   ctx.shadowColor=`rgba(${tint},.16)`;ctx.shadowBlur=9;
   const fill=ctx.createRadialGradient(-r*.3,-r*.34,3,0,0,r*1.07);
   fill.addColorStop(0,'rgba(255,255,253,.86)');fill.addColorStop(.7,`rgba(${tint},.11)`);
   fill.addColorStop(1,`rgba(${tint},.25)`);
   ctx.beginPath();
   const N=96;
   for(let i=0;i<=N;i++){
     const a=i/N*TAU, wobble=Math.sin(a*(4+v)+b.phase)*.02;
     let rr=r*(1+wobble);
     if(k==='spike')rr*=1+(.055+v*.009)*Math.cos((10+v*3)*a); // fine thorns
     if(k==='fog')rr*=.94+.065*Math.sin(a*(5+v)+b.phase)+.024*Math.sin(a*11);
     if(k==='stone')rr*=.97+.055*Math.cos(a*(7+v*2)+b.phase);
     if(k==='knot')rr*=.91+.09*Math.sin(a*(3+v)+b.phase);
     if(k==='vortex')rr*=.96+.045*Math.sin(a*(6+v)+b.phase+t*.001);
     const px=Math.cos(a)*rr,py=Math.sin(a)*rr*(k==='stone'?.89:1);
     i?ctx.lineTo(px,py):ctx.moveTo(px,py);
   }
   ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=1.55;
   ctx.strokeStyle=`rgba(${tint},.63)`;ctx.stroke();ctx.shadowBlur=0;
   // Each kind has a distinct but delicate inner signature; each variant changes it.
   if(k==='knot'){
     ctx.strokeStyle=`rgba(${tint},.38)`;ctx.lineWidth=2.0;
     for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,r*.65,r*(.18+.018*v),b.phase+i*TAU/3,0,TAU);ctx.stroke()}
   }
   if(k==='vortex'){
     ctx.beginPath();for(let i=0;i<70;i++){const a=i/69*TAU*(1.9+.13*v),rr=3+i/69*r*.67;i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}
     ctx.strokeStyle=`rgba(${tint},.38)`;ctx.lineWidth=2.2;ctx.stroke();
   }
   if(k==='fog'){
     ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.ellipse(r*.06,-r*.22,r*.78,r*.24,b.phase*.1,0,TAU);ctx.fill();
   }
   if(k==='stone'){
     ctx.beginPath();ctx.moveTo(-r*.34,-r*.5);ctx.lineTo(-r*.08,-r*.32);ctx.lineTo(r*.26,-r*.39);
     ctx.strokeStyle=`rgba(${tint},.25)`;ctx.lineWidth=2;ctx.stroke();
   }
   const words=b.enemy.thought.replace(/[.!?]$/,'').split(' '),lines=[];let line='';
   for(const w of words){if((line+' '+w).length>16&&line){lines.push(line);line=w}else line+=(line?' ':'')+w}if(line)lines.push(line);
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 '+(lines.length>3?'10.5':'11.5')+'px system-ui,sans-serif';
   const h=lines.length>3?12.5:14;ctx.fillStyle='#69595a';ctx.shadowColor='rgba(255,253,248,.9)';ctx.shadowBlur=3.5;
   lines.forEach((line,i)=>ctx.fillText(line,0,(i-(lines.length-1)/2)*h,r*1.55));
   ctx.restore();
 }
 function enemyInfluence(b,s,dt){
   for(const v of s.bubbles){if(!v.enemy||v===b)continue;const d=Math.hypot(v.x-b.x,v.y-b.y),range=v.r+65;if(d>range||d<1)continue;
     const influence=(1-d/range)*dt;
     if(v.enemy.kind==='knot'||v.enemy.kind==='fog')b.x-=b.speed*influence*(v.enemy.kind==='knot'?.65:.38);
     else if(v.enemy.kind==='stone')b.y+=38*influence;
     else if(v.enemy.kind==='vortex'){b.y+=(v.x-b.x)*influence*.4;b.x+=(v.y-b.y)*influence*.4;}
     else if(v.enemy.kind==='spike')b.x-=30*influence;
   }
 }
 // A staged, tactile unravelling with a restrained, generated crackle-to-chime sound.
 function enemySound(release=false){
   if(!soundEnabled||!audioCtx||audioCtx.state!=='running')return;
   try{
     const t=audioCtx.currentTime;
     if(!release){
       const o=audioCtx.createOscillator(),g=audioCtx.createGain();
       o.type='triangle';o.frequency.setValueAtTime(240,t);o.frequency.exponentialRampToValueAtTime(115,t+.35);
       g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.045,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.39);
       o.connect(g).connect(audioCtx.destination);o.start(t);o.stop(t+.4);o.onended=()=>{o.disconnect();g.disconnect()};
     }else{
       [523.25,659.25,783.99].forEach((f,i)=>{
         const o=audioCtx.createOscillator(),g=audioCtx.createGain(),at=t+i*.105;
         o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,at);
         g.gain.exponentialRampToValueAtTime(.055,at+.018);g.gain.exponentialRampToValueAtTime(.0001,at+1);
         o.connect(g).connect(audioCtx.destination);o.start(at);o.stop(at+1.02);o.onended=()=>{o.disconnect();g.disconnect()};
       });
     }
   }catch{}
 }
 function paintEnemyFracture(e,t){
   const u=clamp((t-e.started)/800,0,1),x=e.x,y=e.y,r=e.r;
   const fade=Math.pow(1-u,1.2);
   ctx.save();ctx.translate(x,y);
   // Film turns into irregular glass-like curved fragments; no violent/sharp explosion.
   for(let i=0;i<12;i++){
     const a=(i/12)*TAU+e.phase,spread=u*(18+(i%4)*7);
     const dx=Math.cos(a)*spread,dy=Math.sin(a)*spread;
     ctx.save();ctx.translate(dx,dy);ctx.rotate(u*((i%2)?-.35:.3));ctx.globalAlpha=fade*.9;
     ctx.beginPath();ctx.arc(0,0,r*(.73+u*.13),a-.22,a+.22);
     ctx.strokeStyle=i%3===0?'rgba(205,159,124,.9)':'rgba(135,117,143,.82)';ctx.lineWidth=2.2*(1-u)+.3;ctx.stroke();
     ctx.beginPath();ctx.moveTo(Math.cos(a-.15)*r*.62,Math.sin(a-.15)*r*.62);
     ctx.lineTo(Math.cos(a)*r*(.38-.12*u),Math.sin(a)*r*(.38-.12*u));
     ctx.lineTo(Math.cos(a+.16)*r*.7,Math.sin(a+.16)*r*.7);
     ctx.strokeStyle='rgba(169,133,148,.57)';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
   }
   ctx.strokeStyle=`rgba(233,195,157,${(1-u)*.65})`;ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(0,0,r*(.4+u*1.35),0,TAU);ctx.stroke();
   ctx.restore();
 }
 function popAt(b,s){
   s.bursts.push({x:b.x,y:b.y,r:b.r,life:0,tone:b.tone,phase:b.phase,points:b.enemy?8:b.special?SPECIAL_BONUS:b.r<24?3:b.r<34?2:1,special:!!b.special,enemy:!!b.enemy});
 }
 function paintBurst(p){
   const v=p.life/(p.special?1.18:.78);if(v>=1)return false;
   const rgb=p.enemy?'164,146,180':p.special?'207,163,86':PALETTE[p.tone].join(',');ctx.save();ctx.globalAlpha=Math.pow(1-v,1.35);
   // Expanding double-film rings + glowing fragments like a real soap film breaking.
   for(let layer=0;layer<2;layer++){
     ctx.strokeStyle=layer?`rgba(255,255,255,.88)`:`rgba(${rgb},.87)`;
     ctx.lineWidth=(layer?2:3.7)*(1-v)+.3;
     ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.23+v*(layer?.94:1.18)),0,TAU);ctx.stroke();
   }
   for(let i=0;i<(p.special?22:15);i++){
     const a=i*TAU/(p.special?22:15)+p.phase,dist=p.r*(.46+v*(1.05+(i%3)*.11));
     const x=p.x+Math.cos(a)*dist,y=p.y+Math.sin(a)*dist;
     const rad=Math.max(.5,(i%3+1)*1.65*(1-v));
     ctx.shadowColor=`rgba(${rgb},.75)`;ctx.shadowBlur=6*(1-v);
     ctx.beginPath();ctx.arc(x,y,rad,0,TAU);
     ctx.fillStyle=i%3===0?'rgba(255,255,255,.99)':`rgba(${rgb},.83)`;ctx.fill();
   }
   ctx.restore();
   // Score rises briefly as the film breaks; no extra DOM nodes.
   if(v<.85){ctx.save();ctx.globalAlpha=clamp(1-v*1.18,0,.95);ctx.fillStyle='#a55f48';ctx.font='700 15px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('+'+p.points,p.x,p.y-p.r*.6-v*37);ctx.restore()}
   return true;
 }
 function frame(t){
   const s=scene;if(!s||s.dead||!dialog.open)return;
   if(!s.last)s.last=t;
   const dt=clamp((t-s.last)/1000,0,.06);s.last=t;
   if(document.hidden){s.raf=requestAnimationFrame(frame);return;}
   const frozen=s.pauseUntil&&t<s.pauseUntil;
   const step=frozen?0:dt;
   s.seconds+=step;s.spawn+=step;
   // Spawn based on elapsed active time, not the ordinary bubble counter (which resets on specials).
   if(enemiesOn()&&!frozen){
     s.enemyTimer-=step;
     if(s.enemyTimer<=0){
       const count=s.bubbles.filter(b=>b.enemy).length;
       if(count<saboteurLevel){spawnEnemy(s);s.enemyTimer=enemyDelay();}
       else s.enemyTimer=.8;
     }
   }
   if(s.enemyResolve&&!s.enemyResolve.released&&t-s.enemyResolve.started>=(reducedMotion()?50:800)){
     s.enemyResolve.released=true;s.antiMessage=s.enemyResolve.answer;
     s.antiUntil=s.enemyResolve.started+5150;renderPhrase(s);enemySound(true);shudder();
   }

   if(s.antiThought&&t>=s.antiUntil){s.antiMessage='';s.antiThought='';renderPhrase(s)}
   if(s.partIndex===3&&s.pauseUntil&&t>s.pauseUntil+650){
     s.partIndex=0;s.pauseUntil=0;
     let pick=Math.floor(rand(0,PHRASES.length));if(pick===s.lastPhraseIndex)pick=(pick+1)%PHRASES.length;
     s.lastPhraseIndex=pick;s.phrase=PHRASES[pick];renderPhrase(s);
   }
   // Slider adjusts both travel speed and the spawn rhythm; 0 remains gently animated.
   const factor=speedFactor();
   const interval=(s.seconds<4?.27:s.seconds<10?.45:.66)/(.55+factor*.45);
   while(s.spawn>=interval){s.spawn-=interval;if(s.bubbles.length<Math.min(36,Math.max(22,Math.round(s.width/35))))spawn(s)}
   ctx.clearRect(0,0,s.width,s.height);
   const slow=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   for(let i=s.bubbles.length-1;i>=0;i--){
     const b=s.bubbles[i];b.life+=step*factor;b.x+=b.speed*step*factor;
     b.y+=b.vY*step*factor+(slow?0:Math.sin(b.life*1.35+b.phase)*9*step);
     if(!b.enemy&&enemiesOn())enemyInfluence(b,s,step);
     if(b.y<b.r+5){b.y=b.r+5;b.vY=Math.abs(b.vY)}
     if(b.y>s.height-b.r-5){b.y=s.height-b.r-5;b.vY=-Math.abs(b.vY)}
     if(b.x-b.r>s.width+30){if(b.special){s.specialActive=false;s.spawnTotal=0;}s.bubbles.splice(i,1);continue;}
     if(b.enemy)paintEnemy(b,s,t);else paint(b,s,t);
   }
   if(s.enemyResolve){
     if(!s.enemyResolve.released)paintEnemyFracture(s.enemyResolve,t);
     if(t>s.enemyResolve.started+1000)s.enemyResolve=null;
   }
   for(let i=s.bursts.length-1;i>=0;i--){let b=s.bursts[i];b.life+=step;if(!paintBurst(b))s.bursts.splice(i,1)}
   const secs=Math.floor(s.seconds);clockEl.textContent=Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');
   s.raf=requestAnimationFrame(frame);
 }
 function onPointer(e){
   const s=scene;if(!s||s.dead||!dialog.open||performance.now()<s.pauseUntil)return;
   if(e.pointerType==='mouse'&&e.button!==0)return;
   const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
   const x=(e.clientX-r.left)*s.width/r.width,y=(e.clientY-r.top)*s.height/r.height;
   let index=-1;
   // Painting goes from back to front (reverse order); use the same frontmost hit order.
   for(let i=0;i<s.bubbles.length;i++){const b=s.bubbles[i];
     if(Math.hypot(b.x-x,b.y-y)<b.r*1.16){index=i;break;}}
   if(index<0)return;
   const b=s.bubbles.splice(index,1)[0];enableAudio();
   s.pops++;
   if(b.enemy){
     const now=performance.now();
     s.enemyResolve={x:b.x,y:b.y,r:b.r,phase:b.phase,kind:b.enemy.kind,answer:b.enemy.answer,started:now,released:false};
     s.antiThought=b.enemy.thought;s.antiMessage='';s.antiUntil=now+5150;
     s.pauseUntil=now+5150;s.enemyTimer=Math.max(s.enemyTimer,enemyInterval()*.8);
     renderPhrase(s);
     enemySound(false);
   }else{
     if(b.special){s.specialActive=false;s.spawnTotal=0;playSpecialChime();}else playPop(b.r);
     popAt(b,s);
   }
   if(!b.enemy&&s.pops>=s.nextWordPop&&s.partIndex<3){
     s.partIndex++;s.nextWordPop=s.pops+Math.floor(rand(4,8));
     if(s.partIndex===3){s.pauseUntil=performance.now()+3400;playSentenceChime();}
     renderPhrase(s);
   }
   const points=b.enemy?8:b.special?SPECIAL_BONUS:b.r<24?3:b.r<34?2:1;
   s.score+=points;scoreEl.textContent=String(s.score);
   if(s.score>best()){saveBest(s.score);bestEl.textContent=String(s.score)}
   // Keep touches within the dedicated playfield, never the app underneath.
   e.preventDefault();
 }
 function init(){makeDialog()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
