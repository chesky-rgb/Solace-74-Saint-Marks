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
  var CAT={Dining:'#9a6a3c',Drinks:'#6b4e6e',Coffee:'#7a5236','Culture & Entertainment':'#8a5a6a','Parks & Shopping':'#5f7049'};
  var P=[
    {n:"Solace",lat:40.68175,lng:-73.98005,cat:"home",sub:"74 St Marks Place"},
    {n:"Miriam",lat:40.680158,lng:-73.9777381,cat:"Dining",w:"5 min walk",a:"79 5th Avenue"},
    {n:"Sofreh",lat:40.6799152,lng:-73.9739708,cat:"Dining",w:"9 min walk",a:"75 St Marks Avenue"},
    {n:"Rucola",lat:40.6856111,lng:-73.9858917,cat:"Dining",w:"11 min walk",a:"190 Dean Street"},
    {n:"al di là Trattoria",lat:40.6753101,lng:-73.9814311,cat:"Dining",w:"12 min walk",a:"248 5th Avenue"},
    {n:"French Louie",lat:40.6880126,lng:-73.988216,cat:"Dining",w:"16 min walk",a:"320 Atlantic Avenue"},
    {n:"Blueprint",lat:40.6768844,lng:-73.980377,cat:"Drinks",w:"9 min walk",a:"196 5th Avenue"},
    {n:"Union Hall",lat:40.6760744,lng:-73.9800823,cat:"Drinks",w:"11 min walk",a:"702 Union Street"},
    {n:"Clover Club",lat:40.684589,lng:-73.9921382,cat:"Drinks",w:"18 min walk",a:"210 Smith Street"},
    {n:"Gorilla Coffee",lat:40.6808028,lng:-73.9757071,cat:"Coffee",w:"6 min walk",a:"472 Bergen Street"},
    {n:"Cafe Volkan",lat:40.6866988,lng:-73.9900531,cat:"Coffee",w:"17 min walk",a:"85 Bergen Street"},
    {n:"Barclays Center",lat:40.6826465,lng:-73.9754156,cat:"Culture & Entertainment",w:"6 min walk",a:"620 Atlantic Avenue"},
    {n:"Brooklyn Academy of Music",lat:40.6864737,lng:-73.9776469,cat:"Culture & Entertainment",w:"10 min walk",a:"30 Lafayette Avenue"},
    {n:"Fifth Avenue Corridor",lat:40.6788,lng:-73.9792,cat:"Parks & Shopping",w:"3 min walk",a:"Park Slope"},
    {n:"Atlantic Terminal",lat:40.684568,lng:-73.976977,cat:"Parks & Shopping",w:"7 min walk",a:"139 Flatbush Avenue"},
    {n:"Prospect Park",lat:40.6726,lng:-73.9702,cat:"Parks & Shopping",w:"15 min walk",a:"Grand Army Plaza"}
  ];
  var map=L.map(el,{scrollWheelZoom:false,zoomControl:true});
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:16,attribution:'Tiles &copy; Esri'}).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    {maxZoom:16}).addTo(map);
  var pts=[], homeM=null;
  P.forEach(function(p){
    var home=p.cat==='home', color=(CAT[p.cat]||'#8C744C');
    var icon = home
      ? L.divIcon({className:'map-pin is-home',
          html:'<span class="homemk"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z"></path></svg></span>',
          iconSize:[34,34], iconAnchor:[17,17], popupAnchor:[0,-18]})
      : L.divIcon({className:'map-pin',
          html:'<span class="mk" style="--c:'+color+'"></span>',
          iconSize:[14,14], iconAnchor:[7,7], popupAnchor:[0,-8]});
    var m=L.marker([p.lat,p.lng],{icon:icon,zIndexOffset:home?1000:0,title:p.n}).addTo(map);
    var dir='https://www.google.com/maps/dir/?api=1&origin=74+St+Marks+Place+Brooklyn+NY&destination='+encodeURIComponent(p.n+' '+(p.a||'')+' Brooklyn NY')+'&travelmode=walking';
    m.bindPopup(home?('<strong>'+p.n+'</strong><br>'+p.sub):('<strong>'+p.n+'</strong><br>'+p.cat+' \u00b7 '+p.w+'<br><a href="'+dir+'" target="_blank" rel="noopener" style="color:#8C744C">Directions &#8599;</a>'),{closeButton:false});
    if(!home) m.on('mouseover',function(){this.openPopup();});
    if(home) homeM=m;
    pts.push([p.lat,p.lng]);
  });
  map.fitBounds(pts,{padding:[45,45]});
  if(map.getZoom()>15) map.setZoom(15);
  if(homeM) homeM.openPopup();
})();
