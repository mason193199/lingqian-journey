import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, FLOOR } from '../src/game.js';
const playing = () => { const g = new Game(); g.reset(); return g; };
const advance = (g, seconds, input={}) => { for(let t=0;t<seconds;t+=.01) g.update(.01,input); };
const bossArena = () => { const g=playing();g.wave=2;g.enemies=[];g.spawnWave(2);g.player.x=2800;return g; };

test('title is inert; reset starts a complete fresh run after death',()=>{
 const g=new Game();const initial=g.player.x;advance(g,1,{right:true});assert.equal(g.player.x,initial);
 g.reset();g.state='blessing';g.choose('wood');g.player.invuln=0;assert.equal(g.hurt(999,0),true);assert.equal(g.state,'dead');
 g.reset();assert.equal(g.state,'playing');assert.equal(g.player.hp,100);assert.equal(g.player.maxHp,100);assert.equal(g.blessing,null);assert.equal(g.wave,0);assert.equal(g.enemies.length,2);assert.equal(g.projectiles.length,0);assert.equal(g.player.dashCd,0);
});

test('movement, jump, gravity, boundaries and dash have actual effects',()=>{
 const g=playing();advance(g,.2,{right:true});assert.ok(g.player.x>140);advance(g,.2,{left:true});assert.ok(g.player.x<110);
 g.update(.01,{jump:true});assert.ok(g.player.y<FLOOR-g.player.h);advance(g,1);assert.equal(g.player.y,FLOOR-g.player.h);
 const x=g.player.x;g.update(.01,{dash:true,right:true});assert.ok(g.player.x-x>6);assert.ok(g.player.dashCd>0);assert.ok(g.player.invuln>0);
 advance(g,.3);g.player.x=31;advance(g,.3,{left:true});assert.equal(g.player.x,30);
});

test('a swing hits only once, and ordinary attacks defeat melee and ranged enemies',()=>{
 for(const type of ['slime','spirit']){
  const g=playing();g.enemies=[];g.spawn(type,170);const e=g.enemies[0];e.timer=100;
  g.update(.01,{attack:true});assert.equal(e.hp,e.maxHp-22);advance(g,.15,{attack:true});assert.equal(e.hp,e.maxHp-22);
  advance(g,.4,{attack:true});assert.equal(g.enemies.length,0);assert.equal(g.kills,1);assert.equal(g.state,'blessing');
 }
});

test('three blessings change their named abilities and cannot be stacked by double selection',()=>{
 for(const id of ['fire','wood','wind']){
  const g=playing();g.state='blessing';g.enemies=[];g.player.hp=60;assert.equal(g.choose(id),true);assert.equal(g.choose(id),false);assert.equal(g.wave,1);assert.equal(g.enemies.length,3);
  if(id==='fire')assert.equal(g.player.damage,30.799999999999997);
  if(id==='wood'){assert.equal(g.player.maxHp,130);assert.equal(g.player.hp,90);}
  if(id==='wind'){assert.equal(g.player.speed,270.25);assert.equal(g.player.dashCooldown,.55);}
 }
});

test('clearing first encounter guarantees blessing, healing and stopped simulation',()=>{
 const g=playing();g.player.hp=40;for(const e of g.enemies)g.damageEnemy(e,e.hp);g.update(.01);assert.equal(g.state,'blessing');assert.equal(g.player.hp,65);const time=g.elapsed;advance(g,2,{right:true});assert.equal(g.elapsed,time);
});

test('melee enemy visibly winds up before dealing contact damage',()=>{
 const g=playing();g.enemies=[];g.spawn('slime',165);const e=g.enemies[0];e.timer=0;g.update(.01);assert.equal(e.state,'windup');assert.equal(g.player.hp,100);advance(g,.3);assert.equal(g.player.hp,100);advance(g,.55);assert.equal(g.player.hp,90);
});

test('ranged spirit winds up and its projectile can damage player',()=>{
 const g=playing();g.enemies=[];g.spawn('spirit',400);g.enemies[0].timer=0;g.update(.01);assert.equal(g.enemies[0].state,'windup');assert.equal(g.projectiles.length,0);advance(g,.75);assert.ok(g.projectiles.length>0);advance(g,1.5);assert.equal(g.player.hp,91);
});

test('hurt and dash grant invulnerability against overlapping projectiles',()=>{
 const g=playing();assert.equal(g.hurt(10,0),true);assert.equal(g.hurt(10,0),false);assert.equal(g.player.hp,90);advance(g,1.1);g.update(.01,{dash:true});assert.equal(g.hurt(10,0),false);
 const p=g.player;g.projectiles.push({x:p.x+10,y:p.y+10,r:12,vx:0,vy:0,life:2});g.update(.01);assert.equal(p.hp,90);
});

test('pause freezes player, hazards, enemies and elapsed time',()=>{
 const g=playing();g.state='paused';const snapshot=JSON.stringify(g);advance(g,2,{right:true,attack:true,jump:true});assert.equal(JSON.stringify(g),snapshot);
});

test('boss slam is telegraphed before damage and jump avoids it',()=>{
 const g=bossArena();const e=g.enemies[0];e.timer=0;g.update(.01);assert.equal(e.state,'slam');assert.equal(g.zones.length,1);assert.equal(g.player.hp,100);advance(g,.5);assert.equal(g.player.hp,100);advance(g,.5);assert.equal(g.player.hp,82);
 const avoid=bossArena();avoid.enemies[0].timer=0;avoid.update(.01);advance(avoid,.7);avoid.update(.01,{jump:true});advance(avoid,.3);assert.equal(avoid.player.hp,100);
});

test('boss charge has a long warning and phase two fires three projectiles',()=>{
 const g=bossArena();const e=g.enemies[0];e.attackCount=1;e.timer=0;g.update(.01);assert.equal(e.state,'charge');advance(g,.8);assert.equal(e.state,'charge');advance(g,.4);assert.equal(e.state,'rush');
 const phase=bossArena();const boss=phase.enemies[0];boss.hp=100;boss.attackCount=2;boss.timer=0;phase.update(.01);assert.equal(boss.state,'volley');advance(phase,1);assert.equal(phase.projectiles.length,3);
});

test('boss can be defeated with repeated ordinary attacks and victory clears hazards',()=>{
 const g=bossArena();const e=g.enemies[0];e.timer=999;g.player.invuln=999;g.projectiles.push({x:0,y:0,r:5,vx:0,vy:0,life:999});g.zones.push({x:0,w:10,life:999,maxLife:999});advance(g,5,{attack:true});assert.equal(g.state,'won');assert.equal(g.enemies.length,0);assert.equal(g.projectiles.length,0);assert.equal(g.zones.length,0);assert.equal(g.kills,1);
});
