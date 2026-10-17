import * as T from 'three';
const rng=(n)=>{const f=Math.sin(n*127.1)*43758.5453;return f-Math.floor(f);};
function snowPine(v,g,x,z,height){const tree=new T.Group();tree.position.set(x,2.2,z);g.add(tree);v.cylinder(tree,.07,.13,height,[0,height/2,0],'#8c7967',9);for(let i=0;i<4;i++){const r=(1-i*.19)*height*.32,y=height*(.32+i*.18);v.cylinder(tree,0,r,height*.38,[0,y,0],i%2?'#8cae9f':'#668e87',16,true);v.cylinder(tree,0,r*.94,height*.24,[0,y+height*.10,0],'#f5f9fa',16);}}
export function hotSpring(v,g,x,y,z,size=1){const pool=new T.Group();pool.position.set(x,y,z);pool.scale.setScalar(size);g.add(pool);v.cylinder(pool,.70,.78,.13,[0,.03,0],'#9caeae',40,true);v.cylinder(pool,.59,.59,.035,[0,.11,0],'#8ac4ca',48);for(let i=0;i<13;i++){const a=i/13*Math.PI*2;v.sphere(pool,[.12,.10,.11],[Math.cos(a)*.67,.12,Math.sin(a)*.67],i%2?'#b9c8c9':'#d0dbd9');}v.box(pool,[.32,.05,.27],[.72,.04,.08],'#b8a58a',.025);return pool;}
export function snowEnvironment(v){const g=v.environment;
 const land=v.cylinder(g,7.0,6.4,1.1,[0,1.66,0],'#d8e5ec',64,true);land.userData.animated=true;v.terrain=land;
 const cover=v.cylinder(g,6.98,6.99,.13,[0,2.24,0],'#f5f9ff',64);land.attach(cover);
 for(let i=0;i<6;i++){const x=-8+i*3.1,z=-7.5-rng(i)*2,height=3+rng(i+9)*3.3;const mountain=v.cylinder(g,0,2.1,height,[x,2.0+height/2,z],'#b9ccdc',7,true);v.cylinder(g,0,.95,height*.45,[x,2+height*.78,z],'#f7fbff',7);}
 for(const [x,z,h]of [[-4.8,-2.2,3.6],[4.9,-2.6,4.3],[-4.8,2.9,2.9],[4.9,2.9,3.3],[-1.8,-4.8,3.7],[1.5,-5.0,3.1]])snowPine(v,g,x,z,h);
 hotSpring(v,g,-3.0,2.30,2.8,1.6);hotSpring(v,g,3.8,2.30,2.8,1.2);
 for(let i=0;i<18;i++){const a=i*2.4,r=4.5+rng(i)*2;v.sphere(g,[.45,.12,.35],[Math.cos(a)*r,2.3,Math.sin(a)*r],'#f7fbff');}
 // Steam wisps animate independently and do not re-generate the village.
 v.steam=[];for(let i=0;i<9;i++){const mesh=new T.Mesh(v.geometry('steam-puff',()=>new T.SphereGeometry(1,12,8)),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.18,depthWrite:false}));mesh.position.set(-3+Math.sin(i)*.6,2.65+(i%3)*.3,2.8+Math.cos(i)*.6);mesh.scale.set(.17,.29,.17);mesh.userData.animated=true;g.add(mesh);v.steam.push({mesh,base:mesh.position.clone(),phase:i});}

}
function giantLeaf(v,g,p,scale,color,rotation=0){const group=new T.Group();group.position.set(...p);group.rotation.y=rotation;group.scale.setScalar(scale);g.add(group);const geometry=v.geometry('giant-leaf',()=>{const s=new T.Shape();s.moveTo(0,-.15);s.bezierCurveTo(-.90,.05,-1.1,1.4,0,2.3);s.bezierCurveTo(1.1,1.4,.90,.05,0,-.15);const geo=new T.ShapeGeometry(s,24),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,Math.abs(x)*.35+Math.sin(y*1.4)*.16);}geo.computeVertexNormals();return geo;});const material=v.material(color,'leaf');material.side=T.DoubleSide;const leaf=new T.Mesh(geometry,material);leaf.castShadow=true;leaf.receiveShadow=true;group.add(leaf);v.line(group,[[0,0,.01],[0,1,.19],[0,2.25,.03]],'#bdd399',.015);for(let i=0;i<4;i++)for(const side of [-1,1])v.line(group,[[0,.3+i*.35,.13],[side*.35,.58+i*.35,.24],[side*.53,.75+i*.33,.26]],'#bdd399',.006);return group;}
function giantFlower(v,g,x,z,height,color){const flower=new T.Group();flower.position.set(x,2.25,z);g.add(flower);v.line(flower,[[0,0,0],[.12,height*.55,.08],[0,height,0]],'#7a9d66',.065);giantLeaf(v,flower,[.1,height*.32,0],.75,'#a5bc7b',-.5).rotation.z=-.65;const crown=new T.Group();crown.position.y=height;crown.rotation.x=.24;flower.add(crown);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const petal=v.sphere(crown,[.39,.15,.24],[Math.cos(a)*.44,Math.sin(i)*.015,Math.sin(a)*.44],color);petal.rotation.y=-a;}v.sphere(crown,[.30,.18,.30],[0,.08,0],'#e5c472');}
export function gardenEnvironment(v){const g=v.environment;
 const land=v.cylinder(g,7.0,6.3,.8,[0,1.82,0],'#c1cd9b',64,true);land.userData.animated=true;v.terrain=land;const cover=v.cylinder(g,6.97,6.97,.10,[0,2.25,0],'#d5dfa9',64);land.attach(cover);
 for(const [x,z,h,color]of [[-4.7,-1.8,5.4,'#ecc6cf'],[4.9,-2.6,6.0,'#e5c782'],[-1.4,-5,5.9,'#c9c0dc'],[3.1,-4.8,4.8,'#f3d8b6'],[-5,2.5,3.8,'#f3e7bd']])giantFlower(v,g,x,z,h,color);
 for(let i=0;i<18;i++){const a=i*2.4,r=4+rng(i)*2.6;giantLeaf(v,g,[Math.cos(a)*r,2.25,Math.sin(a)*r],.42+rng(i+8)*.45,i%2?'#b3c88d':'#9db878',a).rotation.x=-.55;}
 const pot=new T.Group();pot.position.set(4.9,2.28,2.6);pot.rotation.z=-.19;g.add(pot);v.cylinder(pot,.75,.58,.95,[0,.48,0],'#ceaa8a',32,true);v.cylinder(pot,.80,.80,.13,[0,.97,0],'#dbb797',32,true);v.cylinder(pot,.66,.66,.025,[0,1.05,0],'#9a9379',32);giantLeaf(v,pot,[0,1.02,0],1.1,'#a9c582',.4).rotation.z=-.3;
 for(let i=0;i<22;i++){const a=i*2.4,r=3.8+rng(i)*2.3;v.sphere(g,[.15,.07,.11],[Math.cos(a)*r,2.34,Math.sin(a)*r],i%2?'#d6c6a6':'#ece1bb');}
 // A curled snail and a few dew drops establish the miniature scale.
 v.sphere(g,[.25,.13,.55],[-3.6,2.37,3.4],'#c2b19d');v.sphere(g,[.36,.37,.30],[-3.6,2.65,3.25],'#d7b29e');v.line(g,[[-3.4,2.55,3.7],[-3.38,2.75,3.75]],'#b4a58a',.018);v.line(g,[[-3.8,2.55,3.7],[-3.82,2.75,3.75]],'#b4a58a',.018);
 for(const p of [[-3.0,2.4,2.7],[2.8,2.38,3.4],[4.0,2.39,-3.8]])v.sphere(g,[.10,.14,.10],p,'#c8e5d5');
}
export function themedCourtyard(v,g){if(v.theme==='snow'){hotSpring(v,g,0,.0,0,.8);return true;}if(v.theme==='garden'){v.cylinder(g,.38,.43,.12,[0,.06,0],'#d6c3a3',32);for(let i=0;i<6;i++){const a=i*2.4;v.sphere(g,[.18,.06,.11],[Math.cos(a)*.20,.28,Math.sin(a)*.20],'#d4a8be');}v.sphere(g,[.13,.09,.13],[0,.33,0],'#e4ca78');return true;}return false;}
