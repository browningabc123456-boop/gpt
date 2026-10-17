import * as T from 'three';
import {textile} from './art-materials.js';
const material=(color,roughness=.9)=>new T.MeshPhysicalMaterial({color,roughness,clearcoat:.08,clearcoatRoughness:.6});
export function createHamster(){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const gold=material('#e8a74d'),honey=material('#f1bd68'),cream=material('#fff2d6'),pink=material('#e5a29a'),rose=material('#df968e'),black=new T.MeshPhysicalMaterial({color:'#241c17',roughness:.09,clearcoat:1,clearcoatRoughness:.06}),glint=new T.MeshBasicMaterial({color:'#fffdf3'});
 const sphere=new T.SphereGeometry(1,32,24);
 const ellipsoid=(parent,mat,p,s)=>{const m=new T.Mesh(sphere,mat);m.position.set(...p);m.scale.set(...s);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 // One continuous coat instead of overlapping body balls. Vertex colour blends the bib into the fur.
 const coat=textile('#ffffff','fur');coat.vertexColors=true;
 const goldColor=new T.Color('#d99b42'),creamColor=new T.Color('#fff6e7');
 function coatColor(n,face=false){const white=face?T.MathUtils.smoothstep(-n.y,-.05,.38):T.MathUtils.smoothstep(-n.y,-.16,.65);return goldColor.clone().lerp(creamColor,white);}
 function plush(parent,center,radii,face=false){
  const geo=new T.SphereGeometry(1,64,48),positions=geo.attributes.position,colors=[];
  for(let i=0;i<positions.count;i++){const n=new T.Vector3().fromBufferAttribute(positions,i),jowl=face?1+.17*Math.exp(-(((n.y+.36)/.38)**2)):1;const color=coatColor(n,face);colors.push(color.r,color.g,color.b);positions.setXYZ(i,center[0]+n.x*radii[0]*jowl,center[1]+n.y*radii[1],center[2]+n.z*radii[2]);}
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const skin=new T.Mesh(geo,coat);skin.castShadow=true;skin.receiveShadow=true;parent.add(skin);
  // Uniformly scattered curved fibres produce a fuzzy silhouette without the old spiral seams.
  const vertices=[],tints=[];let seed=face?931:143;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<(face?9500:14500);i++){const y=random()*2-1,a=random()*Math.PI*2,r=Math.sqrt(1-y*y),n=new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r),jowl=face?1+.17*Math.exp(-(((y+.36)/.38)**2)):1;const base=new T.Vector3(center[0]+n.x*radii[0]*jowl,center[1]+n.y*radii[1],center[2]+n.z*radii[2]);const length=.004+random()*.010,c=coatColor(n,face).multiplyScalar(.84+random()*.32);const middle=base.clone().addScaledVector(n,length*.55),tip=base.clone().addScaledVector(n,length);tip.y-=length*.25;
   vertices.push(...base,...middle,...middle,...tip);for(let j=0;j<4;j++)tints.push(c.r,c.g,c.b);
  }
  const strands=new T.BufferGeometry();strands.setAttribute('position',new T.Float32BufferAttribute(vertices,3));strands.setAttribute('color',new T.Float32BufferAttribute(tints,3));parent.add(new T.LineSegments(strands,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.39})));
 }
 plush(body,[0,.33,-.09],[.325,.308,.415]);
 const head=new T.Group();head.position.set(0,.425,.265);body.add(head);
 plush(head,[0,.008,0],[.285,.263,.268],true);
 const ears=[];
 for(const side of [-1,1]){
  const ear=new T.Group();ear.position.set(side*.195,.192,-.055);ear.rotation.z=-side*.25;head.add(ear);ears.push(ear);
  ellipsoid(ear,cream,[0,0,0],[.106,.115,.065]);ellipsoid(ear,honey,[0,.008,-.009],[.101,.109,.06]);ellipsoid(ear,pink,[0,.005,.042],[.066,.077,.025]);ellipsoid(ear,rose,[0,-.014,.06],[.038,.047,.009]);
  // The cheeks belong to the continuous face mesh; just a small muzzle sits above it.
  ellipsoid(head,cream,[side*.061,-.103,.242],[.086,.062,.055]);
  const eye=new T.Group();eye.position.set(side*.184,.047,.222);head.add(eye);
  ellipsoid(eye,black,[0,0,0],[.060,.071,.040]);
  ellipsoid(eye,glint,[side*.009,.023,.038],[.016,.020,.011]);ellipsoid(eye,glint,[-side*.009,-.016,.043],[.006,.008,.004]);
  ears.push(eye);
  const blush=ellipsoid(head,new T.MeshStandardMaterial({color:'#edb09e',roughness:1,transparent:true,opacity:.52}),[side*.216,-.10,.203],[.048,.026,.008]);blush.rotation.y=side*.3;
  for(let i=0;i<3;i++){
   const curve=new T.CatmullRomCurve3([new T.Vector3(side*.17,-.078,.272),new T.Vector3(side*.278,-.06+(i-1)*.027,.295),new T.Vector3(side*.365,-.065+(i-1)*.042,.282)]);
   head.add(new T.Mesh(new T.TubeGeometry(curve,8,.0017,4,false),material('#b29b7b')));
  }
 }
 ellipsoid(head,material('#d89587',.37),[0,-.055,.294],[.032,.023,.025]);ellipsoid(head,glint,[-.009,-.048,.312],[.008,.004,.003]);
 for(const side of [-1,1]){const smile=new T.CatmullRomCurve3([new T.Vector3(0,-.078,.29),new T.Vector3(side*.014,-.112,.288),new T.Vector3(side*.04,-.105,.282)]);head.add(new T.Mesh(new T.TubeGeometry(smile,10,.0025,5,false),material('#9c765a')));}
 const feet=[];
 for(const z of [-.285,.205])for(const x of [-.19,.19]){
  const foot=ellipsoid(body,pink,[x,.052,z],[.069,.043,.096]);feet.push(foot);
  for(let i=0;i<3;i++)ellipsoid(foot,material('#f4cbb5'),[(i-1)*.32,-.04,.75],[.13,.17,.25]);
 }
 ellipsoid(body,pink,[0,.15,-.46],[.047,.047,.061]);
 let time=0,look=0;
 return {root,head,body,feet,update(dt,velocity,grounded,climbing,pet=false){
  time+=dt;const speed=Math.hypot(velocity.x,velocity.z),moving=speed>.12;
  if(moving){const target=Math.atan2(velocity.x,velocity.z);let delta=target-look;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;look+=delta*Math.min(1,dt*11);}
  root.rotation.y=look;body.position.y=grounded&&moving?Math.sin(time*17)*.013:Math.sin(time*2.5)*.006;
  body.rotation.x=climbing?-.28:grounded?Math.sin(time*17)*.018*Math.min(speed,1):-.1;
  feet.forEach((f,i)=>{f.position.y=.052+((moving&&grounded)||climbing?Math.max(0,Math.sin(time*17+(i%2)*Math.PI+(i>1?Math.PI:0)))*(climbing?.09:.043):0);f.rotation.x=moving||climbing?Math.sin(time*17+i*Math.PI)*(climbing?.65:.28):0;});
  const phase=time%5.6,blink=pet?.25:phase>5.37?Math.max(.12,Math.abs(phase-5.48)/.11):1;
  ears[1].scale.y=blink;ears[3].scale.y=blink;ears[0].rotation.z=.25+Math.sin(time*1.5)*.025;ears[2].rotation.z=-.25-Math.sin(time*1.5)*.025;
  head.rotation.x=pet?-.11:Math.sin(time*2)*.017;head.rotation.z=pet?Math.sin(time*3)*.09:Math.sin(time*.8)*.025;head.rotation.y=pet?Math.sin(time*4)*.09:Math.sin(time*1.1)*.03;
 }};
}
