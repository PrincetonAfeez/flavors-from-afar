const panel=document.querySelector('[data-slidein]');
if(panel){let seen=false;try{seen=!!sessionStorage.getItem('ffa_slidein_seen')||Date.now()-Number(localStorage.getItem('ffa_slidein_dismissed')||0)<30*864e5}catch{}
function hide(){panel.hidden=true;try{localStorage.setItem('ffa_slidein_dismissed',String(Date.now()))}catch{}}
function show(){if(seen||document.querySelector('.consent-banner:not([hidden])'))return;panel.hidden=false;seen=true;try{sessionStorage.setItem('ffa_slidein_seen','1')}catch{}}
setTimeout(show,30000);window.addEventListener('scroll',()=>{if(scrollY>=Math.max(1,(document.documentElement.scrollHeight-innerHeight)/2))show()},{passive:true});
panel.querySelector('.slidein-close').addEventListener('click',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)hide()});window.addEventListener('consent-settings',()=>panel.hidden=true)}
