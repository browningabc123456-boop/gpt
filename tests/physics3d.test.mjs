import test from 'node:test';
import assert from 'node:assert/strict';
import {CagePhysics} from '../src/physics3d.js';
import {canUnlock,LEVELS3D} from '../src/levels3d.js';
const steps=(p,n=240,input={x:0,z:0},playing=true)=>{for(let i=0;i<n;i++)p.step(1/120,input,playing);};
function isolated(index=0,keep=[]){const p=new CagePhysics(index);for(const b of [...p.objects])if(!keep.includes(b.meta.id)){p.world.removeBody(b);p.objects.splice(p.objects.indexOf(b),1);}return p;}
for(let i=0;i<6;i++)test(`3D 笼子 ${i+1}：独立主题、实体边界与九件可搬物品`,()=>{
 const p=new CagePhysics(i);steps(p,180);assert.equal(p.objects.length,9);assert.equal(new Set(p.objects.map(o=>o.meta.id)).size,9);assert.ok(p.statics.some(b=>b.meta.id==='exit-dock'));assert.ok(p.hamster.position.y>.2);assert.ok(!p.won);assert.ok(p.objects.every(b=>b.position.y>-.2));assert.equal(LEVELS3D[i].name,p.level.name);
});
test('相机之外的真实运动：仓鼠会行走，停下后会减速',()=>{
 const p=isolated();p.hamster.position.set(-2,.28,1);steps(p,90,{x:1,z:0});assert.ok(p.hamster.position.x>-.4);steps(p,120);assert.ok(Math.abs(p.hamster.velocity.x)<.02);
});
test('跳跃需要落脚点，不能在空中无限连跳',()=>{
 const p=isolated();p.hamster.position.set(-2,.28,1);steps(p,60);assert.ok(p.jump());assert.equal(p.jump(),false);let max=0;for(let i=0;i<180;i++){p.step(1/120);max=Math.max(max,p.hamster.position.y);}assert.ok(max>1.3&&max<1.6);assert.ok(p.grounded);assert.ok(p.jump());
});
test('仓鼠不能穿过笼子的实心边界',()=>{
 const p=isolated();p.hamster.position.set(5,.28,1);steps(p,360,{x:1,z:0});assert.ok(p.hamster.position.x<5.85);assert.ok(!p.won);
});
test('木箱真实堆叠，底箱支撑上面的箱子',()=>{
 const p=isolated(0,['crate-a','crate-b']);const [a,b]=p.objects;a.position.set(0,.55,1);b.position.set(0,1.50,1);steps(p,480);assert.ok(Math.abs(a.position.y-.525)<.04);assert.ok(Math.abs(b.position.y-1.45)<.06);assert.ok(Math.abs(b.position.x)<.05);assert.ok(p.supportBelow(0,1)>1.80);
});
test('放开悬空物体会下落，不会浮在空中',()=>{
 const p=isolated(0,['crate-a']);const b=p.objects[0];p.beginDrag(b);b.position.set(0,4,1);p.endDrag();steps(p,300);assert.ok(Math.abs(b.position.y-.525)<.04);
});
test('拖动会吸附到下方物体的真实顶面，并保持在笼内',()=>{
 const p=isolated(0,['crate-a','crate-b']);const [a,b]=p.objects;a.position.set(0,.525,1);steps(p,60);p.beginDrag(b);p.moveDragged(0,1);assert.ok(b.position.y>1.45&&b.position.y<1.55);p.moveDragged(100,-100);assert.equal(b.position.x,5.3);assert.equal(b.position.z,-3.8);p.endDrag();assert.ok(b.collisionResponse);
});
test('矮台阶可攀上，持续按方向不会自动飞到高处',()=>{
 const p=isolated(0,['block']);const block=p.objects[0];block.position.set(-2,.35,1.4);p.hamster.position.set(-2.85,.28,1.4);steps(p,60);assert.ok(p.tryClimb({x:1,z:0}));steps(p,70);assert.ok(p.hamster.position.y>.92);assert.ok(p.hamster.position.y<1.05);assert.ok(!p.climb);
});
test('太高的墙不能直接攀上去',()=>{
 const p=isolated();p.hamster.position.set(5.45,.28,1);steps(p,60);assert.equal(p.tryClimb({x:1,z:0}),false);
});
test('面向矮台阶的边缘，可以攀下而不穿过台阶',()=>{
 const p=isolated(0,['block']);p.objects[0].position.set(-2,.35,1.4);p.hamster.position.set(-2,.985,1.4);steps(p,80);assert.ok(p.tryClimb({x:1,z:0}));steps(p,100);assert.ok(p.hamster.position.x>-1.5);assert.ok(p.hamster.position.y<.35);assert.ok(p.grounded);
});
test('纸筒中间是空心，仓鼠能从一端走到另一端',()=>{
 const p=isolated(0,['tube']);const tube=p.objects[0];tube.position.set(0,.43,1);tube.quaternion.setFromEuler(0,0,0);p.hamster.position.set(-1.7,.28,1);steps(p,200,{x:1,z:0});assert.ok(p.hamster.position.x>1.5,`stopped at ${p.hamster.position.x}`);assert.ok(!p.won);
});
test('停留在笼内高台不算通关，落到笼外才算',()=>{
 const p=isolated();p.hamster.position.set(5.2,3.65,-2.65);steps(p,70);assert.equal(p.won,false);steps(p,110,{x:1,z:0});assert.equal(p.won,true);
});
test('爬出其他围栏也算成功，允许自己的解法',()=>{
 const p=isolated();p.hamster.position.set(-6.8,1,0);steps(p,140);assert.ok(p.won);
});
test('依次解锁，未完成上一关不能打开下一关',()=>{
 assert.ok(canUnlock(0,{}));assert.equal(canUnlock(1,{}),false);assert.ok(canUnlock(1,{0:{completed:true}}));assert.equal(canUnlock(2,{0:{completed:true}}),false);
});
test('跌出桌面会回到小窝，搭建物件保留',()=>{
 const p=isolated(0,['crate-a']);const b=p.objects[0];b.position.set(1,.525,1);p.hamster.position.set(10,-5,0);p.step(1/120);assert.ok(Math.abs(p.hamster.position.x-p.level.start[0])<.1);assert.ok(Math.abs(b.position.x-1)<.1);assert.ok(!p.won);
});
function walkTo(p,x,z,limit=1000){
 for(let i=0;i<limit;i++){const dx=x-p.hamster.position.x,dz=z-p.hamster.position.z,d=Math.hypot(dx,dz);steps(p,1,d>.055?{x:dx/d,z:dz/d}:{x:0,z:0});if(d<.08&&p.grounded&&Math.hypot(p.hamster.velocity.x,p.hamster.velocity.z)<.2)return true;}return false;
}
function jumpTo(p,x,z){assert.ok(p.jump(),'needs a grounded takeoff');assert.ok(walkTo(p,x,z,500),'must land at the intended platform');}
for(let index=0;index<6;index++)test(`笼子 ${index+1} 实际通关：堆箱、攀爬、连续跳跃，最后走到笼外`,()=>{
 const p=new CagePhysics(index),object=id=>p.objects.find(b=>b.meta.id===id);
 // Only arrange the existing loose tools, just as the player can in build mode.
 // The hamster is never teleported or given a new velocity during the route.
 // Clear the loose board from beneath the stool before making a stable stair.
 object('plank-b').position.set(3.7,.11,-.3);
 object('crate-a').position.set(.3,.55,-1.8);object('crate-b').position.set(.3,1.5,-1.8);
 object('stool').position.set(-1.3,object('stool').meta.size[1]/2+.02,-1.8);object('stool').quaternion.setFromEuler(0,0,0);
 if(index===5){object('plank-a').position.set(3.7,3.4,-2.65);object('plank-a').quaternion.setFromEuler(0,0,.13);}
 steps(p,300);assert.ok(walkTo(p,-2.5,-1.8));
 if(!p.tryClimb({x:1,z:0}))jumpTo(p,-1.65,-1.8);steps(p,65);
 assert.ok(walkTo(p,-.97,-1.8));jumpTo(p,.3,-1.8);assert.ok(walkTo(p,.6,-1.95));
 const shelf=p.level.shelf;jumpTo(p,shelf[0]-.625,-2.1);assert.ok(walkTo(p,shelf[0]+.5,-2.65));
 assert.equal(p.won,false,'inside shelves are not an escape');
 if(index===5)assert.ok(walkTo(p,5.3,-2.65));else jumpTo(p,5.05,-2.65);
 assert.ok(walkTo(p,6.6,-2.65));assert.equal(p.won,true,'must actually cross the cage boundary and land');
});
