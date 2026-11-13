/* ===== enhance.js — load with <script src="enhance.js" defer></script> (index.html AND admin.html) ===== */
(()=>{
const BEHANCE='https://www.behance.net/boubakeboubake';
const REMOVE_SECTIONS=['projects']; // add ids here to delete more sections, e.g. ['projects','about']
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ---------- A. Admin: shrink images before they upload (works on any file input) ---------- */
document.addEventListener('change',async e=>{
  const inp=e.target;
  if(!inp||inp.type!=='file'||!inp.files||!inp.files.length||inp._enh)return;
  const files=[...inp.files];
  if(!files.some(f=>/^image\/(png|jpe?g)$/.test(f.type)&&f.size>150e3))return;
  e.stopImmediatePropagation();
  const out=new DataTransfer();
  for(const f of files){
    if(!/^image\/(png|jpe?g)$/.test(f.type)||f.size<=150e3){out.items.add(f);continue}
    try{
      const bmp=await createImageBitmap(f),k=Math.min(1,1600/bmp.width);
      const c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);
      c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
      const b=await new Promise(r=>c.toBlob(r,'image/webp',.8));
      out.items.add(b&&b.size<f.size?new File([b],f.name.replace(/\.\w+$/,'')+'.webp',{type:'image/webp'}):f);
    }catch(_){out.items.add(f)}
  }
  inp._enh=true;inp.files=out.files;
  inp.dispatchEvent(new Event('change',{bubbles:true}));
  inp._enh=false;
},true);

/* everything below only runs on the public site */
const ready=fn=>document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn);
ready(()=>{
  const work=$('#work');if(!work)return;

  /* ---------- B. Remove sections you don't want ---------- */
  REMOVE_SECTIONS.forEach(id=>{
    const s=document.getElementById(id);s&&s.remove();
    $$('a[href="#'+id+'"]').forEach(a=>(a.closest('li')||a).remove());
  });

  /* ---------- C. "Design" opens your Behance portfolio ---------- */
  const nd=$('#navdesign');
  if(nd){const a=$('a',nd);a.href=BEHANCE;a.target='_blank';a.rel='noopener';a.textContent='Design Portfolio ↗';nd.hidden=false}
  $$('.foot a[href="#design"]').forEach(a=>{a.href=BEHANCE;a.target='_blank';a.rel='noopener';a.textContent='Design Portfolio ↗'});
  const row=$('.hero .row');
  if(row&&!$('.enh-behance',row))row.insertAdjacentHTML('beforeend','<a class="pill glassbtn enh-behance" href="'+BEHANCE+'" target="_blank" rel="noopener">Design Portfolio ↗</a>');
  const ds=$('#design');if(ds)ds.style.display='none'; // on-page design carousel replaced by Behance

  /* ---------- D. Category chips for My work ---------- */
  const bar=document.createElement('div');bar.className='chips';bar.hidden=true;work.before(bar);
  const groups=()=>$$('.grp',work);
  const show=f=>{groups().forEach(g=>g.hidden=!(f==='all'||g.id===f));$$('button',bar).forEach(b=>b.classList.toggle('on',b.dataset.f===f))};
  bar.addEventListener('click',e=>{const b=e.target.closest('button');b&&show(b.dataset.f)});

  /* ---------- E. Fast thumbnails (runs whenever the work grid fills in) ---------- */
  document.documentElement.classList.add('js-img');
  const c=navigator.connection||{},slow=c.saveData||/(^|-)2g|3g/.test(c.effectiveType||'');
  const yt=id=>'https://i.ytimg.com/vi/'+id+'/'+(slow?'mqdefault':'hqdefault')+'.jpg';
  const tune=()=>{
    $$('.vid[data-yt]',work).forEach(v=>{ // YouTube tiles with no custom thumbnail get YouTube's small one
      if(!$('img',v)){const i=new Image();i.alt='';i.src=yt(v.dataset.yt);v.prepend(i)}
    });
    $$('.vid img,.slide-in img',work).forEach((img,n)=>{
      if(img.dataset.enh)return;img.dataset.enh=1;
      const box=img.parentElement,done=()=>{img.classList.add('ld');box.classList.add('ld')};
      img.decoding='async';
      if(n<3){img.loading='eager';img.fetchPriority='high'}else img.loading='lazy';
      img.addEventListener('error',()=>{const id=box.dataset.yt;if(id&&!img.dataset.fb){img.dataset.fb=1;img.src=yt(id)}else done()});
      img.complete&&img.naturalWidth?done():img.addEventListener('load',done,{once:true});
    });
  };

  const rebuild=()=>{
    const g=groups();
    bar.hidden=g.length<2;
    bar.innerHTML='<button type="button" class="on" data-f="all">All</button>'+
      g.map(x=>'<button type="button" data-f="'+x.id+'">'+x.querySelector('.grp-t').textContent+'</button>').join('');
    tune();
  };
  new MutationObserver(rebuild).observe(work,{childList:true});
  rebuild();
});
})();
