import * as T from 'three';
const material=(color,roughness=.9)=>new T.MeshPhysicalMaterial({color,roughness,clearcoat:.08,clearcoatRoughness:.6});
export function createHamster(){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const gold=material('#e8a74d'),honey=material('#f1bd68'),cream=material('#fff2d6'),pink=material('#e5a29a'),rose=material('#df968e'),black=new T.MeshPhysicalMaterial({color:'#241c17',roughness:.09,clearcoat:1,clearcoatRoughness:.06}),glint=new T.MeshBasicMaterial({color:'#fffdf3'});
 const sphere=new T.SphereGeometry(1,32,24);
 const ellipsoid=(parent,mat,p,s)=>{const m=new T.Mesh(sphere,mat);m.position.set(...p);m.scale.set(...s);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 ellipsoid(body,gold,[0,.32,-.09],[.315,.305,.395]);
 ellipsoid(body,cream,[0,.245,.08],[.281,.218,.315]);
 ellipsoid(body,honey,[0,.42,-.19],[.278,.21,.285]);
 const head=new T.Group();head.position.set(0,.425,.265);body.add(head);
 ellipsoid(head,honey,[0,.012,0],[.267,.25,.258]);
 const ears=[];
 for(const side of [-1,1]){
  const ear=new T.Group();ear.position.set(side*.195,.192,-.055);ear.rotation.z=-side*.25;head.add(ear);ears.push(ear);
  ellipsoid(ear,cream,[0,0,0],[.106,.115,.065]);ellipsoid(ear,honey,[0,.008,-.009],[.101,.109,.06]);ellipsoid(ear,pink,[0,.005,.042],[.066,.077,.025]);ellipsoid(ear,rose,[0,-.014,.06],[.038,.047,.009]);
  ellipsoid(head,cream,[side*.133,-.088,.154],[.166,.132,.151]);
  const eye=new T.Group();eye.position.set(side*.214,.041,.165);head.add(eye);
  ellipsoid(eye,black,[0,0,0],[.051,.064,.049]);
  ellipsoid(eye,glint,[side*.009,.023,.038],[.016,.020,.011]);ellipsoid(eye,glint,[-side*.009,-.016,.043],[.006,.008,.004]);
  ears.push(eye);
  const blush=ellipsoid(head,new T.MeshStandardMaterial({color:'#edb09e',roughness:1,transparent:true,opacity:.52}),[side*.192,-.11,.241],[.048,.026,.008]);blush.rotation.y=side*.3;
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
 const tuftGeo=new T.ConeGeometry(.002,.016,3),furMat=material('#f6c979');
 function fur(parent,count,center,radii,offset=0){
  const mesh=new T.InstancedMesh(tuftGeo,furMat,count),d=new T.Object3D();
  for(let i=0;i<count;i++){const u=((i+offset)*.61803398875)%1,v=((i+offset)*.381966011)%1,a=u*Math.PI*2,phi=.16+v*1.53;const n=new T.Vector3(Math.sin(phi)*Math.cos(a),Math.cos(phi),Math.sin(phi)*Math.sin(a));d.position.set(center[0]+n.x*radii[0],center[1]+n.y*radii[1],center[2]+n.z*radii[2]);d.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),n);d.scale.setScalar(.6+(i%7)*.1);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);}mesh.castShadow=false;parent.add(mesh);
 }
 fur(body,950,[0,.32,-.09],[.316,.306,.396]);fur(head,430,[0,.012,0],[.267,.251,.259],73);
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
