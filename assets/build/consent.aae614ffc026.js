const config=JSON.parse(document.getElementById('site-data').textContent),banner=document.querySelector('.consent-banner');
function apply(state){const value=state==='granted'?'granted':'denied';gtag('consent','update',{analytics_storage:value});window.dispatchEvent(new CustomEvent('ffa-consent',{detail:state}))}
let choice;try{choice=JSON.parse(localStorage.getItem('ffa_consent'))}catch{}
if(choice&&['granted','denied'].includes(choice.state)&&Date.now()-choice.timestamp<365*864e5)apply(choice.state);else banner.hidden=false;
document.querySelectorAll('[data-consent]').forEach(b=>b.addEventListener('click',()=>{const state=b.dataset.consent;try{localStorage.setItem('ffa_consent',JSON.stringify({state,timestamp:Date.now()}))}catch{}apply(state);banner.hidden=true}));
window.addEventListener('consent-settings',()=>{banner.hidden=false;banner.querySelector('button').focus()});
