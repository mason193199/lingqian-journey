import {TRIALS,trialSkillLock} from './trials.js';
import {STATUS_DEFS} from './status.js';
import {ROOM_TYPES} from './rooms.js';
import {SYNERGIES} from './synergies.js';
import {CHARACTERS} from './characters.js';
import {WEAPONS} from './weapons.js';
import {ELEMENTS,BAGUA,EVOLUTIONS} from './evolution.js';
import {RELICS,QUALITIES} from './relics.js';
const TABS={fight:'戰鬥',build:'Build',relic:'法器',journey:'旅程'};
export function setupInterface(g,{onToggleHUD=()=>{}}={}){
 const shell=document.querySelector('.game-shell'),hud=document.querySelector('#hud-layer');
 const wrap=document.createElement('div');wrap.className='game-layout';shell.before(wrap);wrap.innerHTML='<div class="desktop-top"></div><aside class="desktop-left" aria-label="旅人戰況"></aside><aside class="desktop-right" aria-label="旅程資訊"></aside>';wrap.insertBefore(shell,wrap.querySelector('.desktop-right'));
 const left=wrap.querySelector('.desktop-left'),right=wrap.querySelector('.desktop-right'),top=wrap.querySelector('.desktop-top');
 for(const id of ['buildhud','moneyhud']){const node=document.createElement('div');node.id=id;document.querySelector('.combat-readout').append(node);}
 const selectors=['.player-status','.combat-readout','.active-blessings','.journey-status','.boss-bar'];
 const nodes=selectors.map(s=>{const node=hud.querySelector(s),marker=document.createComment(s);node.before(marker);return {node,marker};});
 let desktop,tab='build',signature='',navSignature='';
 const shortcuts=document.createElement('div');shortcuts.className='hud-shortcuts';shortcuts.innerHTML='<button data-hud-toggle title="H 切換簡潔／完整資訊">資訊 H</button><span>1 戰鬥 · 2 Build · 3 法器 · 4 旅程</span>';left.append(shortcuts);
 const skillSummary=document.createElement('div');skillSummary.className='skill-summary';left.append(skillSummary);
 const tabs=()=>`<nav class="info-tabs" aria-label="資訊分頁">${Object.entries(TABS).map(([id,name])=>`<button data-info-tab="${id}" aria-pressed="${tab===id}">${name}</button>`).join('')}</nav>`;
 function content(){const p=g.player,b=g.build,c=g.character;switch(tab){
 case 'fight':return `<h3>${c?CHARACTERS[c.id].name:'見習旅人'}</h3><p>${c?CHARACTERS[c.id].passive:''}</p><p>天賦技能：${c?CHARACTERS[c.id].skill:'E 施放'}<br>冷卻 ${Math.ceil(c?.skillCd||0)} 秒</p><p>生命 ${Math.ceil(p.hp)} / ${p.maxHp} · 靈力 ${Math.ceil(p.energy||0)}</p><h3>狀態與持續時間</h3><ul class="status-detail">${(p.statuses||[]).filter(s=>s.remaining>0).map(s=>`<li>${STATUS_DEFS[s.id]?.icon||'✦'} ${STATUS_DEFS[s.id]?.name||'靈氣'}${s.stacks>1?' ×'+s.stacks:''} · ${Math.ceil(s.remaining)}秒${s.id==='shield'?' · 吸收'+Math.ceil(s.shield||0):''}</li>`).join('')||'<li>目前無異常狀態</li>'}</ul>`;
 case 'relic':return `<h3>同行法器 · ${g.relics.length}</h3>${g.relics.map(r=>`<p><b>${RELICS[r.id].icon} ${r.name} · ${QUALITIES[r.quality]}</b><br>${RELICS[r.id].description}</p>`).join('')||'<p>選路尋找法器，改變本局打法。</p>'}`;
 case 'journey':return `<h3>靈霧竹林</h3><p>符匣尋得 ${g.run?.secretsFound||0} · 天劫完成 ${g.run?.trialsCompleted||0} 房${g.run?.trial?.id?' · '+TRIALS[g.run.trial.id].name:''}</p><p>第 ${(g.run?.floor||0)+1} 間 · 靈錢 ${g.money||0}</p><p>淨化 ${g.kills} · ${Math.floor(g.elapsed||0)} 秒</p><p>${g.run?.path?.map(r=>ROOM_TYPES[typeof r==='string'?r:r.type]?.name||'未知房間').join(' → ')||'旅程剛開始'}</p><p>交易印記 ${g.run?.modifiers?.deals||0}/2 · 霧絆剩 ${g.run?.modifiers?.slowRooms||0} 戰<br>命籤剩 ${g.run?.modifiers?.fortune?.remaining||0} 戰 · 額外妖靈剩 ${g.run?.modifiers?.extraRooms||0} 戰</p>`;
 default:return `<h3>${WEAPONS[p.weapon]?.name||'桃木劍'}</h3><p>${ELEMENTS[b?.element]?.name||'五行未定'} × ${BAGUA[b?.bagua]?.name||'卦象未定'}</p><p>${Object.values(EVOLUTIONS).find(e=>e.id===b?.evolution)?.name||'尚未進化'}</p><p>協同：${g.synergyNames?.join('、')||'尚未發現'}</p>${(g.synergies||[]).map(id=>`<p>${SYNERGIES[id].description}</p>`).join('')}`;}}
 function details(){return `<div class="info-detail">${tabs()}<div class="info-content">${content()}</div></div>`;}
 function reflow(){const next=document.body.dataset.touch!=='true'&&!document.fullscreenElement;if(next===desktop)return;desktop=next;document.body.dataset.desktop=String(next);if(next){left.replaceChildren(nodes[0].node,nodes[1].node,skillSummary,shortcuts,nodes[2].node);top.append(nodes[3].node,nodes[4].node);}else for(const {node,marker}of nodes)marker.after(node);signature='';navSignature='';}
 window.addEventListener('gameviewportchange',reflow);document.addEventListener('fullscreenchange',reflow);
 function selectTab(id){if(!TABS[id])return;tab=id;signature='';navSignature='';for(const el of document.querySelectorAll('.info-detail')){el.querySelector('.info-tabs').outerHTML=tabs();el.querySelector('.info-content').innerHTML=content();}}
 document.addEventListener('click',e=>{if(e.target.closest('[data-hud-toggle]'))onToggleHUD();const id=e.target.closest('[data-info-tab]')?.dataset.infoTab;if(id)selectTab(id);});
 document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,select,textarea,dialog[open],[contenteditable=true]'))return;if(e.code==='KeyH'){e.preventDefault();onToggleHUD();}const id={Digit1:'fight',Digit2:'build',Digit3:'relic',Digit4:'journey'}[e.code];if(id){e.preventDefault();selectTab(id);}});
 const button=document.createElement('button');button.dataset.command='inspect';button.textContent='資訊';button.className='mobile-inspect';button.setAttribute('aria-label','展開旅人與Build資訊');document.querySelector('.hud-actions').prepend(button);
 reflow();return {details,update(){reflow();const skill=g.character?CHARACTERS[g.character.id].skill.split('：')[0]+' · E '+(trialSkillLock(g)>0?'封靈'+Math.ceil(trialSkillLock(g))+'秒':g.character.skillCd>0?Math.ceil(g.character.skillCd)+'秒':'就緒'):'天賦 · E';if(skillSummary.textContent!==skill)skillSummary.textContent=skill;if(!desktop)return;if(!right.querySelector('.info-detail'))right.innerHTML=details();const nav=tabs();if(nav!==navSignature){navSignature=nav;right.querySelector('.info-tabs').outerHTML=nav;}const next=content();if(next!==signature){signature=next;right.querySelector('.info-content').innerHTML=next;}}};
}
