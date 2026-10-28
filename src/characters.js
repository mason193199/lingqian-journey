import {trialSkillFactor,trialSkillLock} from './trials.js';
import {trimFriendly} from './budgets.js';
import {applyStatus,hasStatus} from './status.js';

// Character hooks are opt-in. An unconfigured Game keeps the original chapter rules.
export const CHARACTERS={
 aqian:{name:'阿籤',title:'問命旅人',passive:'天機：命籤偶有第四選項，每局兩次免費重抽。',skill:'改命：重抽命籤，並獲得五秒幸運與暴擊機會。',color:'#efcf91',cooldown:22},
 qingyue:{name:'青嶽',title:'桃木劍童',passive:'劍心：第五次近距離命中強化傷害、擊退與破甲。',skill:'斬煞：向前拔劍斬擊，短暫無敵並震懾敵人。',color:'#a5dcab',cooldown:12},
 hongling:{name:'紅綾',title:'靈符師',passive:'符膽：敵人每種異常狀態提高符術傷害，最多35%。',skill:'萬符歸宗：六道靈符追擊附近敵人。',color:'#efaaa5',cooldown:16},
 xinglian:{name:'星漣',title:'卜星師',passive:'星軌：施法累積星軌，每四軌射出追蹤星辰，暴擊加快。',skill:'北斗墜星：標記範圍，稍後降下星陣。',color:'#c6b7ee',cooldown:18},
 baili:{name:'白璃',title:'御靈使',passive:'靈契：淨化妖靈有機會喚出小靈獸，最多三隻。',skill:'百靈朝命：呼喚靈獸，六秒內強化並集中攻擊。',color:'#e7e6ca',cooldown:17},
 xuanmo:{name:'玄墨',title:'鎮煞行者',passive:'不動身：擊退減少55%，受傷累積煞氣。',skill:'震山印：消耗煞氣震退敵人，獲得護盾與霸體。',color:'#9fbdc8',cooldown:12}
};
export const TALENTS={
 aqian:{a:{name:'問籤流',description:'命籤固定四選、三次免費重抽；二階保留重抽前的首張籤。'},b:{name:'逆命流',description:'改命後下一擊必定暴擊；二階幸運結束時獲得護盾。'}},
 qingyue:{a:{name:'飛劍流',description:'第五次近身命中射出追蹤劍氣；二階同時震傷附近敵人。'},b:{name:'踏罡流',description:'衝刺起步向前反擊；二階命中後獲得護盾。'}},
 hongling:{a:{name:'毒籙流',description:'符紙命中附加中毒；二階一次附加兩層。'},b:{name:'燎原流',description:'燃燒敵人死亡時符爆；二階將燃燒傳給附近敵人。'}},
 xinglian:{a:{name:'星河流',description:'三次星軌便召喚追蹤星辰；二階星辰附帶短暫冰凍。'},b:{name:'雙斗流',description:'墜星分為兩片星陣；二階第二陣延後落下形成兩段控場。'}},
 baili:{a:{name:'守靈流',description:'靈獸每四秒為旅人補充護盾；二階回復少量生命，本局被動治療上限20。'},b:{name:'獵靈流',description:'靈獸更頻繁攻擊；二階每三次命中額外發射靈彈。'}},
 xuanmo:{a:{name:'伏煞流',description:'受傷後下一次武器命中釋出反擊震波；二階震波冰緩敵人。'},b:{name:'鎮岳流',description:'護盾消散時產生守護震波；二階震波附加短暫冰凍。'}}
};
const talent=(g,id,branch,level=1)=>g.character?.id===id&&g.character.talentBranch===branch&&g.character.talentLevel>=level;
const orbitThreshold=g=>talent(g,'xinglian','a')?3:4;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const center=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
const alive=g=>g.enemies.filter(e=>e.hp>0);
const rng=g=>clamp(typeof g.random==='function'?g.random():Math.random(),0,.999999);
const nearest=(g,x=g.player.x,y=g.player.y)=>alive(g).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
function aura(g,kind='rune',x=g.player.x+19,y=g.player.y+29,life=.55){g.visual(kind,x,y,CHARACTERS[g.character.id].color,life);}
function fire(g,target,{damage=12,weapon='staff',speed=330,offset=0,freeze=false,origin:customOrigin=null,homing=false}={}){
 const p=g.player,origin=customOrigin||center(p),point=target?center(target):{x:origin.x+p.facing*300,y:origin.y};
 const angle=Math.atan2(point.y-origin.y,point.x-origin.x)+offset;
 g.projectiles.push({x:origin.x+p.facing*23,y:origin.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:weapon==='staff'?10:8,life:2.2,hostile:false,weapon,damage,freeze,homing,characterSource:g.character.id});
 // A skill must not leave a growing projectile list during long sessions.
 trimFriendly(g);
}
function summon(g){
 if(g.summons.length>=3)return false;
 const p=g.player;g.summons.push({id:++g.character.summonSequence,x:p.x+(g.summons.length-1)*24,y:p.y+30,w:20,h:20,life:12,maxLife:12,attackCd:.25,boosted:false});aura(g,'purify');return true;
}
function choicePool(g){return [...new Set(g.availableBlessings||['fire','wood','wind'])];}
function changeChoices(g){
 const pool=choicePool(g);if(pool.length<2)return false;
 const old=g.blessingOptions||[];for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng(g)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const count=Math.min(pool.length,(g.character.extraChoice||g.character.luckyTime>0)?4:3);const chosen=pool.slice(0,count);
 if(talent(g,'aqian','a',2)&&old[0]&&pool.includes(old[0])){const index=chosen.indexOf(old[0]);if(index>=0)chosen.splice(index,1);chosen.unshift(old[0]);chosen.length=count;}
 if(pool.length>count&&chosen.every(id=>old.includes(id)))chosen[count-1]=pool.find(id=>!old.includes(id));
 g.blessingOptions=chosen;g.blessingRevision=(g.blessingRevision||0)+1;return true;
}
export function initCharacter(g,options={}){
 g.character=null;g.summons=[];g.skillZones=[];g.blessingOptions=null;g.blessingRevision=0;g.player.skillCount=0;g.passiveHealingBudget=20;g.player.knockbackResistance=1;g.player.luckBonus=0;
 if(!CHARACTERS[options.character])return;
 g.character={id:options.character,skillCd:0,combo:0,stars:0,rage:0,luckyTime:0,rerolls:2,extraChoice:options.character==='aqian'&&rng(g)<.3,summonPowerTime:0,summonSequence:0,killsSinceSummon:0,talentBranch:null,talentLevel:0,guardTimer:4,dashWasActive:false,counterReady:false,shieldPresent:false,luckyShieldPending:false};
 const branch=options.talent?.branch,level=options.talent?.level;if(['a','b'].includes(branch)&&Number.isInteger(level)&&level>=1){g.character.talentBranch=branch;g.character.talentLevel=Math.min(2,level);}
 g.character.talent=g.character.talentBranch?{branch:g.character.talentBranch,level:g.character.talentLevel}:null;
 if(talent(g,'aqian','a')){g.character.extraChoice=true;g.character.rerolls=3;}
 g.character.shieldPresent=(g.player.statuses||[]).some(s=>s.id==='shield'&&s.remaining>0);
 if(options.character==='xuanmo')g.player.knockbackResistance=.45;
 g.player.skillCount=0;g.passiveHealingBudget=20;
 if(g.character.id==='aqian')changeChoices(g);
}
export function rerollBlessings(g){
 const c=g.character;if(!c||c.id!=='aqian'||g.state!=='blessing'||c.rerolls<=0)return false;
 if(!changeChoices(g))return false;c.rerolls--;aura(g,'blessing');return true;
}
export function characterAttack(g){
 const c=g.character;if(!c)return;
 if(c.id==='xinglian'){
  // Any weapon can be used; physical attacks build a slower single orbit as well.
  c.stars++;if(c.stars>=orbitThreshold(g)){c.stars-=orbitThreshold(g);fire(g,nearest(g),{damage:15,freeze:talent(g,'xinglian','a',2)});aura(g,'cast');}
 }
}
export function characterHit(g,e,damage,weapon,extra={}){
 const c=g.character;if(!c)return damage;
 if(c.luckyTime>0)g.player.critMeter+=.12;
 if(!extra.proc&&c.id==='qingyue'&&Math.abs(center(e).x-center(g.player).x)<150){
  c.combo=(c.combo+1)%5;
  if(c.combo===0){damage*=1.5;extra.knockbackMultiplier=1.8;extra.heavy=true;applyStatus(e,'armorbreak',3);aura(g,'critical',e.x+e.w/2,e.y+e.h/2);if(talent(g,'qingyue','a')){fire(g,e,{damage:14,weapon:'staff',speed:410});if(talent(g,'qingyue','a',2))for(const other of alive(g))if(other!==e&&Math.hypot(center(other).x-center(e).x,center(other).y-center(e).y)<110)g.damageEnemy(other,12,{periodic:true});}}
 }
 if(c.id==='hongling'&&(weapon==='talisman'||weapon==='staff')){
  const kinds=new Set((e.statuses||[]).filter(s=>s.remaining>0&&!['shield','unstoppable'].includes(s.id)).map(s=>s.id));damage*=1+Math.min(.35,kinds.size*.07);
 }
 if(!extra.proc&&c.id==='xinglian'&&extra.crit){c.stars+=2;if(c.stars>=orbitThreshold(g)){c.stars-=orbitThreshold(g);fire(g,e,{damage:15,freeze:talent(g,'xinglian','a',2)});}}
 if(talent(g,'hongling','a')&&weapon==='talisman'){applyStatus(e,'poison',4);if(talent(g,'hongling','a',2))applyStatus(e,'poison',4);}
 if(!extra.proc&&talent(g,'xuanmo','a')&&c.counterReady){c.counterReady=false;damage+=10;for(const other of alive(g))if(Math.abs(center(other).x-center(g.player).x)<165){if(other!==e)g.damageEnemy(other,10,{periodic:true});if(talent(g,'xuanmo','a',2))applyStatus(other,'slow',2);}aura(g,'slam');}
 return damage;
}
export function characterHurt(g,amount){const c=g.character;if(c?.id==='xuanmo'){c.rage=Math.min(100,c.rage+Math.max(0,amount)*2);if(talent(g,'xuanmo','a'))c.counterReady=true;}}
export function characterKill(g,e){
 const c=g.character;if(!c)return;
 if(talent(g,'hongling','b')&&!c.resolvingExplosion&&(e.statuses||[]).some(s=>s.id==='burn'&&s.remaining>0)){c.resolvingExplosion=true;try{for(const other of alive(g))if(Math.hypot(center(other).x-center(e).x,center(other).y-center(e).y)<135){g.damageEnemy(other,16,{periodic:true});if(talent(g,'hongling','b',2)&&other.hp>0)applyStatus(other,'burn',3);}aura(g,'rune',center(e).x,center(e).y);}finally{c.resolvingExplosion=false;}}
 if(c.id!=='baili')return;
 c.killsSinceSummon++;if(rng(g)<.4||c.killsSinceSummon>=3){if(summon(g))c.killsSinceSummon=0;}
}
export function useSkill(g){
 const c=g.character;if(!c||c.skillCd>0||!['playing','blessing'].includes(g.state)||g.player.hp<=0)return false;
 if(hasStatus(g.player,'freeze')||trialSkillLock(g)>0)return false;
 if(g.state==='blessing'&&c.id!=='aqian')return false;
 if(c.id==='xuanmo'&&c.rage<=0)return false;
 const p=g.player,origin=center(p),targets=alive(g);
 if(c.id==='aqian'){
  c.luckyTime=5;p.luckBonus=.2;if(talent(g,'aqian','b')){p.critMeter=Math.max(1,p.critMeter);c.luckyShieldPending=talent(g,'aqian','b',2);}if(g.state==='blessing')changeChoices(g);aura(g,'blessing');
 }else if(c.id==='qingyue'){
  // The slash resolves its own targets; its animation must not create a second ordinary swing.
  g.attackIds=new Set(targets.map(e=>e.id));
  const oldX=p.x;p.x=clamp(p.x+p.facing*170,30,g.wave===0?1120:g.wave===1?2320:3230);p.invuln=Math.max(p.invuln,.38);p.dashTime=.14;p.stun=0;p.attackTime=.19;
  for(const e of targets){const dx=center(e).x-(oldX+p.w/2);if(dx*p.facing>=-35&&dx*p.facing<245&&Math.abs(center(e).y-origin.y)<120){g.damageEnemy(e,42,{knockback:420,direction:p.facing,heavy:true});if(e.hp>0){e.stun=Math.max(e.stun||0,e.type==='boss'?.16:.55);applyStatus(e,'armorbreak',3);}}}aura(g,'critical',p.x+19,p.y+29,.65);
 }else if(c.id==='hongling'){
  for(let i=0;i<6;i++)fire(g,targets.length?targets[i%targets.length]:null,{damage:12,weapon:'talisman',speed:430,offset:(i-2.5)*.045,homing:true});aura(g,'rune',origin.x,origin.y,.7);
 }else if(c.id==='xinglian'){
  const target=nearest(g),point=target?center(target):{x:origin.x+p.facing*160,y:origin.y};if(talent(g,'xinglian','b')){for(const side of [-1,1]){const delay=side===1&&talent(g,'xinglian','b',2)?1.25:.75;g.skillZones.push({kind:'starfall',x:point.x+side*65,y:point.y,radius:135,delay,life:delay,maxLife:delay,damage:30});}}else g.skillZones.push({kind:'starfall',x:point.x,y:point.y,radius:190,delay:.75,life:.75,maxLife:.75,damage:48});g.skillZones=g.skillZones.slice(-3);aura(g,'cast',point.x,point.y,.75);
 }else if(c.id==='baili'){
  if(!g.summons.length)summon(g);c.summonPowerTime=6;const target=nearest(g);c.focusTarget=target?.id??null;for(const s of g.summons)s.attackCd=0;aura(g,'purify',origin.x,origin.y,.7);
 }else if(c.id==='xuanmo'){
  const rage=c.rage;c.rage=0;for(const e of targets)if(Math.abs(center(e).x-origin.x)<200&&Math.abs(center(e).y-origin.y)<140)g.damageEnemy(e,18+rage*.35,{knockback:470,direction:center(e).x>=origin.x?1:-1,heavy:true});applyStatus(p,'shield',4,{amount:Math.min(40,15+rage*.4)});applyStatus(p,'unstoppable',1.8);aura(g,'slam',origin.x,p.y+p.h,.65);
 }
 c.skillCd=CHARACTERS[c.id].cooldown;p.skillCount=(p.skillCount||0)+1;return true;
}
export function tickCharacter(g,dt){
 const c=g.character;if(!c||g.state!=='playing')return;
 c.skillCd=Math.max(0,c.skillCd-dt*trialSkillFactor(g));c.luckyTime=Math.max(0,c.luckyTime-dt);if(c.luckyShieldPending&&c.luckyTime===0){c.luckyShieldPending=false;applyStatus(g.player,'shield',4,{amount:15});}g.player.luckBonus=c.luckyTime>0?.2:0;c.summonPowerTime=Math.max(0,c.summonPowerTime-dt);
 if(talent(g,'qingyue','b')){const dashing=g.player.dashTime>0;if(dashing&&!c.dashWasActive){let hit=false;for(const e of alive(g))if((center(e).x-center(g.player).x)*g.player.facing>-20&&(center(e).x-center(g.player).x)*g.player.facing<180&&Math.abs(center(e).y-center(g.player).y)<100){hit=true;g.damageEnemy(e,20,{knockback:200,direction:g.player.facing,heavy:true});}if(hit&&talent(g,'qingyue','b',2))applyStatus(g.player,'shield',3,{amount:12});aura(g,'critical');}c.dashWasActive=dashing;}
 if(talent(g,'baili','a')&&g.summons.length){c.guardTimer-=dt;if(c.guardTimer<=0){c.guardTimer+=4;applyStatus(g.player,'shield',3,{amount:10});if(talent(g,'baili','a',2)&&!g.noHealing&&g.passiveHealingBudget>0){const heal=Math.min(2,g.passiveHealingBudget,g.player.maxHp-g.player.hp);g.player.hp+=heal;g.passiveHealingBudget-=heal;}aura(g,'purify');}}
 const shieldNow=(g.player.statuses||[]).some(s=>s.id==='shield'&&s.remaining>0&&s.shield>0);if(talent(g,'xuanmo','b')&&c.shieldPresent&&!shieldNow){for(const e of alive(g))if(Math.hypot(center(e).x-center(g.player).x,center(e).y-center(g.player).y)<185){g.damageEnemy(e,18,{knockback:210,direction:center(e).x>=center(g.player).x?1:-1,heavy:true});if(talent(g,'xuanmo','b',2)&&e.hp>0)applyStatus(e,'freeze',.4);}aura(g,'slam');}c.shieldPresent=shieldNow;
 for(const z of g.skillZones){z.delay-=dt;z.life-=dt;if(z.delay<=0&&!z.resolved){z.resolved=true;for(const e of alive(g))if(Math.hypot(center(e).x-z.x,center(e).y-z.y)<z.radius){g.damageEnemy(e,z.damage,{knockback:160,direction:center(e).x>=z.x?1:-1,heavy:true});if(e.hp>0)applyStatus(e,'slow',2);}aura(g,'lightning',z.x,z.y,.7);}}
 g.skillZones=g.skillZones.filter(z=>!z.resolved);
 for(const s of g.summons){
  s.life-=dt;s.attackCd-=dt;s.boosted=c.summonPowerTime>0;const focused=alive(g).find(e=>e.id===c.focusTarget);const target=s.boosted&&focused?focused:nearest(g,s.x,s.y);
  const tx=target?center(target).x:g.player.x+(s.id%2?35:-35);const ty=target?center(target).y-12:g.player.y+20;const dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy);const speed=s.boosted?285:190;
  if(d>1){const step=Math.min(d,speed*dt);s.x+=dx/d*step;s.y+=dy/d*step;}
  if(target&&d<75&&s.attackCd<=0){g.damageEnemy(target,s.boosted?14:7,{periodic:true});s.attackCd=talent(g,'baili','b')?(s.boosted?.3:.65):(s.boosted?.4:.85);s.attackCount=(s.attackCount||0)+1;if(talent(g,'baili','b',2)&&s.attackCount%3===0)fire(g,target,{damage:5,origin:center(s),homing:true});aura(g,'hit',s.x,s.y,.25);}
 }
 g.summons=g.summons.filter(s=>s.life>0).slice(0,3);
}
