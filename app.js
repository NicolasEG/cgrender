(() => {
  'use strict';
  const config = window.CG_CONFIG || {whatsapp:'',vehicles:[]};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 701px)');
  const loader = document.querySelector('.loader');
  if (!desktop.matches && !reduced.matches) {
    loader.classList.add('active');
    const finish = () => { loader.classList.add('done'); setTimeout(() => loader.classList.remove('active'),550); };
    setTimeout(finish,950); // Tiempo acotado: nunca bloquea la pÃ¡gina por una imagen.
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.body.classList.add('motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('visible');observer.unobserve(entry.target);}
    }), {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  let pending = false;
  const layers = [...document.querySelectorAll('[data-parallax]')];
  const paint = () => {
    pending = false;
    layers.forEach(layer => {
      if (!desktop.matches || reduced.matches) {layer.style.transform='';return;}
      const box=layer.parentElement.getBoundingClientRect();
      if(box.bottom<0 || box.top>innerHeight)return;
      const shift = -box.top * Number(layer.dataset.parallax);
      layer.style.transform=`translate3d(0,${shift.toFixed(2)}px,0)`;
    });
  };
  const schedule = () => {if(!pending){pending=true;requestAnimationFrame(paint);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);paint();
  const vehicleDialog=document.getElementById('vehicle-dialog');
  const contactDialog=document.getElementById('contact-dialog');
  let activeVehicle=null;
  const number=config.whatsappLink;
  const url = index => {
    const message=index===null?'Hola CG Automotores, quisiera consultar por sus vehÃ­culos.':`Hola CG Automotores, me interesa ${config.vehicles[index]?.title || `VehÃ­culo ${String(index+1).padStart(2,'0')}`} (referencia ${String(index+1).padStart(2,'0')}). Â¿Me comparten detalles, precio y disponibilidad?`;
    return `${number}?text=${encodeURIComponent(message)}`;
  };
  document.querySelectorAll('.whatsapp').forEach(link=> {
    if(number){link.href=url(link.dataset.inquiry===undefined?null:Number(link.dataset.inquiry));link.target='_blank';link.rel='noopener noreferrer';}
    link.addEventListener('click',event=> {
      if(!number){event.preventDefault();if(vehicleDialog.open)vehicleDialog.close();contactDialog.showModal();}
    });
  });
  document.querySelectorAll('[data-vehicle]').forEach(button=>button.addEventListener('click',()=> {
    activeVehicle=Number(button.dataset.vehicle);
    const vehicle=config.vehicles[activeVehicle]||{};
    const ref=String(activeVehicle+1).padStart(2,'0');
    const image=document.getElementById('dialog-image');
    image.src=`assets/vehiculo-${ref}.webp`;image.alt=document.querySelectorAll('.vehicle-photo img')[activeVehicle].alt;
    document.getElementById('dialog-ref').textContent=`REFERENCIA / ${ref}`;
    document.getElementById('dialog-title').textContent=vehicle.title||`VehÃ­culo ${ref}`;
    ['model','year','km','price'].forEach(field=>document.getElementById(`field-${field}`).textContent=vehicle[field]||'Consultar');
    document.getElementById('vehicle-whatsapp').href=number?url(activeVehicle):'#contacto';
    vehicleDialog.showModal();
  }));
  const catalog=document.querySelector('.catalog');
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelectorAll('.vehicle').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;});
    catalog.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
  }));
  document.querySelector('.view-toggle').addEventListener('click',event=>{
    const compact=catalog.classList.toggle('compact');
    const button=event.currentTarget;button.setAttribute('aria-pressed',String(compact));button.setAttribute('aria-label',compact?'Ver catÃ¡logo a pantalla completa':'Ver catÃ¡logo en grilla');
    catalog.scrollIntoView({behavior:'instant'});
  });
  let galleryVehicle=0, galleryIndex=0;
  const renderPhoto=()=>{const v=config.vehicles[galleryVehicle];const photo=document.getElementById('full-photo');photo.src=v.photos[galleryIndex];photo.alt=`${v.title}, foto ${galleryIndex+1}`;document.getElementById('photo-count').textContent=`${galleryIndex+1} / ${v.photos.length}`;};
  const step=delta=>{const count=config.vehicles[galleryVehicle].photos.length;galleryIndex=(galleryIndex+delta+count)%count;renderPhoto();};
  document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{galleryVehicle=Number(button.dataset.photo);galleryIndex=0;renderPhoto();document.getElementById('photo-dialog').showModal();}));
  document.getElementById('photo-prev').addEventListener('click',()=>step(-1));document.getElementById('photo-next').addEventListener('click',()=>step(1));
  addEventListener('keydown',e=>{if(document.getElementById('photo-dialog').open){if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);}});
  const menu=document.getElementById('menu-dialog');
  document.querySelector('.mobile-menu').addEventListener('click',()=>menu.showModal());
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.close()));
  document.querySelectorAll('dialog').forEach(dialog=> {
    dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=> {if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{document.body.style.overflow='';});
    new MutationObserver(()=>{if(dialog.open)document.body.style.overflow='hidden';}).observe(dialog,{attributes:true,attributeFilter:['open']});
  });
  config.vehicles.forEach((v,i)=>{const heading=document.querySelectorAll('.vehicle-info h3')[i];if(heading&&v.title)heading.textContent=v.title;});
})();
