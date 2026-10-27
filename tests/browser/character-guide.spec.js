import {test,expect} from '@playwright/test';
test('six actual pixel portraits and complete role guides are available on landscape phones',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/?test');await page.evaluate(()=>{const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});
 await expect(page.locator('.character-portrait')).toHaveCount(6);
 const portraits=await page.locator('.character-portrait').evaluateAll(cs=>cs.map(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data).join(',')));
 expect(new Set(portraits).size).toBe(6);
 for(const id of ['aqian','qingyue','hongling','xinglian','baili','xuanmo']){await page.click(`[data-character=${id}]`);await expect(page.locator('.traveller-detail')).toContainText('被動');await expect(page.locator('.traveller-detail')).toContainText('主動');await expect(page.locator(`[data-character=${id}]`)).toContainText('推薦');}
 await page.reload();await page.evaluate(()=>{const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});await expect(page.locator('[data-character=xuanmo]')).toHaveAttribute('aria-pressed','true');await page.click('[data-command=start-run]');expect(await page.evaluate(()=>window.__game.character.id)).toBe('xuanmo');await context.close();
});
