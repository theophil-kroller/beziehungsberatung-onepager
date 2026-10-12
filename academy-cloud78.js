/* Academy 15.12.78: Cloud account identity, explicit module grants, safe progress mirror.
   Local-first: synchronisation only while authenticated; never store a bearer token persistently. */
(()=>{'use strict';
const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'https://beziehungsdynamiken-booking.theophil-kroller.workers.dev').replace(/\/$/,'');
const SESSION='bd_admin_session_v1';let account=null,online=false,revisions={},uploadTimers=new Map(),activeModule=null,activeKey=null,remoteLoadDone=false;
const MASTER_ID_TO_SKILL={alliance:'alliance',self:'self',perspective:'mental',boundaries:'limits',conflict:'safety',entitlement:'entitlement',affairs:'trust',grief:'grief',poly:'jealousy',safemastery:'safety'};
const MASTER_SKILLS=new Set(Object.keys(MASTER_ID_TO_SKILL));
const token=()=>sessionStorage.getItem(SESSION)||'';
async function call(path,body){if(!token())throw Error('Bitte zuerst im Praxis-Cockpit anmelden.');const r=await fetch(API+'/admin/academy/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token(),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify((path==='progress'||path==='review')?{...body,epoch:account?.epoch??0}:body):undefined,cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Object.assign(Error(d.error||'Academy-Cloud nicht erreichbar.'),{status:r.status,data:d});return d;}
function showStatus(text){document.dispatchEvent(new CustomEvent('bd:academy-cloud-status',{detail:{text,account}}));let s=document.getElementById('bd78CloudState');if(s)s.textContent=text;}
function moduleByURL(){let p=location.pathname.toLowerCase();if(p.includes('deida-trainer'))return 'deida';if(p.includes('gottman-trainer'))return 'gottman';if(p.includes('between-trainer'))return 'between';if(p.includes('gross-trainer'))return 'gross';if(p.includes('bindungsstile-trainer'))return 'binding';if(p.includes('mastery-trainer'))return 'mastery';return null;}
function keyFor(module){if(module==='deida')return 'bd-deida77-'+(account?.role==='owner'?'ich':'partnerin');if(module==='gottman')return 'bd-gottman76-'+(account?.role==='owner'?'ich':'partnerin');if(module==='between')return 'bd-between75-v1';if(module==='gross')return 'bd_gross_skill71_v1';if(module==='mastery'||['alliance','self','perspective','boundaries','conflict','entitlement','affairs','grief','poly','safemastery'].includes(module))return 'bd-mastery72-v1';return 'bd-binding78-state';}
function actualModule(){if(activeModule!=='mastery')return activeModule;const skill=new URLSearchParams(location.search).get('skill')||'alliance';const mapped={alliance:'alliance',self:'self',limits:'boundaries',mental:'perspective',trust:'affairs',jealousy:'poly',grief:'grief',safety:'safemastery',entitlement:'entitlement'};return mapped[skill]||'alliance';}
function blockModule(){const box=document.createElement('div');box.id='bd78AccessLock';box.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(17,19,39,.97);display:flex;align-items:center;justify-content:center;padding:20px;color:#f8e8df;font:16px system-ui';box.innerHTML='<section style="max-width:430px;text-align:center"><div style="font-size:46px">🔒</div><h2>Modul noch nicht freigeschaltet</h2><p>Du kannst diesen Planeten erkunden. Der Owner kann dir dieses Modul unter „Academy-Freigaben“ aktivieren.</p><a href="academy-journey15-12-74.html" style="color:#ffd0ae">Zur Planetenübersicht →</a></section>';document.body.append(box);}
function join(a,b){if(!b)return a;if(!a)return b;if(typeof a!=='object'||typeof b!=='object')return a;const r={...b,...a};r.level=Math.max(Number(a.level||1),Number(b.level||1));r.xp=Math.max(Number(a.xp||0),Number(b.xp||0));for(const field of ['skills','levels','stars']){if(a[field]||b[field]){r[field]={...(b[field]||{}),...(a[field]||{})};for(const k of Object.keys(b[field]||{})){const x=a[field]?.[k],y=b[field][k];if(!x)continue;const z={...y,...x};for(const sub of ['completed','episodes'])if(Array.isArray(x[sub])||Array.isArray(y[sub])){const map=new Map();for(const o of [...(y[sub]||[]),...(x[sub]||[])])map.set(JSON.stringify(o?.caseId||o?.id||o),o);z[sub]=[...map.values()]};r[field][k]=z}}}
 if(Array.isArray(a.history)||Array.isArray(b.history)){const m=new Map();for(const h of [...(b.history||[]),...(a.history||[])])m.set(JSON.stringify(h),h);r.history=[...m.values()].slice(-1100)}return r;}
async function syncNow(module=activeModule,key=activeKey,restore=false){if(!online||!module||!key)return;const id=module==='mastery'?actualModule():module;if(!account.grants?.[id])return;const remote=await call('progress?module='+encodeURIComponent(id));revisions[id]=remote.revision;const epochKey='bd78-account-epoch-'+account.practiceId+'-'+account.userId;const prevEpoch=Number(localStorage.getItem(epochKey)||0);if(remote.epoch>prevEpoch){localStorage.setItem(epochKey,String(remote.epoch));if(localStorage.getItem(key)){localStorage.setItem('bd78-reset-backup-'+id+'-'+Date.now(),localStorage.getItem(key));localStorage.removeItem(key);}showStatus('Lernstand wurde zurückgesetzt · Seite wird neu geladen');location.reload();return;}localStorage.setItem(epochKey,String(remote.epoch||0));const tomb=remote.state?.__deleted;const localWrite=Number(localStorage.getItem('bd78-write-'+id)||0);if(tomb&&(!localWrite||localWrite<=Date.parse(remote.state.deletedAt||0))){
   const existing=localStorage.getItem(key);
   if(existing&&module==='mastery'&&MASTER_SKILLS.has(id)){
    try{const parsed=JSON.parse(existing),skill=MASTER_ID_TO_SKILL[id];if(parsed?.skills&&Object.prototype.hasOwnProperty.call(parsed.skills,skill)){
      localStorage.setItem('bd78-reset-backup-'+id+'-'+Date.now(),existing);delete parsed.skills[skill];localStorage.setItem(key,JSON.stringify(parsed));location.reload();
    }}catch{}return;
   }
   if(existing){localStorage.setItem('bd78-reset-backup-'+id+'-'+Date.now(),existing);localStorage.removeItem(key);location.reload();}
   return;
  }const stored=localStorage.getItem(key);let local;try{local=stored?JSON.parse(stored):null}catch{local=null}const combined=join(local,tomb?null:remote.state);
 if(!combined)return;
 if(restore||(!stored&&remote.state)){localStorage.setItem(key,JSON.stringify(combined));showStatus('Lernstand wiederhergestellt · Seite neu laden');if(!remoteLoadDone){remoteLoadDone=true;const marker='bd78-restored-'+id;if(sessionStorage.getItem(marker)!=='1'){sessionStorage.setItem(marker,'1');location.reload()}}return}
 if(JSON.stringify(combined)!==JSON.stringify(remote.state)){
  const isolate=state=>module==='mastery'&&MASTER_SKILLS.has(id)?{schema:1,skills:{[MASTER_ID_TO_SKILL[id]]:state.skills?.[MASTER_ID_TO_SKILL[id]]||{level:1,stars:{},history:[]}},xp:Number(state.xp||0),created:state.created}:state;
  try{const sent=await call('progress',{module:id,baseRevision:remote.revision,epoch:remote.epoch||0,state:isolate(combined)});revisions[id]=sent.revision;showStatus('Cloud-Lernstand gesichert');}catch(e){if(e.status===409&&e.data?.state){const merged=join(combined,e.data?.state);const sent=await call('progress',{module:id,baseRevision:e.data.revision,epoch:remote.epoch||0,state:isolate(merged)});revisions[id]=sent.revision;showStatus('Lernstände zusammengeführt')}}
 }
}
function onSaved(module,key){if(!online||!account)return;const id=module==='mastery'?actualModule():module;localStorage.setItem('bd78-write-'+id,String(Date.now()));if(!account.grants[id])return;const timer=uploadTimers.get(id);if(timer)clearTimeout(timer);uploadTimers.set(id,setTimeout(()=>syncNow(module,key).catch(e=>showStatus('Lokal gespeichert · Cloud später prüfen: '+e.message)),700));}
async function init(){activeModule=moduleByURL();activeKey=activeModule?keyFor(activeModule):null;
 if(!token()){showStatus('Nur lokal · für Cloud-Sync im Cockpit anmelden');document.dispatchEvent(new Event('bd:academy-cloud-ready'));return null}
 try{account=await call('bootstrap');const epochKey='bd-academy78-epoch-u'+account.userId;const previous=localStorage.getItem(epochKey);if(previous!==null && Number(previous)!==Number(account.epoch||0)){for(const k of ['bd-deida77-ich','bd-deida77-partnerin','bd-gottman76-ich','bd-gottman76-partnerin','bd-between75-v1','bd_gross_skill71_v1','bd_binding_game_xp_v2','bd-mastery72-v1'])localStorage.removeItem(k);localStorage.removeItem('bd-academy-muscle78-v1');localStorage.removeItem('bd-academy-muscle78-v1-u'+account.userId);sessionStorage.removeItem('bd78-restored-deida');sessionStorage.removeItem('bd78-restored-gottman');}localStorage.setItem(epochKey,String(account.epoch||0));online=true;showStatus('Cloud verbunden · '+(account.role==='owner'?'Owner': 'eigenes Lernkonto'));
  if(activeModule&&account.grants?.[actualModule()]===false)blockModule();
  else if(activeModule){
   // Signed-in accounts must not accidentally write into the other learner's display profile.
   const id=activeModule==='deida'?'diProfile':activeModule==='gottman'?'gmProfile':null;
   if(id){const select=document.getElementById(id);if(select){select.value=account.role==='owner'?'ich':'partnerin';select.dispatchEvent(new Event('change',{bubbles:true}));select.disabled=true;select.title='Lernstand ist dem angemeldeten Praxisaccount zugeordnet';}}
   syncNow(activeModule,activeKey).catch(e=>showStatus('Lokal verfügbar · Sync: '+e.message));
  }
  document.dispatchEvent(new CustomEvent('bd:academy-cloud-ready',{detail:account}));return account;
 }catch(e){showStatus('Nur lokal · '+e.message);document.dispatchEvent(new Event('bd:academy-cloud-ready'));return null}}
async function reset(module='all'){
 if(!online)throw Error('Für Cloud-Reset bitte im Cockpit anmelden.');
 await call('reset',{module,confirm:'RESET'});
 for(const timer of uploadTimers.values())clearTimeout(timer);uploadTimers.clear();
 if(module==='all'){
  for(const k of ['bd-deida77-ich','bd-deida77-partnerin','bd-gottman76-ich','bd-gottman76-partnerin','bd-between75-v1','bd_gross_skill71_v1','bd_binding_game_xp_v2','bd_binding_game_settings_v2','bd_bindung_skill_v1','bd-binding78-state','bd-mastery72-v1'])localStorage.removeItem(k);
  localStorage.removeItem('bd-academy-muscle78-v1-u'+account.userId);
 }else if(MASTER_SKILLS.has(module)){
  // Each Mastery skill shares one local store. Delete only that skill, not its siblings.
  const key='bd-mastery72-v1',raw=localStorage.getItem(key);
  if(raw){try{const value=JSON.parse(raw);if(value?.skills){localStorage.setItem('bd78-reset-backup-'+module+'-'+Date.now(),raw);delete value.skills[MASTER_ID_TO_SKILL[module]];localStorage.setItem(key,JSON.stringify(value));}}catch{}}
 }else{
  const entries={deida:['bd-deida77-ich','bd-deida77-partnerin'],gottman:['bd-gottman76-ich','bd-gottman76-partnerin'],between:['bd-between75-v1'],gross:['bd_gross_skill71_v1'],binding:['bd_binding_game_xp_v2','bd_binding_game_settings_v2','bd_bindung_skill_v1','bd-binding78-state']};
  for(const key of entries[module]||[])localStorage.removeItem(key);
 }
 localStorage.removeItem('bd78-write-'+module);
 account=await call('bootstrap');
 localStorage.setItem('bd-academy78-epoch-u'+account.userId,String(account.epoch||0));
 localStorage.setItem('bd78-account-epoch-'+account.practiceId+'-'+account.userId,String(account.epoch||0));
 document.dispatchEvent(new CustomEvent('bd:academy-reset',{detail:{module}}));
 return true;
}
window.BDCloud78={init,call,onSaved,reset,syncNow,get account(){return account},get online(){return online},get grants(){return account?.grants||null},keyFor,moduleByURL,actualModule};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
