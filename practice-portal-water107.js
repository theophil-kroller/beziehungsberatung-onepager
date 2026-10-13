/* Ripple Gate 2.0: softly deformed concentric water rings in response to pointer velocity.
 * Independent of CRM auth and request handling. No external dependencies or data collection. */
(()=>{'use strict';
const init=()=>{
 const host=document.getElementById('loginView');if(!host||host.querySelector('.bd107-water-layer'))return;
 const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');if(motion?.matches)return;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('bd107-water-layer');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');host.prepend(svg);
 const colors=['rgba(201,107,75,.25)','rgba(201,107,75,.23)','rgba(201,107,75,.26)','rgba(201,107,75,.39)','rgba(201,107,75,.18)','rgba(201,107,75,.14)','rgba(201,107,75,.10)'];
 const paths=colors.map((color,i)=>{const p=document.createElementNS(ns,'path');p.setAttribute('stroke',color);p.setAttribute('stroke-width',i===3?'2':'1.25');svg.append(p);return p});
 let size={w:0,h:0,cx:0,cy:0,r:0},anim=0,pulses=[],last={x:0,y:0,t:0},lastWave=0,activityUntil=0,reduce=false;
 function measure(){const rect=host.getBoundingClientRect();size={w:rect.width,h:rect.height,cx:rect.width/2,cy:rect.height*.52,r:Math.min(rect.width*.86,880)/2};svg.setAttribute('viewBox',`0 0 ${size.w} ${size.h}`)}
 function radii(){const r=size.r;return [r*.43,r*.63,r*.8,r,r+72,r+144,r+216]}
 function draw(t){if(!size.w)return;const rr=radii();let strongest=0;
  for(const pulse of pulses)strongest=Math.max(strongest,pulse.power);
  rr.forEach((radius,i)=>{let d='';const samples=96;
   for(let j=0;j<=samples;j++){
    const angle=j*2*Math.PI/samples,c=Math.cos(angle),s=Math.sin(angle),px=size.cx+radius*c,py=size.cy+radius*s;
    let shift=0;
    for(const wave of pulses){const age=(t-wave.t)/1000;if(age<0||age>2.4)continue;
      const distance=Math.hypot(px-wave.x,py-wave.y),travel=age*180;
      const envelope=Math.exp(-Math.pow((distance-travel)/100,2)) * Math.exp(-age*.85);
      shift+=Math.sin((distance-travel)/24)*envelope*wave.power*(i<4?1:.75);
    }
    const r=radius+Math.max(-9,Math.min(9,shift));const x=size.cx+r*c,y=size.cy+r*s;
    d+=(j?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);
   }
   paths[i].setAttribute('d',d+'Z');
  });
 }
 function frame(t){anim=0;if(reduce||document.hidden||!host.isConnected)return;draw(t);pulses=pulses.filter(w=>t-w.t<2400);if(pulses.length||t<activityUntil)anim=requestAnimationFrame(frame)}
 function start(){if(reduce||anim||document.hidden)return;anim=requestAnimationFrame(frame)}
 function wave(x,y,power){if(reduce)return;const now=performance.now();pulses.push({x,y,power:Math.min(8,Math.max(.9,power)),t:now});pulses=pulses.slice(-6);activityUntil=now+2600;start()}
 function pointer(ev){if(reduce||ev.pointerType==='touch')return;if(ev.target.closest?.('.login-card'))return;
  const rect=host.getBoundingClientRect(),now=performance.now();const x=ev.clientX-rect.left,y=ev.clientY-rect.top;
  if(x<0||y<0||x>rect.width||y>rect.height)return;
  const delta=last.t?Math.hypot(x-last.x,y-last.y):0,dt=last.t?now-last.t:100;
  const speed=Math.min(1.8,delta/Math.max(dt,12));last={x,y,t:now};
  if(now-lastWave>160&&delta>4){lastWave=now;wave(x,y,1.7+speed*2.5)}
 }
 host.addEventListener('pointermove',pointer,{passive:true});
 host.addEventListener('pointerdown',ev=>{if(ev.target.closest?.('.login-card'))return;const rect=host.getBoundingClientRect();wave(ev.clientX-rect.left,ev.clientY-rect.top,6)},{passive:true});
 const resize=()=>{measure();start()};window.addEventListener('resize',resize,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&pulses.length)start()});
 if(motion?.addEventListener)motion.addEventListener('change',e=>{reduce=e.matches;svg.style.display=reduce?'none':'';if(reduce){pulses=[];if(anim)cancelAnimationFrame(anim);anim=0}else{measure();start()}});
 measure();draw(performance.now());
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
