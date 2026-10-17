import * as T from 'three';
const H=1.04;
export const FORM_NAMES={cottage:'单层小屋',loft:'双层 Loft',clock:'钟楼',library:'空中书馆',observatory:'观星塔',beacon:'风铃灯塔'};
export function buildingForm(cell,level=cell.kinds.lastIndexOf('house')){if(level<0||cell.kinds[level]!=='house')return {kind:null,name:'平台',height:0,start:level,end:level};let start=level,end=level;while(start>0&&cell.kinds[start-1]==='house')start--;while(end+1<cell.kinds.length&&cell.kinds[end+1]==='house')end++;const height=end-start+1,kind=['cottage','loft','clock','library','observatory','beacon'][Math.min(height,6)-1];return {kind,name:FORM_NAMES[kind],height,start,end};}
export const STYLE_NAMES={forest:'木构树屋',sky:'云端拱廊',snow:'雪顶木屋',garden:'蘑菇花屋'};
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
function clock(v,g,y,theme){const rim=v.cylinder(g,.345,.345,.06,[0,y,.035],theme==='garden'?'#d5a66d':'#bb9b5d',40,true);rim.rotation.x=Math.PI/2;const face=v.cylinder(g,.293,.293,.065,[0,y,.074],'#fff2c9',40);face.rotation.x=Math.PI/2;
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
  const old=v.roof(roof,0,1.73,1.73,seed,color);if(theme==='snow'){
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
export function buildHouse(v,g,c,level,seed){const theme=v.theme,form=buildingForm(c,level),atStart=level===form.start,atEnd=level===form.end,top=level===c.kinds.length-1,color=c.colors[form.start],story=new T.Group();story.position.y=level*H;g.add(story);
 const pigment=new T.Color(c.colors[level]);const wallColor=(theme==='snow'?new T.Color(level===form.start?'#a98b6b':'#f4ead8').lerp(pigment,level===form.start?.32:.25):theme==='garden'?new T.Color('#f2e3be').lerp(pigment,.34):new T.Color(color).lerp(pigment,.68)).getStyle();
 const wall=theme==='garden'?v.box(story,[1.48,H-.01,1.48],[0,H/2,0],wallColor,.25):v.box(story,[1.48,H-.01,1.48],[0,H/2,0],wallColor,theme==='sky'?.12:.035);v.pick(wall,c,'wall',level);
 if(form.kind!=='loft'||atStart)v.box(story,[1.51,.055,1.51],[0,.055,0],theme==='snow'?'#79634e':'#cfbd97',.018);
 for(const [dx,dz,rotation]of [[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]]){
  if(v.town.get(c.x+dx,c.z+dz)?.kinds[level]==='house')continue;
  const facade=new T.Group();facade.position.set(dx*.751,0,dz*.751);facade.rotation.y=rotation;story.add(facade);const access=v.opening(c,dx,dz,level);
  if(theme==='forest'||theme==='snow'){
   for(const x of [-.65,.65])v.box(facade,[.045,H,.025],[x,H/2,.015],theme==='snow'?'#705a48':'#aa8b60',.007);
   if(theme==='forest')for(const y of [.22,.42,.62,.82])v.line(facade,[[-.71,y,.01],[0,y+.008,.01],[.71,y,.01]],'#af9066',.004);
   if(theme==='snow'&&level>form.start){const beam=v.box(facade,[1.15,.035,.03],[0,.28,.02],'#846b51',.006);beam.rotation.z=.55;}
  }
  if(access)v.door(facade,seed);
  else if(form.kind==='loft'&&dz===1){if(atStart)loftWindow(v,facade,theme);}
  else if(form.kind==='clock'&&atEnd){clock(v,facade,.57,theme);}
  else if(theme==='garden'||theme==='sky')roundWindow(v,facade,.60,theme==='sky'?.23:.20,theme==='garden'?'#e8bf8b':'#b9dbe0');
  else if(atStart&&dz===1&&seed>.6)v.door(facade,seed);
  else{v.window(facade,0,.60,theme==='snow'?.2:seed,color);if(theme==='snow')v.box(facade,[.22,.25,.018],[0,.60,.07],'#f1cf8f',.02,false);}
  if(form.kind==='library'){
   const shelf=new T.Group();shelf.position.set(.38,.20,.04);facade.add(shelf);v.box(shelf,[.34,.27,.08],[0,0,0],'#ab8a60',.012);for(let i=0;i<5;i++)v.box(shelf,[.045,.13+(i%2)*.04,.04],[-.12+i*.06,0,.06],['#95b3a1','#d8ad7b','#b59eb5'][i%3],.003);
  }
  if(atEnd&&seed>.3&&dz===1&&form.kind!=='clock')v.planter(facade,[0,.24,.11],seed);
  if(theme==='sky'&&level>form.start&&dz===1&&!access)v.balcony(facade,color);
  if(theme==='garden'){for(const x of [-.56,.56])v.line(facade,[[x,.1,.02],[x+.06,.50,.025],[x,H,.02]],'#9caf78',.013);}
 }
 if(top){const roof=cap(v,story,H,theme,seed,color,form.kind);roof.traverse(o=>{if(o.isMesh)v.pick(o,c,'roof',level);});
  if(theme==='forest'||theme==='snow'){const chimney=v.box(story,[.18,.49,.21],[-.39,H+.44,-.35],theme==='snow'?'#9b8370':color,.018);v.pick(chimney,c,'roof',level);v.box(story,[.24,.07,.27],[-.39,H+.71,-.35],theme==='snow'?'#f5fafb':'#bb986f',.015);}
 }
}
