(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=v=>{try{return v?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—'}catch(_){return String(v||'—')}};
  const data=()=>window.BDAdminUX?.getData?.()||{};
  const refOf=b=>String(b?.customerIdentityEmail||b?.email||'').trim();
  const nameOf=b=>String(b?.name||refOf(b).split('@')[0]||'Klient:in').trim();
  let prepContext=null,decorateTimer=null;

  function openBriefing(ref,booking=null){
    if(!ref)return;
    prepContext=booking?{eventId:String(booking.eventId||''),start:booking.start||'',type:booking.typeLabel||'Sitzung',name:nameOf(booking),ref}:null;
    window.BDAdminUX?.openClient?.(ref);
    setTimeout(()=>{
      document.querySelector('[data-record-tab="case-summary"]')?.click();
      setTimeout(injectPrepContext,260);
    },160);
  }

  async function injectPrepContext(){
    if(!prepContext)return;
    const host=$('#recordContent');if(!host)return;
    host.querySelector('.b1438-prep-context')?.remove();host.querySelector('.b1438-prep-gaps')?.remove();
    const box=document.createElement('aside');box.className='b1438-prep-context';
    box.innerHTML=`<div><span>Bevorstehende Sitzung</span><strong>${esc(prepContext.name)} · ${esc(fmt(prepContext.start))}</strong><small>${esc(prepContext.type)} · Briefing aus lokaler Fallhistorie. Rohquellen bleiben in der Timeline sichtbar.</small></div><span class="b1438-prep-ready">Session vorbereiten</span>`;
    host.prepend(box);
    if(!window.BDVault?.status?.().unlocked)return;
    try{
      const [client,inbox]=await Promise.all([window.BDVault.request('/client?ref='+encodeURIComponent(prepContext.ref)),window.BDVault.request('/documentation-inbox?status=open')]);
      const sessionIds=new Set((client.sessions||[]).map(x=>String(x.id))),now=Date.now();
      const past=(data().bookings||[]).filter(b=>refOf(b).toLowerCase()===prepContext.ref.toLowerCase()&&String(b.status||'booked').toLowerCase()!=='cancelled'&&new Date(b.start).getTime()<now);
      const missing=past.filter(b=>!sessionIds.has(String(b.eventId))).length,open=(inbox.items||[]).filter(x=>String(x.clientRef||'').toLowerCase()===prepContext.ref.toLowerCase()).length;
      if(missing||open){const note=document.createElement('aside');note.className='b1438-prep-gaps';note.innerHTML=`<strong>Dokumentationshinweis</strong><span>${open?`${open} offene Dokumentationsaufgabe${open===1?'':'n'}`:''}${open&&missing?' · ':''}${missing?`${missing} vergangene${missing===1?'r Termin':' Termine'} ohne finales Sitzungsprotokoll`:''}. Vorhandene Handschrift, Audio- oder Capture-Artefakte bleiben in der Fall-Timeline sichtbar.</span>`;box.after(note)}
    }catch(_){ }
  }

  function decorateNextBookings(){
    const rows=$$('#nextBookings .b143516-next-row');
    rows.forEach(row=>{
      if(row.querySelector('[data-b1438-prepare]'))return;
      const edit=row.querySelector('[data-booking-edit]'),eventId=edit?.dataset.bookingEdit;
      if(!eventId)return;
      const booking=(data().bookings||[]).find(x=>String(x.eventId)===String(eventId));if(!booking)return;
      const btn=document.createElement('button');btn.type='button';btn.className='btn primary compact b1438-prepare';btn.dataset.b1438Prepare=eventId;btn.textContent='Session vorbereiten';
      btn.onclick=e=>{e.stopPropagation();openBriefing(refOf(booking),booking)};
      edit?.before(btn);
    });
  }

  function decorateClientButtons(){
    $$('[data-client-flow-email]').forEach(btn=>{
      btn.textContent='Session vorbereiten';btn.title='Briefing und Fallübersicht öffnen';btn.dataset.b1438Prep='1';
    });
  }

  function recalcAttention(){
    const old=$('[data-build10-flow-attention]');if(old)old.hidden=true;
    const count=$('#attentionList')?.querySelectorAll('.attention-item:not([hidden]), article:not([hidden])').length;
    const badge=$('#attentionCount');if(badge&&Number.isFinite(count))badge.textContent=String(count);
  }

  async function existingSessionIds(bookings){
    const result=new Set(),byRef=new Map();
    bookings.forEach(b=>{const ref=refOf(b);if(ref&&!byRef.has(ref))byRef.set(ref,[]);if(ref)byRef.get(ref).push(b)});
    for(const [ref,rows] of [...byRef.entries()].slice(0,8)){
      try{const x=await window.BDVault.request('/client?ref='+encodeURIComponent(ref));(x.sessions||[]).forEach(s=>result.add(String(s.id)));}catch(_){ }
    }
    return result;
  }

  async function enrichInbox(host,items){
    if(!host||!window.BDVault?.status?.().unlocked)return;
    host.querySelectorAll('[data-b1438-open-task]').forEach(x=>x.remove());
    const now=Date.now(),cutoff=now-30*86400000;
    const recent=(data().bookings||[]).filter(b=>String(b.status||'booked').toLowerCase()!=='cancelled'&&new Date(b.start).getTime()<now&&new Date(b.start).getTime()>=cutoff).sort((a,b)=>new Date(b.start)-new Date(a.start)).slice(0,12);
    if(!recent.length)return;
    const documented=await existingSessionIds(recent),openSessionIds=new Set((items||[]).map(x=>String(x.sessionId||'')).filter(Boolean));
    const missing=recent.filter(b=>!documented.has(String(b.eventId))&&!openSessionIds.has(String(b.eventId))).slice(0,6);
    const total=(items||[]).length+missing.length;const count=$('#documentationInboxCount');if(count)count.textContent=String(total);const stats=$('#documentationInboxStats');if(stats&&missing.length){stats.querySelector('[data-b1438-post-count]')?.remove();stats.insertAdjacentHTML('beforeend',`<span data-b1438-post-count><b>${missing.length}</b> Nachbereitung offen</span>`)}
    for(const b of missing){
      const article=document.createElement('article');article.className='doc-inbox-row b1438-open-task';article.dataset.b1438OpenTask=String(b.eventId);
      article.innerHTML=`<div class="doc-inbox-icon">🕘</div><div class="doc-inbox-main"><div class="doc-inbox-title"><strong>${esc(nameOf(b))} · Termin beendet</strong><span class="doc-inbox-state assignment">Nachbereitung offen</span></div><p>${esc(fmt(b.start))} · ${esc(b.typeLabel||'Sitzung')} · kein finales lokales Sitzungsprotokoll gefunden</p><div class="doc-inbox-tags"><span>ohne Capture möglich</span></div></div><div class="doc-inbox-actions"><button class="btn primary" type="button">Dokumentation starten</button></div>`;
      article.querySelector('button').onclick=async()=>{
        if(!await window.BDVault.ensureUnlocked())return;
        const ref=refOf(b);if(!ref)return alert('Dieser Termin hat keine eindeutige Klient:innen-Referenz.');
        const x=await window.BDVault.post('/documentation-inbox',{ref,displayName:nameOf(b),captureId:'manual-session:'+String(b.eventId),sessionId:String(b.eventId),sessionDate:String(b.start||'').slice(0,10),captureType:'note',status:'processing',title:'Nachbereitung · '+nameOf(b),summary:'Termin ohne Capture · manuelle Dokumentation',hasAudio:false,hasInk:false,hasText:false,hasPhotos:false,createdAt:b.start});
        window.BDDocumentationInbox?.open?.(x.item);
      };
      host.appendChild(article);
    }
  }

  function interceptPrepClick(e){
    const btn=e.target.closest?.('[data-client-flow-email]');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    const ref=btn.dataset.clientFlowEmail;const booking=(data().bookings||[]).filter(b=>refOf(b).toLowerCase()===String(ref||'').toLowerCase()&&new Date(b.start).getTime()>=Date.now()).sort((a,b)=>new Date(a.start)-new Date(b.start))[0]||null;
    openBriefing(ref,booking);
  }

  function decorate(){decorateNextBookings();decorateClientButtons();recalcAttention();if(prepContext&&document.querySelector('[data-record-tab="case-summary"].active'))injectPrepContext()}
  function scheduleDecorate(){clearTimeout(decorateTimer);decorateTimer=setTimeout(decorate,90)}

  document.addEventListener('click',interceptPrepClick,true);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-record-tab="case-summary"]'))setTimeout(injectPrepContext,280)});
  document.addEventListener('bd:documentation-inbox-updated',scheduleDecorate);
  const observer=new MutationObserver(scheduleDecorate);
  function start(){observer.observe(document.body,{childList:true,subtree:true});decorate()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.BDDocumentationUX={enrichInbox,openBriefing,decorate};
})();
