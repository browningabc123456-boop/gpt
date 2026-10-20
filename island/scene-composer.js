const {random,kind,distanceSegment,CX,CY}=globalThis.IslandCore;
export const landscapeThemes=[
 {id:'meadow',name:'风车花谷',note:'暖金屋顶 · 野花曲径',colors:['#d7ad55','#d9a6b1','#698749'],trees:['oak','birch','tree'],flowers:['flower','cosmos','poppy'],houses:['windmill','cottage','greenhouse']},
 {id:'sakura',name:'樱眠水庭',note:'粉樱倒影 · 竹影纸灯',colors:['#e4b6bd','#9ebc76','#78c4bf'],trees:['cherry','bamboo','willow'],flowers:['hydrangea','cosmos','flower'],houses:['cottage','gazebo','house']},
 {id:'forest',name:'森间来信',note:'层叠杉林 · 溪边木屋',colors:['#527650','#d9a15b','#9dba6b'],trees:['tree','birch','oak'],flowers:['flower','lavender','hydrangea'],houses:['house','cottage','tent']},
 {id:'coast',name:'海风假日',note:'白沙弯湾 · 玻璃花房',colors:['#e6d5a0','#71bfba','#b6ce74'],trees:['palm','oak','willow'],flowers:['tulip','flower','cosmos'],houses:['cottage','greenhouse','gazebo']},
 {id:'autumn',name:'橘子山丘',note:'红枫麦色 · 田野小径',colors:['#c9864e','#e3bc60','#8c9e54'],trees:['maple','oak','birch'],flowers:['sunflower','poppy','flower'],houses:['windmill','house','cottage']},
 {id:'lavender',name:'紫色慢时光',note:'紫色花田 · 欧式庭园',colors:['#a18cb5','#d6a8b6','#9cbb71'],trees:['birch','oak','cherry'],flowers:['lavender','rose','hydrangea'],houses:['cottage','greenhouse','gazebo']}
];
export function composeIsland(game,id,seed=Date.now()){
 const rng=random(seed),theme=landscapeThemes.find(t=>t.id===id)||landscapeThemes[Math.floor(rng()*landscapeThemes.length)],before=game.snapshot(),e=game.expansion,flip=rng()>.5?-1:1,angle=(rng()-.5)*.24,ca=Math.cos(angle),sa=Math.sin(angle),buildings=[],paths=[];
 game.objects=[];game.native=false;game.revision++;
 const world=(x,y)=>({x:CX+(x*ca-y*sa)*e*flip,y:CY+(x*sa+y*ca)*e});
 const put=(type,x,y,s=1,extra={})=>{let p=world(x,y);if(!game.contains(p.x,p.y,.065))return null;let o={type,...p,s,v:rng(),rot:(rng()-.5)*.08,yaw:(rng()-.5)*.5,...extra};game.objects.push(o);return o;};
 const circle=(type,x,y,r)=>put(type,x,y,1,{r:r*e});
 const line=(type,points,width=40)=>{let q=[];for(let i=1;i<points.length;i++){let [ax,ay]=points[i-1],[bx,by]=points[i],n=Math.ceil(Math.hypot(bx-ax,by-ay)/35);for(let j=0;j<n;j++){let t=j/n,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;circle(type,x,y,width*(.95+rng()*.10));q.push(world(x,y));}}q.push(world(...points.at(-1)));if(type==='terrain_path')paths.push(q);};
 const clear=(x,y,margin=30)=>{let p=world(x,y);return game.contains(p.x,p.y,.12)&&!game.objects.some(o=>o.type==='water'&&Math.hypot(o.x-p.x,o.y-p.y)<o.r+margin)&&!buildings.some(o=>Math.hypot(o.x-p.x,o.y-p.y)<145*(o.s||1))&&!paths.some(path=>path.some((a,i)=>i&&distanceSegment(p,path[i-1],a)<40*e));};
 // Unequal background and foreground masses frame one calm central water shape.
 for(let [x,y,r] of [[-740,-390,350],[460,-510,320],[-100,-630,300]])circle('terrain_mound',x,y,r);
 if(theme.id==='coast'){for(let [x,y,r] of [[570,70,320],[650,300,330],[450,460,230]])circle('terrain_sand',x,y,r);}
 const bend=(rng()-.5)*120,style=theme.id;
 const streams={
 meadow:[[150,-700],[260,-490],[170+bend,-290],[280,-90],[190,120],[340,310],[240,480],[500,650]],
 sakura:[[400,-650],[420,-490],[170,-290],[210,-80],[320,80],[370,300],[600,500]],
 forest:[[50,-650],[210,-490],[170,-290],[90,-100],[220,110],[140,310],[360,460],[270,650]],
 coast:[[0,-600],[140,-430],[250,-290],[370,0],[410,200],[590,390],[850,540]],
 autumn:[[370,-670],[280,-510],[210,-290],[340,-80],[200,140],[340,320],[190,620]],
 lavender:[[220,-650],[180,-440],[225,-290],[300,-120],[310,80],[250,280],[420,490],[400,620]]};
 line('water',streams[style],style==='coast'?105:style==='forest'?48:65);
 let lakeX=style==='coast'?380:style==='forest'?190:250,lakeY=style==='coast'?200:style==='forest'?100:60,lakeRX=style==='coast'?255:style==='forest'?115:style==='lavender'?170:220,lakeRY=style==='forest'?100:style==='coast'?170:145;
 for(let i=0;i<70;i++){let a=i/70*Math.PI*2,r=Math.sqrt(rng());circle('water',lakeX+Math.cos(a)*lakeRX*r,lakeY+Math.sin(a)*lakeRY*r,style==='forest'?52+rng()*22:74+rng()*26);}
 const spots={meadow:[[-460,40,1.10],[-680,370,.87],[680,-300,.86]],sakura:[[-650,210,1.05],[640,80,.95],[-600,-300,.88]],forest:[[-600,90,1.1],[680,-180,.93],[-780,380,.96]],coast:[[-430,80,1.05],[-740,350,.95],[580,-320,.95]],autumn:[[-550,-300,1.15],[-680,300,.90],[650,140,.88]],lavender:[[-600,80,1.08],[650,-230,.95],[-700,400,.96]]};
 const houseSpots=spots[style];houseSpots[0][0]+=(rng()-.5)*70;houseSpots[0][1]+=(rng()-.5)*50;
 const hub=[-280,80];line('terrain_path',[[-720,560],[-600,460],[-420,290],hub,[-120,-60],[80,-220]],34);
 for(let [i,[x,y,s]] of houseSpots.entries()){line('terrain_path',[[x,y+85],[(x+hub[0])*.5,(y+hub[1])*.5+60],hub],i===0?33:26);let o=put(theme.houses[i],x,y,s,{yaw:(flip>0?0:Math.PI/9)+(rng()-.5)*.25});if(o)buildings.push(o);put('flowerpot',x-90,y+90,.9);put('lantern',x+100,y+55,.95);}
 // One bridge crosses the stream rather than ending at the bank.
 let a=world(90,-290),b=world(style==='coast'?390:350,-290),n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/32);for(let i=0;i<n;i++)game.objects.push({type:'bridge',x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n,ex:a.x+(b.x-a.x)*(i+1)/n,ey:a.y+(b.y-a.y)*(i+1)/n,s:1.25,v:rng()});
 for(let side of [-1,1]){let pts=side<0?[[-800,490],[-580,530],[-370,490]]:[[-800,-290],[-610,-390],[-470,-380]];for(let i=1;i<pts.length;i++){let aa=world(...pts[i-1]),bb=world(...pts[i]),nn=Math.ceil(Math.hypot(bb.x-aa.x,bb.y-aa.y)/35);for(let j=0;j<nn;j++)game.objects.push({type:theme.id==='lavender'?'stonewall':'fence',x:aa.x+(bb.x-aa.x)*j/nn,y:aa.y+(bb.y-aa.y)*j/nn,ex:aa.x+(bb.x-aa.x)*(j+1)/nn,ey:aa.y+(bb.y-aa.y)*(j+1)/nn,s:1,v:rng()});}}
 const groves=[[-850,-380,240,180,14],[50,-560,270,130,12],[820,-210,180,230,13],[-1050,150,150,180,6],[830,440,200,150,6]];
 for(let [gx,gy,rx,ry,n] of groves)for(let i=0;i<n;i++){let a=rng()*Math.PI*2,r=Math.sqrt(rng()),x=gx+Math.cos(a)*rx*r,y=gy+Math.sin(a)*ry*r;if(clear(x,y,48))put(theme.trees[Math.floor(rng()*theme.trees.length)],x,y,.82+rng()*.37);}
 const fields=[[-120,390,260,140,60],[-690,-130,230,110,36],[670,270,190,110,38],[-1060,-130,130,170,22]];
 for(let [fi,[gx,gy,rx,ry,n]] of fields.entries())for(let i=0;i<n;i++){let a=rng()*Math.PI*2,r=Math.sqrt(rng()),x=gx+Math.cos(a)*rx*r,y=gy+Math.sin(a)*ry*r;if(clear(x,y,26))put(theme.flowers[fi%3],x,y,.90+rng()*.45);}
 if(style==='lavender'){for(let row=0;row<5;row++)for(let j=0;j<15;j++){let x=-150+row*62+(rng()-.5)*12,y=280+j*20+(rng()-.5)*10;if(clear(x,y,25))put('lavender',x,y,1.05);}}
 for(let i=0;i<38;i++){let a=rng()*Math.PI*2,x=Math.cos(a)*(520+rng()*650),y=Math.sin(a)*(340+rng()*300);if(clear(x,y,35))put(i%4===0?'rock':i%3===0?'fern':'bush',x,y,.65+rng()*.40);}
 for(let [x,y,type] of [[-330,180,'bench'],[-580,120,'flowerpot'],[-510,135,'flowerpot'],[-700,260,'cart'],[-270,-60,'sign'],[-740,-250,'picnic'],[-400,300,'well'],[480,170,'lamp'],[-360,30,'lantern'],[-570,310,'lantern'],[580,-200,'lantern'],[-820,-60,'mushroom'],[-890,-90,'mushroom']])if(clear(x,y,5))put(type,x,y,.90+rng()*.15);
 for(let i=0;i<22;i++){let a=rng()*Math.PI*2,x=lakeX+Math.cos(a)*lakeRX*.8,y=lakeY+Math.sin(a)*lakeRY*.8,p=world(x,y);if(game.waterAt(p.x,p.y))put(i%3===0?'lotus':'reed',x,y,.85+rng()*.25);}
 for(let [x,y,type] of [[-250,420,'person'],[-570,240,'child'],[-650,420,'cat'],[-70,300,'rabbit'],[720,400,'deer'],[-900,-230,'sheep'],[-850,20,'dog'],[-220,390,'butterfly'],[400,-420,'bird']])if(clear(x,y,5))put(type,x,y,1);
 for(let i=0;i<2;i++){let x=lakeX-40+i*75,y=lakeY,p=world(x,y);if(game.waterAt(p.x,p.y))put('duck',x,y,1);}
 for(let [x,y] of [[-50,270],[420,170],[-670,-210]])circle('firefly',x,y,55);
 game.revision++;game.checkpoint(before);return{...theme,seed,count:game.objects.length};
}
