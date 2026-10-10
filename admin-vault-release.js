/* BUILD 15.12.30 – Update & encrypted workspace-method delta sync. */
(()=>{'use strict';
 const API=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
 const $=s=>document.querySelector(s);
 const VAULT='http://127.0.0.1:47831';
 let isBusy=false,lastAutoCheck=0;
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
  el.innerHTML=`<p class="eyebrow">Vault-Verwaltung · 15.12.30</p><h2>Updates &amp; gemeinsamer Methodenraum</h2>
   <p class="muted">Software-Updates werden über signierte GitHub-Releases geprüft – ohne Cloudflare-Abfragen. Nur ausdrücklich synchronisierte Methoden und Hausübungs-Vorlagen werden verschlüsselt zwischen Team-Vaults ausgetauscht. Klientenakten bleiben persönlich und lokal.</p>
   <div class="settings-grid" style="margin-top:18px"><div><strong>Software-Version</strong><p id="bdVault30UpdateStatus" class="micro muted">Prüfe lokalen Versionsstatus …</p>
   <div class="stack-actions"><button type="button" class="btn secondary" id="bdVault30Check">Auf neue Version prüfen</button><button type="button" class="btn primary" id="bdVault30Install" hidden>Update installieren</button></div>
   <p class="micro muted" id="bdVault30UpdateMsg" role="status"></p></div>
   <div><strong>Gemeinsame Methoden &amp; Hausübungen</strong><p id="bdVault30SyncStatus" class="micro muted">Gemeinsamer Schlüssel und Vault erforderlich.</p>
   <button type="button" class="btn secondary" id="bdVault30Sync">Änderungen jetzt synchronisieren</button>
   <p class="micro muted" id="bdVault30SyncMsg" role="status">Keine automatische Dauerabfrage: Bei diesem Vorgang werden ausschließlich verschlüsselte Änderungen übertragen.</p></div></div>`;
  const before=$('#b1441BackupPanel');before?.before(el)||parent.appendChild(el);
  $('#bdVault30Check').onclick=()=>updateCheck(true);
  $('#bdVault30Install').onclick=updateInstall;
  $('#bdVault30Sync').onclick=syncMethods;
  refresh().catch(()=>{});
 }
 async function status(){const r=await fetch(VAULT+'/update/status',{cache:'no-store'});return r.json()}
 function display(s){
  const txt=$('#bdVault30UpdateStatus');if(!txt)return;
  txt.textContent=s.ok?(s.configured?(s.available?`Version ${s.installed} · Version ${s.releaseVersion} verfügbar`:`Installiert: ${s.installed} · ${s.lastChecked?'geprüft '+s.lastChecked:'Noch keine Prüfung'}`):`Version ${s.installed} · GitHub-Releasequelle noch nicht konfiguriert`):'Lokaler Update-Dienst nicht erreichbar';
  $('#bdVault30Install').hidden=!(s.configured&&s.available);
 }
 async function refresh(){
  try{const s=await status();display(s);
    const h=await window.BDVault?.checkHealth?.();
    if(h?.unlocked&&s.configured&&Date.now()-lastAutoCheck>30*60*1000){lastAutoCheck=Date.now();updateCheck(false).catch(()=>{});}
    if(h?.unlocked){try{const x=await window.BDVault.request('/workspace/methods/status');$('#bdVault30SyncStatus').textContent=`Workspace verbunden · ${x.linkedMethods} synchronisierte Methoden · Cursor ${x.cursor}`;}catch(e){$('#bdVault30SyncStatus').textContent=e.message;}}
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
 async function syncMethods(){
  if(isBusy)return;
  const btn=$('#bdVault30Sync'),msg=$('#bdVault30SyncMsg');btn.disabled=true;isBusy=true;
  try{
    if(!await window.BDVault?.ensureUnlocked?.())return;
    let local=await window.BDVault.request('/workspace/methods/status');
    let cursor=Number(local.cursor||0),got=0,sent=0;
    msg.textContent='Lade Änderungen seit dem letzten erfolgreichen Abgleich …';
    for(let page=0;page<20;page++){
      const remote=await api('/admin/workspace/methods/delta?cursor='+encodeURIComponent(cursor));
      if(!remote.items?.length)break;
      const applied=await window.BDVault.post('/workspace/methods/apply',{workspaceKeyId:local.workspaceKeyId,items:remote.items});
      cursor=Number(applied.cursor||cursor);got+=Number(applied.applied||0);
      if(applied.conflicts?.length)throw Error(`Konflikt bei ${applied.conflicts[0].methodId}: lokale Bearbeitung weicht von der Team-Version ab. Nichts wurde überschrieben.`);
      if(!remote.hasMore)break;
      if(page===19)throw Error('Weitere Änderungen vorhanden. Bitte erneut synchronisieren.');
    }
    for(let batch=0;batch<100;batch++){
      const outgoing=await window.BDVault.request('/workspace/methods/outgoing');
      if(!outgoing.items?.length)break;
      const pushed=await api('/admin/workspace/methods/push',{method:'POST',body:JSON.stringify({workspaceKeyId:outgoing.workspaceKeyId,items:outgoing.items})});
      const conflict=(pushed.items||[]).find(x=>x.conflict);
      const confirmed=(pushed.items||[]).filter(x=>Number(x.seq)>0);
      if(confirmed.length){const x=await window.BDVault.post('/workspace/methods/ack',{workspaceKeyId:outgoing.workspaceKeyId,items:confirmed});sent+=Number(x.acknowledged||0)}
      if(conflict)throw Error('Cloud-Konflikt bei '+conflict.methodId+'. Bitte zunächst die andere Bearbeitung prüfen.');
      if(batch===99)throw Error('Viele Änderungen. Bitte ein weiteres Mal synchronisieren.');
    }
    msg.textContent=`Abgleich abgeschlossen: ${got} neue/aktualisierte Methoden erhalten, ${sent} lokale Änderungen übertragen. Keine Klientenakten übertragen.`;
    await refresh();
  }catch(e){msg.textContent='Abgleich nicht abgeschlossen: '+e.message}
  finally{btn.disabled=false;isBusy=false}
 }
 const obs=new MutationObserver(()=>{if($('#view-vault')&&!$('#bdVault30Panel'))panel()});
 document.addEventListener('DOMContentLoaded',()=>{panel();obs.observe(document.body,{childList:true,subtree:false})});
 document.addEventListener('click',e=>{if(e.target.closest('[data-view="vault"]'))setTimeout(()=>refresh(),200)});
 document.addEventListener('bd:vault-unlocked',()=>refresh());
 setTimeout(panel,1200);
})();
