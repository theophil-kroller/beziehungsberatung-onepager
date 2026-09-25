(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const durationLabel=seconds=>{seconds=Math.max(0,Math.floor(Number(seconds)||0));if(seconds<60)return `${seconds} Sek.`;const m=Math.floor(seconds/60),s=seconds%60;return `${m} Min.${s?` ${String(s).padStart(2,'0')} Sek.`:''}`};
  let lastQueue={items:[],queued:[],active:null};

  function queueSummary(queue=lastQueue){
    const items=queue?.items||[],active=items.filter(x=>x.status==='transcribing').length,waiting=items.filter(x=>x.status==='queued').length;
    if(active||waiting)return `${active?active+' aktiv':''}${active&&waiting?' · ':''}${waiting?waiting+' warten':''}`;
    return 'Lokal bereit';
  }
  function updateSummary(queue){
    if(queue)lastQueue=queue;
    const btn=$('#localProcessingSummary'),text=$('#localProcessingSummaryText');if(!btn||!text)return;
    const active=(lastQueue.items||[]).some(x=>x.status==='transcribing'),waiting=(lastQueue.items||[]).some(x=>x.status==='queued');
    text.textContent=queueSummary(lastQueue);btn.classList.toggle('is-active',active||waiting);
  }
  async function queueControl(id,action){
    if(!window.BDVault?.status?.().unlocked)return;
    try{await window.BDVault.post('/dictation/control',{id,action});await refreshQueue();window.BDDocumentationInbox?.refresh?.()}catch(e){alert(e.message||'Aktion konnte nicht ausgeführt werden.')}
  }
  function queueItemMarkup(row,index){
    const running=row.status==='transcribing',queued=row.status==='queued';
    const title=row.contextLabel||row.clientName||`Audio ${index+1}`;
    const state=running?`Whisper arbeitet · ${durationLabel(row.whisperElapsedSeconds||0)}`:`Wartet · Position ${row.queuePosition||index+1}`;
    const heartbeat=running?(Number(row.heartbeatAgeSeconds||0)<=8?'Letzte Aktivität: gerade eben':`Letzte Aktivität vor ${durationLabel(row.heartbeatAgeSeconds||0)}`):'Wird automatisch gestartet, sobald der aktive Job fertig ist.';
    return `<article class="b14310-queue-item"><div><strong>${esc(title)}</strong><span>${esc(state)}</span><small>${esc(heartbeat)}</small></div><div class="b14310-queue-actions">${running?`<button type="button" data-action="cancel" data-id="${esc(row.id)}">Abbrechen</button>`:''}${queued?`<button type="button" data-action="prioritize" data-id="${esc(row.id)}">Als Nächstes</button><button type="button" data-action="remove" data-id="${esc(row.id)}">Aus Queue</button>`:''}</div></article>`;
  }
  function ensureQueueDialog(){
    let dlg=$('#b14310QueueDialog');if(dlg)return dlg;
    dlg=document.createElement('dialog');dlg.id='b14310QueueDialog';dlg.className='b14310-queue-dialog';dlg.innerHTML=`<section class="b14310-queue-shell"><div class="b14310-queue-head"><div><p class="eyebrow">Lokale Verarbeitung</p><h2>Whisper-Warteschlange</h2><p>Immer nur eine Transkription läuft gleichzeitig. Wartende Jobs kannst du priorisieren oder aus der Queue nehmen, ohne die Audioquelle zu löschen.</p></div><button class="b14310-queue-close" type="button" aria-label="Schließen">×</button></div><div class="b14310-queue-list" id="b14310QueueList"></div></section>`;
    document.body.appendChild(dlg);dlg.querySelector('.b14310-queue-close').onclick=()=>dlg.close();
    dlg.addEventListener('click',e=>{const b=e.target.closest('[data-action][data-id]');if(!b)return;b.disabled=true;queueControl(b.dataset.id,b.dataset.action).finally(()=>{b.disabled=false})});
    return dlg;
  }
  function renderQueueDialog(){
    const dlg=ensureQueueDialog(),host=dlg.querySelector('#b14310QueueList'),items=lastQueue?.items||[];
    host.innerHTML=items.length?items.map(queueItemMarkup).join(''):'<div class="b14310-queue-empty">Keine lokale Transkription wartet gerade.</div>';
  }
  async function refreshQueue(){
    if(!window.BDVault?.status?.().unlocked){lastQueue={items:[],queued:[],active:null};updateSummary();renderQueueDialog();return lastQueue}
    try{lastQueue=await window.BDVault.request('/whisper/queue');updateSummary(lastQueue);renderQueueDialog();return lastQueue}catch(_){return lastQueue}
  }
  async function openQueue(){await refreshQueue();const dlg=ensureQueueDialog();renderQueueDialog();if(!dlg.open)dlg.showModal()}

  function installCloudSettings(){
    const grid=$('#view-settings .settings-grid');if(!grid||$('#b14310CloudSettings'))return;
    const section=document.createElement('section');section.className='panel b14310-cloud-settings';section.id='b14310CloudSettings';section.innerHTML=`<p class="eyebrow">Cloud & Synchronisierung</p><h2>Daten sparsam aktualisieren</h2><p class="muted">Cloudflare wird für neue Remote-Eingänge nur bei Bedarf abgefragt. Lokale Whisper-/KI-Status aktualisieren sich davon unabhängig live.</p><div class="settings-form"><label>Automatische Cloud-Prüfung<select id="b14310CloudCadence"><option value="sparsam">Sparsam · ca. 15 Minuten</option><option value="ausgewogen">Ausgewogen · ca. 5 Minuten</option><option value="aktuell">Aktuell · ca. 2 Minuten</option></select><span>Manuelles „Neue Eingänge prüfen“ funktioniert immer sofort.</span></label></div><p class="b14310-cloud-note">Sicherheitskritische Zahlungsprüfungen behalten weiterhin feste Backoff-Grenzen und können nicht auf aggressives Polling gestellt werden.</p>`;
    grid.appendChild(section);const select=section.querySelector('#b14310CloudCadence');select.value=localStorage.getItem('bdCloudCadence')||'sparsam';select.onchange=()=>localStorage.setItem('bdCloudCadence',select.value);
  }

  function refineDashboard(){
    // The documentation panel is deliberately beside today's work. The old quick-access card stays hidden via CSS.
    const refresh=$('#refreshBtn');if(refresh){refresh.title='Dashboard-Daten neu laden';refresh.setAttribute('aria-label','Dashboard-Daten neu laden')}
    const inboxRefresh=$('#documentationInboxRefresh');if(inboxRefresh)inboxRefresh.title='Nur neue Cloud-Eingänge prüfen';
  }

  function bind(){
    refineDashboard();installCloudSettings();
    $('#localProcessingSummary')?.addEventListener('click',openQueue);
    document.addEventListener('bd:local-processing-status',e=>{lastQueue=e.detail?.queue||lastQueue;updateSummary(lastQueue);if($('#b14310QueueDialog')?.open)renderQueueDialog()});
    document.addEventListener('bd:vault-unlocked',()=>refreshQueue());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.BDVault?.status?.().unlocked)refreshQueue()});
    setTimeout(refreshQueue,1300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
