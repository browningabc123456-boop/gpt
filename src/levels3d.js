// One world unit is 10 cm. A 120 × 90 cm cage and a ~10 cm hamster share one scale.
export const WORLD_TO_CM=10;
export const CAGE={width:12,depth:9,height:4.2,exit:{x:6.4,y:3.35,z:-2.65}};
export const LEVELS3D=[
 {name:'晴日奶油小屋',tag:'SUNSHINE COTTAGE',subtitle:'奶油木色 × 嫩芽绿',color:'#7eac4b',accent:'#efa936',wall:'#dce8ba',floor:'#e8c992',sky:'#fff0d3',frame:'#e0ad64',difficulty:1,decor:'cottage',shelf:[2.9,2.3,-2.65],start:[-4.2,.4,2.7],house:[-4.5,-3.05],
 story:'阳光落在奶油色的小屋上。搬来几块木头，给团子搭一条通往外面的小路。',hint:'先在平整地面摆好矮凳，再将大小木箱叠成台阶。百宝箱可以继续添加物件，稳固搭建会帮你固定放稳的结构。'},
 {name:'草莓甜点工坊',tag:'STRAWBERRY PATISSERIE',subtitle:'草莓粉 × 奶油黄',color:'#d97591',accent:'#efb753',wall:'#f9d7dd',floor:'#f4dac3',sky:'#fff0e9',frame:'#e9b0ba',difficulty:2,decor:'bakery',shelf:[3.2,2.6,-2.65],start:[-4.3,.4,2.8],house:[3.8,3.4],
 story:'草莓蛋糕、曲奇架和烘焙台摆满了小厨房。用托板和小木箱，搭出一条甜甜的登高路线。',hint:'甜点台是稳固的落脚点。点击百宝箱添加短板或斜坡，连接高低不同的台面；点击地面可以让团子自己走过去。'},
 {name:'苔藓雨林温室',tag:'MOSS & FERN GREENHOUSE',subtitle:'雨林绿 × 湖水青',color:'#359b78',accent:'#e3b845',wall:'#c8e8cd',floor:'#c7d69b',sky:'#e3f3df',frame:'#659b78',difficulty:3,decor:'garden',shelf:[2.8,2.75,-2.65],start:[-4.1,.4,3],house:[-4.55,-3.0],
 story:'蕨叶、苔藓、树桩和一方小水池，把笼子变成了微型雨林。绕过花坛，寻找向上的支点。',hint:'用俯视视角找出花坛之间的通道。树桩可以做中转台；加几块小积木，能把一次大跨越拆成几次小攀爬。'},
 {name:'蓝湾航海码头',tag:'BLUE BAY MARINA',subtitle:'海盐蓝 × 珊瑚橙',color:'#3e9ec3',accent:'#ee9667',wall:'#d3ecf5',floor:'#e7d9b4',sky:'#e6f5ff',frame:'#91c7dc',difficulty:4,decor:'seaside',shelf:[2.4,2.85,-2.65],start:[-4.3,.4,1.3],house:[-3.5,3.0],
 story:'小帆船停在蓝湾，灯塔照着错落的甲板。把木料铺成栈道，带团子去吹吹海风。',hint:'先在船身旁边搭低台阶，再接到高处的甲板。按住 Shift 轻轻走，靠近边缘时更容易调整起跳位置。'},
 {name:'星糖月球基地',tag:'STARDUST MOON BASE',subtitle:'星空紫 × 星光金',color:'#9380d4',accent:'#f0c66a',wall:'#d7d2ed',floor:'#d9d2ed',sky:'#c6c3e0',frame:'#a3a1c8',difficulty:4,decor:'space',shelf:[2.8,3.0,-2.65],start:[-4.3,.4,2.8],house:[3.8,2.7],
 story:'月球舱、陨石台和行星装置，组成一座小小观测站。给宇航员团子搭一条出舱走廊。',hint:'试试把宽木板用作底座。稳固搭建开启时，放稳的物件会固定；想体验自由重力，也可以随时关闭。'},
 {name:'彩虹玩具梦工厂',tag:'RAINBOW TOY FACTORY',subtitle:'杏桃橙 × 彩虹糖色',color:'#e09b48',accent:'#79b6a0',wall:'#f5ddc4',floor:'#efd6bd',sky:'#fff0dd',frame:'#dda25e',difficulty:5,decor:'attic',shelf:[2.2,3.05,-2.65],start:[-3.8,.4,.8],house:[-4.35,2.8],
 story:'积木城堡、彩虹拱门和转转风车，占满了玩具工厂。自由添加零件，给团子搭一座自己的小城。',hint:'可以先加大木箱，再添加木板、矮凳、斜坡，拼出宽一点的阶梯。不必急着通关，先搭一个你喜欢的世界。'}
];
export function levelObjects(index){
 const extra=index>2?.15:0;
 const base=[
  {id:'crate-a',kind:'crate',name:'大木箱',size:[1.3,1.05,1.2],position:[-1.9,.525,1.4],mass:3},
  {id:'crate-b',kind:'crate',name:'小木箱',size:[1,.8,1],position:[.3,.4,2.6],mass:2},
  {id:'block',kind:'block',name:'积木方块',size:[.9,.7,.9],position:[2,.35,1.2],mass:1.5},
  {id:'plank-a',kind:'plank',name:'长木板',size:[3.3,.16,.85],position:[-.9,.1,-.45],mass:1.5},
  {id:'plank-b',kind:'plank',name:'宽木板',size:[2.6,.18,1.05],position:[-2.6,.11,-2.2],mass:1.6,yaw:.15},
  {id:'tube',kind:'tube',name:'瓦楞纸筒',size:[2.05,.86,.86],position:[-3.85,.43,.5],mass:1.1,yaw:.3},
  {id:'stool',kind:'stool',name:'小矮凳',size:[1.25,.85+extra,1.15],position:[.2,(.85+extra)/2,-2.7],mass:2.5},
  {id:'ramp',kind:'ramp',name:'木质斜坡',size:[2.7,.85,1.05],position:[2.7,.425,2.7],mass:3,yaw:Math.PI/2},
  {id:'cushion',kind:'cushion',name:'软垫',size:[1.3,.28,1.1],position:[-3.65,.14,3.35],mass:1}
 ];
 // Tools have separate arrangements for each miniature world, not a shared scene.
 const positions=[null,
 [[-2.7,1.7],[-.6,3.3],[1.3,.2],[-1.7,-.4],[-3.1,-2.2],[-4.3,.2],[.1,-3],[2.2,2.9],[-4.8,3.2]],
 [[-.3,2.4],[-2.4,.3],[3.8,.3],[-1.4,-.4],[-2.9,-2.7],[-4.1,1.2],[.6,-3.3],[3.9,3.3],[-2.9,3.2]],
 [[-2.4,1.8],[3.4,2.8],[1.9,.2],[-1.2,-.4],[-3.1,-2.4],[-4.2,.4],[.2,-3.3],[4.2,.7],[-4.5,3.4]],
 [[-2.8,2.5],[2.4,2.9],[3.5,.0],[-1.5,-.6],[-2.9,-2.5],[-4.3,.7],[.2,-3.2],[4.3,1.9],[-3.5,3.5]],
 [[-2.4,.4],[.6,3.4],[3.6,1.2],[-1.3,-.4],[-3,-2.6],[-3.9,-.6],[.4,-3.1],[4.4,3.2],[-4.6,1.8]]
 ];
 return base.map((o,i)=>({...o,color:o.kind==='block'?['#96b94e','#e796a8','#58ac8b','#6bb9df','#b09ae7','#f0b960'][index]:undefined,position:positions[index]?[positions[index][i][0],o.position[1],positions[index][i][1]]:o.position}));
}
export const CATALOG=[
 {key:'small-crate',icon:'▧',label:'小木箱',description:'10 × 8 × 10 cm',kind:'crate',size:[1,.8,1],mass:2},
 {key:'large-crate',icon:'▧',label:'大木箱',description:'13 × 10.5 × 12 cm',kind:'crate',size:[1.3,1.05,1.2],mass:3},
 {key:'long-plank',icon:'▰',label:'长木板',description:'33 × 1.6 × 8.5 cm',kind:'plank',size:[3.3,.16,.85],mass:1.5},
 {key:'short-plank',icon:'▰',label:'短木板',description:'18 × 1.6 × 9 cm',kind:'plank',size:[1.8,.16,.9],mass:1},
 {key:'tube',icon:'◉',label:'空心纸筒',description:'长 20.5 cm · 内径 7.3 cm',kind:'tube',size:[2.05,.86,.86],mass:1.1},
 {key:'ramp',icon:'◩',label:'防滑斜坡',description:'27 × 8.5 × 10.5 cm',kind:'ramp',size:[2.7,.85,1.05],mass:3},
 {key:'stool',icon:'⌑',label:'木头矮凳',description:'12.5 × 8.5 × 11.5 cm',kind:'stool',size:[1.25,.85,1.15],mass:2.5},
 {key:'cushion',icon:'▱',label:'格纹软垫',description:'13 × 2.8 × 11 cm',kind:'cushion',size:[1.3,.28,1.1],mass:1},
 {key:'block',icon:'▣',label:'彩色积木',description:'9 × 7 × 9 cm',kind:'block',size:[.9,.7,.9],mass:1.5}
];
// Dimensions are shared by visible meshes and collision bodies.
export function themeStructures(index){
 const layouts=[
  [{kind:'shelf',size:[1.4,.48,1.25],p:[-1.4,.24,-3.25],color:'#daa665'},{kind:'shelf',size:[1.4,.14,1.25],p:[-1.4,1.25,-3.25],color:'#d4a76e'}],
  [{kind:'counter',size:[3.0,1.15,1.2],p:[1.65,.575,1.65],color:'#f2b3b8'},{kind:'oven',size:[1.35,1.55,1.3],p:[4.1,.775,-.3],color:'#eb9da8'},{kind:'shelf',size:[2.2,.18,1.0],p:[-3.9,1.1,-3.5],color:'#dbb183'}],
  [{kind:'garden-bed',size:[2.6,.55,1.7],p:[2.3,.275,2.6],color:'#8aaf69'},{kind:'log',size:[1.4,.7,1.4],p:[-3.9,.35,-.5],color:'#a78555'},{kind:'log',size:[1.1,1.3,1.1],p:[4.8,.65,.1],color:'#9e7d53'}],
  [{kind:'boat',size:[3.1,1.05,1.7],p:[.1,.525,2.2],color:'#78b6d0'},{kind:'dock',size:[1.6,1.1,1.5],p:[4.25,.55,.2],color:'#a0c5cf'},{kind:'shelf',size:[1.3,.45,1.25],p:[-3.5,.225,-2.65],color:'#ddb985'}],
  [{kind:'habitat',size:[2,1.7,1.9],p:[.3,.85,2.3],color:'#d9d7f3'},{kind:'moon-rock',size:[1.3,1.15,1.25],p:[4.3,.575,.5],color:'#b2a4d0'},{kind:'moon-rock',size:[1.1,.55,1.1],p:[-3.7,.275,-.5],color:'#aca3c9'}],
  [{kind:'toy-castle',size:[2.5,1.2,1.55],p:[2.1,.6,1.8],color:'#eca75f'},{kind:'toy-block',size:[1.2,.8,1.2],p:[-3.9,.4,-2.8],color:'#83bfa6'},{kind:'toy-block',size:[1.1,1.65,1.1],p:[4.6,.825,-.1],color:'#b0a0da'}]
 ];
 return layouts[index].map((s,i)=>({...s,id:`theme-${i}`}));
}
export function canUnlock(index){return Number.isInteger(index)&&index>=0&&index<LEVELS3D.length;}
