import{applyStatus,hasStatus}from'./status.js';
export const QUALITIES=['普通','稀有','珍奇'];
export const RELICS={
 yinYang:{name:'陰陽玉',icon:'☯',description:'生命高於70%時增幅輸出；低於30%時觸發有冷卻的護盾。'},
 coins:{name:'五帝錢',icon:'錢',description:'每個完成的房間隨機強化一種五行，每種最多三級。'},
 peach:{name:'桃木印',icon:'印',description:'擊退撞牆時符爆；同一敵人有觸發冷卻。'},
 bell:{name:'招靈鈴',icon:'鈴',description:'擊殺機率召喚友方小靈，與角色靈獸合計最多三隻。'},
 compass:{name:'尋龍羅盤',icon:'盤',description:'出口額外揭示危險、報酬及房間內容。'},
 iceJade:{name:'玄冰玉',icon:'冰',description:'成功冰凍敵人時釋放碎冰，有全局觸發冷卻。'},
 cinnabar:{name:'朱砂印',icon:'砂',description:'提高滿層燃燒爆炸的強度與波及範圍。'},
 thunderOrder:{name:'雷公令',icon:'令',description:'雷擊有機率跳躍到額外目標，僅一次且有冷卻。'}
};
const rnd=g=>g.random?g.random():Math.random();const pos=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
export const relicOf=(g,id)=>g.relics?.find(r=>r.id===id);
export function addRelic(g,id,quality=0){if(!RELICS[id])return false;quality=Math.max(0,Math.min(2,Math.floor(Number(quality)||0)));const old=relicOf(g,id);if(old){if(old.quality>=quality)return false;old.quality=quality;old.name=RELICS[id].name;}
 else g.relics.push({id,quality,name:RELICS[id].name});if(id==='cinnabar'){g.fireBlastMultiplier=1+.2*(quality+1);g.fireRadiusBonus=15*(quality+1);}g.visual('blessing',g.player.x+19,g.player.y, '#efd094',.8);return true;}
export function initRelics(g,options={}){g.relics=[];g.relicChoices=[];g.starterRelicGranted=false;g.elementRanks={metal:0,wood:0,water:0,fire:0,earth:0};g.relicRuntime={yinCd:0,iceCd:0,thunderCd:0,lastClear:null,sequence:0};g.fireBlastMultiplier=1;g.fireRadiusBonus=0;g.onWall=e=>wallRelics(g,e);g.onLightning=(e,d)=>lightningRelics(g,e,d);
 for(const r of options.relics||[])addRelic(g,typeof r==='string'?r:r.id,typeof r==='string'?0:r.quality);
}
export function relicDamage(g,damage){const r=relicOf(g,'yinYang');return r&&g.player.hp/g.player.maxHp>.7?damage*(1.08+.02*r.quality):damage;}
export function tickRelics(g,dt){if(g.state!=='playing')return;const t=g.relicRuntime;for(const key of ['yinCd','iceCd','thunderCd'])t[key]=Math.max(0,t[key]-dt);const r=relicOf(g,'yinYang');if(r&&g.player.hp>0&&g.player.hp/g.player.maxHp<.3&&t.yinCd<=0){applyStatus(g.player,'shield',3+r.quality,{amount:12+6*r.quality});t.yinCd=18-2*r.quality;g.visual('shield',g.player.x+19,g.player.y+29,'#c5e8de');}
 if(!g.character){for(const s of g.summons){s.life-=dt;s.attackCd-=dt;const e=g.enemies.find(e=>e.hp>0);if(e){const q=pos(e),d=Math.hypot(s.x-q.x,s.y-q.y);if(d>30){s.x+=(q.x-s.x)/d*180*dt;s.y+=(q.y-s.y)/d*180*dt;}if(d<65&&s.attackCd<=0){g.damageEnemy(e,6,{periodic:true,proc:true});s.attackCd=.85;}}}g.summons=g.summons.filter(s=>s.life>0);}
}
export function killRelics(g,e){const r=relicOf(g,'bell');if(!r||g.summons.length>=3||rnd(g)>=.3+.1*r.quality)return;g.summons.push({id:10000+(++g.relicRuntime.sequence),x:e.x,y:e.y,w:20,h:20,life:10+2*r.quality,maxLife:10+2*r.quality,attackCd:.2,boosted:false});}
function splash(g,e,damage,radius,kind){const q=pos(e);for(const v of g.enemies.filter(v=>v.hp>0&&v!==e&&Math.hypot(pos(v).x-q.x,pos(v).y-q.y)<radius).slice(0,4))g.damageEnemy(v,damage,{periodic:true,proc:true});g.visual(kind,q.x,q.y,kind==='ice'?'#b3e9ef':'#efc699',.45);}
export function wallRelics(g,e){const r=relicOf(g,'peach');if(!r||(e.sealReadyAt||0)>g.elapsed)return;e.sealReadyAt=g.elapsed+1.2;splash(g,e,7+3*r.quality,95+15*r.quality,'rune');}
export function freezeRelics(g,e){const r=relicOf(g,'iceJade');if(!r||g.state!=='playing'||g.relicRuntime.iceCd>0)return;g.relicRuntime.iceCd=.8;splash(g,e,5+2*r.quality,85+15*r.quality,'ice');}
function lightningRelics(g,e,damage){const r=relicOf(g,'thunderOrder');if(!r||g.relicRuntime.thunderCd>0||rnd(g)>=.25+.1*r.quality)return;const q=pos(e);const target=g.enemies.find(v=>v!==e&&v.hp>0&&Math.hypot(pos(v).x-q.x,pos(v).y-q.y)<200+25*r.quality);if(target){g.relicRuntime.thunderCd=.45;g.damageEnemy(target,Math.min(12,damage*.55),{periodic:true,proc:true});g.visual('lightning',target.x,target.y,'#e0c6ff');}}
export function clearRelics(g,key){if(g.relicRuntime.lastClear===key)return false;g.relicRuntime.lastClear=key;const r=relicOf(g,'coins');if(r){const ids=Object.keys(g.elementRanks),id=ids[Math.min(4,Math.floor(rnd(g)*5))];g.elementRanks[id]=Math.min(3,g.elementRanks[id]+1+(r.quality===2?1:0));g.effect(g.player.x,g.player.y-20,'五行護佑 '+id);}return true;}
export function roomIntel(g,type){return relicOf(g,'compass')?({combat:'兩至三隻妖靈，穩定靈錢',elite:'強化妖靈；額外靈錢與稀有機會',relic:'三選一法器，可形成質變',heal:'有限回復；不會重複領取',shop:'三件有限商品；需保留靈錢',altar:'可選任意五行與卦象，檢視配方'})[type]||'竹林深處的命運':'';}
export function offerRelics(g,quality=0,resume='playing'){const ids=Object.keys(RELICS).filter(id=>!relicOf(g,id)||relicOf(g,id).quality<quality);for(let i=ids.length-1;i>0;i--){const j=Math.floor(rnd(g)*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}if(!ids.length)return false;g.relicChoices=ids.slice(0,3).map(id=>({id,quality}));g.relicReturn=resume;g.state='relic-choice';return true;}
export function chooseRelic(g,id){if(g.state!=='relic-choice')return false;const offer=g.relicChoices.find(v=>v.id===id);if(!offer||!addRelic(g,id,offer.quality))return false;g.relicChoices=[];g.state=g.relicReturn||'playing';return true;}
