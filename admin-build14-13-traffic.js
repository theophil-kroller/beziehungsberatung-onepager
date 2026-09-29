(()=>{'use strict';
const details=document.getElementById('cockpitMetrics'),days=document.getElementById('cockpitTrafficDays'),status=document.getElementById('cockpitTrafficStatus'),target=document.getElementById('cockpitTrafficResults');
if(!details||!days||!target)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const countryName=new Intl.DisplayNames(['de'],{type:'region'});
function column(title,rows,convert=x=>x){return '<div class="cockpit-traffic-column"><h3>'+title+'</h3>'+(rows.length?'<ol>'+rows.map(x=>'<li><span>'+esc(convert(x.label))+'</span><strong>'+Number(x.count||0).toLocaleString('de-AT')+'</strong></li>').join('')+'</ol>':'<p class="muted micro">Noch keine Daten.</p>')+'</div>'}
let loading=false;
async function load(){if(!details.open||loading)return;const api=String(window.BD_BOOKING_CONFIG?.apiBaseUrl||'').replace(/\/$/,''),token=sessionStorage.getItem('bd_admin_session_v1')||'';if(!api||!token){status.textContent='Cloud-Anmeldung erforderlich.';return}loading=true;status.textContent='Website-Aufrufe werden geladen …';try{const r=await fetch(api+'/admin/site-traffic?days='+days.value,{headers:{Authorization:'Bearer '+token},cache:'no-store'}),x=await r.json();if(!r.ok||!x.ok)throw Error(x.error||'Auswertung nicht erreichbar');status.textContent=Number(x.pageViews||0).toLocaleString('de-AT')+' Seitenaufrufe · letzte '+x.days+' Tage';target.innerHTML=column('Herkunft',x.sources||[])+column('Länder',x.countries||[],s=>/^[A-Z]{2}$/.test(s)?countryName.of(s):s)+column('Regionen',x.regions||[])+column('Sprachen',x.languages||[],s=>{try{return /^[a-z]{2,3}$/.test(s)?new Intl.DisplayNames(['de'],{type:'language'}).of(s):s}catch(_){return s}})}catch(e){status.textContent=e.message;target.innerHTML=''}finally{loading=false}}
details.addEventListener('toggle',()=>{if(details.open)load()});days.addEventListener('change',load);
})();
