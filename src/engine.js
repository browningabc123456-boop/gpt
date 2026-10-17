export const WIDTH = 1200, HEIGHT = 650;
export const MATERIALS = {
  board: { name: '木板', length: 190, color: '#cea46c' },
  tube: { name: '纸筒', length: 180, color: '#c29a70' },
  spring: { name: '弹簧垫', length: 66, color: '#8b9d76' }
};
const p = (x, w, y) => ({ x, w, y });
export const LEVELS = [
  { name: '午后的小木桥', theme: '暖阳木屋 · 第一次开工', difficulty: 1,
    mission: '小屋飘来饼干的香味。跨过木屑小沟，去找一份午后点心吧。',
    hint: '把木板的一端搭在左侧平台边缘，另一端搭上右侧。绿色端点说明有支撑。纸筒也能当一座小桥。',
    platforms: [p(0,225,430),p(400,800,430)], inventory: { board:2,tube:1,spring:1 },
    seeds:[{x:300,y:390},{x:570,y:398},{x:790,y:302}], exit:{x:1080,y:430}, start:{x:110,y:430}, obstacles:[] },
  { name: '纸箱下的秘密', theme: '纸箱乐园 · 留一点空间', difficulty: 2,
    mission: '纸箱压低了头顶的空间。搭好桥，再想想怎样从窄窄的通道里穿过去。',
    hint: '这里的矮顶不适合弹跳。平放木板或纸筒就能跨沟，别让通道向上倾斜太多。',
    platforms:[p(0,230,430),p(400,800,430)], inventory:{board:2,tube:1,spring:1},
    seeds:[{x:310,y:398},{x:620,y:400},{x:850,y:320}], exit:{x:1080,y:430}, start:{x:100,y:430},
    obstacles:[{x:245,y:225,w:155,h:135,type:'ceiling'},{x:575,y:240,w:155,h:138,type:'ceiling'}] },
  { name: '向上的小勇气', theme: '积木花园 · 找准起跳点', difficulty: 3,
    mission: '点心被放上了高高的平台。先跨过小沟，再让弹簧送小团子上楼。',
    hint: '先连通左侧小沟，再把弹簧放在中间平台靠右的位置。默认力度能跳上高台，注意落点，必要时调整角度。',
    platforms:[p(0,220,440),p(395,245,440),p(780,420,350)], inventory:{board:2,tube:1,spring:1},
    seeds:[{x:300,y:408},{x:700,y:300},{x:960,y:318}], exit:{x:1090,y:350},start:{x:105,y:440},obstacles:[] },
  { name: '拐个弯，再起飞', theme: '玩具阁楼 · 留意落点', difficulty: 4,
    mission: '先钻过低矮的阁楼，再跨越第二道沟。起跳太早，可会碰到头顶哦。',
    hint: '第一座桥可以水平搭，下桥时会落到稍低的平台。把弹簧放在低顶右边、平台最右端附近，向高台起跳。',
    platforms:[p(0,220,430),p(390,270,455),p(825,375,375)],inventory:{board:2,tube:1,spring:1},
    seeds:[{x:305,y:398},{x:746,y:320},{x:1010,y:343}],exit:{x:1100,y:375},start:{x:105,y:430},
    obstacles:[{x:355,y:235,w:180,h:90,type:'ceiling'}] },
  { name: '谁来按住小机关', theme: '饼干工坊 · 分配材料', difficulty: 4,
    mission: '小门需要有人一直按住按钮。留下一个零件帮忙，再给小团子铺路吧。',
    hint: '把一块木板平放在绿色按钮上，让它持续压住按钮。剩下的木板或纸筒用来搭桥。按钮不是一次性开关。',
    platforms:[p(0,220,430),p(390,810,430)],inventory:{board:2,tube:1,spring:1},
    seeds:[{x:300,y:398},{x:620,y:398},{x:900,y:315}],exit:{x:1090,y:430},start:{x:100,y:430},
    obstacles:[],plate:{x:515,y:430},gate:{x:730,y:250,w:28,h:180} },
  { name: '小团子的毕业设计', theme: '秘密花房 · 小小工程师', difficulty: 5,
    mission: '窄通道、机关门和高台都到齐了。四个零件，各有自己的任务。慢慢想，路线不止一种。',
    hint: '一种思路：纸筒连接第一道沟；木板压住中间的按钮；平台右端放弹簧，力度稍大一点；最后一块木板连接高台。',
    platforms:[p(0,200,450),p(370,240,450),p(790,180,345),p(1080,120,345)],inventory:{board:2,tube:1,spring:1},
    seeds:[{x:285,y:418},{x:710,y:286},{x:1015,y:313}],exit:{x:1140,y:345},start:{x:95,y:450},
    obstacles:[{x:205,y:265,w:200,h:122,type:'ceiling'}],plate:{x:470,y:450},gate:{x:920,y:190,w:25,h:155} }
];
export function makeItem(type,x,y,id=Date.now()+Math.random()) { return {id,type,x,y,angle:type==='spring'?60:0,power:540}; }
export function ends(item) {
  const a = (item.type==='spring'?0:item.angle)*Math.PI/180, l=MATERIALS[item.type].length/2;
  return [{x:item.x-Math.cos(a)*l,y:item.y-Math.sin(a)*l},{x:item.x+Math.cos(a)*l,y:item.y+Math.sin(a)*l}];
}
export function segmentY(segment,x) {
  const [a,b]=segment;
  if(x<Math.min(a.x,b.x)-1||x>Math.max(a.x,b.x)+1) return null;
  return a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x||1);
}
export function platformSegments(level) {return level.platforms.map(p=>[{x:p.x,y:p.y},{x:p.x+p.w,y:p.y}]);}
// Building pieces are anchored. Both ends of a bridge must connect to the cage or
// another supported piece; a spring needs a supported center, never floating air.
export function supportedItems(level,items) {
  const supported=new Set(), surfaces=platformSegments(level);
  const nearSurface=(point)=>surfaces.some(s=>{const y=segmentY(s,point.x);return y!==null&&Math.abs(point.y-y)<=16;});
  for(let pass=0;pass<=items.length;pass++) {
    let added=false;
    for(const item of items) {
      if(supported.has(item.id))continue;
      const ok=item.type==='spring'?nearSurface(item):ends(item).every(nearSurface);
      if(ok){supported.add(item.id);if(item.type!=='spring')surfaces.push(ends(item));added=true;}
    }
    if(!added)break;
  }
  return supported;
}
export function gateIsOpen(level,items,supported) {
  if(!level.plate)return true;
  return items.some(o=>supported.has(o.id)&&o.type!=='spring'&&Math.abs(o.x-level.plate.x)<45&&Math.abs(o.y-level.plate.y)<17&&Math.abs(o.angle)<12);
}
export class Simulation {
  constructor(level,items){
    this.level=level;this.items=structuredClone(items);this.supported=supportedItems(level,items);
    this.gateOpen=gateIsOpen(level,items,this.supported);this.time=0;this.state='running';this.reason='';
    this.hamster={x:level.start.x,y:level.start.y,vx:110,vy:0,grounded:true,rotation:0};
    this.collected=new Set();this.springsUsed=new Set();this.events=[];
    this.surfaces=[...platformSegments(level),...items.filter(o=>o.type!=='spring'&&this.supported.has(o.id)).map(ends)];
  }
  fail(reason){this.state='failed';this.reason=reason;this.events.push({type:'fail'});}
  step(dt){
    if(this.state!=='running')return;
    const h=this.hamster, oldX=h.x,oldY=h.y;this.time+=dt;
    h.vy+=900*dt;
    h.x+=h.vx*dt;h.y+=h.vy*dt;h.grounded=false;
    let landing=null;
    for(const surface of this.surfaces){
      const next=segmentY(surface,h.x), prev=segmentY(surface,oldX);
      if(next===null)continue;
      const before=prev??next;
      // Follow small slopes when walking. In flight, land only when descending
      // across the top, so a bridge cannot teleport the hamster upwards.
      const onSlope=Math.abs(oldY-before)<5&&h.vy>=0&&Math.abs(next-oldY)<8;
      if((h.vy>=0&&oldY<=next+3&&h.y>=next)||onSlope){if(landing===null||next<landing)landing=next;}
    }
    if(landing!==null){h.y=landing;h.vy=0;h.grounded=true;h.vx=110;}
    for(const item of this.items){
      if(item.type!=='spring'||!this.supported.has(item.id)||this.springsUsed.has(item.id))continue;
      if(h.grounded&&Math.abs(h.x-item.x)<29&&Math.abs(h.y-item.y)<18){
        const a=item.angle*Math.PI/180;
        h.vx=item.power*Math.cos(a);h.vy=-item.power*Math.sin(a);h.grounded=false;
        this.springsUsed.add(item.id);this.events.push({type:'bounce',x:item.x,y:item.y});
      }
    }
    const solids=[...this.level.obstacles,...(this.level.gate&&!this.gateOpen?[this.level.gate]:[])];
    for(const r of solids){
      const clearance=h.y-(r.y+r.h);
      const bodyHeight=h.grounded&&clearance>34&&clearance<68?34:58;
      const overlap=h.x+22>r.x&&h.x-22<r.x+r.w&&h.y>r.y+2&&h.y-bodyHeight<r.y+r.h;
      if(!overlap)continue;
      if(this.level.gate===r){this.fail('小门还关着。用一块平放的木板或纸筒持续压住绿色按钮吧。');return;}
      this.fail('头顶的空间不够啦。试着降低路线，或把起跳点移到低顶右侧。');return;
    }
    for(let i=0;i<this.level.seeds.length;i++){
      const seed=this.level.seeds[i];
      if(!this.collected.has(i)&&Math.hypot(seed.x-h.x,seed.y-(h.y-20))<34){this.collected.add(i);this.events.push({type:'seed',x:seed.x,y:seed.y});}
    }
    if(h.y>590){this.fail('扑通，落在软木屑上了！检查桥的两端是否有支撑，或调整弹簧的落点。');return;}
    if(h.x>this.level.exit.x-7&&Math.abs(h.y-this.level.exit.y)<20){this.state='won';this.events.push({type:'win'});return;}
    if(h.x>1240||this.time>32){this.fail('这条路线还差一点点，回工作台调整一下吧。');}
  }
}
