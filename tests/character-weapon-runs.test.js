import test from 'node:test';import assert from 'node:assert/strict';import {Game} from '../src/game.js';import {CHARACTERS} from '../src/characters.js';import {WEAPONS} from '../src/weapons.js';
test('all eighteen character and weapon loadouts can finish the chapter with normal abilities',()=>{
 for(const character of Object.keys(CHARACTERS))for(const weapon of Object.keys(WEAPONS)){
  const g=new Game();g.random=()=>.6;g.reset({character,weapon});
  for(let i=0;i<16000&&!['won','dead'].includes(g.state);i++){
   if(g.state==='blessing'){const options=g.blessingOptions||['fire','wood','wind'];g.choose(options.includes('fire')?'fire':options[0]);}
   const e=g.enemies.find(e=>e.hp>0);if(!e){g.update(1/60);g.updateVisual(1/60);continue;}
   const dx=e.x+e.w/2-(g.player.x+19),range=weapon==='sword'?62:weapon==='staff'?220:290;
   g.update(1/60,{left:dx < -range,right:dx>range,attack:true,skill:true,jump:e.type==='boss'&&['slam','volley'].includes(e.state)&&e.timer<.35,dash:e.type==='boss'&&e.state==='charge'&&e.timer<.15});g.updateVisual(1/60);
  }
  assert.equal(g.state,'won',`${character}/${weapon}`);assert.equal(g.kills,6);assert.ok(g.player.hp>0);
 }
});
