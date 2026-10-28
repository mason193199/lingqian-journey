import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const prefix='/lingqian-journey/';
const failures=[];
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return;}
 const relative=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';
 const path=resolve('dist',relative);
 if(!path.startsWith(resolve('dist')+'/')){res.writeHead(403).end();return;}
 try{const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'})[extname(path)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(5176,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const [name,options] of [['desktop',{viewport:{width:1440,height:900}}],['iphone-landscape',{viewport:{width:844,height:390},hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'}]]){
  const context=await browser.newContext(options);const page=await context.newPage();page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
  await page.goto('http://127.0.0.1:5176'+prefix+'?test');await page.getByRole('button',{name:'啟程入林'}).click();
  if(name==='desktop'){await page.keyboard.down('d');await page.waitForTimeout(300);await page.keyboard.up('d');}
  else {const button=page.locator('[data-action=right]');await button.waitFor({state:'visible'});const b=await button.boundingBox();const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});await page.waitForTimeout(300);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  assert.ok(await page.evaluate(()=>window.__game.player.x>130),'movement must work in production');
  await page.evaluate(()=>{const g=window.__game;g.enemies.forEach(e=>g.damageEnemy(e,e.hp));g.update(.016);});await page.locator('[data-blessing=fire]').click();assert.equal(await page.evaluate(()=>window.__game.blessing),'fire');
  // Exercise the normal v0.6.1 entry and new bundled state, not only legacy diagnostics.
  await page.evaluate(()=>{const b=document.createElement('button');b.dataset.command='prepare';document.body.append(b);b.click();b.remove();});
  await page.locator('[data-command=start-run]').click();assert.equal(await page.evaluate(()=>window.__game.trialsV6),true);
  await page.evaluate(()=>{const g=window.__game;g.state='route';g.run.floor=1;g.run.choices=[{id:'production-elite',type:'elite',variant:0}];g.chooseRoom('production-elite');});
  await page.locator('[data-room-action=trial-seal]').click();assert.equal(await page.evaluate(()=>window.__game.useSkill()),false);
  await page.evaluate(()=>{const g=window.__game;for(const e of g.enemies)g.damageEnemy(e,9999);g.update(.01);});
  await page.locator('[data-relic-choice]').first().click();assert.equal(await page.evaluate(()=>window.__game.state),'route');assert.equal(await page.evaluate(()=>window.__game.run.trialsCompleted),1);
  await page.screenshot({path:`test-results/production-${name}.png`});await context.close();console.log(`PASS production subpath: ${name}, title, real movement, blessing, normal trial/reward, assets`);
 }
 const context=await browser.newContext();const page=await context.newPage();await page.goto('http://127.0.0.1:5176'+prefix+'lingqian-journey.html');await page.locator('[data-command=start]').click();await context.close();console.log('PASS standalone HTML under project subpath');assert.deepEqual(failures,[]);
}finally{await browser.close();await new Promise(r=>server.close(r));}
