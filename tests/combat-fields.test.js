import test from 'node:test';import assert from 'node:assert/strict';import {Game} from '../src/game.js';import {createStaffField} from '../src/combat-fields.js';import {hasStatus} from '../src/status.js';
test('only the staff leaves an actual bounded impact circle; sword and paper keep distinct attack patterns',()=>{
 for(const weapon of ['sword','talisman','staff']){const g=new Game();g.reset({weapon});g.enemies=[];g.spawn('slime',180);g.enemies[0].hp=1000;g.enemies[0].timer=999;g.fireWeapon();for(let i=0;i<30;i++)g.update(.01);assert.equal(g.spellFields.length>0,weapon==='staff');if(weapon==='staff')assert.ok(hasStatus(g.enemies[0],'slow'));}
});
test('star circles damage inside the field, respect pause, expire and cannot grow without bound',()=>{
 const g=new Game();g.reset({weapon:'staff'});g.enemies=[];g.spawn('slime',180);const e=g.enemies[0];e.hp=1000;e.timer=999;createStaffField(g,200,560);g.state='paused';g.update(.04);assert.equal(g.spellFields[0].life,1.2);g.state='playing';for(let i=0;i<40;i++)g.update(.01);assert.equal(e.hp,997);for(let i=0;i<15;i++)createStaffField(g,200,560);assert.equal(g.spellFields.length,3);for(let i=0;i<130;i++)g.update(.01);assert.equal(g.spellFields.length,0);g.reset();assert.equal(g.spellFields.length,0);
});
