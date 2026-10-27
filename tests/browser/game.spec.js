import {test,expect} from '@playwright/test';
test('desktop renders, keyboard moves/jumps/attacks/dashes, pause and restart',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?test');await expect(page.getByRole('button',{name:'啟程入林'})).toBeVisible();await page.screenshot({path:'test-results/title-desktop.png'});await page.click('[data-command=start]');
 const start=await page.evaluate(()=>window.__game.player.x);await page.keyboard.down('d');await page.waitForTimeout(350);await page.keyboard.up('d');expect(await page.evaluate(()=>window.__game.player.x)).toBeGreaterThan(start+40);
 await page.keyboard.press('Space');await page.waitForTimeout(100);expect(await page.evaluate(()=>window.__game.player.y)).toBeLessThan(520);await page.keyboard.down('j');await page.waitForTimeout(60);expect(await page.evaluate(()=>window.__game.player.attackCd)).toBeGreaterThan(0);await page.keyboard.up('j');await page.keyboard.press('k');await page.waitForTimeout(30);await expect.poll(()=>page.evaluate(()=>window.__game.player.dashCd)).toBeGreaterThan(0);
 await page.keyboard.press('Escape');await expect(page.getByText('歇一歇，再出發')).toBeVisible();await page.click('[data-command=restart]');expect(await page.evaluate(()=>window.__game.player.hp)).toBe(100);expect(errors).toEqual([]);
});
test('complete chapter with ordinary controls and all three real blessings',async({page})=>{
 await page.goto('/?test');await page.click('[data-command=start]');
 for(const blessing of ['fire','wood','wind']){
  const result=await page.evaluate((choice)=>{
   const g=window.__game;g.reset();let sawTelegraph=false,sawRanged=false,chosen=false;
   for(let i=0;i<18000&&g.state!=='won'&&g.state!=='dead';i++){
    if(g.state==='blessing'){g.choose(choice);chosen=true;}
    const e=g.enemies.find(e=>e.hp>0);if(!e)continue;sawRanged ||=e.type==='spirit';sawTelegraph ||=e.type==='boss'&&e.state!=='idle';
    const dx=e.x+e.w/2-(g.player.x+g.player.w/2);const danger=e.type==='boss'&&['slam','volley'].includes(e.state)&&e.timer<.35;
    g.update(1/60,{left:dx< -62,right:dx>62,attack:true,jump:danger,dash:e.type==='boss'&&e.state==='charge'&&e.timer<.15});
   }
   return {state:g.state,hp:g.player.hp,kills:g.kills,chosen,sawRanged,sawTelegraph,blessing:g.blessing};
  },blessing);
  expect(result.state).toBe('won');expect(result.hp).toBeGreaterThan(0);expect(result.kills).toBe(6);expect(result.chosen&&result.sawRanged&&result.sawTelegraph).toBe(true);expect(result.blessing).toBe(blessing);
 }
 await expect(page.getByText('霧散，星燈重明')).toBeVisible();await page.screenshot({path:'test-results/victory-desktop.png'});
});
test('blessing UI works and death screen restarts cleanly',async({page})=>{
 await page.goto('/?test');await page.click('[data-command=start]');await page.evaluate(()=>{const g=window.__game;g.enemies.forEach(e=>g.damageEnemy(e,e.hp));g.update(.016);});await expect(page.locator('[data-blessing]')).toHaveCount(3);await page.screenshot({path:'test-results/blessings-desktop.png'});await page.click('[data-blessing=wood]');expect(await page.evaluate(()=>window.__game.player.maxHp)).toBe(130);
 await page.evaluate(()=>window.__game.hurt(999,0));await expect(page.getByText('此籤未盡，且再啟程')).toBeVisible();await page.click('[data-command=restart]');expect(await page.evaluate(()=>[window.__game.player.maxHp,window.__game.blessing,window.__game.wave])).toEqual([100,null,0]);
});
test('landscape phone supports simultaneous movement and attack plus jump and dash',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/?test');await page.click('[data-command=start]');await expect(page.locator('[data-action=right]')).toBeVisible();
 const cdp=await context.newCDPSession(page);const right=await page.locator('[data-action=right]').boundingBox(),attack=await page.locator('[data-action=attack]').boundingBox();const points=[right,attack].map((r,id)=>({x:r.x+r.width/2,y:r.y+r.height/2,id}));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await page.waitForTimeout(300);expect(await page.evaluate(()=>window.__game.player.x)).toBeGreaterThan(140);expect(await page.evaluate(()=>window.__game.player.attackCd)).toBeGreaterThan(0);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.locator('[data-action=jump]').tap();await page.waitForTimeout(100);expect(await page.evaluate(()=>window.__game.player.y)).toBeLessThan(520);await page.locator('[data-action=dash]').tap();await expect.poll(()=>page.evaluate(()=>window.__game.player.dashCd)).toBeGreaterThan(0);await page.screenshot({path:'test-results/game-mobile.png'});
 await page.evaluate(()=>{const g=window.__game;g.enemies.forEach(e=>g.damageEnemy(e,e.hp));g.update(.016);});await expect(page.locator('[data-blessing=wind]')).toBeVisible();const bounds=await page.locator('[data-blessing=wind]').boundingBox();expect(bounds.y).toBeGreaterThanOrEqual(0);expect(bounds.y+bounds.height).toBeLessThanOrEqual(390);await page.screenshot({path:'test-results/blessings-mobile.png'});await page.locator('[data-blessing=wind]').tap();expect(await page.evaluate(()=>window.__game.blessing)).toBe('wind');await context.close();
});
test('a full run through real keyboard events reaches victory without changing game state',async({page})=>{
 test.setTimeout(90000);await page.goto('/?test');await page.click('[data-command=start]');await page.keyboard.down('j');let moving='',jumping=false,dashing=false;
 for(let i=0;i<1100;i++){
  const s=await page.evaluate(()=>{const g=window.__game,e=g.enemies.find(e=>e.hp>0);return {state:g.state,dx:e?e.x+e.w/2-g.player.x-g.player.w/2:0,type:e?.type,attack:e?.state,timer:e?.timer,hp:g.player.hp};});
  if(s.state==='won')break;if(s.state==='dead')throw new Error('Keyboard run died');
  if(s.state==='blessing'){await page.click('[data-blessing=fire]');await page.keyboard.down('j');continue;}
  const next=s.dx>62?'d':s.dx< -62?'a':'';if(next!==moving){if(moving)await page.keyboard.up(moving);if(next)await page.keyboard.down(next);moving=next;}
  const jump=s.type==='boss'&&['slam','volley'].includes(s.attack)&&s.timer<.35;
  if(jump&&!jumping)await page.keyboard.down('Space');if(!jump&&jumping)await page.keyboard.up('Space');jumping=jump;
  const dash=s.type==='boss'&&s.attack==='charge'&&s.timer<.15;if(dash&&!dashing)await page.keyboard.down('k');if(!dash&&dashing)await page.keyboard.up('k');dashing=dash;
  await page.waitForTimeout(50);
 }
 await expect(page.getByText('霧散，星燈重明')).toBeVisible();await page.screenshot({path:'test-results/keyboard-victory.png'});
});
test('portrait layout fits screen and losing focus pauses safely',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/?test');await page.click('[data-command=start]');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.getByText('歇一歇，再出發')).toBeVisible();await page.click('[data-command=resume]');expect(await page.evaluate(()=>window.__game.state)).toBe('playing');await context.close();
});
