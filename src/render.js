// All art is drawn at 640 × 360, then enlarged with nearest-neighbour sampling.
// World geometry remains 1280 × 720: rendering never changes combat hitboxes.
const W=1280,H=720,F=585;
const P={ink:'#203c4b',dark:'#192f40',jade:'#79bda8',light:'#c2e6bd',gold:'#f3d797',rose:'#efac9e',white:'#fff4d3'};
let surface,view;
const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const snap=v=>Math.round(v/2)*2;
function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(snap(x),snap(y),Math.max(2,snap(w)),Math.max(2,snap(h)));}
function text(c,s,x,y,size=18,color=P.white){c.font=`bold ${size}px monospace`;c.textAlign='center';c.fillStyle=P.ink;c.fillText(s,snap(x)+2,snap(y)+2);c.fillStyle=color;c.fillText(s,snap(x),snap(y));}
function diamond(c,x,y,r,color){for(let i=-r;i<=r;i+=2)box(c,x-(r-Math.abs(i)),y+i,(r-Math.abs(i))*2+2,2,color);}
function ring(c,x,y,r,color){for(let i=0;i<32;i++){const a=i*Math.PI/16;box(c,x+Math.cos(a)*r,y+Math.sin(a)*r,4,4,color);}}
function star(c,x,y,color=P.gold,size=2){box(c,x-size,y,size*3,size,color);box(c,x,y-size,size,size*3,color);}
function octagon(c,x,y,r,color){for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/8,b=(i+1)*Math.PI/4-Math.PI/8;for(let j=0;j<12;j++){const t=j/12;box(c,x+Math.cos(a)*r*(1-t)+Math.cos(b)*r*t,y+Math.sin(a)*r*(1-t)+Math.sin(b)*r*t,3,3,color);}}}
function bagua(c,x,y,r,time=0){octagon(c,x,y,r,P.gold);octagon(c,x,y,r-6,'#789d87');for(let i=0;i<8;i++){const a=i*Math.PI/4;for(let j=0;j<3;j++){const d=r-12-j*5,cx=x+Math.sin(a)*d,cy=y-Math.cos(a)*d;box(c,cx-5,cy,10,2,P.gold);if((i>>j)&1)box(c,cx-1,cy,2,2,P.ink);}}diamond(c,x,y,8,P.gold);box(c,x-6,y-6,6,12,P.ink);box(c,x-2,y-7,5,5,P.gold);box(c,x-1,y+2,4,4,P.ink);star(c,x+Math.cos(time*.4)*r,y+Math.sin(time*.4)*r,P.white);}
const palette={o:'#263644',h:'#465064',s:'#ffdcba',b:'#eea99e',w:'#eaf0cd',t:'#7ac9b4',d:'#4b9a94',g:'#f0d08e',v:'#a58ec2',i:'#334456',l:'#afdfba',j:'#71b390',q:'#46867e',c:'#99d6de',a:'#5f9eae',f:'#f4c593'};
const sprites={
 player:[
 '..........gg............','.........gttg...........','.......gttttttg.........','.....gttttttttttg.......','....gggggggggggggg......','.....ohhhhhhhhhho.......','....ohhhhhhhhhhhho......','....ohhhhsssshhhho......','....ohhhsssssshhho......','....ohhssississhho......','.....ohssssssshho.......','......osbsssbsso........','.......ossssso..........','......ottwwttto.........','.....otttwwtttto........','....ottttwwttttso..gg...','....ostttwwttttsso.gfg..','.....otttwwttto....gfg..','......oggggggo.....gfg..','.....otttgwttto.....g...','.....otttwwttto.........','....ottttwwtttto........','....oddddwwddddo........','.....oooooooom..........','......oo..oo............','.....ooo..ooo...........'],
 slime:[
 '...........ll...........','.........lljj...........','........ljj.............','.........j..............','.......ooooooo..........','.....oojjjjjjjoo........','...oojjjllllljjjoo......','..ojjjlllllllljjjjo.....','.ojjjllllllljjjjjjjo....','.ojjlllojjjjjojjjjjo....','ojjjlllojjjjjojjjjjjo...','ojjjjlljjjjjjjjjjjjjo...','ojjjjjjbjjjjjbjjjjjjo...','.ojjjjjjjoojjjjjjjjo....','..ojjjjjjjjjjjjjjjo.....','...oqqqqqqqqqqqqqo......','....ooooooooooooo.......'],
 spirit:[
 '.........gggg...........','.......ggffffgg.........','......gfffgffffg........','.......ggffffgg.........','.........gggg...........','...........g............','......ooooooo...........','....ooaaaaaaaoo.........','...oacccccccccao........','..oacccwwwwcccao........','..oacccwwwwcccao........','..oacocccccocccao.......','..oacocccccocccao.......','..oacccbcbcccccao.......','..oacccgggccccao........','...oaccgfgcccao.........','...oaccgfgcccao.........','....oacgggccao..........','....oacccccao...........','.....oacccao............','......oacao.............','.....oo.o.oo............']};
