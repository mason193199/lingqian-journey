import {test,expect} from '@playwright/test';
test('six selectable characters enter real gameplay and activate distinct skills',async({page})=>{
 await page.goto('/?test');
 for(const id of ['aqian','qingyue','hongling','xinglian','baili','xuanmo']){
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});
  await page.click(`[data-character=${id}]`);await page.click('[data-command=start-run]');
  await expect.poll(()=>page.evaluate(()=>window.__game.character?.id)).toBe(id);
  if(id==='xuanmo')await page.evaluate(()=>window.__game.character.rage=50);
  await page.keyboard.press('e');await expect.poll(()=>page.evaluate(()=>window.__game.player.skillCount)).toBe(1);
  expect(await page.evaluate(()=>window.__game.character.skillCd)).toBeGreaterThan(0);
 }
});
