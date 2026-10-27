import {test,expect} from '@playwright/test';
test('HUD stays within visual viewport offsets, cutouts and collapsing browser chrome',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
 await context.addInitScript(()=>{const v=new EventTarget();Object.assign(v,{width:720,height:330,offsetLeft:30,offsetTop:20,scale:1});Object.defineProperty(window,'visualViewport',{value:v,configurable:true});window.__visible=v;});
 const page=await context.newPage();await page.goto('/?test');await page.evaluate(()=>{const s=document.documentElement.style;s.setProperty('--safe-left','44px');s.setProperty('--safe-right','34px');s.setProperty('--safe-top','8px');s.setProperty('--safe-bottom','12px');});await page.click('[data-command=start]');
 async function bounds(rect){for(const selector of ['#health','#fullscreen','[data-action=left]','[data-action=right]','[data-action=dash]','[data-action=attack]']){const b=await page.locator(selector).boundingBox();expect(b,selector).not.toBeNull();expect(b.x,selector).toBeGreaterThanOrEqual(rect.left);expect(b.x+b.width,selector).toBeLessThanOrEqual(rect.right);expect(b.y,selector).toBeGreaterThanOrEqual(rect.top);expect(b.y+b.height,selector).toBeLessThanOrEqual(rect.bottom);}}
 await bounds({left:74,right:716,top:28,bottom:338});
 await page.evaluate(()=>{Object.assign(window.__visible,{width:680,height:290,offsetLeft:12,offsetTop:40});window.__visible.dispatchEvent(new Event('resize'));});await page.waitForTimeout(80);await bounds({left:56,right:658,top:48,bottom:318});
 await page.evaluate(()=>window.__game.hurt(10,0));await bounds({left:56,right:658,top:48,bottom:318});await context.close();
});