sprites.player=sprites.player.map(row=>row.slice(0,19).padEnd(24,'.'));
// Each traveller has a bounded cached palette, not a per-frame tint pass.
const travellerPalettes={
 aqian:{t:'#7ac9b4',d:'#4b9a94',h:'#465064',g:'#f0d08e',w:'#f1e8bf'},
 qingyue:{t:'#8fbd84',d:'#477d67',h:'#344d48',g:'#dfc28d',w:'#e9e8c6'},
 hongling:{t:'#db8d9c',d:'#a15d7d',h:'#4d3c56',g:'#f0c590',w:'#ffe3c5'},
 xinglian:{t:'#a79bda',d:'#6966a3',h:'#42445f',g:'#e4d4a0',w:'#e9e6f2'},
 baili:{t:'#e3e4cf',d:'#9abdb3',h:'#d5e0d5',g:'#a8d7cf',w:'#f4ecd7'},
 xuanmo:{t:'#697787',d:'#414d64',h:'#303d4b',g:'#d4b87d',w:'#c5c5b3'}
};
const spriteCache=new Map();
function sprite(c,name,x,y,scale=2,facing=1,white=false,traveller=''){let key=name+(white?'white':'')+traveller;let image=spriteCache.get(key);if(!image){const rows=sprites[name];image=document.createElement('canvas');image.width=Math.max(...rows.map(r=>r.length));image.height=rows.length;const d=image.getContext('2d');for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){const token=rows[y][x],col=(name==='player'?travellerPalettes[traveller]?.[token]:null)||palette[token];if(col){d.fillStyle=white?'#fff5d8':col;d.fillRect(x,y,1,1);}}spriteCache.set(key,image);}c.save();c.translate(snap(x),snap(y));c.scale(facing,1);c.imageSmoothingEnabled=false;c.drawImage(image,-image.width*scale/2,-image.height*scale,image.width*scale,image.height*scale);c.restore();}
function bamboo(c,x,base,height,width,color,light,seed){
 box(c,x,base-height,width,height,color);box(c,x+width-3,base-height,2,height,light);
 for(let y=base-30;y>base-height;y-=46){box(c,x-2,y,width+4,3,light);const side=(y+seed)%3?1:-1;
  for(let n=0;n<4;n++){const xx=x+side*(9+n*9),yy=y-9-n*5;box(c,Math.min(x,xx),yy,Math.abs(xx-x)+3,2,color);box(c,xx,yy-7,6,9,color);box(c,xx+side*4,yy-10,8,4,color);}
 }
}
function stoneLantern(c,x,y,t){box(c,x-22,y-7,44,7,'#416365');box(c,x-16,y-13,32,6,'#70948a');box(c,x-9,y-56,18,43,'#537f79');box(c,x-5,y-51,4,34,'#83a293');box(c,x-17,y-84,34,29,'#45676b');box(c,x-12,y-81,24,22,'#f3c88b');box(c,x-7,y-78,14,16,'#ffe7ad');box(c,x-2,y-75,4,11,'#fffae0');box(c,x-20,y-88,40,5,'#72978c');box(c,x-26,y-92,52,5,'#344f58');box(c,x-17,y-97,34,5,'#587c77');box(c,x-9,y-101,18,4,'#7e9d8c');star(c,x+Math.sin(t)*20,y-76,P.gold);}
function charm(c,x,y,time,scale=1){const swing=Math.round(Math.sin(time*2+x)*2)*2;box(c,x,y,2,12,'#a2a78b');box(c,x-5+swing,y+12,12*scale,25*scale,P.gold);box(c,x-3+swing,y+15,8*scale,3,'#b66d74');box(c,x+swing,y+21,3,10*scale,'#c57b7b');box(c,x-2+swing,y+27,7,2,'#c57b7b');}
function scenery(c,g,time){const cam=g.camera||0;
 // Banded sky and distant purple/jade mountain terraces.
 const sky=['#26384e','#344b61','#436a73','#56897f','#6c9c8c'];sky.forEach((v,i)=>box(c,0,i*120,W,124,v));
 box(c,966-cam*.035,82,58,64,'#e0dfb3');box(c,956-cam*.035,94,78,40,'#e0dfb3');box(c,975-cam*.035,87,8,5,'#b9c7a2');box(c,1003-cam*.035,119,10,6,'#c1caa4');
 for(let i=0;i<35;i++){const x=((i*137+73-cam*.02)%W+W)%W,y=28+(i*43)%150;box(c,x,y,2,2,i%3?'#b3cdb7':'#e5d8ac');}
 for(let layer=0;layer<3;layer++){const color=['#485b75','#4b7780','#528c83'][layer];for(let x=-12;x<W;x+=12){const h=220+layer*65+Math.sin((x+cam*(.06+layer*.04)+layer*120)/130)*62+Math.sin((x+cam*.1)/53)*16;box(c,x,h,14,H-h,color);if(layer===0&&x%48===0)box(c,x,h,12,4,'#627591');}}
 for(let i=-2;i<16;i++){const x=i*102-(cam*.22)%102;bamboo(c,x,570,320+(i*31%100),5,'#477c78','#61978c',i);}
 for(let i=-2;i<12;i++){const x=i*150-(cam*.44)%150;bamboo(c,x,580,360+(i*41%160),8,'#315f63','#538a7d',i);}
 // Broken mist stripes remain behind enemies and never hide silhouettes.
 for(let i=0;i<9;i++){const x=((i*230+time*7-cam*.12)%1500)-100,y=370+(i*37)%170;c.globalAlpha=.12;box(c,x+18,y,200,6,'#d7edce');box(c,x,y+6,250,8,'#d7edce');box(c,x+30,y+14,175,4,'#d7edce');c.globalAlpha=1;}
}
function ground(c,cam,time){
 const start=Math.floor(cam/64)*64;
 box(c,start,F,1408,140,'#243d4c');
 for(let x=start;x<cam+1344;x+=64){const n=Math.abs(Math.floor(x/64));
  box(c,x,F,64,6,'#a4c991');box(c,x,F+6,64,11,'#628c73');box(c,x+2,F+6,26,3,'#7ca77e');box(c,x+40,F+11,16,4,'#3e6e66');
  box(c,x+2,F+20,60,22,n%2?'#3f5759':'#38525a');box(c,x+4,F+21,54,3,'#526a66');box(c,x+4,F+41,56,2,'#223c4a');
  box(c,x+16,F+48,44,26,'#304b56');box(c,x+17,F+49,39,3,'#455f61');box(c,x+24,F+78,25,5,'#3c5860');box(c,x+4,F+104,10,5,'#3d5962');
  if(n%3===0){box(c,x+7,F-5,22,5,'#719b71');box(c,x+13,F-10,4,9,'#add190');box(c,x+20,F-8,3,7,'#a5c88b');}
  if(n%7===3){box(c,x+18,F-7,28,7,'#6a877c');box(c,x+22,F-12,20,6,'#8ba08b');box(c,x+24,F-12,12,2,'#b2bea0');}
  if(n%9===1){box(c,x+12,F-7,4,7,'#d1baa0');box(c,x+7,F-12,14,6,'#c494a3');box(c,x+10,F-14,8,3,'#e7b4b5');}
 }
 for(let x=300;x<3300;x+=430){if(x<cam-90||x>cam+1380)continue;stoneLantern(c,x,F,time);charm(c,x+43,F-109,time);box(c,x-38,F-5,7,5,'#a8ca9c');star(c,x-31,F-13,'#d4e3a6',2);}
 // Ruined waystones and foreground talisman posts.
 for(let x=720;x<2400;x+=650){if(x<cam-100||x>cam+1380)continue;box(c,x,F-55,24,55,'#547475');box(c,x+4,F-61,16,6,'#7f9a8c');box(c,x+5,F-49,14,4,'#a0af91');box(c,x+10,F-36,4,21,'#bac69b');box(c,x+6,F-28,13,3,'#bac69b');}
}
function shrine(c,time){box(c,2482,372,32,F-372,'#385e60');box(c,2490,380,8,190,'#709184');box(c,3090,372,32,F-372,'#385e60');box(c,3098,380,8,190,'#709184');box(c,2455,353,698,18,'#2c4c54');box(c,2470,348,670,5,'#9bad8c');box(c,2500,337,610,11,'#496d69');box(c,2530,331,550,6,'#668b7b');box(c,2482,388,640,7,'#739285');for(let x=2580;x<3070;x+=84)charm(c,x,389,time);bagua(c,2800,263,72,time);box(c,2725,408,150,29,'#2d5158');text(c,'星 宿 鎮 靈',2800,429,18,P.gold);for(let i=0;i<5;i++){box(c,2680+i*55,F-2,48,3,'#a2b89a');box(c,2695+i*55,F+1,12,4,'#758f7d');}}
const statusColors={burn:'#ffb079',slow:'#a1dfe8',freeze:'#d1f3ff',poison:'#c4d97d',shock:'#e5d3ff',armorbreak:'#ffb2ad',shield:'#a9e5df',unstoppable:'#ffe19c'};
const statusGlyphs={burn:'火',slow:'緩',freeze:'凍',poison:'毒',shock:'雷',armorbreak:'破',shield:'盾',unstoppable:'霸'};
function statusAura(c,e,time,enemy=false){const list=(e.statuses||[]).filter(s=>s.remaining>0);if(!list.length)return;const x=e.x+e.w/2,y=e.y+e.h;for(let i=0;i<Math.min(4,list.length);i++){const s=list[i],col=statusColors[s.id]||P.gold;const xx=x+(i-(Math.min(4,list.length)-1)/2)*23,yy=e.type==='boss'?y-225:y-e.h-36;box(c,xx-9,yy-12,19,19,P.ink);text(c,statusGlyphs[s.id]||'✦',xx,yy+3,14,col);box(c,xx-8,yy+8,Math.min(17,Math.max(2,s.remaining*3)),2,col);if(s.stacks>1)text(c,String(s.stacks),xx+10,yy+5,10,P.white);}
 if(list.some(s=>s.id==='shield')){c.globalAlpha=.65;octagon(c,x,y-e.h/2,e.w*.65+10,'#a9e5df');c.globalAlpha=1;}
 if(list.some(s=>s.id==='freeze')){c.globalAlpha=.25;box(c,e.x-5,e.y-4,e.w+10,e.h+5,'#c1f4ff');c.globalAlpha=1;}
 const active=list.find(s=>['burn','poison','shock','unstoppable'].includes(s.id));if(active)for(let i=0;i<4;i++){const xx=x+Math.sin(time*4+i*2)*(e.w/2+5),yy=y-8-((time*20+i*15)%e.h);star(c,xx,yy,statusColors[active.id],2);}
}
function heldWeapon(c,p,x,y,time){const weapon=p.weapon||'sword',active=p.attackTime>0;const progress=1-p.attackTime/.19;
 c.save();c.translate(x,y-28);c.scale(p.facing||1,1);c.translate(17,0);
 if(weapon==='sword'){c.rotate(active?-1.45+progress*2.8:.42);box(c,-4,-39,8,34,'#573d49');box(c,-2,-37,5,30,'#d59575');box(c,0,-35,2,27,'#f3c896');box(c,-2,-44,4,7,'#e5b080');box(c,-11,-8,22,5,'#f0d08e');box(c,-3,-2,6,15,'#6b4d58');box(c,-2,1,4,8,'#c18a72');box(c,-5,12,10,4,'#e6bd85');}
 else if(weapon==='staff'){c.rotate(active?.8:.2);box(c,-3,-37,6,60,'#4e435b');box(c,-1,-35,3,55,'#b2917c');box(c,-5,-23,10,5,'#f0d08e');box(c,-8,-43,16,12,'#edca87');diamond(c,0,-43,10,'#9de0dd');diamond(c,0,-43,5,'#e5f5cf');box(c,-12,-39,4,9,'#d4b586');box(c,8,-39,4,9,'#d4b586');if(active)ring(c,0,-43,19,'#dfc5f5');}
 else {c.rotate(active?-.25:.1);box(c,-9,-20,18,32,'#594953');box(c,-7,-18,14,28,'#ffe1a0');box(c,-5,-15,10,3,'#c47176');box(c,-1,-10,3,15,'#b65a70');box(c,-5,-5,10,3,'#b65a70');box(c,-3,4,7,2,'#b65a70');if(active){ring(c,7,-3,22,'#f6d78f');star(c,26,-3,P.white,3);}}
 c.restore();
}
function travellerOrnament(c,id,x,y,facing,white=false){
 const col=v=>white?P.white:v;c.save();c.translate(snap(x),snap(y));c.scale(facing||1,1);
 if(id==='aqian'){box(c,-4,-54,9,7,col('#f3d797'));box(c,-1,-53,3,5,col('#537b72'));}
 else if(id==='qingyue'){box(c,-16,-43,28,4,col('#b4d69a'));box(c,-21,-42,8,3,col('#77aa85'));box(c,-24,-38,9,3,col('#9dc78d'));}
 else if(id==='hongling'){for(const sign of [-1,1]){box(c,sign*15-3,-45,7,9,col('#eeb1ad'));box(c,sign*19-3,-41,7,6,col('#c66c8e'));box(c,sign*19-2,-34,4,10,col('#e4a5ad'));}}
 else if(id==='xinglian'){star(c,0,-57,col('#f7e2ab'),3);box(c,-13,-47,25,3,col('#b8a8e0'));box(c,-19,-32,5,16,col('#c2b1ea'));}
 else if(id==='baili'){box(c,-17,-53,7,11,col('#eff0d8'));box(c,-15,-56,3,8,col('#d4b3b9'));box(c,8,-53,7,11,col('#eff0d8'));box(c,10,-56,3,8,col('#d4b3b9'));box(c,-19,-26,5,13,col('#e8e8d3'));}
 else if(id==='xuanmo'){box(c,-15,-45,27,6,col('#c6ae7b'));box(c,-3,-47,7,10,col('#e3d09b'));box(c,-1,-45,3,6,col('#62574e'));box(c,-15,-26,5,15,col('#c0a56d'));}
 c.restore();
}
function friendlySpirit(c,s,time,index){
 const x=Number.isFinite(s.x)?s.x+(s.w||20)/2:0,y=Number.isFinite(s.y)?s.y+(s.h||20)/2:F-23;
 const bob=reducedMotion?0:Math.round(Math.sin(time*5+index)*2)*2;
 const boosted=(s.boost||s.boosted||s.empowered||s.boostTime||0)>0;
 c.save();c.translate(snap(x),snap(y+bob));if(boosted)ring(c,0,0,21,'#f3d797');
 box(c,-11,-7,22,13,'#477d79');box(c,-9,-9,18,13,'#bce9d4');box(c,-11,-15,6,9,'#d8f2dc');box(c,5,-15,6,9,'#d8f2dc');box(c,-9,-12,2,4,'#e8b7bc');box(c,7,-12,2,4,'#e8b7bc');
 box(c,-6,-4,3,4,'#34545c');box(c,4,-4,3,4,'#34545c');box(c,-2,1,5,2,'#7faca1');box(c,-7,7,5,3,'#9ed3c3');box(c,4,7,5,3,'#9ed3c3');box(c,-17,-1,8,6,'#93ccb9');box(c,-21,-6,7,7,'#c6ead5');star(c,14,-13,boosted?P.gold:'#cff1dc',2);if(s.life!=null){box(c,-10,13,20,2,'#31565d');box(c,-10,13,20*Math.max(0,Math.min(1,s.life/(s.maxLife||12))),2,boosted?P.gold:'#9ed8c4');}c.restore();
}
function friendlySkillZones(c,g,time){for(const z of (g.skillZones||[]).slice(0,6)){
 const x=z.x??g.player?.x??0,y=z.y??F-20,r=z.r||z.radius||90;
 c.globalAlpha=.14;box(c,x-r,F-36,r*2,32,'#bdc4ef');c.globalAlpha=.8;octagon(c,x,y,r,'#c9b9ec');const remaining=Math.max(0,Math.min(1,(z.delay??z.life??.75)/(z.maxLife||.75)));ring(c,x,y,r*(.2+remaining*.65),'#9eddd7');
 for(let i=0;i<6;i++){const a=i*Math.PI/3+time*.2;star(c,x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.35,'#f4d99f',2);}c.globalAlpha=1;
}}
function player(c,p,time,blessing,traveller='') {
 const x=p.x+p.w/2,y=p.y+p.h;box(c,x-22,y,44,4,'#183c4766');
 if(p.dashTime>0){for(let i=4;i>=1;i--){c.globalAlpha=.08+(4-i)*.035;sprite(c,'player',x-p.facing*i*24,y,2,p.facing,false,traveller);c.globalAlpha=1;box(c,x-p.facing*i*28,y-20-(i%2)*10,16,3,'#b8edd3');star(c,x-p.facing*i*22,y-14,i%2?P.gold:P.light,2);}}
 const bob=reducedMotion||p.vy?0:p.vx?Math.floor(Math.sin(time*16)*2):0;
 c.globalAlpha=p.invuln>0?(reducedMotion?.7:Math.floor(time*12)%2?.55:1):1;sprite(c,'player',x,y+bob,2,p.facing,p.invuln>.85,traveller);travellerOrnament(c,traveller,x,y+bob,p.facing,p.invuln>.85);c.globalAlpha=1;heldWeapon(c,p,x,y+bob,time);
 if(p.stun>0){box(c,x-28,y-56,8,4,'#ffb0a1');box(c,x+22,y-42,8,4,'#ffb0a1');}
 if(p.vx&&p.y+p.h>=F-.1){box(c,x-p.facing*20,y+2,12,2,'#9bbb91');box(c,x-p.facing*29,y-2,5,3,'#739a81');}
 if(p.attackTime>0){const color=blessing==='fire'?'#ffbc92':blessing==='wood'?'#cfec9f':'#b6f0df';const k=1-p.attackTime/.19,cx=x+p.facing*28,cy=y-28;
 if((p.weapon||'sword')==='sword'){for(let i=0;i<13;i++){const a=-1.3+i*.2,r=44+Math.sin(k*3)*14,xx=cx+p.facing*Math.cos(a)*r,yy=cy+Math.sin(a)*r;box(c,xx,yy,7,7,color);if(i>2&&i<10)box(c,xx-p.facing*7,yy,5,5,P.white);}star(c,cx+p.facing*54,cy-6,P.white,3);}
 else {for(let i=0;i<5;i++)box(c,x+p.facing*(38+i*10),y-37+(i%2)*6,8,3,p.weapon==='staff'?'#dcc4f2':P.gold);}
 }
 statusAura(c,p,time);
}

