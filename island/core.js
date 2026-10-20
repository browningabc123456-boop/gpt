(function(root){
'use strict';
const W=3600,H=2600,CX=1800,CY=1240,MAX=12000;
function boundary(a){return 1+.055*Math.sin(a*5+.5)+.035*Math.cos(a*9)+.018*Math.sin(a*13);}
function inside(x,y,margin=0,expansion=1){let nx=(x-CX)/(1550*expansion),ny=(y-CY)/(1010*expansion);return Math.hypot(nx,ny)<boundary(Math.atan2(ny,nx))-margin;}
const RIVER=[[1900,380],[2130,620],[2020,880],[2270,1110],[2160,1320],[2480,1580],[2260,1820],[1900,2040]];
function distanceSegment(p,a,b){let dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function pond(x,y){return ((x-2500)/280)**2+((y-1600)/155)**2<1||RIVER.some(([xx,yy],i)=>i&&distanceSegment({x,y},{x:RIVER[i-1][0],y:RIVER[i-1][1]},{x:xx,y:yy})<62);}
function random(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const specs=[];
function add(id,name,cat,kind,step=65,hint='轻点一处，划动成片'){specs.push({id,name,cat,kind,step,hint});}
[['flower','小雏菊'],['tulip','郁金香'],['lavender','薰衣草'],['sunflower','向日葵'],['poppy','虞美人'],['hydrangea','绣球花'],['rose','玫瑰'],['cosmos','波斯菊']].forEach(([id,n])=>add(id,n,'flowers','flower',30));
[['tree','纸松'],['oak','橡树'],['birch','白桦'],['cherry','樱花树'],['willow','垂柳'],['maple','红枫'],['palm','棕榈']].forEach(([id,n])=>add(id,n,'trees','tree',105));
add('bamboo','竹林','trees','tree',85);add('fern','蕨类','trees','bush',45);add('bush','圆叶灌木','trees','bush',60);add('hedge','整篱灌木','trees','bush',50);add('reed','芦苇','flowers','aquatic',36,'只在水域生长');add('lotus','荷叶荷花','flowers','aquatic',45,'只在水域生长');
add('water','溪流与水潭','land','water',18,'轻点成潭，滑动成溪');
[['rock','折面山石'],['pebble','圆润卵石'],['slate','层页石'],['basalt','玄武岩'],['crystal','水晶簇']].forEach(([id,n])=>add(id,n,'rocks','rock',70));
[['house','原木小屋'],['cottage','乡间白屋'],['greenhouse','玻璃花房'],['windmill','田野风车'],['tent','露营帐篷'],['gazebo','六角凉亭']].forEach(([id,n])=>add(id,n,'build','building',Infinity,'点击放置；按住拖动调整朝向'));
add('bridge','木桥','build','bridge',36,'沿着笔迹连续衔接');add('fence','木栅栏','build','fence',36,'沿着笔迹连续衔接');add('stonewall','石矮墙','build','fence',42,'连续衔接的石头边界');
[['lamp','石灯'],['lantern','纸灯笼'],['bench','长椅'],['mushroom','蘑菇'],['well','许愿井'],['picnic','野餐桌'],['flowerpot','陶土花盆'],['sign','木路牌'],['cart','花车'],['fountain','庭院喷泉'],['windchime','风铃']].forEach(([id,n])=>add(id,n,'detail','decor',140,'轻点一个，长划少量一组'));
add('mist','层叠薄雾','mood','mist',55,'第一笔轻雾，反复涂抹逐渐浓郁');add('light','林间光斑','mood','light',85,'柔和光束与地面碎光');add('firefly','萤火虫','mood','firefly',65,'暖黄微光，沿着弧线缓缓飞舞');add('meteor','流星','mood','meteor',200,'夜空划过细长的星尾');
[['raise','抬高地形'],['lower','挖低地形'],['flatten','平整地形'],['mound','圆丘'],['terrace','梯田台地'],['sand','细沙地'],['meadow','嫩草地'],['path','土色小径'],['wetland','湿地'],['gravel','碎石地']].forEach(([id,n])=>add('terrain_'+id,n,'land','terrain',28,['raise','lower','mound','terrace','flatten'].includes(id)?'反复涂抹雕刻地势，可撤销':'涂抹地表的剪纸材质'));
[['person','散步旅人'],['child','小小居民'],['cat','猫咪'],['dog','小狗'],['rabbit','兔子'],['deer','小鹿'],['sheep','绵羊'],['duck','野鸭'],['bird','小鸟'],['butterfly','蝴蝶']].forEach(([id,n])=>add(id,n,'life','life',150,'轻点迎来一位，拖动少量来访'));
const catalog=Object.fromEntries(specs.map(s=>[s.id,s]));
const brushes=specs.map(s=>[s.id,s.name,s.hint,s.cat]);const spacing=Object.fromEntries(specs.map(s=>[s.id,s.step]));spacing.erase=20;
function kind(type){return catalog[type]?.kind||type;}
class Island{
 constructor(objects=[],meta={}){this.objects=objects;this.expansion=Math.max(1,Math.min(1.8,meta.expansion||1));this.native=!!meta.native;this.undoStack=[];this.redoStack=[];this.radius=55;this.density=1;this.rng=Math.random;this.stroke=null;this.revision=0;this.unlocked={firefly:true,meteor:true};}
 snapshot(){return JSON.stringify({objects:this.objects,expansion:this.expansion,native:this.native});}
 restore(raw){this.presentationEpoch=(this.presentationEpoch||0)+1;let s=JSON.parse(raw);if(Array.isArray(s))this.objects=s;else{this.objects=s.objects;this.expansion=s.expansion||1;this.native=!!s.native;}this.revision++;}
 checkpoint(before){if(before===this.snapshot())return false;this.undoStack.push(before);if(this.undoStack.length>30)this.undoStack.shift();this.redoStack=[];this.revision++;return true;}
 undo(){if(!this.undoStack.length)return false;this.redoStack.push(this.snapshot());this.restore(this.undoStack.pop());return true;}
 redo(){if(!this.redoStack.length)return false;this.undoStack.push(this.snapshot());this.restore(this.redoStack.pop());return true;}
 discover(){}
 contains(x,y,margin=.025){return inside(x,y,margin,this.expansion);}
 waterAt(x,y){return(this.native&&pond(x,y))||this.objects.some(o=>o.type==='water'&&Math.hypot(o.x-x,o.y-y)<o.r);}
 heightAt(x,y){let h=.025;if(this.native&&((x-1150)/440)**2+((y-740)/220)**2<1)h=.23;
 if(this._patchRevision!==this.revision){this._patches=this.objects.filter(o=>o.type.startsWith('terrain_'));this._patchGrid=new Map();for(let o of this._patches){if(!['terrain_raise','terrain_lower','terrain_mound','terrain_terrace','terrain_flatten'].includes(o.type))continue;let r=o.r||90;for(let a=Math.floor((o.x-r)/250);a<=Math.floor((o.x+r)/250);a++)for(let b=Math.floor((o.y-r)/250);b<=Math.floor((o.y+r)/250);b++){let key=a+','+b,list=this._patchGrid.get(key);if(!list)this._patchGrid.set(key,list=[]);list.push(o);}}this._patchRevision=this.revision;}for(let o of this._patchGrid.get(Math.floor(x/250)+','+Math.floor(y/250))||[]){let r=o.r||90,d=Math.hypot(x-o.x,y-o.y)/r;if(d>=1)continue;let f=(1-d*d)**2;if(o.type==='terrain_raise')h+=.20*f;else if(o.type==='terrain_lower')h-=.20*f;else if(o.type==='terrain_mound')h+=.55*f;else if(o.type==='terrain_terrace')h+=.35*f;else if(o.type==='terrain_flatten')h+=(o.level-h)*f;}return Math.max(-1.65,Math.min(3.0,h));}
 begin(type,p){this.stroke={type,before:this.snapshot(),start:{...p},last:{...p},anchor:{...p},carry:0,emitted:false,placed:null,blocked:false,level:this.heightAt(p.x,p.y)};}
 move(p){let s=this.stroke;if(!s)return;let dx=p.x-s.last.x,dy=p.y-s.last.y,d=Math.hypot(dx,dy);if(!d)return;if(!s.emitted){this.stamp(s.type,s.start);s.emitted=true;}
 if(kind(s.type)==='building'){if(s.placed&&Math.hypot(p.x-s.start.x,p.y-s.start.y)>6){s.placed.yaw=Math.atan2(p.x-s.start.x,p.y-s.start.y);this.revision++;}}
 else{let k=kind(s.type),step=k==='water'?Math.min(18,this.radius*.35):k==='terrain'?Math.max(24,this.radius*.3):(spacing[s.type]||60)*Math.pow(this.radius/55,.3)/this.density;if(k==='fence'||k==='bridge')step=spacing[s.type];let offset=step-s.carry;for(let f=offset;f<=d;f+=step){let q={x:s.last.x+dx*f/d,y:s.last.y+dy*f/d};this.stamp(s.type,q);s.anchor=q;}s.carry=(s.carry+d)%step;}s.last={...p};}
 end(cancel=false){let s=this.stroke;if(!s)return false;if(cancel){this.restore(s.before);this.stroke=null;return false;}let k=kind(s.type);if(!s.emitted){if(k==='fence'||k==='bridge')this.stamp(s.type,{x:s.last.x+32,y:s.last.y});else this.stamp(s.type,s.start);}if(s.emitted&&['fence','bridge'].includes(k)&&Math.hypot(s.last.x-s.anchor.x,s.last.y-s.anchor.y)>1)this.stamp(s.type,s.last);let changed=this.checkpoint(s.before);this.stroke=null;return changed;}
 stamp(type,p){let k=kind(type);if(type==='erase'){let next=this.objects.filter(o=>o.ex!==undefined?distanceSegment(p,o,{x:o.ex,y:o.ey})>this.radius+8:Math.hypot(o.x-p.x,o.y-p.y)>this.radius+(o.type==='water'?o.r*.25:0));if(next.length!==this.objects.length){this.objects=next;this.revision++;}return;}
 if(this.objects.length>=MAX||!this.contains(p.x,p.y))return;
 if(k==='aquatic'&&!this.waterAt(p.x,p.y)){if(this.stroke)this.stroke.blocked=true;return;}
 let size=.62+this.radius/85;
 if(k==='fence'||k==='bridge'){let a=this.stroke?.anchor||p;if(Math.hypot(a.x-p.x,a.y-p.y)<1||!this.contains(a.x,a.y))return;this.objects.push({type,x:a.x,y:a.y,ex:p.x,ey:p.y,s:size,v:this.rng()});this.revision++;return;}
 if(k==='terrain'){this.objects.push({type,x:p.x,y:p.y,r:this.radius*2.1,level:this.stroke?.level||.025,s:1,v:this.rng()});this.revision++;return;}
 let base=k==='flower'?4:k==='rock'?2:k==='bush'?2:1,count=['flower','rock','bush'].includes(k)?Math.max(1,Math.min(16,Math.round(base*Math.pow(this.radius/55,1.25)*this.density))):k==='tree'?Math.max(1,Math.min(3,Math.round(this.density))):1;
 for(let i=0;i<count;i++){if(this.objects.length>=MAX)break;let spread=['flower','rock','bush','tree'].includes(k)?this.radius*.9:0,a=this.rng()*Math.PI*2,r=Math.sqrt(this.rng())*spread,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(!this.contains(x,y)||k==='aquatic'&&!this.waterAt(x,y))continue;
 let o={type,x,y,s:size*(.85+this.rng()*.30),v:this.rng(),rot:(this.rng()-.5)*.12,yaw:k==='building'?0:(this.rng()-.5)*Math.PI*2};if(k==='water'||k==='mist'||k==='light')o.r=this.radius;if(k==='mist')o.opacity=.035;
 this.objects.push(o);if(k==='building'&&this.stroke)this.stroke.placed=o;this.revision++;}
 }
 rotateObject(index,yaw){let o=this.objects[index];if(!o)return false;let before=this.snapshot();o.yaw=yaw;return this.checkpoint(before);}
 expand(){if(this.expansion>=1.799)return false;let before=this.snapshot();this.expansion=Math.min(1.8,Math.round((this.expansion+.2)*10)/10);return this.checkpoint(before);}
 clear(){let before=this.snapshot();this.objects=[];this.native=false;return this.checkpoint(before);}
}
function starter(){return [];}
root.IslandCore={W,H,CX,CY,MAX,inside,boundary,pond,RIVER,brushes,catalog,specs,kind,spacing,random,distanceSegment,Island,starter};
})(typeof window==='undefined'?globalThis:window);
