/* 15.12.117.1: make long dialogs navigable inside cockpit Academy iframe. */
(()=>{'use strict';
 const left=document.querySelector('.ga-case'),right=document.querySelector('.ga-task');
 if(!left||!right)return;
 let actions=left.querySelector('.bd118-scene-actions');
 if(!actions){
   actions=document.createElement('div');actions.className='bd118-scene-actions';
   const go=document.createElement('button');go.className='bd118-jump';go.type='button';go.textContent='Zur Entscheidung →';
   go.addEventListener('click',()=>{right.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
   actions.appendChild(go);left.appendChild(actions);
 }
 const recalc=()=>{
   const room=window.innerHeight-24;
   const taskHeight=right.getBoundingClientRect().height;
   // Avoid sticky cards whose lower controls would be offscreen.
   right.classList.toggle('bd118-sticky',innerWidth>=900&&taskHeight<=room&&room>410);
 };
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(recalc).observe(right);
 window.addEventListener('resize',recalc,{passive:true});
 recalc();
})();
