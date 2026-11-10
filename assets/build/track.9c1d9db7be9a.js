const config=JSON.parse(document.getElementById('site-data').textContent),queue=[];
window.dataLayer=window.dataLayer||[];
let granted=false;
function consent(){try{const c=JSON.parse(localStorage.getItem('ffa_consent'));return c?.state==='granted'&&Date.now()-c.timestamp<365*864e5}catch{return false}}
granted=consent();
function send(event,placement,params={}){if(config.env!=='production')return;const value={event,placement,page_path:location.pathname,...params};if(granted)window.dataLayer.push(value);else if(queue.length<30)queue.push(value)}
window.addEventListener('ffa-track',e=>{const allowed={};for(const key of ['form_id','form_location','occasion','guest_band','source','service_style','group_type','provider','destination','view','program','event_id'])if(e.detail.params?.[key])allowed[key]=String(e.detail.params[key]).slice(0,40);send(e.detail.event,e.detail.placement,allowed)});
window.addEventListener('ffa-consent',e=>{granted=e.detail==='granted';if(granted)queue.splice(0).forEach(v=>window.dataLayer.push(v));else queue.length=0});
document.addEventListener('click',e=>{const link=e.target.closest('[data-track]');if(link){const params={};if(link.dataset.program)params.program=link.dataset.program;if(link.dataset.eventId)params.event_id=link.dataset.eventId;if(link.dataset.provider)params.provider=link.dataset.provider;if(link.dataset.destination)params.destination=link.dataset.destination;if(link.dataset.view)params.view=link.dataset.view;send(link.dataset.track,link.dataset.placement||'section',params);
if (link.dataset.eventId === '2026-11-25-friendsgiving' && link.dataset.track === 'ticket_click') {
  const placement = link.dataset.placement || 'section';
  send('friendsgiving_reserve_click', placement, params);
  if (placement === 'early-seating') send('friendsgiving_early_seating_click', placement, params);
  if (placement === 'late-seating') send('friendsgiving_late_seating_click', placement, params);
}
if(link.dataset.program==='cowork'&&link.dataset.track==='reserve_click')send('cowork_reserve_click',link.dataset.placement,{...params,cta_location:link.dataset.placement});
if (link.dataset.program === 'homeland-dinners' && link.dataset.track === 'reserve_click') {
  const placement = link.dataset.placement || 'section';
  send('homeland_booking_cta_click', placement, {...params, cta_location: placement});
  send('homeland_external_booking_start', placement, {...params, destination: link.href});
}
if (link.dataset.program === 'brunch' && link.dataset.track === 'reserve_click' && link.dataset.provider === 'opentable') {
  const placement = link.dataset.placement || 'section';
  send('brunch_reservation_cta_click', placement, {...params, cta_label: link.textContent.trim()});
  send('brunch_opentable_outbound', placement, {...params, destination: link.href});
}
if (link.dataset.program === 'passport-hour' && link.dataset.track === 'reserve_click') {
  const event = link.dataset.placement === 'group'
    ? 'passport_hour_group_booking_cta_click'
    : 'passport_hour_booking_cta_click';
  send(event, link.dataset.placement, {...params, cta_label: link.textContent.trim()});
}
if (link.dataset.program === 'afro-jazz-sunday' && link.dataset.track === 'reserve_click') {
  const seatingTimes = {early: '18:00', late: '20:00'};
  send('afro_jazz_cta_click', link.dataset.placement, {
    ...params, seating: seatingTimes[link.dataset.placement] || 'unspecified'
  });
}
if(link.dataset.provider==='opentable')send('reservation_widget_open',link.dataset.placement,{provider:'opentable'})}});
let previous='external';try{if(document.referrer&&new URL(document.referrer).origin===location.origin)previous=new URL(document.referrer).pathname}catch{}
if(location.pathname==='/menu')send('menu_view','section',{source_page:previous});if(location.pathname==='/wine')send('wine_view','section',{source_page:previous});
if (location.pathname === '/events/friendsgiving-los-angeles-2026') send('friendsgiving_page_view', 'page');
if (location.pathname.replace(/\/$/, '') === '/brunch') send('brunch_page_view', 'page');
if (location.pathname === '/events/homeland-dinners') send('homeland_page_view', 'page');
if (location.pathname === '/events/passport-hour') send('passport_hour_page_view', 'page');
const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
try{if(!sessionStorage.getItem('ffa_touch')){const params=new URLSearchParams(location.search),touch={landing_page:location.pathname,referrer:document.referrer?new URL(document.referrer).origin:''};keys.forEach(k=>touch[k]=(params.get(k)||'').slice(0,200));sessionStorage.setItem('ffa_touch',JSON.stringify(touch))}}catch{}
