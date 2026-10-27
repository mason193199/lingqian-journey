import {test,expect} from '@playwright/test';
const SAVE='lingqian-journey.meta.v2';
async function preparation(page){
 await page.goto('/?test');
 await page.evaluate(()=>{const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});
 await expect(page.locator('.prep-panel')).toBeVisible();
}

test('normal title opens preparation, weapon selection and upgrades persist after refresh',async({page})=>{
 await page.goto('/');await page.locator('[data-command=start]').click();await expect(page.locator('.prep-panel')).toBeVisible();
 await page.locator('[data-hub-tab=weapons]').click();await page.locator('[data-weapon=staff]').click();
 await page.evaluate(key=>{const d=JSON.parse(localStorage.getItem(key));d.jade=100;localStorage.setItem(key,JSON.stringify(d));},SAVE);
 await page.reload();await page.locator('[data-command=start]').click();await page.locator('[data-hub-tab=training]').click();await page.locator('[data-upgrade=life]').click();
 let saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE);expect(saved.selectedWeapon).toBe('staff');expect(saved.upgrades.life).toBe(1);expect(saved.jade).toBeLessThan(100);
 await page.reload();await page.locator('[data-command=start]').click();await page.locator('[data-hub-tab=weapons]').click();await expect(page.locator('[data-weapon=staff]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-command=start-run]').click();await expect(page.locator('#weaponhud')).toContainText('靈杖');await expect(page.locator('#health')).toContainText('104');
});

test('all three prepared weapons become real equipment with distinct attack behavior',async({page})=>{
 for(const weapon of ['sword','talisman','staff']){
  await preparation(page);await page.locator('[data-hub-tab=weapons]').click();await page.locator(`[data-weapon=${weapon}]`).click();await page.locator('[data-command=start-run]').click();
  expect(await page.evaluate(()=>window.__game.player.weapon)).toBe(weapon);
  await page.evaluate(()=>{const g=window.__game;g.enemies.forEach(e=>e.x=900);});
  await page.keyboard.press('j');
  await expect.poll(()=>page.evaluate(()=>window.__game.player.attackCount||0)).toBeGreaterThan(0);
  const result=await page.evaluate(()=>{const g=window.__game;return {weapon:g.player.weapon,projectiles:g.projectiles.filter(b=>!b.hostile).map(b=>b.weapon),energy:g.player.energy};});
  if(weapon==='sword')expect(result.projectiles).toEqual([]);else expect(result.projectiles).toContain(weapon);
  if(weapon==='staff')expect(result.energy).toBeLessThan(100);
 }
});

test('portrait mobile shows rotation gate; landscape adapts to common phone and tablet sizes',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/');
 await expect(page.locator('#rotate-prompt')).toBeVisible();await expect(page.locator('[data-command=start]')).toBeHidden();
 for(const size of [{width:844,height:390},{width:740,height:360},{width:915,height:412},{width:1024,height:600}]){
  await page.setViewportSize(size);await expect(page.locator('#rotate-prompt')).toBeHidden();
  await expect.poll(async()=>Math.round((await page.locator('.game-shell').boundingBox()).width)).toBe(size.width);await expect.poll(async()=>Math.round((await page.locator('.game-shell').boundingBox()).height)).toBe(size.height);
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});
  await page.locator('[data-command=start-run]').click();
  for(const selector of ['[data-action=left]','[data-action=right]','[data-action=attack]','[data-action=dash]','#fullscreen']){
   const box=await page.locator(selector).boundingBox();expect(box).not.toBeNull();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(size.width+1);expect(box.y+box.height).toBeLessThanOrEqual(size.height+1);
  }
  await page.locator('[data-action=attack]').tap();
 }
 await context.close();
});

test('desktop 16:9 and ultrawide keep HUD and game inside viewport',async({page})=>{
 for(const size of [{width:1440,height:810},{width:2560,height:1080}]){
  await page.setViewportSize(size);await page.goto('/');await expect(page.locator('#rotate-prompt')).toBeHidden();await page.locator('[data-command=start]').click();await page.locator('[data-command=start-run]').click();
  const bounds=await page.locator('.game-shell').boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(size.width);for(const id of ['#health','#weaponhud','#fullscreen']){const b=await page.locator(id).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(size.width);}
 }
});

test('unsupported fullscreen and orientation lock preserve a playable fallback',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 await context.addInitScript(()=>{Object.defineProperty(Element.prototype,'requestFullscreen',{configurable:true,value:undefined});if(screen.orientation)Object.defineProperty(screen.orientation,'lock',{configurable:true,value:async()=>{throw new Error('Unsupported');}});});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('[data-command=start]').click();await page.locator('[data-command=start-run]').click();await page.locator('#fullscreen').tap();await expect(page.locator('#viewport-message')).toBeVisible();await page.locator('[data-action=jump]').tap();expect(errors).toEqual([]);await context.close();
});

test('a real ended run settles jade once and keeps it after refresh',async({page})=>{
 await page.goto('/?test');await page.click('[data-command=start]');
 await page.evaluate(()=>{const g=window.__game;g.damageEnemy(g.enemies[0],999);g.hurt(999,0);});
 await expect.poll(()=>page.evaluate(()=>window.__meta.data.jade)).toBe(2);
 await expect(page.locator('.resource-line')).toContainText('本局獲得 2 靈玉');
 await page.reload();expect(await page.evaluate(()=>window.__meta.data.jade)).toBe(2);
 await page.waitForTimeout(100);expect(await page.evaluate(()=>window.__meta.data.jade)).toBe(2);
});
