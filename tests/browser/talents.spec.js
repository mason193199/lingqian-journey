import {test,expect} from '@playwright/test';
test('character talent purchases, exclusive branch and effects survive reload',async({page})=>{
 await page.goto('/?test');await page.evaluate(()=>{window.__meta.data.jade=100;window.__meta.save();const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});
 await page.click('[data-character=qingyue]');await page.click('[data-talent=a]');await page.click('[data-branch=a]');await page.click('[data-command=start-run]');
 expect(await page.evaluate(()=>window.__game.character.talent)).toEqual({branch:'a',level:1});
 await page.reload();await page.evaluate(()=>{const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});await expect(page.locator('[data-branch=a]')).toHaveAttribute('aria-pressed','true');
 await page.click('[data-talent=b]');await page.click('[data-branch=b]');await page.click('[data-command=start-run]');expect(await page.evaluate(()=>window.__game.character.talent)).toEqual({branch:'b',level:1});
});
