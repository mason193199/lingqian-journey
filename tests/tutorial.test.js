import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {Tutorial,tutorialMarkup} from '../src/tutorial.js';
const arena=(character='aqian')=>{const g=new Game();g.reset({character});for(const e of g.enemies)e.timer=999;return g;};
const advance=(g,tutorial,input,frames=1)=>{let hint;for(let i=0;i<frames;i++){g.update(.01,input);hint=tutorial.update(g,input);}return hint;};

test('tutorial observes actual movement, jump, attack, dash and successful skill without changing combat',()=>{
 const g=arena(),t=new Tutorial();assert.equal(t.start(g).id,'move');
 const hint=advance(g,t,{right:true},15);assert.equal(hint.id,'jump');assert.equal(t.done.size,1);
 assert.equal(advance(g,t,{jump:true},5).id,'attack');
 assert.equal(advance(g,t,{attack:true}).id,'dash');
 assert.equal(advance(g,t,{dash:true}).id,'skill');
 assert.equal(advance(g,t,{skill:true}),null);assert.equal(t.completed,true);assert.equal(g.state,'playing');assert.equal(g.player.skillCount,1);assert.ok(g.elapsed>0);
});

test('pressed inputs alone, knockback and pre-existing cooldowns never falsely complete lessons',()=>{
 const g=arena(),t=new Tutorial();g.player.dashCd=.5;t.start(g);const before=JSON.stringify(g);
 t.update(g,{right:true,jump:true,attack:true,dash:true,skill:true});assert.equal(t.done.size,0);assert.equal(JSON.stringify(g),before);
 g.player.x+=100;g.player.knockbackTimer=.1;t.update(g,{right:true});assert.equal(t.done.has('move'),false);
 g.player.knockbackTimer=0;t.update(g,{right:true});assert.equal(t.done.has('move'),false);g.player.x+=170;t.update(g,{right:true});assert.equal(t.done.has('move'),false);
 g.player.attackCount++;g.state='paused';t.update(g,{attack:true});assert.equal(t.done.has('attack'),false);
});

test('successful early actions are remembered and skill-gated Xuanmo has a skippable explanation',()=>{
 const g=arena('xuanmo'),t=new Tutorial();t.start(g);advance(g,t,{attack:true});assert.ok(t.done.has('attack'));
 advance(g,t,{right:true},15);advance(g,t,{jump:true},5);advance(g,t,{dash:true});
 const hint=t.update(g);assert.equal(hint.id,'skill');assert.match(hint.text,/煞氣/);assert.equal(g.useSkill(),false);assert.equal(t.completed,false);
 assert.equal(t.skip(),null);assert.equal(t.completed,true);assert.equal(t.update(g),null);assert.equal(g.state,'playing');
});

test('blessing, evolution, relic, route, conclusion and temple each get one contextual explanation',()=>{
 const g=arena(),t=new Tutorial();t.start(g);
 for(const state of ['blessing','evolving','relic-choice','route','dead','won','preparing']){
  g.state=state;const hint=t.update(g);assert.equal(hint.id,'context-'+state);assert.equal(hint.contextual,true);assert.equal(t.update(g).id,hint.id);
  g.state='paused';t.update(g);g.state=state;assert.equal(t.update(g),null);
 }
});

test('completed lessons can still explain the current run but never auto-start again; replay resets intentionally',()=>{
 const g=arena(),t=new Tutorial();t.start(g);g.player.x+=40;t.update(g,{right:true});g.player.y-=30;g.player.vy=-50;g.player.attackCount++;g.player.skillCount++;g.player.dashTime=.1;t.update(g,{right:true});assert.equal(t.completed,true);
 g.state='blessing';assert.equal(t.update(g).id,'context-blessing');assert.equal(t.start(g),null);assert.equal(t.active,false);
 g.reset({character:'aqian'});assert.equal(t.start(g,{replay:true}).id,'move');assert.equal(t.completed,false);assert.equal(t.done.size,0);
 const stored=new Tutorial({completed:true});assert.equal(stored.start(g),null);assert.equal(stored.start(g,{replay:true}).id,'move');
});

test('unfinished lessons retain learned actions across run restarts and the optional view escapes text',()=>{
 const g=arena(),t=new Tutorial();t.start(g);advance(g,t,{attack:true});g.reset({character:'aqian'});t.start(g);assert.ok(t.done.has('attack'));assert.equal(t.done.size,1);
 const html=tutorialMarkup({title:'<script>',text:'" & < >',progress:{current:1,total:5}});assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('data-command="tutorial-skip"'));assert.equal(tutorialMarkup(null),'');
});

test('replaying at a jump apex waits for landing then recognizes the next ordinary jump',()=>{const g=arena(),t=new Tutorial();g.player.y=421;g.player.vy=0;t.start(g,{replay:true});assert.equal(t.done.has('jump'),false);for(let i=0;i<90;i++){g.update(.01);t.update(g);}assert.equal(g.player.y+g.player.h,585);g.update(.01,{jump:true});for(let i=0;i<8;i++){g.update(.01);t.update(g);}assert.ok(t.done.has('jump'));});
