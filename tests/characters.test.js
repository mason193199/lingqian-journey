import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {CHARACTERS} from '../src/characters.js';
import {hasStatus} from '../src/status.js';
const arena=(character,weapon='sword')=>{const g=new Game();g.random=()=>0;g.reset({character,weapon});g.enemies=[];g.spawn('slime',170);const e=g.enemies[0];e.hp=e.maxHp=1000;e.timer=999;return g;};
const advance=(g,seconds)=>{for(let t=0;t<seconds;t+=.01)g.update(.01);};

test('six opt-in characters initialize with independent skills; legacy run stays unchanged',()=>{
 assert.equal(Object.keys(CHARACTERS).length,6);
 const g=new Game();g.reset();assert.equal(g.character,null);assert.equal(g.useSkill(),false);assert.equal(g.player.damage,22);
 for(const id of Object.keys(CHARACTERS)){g.reset({character:id});assert.equal(g.character.id,id);assert.equal(g.character.skillCd,0);assert.equal(g.player.skillCount,0);}
 g.reset();assert.equal(g.summons.length,0);assert.equal(g.skillZones.length,0);
});
test('Aqian receives a fourth real option, finite rerolls and temporary luck from skill',()=>{
 const g=arena('aqian');g.state='blessing';assert.equal(g.blessingOptions.length,4);const first=[...g.blessingOptions];assert.equal(g.rerollBlessings(),true);assert.notDeepEqual(new Set(g.blessingOptions),new Set(first));assert.equal(g.rerollBlessings(),true);assert.equal(g.rerollBlessings(),false);assert.equal(g.character.rerolls,0);
 assert.equal(g.useSkill(),true);assert.ok(g.character.skillCd>0);assert.equal(g.useSkill(),false);g.state='playing';advance(g,.1);assert.equal(g.player.luckBonus,.2);const meter=g.player.critMeter;g.weaponHit(g.enemies[0],'sword',1);assert.ok(g.player.critMeter>meter+.08);advance(g,5);assert.equal(g.player.luckBonus,0);
});
test('Qingyue fifth close hit changes recoil/damage; slash moves, protects and staggers',()=>{
 const g=arena('qingyue'),e=g.enemies[0],damage=[];
 for(let i=0;i<5;i++){e.statuses=[];const hp=e.hp;g.weaponHit(e,'sword',10);damage.push(hp-e.hp);}
 assert.ok(damage[4]>damage[0]*1.4);assert.equal(e.vx,360);assert.ok(hasStatus(e,'armorbreak'));
 const x=g.player.x,hp=e.hp;assert.equal(g.useSkill(),true);assert.ok(g.player.x>x+100);assert.ok(g.player.invuln>.3);assert.ok(e.hp<hp);assert.ok(e.stun>=.55);assert.equal(g.useSkill(),false);
});
test('Hongling benefits from status variety and her skill fires six actual paper projectiles',()=>{
 const g=arena('hongling','talisman'),e=g.enemies[0];for(const id of ['burn','slow','poison'])g.applyStatus(e,id,4);const hp=e.hp;g.weaponHit(e,'talisman',10);assert.ok(hp-e.hp>12);assert.ok(hp-e.hp<14);
 assert.equal(g.useSkill(),true);assert.equal(g.projectiles.length,6);assert.ok(g.projectiles.every(b=>b.weapon==='talisman'&&b.hostile===false));const before=e.hp;advance(g,.35);assert.ok(e.hp<before-20);
});
test('Xinglian spells generate tracking stars, crit speeds orbit and starfall is delayed',()=>{
 const g=arena('xinglian','staff');for(let i=0;i<4;i++)g.fireWeapon();assert.equal(g.projectiles.length,5);assert.equal(g.character.stars,0);g.player.critMeter=1;g.weaponHit(g.enemies[0],'staff',1);assert.equal(g.character.stars,2);
 g.projectiles=[];const e=g.enemies[0];e.statuses=[];const hp=e.hp;assert.equal(g.useSkill(),true);assert.equal(g.skillZones.length,1);advance(g,.65);assert.equal(e.hp,hp);advance(g,.2);assert.ok(e.hp<=hp-48);assert.equal(g.skillZones.length,0);assert.ok(hasStatus(e,'slow'));
});
test('Baili summons are bounded, attack autonomously, focus under skill and expire',()=>{
 const g=arena('baili');for(let i=0;i<5;i++){g.spawn('slime',400+i*50);g.damageEnemy(g.enemies.at(-1),9999);}assert.equal(g.summons.length,3);
 const e=g.enemies[0],hp=e.hp;assert.equal(g.useSkill(),true);advance(g,.8);assert.ok(e.hp<hp);assert.ok(g.summons.every(s=>s.boosted));assert.ok(g.character.summonPowerTime>0);advance(g,12);assert.equal(g.summons.length,0);
});
test('Xuanmo resists recoil, must earn rage and spends it for a real shield and shockwave',()=>{
 const g=arena('xuanmo'),e=g.enemies[0];assert.equal(g.useSkill(),false);assert.equal(g.hurt(10,400),true);assert.equal(g.player.vx,-108);assert.equal(g.character.rage,20);const hp=e.hp;assert.equal(g.useSkill(),true);assert.equal(g.character.rage,0);assert.ok(e.hp<hp);assert.ok(hasStatus(g.player,'shield'));assert.ok(hasStatus(g.player,'unstoppable'));assert.equal(g.player.stun,0);assert.equal(g.player.knockbackTimer,0);
});
test('pause and blessing choices do not advance cooldowns, summons or delayed damage',()=>{
 const g=arena('xinglian');g.useSkill();const before=JSON.stringify({character:g.character,zones:g.skillZones});g.state='paused';advance(g,1);assert.equal(JSON.stringify({character:g.character,zones:g.skillZones}),before);
 g.state='playing';g.reset({character:'baili'});g.useSkill();g.state='blessing';const life=g.summons[0].life;advance(g,2);assert.equal(g.summons[0].life,life);
});
