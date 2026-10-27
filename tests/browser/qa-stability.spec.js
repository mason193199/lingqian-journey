import {test,expect} from '@playwright/test';
test('a quick dash during hit-stop is buffered until simulation resumes',async({page})=>{
 await page.goto('/?test');await page.click('[data-command=start]');
 await page.evaluate(()=>{window.__game.hitStop=.035;window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyK'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyK'}));});
 await expect.poll(()=>page.evaluate(()=>window.__game.player.dashCd)).toBeGreaterThan(0);
});
test('first Qingyue skill at a close target keeps the browser game running',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?test');await page.click('[data-command=start]');
 await page.evaluate(()=>{const g=window.__game;g.reset({character:'qingyue'});g.enemies=[];g.spawn('slime',330);g.enemies[0].hp=1000;g.enemies[0].timer=999;});
 await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.__game.player.skillCount)).toBe(1);await page.waitForTimeout(250);expect(errors).toEqual([]);expect(await page.evaluate(()=>window.__game.enemies[0].hp)).toBe(958);
});
test('hit-stop buffers jump, attack and skill, but pause cancels queued input',async({page})=>{
 for(const [code,field] of [['Space','vy'],['KeyJ','attackCount'],['KeyE','skillCount']]){
  await page.goto('/?test');await page.click('[data-command=start]');
  await page.evaluate(code=>{const g=window.__game;g.reset({character:'hongling'});g.hitStop=.035;window.dispatchEvent(new KeyboardEvent('keydown',{code}));window.dispatchEvent(new KeyboardEvent('keyup',{code}));},code);
  await expect.poll(()=>page.evaluate(field=>window.__game.player[field],field)).not.toBe(0);
 }
 await page.goto('/?test');await page.click('[data-command=start]');
 await page.evaluate(()=>{window.__game.hitStop=.035;window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyK'}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyK'}));window.dispatchEvent(new Event('blur'));});
 await expect(page.locator('[data-command=resume]')).toBeVisible();await page.click('[data-command=resume]');await page.waitForTimeout(150);expect(await page.evaluate(()=>window.__game.player.dashCd)).toBe(0);
});
