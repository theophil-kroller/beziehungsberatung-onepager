/* Build 15.12.127 · Administration & Secure Vault information architecture.
   Progressive enhancement only: do not change permissions, storage, or existing action IDs. */
(() => {
 'use strict';
 if (!document.querySelector('#view-settings, #view-vault')) return;
 const $ = (q, root=document) => root.querySelector(q);
 const get = id => document.getElementById(id);
 const safe = value => String(value == null ? '' : value);
 const state = {settings:'overview', vault:'overview', vaultHealth:{ok:false,setup:false,unlocked:false}, busy:false};
 const icons = {
  locked:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  open:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0m0-3c2 0 4 1.4 4 4v1"/>',
  offline:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M3 3l18 18"/>'
 };
 const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.locked}</svg>`;
 const settingsTabs = [
  ['overview','Übersicht'], ['team','Team & Rollen'], ['academy','Academy'],
  ['practice','Praxisregeln'], ['devices','Geräte & Zugänge'], ['software','Software & Updates']
 ];
 const vaultTabs = [
  ['overview','Übersicht'], ['devices','Geräte & Schutz'], ['backup','Datensicherung'], ['methods','Methoden & Abgleich']
 ];
 function tabNavigation(type,tabs){
  const nav=document.createElement('nav');nav.className='bd127-tabbar';nav.setAttribute('aria-label',type==='settings'?'Einstellungen':'Vault-Bereiche');
  for(const [key,label] of tabs){
   const b=document.createElement('button');b.type='button';b.dataset.bd127Tab=key;b.dataset.bd127Type=type;
   b.textContent=label;b.className='bd127-tab';b.setAttribute('aria-current',key==='overview'?'page':'false');
   b.addEventListener('click',()=>activate(type,key));nav.append(b);
  }
  return nav;
 }
 function makeCard({kicker,title,copy,link,label,action}){
  const card=document.createElement('article');card.className='bd127-card';
  const kickerEl=document.createElement('span');kickerEl.className='bd127-kicker';kickerEl.textContent=kicker;
  const heading=document.createElement('h3');heading.textContent=title;
  const desc=document.createElement('p');desc.textContent=copy;
  const cta=document.createElement(link?'a':'button');cta.className='bd127-card-link';cta.textContent=label+' →';
  if(link)cta.href=link;else{cta.type='button';cta.addEventListener('click',action)}
  card.append(kickerEl,heading,desc,cta);return card;
 }
 function buildSettings(){
  const view=get('view-settings');if(!view||get('bd127SettingsHeader'))return;
  const header=document.createElement('header');header.id='bd127SettingsHeader';header.className='bd127-heading';
  header.innerHTML='<p class="bd127-overline">PRAXISPLATTFORM · EINSTELLUNGEN</p><h2>Administration</h2><p>Menschen, Lernzugänge und Systeme an einem Ort verwalten.</p>';
  const tabs=tabNavigation('settings',settingsTabs);
  const panels=document.createElement('div');panels.className='bd127-content-panels';panels.id='bd127SettingsSpecial';
  const overview=document.createElement('section');overview.id='bd127SettingsOverview';overview.className='bd127-special';
  const grid=document.createElement('div');grid.className='bd127-card-grid';
  grid.append(
   makeCard({kicker:'PERSONEN',title:'Team & Rollen',copy:'Einladungen, Rollen und fachliche Profile verwalten.',label:'Team öffnen',action:()=>activate('settings','team')}),
   makeCard({kicker:'LERNEN',title:'Academy-Freigaben',copy:'Trainingsmodule gezielt pro Teammitglied freischalten.',label:'Freigaben öffnen',action:()=>activate('settings','academy')}),
   makeCard({kicker:'BETRIEB',title:'Praxisregeln',copy:'Lifecycle, Zuordnungen und organisatorische Daten.',label:'Regeln öffnen',action:()=>activate('settings','practice')}),
   makeCard({kicker:'SYSTEM',title:'Software & Updates',copy:'Tatsächliche Versionsstände, Downloads und Veröffentlichungen.',label:'Versionen ansehen',action:()=>activate('settings','software')})
  );overview.append(grid);panels.append(overview);
  const academy=document.createElement('section');academy.id='bd127Academy';academy.className='bd127-special';
  academy.innerHTML='<div class="bd127-feature"><p class="bd127-overline">OWNER · TEAMFREIGABEN</p><h3>Wer darf welche Trainings starten?</h3><p>Die Academy verwendet seit 15.12.126 eine ausdrückliche Modulfreigabe. Bestehende Freigaben bleiben erhalten. Neue Module starten für Practitioner erst nach Freigabe.</p><a class="bd127-primary-link" href="academy-access15-12-78.html">Academy-Freigaben verwalten ↗</a><p class="bd127-footnote">Der Owner muss angemeldet sein. Die Rechte werden im Cloud-Worker geprüft – ein Link allein gewährt keinen Zugriff.</p></div>';
  const software=document.createElement('section');software.id='bd127Software';software.className='bd127-special';
  software.innerHTML='<div class="bd127-feature"><p class="bd127-overline">SOFTWARESTAND</p><h3>Versionen & Veröffentlichungen</h3><p>Desktop-App, lokaler Vault und GitHub-Releases bleiben getrennte Update-Kanäle. Eine Prüfung ersetzt keine Herausgeber-Signatur.</p><div class="bd127-versions"><div><span>Website-Code</span><strong>15.12.127</strong></div><div><span>Desktop-App</span><strong id="bd127DesktopVersion">Wird geprüft …</strong></div><div><span>Vault-Code</span><strong id="bd127VaultVersion">Wird geprüft …</strong></div></div></div>';
  panels.append(academy,software);
  view.prepend(header,tabs,panels);
  const origGrid=$('.settings-grid',view);if(origGrid)origGrid.classList.add('bd127-settings-original');
 }
 function buildVault(){
  const view=get('view-vault');if(!view||get('bd127VaultHeader'))return;
  const header=document.createElement('header');header.id='bd127VaultHeader';header.className='bd127-heading';
  header.innerHTML='<p class="bd127-overline">LOKAL · VERSCHLÜSSELT</p><h2>Secure Practice Vault</h2><p>Dokumentieren, sichern und verwalten – auf diesem Computer.</p>';
  const control=document.createElement('div');control.className='bd127-status-head';control.id='bd127VaultStatusHead';
  control.innerHTML=`<span id="bd127VaultIcon" class="bd127-status-icon">${svg('offline')}</span><div><strong id="bd127VaultHeadline">Verbindung wird geprüft</strong><small id="bd127VaultSub">Lokaler Dienst · 127.0.0.1</small></div><button type="button" class="bd127-status-action" id="bd127VaultAction">Status prüfen</button>`;
  header.append(control);
  const tabs=tabNavigation('vault',vaultTabs);view.prepend(header,tabs);
  const summary=document.createElement('p');summary.id='bd127VaultOverviewText';summary.className='bd127-vault-intro';summary.textContent='Klinische Inhalte bleiben im lokalen Vault. Cloud-CRM und Workspace-Methoden verwenden getrennte Speicherwege.';
  tabs.after(summary);
  get('bd127VaultAction').addEventListener('click',()=>{
   const h=state.vaultHealth;if(h.ok&&!h.unlocked)get('vaultUnlockBtn')?.click();else if(h.unlocked)get('vaultLockBtn')?.click();else get('vaultRefreshBtn')?.click();
  });
 }
 function categorize(){
  const grid=$('#view-settings .settings-grid');
  if(grid){
   for(const panel of [...grid.children]){
    if(!panel.classList.contains('panel'))continue;
    const title=safe($('h2',panel)?.textContent).toLowerCase(),id=panel.id;
    let group='practice';
    if(id==='bd150TeamAccessPanel'||/praxis-team|team & zugänge/.test(title))group='team';
    else if(id==='browserCaptureSettings'||/mfa|2-faktor|sicherheit|zugangs/.test(id.toLowerCase())||/zweifaktor/.test(title))group='devices';
    else if(/roadmap|systemstand & nächste schritte/.test(title)){panel.dataset.bd127Group='archived';continue}
    panel.dataset.bd127Group=group;
   }
  }
  const vault=get('view-vault');if(vault){
   for(const el of [...vault.children]){
    if(el.id==='bd127VaultHeader'||el.classList.contains('bd127-tabbar')||el.id==='bd127VaultOverviewText')continue;
    let group='overview';
    if(el.id==='bd151VaultPanel')group='devices';
    if(el.id==='b1441BackupPanel')group='backup';
    if(el.id==='bdVault30Panel')group='methods';
    if(el.id==='bdDesktopUpdates52')group='archived'; // Rehomed to Software tab.
    el.dataset.bd127VaultGroup=group;
   }
  }
 }
 function consolidateUpdates(){
  const software=get('bd127Software'),vault=get('view-vault');if(!software||!vault)return;
  const desktop=get('bdDesktopUpdates52');if(desktop&&desktop.parentNode!==software)software.append(desktop);
  const dashboard=get('bdDesktopCockpit52');if(dashboard)dashboard.hidden=true;
  const shared=get('bdVault30Panel');
  if(shared){
   const sections=shared.querySelector('.settings-grid');const children=sections?[...sections.children]:[];
   if(children.length>1){
    const updater=children[0];
    if(updater.parentElement===sections){
     const updateCard=document.createElement('section');updateCard.id='bd127VaultUpdateCard';updateCard.className='panel bd127-vault-updates';
     const heading=document.createElement('h3');heading.textContent='Vault-Code aktualisieren';
     updateCard.append(heading,updater);software.append(updateCard);
    }
    const eyebrow=$('.eyebrow',shared),h2=$('h2',shared),p=$('p.muted',shared);
    if(eyebrow)eyebrow.textContent='Methoden & Zusammenarbeit';
    if(h2)h2.textContent='Gemeinsame Methoden synchronisieren';
    if(p)p.textContent='Gemeinsame Methoden und Übungen werden mit dem Workspace-Schlüssel verschlüsselt abgeglichen. Die persönliche Beratungsdokumentation bleibt getrennt.';
   }
  }
 }
 function activate(type,key){
  if(type==='settings'&&!settingsTabs.some(t=>t[0]===key))key='overview';
  if(type==='vault'&&!vaultTabs.some(t=>t[0]===key))key='overview';
  state[type]=key;
  const view=get(type==='settings'?'view-settings':'view-vault');if(!view)return;
  for(const b of view.querySelectorAll(`.bd127-tabbar [data-bd127-type="${type}"]`)){
   const active=b.dataset.bd127Tab===key;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');
  }
  if(type==='settings'){
   const grid=$('.bd127-settings-original',view);if(grid)grid.hidden=!['team','practice','devices'].includes(key);
   for(const panel of grid?[...grid.children]:[]){if(panel.dataset.bd127Group)panel.hidden=panel.dataset.bd127Group!==key;}
   for(const node of view.querySelectorAll('.bd127-special'))node.hidden=(key==='overview'&&node.id==='bd127SettingsOverview')?false:node.id!==({overview:'bd127SettingsOverview',academy:'bd127Academy',software:'bd127Software'}[key]||'');
   if(key==='software')refreshVersions();
  }else{
   const intro=get('bd127VaultOverviewText');if(intro)intro.hidden=key!=='overview';
   for(const el of [...view.children])if(el.dataset.bd127VaultGroup)el.hidden=el.dataset.bd127VaultGroup!==key;
  }
 }
 function statusFrom(v){
  if(!v||typeof v!=='object')return;
  state.vaultHealth=v;
  const visual=v.ok?(v.unlocked?'unlocked':'locked'):'offline';
  const label=visual==='unlocked'?'Entsperrt':visual==='locked'?'Gesperrt':'Nicht verbunden';
  const sub=visual==='unlocked'?'Lokale Akte zugänglich':visual==='locked'?'Daten verschlüsselt · lokal verbunden':'Vault-Dienst nicht erreichbar';
  const head=get('bd127VaultStatusHead');if(head)head.dataset.status=visual;
  const icon=get('bd127VaultIcon');if(icon)icon.innerHTML=svg(visual==='unlocked'?'open':visual==='locked'?'locked':'offline');
  if(get('bd127VaultHeadline'))get('bd127VaultHeadline').textContent=label;
  if(get('bd127VaultSub'))get('bd127VaultSub').textContent=sub;
  if(get('bd127VaultAction'))get('bd127VaultAction').textContent=visual==='unlocked'?'Jetzt sperren':visual==='locked'?'Entsperren':'Status prüfen';
  const rail=document.querySelector('.bd1541-bottom .bd1541-slot[data-key="vault"] > .bd1541-item');
  if(rail){rail.dataset.vaultStatus=visual;rail.innerHTML=svg(visual==='unlocked'?'open':visual==='locked'?'locked':'offline');rail.title='Secure Vault · '+label;rail.setAttribute('aria-label','Secure Vault · '+label);}
  const labelElm=get('vaultNavState');if(labelElm)labelElm.textContent=label.toLowerCase();
 }
 let lastPoll=0;
 async function refreshVault(force=false){
  if(state.busy||!window.BDVault?.checkHealth)return;
  if(!force&&Date.now()-lastPoll<5000)return;
  state.busy=true;lastPoll=Date.now();
  try{statusFrom(await window.BDVault.checkHealth())}catch(_){statusFrom({ok:false,setup:false,unlocked:false})}finally{state.busy=false;}
 }
 async function refreshVersions(){
  const desktop=get('bd127DesktopVersion'),vault=get('bd127VaultVersion');
  if(desktop){desktop.textContent='Nur in Desktop-App';
   if(location.hostname==='127.0.0.1'&&location.port==='47832')try{const r=await fetch('/desktop/status',{cache:'no-store'});const x=await r.json();desktop.textContent=x.version||'Nicht gemeldet'}catch(_){desktop.textContent='Nicht erreichbar'}}
  if(vault){vault.textContent='Nicht erreichbar';
   try{const h=await fetch('http://127.0.0.1:47831/update/status',{cache:'no-store'}).then(r=>r.json());vault.textContent=h.installed?('Code '+safe(h.installed)):'Nicht konfiguriert'}catch(_){try{const h=await fetch('http://127.0.0.1:47831/health',{cache:'no-store'}).then(r=>r.json());vault.textContent=h.version?('API '+safe(h.version)+' · Build '+safe(h.build||'?')):'Nicht erreichbar'}catch(__){}}
  }
 }
 function mount(){
  if(get('bd127SettingsHeader'))return;
  buildSettings();buildVault();
  categorize();consolidateUpdates();categorize();activate('settings','overview');activate('vault','overview');
  const grid=$('#view-settings .settings-grid'),vault=get('view-vault');
  if(grid)new MutationObserver(()=>{categorize();activate('settings',state.settings)}).observe(grid,{childList:true});
  if(vault)new MutationObserver(()=>{consolidateUpdates();categorize();activate('vault',state.vault)}).observe(vault,{childList:true});
  document.addEventListener('bd:vault-status',e=>statusFrom(e.detail));
  document.addEventListener('bd:vault-unlocked',()=>refreshVault(true));
  document.addEventListener('click',e=>{
   const rail=e.target.closest?.('.bd1541-bottom .bd1541-slot[data-key="vault"] > .bd1541-item');
   if(rail&&state.vaultHealth.ok&&!state.vaultHealth.unlocked){setTimeout(()=>get('vaultUnlockBtn')?.click(),100)}
   const btn=e.target.closest?.('[data-view]');if(btn?.dataset.view==='vault')refreshVault(true);
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshVault(true)});
  window.addEventListener('hashchange',()=>{if(location.hash==='#settings')activate('settings',state.settings)});
  setTimeout(()=>refreshVault(true),150);
  setInterval(()=>{if(!document.hidden)refreshVault(true)},15000);
  // Resync the rail after the legacy navigation mounts (without clobbering its handlers).
  setTimeout(()=>statusFrom(state.vaultHealth),500);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
