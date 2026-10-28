// Single-room, explicitly accepted risks. No permanent stats/save mutations.
import {offerRelics} from './relics.js';
export const TRIALS=Object.freeze({
 thunder:Object.freeze({name:'五雷試心',icon:'雷',risk:'每4秒標記腳下；0.95秒後落雷。移出雷區、跳高或衝刺避開。',reward:'額外18靈錢＋稀有法器三選一',money:18,quality:1}),
 seal:Object.freeze({name:'封靈試心',icon:'封',risk:'起手4秒無法施放天賦；僅本房自然靈力恢復降為35%、天賦技能冷卻恢復降為60%。',reward:'額外10靈錢＋珍奇法器三選一',money:10,quality:2})
});
export const TRIAL_TUNING=Object.freeze({interval:4,warmup:2,warning:.95,width:112,height:110,damage:12,energyFactor:.35,skillFactor:.6,skillSeal:4,fallbackMoney:12});
export function openTrial(g){g.run.trial={roomId:g.run.roomId,phase:'offered',id:null,timer:TRIAL_TUNING.warmup,warning:null};g.run.revision++;g.state='trial-offer';}
export function decideTrial(g,action){const t=g.run?.trial;if(g.state!=='trial-offer'||t?.phase!=='offered'||t.roomId!==g.run.roomId)return false;if(typeof action!=='string')return false;const id=action.startsWith('trial-')?action.slice(6):'';if(id!=='decline'&&!Object.hasOwn(TRIALS,id))return false;t.id=id==='decline'?null:id;t.phase=t.id?'active':'declined';t.skillSeal=t.id==='seal'?TRIAL_TUNING.skillSeal:0;g.run.revision++;return true;}
export function activeTrial(g){const t=g.run?.trial;return t?.phase==='active'&&t.roomId===g.run.roomId?t:null;}
export function trialEnergyFactor(g){return activeTrial(g)?.id==='seal'?TRIAL_TUNING.energyFactor:1;}
export function trialSkillFactor(g){return activeTrial(g)?.id==='seal'?TRIAL_TUNING.skillFactor:1;}
export function trialSkillLock(g){return activeTrial(g)?.skillSeal||0;}
export function tickTrial(g,dt){const t=activeTrial(g);if(g.state!=='playing'||!t||!g.enemies.some(e=>e.hp>0))return;t.skillSeal=Math.max(0,(t.skillSeal||0)-dt);if(t.id!=='thunder')return;
 if(t.warning){t.warning.remaining-=dt;if(t.warning.remaining<=0){const x=t.warning.x,p=g.player;t.warning=null;t.timer=TRIAL_TUNING.interval-TRIAL_TUNING.warning;g.visual('lightning',x,585-60,'#e5caff',.45);if(p.x+p.w>x-TRIAL_TUNING.width/2&&p.x<x+TRIAL_TUNING.width/2&&p.y+p.h>585-TRIAL_TUNING.height)g.hurt(TRIAL_TUNING.damage,x);}return;}
 t.timer-=dt;if(t.timer<=0)t.warning={x:g.player.x+g.player.w/2,remaining:TRIAL_TUNING.warning};
}
// Called only after normal room rewards/routes are created. Mark first, then offer.
export function rewardTrial(g){const t=activeTrial(g);if(!t||g.state!=='route'||!g.run.cleared.includes(t.roomId))return false;const def=TRIALS[t.id];t.phase='completed';t.warning=null;g.run.trialsCompleted=(g.run.trialsCompleted||0)+1;g.money=Math.min(999,g.money+def.money);g.notice=`${def.name}完成 · ${def.reward}`;if(!offerRelics(g,def.quality,'route')){g.money=Math.min(999,g.money+TRIAL_TUNING.fallbackMoney);g.notice+='；法器已齊，改得12靈錢';}return true;}
export function trialLabel(g){const t=activeTrial(g);return t?`${TRIALS[t.id].name} · ${t.id==='seal'?`回靈35%${t.skillSeal>0?'／封技'+Math.ceil(t.skillSeal)+'秒':'／技能恢復60%'}`:t.warning?'雷區已標記！':'留意腳下雷印'}`:'';}
