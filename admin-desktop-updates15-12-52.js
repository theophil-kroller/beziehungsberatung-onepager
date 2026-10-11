/* BD 15.12.52: Desktop downloads, distinct versions & cached GitHub release history.
   Only localhost endpoints are called; the release feed is fetched by the Go launcher.
   Vault updater installation remains independent and requires its signed manifest. */
(() => {
 'use strict';
 const host='http://127.0.0.1:47832';
 const releaseHome='https://github.com/theophil-kroller/beziehungsberatung-onepager/releases';
 const $=s=>document.querySelector(s);
 const elem=(tag,content,classes)=>{
   const e=document.createElement(tag);
   if (content!==undefined&&content!==null)e.textContent=String(content);
   if(classes)e.className=classes;
   return e;
 };
 const addLink=(root,title,url)=>{
   const a=elem('a',title,'bdUpdateLink');a.href=url;a.target='_blank';a.rel='noopener noreferrer';root.append(a);return a;
 };
 function init(){
  if($('#bdDesktopUpdates52'))return;
  const section=$('#view-vault');if(!section)return;
  const card=elem('section',null,'panel');card.id='bdDesktopUpdates52';
  const kicker=elem('p','Software · Desktop & Vault','eyebrow');
  const h=elem('h2','App-Downloads & Versionen');
  const p=elem('p','Desktop-Updates werden einmal täglich über GitHub geprüft. Keine Cloudflare-Worker-Anfragen. Persönliche Vault-Daten bleiben lokal.','muted');
  const state=elem('p','Prüfe Desktop-Version …','micro muted');state.id='bdDesktopUpdateState';state.setAttribute('role','status');
  const controls=elem('div',null,'stack-actions');
  const btn=elem('button','Versionen prüfen','btn secondary');btn.type='button';btn.id='bdDesktopCheckNow';
  controls.append(btn);addLink(controls,'Alle GitHub-Releases ↗',releaseHome);
  const downloads=elem('div',null,'bdUpdatesDownloads');downloads.id='bdUpdatesDownloads';
  const history=elem('details',null,'bdUpdatesHistory');history.append(elem('summary','Veröffentlichungen & Versionshistorie'));const list=elem('div',null);list.id='bdUpdatesHistoryList';history.append(list);
  const note=elem('p','Sicherheitsstatus: Die Mac-App ist derzeit nicht Apple-notarisiert. Für unbeaufsichtigte Selbstinstallation fehlen außerdem signierte Desktop-Releases. Deshalb wird kein ungeprüftes Paket automatisch installiert.','micro muted');
  card.append(kicker,h,p,state,controls,downloads,history,note);
  const before=$('#b1441BackupPanel');if(before)before.parentNode.insertBefore(card,before);else section.append(card);
  btn.addEventListener('click',()=>check(true));
  // Compact download/navigation block in the admin cockpit without another large card.
  const dashboard=$('#view-dashboard');
  if(dashboard && !$('#bdDesktopCockpit52')){
    const mini=elem('details',null,'panel');mini.id='bdDesktopCockpit52';
    mini.append(elem('summary','App-Versionen, Mac-/Windows-Downloads & Update-Status'));
    const summary=elem('p','Version wird geprüft …','micro muted');summary.id='bdDesktopCockpitStatus52';
    mini.append(summary);addLink(mini,'GitHub Downloads öffnen ↗',releaseHome);
    dashboard.append(mini);
  }
  refresh();
 }
 const archive=(e)=>e&&typeof e==='object'&&Array.isArray(e.releases);
 const norm=(s)=>String(s||'').replace(/[^\w.\- ]/g,'').slice(0,150);
 function render(s){
  const text=$('#bdDesktopUpdateState'),downloads=$('#bdUpdatesDownloads'),history=$('#bdUpdatesHistoryList');
  if(!text||!downloads||!history)return;
  const current=norm(s.desktopVersion)||'?';const checked=s.checkedAt?new Date(s.checkedAt).toLocaleString('de-AT'):'Noch nicht geprüft';
  let copy=`Desktop ${current} · ${s.platform==='darwin'?'macOS':s.platform==='windows'?'Windows':'Unbekannte Plattform'} · zuletzt geprüft: ${checked}`;
  if(s.checking)copy+=' · prüft GitHub …';
  if(s.available&&s.latest)copy+=` · Update ${norm(s.latest.version)} verfügbar`;
  if(s.lastError)copy+=` · GitHub derzeit nicht erreichbar (${norm(s.lastError)})`;
  text.textContent=copy;
  const cockpit=$('#bdDesktopCockpitStatus52');if(cockpit)cockpit.textContent=copy;
  downloads.replaceChildren();history.replaceChildren();
  const preferred=s.latest||s.releases.find(r=>r.assetUrl)||s.releases[0];
  const row=elem('div',null,'bdUpdatesAssets');
  if(preferred?.assetUrl){addLink(row,`Passende Desktop-App ${norm(preferred.version)} herunterladen ↗`,preferred.assetUrl)}
  else{addLink(row,'Windows & Mac herunterladen ↗',releaseHome)}
  downloads.append(row);
  const vaultInfo=elem('p','Vault-Updates werden unabhängig davon im Bereich „Vault-Verwaltung“ geprüft und benötigen ein signiertes Update-Manifest.','micro muted');downloads.append(vaultInfo);
  if(!s.releases.length){history.append(elem('p','Noch kein Release-Verlauf im lokalen Cache. „Versionen prüfen“ anklicken.','micro muted'));return}
  for(const r of s.releases){
    const line=elem('div',null,'bdUpdateHistoryItem');line.append(elem('span',`${norm(r.version)} · ${norm(r.title||'Desktop')} ${r.prerelease?'· Vorschau':''}`));
    if(r.url)addLink(line,'GitHub ↗',r.url);
    if(r.assetUrl)addLink(line,'Download ↗',r.assetUrl);
    history.append(line);
  }
 }
 let inProgress=false;
 async function refresh(){
  try{
    const r=await fetch(host+'/desktop/updates/status',{cache:'no-store',credentials:'omit'});
    if(!r.ok)throw Error('Desktop-Dienst nicht verfügbar');
    const data=await r.json();if(!archive(data))throw Error('Ungültige Antwort');
    render(data);
  }catch(e){
    const state=$('#bdDesktopUpdateState');if(state)state.textContent='Desktop-Updateprüfung nur in der installierten Mac-/Windows-App verfügbar.';
    const cockpit=$('#bdDesktopCockpitStatus52');if(cockpit)cockpit.textContent='Öffne die installierte Desktop-App für den Versionsstatus.';
    const d=$('#bdUpdatesDownloads');if(d&&!d.querySelector('a'))addLink(d,'GitHub Releases öffnen ↗',releaseHome);
  }
 }
 async function check(manual){
  if(inProgress)return;inProgress=true;
  const btn=$('#bdDesktopCheckNow');if(btn)btn.disabled=true;
  try{
    // Enforce same-origin: external public web views get a download link only.
    if(location.origin!==host){return}
    if(manual){await fetch(host+'/desktop/updates/check',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:'{}'});}
    await refresh();
    // Network fetching is asynchronous, no tight polling.
    if(manual)setTimeout(refresh,1800);
  }catch(e){const st=$('#bdDesktopUpdateState');if(st)st.textContent='GitHub-Prüfung derzeit nicht erreichbar.'}
  finally{inProgress=false;if(btn)btn.disabled=false}
 }
 const css=document.createElement('style');css.textContent=`#bdDesktopUpdates52 .bdUpdatesAssets{margin:12px 0;display:flex;flex-wrap:wrap;gap:12px}#bdDesktopUpdates52 .bdUpdateLink{font-weight:600;color:var(--accent,#a75d44);text-decoration:underline;text-underline-offset:3px}#bdDesktopUpdates52 .bdUpdatesHistory{margin-top:12px;padding:12px 0}#bdDesktopUpdates52 .bdUpdateHistoryItem{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid rgba(120,110,100,.17);font-size:.9rem}#bdDesktopUpdates52 summary{cursor:pointer;font-weight:650}`;document.head.append(css);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
