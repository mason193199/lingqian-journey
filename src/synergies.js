import {applyStatus,hasStatus} from './status.js';
import {trimFriendly} from './budgets.js';
const relic=(g,id)=>g.relics?.some(r=>r.id===id),evo=(g,id)=>g.build?.evolution===id;
export const SYNERGIES={
 thunderFork:{name:'九霄連雷',description:'雷罡劍與雷公令：落雷保證跳向最多兩名敵人，仍有冷卻。',test:g=>evo(g,'thunder-sword')&&relic(g,'thunderOrder')},
 fireBloom:{name:'朱砂焰華',description:'離火符與朱砂印：滿層符爆額外射出四枚火符，有冷卻。',test:g=>evo(g,'samadhi-talisman')&&relic(g,'cinnabar')},
 iceLances:{name:'玄冰碎星',description:'玄冰盤與玄冰玉：凍結擊殺射出三枚不再連鎖的冰矢。',test:g=>evo(g,'lunar-ice-disc')&&relic(g,'iceJade')},
 wallSeal:{name:'震壁鎮煞',description:'桃木印與高擊退武器：撞牆震波推開並破甲附近敵人。',test:g=>relic(g,'peach')&&['sword','staff'].includes(g.player.weapon)},
 spiritChoir:{name:'百靈合鳴',description:'白璃與招靈鈴：百靈朝命讓現有靈獸各發一枚集火靈彈。',test:g=>g.character?.id==='baili'&&relic(g,'bell')},
 mountainGuard:{name:'陰陽鎮山',description:'玄墨與陰陽玉：護盾消失時發出有冷卻的破甲震退波。',test:g=>g.character?.id==='xuanmo'&&relic(g,'yinYang')},
 starCompass:{name:'尋龍星圖',description:'星漣與羅盤：墜星後追加較小的延遲星陣。',test:g=>g.character?.id==='xinglian'&&relic(g,'compass')},
 redEcho:{name:'丹符回響',description:'紅綾與朱砂印：命中具有兩種異常的敵人時，追符另一個目標。',test:g=>g.character?.id==='hongling'&&relic(g,'cinnabar')},
 forestCoins:{name:'生息銅脈',description:'木行與五帝錢：中毒敵人死亡時將一層毒傳給至多兩名敵人。',test:g=>g.build?.element==='wood'&&relic(g,'coins')},
 frostSeal:{name:'寒壁留陣',description:'水行與桃木印：撞牆留下短暫冰陣，與既有冰陣共用三個上限。',test:g=>g.build?.element==='water'&&relic(g,'peach')}
};
export function initSynergies(g){g.synergies=[];g.synergyNames=[];g.synergyDiscovered=[];g.synergyNotices=[];g.synergyRuntime={cooldowns:{},hadShield:false,depth:0};refreshSynergies(g);}
export function refreshSynergies(g){if(!g.synergyRuntime)return;g.synergies=Object.keys(SYNERGIES).filter(id=>SYNERGIES[id].test(g));g.synergyNames=g.synergies.map(id=>SYNERGIES[id].name);for(const id of g.synergies)if(!g.synergyDiscovered.includes(id)){g.synergyDiscovered.push(id);g.synergyNotices.push({id,name:SYNERGIES[id].name,life:3});g.synergyNotices=g.synergyNotices.slice(-3);}}
export const hasSynergy=(g,id)=>SYNERGIES[id]?.test(g)||false;
const others=(g,e,r=240)=>g.enemies.filter(v=>v!==e&&v.hp>0&&Math.hypot(v.x-e.x,v.y-e.y)<r).slice(0,4);
function ready(g,key,seconds){const c=g.synergyRuntime?.cooldowns;if(!c||(c[key]||0)>0)return false;c[key]=seconds;return true;}
function bolt(g,x,y,target,weapon='staff',damage=7){const a=Math.atan2(target.y+target.h/2-y,target.x+target.w/2-x);g.projectiles.push({x,y,vx:Math.cos(a)*340,vy:Math.sin(a)*340,r:7,life:1.2,hostile:false,weapon,damage,characterSource:true,homing:true});trimFriendly(g);}
function shockwave(g,e){for(const v of others(g,e,150)){applyStatus(v,'armorbreak',2);if(v.type!=='boss'&&!hasStatus(v,'unstoppable')){v.vx=Math.sign(v.x-e.x||1)*260;v.knockbackTimer=.16;v.stun=Math.max(v.stun,.15);v.wallProc=false;}}g.visual('rune',e.x,e.y,'#eed8ad');}
export function synergyEvent(g,kind,e){const rt=g.synergyRuntime;if(!rt||rt.depth)return;rt.depth++;try{
 if(kind==='lightning'&&hasSynergy(g,'thunderFork')&&ready(g,'thunderFork',.8))for(const v of others(g,e).slice(0,2)){g.damageEnemy(v,5,{periodic:true,proc:true});g.visual('lightning',v.x,v.y,'#e0c6ff');}
 if(kind==='fire'&&hasSynergy(g,'fireBloom')&&ready(g,'fireBloom',1)){for(const angle of [-2.7,-.45,.45,2.7])g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:Math.cos(angle)*300,vy:Math.sin(angle)*300,r:7,life:.8,hostile:false,weapon:'talisman',damage:5,characterSource:true});trimFriendly(g);}
 if(kind==='kill'){
  if(hasSynergy(g,'iceLances')&&hasStatus(e,'freeze')&&ready(g,'iceLances',.5))for(const v of others(g,e,320).slice(0,3))bolt(g,e.x,e.y,v,'staff',6);
  if(hasSynergy(g,'forestCoins')&&hasStatus(e,'poison'))for(const v of others(g,e,180).slice(0,2)){applyStatus(v,'poison',2);g.visual('rune',v.x,v.y,'#bbdd84');}
 }
 if(kind==='wall'){
  if(hasSynergy(g,'wallSeal')&&ready(g,'wallSeal',.8))shockwave(g,e);
  if(hasSynergy(g,'frostSeal')&&ready(g,'frostSeal',1)){g.evolutionFields.push({x:e.x+e.w/2,y:565,radius:90,life:1.6,maxLife:1.6,tick:.4});g.evolutionFields=g.evolutionFields.slice(-3);}
 }
 if(kind==='hit'&&hasSynergy(g,'redEcho')&&(e.statuses||[]).filter(s=>['burn','poison','slow','shock','armorbreak'].includes(s.id)).length>=2&&ready(g,'redEcho',1.5)){const v=others(g,e,350)[0];if(v)bolt(g,e.x,e.y,v,'talisman',6);}
 if(kind==='skill'){
  if(hasSynergy(g,'spiritChoir')){const target=g.enemies.find(v=>v.hp>0);if(target)for(const s of g.summons.slice(0,3))bolt(g,s.x,s.y,target);}
  if(hasSynergy(g,'starCompass')){const z=g.skillZones?.at(-1);if(z){g.skillZones.push({...z,x:z.x+80,delay:(z.delay||.75)+.6,life:(z.delay||.75)+.6,maxLife:(z.delay||.75)+.6,radius:95,damage:14});g.skillZones=g.skillZones.slice(-3);}}
 }
 if(kind==='shieldLost'&&hasSynergy(g,'mountainGuard')&&ready(g,'mountainGuard',5))shockwave(g,g.player);
 }finally{rt.depth--;}}
export function tickSynergies(g,dt){refreshSynergies(g);for(const key of Object.keys(g.synergyRuntime.cooldowns))g.synergyRuntime.cooldowns[key]=Math.max(0,g.synergyRuntime.cooldowns[key]-dt);const shield=hasStatus(g.player,'shield');if(g.synergyRuntime.hadShield&&!shield)synergyEvent(g,'shieldLost');g.synergyRuntime.hadShield=shield;for(const n of g.synergyNotices)n.life-=dt;g.synergyNotices=g.synergyNotices.filter(n=>n.life>0);}
