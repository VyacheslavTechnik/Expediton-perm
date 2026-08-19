const loaderEl=document.getElementById('loader');
function hideLoader(){loaderEl.classList.add('gone');}
window.addEventListener('load',()=>setTimeout(hideLoader,300));
setTimeout(hideLoader,1000);
(function(){var d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');document.getElementById('f-date').min=y+'-'+m+'-'+day;})(); // страховка — скрыть максимум через 1 сек
const cur=document.getElementById('cur'),curR=document.getElementById('curR');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
(function raf(){rx+=(mx-rx)*.13;ry+=(my-ry)*.13;curR.style.left=rx+'px';curR.style.top=ry+'px';requestAnimationFrame(raf)})();
document.querySelectorAll('a,button,.gi').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.width='18px';cur.style.height='18px';curR.style.width='52px';curR.style.height='52px'});
  el.addEventListener('mouseleave',()=>{cur.style.width='10px';cur.style.height='10px';curR.style.width='38px';curR.style.height='38px'});
});
const nav=document.getElementById('nav');
const navLogo=document.getElementById('navLogo');
window.addEventListener('scroll',()=>{
  const solid=scrollY>70;
  nav.classList.toggle('solid',solid);
  // logo stays as-is, looks good on both backgrounds
});
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('[data-to]').forEach(el=>countUp(el))}});},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
function countUp(el){const t=+el.dataset.to,d=1400,s=performance.now();(function tick(n){const p=Math.min((n-s)/d,1);el.textContent=Math.round(t*(1-Math.pow(1-p,3))).toLocaleString('ru');if(p<1)requestAnimationFrame(tick)})(s)}
function mTab(btn,id){document.querySelectorAll('.mtab').forEach(t=>t.classList.remove('on'));document.querySelectorAll('.mpanel').forEach(p=>p.classList.remove('on'));btn.classList.add('on');const panel=document.getElementById(id);panel.classList.add('on');panel.querySelectorAll('.mcard').forEach((c,i)=>{c.style.opacity='0';c.style.transform='translateY(14px)';setTimeout(()=>{c.style.transition='opacity .32s ease,transform .32s ease';c.style.opacity='1';c.style.transform='none'},i*50)})}

// ===== DISH MODAL =====
// Фотографии блюд — добавьте сюда URL фото для каждого блюда
const DISH_PHOTOS = {
  'Полярный плашкоут': 'assets/images/image-02.jpg',
  'Айбарч': 'assets/images/image-03.jpg',
  'Пирожки с дикой уткой': 'assets/images/image-04.jpg',
  'Пермские посикунчики': 'assets/images/image-05.jpg',
  'Дальний кордон': 'assets/images/image-06.jpg',

  'Ассорти солений': 'assets/images/image-07.jpg'
};

function openDishModal(name, desc, price, category) {
  document.getElementById('dishName').textContent = name;
  document.getElementById('dishDesc').textContent = desc;
  document.getElementById('dishPrice').textContent = price;
  document.getElementById('dishTag').textContent = category;

  const img = document.getElementById('dishImg');
  const noPhoto = document.getElementById('dishNoPhoto');
  const photoUrl = DISH_PHOTOS[name];

  if (photoUrl) {
    img.src = photoUrl;
    img.style.display = 'block';
    noPhoto.style.display = 'none';
  } else {
    img.src = '';
    img.style.display = 'none';
    noPhoto.style.display = 'flex';
  }

  document.getElementById('dishModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDishModal() {
  document.getElementById('dishModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeDishModalBg(e) {
  if (e.target === document.getElementById('dishModal')) closeDishModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDishModal(); closeModal(); } });

// Вешаем клик на все карточки меню
document.querySelectorAll('.mcard').forEach(card => {
  const name = card.querySelector('.mcard-name')?.textContent || '';
  const desc = card.querySelector('.mcard-desc')?.textContent || '';
  const price = card.querySelector('.mcard-price')?.textContent || '';
  const panel = card.closest('.mpanel');
  const tabId = panel ? panel.id : '';
  const tabNames = {
    ch: 'Холодные закуски', hg: 'Горячие закуски', kl: 'Классика Севера',
    sa: 'Салаты', su: 'Супы', mm: 'Горячие мясные блюда',
    mr: 'Горячие рыбные блюда', pe: 'Пельмени', va: 'Вареники',
    de: 'Десерты', dr: 'Настойки'
  };
  const category = tabNames[tabId] || 'Меню';
  card.addEventListener('click', () => openDishModal(name, desc, price, category));
});


