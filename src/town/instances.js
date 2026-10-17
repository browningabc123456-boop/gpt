import * as T from 'three';
// Persistent GPU buckets: edit instance transforms instead of copying the whole town's vertices.
export class TownInstances{
 constructor(parent){this.root=new T.Group();parent.add(this.root);this.buckets=new Map();this.zero=new T.Matrix4().makeScale(0,0,0);this.changed=new Set();}
 bucket(object){const line=object.isLineSegments,key=line?`line:${object.geometry.uuid}:${object.material.color.getHex()}:${object.material.opacity}`:`mesh:${object.geometry.uuid}:${object.material.uuid}`;
  if(!this.buckets.has(key)){const material=line?new T.ShaderMaterial({uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{ink:{value:object.material.color.clone()},opacity:{value:object.material.opacity}}]),vertexShader:`attribute mat4 instanceMatrix;
#include <fog_pars_vertex>
void main(){vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,fragmentShader:`uniform vec3 ink;uniform float opacity;
#include <fog_pars_fragment>
void main(){gl_FragColor=vec4(ink,opacity);
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`,transparent:true,depthWrite:false,fog:true}):object.material;
   const b={key,line,geometry:object.geometry,material,capacity:0,count:0,active:[],free:[],matrices:null,object:null};this.buckets.set(key,b);this.resize(b,8);
  }return this.buckets.get(key);
 }
 resize(b,capacity){const matrices=new Float32Array(capacity*16);if(b.matrices)matrices.set(b.matrices.subarray(0,Math.min(matrices.length,b.matrices.length)));if(b.object){this.root.remove(b.object);if(b.line)b.object.geometry.dispose();else b.object.dispose();}
  b.capacity=capacity;b.matrices=matrices;
  if(b.line){const geo=new T.InstancedBufferGeometry();geo.setAttribute('position',b.geometry.getAttribute('position'));geo.setAttribute('instanceMatrix',new T.InstancedBufferAttribute(matrices,16).setUsage(T.DynamicDrawUsage));geo.instanceCount=b.count;b.object=new T.LineSegments(geo,b.material);}
  else{b.object=new T.InstancedMesh(b.geometry,b.material,capacity);b.object.instanceMatrix=new T.InstancedBufferAttribute(matrices,16).setUsage(T.DynamicDrawUsage);b.object.count=b.count;b.object.castShadow=true;b.object.receiveShadow=true;}
  b.object.frustumCulled=false;this.root.add(b.object);this.changed.add(b);
 }
 add(group){const handles=[];group.updateWorldMatrix(true,true);group.traverse(object=>{if(!object.isMesh&&!object.isLineSegments)return;const b=this.bucket(object);let slot;while(b.free.length){const n=b.free.pop();if(n<b.count&&!b.active[n]){slot=n;break;}}if(slot===undefined)slot=b.count++;if(slot>=b.capacity)this.resize(b,b.capacity*2);b.active[slot]=true;object.matrixWorld.toArray(b.matrices,slot*16);object.visible=false;handles.push({bucket:b,slot});this.changed.add(b);});return handles;}
 remove(handles){for(const {bucket:b,slot}of handles){b.active[slot]=false;this.zero.toArray(b.matrices,slot*16);b.free.push(slot);while(b.count>0&&!b.active[b.count-1])b.count--;this.changed.add(b);}}
 flush(){for(const b of this.changed){if(b.line){b.object.geometry.instanceCount=b.count;b.object.geometry.getAttribute('instanceMatrix').needsUpdate=true;}else{b.object.count=b.count;b.object.instanceMatrix.needsUpdate=true;}b.object.visible=b.count>0;}this.changed.clear();}
}
