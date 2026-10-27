// The world and the HUD have separate sizing. This rectangle never depends on
// game-shell measurements, avoiding resize feedback from last frame's size.
export function resolveViewport({layoutWidth,layoutHeight,width,height,offsetLeft=0,offsetTop=0}){
 const positive=(value,fallback)=>Number.isFinite(value)&&value>0?value:fallback;
 const lw=positive(layoutWidth,1),lh=positive(layoutHeight,1);
 const x=Math.max(0,Math.min(Number(offsetLeft)||0,lw-1));
 const y=Math.max(0,Math.min(Number(offsetTop)||0,lh-1));
 return {x,y,width:Math.max(1,Math.floor(Math.min(positive(width,lw),lw-x))),height:Math.max(1,Math.floor(Math.min(positive(height,lh),lh-y)))};
}
export async function tryLandscape(){
 try{if(!screen.orientation?.lock)return false;await screen.orientation.lock('landscape');return true;}catch{return false;}
}
export function setupViewport({onBlocked=()=>{}}={}){
 const coarse=()=>matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 let blocked=false,frame=0,lastRect;
 function measure(){
  const viewport=window.visualViewport,root=document.documentElement;
  const layoutWidth=root.clientWidth||innerWidth;
  const layoutHeight=Math.max(root.clientHeight||0,innerHeight||0);
  const rect=resolveViewport({layoutWidth,layoutHeight,width:viewport?.width||innerWidth,height:viewport?.height||innerHeight,offsetLeft:viewport?.offsetLeft,offsetTop:viewport?.offsetTop});
  lastRect=rect;
  for(const [name,value] of Object.entries({x:rect.x,y:rect.y,w:rect.width,h:rect.height}))root.style.setProperty(`--view-${name}`,`${value}px`);
  // Retain legacy variables for optional menus, never use them to measure.
  root.style.setProperty('--viewport-width',`${rect.width}px`);root.style.setProperty('--viewport-height',`${rect.height}px`);
  const touch=coarse(),portrait=touch&&rect.height>rect.width;
  document.body.dataset.touch=String(touch);document.body.dataset.portrait=String(portrait);
  if(portrait!==blocked){blocked=portrait;onBlocked(portrait);window.dispatchEvent(new CustomEvent('viewportblocked',{detail:{blocked:portrait}}));}
  window.dispatchEvent(new CustomEvent('gameviewportchange',{detail:rect}));
  return rect;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;measure();});}
 const button=document.querySelector('#fullscreen');
 function message(text){let toast=document.querySelector('#viewport-message');if(!toast){toast=document.createElement('div');toast.id='viewport-message';toast.setAttribute('role','status');document.querySelector('#hud-layer').append(toast);}toast.textContent=text;toast.hidden=false;clearTimeout(message.timer);message.timer=setTimeout(()=>toast.hidden=true,3200);}
 button?.addEventListener('click',async()=>{
  try{
   if(document.fullscreenElement){await document.exitFullscreen();return;}
   const shell=document.querySelector('.game-shell');
   if(shell?.requestFullscreen){await shell.requestFullscreen();const locked=await tryLandscape();if(!locked&&coarse())message('已進入全螢幕，請手動將手機轉為橫向');}
   else{await tryLandscape();message('此瀏覽器不支援網頁全螢幕；請手動橫向，仍可完整遊玩');}
  }catch{message('瀏覽器未允許全螢幕；請手動將手機轉為橫向');}
  measure();schedule();
 });
 document.addEventListener('fullscreenchange',()=>{if(button)button.textContent=document.fullscreenElement?'縮小':'全螢幕';measure();schedule();});
 addEventListener('resize',schedule);addEventListener('orientationchange',()=>{measure();schedule();});
 window.screen?.orientation?.addEventListener?.('change',schedule);
 window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
 measure();return {measure,isBlocked:()=>blocked,getRect:()=>({...lastRect})};
}
