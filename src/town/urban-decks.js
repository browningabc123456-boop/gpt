const metal='#617d7e',wood='#ad8758';
function post(v,g,x,y,z,h=.70,color=wood){v.cylinder(g,.02,.035,h,[x,y+h/2,z],color,8);}
function pot(v,g,x,y,z,color='#8cac65'){v.cylinder(g,.13,.10,.15,[x,y+.10,z],'#b48b60',12);v.sphere(g,[.16,.20,.15],[x,y+.28,z],color);}
function fountain(v,g,y,sea){for(let i=0;i<3;i++){const r=.42-i*.11;v.cylinder(g,r,r+.04,.10,[i*.06,y+.13+i*.20,0],sea?'#c9b993':'#a8b7ad',24);v.cylinder(g,r-.045,r-.045,.025,[i*.06,y+.19+i*.20,0],'#80b7bb',24);}for(const sign of [-1,1])v.line(g,[[.12,y+.6,0],[sign*.30,y+.50,.12],[sign*.4,y+.17,.16]],'#a7d5cf',.012);}
export function urbanDeckTop(v,g,kind,n,y){const sea=v.theme==='sea';
 if(sea)for(let i=0;i<7;i++)v.box(g,[.012,.008,1.46],[-.64+i*.21,y+.09,0],'#8f704c',.001,false);
 if(kind==='garden'){
  if(n===1){for(const x of [-.42,0,.42])pot(v,g,x,y,-.20,sea?'#8fb4a0':'#8caa63');return;}
  if(n===2){v.box(g,[1.12,.05,.95],[0,y+.13,0],sea?'#c9b58c':'#a6bda3');v.sphere(g,[.52,.37,.46],[0,y+.45,0],sea?'#a4c9cb':'#a8c8b4');for(const x of [-.32,0,.32])v.line(g,[[x,y+.17,-.42],[x,y+.73,0],[x,y+.17,.42]],sea?'#d3bc86':'#d5ddba',.02);pot(v,g,.50,y,.48);return;}
  if(n===3){fountain(v,g,y,sea);for(const x of [-.53,.53])pot(v,g,x,y,-.4,sea?'#94b7a8':'#a6bd76');return;}
  if(n===4){for(const x of [-.53,.53])post(v,g,x,y+.12,-.35,.80,sea?'#87a8a0':metal);v.line(g,[[-.53,y+.88,-.35],[0,y+1.12,-.35],[.53,y+.88,-.35]],sea?'#87a8a0':metal,.035);for(let i=0;i<5;i++)v.sphere(g,[.13,.07,.10],[-.43+i*.21,y+.95,-.35],sea?'#9abfaa':'#d5b3c2');for(const x of [-.40,0,.40])pot(v,g,x,y,.38);return;}
  if(n===5){post(v,g,0,y+.10,0,.76,wood);if(sea){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;v.line(g,[[0,y+.93,0],[Math.cos(a)*.3,y+1.12,Math.sin(a)*.3],[Math.cos(a)*.6,y+.89,Math.sin(a)*.6]],'#82a88a',.05);}}else{for(let i=0;i<5;i++){const a=i*2.4;v.sphere(g,[.26,.22,.24],[Math.cos(a)*.24,y+.92+Math.sin(a)*.08,Math.sin(a)*.24],'#90ad65');v.sphere(g,[.05,.055,.05],[Math.cos(a)*.35,y+.9,Math.sin(a)*.35],'#dca46e');}}return;}
  for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*.46,z=Math.sin(a)*.46;v.line(g,[[0,y+.13,0],[x*.6,y+.6,z*.6],[x,y+1.02,z]],sea?'#a9b9a4':'#91a66d',.045);v.sphere(g,[.13,.18,.12],[x,y+1.03,z],sea?['#dcaaa1','#cbb6c6','#a8c8b5'][i%3]:'#b9cf82');}return;
 }
 if(n===1)return;
 if(n===2){for(const x of [-.54,.54])post(v,g,x,y+.12,-.40,.70,sea?wood:metal);v.box(g,[1.28,.07,.91],[0,y+.88,-.12],sea?'#e1c188':'#d7a56b');v.bench(g,[0,y+.13,-.35],0);v.cylinder(g,.20,.23,.05,[.25,y+.40,.32],'#dfc99e',20);post(v,g,.25,y+.12,.32,.25);return;}
 if(n===3){v.cylinder(g,.40,.44,.08,[0,y+.14,0],sea?'#c9ab7d':'#a9b8b0',24);v.box(g,[.42,.24,.2],[0,y+.31,-.2],'#6a6e5a');for(let i=0;i<5;i++)v.box(g,[.058,.018,.13],[-.13+i*.065,y+.44,-.13],i%2?'#e7dcc1':'#495c5b',.002,false);for(const x of [-.53,.53])v.box(g,[.19,.38,.20],[x,y+.28,-.25],sea?'#a48860':'#5f7777');return;}
 if(n===4){if(sea){post(v,g,0,y+.12,0,.93,wood);v.line(g,[[-.48,y+.98,0],[.48,y+.98,0]],'#c4aa70',.025);const vane=v.box(g,[.31,.20,.025],[.22,y+1.1,0],'#d5b879');vane.rotation.z=.15;v.sphere(g,[.10,.10,.10],[-.4,y+.99,0],'#d5b879');}else{for(const x of [-.55,.55])post(v,g,x,y+.12,-.45,.82,metal);v.box(g,[1.33,.07,1.05],[0,y+1.0,-.1],'#769594');v.box(g,[1.05,.57,.025],[0,y+.62,-.51],v.material('#a4c6c4','glass'));v.bench(g,[0,y+.13,-.28],0);}return;}
 if(n===5){if(sea){post(v,g,-.35,y+.10,-.28,.95,wood);v.line(g,[[-.35,y+1.05,-.28],[.36,y+1.07,-.28],[.36,y+.63,-.28]],'#b9aa7a',.045);v.cylinder(g,.14,.14,.05,[.36,y+.57,-.28],'#d8c799',16);v.box(g,[.31,.29,.32],[.25,y+.25,.30],'#a68558');}else{v.cylinder(g,.52,.54,.025,[0,y+.105,0],'#687f7d',32);for(const x of [-.12,.12])v.box(g,[.045,.012,.37],[x,y+.127,0],'#eadfba',.001);v.box(g,[.26,.012,.04],[0,y+.13,0],'#eadfba',.001);for(const x of [-.59,.59])v.sphere(g,[.05,.055,.05],[x,y+.2,-.5],'#e5bc78');}return;}
 if(sea){v.cylinder(g,.28,.38,.15,[0,y+.19,0],'#d8c38f',16);v.cylinder(g,.22,.22,.50,[0,y+.51,0],'#497f97',12);v.cylinder(g,0,.40,.28,[0,y+.9,0],'#527781',12);for(const x of [-.52,.52]){post(v,g,x,y+.12,0,.82,wood);v.box(g,[.23,.18,.02],[x+.10,y+.84,0],x<0?'#d9a083':'#b5c5ad');}}
 else{post(v,g,0,y+.1,0,1.26,metal);for(const h of [.48,.78,1.08])v.line(g,[[-.38,y+h,0],[.38,y+h,0]],metal,.023);v.sphere(g,[.12,.12,.06],[0,y+1.31,0],'#a8c6bc');}
}
