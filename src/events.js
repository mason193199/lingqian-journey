import {offerRelics} from './relics.js';
import {applyStatus} from './status.js';
export const EVENTS={
 taoist:{name:'神秘老道',description:'「放下些許氣血，換一段奇緣？」老道捧起一只木匣。',choices:[['trade','犧牲20生命，換稀有法器（不致死）']]},
 statue:{name:'破碎神像',description:'裂縫裡浮著未被讀過的命籤。',choices:[['offer','獻12靈錢，獲得一份未知且未擁有的祝福']]},
 mist:{name:'迷霧岔路',description:'風從三條小徑吹來；羅盤只肯指向你的心。',choices:[['left','左：竹露回復15生命'],['middle','中：取18靈錢；接下來兩場戰鬥移速降低15%'],['right','右：稀有法器；下一場戰鬥多一名妖靈']]},
 trade:{name:'妖靈交易',description:'小妖捧著珍奇法器：「收下它，往後的妖靈也會聽見鈴聲。」',choices:[['accept','取珍奇法器；本局後續敵人傷害+10%、出招間隔縮短（最多兩次）']]},
 fortune:{name:'命籤',description:'籤筒裡藏著上、中、下三種命數。結果影響接下來兩場戰鬥。',choices:[['draw','抽籤：上籤護盾與額外靈錢／中籤補靈力／下籤追加妖靈與高報酬']]},
 grave:{name:'無名墓碑',description:'石上刻著「若願替我試劍，願以靈器相贈」。',choices:[['challenge','挑戰守墓精英；勝利後選稀有法器']]}
};
const rand=g=>g.random?g.random():Math.random();
export function openEvent(g,id){if(!EVENTS[id])return false;g.run.event={id,used:false,result:'',challenge:false};g.state='event';if(!g.run.eventsSeen.includes(id))g.run.eventsSeen.push(id);return true;}
export function canEvent(g,action){const r=g.run,e=r?.event;if(g.state!=='event'||!e)return false;if(action==='leave')return !e.challenge;if(e.used)return false;if(!EVENTS[e.id].choices.some(c=>c[0]===action))return false;if(e.id==='taoist'&&g.player.hp<=20)return false;if(e.id==='statue'&&(g.money<12||!g.availableBlessings.some(id=>!g.hasBlessing(id))))return false;return true;}
export function eventAction(g,action){if(!canEvent(g,action))return false;const r=g.run,e=r.event,p=g.player;if(action==='leave')return g.roomAction('leave');e.used=true;r.revision++;const mods=r.modifiers;
 function relic(q){if(!offerRelics(g,q,'event')){g.money=Math.min(999,g.money+18);e.result+='法器已齊，獲18靈錢。';}}
 if(e.id==='taoist'){p.hp-=20;e.result='老道收下氣血，為你打開靈器匣。';relic(1);}
 if(e.id==='statue'){g.money-=12;const ids=g.availableBlessings.filter(id=>!g.hasBlessing(id));const id=ids[Math.floor(rand(g)*ids.length)];g.gainBlessing(id);e.result='神像贈予一份未有的祝福；五行與卦象可能隨之改變。';g.presentEvolution();}
 if(e.id==='mist'){if(action==='left'){p.hp=Math.min(p.maxHp,p.hp+15);e.result='竹露回復15生命。';}if(action==='middle'){g.money=Math.min(999,g.money+18);mods.slowRooms=2;e.result='獲18靈錢；兩場戰鬥的霧絆尚未散去。';}if(action==='right'){mods.extraRooms=Math.min(2,mods.extraRooms+1);e.result='收下靈器；下一戰有額外妖靈。';relic(1);}}
 if(e.id==='trade'){mods.deals=Math.min(2,mods.deals+1);e.result='交易已成：後續妖靈出手更急，傷害提高。';relic(2);}
 if(e.id==='fortune'){const value=['upper','middle','lower'][Math.floor(rand(g)*3)];mods.fortune={value,remaining:2};e.result={upper:'上籤：接下來兩戰入場護盾12、每隻額外4靈錢。',middle:'中籤：接下來兩戰入場補滿靈力。',lower:'下籤：接下來兩戰多一名妖靈，每隻額外6靈錢。'}[value];}
 if(e.id==='grave'){e.challenge=true;e.result='守墓妖靈現身。';g.enemies=[];g.spawn('spirit',750);const target=g.enemies[0];target.elite=true;target.hp=target.maxHp=80;configureCombat(g);g.state='playing';g.notice='無名墓碑 · 擊敗守墓精英';}
 return true;
}
export function configureCombat(g){const r=g.run;if(!r?.modifiers)return;r.combatPower=1+.1*r.modifiers.deals;r.dropBonus=0;g.player.roomSpeedFactor=1;const m=r.modifiers;if(m.slowRooms>0){g.player.roomSpeedFactor=.85;m.slowRooms--;}let extra=0;if(m.extraRooms>0){extra++;m.extraRooms--;}if(m.fortune?.remaining>0){m.fortune.remaining--;if(m.fortune.value==='upper'){applyStatus(g.player,'shield',8,{amount:12});r.dropBonus=4;}if(m.fortune.value==='middle')g.player.energy=g.player.maxEnergy;if(m.fortune.value==='lower'){extra++;r.dropBonus=6;}}
 for(let i=0;i<Math.min(extra,2);i++)g.spawn('slime',(r.type==='boss'?2700:950)+i*80);for(const e of g.enemies){e.tempo=1+.08*m.deals;}
}
export function completeChallenge(g){const r=g.run;if(!r?.event?.challenge)return false;r.event.challenge=false;r.event.result='守墓精英已平息；靈器回應了你的勇氣。';r.revision++;g.projectiles=[];g.spellFields=[];g.evolutionFields=[];g.skillZones=[];g.state='event';if(!offerRelics(g,1,'event')){g.money=Math.min(999,g.money+18);r.event.result+='法器已齊，改獲18靈錢。';}return true;}
