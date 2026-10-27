import test from 'node:test';
import assert from 'node:assert/strict';
import {MetaStore,STORAGE_KEY,CHARACTER_IDS} from '../src/meta.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),map};};

test('six baseline characters select, persist, and become real run options',()=>{
 const storage=memory(),m=new MetaStore(storage);
 assert.equal(m.data.selectedCharacter,'aqian');assert.deepEqual(m.data.unlockedCharacters,CHARACTER_IDS);
 for(const id of CHARACTER_IDS){assert.equal(m.selectCharacter(id),true);const reload=new MetaStore(storage);assert.equal(reload.data.selectedCharacter,id);assert.equal(reload.runOptions().character,id);}
 assert.equal(m.selectCharacter('invented'),false);assert.equal(m.data.selectedCharacter,'xuanmo');
});

test('existing version two progression survives adding character metadata',()=>{
 const storage=memory();storage.setItem(STORAGE_KEY,JSON.stringify({version:2,jade:63,selectedWeapon:'staff',upgrades:{life:2,spirit:1,fate:1,relic:1},mastery:{sword:1,staff:3},settings:{sound:true},loadout:{fate:'shield',relic:'energy'},firstWin:true,settledRuns:['old-run']}));
 const m=new MetaStore(storage);assert.equal(m.data.selectedCharacter,'aqian');assert.equal(m.data.jade,63);assert.equal(m.data.firstWin,true);assert.deepEqual(m.data.settledRuns,['old-run']);assert.equal(m.data.settings.sound,true);assert.equal(m.data.mastery.staff,3);assert.equal(m.runOptions().weapon,'staff');assert.equal(m.runOptions().startingStatus,'shield');assert.equal(m.runOptions().maxHpBonus,8);assert.equal(m.runOptions().energyBonus,20);assert.equal(m.runOptions().damageBonus,.09);
 assert.equal(m.settleRun({id:'old-run',kills:999,won:true}),0);
 m.selectCharacter('baili');const reload=new MetaStore(storage);assert.equal(reload.data.selectedCharacter,'baili');assert.equal(reload.data.jade,63);assert.equal(reload.data.mastery.staff,3);
});

test('unknown saved character ids are discarded and cannot fabricate unlocks',()=>{
 const storage=memory();storage.setItem(STORAGE_KEY,JSON.stringify({version:2,jade:5,selectedCharacter:'invented',unlockedCharacters:['invented']}));
 const m=new MetaStore(storage);assert.equal(m.data.selectedCharacter,'aqian');assert.deepEqual(m.data.unlockedCharacters,CHARACTER_IDS);assert.equal(m.selectCharacter('invented'),false);
});
