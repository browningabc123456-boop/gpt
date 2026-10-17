import * as T from 'three';
import {textile,piping} from './art-materials.js';
const mat=(color,roughness=.72)=>new T.MeshStandardMaterial({color,roughness});
export function decorateRoom(v){
 const g=v.base,l=v.physics.level,m=v.m;
 v.box(g,[70,.3,70],[0,-1.3,0],m.roomWood,.03);
 for(let x=-20;x<24;x+=2.2)v.box(g,[.018,.012,40],[x,-1.143,0],mat('#cbaa7a'),.002);
 v.box(g,[35,17,.28],[0,7,-10.5],mat(l.wall),.06);
 v.box(g,[35,.3,.18],[0,-.8,-10.28],m.cream,.035);
 lounge(v);
 const window=new T.Group();window.position.set(-.6,6,-10.15);g.add(window);
 const space=l.decor==='space';
 v.box(window,[8,5.7,.10],[0,0,0],mat(space?'#444c83':'#9dd8ec'),.06);
 // Layered distant trees, clouds and sun are real meshes beyond the window frame.
 if(space){for(let i=0;i<27;i++)v.sphere(window,[.025,.025,.014],[Math.sin(i*19)*3.7,Math.cos(i*13)*2.6,.08],new T.MeshBasicMaterial({color:'#fff3c6'}));v.sphere(window,[.75,.75,.05],[2.2,.8,.09],mat('#eee2b5'));}
 else{v.sphere(window,[.55,.55,.05],[2.2,1.35,.07],new T.MeshBasicMaterial({color:'#fff0bd'}));for(let i=0;i<8;i++)v.sphere(window,[1.1,.6,.1],[-3.8+i*1.05,-2.15+Math.sin(i)*.25,.07],mat(i%2?'#78b675':'#a9ce81'));for(const x of [-2.2,.5,2.4])v.sphere(window,[.7,.2,.06],[x,1.3+Math.sin(x),.07],mat('#fff7e7'));}
 for(const x of [-4.08,0,4.08])v.box(window,[.16,5.95,.25],[x,0,.18],m.cream,.025);
 for(const y of [-2.95,0,2.95])v.box(window,[8.3,.16,.25],[0,y,.18],m.cream,.025);
 v.box(window,[9,.23,.7],[0,-3.05,.2],m.lightWood,.035);
 const curtainFabric=textile(space?'#b6a6d3':'#f2d7a2');
 for(const side of [-1,1])for(let i=0;i<6;i++){
  const curtain=v.cylinder(window,.11,.17,6.2,[side*(4.4+i*.13),0,.25],curtainFabric,8);curtain.scale.z=.7;
 }
 v.plant(g,[-6.5,-1.1,-8],2.7);v.plant(g,[7.8,-1.1,-7.5],2.2);
 v.box(g,[2.8,.18,.5],[7.6,5,-10.1],m.lightWood,.045);
 for(let i=0;i<3;i++){const book=v.box(g,[.32,.8,.4],[6.7+i*.37,5.5,-10.0],mat([l.color,l.accent,'#e2a090'][i]),.025);book.rotation.z=(i-1)*.1;}
 const frame=v.box(g,[1.35,1.6,.13],[-7,6.5,-10.15],m.lightWood,.06);v.label(g,'♡','HOME SWEET HOME',[-7,6.5,-10.05],1.17,1.42,'#fff2d6',l.color);
 if(l.decor==='space'){for(const p of [[-4,7,-8.8],[3,8,-8.9],[6,6.8,-8.8]]){v.sphere(g,[.48,.48,.48],p,mat(p[0]>0?'#c6a3da':'#d8ba86'));const ring=new T.Mesh(new T.TorusGeometry(.78,.035,8,48),m.sage);ring.position.set(...p);ring.rotation.x=1.0;g.add(ring);}}
}
function carpet(v,x,z,r,color,paws=false){
 const g=v.base;const fabric=textile(color);v.cylinder(g,r,r,.055,[x,.043,z],fabric,64);
 const stitches=[];for(let i=0;i<100;i++){const a=i/100*Math.PI*2;stitches.push([x+Math.cos(a)*(r-.09),.078,z+Math.sin(a)*(r-.09)]);}piping(g,stitches,'#eee3c3',.009);
 const tuft=new T.InstancedMesh(new T.ConeGeometry(.008,.026,3),fabric,2400),dummy=new T.Object3D();for(let i=0;i<2400;i++){const a=i*2.399963,radius=Math.sqrt((i+.5)/2400)*(r-.07);dummy.position.set(x+Math.cos(a)*radius,.075,z+Math.sin(a)*radius);dummy.rotation.z=Math.sin(i)*.25;dummy.updateMatrix();tuft.setMatrixAt(i,dummy.matrix);}g.add(tuft);const trim=new T.Mesh(new T.TorusGeometry(r-.045,.025,6,80),mat('#fff3d5'));trim.rotation.x=Math.PI/2;trim.position.set(x,.06,z);g.add(trim);
 if(paws){v.sphere(g,[.26,.009,.24],[x,.065,z+.03],mat('#fff6da'));for(const [dx,dz]of [[-.26,-.25],[-.09,-.39],[.11,-.38],[.28,-.21]])v.sphere(g,[.10,.009,.12],[x+dx,.065,z+dz],mat('#fff6da'));}
}
export function decorateCage(v){
 const g=v.base,l=v.physics.level,m=v.m,index=v.physics.index;
 if(index===0){carpet(v,-.2,1.4,1.65,'#9ebd59',true);v.toyArch(g,[3.5,.05,2.9]);v.plant(g,[-5.25,.05,-1.8],.9);}
 if(index===1){
  for(let x=-5.5;x<6;x+=1.1)for(let z=-4;z<4.5;z+=1.1)if((Math.round(x*10)+Math.round(z*10))%2===0)v.box(g,[1.05,.025,1.05],[x,.018,z],mat('#f8e8dc'),.015);
  for(let i=0;i<7;i++)v.box(g,[1.65,.17,.85],[-5+i*1.65,3.85,-4.1],mat(i%2?'#ffecd6':'#e998aa'),.06);
  for(const p of [[-4.9,.08,3.4],[4.6,.08,1.8]])v.cupcake(g,p);
  carpet(v,-2.5,2.4,1.1,'#e7a4b2',true);
 }
 if(index===2){
  v.cylinder(g,1.5,1.5,.025,[-.4,.02,1.8],new T.MeshPhysicalMaterial({color:'#81c5bd',roughness:.2,clearcoat:.7}),64);
  for(const [x,z]of [[-1.9,1.8],[-1,3.0],[.7,3],[1.05,1.1]])v.sphere(g,[.3,.11,.22],[x,.1,z],mat('#a1ac91'));
  for(const p of [[-5.2,.05,-2],[4.8,.05,3.2],[1.5,.55,2.4],[2.4,.55,2.6],[3.1,.55,2.4]])v.plant(g,p,.8);
  // Greenhouse ribs make this enclosure read as a little glasshouse.
  for(const x of [-5.9,5.9]){const rib=v.box(g,[.09,.1,9.2],[x,4.55,0],m.sage,.025);}
  for(const z of [-4.4,0,4.4]){for(const side of [-1,1]){const rib=v.box(g,[6.25,.08,.08],[side*3.0,4.9,z],m.sage,.025);rib.rotation.z=side*-.12;}}
 }
 if(index===3){
  for(let x=-5.6;x<6;x+=.48)v.box(g,[.018,.02,8.8],[x,.025,0],mat('#c6ae7b'),.005);
  carpet(v,-3.4,2.6,1.3,'#a0cddc');
  for(const z of [-3.3,1.9,3.2])v.lifebuoy(g,[5.91,2.8,z]);
  v.lighthouse(g,[-4.7,0,-3.4]);
  const mast=v.cylinder(g,.035,.035,2.9,[.1,2.0,2.2],m.lightWood,10);
  const sail=new T.Shape();sail.moveTo(0,0);sail.lineTo(0,1.5);sail.lineTo(1.15,.18);sail.closePath();const mesh=new T.Mesh(new T.ExtrudeGeometry(sail,{depth:.018,bevelEnabled:false}),mat('#fff7e0'));mesh.position.set(.1,1.65,2.2);g.add(mesh);
  for(let i=0;i<9;i++){const buoy=v.sphere(g,[.13,.13,.13],[-5.5+i*1.35,3.65,-4.43],mat(i%2?'#f0b26b':'#b9d8e4'));}
 }
 if(index===4){
  for(const p of [[-1.7,.035,2.0],[2.8,.035,3.1],[-3.0,.035,.8]]){v.cylinder(g,.55,.65,.04,p,mat('#bbb0d6'),32);const ring=new T.Mesh(new T.TorusGeometry(.5,.035,8,40),mat('#e4deef'));ring.rotation.x=Math.PI/2;ring.position.set(p[0],p[1]+.03,p[2]);g.add(ring);}
  for(let i=0;i<12;i++)v.star(g,[-5.2+i*.9,3.7+Math.sin(i)*.2,-4.43],.12);
  v.rocket(g,[-4.8,0,-3.5]);
  const planet=new T.Mesh(new T.SphereGeometry(.45,24,16),mat('#e5ba78'));planet.position.set(1.1,4.25,-3.6);g.add(planet);const orbit=new T.Mesh(new T.TorusGeometry(.73,.035,8,48),mat('#ceaddb'));orbit.position.copy(planet.position);orbit.rotation.x=1.1;g.add(orbit);
 }
 if(index===5){
  const colors=['#f1cf97','#c4dcc3','#c0d6e6','#e3c3d3'];let n=0;
  for(let x=-5;x<=5;x+=2)for(let z=-3.5;z<=3.5;z+=1.75)v.box(g,[1.95,.035,1.70],[x,.025,z],mat(colors[n++%4]),.07);
  v.toyArch(g,[-3.2,.07,-.3]);v.toyArch(g,[3.8,.07,3.2]);
  for(const side of [-1,1])for(let i=0;i<5;i++){const balloon=v.sphere(g,[.17,.21,.17],[side*(2+i*.6),3.75+Math.sin(i)*.17,-4.35],mat(colors[i%4]));}
  const pinwheel=new T.Group();pinwheel.position.set(-4.7,2.3,-3.7);g.add(pinwheel);v.cylinder(g,.025,.025,2.3,[-4.7,1.15,-3.7],m.lightWood,8);
  for(let i=0;i<4;i++){const vane=v.box(pinwheel,[.42,.38,.035],[Math.sin(i*Math.PI/2)*.23,Math.cos(i*Math.PI/2)*.23,0],mat(colors[i]),.06);vane.rotation.z=-i*Math.PI/2-.25;}v.pinwheel=pinwheel;
 }
}
export function themeStructureMesh(v,body){
 const {size:s,kind,color}=body.meta,p=body.position,m=v.m,g=v.base;let mesh;
 const surface=new T.MeshPhysicalMaterial({color,roughness:.68,clearcoat:.15});
 if(kind==='log'){mesh=v.cylinder(g,s[0]/2,s[0]/2,s[1],[p.x,p.y,p.z],surface,32);v.cylinder(g,s[0]*.455,s[0]*.455,.025,[p.x,p.y+s[1]/2+.01,p.z],m.lightWood,32);}
 else mesh=v.box(g,s,[p.x,p.y,p.z],surface,kind==='moon-rock'?.23:.08);
 if(kind==='counter'){
  v.box(g,[s[0]+.1,.12,s[2]+.12],[p.x,p.y+s[1]/2,p.z],mat('#fff0da'),.05);
  for(const x of [-.8,.1,.9])v.cupcake(g,[p.x+x,p.y+s[1]/2+.06,p.z]);v.label(g,'BAKERY','SWEET LITTLE THINGS',[p.x,p.y,p.z+s[2]/2+.01],1.6,.48,color,'#fff8e6');
 }
 if(kind==='oven'){v.box(g,[s[0]*.75,s[1]*.55,.045],[p.x,p.y-.1,p.z+s[2]/2+.02],mat('#7d6876'),.10);for(const x of [-.38,0,.38])v.sphere(g,[.06,.06,.04],[p.x+x,p.y+.52,p.z+s[2]/2+.05],mat('#ffe4b2'));}
 if(kind==='garden-bed'){v.box(g,[s[0]-.15,.06,s[2]-.15],[p.x,p.y+s[1]/2,p.z],mat('#887957'),.04);for(let i=0;i<4;i++)v.sphere(g,[.11,.14,.11],[p.x-.8+i*.5,p.y+s[1]/2+.13,p.z],mat('#c3bd66'));}
 if(kind==='boat'||kind==='dock'){for(let x=-s[0]/2+.2;x<s[0]/2;x+=.3)v.box(g,[.018,.025,s[2]-.1],[p.x+x,p.y+s[1]/2+.02,p.z],m.lightWood,.003);if(kind==='boat')v.label(g,'团子号','LITTLE EXPLORER',[p.x,p.y,p.z+s[2]/2+.01],1.3,.42,color,'#fff5e4');}
 if(kind==='habitat'){v.box(g,[s[0]*.6,s[1]*.52,.05],[p.x,p.y,p.z+s[2]/2+.02],mat('#657393'),.12);v.sphere(g,[.16,.16,.03],[p.x,p.y,p.z+s[2]/2+.06],mat('#cce5e2',.2));v.label(g,'MOON 01','',[p.x,p.y+.65,p.z+s[2]/2+.035],1.2,.25,color,'#7c75a3');}
 if(kind==='toy-castle'){for(const x of [-.8,0,.8])v.box(g,[.5,.35,s[2]],[p.x+x,p.y+s[1]/2+.17,p.z],mat(x===0?'#a3cabc':'#edc797'),.06);v.label(g,'TOY LAND','',[p.x,p.y,p.z+s[2]/2+.01],1.6,.35,color,'#fff2d5');}
 if(kind==='toy-block')v.label(g,'★','',[p.x,p.y,p.z+s[2]/2+.01],.7,.65,color,'#fff4db');
 mesh.userData.body=body;v.supportMeshes.push(mesh);return mesh;
}

