(()=>{'use strict';
const $=id=>document.getElementById(id), cloud=()=>window.BDCloud78, registry=window.BDAcademy74;
const active=(registry?.worlds||[]).flatMap(w=>(w.methods||[]).filter(m=>m.status==='active').map(m=>({...m,world:w.title})));
const catalogue=new Map(active.map(m=>[m.id,m]));
const names=new Map(active.map(m=>[m.id,m.world+' · '+m.title]));
const fallback={binding:'Bindungsstile',alliance:'Beratungsallianz / professionelle Gesprächsführung'};
const recent=new Set(['talklab121','talklab-pairs','talklab-repair','rlt-skills119','rlt-skills120','gottmanintegration113']);
const state={bootstrap:null,members:[],render:null,loading:false};
function status(s){$('state').textContent=s;$('cloudStatus').textContent=s}
function setControls(enabled){for(const id of ['module','restore','reset'])$(id).disabled=!enabled;}
function stats(member){const items=(state.bootstrap?.modules||[]).filter(id=>id!=='mastery');const count=items.filter(id=>member.grants?.[id]===true).length;const e=$('grantSummary');if(e)e.textContent=count+' von '+items.length+' Modulen freigegeben · Änderungen werden sofort in der Cloud gespeichert.';}
function feedback(s){if($('grantFeedback'))$('grantFeedback').textContent=s}
function info(id){return catalogue.get(id)||{id,title:fallback[id]||id,world:'Weitere Trainingsmodule',status:'active'}}
function labelFor(id){return names.get(id)||fallback[id]||id}
function selectedMember(){return state.members.find(x=>String(x.userId)===$('member').value)}
function renderModules(){
 const member=selectedMember(),box=$('modules');box.replaceChildren();if(!member){box.textContent='Kein aktives Teammitglied ausgewählt.';const summary=$('grantSummary');if(summary)summary.textContent='Teammitglied auswählen, um die Freigaben zu bearbeiten.';return}stats(member);
 const query=$('moduleSearch').value.trim().toLocaleLowerCase('de'), filter=$('grantFilter').value;
 const modules=(state.bootstrap.modules||[]).filter(id=>id!=='mastery').filter(id=>{
  const it=info(id),granted=Boolean(member.grants?.[id]);
  if(filter==='new'&&!recent.has(id))return false;
  if(filter==='locked'&&granted)return false;
  if(filter==='granted'&&!granted)return false;
  return !query||(it.title+' '+it.world+' '+id).toLocaleLowerCase('de').includes(query);
 });
 if(!modules.length){box.textContent='Keine passenden Module. Filter ändern oder Suchbegriff löschen.';return}
 const groups=new Map();for(const id of modules){const it=info(id);if(!groups.has(it.world))groups.set(it.world,[]);groups.get(it.world).push(id)}
 for(const [world,ids] of groups){
  const group=document.createElement('section');group.className='academy-group';
  const heading=document.createElement('h3');heading.textContent=world+' · '+ids.length+' Module';group.append(heading);
  for(const id of ids){const it=info(id),row=document.createElement('label'),name=document.createElement('span'),cb=document.createElement('input');
   name.textContent=it.title;name.title=id;cb.type='checkbox';cb.checked=Boolean(member.grants?.[id]);cb.setAttribute('aria-label',it.title+' für '+member.displayName+' freigeben');
   if(recent.has(id)){const badge=document.createElement('small');badge.className='new-module';badge.textContent='NEU';name.append(badge)}
   cb.addEventListener('change',async()=>{
    const intended=cb.checked;cb.disabled=true;row.classList.add('busy');feedback('Speichere „'+it.title+'“ …');
    try{const result=await cloud().call('grant',{module:id,userId:member.userId,enabled:intended});
     if(result.module!==id||Number(result.userId)!==Number(member.userId)||Boolean(result.enabled)!==intended)throw Error('Unplausible Serverantwort. Freigaben neu laden.');member.grants[id]=Boolean(result.enabled);cb.checked=Boolean(result.enabled);stats(member);
     feedback('✓ Gespeichert: '+it.title+' für '+member.displayName+(cb.checked?' freigegeben.':' gesperrt.'));
    }catch(error){cb.checked=!intended;feedback('Nicht gespeichert: '+error.message)}
    finally{cb.disabled=false;row.classList.remove('busy')}
   });row.append(name,cb);group.append(row)
  }box.append(group)
 }
}
async function load(){
 const c=cloud(),token=sessionStorage.getItem('bd_admin_session_v1');
 if(state.loading)return;state.loading=true;$('reload').disabled=true;setControls(false);$('ownerTools').hidden=true;
 if(!token){state.bootstrap=null;state.members=[];status('Nicht angemeldet. Bitte zuerst im Praxis-Cockpit anmelden.');state.loading=false;$('reload').disabled=false;return}
 try{if(!c?.call)throw Error('Academy-Verbindung ist noch nicht bereit.');const a=await c.call('bootstrap');if(!a?.ok||!Array.isArray(a.modules)||!Array.isArray(a.members))throw Error('Ungültige Serverantwort.');state.bootstrap=a;setControls(true);
  status('Cloud verbunden · '+a.role+' · persönliches Konto '+a.userId);
  $('ownerTools').hidden=a.role!=='owner';$('module').replaceChildren(new Option('Alle Module','all'));
  a.modules.filter(id=>Boolean(c.keyFor(id))&&(a.role==='owner'||a.grants?.[id]===true)).forEach(id=>$('module').add(new Option(labelFor(id),id)));
  if(a.role==='owner'){
   state.members=a.members.filter(m=>m.systemRole!=='owner').map(m=>({...m,grants:{...m.grants}}));
   const sel=$('member'),keep=sel.value;sel.replaceChildren();
   state.members.forEach(m=>sel.add(new Option(m.displayName+' (ID '+m.userId+')',String(m.userId))));
   if(state.members.some(m=>String(m.userId)===keep))sel.value=keep;
   sel.onchange=()=>{feedback('');renderModules()};$('moduleSearch').oninput=renderModules;$('grantFilter').onchange=renderModules;
   renderModules();
   $('grantAll').onclick=async()=>{
    const member=selectedMember();if(!member)return;
    const ids=a.modules.filter(id=>id!=='mastery'&&!member.grants[id]);
    if(!ids.length){feedback('Alle Module sind bereits freigegeben.');return}
    if(!confirm('Wirklich sämtliche '+ids.length+' gesperrten Module für '+member.displayName+' freigeben?'))return;
    const btn=$('grantAll');const controls=[...$('ownerTools').querySelectorAll('input, select, button')];controls.forEach(el=>el.disabled=true);let completed=0,failed=[];
    try{for(const id of ids){try{const r=await c.call('grant',{module:id,userId:member.userId,enabled:true});member.grants[id]=Boolean(r.enabled);completed++}catch(e){failed.push(info(id).title+': '+e.message)}}
     feedback(completed+' Module freigegeben.'+(failed.length?' Fehler: '+failed.join('; '):''));renderModules();
    }finally{controls.forEach(el=>el.disabled=false);stats(member)}
   }
  }
 }catch(e){state.bootstrap=null;state.members=[];setControls(false);$('ownerTools').hidden=true;status('Cloud nicht verfügbar: '+e.message)}
 finally{state.loading=false;$('reload').disabled=false;}
}
$('reload').onclick=load;$('muscle').onclick=()=>window.BDMuscle78?.open();$('restore').onclick=async()=>{const m=$('module').value;if(m==='all'){status('Bitte ein einzelnes Modul für die Wiederherstellung auswählen.');return}try{const key=cloud()?.keyFor(m);if(!key)throw Error('Dieses Modul hat keinen unterstützten lokalen Lernstand.');const r=await cloud().call('progress?module='+encodeURIComponent(m));if(!r.state||r.state.__deleted===true){status('Für dieses Modul liegt noch kein Cloud-Lernstand vor.');return}if(localStorage.getItem(key)&&!confirm('Vorhandenen lokalen Lernstand mit dem Cloud-Lernstand ersetzen? Eine Sicherung wird lokal angelegt.'))return;const old=localStorage.getItem(key);if(old)localStorage.setItem('bd78-backup-'+m+'-'+Date.now(),old);const skills={alliance:'alliance',self:'self',perspective:'mental',boundaries:'limits',conflict:'safety',entitlement:'entitlement',affairs:'trust',grief:'grief',poly:'jealousy',safemastery:'safety'};
 if(skills[m]){
  let local={schema:1,skills:{},xp:0};try{local={...local,...JSON.parse(old||'{}')}}catch{}
  local.skills={...(local.skills||{})};
  if(r.state?.skills?.[skills[m]])local.skills[skills[m]]=r.state.skills[skills[m]];
  local.xp=Math.max(Number(local.xp||0),Number(r.state?.xp||0));
  localStorage.setItem(key,JSON.stringify(local));
 }else localStorage.setItem(key,JSON.stringify(r.state));
 status('Cloud-Lernstand wiederhergestellt. Bitte das Modul neu öffnen.')}catch(e){status('Wiederherstellung nicht möglich: '+e.message)}};
$('reset').onclick=async()=>{const m=$('module').value;const text=m==='all'?'WIRKLICH alle Academy-Lernstände und Wiederholungen löschen?':'WIRKLICH den Lernstand und Wiederholungen für dieses Modul löschen?';if(!confirm(text)||!confirm('Letzte Bestätigung: Der Cloud-Lernstand kann danach nicht wiederhergestellt werden.'))return;try{await cloud().reset(m);window.BDMuscle78?.clear(m);status('Lernstand gelöscht: '+m)}catch(e){status('Löschen fehlgeschlagen: '+e.message)}};
setControls(false);document.addEventListener('bd:academy-cloud-ready',load,{once:true});setTimeout(()=>{if(!state.bootstrap&&!state.loading)load()},900);
})();