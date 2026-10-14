/* Beziehungsdynamiken 15.12.125 – local-only, rule-based training dynamics. No personal/client data and no AI. */
(function(){'use strict';
  const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function create(names,opts={}){
    return {people:Object.fromEntries(names.map(name=>[name,{contact:55,tension:38,opening:48,debt:0}])),
      records:[], safety:!!opts.safety, ruptures:0, recovered:0, deferred:0, id:opts.id||''};
  }
  function tierFromIndex(index){return 3-Math.max(0,Math.min(3,index));}
  function preview(state,params){
    const clone=JSON.parse(JSON.stringify(state));return apply(clone,params);
  }
  function apply(state,params){
    if(!state||!params)return state;
    const grade=typeof params.grade==='number'?Math.max(0,Math.min(3,params.grade)):tierFromIndex(params.index);
    const repair=!!params.repair, names=Object.keys(state.people), focus=names.includes(params.who)?params.who:names[0];
    const skill=params.skillDelta||0;
    let wasRupture=false, wasRepair=false;
    for(const name of names){
      const p=state.people[name];
      const isFocus=name===focus;let base=Number(params.contactDeltas?.[name]);
      if(!Number.isFinite(base))base=(grade===3?6:grade===2?2:grade===1?-4:-9)*(isFocus?1:0.35);
      // Unrepaired breaches make contact recovery gradual rather than magical.
      if(base>0&&p.debt>=1)base=Math.max(1,Math.round(base/(1+0.45*p.debt)));
      const prior=p.contact;
      const newTension=p.tension+(grade===3?-9:grade===2?-4:grade===1?5:13)*(isFocus?1:0.55)+(repair&&grade>=2?-4:0);
      p.contact=clamp(p.contact+base);
      p.tension=clamp(newTension);
      let opening=(grade===3?7:grade===2?3:grade===1?-5:-11)*(isFocus?1:0.55);
      if(p.tension>=72&&opening>0)opening=Math.min(opening,2);
      if(state.safety&&params.unsafe&&opening>0)opening=0;
      p.opening=clamp(p.opening+opening);
      if(isFocus){
        if(grade<=1){p.debt=Math.min(6,p.debt+1.5);if(prior>=38&&p.contact<38)wasRupture=true;}
        else if(repair&&grade===3){const old=p.debt;p.debt=Math.max(0,p.debt-1.2);if(old>=1.2)wasRepair=true;}
        else if(grade===3){p.debt=Math.max(0,p.debt-0.30);}
        else if(grade===2){p.debt=Math.max(0,p.debt-0.15);}
      }else if(grade===0&&base<0){p.debt=Math.min(6,p.debt+0.5)}
    }
    if(wasRupture||grade<=1){state.ruptures++;}
    if(wasRepair)state.recovered++;
    const states=Object.values(state.people);
    const snapshot={round:state.records.length+1,grade,repair,focus,skillDelta:skill,
      people:Object.fromEntries(Object.entries(state.people).map(([n,p])=>[n,{...p}])),
      marker:grade<=1?'Kontakt belastet':repair&&grade>=2?'Reparatur versucht':grade===3?'Passender nächster Schritt':'Abwägen und beobachten',
      quotedChoice:String(params.say||''),feedback:String(params.why||''), unsafe:!!params.unsafe};
    state.records.push(snapshot);return state;
  }
  function shouldRepair(state,name){
    if(!state||state.safety)return false;
    const p=state.people[name]||Object.values(state.people)[0];
    if(!p)return false;
    return p.debt>=2.5&&(p.tension>=46||p.contact<=48);
  }
  function signal(state,name){
    if(!state?.records?.length)return '';
    const p=state.people[name]||Object.values(state.people)[0];if(!p)return '';
    if(p.debt>=2.5)return '[Die Person greift deine Frage zunächst nicht auf. Sie hält länger inne und schaut wiederholt weg.]';
    if(p.tension>=68)return '[Die Person antwortet mit kürzeren Sätzen. Ihre Hände bewegen sich rascher.]';
    if(p.opening>=66&&p.tension<=48)return '[Nach einer kurzen Pause spricht die Person langsamer und ergänzt von sich aus einen Gedanken.]';
    return '';
  }
  function memory(state,name){
    const p=state?.people?.[name];if(!p||state.records.length<2)return '';
    if(p.debt>=2.5)return 'Noch offener Gesprächsbruch: Eine frühere Intervention wirkt weiterhin nach. Jetzt Kontakt prüfen, bevor du zum ursprünglichen Plan zurückkehrst.';
    if(p.tension>=66)return 'Die Anspannung aus den vorherigen Gesprächsrunden ist weiterhin spürbar. Eine einzelne passende Antwort löst sie nicht sofort auf.';
    if(p.opening>=65&&p.debt<1)return 'Die Person beteiligt sich zunehmend. Prüfe, ob die Öffnung auch unter einer schwierigeren Frage bestehen bleibt.';
    return '';
  }
  function average(state,k){const vals=Object.values(state.people).map(p=>p[k]);return vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length)}
  function compactBar(label,value,kind){return `<div class="dyn125-bar"><span>${escape(label)}</span><div class="dyn125-track"><i class="${escape(kind)}" style="width:${clamp(value)}%"></i></div><b>${clamp(value)}</b></div>`}
  function mount(host,state,projected){
    if(!host||!state)return;
    host.querySelector('.dyn125')?.remove();
    const now=projected||state;
    const panel=document.createElement('details');panel.className='dyn125';panel.open=window.matchMedia('(min-width: 800px)').matches;
    const total=Object.values(now.people).length;
    const summary=document.createElement('summary');summary.textContent=`Gesprächsdynamik · Kontakt, Anspannung und Öffnung (${total} ${total===1?'Person':'Personen'})`;
    panel.append(summary);
    const grid=document.createElement('div');grid.className='dyn125-grid';
    for(const [name,p] of Object.entries(now.people)){
      const box=document.createElement('div');box.className='dyn125-person';
      box.innerHTML=`<h4>${escape(name)}</h4>${compactBar('Kontakt',p.contact,'contact')}${compactBar('Anspannung',p.tension,'tension')}${compactBar('Öffnung',p.opening,'opening')}`;
      if(p.debt>=1.2){const badge=document.createElement('div');badge.className='dyn125-debt';badge.textContent='Ein früherer Kontaktbruch wirkt noch nach';box.append(badge)}
      grid.append(box);
    }
    panel.append(grid);
    const foot=document.createElement('p');foot.className='dyn125-disclaimer';foot.textContent='Fiktive, regelbasierte Lernvariablen. Keine Messung des Erlebens, der psychischen Gesundheit oder des Wertes eines Menschen.';panel.append(foot);
    host.append(panel);
  }
  function report(host,state){
    if(!host||!state?.records?.length)return;
    const title=document.createElement('h3');title.className='dyn125-report-title';title.textContent='Dein Gesprächsverlauf – Rückblick';host.append(title);
    const intro=document.createElement('p');intro.className='dyn125-report-intro';
    const strain=average(state,'tension'),opening=average(state,'opening');
    intro.textContent=`${state.records.length} Runden · ${state.ruptures} belastende Entscheidungen · ${state.recovered} gelungene Reparaturansätze. Die durchschnittliche simulierte Anspannung endet bei ${Math.round(strain)}/100, die Öffnungsbereitschaft bei ${Math.round(opening)}/100.`;
    host.append(intro);
    const timeline=document.createElement('div');timeline.className='dyn125-timeline';timeline.setAttribute('aria-label','Verlauf der Gesprächsentscheidungen');
    for(const r of state.records){const piece=document.createElement('div');piece.className='dyn125-moment '+(r.grade<=1?'difficult':r.repair?'repaired':r.grade===3?'strong':'neutral');piece.textContent=String(r.round);piece.title=`Runde ${r.round}: ${r.marker}`;piece.setAttribute('aria-label',piece.title);timeline.append(piece)}host.append(timeline);
    const blocks=document.createElement('div');blocks.className='dyn125-lessons';
    const hard=state.records.filter(r=>r.grade<=1),recover=state.records.filter(r=>r.repair&&r.grade>=2);
    const notes=[];
    if(hard.length)notes.push(`Runde ${hard[0].round}: Eine Intervention hat den Kontakt belastet. Welche Reaktion war erkennbar, und wie hast du danach darauf Bezug genommen?`);
    if(recover.length)notes.push(`Runde ${recover[0].round}: Du hast eine Reparatur versucht. Beachte, dass Kontakt und Vertrauen danach schrittweise wachsen können.`);
    if(!hard.length)notes.push('Du hast überwiegend passende Möglichkeiten gewählt. Übe den Fall erneut mit einer vertretbaren, aber weniger günstigen Alternative und beobachte die Folgen.');
    const people=Object.entries(state.people).sort((a,b)=>a[1].contact-b[1].contact);
    if(people.length>1)notes.push(`Mehrere Perspektiven: Der Kontakt zu ${people[0][0]} ist am Ende am fragilsten. Welche Stimme kam im Verlauf zu kurz?`);
    if(strain>=58)notes.push('Die Gesprächsspannung bleibt erhöht. Auch eine fachlich gute Intervention muss nicht unmittelbar beruhigen.');
    if(state.records.some(r=>r.unsafe))notes.push('Sicherheitskritische Entscheidung: Die Schutzfrage bleibt unabhängig vom Gesamtwert vorrangig. Kein Punktesystem kann eine riskante Entscheidung ausgleichen.');
    const list=document.createElement('ul');notes.slice(0,4).forEach(note=>{const li=document.createElement('li');li.textContent=note;list.append(li)});blocks.append(list);host.append(blocks);
  }
  // Individuell redigierte, fiktive Rückbezüge. Nur für die jeweilige Fallfamilie.
  const echoes={
    single:{
      vorwurf:'Mich beschäftigt immer noch, dass ich mich von Ihrer Frage beschuldigt gefühlt habe.',
      wut:'Sie haben gesehen, wie schnell ich gehen wollte. Das ist noch nicht einfach weg.',
      scham:'Als Sie vorhin nachgefragt haben, dachte ich sofort, ich mache wieder etwas falsch.',
      schweigen:'Ich höre Ihnen zu, aber mir fehlen noch die Worte. Bitte drängen Sie mich nicht.',
      suizid:'Ich habe noch immer Angst davor, laut zu sagen, wie schlimm es heute ist.',
      kontrolle:'Ich muss nachher wieder nach Hause. Deshalb überlege ich bei jeder Antwort, was er erfahren könnte.',
      panik:'Ich höre Ihre Frage, aber mein Körper kommt gerade kaum hinterher.',
      affaire:'Ich höre die Erklärungen, aber die vielen Lügen sind noch immer zwischen uns.',
      druck:'Meine Sorge ist geblieben: Wenn ich Nein sage, ist er danach tagelang beleidigt.',
      grenze:'Ich habe Angst, dass Sie mich genauso wegschicken wie andere Menschen.',
      drohung:'Was Sie sagen, klingt vernünftig. Aber die Drohung geht mir immer noch durch den Kopf.',
      trauer:'Sie fragen so ruhig. In mir ist die Wut darüber, dass dieser Mensch nicht mehr da ist.',
      poly:'Ich komme immer wieder auf diese Forderung zurück: Warum muss ich mich entscheiden?',
      geheimnis:'Sie haben noch nicht gesagt, was Sie mit diesem Wissen im gemeinsamen Gespräch machen würden.',
      abwertung:'Ich frage mich noch, ob Sie überhaupt verstanden haben, woher meine Wut kommt.',
      trennung:'Wir reden über unsere Muster, aber morgen könnte sie tatsächlich weg sein.'
    },
    multi:{
      eskalation:'Vorhin haben wir uns gegenseitig unterbrochen. Ich merke, dass ich wieder dasselbe tue.',
      schweigen:'Ich habe noch immer nicht gesagt, was ich eigentlich sagen wollte.',
      vertrauensbruch:'Dass wir jetzt ruhiger sprechen, heißt nicht, dass das Vertrauen wieder da ist.',
      triade:'Ich höre einen Plan, aber ich weiß noch nicht, ob meine Bedürfnisse darin Platz haben.',
      trennung:'Wir sprechen weiter, obwohl noch immer im Raum steht, dass einer von uns gehen will.',
      familie:'Ich habe das Gefühl, wir verteilen gerade wieder dieselben Rollen wie früher.'
    },
    alliance:{
      parteilichkeit:'Ich komme noch einmal darauf zurück: Woran merke ich, dass Sie nicht die andere Seite bevorzugen?',
      'verletzende-formulierung':'Mir geht Ihre Formulierung von vorhin noch nach. Ich möchte das nicht einfach übergehen.',
      kompetenzangriff:'Ich kann noch nicht einschätzen, ob Sie verstanden haben, was für mich auf dem Spiel steht.',
      'abbruch-der-sitzung':'Ich bin immer noch kurz davor aufzustehen. Können wir klären, was gerade zwischen uns passiert?',
      'drei-gegen-eine':'Ich höre mehrere Stimmen, aber noch nicht, wo mein Platz in diesem Gespräch ist.',
      'gefaehrliche-neutralitaet':'Sie sprechen von einer gemeinsamen Lösung. Für mich geht es zuerst darum, ob mein Nein respektiert wird.'
    }
  };
  function recall(state,track,caseId,who){
    if(!state||state.records.length<3||state.records.length%2===0)return null;
    const p=state.people[who]||Object.values(state.people)[0];
    if(!p)return null;
    const line=echoes[track]?.[caseId];
    if(!line)return null;
    // No positive reassurance is fabricated; the reference is shown only with unresolved tension.
    if(p.debt>=1.3||p.tension>=60)return {who,text:line};
    return null;
  }
  window.BDTalk125={create,apply,preview,mount,report,shouldRepair,signal,memory,recall};
})();
