import * as T from 'three';
// All objects are layered cardstock geometry; variants change silhouettes, not only color.
export function richModel(type,v,k){const{box,ball,cyl,mesh,faceGeo,strip,mat,house,flower,foldedPine,rock,fence}=k;let g=new T.Group(),rnd=globalThis.IslandCore.random(Math.floor(v*9999)+17);
 const petal=(group,x,y,z,w,h,color,a=0)=>{let s=new T.Shape();s.moveTo(0,0);s.quadraticCurveTo(-w*.65,h*.45,0,h);s.quadraticCurveTo(w*.65,h*.45,0,0);let m=mesh(group,new T.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false,curveSegments:5}),color);m.position.set(x,y,z);m.rotation.z=a;return m;};
 const stem=(x,z,h)=>{strip(g,[x,0,z],[x,h,z],.014,.015,'#6e8d43');let l=petal(g,x,h*.35,z,.08,.18,'#8b9b51',-.65);};
 const bloom=(x,y,z,n,rad,col)=>{for(let i=0;i<n;i++){let a=i*Math.PI*2/n;let m=petal(g,x,y,z,rad*.7,rad,col,a);m.rotation.x=-.62;}ball(g,.035,x,y+.035,z,'#d9ac4c');};
 if(['tulip','lavender','sunflower','poppy','hydrangea','rose','cosmos'].includes(type)){
  for(let i=0;i<(type==='sunflower'?2:3);i++){let x=(i-1)*.20,z=(rnd()-.5)*.18,h=.30+rnd()*.13;stem(x,z,h);
   if(type==='tulip'){for(let j=0;j<5;j++){let a=j*Math.PI*2/5,m=petal(g,x+Math.cos(a)*.035,h-.045,z+Math.sin(a)*.035,.11,.16,['#e5a08b','#e8b677','#d8a2ad'][i]);m.rotation.y=a;m.rotation.z=(j%2-.5)*.15;}}
   if(type==='lavender'){for(let j=0;j<6;j++)for(let q=0;q<3;q++){let a=q*Math.PI*2/3;ball(g,.033,x+Math.cos(a)*.025,h+j*.034,z+Math.sin(a)*.025,j%2?'#9c8bb1':'#b1a0c2');}}
   if(type==='sunflower'){for(let q=0;q<12;q++){let a=q*Math.PI/6;petal(g,x,h,z,.06,.17,'#e5b64c',a);}let m=cyl(g,.075,.075,.028,x,h+.01,z,'#886641',12);m.rotation.x=Math.PI/2;}
   if(type==='poppy'){bloom(x,h,z,4,.15,'#d67d63');ball(g,.028,x,h+.02,z,'#655c45');}
   if(type==='cosmos')bloom(x,h,z,8,.13,i%2?'#d6a4b7':'#e9c0ca');
   if(type==='hydrangea')for(let q=0;q<10;q++){let a=q*2.4,r=.09*Math.sqrt(q/10);let xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;for(let j=0;j<4;j++){let aa=j*Math.PI/2;ball(g,.034,xx+Math.cos(aa)*.025,h+.05+Math.cos(a)*.025,zz+Math.sin(aa)*.025,i%2?'#b3b7ce':'#bec5dd');}}
   if(type==='rose'){for(let q=0;q<9;q++){let a=q*2.4,m=petal(g,x+Math.cos(a)*.025,h,z+Math.sin(a)*.025,.085,.10,q%2?'#cf9b9d':'#dcaeb0',a);m.rotation.y=a;}ball(g,.038,x,h+.04,z,'#c88e94');}
  }return g;
 }
 const trunk=(color='#a27d50',height=1.6)=>{cyl(g,.06,.10,height,0,height/2,0,color,7);};
 const cutCrown=(color,x,y,z,rx,ry,angle=0)=>{let s=new T.Shape();for(let j=0;j<=48;j++){let a=j/48*Math.PI*2,r=1+.08*Math.sin(a*5)+.035*Math.cos(a*9),xx=Math.cos(a)*rx*r,yy=Math.sin(a)*ry*r;j?s.lineTo(xx,yy):s.moveTo(xx,yy);}s.closePath();let geo=new T.ExtrudeGeometry(s,{depth:.065,bevelEnabled:false,curveSegments:2}),vp=geo.attributes.position;for(let j=0;j<vp.count;j++)vp.setZ(j,vp.getZ(j)+Math.abs(vp.getX(j)/rx)*.095);vp.needsUpdate=true;geo.computeVertexNormals();let m=mesh(g,geo,color);m.position.set(x,y,z);m.rotation.y=angle;let crease=strip(g,[x,y-ry*.7,z+.026],[x,y+ry*.8,z+.026],.014,.015,'#c4ca98');return m;};
 const crown=(color,height=1.7)=>{for(let i=0;i<3;i++){let a=(i-1)*.85;cutCrown(color,Math.sin(a)*.2,height+Math.cos(i)*.08,Math.cos(a)*.08,.62,.56,a);} };
 if(['oak','birch','cherry','willow','maple','palm'].includes(type)){
  trunk(type==='birch'?'#e9e3c9':'#a27d50',type==='palm'?2.05:1.55);
  if(type==='oak')crown('#81924f');
  if(type==='birch'){for(let i=0;i<9;i++)box(g,.12,.025,.035,0,.15+i*.16,.07,'#8d8b75');for(let i=0;i<3;i++){let a=i*2.4;strip(g,[0,1,0],[Math.cos(a)*.4,1.6,Math.sin(a)*.3],.045,.04,'#e1dbc1');cutCrown('#a6b56d',Math.cos(a)*.22,1.85+i*.1,Math.sin(a)*.2,.31,.64,a);}}
  if(type==='cherry'){crown('#ecb6c5');for(let i=0;i<28;i++){let a=i*2.4;ball(g,.045,Math.cos(a)*(.2+rnd()*.5),1.55+rnd()*.65,Math.sin(a)*(.2+rnd()*.4),i%2?'#ffe1d7':'#f6bed0');}}
  if(type==='maple'){for(let i=0;i<6;i++){let a=i*Math.PI/3;let shape=new T.Shape();for(let j=0;j<10;j++){let aa=j*Math.PI/5,r=j%2?.22:.53;let x=Math.cos(aa)*r,y=Math.sin(aa)*r;j?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();let m=mesh(g,new T.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:false}),i%2?'#bb8152':'#cb975e');m.position.set(Math.cos(a)*.28,1.7+Math.sin(i)*.18,Math.sin(a)*.25);m.rotation.y=a;}}
  if(type==='willow'){crown('#98a371',1.9);for(let i=0;i<16;i++){let a=i*Math.PI/8,x=Math.cos(a)*.5,z=Math.sin(a)*.4;for(let j=0;j<5;j++)strip(g,[x,1.9-j*.18,z],[x+Math.cos(a)*.06,1.70-j*.18,z+Math.sin(a)*.08],.045,.012,j%2?'#8f9b65':'#a2ae78');}}
  if(type==='palm'){for(let i=0;i<9;i++)cyl(g,.064,.069,.025,0,.2+i*.18,0,'#c39b68');for(let i=0;i<7;i++){let a=i*Math.PI*2/7;for(let j=0;j<4;j++){let d=.18+j*.18,xx=Math.cos(a)*d,zz=Math.sin(a)*d;let m=petal(g,xx,2.0-j*.08,zz,.22,.4,j%2?'#87984f':'#9dac60');m.rotation.set(-Math.PI/2,0,-a);}}}return g;
 }
 if(type==='bamboo'){for(let i=0;i<3;i++){let x=(i-1)*.22,h=1.6+i*.15;cyl(g,.035,.05,h,x,h/2,0,'#8c9d59',6);for(let j=0;j<6;j++){cyl(g,.05,.05,.028,x,.2+j*.25,0,'#c2c98a',6);if(j%2===0)for(let side of [-1,1]){let m=petal(g,x,.35+j*.23,0,.10,.40,'#91a565',side*.8);m.rotation.y=i*.7;}}}return g;}
 if(type==='fern'){for(let i=0;i<6;i++){let a=i*Math.PI/3;for(let j=0;j<5;j++){let d=.08+j*.07,x=Math.cos(a)*d,z=Math.sin(a)*d,y=.12+Math.sin(j/5*Math.PI)*.16;for(let side of [-1,1]){let m=petal(g,x,y,z,.05,.13*(1-j*.11),'#8ca367',a+side*.8);m.rotation.x=-.6;}}}return g;}
 if(type==='hedge'){for(let i=0;i<3;i++){let m=ball(g,.25,(i-1)*.23,.25,0,'#879c58',1);m.scale.set(.8,1.3,.75);}return g;}
 if(['pebble','slate','basalt','crystal'].includes(type)){
  if(type==='pebble')for(let i=0;i<3;i++){let m=ball(g,.19,(i-1)*.19,.10,rnd()*.15,'#b1ae98',1);m.scale.set(1.3,.5,1);}
  if(type==='slate')for(let i=0;i<4;i++){let m=cyl(g,.29-i*.035,.32-i*.03,.07,0,.04+i*.07,0,i%2?'#989f99':'#b1b5a8',7);m.rotation.y=i*.2;}
  if(type==='basalt')for(let i=0;i<4;i++)cyl(g,.11,.13,.26+i*.12,(i%2)*.2,.13+i*.06,(i/2|0)*.16,i%2?'#7d8980':'#909b8e',6);
  if(type==='crystal')for(let i=0;i<5;i++){let x=(rnd()-.5)*.4,z=(rnd()-.5)*.3,h=.18+rnd()*.4;cyl(g,.075,.09,h,x,h/2,z,i%2?'#b1c7c4':'#ccd8cf',5);cyl(g,0,.075,.14,x,h+.07,z,'#c7d8d0',5);}return g;
 }
 if(['cottage','greenhouse','windmill','tent'].includes(type)){
  if(type==='cottage'){house(g,v);box(g,1.1,.08,1.0,0,.04,0,'#d8c49e');for(let x of [-.47,.47])box(g,.09,.7,.05,x,.42,.46,'#aa9e7f');box(g,.55,.04,.27,0,.13,.64,'#d4bf96');}
  if(type==='greenhouse'){box(g,1.2,.10,1.05,0,.05,0,'#bfba99');let glass=new T.MeshStandardMaterial({color:'#c8e1d4',transparent:true,opacity:.48,roughness:.45,side:T.DoubleSide});let m=new T.Mesh(new T.BoxGeometry(1.08,.72,.92),glass);m.position.y=.44;g.add(m);for(let x of [-.55,0,.55])for(let z of [-.47,.47])box(g,.035,.75,.035,x,.46,z,'#ede2bc');for(let side of [-1,1]){let r=box(g,.70,.026,1.02,side*.28,.93,0,'#afc6b6');r.rotation.z=-side*.55;for(let z of [-.49,0,.49])strip(g,[side*.56,.76,z],[0,1.10,z],.03,.03,'#e7dcb9');}for(let x of [-.35,0,.35]){cyl(g,.08,.055,.12,x,.16,0,'#bc8e65',7);ball(g,.12,x,.30,0,'#819a5c');}}
  if(type==='windmill'){cyl(g,.28,.47,1.3,0,.65,0,'#e0d0a4',6);cyl(g,0,.49,.43,0,1.50,0,'#ae8252',6);box(g,.16,.35,.026,0,.19,.42,'#836744');for(let i=0;i<4;i++){let a=i*Math.PI/2+.25,x=Math.sin(a)*.45,y=1.02+Math.cos(a)*.45;let blade=box(g,.16,.78,.045,x,y,.36,'#c6b58c');blade.rotation.z=-a;for(let j=0;j<4;j++){let aa=a;let slat=box(g,.23,.025,.032,Math.sin(aa)*(.18+j*.13),1.02+Math.cos(aa)*(.18+j*.13),.39,'#e6dab6');slat.rotation.z=-aa;}}ball(g,.07,0,1.02,.41,'#997b50');}
  if(type==='tent'){let geo=faceGeo([[-.65,0,-.55],[0,.85,-.55],[.65,0,-.55],[-.65,0,.55],[.65,0,.55],[0,.85,.55],[-.65,0,-.55],[-.65,0,.55],[0,.85,.55],[-.65,0,-.55],[0,.85,.55],[0,.85,-.55],[.65,0,-.55],[0,.85,-.55],[0,.85,.55],[.65,0,-.55],[0,.85,.55],[.65,0,.55]]);mesh(g,geo,'#cdb58a');mesh(g,faceGeo([[-.23,0,.557],[.23,0,.557],[0,.57,.557]]),'#7c795a');strip(g,[0,.85,-.65],[0,.85,.65],.035,.035,'#a68b60');}return g;
 }
 if(type==='stonewall'){for(let i=0;i<2;i++)for(let j=0;j<2;j++){let m=ball(g,.15,j*.19,.10+i*.17,0,i%2?'#a7aa95':'#b6b69e',0);m.scale.set(1.15,.6,.7);}return g;}
 if(['lantern','well','picnic','flowerpot','sign','cart','fountain','windchime'].includes(type)){
  if(type==='lantern'){box(g,.05,1.1,.05,0,.55,0,'#a18b5a');strip(g,[0,1.1,0],[.35,1.1,0],.04,.035,'#a18b5a');let m=ball(g,.18,.30,.85,0,'#e8c78d',1);m.scale.set(.8,1.2,.8);cyl(g,.08,.08,.03,.30,1.05,0,'#b29760');}
  if(type==='well'){cyl(g,.34,.34,.40,0,.2,0,'#b6b39b',9);cyl(g,.25,.25,.025,0,.41,0,'#698b83',9);for(let x of [-.4,.4])box(g,.055,.75,.055,x,.5,0,'#a78a57');for(let side of [-1,1]){let r=box(g,.55,.045,.65,side*.21,.91,0,'#ad8552');r.rotation.z=-side*.5;}strip(g,[-.4,.64,0],[.4,.64,0],.045,.045,'#8e7952');}
  if(type==='picnic'){box(g,.95,.055,.52,0,.47,0,'#bd9b66');for(let z of [-.46,.46]){box(g,.95,.045,.18,0,.27,z,'#c4a373');for(let x of [-.33,.33])strip(g,[x,0,z],[x*.6,.46,z*.3],.06,.05,'#9f8558');}box(g,.28,.009,.3,.08,.505,.02,'#e1c1aa');}
  if(type==='flowerpot'){cyl(g,.20,.13,.3,0,.15,0,'#c79b77',9);cyl(g,.22,.22,.035,0,.29,0,'#d8b38b');for(let i=0;i<5;i++){let x=(rnd()-.5)*.2,z=(rnd()-.5)*.2;strip(g,[x,.3,z],[x,.55,z],.018,.018,'#7f9756');bloom(x,.55,z,5,.09,'#dfb286');}}
  if(type==='sign'){box(g,.05,.75,.05,0,.375,0,'#a2875a');box(g,.58,.18,.055,.08,.63,0,'#c6a776');mesh(g,faceGeo([[.37,.54,.03],[.49,.63,.03],[.37,.72,.03]]),'#c6a776');}
  if(type==='cart'){box(g,.7,.30,.47,0,.35,0,'#c6a774');for(let x of [-.27,.27])for(let z of [-.27,.27]){let m=cyl(g,.12,.12,.035,x,.16,z,'#82704c',9);m.rotation.x=Math.PI/2;}for(let i=0;i<9;i++){let x=(rnd()-.5)*.5,z=(rnd()-.5)*.3;ball(g,.10,x,.57,z,i%2?'#cda1a5':'#e6c688');}strip(g,[.35,.4,0],[.8,.5,0],.04,.04,'#a38d60');}
  if(type==='fountain'){cyl(g,.60,.63,.10,0,.05,0,'#c4c4ae',12);cyl(g,.48,.48,.025,0,.12,0,'#87b8b0',16);cyl(g,.07,.13,.40,0,.31,0,'#b8bba5',9);cyl(g,.26,.18,.09,0,.55,0,'#cfd0b8',12);for(let i=0;i<8;i++){let a=i*Math.PI/4;strip(g,[0,.75,0],[Math.cos(a)*.22,.3,Math.sin(a)*.22],.013,.013,'#c0dcd0');}}
  if(type==='windchime'){box(g,.04,1.0,.04,-.15,.5,0,'#b0986f');box(g,.4,.035,.035,.03,1.0,0,'#b0986f');cyl(g,.16,.12,.13,.16,.84,0,'#bfc9b9',8);strip(g,[.16,.8,0],[.16,.39,0],.01,.01,'#ae9a74');box(g,.10,.20,.012,.16,.36,0,'#d2c8b8');}return g;
 }
 if(['person','child','cat','dog','rabbit','deer','sheep','duck','bird','butterfly'].includes(type)){
  if(type==='person'||type==='child'){let size=type==='child'?.74:1;ball(g,.095,0,.72,0,'#dfc4a0',1);cyl(g,.12,.19,.32,0,.47,0,type==='child'?'#bd9b7a':'#8b9b8a',7);for(let x of [-.065,.065]){strip(g,[x,.32,0],[x,.06,.015],.07,.06,'#8b8772');box(g,.10,.05,.15,x,.035,.035,'#776c53');}for(let x of [-.15,.15])strip(g,[x,.57,0],[x*1.2,.34,.03],.055,.055,'#d6bd99');cyl(g,.18,.18,.03,0,.82,0,'#c8b487',10);cyl(g,.10,.12,.09,0,.86,0,'#c8b487',10);g.scale.setScalar(size);}
  else if(type==='butterfly'){for(let side of [-1,1]){let m=petal(g,side*.015,.35,0,.24,.24,side<0?'#e0b272':'#e7c78f',side*1.0);m.rotation.y=side*.5;}strip(g,[0,.28,.01],[0,.45,.01],.018,.018,'#8c7b55');}
  else if(type==='bird'){let m=ball(g,.11,0,.14,0,'#9c9b83');m.scale.set(1.2,1,1);ball(g,.075,0,.24,.08,'#a9a58e');mesh(g,faceGeo([[0,.24,.15],[.03,.22,.21],[-.03,.22,.15]]),'#c19e64');for(let side of [-1,1])petal(g,side*.05,.12,0,.14,.15,'#8c907d',side*.6);}
  else if(type==='duck'){let m=ball(g,.16,0,.15,0,'#d9d6b2',1);m.scale.set(1.4,.8,1);ball(g,.09,0,.30,.16,'#7e927c',1);box(g,.12,.035,.11,0,.29,.25,'#c4a665');}
  else{let col={cat:'#b8a889',dog:'#bb9975',rabbit:'#e0d6bd',deer:'#bf9f76',sheep:'#ded9bf'}[type],body=ball(g,type==='deer'?.23:.17,0,type==='deer'?.42:.24,0,col,type==='sheep'?1:0);body.scale.set(1,1,1.5);let headY=type==='deer'?.68:.39,headZ=type==='deer'?.28:.19;ball(g,.12,0,headY,headZ,col,1);for(let x of [-.07,.07]){let ear=box(g,.055,type==='rabbit'?.24:.10,.035,x,headY+(type==='rabbit'?.18:.10),headZ,col);ear.rotation.z=x>0?-.15:.15;ball(g,.014,x*.6,headY+.015,headZ+.10,'#665d4b');}for(let x of [-.11,.11])for(let z of [-.14,.14])strip(g,[x,type==='deer'?.4:.2,z],[x,.035,z],.045,.04,col);if(type==='cat'||type==='dog')strip(g,[0,.25,-.17],[.03,.4,-.36],.03,.025,col);if(type==='deer')for(let x of [-.07,.07]){strip(g,[x,.76,.25],[x*1.7,.96,.24],.027,.025,'#947951');strip(g,[x*1.5,.9,.24],[x*2.8,.96,.20],.02,.02,'#947951');}if(type==='sheep')for(let i=0;i<10;i++)ball(g,.10,(rnd()-.5)*.35,.28+rnd()*.15,(rnd()-.5)*.4,'#e5dfc5',1);}
  return g;
 }
 return null;
}
