/* Academy Chat 108 — standalone shared renderer, no storage, no external requests. */
(()=>{'use strict';
function make(tag,klass,content){const n=document.createElement(tag);if(klass)n.className=klass;if(content!==undefined)n.textContent=String(content);return n}
function safeImage(source){return typeof source==='string'&&/^(?:\.\.?\/|training-assets\/|public\/)[\w./-]+\.(?:webp|png|jpg|jpeg)(?:\?[\w.=&-]+)?$/i.test(source)}
function avatar(who,person){const el=make('span','bd-chat-avatar');el.dataset.who=who;el.setAttribute('aria-hidden','true');if(safeImage(person?.avatar)){const img=document.createElement('img');img.src=person.avatar;img.alt='';img.loading='lazy';img.onerror=()=>{img.remove();el.textContent=(person?.name||who).slice(0,1)};el.append(img)}else el.textContent=(person?.name||who).slice(0,1);return el}
function render(target,{turns=[],persons={},step=0,twist='',stageOfReveal=4}={}){
 if(!target||typeof target.replaceChildren!=='function')return false;
 const stream=make('div','bd-chat');stream.setAttribute('role','group');stream.setAttribute('aria-label','Chronologischer Verlauf eines fiktiven Beratungsgesprächs');
 for(const t of turns){if(!t||!['A','B','C'].includes(t.who)||typeof t.text!=='string'||!t.text.trim())continue;
  const speaker=t.who==='C'?{name:'Beratende Person'}:(persons[t.who]||{name:t.who});
  const row=make('div',t.who==='C'?'bd-chat-counselor':'bd-chat-turn');row.dataset.who=t.who;
  if(t.who==='A')row.append(avatar('A',speaker));
  const bubble=make('div','bd-chat-bubble');bubble.append(make('div','bd-chat-name',speaker.name||t.who),make('div','bd-chat-body',t.text));row.append(bubble);
  if(t.who==='B')row.append(avatar('B',speaker));
  stream.append(row)
 }
 if(step>=stageOfReveal&&twist){stream.append(make('div','bd-chat-divider','Neuer Hinweis'));const r=make('div','bd-chat-reveal');r.setAttribute('role','note');r.append(make('b',null,'NEUE INFORMATION'),make('div',null,twist));stream.append(r)}
 target.replaceChildren(stream);return true;
}
window.BDAcademyChat108={render,version:'15.12.108'};
})();
