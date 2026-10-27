import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
test('Qingyue first slash cannot crash or double-hit from its ordinary attack animation',()=>{
 const g=new Game();g.reset({character:'qingyue'});g.enemies=[];g.spawn('slime',330);const e=g.enemies[0];e.hp=e.maxHp=1000;e.timer=999;
 assert.equal(g.useSkill(),true);assert.equal(e.hp,958);
 assert.doesNotThrow(()=>{for(let i=0;i<20;i++)g.update(.01);});assert.equal(e.hp,958);
});
test('all character skills respect freeze and become usable again after thawing',()=>{
 for(const character of ['aqian','qingyue','hongling','xinglian','baili','xuanmo']){
  const g=new Game();g.reset({character});g.character.rage=50;g.applyStatus(g.player,'freeze',.2);
  assert.equal(g.useSkill(),false,character);assert.equal(g.character.skillCd,0);assert.equal(g.player.skillCount,0);
  for(let i=0;i<25;i++)g.update(.01);assert.equal(g.useSkill(),true,character);
 }
});
