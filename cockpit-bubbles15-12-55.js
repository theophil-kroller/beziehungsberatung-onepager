/* Beziehungsdynamiken 15.12.55c — organic soap bubbles, 24 s per Cockpit visit.
 * Offline-only canvas effect. No cloud calls, no new permissions, no user data.
 */
(()=>{'use strict';
  const DURATION_MS=24000;
  const reduceMotion=()=>{
    let preference=false;try{preference=localStorage.getItem('bd_reduce_motion')==='1';}catch{}
    return !!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||preference);
  };
  const reducedTab=()=>document.visibilityState==='hidden';
  const TAU=Math.PI*2;
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const random=(a,b)=>a+Math.random()*(b-a);
  let current=null,wasVisible=false,lastStart=-1e9;
  function visibleCockpit(){
    const app=document.getElementById('appShell');
    const view=document.getElementById('view-dashboard');
    return !!(app&&view&&!app.classList.contains('hidden')&&view.classList.contains('active')&&
      document.visibilityState!=='hidden');
  }
  function stop(){
    if(!current)return;
    const scene=current;current=null;
    scene.stopped=true;
    if(scene.raf)cancelAnimationFrame(scene.raf);
    window.removeEventListener('resize',scene.resize);
    scene.canvas.remove();
  }
  function color(tone,alpha){
    // Distinctly visible rings, softly iridescent; still restrained on the light cockpit.
    if(tone===0)return `rgba(201,107,75,${alpha})`;
    if(tone===1)return `rgba(197,142,114,${alpha})`;
    if(tone===2)return `rgba(154,149,189,${alpha})`;
    return `rgba(177,177,146,${alpha})`;
  }
  function bubble(w,h,delay=0){
    return {x:random(.09,.91)*w,y:random(.1,.88)*h,
      r:random(20,62), vx:random(-15,15),vy:random(-10,10),
      swayX:random(18,54),swayY:random(15,38),
      freqX:random(.12,.25),freqY:random(.10,.23),phase:random(0,TAU),
      breathe:random(.18,.38),breathPhase:random(0,TAU),warp:random(.024,.065),
      tilt:random(-.5,.5),tone:Math.floor(random(0,4)),
      born:delay,popAt:delay+random(5.2,14.4),pops:Math.random()<.58,dead:false};
  }
  function position(b,t,scene){
    const age=t-b.born;
    const drift=age;
    const x=b.x+b.vx*drift+Math.sin(age*b.freqX*TAU+b.phase)*b.swayX;
    const y=b.y+b.vy*drift+Math.cos(age*b.freqY*TAU+b.phase)*b.swayY;
    // Soft reflections at the canvas boundaries, never crossing into side navigation.
    const margin=b.r+7;
    const reflect=(p,max)=>{
      const range=Math.max(1,max-2*margin);
      const mod=((p-margin)%(2*range)+2*range)%(2*range);
      return margin+(mod>range?2*range-mod:mod);
    };
    return {x:reflect(x,scene.width),y:reflect(y,scene.height)};
  }
  function outline(ctx,r,time,b){
    const N=48,phase=time*.32+b.phase;
    ctx.beginPath();
    for(let i=0;i<=N;i++){
      const a=i*TAU/N;
      const radius=r*(1+b.warp*Math.sin(a*3+phase)+b.warp*.45*Math.sin(a*5-phase*1.2));
      const x=Math.cos(a)*radius,y=Math.sin(a)*radius;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();
  }
  function drawBubble(ctx,b,t,scene,fade){
    const age=t-b.born;
    if(age<0||b.dead)return;
    const p=position(b,t,scene);
    const opacity=clamp(age/.8,0,1)*fade;
    if(!opacity)return;
    const r=b.r*(1+Math.sin(age*b.breathe*TAU+b.breathPhase)*.115);
    const stretch=Math.sin(age*.64+b.phase)*.09;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(b.tilt+Math.sin(age*.25+b.phase)*.12);
    ctx.scale(1+stretch,1-stretch*.78);
    ctx.globalAlpha=opacity;
    // Thin colored iridescent soap film; light center preserves legibility.
    outline(ctx,r,age,b);
    const glass=ctx.createRadialGradient(-r*.40,-r*.46,2,r*.06,r*.06,r*1.13);
    glass.addColorStop(0,'rgba(255,255,255,.26)');
    glass.addColorStop(.47,color(b.tone,.09));
    glass.addColorStop(.81,'rgba(247,215,196,.16)');
    glass.addColorStop(1,color(b.tone,.31));
    ctx.fillStyle=glass;ctx.fill();
    ctx.lineWidth=Math.max(1.2,r*.028);ctx.strokeStyle=color(b.tone,.69);ctx.stroke();
    // Clear inner edge and specular highlight: more like soap bubbles than balloons.
    ctx.beginPath();ctx.ellipse(-r*.2,-r*.30,r*.50,r*.25,-.52,Math.PI*1.04,Math.PI*1.82);
    ctx.lineWidth=Math.max(1.5,r*.040);ctx.strokeStyle='rgba(255,255,255,.89)';ctx.stroke();
    ctx.beginPath();ctx.ellipse(r*.19,r*.28,r*.56,r*.35,-.1,.17,1.55);
    ctx.lineWidth=Math.max(1,r*.017);ctx.strokeStyle='rgba(201,107,75,.29)';ctx.stroke();
    ctx.restore();
  }
  function pop(ctx,e,t,fade){
    const age=t-e.born;
    if(age<0||age>.72)return false;
    const v=age/.72,alpha=(1-v)*fade;
    ctx.save();ctx.globalAlpha=alpha;
    // The soap film contracts into a fleeting ring and sparkling droplets.
    ctx.beginPath();ctx.arc(e.x,e.y,e.r*(.36+v*.75),0,TAU);
    ctx.lineWidth=2*(1-v)+.2;ctx.strokeStyle=color(e.tone,.65);ctx.stroke();
    for(let i=0;i<9;i++){
      const a=(i/9)*TAU+e.phase;
      const d=e.r*(.48+v*.85)+(i%3)*2;
      const x=e.x+Math.cos(a)*d,y=e.y+Math.sin(a)*d;
      ctx.beginPath();ctx.arc(x,y,Math.max(.45,(i%3+1)*1.5*(1-v)),0,TAU);
      ctx.fillStyle=i%3===0?'rgba(255,255,255,.94)':color(e.tone,.83);
      ctx.fill();
    }
    ctx.restore();return true;
  }
  function begin(){
    if(!visibleCockpit()||reducedTab())return;
    stop();
    if(reduceMotion())return;
    const view=document.getElementById('view-dashboard');
    if(!view)return;
    const canvas=document.createElement('canvas');
    canvas.className='bd1555-bubbles';canvas.setAttribute('aria-hidden','true');
    canvas.setAttribute('role','presentation');
    view.prepend(canvas);
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx){canvas.remove();return;}
    const scene={canvas,ctx,raf:0,stopped:false,width:0,height:0,
      bubbles:[],pops:[],remaining:0,lastFrame:0,start:0,pausedFor:0,hiddenAt:0};
    current=scene;
    scene.resize=()=>{
      const width=Math.max(300,view.clientWidth);
      const height=Math.max(340,Math.min(850,window.innerHeight*.87));
      const dpr=clamp(window.devicePixelRatio||1,1,2);
      scene.width=width;scene.height=height;scene.dpr=dpr;
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      canvas.style.height=height+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    scene.resize();window.addEventListener('resize',scene.resize,{passive:true});
    for(let i=0;i<17;i++)scene.bubbles.push(bubble(scene.width,scene.height,-random(0,4)));
    // Limit total pops: meaningful, occasional bubbles bursting rather than confetti.
    let lastPop=-1e9;
    const ordered=scene.bubbles.filter(b=>b.pops).sort((a,b)=>a.popAt-b.popAt);
    for(const b of ordered){if(b.popAt-lastPop<1.2)b.popAt=lastPop+1.2;lastPop=b.popAt;}
    let startAt=0;
    const tick=now=>{
      if(scene.stopped||current!==scene)return;
      if(!visibleCockpit()){stop();return;}
      if(!startAt)startAt=now;
      if(document.hidden){scene.raf=requestAnimationFrame(tick);return;}
      // Throttle redraw to ~30fps for laptop batteries; keep animation time-based.
      if(now-scene.lastFrame<30){scene.raf=requestAnimationFrame(tick);return;}
      scene.lastFrame=now;
      const time=(now-startAt)/1000;
      const fade=clamp(time/1.15,0,1)*clamp((DURATION_MS/1000-time)/2.1,0,1);
      ctx.clearRect(0,0,scene.width,scene.height);
      if(time>=DURATION_MS/1000){stop();return;}
      for(const b of scene.bubbles){
        if(!b.dead&&b.pops&&time>b.popAt){
          const p=position(b,time,scene);
          scene.pops.push({x:p.x,y:p.y,r:b.r,tone:b.tone,phase:b.phase,born:time});
          b.dead=true;
          // A new soap bubble joins gracefully so the scene remains lively.
          if(time<18)scene.bubbles.push(bubble(scene.width,scene.height,time+random(.9,2.0)));
        }else drawBubble(ctx,b,time,scene,fade);
      }
      scene.pops=scene.pops.filter(p=>pop(ctx,p,time,fade));
      scene.raf=requestAnimationFrame(tick);
    };
    scene.raf=requestAnimationFrame(tick);
    lastStart=performance.now();
  }
  function check(){
    const isVisible=visibleCockpit();
    if(!isVisible){if(wasVisible)stop();wasVisible=false;return;}
    if(!wasVisible){wasVisible=true;begin();}
  }
  function requestRestart(){
    // Allows clicking Dashboard again, including if it is already the active view.
    setTimeout(()=>{
      if(!visibleCockpit())return;
      if(performance.now()-lastStart<400)return; // avoid duplicate navigation events
      wasVisible=true;begin();
    },160);
  }
  function init(){
    const app=document.getElementById('appShell'),dashboard=document.getElementById('view-dashboard');
    if(!app||!dashboard)return;
    const observer=new MutationObserver(check);
    observer.observe(app,{attributes:true,attributeFilter:['class']});
    observer.observe(dashboard,{attributes:true,attributeFilter:['class']});
    document.addEventListener('click',event=>{
      const target=event.target.closest?.('[data-view="dashboard"],a[href="#dashboard"],a[href$="admin.html#dashboard"]');
      if(target)requestRestart();
    },{capture:true});
    window.addEventListener('hashchange',check);
    document.addEventListener('bd:desktop-ready',check);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='hidden'){stop();wasVisible=false;}
      else check();
    });
    document.getElementById('logoutBtn')?.addEventListener('click',()=>{stop();wasVisible=false;},{capture:true});
    check();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