function lounge(v){
 const g=v.base,l=v.physics.level,m=v.m,sofa=new T.Group();sofa.position.set(5.6,-1.07,-7.1);g.add(sofa);
 const upholstery=textile(l.decor==='space'?'#b6a8d2':'#eadbc0'),pillow=textile(l.color),ivory=textile('#fff5e0');
 v.box(sofa,[5.4,.45,2.0],[0,.55,0],upholstery,.2);
 v.box(sofa,[5.4,1.55,.50],[0,1.35,-.76],upholstery,.22);
 for(const side of [-1,1]){v.box(sofa,[.55,1.1,2.0],[side*2.52,1,0],upholstery,.22);for(const z of [-.63,.63])v.cylinder(sofa,.08,.10,.45,[side*2.15,.20,z],m.wood,12);}
 for(let i=0;i<3;i++){v.box(sofa,[1.50,.34,1.53],[(i-1)*1.54,.96,.04],ivory,.16);const points=[[-.69,0,-.65],[.69,0,-.65],[.69,0,.65],[-.69,0,.65]].map(p=>[p[0]+(i-1)*1.54,1.0,p[2]+.04]);piping(sofa,points,'#d9c5a5',.012);}
 for(const [x,color]of [[-1.65,pillow],[.2,ivory],[1.65,pillow]]){const cushion=v.box(sofa,[1.05,.95,.30],[x,1.60,-.35],color,.19);cushion.rotation.z=x*.12;cushion.rotation.x=-.13;v.sphere(sofa,[.07,.07,.035],[x,1.6,-.15],m.cream);}
 const rug=textile(l.decor==='space'?'#a99bc5':'#92b55e');v.cylinder(g,3.3,3.3,.035,[5.4,-1.1,-4.3],rug,64);
 const basket=new T.Group();basket.position.set(-7.7,-1.08,-5.5);g.add(basket);v.cylinder(basket,.92,.78,.65,[0,.34,0],m.wood,40);for(let i=0;i<10;i++){const ring=new T.Mesh(new T.TorusGeometry(.79+i*.012,.025,5,48),m.lightWood);ring.rotation.x=Math.PI/2;ring.position.y=.05+i*.061;basket.add(ring);}v.sphere(basket,[.86,.19,.86],[0,.64,0],pillow);
 for(const [x,z,color]of [[-6,-4,'#77b7be'],[7,-3,'#e3a15e'],[-6.8,-3.7,'#e8bd6c']]){v.sphere(g,[.26,.26,.26],[x,-.83,z],new T.MeshPhysicalMaterial({color,roughness:.38,clearcoat:.4}));}
 // Small framed paw art replaces the sparse, empty wall.
 for(let i=0;i<3;i++){const frame=new T.Group();frame.position.set(5.0+i*1.8,7.3,-10.13);frame.rotation.z=(i-1)*.04;g.add(frame);v.box(frame,[1.25,1.55,.11],[0,0,0],m.lightWood,.045);v.box(frame,[1.06,1.36,.025],[0,0,.07],m.cream,.025);v.sphere(frame,[.24,.21,.025],[0,-.15,.10],mat([l.color,l.accent,'#d89483'][i]));for(const [x,y]of [[-.27,.10],[-.10,.28],[.12,.27],[.29,.08]])v.sphere(frame,[.10,.12,.025],[x,y,.10],mat([l.color,l.accent,'#d89483'][i]));}
}
