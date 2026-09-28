(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const isDesktop=!!window.BDDesktop?.isDesktop;
  const DOWNLOAD='downloads/Beziehungsdynamiken-Desktop-14.5.3-beta-windows.exe';
  const duration=(seconds)=>{seconds=Math.max(0,Math.floor(Number(seconds)||0));const m=Math.floor(seconds/60),s=seconds%60;return m?`${m} Min. ${String(s).padStart(2,'0')} Sek.`:`${s} Sek.`};

  function installDesktopSettings(){
    const grid=$('#view-settings .settings-grid');if(!grid||$('#b1440DesktopSettings'))return;
    const section=document.createElement('section');section.className='panel b1440-desktop-card';section.id='b1440DesktopSettings';
    section.innerHTML=isDesktop?`
      <p class="eyebrow">Desktop & lokale Dienste</p>
      <div class="b1440-desktop-heading"><div><h2>Beziehungsdynamiken Desktop</h2><p class="muted">Desktop Beta 14.5.0.1 · Idea Capture · Knowledge Hub · Communication</p></div><span class="b1440-installed">Installiert</span></div>
      <div class="b1440-status-row"><span class="b1440-status-dot"></span><div><strong id="b1440DesktopVaultTitle">Lokalen Dienst prüfen …</strong><small id="b1440DesktopVaultDetail">Der Desktop-Shell verwaltet den Vault-Prozess.</small></div></div>
      <div class="stack-actions"><button class="btn secondary" id="b1440StartVault" type="button">Vault starten / erneut verbinden</button><button class="btn ghost" id="b1440DesktopRefresh" type="button">Status aktualisieren</button></div>
      <p class="micro muted">Die Desktop-App dient in dieser Beta als lokaler Shell: Sie liefert die Praxisoberfläche auch ohne Browser-Chrome aus und startet den vorhandenen Vault automatisch. Vollständige Offline-Synchronisation und LAN-Capture folgen schrittweise.</p>`:`
      <p class="eyebrow">Desktop & lokale Dienste</p>
      <h2>Beziehungsdynamiken Desktop</h2>
      <p class="muted">Für den Praxisalltag: eigener App-Start, automatischer Vault-Start und lokale Oberfläche. Die Webversion bleibt parallel verfügbar.</p>
      <div class="b1440-platform"><div><strong>Windows 10/11</strong><span>Version 14.5.0.1 Beta · Idea Capture + Knowledge Hub</span></div><a class="btn primary" href="${DOWNLOAD}" download>Windows-App herunterladen ↓</a></div>
      <p class="micro muted">Beim ersten Start kann Windows SmartScreen wegen des noch nicht signierten Beta-Builds warnen. Die spätere Release-Version soll signiert und mit Auto-Update ausgeliefert werden.</p>
      <div class="b1440-coming"><strong>macOS</strong><span>Desktop-Beta folgt nach dem Windows-Test.</span></div>`;
    grid.appendChild(section);
    if(isDesktop){
      $('#b1440StartVault')?.addEventListener('click',async()=>{const b=$('#b1440StartVault');b.disabled=true;b.textContent='Starte …';try{await window.BDDesktop.startVault();setTimeout(async()=>{await refreshDesktopStatus();await window.BDVault?.checkHealth?.();document.dispatchEvent(new CustomEvent('bd:vault-unlocked-check'));},650)}catch(e){alert(e.message)}finally{b.disabled=false;b.textContent='Vault starten / erneut verbinden'}});
      $('#b1440DesktopRefresh')?.addEventListener('click',refreshDesktopStatus);
      refreshDesktopStatus();
    }
  }

  async function refreshDesktopStatus(){
    if(!isDesktop)return;
    const title=$('#b1440DesktopVaultTitle'),detail=$('#b1440DesktopVaultDetail'),dot=document.querySelector('#b1440DesktopSettings .b1440-status-dot');
    try{
      const s=await window.BDDesktop.status();
      const running=!!s?.vault?.running;dot?.classList.toggle('ok',running);
      if(title)title.textContent=running?'Vault-Dienst läuft':'Vault-Dienst ist nicht aktiv';
      if(detail)detail.textContent=running?`Lokal verbunden · ${s.vault.version||'Version erkannt'}`:(s?.vault?.path?`Gefunden: ${s.vault.path}`:'Bestehender Vault konnte noch nicht gefunden werden.');
    }catch(e){if(title)title.textContent='Desktop-Status nicht verfügbar';if(detail)detail.textContent=e.message}
  }

  async function autoStartDesktopVault(){
    if(!isDesktop)return;
    try{
      const s=await window.BDDesktop.status();
      if(!s?.vault?.running){await window.BDDesktop.startVault();await new Promise(r=>setTimeout(r,700));}
      await window.BDVault?.checkHealth?.();
      refreshDesktopStatus();
    }catch(e){console.warn('Desktop vault autostart failed',e)}
  }

  function refineVaultCopy(){
    if(!isDesktop)return;
    const panel=$('#view-vault .settings-grid .panel');if(!panel)return;
    const desired='Die Desktop-App startet den vorhandenen lokalen Vault automatisch. Falls der Dienst beendet wurde, kannst du ihn hier direkt erneut starten – ohne <code>.bat</code>-Datei.';
    const p=panel.querySelector('p.muted');
    // Important: only mutate the DOM when the copy actually differs. Reassigning
    // innerHTML on every MutationObserver callback caused a self-triggering render
    // loop in 14.4.0.2 and made the Edge app window appear frozen/white.
    if(p && p.innerHTML!==desired)p.innerHTML=desired;
    let b=$('#b1440VaultStartInline');if(!b){b=document.createElement('button');b.id='b1440VaultStartInline';b.type='button';b.className='btn secondary';b.textContent='Lokalen Dienst starten';panel.querySelector('.stack-actions')?.prepend(b);b.onclick=async()=>{b.disabled=true;b.textContent='Starte …';try{await window.BDDesktop.startVault();await new Promise(r=>setTimeout(r,600));await window.BDVault?.checkHealth?.()}catch(e){alert(e.message)}finally{b.disabled=false;b.textContent='Lokalen Dienst starten'}}}
  }

  function decorateLocalProcessing(){
    document.querySelectorAll('[data-whisper-elapsed-seconds]').forEach(el=>{
      const next=duration(el.dataset.whisperElapsedSeconds);
      if(el.textContent!==next)el.textContent=next;
    });
  }

  function isAuthenticated(){return !!sessionStorage.getItem('bd_admin_session_v1')}
  function refreshDesktopDecorations(){
    if(!isAuthenticated())return;
    installDesktopSettings();
    refineVaultCopy();
    decorateLocalProcessing();
  }

  function init(){
    autoStartDesktopVault();
    refreshDesktopDecorations();
    // Avoid a document-wide MutationObserver in the desktop shell. The previous
    // observer could be retriggered by legacy admin decorators and make the Edge
    // renderer unresponsive. A cheap local timer is predictable and makes no
    // Cloudflare requests.
    setInterval(refreshDesktopDecorations,1500);
    document.addEventListener('click',()=>setTimeout(refreshDesktopDecorations,80),true);
    document.addEventListener('bd:vault-unlocked-check',()=>setTimeout(refreshDesktopDecorations,50));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
