import assert from 'node:assert/strict';
import test from 'node:test';
import {Game} from '../src/game.js';
import {collectSecret,grounded,moveVertical,canLeaveExploration} from '../src/terrain.js';
test('all 72 terrain control cases and 36 actual combat loadouts can explore and exit safely',()=>{
const chars=['aqian','qingyue','hongling','xinglian','baili','xuanmo'],weapons=['sword','talisman','staff'];
function room(seed,character,weapon){const g=new Game();g.reset({character,weapon,adventure:true,events:true,terrainV6:true,combatV3:true,build:true,buildV6:true,encounterV6:true,trialsV6:true,seed});g.run.floor=1;g.state='route';g.run.choices=[{id:'combat',type:'combat',variant:0}];assert.ok(g.chooseRoom('combat'));return g;}
function controlsExplore(g,dt){const p=g.player,t=g.run.terrain;assert.ok(t.ready);const money=g.money;function walk(target){for(let i=0;i<1000;i++){const d=target-p.x;if(Math.abs(d)<5&&p.vy===0)return;g.update(dt,{right:d>4,left:d< -4});}throw Error('walk stuck '+target+' x'+p.x+' y'+p.y);}
 function jump(target,y){g.update(dt,{jump:true,right:true});for(let i=0;i<300;i++){const d=target-p.x;g.update(dt,{right:d>4,left:d< -4});if(Math.abs(p.y+p.h-y)<.1&&p.vy===0)return;}throw Error('jump stuck '+target+' x'+p.x+' feet'+(p.y+p.h));}
 const [a,b]=t.platforms;walk(a.x-45);jump(a.x+a.w/2-19,a.y);walk(a.x+a.w-50);jump(t.secret.x-19,b.y);assert.equal(t.secret.collected,true);assert.equal(g.money,money+12);assert.equal(g.run.secretsFound,1);assert.equal(collectSecret(g),false);assert.ok(canLeaveExploration(g));g.update(dt,{interact:true});assert.equal(g.state,'route');assert.equal(g.leaveExploration(),false);}
let geometry=0;for(const seed of[0,1])for(const character of chars)for(const weapon of weapons)for(const dt of[1/60,.04]){const g=room(seed,character,weapon);g.enemies.forEach(e=>g.damageEnemy(e,9999));g.update(dt);controlsExplore(g,dt);geometry++;}
console.log('GEOMETRY',geometry);
const metrics=[];for(const seed of[0,1])for(const character of chars)for(const weapon of weapons){const g=room(seed,character,weapon);assert.equal(g.leaveExploration(),false);for(let i=0;i<12000&&g.state==='playing'&&!g.run.terrain.ready;i++){const p=g.player,e=g.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];if(!e){g.update(1/60);continue;}const dx=e.x+e.w/2-p.x-19,r=weapon==='sword'?62:210;const lunge=g.enemies.some(e=>e.type==='slime'&&Math.abs(e.x-p.x)<145&&(e.state==='lunge'||e.state==='windup'&&e.timer<.2));g.update(1/60,{left:dx< -r,right:dx>r,attack:true,skill:true,jump:lunge});g.updateVisual(1/60);}
 assert.equal(g.state,'playing',character+'/'+weapon);assert.ok(g.run.terrain.ready,character+'/'+weapon);assert.ok(g.player.hp>0);assert.equal(g.enemies.length,0);metrics.push({seed,character,weapon,time:+g.elapsed.toFixed(3),hp:Math.ceil(g.player.hp)});controlsExplore(g,1/60);}
console.log('TOTAL',{geometry,combat:metrics.length,minHP:Math.min(...metrics.map(m=>m.hp)),minTime:Math.min(...metrics.map(m=>m.time)),maxTime:Math.max(...metrics.map(m=>m.time))});
// Pure geometry: dash horizontal support transitions, steep fall tunneling, airborne attempts.
for(const seed of[0,1]){const g=room(seed,'qingyue','sword'),p=g.player,[a,b]=g.run.terrain.platforms;p.x=a.x+10;p.y=a.y-p.h-20;p.vy=2000;moveVertical(g,.04);assert.equal(p.y+p.h,a.y);p.x=a.x+a.w+1;assert.equal(grounded(g),false);g.update(.04,{jump:true});assert.ok(p.vy>0);p.x=b.x+10;p.y=b.y-p.h+20;p.vy=-400;moveVertical(g,.04);assert.ok(p.y+p.h<b.y+20);}
console.log('EXTRA_COLLISIONS PASS');

});
