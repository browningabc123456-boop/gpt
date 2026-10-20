import * as T from 'three';
// Repeated paper pieces share geometry; a brush stroke uploads only instance poses.
export class PaperBatches{
 constructor(group,depth){this.group=group;this.depth=depth;this.pools=new Map();this.dirty=new Set();this.stats={matrixWrites:0,allocations:0,releases:0};}
 clear(){for(let list of this.pools.values())for(let c of list){this.group.remove(c.mesh);c.geo.dispose();c.mesh.dispose();}this.pools.clear();this.dirty.clear();}
 allocate(source){let key=source.geometry.uuid+':'+source.material.uuid,list=this.pools.get(key);if(!list)this.pools.set(key,list=[]);for(let c of list){if(c.free.length){c.live++;return{c,index:c.free.pop()};}if(c.used<c.capacity){c.live++;return{c,index:c.used++};}}
  const capacity=Math.min(2048,list.length?list.at(-1).capacity*2:128),geo=source.geometry.clone(),birth=new T.InstancedBufferAttribute(new Float32Array(capacity).fill(-1e8),1).setUsage(T.DynamicDrawUsage),pivot=new T.InstancedBufferAttribute(new Float32Array(capacity*3),3);geo.setAttribute('paperBirth',birth);geo.setAttribute('paperPivot',pivot);let mesh=new T.InstancedMesh(geo,source.material,capacity);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.count=0;mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.customDepthMaterial=this.depth;const c={mesh,geo,birth,used:1,live:1,capacity,free:[],min:Infinity,max:0};list.push(c);this.group.add(mesh);this.stats.allocations++;return{c,index:0};
 }
 mark(c,index){c.min=Math.min(c.min,index);c.max=Math.max(c.max,index+1);this.dirty.add(c);}
 add(group,birth){let handles=[];group.updateMatrixWorld(true);group.traverse(source=>{if(!source.isMesh)return;let h={...this.allocate(source),source};handles.push(h);this.write(h,birth);});return handles;}
 write(h,birth){let{c,index,source}=h;c.mesh.visible=true;c.mesh.setMatrixAt(index,source.matrixWorld);c.birth.setX(index,birth);this.mark(c,index);this.stats.matrixWrites++;}
 update(handles,group,birth){group.updateMatrixWorld(true);for(let h of handles)this.write(h,birth);}
 remove(handles){for(let h of handles){h.c.birth.setX(h.index,-1e8);h.c.live--;if(!h.c.live)h.c.mesh.visible=false;h.c.free.push(h.index);this.mark(h.c,h.index);this.stats.releases++;}}
 flush(){for(let c of this.dirty){c.mesh.count=c.used;c.mesh.instanceMatrix.addUpdateRange(c.min*16,(c.max-c.min)*16);c.mesh.instanceMatrix.needsUpdate=true;c.birth.addUpdateRange(c.min,c.max-c.min);c.birth.needsUpdate=true;c.min=Infinity;c.max=0;}this.dirty.clear();}
}
