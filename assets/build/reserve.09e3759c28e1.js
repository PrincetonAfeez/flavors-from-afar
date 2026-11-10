// Reservation helper: pre-fills OpenTable with party size, date and time, and flags closed days before leaving the site.
const form=document.querySelector('form[data-reserve]');
if(form){
  const config=JSON.parse(document.getElementById('site-data').textContent);
  const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const date=form.elements.date,time=form.elements.time,button=form.querySelector('[type=submit]'),status=form.querySelector('[data-reserve-status]');
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`,now=Number(parts.hour)*60+Number(parts.minute),preferred=time.value;
  const min=t=>Number(t.slice(0,2))*60+Number(t.slice(3)),next=value=>new Date(Date.parse(value+'T00:00Z')+864e5).toISOString().slice(0,10);
  const periodsOn=value=>{
    const special=(config.hours.special||[]).find(h=>String(h.date).slice(0,10)===value);
    if(special&&special.status==='closed')return [];
    if(special&&special.status==='open')return special.periods;
    const regular=config.hours.regular[days[new Date(value+'T00:00Z').getUTCDay()]];
    return Array.isArray(regular)?regular:[];
  };
  const slots=value=>[...time.options].map(o=>o.value).filter(t=>(value!==today||min(t)>now)&&periodsOn(value).some(p=>min(t)>=min(p.open)&&min(t)<=min(p.close)+(min(p.close)<=min(p.open)?1440:0)-60));
  const nearest=list=>list.reduce((best,t)=>Math.abs(min(t)-min(preferred))<Math.abs(min(best)-min(preferred))?t:best);
  const check=()=>{
    const list=date.value?slots(date.value):[...time.options].map(o=>o.value),ok=list.length>0;
    for(const option of time.options)option.disabled=!list.includes(option.value);
    if(ok&&!list.includes(time.value))time.value=nearest(list);
    status.textContent=ok?'':date.value===today&&periodsOn(today).length?'We’re closed for the rest of today. Please choose another date.':'We’re closed that day. Please choose another date.';
    date.setAttribute('aria-invalid',String(!ok));button.disabled=!ok;return ok;
  };
  date.min=today;
  let value=today;
  for(let i=0;i<14&&!slots(value).length;i++)value=next(value);
  date.value=value;
  if(slots(value).length)time.value=nearest(slots(value));
  check();
  date.addEventListener('change',check);
  form.addEventListener('submit',e=>{
    if(!check()){e.preventDefault();return}
    let field=form.elements.dateTime;
    if(!field){field=document.createElement('input');field.type='hidden';field.name='dateTime';form.append(field)}
    field.value=date.value+'T'+time.value;
    // OpenTable reads dateTime; keep the separate date/time fields out of the URL.
    date.disabled=time.disabled=true;
    setTimeout(()=>{date.disabled=time.disabled=false},0);
    window.dispatchEvent(new CustomEvent('ffa-track',{detail:{event:'reserve_click',placement:'reservation_form',params:{provider:'opentable'}}}));
  });
}
