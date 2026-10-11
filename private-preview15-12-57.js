/* Beziehungsdynamiken 15.12.57 — self-contained private-preview 30s bubbles. */
(()=>{'use strict';
 const canvas=document.getElementById('bd1557PreviewCanvas'),btn=document.getElementById('bd1557PreviewReplay');if(!canvas||!btn)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const TAU=2*Math.PI,palette=[[201,107,75],[162,153,200],[135,184,186],[204,160,113],[183,173,156]];
 const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const reduce=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 let s=null,raf=0,last=0;
 function size(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const dpr=clamp(window.devicePixelRatio||1,1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(s){s.w=r.width;s.h=r.height}}
 function bubble(w,h,seed){return {x:rand(.12,.88)*w,y:rand(.15,.78)*h,r:rand(12,28),vx:rand(-5,7),vy:rand(-7,5),t:rand(-2.4,0),phase:rand(0,TAU),tone:Math.floor(rand(0,5)),warp:rand(.008,.026),pulse:rand(.55,1.15),dead:false}}
 function reset(){if(raf)cancelAnimationFrame(raf);size();const r=canvas.getBoundingClientRect();s={w:r.width,h:r.height,clock:0,last:0,bubbles:[],bursts:[],spawn:0,finishing:false,burstWait:0,finished:false};for(let i=0;i<7;i++)s.bubbles.push(bubble(s.w,s.h,true));if(reduce()){ctx.clearRect(0,0,s.w,s.h);return;}last=0;raf=requestAnimationFrame(frame)}
 function loc(b,t){return {x:b.x+Math.sin(t*.38+b.phase)*22+b.vx*t,y:b.y+Math.cos(t*.33+b.phase)*17+b.vy*t}}
 function addBurst(b,p){s.bursts.push({x:p.x,y:p.y,r:b.r,t:0,tone:b.tone,phase:b.phase})}
 function pop(b){if(b.dead)return;b.dead=true;addBurst(b,loc(b,s.clock))}
 function draw(b){if(b.dead)return;const t=s.clock+b.t,p=loc(b,t),r=clamp(b.r*(1+Math.sin(t*b.pulse+b.phase)*.07),10,30),c=palette[b.tone];if(p.x<-r||p.x>s.w+r||p.y<-r||p.y>s.h+r)return;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(t*.28+b.phase)*.14);ctx.scale(1+Math.sin(t*.65+b.phase)*.025,1-Math.sin(t*.65+b.phase)*.02);
  ctx.beginPath();for(let i=0;i<=52;i++){const a=i*TAU/52,k=r*(1+b.warp*Math.sin(a*3+t*.55+b.phase)+b.warp*.5*Math.sin(a*5-t*.4));i?ctx.lineTo(Math.cos(a)*k,Math.sin(a)*k):ctx.moveTo(Math.cos(a)*k,Math.sin(a)*k)}ctx.closePath();
  const g=ctx.createRadialGradient(-r*.35,-r*.46,1,0,0,r*1.13);g.addColorStop(0,'rgba(255,255,255,.64)');g.addColorStop(.55,`rgba(${c},.045)`);g.addColorStop(.83,`rgba(${c},.085)`);g.addColorStop(1,`rgba(${c},.15)`);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=Math.min(1.35,Math.max(.75,r*.034));ctx.strokeStyle=`rgba(${c},.49)`;ctx.stroke();ctx.beginPath();ctx.ellipse(-r*.21,-r*.37,r*.49,r*.23,-.56,3.1,5.85);ctx.lineWidth=Math.min(1.6,Math.max(.8,r*.045));ctx.strokeStyle='rgba(255,255,255,.95)';ctx.stroke();ctx.restore();}
 function burst(b,dt){b.t+=dt;const q=b.t/.67;if(q>1)return false;const c=palette[b.tone];ctx.save();ctx.globalAlpha=1-q;ctx.strokeStyle=`rgba(${c},.76)`;ctx.lineWidth=2.7*(1-q)+.25;ctx.beginPath();ctx.arc(b.x,b.y,b.r*(.30+q*.88),0,TAU);ctx.stroke();for(let i=0;i<12;i++){const a=i*TAU/12+b.phase,d=b.r*(.45+q*1.12);ctx.fillStyle=i%3===0?'#fff':`rgba(${c},.8)`;ctx.beginPath();ctx.arc(b.x+Math.cos(a)*d,b.y+Math.sin(a)*d,Math.max(.4,2.7*(1-q)*(i%2?.72:1)),0,TAU);ctx.fill()}ctx.restore();return true}
 function frame(ms){if(!s)return;const dt=last?clamp((ms-last)/1000,0,.055):0;last=ms;if(document.hidden){raf=requestAnimationFrame(frame);return}s.clock+=dt;
  if(s.clock>3&&s.clock<25&&s.bubbles.filter(b=>!b.dead).length<10){s.spawn+=dt;if(s.spawn>2.8){s.spawn=0;s.bubbles.push(bubble(s.w,s.h))}}
  if(s.clock>=26&&!s.finishing){s.finishing=true;s.burstWait=0;}
  if(s.finishing&&s.clock<30){s.burstWait+=dt;if(s.burstWait>.19){s.burstWait=0;const remaining=s.bubbles.filter(b=>!b.dead);if(remaining.length)pop(remaining[Math.floor(rand(0,remaining.length))])}}
  if(s.clock>=30&&!s.finished){s.finished=true;s.bubbles.filter(b=>!b.dead).forEach(pop)}
  ctx.clearRect(0,0,s.w,s.h);for(const b of s.bubbles)draw(b);for(let i=s.bursts.length-1;i>=0;i--)if(!burst(s.bursts[i],dt))s.bursts.splice(i,1);
  if(s.finished&&!s.bursts.length){raf=0;return;}raf=requestAnimationFrame(frame)
 }
 canvas.addEventListener('pointerdown',e=>{if(!s||reduce())return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;for(let i=s.bubbles.length-1;i>=0;i--){const b=s.bubbles[i];if(b.dead)continue;const p=loc(b,s.clock+b.t);if(Math.hypot(x-p.x,y-p.y)<=Math.min(32,b.r*1.12)){pop(b);e.preventDefault();break}}});
 btn.addEventListener('click',reset);
 window.addEventListener('resize',()=>{size()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)last=0});
 reset();
})();
