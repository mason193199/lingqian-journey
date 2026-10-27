// Orientation lock is an optional enhancement; physical rotation always works.
export async function tryLandscape(){
 try{if(!screen.orientation?.lock)return false;await screen.orientation.lock('landscape');return true;}catch{return false;}
}
export function setupViewport({onBlocked=()=>{}}={}){
 const coarse=()=>matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
 let blocked=false;
 function measure(){
  const viewport=window.visualViewport;
  const width=Math.round(viewport?.width||innerWidth),height=Math.round(viewport?.height||innerHeight);
  document.documentElement.style.setProperty('--viewport-width',`${width}px`);
  document.documentElement.style.setProperty('--viewport-height',`${height}px`);
  const touch=coarse(),portrait=touch&&height>width;
  document.body.dataset.touch=String(touch);document.body.dataset.portrait=String(portrait);
  if(portrait!==blocked){blocked=portrait;onBlocked(portrait);window.dispatchEvent(new CustomEvent('viewportblocked',{detail:{blocked:portrait}}));}
 }
 const button=document.querySelector('#fullscreen');
 function message(text){let toast=document.querySelector('#viewport-message');if(!toast){toast=document.createElement('div');toast.id='viewport-message';toast.setAttribute('role','status');(document.fullscreenElement||document.body).append(toast);}toast.textContent=text;toast.hidden=false;clearTimeout(message.timer);message.timer=setTimeout(()=>toast.hidden=true,3200);}
 button?.addEventListener('click',async()=>{
  try{
   if(document.fullscreenElement){await document.exitFullscreen();return;}
   const shell=document.querySelector('.game-shell');
   if(shell?.requestFullscreen){await shell.requestFullscreen();const locked=await tryLandscape();if(!locked&&coarse())message('已進入全螢幕，請手動將手機轉為橫向');}
   else{await tryLandscape();message('此瀏覽器不支援網頁全螢幕；請手動橫向，仍可完整遊玩');}
  }catch{message('瀏覽器未允許全螢幕；請手動將手機轉為橫向');}
  measure();
 });
 document.addEventListener('fullscreenchange',()=>{if(button)button.textContent=document.fullscreenElement?'縮小':'全螢幕';measure();});
 addEventListener('resize',measure);addEventListener('orientationchange',measure);window.visualViewport?.addEventListener('resize',measure);window.visualViewport?.addEventListener('scroll',measure);measure();
 return {measure,isBlocked:()=>blocked};
}
