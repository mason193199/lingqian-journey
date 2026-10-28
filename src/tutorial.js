// Read-only learning model: observes real gameplay; never advances game states,
// grants rewards, synthesizes inputs, or blocks combat while a hint is visible.
const STEPS = Object.freeze([
 {id:'move',title:'沿竹影前行',text:'A／D、方向鍵或左下按鍵移動，走出幾步。'},
 {id:'jump',title:'輕身一躍',text:'按 Space／W／↑ 或「躍」，實際跳離地面。'},
 {id:'attack',title:'讓武器說話',text:'按 J／Z 或攻擊鍵出招；可按住連續攻擊。'},
 {id:'dash',title:'穿過危險',text:'按 K／X／Shift 或「衝」，短暫無敵後會進入冷卻。'},
 {id:'skill',title:'旅人的天賦',text:'按 E／L 或天賦鍵施放專屬技能；冷卻時等一等。'}
]);
const CONTEXT = Object.freeze({
 blessing:{title:'一籤一種選擇',text:'命籤只影響本局；先看武器配方，再決定要成形或混搭。'},
 evolving:{title:'Build 成形了',text:'武器×五行×卦象已共鳴，攻擊方式會改變；讀完能力再繼續。'},
 'relic-choice':{title:'法器改變打法',text:'選一件與武器、角色或狀態呼應的法器；可在資訊頁查看協同。'},
 route:{title:'路線也是 Build 的一部分',text:'缺生命選恢復，缺組合找祭壇或法器；靈錢可留給靈商。'},
 preparing:{title:'靈籤觀等你歸來',text:'角色、武器、修行與命格各有分頁；靈玉會留下，局內力量會重置。'},
 dead:{title:'這一籤仍有收穫',text:'死亡也會結算靈玉與新發現；回觀調整配置，再試一次。'},
 won:{title:'記住這次的 Build',text:'結算卡與觀星台會記錄本局組合；下一局可換角色或武器試新打法。'}
});
const finite = (value,fallback=0)=>Number.isFinite(value)?value:fallback;
const snapshot = g=>{
 const p=g?.player||{};
 return {x:finite(p.x),feet:finite(p.y)+finite(p.h),attacks:finite(p.attackCount),skills:finite(p.skillCount),dashCd:finite(p.dashCd),dashTime:finite(p.dashTime)};
};

export class Tutorial {
 constructor({completed=false}={}) {
  this.completed=completed===true;
  this.active=false;
  this.done=new Set();
  this.seenContexts=new Set();
  this.currentContext=null;
  this.previousState=null;
  this.baseline=null;
  this.lastX=0;
  this.walkDistance=0;
 }
 start(g,{replay=false}={}) {
  if(this.completed&&!replay){this.active=false;return null;}
  if(replay){this.completed=false;this.done.clear();this.seenContexts.clear();}
  this.active=true;
  this.baseline=snapshot(g);
  this.lastX=this.baseline.x;this.jumpArmed=this.baseline.feet>=finite(g.player.groundY,585)-.1;
  this.walkDistance=0;
  this.previousState=null;
  this.currentContext=null;
  return this.update(g);
 }
 skip() {
  this.completed=true;
  this.active=false;
  this.currentContext=null;
  return null;
 }
 update(g,input) {
  if(!this.active||!g?.player||!this.baseline)return null;
  const p=g.player,state=g.state,base=this.baseline;
  const movement=Math.abs(finite(p.x)-this.lastX);this.lastX=finite(p.x);
  // Menus, input booleans and pre-existing cooldowns cannot complete lessons.
  if(state==='playing'){
   const movingInput=input==null||input.left===true||input.right===true;
   if(movingInput&&finite(p.stun)<=0&&finite(p.knockbackTimer)<=0&&finite(p.dashTime)<=0&&movement<=64)this.walkDistance+=movement;
   if(this.walkDistance>=28)this.done.add('move');
   const floor=finite(p.groundY,585);if(finite(p.y)+finite(p.h)>=floor-.1)this.jumpArmed=true;if(this.jumpArmed&&finite(p.y)+finite(p.h)<floor-12&&finite(p.vy)<0)this.done.add('jump');
   if(finite(p.attackCount)>base.attacks)this.done.add('attack');
   if(finite(p.dashTime)>base.dashTime||finite(p.dashCd)>base.dashCd)this.done.add('dash');
   if(finite(p.skillCount)>base.skills)this.done.add('skill');
   if(this.done.size===STEPS.length)this.completed=true;
  }
  // Keep a contextual explanation visible for its whole menu visit, but do not
  // replay it when the player returns to the same menu later in this session.
  if(state!==this.previousState){
   this.previousState=state;
   this.currentContext=null;
   if(CONTEXT[state]&&!this.seenContexts.has(state)){
    this.seenContexts.add(state);
    this.currentContext={id:'context-'+state,...CONTEXT[state]};
   }
  }
  const progress={current:this.done.size,total:STEPS.length};
  if(this.currentContext)return {...this.currentContext,progress,contextual:true};
  if(state!=='playing')return null;
  const step=STEPS.find(s=>!this.done.has(s.id));
  if(!step)return null;
  const text=step.id==='skill'&&g.character?.id==='xuanmo'
   ?'玄墨需先承傷積累煞氣，再按 E／L 或天賦鍵；也可略過教學。'
   :step.text;
  return {...step,text,progress,contextual:false};
 }
}

const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Optional small view helper. Root owns placement, styling and event delegation.
export function tutorialMarkup(hint){
 if(!hint)return '';
 return `<aside class="tutorial-hint" role="status" aria-live="polite"><span class="tutorial-progress">${finite(hint.progress?.current)}/${finite(hint.progress?.total,5)}</span><div><strong>${escapeHTML(hint.title)}</strong><p>${escapeHTML(hint.text)}</p></div><button type="button" data-command="tutorial-skip" aria-label="略過操作引導">略過</button></aside>`;
}
