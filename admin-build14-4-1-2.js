(function(){
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  let selectedEmail='', selectedName='';

  function emailFromRow(row){
    return row?.querySelector('[data-open-client]')?.dataset.openClient||'';
  }
  function nameFromRow(row){
    return row?.querySelector('.name')?.textContent?.trim()||row?.querySelector('td')?.textContent?.trim().split('\n')[0]||'';
  }
  function ensureListRail(){
    const view=$('#view-clients'); if(!view)return null;
    let rail=$('#clientOverviewActionRail');
    if(!rail){
      rail=document.createElement('aside');
      rail.id='clientOverviewActionRail';
      rail.className='client-overview-action-rail';
      rail.setAttribute('aria-label','Schnellaktionen für ausgewählte Klientin oder ausgewählten Klienten');
      rail.innerHTML=`<div class="client-overview-rail-context"><span>Ausgewählt</span><strong id="clientOverviewRailName">Klient:in wählen</strong></div>
        <button type="button" data-overview-action="message" disabled title="Nachricht"><span class="rail-icon">✉</span><span>Nachricht</span></button>
        <button type="button" data-overview-action="booking" disabled title="Termin"><span class="rail-icon">▣</span><span>Termin</span></button>
        <button type="button" data-overview-action="documentation" disabled title="Dokumentation"><span class="rail-icon">✎</span><span>Doku</span></button>
        <button type="button" data-overview-action="invoice" disabled title="Honorar"><span class="rail-icon">€</span><span>Honorar</span></button>
        <button type="button" data-overview-action="record" disabled title="Akte öffnen"><span class="rail-icon">↗</span><span>Akte</span></button>`;
      view.appendChild(rail); view.classList.add('has-client-overview-rail');
      rail.addEventListener('click',ev=>{const btn=ev.target.closest('[data-overview-action]');if(!btn||btn.disabled||!selectedEmail)return;perform(btn.dataset.overviewAction)});
    }
    return rail;
  }
  function selectClient(row){
    const email=emailFromRow(row); if(!email)return;
    selectedEmail=email; selectedName=nameFromRow(row)||email;
    $$('#clientsTable tbody tr').forEach(r=>r.classList.toggle('is-client-selected',r===row));
    const rail=ensureListRail(); const name=$('#clientOverviewRailName'); if(name)name.textContent=selectedName;
    rail?.querySelectorAll('[data-overview-action]').forEach(b=>b.disabled=false);
  }
  function openRecord(tab='overview'){
    const opener=$(`#clientsTable [data-open-client="${CSS.escape(selectedEmail)}"]`); if(!opener)return;
    opener.click();
    if(tab!=='overview')setTimeout(()=>document.querySelector(`[data-record-tab="${CSS.escape(tab)}"]`)?.click(),80);
  }
  function perform(action){
    if(action==='message'){location.href='message-center.html?client='+encodeURIComponent(selectedEmail);return}
    if(action==='booking'){openRecord('bookings');return}
    if(action==='documentation'){openRecord('documentation');return}
    if(action==='invoice'){openRecord('invoices');return}
    if(action==='record')openRecord('overview');
  }
  function bindRows(){
    ensureListRail();
    $$('#clientsTable tbody tr').forEach(row=>{
      if(row.dataset.b14412Bound)return;row.dataset.b14412Bound='1';row.tabIndex=0;
      row.addEventListener('click',ev=>{selectClient(row);if(ev.target.closest('[data-open-client]'))return});
      row.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();selectClient(row)}});
    });
    if(selectedEmail){const row=$$('#clientsTable tbody tr').find(r=>emailFromRow(r)===selectedEmail);if(row)selectClient(row)}
  }
  function removeDuplicatePairing(){ $('#captureAccessPairInboxBtn')?.remove(); }
  async function checkBackupCompatibility(){
    if(!window.BDVault)return;
    const h=await window.BDVault.checkHealth().catch(()=>null);if(!h?.ok)return;
    const detail=$('#vaultStatusDetail');
    if(detail&&h.version)detail.textContent=`Lokal · Vault ${h.version}${h.unlocked?' · entsperrt':''}`;
    if(h.backupApi===true)return;
    if(!h.unlocked)return;
    try{await window.BDVault.request('/backup/status')}catch(e){
      if(!/not found/i.test(String(e.message||'')))return;
      const msg=$('#b1441BackupMessage'),pill=$('#b1441BackupPill');
      if(msg)msg.textContent='Lokaler Vault-Dienst ist veraltet. Build 14.5 enthält Vault 3.17.0 mit Backup-API. Bitte vault_server.py aktualisieren und den Vault-Dienst neu starten.';
      if(pill){pill.className='b1441-backup-pill error';pill.textContent='Vault-Update nötig'}
    }
  }
  function boot(){
    ensureListRail();bindRows();removeDuplicatePairing();checkBackupCompatibility();
    const table=$('#clientsTable');if(table)new MutationObserver(()=>setTimeout(bindRows,0)).observe(table,{childList:true,subtree:true});
    const inbox=$('.documentation-inbox-head');if(inbox)new MutationObserver(removeDuplicatePairing).observe(inbox,{childList:true,subtree:true});
    document.addEventListener('bd:vault-unlocked',()=>setTimeout(checkBackupCompatibility,250));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
