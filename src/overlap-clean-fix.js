const cards=[...document.querySelectorAll('.flower-info')];
const cover=document.querySelector('.cover-title');
function clean(){
 const shown=cards.filter(el=>el.classList.contains('show'));
 if(shown.length>1) shown.slice(0,-1).forEach(el=>el.classList.remove('show'));
 const active=cards.some(el=>el.classList.contains('show'));
 if(cover){cover.style.opacity=active?'0':'1';cover.style.visibility=active?'hidden':'visible';}
}
cards.forEach(card=>{card.classList.add('flower-card');new MutationObserver(clean).observe(card,{attributes:true,attributeFilter:['class']});});
clean();
