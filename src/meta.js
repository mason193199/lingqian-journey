// Versioned, bounded, local-only progression. Storage failures never block play.
export const STORAGE_KEY='lingqian-journey.meta.v2';
const BACKUP_KEY=STORAGE_KEY+'.backup';
const WEAPON_IDS=['sword','talisman','staff'];
export const CHARACTER_IDS=['aqian','qingyue','hongling','xinglian','baili','xuanmo'];
export const UPGRADE_INFO={
 life:{name:'生命修行',description:'每級初始生命 +4，最多 +20。',cap:5,baseCost:6,costStep:4},
 spirit:{name:'靈力修行',description:'每級靈力上限 +10，最多 +30。',cap:3,baseCost:8,costStep:5},
 mastery:{name:'武器精通',description:'指定武器基礎傷害每級 +3%，最多 +9%。',cap:3,baseCost:8,costStep:6},
 fate:{name:'命格',description:'解鎖開局護盾／短暫霸體二選一，不疊加。',cap:1,baseCost:12,costStep:0},
 relic:{name:'法器欄',description:'解鎖靈息（靈力 +10）／青玉（生命 +4）二選一。',cap:1,baseCost:16,costStep:0}
};
for(const info of Object.values(UPGRADE_INFO))info.max=info.cap;
const fresh=()=>({version:2,jade:0,unlockedWeapons:[...WEAPON_IDS],selectedWeapon:'sword',unlockedCharacters:[...CHARACTER_IDS],selectedCharacter:'aqian',talentUnlocks:Object.fromEntries(CHARACTER_IDS.map(id=>[id,{a:0,b:0}])),selectedBranches:Object.fromEntries(CHARACTER_IDS.map(id=>[id,'none'])),upgrades:{life:0,spirit:0,fate:0,relic:0},mastery:{sword:0,talisman:0,staff:0},settings:{sound:false,reducedMotion:false},loadout:{fate:'none',relic:'none'},firstWin:false,settledRuns:[]});
const integer=(n,min,max)=>Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):min;
function sanitize(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||!('jade'in value))return null;
 if(value.version!=null&&![1,2].includes(value.version))return null;
 const out=fresh();out.jade=integer(value.jade,0,1000000);
 // All three starting weapons remain available; future unlock ids are never trusted.
 out.selectedWeapon=WEAPON_IDS.includes(value.selectedWeapon)?value.selectedWeapon:'sword';
 out.selectedCharacter=CHARACTER_IDS.includes(value.selectedCharacter)?value.selectedCharacter:'aqian';
 for(const character of CHARACTER_IDS){for(const branch of ['a','b'])out.talentUnlocks[character][branch]=integer(value.talentUnlocks?.[character]?.[branch],0,2);const selected=value.selectedBranches?.[character];if(['a','b'].includes(selected)&&out.talentUnlocks[character][selected]>0)out.selectedBranches[character]=selected;}
 for(const id of ['life','spirit','fate','relic'])out.upgrades[id]=integer(value.upgrades?.[id],0,UPGRADE_INFO[id].cap);
 for(const id of WEAPON_IDS)out.mastery[id]=integer(value.mastery?.[id],0,3);
 for(const id of ['sound','reducedMotion'])out.settings[id]=value.settings?.[id]===true;
 out.firstWin=value.firstWin===true;
 out.settledRuns=Array.isArray(value.settledRuns)?[...new Set(value.settledRuns.filter(id=>typeof id==='string'&&id.length>0&&id.length<=120))].slice(-20):[];
 if(out.upgrades.fate&&['shield','unstoppable'].includes(value.loadout?.fate))out.loadout.fate=value.loadout.fate;
 if(out.upgrades.relic&&['energy','vitality'].includes(value.loadout?.relic))out.loadout.relic=value.loadout.relic;
 return out;
}
function parse(text){try{return sanitize(JSON.parse(text));}catch{return null;}}
function defaultStorage(){try{return globalThis.localStorage||null;}catch{return null;}}
export class MetaStore{
 constructor(storage=defaultStorage()){
  this.storage=storage;this.persistent=!!storage;this.warning='';this.data=fresh();
  if(!storage){this.warning='瀏覽器未提供本地儲存，局外進度暫存於本頁。';return;}
  try{
   const current=storage.getItem(STORAGE_KEY),backup=storage.getItem(BACKUP_KEY);
   const restored=parse(current)||parse(backup)||parse(storage.getItem('lingqian-journey.meta'));
   if(restored)this.data=restored;
   if(current&&!parse(current)&&restored)this.warning='已從備份復原局外進度。';
   else if(current&&!restored)this.warning='存檔格式損壞，已建立新的本地進度。';
  }catch{this.persistent=false;this.warning='本地存檔讀取受限，局外進度暫存於本頁。';}
 }
 get storageAvailable(){return this.persistent;}
 save(){
  if(!this.storage){this.persistent=false;return false;}
  try{const text=JSON.stringify(this.data);this.storage.setItem(STORAGE_KEY,text);this.storage.setItem(BACKUP_KEY,text);this.persistent=true;return true;}
  catch{this.persistent=false;this.warning='本地存檔無法寫入；請勿關閉本頁，以免遺失新進度。';return false;}
 }
 selectCharacter(id){if(!CHARACTER_IDS.includes(id)||!this.data.unlockedCharacters.includes(id))return false;this.data.selectedCharacter=id;this.save();return true;}
 talentCost(character,branch){if(!CHARACTER_IDS.includes(character)||!['a','b'].includes(branch))return null;const level=this.data.talentUnlocks[character][branch];return level===0?8:level===1?14:null;}
 buyTalent(character,branch){const cost=this.talentCost(character,branch);if(cost==null||this.data.jade<cost)return false;this.data.jade-=cost;this.data.talentUnlocks[character][branch]++;this.save();return true;}
 selectBranch(character,branch){if(!CHARACTER_IDS.includes(character)||!['none','a','b'].includes(branch))return false;if(branch!=='none'&&!this.data.talentUnlocks[character][branch])return false;this.data.selectedBranches[character]=branch;this.save();return true;}
 selectWeapon(id){if(!this.data.unlockedWeapons.includes(id))return false;this.data.selectedWeapon=id;this.save();return true;}
 cost(type,weapon=this.data.selectedWeapon){const info=UPGRADE_INFO[type];if(!info)return null;const level=type==='mastery'?this.data.mastery[weapon]:this.data.upgrades[type];if(!Number.isInteger(level)||level>=info.cap)return null;return info.baseCost+level*info.costStep;}
 purchase(type,weapon=this.data.selectedWeapon){const cost=this.cost(type,weapon);if(cost==null||this.data.jade<cost)return false;this.data.jade-=cost;if(type==='mastery')this.data.mastery[weapon]++;else this.data.upgrades[type]++;this.save();return true;}
 setLoadout(fate='none',relic='none'){
  if(!['none','shield','unstoppable'].includes(fate)||!['none','energy','vitality'].includes(relic))return false;
  if(fate!=='none'&&!this.data.upgrades.fate||relic!=='none'&&!this.data.upgrades.relic)return false;
  this.data.loadout={fate,relic};this.save();return true;
 }
 setSetting(name,value){if(!['sound','reducedMotion'].includes(name)||typeof value!=='boolean')return false;this.data.settings[name]=value;this.save();return true;}
 settleRun({id,kills=0,won=false}={}){
  if(typeof id!=='string'||id.length===0||id.length>120||this.data.settledRuns.includes(id))return 0;
  const victory=won===true;const reward=integer(kills,0,1000)*2+(victory?10:0)+(victory&&!this.data.firstWin?10:0);
  this.data.jade=integer(this.data.jade+reward,0,1000000);if(victory)this.data.firstWin=true;
  this.data.settledRuns=[...this.data.settledRuns,id].slice(-20);this.save();return reward;
 }
 runOptions(){const d=this.data;const branch=d.selectedBranches[d.selectedCharacter];const talent=branch==='a'||branch==='b'?{branch,level:d.talentUnlocks[d.selectedCharacter][branch]}:null;return {character:d.selectedCharacter,talent,weapon:d.selectedWeapon,maxHpBonus:d.upgrades.life*4+(d.loadout.relic==='vitality'?4:0),damageBonus:d.mastery[d.selectedWeapon]*.03,energyBonus:d.upgrades.spirit*10+(d.loadout.relic==='energy'?10:0),startingStatus:d.loadout.fate==='none'?null:d.loadout.fate};}
}
