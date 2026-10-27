import {applyStatus,hasStatus} from './status.js';

export const ELEMENTS={
 metal:{name:'金・雷',icon:'金',color:'#e0c6ff',description:'雷感與受限連鎖雷擊。'},
 wood:{name:'木',icon:'木',color:'#bbdd84',description:'附加中毒，最多三層。'},
 water:{name:'水',icon:'水',color:'#a6e7ed',description:'冰緩，定期短暫冰凍。'},
 fire:{name:'火',icon:'火',color:'#ffaf78',description:'附加持續燃燒。'},
 earth:{name:'土',icon:'土',color:'#e5cf91',description:'命中凝聚護盾，有觸發冷卻。'}
};
export const BAGUA={
 qian:{name:'乾卦',icon:'☰',description:'每四次命中回復少量靈力。'},
 kun:{name:'坤卦',icon:'☷',description:'每四次命中凝聚短暫護盾。'},
 zhen:{name:'震卦',icon:'☳',description:'每三次命中，雷光震及另一名敵人。'},
 xun:{name:'巽卦',icon:'☴',description:'命中附加中毒，最多三層。'},
 kan:{name:'坎卦',icon:'☵',description:'命中附加冰緩。'},
 li:{name:'離卦',icon:'☲',description:'命中附加燃燒，與火符的疊層爆裂協同。'},
 gen:{name:'艮卦',icon:'☶',description:'每四次命中獲得短暫霸體，穩住陣腳。'},
 dui:{name:'兌卦',icon:'☱',description:'每三次命中回復少量靈力，不提供無限回血。'}
};
export const EVOLUTIONS={
 sword:{id:'thunder-sword',name:'九霄雷罡劍',weapon:'sword',element:'metal',bagua:'zhen',description:'近戰第三次命中召喚落雷，擊退撞牆引發雷爆。'},
 talisman:{id:'samadhi-talisman',name:'三昧離火符',weapon:'talisman',element:'fire',bagua:'li',description:'三向火符累積三層燃燒後符爆，並引燃鄰近敵人。'},
 staff:{id:'lunar-ice-disc',name:'太陰玄冰盤',weapon:'staff',element:'water',bagua:'kan',description:'法術生成地面冰陣，累積冰緩造成冰凍，凍結死亡產生碎冰。'}
};
const center=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
const alive=g=>g.enemies.filter(e=>e.hp>0);
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<=r;
export function initBuild(g,options={}){
 g.build=null;g.evolutionFields=[];g.buildNotices=[];
 if(!options.build&&!options.element&&!options.bagua)return;
 g.build={element:null,bagua:null,evolution:null,hits:0,earthCd:0,waterHits:0,beams:[],serial:0};
 if(ELEMENTS[options.element])g.build.element=options.element;if(BAGUA[options.bagua])g.build.bagua=options.bagua;
 refresh(g,false);
 const wanted={sword:'thunder',talisman:'fire',staff:'water'}[g.player.weapon];const list=[...(g.blessingOptions||['fire','wood','wind'])];if(!list.includes(wanted))list[list.length-1]=wanted;g.blessingOptions=list;
}
function refresh(g,notice=true){const r=EVOLUTIONS[g.player.weapon],b=g.build;const next=r.element===b.element&&r.bagua===b.bagua?r.id:null;if(b.evolution===next)return;b.evolution=next;b.hits=0;g.evolutionFields=[];if(next&&notice){g.buildNotices.push({...r});g.visual('blessing',g.player.x+19,g.player.y+29,ELEMENTS[b.element].color,1);}}
export function attune(g,element,bagua){if(!g.build||!ELEMENTS[element]||!BAGUA[bagua])return false;g.build.element=element;g.build.bagua=bagua;refresh(g);return true;}
export function onBlessingBuild(g,id){const map={thunder:['metal','zhen'],fire:['fire','li'],water:['water','kan'],wood:['wood','xun'],wind:['wood','xun']};return map[id]?attune(g,...map[id]):false;}
export function blast(g,source,damage,radius,kind='rune',ignite=false){const q=center(source);for(const e of alive(g).filter(e=>e!==source&&near(center(e),q,radius)).slice(0,5)){g.damageEnemy(e,damage,{periodic:true,proc:true});if(ignite&&e.hp>0)applyStatus(e,'burn',2);}g.visual(kind,q.x,q.y,kind==='lightning'?'#e0c6ff':kind==='ice'?'#b3e9ef':'#ffbf8c',.45);}
export function strikeLightning(g,e,damage){damage*=1+.08*(g.elementRanks?.metal||0);g.damageEnemy(e,damage,{periodic:true,proc:true});const q=center(e);g.build.beams.push({x:q.x,y:q.y-140,x2:q.x,y2:q.y,life:.22});g.build.beams=g.build.beams.slice(-8);g.visual('lightning',q.x,q.y,'#e0c6ff',.4);g.onLightning?.(e,damage);}
export function evolutionAttack(g){const b=g.build;if(!b)return;
 if(b.evolution===EVOLUTIONS.talisman.id){const native=[...g.projectiles].reverse().find(p=>p.hostile===false&&p.weapon==='talisman'&&!p.characterSource&&!p.evolutionSource);if(native){const a=Math.atan2(native.vy,native.vx),s=Math.hypot(native.vx,native.vy);for(const d of [-.20,.20])g.projectiles.push({...native,vx:Math.cos(a+d)*s,vy:Math.sin(a+d)*s,damage:native.damage*.48,evolutionSource:true});}}
 if(b.evolution===EVOLUTIONS.staff.id){const target=alive(g).filter(e=>(e.x-g.player.x)*g.player.facing>-10).sort((a,c)=>Math.abs(a.x-g.player.x)-Math.abs(c.x-g.player.x))[0];const x=target?center(target).x:g.player.x+g.player.facing*160;g.evolutionFields.push({x,y:565,radius:110,life:2.1,maxLife:2.1,tick:.4});g.evolutionFields=g.evolutionFields.slice(-3);}
}
export function evolutionHit(g,e,weapon,extra={}){const b=g.build;if(!b||extra.proc)return;
 const secondary=extra.evolutionProc;
 if(!secondary){b.hits++;if(b.element==='wood')applyStatus(e,'poison',3);if(b.element==='wood'&&(g.elementRanks?.wood||0)>0)applyStatus(e,'poison',3);if(b.element==='fire')applyStatus(e,'burn',3);if(b.element==='water')applyStatus(e,'slow',1.5);if(b.element==='metal')applyStatus(e,'shock',3);if(b.element==='earth'&&b.earthCd<=0){applyStatus(g.player,'shield',3,{amount:5+2*(g.elementRanks?.earth||0)});b.earthCd=1;}
 if(b.bagua==='qian'&&b.hits%4===0)g.player.energy=Math.min(g.player.maxEnergy,g.player.energy+5);
 if(b.bagua==='kun'&&b.hits%4===0)applyStatus(g.player,'shield',2,{amount:6});
 if(b.bagua==='xun')applyStatus(e,'poison',2);if(b.bagua==='kan')applyStatus(e,'slow',1.4);if(b.bagua==='li')applyStatus(e,'burn',2);
 if(b.bagua==='gen'&&b.hits%4===0)applyStatus(g.player,'unstoppable',.5);
 if(b.bagua==='dui'&&b.hits%3===0)g.player.energy=Math.min(g.player.maxEnergy,g.player.energy+4);
 if(b.bagua==='zhen'&&b.evolution!==EVOLUTIONS.sword.id&&b.hits%3===0){const other=alive(g).find(v=>v!==e&&near(center(v),center(e),150));if(other)strikeLightning(g,other,5);}}
 if(b.evolution===EVOLUTIONS.sword.id&&weapon==='sword'&&!secondary&&b.hits%3===0)strikeLightning(g,e,Math.min(14,g.player.damage*.55));
 if(b.evolution===EVOLUTIONS.talisman.id&&weapon==='talisman'&&e.hp>0){applyStatus(e,'burn',3);e.fireStacks=Math.min(3,(e.fireStacks||0)+1);e.fireStackTime=3;const burning=e.statuses.find(s=>s.id==='burn');if(burning)burning.stacks=e.fireStacks;if(e.fireStacks>=3&&(e.fireExplosionCd||0)<=0){e.fireStacks=0;if(burning)burning.stacks=1;e.fireExplosionCd=.6;const power=g.fireBlastMultiplier||1;g.damageEnemy(e,10*power,{periodic:true,proc:true});blast(g,e,8*power,115+(g.fireRadiusBonus||0)+8*(g.elementRanks?.fire||0),'rune',true);}}
}
export function evolutionWall(g,e){if(g.build?.evolution===EVOLUTIONS.sword.id){g.damageEnemy(e,10,{periodic:true,proc:true});blast(g,e,8,110,'lightning');}}
export function evolutionKill(g,e){if(g.build?.evolution===EVOLUTIONS.staff.id&&hasStatus(e,'freeze'))blast(g,e,9,115,'ice');}
export function tickBuild(g,dt){if(!g.build||g.state!=='playing')return;g.build.earthCd=Math.max(0,g.build.earthCd-dt);for(const ray of g.build.beams)ray.life-=dt;g.build.beams=g.build.beams.filter(v=>v.life>0);
 for(const e of g.enemies){e.fireExplosionCd=Math.max(0,(e.fireExplosionCd||0)-dt);e.fireStackTime=Math.max(0,(e.fireStackTime||0)-dt);if(!e.fireStackTime)e.fireStacks=0;}
 for(const f of g.evolutionFields){f.life-=dt;f.tick-=dt;if(f.life<=0||f.tick>0)continue;f.tick+=.4;for(const e of alive(g)){if(Math.abs(center(e).x-f.x)>f.radius||e.y+e.h<485)continue;g.damageEnemy(e,2,{periodic:true,proc:true});if(e.hp<=0)continue;applyStatus(e,'slow',1);e.iceExposure=Math.min(3,(e.iceExposure||0)+1+((g.elementRanks?.water||0)>=2?1:0));if(e.iceExposure>=3){if(applyStatus(e,'freeze',.5))g.visual('ice',e.x,e.y,'#b3e9ef');e.iceExposure=0;}}}
 g.evolutionFields=g.evolutionFields.filter(f=>f.life>0);
}
