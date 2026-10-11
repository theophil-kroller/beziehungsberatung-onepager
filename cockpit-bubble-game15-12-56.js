/* Build 15.12.56 – local bubble pause; no worker requests, no client data.
   The 5-second dashboard greeting remains separate in cockpit-bubbles15-12-55.js. */
(()=>{'use strict';
 const TAU=Math.PI*2,clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const rand=(a,b)=>a+Math.random()*(b-a);
 const PALETTE=[[201,107,75],[175,153,197],[139,179,182],[205,167,125]];
 const SPECIAL_BONUS=12;
 let dialog,canvas,ctx,scoreEl,clockEl,bestEl,scene=null,lastFocused=null;
 let audioCtx=null,soundButton=null,soundEnabled=true;
 try{soundEnabled=localStorage.getItem('bd1558_bubble_sound')!=='off'}catch{}
 const AudioCtor=window.AudioContext||window.webkitAudioContext;
 function enableAudio(){
   if(!AudioCtor||!soundEnabled)return;
   try{if(!audioCtx)audioCtx=new AudioCtor();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});}catch{}
 }
 function audioUi(){
   if(!soundButton)return;
   soundButton.textContent=soundEnabled?'Ton an':'Ton aus';
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

 function makeDialog(){
   const btn=document.getElementById('bdBubbleGameOpen');
   if(!btn||document.getElementById('bd1556GameDialog'))return;
   dialog=document.createElement('dialog');dialog.id='bd1556GameDialog';dialog.setAttribute('aria-labelledby','bd1556GameTitle');
   dialog.innerHTML=`<div class="bd1556-shell"><div class="bd1556-top"><div><div class="bd1556-kicker">Eine kleine Auszeit</div><h2 id="bd1556GameTitle">Seifenblasen-Pause</h2></div><div class="bd1556-stats"><span class="bd1556-stat"><strong id="bd1556Score">0</strong><small>Punkte</small></span><span class="bd1556-stat"><strong id="bd1556Time">0:00</strong><small>Spielzeit</small></span><span class="bd1556-stat"><strong id="bd1556Best">0</strong><small>Rekord</small></span></div><button type="button" class="bd1556-close" aria-label="Seifenblasen-Pause schließen" title="Schließen">×</button></div><div class="bd1556-field" id="bd1556Field" aria-label="Spielfeld: Blasen durch Klicken oder Tippen platzen lassen"><canvas id="bd1556Canvas" aria-hidden="true"></canvas><div class="bd1556-nozzle" aria-hidden="true"></div><span class="bd1556-field-hint">Blasen anklicken oder antippen · kein Zeitlimit</span></div><div class="bd1556-bottom"><p>Einfach ausprobieren. Keine Eile.</p><div class="bd1558-controls"><button type="button" class="bd1558-sound" aria-pressed="true">Ton an</button><button type="button" class="bd1556-restart">Neue Runde</button></div></div></div>`;
   document.body.appendChild(dialog);
   canvas=dialog.querySelector('canvas');ctx=canvas.getContext('2d',{alpha:true});
   scoreEl=dialog.querySelector('#bd1556Score');clockEl=dialog.querySelector('#bd1556Time');bestEl=dialog.querySelector('#bd1556Best');soundButton=dialog.querySelector('.bd1558-sound');audioUi();
   dialog.querySelector('.bd1556-close').addEventListener('click',()=>dialog.close());
   dialog.querySelector('.bd1556-restart').addEventListener('click',()=>{enableAudio();newRound()});
   soundButton?.addEventListener('click',()=>{soundEnabled=!soundEnabled;try{localStorage.setItem('bd1558_bubble_sound',soundEnabled?'on':'off')}catch{};audioUi();if(soundEnabled)enableAudio();});
   dialog.addEventListener('close',()=>{stop();lastFocused?.focus?.();});
   dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
   canvas.addEventListener('pointerdown',onPointer);
   btn.addEventListener('click',()=>{if(!dialog.open){lastFocused=btn;enableAudio();dialog.showModal();newRound();}});
   window.addEventListener('resize',()=>{if(scene)resize()},{passive:true});
 }
 function best(){try{return Number(localStorage.getItem('bd1556_bubble_best')||0)||0;}catch{return 0}}
 function saveBest(n){try{localStorage.setItem('bd1556_bubble_best',String(n))}catch{}}
 function stop(){if(scene){scene.dead=true;cancelAnimationFrame(scene.raf);scene=null;}}
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
   scene={dead:false,width:0,height:0,raf:0,bubbles:[],bursts:[],score:0,seconds:0,spawn:0,last:0,spawnTotal:0,nextSpecial:Math.floor(rand(15,23)),specialActive:false};
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
     const rim=b.special?(.048*Math.sin(11*a+t*.34+b.phase)+.022*Math.sin(22*a+t*.2)):b.warp*Math.sin(3*a+t*.8+b.phase);
     const r=radius*(1+rim);
     const x=Math.cos(a)*r,y=Math.sin(a)*r;
     i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
   }ctx.closePath();
   const g=ctx.createRadialGradient(-radius*.39,-radius*.48,1,0,0,radius*1.16);
   g.addColorStop(0,'rgba(255,255,255,.34)');
   g.addColorStop(.57,`rgba(${p.join(',')},.075)`);g.addColorStop(.88,`rgba(${p.join(',')},.18)`);g.addColorStop(1,`rgba(${p.join(',')},.27)`);
   ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=b.special?'rgba(191,149,89,.85)':`rgba(${p.join(',')},.78)`;ctx.lineWidth=b.special?1.8:1.6;ctx.stroke();
   if(b.special){
     ctx.save();ctx.setLineDash([1.2,5]);ctx.rotate(-.03);ctx.beginPath();ctx.arc(0,0,radius*.78,0,TAU);
     ctx.strokeStyle='rgba(231,184,111,.50)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
     const glimmer=Math.sin(t*3.1+b.phase)*.5+.5;
     ctx.fillStyle=`rgba(255,244,208,${.32+glimmer*.48})`;
     ctx.beginPath();ctx.arc(radius*.42,-radius*.37,2.6+glimmer*1.7,0,TAU);ctx.fill();
   }
   ctx.beginPath();ctx.ellipse(-radius*.19,-radius*.35,radius*.50,radius*.23,-.55,3.25,5.65);
   ctx.strokeStyle='rgba(255,255,255,.93)';ctx.lineWidth=Math.max(1.8,radius*.053);ctx.stroke();
   ctx.beginPath();ctx.ellipse(radius*.30,radius*.34,radius*.47,radius*.23,-.6,.13,1.42);
   ctx.strokeStyle=`rgba(${p.join(',')},.45)`;ctx.lineWidth=1.1;ctx.stroke();
   ctx.restore();
 }
 function popAt(b,s){
   s.bursts.push({x:b.x,y:b.y,r:b.r,life:0,tone:b.tone,phase:b.phase,points:b.special?SPECIAL_BONUS:b.r<24?3:b.r<34?2:1,special:!!b.special});
 }
 function paintBurst(p){
   const v=p.life/(p.special?1.18:.78);if(v>=1)return false;
   const rgb=p.special?'207,163,86':PALETTE[p.tone].join(',');ctx.save();ctx.globalAlpha=Math.pow(1-v,1.35);
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
   s.seconds+=dt;s.spawn+=dt;
   const interval=s.seconds<4?.27:s.seconds<10?.45:.66;
   while(s.spawn>=interval){s.spawn-=interval;if(s.bubbles.length<24)spawn(s)}
   ctx.clearRect(0,0,s.width,s.height);
   const slow=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   for(let i=s.bubbles.length-1;i>=0;i--){
     const b=s.bubbles[i];b.life+=dt;b.x+=b.speed*dt;
     b.y+=b.vY*dt+(slow?0:Math.sin(b.life*1.35+b.phase)*9*dt);
     if(b.y<b.r+5){b.y=b.r+5;b.vY=Math.abs(b.vY)}
     if(b.y>s.height-b.r-5){b.y=s.height-b.r-5;b.vY=-Math.abs(b.vY)}
     if(b.x-b.r>s.width+30){if(b.special){s.specialActive=false;s.spawnTotal=0;}s.bubbles.splice(i,1);continue;}
     paint(b,s,t);
   }
   for(let i=s.bursts.length-1;i>=0;i--){let b=s.bursts[i];b.life+=dt;if(!paintBurst(b))s.bursts.splice(i,1)}
   const secs=Math.floor(s.seconds);clockEl.textContent=Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');
   s.raf=requestAnimationFrame(frame);
 }
 function onPointer(e){
   const s=scene;if(!s||s.dead||!dialog.open)return;
   if(e.pointerType==='mouse'&&e.button!==0)return;
   const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
   const x=(e.clientX-r.left)*s.width/r.width,y=(e.clientY-r.top)*s.height/r.height;
   let index=-1;
   for(let i=s.bubbles.length-1;i>=0;i--){const b=s.bubbles[i];
     if(Math.hypot(b.x-x,b.y-y)<b.r*1.16){index=i;break;}}
   if(index<0)return;
   const b=s.bubbles.splice(index,1)[0];enableAudio();if(b.special){s.specialActive=false;s.spawnTotal=0;playSpecialChime();}else playPop(b.r);popAt(b,s);
   const points=b.special?SPECIAL_BONUS:b.r<24?3:b.r<34?2:1;
   s.score+=points;scoreEl.textContent=String(s.score);
   if(s.score>best()){saveBest(s.score);bestEl.textContent=String(s.score)}
   // Keep touches within the dedicated playfield, never the app underneath.
   e.preventDefault();
 }
 function init(){makeDialog()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
