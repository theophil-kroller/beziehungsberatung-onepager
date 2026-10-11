/* BUILD 15.12.55 – Update & encrypted workspace-method delta sync. */
(()=>{'use strict';
 const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
 const $=s=>document.querySelector(s);
 const VAULT='http://127.0.0.1:47831';
 let isBusy=false,lastAutoCheck=0,desktopRunningVersion='';
 async function api(path,opts={}){
   const token=sessionStorage.getItem('bd_admin_session_v1')||'';
   if(!API||!token)throw Error('Bitte zuerst mit dem persönlichen Praxiszugang anmelden.');
   const r=await fetch(API+path,{...opts,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...(opts.headers||{})},cache:'no-store'});
   const x=await r.json();if(!r.ok||x.ok===false)throw Error(x.error||'Cloud-Anfrage fehlgeschlagen.');return x;
 }
 function panel(){
  if($('#bdVault30Panel'))return;
  const parent=$('#view-vault');if(!parent)return;
  const el=document.createElement('section');el.id='bdVault30Panel';el.className='panel';
  el.innerHTML=`<p class="eyebrow">Vault-Verwaltung · 15.12.50</p><h2>Updates &amp; gemeinsamer Methodenraum</h2>
   <p class="muted">Software-Updates werden über signierte GitHub-Releases geprüft – ohne Cloudflare-Abfragen. Bestätigte Methoden und Hausübungs-Vorlagen werden bei geöffneter App automatisch verschlüsselt abgeglichen. Klientenakten bleiben persönlich und lokal.</p>
   <div class="settings-grid" style="margin-top:18px"><div><strong>Software-Version</strong><p id="bdVault30UpdateStatus" class="micro muted">Prüfe lokalen Versionsstatus …</p>
   <div class="stack-actions"><button type="button" class="btn secondary" id="bdVault30Check">Auf neue Version prüfen</button><button type="button" class="btn primary" id="bdVault30Install" hidden>Update installieren</button></div>
   <p class="micro muted" id="bdVault30UpdateMsg" role="status"></p></div>
   <div><strong>Gemeinsame Methoden &amp; Hausübungen</strong><p id="bdVault30SyncStatus" class="micro muted">Gemeinsamer Schlüssel und Vault erforderlich.</p>
   <button type="button" class="btn secondary" id="bdVault30Sync">Änderungen jetzt synchronisieren</button>
   <p class="micro muted" id="bdVault30SyncMsg" role="status">Automatischer Abgleich bei aktiver Sitzung und nach Änderungen. Kein Klartext in Cloudflare.</p><button type="button" class="btn ghost" id="bdVault30Diagnose">Verbindung prüfen</button><p class="micro muted" id="bdVault30Diagnostic" role="status"></p></div></div>`;
  const before=$('#b1441BackupPanel');before?.before(el)||parent.appendChild(el);
  $('#bdVault30Check').onclick=()=>updateCheck(true);
  $('#bdVault30Install').onclick=updateInstall;
  $('#bdVault30Sync').onclick=syncMethods;$('#bdVault30Diagnose').onclick=diagnose;
  refresh().catch(()=>{});
 }
 async function status(){const r=await fetch(VAULT+'/update/status',{cache:'no-store'});return r.json()}
 function display(s){
  const txt=$('#bdVault30UpdateStatus');if(!txt)return;
  txt.textContent=s.ok?((desktopRunningVersion?'Desktop '+desktopRunningVersion+' · ':'')+'Vault-Code '+s.installed+(s.configured?(s.available?' · Vault-Update '+s.releaseVersion+' verfügbar':s.lastChecked?' · geprüft '+s.lastChecked:' · Vault-Update nicht geprüft'):' · Vault-Updatequelle noch nicht konfiguriert')):'Lokaler Vault-Update-Dienst nicht erreichbar';
  $('#bdVault30Install').hidden=!(s.configured&&s.available);
 }
 async function refresh(){
  try{if(location.port==='47832'&&!desktopRunningVersion){try{const d=await fetch('/desktop/status',{cache:'no-store'}).then(r=>r.json());desktopRunningVersion=d?.version||''}catch(_){}}const s=await status();display(s);
    const h=await window.BDVault?.checkHealth?.();
    if(h?.unlocked&&s.configured&&Date.now()-lastAutoCheck>30*60*1000){lastAutoCheck=Date.now();updateCheck(false).catch(()=>{});}
    if(h?.unlocked){try{const x=await window.BDVault.request('/workspace/methods/status');$('#bdVault30SyncStatus').textContent=`Lokaler Schlüssel bereit · ${x.linkedMethods} synchronisierte Methoden · Cursor ${x.cursor}`;}catch(e){$('#bdVault30SyncStatus').textContent=(/Load failed|Failed to fetch/i.test(e.message)?'Lokalen Vault-Verbindungsweg prüfen (Schlüssel bleibt erhalten).':'Einrichtung ausständig: '+e.message);}}
  }catch(e){if($('#bdVault30UpdateStatus'))$('#bdVault30UpdateStatus').textContent='Lokaler Vault nicht erreichbar.'}
 }
 async function updateCheck(force){
  const msg=$('#bdVault30UpdateMsg');if(isBusy)return;
  isBusy=true;try{
    if(!await window.BDVault?.ensureUnlocked?.())return;
    msg.textContent='Prüfe GitHub-Release-Datei …';
    const s=await window.BDVault.post('/update/check',{force});display(s);
    msg.textContent=s.error?'Prüfung fehlgeschlagen: '+s.error:s.available?'Update verfügbar. Vor dem Installieren laufende Arbeit speichern.':s.configured?'Kein Update verfügbar.':'Noch keine GitHub-Releasequelle eingerichtet – bitte einmalig konfigurieren.';
  }catch(e){msg.textContent=e.message}finally{isBusy=false}
 }
 async function updateInstall(){
  if(isBusy)return;
  if(!confirm('Vault-Update installieren? Aktive Arbeit jetzt speichern. Der Vault-Dienst wird neu gestartet; davor wird eine Datenbanksicherung erstellt.'))return;
  const msg=$('#bdVault30UpdateMsg');isBusy=true;
  try{if(!await window.BDVault?.ensureUnlocked?.())return;
    const x=await window.BDVault.post('/update/install',{confirm:'INSTALL'});
    msg.textContent=`Update ${x.target} vorbereitet. Vault startet neu; diese Seite danach erneut öffnen.`;
    $('#bdVault30Install').disabled=true;
  }catch(e){msg.textContent='Update fehlgeschlagen: '+e.message}finally{isBusy=false}
 }
 async function diagnose(){
   const label=$('#bdVault30Diagnostic');if(!label)return;
   label.textContent='Prüfe lokale und Cloud-Verbindung …';
   try{
     const h=await window.BDVault?.checkHealth?.();
     if(!h?.ok){label.textContent='Lokaler Vault nicht erreichbar. Bitte Desktop-Anwendung starten.';return}
     if(!h?.unlocked){label.textContent='Lokaler Vault gesperrt. Bitte entsperren.';return}
     const path='/admin/workspace/methods/status';
     const token=sessionStorage.getItem('bd_admin_session_v1');
     if(!token){label.textContent='Praxisanmeldung fehlt. Bitte in der Desktop-App anmelden.';return}
     const response=await fetch(API+path,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
     const value=await response.json().catch(()=>({}));
     if(response.ok&&value.ok){const rec=window.BDCloudMethodRecovery?.stats?.();label.textContent='Cloud erreichbar'+(rec?.usedFallback?' (Ausweichverbindung aktiv).':' über den Desktop-Proxy.')+' Methoden-Transport bereit.';return}
     label.textContent=response.status===401?'Praxisanmeldung abgelaufen. Erneut anmelden.':String(value.error||'Cloud antwortet mit HTTP '+response.status);
   }catch(e){label.textContent='Verbindung nicht erreichbar: '+String(e.message||e)+'. Der Vault bleibt lokal verfügbar.'}
 }
 async function syncMethods(){
   const btn=$('#bdVault30Sync'),msg=$('#bdVault30SyncMsg');if(!window.BDMethodSync){msg.textContent='Synchronisationsmodul fehlt.';return;}
   btn.disabled=true;
   try{const s=await window.BDMethodSync.run({manual:true});msg.textContent=s.message;await refresh()}
   catch(e){msg.textContent='Abgleich nicht abgeschlossen: '+e.message}
   finally{btn.disabled=false}
 }
 if(window.BDMethodSync)window.BDMethodSync.onStatus(s=>{if($('#bdVault30SyncMsg'))$('#bdVault30SyncMsg').textContent=s.message;});
 const obs=new MutationObserver(()=>{if($('#view-vault')&&!$('#bdVault30Panel'))panel()});
 document.addEventListener('DOMContentLoaded',()=>{panel();obs.observe(document.body,{childList:true,subtree:false})});
 document.addEventListener('click',e=>{if(e.target.closest('[data-view="vault"]'))setTimeout(()=>refresh(),200)});
 document.addEventListener('bd:vault-unlocked',()=>refresh());
 setTimeout(panel,1200);
})();
