import * as T from 'three';
import {stackForm} from './combinations.js';
const H=1.04;
function tagSolids(v,root,c,f){for(const o of root.children)if(o.isMesh&&!o.userData.cell){v.pick(o,c,'wall',f.start);o.userData.multiLevel=true;}}
export const CITY_PROFILES=['街角店铺与遮阳篷','双层挑空玻璃复式','红砖钟楼与尖顶','退台石雕档案塔','阶梯露台花园公寓','无线电尖塔与玻璃冠'];
export const SEA_PROFILES=['弧顶船员小屋','全景舵楼与观海阳台','航海钟楼与瞭望室','八角实体航标塔','海图穹顶与黄铜望远镜','渐细螺旋灯塔与玻璃灯室'];
function pane(v,g,x,y,w,h,color='#355c72',round=.03){v.box(g,[w+.075,h+.075,.035],[x,y,.015],'#e7d4a5',round);const glass=v.box(g,[w,h,.05],[x,y,.047],v.material(color,'glass'),round);v.box(g,[.025,h,.025],[x,y,.08],'#e8d9b4',.002,false);return glass;}
function circle(v,g,x,y,r,glass='#497f97'){const ring=v.cylinder(g,r+.045,r+.045,.05,[x,y,.025],'#ddbc77',28,true);ring.rotation.x=Math.PI/2;const disc=v.cylinder(g,r,r,.06,[x,y,.045],glass,28);disc.rotation.x=Math.PI/2;return disc;}
function clock(v,g,y){circle(v,g,0,y,.29,'#f4dfa3');v.line(g,[[0,y+.18,.10],[0,y,.10],[.15,y-.06,.10]],'#425852',.017);for(let i=0;i<4;i++){const a=i*Math.PI/2;v.sphere(g,[.018,.018,.01],[Math.sin(a)*.22,y+Math.cos(a)*.22,.09],'#6f674b');}}
function planter(v,g,x,y,z,width=.4){v.box(g,[width,.12,.17],[x,y,z],'#a97950',.02);for(let i=0;i<3;i++)v.sphere(g,[.09,.12,.08],[x+(i-1)*width*.26,y+.12,z],'#7ea359');}
function facade(v,g,c,f,fn){for(const [dx,dz]of [[0,1],[1,0],[0,-1],[-1,0]]){const neighbor=v.town.get(c.x+dx,c.z+dz);if(neighbor?.kinds[f.start]==='house'&&neighbor.kinds.length>=f.end+1)continue;const side=new T.Group();side.position.set(dx*.735,0,dz*.735);side.rotation.y=Math.atan2(dx,dz);g.add(side);fn(side,dx,dz);}}
function body(v,g,c,f,size,color,r=.04){const wall=v.box(g,size,[0,size[1]/2,0],color,r);v.pick(wall,c,'wall',f.start);wall.userData.multiLevel=true;return wall;}
export function cityHouse(v,g,c,level){const f=stackForm(c,level,'city');if(level!==f.start)return;const n=f.height,h=n*H,root=new T.Group(),color=c.colors[f.start];root.position.y=f.start*H;root.userData.profile=CITY_PROFILES[n-1];g.add(root);
 if(n<=3)body(v,root,c,f,[1.45,h,1.45],color);
 else{body(v,root,c,f,[1.45,H*2,1.45],color);v.box(root,[n===4?1.18:1.16,(n===5?2:Math.min(n-2,3))*H,1.16],[0,(2+(n===5?2:Math.min(n-2,3))/2)*H,0],n===4?'#cfbb91':color,.025);if(n>=5)v.box(root,[.87,H,.87],[0,h-H/2,0],n===6?'#b7cfcd':color,.04);}
 facade(v,root,c,f,face=>{
  if(n===1){pane(v,face,-.27,.56,.47,.61);pane(v,face,.31,.56,.27,.61);v.box(face,[1.17,.075,.39],[0,.98,.16],'#d6a05e');for(let i=0;i<7;i++)v.box(face,[.095,.08,.40],[-.50+i*.166,1,.16],i%2?'#f1ddaf':'#c97558',.004,false);v.box(face,[.55,.14,.035],[0,1.14,.035],'#e9d4a2');}
  if(n===2){pane(v,face,0,1.12,1.03,1.53,'#5c9dae',.13);v.box(face,[1.20,.06,.22],[0,1.1,.13],'#617b7c');for(const x of [-.51,-.25,0,.25,.51])v.box(face,[.018,.28,.018],[x,1.26,.24],'#64797a',.003);planter(v,face,.42,.26,.14,.30);}
  if(n===3){for(const x of [-.33,.33])pane(v,face,x,.66,.31,.55);pane(v,face,0,1.65,.76,.49,'#538f9f',.13);clock(v,face,2.63);v.box(face,[1.45,.075,.08],[0,2.13,.015],'#d9c49d');}
  if(n===4){for(const x of [-.57,0,.57])v.box(face,[.085,h-.2,.07],[x,h/2,.02],'#dbc8a4');for(let j=0;j<3;j++){const diamond=v.box(face,[.17,.17,.045],[0,1.45+j*.61,.08],'#ab946d');diamond.rotation.z=Math.PI/4;}v.box(face,[.39,.58,.04],[0,.3,.04],'#576258',.17);}
  if(n===5){for(const x of [-.38,0,.38])pane(v,face,x,.65,.23,.49);pane(v,face,0,1.65,.83,.51);for(const x of [-.25,.25]){const bay=new T.Group();bay.position.z=-.15;face.add(bay);pane(v,bay,x,2.65,.30,.75,'#538d9d');}const upper=new T.Group();upper.position.z=-.29;face.add(upper);pane(v,upper,0,4.64,.55,.57,'#7eacb5',.21);for(const x of [-.44,.44])planter(v,face,x,2.12,.08,.27);}
  if(n===6){pane(v,face,0,.72,.72,.68,'#4e8293',.13);for(const x of [-.40,.40])v.box(face,[.055,3.9,.05],[x,3.63,-.14],'#e1cb9e');const mid=new T.Group();mid.position.z=-.15;face.add(mid);clock(v,mid,3.23);const crown=new T.Group();crown.position.z=-.29;face.add(crown);for(const x of [-.23,0,.23])pane(v,crown,x,5.7,.12,.55,'#72abb0');}
  if(n!==1&&n!==4)v.box(face,[.26,.47,.06],[n===2?-.57:0,.25,.055],'#4d6259',.03);
  for(let k=0;k<Math.min(n,3);k++){v.box(face,[1.47,.035,.04],[0,k*H+.04,.02],'#d6bf95');if(n!==4)for(let j=0;j<3;j++)v.box(face,[.20,.012,.007],[-.55+j*.49,k*H+.14,.027],'#a87851',.001,false);}
 });
 const roofWidth=n<=3?1.5:n===4?1.25:.98;v.box(root,[roofWidth,.12,roofWidth],[0,h+.04,0],'#536e70');
 if(n===1||n===2){planter(v,root,-.38,h+.18,-.43,.45);v.box(root,[.27,.25,.28],[.38,h+.23,-.35],'#9cadaa');if(n===2)v.box(root,[.60,.09,.55],[.13,h+.17,.16],'#e1d1a2');}
 if(n===3){for(const side of [-1,1]){const roof=v.box(root,[.84,.09,1.49],[side*.35,h+.23,0],'#59717a');roof.rotation.z=-side*.45;}v.cylinder(root,.025,.06,.48,[0,h+.63,0],'#c6ac77',10);}
 if(n===4){v.box(root,[.86,.16,.86],[0,h+.17,0],'#ad9873');v.sphere(root,[.22,.32,.22],[0,h+.49,0],'#6d9494');}
 if(n===5){for(const x of [-.38,.38])planter(v,root,x,4.23,-.55,.28);v.sphere(root,[.24,.19,.24],[0,h+.28,0],'#83a675');}
 if(n===6){v.cylinder(root,.07,.14,.30,[0,h+.24,0],'#b6b7a4');v.cylinder(root,.015,.03,.78,[0,h+.76,0],'#536970',8);for(const y of [h+.62,h+.84,h+1])v.line(root,[[-.26,y,0],[.26,y,0]],'#536970',.016);}
 tagSolids(v,root,c,f);
}
export function seaHouse(v,g,c,level){const f=stackForm(c,level,'sea');if(level!==f.start)return;const n=f.height,h=n*H,color=c.colors[f.start],root=new T.Group();root.position.y=f.start*H;root.userData.profile=SEA_PROFILES[n-1];g.add(root);
 if(n===4||n===6){const wall=v.cylinder(root,n===6?.40:.62,n===6?.69:.72,h,[0,h/2,0],color,n===4?8:20,true);v.pick(wall,c,'wall',f.start);wall.userData.multiLevel=true;for(const y of n===6?[1.25,2.75,4.25]:[1.6,2.5])v.cylinder(root,n===6?.65-y*.035:.68,n===6?.65-y*.035:.68,.17,[0,y,0],'#e4d5a9',n===4?8:20);}
 else{body(v,root,c,f,[1.43,n===3?2*H:h,1.43],color,.08);if(n===3)v.box(root,[1.06,H,1.06],[0,h-H/2,0],color,.08);}
 facade(v,root,c,f,face=>{
  if(n===1){for(const x of [-.30,.30])circle(v,face,x,.61,.18);v.box(face,[.28,.45,.055],[0,.24,.05],'#476f70',.08);}
  if(n===2){pane(v,face,0,1.13,1.02,1.32,'#5b9fad',.23);v.box(face,[1.2,.07,.25],[0,.34,.12],'#b28b57');for(const x of [-.50,0,.50])v.cylinder(face,.018,.025,.28,[x,.5,.25],'#d4be87',7);}
  if(n===3){circle(v,face,0,.66,.29);for(const x of [-.32,.32])circle(v,face,x,1.59,.16);const upper=new T.Group();upper.position.z=-.19;face.add(upper);clock(v,upper,2.65);}
  if(n===5){pane(v,face,0,1.06,.92,1.23,'#598e9f',.13);circle(v,face,0,3.35,.43);v.box(face,[.28,.45,.05],[0,.24,.06],'#4f7672',.09);}
  if(n===4||n===6)v.box(face,[.29,.53,.05],[0,.28,-.05],'#45616a',.13);
  if(n!==4&&n!==6)for(let j=0;j<Math.min(n*3,12);j++)v.box(face,[1.40,.012,.01],[0,.14+j*.23,.01],'#9d774d',.001,false);
 });
 if(n===1)v.sphere(root,[.75,.23,.75],[0,h+.06,0],'#5b7f85');
 if(n===2){v.box(root,[1.49,.10,1.49],[0,h+.04,0],'#557a7f');v.cylinder(root,.022,.035,.58,[.38,h+.38,-.30],'#c6a968');v.box(root,[.33,.22,.025],[.55,h+.48,-.30],'#ecd8a9');}
 if(n===3){v.cylinder(root,0,.73,.49,[0,h+.25,0],'#4a6c7e',4,true);v.cylinder(root,.018,.025,.44,[0,h+.68,0],'#d8b978');}
 if(n===4||n===6){v.cylinder(root,.65,.65,.10,[0,h+.04,0],'#ddc995',20,true);v.cylinder(root,.43,.43,.54,[0,h+.35,0],'#497f97',12);for(let i=0;i<8;i++){const a=i*Math.PI/4;v.cylinder(root,.018,.025,.6,[Math.cos(a)*.45,h+.36,Math.sin(a)*.45],'#e6d3a0',6);}v.cylinder(root,0,.65,.40,[0,h+.85,0],n===4?'#c36b54':'#426b7a',20,true);}
 if(n===5){v.sphere(root,[.74,.42,.74],[0,h+.08,0],'#86a8ab');const scope=v.cylinder(root,.09,.13,.66,[.35,h+.42,.10],'#c7ac6a',12);scope.rotation.z=-.65;v.cylinder(root,.02,.03,.42,[.15,h+.15,.10],'#bd9e64',9);}
 tagSolids(v,root,c,f);
}
