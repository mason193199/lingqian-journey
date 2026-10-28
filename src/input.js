import {installGameGestures} from './gestures.js';
const BINDINGS={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'jump',KeyW:'jump',ArrowUp:'jump',KeyJ:'attack',KeyZ:'attack',KeyK:'dash',ShiftLeft:'dash',ShiftRight:'dash',KeyX:'dash',KeyE:'skill',KeyL:'skill'};
const editable=target=>target?.closest?.('input,textarea,select,[contenteditable=true],dialog[open]');
// Track physical keys and individual fingers, rather than only logical actions.
export function createControls(root,{onPause=()=>{},onBlur=()=>{},isPlaying}={}){
 installGameGestures(root,{isPlaying});
 const keys=new Set(),pointers=new Map();let edges={};
 const paint=button=>button.classList.toggle('pressed',[...pointers.values()].some(p=>p.button===button));
 function release(e){const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);paint(p.button);try{if(p.button.hasPointerCapture?.(e.pointerId))p.button.releasePointerCapture(e.pointerId);}catch{}}
 function clear(){keys.clear();edges={};for(const id of [...pointers.keys()])release({pointerId:id});}
 window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||editable(e.target)||e.target.closest?.('button')&&['Space','Enter'].includes(e.code))return;const action=BINDINGS[e.code];if(action){e.preventDefault();if(!e.repeat)edges[action]=true;keys.add(e.code);}if(['Escape','KeyP'].includes(e.code)&&!e.repeat)onPause();});
 window.addEventListener('keyup',e=>keys.delete(e.code));
 root.addEventListener('pointerdown',e=>{const button=e.target.closest('[data-action]');if(!button||button.disabled)return;e.preventDefault();const action=button.dataset.action;if(action==='pause'){onPause();return;}pointers.set(e.pointerId,{action,button});edges[action]=true;paint(button);try{button.setPointerCapture(e.pointerId);}catch{}});
 root.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;const r=p.button.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)release(e);});
 root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled||e.detail!==0)return;if(b.dataset.action==='pause')onPause();else edges[b.dataset.action]=true;});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(type,release);
 // Restrict gesture suppression to gameplay surfaces, leaving page zoom available.
 for(const type of ['contextmenu','selectstart','dragstart','dblclick'])root.addEventListener(type,e=>{if(!editable(e.target))e.preventDefault();});
 window.addEventListener('blur',()=>{clear();onBlur();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();onBlur();}});
 return {clear,consume(){edges={};},read(){const active=new Set([...keys].map(k=>BINDINGS[k]));for(const p of pointers.values())active.add(p.action);return {left:active.has('left'),right:active.has('right'),attack:active.has('attack')||!!edges.attack,jump:!!edges.jump,dash:!!edges.dash,skill:!!edges.skill};}};
}
