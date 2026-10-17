import { WIDTH, HEIGHT, ends, MATERIALS, supportedItems, gateIsOpen } from './engine.js';
const TAU=Math.PI*2;
function round(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}}
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=fill;ctx.fill();}
function grad(ctx,x1,y1,x2,y2,stops){const g=ctx.createLinearGradient(x1,y1,x2,y2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function line(ctx,x,y,x2,y2,color,width=2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function text(ctx,str,x,y,size=13,color='#9d8968',align='left'){ctx.font=`${size}px "PingFang SC","Microsoft YaHei",sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(str,x,y);}
function leaf(ctx,x,y,s,rot,color){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-s,-s,s*.3,-s*1.6,0,-s*2);ctx.bezierCurveTo(s*1.3,-s*.7,s*.8,-s*.4,0,0);ctx.fillStyle=color;ctx.fill();ctx.restore();}
function plant(ctx,x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);line(ctx,0,0,0,-140,'#96a071',5);for(let i=0;i<6;i++)leaf(ctx,0,-12-i*19,23+(i%2)*5,(i%2?-.8:.9),'#9daa7b');ctx.restore();}
function flower(ctx,x,y,s=1){for(let i=0;i<5;i++){const a=i*TAU/5;ellipse(ctx,x+Math.cos(a)*7*s,y+Math.sin(a)*7*s,5*s,6*s,'#fffbec');}ellipse(ctx,x,y,4*s,4*s,'#d8ad5e');}
export class Renderer {
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.particles=[];this.petUntil=0;this.time=0;this.resize();
    this.sprite=new Image();this.sprite.src='/assets/hamster.png';
    this.sprite.onload=()=>{
      const off=document.createElement('canvas');off.width=this.sprite.width;off.height=this.sprite.height;const context=off.getContext('2d',{willReadFrequently:true});context.drawImage(this.sprite,0,0);const pixels=context.getImageData(0,0,off.width,off.height).data;
      let minX=off.width,minY=off.height,maxX=0,maxY=0;
      for(let y=0;y<off.height;y+=2)for(let x=0;x<off.width;x+=2)if(pixels[(y*off.width+x)*4+3]>40){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
      this.spriteCrop={x:Math.max(0,minX-2),y:Math.max(0,minY-2),w:maxX-minX+4,h:maxY-minY+4};
    };
  }
  resize(){const dpr=Math.min(devicePixelRatio||1,2);const w=this.canvas.clientWidth||1000;this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(this.canvas.clientHeight*dpr);}
  particle(type,x,y){for(let i=0;i<(type==='win'?45:9);i++)this.particles.push({x,y,vx:(Math.random()-.5)*150,vy:-50-Math.random()*160,life:1,type,size:3+Math.random()*5});}
  draw(state,dt=1/60){
    this.time+=dt;const {ctx:c,canvas}=this;c.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);c.clearRect(0,0,WIDTH,HEIGHT);
    const {level,items,selected,sim,mode,ghost}=state;
    this.sceneIndex=state.levelIndex;this.background(c,level);
    this.backDecor(c,level);
    for(const p of level.platforms)this.platform(c,p);
    for(const r of level.obstacles)this.obstacle(c,r);
    const supports=supportedItems(level,items),open=gateIsOpen(level,items,supports);
    if(level.plate)this.plate(c,level.plate,open);
    if(level.gate)this.gate(c,level.gate,open);
    this.home(c,level.exit);
    if(!items.length&&mode==='build'&&state.levelIndex===0){c.save();c.setLineDash([5,7]);line(c,238,431,387,431,'#ad9b7880',2);c.restore();text(c,'搭一座小桥吧',312,482,14,'#b19a73','center');}
    for(const item of items)this.item(c,item,supports.has(item.id),selected===item.id&&mode==='build',sim?.springsUsed.has(item.id));
    for(let i=0;i<level.seeds.length;i++)if(!sim?.collected.has(i))this.seed(c,level.seeds[i],i);
    const h=sim?.hamster??{x:level.start.x,y:level.start.y,grounded:true,vx:0};
    const inTube=items.some(o=>o.type==='tube'&&supports.has(o.id)&&Math.abs(h.x-o.x)<82&&Math.abs(h.y-o.y)<35);
    const lowCeiling=h.grounded&&level.obstacles.some(r=>h.x+30>r.x&&h.x-30<r.x+r.w&&h.y-(r.y+r.h)>0&&h.y-(r.y+r.h)<68);
    this.hamster(c,h,mode==='running',state.mode==='won',inTube||lowCeiling);
    // The near wall of a tube sits in front of the hamster for believable depth.
    for(const item of items)if(item.type==='tube'&&supports.has(item.id)){const e=ends(item);if(h.x>e[0].x&&h.x<e[1].x&&Math.abs(h.y-item.y)<40)this.tubeFront(c,item);}
    if(ghost){c.save();c.globalAlpha=.6;this.item(c,ghost,supportedItems(level,[...items,ghost]).has(ghost.id),true,false);c.restore();}
    this.foreground(c);
    for(const p of this.particles){p.life-=dt*.8;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;c.save();c.globalAlpha=Math.max(0,p.life);if(p.type==='heart'){text(c,'♥',p.x,p.y,p.size+10,'#cb9481','center');}else{c.translate(p.x,p.y);c.rotate(p.life*5);round(c,-p.size/2,-p.size/2,p.size,p.size*1.4,2,p.type==='win'?['#c6ab67','#9eae7c','#d8a385'][Math.floor(p.size)%3]:'#e4bc64');}c.restore();}
    this.particles=this.particles.filter(p=>p.life>0);
  }
  background(c,level){
    const palettes=[['#f0e3c9','#e9d6b5','#d7b888'],['#efe1cc','#e7d4ba','#d7b88d'],['#e4e8cc','#d7ddba','#c7be91'],['#eee0d5','#e7cfb6','#d2af86'],['#f0e0c5','#e8cf9f','#d8b580'],['#e5ead8','#d9dfbf','#c2c198']];
    const palette=palettes[this.sceneIndex]||palettes[0];
    c.fillStyle=grad(c,0,0,0,650,[[0,palette[0]],[.65,palette[1]],[1,palette[2]]]);c.fillRect(0,0,1200,650);
    // Recessed cage wall and soft window light.
    c.save();c.globalAlpha=.5;
    for(let x=32;x<1200;x+=78){round(c,x,0,7,570,3,grad(c,x,0,x+7,0,[[0,'#bcbaa5'],[.45,'#f7f3dc'],[1,'#c8c8b0']]));}
    c.restore();
    c.save();c.globalAlpha=.16;c.fillStyle='#fffdf1';c.beginPath();c.moveTo(630,0);c.lineTo(920,0);c.lineTo(650,580);c.lineTo(260,580);c.closePath();c.fill();c.restore();
    round(c,0,0,1200,14,0,'#e0cfb0');line(c,0,15,1200,15,'#fff6df',3);
    c.save();c.globalAlpha=.16;plant(c,1090,485,1.9);plant(c,795,460,1.3);c.restore();
    c.save();c.shadowColor='#fff6dd';c.shadowBlur=80;ellipse(c,730,110,65,65,'#fff2ce38');c.restore();
  }
  backDecor(c,level){
    c.save();c.globalAlpha=.65;
    // Wooden exercise wheel, softly recessed behind the play area.
    const x=134,y=288,r=117;
    line(c,x,y,x,476,'#c1a375',14);round(c,62,471,147,15,7,'#c7a776');
    c.save();c.translate(x,y);c.rotate(-.18);c.shadowColor='#806b4020';c.shadowBlur=16;c.shadowOffsetY=10;
    ellipse(c,0,0,r,r,'#d9b97d');ellipse(c,0,-2,r-13,r-13,grad(c,-90,-90,70,90,[[0,'#e5cc9a'],[1,'#cda56a']]));
    for(let i=0;i<12;i++){const a=i*TAU/12;line(c,Math.cos(a)*18,Math.sin(a)*18,Math.cos(a)*(r-17),Math.sin(a)*(r-17),'#d1ac72',6);}
    c.shadowBlur=0;ellipse(c,0,0,24,24,'#e8cd99');ellipse(c,-4,-4,12,12,'#efdcb5');c.restore();
    plant(c,1140,478,.9);
    if(this.sceneIndex===2||this.sceneIndex===5){plant(c,700,440,1.4);plant(c,440,460,1);flower(c,728,342,1.3);}
    c.restore();
    // Hanging cage name tag.
    line(c,834,0,834,51,'#bcaa83',2);line(c,981,0,981,51,'#bcaa83',2);
    c.save();c.translate(908,81);c.rotate(.025);round(c,-99,-34,198,64,12,grad(c,0,-34,0,30,[[0,'#eee1bc'],[1,'#dfcea3']]),'#d2bd91');
    text(c,'小团子的秘密基地',0,0,16,'#9d845e','center');text(c,'DO NOT DISTURB ♡',0,20,8,'#b09a75','center');c.restore();
    // Tiny bunting.
    c.beginPath();c.moveTo(310,50);c.quadraticCurveTo(470,128,650,45);c.strokeStyle='#b8a17a66';c.lineWidth=2;c.stroke();
    for(let i=0;i<6;i++){const x=335+i*51,y=62+Math.sin((i+1)/7*Math.PI)*24;c.beginPath();c.moveTo(x,y);c.lineTo(x+22,y+3);c.lineTo(x+10,y+29);c.closePath();c.fillStyle=['#a8b58e','#dcb892','#ebd6a4'][i%3];c.fill();}
  }
  platform(c,p){
    const {x,w,y}=p, bottom=592;
    c.save();c.shadowColor='#78603a22';c.shadowBlur=15;c.shadowOffsetY=12;
    round(c,x+4,y+3,w,Math.max(20,bottom-y),8,grad(c,x,y,x,bottom,[[0,'#c19b65'],[.13,'#b98c55'],[1,'#c7a779']]));c.shadowBlur=0;
    // Warm grain on the vertical face.
    c.save();c.beginPath();c.rect(x+1,y+12,w-2,bottom-y-12);c.clip();for(let i=0;i<11;i++){let yy=y+25+i*17;line(c,x-5,yy,x+w+8,yy+3,'#a87d4729',1.5);}c.restore();
    round(c,x-3,y,w+6,23,7,grad(c,0,y,0,y+23,[[0,'#edc894'],[.3,'#d7ac75'],[1,'#b88953']]),'#b18b58');
    round(c,x-3,y-8,w+6,17,6,grad(c,0,y-8,0,y+9,[[0,'#efdab0'],[.5,'#e1bf8c'],[1,'#d1a66f']]));
    line(c,x+7,y-5,x+w-8,y-5,'#f8e2bb',2);
    for(let i=0;i<Math.floor(w/80);i++) {const xx=x+25+i*83;line(c,xx,y+1,xx+31,y+1,'#c49b6544',1);}
    for(const xx of [x+22,x+w-22]){if(xx>10&&xx<1190){ellipse(c,xx,y+38,4,4,'#947246');ellipse(c,xx-1,y+37,2,2,'#d4b78b');line(c,xx-2,y+38,xx+2,y+38,'#9c7c50',1);}}
    c.restore();
  }
  obstacle(c,r){
    c.save();c.shadowColor='#8b70472a';c.shadowBlur=12;c.shadowOffsetY=8;
    round(c,r.x,r.y,r.w,r.h,9,grad(c,0,r.y,0,r.y+r.h,[[0,'#d8ba8b'],[.8,'#c5a273'],[1,'#b28a58']]),'#ba9767');
    c.shadowBlur=0;round(c,r.x+3,r.y+3,r.w-6,13,5,'#e8cfa5');
    line(c,r.x+r.w*.5,r.y+18,r.x+r.w*.5,r.y+r.h-4,'#b2916140',2);
    const yy=r.y+r.h*.53;text(c,'FRAGILE  ♡',r.x+r.w/2,yy,11,'#a28860','center');
    text(c,'小心碰头',r.x+r.w/2,yy+21,10,'#9d8057','center');
    for(let x=r.x+8;x<r.x+r.w;x+=8)line(c,x,r.y+r.h-5,x+3,r.y+r.h-1,'#a27a4b77',1);
    c.restore();
  }
  home(c,exit){
    const x=exit.x,y=exit.y;c.save();c.translate(x,y);
    c.shadowColor='#79613b30';c.shadowBlur=14;c.shadowOffsetY=6;
    round(c,-60,-111,124,108,13,grad(c,-60,-111,64,0,[[0,'#f2d8a8'],[.6,'#e8c38b'],[1,'#cfa976']]));c.shadowBlur=0;
    for(let i=0;i<5;i++)line(c,-48,-87+i*18,48,-87+i*18,'#bd98652a',1);
    c.beginPath();c.moveTo(-77,-110);c.lineTo(0,-159);c.lineTo(80,-110);c.quadraticCurveTo(85,-101,73,-97);c.lineTo(0,-139);c.lineTo(-67,-97);c.quadraticCurveTo(-84,-95,-77,-110);c.fillStyle='#718661';c.fill();
    c.beginPath();c.moveTo(-72,-110);c.lineTo(0,-153);c.lineTo(75,-108);c.strokeStyle='#aab590';c.lineWidth=7;c.lineCap='round';c.stroke();
    c.save();c.shadowColor='#6c4b292e';c.shadowBlur=6;c.shadowOffsetY=-3;
    c.beginPath();c.moveTo(-28,0);c.lineTo(-28,-42);c.bezierCurveTo(-28,-82,31,-82,31,-42);c.lineTo(31,0);c.closePath();c.fillStyle=grad(c,0,-75,0,0,[[0,'#8b623b'],[.5,'#b0834d'],[1,'#d6b679']]);c.fill();c.restore();
    ellipse(c,2,-5,28,8,'#e2c58f');ellipse(c,0,-8,13,6,'#d5a76b');
    round(c,28,-86,22,24,7,'#c6a16d');round(c,31,-83,16,18,5,'#e7deb5');line(c,39,-82,39,-65,'#a6875c',2);line(c,32,-74,46,-74,'#a6875c',2);
    flower(c,-42,-84,.85);leaf(c,-46,-68,12,-.3,'#98aa78');
    text(c,'点心小屋',0,-115,9,'#e9efdb','center');
    c.restore();
  }
  plate(c,p,open){
    ellipse(c,p.x,p.y+1,39,9,'#836b4333');round(c,p.x-34,p.y-7,68,13,5,'#8b9a70');round(c,p.x-28,p.y-(open?9:14),56,11,5,open?'#91b17e':'#beca9e');
    text(c,open?'✓ 开门啦':'压住我',p.x,p.y+38,11,open?'#6e8758':'#9b895e','center');
  }
  gate(c,g,open){
    round(c,g.x-6,g.y-9,g.w+12,g.h+16,6,'#bba179');
    if(open){round(c,g.x-7,g.y-9,g.w+14,23,5,'#91a57b');text(c,'✓',g.x+g.w/2,g.y+8,17,'#eef4d9','center');}
    else{round(c,g.x,g.y,g.w,g.h,4,grad(c,g.x,0,g.x+g.w,0,[[0,'#8d9f72'],[.45,'#b0bf8d'],[1,'#788d60']]));for(let y=g.y+20;y<g.y+g.h;y+=25)line(c,g.x+5,y,g.x+g.w-5,y,'#71865d',3);text(c,'🔒',g.x+g.w/2,g.y-21,17,'#8e805d','center');}
  }
  item(c,o,supported,selected,bounced){
    c.save();c.translate(o.x,o.y);c.rotate((o.type==='spring'?0:o.angle)*Math.PI/180);
    const l=MATERIALS[o.type].length;
    c.shadowColor='#684a3435';c.shadowBlur=9;c.shadowOffsetY=7;
    if(o.type==='board'){
      round(c,-l/2,0,l,13,5,'#9d7548');round(c,-l/2,-8,l,14,5,grad(c,0,-8,0,6,[[0,'#f0d6a4'],[.45,'#e3c18a'],[1,'#c99c63']]),'#bc935e');c.shadowBlur=0;
      for(let i=0;i<3;i++)line(c,-l/2+12, -5+i*4,l/2-12,-5+i*4,'#bb915744',.8);
      for(const x of [-l/2+12,l/2-12]){ellipse(c,x,-1,2.5,2.5,'#c09b62');ellipse(c,x-1,-2,1,1,'#f6dfb1');}
    }else if(o.type==='tube'){
      round(c,-l/2,-45,l,45,4,grad(c,0,-45,0,0,[[0,'#dfc49b'],[.23,'#e7cda5'],[.65,'#bb956b'],[1,'#98734e']]));c.shadowBlur=0;
      c.save();c.beginPath();c.rect(-l/2,-45,l,45);c.clip();for(let x=-l/2-30;x<l/2+40;x+=43)line(c,x,-45,x+27,0,'#a9855d40',2);c.restore();
      for(const x of [-l/2,l/2]){ellipse(c,x,-22,12,24,'#d8b98c');ellipse(c,x,-22,8,19,grad(c,x-8,0,x+8,0,[[0,'#62482f'],[1,'#a48155']]));}
      line(c,-l/2+9,-42,l/2-9,-42,'#f4dcba88',2);
    }else{
      round(c,-35,-3,70,12,5,'#a78052');round(c,-34,-8,68,10,4,'#d6b582');c.shadowBlur=0;
      const offset=bounced?5:0;
      c.beginPath();c.moveTo(-17,-9);for(let i=0;i<4;i++){c.lineTo(18,-12-i*5+offset);c.lineTo(-17,-15-i*5+offset);}c.strokeStyle='#7e8a70';c.lineWidth=3;c.stroke();
      round(c,-36,-34+offset,72,11,5,'#627952');round(c,-36,-38+offset,72,11,5,grad(c,0,-38,0,-27,[[0,'#becba3'],[1,'#8ea476']]));text(c,'↑',0,-29+offset,19,'#edf1da','center');
      if(selected){
        const angle=o.angle*Math.PI/180;
        for(let i=1;i<=10;i++){const t=i*.047;ellipse(c,-28+o.power*Math.cos(angle)*t,-o.power*Math.sin(angle)*t+450*t*t,2.8,2.8,'#839a6b99');}
      }
    }
    c.shadowBlur=0;
    if(selected||!supported){c.strokeStyle=supported?'#7e9a66':'#cb8d70';c.lineWidth=2;c.setLineDash([5,4]);c.beginPath();c.roundRect(-l/2-7,o.type==='tube'?-53:o.type==='spring'?-46:-16,l+14,o.type==='tube'?63:o.type==='spring'?65:39,8);c.stroke();c.setLineDash([]);}
    if(selected&&o.type!=='spring')for(const x of [-l/2,l/2]){ellipse(c,x,0,6,6,'#fff9e9');ellipse(c,x,0,3.5,3.5,supported?'#8ea575':'#d69a75');}
    c.restore();
  }
  tubeFront(c,o){c.save();c.translate(o.x,o.y);c.rotate(o.angle*Math.PI/180);round(c,-81,-13,162,14,3,grad(c,0,-13,0,1,[[0,'#bd996fbb'],[1,'#98734e']]));c.restore();}
  seed(c,s,i){const y=s.y+Math.sin(this.time*2+i)*3;c.save();c.translate(s.x,y);c.rotate(.4);c.shadowColor='#be985d40';c.shadowBlur=10;ellipse(c,0,0,10,16,'#ead4a2');ellipse(c,0,0,7,13,'#71583b');line(c,-1,-10,-1,10,'#efdbb0',2);c.restore();if(Math.sin(this.time*2+i)>.5){text(c,'✧',s.x+15,y-14,13,'#fff8d2','center');}}
  hamster(c,h,running,won,crouch=false){
    c.save();c.translate(h.x,h.y);const pet=this.time<this.petUntil;const bob=h.grounded?(running?Math.sin(this.time*17)*1.8:Math.sin(this.time*2)*.9):0;
    ellipse(c,0,3,34,h.grounded?7:4,'#73572b28');c.translate(0,bob);
    if(!h.grounded)c.rotate(Math.max(-.2,Math.min(.2,h.vy/1800)));
    if(this.spriteCrop){
      const s=this.spriteCrop,height=crouch?37:62,width=62*s.w/s.h;
      const squish=running&&h.grounded?1+Math.sin(this.time*17)*.018:1;
      c.scale(squish,1/squish);c.drawImage(this.sprite,s.x,s.y,s.w,s.h,-width/2,-height,width,height);
      if(pet)text(c,'♥',0,-height-12+Math.sin(this.time*5)*3,18,'#cb9481','center');
      if(!running&&!won)text(c,'小团子',0,31,11,'#9f8967','center');
      c.restore();return;
    }
    c.scale(1.15,1.15);
    // Fur is shaded with layered radial gradients to feel like a soft toy.
    let body=c.createRadialGradient(-12,-30,3,0,-20,37);body.addColorStop(0,'#f7db9c');body.addColorStop(.55,'#e9b96f');body.addColorStop(1,'#cb8d47');
    ellipse(c,-25,-13,8,6,'#e8bf94');
    for(const x of [-20,12]){const stride=running&&h.grounded?Math.sin(this.time*18+(x<0?0:Math.PI))*3:0;ellipse(c,x+stride,-1,10,5,'#d69e7f');ellipse(c,x+stride,-2.5,8,3.8,'#efc4a5');}
    c.save();c.shadowColor='#92612b25';c.shadowBlur=5;ellipse(c,-5,-23,32,25,body);c.restore();
    const belly=c.createRadialGradient(1,-13,1,1,-13,28);belly.addColorStop(0,'#fff6df');belly.addColorStop(1,'#e8d6b2');ellipse(c,3,-13,25,14,belly);
    ellipse(c,15,-42,11,12,'#d8a269');ellipse(c,15,-43,7,8,'#e9b7a2');ellipse(c,15,-44,4,5,'#d19783');
    const head=c.createRadialGradient(25,-33,2,18,-27,28);head.addColorStop(0,'#f9dfaa');head.addColorStop(1,'#d8a05c');ellipse(c,21,-27,22,22,head);
    ellipse(c,31,-19,16,11,'#fcf0d7');ellipse(c,35,-30,4.2,5.1,'#292d25');ellipse(c,36,-32,1.6,1.8,'#fffef6');
    ellipse(c,27,-19,5,3.5,'#e9b29a88');ellipse(c,46,-23,3.1,2.5,'#b38072');
    c.beginPath();c.moveTo(44,-20);c.quadraticCurveTo(43,-14,38,-16);c.strokeStyle='#9a7857';c.lineWidth=1.2;c.stroke();
    for(let i=0;i<3;i++)line(c,39,-18+i*2,55,-24+i*5,'#ad977a99',.7);
    ellipse(c,17,-9,6,4,'#f3d5b6');
    // A few tiny fur strokes preserve the handmade look without noisy textures.
    for(let i=0;i<7;i++)line(c,-24+i*5,-34-Math.sin(i)*5,-22+i*5,-38-Math.sin(i)*5,'#fff0c255',.8);
    if(pet){text(c,'♥',-5,-64+Math.sin(this.time*5)*3,18,'#cb9481','center');}
    if(!running&&!won){c.save();c.globalAlpha=.85;text(c,'小团子',0,35,10,'#9f8967','center');c.restore();}
    c.restore();
  }
  foreground(c){
    c.fillStyle=grad(c,0,570,0,650,[[0,'#ddc394'],[1,'#cbae7a']]);c.beginPath();c.moveTo(0,586);for(let x=0;x<=1200;x+=20)c.lineTo(x,578+Math.sin(x*.05)*6);c.lineTo(1200,650);c.lineTo(0,650);c.closePath();c.fill();
    for(let i=0;i<160;i++){const x=(i*103.31)%1210,y=586+(i*31.7)%67;c.save();c.translate(x,y);c.rotate(Math.sin(i*8)*.8);round(c,-7,-3,16+(i%4)*3,6,3,['#efd8aa','#d5b482','#e4c795','#c4a171'][i%4]);line(c,-3,-2,7,-2,'#f6e3bd66',1);c.restore();}
    // Small cloth corner and flowers give the cage a lived-in miniature feel.
    c.save();c.translate(15,552);c.rotate(.1);round(c,0,0,115,74,12,'#b0b58e');c.beginPath();c.rect(0,0,115,74);c.clip();for(let i=0;i<6;i++){c.fillStyle='#e9e5c277';c.fillRect(i*24,0,11,74);c.fillRect(0,i*24,115,11);}c.restore();
    plant(c,1176,634,.6);flower(c,1141,605,1.1);flower(c,1187,579,.8);
  }
}
