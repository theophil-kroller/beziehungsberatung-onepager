/* Return to requested internal workspace only after authenticated CRM load. */
(()=>{'use strict';
 const ALLOWED=new Set(['hub.html','message-center.html','methods.html','workshops.html','newsletter-admin.html']);
 const KEY='bd103_post_login_destination';
 const input=new URLSearchParams(location.search).get('next');
 if(input){
  try{
   const u=new URL(input,location.href);
   if(u.origin===location.origin&&ALLOWED.has(u.pathname.split('/').pop().toLowerCase()))sessionStorage.setItem(KEY,u.pathname+u.search+u.hash)
  }catch(_){}
 }
 document.addEventListener('bd:cloud-snapshot',()=>{
   const dest=sessionStorage.getItem(KEY);
   if(!dest)return;
   sessionStorage.removeItem(KEY);
   const u=new URL(dest,location.href);
   if(u.origin===location.origin&&ALLOWED.has(u.pathname.split('/').pop().toLowerCase()))location.replace(u.href);
 });
})();