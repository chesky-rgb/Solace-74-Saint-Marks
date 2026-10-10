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


/* ---------- neighborhood map (Leaflet) ---------- */
(function(){
  var el=document.getElementById('hoodmap');
  if(!el||!window.L) return;
  var CAT={Transit:'#5a7a8c',Culture:'#8a5a6a',Parks:'#5f7049',Dining:'#9a6a3c',Everyday:'#7a6a4c'};
  var P=[
    {n:"Solace",lat:40.68175,lng:-73.98005,cat:"home",sub:"74 St Marks Place"},
    {n:"Atlantic Av\u2013Barclays Center",lat:40.6844,lng:-73.9765,cat:"Transit",w:"5 min walk"},
    {n:"Union St Station \u00b7 R",lat:40.6772,lng:-73.9832,cat:"Transit",w:"7 min walk"},
    {n:"Barclays Center",lat:40.6826,lng:-73.9754,cat:"Culture",w:"5 min walk"},
    {n:"Prospect Park",lat:40.6740,lng:-73.9701,cat:"Parks",w:"12 min walk"},
    {n:"al di l\u00e0 Trattoria",lat:40.6753,lng:-73.9814,cat:"Dining",w:"9 min walk"},
    {n:"Whole Foods Market",lat:40.6749,lng:-73.9888,cat:"Everyday",w:"13 min walk"},
    {n:"Trader Joe's",lat:40.6896,lng:-73.9929,cat:"Everyday",w:"short ride"}
  ];
  var map=L.map(el,{scrollWheelZoom:false,zoomControl:true});
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:16,attribution:'Tiles &copy; Esri'}).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:16}).addTo(map);
  var pts=[], homeM=null;
  P.forEach(function(p){
    var home=p.cat==='home', color=home?'#1F1915':(CAT[p.cat]||'#8C744C');
    var icon=L.divIcon({className:'map-pin'+(home?' is-home':''),
      html:'<span class="mk" style="--c:'+color+'"></span>',
      iconSize:home?[20,20]:[14,14], iconAnchor:home?[10,10]:[7,7], popupAnchor:[0,home?-11:-8]});
    var m=L.marker([p.lat,p.lng],{icon:icon,zIndexOffset:home?1000:0,title:p.n}).addTo(map);
    m.bindPopup(home?('<strong>'+p.n+'</strong><br>'+p.sub):('<strong>'+p.n+'</strong><br>'+p.cat+' \u00b7 '+p.w),{closeButton:false});
    if(!home) m.on('mouseover',function(){this.openPopup();});
    if(home) homeM=m;
    pts.push([p.lat,p.lng]);
  });
  map.fitBounds(pts,{padding:[45,45]});
  if(map.getZoom()>15) map.setZoom(15);
  if(homeM) homeM.openPopup();
})();
