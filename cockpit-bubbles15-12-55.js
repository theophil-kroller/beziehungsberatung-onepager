/* Beziehungsdynamiken 15.12.55e — 5 s quiet cockpit welcome.
 * Watch the bubbles drift, then pop in a short sequence. The game is separate.
 * Offline-only canvas effect. No cloud calls, no new permissions, no user data.
 */
(()=>{'use strict';
  const FREE_DURATION_SEC=7.2;
  const FORM_DURATION_SEC=14.4;
  const FORM_HOLD_SEC=7.0;
  const FREE_FINALE_SEC=4.2;
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
    // No dashboard click handlers to remove.
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
  const FORMATIONS=['heart','free','star','moon','sun','cloud'];
  let formationVisit=0;
  try{formationVisit=Number(sessionStorage.getItem('bd1558_cockpit_formation')||0)||0}catch{}
  // The sequence is intentional: a recognizable new silhouette on each dashboard visit.
  function formationPoints(name,w,h){
    const count=name==='sun'?38:30,points=[];
    const cx=w*.51,cy=h*.40,sx=Math.min(w*.27,210),sy=Math.min(h*.30,155);
    for(let i=0;i<count;i++){
      const t=i/count,a=t*TAU;
      let x=0,y=0;
      if(name==='heart'){
        x=16*Math.pow(Math.sin(a),3)/18;
        y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/18;
      }else if(name==='star'){
        const seg=t*10,k=Math.floor(seg),f=seg-k;
        const corner=j=>{const radius=j%2===0?1:.43,ang=j*TAU/10-Math.PI/2;return {x:Math.cos(ang)*radius,y:Math.sin(ang)*radius}};
        const q=corner(k),r=corner((k+1)%10);x=q.x+(r.x-q.x)*f;y=q.y+(r.y-q.y)*f;
      }else if(name==='moon'){
        const p=t<.53?t/.53:(t-.53)/.47;
        x=.26-(t<.53?.96:.23)*Math.sin(Math.PI*p);
        y=t<.53?-1+2*p:1-2*p;
      }else if(name==='sun'){
        if(i<24){const ringAngle=i*TAU/24;x=Math.cos(ringAngle)*.55;y=Math.sin(ringAngle)*.55;}
        else{const q=(i-24)/14*TAU;x=Math.cos(q)*(i%2?.90:1.03);y=Math.sin(q)*(i%2?.90:1.03);}
      }else if(name==='cloud'){
        // Two overlapping puffs that drift across the cockpit as a gentle cloudbank.
        const j=i%15,cl=Math.floor(i/15),ang=j*TAU/15;
        const r=cl===0?.6:.48;
        x=(cl===0?-.39:.4)+Math.cos(ang)*r;
        y=(cl===0?.12:-.10)+Math.sin(ang)*(cl===0?.42:.45);
      }
      points.push({x:cx+x*sx,y:cy+y*sy});
    }
    return points;
  }
  function position(b,t,scene){
    const age=t-b.born;
    const drift=age;
    const x=b.x+b.vx*drift+Math.sin(age*b.freqX*TAU+b.phase)*b.swayX+(scene.formation==='cloud'?age*16:0);
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
    const popDuration=e.slow?1.12:.78;
    if(age<0||age>popDuration)return false;
    const v=age/popDuration,alpha=(1-v)*fade;
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
      bubbles:[],pops:[],remaining:0,lastFrame:0,start:0,pausedFor:0,hiddenAt:0,
      time:0,finaleScheduled:false,clickBubble:null};
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
    function burst(b,t,replace=false){
      if(b.dead||t<b.born)return false;
      const p=position(b,t,scene);
      b.dead=true;
      scene.pops.push({x:p.x,y:p.y,r:b.r,tone:b.tone,phase:b.phase,born:t,slow:scene.formation!=='free'});
      // A clicked bubble can be replaced gently until the finale begins.
      if(replace&&!scene.finaleScheduled&&t<2.5){
        scene.bubbles.push(bubble(scene.width,scene.height,t+random(.8,1.7)));
      }
      return true;
    }
    scene.clickBubble=event=>{
      if(!current||current!==scene||scene.stopped||!visibleCockpit())return;
      if(event.defaultPrevented||event.button!==0||reduceMotion())return;
      // Never hijack a dashboard control. The canvas is pointer-transparent.
      if(event.target?.closest?.('a,button,input,textarea,select,label,[role="button"],[contenteditable="true"]'))return;
      const rect=canvas.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0)return;
      const x=(event.clientX-rect.left)*scene.width/rect.width;
      const y=(event.clientY-rect.top)*scene.height/rect.height;
      if(x<0||y<0||x>scene.width||y>scene.height)return;
      const t=scene.time;
      let hit=null,best=Infinity;
      for(const b of scene.bubbles){
        if(b.dead||t<b.born)continue;
        const p=position(b,t,scene),age=t-b.born;
        const r=b.r*(1+Math.sin(age*b.breathe*TAU+b.breathPhase)*.115);
        const d=Math.hypot(x-p.x,y-p.y);
        if(d<=r*1.05&&d<best){best=d;hit=b;}
      }
      if(hit)burst(hit,t,true);
    };
    // Dashboard greeting remains non-interactive. Game clicks belong exclusively to the overlay.
    for(let i=0;i<13;i++)scene.bubbles.push(bubble(scene.width,scene.height,-random(0,1.8)));
    // Silhouettes are drawn by many individual bubbles, not a background image.
    scene.formation=FORMATIONS[formationVisit++ % FORMATIONS.length];
    const slowForm=scene.formation!=='free';
    const duration=slowForm?FORM_DURATION_SEC:FREE_DURATION_SEC;
    const finaleStart=slowForm?FORM_HOLD_SEC:FREE_FINALE_SEC;
    try{sessionStorage.setItem('bd1558_cockpit_formation',String(formationVisit))}catch{}
    if(scene.formation!=='free'){
      const pts=formationPoints(scene.formation,scene.width,scene.height);
      scene.bubbles=pts.map((pt,i)=>{
        const b=bubble(scene.width,scene.height,0);
        b.x=pt.x;b.y=pt.y;b.r=random(9,18);
        b.vx=random(-1.8,1.8);b.vy=random(-1.8,1.8);
        b.swayX=random(2.5,7);b.swayY=random(2.5,7);
        b.born=-.25;b.pops=false;b.popAt=10;
        return b;
      });
    }
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
      scene.time=time;
      // Fade IN only. At the END, all remaining bubbles burst; none fade away.
      const fade=clamp(time/.65,0,1);
      ctx.clearRect(0,0,scene.width,scene.height);
      if(time>=duration){stop();return;}
      if(time>=finaleStart&&!scene.finaleScheduled){
        scene.finaleScheduled=true;
        const alive=scene.bubbles.filter(b=>!b.dead&&time>=b.born);
        // A clearly readable silhouette first, then a staggered pop cascade with room to enjoy each burst.
        alive.sort((a,b)=>position(a,time,scene).x-position(b,time,scene).x);
        alive.forEach((b,i)=>{
          b.endPopAt=finaleStart+.12+(alive.length===1?0:i/(alive.length-1)*(slowForm?5.35:1.95));
        });
      }
      for(const b of scene.bubbles){
        if(b.dead)continue;
        if((b.endPopAt!==undefined&&time>=b.endPopAt)|| (b.pops&&time>=b.popAt)){
          burst(b,time,!scene.finaleScheduled);
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
