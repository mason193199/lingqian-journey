import {Game,BLESSINGS} from './game.js';
import {render} from './render.js';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
canvas.width=1280;canvas.height=720;
const game=new Game();const overlay=document.querySelector('#overlay');
const held=new Set(),pointers=new Map();let edge={},last=performance.now(),previous='',sound=false,audio;
const keys={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'jump',KeyW:'jump',ArrowUp:'jump',KeyJ:'attack',KeyZ:'attack',KeyK:'dash',ShiftLeft:'dash',ShiftRight:'dash',KeyX:'dash'};
function clearInput(){held.clear();pointers.clear();edge={};document.querySelectorAll('.touch-controls .pressed').forEach(b=>b.classList.remove('pressed'));}
function pause(){if(game.state==='playing')game.state='paused';else if(game.state==='paused')game.state='playing';clearInput();}
window.addEventListener('keydown',e=>{if(keys[e.code]){e.preventDefault();if(!e.repeat)edge[keys[e.code]]=true;held.add(keys[e.code]);}if((e.code==='Escape'||e.code==='KeyP')&&!e.repeat)pause();});
window.addEventListener('keyup',e=>{if(keys[e.code])held.delete(keys[e.code]);});
window.addEventListener('blur',()=>{if(game.state==='playing')game.state='paused';clearInput();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(game.state==='playing')game.state='paused';clearInput();}});
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-action]');if(!b)return;e.preventDefault();const action=b.dataset.action;if(action==='pause'){pause();return;}b.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,action);edge[action]=true;b.classList.add('pressed');});
function release(e){const action=pointers.get(e.pointerId);pointers.delete(e.pointerId);if(action)document.querySelectorAll(`[data-action="${action}"]`).forEach(b=>b.classList.remove('pressed'));}
document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);
document.addEventListener('click',e=>{
 const command=e.target.closest('[data-command]')?.dataset.command;
 if(command==='start'||command==='restart'){game.reset();clearInput();playTone(440,.12);}
 if(command==='resume')pause();
 const blessing=e.target.closest('[data-blessing]')?.dataset.blessing;if(blessing&&game.choose(blessing)){clearInput();playTone(660,.25);const toast=document.createElement('div');toast.className='blessing-confirm';toast.textContent=`✦ ${BLESSINGS[blessing].name} · 護佑此行`;toast.setAttribute('role','status');document.querySelector('.game-shell').append(toast);setTimeout(()=>toast.remove(),1200);}
 if(e.target.closest('#sound')){sound=!sound;document.querySelector('#sound').textContent=sound?'音效 開':'音效 關';if(sound)playTone(440,.1);}
});
function playTone(freq,duration){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.type='sine';osc.frequency.setValueAtTime(freq,audio.currentTime);gain.gain.setValueAtTime(.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.start();osc.stop(audio.currentTime+duration);}catch{}}
function screen(){
 if(game.state==='won'&&game.vfx.some(v=>v.kind==='boss-defeat'&&v.life>v.maxLife-.85)){overlay.hidden=true;return;}
 if(game.state===previous)return;previous=game.state;overlay.hidden=game.state==='playing';
 if(game.state==='title')return;
 if(game.state==='blessing')overlay.innerHTML=`<div class="panel blessing-panel"><span class="eyebrow">THE ORACLE · 命運的岔路</span><h1>一籤，一段新旅</h1><p>霧中星燈為你引路。選擇一份祝福，本次旅程持續生效。</p><div class="blessing-grid">${Object.entries(BLESSINGS).map(([id,b],i)=>`<button class="blessing-card ${id}" data-blessing="${id}"><span class="card-number">0${i+1} · ${id==='fire'?'離卦':id==='wood'?'震卦':'巽卦'}</span><span class="element">${b.icon}</span><h2>${b.name}</h2><p>${b.description}</p><span class="pick">選擇此籤 ↗</span></button>`).join('')}</div><small>已回復 25 點生命 · 選擇期間戰鬥暫停</small></div>`;
 if(game.state==='paused')overlay.innerHTML='<div class="panel compact"><span class="eyebrow">TAKE A BREATH</span><h1>歇一歇，再出發</h1><p>竹風仍在，旅途等你。</p><button class="primary" data-command="resume">繼續旅程 →</button><button class="secondary" data-command="restart">重新開始</button></div>';
 if(game.state==='dead'||game.state==='won'){
  const won=game.state==='won';overlay.innerHTML=`<div class="panel compact"><span class="eyebrow">${won?'CHAPTER COMPLETE · 第一章通關':'THE JOURNEY CONTINUES'}</span><div class="end-symbol">${won?'☯':'☾'}</div><h1>${won?'霧散，星燈重明':'此籤未盡，且再啟程'}</h1><p>${won?'竹魄守卸下霧咒，向你輕輕頷首。<br>一縷星光落入羅盤，下一段旅程正在遠方。':'小旅人暫時迷失在靈霧中。<br>觀察紅色預兆，用跳躍和衝刺避開攻擊。'}</p><div class="run-stats">淨化 ${game.kills} 隻妖靈 · ${Math.floor(game.elapsed/60)}分${Math.floor(game.elapsed%60)}秒 · ${BLESSINGS[game.blessing]?.name||'尚未得籤'}</div><button class="primary" data-command="restart">${won?'再求一籤，再走一旅':'重新出發'} →</button></div>`;
 }
}
let lastHp=100,lastKills=0;const hudCache={};function writeHUD(key,value,fn){if(hudCache[key]!==value){hudCache[key]=value;fn(value);}}
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;const active=new Set([...held,...pointers.values()]);const input={left:active.has('left'),right:active.has('right'),attack:active.has('attack')||!!edge.attack,jump:!!edge.jump,dash:!!edge.dash};game.update(dt,input);game.updateVisual(dt);document.body.dataset.gameState=game.state;if(game.player.hp<lastHp)playTone(130,.12);lastHp=game.player.hp;if(game.kills>lastKills)playTone(560,.08);lastKills=game.kills;edge={};render(ctx,game,now/1000);screen();updateHUD();requestAnimationFrame(frame);}
function updateHUD(){const p=game.player;
writeHUD('hp',`${p.hp}/${p.maxHp}`,()=>document.querySelector('#health').innerHTML=`<span style="width:${p.hp/p.maxHp*100}%"></span><b>${Math.ceil(p.hp)} / ${p.maxHp}</b>`);
writeHUD('stage',game.notice,v=>document.querySelector('#stage').textContent=v);
writeHUD('blessing',game.blessing,v=>document.querySelector('#blessings').textContent=v?`✦ ${BLESSINGS[v].name}`:'✧ 尚未得籤');
const boss=game.enemies.find(e=>e.type==='boss');writeHUD('boss',!!boss&&game.state!=='title',v=>document.querySelector('#bossbar').hidden=!v);
writeHUD('bossHp',boss?boss.hp/boss.maxHp:0,v=>document.querySelector('#bosshealth').style.width=`${v*100}%`);
writeHUD('dash',p.dashCd>0,v=>document.querySelector('[data-action="dash"]')?.classList.toggle('cooldown',v));
writeHUD('wave',game.wave,v=>document.querySelector('#hud').dataset.wave=String(v));
}
// Explicit opt-in diagnostics for automated QA; never active in normal play.
if(new URLSearchParams(location.search).has('test'))window.__game=game;
requestAnimationFrame(frame);
