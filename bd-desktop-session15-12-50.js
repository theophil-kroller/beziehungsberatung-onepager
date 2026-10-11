/* Beziehungsdynamiken 15.12.50 — ephemeral, same-origin desktop tab session hand-off.
   No persistence beyond sessionStorage, never exchanges passwords or TOTP secrets. */
(()=>{'use strict';
 const local=(location.hostname==='127.0.0.1'||location.hostname==='localhost')&&location.port==='47832';
 if(!local||typeof BroadcastChannel==='undefined')return;
 const sessionKey='bd_admin_session_v1',vaultKey='bd_vault_token_v1';
 const bc=new BroadcastChannel('bd-desktop-session-15-12-50');
 const requestId='bd'+Math.random().toString(36).slice(2)+Date.now().toString(36);
 let reloading=false;
 function hasSession(){return !!sessionStorage.getItem(sessionKey)}
 function request(){if(!hasSession()||!sessionStorage.getItem(vaultKey))bc.postMessage({type:'request',id:requestId});}
 bc.onmessage=event=>{
   const msg=event.data||{};
   if(msg.type==='request'&&msg.id!==requestId){
     const session=sessionStorage.getItem(sessionKey)||'',vault=sessionStorage.getItem(vaultKey)||'';
     if(session||vault)bc.postMessage({type:'reply',to:msg.id,session,vault});
   } else if(msg.type==='reply'&&msg.to===requestId){
     let changed=false;
     if(!hasSession()&&msg.session){sessionStorage.setItem(sessionKey,msg.session);changed=true;}
     if(!sessionStorage.getItem(vaultKey)&&msg.vault){sessionStorage.setItem(vaultKey,msg.vault);changed=true;}
     if(changed&&!reloading){reloading=true;location.reload();}
   } else if(msg.type==='logout'){
     sessionStorage.removeItem(sessionKey);sessionStorage.removeItem(vaultKey);
     if(!reloading){reloading=true;location.reload();}
   }
 };
 window.BDDesktopSession={request,logout:()=>bc.postMessage({type:'logout'})};
 request();
 for(const delay of [800,2500,6500])setTimeout(request,delay);
 window.addEventListener('pageshow',request);
})();
