// Cookie banner
(function(){
  var bar = document.getElementById('cookieBar');
  if(!bar) return;
  if(!localStorage.getItem('cookieChoice')){
    setTimeout(function(){ bar.classList.add('show'); }, 1200);
  }
  document.getElementById('cookieAccept').addEventListener('click', function(){
    localStorage.setItem('cookieChoice','accepted');
    bar.classList.remove('show');
  });
  document.getElementById('cookieDecline').addEventListener('click', function(){
    localStorage.setItem('cookieChoice','declined');
    bar.classList.remove('show');
  });
})();
