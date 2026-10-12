/* Shared navigation across the already existing three independent exercise engines.
   Never migrates/overwrites their saved learning states. */
(()=>{'use strict';
 const here=location.pathname.split('/').pop();const isMastery=here.startsWith('mastery-');
 const isGross=here.startsWith('gross-');const isBinding=here.startsWith('bindungsstile-');
 if(!isMastery&&!isGross&&!isBinding)return;
 const back=document.createElement('a');back.className='academy-back73';back.href='academy-journey15-12-73.html#journeyMap';back.textContent='← Journey';back.title='Zur gemeinsamen Trainingslandkarte';
 const voice=document.createElement('button');voice.type='button';voice.className='academy-voice73';voice.textContent='◖ Stimmen';voice.addEventListener('click',()=>window.BDVoice73?.showManager());
 const info=document.createElement('span');info.className='academy-module-label73';info.textContent=isMastery?'SKILL MASTERY':isGross?'EMOTIONSREGULATION':'BINDUNGSSTILE';
 if(isMastery){const nav=document.querySelector('.quick-links');if(nav){nav.querySelectorAll('a[href*="gross"],a[href*="bindungs"]')?.forEach(e=>e.remove());nav.prepend(back);nav.insertBefore(voice,nav.querySelector('#rosterOpen'))}
  const ladder=document.querySelector('.ladder');if(ladder){ladder.classList.add('academy-collapsed');const btn=document.createElement('button');btn.className='academy-level-trigger';btn.type='button';btn.id='academyLevelToggle';btn.setAttribute('aria-expanded','false');btn.innerHTML='<span>◈ &nbsp; Dein Levelweg</span><span id="academyLevelTriggerHint">20 Level · progressiv</span><span class="trigger-arrow">⌄</span>';btn.addEventListener('click',()=>{ladder.classList.toggle('academy-collapsed');btn.setAttribute('aria-expanded',String(!ladder.classList.contains('academy-collapsed')))});ladder.parentElement.insertBefore(btn,ladder)}
 }else if(isGross){const parent=document.querySelector('.g-top');parent?.prepend(back);parent?.querySelectorAll('a.g-back[href*="bindungs"],a.g-back[href*="mastery"]')?.forEach(e=>e.remove());const right=parent?.querySelector('.g-headright');right?.prepend(voice)}else{const top=document.querySelector('.top');top?.prepend(back);top?.querySelectorAll('a.package-link[href*="gross"],a.package-link[href*="mastery"]')?.forEach(e=>e.remove());top?.querySelector('.tools')?.prepend(voice)}
 const layer=document.createElement('div');layer.className='academy-return-float';layer.innerHTML='<a href="academy-journey15-12-73.html#journeyMap" aria-label="Zur Academy Journey">⌘ <span>Journey</span></a>';document.body.append(layer);
 // Announce return navigation and stop any browser voice when leaving.
 window.addEventListener('pagehide',()=>{try{speechSynthesis.cancel()}catch{}});
})();
