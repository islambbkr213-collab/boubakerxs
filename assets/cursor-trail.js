/* Cursor symbol trail: colorful rounded tiles that chase the pointer and fade out. */
(function(){
  if(window.matchMedia('(pointer:coarse)').matches||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var SET=[['?','#c4b5fd','#111'],['!','#f9a8d4','#111'],['*','#e11d2e','#fff'],['%','#f08a5d','#fff'],['&','#f5f5f5','#111'],['@','#22c55e','#fff'],['+','#facc15','#111'],['#','#2563eb','#fff'],['/','#34e5b5','#111'],['*','#3a3a3d','#fff'],['©','#e11d2e','#fff']];
  var N=SET.length,SIZE=38,box=document.createElement('div');
  box.setAttribute('aria-hidden','true');
  box.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden';
  var tiles=SET.map(function(s,i){
    var d=document.createElement('div');
    d.textContent=s[0];
    d.style.cssText='position:absolute;left:0;top:0;width:'+SIZE+'px;height:'+SIZE+'px;border-radius:11px;display:grid;place-items:center;font:800 20px/1 Inter,system-ui,sans-serif;background:'+s[1]+';color:'+s[2]+';opacity:0;will-change:transform,opacity;box-shadow:0 6px 16px rgba(0,0,0,.22)';
    box.appendChild(d);
    return {el:d,x:-100,y:-100,i:i};
  });
  document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(box)});
  if(document.body)document.body.appendChild(box);
  var mx=-100,my=-100,last=0,running=false,seen=false;
  addEventListener('pointermove',function(e){
    if(e.pointerType==='touch')return;
    mx=e.clientX;my=e.clientY;last=performance.now();
    if(!seen){seen=true;tiles.forEach(function(t){t.x=mx;t.y=my})}
    if(!running){running=true;requestAnimationFrame(tick)}
  },{passive:true});
  document.addEventListener('mouseleave',function(){last=0});
  function tick(now){
    var idle=now-last,fade=idle>120?Math.max(0,1-(idle-120)/420):1,alive=false;
    for(var k=0;k<N;k++){
      var t=tiles[k],tx=k?tiles[k-1].x:mx,ty=k?tiles[k-1].y:my,e=k?0.42:0.6;
      t.x+=(tx-t.x)*e;t.y+=(ty-t.y)*e;
      var o=(1-k/(N+2))*fade,s=1-k*0.035;
      t.el.style.transform='translate3d('+(t.x-SIZE/2+14)+'px,'+(t.y-SIZE/2+14)+'px,0) scale('+s+') rotate('+((k%2?1:-1)*k*1.2)+'deg)';
      t.el.style.opacity=o>0.02?o.toFixed(3):0;
      if(o>0.02)alive=true;
    }
    if(alive||idle<1000)requestAnimationFrame(tick);else running=false;
  }
})();
