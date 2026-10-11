(()=>{'use strict';
const CATALOG=()=>Array.isArray(window.BDBreathCatalog)?window.BDBreathCatalog:[];
const KEY='bd_dashboard_breaths_v1';
const DEFAULTS=['physiological_sigh','extended_exhale','coherence','diaphragmatic','mindful','lion','ujjayi'];
const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function selected(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(x)&&x.length)return x}catch(_){}return DEFAULTS.slice()}
function save(ids){localStorage.setItem(KEY,JSON.stringify(ids))}
function level(x){return x.level||'Beginner'}function levelClass(x){return level(x).toLowerCase()}
function ensure(){if($('#breathPauseDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="breathPauseDialog" class="breath-pause-dialog"><div class="breath-pause-shell"><header class="breath-pause-head"><div><p class="eyebrow">Praxis-Cockpit</p><h2>Atemraum</h2><p>Übung auswählen, starten und mitatmen.</p></div><div class="breath-pause-actions"><button class="breath-pause-icon-btn" id="breathPauseSettingsBtn" type="button" title="Atembibliothek konfigurieren" aria-label="Atembibliothek konfigurieren">⚙</button><button class="breath-pause-icon-btn" id="breathPauseClose" type="button" aria-label="Schließen">×</button></div></header><div class="breath-pause-content" id="breathPauseContent"><section class="breath-pause-libraryview" id="breathPauseLibraryView"><div id="breathPauseLibrary" class="breath-pause-library"></div></section><section class="breath-pause-settings" id="breathPauseSettings" hidden><h3>Was soll hier erscheinen?</h3><p>Wähle die Übungen, die du im Praxis-Cockpit schnell erreichen möchtest.</p><div class="breath-config-list" id="breathPauseConfigList"></div><div class="breath-config-actions"><button class="breath-config-reset" id="breathPauseReset" type="button">Standard</button><button class="breath-config-save" id="breathPauseSave" type="button">Übernehmen</button></div></section></div><section class="breath-pause-player" id="breathPausePlayer" hidden><div class="breath-pause-playerbar"><button class="breath-pause-back" id="breathPauseBack" type="button">← Atembibliothek</button></div><iframe class="breath-pause-frame" id="breathPauseFrame" title="Atemübung"></iframe></section></div></dialog>`); $('#breathPauseClose').onclick=()=>stopSession(true);$('#breathPauseDialog').addEventListener('cancel',e=>{e.preventDefault();stopSession(true)});$('#breathPauseDialog').addEventListener('close',()=>stopSession(false));$('#breathPauseSettingsBtn').onclick=showSettings;$('#breathPauseBack').onclick=showLibrary;$('#breathPauseReset').onclick=()=>renderSettings(DEFAULTS);$('#breathPauseSave').onclick=()=>{const ids=[...document.querySelectorAll('#breathPauseConfigList input:checked')].map(x=>x.value);save(ids.length?ids:DEFAULTS);renderLibrary();showLibrary()};renderLibrary();}
// A small preview must exist for EVERY exercise, regardless of whether the public image assets are reachable.
// These are intentionally distinct diagrams, not a generic icon repeated for all exercises.
function previewSvg(x){
 const id=x.id;
 const round='<circle cx="32" cy="24" r="17" fill="none" stroke="#C96B4B" stroke-width="2"/>';
 const wave='<path d="M8 25Q16 10 24 25T40 25T56 25" fill="none" stroke="#759AB0" stroke-width="2.5" stroke-linecap="round"/>';
 const arrow='<path d="M15 31Q32 9 48 29m-9-3 9 3-3-9" fill="none" stroke="#C96B4B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
 const both='<path d="M13 16h36m-6-6 6 6-6 6M51 33H15m6-6-6 6 6 6" stroke="#C96B4B" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
 const marks={
  diaphragmatic:'<path d="M18 10Q32 3 46 10V37Q32 45 18 37Z" fill="none" stroke="#90766A" stroke-width="2"/><ellipse cx="32" cy="28" rx="11" ry="7" fill="#F5D7C9" stroke="#C96B4B" stroke-width="2"/>',
  extended_exhale:'<path d="M14 16Q28 5 41 15" fill="none" stroke="#759AB0" stroke-width="3" stroke-linecap="round"/><path d="M13 34Q35 47 51 23m-7 2 7-2-1 8" fill="none" stroke="#C96B4B" stroke-width="2.5" stroke-linecap="round"/>',
  coherence:'<rect x="13" y="18" width="9" height="20" rx="5" fill="#F1CEBE"/><rect x="27" y="9" width="9" height="30" rx="5" fill="#E6B8A5"/><rect x="41" y="18" width="9" height="20" rx="5" fill="#F1CEBE"/>',
  box:'<rect x="16" y="8" width="32" height="32" rx="6" fill="none" stroke="#90766A" stroke-width="2.5"/><circle cx="16" cy="8" r="4" fill="#C96B4B"/>',
  mindful:wave,
  physiological_sigh:'<path d="M14 35Q25 9 31 35Q42 9 51 35" stroke="#C96B4B" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M31 13v-7m-4 5 4-5 4 5" stroke="#759AB0" fill="none" stroke-width="2"/>',
  cyclic_sighing:wave+'<path d="M12 36h40" stroke="#C96B4B" stroke-width="2" stroke-dasharray="3 4"/>',
  resonance_breathing:round+'<circle cx="32" cy="24" r="9" fill="#F5DBCF" stroke="#759AB0" stroke-width="1.5"/>',
  sama_vritti:both,
  lion:'<circle cx="32" cy="23" r="18" stroke="#90766A" fill="none" stroke-width="2"/><circle cx="25" cy="20" r="2" fill="#90766A"/><circle cx="39" cy="20" r="2" fill="#90766A"/><path d="M26 29Q32 39 38 29" stroke="#C96B4B" stroke-width="2" fill="none"/><path d="M30 31v10" stroke="#C96B4B" stroke-width="3" stroke-linecap="round"/>',
  crocodile:'<path d="M11 31Q23 17 35 28L51 31M16 34h38" fill="none" stroke="#90766A" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="32" cy="35" rx="12" ry="4" fill="#F1CEBE"/>',
  susokukan:'<text x="32" y="33" text-anchor="middle" font-size="25" font-family="Georgia,serif" fill="#C96B4B">1·2</text>',
  soham:'<path d="M10 24C21 3 28 44 32 24S48 3 54 24S48 44 32 24" stroke="#C96B4B" stroke-width="2.5" fill="none"/>',
  om_chanting:'<circle cx="32" cy="24" r="8" fill="#F1CEBE"/><path d="M16 13Q3 24 16 35M48 13Q61 24 48 35" stroke="#759AB0" fill="none" stroke-width="2.5"/>',
  pursed_lip:'<path d="M12 23Q22 11 32 22Q42 11 52 23Q42 35 32 25Q22 35 12 23" stroke="#C96B4B" fill="none" stroke-width="2"/><path d="M52 24h10" stroke="#759AB0" stroke-width="2" stroke-dasharray="3 3"/>',
  dirga:'<circle cx="32" cy="10" r="7" fill="#F5E1D7" stroke="#C96B4B"/><circle cx="32" cy="24" r="9" fill="#F1CEBE" stroke="#C96B4B"/><circle cx="32" cy="39" r="7" fill="#EBC1AD" stroke="#C96B4B"/>',
  bhramari:'<ellipse cx="32" cy="24" rx="11" ry="8" fill="#F1CEBE" stroke="#90766A" stroke-width="1.6"/><path d="M27 17V31M35 17V31" stroke="#C96B4B" stroke-width="2"/><path d="M15 15Q6 23 15 33M49 15Q58 23 49 33" stroke="#759AB0" stroke-width="2" fill="none"/>',
  breathing_478:'<text x="32" y="30" text-anchor="middle" font-size="16" font-weight="700" fill="#C96B4B">4·7·8</text>',
  surya_bhedana:'<circle cx="32" cy="24" r="13" fill="#F5D7C9" stroke="#C96B4B" stroke-width="2"/><path d="M32 4v5m0 30v5M12 24h5m30 0h5M19 11l4 4m22 22-4-4M45 11l-4 4M19 37l4-4" stroke="#C96B4B" stroke-width="2"/>',
  buteyko:'<circle cx="32" cy="24" r="12" fill="none" stroke="#759AB0" stroke-width="2"/><circle cx="32" cy="24" r="4" fill="#F1CEBE"/>',
  papworth:'<path d="M17 40V15Q32 2 47 15v25" stroke="#90766A" fill="none" stroke-width="2"/><path d="M22 31Q32 24 42 31" stroke="#C96B4B" fill="none" stroke-width="2"/>',
  tonglen:'<path d="M32 37 17 23Q12 15 20 12Q27 10 32 17Q37 10 44 12Q52 15 47 23Z" fill="#F1CEBE" stroke="#C96B4B" stroke-width="1.5"/><path d="M8 25h10m-5-5 5 5-5 5M56 25H46m5-5-5 5 5 5" stroke="#759AB0" stroke-width="1.7" fill="none"/>',
  nadi_shodhana:both+'<circle cx="32" cy="24" r="5" fill="#F1CEBE"/>',
  chandra_bhedana:'<path d="M43 9A18 18 0 1 0 43 39A17 17 0 0 1 43 9Z" fill="#F1CEBE" stroke="#759AB0" stroke-width="2"/>',
  sheetali:'<path d="M32 7v28m-7-7 7 7 7-7" fill="none" stroke="#759AB0" stroke-width="2.6" stroke-linecap="round"/><path d="M18 14Q32 7 46 14" stroke="#C96B4B" stroke-width="2" fill="none"/>',
  ujjayi:'<path d="M24 8Q32 2 40 8v18Q39 37 32 41Q25 37 24 26Z" stroke="#90766A" fill="none" stroke-width="2"/><path d="M32 15v15" stroke="#C96B4B" stroke-width="3" stroke-linecap="round"/>',
  brahma_mudra:'<circle cx="32" cy="17" r="9" fill="#F1CEBE" stroke="#90766A" stroke-width="1.5"/><path d="M22 28Q32 23 42 28l6 14H16Z" stroke="#90766A" fill="none" stroke-width="2"/><path d="M47 13l6 5-6 5" stroke="#C96B4B" fill="none" stroke-width="2"/>',
  oxygen_advantage:arrow
 };
 return '<svg viewBox="0 0 64 48" role="img" aria-label="Vorschau '+esc(x.title)+'" focusable="false">'+(marks[id]||wave)+'</svg>';
}
function preview(x){
 const names={nadi_shodhana:'nadi-0',chandra_bhedana:'chandra-0',sheetali:'sheetali-0',ujjayi:'ujjayi-0',brahma_mudra:'brahma-1',oxygen_advantage:'oxygen-0'};
 const url=names[x.id]?'assets/images/breath/states/'+names[x.id]+'.svg?v=15.12.60':x.id==='lion'?'assets/images/breath/lion/lion-inhale.png?v=15.12.60':x.asset?'assets/images/breath/intermediate/'+encodeURIComponent(x.asset)+'?v=15.12.60':null;
 const fallback=previewSvg(x);
 return '<span class="breath-pause-thumb" data-breath-thumb="'+esc(x.id)+'">'+(url?'<img src="'+esc(url)+'" alt="'+esc(x.title)+'" loading="lazy">':fallback)+'</span>';
}
function renderLibrary(){const host=$('#breathPauseLibrary');if(!host)return;if(!host.dataset.thumbFallback){host.dataset.thumbFallback='1';host.addEventListener('error',e=>{const img=e.target;if(img?.tagName!=='IMG')return;const tile=img.closest('[data-breath-thumb]');if(!tile)return;const item=CATALOG().find(x=>x.id===tile.dataset.breathThumb);if(item)tile.innerHTML=previewSvg(item)},true)}const ids=new Set(selected()),items=CATALOG().filter(x=>ids.has(x.id));host.innerHTML=items.length?items.map(x=>`<button class="breath-pause-row" data-pause-breath="${esc(x.id)}" type="button">${preview(x)}<span><span class="breath-pause-title"><strong>${esc(x.title)}</strong><span class="breath-level ${levelClass(x)}">${esc(level(x))}</span></span><small class="breath-pause-purpose">${esc(x.purposeShort)}</small></span><span class="breath-pause-meta">${Number(x.minutes||3)} Min.</span><span aria-hidden="true">›</span></button>`).join(''):'<div class="breath-pause-empty">Noch keine Übungen ausgewählt.</div>';host.querySelectorAll('[data-pause-breath]').forEach(b=>b.onclick=()=>openBreath(b.dataset.pauseBreath))}
function renderSettings(force){const ids=new Set(force||selected()),host=$('#breathPauseConfigList');host.innerHTML=CATALOG().map(x=>`<label class="breath-config-item"><input type="checkbox" value="${esc(x.id)}" ${ids.has(x.id)?'checked':''}><span><strong>${esc(x.title)}</strong><small><span class="breath-level ${levelClass(x)}">${esc(level(x))}</span> · ${Number(x.minutes||3)} Min.</small></span></label>`).join('')}
function showSettings(){stopSession(false);renderSettings();$('#breathPauseLibraryView').hidden=true;$('#breathPauseSettings').hidden=false;$('#breathPausePlayer').hidden=true;$('#breathPauseContent').hidden=false}
function stopSession(closeDialog=false){const f=$('#breathPauseFrame');if(f){try{f.contentWindow?.postMessage({type:'bd-breath-force-stop'},location.origin)}catch(_){}f.src='about:blank';}document.querySelectorAll('#breathPauseDialog audio,#breathPauseDialog video').forEach(a=>{a.pause();a.removeAttribute('src');a.load()});if(closeDialog&&$('#breathPauseDialog')?.open)$('#breathPauseDialog').close()}
function showLibrary(){stopSession(false);$('#breathPausePlayer').hidden=true;$('#breathPauseSettings').hidden=true;$('#breathPauseLibraryView').hidden=false;$('#breathPauseContent').hidden=false;renderLibrary()}
function openBreath(id){$('#breathPauseContent').hidden=true;$('#breathPausePlayer').hidden=false;$('#breathPauseFrame').src='breath-standalone15-12-18.html?breath='+encodeURIComponent(id)}
function boot(){const btn=$('#cockpitBreathPause');if(!btn)return;ensure();btn.onclick=()=>{showLibrary();$('#breathPauseDialog').showModal()};window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='bd-breath-close')return;showLibrary()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
