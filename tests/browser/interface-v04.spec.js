import {test,expect} from '@playwright/test';
test('bounded desktop canvas and external information tabs at laptop,HD,QHD,4K,ultrawide',async({page})=>{
 for(const [width,height]of [[1080,720],[1920,1080],[2560,1440],[3840,2160],[3440,1440]]){
  await page.setViewportSize({width,height});await page.goto('/?test');await page.click('[data-command=start]');
  const r=await page.locator('#game').boundingBox();expect(r.width).toBeLessThanOrEqual(1280);expect(r.x).toBeGreaterThan(0);expect(r.x+r.width).toBeLessThanOrEqual(width);
  expect(await page.locator('.desktop-left #health').count()).toBe(1);await page.locator('.desktop-right [data-info-tab=relic]').click();await expect(page.locator('.desktop-right .info-content')).toContainText('同行法器');await page.locator('.desktop-right [data-info-tab=journey]').click();await expect(page.locator('.desktop-right .info-content')).toContainText('靈霧竹林');
 }
});
test('phone gestures stay scoped; multiple fingers, sliding off and cancellation never stick',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto('/?test');await page.click('[data-command=start]');
 const result=await page.evaluate(()=>{const b=document.querySelector('[data-action=right]'),r=b.getBoundingClientRect();const send=(type,id,x=r.x+10,y=r.y+10)=>b.dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,clientY:y,bubbles:true,cancelable:true}));send('pointerdown',21);send('pointerdown',22);send('pointerup',21);const retained=b.classList.contains('pressed');send('pointermove',22,0,0);const released=!b.classList.contains('pressed');send('pointerdown',23);send('pointercancel',23);const cancelled=!b.classList.contains('pressed');const blocked=['dblclick','contextmenu','selectstart','dragstart'].every(type=>!b.dispatchEvent(new Event(type,{bubbles:true,cancelable:true})));const outside=document.querySelector('.brand').dispatchEvent(new Event('contextmenu',{bubbles:true,cancelable:true}));return {retained,released,cancelled,blocked,outside,selection:getComputedStyle(b).userSelect,scale:document.querySelector('meta[name=viewport]').content};});
 expect(result).toMatchObject({retained:true,released:true,cancelled:true,blocked:true,outside:true,selection:'none'});expect(result.scale).not.toContain('maximum-scale');
 await page.locator('.mobile-inspect').tap();await expect(page.locator('#overlay .info-detail')).toBeVisible();await context.close();
});
test('releasing a keyboard alias does not release the other held key',async({page})=>{await page.goto('/?test');await page.click('[data-command=start]');await page.keyboard.down('d');await page.keyboard.down('ArrowRight');await page.keyboard.up('d');const before=await page.evaluate(()=>window.__game.player.x);await page.waitForTimeout(130);expect(await page.evaluate(()=>window.__game.player.x)).toBeGreaterThan(before+15);await page.keyboard.up('ArrowRight');});
