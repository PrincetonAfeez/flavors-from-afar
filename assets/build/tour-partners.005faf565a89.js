document.querySelectorAll('[data-partner-choice]').forEach(link=>{
  link.addEventListener('click',()=>{
    const select=document.querySelector('form[data-form="tour_partner"] select[name="partnership"]');
    if(select&&[...select.options].some(option=>option.value===link.dataset.partnerChoice)){
      select.value=link.dataset.partnerChoice;
    }
  });
});
