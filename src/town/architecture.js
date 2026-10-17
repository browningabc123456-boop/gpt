import {thirdHouse} from './third-worlds.js';
import * as T from 'three';
import {facadeDesign,groupFor} from './combinations.js';
const H=1.04;
export const FORM_NAMES={cottage:'单层小屋',loft:'双层 Loft',clock:'钟楼',library:'无窗守望塔',observatory:'观星塔',beacon:'风铃灯塔'};
export function buildingForm(cell,level=cell.kinds.lastIndexOf('house')){if(level<0||cell.kinds[level]!=='house')return {kind:null,name:'平台',height:0,start:level,end:level};let start=level,end=level;while(start>0&&cell.kinds[start-1]==='house')start--;while(end+1<cell.kinds.length&&cell.kinds[end+1]==='house')end++;const height=end-start+1,kind=['cottage','loft','clock','library','observatory','beacon'][Math.min(height,6)-1];return {kind,name:FORM_NAMES[kind],height,start,end};}
export const STYLE_NAMES={sea:'航海木船屋',city:'红砖城市公寓',ants:'根须地下洞屋',forest:'木构树屋',sky:'云端拱廊',snow:'雪顶木屋',garden:'蘑菇花屋'};
function roundWindow(v,g,y,r=.22,color='#d2e4dc'){
 const rim=v.cylinder(g,r+.04,r+.04,.035,[0,y,.024],'#e0d3ae',36,true);rim.rotation.x=Math.PI/2;
 const glass=v.cylinder(g,r,r,.040,[0,y,.047],color,36);glass.rotation.x=Math.PI/2;
 v.box(g,[r*2,.028,.02],[0,y,.071],'#efe7cb',.006);v.box(g,[.028,r*2,.02],[0,y,.071],'#efe7cb',.006);
}
function loftWindow(v,g,theme){const frame=theme==='snow'?'#725b47':theme==='garden'?'#b89566':'#dbcba3';
 v.box(g,[.83,1.47,.035],[0,1.02,.025],theme==='snow'?'#e6bd78':'#a9c9d0',.035);
 for(const x of [-.44,0,.44])v.box(g,[.035,1.53,.055],[x,1.02,.055],frame,.008);
 for(const y of [.25,1.07,1.79])v.box(g,[.91,.038,.055],[0,y,.055],frame,.008);
 v.box(g,[.88,.075,.12],[0,1.03,.08],frame,.008);
 for(let i=0;i<5;i++)v.box(g,[.012,.22,.025],[-.34+i*.17,1.19,.083],frame,.004);
}
function clock(v,g,y,theme){if(theme==='snow')v.box(g,[.79,.79,.05],[0,y,.005],'#aa8059',.06);if(theme==='garden')for(let i=0;i<8;i++){const a=i*Math.PI/4;v.sphere(g,[.11,.08,.025],[Math.sin(a)*.36,y+Math.cos(a)*.36,.025],i%2?'#e1b6c7':'#ecd398');}if(theme==='sky')for(let i=0;i<8;i++){const a=i*Math.PI/4;v.line(g,[[Math.sin(a)*.35,y+Math.cos(a)*.35,.02],[Math.sin(a)*.43,y+Math.cos(a)*.43,.02]],'#ddbd76',.022);}if(theme==='forest'){v.box(g,[.24,.10,.10],[0,y+.44,.08],'#b28d5e');v.sphere(g,[.06,.04,.06],[0,y+.46,.15],'#d5bd77');}const rim=v.cylinder(g,.345,.345,.06,[0,y,.035],theme==='garden'?'#d5a66d':'#bb9b5d',40,true);rim.rotation.x=Math.PI/2;const face=v.cylinder(g,.293,.293,.065,[0,y,.074],'#fff2c9',40);face.rotation.x=Math.PI/2;
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2,tick=v.box(g,[.018,i%3===0?.065:.035,.012],[Math.sin(a)*.25,y+Math.cos(a)*.25,.118],'#7d7056',.002,false);tick.rotation.z=-a;}
 const hour=v.box(g,[.025,.18,.016],[-.05,y+.045,.14],'#6d725b',.003);hour.rotation.z=.78;const minute=v.box(g,[.018,.23,.016],[.065,y+.07,.145],'#6d725b',.003);minute.rotation.z=-.72;v.sphere(g,[.025,.025,.015],[0,y,.15],'#ad8d55');
}
function cap(v,g,y,theme,seed,color,kind){
 const roof=new T.Group();roof.position.y=y;g.add(roof);
 if(theme==='garden'){
  const mushroomColor=kind==='clock'?'#d78fa3':seed>.5?'#d98e70':'#b787a3';
  const geometry=v.geometry('mushroom-cap',()=>new T.LatheGeometry([new T.Vector2(.03,.48),new T.Vector2(.19,.48),new T.Vector2(.42,.40),new T.Vector2(.66,.25),new T.Vector2(.85,.06),new T.Vector2(.88,0),new T.Vector2(.73,-.035),new T.Vector2(.03,.04)],40));
  const mesh=new T.Mesh(geometry,v.material(mushroomColor,'roof'));mesh.castShadow=true;mesh.receiveShadow=true;roof.add(mesh);v.outline(mesh,'#8f725b',.35);
  for(let i=0;i<8;i++){const a=i*2.4,r=.30+(i%3)*.15;v.sphere(roof,[.075,.015,.060],[Math.cos(a)*r,.46-r*.45,Math.sin(a)*r],'#fff0ce');}
  v.cylinder(roof,.66,.66,.035,[0,-.015,0],'#f0d8b4',40);
 }else if(theme==='sky'){
  v.box(roof,[1.60,.075,1.60],[0,.02,0],'#e2d4b4',.07);
  const dome=v.sphere(roof,[.78,.45,.78],[0,.13,0],kind==='clock'?'#d8b775':'#86b4be');
  v.cylinder(roof,.035,.055,.45,[0,.65,0],'#b79b5e',12);v.sphere(roof,[.06,.07,.06],[0,.90,0],'#e8cc82');
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;v.line(roof,[[Math.cos(a)*.73,.22,Math.sin(a)*.73],[Math.cos(a)*.48,.48,Math.sin(a)*.48],[0,.59,0]],'#c4d3ca',.009);}
 }else{
  const old=v.roof(roof,0,1.73,1.73,seed,color,kind==='cottage');if(theme==='snow'){
   old.scale.y=1.65;
   const capGeometry=v.geometry('snow-roof',()=>{const s=new T.Shape();s.moveTo(-.89,.035);s.lineTo(0,.54);s.lineTo(.89,.035);s.lineTo(.89,.11);s.lineTo(0,.62);s.lineTo(-.89,.11);s.closePath();const geo=new T.ExtrudeGeometry(s,{depth:1.82,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2});geo.translate(0,0,-.91);return geo;});
   const snow=new T.Mesh(capGeometry,v.material('#f8fbff','snow'));snow.rotation.y=old.rotation.y;snow.scale.y=1.65;snow.castShadow=true;roof.add(snow);
   for(let i=0;i<5;i++){const icicle=v.cylinder(roof,.012,0,.12+(i%2)*.06,[-.68+i*.34,.015,.91],'#d5e8ee',6);}
  }
 }
 if(kind==='observatory'||kind==='beacon'){
  // A recognisable silhouette replaces the ordinary roof crown at larger stacks.
  v.cylinder(roof,.38,.47,.30,[0,.65,0],theme==='snow'?'#d7e4ec':'#d6c7a1',24,true);
  v.sphere(roof,[.43,.30,.43],[0,.88,0],kind==='observatory'?'#9bb7b6':'#e8c486');
  if(kind==='observatory'){const telescope=v.cylinder(roof,.065,.10,.62,[.34,1.04,.20],'#b39a62',16,true);telescope.rotation.z=-.70;telescope.rotation.x=.35;}
  else{v.cylinder(roof,.055,.055,.70,[0,1.2,0],'#a68d59',10);for(let i=0;i<4;i++){const a=i*Math.PI/2;v.line(roof,[[0,1.45,0],[Math.cos(a)*.25,1.3,Math.sin(a)*.25],[Math.cos(a)*.25,1.05,Math.sin(a)*.25]],'#b19c6b',.008);v.cylinder(roof,.025,.025,.15,[Math.cos(a)*.25,.98,Math.sin(a)*.25],'#d6ba75',8);}}
 }
 return roof;
}
function featureWindow(v,g,theme,height,floor,side){
 const design=facadeDesign(theme,height,floor,side),f=design.variation;g.userData.facade=design.signature;
 const frame={forest:'#b47b44',sky:'#d7b76f',snow:'#85583c',garden:'#b78f47'}[theme],glass={forest:'#76b9b2',sky:'#79c7dd',snow:'#ffd38b',garden:'#a7c99b'}[theme];
 const window=new T.Group();window.position.set(0,.60,.03);g.add(window);
 const profile=1+(height+floor-1)%6,wide=profile===2,shapeKey=`facade:${theme}:${height}:${floor}:${f}`,r=wide?.39:.25;
 const geometry=v.geometry(shapeKey,()=>{const s=new T.Shape(),point=(i,x,y)=>i?s.lineTo(x,y):s.moveTo(x,y);
  if(theme==='forest'){
   if(profile===1){s.moveTo(-r,-.20);s.lineTo(-r,.16);s.lineTo(0,.33);s.lineTo(r,.16);s.lineTo(r,-.20);}
   else if(profile===2){s.moveTo(-r,-.22);s.lineTo(-r,.20);s.quadraticCurveTo(0,.40,r,.20);s.lineTo(r,-.22);}
   else if(profile===3){for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?.19:.29;point(i,Math.sin(a)*rr,Math.cos(a)*rr);}}
   else if(profile===4){s.moveTo(-.36,-.22);s.lineTo(-.36,.24);s.lineTo(.36,.24);s.lineTo(.36,-.22);}
   else if(profile===5){s.absarc(0,0,.28,0,Math.PI*2);}
   else{for(let i=0;i<6;i++){const a=i*Math.PI/3;point(i,Math.sin(a)*.29,Math.cos(a)*.29);}}
  }else if(theme==='sky'){
   if(profile===1)s.absarc(0,0,.24,0,Math.PI*2);
   else if(profile===2){s.moveTo(-r,-.22);s.lineTo(-r,0);s.bezierCurveTo(-r,.40,r,.40,r,0);s.lineTo(r,-.22);}
   else if(profile===3){for(let i=0;i<12;i++){const a=i*Math.PI/6,rr=i%2?.19:.31;point(i,Math.sin(a)*rr,Math.cos(a)*rr);}}
   else if(profile===4){s.moveTo(0,-.30);s.lineTo(-.31,0);s.lineTo(0,.31);s.lineTo(.31,0);}
   else if(profile===5){for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?.14:.31;point(i,Math.sin(a)*rr,Math.cos(a)*rr);}}
   else{s.absarc(0,0,.30,0,Math.PI*2);}
  }else if(theme==='snow'){
   if(profile<=2){s.moveTo(-r,-.22);s.lineTo(-r,.22);s.lineTo(r,.22);s.lineTo(r,-.22);}
   else if(profile===3){s.moveTo(-.25,-.20);s.lineTo(-.25,.13);s.lineTo(0,.32);s.lineTo(.25,.13);s.lineTo(.25,-.20);}
   else if(profile===4){s.moveTo(-.27,-.24);s.lineTo(-.27,.02);s.absarc(0,.02,.27,Math.PI,0,true);s.lineTo(.27,-.24);}
   else if(profile===5){for(let i=0;i<6;i++){const a=i*Math.PI/3;point(i,Math.sin(a)*.29,Math.cos(a)*.29);}}
   else{s.moveTo(-.20,-.30);s.lineTo(-.20,.30);s.lineTo(.20,.30);s.lineTo(.20,-.30);}
  }else{
   if(profile===1){s.moveTo(0,-.25);s.bezierCurveTo(-.45,-.02,-.20,.32,0,.32);s.bezierCurveTo(.20,.32,.45,-.02,0,-.25);}
   else if(profile===2){for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,rr=.27+.06*Math.cos(a*5);point(i,Math.sin(a)*rr,Math.cos(a)*rr);}}
   else if(profile===3){s.absarc(0,0,.27,0,Math.PI*2);}
   else if(profile===4){for(let i=0;i<6;i++){const a=i*Math.PI/3;point(i,Math.sin(a)*.30,Math.cos(a)*.30);}}
   else if(profile===5){s.moveTo(0,.35);s.bezierCurveTo(-.06,.25,-.45,-.15,0,-.28);s.bezierCurveTo(.45,-.15,.06,.25,0,.35);}
   else{s.moveTo(-.27,-.12);s.bezierCurveTo(-.24,.42,.24,.42,.27,-.12);s.quadraticCurveTo(0,-.37,-.27,-.12);}
  }s.closePath();return new T.ExtrudeGeometry(s,{depth:.035,bevelEnabled:true,bevelSize:.022,bevelThickness:.015,bevelSegments:2});});
 const rim=new T.Mesh(geometry,v.material(frame));rim.scale.set(1.15,1.15,1);window.add(rim);
 const pane=new T.Mesh(geometry,v.material(glass,'glass'));pane.position.z=.045;window.add(pane);
 const cols=floor+1;for(let i=0;i<cols;i++){const x=cols===1?0:(i/(cols-1)-.5)*(wide?.58:.24);v.box(window,[.017,.40,.02],[x,0,.10],theme==='snow'?'#fff4d5':'#f7e6b6',.003,false);}
 if(f===0)v.box(window,[wide?.73:.50,.02,.02],[0,-.03,.10],'#f5e6c0',.003,false);
 if(theme==='forest'){
  if(height===1)for(const x of [-.34,.34])v.box(window,[.10,.40,.05],[x,0,.03],'#799b6b',.012);
  if(height===2){v.box(g,[.93,.06,.25],[0,.25,.15],'#b08c54');for(const x of [-.40,.40])v.line(g,[[x,.28,.25],[x,.49,.25]],frame,.014);}
  if(height===3){v.box(g,[.23,.13,.10],[0,.98,.12],'#c48d60');v.sphere(g,[.065,.04,.06],[0,.99,.20],'#f4d482');}
  if(height===4){for(let i=0;i<5;i++)v.box(g,[.07,.12+(i%2)*.04,.12],[-.20+i*.10,.21,.12],['#82bfa3','#e6b35f','#bb91b8'][i%3]);v.box(g,[.66,.04,.20],[0,.12,.12],frame);}
  if(height===5){v.line(g,[[-.23,.95,.06],[0,.88,.06],[.24,.95,.06]],'#d9b966',.009);for(const x of [-.20,0,.20])v.sphere(g,[.035,.05,.02],[x,.86,.09],'#f2cd6d');}
  if(height===6){v.box(g,[.18,.27,.15],[.46,.66,.12],'#f6d992');v.box(g,[.22,.04,.20],[.46,.83,.12],frame);}
 }else if(theme==='sky'){
  for(const x of [-.52,.52]){v.cylinder(g,.035,.05,.76,[x,.49,.05],'#eee4cb',10);v.sphere(g,[.07,.045,.07],[x,.89,.05],'#d7bd7d');}
  if(height===2)for(let i=0;i<5;i++)v.line(g,[[-.53+i*.26,.98,.04],[-.53+i*.26,.87,.04]],frame,.01);
  if(height===3||height===5){for(let i=0;i<5;i++)v.sphere(g,[.025,.025,.02],[-.43+i*.21,.23+Math.sin(i)*.05,.08],'#dbb456');}
  if(height===4)for(const x of [-.4,.4])v.box(g,[.10,.28,.10],[x,.25,.09],'#91bcc8');
  if(height===6)for(let i=0;i<12;i++){const a=i/12*Math.PI*2;v.line(window,[[Math.cos(a)*.35,Math.sin(a)*.35,.06],[Math.cos(a)*.42,Math.sin(a)*.42,.06]],frame,.012);}
 }else if(theme==='snow'){
  if(height===1)for(const x of [-.36,.36]){v.box(window,[.15,.44,.06],[x,0,.02],'#b4614f');v.box(window,[.12,.035,.02],[x,.10,.07],'#e4c9a2');}
  if(height===2){v.box(g,[1.0,.06,.25],[0,.25,.13],'#8f6345');for(const x of [-.27,.27])v.box(window,[.06,.43,.02],[x,0,.11],'#f0c798');}
  if(height===3)for(const x of [-.44,.44])v.line(g,[[x,.45,.06],[x-.05,.26,.06],[x+.05,.26,.06],[x,.45,.06]],'#d6e7e8',.015);
  if(height===4){v.box(g,[.46,.20,.13],[0,.15,.09],'#ac8161');v.sphere(g,[.08,.07,.025],[0,.23,.19],'#f7b266');}
  if(height===5)for(let i=0;i<6;i++){const a=i*Math.PI/3;v.line(window,[[0,0,.13],[Math.sin(a)*.20,Math.cos(a)*.20,.13]],'#f7edc9',.012);}
  if(height===6){v.box(g,[.14,.14,.10],[.48,.50,.09],'#eab669');v.line(g,[[.48,.59,.09],[.48,.85,.09],[.33,.87,.09]],frame,.015);}
 }else{
  if(height===1){for(const x of [-.36,.36])v.sphere(g,[.12,.06,.05],[x,.25,.10],'#a4bf66');}
  if(height===2){for(let i=0;i<5;i++)v.sphere(g,[.06,.035,.045],[-.30+i*.15,.22+Math.sin(i)*.04,.10],'#e3a3b8');}
  if(height===3){v.line(window,[[0,-.27,.11],[0,.27,.11]],'#b98a4f',.015);for(const x of [-.14,.14])for(const y of [-.12,.12])v.sphere(window,[.035,.035,.015],[x,y,.115],'#836e5a');}
  if(height===4){v.box(g,[.53,.05,.20],[0,.21,.15],'#cba359');v.sphere(g,[.09,.12,.09],[.12,.31,.13],'#e5ba69');}
  if(height===5){v.sphere(g,[.07,.11,.05],[.42,.73,.10],'#c2e1dd');v.sphere(g,[.04,.04,.02],[.40,.77,.15],'#f8f6d3');}
  if(height===6){for(const x of [-.4,0,.4]){v.line(g,[[x,.95,.04],[x,.79,.09]],'#8ba95a',.01);v.sphere(g,[.09,.10,.07],[x,.76,.09],'#f2e4c2');}}
 }
 // Every level changes its smaller accessories as well as the window silhouette.
 if(f===1){v.box(g,[.18,.035,.16],[.45,.22,.13],frame);v.sphere(g,[.065,.11,.065],[.45,.31,.13],theme==='snow'?'#a6c1ba':'#94b86d');}
 if(f===2){v.line(g,[[-.49,.82,.05],[-.49,.55,.08]],frame,.012);v.box(g,[.16,.17,.065],[-.49,.49,.08],['#e1b56e','#a3c0b0','#d3a4b9'][floor%3],.035);}
 return design;
}
function floorOrnament(v,g,theme,floor){const metal=theme==='sky'?'#d4b064':theme==='snow'?'#ab7956':theme==='garden'?'#9cad60':'#b48c55';
 if(floor===0)v.box(g,[.16,.13,.045],[-.47,.26,.08],theme==='garden'?'#d9b0bb':'#e3c58b',.035);
 if(floor===1){v.box(g,[.28,.08,.16],[.45,.18,.13],metal);for(const x of [.38,.45,.52])v.sphere(g,[.045,.07,.04],[x,.27,.13],theme==='snow'?'#dbe8d9':'#9bbc6c');}
 if(floor===2){v.line(g,[[-.53,.96,.05],[-.53,.68,.06]],metal,.01);const flag=v.box(g,[.17,.20,.025],[-.53,.59,.06],theme==='sky'?'#a6c1d6':theme==='snow'?'#d7a48e':theme==='garden'?'#dca4bc':'#ddbb77');flag.rotation.z=.12;}
 if(floor===3){v.box(g,[.30,.035,.15],[-.46,.23,.11],metal);for(let i=0;i<3;i++)v.box(g,[.05,.08+i*.025,.08],[-.54+i*.07,.29,.10],['#91b8a4','#d6b173','#b6a0c4'][i]);}
 if(floor===4){v.cylinder(g,.012,.02,.33,[-.51,.38,.10],metal,8);v.sphere(g,[.10,.045,.06],[-.51,.58,.1],theme==='snow'?'#d6e4ed':'#d5bb73');v.line(g,[[-.63,.62,.1],[-.51,.66,.1],[-.39,.62,.1]],metal,.009);}
 if(floor===5)for(const x of [-.51,.51]){v.line(g,[[x,.83,.05],[x,.60,.08]],metal,.01);v.cylinder(g,.032,.045,.14,[x,.53,.08],theme==='garden'?'#e7b9cd':'#edcf8d',8);}
}
export function buildHouse(v,g,c,level,seed){if(['sea','city','ants'].includes(v.theme))return thirdHouse(v,g,c,level,seed);const theme=v.theme,form=buildingForm(c,level),start=level===form.start,end=level===form.end,top=level===c.kinds.length-1,color=c.colors[form.start],story=new T.Group();story.position.y=level*H;story.userData.form=`${theme}:${form.kind}:${level-form.start}`;g.add(story);
 const pigment=new T.Color(color),wallColor=(theme==='snow'?new T.Color('#d2ad85').lerp(pigment,.50):theme==='garden'?new T.Color('#e5cb8a').lerp(pigment,.69):pigment).getStyle();
 if(start){let wall;if(form.height===4)wall=v.cylinder(story,.69,.74,form.height*H,[0,form.height*H/2,0],wallColor,theme==='sky'?24:theme==='garden'?12:8,true);else wall=v.box(story,[1.48,form.height*H-.01,1.48],[0,form.height*H/2,0],wallColor,theme==='garden'?.26:theme==='sky'?.13:.035);v.pick(wall,c,'wall',level);wall.userData.multiLevel=true;
 v.box(story,[1.50,.065,1.50],[0,.035,0],theme==='snow'?'#805439':theme==='sky'?'#c4a565':theme==='garden'?'#9ba654':'#916337',.018);
 if(form.height===4)for(const x of [-.45,.45])for(const z of [-.45,.45])v.box(story,[.065,form.height*H,.065],[x,form.height*H/2,z],theme==='snow'?'#866347':theme==='garden'?'#79984c':'#a98a50',.015);
 }
 for(const [side,[dx,dz,rotation]]of [[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]].entries()){
  if(v.town.get(c.x+dx,c.z+dz)?.kinds[level]==='house')continue;
  const facade=new T.Group();facade.position.set(dx*.751,0,dz*.751);facade.rotation.y=rotation;story.add(facade);const access=v.opening(c,dx,dz,level);
  if(access)v.door(facade,seed);
  else if(form.height===1)featureWindow(v,facade,theme,1,0,side);
  else if(form.height===2&&start){loftWindow(v,facade,theme);v.box(facade,[.96,.045,.12],[0,1.86,.06],theme==='garden'?'#a3b860':'#c7a56a');}
  else if(form.height===3&&end)clock(v,facade,.53,theme);
  else if(form.height===5&&level===form.start+2){roundWindow(v,facade,.18,.48,theme==='snow'?'#dfb264':'#5e9baf');for(const x of [-.52,.52])v.box(facade,[.035,1.10,.05],[x,.18,.06],'#cfad64');}
  else if(form.height===6&&end){for(const x of [-.33,0,.33]){v.box(facade,[.13,.61,.04],[x,.55,.035],theme==='snow'?'#e8bd70':'#6aa5a4',.055);v.box(facade,[.17,.035,.07],[x,.88,.045],'#d6ba79');}}
  if(start)floorOrnament(v,facade,theme,form.height-1);
  if((theme==='forest'||theme==='snow')&&start&&form.height!==4)for(const x of [-.66,.66])v.box(facade,[.035,H*form.height,.025],[x,H*form.height/2,.015],theme==='snow'?'#80563d':'#966b3e',.007);
  const combo=groupFor(v.combos||[],c,level,'house');if(combo&&start&&dz===1&&!v.town.get(c.x,c.z+1)){const w=.72;v.box(facade,[w,.06,.28],[0,.97,.14],theme==='forest'?'#d49c48':theme==='sky'?'#6098ba':theme==='snow'?'#a64f40':'#bd6f9b',.035);}
 }
 if(top){let roof;if(form.height===4){roof=new T.Group();roof.position.y=H;story.add(roof);if(theme==='sky'){v.cylinder(roof,.75,.75,.12,[0,.08,0],'#c5aa6b',24,true);v.sphere(roof,[.30,.18,.30],[0,.21,0],'#658fa8');}else if(theme==='garden')v.sphere(roof,[.73,.35,.73],[0,.14,0],'#bd8499');else v.cylinder(roof,0,.75,.64,[0,.31,0],theme==='snow'?'#e7f0f3':'#a9663d',theme==='snow'?6:8,true);}else{roof=cap(v,story,H,theme,seed,color,form.kind);const scale={forest:.84,sky:.94,snow:.84,garden:.84}[theme];roof.scale.x=roof.scale.z=scale;}roof.traverse(o=>{if(o.isMesh)v.pick(o,c,'roof',level);});}
}
