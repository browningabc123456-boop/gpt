import * as C from 'cannon-es';
import {CAGE,LEVELS3D,levelObjects,themeStructures,CATALOG} from './levels3d.js';
export class CagePhysics{
 constructor(index=0){
  this.index=index;this.level=LEVELS3D[index];this.world=new C.World({gravity:new C.Vec3(0,-13,0)});this.world.allowSleep=true;
  this.world.solver.iterations=30;this.world.defaultContactMaterial.friction=.9;this.world.defaultContactMaterial.contactEquationRelaxation=6;this.world.defaultContactMaterial.restitution=.01;
  this.wood=new C.Material('wood');this.fur=new C.Material('fur');this.world.addContactMaterial(new C.ContactMaterial(this.wood,this.wood,{friction:.95,restitution:0,contactEquationStiffness:1e7,contactEquationRelaxation:6}));
  this.world.addContactMaterial(new C.ContactMaterial(this.fur,this.wood,{friction:0,restitution:0}));
  this.objects=[];this.statics=[];this.stabilityEnabled=true;this.walkSpeed=2.65;this.nextObjectId=1;this.dragged=null;this.grounded=false;this.coyote=0;this.jumpCooldown=0;this.climb=null;this.won=false;this.fell=false;this.maxHeight=0;
  this.box([16,.5,13],[0,-.25,0],{id:'floor'});
  // Physical walls remain solid even when their near bars fade for visibility.
  this.box([.16,4.2,9],[-6.08,2.1,0],{id:'wall-left',wall:true});
  this.box([12.3,4.2,.16],[0,2.1,4.58],{id:'wall-front',wall:true});
  this.box([12.3,4.2,.16],[0,2.1,-4.58],{id:'wall-back',wall:true});
  this.box([.16,4.2,.85],[6.08,2.1,-4.1],{id:'wall-right-a',wall:true});
  this.box([.16,4.2,6.05],[6.08,2.1,1.55],{id:'wall-right-b',wall:true});
  this.box([.16,3.25,2.2],[6.08,1.625,-2.65],{id:'wall-right-low',wall:true});
  this.box([2.8,.22,2.1],[6.05,3.24,-2.65],{id:'exit-dock'});
  const shelf=this.level.shelf;this.box([1.65,.22,1.65],[shelf[0],shelf[1]-.11,shelf[2]],{id:'shelf'});
  for(const structure of themeStructures(index))this.box(structure.size,structure.p,{...structure,theme:true});
  this.addHouse();
  this.box([.75,2.35,2.3],[-4.9,1.175,-.6],{id:'decor-wheel',hidden:true});
  this.box([.56,.5,.56],index===2||index===5?[4.65,.25,3.25]:[5.25,.25,3.4],{id:'decor-pot',hidden:true});
  this.box([.8,.2,.8],[-2.9,.1,2.5],{id:'decor-bowl',hidden:true});
  this.box([.48,1.16,.48],[-5.68,2.25,1.5],{id:'decor-bottle',hidden:true});
  if(index===2||index===5)this.box([.6,.7,.6],[-5.1,.35,-1.7],{id:'decor-pot-2',hidden:true});
  if(index===1){this.box([.8,.85,.8],[-4.9,.425,3.4],{id:'decor-cupcake',hidden:true});this.box([.8,.85,.8],[4.6,.425,1.8],{id:'decor-cupcake-2',hidden:true});}
  if(index===3||index===4)this.box([.8,2.1,.8],[index===3?-4.7:-4.8,1.05,index===3?-3.4:-3.5],{id:'decor-tower',hidden:true});
  for(const spec of levelObjects(index)){
   const b=this.addObject(spec);b.updateAABB();const a=b.aabb;
   const overlap=[...this.statics,...this.objects].some(other=>{if(other===b||other.meta?.id==='floor')return false;other.updateAABB();const c=other.aabb;return a.lowerBound.x<c.upperBound.x-.02&&a.upperBound.x>c.lowerBound.x+.02&&a.lowerBound.y<c.upperBound.y-.02&&a.upperBound.y>c.lowerBound.y+.02&&a.lowerBound.z<c.upperBound.z-.02&&a.upperBound.z>c.lowerBound.z+.02;});
   if(overlap){const dimensions=[a.upperBound.x-a.lowerBound.x,a.upperBound.y-a.lowerBound.y,a.upperBound.z-a.lowerBound.z];b.position.set(...this.findSpawn(dimensions,b));b.meta.position=b.position.toArray();b.aabbNeedsUpdate=true;}
  }
  this.hamster=new C.Body({mass:.14,material:this.fur,fixedRotation:true,linearDamping:.05,allowSleep:false});
  this.hamster.addShape(new C.Sphere(.265));this.hamster.position.set(...this.level.start);this.hamster.updateMassProperties();this.world.addBody(this.hamster);
  this.hamster.addEventListener('collide',e=>{
   const contact=e.contact;let normal=contact.ni.y;if(contact.bi===this.hamster)normal=-normal;
   if(normal>.45){this.grounded=true;this.coyote=.12;}
  });
 }
 box(size,pos,meta={}){
  const body=new C.Body({mass:0,material:this.wood,shape:meta.kind==='log'?new C.Cylinder(size[0]/2,size[0]/2,size[1],24):new C.Box(new C.Vec3(...size.map(n=>n/2))),position:new C.Vec3(...pos)});body.meta={...meta,size};this.world.addBody(body);this.statics.push(body);return body;
 }
 addHouse(){
  const b=new C.Body({mass:0,material:this.wood,position:new C.Vec3(this.level.house[0],.7,this.level.house[1])});
  const add=(size,pos,q)=>b.addShape(new C.Box(new C.Vec3(...size.map(n=>n/2))),new C.Vec3(...pos),q);
  add([.09,1.4,1.45],[-.805,0,0]);add([.09,1.4,1.45],[.805,0,0]);add([1.7,1.4,.09],[0,0,-.68]);
  add([.47,1.4,.09],[-.615,0,.68]);add([.47,1.4,.09],[.615,0,.68]);add([.76,.45,.09],[0,.475,.68]);
  add([1.45,.1,1.2],[0,-.65,0]);add([1.2,.1,1.05],[0,-.65,.72]);
  const q=new C.Quaternion();q.setFromEuler(0,0,.08);add([1.95,.14,1.8],[0,.77,0],q);
  b.meta={id:'house',size:[1.7,1.4,1.45]};this.world.addBody(b);this.statics.push(b);
 }
 addObject(spec){
  const body=new C.Body({mass:spec.mass,material:this.wood,position:new C.Vec3(...spec.position),linearDamping:.56,angularDamping:.94,sleepSpeedLimit:.10,sleepTimeLimit:.45});
  const [w,h,d]=spec.size;
  if(spec.kind==='ramp'){
   const vertices=[[-w/2,-h/2,-d/2],[w/2,-h/2,-d/2],[w/2,h/2,-d/2],[-w/2,-h/2,d/2],[w/2,-h/2,d/2],[w/2,h/2,d/2]].map(v=>new C.Vec3(v[0]-w/6,v[1]+h/6,v[2]));
   body.addShape(new C.ConvexPolyhedron({vertices,faces:[[0,2,1],[3,4,5],[0,1,4,3],[1,2,5,4],[0,3,5,2]]}),new C.Vec3(w/6,-h/6,0));
  }else if(spec.kind==='tube'){
   // A compound ring is hollow: the hamster can actually walk through it.
   const radius=h/2,thickness=.065;
   for(let i=0;i<12;i++){const a=(i+.5)/12*Math.PI*2;const shape=new C.Box(new C.Vec3(w/2,thickness/2,.12));const rotation=new C.Quaternion();rotation.setFromEuler(a,0,0);body.addShape(shape,new C.Vec3(0,Math.cos(a)*(radius-thickness/2),Math.sin(a)*(radius-thickness/2)),rotation);}
  }else if(spec.kind==='stool'){
   body.addShape(new C.Box(new C.Vec3(w/2,.09,d/2)),new C.Vec3(0,h/2-.09,0));
   for(const x of [-1,1])for(const z of [-1,1])body.addShape(new C.Box(new C.Vec3(.07,(h-.18)/2,.07)),new C.Vec3(x*(w/2-.14),-.09,z*(d/2-.14)));
  }else body.addShape(new C.Box(new C.Vec3(w/2,h/2,d/2)));
  body.quaternion.setFromEuler(0,spec.yaw||0,0);body.meta={...spec};body.settlePending=true;body.stableTime=0;this.world.addBody(body);this.objects.push(body);return body;
 }
 unanchor(body){body.type=C.Body.DYNAMIC;body.mass=body.meta.mass;body.anchored=false;body.settlePending=true;body.stableTime=0;body.updateMassProperties();body.wakeUp();}
 releaseDependents(body,visited=new Set()){
  if(visited.has(body.id))return;visited.add(body.id);body.updateAABB();
  for(const other of this.objects){if(other===body||!other.anchored)continue;other.updateAABB();const a=body.aabb,b=other.aabb;
   if(b.lowerBound.y>=a.upperBound.y-.15&&b.lowerBound.y<a.upperBound.y+.18&&b.lowerBound.x<a.upperBound.x+.05&&b.upperBound.x>a.lowerBound.x-.05&&b.lowerBound.z<a.upperBound.z+.05&&b.upperBound.z>a.lowerBound.z-.05){this.releaseDependents(other,visited);this.unanchor(other);}
  }
 }
 hasSupport(body){return this.world.contacts.some(c=>{if(c.bi!==body&&c.bj!==body)return false;const other=c.bi===body?c.bj:c.bi;if(other===this.hamster||other===this.dragged)return false;const y=c.bi===body?-c.ni.y:c.ni.y;return y>.35&&other.velocity.length()<.15&&other.angularVelocity.length()<.2;});}
 updateStability(dt){
  if(!this.stabilityEnabled)return;
  for(const b of this.objects){if(b===this.dragged||b.anchored||!b.settlePending)continue;
   if(b.velocity.length()<.14&&b.angularVelocity.length()<.22&&this.hasSupport(b))b.stableTime+=dt;else b.stableTime=0;
   if(b.stableTime>.38){b.anchored=true;b.settlePending=false;b.type=C.Body.STATIC;b.mass=0;b.velocity.setZero();b.angularVelocity.setZero();b.updateMassProperties();}
  }
 }
 setStability(enabled){this.stabilityEnabled=!!enabled;for(const b of this.objects){if(b===this.dragged)continue;if(!enabled)this.unanchor(b);else{b.settlePending=true;b.stableTime=0;}}}
 removeObject(body){this.releaseDependents(body);if(this.dragged===body)this.endDrag();this.world.removeBody(body);this.objects=this.objects.filter(b=>b!==body);}
 findSpawn(size,exclude=null){
  for(const z of [2.8,1.2,-.3,-2.3])for(const x of [-2.9,-1.2,.8,2.7,4.2]){
   const pet=this.hamster?.position||{x:this.level.start[0],z:this.level.start[2]};if(Math.hypot(x-pet.x,z-pet.z)<1)continue;
   const clear=[...this.statics,...this.objects].every(b=>{if(b===exclude||b.meta?.id==='floor'||b.meta?.wall)return true;b.updateAABB();return b.aabb.lowerBound.y>size[1]+.1||x+size[0]/2+.08<b.aabb.lowerBound.x||x-size[0]/2-.08>b.aabb.upperBound.x||z+size[2]/2+.08<b.aabb.lowerBound.z||z-size[2]/2-.08>b.aabb.upperBound.z;});
   if(clear)return [x,size[1]/2+.08,z];
  }
  return [0,this.supportBelow(0,2.5)+size[1]/2+.05,2.5];
 }
 addFromCatalog(key){
  if(this.objects.length>=60)return null;const template=CATALOG.find(o=>o.key===key);if(!template)return null;
  const position=this.findSpawn(template.size),id=`added-${Date.now()}-${this.nextObjectId++}`;
  return this.addObject({id,kind:template.kind,name:template.label,size:[...template.size],mass:template.mass,position,dynamic:true,color:this.level.color});
 }
 serializeObjects(){return this.objects.map(b=>({spec:{...b.meta},p:b.position.toArray(),q:[b.quaternion.x,b.quaternion.y,b.quaternion.z,b.quaternion.w],anchored:!!b.anchored}));}
 restoreObjects(records){
  if(!Array.isArray(records)||records.length>60)return false;
  const kinds=new Set(CATALOG.map(o=>o.kind)),ids=new Set();
  const valid=records.filter(r=>r?.spec&&kinds.has(r.spec.kind)&&typeof r.spec.id==='string'&&!ids.has(r.spec.id)&&ids.add(r.spec.id)&&Array.isArray(r.spec.size)&&r.spec.size.length===3&&r.spec.size.every(n=>Number.isFinite(n)&&n>=.08&&n<=4)&&Array.isArray(r.p)&&r.p.length===3&&r.p.every(Number.isFinite)&&Math.abs(r.p[0])<=8&&Math.abs(r.p[2])<=6&&r.p[1]>=-.2&&r.p[1]<=7&&Array.isArray(r.q)&&r.q.length===4&&r.q.every(Number.isFinite)&&Number.isFinite(r.spec.mass)&&r.spec.mass>0&&r.spec.mass<10);
  for(const b of [...this.objects])this.world.removeBody(b);this.objects=[];
  for(const r of valid){const spec={...r.spec,size:[...r.spec.size],position:Array.isArray(r.spec.position)&&r.spec.position.length===3&&r.spec.position.every(Number.isFinite)?r.spec.position:[...r.p]};const b=this.addObject(spec);b.position.set(...r.p);b.quaternion.set(...r.q);b.quaternion.normalize();b.aabbNeedsUpdate=true;}
  // Restored objects settle against their supports again instead of trusting a stale lock.
  return true;
 }
 canWalkAt(x,z,feet){
  const ground=this.supportBelow(x,z,null,feet+.18);if(Math.abs(ground-feet)>.16)return false;
  return [...this.statics,...this.objects].every(b=>{
   if(b===this.dragged)return true;b.updateAABB();const a=b.aabb;
   if(a.upperBound.y<=feet+.13||a.lowerBound.y>=feet+.58)return true;
   return x+.22<=a.lowerBound.x||x-.22>=a.upperBound.x||z+.22<=a.lowerBound.z||z-.22>=a.upperBound.z;
  });
 }
 supportBelow(x,z,exclude=null,limit=10){
  const from=new C.Vec3(x,limit,z),to=new C.Vec3(x,-1,z),result=new C.RaycastResult();let best=0;
  this.world.raycastAll(from,to,{skipBackfaces:true},hit=>{if(hit.body===exclude||hit.body===this.hamster||hit.body.meta?.wall)return;if(hit.hitNormalWorld.y>.45&&hit.hitPointWorld.y>best)best=hit.hitPointWorld.y;});return best;
 }
 beginDrag(body){if(this.dragged)this.endDrag();this.releaseDependents(body);this.unanchor(body);this.dragged=body;body.type=C.Body.KINEMATIC;body.collisionResponse=false;body.velocity.setZero();body.angularVelocity.setZero();body.wakeUp();}
 moveDragged(x,z){
  const b=this.dragged;if(!b)return;
  x=Math.max(-5.3,Math.min(5.3,x));z=Math.max(-3.8,Math.min(3.8,z));
  b.updateAABB();const bottomOffset=b.position.y-b.aabb.lowerBound.y;
  const floor=this.supportBelow(x,z,b);b.position.set(x,Math.min(5.4,floor+bottomOffset+.012),z);b.aabbNeedsUpdate=true;
 }
 endDrag(){const b=this.dragged;if(!b)return;b.type=C.Body.DYNAMIC;b.collisionResponse=true;b.velocity.setZero();b.angularVelocity.setZero();b.updateMassProperties();b.settlePending=true;b.stableTime=0;b.wakeUp();this.dragged=null;}
 rotateObject(body,radians,tilt=false){if(!body)return;this.releaseDependents(body);this.unanchor(body);const q=new C.Quaternion();q.setFromAxisAngle(new C.Vec3(0,tilt?0:1,tilt?1:0),radians);body.quaternion=tilt?body.quaternion.mult(q):q.mult(body.quaternion);body.aabbNeedsUpdate=true;body.velocity.setZero();body.angularVelocity.setZero();body.wakeUp();}
 respawn(){this.hamster.type=C.Body.DYNAMIC;this.hamster.updateMassProperties();this.hamster.position.set(...this.level.start);this.hamster.velocity.setZero();this.hamster.angularVelocity.setZero();this.climb=null;this.fell=false;this.grounded=false;}
 jump(){if(this.coyote>0&&this.jumpCooldown<=0&&!this.climb){this.hamster.velocity.y=5.7;this.coyote=0;this.grounded=false;this.jumpCooldown=.22;return true;}return false;}
 tryClimb(direction){
  if(this.climb)return false;
  const h=this.hamster,p=h.position;if(Math.hypot(direction.x,direction.z)<.1)return false;
  // Raycast against actual top faces, not a bounding box: tubes remain hollow.
  for(const distance of [.48,.65,.85]){
   const x=p.x+direction.x*distance,z=p.z+direction.z*distance;
   const y=this.supportBelow(x,z,null,p.y+1.05),rise=y-(p.y-.265);
   const descending=this.grounded&&rise<-.15&&rise>=-.88;
   const fits=[[.18,0],[-.18,0],[0,.18],[0,-.18]].every(([dx,dz])=>Math.abs(this.supportBelow(x+dx,z+dz,null,y+.08)-y)<.12);
   if(((rise>.12&&rise<=.88)||descending)&&fits&&this.freeAt(x,y+.29,z)){
    this.climb={from:p.clone(),to:new C.Vec3(x,y+.285,z),elapsed:0,duration:.4};h.velocity.setZero();return true;
   }
  }return false;
 }
 freeAt(x,y,z){
  for(const b of [...this.statics,...this.objects]){if(b===this.dragged)continue;b.updateAABB();const a=b.aabb;if(x+.20>a.lowerBound.x&&x-.20<a.upperBound.x&&z+.20>a.lowerBound.z&&z-.20<a.upperBound.z&&y+.24>a.lowerBound.y&&y-.23<a.upperBound.y)return false;}
  return true;
 }
 step(dt,input={x:0,z:0},playing=true){
  this.jumpCooldown-=dt;this.coyote=Math.max(0,this.coyote-dt);
  const h=this.hamster;
  if(this.climb){
   this.climb.elapsed+=dt;const t=Math.min(1,this.climb.elapsed/this.climb.duration),smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);},up=this.climb.to.y>this.climb.from.y;
   const horizontal=smooth(up?(t-.35)/.65:t/.65),vertical=smooth(up?t/.65:(t-.35)/.65);
   h.type=C.Body.KINEMATIC;h.velocity.setZero();this.climb.from.lerp(this.climb.to,horizontal,h.position);h.position.y=this.climb.from.y+(this.climb.to.y-this.climb.from.y)*vertical+Math.sin(t*Math.PI)*.08;
   if(t===1){h.type=C.Body.DYNAMIC;h.updateMassProperties();h.velocity.setZero();this.climb=null;}
  }else{
   const active=Math.hypot(input.x,input.z)>.001;const speed=playing?this.walkSpeed:0,amount=Math.min(1,dt*(active?(this.coyote>0?22:8):32));
   h.velocity.x+=(input.x*speed-h.velocity.x)*amount;h.velocity.z+=(input.z*speed-h.velocity.z)*amount;
   if(playing&&this.coyote>0&&Math.hypot(input.x,input.z)>.2&&h.velocity.y<.5){
    const feet=h.position.y-.265,step=this.supportBelow(h.position.x+input.x*.29,h.position.z+input.z*.29,null,feet+.14);
    if(step-feet>.012&&step-feet<.12)h.position.y=step+.268;
   }
  }
  this.grounded=false;this.world.step(dt);this.updateStability(dt);this.maxHeight=Math.max(this.maxHeight,h.position.y-.265);
  // Resting contacts may not emit a new collide event on every step.
  const below=this.supportBelow(h.position.x,h.position.z,null,h.position.y+.01);
  if(Math.abs(h.position.y-.265-below)<.065&&h.velocity.y<.5){this.grounded=true;this.coyote=.12;}
  for(const b of this.objects)if(b.position.y<-4){b.position.set(...b.meta.position);b.velocity.setZero();b.angularVelocity.setZero();b.quaternion.setFromEuler(0,b.meta.yaw||0,0);}
  if(h.position.y<-2||Math.abs(h.position.x)>9||Math.abs(h.position.z)>7){this.respawn();this.fell=true;}
  const outside=Math.abs(h.position.x)>6.33||Math.abs(h.position.z)>4.84;
  if(!this.won&&outside&&h.position.y>0&&this.grounded){this.won=true;}
 }
}
