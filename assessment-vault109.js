(()=>{'use strict';
// 15.12.110.3 - assessment client: no silent conversion of API failures into "Vault locked".
const BASE='http://127.0.0.1:47831', STORE='bd_vault_token_v1';
let token='';
try { token=sessionStorage.getItem(STORE)||''; } catch(_) {}
function setToken(t){token=t||'';try{ if(token)sessionStorage.setItem(STORE,token);else sessionStorage.removeItem(STORE); }catch(_){}}
async function call(path,body){
 const opts={cache:'no-store',headers:{}};
 if(token)opts.headers.Authorization='Bearer '+token;
 if(body!==undefined){opts.method='POST';opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(body);}
 let r;
 try{r=await fetch(BASE+path,opts);}catch(_){throw Error('Lokaler Vault-Dienst unter 127.0.0.1:47831 nicht erreichbar. Bitte Dienst starten und Verbindung erneut prüfen.');}
 const data=await r.json().catch(()=>({error:'Ungültige Antwort des lokalen Vault-Dienstes.'}));
 if(r.status===401)setToken('');
 if(!r.ok||data.ok===false){
  const err=new Error(data.error||('Vault-Anfrage fehlgeschlagen (HTTP '+r.status+').'));
  err.status=r.status;err.path=path;throw err;
 }
 return data;
}
async function healthCheck(){
 let response;
 try{response=await fetch(BASE+'/health',{cache:'no-store'});}catch(_){throw Error('Lokaler Vault-Dienst nicht erreichbar. Bitte auf diesem Computer den Vault-Dienst starten.');}
 let h=await response.json().catch(()=>null);
 if(!response.ok||!h?.ok)throw Error('Der lokale Vault-Dienst liefert keinen gültigen Gesundheitsstatus.');
 if(!h.assessmentEngine)throw Error('Der laufende lokale Vault-Dienst hat keine Assessment-Engine. Bitte die aktualisierte Vault-Anwendung starten – die Website-Patches allein genügen nicht.');
 if(!h.setup)throw Error('Der lokale Vault ist noch nicht eingerichtet. Bitte zuerst im Praxis-Dashboard einrichten.');
 return h;
}
function interpretError(err){
 if(err.status===404)throw Error('Der lokale Vault-Dienst kennt den Assessment-Endpunkt noch nicht (HTTP 404). Bitte den aktualisierten Vault-Dienst vollständig neu starten.');
 if(err.status===500)throw Error('Der Assessment-Endpunkt meldet einen internen Fehler (HTTP 500): '+err.message+' Bitte prüfe, ob die lokale Assessment-Migration erfolgt ist.');
 if(err.status===403)throw Error('Der lokale Vault verweigert den Assessment-Zugriff (HTTP 403): '+err.message);
 throw err;
}
async function ensureUnlocked(){
 const h=await healthCheck();
 if(token){
   try{await call('/assessments/catalog');return true;}
   catch(err){
     if(err.status!==401 && err.message!=='vault locked')interpretError(err);
     // Expired or replaced token: show the local unlock dialog, not a generic lock message.
   }
 }
 const granted=await unlockDialog(h.unlocked);
 if(!granted)return false;
 try{await call('/assessments/catalog');return true;}
 catch(err){interpretError(err);}
}
function unlockDialog(alreadyUnlocked){return new Promise(resolve=>{
 const dlg=document.createElement('dialog');dlg.className='as-unlock';
 const explanation=alreadyUnlocked
   ? 'Der Vault ist bereits entsperrt, aber dieser Browser-Tab besitzt keinen gültigen Zugriffsschlüssel. Öffne Assessments alternativ aus demselben Tab wie das Praxis-Dashboard. Bei erneutem Entsperren wird der bestehende Vault-Zugriffsschlüssel ersetzt.'
   : 'Das Passwort wird ausschließlich an den lokalen Vault-Dienst auf diesem Computer gesendet.';
 dlg.innerHTML='<form method="dialog" class="as-card"><h2>Vault für Assessments verbinden</h2><p class="as-muted">'+explanation+'</p><label>Vault-Passwort<input type="password" name="password" autocomplete="current-password" required></label><p class="as-unlock-status" role="alert"></p><div class="as-actions"><button type="button" data-cancel>Abbrechen</button><button type="submit" data-unlock>Verbinden</button></div></form>';
 document.body.appendChild(dlg);dlg.showModal();
 let done=false;
 function finish(ok){if(done)return;done=true;dlg.close();dlg.remove();resolve(ok);}
 dlg.querySelector('[data-cancel]').addEventListener('click',()=>finish(false));
 dlg.addEventListener('cancel',e=>{e.preventDefault();finish(false)});
 dlg.querySelector('form').addEventListener('submit',async e=>{
   e.preventDefault();const btn=dlg.querySelector('[data-unlock]');btn.disabled=true;
   const pass=dlg.querySelector('[name=password]').value;
   try{const r=await call('/unlock',{password:pass});
     if(!r.token)throw Error('Der Vault hat keinen gültigen Zugriffsschlüssel geliefert.');
     setToken(r.token);dlg.querySelector('[name=password]').value='';finish(true);
   }catch(err){dlg.querySelector('.as-unlock-status').textContent=err.message;}
   finally{btn.disabled=false;}
 });
 dlg.querySelector('[name=password]').focus();
});}
window.BDVault={ensureUnlocked,checkHealth:healthCheck,request:path=>call(path),post:(path,body)=>call(path,body),download:async path=>{
 let response;
 try{response=await fetch(BASE+path,{cache:'no-store',headers:token?{Authorization:'Bearer '+token}:{}});}catch(_){throw Error('Lokaler Vault-Dienst nicht erreichbar.');}
 if(response.status===401)setToken('');
 if(!response.ok){const err=await response.json().catch(()=>({}));throw Error(err.error||'PDF-Export fehlgeschlagen');}
 return response.blob();
},status:()=>({unlocked:!!token})};
})();
