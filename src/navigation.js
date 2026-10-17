// Pure helpers keep movement consistent even while the camera is being orbited.
export function screenDirection(horizontal,vertical,forward){
 const length=Math.hypot(forward.x,forward.z)||1,fx=forward.x/length,fz=forward.z/length;
 let x=fx*vertical-fz*horizontal,z=fz*vertical+fx*horizontal;
 const magnitude=Math.hypot(x,z);if(magnitude>1){x/=magnitude;z/=magnitude;}return {x,z};
}
export function findWalkingPath(physics,start,goal){
 const feet=start.y-.265,spacing=.34;
 if(Math.abs(goal.y-feet)>.25)return {path:[],reason:'height'};
 const key=(x,z)=>`${x},${z}`,quantize=v=>Math.round(v/spacing),sx=quantize(start.x),sz=quantize(start.z),gx=quantize(goal.x),gz=quantize(goal.z);
 const open=[{x:sx,z:sz,g:0,f:0}],records=new Map([[key(sx,sz),open[0]]]),closed=new Set(),walkCache=new Map();let found=null;
 const walkable=(x,z)=>{const k=key(x,z);if(!walkCache.has(k))walkCache.set(k,Math.abs(x*spacing)<7.35&&Math.abs(z*spacing)<5.9&&physics.canWalkAt(x*spacing,z*spacing,feet));return walkCache.get(k);};
 for(let attempts=0;open.length&&attempts<1600;attempts++){
  open.sort((a,b)=>a.f-b.f);const node=open.shift(),k=key(node.x,node.z);if(closed.has(k))continue;closed.add(k);
  if(Math.hypot(node.x-gx,node.z-gz)<=1&&physics.canWalkAt(goal.x,goal.z,feet)){found=node;break;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=node.x+dx,z=node.z+dz,nk=key(x,z);if(closed.has(nk)||!walkable(x,z))continue;
   // Avoid cutting diagonally through the corner of a crate or wall.
   if(dx&&dz&&(!walkable(node.x+dx,node.z)||!walkable(node.x,node.z+dz)))continue;
   const cost=node.g+Math.hypot(dx,dz),previous=records.get(nk);if(previous&&previous.g<=cost)continue;
   const next={x,z,g:cost,f:cost+Math.hypot(x-gx,z-gz),parent:node};records.set(nk,next);open.push(next);
  }
 }
 if(!found)return {path:[],reason:'blocked'};
 const path=[{x:goal.x,y:feet,z:goal.z}];for(let n=found;n?.parent;n=n.parent)path.push({x:n.x*spacing,y:feet,z:n.z*spacing});path.reverse();
 return {path,reason:null};
}
