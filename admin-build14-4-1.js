(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const API=((location.hostname==='127.0.0.1'||location.hostname==='localhost')&&location.port==='47832'?(location.origin+'/desktop/cloud'):(window.BD_BOOKING_CONFIG?.apiBaseUrl||'')).replace(/\/$/,'');
  const SESSION_KEY='bd_admin_session_v1';
  const VAULT='http://127.0.0.1:47831';
  let backupBusy=false,backupDebounce=null,lastBackupRun=0,cloudConfig=null;
  const fmt=x=>x?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x)):'—';
  const size=n=>{n=Number(n)||0;if(n<1024)return`${n} B`;if(n<1024*1024)return`${(n/1024).toFixed(1)} KB`;return`${(n/1024/1024).toFixed(1)} MB`};

  async function cloud(path,opts={}){
    const session=sessionStorage.getItem(SESSION_KEY)||'';
    if(!session)throw new Error('CRM-Sitzung fehlt.');
    const headers={...(opts.headers||{}),Authorization:'Bearer '+session};
    const r=await fetch(API+path,{...opts,headers,cache:'no-store'}),ct=r.headers.get('content-type')||'';
    if(!ct.includes('application/json')){if(!r.ok)throw new Error('Cloud-Anfrage fehlgeschlagen.');return r}
    const x=await r.json().catch(()=>({}));if(!r.ok||x.ok===false)throw new Error(x.error||'Cloud-Anfrage fehlgeschlagen.');return x;
  }
  const cloudPost=(path,body)=>cloud(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

  function ensureBackupAlert(){
    let b=$('#b1441BackupAlert');if(b)return b;
    const actions=$('.workspace-head .head-actions');if(!actions)return null;
    b=document.createElement('button');b.id='b1441BackupAlert';b.type='button';b.className='btn ghost b1441-backup-alert';b.hidden=true;b.textContent='Backup prüfen';
    b.onclick=()=>{location.hash='vault';setTimeout(()=>$('#b1441BackupPanel')?.scrollIntoView({behavior:'smooth',block:'center'}),180)};actions.prepend(b);return b;
  }

  function setBackupUI(local=null,cloudState=cloudConfig,phase=''){
    const pill=$('#b1441BackupPill'),panel=$('#b1441BackupPanel'),localEl=$('#b1441BackupLocal'),cloudEl=$('#b1441BackupCloud'),msg=$('#b1441BackupMessage'),alert=ensureBackupAlert();
    if(!pill)return;
    let kind='pending',label='Prüfe …',message='Automatische Datensicherung wird geprüft.',problem=false;
    if(phase==='running'){label='Sicherung läuft …';kind='pending';message='Lokaler verschlüsselter Snapshot wird erstellt und anschließend nach R2 übertragen.'}
    else if(!window.BDVault?.status?.().unlocked){label='Vault gesperrt';kind='warn';message='Automatische Sicherung startet nach dem Entsperren des lokalen Vaults.'}
    else if(cloudState&&cloudState.configured===false){label='R2 fehlt';kind='error';problem=true;message='Pflicht-Backup nicht aktiv: Im Cloudflare-Worker fehlt das R2-Binding PRACTICE_BACKUPS.'}
    else if(local?.cloudCurrent){label='Backup aktuell';kind='ok';message='Die letzte lokale Textsicherung wurde erfolgreich verschlüsselt in Cloudflare R2 abgelegt.'}
    else if(local){label='Cloud-Backup offen';kind='warn';problem=true;message=local.lastError||'Es gibt Änderungen, die noch nicht erfolgreich in R2 gesichert wurden.'}
    pill.className='b1441-backup-pill '+kind;pill.textContent=label;panel?.classList.toggle('is-error',problem);
    if(localEl)localEl.textContent=local?.lastLocalAt?`${fmt(local.lastLocalAt)} · ${size(local.lastLocalBytes)}`:(local?'noch ausständig':'—');
    if(cloudEl)cloudEl.textContent=local?.lastCloudAt?fmt(local.lastCloudAt):(cloudState?.configured===false?'nicht eingerichtet':'noch ausständig');
    if(msg)msg.textContent=message;
    if(alert){alert.hidden=!problem;alert.textContent=cloudState?.configured===false?'⚠ R2-Backup fehlt':'⚠ Backup offen'}
  }

  async function getCloudConfig(force=false){
    if(cloudConfig&&!force)return cloudConfig;
    try{cloudConfig=await cloud('/admin/backup/status');return cloudConfig}catch(e){cloudConfig={configured:null,error:e.message};return cloudConfig}
  }
  async function getLocalStatus(){
    if(!window.BDVault)return null;
    await window.BDVault.checkHealth();if(!window.BDVault.status().unlocked)return null;
    return window.BDVault.request('/backup/status');
  }
  async function refreshBackupStatus(){
    try{const [local,remote]=await Promise.all([getLocalStatus(),getCloudConfig(true)]);setBackupUI(local,remote);return{local,remote}}catch(e){setBackupUI(null,cloudConfig);const m=$('#b1441BackupMessage');if(m)m.textContent=e.message;return{local:null,remote:cloudConfig}}
  }

  async function packageForUpload(local){
    if(!local||local.changedSinceLocalBackup||!local.lastLocalHash)return window.BDVault.post('/backup/create',{});
    try{return await window.BDVault.request('/backup/latest')}catch(_){return window.BDVault.post('/backup/create',{})}
  }
  async function runBackup(force=false){
    if(backupBusy||!window.BDVault||!API||!sessionStorage.getItem(SESSION_KEY))return false;
    backupBusy=true;lastBackupRun=Date.now();
    try{
      await window.BDVault.checkHealth();if(!window.BDVault.status().unlocked){setBackupUI(null,cloudConfig);return false}
      let local=await window.BDVault.request('/backup/status');
      // Cloud efficiency: when the local Vault says the latest snapshot is already
      // confirmed in R2, the five-minute safety timer stays completely local.
      // The Worker is contacted only once per app session for configuration/status,
      // or when an actual R2 upload/list/download is necessary.
      const remote=await getCloudConfig(false);if(remote?.configured===false){setBackupUI(local,remote);return false}
      if(!force&&!local.needsCloudBackup){setBackupUI(local,remote);return true}
      setBackupUI(local,remote,'running');
      const pack=await packageForUpload(local);
      const uploaded=await cloudPost('/admin/backup/upload',{packageBase64:pack.packageBase64,createdAt:pack.createdAt,sha256:pack.sha256,byteSize:pack.byteSize,sourceStamp:pack.sourceStamp});
      local=await window.BDVault.post('/backup/cloud-confirm',{sha256:uploaded.sha256,objectKey:uploaded.objectKey,uploadedAt:uploaded.uploadedAt});
      cloudConfig={...remote,configured:true,latest:{objectKey:uploaded.objectKey,uploadedAt:uploaded.uploadedAt,byteSize:uploaded.byteSize}};
      setBackupUI(local,cloudConfig);
      window.BDDesktop?.log?.('backup_r2_success',`${uploaded.byteSize||0} bytes`);
      return true;
    }catch(e){
      try{await window.BDVault?.post?.('/backup/error',{message:e.message})}catch(_){ }
      const local=await getLocalStatus().catch(()=>null);setBackupUI(local,cloudConfig);const m=$('#b1441BackupMessage');const legacy=/\bnot found\b/i.test(String(e.message||''));if(m)m.textContent=legacy?'Lokaler Vault-Dienst ist veraltet: Backup-API fehlt. Build 14.4.2 aktualisiert den Vault auf 3.16.0. Danach den Vault-Dienst neu starten.':'Backup fehlgeschlagen: '+e.message;const pill=$('#b1441BackupPill');if(legacy&&pill){pill.className='b1441-backup-pill error';pill.textContent='Vault-Update nötig'}window.BDDesktop?.log?.('backup_r2_error',e.message);return false;
    }finally{backupBusy=false}
  }

  function bytesToBase64(bytes){let raw='';for(let i=0;i<bytes.length;i+=0x8000)raw+=String.fromCharCode(...bytes.subarray(i,Math.min(bytes.length,i+0x8000)));return btoa(raw)}
  function ensureBackupDialog(){
    let dlg=$('#b1441BackupDialog');if(dlg)return dlg;
    dlg=document.createElement('dialog');dlg.id='b1441BackupDialog';dlg.className='b1441-backup-dialog';dlg.innerHTML=`<div class="dialog-shell"><button class="dialog-x" type="button" data-b1441-close>×</button><p class="eyebrow">Cloudflare R2 · Recovery</p><h2>Verschlüsselte Cloud-Backups</h2><p class="muted">Diese Dateien enthalten nur den lokal verschlüsselten Vault-Text-/Datenbank-Snapshot. Cloudflare erhält keinen entschlüsselten Beratungsinhalt.</p><div id="b1441BackupListBody" class="b1441-backup-list"><div class="empty">Backups werden geladen …</div></div><p id="b1441BackupDialogMsg" class="micro muted"></p></div>`;document.body.appendChild(dlg);dlg.querySelector('[data-b1441-close]').onclick=()=>dlg.close();return dlg;
  }
  async function downloadBackup(key){
    const session=sessionStorage.getItem(SESSION_KEY)||'',r=await fetch(API+'/admin/backup/download?id='+encodeURIComponent(key),{headers:{Authorization:'Bearer '+session},cache:'no-store'});if(!r.ok){const x=await r.json().catch(()=>({}));throw new Error(x.error||'Backup konnte nicht geladen werden.')}return r.blob();
  }
  async function saveBackupFile(key){const blob=await downloadBackup(key),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Beziehungsdynamiken-Recovery-${new Date().toISOString().slice(0,10)}.bdvault`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}
  async function restoreBackup(key){
    const dlg=ensureBackupDialog(),msg=dlg.querySelector('#b1441BackupDialogMsg');
    if(!confirm('Dieses Backup wirklich als lokalen Vault wiederherstellen? Der aktuelle Datenbankstand wird zuvor lokal als Sicherheitskopie abgelegt.'))return;
    const password=prompt('Vault-Passwort für dieses Backup eingeben:');if(!password)return;
    msg.textContent='Backup wird heruntergeladen und lokal geprüft …';
    try{const blob=await downloadBackup(key),bytes=new Uint8Array(await blob.arrayBuffer()),packageBase64=bytesToBase64(bytes);const r=await fetch(VAULT+'/backup/recover',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password,packageBase64,confirm:'RESTORE'})}),x=await r.json().catch(()=>({}));if(!r.ok||!x.ok)throw new Error(x.error||'Wiederherstellung fehlgeschlagen.');sessionStorage.setItem('bd_vault_token_v1',x.token);msg.textContent='Wiederherstellung erfolgreich. Die Praxisverwaltung wird neu geladen …';setTimeout(()=>location.reload(),900)}catch(e){msg.textContent=e.message}
  }
  async function openBackupList(){
    const dlg=ensureBackupDialog(),host=dlg.querySelector('#b1441BackupListBody'),msg=dlg.querySelector('#b1441BackupDialogMsg');host.innerHTML='<div class="empty">Backups werden geladen …</div>';msg.textContent='';dlg.showModal();
    try{const x=await cloud('/admin/backup/list');const rows=x.backups||[];host.innerHTML=rows.length?rows.map((b,i)=>`<article class="b1441-backup-row"><div><strong>${i===0?'Neueste Sicherung':'Sicherung'} · ${fmt(b.uploadedAt)}</strong><span>${size(b.byteSize)} · verschlüsselte .bdvault-Datei</span></div><div class="b1441-backup-row-actions"><button type="button" data-b1441-download="${encodeURIComponent(b.objectKey)}">Download</button><button class="restore" type="button" data-b1441-restore="${encodeURIComponent(b.objectKey)}">Wiederherstellen</button></div></article>`).join(''):'<div class="empty">Noch kein R2-Backup vorhanden.</div>';host.querySelectorAll('[data-b1441-download]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await saveBackupFile(decodeURIComponent(b.dataset.b1441Download))}catch(e){msg.textContent=e.message}finally{b.disabled=false}});host.querySelectorAll('[data-b1441-restore]').forEach(b=>b.onclick=()=>restoreBackup(decodeURIComponent(b.dataset.b1441Restore)))}catch(e){host.innerHTML=`<div class="empty">${String(e.message||e)}</div>`}
  }

  function clientTab(name){document.querySelector(`[data-record-tab="${CSS.escape(name)}"]`)?.click()}
  function bindClientRail(){
    const rail=$('#clientActionRail');if(!rail)return;
    rail.addEventListener('click',e=>{const action=e.target.closest('[data-client-action]')?.dataset.clientAction;if(!action)return;const dlg=$('#clientDialog'),email=String(dlg?.dataset.clientEmail||'');if(action==='message'){if(email)location.href='message-center.html?client='+encodeURIComponent(email);return}if(action==='booking')clientTab('bookings');if(action==='documentation')clientTab('documentation');if(action==='invoice')clientTab('invoices');if(action==='more'){const menu=$('#clientActionMore');if(menu)menu.hidden=!menu.hidden}});
    rail.querySelectorAll('[data-client-tab-rail]').forEach(b=>b.onclick=()=>{clientTab(b.dataset.clientTabRail);const menu=$('#clientActionMore');if(menu)menu.hidden=true});
    $('#clientDialog')?.addEventListener('close',()=>{const menu=$('#clientActionMore');if(menu)menu.hidden=true});
  }

  function bindBackup(){
    $('#b1441BackupNow')?.addEventListener('click',async()=>{const b=$('#b1441BackupNow');b.disabled=true;b.textContent='Sichere …';try{await runBackup(true)}finally{b.disabled=false;b.textContent='Jetzt sicher sichern'}});
    $('#b1441BackupList')?.addEventListener('click',openBackupList);
    document.addEventListener('bd:vault-unlocked',()=>{setTimeout(()=>runBackup(false),1200)});
    document.addEventListener('bd:vault-mutated',e=>{if(backupDebounce)clearTimeout(backupDebounce);const path=String(e.detail?.path||'');const critical=['/documentation-inbox/finalize','/session','/initial-consultation'].some(x=>path.startsWith(x));backupDebounce=setTimeout(()=>runBackup(false),critical?3000:20000)});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastBackupRun>5*60*1000)setTimeout(()=>runBackup(false),1200)});
    setTimeout(refreshBackupStatus,1600);setTimeout(()=>runBackup(false),6000);setInterval(()=>runBackup(false),5*60*1000);
  }

  function init(){bindClientRail();bindBackup();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
