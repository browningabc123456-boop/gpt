export const CAGE={width:12,depth:9,height:4.2,exit:{x:6.4,y:3.35,z:-2.65}};
export const LEVELS3D=[
 {name:'阳光木屋',tag:'SUNLIT COTTAGE',subtitle:'木头、暖阳与第一次远行',color:'#8c9b6d',accent:'#d7ae73',wall:'#e8dfcb',floor:'#ddc79f',sky:'#f2ecdf',difficulty:1,
  story:'窗边的风，带来了外面的味道。把散落的小物件搭成阶梯，帮小团子翻出右侧的笼口。',hint:'先把木箱和矮凳摆成阶梯，再把木板架到右后方的平台。靠近台阶时按 E 可以攀上矮处，空格可以跳过更高的落差。',decor:'cottage',shelf:[2.9,2.3,-2.65],start:[-4.2,.4,2.7]},
 {name:'饼干工坊',tag:'BISCUIT ATELIER',subtitle:'一场香喷喷的小小冒险',color:'#b28a72',accent:'#dfb77f',wall:'#ebd9ca',floor:'#d9b68d',sky:'#f5e8dc',difficulty:2,
  story:'饼干罐挡住了近路。绕过大烤箱，把木箱、纸筒和托盘搭成去往高处的路线。',hint:'大饼干箱不能搬动，可以作为中转平台。长木板需要稳稳搭住两端，放开后会真实倾倒；先把两端的支点搭好。',decor:'bakery',shelf:[3.2,2.6,-2.65],start:[-4.3,.4,2.8]},
 {name:'雨林温室',tag:'LITTLE GREENHOUSE',subtitle:'叶子下面，藏着另一条路',color:'#789c82',accent:'#c6b886',wall:'#dce6d5',floor:'#bfc5a1',sky:'#e9efe3',difficulty:3,
  story:'小花房长出了茂密的植物。绕过花盆，借用树桩和散落的木料，找一条向上的路。',hint:'高花盆和树桩也是可落脚的地方。观察侧面再摆放木板，旋转视角能看清被叶子遮住的落点。',decor:'garden',shelf:[2.8,2.75,-2.65],start:[-4.1,.4,3]},
 {name:'海边灯塔',tag:'SEASIDE HIDEAWAY',subtitle:'听说围栏外面，有海风',color:'#819ba2',accent:'#d2b78a',wall:'#dce6e5',floor:'#d9cfb4',sky:'#e7eff0',difficulty:4,
  story:'蓝色小屋里有船、有灯塔，还有高低错落的甲板。利用宽木板搭出稳固的登高路线。',hint:'右侧的平台更远了，可以先搭到中间的甲板。跳跃时调整方向，落地后再起跳，比一直按住空格更稳。',decor:'seaside',shelf:[2.4,2.85,-2.65],start:[-4.3,.4,2.8]},
 {name:'月光观测站',tag:'MOONLIGHT STATION',subtitle:'小小宇航员，准备出舱',color:'#9392ac',accent:'#c9bd99',wall:'#e1deeb',floor:'#c9c5d4',sky:'#eeebf4',difficulty:4,
  story:'今晚的小团子是一名宇航员。行李箱和月球积木都能搬动，把它们变成通往出口的发射台。',hint:'可以堆高，但底座要足够宽。先放大木箱，再放小箱子；把长板放在最上层时，观察重心是否留在支点之内。',decor:'space',shelf:[2.8,3.0,-2.65],start:[-4.3,.4,2.8]},
 {name:'云端玩具阁楼',tag:'THE CLOUD ATTIC',subtitle:'最后一座笼子，留给小工程师',color:'#b49a8c',accent:'#c9b387',wall:'#ede0d7',floor:'#d5c0ab',sky:'#f4ece5',difficulty:5,
  story:'熟悉的玩具聚在最后一座笼子里。这次没有现成的近路，要靠自己的小小工程，翻过最高的笼口。',hint:'先观察出口和平台，再从高处往下规划支点。把矮凳、木箱和斜坡组合起来，不稳定的长板可以压一件小物品固定。',decor:'attic',shelf:[2.2,3.05,-2.65],start:[-4.3,.4,2.8]}
];
export function levelObjects(index){
 const extra=index>2?.15:0;
 return [
  {id:'crate-a',kind:'crate',name:'大木箱',size:[1.3,1.05,1.2],position:[-1.9,.525,1.4],mass:3},
  {id:'crate-b',kind:'crate',name:'小木箱',size:[1,.8,1],position:[.3,.4,2.6],mass:2},
  {id:'block',kind:'block',name:'积木方块',size:[.9,.7,.9],position:[2,.35,1.2],mass:1.5},
  {id:'plank-a',kind:'plank',name:'长木板',size:[3.3,.16,.85],position:[-.9,.1,-.45],mass:1.5},
  {id:'plank-b',kind:'plank',name:'宽木板',size:[2.6,.18,1.05],position:[-2.6,.11,-2.2],mass:1.6,yaw:.15},
  {id:'tube',kind:'tube',name:'瓦楞纸筒',size:[2.05,.86,.86],position:[-3.85,.43,.5],mass:1.1,yaw:.3},
  {id:'stool',kind:'stool',name:'小矮凳',size:[1.25,.85+extra,1.15],position:[.2,(.85+extra)/2,-2.7],mass:2.5},
  {id:'ramp',kind:'ramp',name:'木质斜坡',size:[2.7,.85,1.05],position:[2.7,.425,2.7],mass:3,yaw:Math.PI/2},
  {id:'cushion',kind:'cushion',name:'软垫',size:[1.3,.28,1.1],position:[-3.65,.14,3.35],mass:1},
 ];
}
export function canUnlock(index,progress){return Number.isInteger(index)&&index>=0&&index<LEVELS3D.length&&(index===0||!!progress[index-1]?.completed);}
