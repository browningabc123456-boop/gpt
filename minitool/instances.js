import * as T from 'three';
// Batch static surfaces by material state; omit dense decorative wire edges.
// Original meshes remain available for picking; snapshots own their GPU buffers.
class SnapshotBatch{
 constructor(parent){this.root=new T.Group();parent.add(this.root);this.entries=new Set();this.dirty=false;}
 add(group,hide=true){const handles=[];group.updateWorldMatrix(true,true);function visit(node,visible){visible=visible&&node.visible;if(!visible)return;if((node.isMesh||node.isLineSegments)&&node.material?.visible!==false){const count=node.isInstancedMesh?node.count:1;for(let i=0;i<count;i++){const matrix=node.matrixWorld.clone();if(node.isInstancedMesh){const local=new T.Matrix4();node.getMatrixAt(i,local);matrix.multiply(local);}if(Math.abs(matrix.determinant())<1e-10||node.isLineSegments)continue;handles.push({geometry:node.geometry,matrix,material:node.material,line:!!node.isLineSegments});}if(hide)node.visible=false;}for(const child of node.children)visit(child,visible);}
 visit(group,true);for(const item of handles)this.entries.add(item);this.dirty=true;return handles;}
 remove(handles){for(const item of handles)this.entries.delete(item);this.dirty=true;}
 dispose(){this.root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});this.root.clear();}
 flush(){if(!this.dirty)return;this.dispose();const buckets=new Map(),point=new T.Vector3(),normal=new T.Vector3(),normalMatrix=new T.Matrix3();
 for(const item of this.entries){const geo=item.geometry,positions=geo.attributes.position;if(!positions)continue;const material=Array.isArray(item.material)?item.material[0]:item.material,color=material.color||new T.Color('#415744'),window=!!material.userData.window,key=[window,material.isMeshBasicMaterial,material.side,material.transparent,material.opacity,material.depthTest,material.depthWrite,material.polygonOffset,material.polygonOffsetFactor,material.polygonOffsetUnits].join(':');if(!buckets.has(key))buckets.set(key,{p:[],n:[],c:[],source:material,window});const b=buckets.get(key),count=geo.index?geo.index.count:positions.count,colors=geo.attributes.color;normalMatrix.getNormalMatrix(item.matrix);for(let i=0;i<count;i++){const j=geo.index?geo.index.getX(i):i;point.fromBufferAttribute(positions,j).applyMatrix4(item.matrix);b.p.push(point.x,point.y,point.z);if(geo.attributes.normal)normal.fromBufferAttribute(geo.attributes.normal,j).applyMatrix3(normalMatrix).normalize();else normal.set(0,1,0);b.n.push(normal.x,normal.y,normal.z);b.c.push(color.r*(colors?colors.getX(j):1),color.g*(colors?colors.getY(j):1),color.b*(colors?colors.getZ(j):1));}}
 for(const b of buckets.values()){if(!b.p.length)continue;const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geometry.setAttribute('color',new T.Float32BufferAttribute(b.c,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));const source=b.source,options={vertexColors:true,side:source.side,transparent:source.transparent,opacity:source.opacity,depthTest:source.depthTest,depthWrite:source.depthWrite,polygonOffset:source.polygonOffset,polygonOffsetFactor:source.polygonOffsetFactor,polygonOffsetUnits:source.polygonOffsetUnits},material=source.isMeshBasicMaterial?new T.MeshBasicMaterial(options):new T.MeshStandardMaterial({...options,roughness:.94});material.userData.window=b.window;this.root.add(new T.Mesh(geometry,material));}
 this.dirty=false;this.night=null;}
 setNight(on){if(this.night===on)return;this.night=on;for(const node of this.root.children)if(node.material.userData.window&&node.material.emissive){node.material.emissive.set(on?'#ffcb81':'#000000');node.material.emissiveIntensity=on?.65:0;}}
}

// Eight editable entities share a draw batch. Editing one entity rebuilds only
// its batch, instead of copying the whole village into fresh GPU buffers.
export class TownInstances{
 constructor(parent){this.root=new T.Group();parent.add(this.root);this.chunks=[];this.night=false;}
 add(group,hide=true){let chunk=this.chunks.find(c=>c.groups<8);if(!chunk){chunk={groups:0,batch:new SnapshotBatch(this.root)};this.chunks.push(chunk);}chunk.groups++;return[{chunk,items:chunk.batch.add(group,hide)}];}
 remove(handles){for(const {chunk,items}of handles){chunk.batch.remove(items);chunk.groups--;}}
 flush(){for(const c of this.chunks)if(c.batch.dirty){c.batch.flush();c.batch.setNight(this.night);}}
 setNight(on){this.night=on;for(const c of this.chunks)c.batch.setNight(on);}
 dispose(){for(const c of this.chunks)c.batch.dispose();this.root.clear();this.chunks=[];}
}