function boss(c,e,time){const x=e.x+e.w/2,y=e.y+e.h;const white=e.hitFlash>0;const col=(s)=>white?P.white:s;
 // Pixel guardian: rounded robe silhouette, lantern-mask face, bamboo antlers.
 box(c,x-45,y-78,90,67,col('#346d68'));box(c,x-37,y-96,74,27,col('#478979'));box(c,x-49,y-20,98,16,col('#28525a'));box(c,x-28,y-72,13,53,col('#69aa8b'));box(c,x+15,y-72,13,53,col('#69aa8b'));box(c,x-10,y-79,20,64,col('#96c59d'));box(c,x-28,y-6,19,7,col('#284550'));box(c,x+9,y-6,19,7,col('#284550'));
 box(c,x-55,y-70,18,42,col('#528c77'));box(c,x+37,y-70,18,42,col('#528c77'));box(c,x-61,y-36,18,14,col('#84b99a'));box(c,x+43,y-36,18,14,col('#84b99a'));
 box(c,x-30,y-133,60,39,col('#263f4b'));box(c,x-34,y-125,68,26,col('#263f4b'));box(c,x-26,y-130,52,37,col('#d2d8ad'));box(c,x-30,y-121,60,22,col('#d2d8ad'));box(c,x-19,y-118,8,9,col('#395e62'));box(c,x+11,y-118,8,9,col('#395e62'));box(c,x-23,y-107,9,4,col('#dfa69a'));box(c,x+14,y-107,9,4,col('#dfa69a'));box(c,x-5,y-103,10,3,col('#728e7d'));
 for(let side of [-1,1]){box(c,x+side*24-5,y-153,10,28,col('#547f72'));box(c,x+side*36-5,y-165,10,23,col('#83aa86'));box(c,x+side*44-5,y-159,8,10,col('#b0cb91'));box(c,x+side*18-3,y-164,7,15,col('#6a967b'));box(c,x+side*33-7,y-151,14,3,col('#b2cc99'));}
 box(c,x-14,y-79,28,38,col('#efd89b'));box(c,x-11,y-75,22,3,col('#b98077'));box(c,x-3,y-67,6,21,col('#b98077'));box(c,x-8,y-60,16,3,col('#b98077'));box(c,x-8,y-52,16,3,col('#b98077'));
 const tele=['slam','charge','volley'].includes(e.state);
 if(tele){ring(c,x,y-58,67+(Math.floor(time*4)%2)*2,'#e6bd8a');const label=e.state==='slam'?'重擊 · 跳躍閃避':e.state==='charge'?'衝撞 · 準備閃避':'星火 · 靈彈將至';box(c,x-100,y-201,200,28,'#293f4be6');text(c,label,x,y-182,16,'#ffd2a2');star(c,x-49,y-128,'#ffe8b3',3);star(c,x+49,y-128,'#ffe8b3',3);}
 if(e.state==='charge'){const dir=e.facing;for(let i=1;i<9;i++){const xx=x+dir*i*28;box(c,xx,y-4,17,4,'#f2b593');box(c,xx+dir*10,y-10,4,13,'#f9d3a6');}}
 if(e.state==='rush')for(let i=1;i<5;i++)box(c,x-e.facing*i*28,y-60+(i%2)*12,18,4,'#d2e4b6');
}
function enemy(c,e,time){const x=e.x+e.w/2,y=e.y+e.h;box(c,x-e.w*.5,y+1,e.w,4,'#173e4566');if(e.type==='boss')boss(c,e,time);else{const moving=e.state==='lunge';const bob=e.type==='slime'?Math.floor(Math.sin(time*5+e.id)*1.5)*2:Math.floor(Math.sin(time*3)*2)*2;sprite(c,e.type,x,y+bob,e.type==='slime'?2:2,e.facing||1,e.hitFlash>0);if(moving){box(c,x-e.facing*28,y-5,14,3,'#afdbac');box(c,x-e.facing*39,y-11,9,3,'#7ab9a2');}if(e.state==='windup'){box(c,x-6,y-e.h-28,12,21,'#f0c593');text(c,'!',x,y-e.h-12,20,P.ink);if(e.type==='spirit')ring(c,x,y-26,39,P.gold);}}
 if(e.hitstun>0){star(c,x-18,y-e.h-9,P.white,2);star(c,x+18,y-e.h-3,P.gold,2);}
 statusAura(c,e,time,true);
 if(e.hp<e.maxHp&&e.hp>0){const w=e.type==='boss'?90:46,yy=e.type==='boss'?y-180:y-e.h-14;box(c,x-w/2-2,yy-2,w+4,8,P.ink);box(c,x-w/2,yy,w,4,'#5d716d');box(c,x-w/2,yy,w*e.hp/e.maxHp,4,e.type==='boss'?'#e8b2a0':P.gold);}
}
function telegraphs(c,g,time){for(const z of g.zones||[]){const progress=1-z.life/z.maxLife;const yy=F-6;c.globalAlpha=.28;box(c,z.x,F-44,z.w,43,'#e88e89');c.globalAlpha=1;box(c,z.x,yy,z.w,6,'#df8b8f');box(c,z.x,yy,z.w*progress,3,'#ffe1b0');for(let x=z.x+9;x<z.x+z.w;x+=22){box(c,x,F-22,4,10,'#ffceac');box(c,x+4,F-26,4,4,'#ffceac');box(c,x+8,F-22,4,10,'#ffceac');}box(c,z.x,F-37,3,31,'#ffd2af');box(c,z.x+z.w-3,F-37,3,31,'#ffd2af');}}
function visualEffects(c,g,time){for(const e of g.vfx||[]){const age=1-e.life/(e.maxLife||1),boss=e.kind==='boss-defeat',bless=e.kind==='blessing';const count=reducedMotion?5:boss?32:bless?20:e.kind==='dash'?9:12;const radius=boss?175:bless?100:e.kind==='dash'?50:42;const color=e.color||(e.kind==='hurt'?P.rose:P.gold);c.globalAlpha=Math.max(0,Math.min(1,e.life*3));
  if((boss||bless)&&age<.85){octagon(c,e.x,e.y,15+age*radius,color);octagon(c,e.x,e.y,9+age*radius*.7,P.light);}
  if(['skill','star','guard'].includes(e.kind)&&age<.8){octagon(c,e.x,e.y,12+age*55,e.kind==='guard'?'#c5e4bf':'#d2c6ee');star(c,e.x,e.y,P.white,e.kind==='star'?6:3);}
  if(e.kind==='lightning'){for(let j=0;j<7;j++)box(c,e.x+(j%2?8:-6),e.y-90+j*14,6,18,'#ecd5ff');}
  if(e.kind==='rune'&&age<.65){octagon(c,e.x,e.y,12+age*45,'#f8d794');text(c,'敕',e.x,e.y+5,18,P.gold);}
  if(e.kind==='critical'&&age<.6){star(c,e.x,e.y,'#fff0bd',8);text(c,'暴擊',e.x,e.y-28-age*18,18,'#ffe09a');}
  if(e.kind==='sword-hit'){for(let j=0;j<5;j++)box(c,e.x-16+j*8,e.y-20+j*8,6,10,P.white);}
  if(e.kind==='paper-hit'){octagon(c,e.x,e.y,14+age*30,'#f3c896');text(c,'敕',e.x,e.y+5,18,'#ffce98');}
  if(e.kind==='staff-hit'){ring(c,e.x,e.y,12+age*60,'#c6b5f0');diamond(c,e.x,e.y,8,P.white);}
  if(e.kind==='hit'&&age<.35){box(c,e.x-15,e.y-2,30,5,P.white);box(c,e.x-2,e.y-15,5,30,P.white);diamond(c,e.x,e.y,10-age*20,P.white);}
  for(let i=0;i<count;i++){const a=i*2.39996;const r=(10+age*radius)*(0.45+(i%5)*.13);const x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r+(boss?-age*65:age*age*30);box(c,x,y,i%3===0?5:3,i%3===0?5:3,i%3===0?P.white:i%2?color:P.light);if(i%7===0)star(c,x,y,color,2);}
  if(boss&&age<.8){for(let i=0;i<5;i++){const x=e.x-95+i*48;box(c,x,e.y-age*160+Math.sin(i)*18,8,15,P.gold);box(c,x+2,e.y-age*160+3+Math.sin(i)*18,3,8,'#bd8d86');}}
  c.globalAlpha=1;
 }
}
export function render(output,g,time){
 time=g.state==='title'?time:(g.visualTime??g.elapsed??time);
 if(reducedMotion)time=Math.floor(time*4)/4;
 if(!surface){surface=document.createElement('canvas');surface.width=640;surface.height=360;view=surface.getContext('2d');}
 const c=view;c.setTransform(.5,0,0,.5,0,0);c.imageSmoothingEnabled=false;c.globalAlpha=1;scenery(c,g,time);const cam=snap(g.camera||0);c.save();c.translate(-cam,0);ground(c,cam,time);if(g.run&&g.enemyWall===1100){box(c,1150,450,15,135,'#3d6962');box(c,1154,445,7,135,'#9fbd92');for(let k=0;k<3;k++){box(c,1147,470+k*34,21,4,'#d3c38e');}text(c,'界',1158,437,16,P.gold);}if(cam>1100)shrine(c,time);telegraphs(c,g,time);friendlySkillZones(c,g,time);for(const f of g.evolutionFields||[]){c.globalAlpha=.65;octagon(c,f.x,f.y,f.radius,'#b3e9ef');ring(c,f.x,f.y,f.radius*.7,'#e2f5ea');c.globalAlpha=1;}for(const ray of g.build?.beams||[]){for(let j=0;j<12;j++){const a=j/12;box(c,ray.x+(ray.x2-ray.x)*a+(j%2?4:-4),ray.y+(ray.y2-ray.y)*a,5,16,j%2?'#d9c5fa':P.white);}}for(const field of g.spellFields||[]){c.globalAlpha=.35+field.life/field.maxLife*.25;octagon(c,field.x,field.y,field.radius,'#c6b5f0');ring(c,field.x,field.y,field.radius*.65,'#a8e2df');star(c,field.x,field.y,P.white,4);c.globalAlpha=1;}
 for(const [i,s] of (g.summons||[]).slice(0,6).entries())friendlySpirit(c,s,time,i);
 for(const e of g.enemies||[])if(e.x>cam-150&&e.x<cam+1450){enemy(c,e,time);if(e.elite)text(c,'精英',e.x+e.w/2,e.y-44,16,'#ffc7a2');}
 if(g.player){player(c,g.player,time,g.blessing,g.character?.id||'');if(g.build?.evolution){const color=g.build.element==='fire'?'#ffbf8c':g.build.element==='water'?'#b3e9ef':'#dfc7fa';star(c,g.player.x+19+g.player.facing*35,g.player.y+12,color,4);}}
 for(const p of g.projectiles||[]){
  const hostile=p.hostile!==false,col=hostile?'#e6a29c':g.build?.evolution&&p.weapon==='talisman'?'#ffab7c':g.build?.evolution&&p.weapon==='staff'?'#b3e9ef':p.weapon==='staff'?'#c9b7ed':'#f5d28c';
  for(let i=3;i>0;i--){c.globalAlpha=.9-i*.18;box(c,p.x-p.vx*.022*i,p.y-p.vy*.022*i,hostile?4:6,hostile?4:6,col);}c.globalAlpha=1;
  if(!hostile&&p.weapon==='talisman'){c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.vy,p.vx)+Math.sin(time*16)*.18);box(c,-12,-8,24,16,'#654455');box(c,-10,-6,20,12,'#ffe1a0');box(c,-6,-4,3,8,'#b55f72');box(c,-2,-1,9,3,'#b55f72');box(c,3,-4,3,8,'#b55f72');if(g.build?.evolution){star(c,-16,0,'#ffad75',3);star(c,-23,-2,'#ffe6b1',2);}c.restore();}
  else if(!hostile){ring(c,p.x,p.y,(p.r||10)+4,'#b5e8dd');diamond(c,p.x,p.y,p.r||10,'#c3afea');diamond(c,p.x,p.y,5,'#e9ffdc');star(c,p.x,p.y,P.white,3);}
  else{diamond(c,p.x,p.y,p.r||8,'#e6a29c');diamond(c,p.x,p.y,(p.r||8)*.55,P.gold);box(c,p.x-1,p.y-1,4,4,P.white);}
 }

 visualEffects(c,g,time);
 for(const e of g.effects||[]){c.globalAlpha=Math.min(1,(e.life||1)*2);text(c,e.text,e.x,e.y,20,e.color||P.gold);}c.globalAlpha=1;c.restore();
 // Ambient spirit motes, capped and behind HUD.
 for(let i=0;i<20;i++){const x=(i*193+time*(5+i%3))%W,y=180+(i*91)%350+Math.sin(time+i)*10;c.globalAlpha=.35+Math.sin(time+i)*.15;star(c,x,y,i%3?P.light:P.gold,2);}c.globalAlpha=1;
 output.save();output.imageSmoothingEnabled=false;output.clearRect(0,0,W,H);const shake=!reducedMotion&&g.shake>0?2:0;const dx=shake?Math.round(Math.sin(time*83)*shake)*2:0,dy=shake?Math.round(Math.cos(time*71)*shake):0;output.fillStyle=P.dark;output.fillRect(0,0,W,H);output.drawImage(surface,dx,dy,W,H);output.restore();
}

// Reuse the actual in-game traveller sprite, palette, ornament and held weapon.
// Portraits are painted only when preparation changes, never every game frame.
export function renderPortrait(context,id,weapon='sword'){
 const {width,height}=context.canvas;context.clearRect(0,0,width,height);context.imageSmoothingEnabled=false;
 context.fillStyle='#15383c';context.fillRect(0,0,width,height);
 context.save();context.globalAlpha=.22;bagua(context,width/2,height/2,Math.min(width,height)*.4,0);context.restore();
 context.save();context.translate(width/2-38,height-122);context.scale(2,2);
 player(context,{x:0,y:0,w:38,h:58,weapon,facing:1,vx:0,vy:0,invuln:0,attackTime:0,dashTime:0,stun:0,statuses:[]},0,null,id);context.restore();
}
