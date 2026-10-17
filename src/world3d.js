import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CAGE,LEVELS3D} from './levels3d.js';
import {createHamster} from './hamster3d.js';
const UP=new T.Vector3(0,1,0);
function seeded(n){let s=n;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function mat(color,roughness=.75,metalness=0){return new T.MeshStandardMaterial({color,roughness,metalness});}
function texture(kind,color){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d'),rnd=seeded(149);
 c.fillStyle=color;c.fillRect(0,0,512,512);
 if(kind==='wood')for(let i=0;i<650;i++){c.strokeStyle=i%3?'#75502a0c':'#fff3c822';c.lineWidth=.4+rnd()*2;c.beginPath();const y=rnd()*512,x=rnd()*512;c.moveTo(x,y);c.bezierCurveTo(x+30,y-3,x+110,y+4,x+130+rnd()*100,y);c.stroke();}
 else if(kind==='cloth'){for(let i=0;i<16;i++){c.fillStyle='#fff8dd55';c.fillRect(i*64,0,28,512);c.fillRect(0,i*64,512,28);}for(let i=0;i<512;i+=3){c.fillStyle='#fff9';c.globalAlpha=.035;c.fillRect(0,i,512,1);}c.globalAlpha=1;}
 else for(let i=0;i<18000;i++){const x=rnd()*512,y=rnd()*512;c.fillStyle=rnd()>.5?'#ffffff12':'#5b3b1b0d';c.fillRect(x,y,1+rnd()*2,1+rnd()*2);}
 const tx=new T.CanvasTexture(canvas);tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.anisotropy=4;return tx;
}
function labelTexture(text,sub='',bg='#eee4cc',fg='#756648'){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,512,192);c.strokeStyle=fg+'44';c.lineWidth=4;c.strokeRect(12,12,488,168);c.fillStyle=fg;c.textAlign='center';c.font='600 45px system-ui';c.fillText(text,256,sub?91:111);if(sub){c.font='17px system-ui';c.fillText(sub,256,137);}const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
export class CageView{
 constructor(canvas){
  this.canvas=canvas;this.scene=new T.Scene();this.scene.background=new T.Color('#f2ecdf');this.scene.fog=new T.Fog('#f2ecdf',28,64);
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.outputColorSpace=T.SRGBColorSpace;
  this.camera=new T.PerspectiveCamera(38,1,.1,100);this.camera.position.set(14,12.5,17);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.target.set(.3,1,0);this.controls.enableDamping=true;this.controls.dampingFactor=.08;this.controls.minDistance=8;this.controls.maxDistance=32;this.controls.maxPolarAngle=Math.PI*.46;this.controls.minPolarAngle=.18;this.controls.enablePan=true;this.controls.panSpeed=.65;
  this.controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.PAN};
  this.scene.add(new T.HemisphereLight('#fff8e7','#b7bca3',1.6));
  const sun=new T.DirectionalLight('#fff1d8',2.8);sun.position.set(-8,16,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.camera.far=40;sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;sun.shadow.radius=4;this.scene.add(sun);
  const fill=new T.DirectionalLight('#e0e9ef',.9);fill.position.set(9,7,-8);this.scene.add(fill);
  this.base=new T.Group();this.scene.add(this.base);this.meshes=new Map();this.pickables=[];this.supportMeshes=[];this.particles=[];this.follow=false;this.lastFollow=new T.Vector3();this.time=0;this.resize();
 }
 resize(){const r=this.canvas.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();}
 box(group,size,pos,material,r=.04){const mesh=new T.Mesh(new RoundedBoxGeometry(...size,2,r),material);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 sphere(group,size,pos,material){const mesh=new T.Mesh(new T.SphereGeometry(1,24,16),material);mesh.position.set(...pos);mesh.scale.set(...size);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 cylinder(group,r1,r2,h,pos,material,segments=24){const mesh=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),material);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 label(group,text,sub,pos,w=2.2,h=.8,bg='#eee4cc',fg='#756648'){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:labelTexture(text,sub,bg,fg),roughness:.9,side:T.DoubleSide}));m.position.set(...pos);group.add(m);return m;}
 load(physics){
  this.physics=physics;const level=physics.level;
  this.scene.remove(this.base);this.base.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material])){if(m.map)m.map.dispose();m.dispose();}}});
  this.base=new T.Group();this.scene.add(this.base);this.meshes.clear();this.pickables=[];this.supportMeshes=[];this.particles=[];
  this.scene.background.set(level.sky);this.scene.fog.color.set(level.sky);
  this.m={wood:new T.MeshStandardMaterial({map:texture('wood','#d6b383'),roughness:.78}),lightWood:new T.MeshStandardMaterial({map:texture('wood','#e9d4aa'),roughness:.82}),darkWood:mat('#a68156'),sage:mat(level.color),cream:mat('#f0e7d2'),metal:mat('#b6b5a0',.42,.45),paper:new T.MeshStandardMaterial({map:texture('paper','#cbb08a'),roughness:.95}),soil:mat('#99856a'),leaf:mat('#8f9b71'),leaf2:mat('#acb98b'),cloth:new T.MeshStandardMaterial({map:texture('cloth',level.color),roughness:1})};
  const m=this.m,g=this.base;
  this.box(g,[70,.4,70],[0,-1.2,0],mat(level.sky),.1);
  this.box(g,[15.8,.5,12.4],[.3,-.72,0],m.lightWood,.18);
  this.box(g,[12.7,.38,9.7],[0,-.25,0],m.wood,.13);
  const floorMat=new T.MeshStandardMaterial({map:texture('paper',level.floor),roughness:1});this.box(g,[12,.1,9],[0,-.04,0],floorMat,.05);
  // Shavings have actual thickness, but do not obstruct the hamster's feet.
  const random=seeded(342+physics.index),shavingGeo=new T.BoxGeometry(.13,.026,.052),shavings=new T.InstancedMesh(shavingGeo,m.lightWood,620),dummy=new T.Object3D();
  for(let i=0;i<620;i++){dummy.position.set((random()-.5)*11.7,.035,(random()-.5)*8.7);dummy.rotation.set(random()*.35,random()*Math.PI,random()*.2);dummy.scale.set(.6+random(),1,1);dummy.updateMatrix();shavings.setMatrixAt(i,dummy.matrix);}shavings.receiveShadow=true;g.add(shavings);
  this.cage(g);
  for(const b of physics.statics){if(b.meta.wall||b.meta.hidden||b.meta.id==='floor')continue;this.staticMesh(b);}
  for(const b of physics.objects)this.objectMesh(b);
  this.hamster=createHamster();g.add(this.hamster.root);
  this.wheel(g,[-4.9,1.08,-.6]);this.bottle(g,[-5.68,2.25,1.5]);this.bowl(g,[-2.9,0,2.5]);
  this.bed(g,[-4.5,.05,-3.05]);
  if(['garden','attic'].includes(level.decor)){this.plant(g,[-5.1,.1,-1.7],1.2);this.plant(g,[4.65,.1,3.25],1.0);}
  else{this.plant(g,[5.0,.1,3.4],.85);}
  if(level.decor==='bakery'){this.cupcake(g,[-3.6,.05,-1.3]);this.cupcake(g,[3.8,.05,.8]);}
  if(level.decor==='seaside'){this.lighthouse(g,[-3.8,0,-1.7]);this.lifebuoy(g,[5.75,2.4,1.1]);}
  if(level.decor==='space'){this.rocket(g,[-3.9,0,-1.8]);for(const p of [[-1.6,3.6,-4.35],[.8,3.8,-4.35],[3,3.9,-4.35]])this.star(g,p,.2);}
  if(level.decor==='attic'){this.toyArch(g,[-3.5,.05,-1.3]);this.toyArch(g,[3.6,.05,2.0]);}
  this.label(g,level.name,level.tag,[0,4.75,-4.52],2.8,.95,'#ece2ca','#827052');
  for(const x of [-1,1])this.cylinder(g,.012,.012,.55,[x,4.45,-4.48],m.darkWood,8);
  // An exterior landing pad makes the success condition clear: go OUTSIDE.
  this.box(g,[1.0,.12,1.4],[6.65,3.42,-2.65],m.cloth,.06);
  this.exitArrow=new T.Group();this.cylinder(this.exitArrow,.06,.06,.55,[0,0,0],m.sage,12);const cone=new T.Mesh(new T.ConeGeometry(.21,.28,4),m.sage);cone.rotation.z=Math.PI;cone.position.y=-.3;this.exitArrow.add(cone);this.exitArrow.position.set(6.65,4.6,-2.65);g.add(this.exitArrow);
  this.label(g,'出口','EXIT · 外面的世界',[5.95,4.4,-3.72],1.4,.6,'#e3ead3','#6b7e55');
  const ring=new T.Mesh(new T.RingGeometry(.42,.47,48),new T.MeshBasicMaterial({color:level.color,transparent:true,opacity:.6,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(6.65,3.49,-2.65);g.add(ring);
  this.selection=new T.Box3Helper(new T.Box3(),new T.Color('#8b9b6c'));this.selection.visible=false;g.add(this.selection);
  this.resetCamera();this.follow=false;this.lastFollow.set(...level.start);
 }
 cage(g){
  const m=this.m;
  for(const x of [-6,6])for(const z of [-4.5,4.5]){this.box(g,[.2,4.35,.2],[x,2.1,z],m.lightWood,.07);this.sphere(g,[.15,.15,.15],[x,4.33,z],m.wood);}
  for(const z of [-4.5,4.5]){this.box(g,[12.25,.14,.17],[0,4.18,z],m.lightWood,.045);this.box(g,[12.25,.2,.15],[0,.18,z],m.wood,.035);}
  this.box(g,[.17,.14,9.0],[-6,4.18,0],m.lightWood,.045);
  this.box(g,[.17,.14,.85],[6,4.18,-4.1],m.lightWood,.045);this.box(g,[.17,.14,6.05],[6,4.18,1.55],m.lightWood,.045);
  this.barMaterials=[];
  const sideMats=Array.from({length:4},()=>new T.MeshStandardMaterial({color:'#a7aa98',metalness:.55,roughness:.4,transparent:true,opacity:.52}));this.barMaterials=sideMats;
  const bars=[[],[],[],[]];
  for(let x=-5.7;x<5.9;x+=.42){bars[0].push([x,2.17,-4.5,3.9]);bars[1].push([x,2.17,4.5,3.9]);}
  for(let z=-4.25;z<4.4;z+=.42){bars[2].push([-6,2.17,z,3.9]);const opening=z>-3.75&&z<-1.55;bars[3].push([6,opening?1.71:2.17,z,opening?2.98:3.9]);}
  const barGeo=new T.CylinderGeometry(.021,.021,1,6),dummy=new T.Object3D();
  bars.forEach((list,i)=>{const mesh=new T.InstancedMesh(barGeo,sideMats[i],list.length);list.forEach(([x,y,z,h],n)=>{dummy.position.set(x,y,z);dummy.scale.set(1,h,1);dummy.updateMatrix();mesh.setMatrixAt(n,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);});
 }
 staticMesh(body){
  const id=body.meta.id,p=body.position,s=body.meta.size,m=this.m;
  let mesh;
  if(id==='house'){
   const group=new T.Group();group.position.copy(p);
   this.box(group,[.09,1.4,1.45],[-.805,0,0],m.lightWood,.02);this.box(group,[.09,1.4,1.45],[.805,0,0],m.lightWood,.02);this.box(group,[1.7,1.4,.09],[0,0,-.68],m.lightWood,.02);
   const front=new T.Shape();front.moveTo(-.85,-.7);front.lineTo(-.85,.7);front.lineTo(.85,.7);front.lineTo(.85,-.7);front.lineTo(.38,-.7);front.lineTo(.38,-.12);front.absarc(0,-.12,.38,0,Math.PI,false);front.lineTo(-.38,-.7);front.closePath();
   const face=new T.Mesh(new T.ExtrudeGeometry(front,{depth:.09,bevelEnabled:false,curveSegments:24}),m.lightWood);face.position.z=.635;face.castShadow=true;face.receiveShadow=true;group.add(face);
   const roof=this.box(group,[1.95,.14,1.8],[0,.77,0],m.sage,.04);roof.rotation.z=.08;
   this.box(group,[1.45,.1,1.2],[0,-.65,0],m.cloth,.04);this.label(group,'Z z z','',[0,.48,.738],.65,.22,'#e9d4aa','#9b825e');this.base.add(group);mesh=this.box(this.base,[1.95,.14,1.8],[p.x,p.y+.77,p.z],m.sage);mesh.rotation.z=.08;mesh.visible=false;
  }else if(id==='theme-block'){
   const col=this.physics.index===1?'#b68f6e':this.physics.index===2?'#a8b294':this.physics.index===3?'#95a8aa':this.physics.index===4?'#aaa8b7':'#b8a08b';
   mesh=this.box(this.base,s,[p.x,p.y,p.z],mat(col),.10);this.label(this.base,this.physics.index===1?'BISCUITS':this.physics.index===2?'BOTANICAL':this.physics.index===3?'SAIL AWAY':this.physics.index===4?'MOON 01':'TOY BOX','',[p.x,p.y,p.z+s[2]/2+.005],s[0]*.8,.3,col,'#f5ecdc');
  }else mesh=this.box(this.base,s,[p.x,p.y,p.z],id==='exit-dock'?m.lightWood:m.wood,.04);
  mesh.userData.body=body;this.supportMeshes.push(mesh);
  if(id==='shelf'||id==='shelf-low')for(const xx of [-1,1]){const bracket=this.box(this.base,[.09,.4,.8],[p.x+xx*s[0]*.36,p.y-.25,p.z+.3],m.darkWood,.02);bracket.rotation.x=.5;}
 }
 objectMesh(body){
  const spec=body.meta,[w,h,d]=spec.size,m=this.m,group=new T.Group();group.userData.body=body;
  if(spec.kind==='crate'){
   this.box(group,[w-.08,h-.06,d-.08],[0,0,0],m.wood,.025);
   for(const y of [-h*.33,0,h*.33])for(const z of [-1,1])this.box(group,[w,.20,d*.08],[0,y,z*d*.48],m.lightWood,.018);
   for(const x of [-1,1])for(const z of [-1,1]){this.box(group,[.12,h+.025,.12],[x*(w/2-.07),0,z*(d/2-.04)],m.lightWood,.018);}
   this.label(group,'FRAGILE','HANDLE WITH LOVE',[0,0,d/2+.006],w*.65,h*.42,'#d5b487','#a18054');
  }else if(spec.kind==='stool'){
   this.box(group,[w,.18,d],[0,h/2-.09,0],m.lightWood,.07);
   for(const x of [-1,1])for(const z of [-1,1])this.box(group,[.14,h-.18,.14],[x*(w/2-.14),-.09,z*(d/2-.14)],m.wood,.03);
  }else if(spec.kind==='tube'){
   const ring=new T.Shape();ring.absarc(0,0,h/2,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,h/2-.065,0,Math.PI*2,true);ring.holes.push(hole);const geo=new T.ExtrudeGeometry(ring,{depth:w,bevelEnabled:true,bevelSegments:2,bevelSize:.012,bevelThickness:.012,curveSegments:32});geo.rotateY(Math.PI/2);geo.translate(-w/2,0,0);const mesh=new T.Mesh(geo,m.paper);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
   for(let i=0;i<4;i++){const ringMesh=new T.Mesh(new T.TorusGeometry(h/2+.003,.006,4,40),m.darkWood);ringMesh.rotation.y=Math.PI/2;ringMesh.position.x=-w*.4+i*w*.26;group.add(ringMesh);}
  }else if(spec.kind==='ramp'){
   const shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:1,steps:1});geo.translate(0,0,-d/2);const mesh=new T.Mesh(geo,m.lightWood);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
   for(let i=0;i<7;i++){const x=-w/2+.3+i*.32,y=(x+w/2)/w*h-h/2+.025;const slat=this.box(group,[.055,.055,d*.95],[x,y,0],m.wood,.01);slat.rotation.z=Math.atan(h/w);}
  }else if(spec.kind==='cushion'){
   this.box(group,[w,h,d],[0,0,0],m.cloth,.12);for(const x of [-1,1])for(const z of [-1,1])this.sphere(group,[.04,.02,.04],[x*w*.35,h/2,z*d*.35],m.cream);
  }else if(spec.kind==='block'){
   this.box(group,[w,h,d],[0,0,0],m.sage,.07);this.label(group,'A','',[0,0,d/2+.004],.45,.45,this.physics.level.color,'#ece9d5');
  }else this.box(group,[w,h,d],[0,0,0],m.lightWood,.045);
  group.traverse(o=>{if(o.isMesh){o.userData.body=body;this.pickables.push(o);this.supportMeshes.push(o);}});
  this.base.add(group);this.meshes.set(body.id,group);return group;
 }
 wheel(g,p){
  const m=this.m,group=new T.Group();group.position.set(...p);group.rotation.y=Math.PI/2;
  this.box(group,[1.5,.12,.9],[0,-.99,0],m.lightWood,.05);this.box(group,[.12,1.2,.14],[0,-.4,0],m.wood,.03);
  const wheel=new T.Group();group.add(wheel);const ringMat=mat(this.physics.level.color);
  for(const z of [-.28,.28]){const ring=new T.Mesh(new T.TorusGeometry(.85,.055,10,64),ringMat);ring.position.z=z;ring.castShadow=true;wheel.add(ring);}
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2;const slat=this.box(wheel,[.19,.045,.60],[Math.sin(a)*.85,Math.cos(a)*.85,0],m.lightWood,.015);slat.rotation.z=-a;}
  for(let i=0;i<6;i++){const spoke=this.box(wheel,[.055,1.65,.055],[0,0,-.30],m.sage,.015);spoke.rotation.z=i*Math.PI/6;}
  this.sphere(wheel,[.14,.14,.1],[0,0,-.32],m.lightWood);g.add(group);this.wheelMesh=wheel;
 }
 bottle(g,p){
  const group=new T.Group();group.position.set(...p);const glass=new T.MeshPhysicalMaterial({color:'#d4e6e2',transparent:true,opacity:.48,roughness:.14,metalness:.05,clearcoat:1});
  this.cylinder(group,.24,.22,1.05,[0,0,0],glass);this.cylinder(group,.20,.20,.65,[0,-.12,0],new T.MeshStandardMaterial({color:'#a9c9c1',transparent:true,opacity:.6,roughness:.3}));this.cylinder(group,.24,.24,.10,[0,.55,0],this.m.sage);
  const nozzle=this.cylinder(group,.025,.025,.55,[.15,-.64,0],this.m.metal,12);nozzle.rotation.z=-.7;g.add(group);
 }
 bowl(g,p){const group=new T.Group();group.position.set(...p);this.cylinder(group,.45,.34,.19,[0,.1,0],this.m.sage);this.cylinder(group,.37,.37,.02,[0,.205,0],mat('#c3a474'));const rnd=seeded(91);for(let i=0;i<18;i++){const s=this.sphere(group,[.05,.03,.025],[(rnd()-.5)*.5,.24,(rnd()-.5)*.5],mat(i%2?'#9f8054':'#dfc78f'));s.rotation.y=rnd()*6;}g.add(group);}
 bed(g,p){this.box(g,[1.2,.1,1.05],[p[0],p[1],p[2]+.72],this.m.cloth,.045);}
 plant(g,p,s=1){const group=new T.Group();group.position.set(...p);group.scale.setScalar(s);this.cylinder(group,.29,.21,.42,[0,.22,0],mat('#c8ad8a'));this.cylinder(group,.25,.25,.03,[0,.435,0],this.m.soil);
  for(let i=0;i<8;i++){const a=i*2.4,yy=.6+(i%3)*.23;const stem=this.cylinder(group,.015,.015,yy,[Math.cos(a)*.12,.45+yy/2,Math.sin(a)*.12],this.m.leaf,6);stem.rotation.z=Math.sin(a)*.28;const leaf=this.sphere(group,[.12,.34,.045],[Math.cos(a)*.26,.55+yy,Math.sin(a)*.26],i%2?this.m.leaf:this.m.leaf2);leaf.rotation.set(.5*Math.cos(a),a,Math.sin(a)*.7);}
  g.add(group);}
 cupcake(g,p){const group=new T.Group();group.position.set(...p);this.cylinder(group,.38,.28,.5,[0,.25,0],mat('#bf947d'));this.sphere(group,[.42,.3,.42],[0,.55,0],mat('#eddbc4'));this.sphere(group,[.11,.11,.11],[0,.85,0],mat('#bd8d7c'));g.add(group);}
 lighthouse(g,p){const group=new T.Group();group.position.set(...p);this.cylinder(group,.26,.43,1.65,[0,.82,0],mat('#ece8d6'));for(const y of [.45,.95,1.45])this.cylinder(group,.42-y*.08,.43-y*.08,.2,[0,y,0],mat('#97afb4'));this.cylinder(group,.33,.33,.42,[0,1.85,0],mat('#d3c69d'));const roof=new T.Mesh(new T.ConeGeometry(.5,.35,24),this.m.sage);roof.position.y=2.2;roof.castShadow=true;group.add(roof);g.add(group);}
 lifebuoy(g,p){const ring=new T.Mesh(new T.TorusGeometry(.4,.12,16,40),mat('#e7e4ce'));ring.position.set(...p);ring.rotation.y=Math.PI/2;g.add(ring);}
 rocket(g,p){const group=new T.Group();group.position.set(...p);this.cylinder(group,.35,.35,1.1,[0,.8,0],mat('#dedde6'));const cone=new T.Mesh(new T.ConeGeometry(.35,.6,24),this.m.sage);cone.position.y=1.65;group.add(cone);this.sphere(group,[.16,.16,.06],[0,1,.34],mat('#8b9ca8',.2));for(let i=0;i<3;i++){const wing=this.box(group,[.15,.65,.45],[Math.sin(i*2.1)*.36,.4,Math.cos(i*2.1)*.36],this.m.sage,.04);wing.rotation.y=i*2.1;}g.add(group);}
 star(g,p,size){const shape=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?size*.45:size;if(i===0)shape.moveTo(Math.sin(a)*r,Math.cos(a)*r);else shape.lineTo(Math.sin(a)*r,Math.cos(a)*r);}shape.closePath();const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.04,bevelEnabled:false}),mat('#d8c69a'));mesh.position.set(...p);g.add(mesh);}
 toyArch(g,p){const group=new T.Group();group.position.set(...p);for(let i=0;i<4;i++){const arch=new T.Mesh(new T.TorusGeometry(.6-i*.12,.055,8,32,Math.PI),mat(['#bc9b86','#b9b68c','#96aa98','#d3bd98'][i]));arch.position.y=.1;group.add(arch);}g.add(group);}
 resetCamera(top=false){const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;const factor=this.camera.aspect<1?1.25:1;this.controls.maxDistance=this.camera.aspect<1?42:32;this.camera.position.set(...(top?[.3,23*factor,2]:[14*factor,12.5*factor,17*factor]));this.controls.target.set(.3,1,0);this.controls.update();this.follow=false;}
 setSelected(body){this.selected=body;this.selection.visible=!!body;}
 burst(position,color='#d5ba77',count=24){for(let i=0;i<count;i++){const mesh=new T.Mesh(new T.SphereGeometry(.025+Math.random()*.025,6,4),mat(color));mesh.position.copy(position);this.base.add(mesh);this.particles.push({mesh,v:new T.Vector3((Math.random()-.5)*2,1+Math.random()*2,(Math.random()-.5)*2),life:1.3});}}
 render(dt,playing,pet=false){
  this.time+=dt;
  for(const body of this.physics.objects){const mesh=this.meshes.get(body.id);mesh.position.copy(body.position);mesh.quaternion.copy(body.quaternion);}
  const h=this.physics.hamster;this.hamster.root.position.set(h.position.x,h.position.y-.265,h.position.z);this.hamster.update(dt,h.velocity,this.physics.grounded,!!this.physics.climb,pet);
  this.exitArrow.position.y=4.6+Math.sin(this.time*2)*.09;this.wheelMesh.rotation.z+=dt*.09;
  if(this.selected){const mesh=this.meshes.get(this.selected.id);if(mesh){mesh.updateMatrixWorld(true);this.selection.box.setFromObject(mesh);}else this.selection.visible=false;}
  const direction=this.camera.position.clone().sub(this.controls.target);this.barMaterials[0].opacity=direction.z<0?.10:.42;this.barMaterials[1].opacity=direction.z>0?.10:.42;this.barMaterials[2].opacity=direction.x<0?.10:.42;this.barMaterials[3].opacity=direction.x>0?.10:.42;
  if(this.follow){const target=new T.Vector3(h.position.x,Math.max(1,h.position.y),h.position.z);const delta=target.clone().sub(this.controls.target).multiplyScalar(Math.min(1,dt*3));this.controls.target.add(delta);this.camera.position.add(delta);}
  if(this.controls.enabled)this.controls.update();
  for(const p of this.particles){p.life-=dt;p.v.y-=dt*2;p.mesh.position.addScaledVector(p.v,dt);p.mesh.scale.setScalar(Math.max(0,p.life));if(p.life<=0){this.base.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();}}this.particles=this.particles.filter(p=>p.life>0);
  this.renderer.render(this.scene,this.camera);
 }
}
