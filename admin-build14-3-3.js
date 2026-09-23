/* BUILD 14.3.3 — visual case path / goals / concise AI case summary.
   Read-only presentation layer. Full artifacts remain in the timeline/documentation. */
(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=v=>{if(!v)return'';const raw=String(v),d=new Date(raw.length===10?raw+'T12:00:00':raw);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};
  let busy=false,lastKey='';

  function ctx(){return window.BDClientRecordContext?.()||null}
  function byDateAsc(a,b){return new Date(a.date||a.finalizedAt||a.updatedAt||a.createdAt||0)-new Date(b.date||b.finalizedAt||b.updatedAt||b.createdAt||0)}
  function firstDate(rows){const x=(rows||[]).filter(Boolean).slice().sort((a,b)=>new Date(a.at||a.date||a.createdAt||0)-new Date(b.at||b.date||b.createdAt||0))[0];return x?.at||x?.date||x?.createdAt||''}
  function activeGoals(v){
    const rows=(v.goals||[]).filter(g=>!['closed','achieved','completed','done'].includes(String(g.status||'').toLowerCase()));
    if(rows.length)return rows.slice(0,5).map(g=>({title:g.title||'Ziel',detail:g.detail||'',status:g.status||''}));
    return (v.caseBriefing?.result?.activeGoals||[]).slice(0,5).map(x=>({title:String(x),detail:'',status:''}));
  }
  function step(label,state,target='',sub=''){
    const cls=['b1433-step',state].join(' '),attr=target?` data-target="${esc(target)}" tabindex="0" role="button"`:'';
    const icon=state==='done'?'✓':state==='current'?'●':state==='planned'?'•':'○';
    return `<div class="${cls}"${attr}><span class="b1433-dot">${icon}</span><span class="b1433-label">${esc(label)}${sub?`<small style="display:block;font-weight:650;margin-top:2px;opacity:.72">${esc(sub)}</small>`:''}</span></div>`;
  }
  function pathModel(v,c){
    const consultations=(v.initialConsultations||[]).slice().sort(byDateAsc);
    const sessions=(v.sessions||[]).slice().sort(byDateAsc);
    const activity=c?.activities||[];
    const completed=String(c?.lifecycle?.clientStatus||'').toLowerCase()==='completed';
    const contactActivity=activity.find(x=>/anfrage|kontakt|website|e-mail|email|telefon|whatsapp/i.test(`${x.title||''} ${x.detail||''}`));
    const contactDone=!!(contactActivity||activity.length||consultations.length||sessions.length);
    const nodes=[];
    nodes.push({label:'Kontaktaufnahme',state:contactDone?'done':'open',target:contactActivity?'contact':''});
    const ic=consultations[0];
    nodes.push({label:'Erstgespräch',state:ic?'done':'open',target:ic?`consultation:${ic.id}`:'',sub:ic?fmt(ic.date||ic.finalizedAt||ic.updatedAt):''});
    const n=sessions.length;
    if(n<=20){
      sessions.forEach((s,i)=>nodes.push({label:`Sitzung ${i+1}`,state:i===n-1&&!completed?'current':'done',target:`session:${s.id}`,sub:fmt(s.date)}));
    }else{
      const first20=sessions.slice(0,20),rest=sessions.slice(20,-1),current=sessions[n-1];
      nodes.push({label:'Sitzungen 1–20',state:'done',target:`session:${first20[first20.length-1].id}`,sub:`${fmt(first20[0]?.date)} – ${fmt(first20.at(-1)?.date)}`});
      if(rest.length)nodes.push({label:`Sitzungen 21–${n-1}`,state:'done',target:`session:${rest.at(-1).id}`,sub:`${rest.length} Sitzungen`});
      nodes.push({label:`Aktuell · Sitzung ${n}`,state:completed?'done':'current',target:`session:${current.id}`,sub:fmt(current.date)});
    }
    if(c?.nextBooking&&!completed)nodes.push({label:'Nächster Termin',state:'planned',target:'',sub:fmt(c.nextBooking.start)});
    nodes.push({label:'Abschluss',state:completed?'done':'open',target:''});
    return nodes;
  }
  function render(v,c){
    const host=$('.b139-shell');if(!host||host.querySelector('.b1433-overview'))return;
    const nodes=pathModel(v,c),goals=activeGoals(v),b=v.caseBriefing,r=b?.result||{};
    const summary=r.currentSituation||v.client?.overview||'Noch keine KI-Fallzusammenfassung vorhanden. Das Fallbriefing kann aus den vorhandenen lokalen Quellen erstellt werden.';
    const sessionCount=(v.sessions||[]).length;
    const html=`<section class="b1433-overview" aria-label="Visueller Fallüberblick">
      <div class="b1433-path-card">
        <div class="b1433-path-head"><div><span class="b1433-card-kicker">Prozess</span><h4>Fallpfad</h4><p>Auf einen abgeschlossenen Schritt klicken, um direkt zur zugehörigen Stelle in der Timeline zu springen.</p></div><span class="b1433-path-meta">${sessionCount} ${sessionCount===1?'Sitzung':'Sitzungen'}</span></div>
        <div class="b1433-path-scroll"><div class="b1433-path">${nodes.map(n=>step(n.label,n.state,n.target,n.sub)).join('')}</div></div>
      </div>
      <div class="b1433-insights">
        <article class="b1433-insight-card"><span class="b1433-card-kicker">Orientierung</span><h4>Aktive Ziele</h4>${goals.length?`<div class="b1433-goals">${goals.map(g=>`<div class="b1433-goal"><i></i><div><strong>${esc(g.title)}</strong>${g.detail?`<span>${esc(g.detail)}</span>`:''}</div></div>`).join('')}</div>`:'<div class="b1433-empty">Noch keine aktiven Ziele dokumentiert.</div>'}</article>
        <article class="b1433-insight-card"><span class="b1433-card-kicker">Lokale KI</span><h4>Fallzusammenfassung</h4><div class="b1433-summary-body">${esc(summary)}</div><div class="b1433-summary-foot"><span class="b1433-review ${b?.reviewStatus==='approved'?'approved':''}">${b?(b.reviewStatus==='approved'?'Geprüft':'KI-Entwurf – bitte prüfen'):'Noch kein Fallbriefing'}</span>${b?.updatedAt?`<span>Stand ${fmt(b.updatedAt)}</span>`:''}</div></article>
      </div>
    </section>`;
    const intro=host.querySelector('.b139-intro');
    if(intro)intro.insertAdjacentHTML('afterend',html);else host.insertAdjacentHTML('afterbegin',html);
    bindPath();
  }
  function showAllTimeline(){
    const all=document.querySelector('[data-b139-filter="all"]');if(all&&!all.classList.contains('active'))all.click();
    const range=$('#b141Range');if(range&&range.value!=='all'){range.value='all';range.dispatchEvent(new Event('change',{bubbles:true}))}
  }
  function findContactTarget(){
    const events=[...document.querySelectorAll('.b139-event')];
    return events.find(e=>/kontakt|anfrage|website|e-mail|email|telefon|whatsapp/i.test(e.textContent||''))||events.at(-1)||null;
  }
  function openTarget(target){
    showAllTimeline();
    setTimeout(()=>{
      const el=target==='contact'?findContactTarget():document.getElementById('b139-'+target);
      if(!el)return;
      el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('b1433-focus');setTimeout(()=>el.classList.remove('b1433-focus'),1800);
    },80);
  }
  function bindPath(){
    document.querySelectorAll('.b1433-step[data-target]').forEach(x=>{
      const go=()=>openTarget(x.dataset.target);
      x.addEventListener('click',go);x.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
    });
  }
  async function inject(){
    const c=ctx(),shell=$('.b139-shell');if(!c||!shell||busy)return;
    const key=`${c.email}|${shell.dataset.b1433Stamp||''}`;
    if(shell.querySelector('.b1433-overview'))return;
    if(!window.BDVault?.status?.()?.unlocked)return;
    busy=true;
    try{
      const v=await window.BDVault.request('/client?ref='+encodeURIComponent(c.email));
      render(v,c);lastKey=key;
    }catch(_){/* existing case-summary UI already handles Vault errors */}
    finally{busy=false}
  }
  function schedule(){setTimeout(inject,120)}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-record-tab="case-summary"]'))schedule()});
  const obs=new MutationObserver(()=>{if($('.b139-shell')&&!$('.b1433-overview'))schedule()});
  function boot(){const r=$('#recordContent');if(r)obs.observe(r,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
