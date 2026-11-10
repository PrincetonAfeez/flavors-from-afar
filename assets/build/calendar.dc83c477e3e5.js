const root=document.querySelector('[data-calendar]');
if(root){
  const links=[...root.querySelectorAll('[data-calendar-view]')],panels=[...root.querySelectorAll('.calendar-view')];
  const months=[...root.querySelectorAll('[data-month]')],days=[...root.querySelectorAll('[data-day-panel]')];
  const controls=root.querySelector('[data-month-controls]'),previous=root.querySelector('[data-month-prev]'),next=root.querySelector('[data-month-next]'),label=root.querySelector('[data-month-label]');
  const more=root.querySelector('[data-calendar-more]');let month=0,limit=12;
  function selectView(id,focus=false){
    if(!panels.some(p=>p.id===id))id='upcoming';
    panels.forEach(p=>p.hidden=p.id!==id);links.forEach(a=>{if(a.dataset.calendarView===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    if(focus)document.getElementById(id).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  links.forEach(a=>a.addEventListener('click',event=>{event.preventDefault();selectView(a.dataset.calendarView);history.replaceState(null,'','#'+a.dataset.calendarView);window.dispatchEvent(new CustomEvent('ffa-track',{detail:{event:'calendar_view_click',placement:'calendar_views',params:{view:a.dataset.calendarView}}}))}));
  function selectMonth(value,resetDay=true){month=Math.max(0,Math.min(months.length-1,value));months.forEach((m,i)=>m.hidden=i!==month);label.textContent=months[month].querySelector('caption').textContent.replace(' · Los Angeles','');previous.disabled=month===0;next.disabled=month===months.length-1;const first=months[month].querySelector('[data-calendar-day]');if(first&&resetDay)selectDay(first.dataset.calendarDay);}
  controls.hidden=false;previous.addEventListener('click',()=>selectMonth(month-1));next.addEventListener('click',()=>selectMonth(month+1));selectMonth(0,false);
  function selectDay(value,focus=false){
    const panel=days.find(d=>d.dataset.dayPanel===value);if(!panel)return;
    days.forEach(d=>d.hidden=d!==panel);root.querySelectorAll('[data-calendar-day]').forEach(a=>a.dataset.selected=String(a.dataset.calendarDay===value));
    if(focus){panel.querySelector('h3').focus({preventScroll:true});panel.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
  }
  root.querySelectorAll('[data-calendar-day]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();selectDay(a.dataset.calendarDay,true);history.replaceState(null,'','#day-'+a.dataset.calendarDay)}));
  const initial=location.hash.slice(1);selectView(initial.startsWith('day-')?'calendar':initial);
  selectDay(initial.startsWith('day-')?initial.slice(4):days[0]?.dataset.dayPanel);
  if(initial.startsWith('day-')){const index=months.findIndex(m=>m.dataset.month===initial.slice(4,11));if(index>=0)selectMonth(index,false)}
  function refresh(){
    const localParts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value])),today=localParts.year+'-'+localParts.month+'-'+localParts.day;root.querySelectorAll('[data-offer-through]').forEach(n=>n.hidden=n.dataset.offerThrough<today);
    const now=Date.now();root.querySelectorAll('[data-expires]').forEach(n=>n.dataset.expired=String(Date.parse(n.dataset.expires)<=now));
    const cards=[...root.querySelectorAll('[data-occurrence]')].filter(n=>n.dataset.expired!=='true');
    root.querySelectorAll('[data-expires]').forEach(n=>n.hidden=n.dataset.expired==='true');cards.forEach((n,i)=>n.hidden=i>=limit);
    more.hidden=cards.length<=limit;root.querySelector('[data-upcoming-empty]').hidden=cards.length>0;
    days.forEach(d=>{const count=[...d.querySelectorAll('li[data-expires]')].filter(n=>n.dataset.expired!=='true').length;d.querySelector('[data-day-empty]').hidden=count>0;const cell=root.querySelector('[data-day-count="'+d.dataset.dayPanel+'"]');if(cell){cell.firstChild.textContent=String(count);cell.querySelector('.count-word').textContent=count===1?' experience':' experiences';cell.parentElement.setAttribute('aria-label',d.querySelector('h3').textContent+': '+count+' confirmed experiences')}});
  }
  more.addEventListener('click',()=>{limit+=12;refresh()});refresh();setInterval(refresh,60000);
  root.querySelectorAll('[data-copy]').forEach(button=>{button.hidden=false;button.addEventListener('click',async()=>{
    const feedback=root.querySelector('[data-copy-feedback]');
    try{await navigator.clipboard.writeText(button.dataset.copy);feedback.textContent=button.dataset.copyKind==='subscribe'?'Calendar URL copied. Add it as a subscription in your calendar app.':'Event link copied.';
      window.dispatchEvent(new CustomEvent('ffa-track',{detail:{event:button.dataset.copyKind==='subscribe'?'calendar_subscribe_click':'calendar_share_click',placement:'events',params:{destination:'Copy'}}}));
    }catch{feedback.textContent='Copy the calendar address shown below, or use the event page link.';root.querySelector('.calendar-feed-url')?.select()}
    setTimeout(()=>feedback.textContent='',8000);
  })});
}
