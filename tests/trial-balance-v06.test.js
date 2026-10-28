import assert from 'node:assert/strict';
import test from 'node:test';
import {Game} from '../src/game.js';
test('all 54 character/weapon/trial combinations clear real combat without stat cheats',()=>{
const metrics=[];
for(const trial of ['decline','thunder','seal'])for(const character of ['aqian','qingyue','hongling','xinglian','baili','xuanmo'])for(const weapon of ['sword','talisman','staff']){
 const g=new Game();g.reset({character,weapon,build:true,adventure:true,events:true,combatV3:true,trialsV6:true,seed:12});g.run.floor=1;g.state='route';g.run.choices=[{id:'elite',type:'elite',variant:0}];g.chooseRoom('elite');g.roomAction('trial-'+trial);
 let firstSkill=null;
 for(let step=0;step<12000&&g.state==='playing';step++){
  const p=g.player, target=g.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];if(!target){g.update(1/60);continue;}
  const dx=target.x+target.w/2-p.x-p.w/2, range=weapon==='sword'?62:210,w=g.run.trial.warning;
  const imminent=w&&w.remaining<.32&&p.x+p.w>w.x-56&&p.x<w.x+56;
  const lunging=g.enemies.some(e=>e.type==='slime'&&Math.abs(e.x-p.x)<145&&(e.state==='lunge'||e.state==='windup'&&e.timer<.2));
  const before=g.character.skillCd;
  g.update(1/60,{left:dx<-range,right:dx>range,attack:true,skill:true,jump:imminent||lunging});g.updateVisual(1/60);
  if(firstSkill===null&&g.character.skillCd>before)firstSkill=+g.elapsed.toFixed(3);
 }
 assert.equal(g.state,trial==='decline'?'route':'relic-choice',trial+'/'+character+'/'+weapon);
 metrics.push({trial,character,weapon,hp:Math.ceil(g.player.hp),elapsed:+g.elapsed.toFixed(2),firstSkill,completed:g.run.trialsCompleted||0});
}
for(const m of metrics){assert.ok(m.hp>0);assert.ok(m.elapsed<45);assert.equal(m.completed,m.trial==='decline'?0:1);if(m.trial==='seal')assert.ok(m.firstSkill===null||m.firstSkill>=4);}
for(const trial of ['decline','thunder','seal']){const rows=metrics.filter(m=>m.trial===trial);console.log('V06_TRIAL_BALANCE',trial,{wins:rows.length,minTime:Math.min(...rows.map(m=>m.elapsed)),maxTime:Math.max(...rows.map(m=>m.elapsed)),minHP:Math.min(...rows.map(m=>m.hp)),maxHP:Math.max(...rows.map(m=>m.hp))});}
});
