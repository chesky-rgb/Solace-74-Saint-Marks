// nav solidify + mobile menu
const nav=document.getElementById('nav');
const heroEl=document.querySelector('.hero,.page-hero');const trig=heroEl?Math.max(120,heroEl.offsetHeight-90):160;const onScroll=()=>{nav.classList.toggle('solid',window.scrollY>trig)};
onScroll();window.addEventListener('scroll',onScroll,{passive:true});
const toggle=document.getElementById('navToggle'),links=document.getElementById('navLinks');
toggle.addEventListener('click',()=>{
  const open=links.classList.toggle('open');toggle.classList.toggle('open',open);
  toggle.setAttribute('aria-expanded',open);
});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  links.classList.remove('open');toggle.classList.remove('open');toggle.setAttribute('aria-expanded',false);
}));

// reveal on scroll (with fallback: if unsupported, just show everything)
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io=new IntersectionObserver((es)=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:0.14,rootMargin:'0px 0px -8% 0px'});
  reveals.forEach(el=>io.observe(el));
}else{
  reveals.forEach(el=>el.classList.add('in'));
}

// inquiry form -> Web3Forms via AJAX for an in-page thank-you.
// The <form> also has action + hidden access_key, so it submits even if JS fails.
const form=document.getElementById('inqForm'),done=document.getElementById('formDone');
if(form){
  const nameEl=document.getElementById('fname'), emailEl=document.getElementById('femail');
  const btn=form.querySelector('.btn');
  form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    if(!nameEl.value.trim()){nameEl.focus();return;}
    if(!emailEl.value.trim()||!emailEl.checkValidity()){emailEl.focus();return;}
    if(btn){btn.disabled=true;btn.textContent='Sending\u2026';}
    try{
      const r=await fetch('https://api.web3forms.com/submit',{method:'POST',
        headers:{'Accept':'application/json'}, body:new FormData(form)});
      console.log('web3forms',r.status,await r.clone().json().catch(()=>({})));
    }catch(err){console.log('web3forms error',err);}
    form.style.display='none';done.classList.add('on');
    done.scrollIntoView({behavior:'smooth',block:'center'});
  });
}


/* ---------- lightbox (gallery) ---------- */
(function(){
  const links=[...document.querySelectorAll('.gallery a')];
  if(!links.length) return;
  const lb=document.createElement('div');
  lb.className='lb';
  lb.innerHTML='<button class="lb-close" aria-label="Close">&times;</button>'+
    '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>'+
    '<img alt="">'+
    '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>'+
    '<div class="lb-cap"></div>';
  document.body.appendChild(lb);
  const img=lb.querySelector('img'), cap=lb.querySelector('.lb-cap');
  let i=0;
  const items=links.map(a=>({src:a.getAttribute('href'),cap:a.getAttribute('data-cap')||''}));
  function show(n){i=(n+items.length)%items.length;img.src=items[i].src;cap.textContent=items[i].cap;}
  function open(n){show(n);lb.classList.add('open');document.body.style.overflow='hidden';}
  function close(){lb.classList.remove('open');document.body.style.overflow='';}
  links.forEach((a,n)=>a.addEventListener('click',e=>{e.preventDefault();open(n);}));
  lb.querySelector('.lb-close').addEventListener('click',close);
  lb.querySelector('.lb-prev').addEventListener('click',e=>{e.stopPropagation();show(i-1);});
  lb.querySelector('.lb-next').addEventListener('click',e=>{e.stopPropagation();show(i+1);});
  lb.addEventListener('click',e=>{if(e.target===lb)close();});
  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft')show(i-1);
    else if(e.key==='ArrowRight')show(i+1);
  });
})();
