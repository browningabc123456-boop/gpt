import test from 'node:test';
import assert from 'node:assert/strict';
import {CagePhysics} from '../src/physics3d.js';
import {CATALOG,LEVELS3D,themeStructures,WORLD_TO_CM} from '../src/levels3d.js';
import {screenDirection,findWalkingPath} from '../src/navigation.js';
const settle=(p,n=420)=>{for(let i=0;i<n;i++)p.step(1/120);};
test('六关主题色、固定场景和布置分别不同，比例换算为厘米',()=>{
 assert.equal(new Set(LEVELS3D.map(l=>l.color)).size,6);assert.equal(new Set(LEVELS3D.map((l,i)=>JSON.stringify(themeStructures(i)))).size,6);assert.equal(WORLD_TO_CM,10);assert.equal(CATALOG.length,9);
});
test('添加全部九种工具，名称、实体碰撞与尺寸保留',()=>{
 const p=new CagePhysics();for(const c of CATALOG){const b=p.addFromCatalog(c.key);assert.ok(b.shapes.length);assert.deepEqual(b.meta.size,c.size);assert.equal(b.meta.name,c.label);assert.notEqual(b.meta.id,c.key);}assert.equal(p.objects.length,18);assert.equal(p.addFromCatalog('unknown'),null);
});
test('保存与恢复包含新增、删除、旋转，空布局也能恢复',()=>{
 const p=new CagePhysics();p.removeObject(p.objects[0]);const b=p.addFromCatalog('small-crate');b.quaternion.setFromEuler(0,.6,0);const records=p.serializeObjects(),q=new CagePhysics();assert.ok(q.restoreObjects(records));assert.deepEqual(q.objects.map(b=>b.meta.id),records.map(r=>r.spec.id));assert.ok(Math.abs(q.objects.at(-1).quaternion.y-b.quaternion.y)<1e-9);assert.ok(q.restoreObjects([]));assert.equal(q.objects.length,0);assert.equal(q.restoreObjects(null),false);
});
test('落稳后固定，抽走底箱，上方箱子仍自然下落',()=>{
 const p=new CagePhysics();for(const b of [...p.objects])p.removeObject(b);const a=p.addFromCatalog('large-crate'),b=p.addFromCatalog('small-crate');a.position.set(0,a.meta.size[1]/2,0);b.position.set(0,a.meta.size[1]+b.meta.size[1]/2+.03,0);settle(p);assert.ok(a.anchored);assert.ok(b.anchored);assert.equal(a.mass,0);const height=b.position.y;p.removeObject(a);assert.ok(!b.anchored);assert.equal(b.mass,b.meta.mass);settle(p);assert.ok(b.position.y<height-.5);assert.ok(b.anchored);p.setStability(false);assert.ok(!b.anchored);assert.ok(b.mass>0);
});
test('屏幕方向随取样视角，斜走不加速、慢走保留幅度',()=>{
 assert.deepEqual(screenDirection(0,1,{x:0,z:-1}),{x:0,z:-1});assert.deepEqual(screenDirection(1,0,{x:0,z:-1}),{x:1,z:0});const d=screenDirection(1,1,{x:1,z:0});assert.ok(Math.abs(Math.hypot(d.x,d.z)-1)<1e-9);assert.ok(Math.abs(Math.hypot(...Object.values(screenDirection(.3,0,{x:0,z:-1})))-.3)<1e-9);
});
test('点击寻路会绕障碍，高差和封闭目标明确拒绝',()=>{
 const p={canWalkAt:(x,z)=>Math.abs(x)<2.5&&Math.abs(z)<2.5&&!(Math.abs(x)<.55&&Math.abs(z)<.55)};const start={x:-1.7,y:.265,z:0},goal={x:1.7,y:0,z:0};const r=findWalkingPath(p,start,goal);assert.ok(r.path.length>0);assert.ok(r.path.every(v=>p.canWalkAt(v.x,v.z)));assert.ok(r.path.some(v=>Math.abs(v.z)>.55));assert.equal(findWalkingPath(p,start,{x:0,y:1,z:0}).reason,'height');assert.equal(findWalkingPath(p,start,{x:0,y:0,z:0}).reason,'blocked');
});
