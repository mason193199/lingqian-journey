import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {TALENTS,tickCharacter} from '../src/characters.js';
import {hasStatus} from '../src/status.js';
const arena=(character,branch,level=2,weapon='sword')=>{const g=new Game();g.random=()=>.9;g.reset({character,talent:{branch,level},weapon});g.enemies=[];g.spawn('slime',170);const e=g.enemies[0];e.hp=e.maxHp=1000;e.timer=999;return g;};
const advance=(g,s)=>{for(let t=0;t<s;t+=.01)g.update(.01);};
test('each character has two validated talent branches and invalid selections stay inactive',()=>{
 assert.equal(Object.keys(TALENTS).length,6);for(const [id,branches] of Object.entries(TALENTS)){assert.deepEqual(Object.keys(branches),['a','b']);for(const branch of ['a','b']){const g=arena(id,branch);assert.deepEqual(g.character.talent,{branch,level:2});}}
 const g=arena('aqian','invalid');assert.equal(g.character.talent,null);g.blessingOptions=['stale'];g.blessingRevision=9;g.reset();assert.equal(g.blessingOptions,null);assert.equal(g.blessingRevision,0);assert.equal(g.player.skillCount,0);
});
test('Aqian branches preserve a chosen oracle versus next-hit crit and a timed shield',()=>{
 const a=arena('aqian','a');assert.equal(a.character.rerolls,3);assert.equal(a.blessingOptions.length,4);a.state='blessing';const held=a.blessingOptions[0];a.rerollBlessings();assert.equal(a.blessingOptions[0],held);
 const b=arena('aqian','b');b.useSkill();const e=b.enemies[0],hp=e.hp;b.weaponHit(e,'sword',10);assert.ok(hp-e.hp>=16);assert.equal(hasStatus(b.player,'shield'),false);advance(b,5.1);assert.ok(hasStatus(b.player,'shield'));
});
test('Qingyue branches add fifth-hit sword beams and splash versus dash counter and guard',()=>{
 const a=arena('qingyue','a');a.spawn('slime',225);const e=a.enemies[0],other=a.enemies[1];other.hp=1000;other.timer=999;for(let i=0;i<5;i++)a.weaponHit(e,'sword',1);assert.ok(a.projectiles.some(p=>p.characterSource==='qingyue'));assert.ok(other.hp<1000);
 const b=arena('qingyue','b'),target=b.enemies[0],hp=target.hp;b.update(.01,{dash:true});b.update(.01);assert.ok(target.hp<hp);assert.ok(hasStatus(b.player,'shield'));assert.equal(b.character.dashWasActive,true);
});
test('Hongling branches add capped poison stacks versus a real burn-death chain and spread',()=>{
 const a=arena('hongling','a',2,'talisman');a.weaponHit(a.enemies[0],'talisman',1);assert.equal(a.enemies[0].statuses.find(s=>s.id==='poison').stacks,2);
 const b=arena('hongling','b'),e=b.enemies[0];b.spawn('slime',225);const other=b.enemies[1];other.hp=1000;b.applyStatus(e,'burn',4);b.damageEnemy(e,9999);assert.equal(other.hp,984);assert.ok(hasStatus(other,'burn'));assert.equal(b.character.resolvingExplosion,false);
});
test('Xinglian branches alter orbit cadence and freezing stars versus separated delayed starfalls',()=>{
 const a=arena('xinglian','a',2,'staff');for(let i=0;i<3;i++)a.fireWeapon();assert.equal(a.projectiles.length,4);assert.ok(a.projectiles.some(p=>p.characterSource==='xinglian'&&p.freeze));
 const b=arena('xinglian','b'),e=b.enemies[0];b.useSkill();assert.equal(b.skillZones.length,2);assert.equal(b.skillZones[0].delay,.75);assert.equal(b.skillZones[1].delay,1.25);const hp=e.hp;advance(b,.9);const afterFirst=e.hp;assert.ok(afterFirst<hp);assert.equal(b.skillZones.length,1);advance(b,.5);assert.ok(e.hp<afterFirst);assert.equal(b.skillZones.length,0);
});
test('Baili branches grant timed shields and bounded healing versus repeated pet shots',()=>{
 const a=arena('baili','a');a.player.hp=70;a.useSkill();advance(a,4.1);assert.ok(hasStatus(a.player,'shield'));assert.equal(a.player.hp,72);
 const denied=arena('baili','a');denied.player.hp=70;denied.noHealing=true;denied.useSkill();advance(denied,4.1);assert.equal(denied.player.hp,70);
 const b=arena('baili','b');b.useSkill();for(let i=0;i<200;i++)tickCharacter(b,.01);assert.ok(b.summons[0].attackCount>=3);assert.ok(b.projectiles.some(p=>p.characterSource==='baili'));assert.ok(b.summons[0].attackCd<=.3);const hp=b.enemies[0].hp;b.update(.01);assert.ok(b.enemies[0].hp<hp);
});
test('Xuanmo branches arm a one-shot hurt counter versus shield-loss freezing shockwave',()=>{
 const a=arena('xuanmo','a'),target=a.enemies[0];a.spawn('slime',225);const other=a.enemies[1];other.hp=1000;other.timer=999;a.hurt(10,400);assert.equal(a.character.counterReady,true);a.weaponHit(target,'sword',1);assert.equal(a.character.counterReady,false);assert.ok(other.hp<1000);assert.ok(hasStatus(target,'slow'));assert.ok(hasStatus(other,'slow'));
 const b=arena('xuanmo','b'),e=b.enemies[0];b.applyStatus(b.player,'shield',4,{amount:15});b.update(.01);const hp=e.hp;b.hurt(20,400);b.update(.01);assert.ok(e.hp<hp);assert.ok(hasStatus(e,'freeze'));const after=e.hp;advance(b,.3);assert.equal(e.hp,after);
});
