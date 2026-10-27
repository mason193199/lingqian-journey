export const STATUS_DEFS={
 burn:{name:'燃燒',icon:'炎',color:'#ffaf78'},slow:{name:'冰緩',icon:'緩',color:'#a6e7ed'},freeze:{name:'冰凍',icon:'凍',color:'#d8f8ff'},poison:{name:'中毒',icon:'毒',color:'#bbdd84'},shock:{name:'雷感',icon:'雷',color:'#e0c6ff'},armorbreak:{name:'破甲',icon:'破',color:'#f3c99a'},shield:{name:'護盾',icon:'盾',color:'#b2e4ff'},unstoppable:{name:'霸體',icon:'霸',color:'#f2da87'}
};
export function hasStatus(entity,id){return entity.statuses?.some(s=>s.id===id&&s.remaining>0);}
export function applyStatus(entity,id,duration=3,options={}){
 if(!STATUS_DEFS[id]||entity.hp<=0)return false;
 entity.statuses??=[];if(id==='unstoppable'){entity.stun=0;entity.knockbackTimer=0;entity.statuses=entity.statuses.filter(s=>s.id!=='freeze');}const boss=entity.type==='boss';
 if(id==='freeze'&&(hasStatus(entity,'unstoppable')||(entity.controlImmunity||0)>0))return false;
 duration=Math.min(duration,id==='freeze'?(boss?.22:.65):8);if(boss&&['slow','burn','poison','armorbreak','shock'].includes(id))duration*=.65;
 const old=entity.statuses.find(s=>s.id===id);if(old){if(id==='freeze')return false;old.remaining=Math.min(8,Math.max(old.remaining,duration));if(id==='poison')old.stacks=Math.min(3,old.stacks+1);if(id==='shield')old.shield=Math.min(40,(old.shield||0)+(options.amount||15));return true;}
 entity.statuses.push({id,remaining:duration,stacks:1,tick:0,...(id==='shield'?{shield:options.amount||15}:{})});return true;
}
export function damageAfterStatuses(entity,amount){
 if(hasStatus(entity,'armorbreak'))amount*=1.18;
 const shield=entity.statuses?.find(s=>s.id==='shield'&&s.remaining>0);if(shield){const absorbed=Math.min(shield.shield,amount);shield.shield-=absorbed;amount-=absorbed;if(shield.shield<=0)shield.remaining=0;}
 return amount;
}
export function tickStatuses(entity,dt,onDamage){
 entity.controlImmunity=Math.max(0,(entity.controlImmunity||0)-dt);
 for(const s of entity.statuses||[]){s.remaining-=dt;s.tick+=dt;if((s.id==='burn'||s.id==='poison')&&s.tick>=.6){s.tick-=.6;onDamage((s.id==='burn'?3:2*s.stacks)*(entity.type==='boss'?.65:1),s.id);}
 if(s.id==='freeze'&&s.remaining<=0)entity.controlImmunity=1.5;}
 entity.statuses=(entity.statuses||[]).filter(s=>s.remaining>0);
}
export function speedFactor(entity){return hasStatus(entity,'freeze')?0:hasStatus(entity,'slow')?(entity.type==='boss'?.8:.6):1;}
