import {COMBAT_FEEL} from './tuning.js';
// Optional one-way platforms. The continuous ground route never requires a jump.
export const TERRAIN_TUNING=Object.freeze({floor:585,gravity:1450,jumpSpeed:555,secretMoney:12});
export const TERRAIN_LAYOUTS=Object.freeze([
 {name:'竹梢石徑',platforms:[{x:300,y:521,w:180},{x:490,y:457,w:190}],secretX:590},
 {name:'月門竹台',platforms:[{x:330,y:521,w:180},{x:530,y:457,w:180},{x:730,y:521,w:150}],secretX:620}
]);
export function initTerrain(g,choice){
 const r=g.run;if(!r)return;r.terrain=null;
 if(!g.terrainV6||r.type!=='combat'||r.floor===0)return;
 const layout=TERRAIN_LAYOUTS[(r.seed+r.floor+(choice?.variant||0))%TERRAIN_LAYOUTS.length];
 r.terrain={roomId:r.roomId,name:layout.name,platforms:layout.platforms.map(p=>({...p})),secret:{x:layout.secretX,y:457,collected:false},ready:false};
 g.notice+=` · ${layout.name}（竹台可穿底跳上）`;
}
const platforms=g=>g.run?.terrain?.platforms||[];
const across=(p,s)=>p.x+p.w>s.x&&p.x<s.x+s.w;
export function supportY(g){const p=g.player;return platforms(g).find(s=>across(p,s)&&Math.abs(p.y+p.h-s.y)<.15)?.y??TERRAIN_TUNING.floor;}
export function grounded(g){const p=g.player;return p.vy>=0&&Math.abs(p.y+p.h-supportY(g))<.15;}
export function moveVertical(g,dt){
 const p=g.player,oldFeet=p.y+p.h,wasGrounded=grounded(g);
 p.vy+=TERRAIN_TUNING.gravity*dt;const nextFeet=oldFeet+p.vy*dt;
 const crossed=platforms(g).filter(s=>across(p,s)&&oldFeet<=s.y+.15&&nextFeet>=s.y&&p.vy>=0).map(s=>s.y);
 const floor=TERRAIN_TUNING.floor,landing=p.vy>=0?Math.min(floor,...crossed):null;
 if(landing!==null&&nextFeet>=landing){const speed=p.vy;p.y=landing-p.h;p.vy=0;p.groundY=landing;
  if(g.combatV3&&!wasGrounded&&speed>80){p.landingTime=COMBAT_FEEL.landingPose;g.visual('land',p.x+p.w/2,landing-3,'#c5d6ab',COMBAT_FEEL.landingEffect);}
 }else{p.y=nextFeet-p.h;p.groundY=Math.min(floor,...platforms(g).filter(s=>across(p,s)&&s.y>=nextFeet).map(s=>s.y));}
}
export function collectSecret(g){
 const t=g.run?.terrain,p=g.player;if(g.state!=='playing'||!t||t.secret.collected||t.roomId!==g.run.roomId)return false;
 const s=t.secret;if(Math.abs(p.x+p.w/2-s.x)>35||Math.abs(p.y+p.h-s.y)>3||p.vy!==0)return false;
 s.collected=true;g.run.secretsFound=(g.run.secretsFound||0)+1;const old=g.money;g.money=Math.min(999,g.money+TERRAIN_TUNING.secretMoney);
 g.visual('blessing',s.x,s.y-25,'#f5dc9b',.8);g.effect(s.x,s.y-50,`符匣 +${g.money-old} 靈錢`);g.notice='竹影藏籤 · 符匣已尋得（本房一次）';return true;
}
export function prepareExploration(g){
 const t=g.run?.terrain;if(!t||t.ready||g.enemies.some(e=>e.hp>0))return false;t.ready=true;
 g.projectiles=[];g.zones=[];g.spellFields=[];g.evolutionFields=[];g.skillZones=[];
 const p=g.player;p.castTime=0;p.attackTime=0;p.stun=0;p.knockbackTimer=0;
 p.statuses=(p.statuses||[]).filter(s=>['shield','unstoppable'].includes(s.id));
 g.notice=t.secret.collected?'妖靈已淨 · 可直接選擇下一房':'妖靈已淨 · 竹台上藏有符匣，也可直接離開';return true;
}
export function canLeaveExploration(g){const t=g.run?.terrain;return g.state==='playing'&&!!t?.ready&&t.roomId===g.run.roomId&&!g.enemies.some(e=>e.hp>0);}
