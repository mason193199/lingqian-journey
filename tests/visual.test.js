import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
const start=()=>{const g=new Game();g.reset();return g;};
test('hit flash and particles are cosmetic and expire without changing combat values',()=>{
 const g=start(),e=g.enemies[0];g.damageEnemy(e,10);assert.equal(e.hp,32);assert.ok(e.hitFlash>0);assert.ok(g.vfx.some(v=>v.kind==='hit'));
 const snapshot=[g.player.hp,g.player.x,e.hp,e.x,g.elapsed];for(let i=0;i<40;i++)g.updateVisual(.02);assert.equal(e.hitFlash,0);assert.equal(g.vfx.length,0);assert.deepEqual([g.player.hp,g.player.x,e.hp,e.x,g.elapsed],snapshot);
});
test('visual events stay bounded, pause safely and reset completely',()=>{
 const g=start();for(let i=0;i<500;i++)g.visual('hit',0,0);assert.equal(g.vfx.length,48);g.state='paused';g.updateVisual(.04);assert.equal(g.vfx[0].life,g.vfx[0].maxLife);g.reset();assert.equal(g.vfx.length,0);assert.equal(g.visualTime,0);
});
test('boss purification continues after victory and never delays the win state',()=>{
 const g=start();g.wave=2;g.enemies=[];g.spawnWave(2);g.damageEnemy(g.enemies[0],999);g.update(.01);assert.equal(g.state,'won');assert.ok(g.vfx.some(v=>v.kind==='boss-defeat'));for(let i=0;i<100;i++)g.updateVisual(.02);assert.equal(g.vfx.length,0);assert.equal(g.state,'won');
});
test('blessing confirmation and dash trails keep existing ability numbers',()=>{
 const g=start();g.state='blessing';g.choose('wind');assert.ok(g.vfx.some(v=>v.kind==='blessing'));g.update(.01,{dash:true});assert.ok(g.vfx.some(v=>v.kind==='dash'));assert.equal(g.player.dashCooldown,.55);assert.equal(g.player.damage,22);
});
