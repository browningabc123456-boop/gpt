// Pure discovery rules: renderers and residents share the same building semantics.
const FORMS={
 forest:{house:['林间小屋','树影 Loft','布谷钟楼','林间守望塔','树梢观星台','风铃灯塔'],platform:['木栈台','野餐凉亭','树梢舞台','风车瞭望台','飞艇码头','林冠灯塔'],garden:['香草小圃','玻璃温室','藤蔓瀑布园','蝴蝶花房','果树空中园','生命之树']},
 sky:{house:['云顶小屋','拱廊复式','星盘钟楼','云端日晷塔','星象宫','日月灯塔'],platform:['云纹石台','拱券茶亭','竖琴音乐台','热气球驿站','星轨观景台','天空风帆塔'],garden:['云朵花池','水晶花房','星泉瀑布','月桂穹庭','漂浮星花园','云端花冠']},
 snow:{house:['雪檐木屋','暖窗复式','雪国钟楼','雪峰石塔','极光观测站','雪峰信号塔'],platform:['雪纹石台','暖汤歇脚亭','雪橇瞭望台','雪国风车','缆车小站','极光灯塔'],garden:['雪松小院','暖光温室','层叠暖汤','冬日茶室','雪晶花园','祈愿雪松']},
 garden:{house:['蘑菇小屋','花瓣复式','瓢虫钟楼','种子藏馆','露珠观测室','铃兰灯塔'],platform:['叶片小台','花瓣茶座','蜗牛音乐台','蒲公英观景台','蜂蜜气球站','花蕊灯塔'],garden:['苔藓花圃','露珠花房','花瀑叠院','蝴蝶花亭','浆果空中园','巨型向日葵']}
};
const PAIRS={forest:{house:['双子面包铺','林间集市','围炉街坊'],platform:['长桌野餐台','林间小舞台','环树广场'],garden:['藤蔓花门','香草小径','森林花圃']},sky:{house:['双子拱门','云上商街','星环院落'],platform:['云端茶席','竖琴广场','日晷广场'],garden:['云泉花桥','星光花廊','月桂庭院']},snow:{house:['暖汤旅馆','雪乡商街','暖灯小院'],platform:['雪橇驿站','冬日集会','温泉广场'],garden:['暖汤双池','雪松步道','雪国汤苑']},garden:{house:['瓢虫点心铺','花间市集','蜂蜜小院'],platform:['叶上茶会','花瓣音乐台','花蕊广场'],garden:['蝴蝶花门','花蜜长廊','花间迷宫']}};
for(const [theme,prefix]of [['city','街角'],['ants','地心']]){
 FORMS[theme]={house:theme==='city'?['街角公寓','玻璃复式','报时公馆','艺术档案塔','天文公寓','城市信号塔']:['种子小窝','双层粮仓','菌菇钟室','琥珀藏馆','根须观测室','萤石灯塔'],platform:theme==='city'?['人行小广场','街角咖啡亭','露天剧台','电车观景站','空中候车厅','广播塔']:['砂岩台地','根须茶座','菌丝舞台','化石瞭望台','种子站台','地心瞭望塔'],garden:theme==='city'?['街角花池','屋顶温室','垂直绿洲','玻璃花厅','空中果园','城市绿冠']:['苔藓苗圃','菌菇温室','地下水庭','萤光花房','根须果园','生命菌树']};
 PAIRS[theme]=Object.fromEntries(['house','platform','garden'].map((k,i)=>[k,[prefix+['双子商铺','双人茶席','双生花门'][i],prefix+['小集市','音乐广场','花廊'][i],prefix+['街坊','大广场','秘园'][i]]]));
}
export {PAIRS as PAIR_FORMS};
export function stackForm(cell,level=cell.kinds.length-1,theme='forest'){
 const kind=cell.kinds[level];let start=level,end=level;if(!FORMS[theme]?.[kind])return{kind,height:0,start,end,name:'支撑',form:0};
 while(start>0&&cell.kinds[start-1]===kind)start--;while(end+1<cell.kinds.length&&cell.kinds[end+1]===kind)end++;
 const height=end-start+1;return{kind,height,start,end,form:height-1,name:FORMS[theme][kind][height-1],floor:level-start};
}
export function facadeDesign(theme,height,floor,side=0){const themes={forest:['cottage','greenhouse','cuckoo','books','telescope','lantern'],sky:['porthole','arcade','astrolabe','lattice','stars','sunburst'],snow:['shutters','panorama','snowclock','hearth','hexagon','beacon'],garden:['seed','petal','ladyclock','honeycomb','dewdrop','bellflower']};return{motif:themes[theme]?.[height-1]||`${theme}-${height}`,floor,variation:(floor+side)%3,signature:`${theme}:${height}:${floor}:${side}`};}
export function horizontalGroups(town){const result=[],seen=new Set();for(const c of town.cells.values())for(let level=0;level<c.kinds.length;level++){
 const kind=c.kinds[level];if(!FORMS[town.theme]?.[kind])continue;const key=`${c.x},${c.z},${level},${kind}`;if(seen.has(key))continue;
 const members=[],queue=[c];seen.add(key);while(queue.length){const a=queue.shift();members.push({x:a.x,z:a.z});for(const n of town.neighbors(a.x,a.z)){const nk=`${n.x},${n.z},${level},${kind}`;if(n.kinds[level]===kind&&!seen.has(nk)){seen.add(nk);queue.push(n);}}}
 if(members.length<2)continue;members.sort((a,b)=>a.x-b.x||a.z-b.z);const minX=Math.min(...members.map(m=>m.x)),maxX=Math.max(...members.map(m=>m.x)),minZ=Math.min(...members.map(m=>m.z)),maxZ=Math.max(...members.map(m=>m.z));const stage=members.length===2?0:members.length===3?1:2;
 result.push({id:`${level}:${kind}:${members[0].x},${members[0].z}`,kind,level,members,size:members.length,stage,name:PAIRS[town.theme][kind][stage],center:{x:(minX+maxX)/2,z:(minZ+maxZ)/2},spanX:maxX-minX+1,spanZ:maxZ-minZ+1});
 }return result;}
export function groupFor(groups,c,level,kind=c.kinds[level]){return groups.find(g=>g.level===level&&g.kind===kind&&g.members.some(m=>m.x===c.x&&m.z===c.z));}
export {FORMS as STACK_FORMS};
