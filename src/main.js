import {ELEMENTS,BAGUA,EVOLUTIONS} from './evolution.js';
import {Game,BLESSINGS} from './game.js';
import {MetaStore,UPGRADE_INFO} from './meta.js';
import {CHARACTERS,TALENTS} from './characters.js';
import {WEAPONS} from './weapons.js';
import {STATUS_DEFS} from './status.js';
import {setupViewport,tryLandscape} from './viewport.js';
import {render,renderPortrait} from './render.js';
import {CHARACTER_GUIDE} from './character-guide.js';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
canvas.width=1280;canvas.height=720;
const store=new MetaStore();const diagnostics=new URLSearchParams(location.search).has('test');let runId=null,runReward=0;
const game=new Game();const overlay=document.querySelector('#overlay');
const held=new Set(),pointers=new Map();let edge={},last=performance.now(),previous='',sound=!!store.data.settings.sound,audio;
const keys={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'jump',KeyW:'jump',ArrowUp:'jump',KeyJ:'attack',KeyZ:'attack',KeyK:'dash',ShiftLeft:'dash',ShiftRight:'dash',KeyX:'dash',KeyE:'skill',KeyL:'skill'};
function clearInput(){held.clear();pointers.clear();edge={};document.querySelectorAll('.touch-controls .pressed').forEach(b=>b.classList.remove('pressed'));}
setupViewport({onBlocked:(blocked)=>{if(blocked&&game.state==='playing')game.state='paused';clearInput();}});
function startRun(legacy=false){game.reset({...store.runOptions(),build:!legacy,...(legacy?{character:null}:{})});runId=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;runReward=0;lastVfx=0;clearInput();previous='';lastHp=game.player.hp;tryLandscape();playTone(440,.12);}
function prepare(){const oldScroll=overlay.querySelector('.prep-panel')?.scrollTop||0;game.state='preparing';clearInput();previous='';overlay.hidden=false;overlay.innerHTML=preparation();for(const portrait of overlay.querySelectorAll('[data-portrait-id]')){const id=portrait.dataset.portraitId;renderPortrait(portrait.getContext('2d'),id,CHARACTER_GUIDE[id].recommended);}overlay.querySelector('.prep-panel').scrollTop=oldScroll;}
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
 if(command==='start'){if(diagnostics)startRun(true);else prepare();}
 if(command==='prepare')prepare();
 if(command==='start-run'||command==='restart')startRun();
 const character=e.target.closest('[data-character]')?.dataset.character;if(character){store.selectCharacter(character);prepare();}
 if(command==='character-skill'){if(game.useSkill())previous='';}
 if(command==='reroll'){if(game.rerollBlessings()){previous='';clearInput();}}
 const talent=e.target.closest('[data-talent]');if(talent){store.buyTalent(store.data.selectedCharacter,talent.dataset.talent);prepare();}
 const branch=e.target.closest('[data-branch]');if(branch){store.selectBranch(store.data.selectedCharacter,branch.dataset.branch);prepare();}
 const weapon=e.target.closest('[data-weapon]')?.dataset.weapon;if(weapon){store.selectWeapon(weapon);prepare();}
 const upgrade=e.target.closest('[data-upgrade]');if(upgrade){store.purchase(upgrade.dataset.upgrade,upgrade.dataset.mastery);prepare();}
 const fate=e.target.closest('[data-fate]')?.dataset.fate;if(fate){store.setLoadout(fate,store.data.loadout.relic);prepare();}
 const relic=e.target.closest('[data-relic]')?.dataset.relic;if(relic){store.setLoadout(store.data.loadout.fate,relic);prepare();}
 if(command==='resume')pause();
 const blessing=e.target.closest('[data-blessing]')?.dataset.blessing;if(blessing&&game.choose(blessing)){clearInput();playTone(660,.25);const toast=document.createElement('div');toast.className='blessing-confirm';toast.textContent=`✦ ${BLESSINGS[blessing].name} · 護佑此行`;toast.setAttribute('role','status');document.querySelector('#hud-layer').append(toast);setTimeout(()=>toast.remove(),1200);}
 if(e.target.closest('#sound')){sound=!sound;store.data.settings.sound=sound;store.save();document.querySelector('#sound').textContent=sound?'音效 開':'音效 關';if(sound)playTone(440,.1);}
});
function playTone(freq,duration,type='sine'){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.type=type;osc.frequency.setValueAtTime(freq,audio.currentTime);gain.gain.setValueAtTime(.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.start();osc.stop(audio.currentTime+duration);}catch{}}
function screen(){
 if(game.state==='won'&&game.vfx.some(v=>v.kind==='boss-defeat'&&v.life>v.maxLife-.85)){overlay.hidden=true;return;}
 if(game.state===previous&&game.blessingRevision===screen.revision)return;screen.revision=game.blessingRevision;previous=game.state;overlay.hidden=game.state==='playing';
 if(game.state==='title'||game.state==='preparing')return;
 if(game.state==='blessing')overlay.innerHTML=`<div class="panel blessing-panel"><span class="eyebrow">THE ORACLE · 命運的岔路</span><h1>一籤，一段新旅</h1><p>霧中星燈為你引路。選擇一份祝福，本次旅程持續生效。</p><div class="blessing-grid">${(game.blessingOptions||['fire','wood','wind']).map((id,i)=>{const b=BLESSINGS[id];return [id,b];}).map(([id,b],i)=>`<button class="blessing-card ${id}" data-blessing="${id}"><span class="card-number">0${i+1} · ${id==='fire'?'離卦':id==='water'?'坎卦':id==='thunder'?'震卦':'巽卦'}</span><span class="element">${b.icon}</span><h2>${b.name}</h2><p>${b.description}</p><span class="pick">選擇此籤 ↗</span></button>`).join('')}</div>${game.character?.id==='aqian'?`<button data-command="reroll" ${game.character.rerolls<=0?'disabled':''}>免費重抽（${game.character.rerolls}）</button><button data-command="character-skill" ${game.character.skillCd>0?'disabled':''}>改命技能</button>`:''}<small>已回復 25 點生命 · 選擇期間戰鬥暫停</small></div>`;
 if(game.state==='paused')overlay.innerHTML='<div class="panel compact"><span class="eyebrow">TAKE A BREATH</span><h1>歇一歇，再出發</h1><p>竹風仍在，旅途等你。</p><button class="primary" data-command="resume">繼續旅程 →</button><button class="secondary" data-command="restart">重新開始</button></div>';
 if(game.state==='dead'||game.state==='won'){
  const won=game.state==='won';overlay.innerHTML=`<div class="panel compact"><span class="eyebrow">${won?'CHAPTER COMPLETE · 第一章通關':'THE JOURNEY CONTINUES'}</span><div class="end-symbol">${won?'☯':'☾'}</div><h1>${won?'霧散，星燈重明':'此籤未盡，且再啟程'}</h1><p>${won?'竹魄守卸下霧咒，向你輕輕頷首。<br>一縷星光落入羅盤，下一段旅程正在遠方。':'小旅人暫時迷失在靈霧中。<br>觀察紅色預兆，用跳躍和衝刺避開攻擊。'}</p><div class="run-stats">淨化 ${game.kills} 隻妖靈 · ${Math.floor(game.elapsed/60)}分${Math.floor(game.elapsed%60)}秒 · ${BLESSINGS[game.blessing]?.name||'尚未得籤'}</div><p class="resource-line">本局獲得 ${runReward} 靈玉 · 持有 ${store.data.jade} 靈玉</p><button class="secondary" data-command="prepare">行前準備／修行</button><button class="primary" data-command="restart">${won?'再求一籤，再走一旅':'重新出發'} →</button></div>`;
 }
}
let lastHp=100,lastKills=0,lastAttack=0,lastVfx=0,hurtUntil=0;const hudCache={};function writeHUD(key,value,fn){if(hudCache[key]!==value){hudCache[key]=value;fn(value);}}
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;const active=new Set([...held,...pointers.values()]);const input={left:active.has('left'),right:active.has('right'),attack:active.has('attack')||!!edge.attack,jump:!!edge.jump,dash:!!edge.dash,skill:!!edge.skill};let inputConsumed=false;if((game.hitStop||0)>0){game.hitStop=Math.max(0,game.hitStop-dt);}else{game.update(dt,input);inputConsumed=true;}game.updateVisual(dt);for(const v of game.vfx){if(v.id>lastVfx){if(['hit','critical','rune','lightning'].includes(v.kind)){const w=game.player.weapon;playTone(w==='sword'?190:w==='talisman'?820:520,.055,w==='sword'?'triangle':'sine');}lastVfx=v.id;}}if(game.player.attackCount!==lastAttack){if(game.player.attackCount>lastAttack){const w=game.player.weapon;playTone(w==='sword'?290:w==='talisman'?640:420,w==='staff'?.2:.07,w==='sword'?'triangle':'sine');}lastAttack=game.player.attackCount;}if(runId&&['won','dead'].includes(game.state)){runReward=store.settleRun({id:runId,kills:game.kills,won:game.state==='won'});runId=null;}document.body.dataset.gameState=game.state;if(game.player.hp<lastHp)playTone(130,.12);if(game.player.hp<lastHp)hurtUntil=now+220;document.querySelector('#health')?.classList.toggle('hurt',now<hurtUntil);lastHp=game.player.hp;if(game.kills>lastKills)playTone(560,.08);lastKills=game.kills;if(inputConsumed||game.state!=='playing')edge={};render(ctx,game,now/1000);screen();updateHUD();requestAnimationFrame(frame);}
function updateHUD(){const p=game.player;
writeHUD('hp',`${p.hp}/${p.maxHp}`,()=>document.querySelector('#health').innerHTML=`<span style="width:${p.hp/p.maxHp*100}%"></span><b>${Math.ceil(p.hp)} / ${p.maxHp}</b>`);
writeHUD('stage',game.notice,v=>document.querySelector('#stage').textContent=v);
writeHUD('blessing',game.blessing,v=>document.querySelector('#blessings').textContent=v?`✦ ${BLESSINGS[v].name}`:'✧ 尚未得籤');
const weapon=game.player.weapon||'sword';writeHUD('weapon',weapon+(game.character?.id||''),v=>{const el=document.querySelector('#weaponhud');if(el)el.textContent=(game.character?CHARACTERS[game.character.id].name+' · ':'')+({sword:'⚔ 桃木劍',talisman:'符 靈符',staff:'✧ 靈杖'})[weapon];});
writeHUD('energy',Math.ceil(p.energy??100)+'/'+(p.maxEnergy??100),v=>{const el=document.querySelector('#energy');if(el)el.textContent='靈力 '+v;});
const statuses=(p.statuses||[]).map(v=>`${STATUS_DEFS[v.id]?.icon||'✦'}${STATUS_DEFS[v.id]?.name||v.id}${v.stacks>1?'×'+v.stacks:''} ${Math.ceil(v.remaining)}s`).join(' · ');writeHUD('status',statuses,v=>{const el=document.querySelector('#statushud');if(el)el.textContent=v;});
const boss=game.enemies.find(e=>e.type==='boss');writeHUD('boss',!!boss&&game.state!=='title',v=>document.querySelector('#bossbar').hidden=!v);
writeHUD('bossHp',boss?boss.hp/boss.maxHp:0,v=>document.querySelector('#bosshealth').style.width=`${v*100}%`);
writeHUD('dash',p.dashCd>0,v=>document.querySelector('[data-action="dash"]')?.classList.toggle('cooldown',v));
const character=game.character;writeHUD('skill',character?`${character.id}/${Math.ceil(character.skillCd)}`:'',()=>{const el=document.querySelector('[data-action=skill]');if(el){el.textContent=character?`${CHARACTERS[character.id].skill.split('：')[0]} ${character.skillCd>0?Math.ceil(character.skillCd)+'s':'E'}`:'天賦 E';el.classList.toggle('cooldown',character?.skillCd>0);}});
writeHUD('wave',game.wave,v=>document.querySelector('#hud').dataset.wave=String(v));
}
function preparation(){
 const d=store.data,w=d.selectedWeapon;
 const names={sword:'桃木劍',talisman:'靈符',staff:'靈杖'};
 const desc={sword:'近戰・高擊退・破甲｜靠近敵人揮劍，重視走位。',talisman:'中遠程・飛行符紙・燃燒｜保持距離，符咒命中爆裂。',staff:'中距離・範圍法術・冰緩｜消耗靈力，低速強力法術。'};
 const card=(id,label,note,level,max,weapon)=>{const cost=store.cost(id,weapon);return `<button class="upgrade-card" data-upgrade="${id}" ${weapon?`data-mastery="${weapon}"`:''} ${level>=max||d.jade<cost?'disabled':''}><b>${label} ${level}/${max}</b><small>${note}</small><span>${level>=max?'已圓滿':`${cost} 靈玉`}</span></button>`;};
 return `<div class="panel prep-panel"><span class="eyebrow">行前準備 · 見習靈術師</span><h1>帶上法器，再入竹林</h1><div class="resource-line">◆ 靈玉 ${d.jade} · ${store.storageAvailable===false?'本機無法存檔，請勿關閉頁面':'自動保存於此瀏覽器'}</div><h2>選擇旅人 · v0.2</h2><p class="prep-note">上下滑動查看角色、武器與修行；推薦武器不限制裝備。</p><div class="character-grid">${Object.entries(CHARACTERS).map(([id,c])=>`<button data-character="${id}" aria-pressed="${d.selectedCharacter===id}" title="${c.passive}"><canvas class="character-portrait" data-portrait-id="${id}" width="144" height="160" role="img" aria-label="${c.name}像素立繪"></canvas><b>${c.name}・${c.title}</b><small>${CHARACTER_GUIDE[id].role}</small><span>${c.passive}</span><small>主動：${c.skill.split('：')[0]}</small><small>推薦：${WEAPONS[CHARACTER_GUIDE[id].recommended].name}</small></button>`).join('')}</div><section class="traveller-detail" aria-label="已選旅人資訊"><strong>${CHARACTERS[d.selectedCharacter].name}・${CHARACTERS[d.selectedCharacter].title}</strong><p>${CHARACTER_GUIDE[d.selectedCharacter].howTo}</p><p>被動：${CHARACTERS[d.selectedCharacter].passive}</p><p>主動：${CHARACTERS[d.selectedCharacter].skill} 冷卻 ${CHARACTERS[d.selectedCharacter].cooldown} 秒；鍵盤 E／L 或觸控天賦鍵。</p></section><h2>專屬天賦 · 本局僅啟用一支</h2><div class="talent-grid">${Object.entries(TALENTS[d.selectedCharacter]||{}).map(([id,t])=>{const level=d.talentUnlocks[d.selectedCharacter][id];return `<article><b>${t.name} ${level}/2</b><p>${t.description}</p><button data-talent="${id}" ${level>=2||d.jade<store.talentCost(d.selectedCharacter,id)?'disabled':''}>${level>=2?'已修成':store.talentCost(d.selectedCharacter,id)+' 靈玉修習'}</button><button data-branch="${id}" aria-pressed="${d.selectedBranches[d.selectedCharacter]===id}" ${!level?'disabled':''}>裝配此流派</button></article>`;}).join('')}</div><button data-branch="none">不裝配專屬天賦</button><h2>武器架</h2><div class="prep-grid">${Object.keys(names).map(id=>{const a=WEAPONS[id];return `<button class="weapon-card ${w===id?'selected':''}" data-weapon="${id}" aria-pressed="${w===id}"><strong>${id==='sword'?'⚔':id==='staff'?'✧':'符'} ${names[id]}</strong><p>${desc[id]}</p><small>傷害 ${a.damage??a.baseDamage} · 間隔 ${a.cooldown??a.attackSpeed}s · 距離 ${a.range} · 暴擊 ${Math.round((a.crit||0)*100)}% ×${a.critDamage||1.5}<br>元素 ${a.element||'靈'} · 擊退 ${a.knockback} · ${a.rarity||'初階'}</small></button>`;}).join('')}</div><h2>局外修行 · 小幅成長，有所上限</h2><div class="upgrade-grid">${card('life','生命修行','每級初始生命 +4',d.upgrades.life,5)}${card('spirit','靈力修行','每級靈力上限 +10',d.upgrades.spirit,3)}${card('mastery',names[w]+'精通','每級此武器傷害 +3%',d.mastery[w],3,w)}${card('fate','命格','解鎖開局護盾／霸體',d.upgrades.fate,1)}${card('relic','法器欄','解鎖靈力／生命配置',d.upgrades.relic,1)}</div>${d.upgrades.fate?`<div class="meta-tabs">命格 ${[['none','無'],['shield','護盾'],['unstoppable','霸體']].map(([v,n])=>`<button data-fate="${v}" aria-pressed="${d.loadout.fate===v}">${n}</button>`).join('')}</div>`:''}${d.upgrades.relic?`<div class="meta-tabs">法器 ${[['none','無'],['energy','靈力 +10'],['vitality','生命 +4']].map(([v,n])=>`<button data-relic="${v}" aria-pressed="${d.loadout.relic===v}">${n}</button>`).join('')}</div>`:''}<div class="prep-actions"><button class="primary" data-command="start-run">開始冒險 →</button><small>靈玉：每隻妖靈 2 · Boss 額外 10 · 首次通關額外 10</small></div></div>`;
}
// Explicit opt-in diagnostics for automated QA; never active in normal play.
if(diagnostics){window.__game=game;window.__meta=store;}
requestAnimationFrame(frame);
