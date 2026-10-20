import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
let actorMaterial;const prototypes=new Map();
export function paperActor(type,v,k){
 const key=type+Math.min(2,Math.floor(v*3));if(prototypes.has(key))return prototypes.get(key).clone(true);
 const g=buildActor(type,(Math.min(2,Math.floor(v*3))+.5)/3,k);
 if(!actorMaterial){actorMaterial=k.mat('#ffffff').clone();actorMaterial.vertexColors=true;actorMaterial.onBeforeCompile=k.mat('#ffffff').onBeforeCompile;}
 function bake(parent){for(let c of [...parent.children])if(c.isGroup)bake(c);let meshes=parent.children.filter(c=>c.isMesh),geoms=[];for(let m of meshes){m.updateMatrix();let geo=m.geometry.clone();if(geo.index)geo=geo.toNonIndexed();geo.applyMatrix4(m.matrix);let n=geo.attributes.position.count,col=new Float32Array(n*3),materials=Array.isArray(m.material)?m.material:[m.material],groups=geo.groups.length?geo.groups:[{start:0,count:n,materialIndex:0}];for(let part of groups){let color=materials[part.materialIndex]?.color||materials[0].color;for(let i=part.start;i<part.start+part.count;i++){col[i*3]=color.r;col[i*3+1]=color.g;col[i*3+2]=color.b;}}geo.clearGroups();geo.setAttribute('color',new T.BufferAttribute(col,3));geoms.push(geo);parent.remove(m);}if(geoms.length){let m=new T.Mesh(mergeGeometries(geoms,false),actorMaterial);m.castShadow=m.receiveShadow=true;parent.add(m);geoms.forEach(x=>x.dispose());}}
 bake(g);prototypes.set(key,g);return g.clone(true);
}
function buildActor(type,v,k){
 const {mat,box,strip,cyl}=k,g=new T.Group();g.userData.actor=true;
 function panel(parent,points,color,depth=.035,z=0,smooth=false){let s;if(!Array.isArray(points))s=points;else{s=new T.Shape();if(smooth){let last=points.at(-1),first=points[0];s.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);for(let i=0;i<points.length;i++){let a=points[i],b=points[(i+1)%points.length];s.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}}else points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();}let edge=Math.min(.007,depth*.19),geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:edge,bevelThickness:edge,bevelSegments:1,curveSegments:8});geo.translate(0,0,-depth/2);let m=new T.Mesh(geo,[mat(color),mat(depth>.085?'#'+new T.Color(color).multiplyScalar(.82).getHexString():'#e6d3af')]);m.position.z=z;m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function oval(parent,x,y,rx,ry,color,z=0,depth=.018){let s=new T.Shape();s.absellipse(x,y,rx,ry,0,Math.PI*2,false,0);return panel(parent,s,color,depth,z);}
 function flatDot(parent,x,y,r,color,z){for(let side of [-1,1]){let m=new T.Mesh(new T.CircleGeometry(r,12),mat(color));m.position.set(x,y,side*z);if(side<0)m.rotation.y=Math.PI;parent.add(m);}}
 const eye=(p,x,y,z,r=.018)=>{flatDot(p,x,y,r,'#302b28',z);flatDot(p,x-.004,y+.005,r*.30,'#fff8e7',z+.001);};
 function part(name,x,y,z){let p=new T.Group();p.name=name;p.position.set(x,y,z);g.add(p);return p;}
 function line(parent,a,b,color='#664c35',width=.008){return strip(parent,a,b,width,.008,color);}
 function leg(name,x,y,z,len,color,paw=color){let p=part(name,x,y,z);panel(p,[[-.027,.005],[.032,.005],[.034,-len+.02],[.065,-len-.005],[.064,-len-.041],[-.035,-len-.039]],color,.045,0,true);oval(p,.022,-len-.025,.045,.024,paw,.028,.010);return p;}
 function ear(parent,x,y,h,color,inner,z=0,tilt=0){let e=new T.Group();e.position.set(x,y,z);e.rotation.z=tilt;let s=new T.Shape();s.moveTo(-.045,0);s.bezierCurveTo(-.08,h*.35,-.06,h,.004,h);s.bezierCurveTo(.062,h,.068,h*.4,.042,0);s.closePath();panel(e,s,color,.036);let t=new T.Shape();t.moveTo(-.019,.025);t.bezierCurveTo(-.044,h*.4,-.028,h*.86,.005,h*.89);t.bezierCurveTo(.035,h*.84,.031,h*.35,.018,.03);t.closePath();panel(e,t,inner,.009,.026);parent.add(e);return e;}
 function fold(parent,points,color){let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geo.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(p=>[p[0]*2,p[1]*2]),2));geo.computeVertexNormals();let m=new T.Mesh(geo,mat(color));m.castShadow=m.receiveShadow=true;parent.add(m);}
 if(type==='person'||type==='child'){
  let coat=type==='child'?'#d59056':['#d8a246','#66968e','#b66858'][Math.floor(v*3)],skin='#efd0ac';leg('legL',-.055,.30,-.05,.23,'#546575','#675747');leg('legR',.055,.30,.05,.23,'#546575','#675747');
  panel(g,[[-.13,.32],[-.11,.63],[-.06,.69],[.065,.69],[.13,.34],[.04,.29],[-.05,.29]],coat,.19,0,true);for(let y of [.40,.49,.58])oval(g,.035,y,.009,.009,'#efd29a',.11,.007);
  for(let side of [-1,1]){let p=part(side<0?'armL':'armR',side*.11,.60,side*.075);panel(p,[[0,0],[.046,-.01],[.061,-.21],[.01,-.22]],coat,.05,0,true);oval(p,.035,-.224,.027,.033,skin,.012);}
  oval(g,0,.77,.105,.12,skin,0,.14);panel(g,[[-.104,.78],[-.10,.88],[-.03,.916],[.07,.90],[.10,.85],[.055,.855],[.025,.87],[-.04,.85],[-.055,.77]],'#594230',.11,-.015,true);eye(g,.045,.775,.079,.014);flatDot(g,.066,.744,.014,'#e7ad8f',.082);
  cyl(g,.165,.165,.024,0,.895,0,'#d8b56c',20);cyl(g,.10,.12,.08,0,.943,0,'#e4c27f',14);cyl(g,.119,.119,.018,0,.914,0,'#977545',14);box(g,.13,.15,.065,-.13,.43,.14,'#b07845');line(g,[-.10,.65,.12],[-.10,.42,.16],'#e8c991',.016);if(type==='child')g.scale.setScalar(.78);return g;
 }
 if(type==='butterfly'){
  panel(g,[[-.017,.18],[-.026,.36],[0,.43],[.026,.36],[.017,.18]],'#5b4735',.035,0,true);
  for(let side of [-1,1]){let w=part(side<0?'wingL':'wingR',0,.33,0),s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(side*.10,.20,side*.32,.25,side*.34,.10);s.bezierCurveTo(side*.36,.02,side*.24,-.015,side*.18,-.025);s.bezierCurveTo(side*.34,-.10,side*.22,-.28,side*.12,-.22);s.bezierCurveTo(side*.05,-.20,side*.01,-.08,0,0);s.closePath();panel(w,s,'#80502f',.025);let m=panel(w,s,v>.5?'#edb549':'#d58a49',.014,.022);m.scale.set(.88,.88,1);for(let sy of [-.13,.08]){oval(w,side*.18,sy,.058,.066,'#fff0b8',.038,.009);oval(w,side*.18,sy,.027,.034,'#8c5834',.047,.008);}for(let i=0;i<4;i++)oval(w,side*(.105+i*.046),.13-Math.sin(i*.6)*.05,.009,.012,'#fff2c9',.047,.005);}
  for(let side of [-1,1]){line(g,[side*.008,.41,0],[side*.064,.49,0],'#5b4735',.007);oval(g,side*.064,.49,.009,.009,'#6c5035',0,.01);}return g;
 }
 if(type==='bird'){
  panel(g,[[-.26,.17],[-.15,.19],[-.12,.31],[.045,.37],[.17,.32],[.21,.23],[.12,.115],[-.07,.085]],'#7097a2',.18,0,true);oval(g,.075,.24,.091,.102,'#dba872',.105,.012);oval(g,.10,.31,.09,.087,'#8aabb0',0,.15);eye(g,.14,.33,.09,.016);panel(g,[[.17,.31],[.29,.28],[.18,.255]],'#c89345',.065,0,true);
  for(let side of [-1,1]){let w=part(side<0?'wingL':'wingR',-.045,.235,side*.08);panel(w,[[0,.02],[-.14,.06],[-.29,-.05],[-.23,-.13],[-.15,-.12],[-.06,-.10],[.08,-.02]],'#4f7786',.024,0,true);for(let j=0;j<3;j++)line(w,[-.03-j*.045,-.02,side*.018],[-.10-j*.045,-.08,side*.018],'#9cb7b8',.008);}
  panel(g,[[-.16,.15],[-.34,.19],[-.28,.095],[-.13,.11]],'#4d707b',.03,0);leg('legL',.02,.10,-.042,.04,'#ae8145');leg('legR',-.06,.10,.042,.04,'#ae8145');return g;
 }
 if(type==='duck'){
  let s=new T.Shape();s.moveTo(-.30,.20);s.bezierCurveTo(-.24,.12,-.23,.04,-.05,.045);s.bezierCurveTo(.10,.04,.23,.12,.22,.27);s.bezierCurveTo(.20,.41,.13,.45,.065,.40);s.bezierCurveTo(.03,.34,.08,.29,-.04,.29);s.bezierCurveTo(-.18,.31,-.24,.26,-.30,.20);s.closePath();panel(g,s,'#e7dbb0',.23);
  oval(g,.13,.37,.094,.094,'#437b60',.04,.20);for(let side of [-1,1]){panel(g,[[.06,.30],[.185,.295],[.17,.27],[.06,.28]],'#fff1c9',.012,side*.10,true);panel(g,[[-.21,.21],[-.09,.28],[.09,.21],[.10,.16],[-.01,.105],[-.16,.12]],'#b9ab77',.026,side*.13,true);for(let i=0;i<3;i++)line(g,[-.13+i*.06,.19,side*.148],[-.17+i*.055,.14,side*.148],'#eddfb6',.010);}
  panel(g,[[.18,.385],[.33,.365],[.32,.325],[.19,.325]],'#d9983d',.105,0,true);eye(g,.162,.392,.155,.016);leg('legL',-.05,.085,-.06,.025,'#ce8d3e');leg('legR',.065,.085,.06,.025,'#ce8d3e');return g;
 }
 const cat=type==='cat',dog=type==='dog',rabbit=type==='rabbit',deer=type==='deer',sheep=type==='sheep';
 const col=cat?(v>.65?'#9b9990':'#cf9856'):dog?(v>.65?'#93664b':'#b78350'):rabbit?'#eee4cb':deer?'#bd8c52':'#e5d6b1',light=cat?'#f1cf91':dog?'#e6c297':rabbit?'#fff5de':deer?'#e4c38e':'#f7e9c5';
 let base=deer?.39:rabbit?.18:.23,L=deer?.30:rabbit?.22:.25,depth=deer?.235:rabbit?.27:.255;
 for(let side of [-1,1])for(let front of [-1,1])leg((side<0?'back':'front')+(front<0?'L':'R'),front*(deer?.19:.14),base,side*depth*.39,base-.055,sheep?'#715a44':col,rabbit||cat?light:sheep?'#69523c':col);
 const body=new T.Shape();body.moveTo(-L,base+.025);body.bezierCurveTo(-L-.06,base+.10,-L-.045,base+.30,-.04,base+.30);body.bezierCurveTo(.13,base+.30,L+.02,base+.24,L,base+.10);body.bezierCurveTo(L,base-.018,-.08,base-.04,-L,base+.025);body.closePath();panel(g,body,col,depth);
 for(let side of [-1,1]){let flank=panel(g,[[-L+.015,base+.11],[-L+.07,base+.25],[.02,base+.27],[L-.02,base+.19],[L-.07,base+.065],[-.12,base+.05]],rabbit||sheep?light:col,.017,side*(depth/2+.012),true);flank.rotation.x=side*.08;}
 let foldColor=cat?'#ddaf72':dog?'#c69667':deer?'#d3a66b':light;fold(g,[[-L+.06,base+.245,-depth*.43],[-.08,base+.322,0],[L-.06,base+.22,-depth*.42],[-L+.06,base+.245,depth*.43],[L-.06,base+.22,depth*.42],[-.08,base+.322,0]],foldColor);for(let side of [-1,1])if(!sheep)panel(g,[[L-.12,base+.19],[L-.02,base+.18],[L-.035,base+.04],[L-.13,base+.055]],light,.012,side*(depth/2+.027),true);
 const hx=deer?.255:rabbit?.205:.245,hy=deer?.79:rabbit?.49:.565,head=part('head',hx,hy,0),headDepth=deer?.18:.24;
 panel(head,[[-.12,-.065],[-.145,.055],[-.08,.142],[.045,.146],[.132,.09],[.15,-.025],[.105,-.104],[-.025,-.12]],col,headDepth,0,true);
 for(let side of [-1,1]){oval(head,.075,-.045,.068,.043,rabbit?'#fff8e6':light,side*(headDepth/2+.012),.013);oval(head,.105,-.015,.024,.021,rabbit?'#e3b3a9':cat?'#c78a73':'#604938',side*(headDepth/2+.025),.010);eye(head,.067,.058,headDepth/2+.021,deer?.021:.020);flatDot(head,-.007,-.035,.018,rabbit?'#eac4b6':'#d6a482',headDepth/2+.023);line(head,[.10,-.033,side*(headDepth/2+.03)],[.10,-.061,side*(headDepth/2+.03)],'#8c6852',.005);}
 if(cat){for(let side of [-1,1]){panel(head,[[-.13,.06],[-.12,.245],[-.017,.135]],col,.06,side*.052,true);panel(head,[[-.105,.13],[-.102,.205],[-.055,.14]],'#d8aa98',.014,side*.088,true);}for(let side of [-1,1]){for(let i=0;i<3;i++){line(head,[.115,-.05+i*.015,side*.132],[.225,-.085+i*.035,side*.145],'#eedab5',.005);panel(g,[[-.15+i*.13,base+.25],[-.105+i*.13,base+.245],[-.13+i*.13,base+.12],[-.16+i*.13,base+.13]],'#a57342',.009,side*(depth/2+.027),true);}for(let i=0;i<2;i++)panel(head,[[-.025+i*.045,.125],[.005+i*.045,.12],[-.005+i*.045,.085]],'#a57342',.01,side*.115,true);}}
 else if(dog){for(let side of [-1,1]){panel(head,[[-.13,.10],[-.035,.12],[-.015,.02],[-.045,-.14],[-.13,-.15],[-.17,-.015]],'#835638',.033,side*.105,true);panel(g,[[.12,base+.27],[.22,base+.25],[.24,base+.17],[.13,base+.18]],'#537c7a',.018,side*.15,true);oval(g,.18,base+.16,.025,.028,'#d7b56d',side*.163,.012);}}
 else{ear(head,-.074,.105,rabbit?.35:.17,col,rabbit?'#ddb0a2':'#d6b184',-.055,rabbit?.12:.25);ear(head,.035,.115,rabbit?.38:.15,col,rabbit?'#e3b8a8':'#e8c99b',.055,rabbit?-.09:-.28);}
 if(deer){for(let side of [-1,1]){line(head,[-.045,.18,side*.04],[-.095,.34,side*.10],'#906a42',.019);line(head,[-.08,.29,side*.08],[-.18,.32,side*.10],'#906a42',.013);line(head,[-.08,.29,side*.08],[-.06,.38,side*.09],'#906a42',.013);for(let i=0;i<7;i++)oval(g,-.17+(i%4)*.09,base+.13+Math.floor(i/4)*.085,.015,.021,'#f4dfb2',side*(depth/2+.031),.009);}}
 if(sheep){for(let side of [-1,1]){let wool=new T.Shape(),cx=-.04,cy=base+.17;for(let i=0;i<12;i++){let a=i/12*Math.PI*2,b=(i+1)/12*Math.PI*2,ax=cx+Math.cos(a)*.27,ay=cy+Math.sin(a)*.16,bx=cx+Math.cos(b)*.27,by=cy+Math.sin(b)*.16,m=(a+b)/2;i?wool.lineTo(ax,ay):wool.moveTo(ax,ay);wool.quadraticCurveTo(cx+Math.cos(m)*.32,cy+Math.sin(m)*.21,bx,by);}wool.closePath();panel(g,wool,light,.025,side*(depth/2+.022));for(let i=0;i<4;i++){let a=i*1.7;line(g,[-.18+i*.09,base+.15,side*.17],[-.145+i*.09,base+.18,side*.17],'#cfbd98',.006);}panel(head,[[-.10,-.07],[-.12,.04],[-.05,.11],[.07,.105],[.115,.035],[.10,-.065],[.02,-.10]],'#75624c',.02,side*.119,true);eye(head,.067,.047,.14,.018);}}
 const tail=part('tail',-L,base+.17,0);panel(tail,rabbit?[[0,0],[-.10,-.01],[-.14,.055],[-.10,.12],[-.015,.11]]:cat?[[0,0],[-.07,.035],[-.15,.23],[-.17,.35],[-.13,.40],[-.08,.365],[-.11,.31],[-.09,.21],[-.02,.07]]:dog?[[0,0],[-.18,.11],[-.24,.19],[-.21,.22],[-.14,.16],[-.02,.055]]:[[0,0],[-.17,.10],[-.21,.075],[-.14,.025],[-.02,-.025]],rabbit?'#fff4dc':col,.05,0,true);
 return g;
}
export function animatePaperActor(g,type,t,moving,reduced=false){
 if(!g._parts){g._parts={};g.traverse(o=>{if(o.name)g._parts[o.name]=o;});}const parts=g._parts;
 const speed=moving?1:0,phase=t*(type==='rabbit'?13:8),hop=type==='rabbit'?Math.abs(Math.sin(phase))*.06*speed:Math.abs(Math.sin(phase))*.008*speed;
 for(let name of ['frontL','frontR','backL','backR','legL','legR']){let p=parts[name];if(p)p.rotation.z=Math.sin(phase+(name.endsWith('R')?Math.PI:0)+(name.startsWith('back')?Math.PI:0))*.34*speed;}
 for(let name of ['armL','armR']){let p=parts[name];if(p)p.rotation.x=Math.sin(phase+(name==='armL'?Math.PI:0))*.28*speed;}
 if(parts.head)parts.head.rotation.z=Math.sin(t*.8)*.04;if(parts.tail)parts.tail.rotation.x=Math.sin(t*(type==='dog'?7:2))*.25;
 for(let name of ['wingL','wingR']){let p=parts[name];if(p)p.rotation.y=(name==='wingL'?-1:1)*(.20+Math.sin(t*(type==='butterfly'?10:14))*.64);}
 return reduced?0:hop;
}
