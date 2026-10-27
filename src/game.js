import {initRelics,addRelic,relicDamage,tickRelics,killRelics,freezeRelics,clearRelics,offerRelics,chooseRelic} from './relics.js';
import {initBuild,attune,onBlessingBuild,evolutionAttack,evolutionHit,evolutionWall,evolutionKill,tickBuild} from './evolution.js';
import {createStaffField,tickStaffFields} from './combat-fields.js';
import {initCharacter,tickCharacter,characterAttack,characterHit,characterHurt,characterKill,useSkill,rerollBlessings} from './characters.js';
import {WEAPONS} from './weapons.js';
import {applyStatus,hasStatus,damageAfterStatuses,tickStatuses,speedFactor} from './status.js';
export const FLOOR = 585;
export const BLESSINGS = {
 water: {name:'坎水靈息',icon:'水',description:'法力上限+20；攻擊附加冰緩，每第三擊短暫冰凍。'},
 thunder: {name:'震雷驚蟄',icon:'雷',description:'攻擊附加雷感，對已感電的敵人追加連鎖雷光。'},
 fire: {name:'離火靈符', icon:'火', description:'普通攻擊傷害 +40%。以明火照破竹林迷霧。'},
 wood: {name:'青木長生', icon:'木', description:'生命上限 +30，並額外回復 30 生命。生生不息，步步安心。'},
 wind: {name:'巽風踏影', icon:'風', description:'移動速度 +15%，衝刺冷卻縮短至 0.55 秒。隨風而行。'}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Game {
 constructor(){ this.reset(); this.state='title'; }
 reset(options={}){
  const weapon=WEAPONS[options.weapon]?options.weapon:'sword';const loadout=WEAPONS[weapon];
  this.state='playing'; this.player={x:100,y:FLOOR-58,w:38,h:58,hp:100,maxHp:100,facing:1,vx:0,vy:0,invuln:0,attackTime:0,dashTime:0,attackCd:0,dashCd:0,damage:loadout.damage*(1+(options.damageBonus||0)),speed:235,dashCooldown:.9,weapon,energy:100+(options.energyBonus||0),maxEnergy:100+(options.energyBonus||0),statuses:[],stun:0,knockbackTimer:0,critMeter:0,attackCount:0};
  this.player.hp=this.player.maxHp=100+(options.maxHpBonus||0);if(options.startingStatus)applyStatus(this.player,options.startingStatus,options.startingStatus==='shield'?8:2);this.result=null;this.hitStop=0;this.shake=0;this.camera=0;this.wave=0;this.blessing=null;this.enemies=[];this.projectiles=[];this.spellFields=[];this.effects=[];this.zones=[];this.vfx=[];this.visualSequence=0;this.visualTime=0;this.kills=0;this.elapsed=0;this.sequence=0;this.notice='沿著星燈前進 · 淨化兩隻霧團';this.spawnWave(0);this.availableBlessings=Object.keys(BLESSINGS);initCharacter(this,options);initBuild(this,options);initRelics(this,options);
 }
 spawn(type,x){const boss=type==='boss',spirit=type==='spirit';const h=boss?126:spirit?52:38;const hp=boss?286:spirit?36:42;this.enemies.push({id:++this.sequence,type,x,y:FLOOR-h,w:boss?100:spirit?42:48,h,hp,maxHp:hp,vx:0,state:'idle',timer:boss?1.5:1+this.sequence*.12,facing:-1,attackCount:0,statuses:[],stun:0,knockbackTimer:0,onStatusAdded:null});const spawned=this.enemies.at(-1);spawned.onStatusAdded=id=>{if(id==='freeze')freezeRelics(this,spawned);};}
 spawnWave(n){if(n===0){this.spawn('slime',570);this.spawn('slime',850);}if(n===1){this.spawn('slime',1480);this.spawn('slime',1780);this.spawn('spirit',2030);}if(n===2){this.spawn('boss',2870);this.notice='竹魄守 · 紅色預兆出現時跳躍或衝刺';}}
 addRelic(id,quality=0){return addRelic(this,id,quality);}
 chooseRelic(id){return chooseRelic(this,id);}
 presentEvolution(){if(this.buildNotices.length&&['playing','route','relic-choice','altar'].includes(this.state)){this.evolutionReturn=this.state;this.state='evolving';return true;}return false;}
 acknowledgeEvolution(){if(this.state!=='evolving')return false;this.buildNotices.shift();this.state=this.evolutionReturn||'playing';this.presentEvolution();return true;}
 attune(element,bagua){const ok=attune(this,element,bagua);if(ok)this.presentEvolution();return ok;}
 useSkill(){return useSkill(this);}
 rerollBlessings(){return rerollBlessings(this);}
 choose(id){if(this.state!=='blessing'||!BLESSINGS[id])return false;this.blessing=id;this.visual('blessing',this.player.x+19,this.player.y+29,id==='fire'?'#ffc296':id==='wood'?'#b5edab':'#b3e9ed',1.1);const p=this.player;if(id==='fire')p.damage*=1.4;if(id==='wood'){applyStatus(p,'shield',8,{amount:20});p.maxHp+=30;p.hp=Math.min(p.maxHp,p.hp+30);}if(id==='wind'){applyStatus(p,'unstoppable',3);p.speed*=1.15;p.dashCooldown=.55;}if(id==='water'){p.maxEnergy+=20;p.energy=p.maxEnergy;}onBlessingBuild(this,id);this.wave=1;this.spawnWave(1);this.state='playing';this.notice='穿過竹林 · 留意遠處的燈妖';if(this.build&&!this.starterRelicGranted){this.starterRelicGranted=true;offerRelics(this,0,'playing');}this.presentEvolution();return true;}
 visual(kind,x,y,color='#ffe0a3',duration=.55){this.vfx.push({id:++this.visualSequence,kind,x,y,color,life:duration,maxLife:duration});if(this.vfx.length>48)this.vfx.splice(0,this.vfx.length-48);}
 updateVisual(dt){if(['paused','blessing','title','evolving','route','relic-choice','shop','altar'].includes(this.state))return;dt=Math.min(dt,.04);this.visualTime+=dt;this.shake=Math.max(0,this.shake-dt);if(this.state==='won'||this.state==='dead'){for(const e of this.effects){e.life-=dt;e.y-=23*dt;}this.effects=this.effects.filter(e=>e.life>0);}for(const v of this.vfx)v.life-=dt;this.vfx=this.vfx.filter(v=>v.life>0);for(const e of this.enemies)e.hitFlash=Math.max(0,(e.hitFlash||0)-dt);}
 effect(x,y,text,color='#f4d690'){this.effects.push({x,y,text,color,life:1});}
 applyStatus(entity,id,duration=3,options={}){return applyStatus(entity,id,duration,options);}
 finish(){if(!['dead','won'].includes(this.state))return;this.result={kills:this.kills,bossWon:this.state==='won',jade:this.kills*2+(this.state==='won'?10:0)};}
 hurt(amount,sourceX,periodic=false){const p=this.player;if(this.state!=='playing'||(!periodic&&(p.invuln>0||p.dashTime>0)))return false;amount=damageAfterStatuses(p,amount);if(amount<=0){this.visual('shield',p.x+19,p.y+30,'#b2e4ff');return false;}p.hp=Math.max(0,p.hp-amount);characterHurt(this,amount);this.visual('hurt',p.x+p.w/2,p.y+p.h/2,'#ffc1b1');if(!periodic){p.invuln=1;this.shake=.16;this.hitStop=.025;if(!hasStatus(p,'unstoppable')){p.stun=.15;p.knockbackTimer=.2;p.vx=(p.x>=sourceX?1:-1)*240*(p.knockbackResistance||1);}}this.effect(p.x,p.y-15,`−${Math.ceil(amount)}`,'#ff9d99');if(p.hp===0){this.state='dead';this.spellFields=[];this.projectiles=[];this.zones=[];this.finish();}return true;}
 damageEnemy(e,amount,options={}){if(e.hp<=0)return;amount=damageAfterStatuses(e,amount);if(amount<=0)return;e.hp-=amount;e.hitFlash=.13;this.visual(options.crit?'critical':'hit',e.x+e.w/2,e.y+e.h/2);this.effect(e.x+e.w/2,e.y-12,`${options.crit?'暴擊 ':''}${Math.round(amount)}`);if(!options.periodic){this.hitStop=Math.max(this.hitStop,e.type==='boss'?.018:.03);if(!hasStatus(e,'unstoppable')){e.knockbackTimer=.13;e.wallProc=false;e.vx=(options.direction||this.player.facing)*(options.knockback||0)*(e.type==='boss'?.02:1);e.stun=e.type==='boss'?.025:options.heavy?.22:.09;}}if(e.hp<=0){this.visual(e.type==='boss'?'boss-defeat':'purify',e.x+e.w/2,e.y+e.h/2,'#bfefcc',e.type==='boss'?1.8:.7);this.kills++;characterKill(this,e);killRelics(this,e);evolutionKill(this,e);this.effect(e.x,e.y,'淨化','#b6ecd5');}}
 weaponHit(e,weapon,damage,extra={}){const p=this.player,w=WEAPONS[weapon];p.critMeter+=w.crit;const crit=p.critMeter>=1;if(crit)p.critMeter-=1;extra.crit=crit;damage=relicDamage(this,characterHit(this,e,damage,weapon,extra));this.damageEnemy(e,damage*(crit?w.critDamage:1),{crit,knockback:w.knockback*(extra.knockbackMultiplier||1),direction:extra.direction||p.facing,heavy:weapon==='staff'||extra.heavy});this.visual(weapon==='sword'?'sword-hit':weapon==='talisman'?'paper-hit':'staff-hit',e.x+e.w/2,e.y+e.h/2,weapon==='sword'?'#f3c896':weapon==='talisman'?'#ffcc91':'#c6b5f0',.32);evolutionHit(this,e,weapon,extra);if(e.hp<=0)return;if(weapon==='sword')applyStatus(e,'armorbreak',2);if(weapon==='talisman')applyStatus(e,'burn',3);if(weapon==='staff'){applyStatus(e,'slow',2);if(extra.freeze)applyStatus(e,'freeze',.55);if(hasStatus(e,'shock')&&Math.random()<.35){this.damageEnemy(e,9,{periodic:true});this.visual('lightning',e.x+e.w/2,e.y,'#e5caff');}applyStatus(e,'shock',4);}if(this.blessing==='water'){applyStatus(e,'slow',2);if(p.attackCount%3===0)applyStatus(e,'freeze',.4);}if(this.blessing==='thunder'){if(hasStatus(e,'shock')){this.damageEnemy(e,5,{periodic:true});this.visual('lightning',e.x,e.y);}applyStatus(e,'shock',4);}if(this.blessing==='fire')applyStatus(e,'burn',3);if(this.blessing==='wood')applyStatus(e,'poison',4);if(this.blessing==='wind'){applyStatus(e,'slow',2);applyStatus(e,'shock',4);}}
 fireWeapon(){const p=this.player,w=WEAPONS[p.weapon];if(p.weapon==='staff'&&p.energy<15)return false;p.attackCd=w.cooldown;p.attackTime=p.weapon==='staff'?.3:.19;p.attackCount++;this.attackIds=new Set();if(p.weapon==='staff')p.energy-=15;if(p.weapon!=='sword'){const target=this.enemies.filter(e=>e.hp>0&&(e.x-p.x)*p.facing>-20).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];const sy=p.y+24;const angle=target?Math.atan2(target.y+target.h/2-sy,target.x+target.w/2-(p.x+19)):p.facing>0?0:Math.PI;const speed=p.weapon==='staff'?290:490;this.projectiles.push({x:p.x+19+p.facing*24,y:sy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:p.weapon==='staff'?12:8,life:w.range/speed,hostile:false,weapon:p.weapon,damage:p.damage,element:w.element,freeze:p.attackCount%3===0});this.visual(p.weapon==='staff'?'cast':'rune',p.x+19,p.y+24,'#e9ceff',.3);}characterAttack(this);evolutionAttack(this);return true;}
 update(dt,input={}){
  if(this.state!=='playing')return;dt=Math.min(dt,.04);this.elapsed+=dt;tickStaffFields(this,dt);tickBuild(this,dt);tickRelics(this,dt);tickCharacter(this,dt);if(input.skill)this.useSkill();const p=this.player;tickStatuses(p,dt,n=>this.hurt(n,p.x,true));if(this.state!=='playing')return;p.energy=Math.min(p.maxEnergy,p.energy+12*dt);p.stun=Math.max(0,p.stun-dt);p.knockbackTimer=Math.max(0,p.knockbackTimer-dt);const frozen=hasStatus(p,'freeze');const locked=p.stun>0||frozen;
  for(const key of ['invuln','attackTime','dashTime','attackCd','dashCd'])p[key]=Math.max(0,p[key]-dt);
  const dir=(input.right?1:0)-(input.left?1:0);if(dir&&p.dashTime<=0&&!locked)p.facing=dir;
  if(!locked&&input.jump&&p.y+p.h>=FLOOR-.1){p.vy=-555;this.effect(p.x,p.y+p.h,'·','#b6ecd5');}
  if(!locked&&input.dash&&p.dashCd<=0){this.visual('dash',p.x+p.w/2,p.y+p.h/2,'#a7f0e2',.4);p.dashTime=.19;p.dashCd=p.dashCooldown;p.invuln=Math.max(p.invuln,.23);}
  if(!locked&&input.attack&&p.attackCd<=0)this.fireWeapon();
  if(p.knockbackTimer<=0)p.vx=locked?0:p.dashTime>0?p.facing*690:dir*p.speed*speedFactor(p);p.x=clamp(p.x+p.vx*dt,30,this.wave===0?1120:this.wave===1?2320:3230);p.vy+=1450*dt;p.y=Math.min(FLOOR-p.h,p.y+p.vy*dt);if(p.y+p.h>=FLOOR)p.vy=0;
  for(const e of this.enemies){
   if(e.hp<=0)continue;tickStatuses(e,dt,n=>this.damageEnemy(e,n,{periodic:true}));e.stun=Math.max(0,(e.stun||0)-dt);e.knockbackTimer=Math.max(0,(e.knockbackTimer||0)-dt);if(e.knockbackTimer>0){const bound=this.enemyWall||3200;e.x=clamp(e.x+e.vx*dt,50,bound);if(!e.wallProc&&(e.x===50||e.x===bound)){e.wallProc=true;evolutionWall(this,e);this.onWall?.(e);}}
   if(p.weapon==='sword'&&p.attackTime>0&&!this.attackIds?.has(e.id)){
    const dx=e.x+e.w/2-(p.x+p.w/2);if(dx*p.facing>-20&&dx*p.facing<115&&p.y<e.y+e.h+10&&p.y+p.h>e.y-20){this.attackIds.add(e.id);this.weaponHit(e,p.weapon,p.damage);}
   }
   if(e.hp<=0)continue;
   if(e.stun>0||hasStatus(e,'freeze'))continue;const enemyDt=dt*speedFactor(e);e.timer-=dt;const dx=p.x-e.x;const distance=Math.abs(dx);if(e.state==='idle')e.facing=Math.sign(dx)||-1;
   if(e.type==='slime'){
    if(e.state==='windup'&&e.timer<=0){e.state='lunge';e.timer=.33;e.vx=e.facing*330;}
    else if(e.state==='lunge'){e.x+=e.vx*enemyDt;if(e.timer<=0){e.state='idle';e.timer=.9;}}
    else if(e.state==='idle'&&distance<520){if(distance>100)e.x+=e.facing*68*enemyDt;else if(e.timer<=0){e.state='windup';e.timer=.55;}}
    if(e.state==='lunge'&&this.overlap(p,e))this.hurt(10,e.x);
   }else if(e.type==='spirit'){
    e.y=FLOOR-e.h-24+Math.sin(this.elapsed*2)*12;
    if(distance<640){if(e.state==='idle'&&e.timer<=0){e.state='windup';e.timer=.7;}else if(e.state==='windup'&&e.timer<=0){this.shoot(e,230);e.state='idle';e.timer=1.9;}}
   }else this.bossUpdate(e,enemyDt,distance);
   e.x=clamp(e.x,50,3200);
  }
  this.enemies=this.enemies.filter(e=>e.hp>0);
  if(this.state!=='playing')return;
  if(this.enemies.length===0){clearRelics(this,'wave-'+this.wave);
   if(this.wave===0){this.state='blessing';p.hp=Math.min(p.maxHp,p.hp+25);this.projectiles=[];this.zones=[];this.notice='命籤已現 · 選擇一份祝福';}
   else if(this.wave===1){this.wave=2;this.spawnWave(2);p.hp=Math.min(p.maxHp,p.hp+20);this.projectiles=[];}
   else {this.state='won';this.spellFields=[];this.finish();this.projectiles=[];this.zones=[];return;}
  }
  for(const b of this.projectiles){
   if(b.hostile===false&&(b.weapon==='staff'||b.homing)){const target=this.enemies.filter(e=>e.hp>0).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];if(target){const a=Math.atan2(target.y+target.h/2-b.y,target.x+target.w/2-b.x);b.vx+=(Math.cos(a)*290-b.vx)*dt*3;b.vy+=(Math.sin(a)*290-b.vy)*dt*3;}}
   b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)continue;
   if(b.hostile!==false){if(p.x<b.x+b.r&&p.x+p.w>b.x-b.r&&p.y<b.y+b.r&&p.y+p.h>b.y-b.r){if(this.hurt(9,b.x)&&b.status)applyStatus(p,b.status,1.5);b.life=0;}}
   else {const target=this.enemies.find(e=>e.hp>0&&e.x<b.x+b.r&&e.x+e.w>b.x-b.r&&e.y<b.y+b.r&&e.y+e.h>b.y-b.r);if(target){b.life=0;if(b.weapon==='staff'&&!b.characterSource)createStaffField(this,b.x,b.y);this.visual(b.weapon==='staff'?'lightning':'rune',b.x,b.y,b.weapon==='staff'?'#ddc0ff':'#ffd192',.5);for(const e of this.enemies){if(e===target||(b.weapon==='staff'&&Math.hypot(e.x+e.w/2-b.x,e.y+e.h/2-b.y)<100))this.weaponHit(e,b.weapon,b.damage,{freeze:b.freeze,direction:Math.sign(b.vx),proc:!!b.characterSource,evolutionProc:!!b.evolutionSource});}}}
  }
  this.projectiles=this.projectiles.filter(b=>b.life>0&&b.y<750&&b.x>-100&&b.x<3400);
  this.effects.forEach(e=>{e.life-=dt;e.y-=23*dt;});this.effects=this.effects.filter(e=>e.life>0);this.zones.forEach(z=>z.life-=dt);this.zones=this.zones.filter(z=>z.life>0);
  this.camera=clamp(p.x-420,0,2020);
 }
 overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
 shoot(e,speed,angleOffset=0){const p=this.player;const a=Math.atan2(p.y+p.h/2-e.y-e.h/2,p.x+p.w/2-e.x-e.w/2)+angleOffset;this.projectiles.push({x:e.x+e.w/2,y:e.y+e.h/2,r:10,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:5,hostile:true,status:e.type==='boss'?'poison':'slow'});}
 bossUpdate(e,dt,distance){
  const p=this.player;
  if(e.state==='idle'){
   if(distance>155)e.x+=e.facing*80*dt;
   if(e.timer<=0&&distance<600){e.attackCount++;e.state=e.hp<e.maxHp*.5&&e.attackCount%3===0?'volley':e.attackCount%2===0?'charge':'slam';e.timer=e.state==='charge'?1.15:.95;e.targetX=p.x; if(e.state==='slam')this.zones.push({x:e.targetX-95,w:230,life:.95,maxLife:.95});}
  }else if(e.state==='rush'){
   e.x+=e.facing*530*dt;if(this.overlap(p,e))this.hurt(16,e.x);if(e.timer<=0){e.state='idle';e.timer=1.3;}
  }else if(e.timer<=0){
   if(e.state==='slam'){if(p.x+p.w>e.targetX-95&&p.x<e.targetX+135&&p.y+p.h>FLOOR-45)this.hurt(18,e.targetX);this.effect(e.targetX,FLOOR-25,'震','#ffb28c');this.visual('slam',e.targetX+20,FLOOR-15,'#ffc2a1',.55);e.state='idle';e.timer=1.2;}
   else if(e.state==='charge'){e.state='rush';e.timer=.65;applyStatus(e,'unstoppable',.65);}
   else {[-.26,0,.26].forEach(a=>this.shoot(e,205,a));e.state='idle';e.timer=1.4;}
  }
 }
}