const GALLERY=[
  {title:'Общий зал',tag:'Главное пространство',desc:'Главное пространство ресторана с настоящим вертолётом Ми-2, северным декором и просторной посадкой для гостей. Уникальный интерьер, который запоминается с первого взгляда.',images:['assets/images/atmosphere-main-hall-01.jpg','assets/images/atmosphere-main-hall-02.jpg','assets/images/atmosphere-main-hall-03.jpg']},
  {title:'Палатка',tag:'Особое место',desc:'Уединённый зал в стилистике экспедиционного лагеря: стены палатки, лыжи, весло и массивная деревянная мебель. Подходит для небольшой компании.',images:['assets/images/atmosphere-palatka-modal.jpg','assets/images/atmosphere-palatka-card.jpg']},
  {title:'Заимка',tag:'Охотничий стиль',desc:'Камерный зал с охотничьими трофеями, камином и длинным столом для уютных встреч небольшой компании.',images:['assets/images/atmosphere-zaimka-01.jpg','assets/images/atmosphere-zaimka-02.jpg','assets/images/atmosphere-zaimka-03.jpg']},
];
let activeGallery=0,activeGalleryImage=0;
function showGalleryImage(index){
  const d=GALLERY[activeGallery],images=d.images;
  activeGalleryImage=(index+images.length)%images.length;
  const img=document.getElementById('modal-img');
  img.src=images[activeGalleryImage];
  img.alt=`${d.title}, фотография ${activeGalleryImage+1}`;
  const multiple=images.length>1;
  document.getElementById('modal-prev').classList.toggle('is-hidden',!multiple);
  document.getElementById('modal-next').classList.toggle('is-hidden',!multiple);
  const count=document.getElementById('modal-count');
  count.classList.toggle('is-hidden',!multiple);
  count.textContent=multiple?`${activeGalleryImage+1} / ${images.length}`:'';
}
function openModal(i){
  const d=GALLERY[i];
  activeGallery=i;
  showGalleryImage(0);
  document.getElementById('modal-title').textContent=d.title;
  document.getElementById('modal-desc').textContent=d.desc;
  document.getElementById('modal-tag').textContent=d.tag;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow='hidden';
}
function changeModalImage(step){showGalleryImage(activeGalleryImage+step);}
function closeModal(){document.getElementById('modal').classList.remove('open');document.body.style.overflow='';}
function closeModalBg(e){if(e.target===document.getElementById('modal'))closeModal();}
document.addEventListener('keydown',e=>{if(!document.getElementById('modal').classList.contains('open'))return;if(e.key==='ArrowLeft')changeModalImage(-1);if(e.key==='ArrowRight')changeModalImage(1);});
// Escape handled above
async function doBook(){
  const b=document.getElementById('bBtn');
  const consent=document.getElementById('f-consent');
  const consentLabel=consent.closest('.privacy-consent');
  const originalText='✦ Подтвердить бронирование';

  consentLabel.classList.remove('invalid');
  if(!consent.checked){
    consentLabel.classList.add('invalid');
    consent.focus();
    b.querySelector('span').textContent='Подтвердите согласие на обработку данных';
    return;
  }

  const data={
    name:document.getElementById('f-name').value.trim(),
    phone:document.getElementById('f-phone').value.trim(),
    date:document.getElementById('f-date').value,
    time:document.getElementById('f-time').value,
    guests:document.getElementById('f-guests').value,
    event:document.getElementById('f-event').value,
    wish:document.getElementById('f-wish').value.trim(),
    website:document.getElementById('f-website').value,
    consent:true
  };
  if(data.name.length<2||data.phone.replace(/\D/g,'').length<7||!data.date){
    b.querySelector('span').textContent='Заполните имя, телефон и дату визита';
    return;
  }
  if(!window.BOOKING_API_URL){
    b.querySelector('span').textContent='Подключение бронирования ещё настраивается';
    return;
  }

  b.disabled=true;
  b.querySelector('span').textContent='Отправляем заявку…';
  try{
    const res=await fetch(window.BOOKING_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const result=await res.json().catch(()=>({}));
    if(!res.ok||!result.ok)throw new Error(result.message||'Ошибка отправки');
    b.querySelector('span').textContent=`✓ Заявка ${result.requestId} отправлена`;
    b.style.background='var(--forest2)';
  }catch(error){
    b.querySelector('span').textContent=error.message||'Не удалось отправить — позвоните нам';
    b.disabled=false;
    setTimeout(()=>{b.querySelector('span').textContent=originalText},6000);
  }
}
function toggleMob(){
  const b=document.getElementById('burger'),m=document.getElementById('mobMenu');
  b.classList.toggle('open');m.classList.toggle('open');
  document.body.style.overflow=m.classList.contains('open')?'hidden':'';
}
function closeMob(){
  document.getElementById('burger').classList.remove('open');
  document.getElementById('mobMenu').classList.remove('open');
  document.body.style.overflow='';
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const t=a.getAttribute('href');
  if(t.length>1){const el=document.querySelector(t);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}}
}));
