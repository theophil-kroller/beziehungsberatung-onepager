/* Beziehungsdynamiken Academy · Local reflection coach v15.12.115.
   Only local Vault + LM Studio. No assessment / clients / cloud model data.
   Does not participate in grading, leveling, scoring or progress storage. */
(()=>{'use strict';
const API='http://127.0.0.1:47831';
const KEY='bd_vault_token_v1';
const $=id=>document.getElementById(id);
const decisions=[];
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function recordDecision(x){
  if(!x||!x.pick||!x.best||!Number.isInteger(x.grade))return;
  // Stored in memory only, never sent to cloud or written to persistent storage.
  decisions.push({topic:String(x.topic||'').slice(0,80),grade:x.grade,
    choice:String(x.pick.text||'').slice(0,190),best:String(x.best.text||'').slice(0,190),
    rationale:String(x.explanation||'').slice(0,260),signal:String(x.signal||'').slice(0,130)});
  if(decisions.length>90)decisions.splice(0,decisions.length-90);
}
function auth(){try{return sessionStorage.getItem(KEY)||''}catch(_){return ''}}
async function request(path,body,ms=15000){
  const t=auth();if(!t)throw Error('Vault derzeit nicht entsperrt.');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);
  try{
    const res=await fetch(API+path,{method:body===undefined?'GET':'POST',cache:'no-store',signal:controller.signal,
      headers:{'Authorization':'Bearer '+t,...(body===undefined?{}:{'Content-Type':'application/json'})},
      ...(body===undefined?{}:{body:JSON.stringify(body)})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||data.ok===false)throw Error(String(data.error||'Lokale KI nicht erreichbar.'));
    return data;
  }finally{clearTimeout(timer)}
}
function make(){
 let dlg=$('bd115Dialog');if(dlg)return dlg;
 dlg=document.createElement('dialog');dlg.className='bd115-dialog';dlg.id='bd115Dialog';
 dlg.innerHTML='<div class="bd115-content"><div class="bd115-eyebrow">ACADEMY · LERNREFLEXION</div><h2>Dein Level ist abgeschlossen.</h2><p class="bd115-intro">Die fachliche Bewertung steht bereits fest. Dein lokales KI-Modell kann zusätzlich <strong>einen gezielten Lernimpuls</strong> aus den letzten Übungsentscheidungen ableiten.</p><p class="bd115-privacy">Nur fiktive Trainingsentscheidungen · Nur an deinen lokalen Vault · Keine Klientendaten · Keine neue Bewertung</p><p class="bd115-state" id="bd115State" aria-live="polite"></p><div id="bd115Result" class="bd115-result" hidden></div><div class="bd115-actions"><button type="button" class="bd115-skip" data-close>Später</button><button type="button" class="bd115-start" data-reflect>Reflexion starten</button></div></div>';
 document.body.append(dlg);
 dlg.querySelector('[data-close]').addEventListener('click',()=>dlg.close());
 dlg.addEventListener('cancel',e=>{e.preventDefault();dlg.close()});
 return dlg;
}
let busy=false;
let pending=null;
async function levelCompleted({level,module}){
 if(!module||!Number.isInteger(level)||decisions.length<1)return;
 // No UI whatsoever unless a local already-unlocked Vault and loaded local model are available.
 let status;
 try{status=await request('/academy/coach/status',undefined,12000)}catch(_){return}
 if(!status.available||status.localOnly!==true)return;
 const picks=[...decisions].sort((a,b)=>a.grade-b.grade).slice(0,3);
 decisions.length=0;
 pending={level,module,decisions:picks};
 const dlg=make(),s=$('bd115State'),output=$('bd115Result');
 output.replaceChildren();output.hidden=true;s.textContent='Lokales Modell verfügbar · '+String(status.model||'LM Studio');
 dlg.querySelector('h2').textContent='Level '+level+' geschafft.';
 const btn=dlg.querySelector('[data-reflect]');btn.disabled=false;btn.textContent='Reflexion starten';
 btn.onclick=async()=>{
  if(busy||!pending)return;busy=true;btn.disabled=true;s.textContent='Dein lokales Modell formuliert einen Lernimpuls …';
  try{
   const response=await request('/academy/coach/reflect',pending,150000);
   output.textContent=response.feedback||'Keine Reflexion erhalten.';
   output.hidden=false;s.textContent='Reflexion abgeschlossen · '+String(response.model||'lokales Modell');
  }catch(e){s.textContent=String(e?.name==='AbortError'?'Das lokale Modell hat zu lange gebraucht. Die normale Auswertung bleibt erhalten.':e.message||e).slice(0,190);btn.disabled=false;}
  finally{busy=false}
 };
 try{dlg.showModal()}catch(_){ /* outside secure/top-level context */ }
}
window.BDAcademyCoach115={recordDecision,levelCompleted,version:'15.12.115'};
})();