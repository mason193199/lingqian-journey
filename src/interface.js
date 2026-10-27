import {SYNERGIES} from './synergies.js';
import {CHARACTERS} from './characters.js';
import {WEAPONS} from './weapons.js';
import {ELEMENTS,BAGUA,EVOLUTIONS} from './evolution.js';
import {RELICS,QUALITIES} from './relics.js';
const TABS={fight:'戰鬥',build:'Build',relic:'法器',journey:'旅程'};
export function setupInterface(g){
 const shell=document.querySelector('.game-shell'),hud=document.querySelector('#hud-layer');
 const wrap=document.createElement('div');wrap.className='game-layout';shell.before(wrap);wrap.innerHTML='<div class="desktop-top"></div><aside class="desktop-left" aria-label="旅人戰況"></aside><aside class="desktop-right" aria-label="旅程資訊"></aside>';wrap.insertBefore(shell,wrap.querySelector('.desktop-right'));
 const left=wrap.querySelector('.desktop-left'),right=wrap.querySelector('.desktop-right'),top=wrap.querySelector('.desktop-top');
 for(const id of ['buildhud','moneyhud']){const node=document.createElement('div');node.id=id;document.querySelector('.combat-readout').append(node);}
 const selectors=['.player-status','.combat-readout','.active-blessings','.journey-status','.boss-bar'];
 const nodes=selectors.map(s=>{const node=hud.querySelector(s),marker=document.createComment(s);node.before(marker);return {node,marker};});
 let desktop,tab='build',signature='';
 const tabs=()=>`<nav class="info-tabs" aria-label="資訊分頁">${Object.entries(TABS).map(([id,name])=>`<button data-info-tab="${id}" aria-pressed="${tab===id}">${name}</button>`).join('')}</nav>`;
 function content(){const p=g.player,b=g.build,c=g.character;switch(tab){
 case 'fight':return `<h3>${c?CHARACTERS[c.id].name:'見習旅人'}</h3><p>${c?CHARACTERS[c.id].passive:''}</p><p>天賦技能：${c?CHARACTERS[c.id].skill:'E 施放'}<br>冷卻 ${Math.ceil(c?.skillCd||0)} 秒</p><p>生命 ${Math.ceil(p.hp)} / ${p.maxHp} · 靈力 ${Math.ceil(p.energy||0)}</p>`;
 case 'relic':return `<h3>同行法器 · ${g.relics.length}</h3>${g.relics.map(r=>`<p><b>${RELICS[r.id].icon} ${r.name} · ${QUALITIES[r.quality]}</b><br>${RELICS[r.id].description}</p>`).join('')||'<p>選路尋找法器，改變本局打法。</p>'}`;
 case 'journey':return `<h3>靈霧竹林</h3><p>第 ${(g.run?.floor||0)+1} 間 · 靈錢 ${g.money||0}</p><p>淨化 ${g.kills} · ${Math.floor(g.elapsed||0)} 秒</p><p>${g.run?.path?.map(r=>typeof r==='string'?r:r.type).join(' → ')||'旅程剛開始'}</p>`;
 default:return `<h3>${WEAPONS[p.weapon]?.name||'桃木劍'}</h3><p>${ELEMENTS[b?.element]?.name||'五行未定'} × ${BAGUA[b?.bagua]?.name||'卦象未定'}</p><p>${Object.values(EVOLUTIONS).find(e=>e.id===b?.evolution)?.name||'尚未進化'}</p><p>協同：${g.synergyNames?.join('、')||'尚未發現'}</p>${(g.synergies||[]).map(id=>`<p>${SYNERGIES[id].description}</p>`).join('')}`;}}
 function details(){return `<div class="info-detail">${tabs()}<div class="info-content">${content()}</div></div>`;}
 function reflow(){const next=document.body.dataset.touch!=='true'&&!document.fullscreenElement;if(next===desktop)return;desktop=next;document.body.dataset.desktop=String(next);if(next){left.append(nodes[0].node,nodes[1].node,nodes[2].node);top.append(nodes[3].node,nodes[4].node);}else for(const {node,marker}of nodes)marker.after(node);signature='';}
 window.addEventListener('gameviewportchange',reflow);document.addEventListener('fullscreenchange',reflow);
 document.addEventListener('click',e=>{const id=e.target.closest('[data-info-tab]')?.dataset.infoTab;if(!TABS[id])return;tab=id;signature='';for(const el of document.querySelectorAll('.info-detail'))el.innerHTML=tabs()+`<div class="info-content">${content()}</div>`;});
 const button=document.createElement('button');button.dataset.command='inspect';button.textContent='資訊';button.className='mobile-inspect';button.setAttribute('aria-label','展開旅人與Build資訊');document.querySelector('.hud-actions').prepend(button);
 reflow();return {details,update(){reflow();if(!desktop)return;const next=details();if(next!==signature){signature=next;right.innerHTML=next;}}};
}
