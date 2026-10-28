// Safari can begin page zoom before a late dblclick listener runs. Guard the
// native gesture stream on this game only; leave page-level zoom available.
export function installGameGestures(root,{isPlaying=()=>document.body.dataset.gameState==='playing'}={}){
 const nativeField=target=>target?.closest?.('input,select,textarea,[contenteditable=true]');
 const multi=e=>{if(e.touches?.length>1&&e.cancelable)e.preventDefault();};
 root.addEventListener('touchstart',multi,{passive:false});
 root.addEventListener('touchmove',e=>{if(e.touches?.length>1||(isPlaying()&&!nativeField(e.target))){if(e.cancelable)e.preventDefault();}},{passive:false});
 for(const name of ['gesturestart','gesturechange','gestureend'])root.addEventListener(name,e=>{if(e.cancelable)e.preventDefault();},{passive:false});
 let lastTap=null;
 root.addEventListener('touchend',e=>{
  if(e.touches?.length){lastTap=null;return;}
  const touch=e.changedTouches?.[0],target=e.target;
  // Native menus/fields keep their normal single-tap click/focus semantics.
  const nativeButton=target?.closest?.('button,a,summary');
  const surface=!nativeField(target)&&(!nativeButton||nativeButton.hasAttribute('data-action'));
  if(!touch||!surface||!isPlaying()){lastTap=null;return;}
  const now=performance.now();if(lastTap&&now-lastTap.time<350&&Math.hypot(touch.clientX-lastTap.x,touch.clientY-lastTap.y)<36&&e.cancelable)e.preventDefault();
  lastTap={time:now,x:touch.clientX,y:touch.clientY};
 },{passive:false});
 root.addEventListener('touchcancel',()=>{lastTap=null;},{passive:true});
}
