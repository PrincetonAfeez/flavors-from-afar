const {hours,programs=[]}=JSON.parse(document.getElementById('site-data').textContent);
const weekdays=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'],list=v=>Array.isArray(v)?v:[];
const min=t=>Number(t.slice(0,2))*60+Number(t.slice(3)),label=t=>{const h=Number(t.slice(0,2));return `${h%12||12}:${t.slice(3)} ${h>=12?'PM':'AM'}`},short=t=>label(t).replace(':00 ',' ');
// Keep in step with open_status() in build.py, including the previous day's overnight period and holiday overrides.
function openStatus(parts,minutes){const on=offset=>{const d=new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day+offset)),special=hours.special.find(h=>h.date===d.toISOString().slice(0,10));return {d,special,periods:special?(special.status==='open'?special.periods:special.status==='closed'?'closed':null):hours.regular[weekdays[d.getUTCDay()]]}},today=on(0);
const open=[...list(on(-1).periods).filter(p=>min(p.close)<=min(p.open)&&minutes<min(p.close)),...list(today.periods).filter(p=>minutes>=min(p.open)&&(min(p.close)<=min(p.open)||minutes<min(p.close)))][0];
if(open)return 'Open now · Closes at '+short(open.close);
if(today.periods===null)return today.special.label+' hours: please call to confirm';
const prefix=list(today.periods).length?'Closed now':'Closed today';
for(let i=0;i<15;i++){const {d,special,periods}=on(i),opens=list(periods).map(p=>p.open).filter(t=>i||min(t)>minutes).sort();if(periods===null)return `${prefix} · ${special.label} hours: please call to confirm`;if(opens.length)return `${prefix} · Opens ${i===0?'today':i===1?'tomorrow':new Intl.DateTimeFormat('en-US',{weekday:'long',...(i<7?{}:{month:'long',day:'numeric'}),timeZone:'UTC'}).format(d)} at ${short(opens[0])}`}
return prefix}
function refresh(){const now=new Date(),parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value])),date=`${parts.year}-${parts.month}-${parts.day}`,minutes=Number(parts.hour)*60+Number(parts.minute),text=openStatus(parts,minutes);
document.querySelectorAll('[data-open-status]').forEach(el=>el.textContent=text);
document.querySelectorAll('[data-program]').forEach(card=>{const p=programs.find(p=>p.id===card.dataset.program),labelEl=card.querySelector('[data-live-program]');if(!p||!labelEl||!/^\d\d:\d\d$/.test(p.start)||!/^\d\d:\d\d$/.test(p.end)||!Array.isArray(p.days))return;const today=(!p.active_from||date>=p.active_from)&&!hours.special.some(h=>h.date===date&&h.status==='closed')&&p.days.includes(parts.weekday.toLowerCase());labelEl.textContent=today&&minutes>=min(p.start)&&minutes<min(p.end)?'Happening now · until '+label(p.end):today&&minutes<min(p.start)?'Starts today at '+label(p.start):p.card_label});
document.querySelectorAll('[data-event-start]').forEach(card=>{const target=new Date(card.dataset.eventStart),d=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(target).map(p=>[p.type,p.value])),days=Math.round((Date.UTC(+d.year,+d.month-1,+d.day)-Date.UTC(+parts.year,+parts.month-1,+parts.day))/864e5),el=card.querySelector('[data-countdown]');if(el&&days>=0)el.textContent=days===0?(+d.hour>=17?'Tonight':'Today'):days===1?'Tomorrow':`In ${days} days`});
document.querySelectorAll('[data-event-end]').forEach(el=>{if(new Date(el.dataset.eventEnd)<now)el.hidden=true});
document.querySelectorAll('[data-offer-valid-through]').forEach(el=>{el.hidden=date>el.dataset.offerValidThrough});
document.querySelectorAll('[data-offer-after]').forEach(el=>{el.hidden=date<=el.dataset.offerAfter});
document.querySelectorAll('[data-event-concluded]').forEach(el=>{el.hidden=now<=new Date(el.dataset.eventConcluded)});
document.querySelectorAll('[data-announcement-ends]').forEach(el=>{if(el.dataset.announcementEnds<date)el.hidden=true})}
refresh();setInterval(refresh,60000);
