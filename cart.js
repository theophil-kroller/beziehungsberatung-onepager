(function(){
  const KEY = "bd_cart_v1";
  function getCart(){try{const value=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(value))return[];return value.filter(item=>{const price=Number(item?.price);return item?.price!==null&&item?.price!==undefined&&item?.price!==""&&Number.isFinite(price)&&price>=0})}catch(e){return[]}}
  function saveCart(items){localStorage.setItem(KEY,JSON.stringify(items));updateBadges();window.dispatchEvent(new CustomEvent("bd-cart-updated",{detail:items}))}
  function count(items){return items.reduce((sum,item)=>sum+Math.max(1,Number(item.qty||1)),0)}
  function updateBadges(){const n=count(getCart());document.querySelectorAll("[data-cart-count]").forEach(el=>{el.textContent=String(n);el.hidden=n===0})}
  window.BDCart={get:getCart,set:saveCart,add(item){const items=getCart(),key=item.id||item.sku||item.name,existing=items.find(x=>(x.id||x.sku||x.name)===key);if(existing){if(item.unique||existing.unique)existing.qty=1;else existing.qty=Number(existing.qty||1)+Number(item.qty||1)}else items.push({...item,qty:Number(item.qty||1)});saveCart(items)},remove(key){saveCart(getCart().filter(x=>(x.id||x.sku||x.name)!==key))},clear(){saveCart([])},count(){return count(getCart())},updateBadges};
  function bookingWaveFix(){if(!document.querySelector('.booking-wave'))return;const style=document.createElement('style');style.textContent='.booking-wave{background:#FFF7ED!important}.booking-wave+footer{background:#F8E7DE!important;border-top:0!important}';document.head.appendChild(style)}
  document.addEventListener("DOMContentLoaded",()=>{updateBadges();bookingWaveFix()});
})();
