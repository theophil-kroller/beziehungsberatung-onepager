(function(){
  'use strict';
  const API=(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,''),SESSION_KEY='bd_admin_session_v1';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let programCache=[],packageCache=[];
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init={}){
    const url=String(typeof input==='string'?input:input?.url||'');
    if(url.endsWith('/admin/programs/save')&&String(init.method||'GET').toUpperCase()==='POST'&&init.body){
      try{
        const body=JSON.parse(init.body);
        body.visibleFrom=readDateTime('#pgVisibleFrom');
        body.visibleUntil=readDateTime('#pgVisibleUntil');
        init={...init,body:JSON.stringify(body)};
      }catch(_){ }
    }
    const response=await nativeFetch(input,init);
    if(url.endsWith('/admin/programs')&&response.ok){
      response.clone().json().then(x=>{programCache=x.programs||[];queueMicrotask(enhanceProgramCards)}).catch(()=>{});
    }
    return response;
  };
  async function api(path,opt={}){
    const headers={...(opt.headers||{})},token=sessionStorage.getItem(SESSION_KEY)||'';
    if(token)headers.Authorization='Bearer '+token;
    const r=await nativeFetch(API+path,{...opt,headers,cache:'no-store'}),x=await r.json().catch(()=>({}));
    if(!r.ok||x.ok===false)throw new Error(x.error||'Anfrage fehlgeschlagen');
    return x;
  }
  const post=(path,body)=>api(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  function parts(value){
    if(!value)return{date:'',time:''};
    const d=new Date(value);if(!Number.isFinite(d.getTime())){const [date,time='']=String(value).split('T');return{date,time:time.slice(0,5)}}
    const p=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).reduce((o,a)=>(o[a.type]=a.value,o),{});
    return{date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`};
  }
  function options(selected=''){
    let html='<option value="">Uhrzeit</option>';
    for(let m=0;m<1440;m+=15){const v=`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;html+=`<option value="${v}"${v===selected?' selected':''}>${v}</option>`}
    return html;
  }
  function combine(date,time){return date&&time?`${date}T${time}`:''}
  function readDateTime(prefix){const date=$(prefix+'Date')?.value||'',time=$(prefix+'Time')?.value||'';if(!date||!time)return null;const d=new Date(`${date}T${time}`);return Number.isFinite(d.getTime())?d.toISOString():null}
  function dateTimeFields(id,label,value='',required=false){const p=parts(value);return `<div class="dt-control" id="${id}"><span>${label}${required?' <b class="required-star">*</b>':''}</span><div><input id="${id}Date" type="date" value="${esc(p.date)}"${required?' required':''}><select id="${id}Time"${required?' required':''}>${options(p.time)}</select></div></div>`}
  function upgradeDateTime(input,label,required=false){
    if(!input||input.dataset.upgraded)return;input.dataset.upgraded='1';input.type='hidden';
    const p=parts(input.value),box=document.createElement('div');box.className='dt-inline';
    box.innerHTML=`<span>${label}${required?' <b class="required-star">*</b>':''}</span><div><input type="date" data-part="date" value="${esc(p.date)}"${required?' required':''}><select data-part="time"${required?' required':''}>${options(p.time)}</select></div>`;
    input.insertAdjacentElement('afterend',box);
    const sync=()=>{input.value=combine(box.querySelector('[data-part=date]').value,box.querySelector('[data-part=time]').value);input.dispatchEvent(new Event('change',{bubbles:true}))};
    box.querySelectorAll('input,select').forEach(x=>x.addEventListener('change',sync));
    return{box,sync};
  }
  function plusMinutes(value,minutes){const d=new Date(value);if(!Number.isFinite(d.getTime()))return'';d.setMinutes(d.getMinutes()+minutes);const p=parts(d);return combine(p.date,p.time)}
  function setControl(box,value){const p=parts(value);box.querySelector('[data-part=date]').value=p.date;box.querySelector('[data-part=time]').value=p.time}
  function enhanceWizard(){
    const wizard=$('#programWizard');if(!wizard)return;
    const title=$('#programWizardTitle');if(title&&!title.dataset.build){title.dataset.build='136';const eye=wizard.querySelector('.eyebrow');if(eye)eye.textContent='BUILD 13.6 · Programme & Gruppen'}
    wizard.querySelectorAll('label').forEach(label=>{const field=label.querySelector('[required]');if(field&&!label.querySelector('.required-star')&&!label.querySelector('.dt-inline'))label.firstChild?.after?.(Object.assign(document.createElement('b'),{className:'required-star',textContent:' *'}))});
    const grid=wizard.querySelector('[data-pane="1"] .wizard-grid');
    if(grid&&!$('#pgVisibleFrom')){
      grid.insertAdjacentHTML('beforeend',dateTimeFields('pgVisibleFrom','Sichtbar ab')+dateTimeFields('pgVisibleUntil','Sichtbar bis'));
      const deadline=$('#pgDeadline'),control=upgradeDateTime(deadline,'Buchungsschluss');if(control)deadline.closest('label').classList.add('datetime-upgraded');
    }
    $$('#sessionRows .repeat-row').forEach(row=>{
      if(row.dataset.timeUpgrade)return;row.dataset.timeUpgrade='1';row.classList.add('session-row');
      const start=row.querySelector('[data-k="start"]'),end=row.querySelector('[data-k="end"]'),a=upgradeDateTime(start,'Beginn',true),b=upgradeDateTime(end,'Ende',true);
      if(!a||!b)return;
      let endTouched=!!end.value;
      b.box.querySelectorAll('input,select').forEach(x=>x.addEventListener('change',()=>{endTouched=true}));
      a.box.querySelectorAll('input,select').forEach(x=>x.addEventListener('change',()=>{
        const suggested=plusMinutes(start.value,90);
        if(suggested&&(!endTouched||!end.value||new Date(end.value)<=new Date(start.value))){setControl(b.box,suggested);b.sync();endTouched=false}
      }));
    });
    if(!wizard.dataset.validation){
      wizard.dataset.validation='1';
      $('#programForm')?.addEventListener('submit',validateProgram,true);
      $('#programPublish')?.addEventListener('click',validateProgram,true);
    }
  }
  function validateProgram(e){
    for(const row of $$('#sessionRows .repeat-row')){const start=row.querySelector('[data-k="start"]')?.value,end=row.querySelector('[data-k="end"]')?.value;if(start&&end&&new Date(end)<=new Date(start)){e.preventDefault();e.stopImmediatePropagation();alert('Bei jedem Termin muss die Endzeit nach der Anfangszeit liegen.');return false}}
    const from=readDateTime('#pgVisibleFrom'),until=readDateTime('#pgVisibleUntil');if(from&&until&&new Date(until)<=new Date(from)){e.preventDefault();e.stopImmediatePropagation();alert('„Sichtbar bis“ muss nach „Sichtbar ab“ liegen.');return false}
  }
  function populateVisibility(id){const p=programCache.find(x=>x.id===Number(id));if(!p)return;setTimeout(()=>{enhanceWizard();for(const [prefix,value] of [['#pgVisibleFrom',p.visibleFrom],['#pgVisibleUntil',p.visibleUntil]]){const bits=parts(value);$(prefix+'Date').value=bits.date;$(prefix+'Time').value=bits.time}},0)}
  function enhanceProgramCards(){
    const filter=$('#programFilter');if(filter&&!filter.querySelector('option[value="archived"]'))filter.insertAdjacentHTML('beforeend','<option value="archived">Archiviert</option>');
    const fresh=$('#newProgramBtn');if(fresh&&!fresh.dataset.visibilityReset){fresh.dataset.visibilityReset='1';fresh.addEventListener('click',()=>setTimeout(()=>{enhanceWizard();for(const prefix of ['#pgVisibleFrom','#pgVisibleUntil']){$(prefix+'Date').value='';$(prefix+'Time').value=''}},0))}
    $$('.program-card').forEach(card=>{
      const edit=card.querySelector('[data-program-edit]');if(!edit||card.dataset.lifecycle)return;card.dataset.lifecycle='1';const id=Number(edit.dataset.programEdit),p=programCache.find(x=>x.id===id),actions=card.querySelector('.program-actions');
      if(p&&(p.visibleFrom||p.visibleUntil)){const note=document.createElement('p');note.className='muted micro publication-window';note.textContent=`Online: ${p.visibleFrom?new Date(p.visibleFrom).toLocaleString('de-AT'):'sofort'} bis ${p.visibleUntil?new Date(p.visibleUntil).toLocaleString('de-AT'):'unbegrenzt'}`;actions?.before(note)}
      edit.addEventListener('click',()=>populateVisibility(id));
      if(actions){actions.insertAdjacentHTML('beforeend',`<button class="mini" data-program-archive="${id}">Archivieren</button>${!p?.enrollments?.length?`<button class="mini danger" data-program-delete="${id}">Löschen</button>`:''}`)}
    });
    $$('[data-program-archive]').forEach(b=>b.onclick=()=>lifecycleProgram(Number(b.dataset.programArchive),'archive'));
    $$('[data-program-delete]').forEach(b=>b.onclick=()=>lifecycleProgram(Number(b.dataset.programDelete),'delete'));
  }
  async function lifecycleProgram(id,action){const word=action==='delete'?'endgültig löschen':'archivieren';if(!confirm(`Angebot wirklich ${word}?`))return;try{await post('/admin/programs/lifecycle',{id,action});document.querySelector('[data-view="programs"]')?.click()}catch(e){alert(e.message)}}
  function packageCard(p){return `<article class="package-admin-card"><div><span class="status-chip ${p.active?'published':'archived'}">${p.active?'Aktiv':'Archiviert'}</span><h3>${esc(p.nameDe)}</h3><p>${p.sessionsTotal} × ${p.sessionMinutes} Min. · ${new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(p.priceCents/100)} · ${p.validityDays} Tage gültig</p><small>${p.publicVisible?'Auf der Website sichtbar':'Nicht öffentlich'} · ${esc(p.id)}</small></div><div class="program-actions"><button class="mini edit" data-package-edit="${esc(p.id)}">Bearbeiten</button><button class="mini" data-package-archive="${esc(p.id)}">Archivieren</button><button class="mini danger" data-package-delete="${esc(p.id)}">Löschen</button></div></article>`}
  async function loadPackages(){const host=$('#packageCatalogApp');if(!host)return;try{const x=await api('/admin/packages/catalog');packageCache=x.packages||[];host.innerHTML=`<section class="package-catalog-panel"><div class="program-toolbar"><div><p class="eyebrow">Produktkatalog</p><h2>Packages erstellen & verwalten</h2><p class="muted">Öffentliche Packages erscheinen automatisch auf der Angebotsseite.</p></div><button class="btn primary" id="newPackageBtn">+ Neues Package</button></div><div class="package-admin-grid">${packageCache.length?packageCache.map(packageCard).join(''):'<div class="empty">Noch keine Packages vorhanden.</div>'}</div></section>`;$('#newPackageBtn').onclick=()=>openPackage();$$('[data-package-edit]').forEach(b=>b.onclick=()=>openPackage(packageCache.find(p=>p.id===b.dataset.packageEdit)));$$('[data-package-archive]').forEach(b=>b.onclick=()=>packageLifecycle(b.dataset.packageArchive,'archive'));$$('[data-package-delete]').forEach(b=>b.onclick=()=>packageLifecycle(b.dataset.packageDelete,'delete'))}catch(e){host.innerHTML=`<div class="notice err">${esc(e.message)}</div>`}}
  function ensurePackageDialog(){if($('#packageDialog'))return;document.body.insertAdjacentHTML('beforeend',`<dialog id="packageDialog"><div class="dialog-shell wide"><button class="dialog-x" id="packageClose">×</button><p class="eyebrow">BUILD 13.6 · Packages</p><h2 id="packageTitle">Neues Package</h2><form id="packageForm" class="edit-form"><div class="wizard-grid"><label>Interne ID <b class="required-star">*</b><input id="pkId" required placeholder="z. B. begleitung-5"></label><label>Terminart <b class="required-star">*</b><select id="pkType"><option value="individual">Einzelberatung</option><option value="couple">Gemeinsame Beratung</option></select></label><label>Name Deutsch <b class="required-star">*</b><input id="pkNameDe" required></label><label>Name Englisch <b class="required-star">*</b><input id="pkNameEn" required></label><label>Einheiten <b class="required-star">*</b><input id="pkSessions" type="number" min="1" required></label><label>Minuten je Einheit <b class="required-star">*</b><input id="pkMinutes" type="number" min="15" step="5" required></label><label>Gültigkeit in Tagen <b class="required-star">*</b><input id="pkValidity" type="number" min="1" required></label><label>Preis in Euro <b class="required-star">*</b><input id="pkPrice" type="number" min="0" step="0.01" required></label><label class="full">Beschreibung Deutsch<textarea id="pkDescriptionDe" rows="3"></textarea></label><label class="full">Beschreibung Englisch<textarea id="pkDescriptionEn" rows="3"></textarea></label><label class="check"><input id="pkPublic" type="checkbox"><span>Auf der Angebotsseite anzeigen</span></label><label class="check"><input id="pkContinuation" type="checkbox" checked><span>Für Fortsetzungsangebote verfügbar</span></label><label class="check"><input id="pkActive" type="checkbox" checked><span>Package aktiv</span></label></div><p class="required-note"><b class="required-star">*</b> Pflichtfelder</p><div id="packageMsg"></div><div class="dialog-actions"><button class="btn ghost" id="packageCancel" type="button">Abbrechen</button><button class="btn primary" type="submit">Package speichern</button></div></form></div></dialog>`);$('#packageClose').onclick=$('#packageCancel').onclick=()=>$('#packageDialog').close();$('#packageForm').onsubmit=savePackage}
  function openPackage(p=null){ensurePackageDialog();$('#packageTitle').textContent=p?'Package bearbeiten':'Neues Package';const v=(id,x)=>$(id).value=x??'';v('#pkId',p?.id);$('#pkId').disabled=!!p;v('#pkType',p?.sessionType||'individual');v('#pkNameDe',p?.nameDe);v('#pkNameEn',p?.nameEn);v('#pkSessions',p?.sessionsTotal||5);v('#pkMinutes',p?.sessionMinutes||50);v('#pkValidity',p?.validityDays||365);v('#pkPrice',p?Number(p.priceCents/100).toFixed(2):'');v('#pkDescriptionDe',p?.descriptionDe);v('#pkDescriptionEn',p?.descriptionEn);$('#pkPublic').checked=!!p?.publicVisible;$('#pkContinuation').checked=p?.continuationVisible!==false;$('#pkActive').checked=p?.active!==false;$('#packageMsg').textContent='';$('#packageDialog').showModal()}
  async function savePackage(e){e.preventDefault();const body={id:$('#pkId').value.trim(),isNew:!$('#pkId').disabled,sessionType:$('#pkType').value,nameDe:$('#pkNameDe').value.trim(),nameEn:$('#pkNameEn').value.trim(),sessionsTotal:Number($('#pkSessions').value),sessionMinutes:Number($('#pkMinutes').value),validityDays:Number($('#pkValidity').value),priceCents:Math.round(Number($('#pkPrice').value)*100),descriptionDe:$('#pkDescriptionDe').value.trim(),descriptionEn:$('#pkDescriptionEn').value.trim(),publicVisible:$('#pkPublic').checked,continuationVisible:$('#pkContinuation').checked,active:$('#pkActive').checked};try{await post('/admin/packages/catalog/save',body);$('#packageDialog').close();await loadPackages()}catch(err){$('#packageMsg').className='notice err';$('#packageMsg').textContent=err.message}}
  async function packageLifecycle(id,action){if(!confirm(action==='delete'?'Package endgültig löschen? Bereits verwendete Packages werden geschützt.':'Package archivieren und von der Website nehmen?'))return;try{await post('/admin/packages/catalog/lifecycle',{id,action});await loadPackages()}catch(e){alert(e.message)}}
  const observer=new MutationObserver(()=>{enhanceWizard();enhanceProgramCards()});observer.observe(document.body,{childList:true,subtree:true});
  document.querySelector('[data-view="packages"]')?.addEventListener('click',loadPackages);
  document.addEventListener('bd:cloud-snapshot',()=>setTimeout(loadPackages,150));
  if(sessionStorage.getItem(SESSION_KEY))setTimeout(loadPackages,350);
})();
