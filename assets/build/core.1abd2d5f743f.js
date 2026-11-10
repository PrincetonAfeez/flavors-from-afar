const toggle=document.querySelector('.menu-toggle'),nav=document.getElementById('mobile-navigation');
function close(){if(nav){nav.hidden=true;toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Open navigation')}}
toggle?.addEventListener('click',()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden));toggle.setAttribute('aria-label',nav.hidden?'Open navigation':'Close navigation')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const mobileWasOpen=nav&&!nav.hidden,dropdown=document.querySelector('.primary-navigation .nav-dropdown[open]');document.querySelectorAll('.nav-dropdown[open]').forEach(d=>d.open=false);close();if(mobileWasOpen)toggle?.focus();else dropdown?.querySelector('summary').focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header')){close();document.querySelectorAll('.nav-dropdown').forEach(d=>d.open=false)}});
document.querySelectorAll('.cookie-settings').forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new Event('consent-settings'))));
document.querySelectorAll('[data-share]').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.share({title:document.title,url:location.href})}catch{}}));
