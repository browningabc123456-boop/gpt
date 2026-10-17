import * as T from 'three';
function material(color,roughness=.82){return new T.MeshStandardMaterial({color,roughness});}
export function createHamster(){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const tan=material('#dfad69'),cream=material('#f5e8cf'),pink=material('#dea99d'),dark=material('#292b24',.16),nose=material('#bd8d83'),inner=material('#d2a08f');
 const sphere=new T.SphereGeometry(1,32,24);
 function ellipsoid(parent,mat,p,s){const m=new T.Mesh(sphere,mat);m.position.set(...p);m.scale.set(...s);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const belly=ellipsoid(body,tan,[0,.32,-.08],[.31,.31,.40]);
 ellipsoid(body,cream,[0,.245,.035],[.28,.215,.30]);
 const head=new T.Group();head.position.set(0,.44,.27);body.add(head);
 ellipsoid(head,tan,[0,0,0],[.245,.24,.245]);
 for(const side of [-1,1]){
  const ear=ellipsoid(head,tan,[side*.18,.19,-.04],[.10,.115,.055]);ear.rotation.z=-side*.25;
  ellipsoid(head,inner,[side*.184,.192,-.004],[.063,.076,.026]);
  ellipsoid(head,cream,[side*.12,-.095,.16],[.15,.12,.145]);
  const eye=ellipsoid(head,dark,[side*.195,.028,.13],[.041,.048,.043]);
  ellipsoid(head,material('#ffffff',.08),[side*.211,.044,.159],[.011,.014,.011]);
  // Whiskers are actual tiny 3D curves, visible from every angle.
  for(let i=0;i<3;i++){
   const curve=new T.CatmullRomCurve3([new T.Vector3(side*.12,-.085,.23),new T.Vector3(side*.27,-.065+(i-1)*.036,.27),new T.Vector3(side*.36,-.05+(i-1)*.053,.25)]);
   const whisker=new T.Mesh(new T.TubeGeometry(curve,8,.0022,4,false),material('#b8a58b'));head.add(whisker);
  }
 }
 ellipsoid(head,nose,[0,-.052,.265],[.04,.027,.025]);
 const mouthCurve=new T.CatmullRomCurve3([new T.Vector3(-.035,-.112,.249),new T.Vector3(0,-.126,.26),new T.Vector3(.035,-.112,.249)]);
 head.add(new T.Mesh(new T.TubeGeometry(mouthCurve,12,.003,4,false),material('#9e7f67')));
 const feet=[];
 for(const z of [-.29,.20])for(const x of [-.19,.19]){
  const foot=ellipsoid(body,pink,[x,.065,z],[.075,.047,.11]);feet.push(foot);
  for(let i=0;i<2;i++)ellipsoid(foot,pink,[(i-.5)*.32,-.04,.75],[.15,.2,.32]);
 }
 ellipsoid(body,pink,[0,.16,-.465],[.055,.055,.07]);
 // Fine short fur strands on the back are geometry, not a flat character image.
 const furGeo=new T.ConeGeometry(.0035,.032,3),furMat=material('#edc58b');
 const fur=new T.InstancedMesh(furGeo,furMat,190);const dummy=new T.Object3D();
 for(let i=0;i<190;i++){
  const u=(i*.61803398875)%1,v=(i*.38196601)%1,theta=u*Math.PI*2,phi=.3+v*1.15;
  const pos=new T.Vector3(Math.sin(phi)*Math.cos(theta)*.309,.32+Math.cos(phi)*.31,-.08+Math.sin(phi)*Math.sin(theta)*.398);
  const normal=new T.Vector3(pos.x/.31,(pos.y-.32)/.31,(pos.z+.08)/.4).normalize();dummy.position.copy(pos);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),normal);dummy.updateMatrix();fur.setMatrixAt(i,dummy.matrix);
 }body.add(fur);
 let time=0,look=0;
 return {root,head,body,feet,update(dt,velocity,grounded,climbing,pet=false){
  time+=dt;const speed=Math.hypot(velocity.x,velocity.z),moving=speed>.15;
  if(moving){const target=Math.atan2(velocity.x,velocity.z);let delta=target-look;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;look+=delta*Math.min(1,dt*12);}
  root.rotation.y=look;
  body.position.y=grounded&&moving?Math.sin(time*16)*.018:Math.sin(time*2.4)*.006;
  body.rotation.x=climbing?-.28:grounded?Math.sin(time*16)*.025*Math.min(speed,1):-.12;
  feet.forEach((f,i)=>{f.position.y=.065+((moving&&grounded)||climbing?Math.max(0,Math.sin(time*16+(i%2)*Math.PI+(i>1?Math.PI:0)))*(climbing?.09:.05):0);f.rotation.x=moving||climbing?Math.sin(time*16+i*Math.PI)*(climbing?.65:.35):0;});
  head.rotation.x=pet?-.13:Math.sin(time*2)*.025;head.rotation.y=pet?Math.sin(time*5)*.12:Math.sin(time*1.1)*.045;
 }};
}
