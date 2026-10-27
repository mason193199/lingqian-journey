import {applyStatus} from './status.js';
// Short-lived staff impact circles. Never trigger weapon/character proc loops.
export function createStaffField(g,x,y){
 g.spellFields.push({x,y,radius:96,life:1.2,maxLife:1.2,tick:.35});
 if(g.spellFields.length>3)g.spellFields.shift();
}
export function tickStaffFields(g,dt){
 if(g.state!=='playing')return;
 for(const field of g.spellFields){
  field.life-=dt;field.tick-=dt;if(field.life<=0)continue;
  if(field.tick<=0){field.tick+=.35;for(const e of g.enemies){if(e.hp<=0)continue;if(Math.hypot(e.x+e.w/2-field.x,e.y+e.h/2-field.y)<=field.radius){g.damageEnemy(e,3,{periodic:true});if(e.hp>0)applyStatus(e,'slow',.6);}}}
 }
 g.spellFields=g.spellFields.filter(f=>f.life>0);
}
