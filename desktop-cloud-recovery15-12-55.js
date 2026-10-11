/* Build 15.12.55: narrow, authenticated recovery channel for shared methods.
   Only the three end-to-end-encrypted workspace-method endpoints are eligible.
   No clinic backup, login, payment or other write request is replayed. */
(()=>{'use strict';
  const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname) && location.port === '47832';
  if (!local || window.__BDCloudMethodRecovery) return;
  window.__BDCloudMethodRecovery = true;
  const CLOUD = 'https://beziehungsdynamiken-booking.theophil-kroller.workers.dev';
  const prefix = location.origin + '/desktop/cloud';
  const safe = new Set(['/admin/workspace/methods/status','/admin/workspace/methods/delta','/admin/workspace/methods/push']);
  const nativeFetch = window.fetch.bind(window);
  const stats = {lastRoute:'',lastFallback:'',lastError:'',usedFallback:false};
  function allowed(req) {
    const url = new URL(req.url);
    const route = url.pathname.startsWith('/desktop/cloud/') ? url.pathname.slice('/desktop/cloud'.length) : '';
    return url.origin === location.origin && safe.has(route) && (req.method === 'GET' || (route.endsWith('/push') && req.method === 'POST')) ? {route,url} : null;
  }
  function explain(e) {
    const t = String(e?.message||e||'');
    return /Load failed|Failed to fetch|NetworkError|fetch/i.test(t)
      ? 'Die Cloud-Verbindung ist gerade nicht erreichbar. Bitte Internetverbindung prüfen und später erneut versuchen.' : t;
  }
  window.BDCloudMethodRecovery = {stats:()=>({...stats})};
  window.fetch = async function(input, init) {
    const request = new Request(input,init);
    const match = allowed(request);
    if (!match) return nativeFetch(input, init);
    const backup = request.clone();
    let result;
    try { result = await nativeFetch(request); }
    catch (e) { stats.lastError = explain(e); result = null; }
    if (result && result.status !== 502 && result.status !== 503 && result.status !== 504) return result;
    if (result) {
      // Switch only on known desktop transport failure, never on a Worker 503
      // (e.g. missing D1 migration) or a 502 from another backend layer.
      const body = await result.clone().json().catch(()=>({}));
      if (!/Cloud ist momentan nicht erreichbar/.test(String(body.error||''))) return result;
    }
    stats.lastRoute = match.route;
    try {
      const destination = CLOUD + match.route + match.url.search;
      // Browser HTTPS stack may work even when the macOS Go TLS/DNS stack fails.
      const direct = new Request(destination, backup);
      const response = await nativeFetch(direct);
      stats.usedFallback=true;stats.lastFallback=new Date().toISOString();stats.lastError='';
      document.dispatchEvent(new CustomEvent('bd:cloud-method-recovered'));
      return response;
    } catch (err) {
      stats.lastError = explain(err);
      document.dispatchEvent(new CustomEvent('bd:cloud-method-unavailable',{detail:{reason:stats.lastError}}));
      // Preserve structured 502 for accurate diagnostics if one was returned.
      if (result) return result;
      throw new TypeError(stats.lastError);
    }
  };
})();
