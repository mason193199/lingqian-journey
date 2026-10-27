import test from 'node:test';
import assert from 'node:assert/strict';
import {MetaStore,STORAGE_KEY,CHARACTER_IDS} from '../src/meta.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),map};};

test('talent branches purchase sequentially with bounded costs and cannot overspend',()=>{
 const m=new MetaStore(memory());assert.equal(m.talentCost('aqian','a'),8);assert.equal(m.buyTalent('aqian','a'),false);assert.equal(m.data.talentUnlocks.aqian.a,0);assert.equal(m.data.jade,0);
 m.data.jade=30;assert.equal(m.buyTalent('aqian','a'),true);assert.equal(m.data.jade,22);assert.equal(m.data.talentUnlocks.aqian.a,1);assert.equal(m.talentCost('aqian','a'),14);assert.equal(m.buyTalent('aqian','a'),true);assert.equal(m.data.jade,8);assert.equal(m.data.talentUnlocks.aqian.a,2);assert.equal(m.talentCost('aqian','a'),null);assert.equal(m.buyTalent('aqian','a'),false);assert.equal(m.data.jade,8);
 assert.equal(m.buyTalent('aqian','b'),true);assert.equal(m.data.jade,0);assert.equal(m.data.talentUnlocks.aqian.b,1);assert.equal(m.buyTalent('aqian','b'),false);assert.equal(m.data.talentUnlocks.aqian.b,1);
 for(const [id,branch] of [['fake','a'],['aqian','fake'],['__proto__','a']]){assert.equal(m.talentCost(id,branch),null);assert.equal(m.buyTalent(id,branch),false);}assert.equal(m.data.jade,0);
});

test('equipped talent branch is mutually exclusive, optional, and persisted per character',()=>{
 const storage=memory(),m=new MetaStore(storage);m.data.jade=100;
 assert.equal(m.selectBranch('aqian','a'),false);assert.equal(m.runOptions().talent,null);
 m.buyTalent('aqian','a');m.buyTalent('aqian','a');m.buyTalent('aqian','b');m.selectBranch('aqian','a');assert.deepEqual(m.runOptions().talent,{branch:'a',level:2});m.selectBranch('aqian','b');assert.deepEqual(m.runOptions().talent,{branch:'b',level:1});
 m.selectCharacter('baili');assert.equal(m.runOptions().talent,null);m.buyTalent('baili','b');m.selectBranch('baili','b');assert.deepEqual(m.runOptions().talent,{branch:'b',level:1});
 const reload=new MetaStore(storage);assert.equal(reload.data.selectedCharacter,'baili');assert.deepEqual(reload.runOptions().talent,{branch:'b',level:1});reload.selectCharacter('aqian');assert.deepEqual(reload.runOptions().talent,{branch:'b',level:1});reload.selectBranch('aqian','none');assert.equal(reload.runOptions().talent,null);assert.equal(reload.data.talentUnlocks.aqian.a,2);assert.equal(reload.selectBranch('fake','none'),false);
});

test('pre-talent saved progress migrates without losing character or currency',()=>{
 const storage=memory();storage.setItem(STORAGE_KEY,JSON.stringify({version:2,jade:81,selectedCharacter:'hongling',selectedWeapon:'talisman',firstWin:true,settledRuns:['older'],upgrades:{life:3},mastery:{talisman:2}}));
 const m=new MetaStore(storage);assert.equal(m.data.jade,81);assert.equal(m.runOptions().character,'hongling');assert.equal(m.runOptions().weapon,'talisman');assert.equal(m.runOptions().talent,null);assert.equal(m.runOptions().maxHpBonus,12);assert.equal(m.runOptions().damageBonus,.06);assert.equal(m.data.firstWin,true);assert.deepEqual(m.data.settledRuns,['older']);for(const id of CHARACTER_IDS){assert.deepEqual(m.data.talentUnlocks[id],{a:0,b:0});assert.equal(m.data.selectedBranches[id],'none');}
});

test('untrusted talent saves clamp levels and refuse a selected locked branch',()=>{
 const storage=memory();storage.setItem(STORAGE_KEY,JSON.stringify({version:2,jade:4,selectedCharacter:'aqian',talentUnlocks:{aqian:{a:999,b:-1},baili:{a:1.9,b:'2'}},selectedBranches:{aqian:'b',baili:'a',fake:'b'}}));
 const m=new MetaStore(storage);assert.deepEqual(m.data.talentUnlocks.aqian,{a:2,b:0});assert.equal(m.data.selectedBranches.aqian,'none');assert.deepEqual(m.data.talentUnlocks.baili,{a:1,b:0});assert.equal(m.data.selectedBranches.baili,'a');assert.equal(m.data.selectedBranches.fake,undefined);
});
