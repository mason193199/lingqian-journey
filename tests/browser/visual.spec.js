import {test,expect} from '@playwright/test';

async function start(page){await page.goto('/?test');await page.locator('[data-command=start]').click();}

test('keyboard attack creates real hit particles, short white flash and readable damage',async({page})=>{
 await start(page);
 await page.evaluate(()=>{const g=window.__game;g.enemies=[];g.spawn('slime',g.player.x+70);g.enemies[0].timer=999;});
 await page.keyboard.press('j');
 await expect.poll(()=>page.evaluate(()=>window.__game.enemies[0]?.hp)).toBe(20);
 expect(await page.evaluate(()=>window.__game.effects.some(e=>e.text==='22'))).toBe(true);
 const result=await page.evaluate(()=>{const g=window.__game,e=g.enemies[0];g.damageEnemy(e,1);return {flash:e.hitFlash,hit:g.vfx.some(v=>v.kind==='hit'),hp:e.hp};});
 expect(result).toEqual({flash:.13,hit:true,hp:18.82});
 await expect.poll(()=>page.evaluate(()=>window.__game.enemies[0]?.hitFlash)).toBe(0);
});

test('keyboard dash emits bounded cosmetic trail without changing cooldown',async({page})=>{
 await start(page);await page.keyboard.press('k');
 await expect.poll(()=>page.evaluate(()=>window.__game.vfx.some(v=>v.kind==='dash'))).toBe(true);
 expect(await page.evaluate(()=>window.__game.player.dashCooldown)).toBe(.9);
 await expect.poll(()=>page.evaluate(()=>window.__game.vfx.filter(v=>v.kind==='dash').length)).toBe(0);
});

test('blessing selection confirms visibly, expires and retains the chosen ability',async({page})=>{
 await start(page);await page.evaluate(()=>{const g=window.__game;g.enemies.forEach(e=>g.damageEnemy(e,e.hp));g.update(.016);});
 await page.locator('[data-blessing=fire]').click();
 await expect(page.locator('.blessing-confirm')).toContainText('離火靈符');
 expect(await page.evaluate(()=>window.__game.player.damage)).toBeCloseTo(30.8);
 expect(await page.evaluate(()=>window.__game.vfx.some(v=>v.kind==='blessing'))).toBe(true);
 await expect(page.locator('.blessing-confirm')).toHaveCount(0,{timeout:3000});
});

test('boss purification plays before summary while victory and hazard clearing are immediate',async({page})=>{
 await start(page);
 const result=await page.evaluate(()=>{const g=window.__game;g.enemies=[];g.wave=2;g.spawnWave(2);g.damageEnemy(g.enemies[0],999);g.update(.016);return {state:g.state,burst:g.vfx.some(v=>v.kind==='boss-defeat'),hazards:g.projectiles.length+g.zones.length};});
 expect(result).toEqual({state:'won',burst:true,hazards:0});
 await expect(page.locator('#overlay')).toBeHidden();
 await expect(page.getByText('霧散，星燈重明')).toBeVisible({timeout:4000});
 await expect.poll(()=>page.evaluate(()=>window.__game.vfx.length),{timeout:4000}).toBe(0);
});

test('pixel mobile UI fits landscape, keeps controls usable and honors reduced motion',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();
 await start(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(844);
 expect(await page.locator('#game').evaluate(e=>getComputedStyle(e).imageRendering)).toMatch(/pixelated|crisp-edges/);
 await page.locator('[data-action=jump]').tap();
 await expect.poll(()=>page.evaluate(()=>window.__game.player.y)).toBeLessThan(520);
 await page.evaluate(()=>{const g=window.__game;g.enemies.forEach(e=>g.damageEnemy(e,e.hp));g.update(.016);});
 expect(await page.locator('.blessing-panel').evaluate(e=>getComputedStyle(e,'::after').animationName)).toBe('none');
 await page.locator('[data-blessing=wind]').tap();
 await expect(page.locator('.blessing-confirm')).toBeVisible();
 expect(await page.locator('.blessing-confirm').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
 await context.close();
});
