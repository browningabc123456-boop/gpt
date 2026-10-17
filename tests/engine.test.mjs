import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, Simulation, makeItem, supportedItems, gateIsOpen } from '../src/engine.js';

const solutions=[
  [['board',310,430],['spring',700,430]],
  [['board',315,430],['spring',795,430]],
  [['board',310,440],['spring',620,440]],
  [['board',305,440],['spring',640,455]],
  [['tube',305,430],['board',515,430],['spring',810,430]],
  [['tube',285,450],['board',470,450],['spring',590,450,60,580],['board',1025,345]]
];
function itemsFor(route){return route.map(([type,x,y,angle,power],i)=>({...makeItem(type,x,y,i+1),...(angle?{angle}:{}),...(power?{power}:{})}));}
function run(sim){for(let frame=0;frame<5000&&sim.state==='running';frame++)sim.step(1/120);return sim;}
for(let i=0;i<LEVELS.length;i++){
  test(`关卡 ${i+1}：材料限额内的实际路线可以通关并收齐三颗瓜子`,()=>{
    const level=LEVELS[i],items=itemsFor(solutions[i]);
    for(const type of ['board','tube','spring'])assert.ok(items.filter(o=>o.type===type).length<=level.inventory[type]);
    assert.equal(supportedItems(level,items).size,items.length);
    const sim=run(new Simulation(level,items));
    assert.equal(sim.state,'won',sim.reason);
    assert.equal(sim.collected.size,3);
    assert.ok(Math.abs(sim.hamster.y-level.exit.y)<20);
  });
}
test('没有桥时真实坠落，不能跨空隙走到出口',()=>{
  const s=run(new Simulation(LEVELS[0],[]));assert.equal(s.state,'failed');assert.match(s.reason,/木屑/);
});
test('悬空材料既没有支撑，也不能承重',()=>{
  const items=[makeItem('board',310,350,1),makeItem('spring',310,350,2)];
  assert.equal(supportedItems(LEVELS[0],items).size,0);
  assert.equal(run(new Simulation(LEVELS[0],items)).state,'failed');
});
test('持续压住按钮才会开门，收回材料后门重新关闭',()=>{
  const l=LEVELS[4],items=itemsFor(solutions[4]);
  assert.equal(gateIsOpen(l,items,supportedItems(l,items)),true);
  const withoutWeight=items.filter(o=>o.type!=='board');
  assert.equal(gateIsOpen(l,withoutWeight,supportedItems(l,withoutWeight)),false);
  const s=run(new Simulation(l,withoutWeight));assert.equal(s.state,'failed');assert.match(s.reason,/小门/);
});
test('第一关只用一座桥也能过关，不强制收齐瓜子或用完材料',()=>{
  const s=run(new Simulation(LEVELS[0],itemsFor([['board',310,430]])));
  assert.equal(s.state,'won');assert.equal(s.collected.size,2);
});
test('低矮通道中起跳会碰头，不能穿过障碍',()=>{
  const items=itemsFor([['board',315,430],['spring',540,430]]);
  const s=run(new Simulation(LEVELS[1],items));assert.equal(s.state,'failed');assert.match(s.reason,/头顶/);
});
test('弹簧力度不足时不能自动吸附到高台',()=>{
  const items=itemsFor([['board',310,440],['spring',620,440,35,420]]);
  const s=run(new Simulation(LEVELS[2],items));assert.equal(s.state,'failed');
});
test('重新试跑会清空收集和弹簧状态，不更改搭建',()=>{
  const items=itemsFor(solutions[2]),before=structuredClone(items);run(new Simulation(LEVELS[2],items));
  const next=new Simulation(LEVELS[2],items);assert.equal(next.collected.size,0);assert.equal(next.springsUsed.size,0);assert.deepEqual(items,before);
});
test('同样的路线在不同渲染帧率下得到一致的固定步长结果',()=>{
  const a=new Simulation(LEVELS[5],itemsFor(solutions[5])),b=new Simulation(LEVELS[5],itemsFor(solutions[5]));
  for(let frame=0;frame<2000&&a.state==='running';frame++){a.step(1/120);a.step(1/120);}
  run(b);assert.equal(a.state,b.state);assert.equal(a.collected.size,b.collected.size);assert.equal(a.hamster.x,b.hamster.x);
});
