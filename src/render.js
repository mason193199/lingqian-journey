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
const spriteCache=new Map();
function sprite(c,name,x,y,scale=2,facing=1,white=false){let key=name+(white?'white':'');let image=spriteCache.get(key);if(!image){const rows=sprites[name];image=document.createElement('canvas');image.width=Math.max(...rows.map(r=>r.length));image.height=rows.length;const d=image.getContext('2d');for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){const col=palette[rows[y][x]];if(col){d.fillStyle=white?'#fff5d8':col;d.fillRect(x,y,1,1);}}spriteCache.set(key,image);}c.save();c.translate(snap(x),snap(y));c.scale(facing,1);c.imageSmoothingEnabled=false;c.drawImage(image,-image.width*scale/2,-image.height*scale,image.width*scale,image.height*scale);c.restore();}
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
function player(c,p,time,blessing){
 const x=p.x+p.w/2,y=p.y+p.h;box(c,x-22,y,44,4,'#183c4766');
 if(p.dashTime>0){for(let i=4;i>=1;i--){c.globalAlpha=.08+(4-i)*.035;sprite(c,'player',x-p.facing*i*24,y,2,p.facing);c.globalAlpha=1;box(c,x-p.facing*i*28,y-20-(i%2)*10,16,3,'#b8edd3');star(c,x-p.facing*i*22,y-14, i%2?P.gold:P.light,2);}}
 const bob=reducedMotion||p.vy?0:p.vx?Math.floor(Math.sin(time*16)*2):0;
 c.globalAlpha=p.invuln>0?(reducedMotion?.7:Math.floor(time*12)%2?.55:1):1;sprite(c,'player',x,y+bob,2,p.facing,p.invuln>.85);c.globalAlpha=1;
 if(p.vx&&p.y+p.h>=F-.1){box(c,x-p.facing*20,y+2,12,2,'#9bbb91');box(c,x-p.facing*29,y-2,5,3,'#739a81');}
 if(p.attackTime>0){const color=blessing==='fire'?'#ffbc92':blessing==='wood'?'#cfec9f':'#b6f0df';const k=1-p.attackTime/.19;const cx=x+p.facing*28,cy=y-28;
  for(let i=0;i<13;i++){const a=-1.3+i*.2;const r=44+Math.sin(k*3)*14;const xx=cx+p.facing*Math.cos(a)*r,yy=cy+Math.sin(a)*r;box(c,xx,yy,7,7,color);if(i>2&&i<10)box(c,xx-p.facing*7,yy,5,5,P.white);}
  for(let i=0;i<5;i++)box(c,x+p.facing*(40+i*10),y-34+(i%2)*6,8,3,color);
  star(c,cx+p.facing*54,cy-6,P.white,3);
 }
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
 if(e.hp<e.maxHp&&e.hp>0){const w=e.type==='boss'?90:46,yy=e.type==='boss'?y-180:y-e.h-14;box(c,x-w/2-2,yy-2,w+4,8,P.ink);box(c,x-w/2,yy,w,4,'#5d716d');box(c,x-w/2,yy,w*e.hp/e.maxHp,4,e.type==='boss'?'#e8b2a0':P.gold);}
}
function telegraphs(c,g,time){for(const z of g.zones||[]){const progress=1-z.life/z.maxLife;const yy=F-6;c.globalAlpha=.28;box(c,z.x,F-44,z.w,43,'#e88e89');c.globalAlpha=1;box(c,z.x,yy,z.w,6,'#df8b8f');box(c,z.x,yy,z.w*progress,3,'#ffe1b0');for(let x=z.x+9;x<z.x+z.w;x+=22){box(c,x,F-22,4,10,'#ffceac');box(c,x+4,F-26,4,4,'#ffceac');box(c,x+8,F-22,4,10,'#ffceac');}box(c,z.x,F-37,3,31,'#ffd2af');box(c,z.x+z.w-3,F-37,3,31,'#ffd2af');}}
function visualEffects(c,g,time){for(const e of g.vfx||[]){const age=1-e.life/(e.maxLife||1),boss=e.kind==='boss-defeat',bless=e.kind==='blessing';const count=reducedMotion?5:boss?32:bless?20:e.kind==='dash'?9:12;const radius=boss?175:bless?100:e.kind==='dash'?50:42;const color=e.color||(e.kind==='hurt'?P.rose:P.gold);c.globalAlpha=Math.max(0,Math.min(1,e.life*3));
  if((boss||bless)&&age<.85){octagon(c,e.x,e.y,15+age*radius,color);octagon(c,e.x,e.y,9+age*radius*.7,P.light);}
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
 const c=view;c.setTransform(.5,0,0,.5,0,0);c.imageSmoothingEnabled=false;c.globalAlpha=1;scenery(c,g,time);const cam=snap(g.camera||0);c.save();c.translate(-cam,0);ground(c,cam,time);if(cam>1100)shrine(c,time);telegraphs(c,g,time);
 for(const e of g.enemies||[])if(e.x>cam-150&&e.x<cam+1450)enemy(c,e,time);
 if(g.player)player(c,g.player,time,g.blessing);
 for(const p of g.projectiles||[]){for(let i=3;i>0;i--)box(c,p.x-p.vx*.022*i,p.y-p.vy*.022*i,4,4,'#bd9eb7');diamond(c,p.x,p.y,p.r||8,'#e6a29c');diamond(c,p.x,p.y,(p.r||8)*.55,P.gold);box(c,p.x-1,p.y-1,4,4,P.white);}
 visualEffects(c,g,time);
 for(const e of g.effects||[]){c.globalAlpha=Math.min(1,(e.life||1)*2);text(c,e.text,e.x,e.y,20,e.color||P.gold);}c.globalAlpha=1;c.restore();
 // Ambient spirit motes, capped and behind HUD.
 for(let i=0;i<20;i++){const x=(i*193+time*(5+i%3))%W,y=180+(i*91)%350+Math.sin(time+i)*10;c.globalAlpha=.35+Math.sin(time+i)*.15;star(c,x,y,i%3?P.light:P.gold,2);}c.globalAlpha=1;
 output.save();output.imageSmoothingEnabled=false;output.clearRect(0,0,W,H);output.drawImage(surface,0,0,W,H);output.restore();
}
