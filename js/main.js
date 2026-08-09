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
  {title:'Общий зал',tag:'Главное пространство',desc:'Просторный зал с деревянными балками, шкурами северных животных и настоящим вертолётом Ми-2. Здесь собираются все гости — атмосфера настоящей северной экспедиции в каждой детали.',img:'https://images.unsplash.com/photo-1550966871-3ed3cbe818b0?w=1200&q=90&auto=format&fit=crop'},
  {title:'Палатка',tag:'Особое место',desc:'Уединённый зал в стиле полевого лагеря. Брезентовые элементы, тёплый свет фонарей, полевые ящики и дух северного приключения — идеально для небольшой компании.',img:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=90&auto=format&fit=crop'},
  {title:'Заимка',tag:'Охотничий стиль',desc:'Камерный зал с охотничьими трофеями, грубой деревянной мебелью и открытым очагом. Для тех, кто ценит уединение и настоящую атмосферу таёжного охотничьего домика.',img:'https://images.unsplash.com/photo-1482192505345-5852718f7798?w=1200&q=90&auto=format&fit=crop'},
];
function openModal(i){
  const d=GALLERY[i];
  document.getElementById('modal-img').src=d.img;
  document.getElementById('modal-img').alt=d.title;
  document.getElementById('modal-title').textContent=d.title;
  document.getElementById('modal-desc').textContent=d.desc;
  document.getElementById('modal-tag').textContent=d.tag;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){document.getElementById('modal').classList.remove('open');document.body.style.overflow='';}
function closeModalBg(e){if(e.target===document.getElementById('modal'))closeModal();}
// Escape handled above
function doBook(){
  const b=document.getElementById('bBtn');
  const consent=document.getElementById('f-consent');
  const consentLabel=consent.closest('.privacy-consent');

  consentLabel.classList.remove('invalid');
  if(!consent.checked){
    consentLabel.classList.add('invalid');
    consent.focus();
    b.querySelector('span').textContent='Подтвердите согласие на обработку данных';
    return;
  }

  b.querySelector('span').textContent='Онлайн-бронирование временно недоступно — позвоните нам';
  b.style.background='var(--forest2)';
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
