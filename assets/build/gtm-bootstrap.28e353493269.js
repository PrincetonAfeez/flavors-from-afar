window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js', new Date());
try {
  const saved = JSON.parse(localStorage.getItem('ffa_consent'));
  if (saved && ['granted','denied'].includes(saved.state) && Date.now()-saved.timestamp < 365*864e5) {
    gtag('consent','update',{analytics_storage:saved.state});
  }
} catch {}
window.dataLayer.push({'gtm.start': Date.now(), event:'gtm.js'});
