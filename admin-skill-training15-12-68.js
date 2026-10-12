/* Build 15.12.68 – dedicated cockpit entry for the attachment skill game.
   Never accesses client data, local vault, capture pairing or Cloudflare. */
(()=>{'use strict';
 const btn=document.getElementById('bd168CockpitTraining');
 if(!btn)return;
 let dlg=null,frame=null;
 const trainUrl='bindungsstile-trainer15-12-71.html';
 function makeDialog(){
   if(dlg)return;
   dlg=document.createElement('dialog');dlg.id='bd168CockpitTrainerDialog';
   dlg.className='bd168-training-dialog';dlg.setAttribute('aria-labelledby','bd168CockpitTrainerTitle');
   dlg.innerHTML='<div class="bd168-training-shell"><header class="bd168-training-head"><strong id="bd168CockpitTrainerTitle">🧠 Skill Lab · Beziehungsdynamiken</strong><button type="button" class="bd168-training-close" aria-label="Training schließen">×</button></header><iframe class="bd168-training-frame" title="Beziehungsdynamiken Skill Lab" referrerpolicy="same-origin" allow="autoplay"></iframe></div>';
   document.body.appendChild(dlg);
   frame=dlg.querySelector('iframe');
   dlg.querySelector('.bd168-training-close').addEventListener('click',()=>dlg.close());
   dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
   dlg.addEventListener('close',()=>{
     frame.removeAttribute('src'); // stop browser voice; local training state persists
     btn.focus({preventScroll:true});
   });
 }
 btn.addEventListener('click',()=>{
   if(!document.getElementById('appShell')?.classList.contains('hidden')){
     makeDialog();if(!dlg.open){frame.src=trainUrl;dlg.showModal();}
   }
 });
})();
