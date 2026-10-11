/* Beziehungsdynamiken 15.12.50 — encrypted, two-way workspace method sync.
   Runs only in an authenticated, locally unlocked, visible desktop session.
   Does not copy drafts, clinical records, transcripts, or client notes. */
(()=>{'use strict';
 if(window.BDMethodSync)return;
 const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
 const key='bd_admin_session_v1';
 const INTERVAL=5*60*1000; const MAX_BACKOFF=30*60*1000;
 let active=null,lastAttempt=0,lastSuccess=0,lastError='',stopAuto=false,timeout=null,failedRuns=0,nextAttemptAt=0;
 const listeners=new Set();
 let state={status:'waiting',message:'Warte auf persönlichen Praxiszugang und entsperrten Vault.',received:0,sent:0,lastSuccess:0};
 function update(next){state={...state,...next};for(const l of listeners){try{l({...state})}catch(_){}}document.dispatchEvent(new CustomEvent('bd:method-sync-status',{detail:{...state}}));}
 function onStatus(cb){listeners.add(cb);cb({...state});return ()=>listeners.delete(cb)}
 function authenticated(){return !!(API&&sessionStorage.getItem(key));}
 async function api(path,options={}){
   const token=sessionStorage.getItem(key)||'';
   if(!token)throw new Error('Nicht angemeldet. Öffne die Praxisverwaltung und melde dich an.');
   const response=await fetch(API+path,{...options,headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json',...(options.headers||{})},cache:'no-store'});
   const x=await response.json().catch(()=>({}));
   if(!response.ok||x.ok===false){
     if(response.status===401)throw Error('Praxisanmeldung abgelaufen. Bitte erneut anmelden.');
     if(response.status===404&&path.startsWith('/admin/workspace/methods/'))throw Error('Cloud-Methodenabgleich nicht installiert: Worker 15.12.54 veröffentlichen.');
     if(/no such table/i.test(x.error||''))throw Error('Cloudflare D1: Migration 015_12_30_workspace_methods.sql fehlt.');
     throw Error(x.error||'Cloud-Verbindung fehlgeschlagen ('+response.status+').');
   }
   return x;
 }
 async function prerequisites(){
   if(!window.BDVault)throw Error('Lokaler Vault nicht verfügbar.');
   const h=await window.BDVault.checkHealth();
   if(!h?.ok)throw Error('Vault-Server läuft nicht. Bitte die Desktop-App starten.');
   if(!window.BDVault.status().unlocked)throw Error('Vault gesperrt. Bitte in der Praxisverwaltung entsperren.');
   if(!authenticated())throw Error('Praxisanmeldung fehlt. Im gleichen Desktop-Browser anmelden.');
   try{const local=await window.BDVault.request('/workspace/methods/status');
     const cloud=await api('/admin/workspace/methods/status');
     if(cloud.transport!=='workspace-methods-v1')throw Error('Cloud-Methodenabgleich hat eine unerwartete Version.');
     return local;}
   catch(e){if(/Workspace-Schlüssel|Workspace-Key|gemeinsamen Workspace/i.test(e.message||''))throw Error('Einmalige Workspace-Kopplung fehlt: In der Praxisverwaltung → Secure Vault den BDW1-Code des Owners einlösen.');throw e}
 }
 async function run({manual=false,urgent=false}={}){
   if(active)return active;
   if(!manual&&(stopAuto||document.hidden||Date.now()<nextAttemptAt||(!urgent&&Date.now()-lastAttempt<60000)))return state;
   lastAttempt=Date.now();
   const work=(async()=>{
     update({status:'running',message:'Verschlüsselte Methoden werden abgeglichen …'});
     let received=0,sent=0,skipped=0,cursor=0;
     try{
       const local=await prerequisites();cursor=Number(local.cursor||0);
       // Inbound first: never overwrite an unacknowledged local change silently.
       for(let p=0;p<200;p++){
         const remote=await api('/admin/workspace/methods/delta?cursor='+encodeURIComponent(cursor)+'&workspaceKeyId='+encodeURIComponent(local.workspaceKeyId));
         if(!remote.items?.length)break;
         const result=await window.BDVault.post('/workspace/methods/apply',{workspaceKeyId:local.workspaceKeyId,items:remote.items});
         received+=Number(result.applied||0);skipped+=Number(result.skipped||0);
         cursor=Number(result.cursor||cursor);
         if(result.conflicts?.length){
           const error=new Error(`Bearbeitungskonflikt bei Methode ${result.conflicts[0].methodId}: Bitte manuell prüfen. Keine Daten überschrieben.`);
           error.conflict=true;throw error;
         }
         if(!remote.hasMore)break;
         if(p===199)throw Error('Zu viele offene Änderungen. Bitte den Abgleich erneut starten.');
       }
       // Outgoing batches, only confirmed local templates. The Vault encrypts before upload.
       for(let b=0;b<200;b++){
         const pending=await window.BDVault.request('/workspace/methods/outgoing');
         if(!pending.items?.length)break;
         const pushed=await api('/admin/workspace/methods/push',{method:'POST',body:JSON.stringify({workspaceKeyId:pending.workspaceKeyId,items:pending.items})});
         const confirmations=(pushed.items||[]).filter(v=>Number(v.seq)>0);
         const conflict=(pushed.items||[]).find(v=>v.conflict);
         if(confirmations.length){
           const x=await window.BDVault.post('/workspace/methods/ack',{workspaceKeyId:pending.workspaceKeyId,items:confirmations});
           sent+=Number(x.acknowledged||0);
         }
         if(conflict){const error=new Error('Methodenkonflikt bei '+conflict.methodId+' ('+conflict.conflict+'). Kein automatisches Überschreiben.');error.conflict=true;throw error;}
         if(b===199)throw Error('Weitere Methoden warten auf Upload. Bitte erneut synchronisieren.');
       }
       lastError='';stopAuto=false;failedRuns=0;nextAttemptAt=0;lastSuccess=Date.now();
       update({status:'ok',message:`Synchronisiert: ${received} empfangen · ${sent} übertragen`,received,sent,cursor,lastSuccess});
       if(received)document.dispatchEvent(new CustomEvent('bd:methods-synced',{detail:{received,sent}}));
       return {...state};
     }catch(e){lastError=String(e.message||e);stopAuto=!!e.conflict||/Workspace-Kopplung|Workspace-Zugang fehlt|Migration|nicht installiert/.test(lastError);failedRuns+=1;nextAttemptAt=Date.now()+Math.min(MAX_BACKOFF,60_000*Math.pow(2,Math.min(failedRuns,5)));if(/Cloud ist momentan nicht erreichbar|Cloud-Verbindung|Failed to fetch|Load failed/i.test(lastError))lastError='Cloud-Verbindung derzeit nicht möglich. Der Workspace-Schlüssel bleibt erhalten; automatischer neuer Versuch später. Wenn andere Cloud-Funktionen ebenfalls ausfallen, Netzwerk oder Desktop-Proxy prüfen.';
       update({status:stopAuto?'needs-setup':'error',message:lastError,received,sent,cursor});
       if(manual)throw e;return {...state};
     }
   })();
   active=work;try{return await work}finally{active=null}
 }
 function schedule({manual=false,urgent=false,delay=200}={}){
   if(timeout)clearTimeout(timeout);
   if(manual)stopAuto=false;
   timeout=setTimeout(()=>{timeout=null;run({manual,urgent}).catch(()=>{})},delay);
 }
 function refresh(){if(!document.hidden&&authenticated())schedule({delay:1500});}
 document.addEventListener('DOMContentLoaded',()=>schedule({delay:1800}));
 document.addEventListener('bd:vault-unlocked',()=>schedule({urgent:true,delay:600}));
 document.addEventListener('bd:method-changed',()=>schedule({urgent:true,delay:1100}));
 document.addEventListener('bd:workspace-linked',()=>schedule({manual:true,urgent:true,delay:800}));
 document.addEventListener('visibilitychange',refresh);
 window.addEventListener('online',refresh);
 window.addEventListener('focus',()=>{if(Date.now()-lastAttempt>60000)refresh()});
 setInterval(()=>{if(!document.hidden&&Date.now()-lastAttempt>=INTERVAL)refresh()},INTERVAL);
 window.BDMethodSync={run,schedule,onStatus,state:()=>({...state}),prerequisites};
})();
