export const FLOOR = 585;
export const BLESSINGS = {
 fire: {name:'離火靈符', icon:'火', description:'普通攻擊傷害 +40%。以明火照破竹林迷霧。'},
 wood: {name:'青木長生', icon:'木', description:'生命上限 +30，並額外回復 30 生命。生生不息，步步安心。'},
 wind: {name:'巽風踏影', icon:'風', description:'移動速度 +15%，衝刺冷卻縮短至 0.55 秒。隨風而行。'}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Game {
 constructor(){ this.reset(); this.state='title'; }
 reset(){
  this.state='playing'; this.player={x:100,y:FLOOR-58,w:38,h:58,hp:100,maxHp:100,facing:1,vx:0,vy:0,invuln:0,attackTime:0,dashTime:0,attackCd:0,dashCd:0,damage:22,speed:235,dashCooldown:.9};
  this.camera=0;this.wave=0;this.blessing=null;this.enemies=[];this.projectiles=[];this.effects=[];this.zones=[];this.vfx=[];this.visualTime=0;this.kills=0;this.elapsed=0;this.sequence=0;this.notice='沿著星燈前進 · 淨化兩隻霧團';this.spawnWave(0);
 }
 spawn(type,x){const boss=type==='boss',spirit=type==='spirit';const h=boss?126:spirit?52:38;const hp=boss?286:spirit?36:42;this.enemies.push({id:++this.sequence,type,x,y:FLOOR-h,w:boss?100:spirit?42:48,h,hp,maxHp:hp,vx:0,state:'idle',timer:boss?1.5:1+this.sequence*.12,facing:-1,attackCount:0});}
 spawnWave(n){if(n===0){this.spawn('slime',570);this.spawn('slime',850);}if(n===1){this.spawn('slime',1480);this.spawn('slime',1780);this.spawn('spirit',2030);}if(n===2){this.spawn('boss',2870);this.notice='竹魄守 · 紅色預兆出現時跳躍或衝刺';}}
 choose(id){if(this.state!=='blessing'||!BLESSINGS[id])return false;this.blessing=id;this.visual('blessing',this.player.x+19,this.player.y+29,id==='fire'?'#ffc296':id==='wood'?'#b5edab':'#b3e9ed',1.1);const p=this.player;if(id==='fire')p.damage*=1.4;if(id==='wood'){p.maxHp+=30;p.hp=Math.min(p.maxHp,p.hp+30);}if(id==='wind'){p.speed*=1.15;p.dashCooldown=.55;}this.wave=1;this.spawnWave(1);this.state='playing';this.notice='穿過竹林 · 留意遠處的燈妖';return true;}
 visual(kind,x,y,color='#ffe0a3',duration=.55){this.vfx.push({kind,x,y,color,life:duration,maxLife:duration});if(this.vfx.length>48)this.vfx.splice(0,this.vfx.length-48);}
 updateVisual(dt){if(['paused','blessing','title'].includes(this.state))return;dt=Math.min(dt,.04);this.visualTime+=dt;if(this.state==='won'||this.state==='dead'){for(const e of this.effects){e.life-=dt;e.y-=23*dt;}this.effects=this.effects.filter(e=>e.life>0);}for(const v of this.vfx)v.life-=dt;this.vfx=this.vfx.filter(v=>v.life>0);for(const e of this.enemies)e.hitFlash=Math.max(0,(e.hitFlash||0)-dt);}
 effect(x,y,text,color='#f4d690'){this.effects.push({x,y,text,color,life:1});}
 hurt(amount,sourceX){const p=this.player;if(this.state!=='playing'||p.invuln>0||p.dashTime>0)return false;p.hp=Math.max(0,p.hp-amount);this.visual('hurt',p.x+p.w/2,p.y+p.h/2,'#ffc1b1');p.invuln=1;p.vx=(p.x>=sourceX?1:-1)*180;this.effect(p.x,p.y-15,`−${amount}`,'#ff9d99');if(p.hp===0){this.state='dead';this.projectiles=[];this.zones=[];}return true;}
 damageEnemy(e,amount){if(e.hp<=0)return;e.hp-=amount;e.hitFlash=.13;this.visual('hit',e.x+e.w/2,e.y+e.h/2);this.effect(e.x+e.w/2,e.y-12,`${Math.round(amount)}`);if(e.hp<=0){this.visual(e.type==='boss'?'boss-defeat':'purify',e.x+e.w/2,e.y+e.h/2,'#bfefcc',e.type==='boss'?1.8:.7);this.kills++;this.effect(e.x,e.y,'淨化','#b6ecd5');}}
 update(dt,input={}){
  if(this.state!=='playing')return;dt=Math.min(dt,.04);this.elapsed+=dt;const p=this.player;
  for(const key of ['invuln','attackTime','dashTime','attackCd','dashCd'])p[key]=Math.max(0,p[key]-dt);
  const dir=(input.right?1:0)-(input.left?1:0);if(dir&&p.dashTime<=0)p.facing=dir;
  if(input.jump&&p.y+p.h>=FLOOR-.1){p.vy=-555;this.effect(p.x,p.y+p.h,'·','#b6ecd5');}
  if(input.dash&&p.dashCd<=0){this.visual('dash',p.x+p.w/2,p.y+p.h/2,'#a7f0e2',.4);p.dashTime=.19;p.dashCd=p.dashCooldown;p.invuln=Math.max(p.invuln,.23);}
  if(input.attack&&p.attackCd<=0){p.attackCd=.34;p.attackTime=.19;this.attackIds=new Set();}
  p.vx=p.dashTime>0?p.facing*690:dir*p.speed;p.x=clamp(p.x+p.vx*dt,30,this.wave===0?1120:this.wave===1?2320:3230);p.vy+=1450*dt;p.y=Math.min(FLOOR-p.h,p.y+p.vy*dt);if(p.y+p.h>=FLOOR)p.vy=0;
  for(const e of this.enemies){
   if(e.hp<=0)continue;
   if(p.attackTime>0&&!this.attackIds?.has(e.id)){
    const dx=e.x+e.w/2-(p.x+p.w/2);if(dx*p.facing>-20&&dx*p.facing<115&&p.y<e.y+e.h+10&&p.y+p.h>e.y-20){this.attackIds.add(e.id);this.damageEnemy(e,p.damage);}
   }
   if(e.hp<=0)continue;
   e.timer-=dt;const dx=p.x-e.x;const distance=Math.abs(dx);if(e.state==='idle')e.facing=Math.sign(dx)||-1;
   if(e.type==='slime'){
    if(e.state==='windup'&&e.timer<=0){e.state='lunge';e.timer=.33;e.vx=e.facing*330;}
    else if(e.state==='lunge'){e.x+=e.vx*dt;if(e.timer<=0){e.state='idle';e.timer=.9;}}
    else if(e.state==='idle'&&distance<520){if(distance>100)e.x+=e.facing*68*dt;else if(e.timer<=0){e.state='windup';e.timer=.55;}}
    if(e.state==='lunge'&&this.overlap(p,e))this.hurt(10,e.x);
   }else if(e.type==='spirit'){
    e.y=FLOOR-e.h-24+Math.sin(this.elapsed*2)*12;
    if(distance<640){if(e.state==='idle'&&e.timer<=0){e.state='windup';e.timer=.7;}else if(e.state==='windup'&&e.timer<=0){this.shoot(e,230);e.state='idle';e.timer=1.9;}}
   }else this.bossUpdate(e,dt,distance);
   e.x=clamp(e.x,50,3200);
  }
  this.enemies=this.enemies.filter(e=>e.hp>0);
  if(this.state!=='playing')return;
  if(this.enemies.length===0){
   if(this.wave===0){this.state='blessing';p.hp=Math.min(p.maxHp,p.hp+25);this.projectiles=[];this.zones=[];this.notice='命籤已現 · 選擇一份祝福';}
   else if(this.wave===1){this.wave=2;this.spawnWave(2);p.hp=Math.min(p.maxHp,p.hp+20);this.projectiles=[];}
   else {this.state='won';this.projectiles=[];this.zones=[];return;}
  }
  for(const b of this.projectiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life>0&&p.x<b.x+b.r&&p.x+p.w>b.x-b.r&&p.y<b.y+b.r&&p.y+p.h>b.y-b.r){this.hurt(9,b.x);b.life=0;}}
  this.projectiles=this.projectiles.filter(b=>b.life>0&&b.y<750&&b.x>-100&&b.x<3400);
  this.effects.forEach(e=>{e.life-=dt;e.y-=23*dt;});this.effects=this.effects.filter(e=>e.life>0);this.zones.forEach(z=>z.life-=dt);this.zones=this.zones.filter(z=>z.life>0);
  this.camera=clamp(p.x-420,0,2020);
 }
 overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
 shoot(e,speed,angleOffset=0){const p=this.player;const a=Math.atan2(p.y+p.h/2-e.y-e.h/2,p.x+p.w/2-e.x-e.w/2)+angleOffset;this.projectiles.push({x:e.x+e.w/2,y:e.y+e.h/2,r:10,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:5,hostile:true});}
 bossUpdate(e,dt,distance){
  const p=this.player;
  if(e.state==='idle'){
   if(distance>155)e.x+=e.facing*80*dt;
   if(e.timer<=0&&distance<600){e.attackCount++;e.state=e.hp<e.maxHp*.5&&e.attackCount%3===0?'volley':e.attackCount%2===0?'charge':'slam';e.timer=e.state==='charge'?1.15:.95;e.targetX=p.x; if(e.state==='slam')this.zones.push({x:e.targetX-95,w:230,life:.95,maxLife:.95});}
  }else if(e.state==='rush'){
   e.x+=e.facing*530*dt;if(this.overlap(p,e))this.hurt(16,e.x);if(e.timer<=0){e.state='idle';e.timer=1.3;}
  }else if(e.timer<=0){
   if(e.state==='slam'){if(p.x+p.w>e.targetX-95&&p.x<e.targetX+135&&p.y+p.h>FLOOR-45)this.hurt(18,e.targetX);this.effect(e.targetX,FLOOR-25,'震','#ffb28c');this.visual('slam',e.targetX+20,FLOOR-15,'#ffc2a1',.55);e.state='idle';e.timer=1.2;}
   else if(e.state==='charge'){e.state='rush';e.timer=.65;}
   else {[-.26,0,.26].forEach(a=>this.shoot(e,205,a));e.state='idle';e.timer=1.4;}
  }
 }
}
