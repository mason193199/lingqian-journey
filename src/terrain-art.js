// Original pixel geometry: platform tops match collision y exactly.
const box=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h);};
export function drawTerrain(c,g,time,{reducedMotion=false}={}){
 const t=g.run?.terrain;if(!t)return;
 for(const s of t.platforms){
  for(let x=s.x+14;x<s.x+s.w-8;x+=46){box(c,x,s.y+10,6,585-s.y-10,'#3b6569');for(let y=s.y+18;y<580;y+=24)box(c,x-2,y,10,3,'#749087');}
  box(c,s.x-2,s.y, s.w+4,16,'#27494e');box(c,s.x,s.y,s.w,4,'#e0d5a5');box(c,s.x,s.y+4,s.w,5,'#93b891');
  for(let x=s.x+6;x<s.x+s.w-4;x+=20){box(c,x,s.y+10,16,4,'#59857c');box(c,x+2,s.y-4,9,4,'#b5ce98');}
 }
 const s=t.secret,x=s.x,y=s.y;box(c,x-18,y-24,36,24,'#34434c');box(c,x-16,y-23,32,8,s.collected?'#7e8e83':'#e4bb79');box(c,x-14,y-12,28,9,'#8d715e');box(c,x-3,y-22,6,19,s.collected?'#95a89a':'#fae6b0');
 if(!s.collected){const bob=reducedMotion?0:Math.round(Math.sin(time*2)*2);box(c,x-7,y-44+bob,14,17,'#ffe9b6');box(c,x-2,y-41+bob,4,11,'#bc7780');box(c,x-5,y-36+bob,10,3,'#bc7780');}
 if(t.ready&&!s.collected){c.font='bold 16px monospace';c.textAlign='center';c.fillStyle='#263f49';c.fillText('符匣 · 觸碰開啟',x+1,y-55+1);c.fillStyle='#ffedb5';c.fillText('符匣 · 觸碰開啟',x,y-55);}
}
