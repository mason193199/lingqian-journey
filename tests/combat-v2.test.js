import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {WEAPONS} from '../src/weapons.js';
import {STATUS_DEFS,applyStatus,hasStatus,tickStatuses,damageAfterStatuses,speedFactor} from '../src/status.js';
const advance=(g,sec,input={})=>{for(let t=0;t<sec;t+=.01)g.update(.01,input);};
const arena=(weapon='sword',type='slime')=>{const g=new Game();g.reset({weapon});g.enemies=[];g.spawn(type,weapon==='sword'?170:400);g.enemies[0].timer=999;return g;};
test('three weapon types actually hit with distinct melee/projectile/magic behavior',()=>{
 for(const weapon of Object.keys(WEAPONS)){const g=arena(weapon);const e=g.enemies[0];e.hp=e.maxHp=200;g.update(.01,{attack:true});if(weapon==='sword'){assert.equal(g.projectiles.length,0);assert.equal(e.hp,178);}else{assert.equal(g.projectiles[0].weapon,weapon);assert.equal(g.projectiles[0].hostile,false);assert.equal(e.hp,200);advance(g,1.2);assert.ok(e.hp<200);if(weapon==='talisman')assert.ok(hasStatus(e,'burn'));if(weapon==='staff'){assert.ok(hasStatus(e,'slow'));assert.ok(g.player.energy<100);}}}
});
test('actual knockback moves player against held direction and releases from stun',()=>{
 const g=arena();g.hurt(10,400);const x=g.player.x;g.update(.01,{right:true});assert.ok(g.player.x<x);assert.ok(g.player.stun>0);assert.equal(g.hurt(10,400),false);advance(g,.4,{right:true});assert.equal(g.player.stun,0);const recovery=g.player.x;advance(g,.2,{right:true});assert.ok(g.player.x>recovery);
});
test('small enemies recoil strongly while boss resists; unstoppable prevents recoil',()=>{
 const small=arena(),boss=arena('sword','boss');small.damageEnemy(small.enemies[0],1,{knockback:200});boss.damageEnemy(boss.enemies[0],1,{knockback:200});assert.equal(small.enemies[0].vx,200);assert.equal(boss.enemies[0].vx,4);const e=small.enemies[0];applyStatus(e,'unstoppable',2);small.damageEnemy(e,1,{knockback:200});assert.equal(e.knockbackTimer,0);assert.equal(e.stun,0);
});
test('eight statuses have definitions, DOT ticks, poison caps, shield and armorbreak alter damage',()=>{
 assert.equal(Object.keys(STATUS_DEFS).length,8);const e={hp:100,statuses:[]};applyStatus(e,'burn',3);for(let i=0;i<10;i++)applyStatus(e,'poison',3);assert.equal(e.statuses.find(s=>s.id==='poison').stacks,3);let damage=0;tickStatuses(e,.61,n=>damage+=n);assert.equal(damage,9);applyStatus(e,'slow',2);assert.equal(speedFactor(e),.6);applyStatus(e,'freeze',.5);assert.equal(speedFactor(e),0);applyStatus(e,'shield',2,{amount:15});assert.equal(damageAfterStatuses(e,10),0);assert.equal(damageAfterStatuses(e,10),5);applyStatus(e,'armorbreak',2);assert.equal(damageAfterStatuses(e,10),11.799999999999999);
});
test('freeze immunity prevents permanent control and boss durations are resisted',()=>{
 const e={hp:100,statuses:[],type:'boss'};assert.equal(applyStatus(e,'freeze',4),true);assert.equal(e.statuses[0].remaining,.22);tickStatuses(e,.23,()=>{});assert.ok(e.controlImmunity>0);assert.equal(applyStatus(e,'freeze',1),false);tickStatuses(e,1.6,()=>{});assert.equal(applyStatus(e,'freeze',.5),true);applyStatus(e,'unstoppable',2);assert.equal(hasStatus(e,'freeze'),false);assert.equal(applyStatus(e,'freeze',1),false);
});
test('staff third shot freezes; shock can proc extra lightning; elemental blessings apply real statuses',()=>{
 const g=arena('staff');const e=g.enemies[0];e.hp=1000;g.player.energy=100;g.player.attackCount=2;g.fireWeapon();assert.equal(g.projectiles[0].freeze,true);g.applyStatus(e,'shock',4);const rng=Math.random;Math.random=()=>0;try{g.weaponHit(e,'staff',10);assert.ok(g.vfx.some(v=>v.kind==='lightning'));}finally{Math.random=rng;}
 for(const [blessing,status] of [['fire','burn'],['wood','poison'],['wind','shock']]){const a=arena();a.blessing=blessing;a.weaponHit(a.enemies[0],'sword',1);assert.ok(hasStatus(a.enemies[0],status));}
});
test('loadout stats, starting options and end rewards are real and reset cleanly',()=>{
 const g=new Game();g.reset({weapon:'talisman',maxHpBonus:12,energyBonus:20,damageBonus:.09,startingStatus:'shield'});assert.equal(g.player.hp,112);assert.equal(g.player.maxEnergy,120);assert.equal(g.player.damage,18*1.09);assert.ok(hasStatus(g.player,'shield'));g.kills=4;g.hurt(999,0);assert.equal(g.result.jade,8);g.reset();assert.equal(g.player.weapon,'sword');assert.equal(g.result,null);assert.equal(g.player.statuses.length,0);
});
test('all three weapons can complete the full chapter using normal abilities',()=>{
 for(const weapon of Object.keys(WEAPONS)){const g=new Game();g.reset({weapon});for(let i=0;i<12000&&!['won','dead'].includes(g.state);i++){if(g.state==='blessing')g.choose('fire');const e=g.enemies.find(e=>e.hp>0);if(!e){g.update(1/60);continue;}const dx=e.x+e.w/2-(g.player.x+19),range=weapon==='sword'?62:weapon==='staff'?220:290;g.update(1/60,{left:dx < -range,right:dx>range,attack:true,jump:e.type==='boss'&&['slam','volley'].includes(e.state)&&e.timer<.35,dash:e.type==='boss'&&e.state==='charge'&&e.timer<.15});}assert.equal(g.state,'won',weapon);assert.equal(g.kills,6);assert.ok(g.player.hp>0);assert.equal(g.result.jade,22);}
});
