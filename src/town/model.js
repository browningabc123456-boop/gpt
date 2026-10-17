export const PALETTE=['#d76457','#df9466','#e4ba65','#e5d99a','#a3bb7a','#6b9c80','#75aab0','#7298bb','#a997bb','#c78da0'];
export const THEMES={forest:{title:'森间来信',subtitle:'FOREST LETTERS',description:'在枝叶之间，搭一座慢慢长大的小村庄。',background:'#bac9b2',colors:['#d77c59','#e7bd72','#b7c88d','#93b5a0']},sky:{title:'云上的日子',subtitle:'DAYS ABOVE THE CLOUDS',description:'让一座小城，轻轻停在云的上面。',background:'#adc9d3',colors:['#d66f63','#e6c783','#91b5b5','#b4a4c9']}};
export const KINDS=['house','platform','garden','support'];
export const BRIDGES=['auto','rope','arch','covered'];
export const topKind=c=>c?.kinds?.at(-1)||'house';
export const walkLevel=c=>topKind(c)==='house'?(c.floating?c.kinds.findIndex(k=>k!=='support'):0):c.colors.length-1;
export class Town{
 constructor(theme='forest'){this.theme=THEMES[theme]?theme:'forest';this.cells=new Map();this.undoStack=[];this.redoStack=[];}
 key(x,z){return `${x},${z}`;}
 get(x,z){return this.cells.get(this.key(x,z));}
 snapshot(){return [...this.cells.values()].map(c=>({...c,colors:[...c.colors],kinds:[...c.kinds],floating:!!c.floating}));}
 load(data){if(!Array.isArray(data)||data.length>180)return false;const next=new Map();for(const c of data){if(!Number.isInteger(c.x)||!Number.isInteger(c.z)||Math.abs(c.x)>7||Math.abs(c.z)>7||!Array.isArray(c.colors)||c.colors.length<1||c.colors.length>6||!c.colors.every(v=>PALETTE.includes(v))||c.kinds&&(!Array.isArray(c.kinds)||c.kinds.length!==c.colors.length||!c.kinds.every(k=>KINDS.includes(k))||c.kinds.at(-1)==='support')||c.bridge&&!BRIDGES.includes(c.bridge)||c.floating!==undefined&&typeof c.floating!=='boolean')return false;next.set(this.key(c.x,c.z),{x:c.x,z:c.z,colors:[...c.colors],kinds:c.kinds?[...c.kinds]:c.colors.map(()=>'house'),bridge:c.bridge||'auto',floating:!!c.floating});}this.cells=next;return true;}
 edit(x,z,color,erase=false,tool='house',level=null,bridge='auto',floating=false){
  if(typeof floating!=='boolean'||!Number.isInteger(x)||!Number.isInteger(z)||Math.abs(x)>7||Math.abs(z)>7||(!erase&&(!PALETTE.includes(color)||!['house','grow','platform','garden'].includes(tool)||!BRIDGES.includes(bridge)))||level!==null&&(!Number.isInteger(level)||level<0||level>5))return false;
  let c=this.get(x,z);if(erase&&!c||!erase&&!c&&this.cells.size>=180)return false;
  const top=c?.colors.length-1,kind=topKind(c),replace=c&&(level===null||level<=top)&&((tool==='grow'||tool==='house')&&['platform','garden'].includes(kind)||tool==='garden'&&['platform','garden'].includes(kind));
  const destination=replace?top:Math.max(c?.colors.length||0,level??0);if(!erase&&destination>5)return false;
  this.undoStack.push(this.snapshot());if(this.undoStack.length>60)this.undoStack.shift();this.redoStack=[];
  if(erase){c.colors.pop();c.kinds.pop();while(c.kinds.at(-1)==='support'){c.colors.pop();c.kinds.pop();}if(!c.colors.length)this.cells.delete(this.key(x,z));return true;}
  if(!c){c={x,z,colors:[],kinds:[],bridge,floating};this.cells.set(this.key(x,z),c);}c.bridge=bridge;
  const nextKind=tool==='grow'?(replace?'house':'platform'):tool;
  if(replace){c.colors[top]=color;c.kinds[top]=nextKind;}else{while(c.colors.length<destination){c.colors.push(color);c.kinds.push('support');}c.colors.push(color);c.kinds.push(nextKind);}
  return true;
 }
 undo(){if(!this.undoStack.length)return false;this.redoStack.push(this.snapshot());return this.load(this.undoStack.pop());}
 redo(){if(!this.redoStack.length)return false;this.undoStack.push(this.snapshot());return this.load(this.redoStack.pop());}
 neighbors(x,z){return [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>this.get(x+dx,z+dz)).filter(Boolean);}
 count(){return this.snapshot().reduce((n,c)=>n+c.kinds.filter(k=>k!=='support').length,0);}
 stats(){const kinds=this.snapshot().flatMap(c=>c.kinds);return {houses:kinds.filter(k=>k==='house').length,platforms:kinds.filter(k=>k==='platform'||k==='garden').length,courtyards:this.courtyards().length};}
 connections(){const links=[];for(const c of this.cells.values())for(const [dx,dz]of [[1,0],[0,1]])for(const gap of [1,2,3]){const n=this.get(c.x+dx*gap,c.z+dz*gap);if(!n)continue;let a=walkLevel(c),b=walkLevel(n);if(topKind(c)==='house'&&topKind(n)!=='house'&&c.kinds[b]==='house')a=b;if(topKind(n)==='house'&&topKind(c)!=='house'&&n.kinds[a]==='house')b=a;if(Math.abs(a-b)<=1){const style=a!==b?'stairs':gap===1?'walk':c.bridge!=='auto'?c.bridge:n.bridge!=='auto'?n.bridge:gap===3?'covered':this.theme==='sky'?'arch':'rope';links.push({x:c.x,z:c.z,dx,dz,gap,a,b,style});}break;}return links;}
 junctions(){const links=this.connections().filter(l=>l.a===l.b&&l.gap>1),result=new Map();for(const h of links.filter(l=>l.dx))for(const v of links.filter(l=>l.dz)){const x=v.x,z=h.z;if(h.a!==v.a||x<=h.x||x>=h.x+h.gap||z<=v.z||z>=v.z+v.gap||this.get(x,z))continue;const floating=[this.get(h.x,h.z),this.get(h.x+h.gap,h.z),this.get(v.x,v.z),this.get(v.x,v.z+v.gap)].every(c=>c.floating);result.set(`${x},${z},${h.a}`,{x,z,level:h.a,...(floating?{floating:true}:{})});}return [...result.values()];}
 courtyards(){const result=[],used=new Set();for(const c of [...this.cells.values()].sort((a,b)=>a.x-b.x||a.z-b.z)){if(topKind(c)==='house')continue;const square=[[c.x,c.z],[c.x+1,c.z],[c.x,c.z+1],[c.x+1,c.z+1]];if(square.every(([x,z])=>{const n=this.get(x,z);return n&&topKind(n)!=='house'&&walkLevel(n)===walkLevel(c)&&!used.has(this.key(x,z));})){result.push({x:c.x+.5,z:c.z+.5,level:walkLevel(c)});square.forEach(([x,z])=>used.add(this.key(x,z)));}}return result;}
 seed(){this.cells.clear();const coords=this.theme==='forest'?[[0,-1,2],[-1,-1,1],[1,-1,3],[2,-1,1],[-2,-1,1],[2,1,2]]:[[0,-1,3],[-1,-1,1],[1,-1,2],[2,-1,1],[-2,-1,2],[2,1,2]];for(const [x,z,h]of coords)this.cells.set(this.key(x,z),{x,z,colors:Array.from({length:h},()=>PALETTE[this.theme==='forest'?[1,2,4][Math.abs(x+z)%3]:[0,2,6][Math.abs(x+z)%3]]),kinds:Array(h).fill('house'),bridge:'auto'});
 for(const [x,z]of [[-1,0],[0,0],[-1,1],[0,1]])this.cells.set(this.key(x,z),{x,z,colors:[PALETTE[3]],kinds:['platform'],bridge:'auto'});
 // An upper garden and an adjacent terrace show how open space changes the silhouette.
 const c=this.get(2,1);c.colors.push(PALETTE[4]);c.kinds.push('garden');this.cells.set(this.key(3,1),{x:3,z:1,colors:[PALETTE[3],PALETTE[3],PALETTE[3]],kinds:['support','support','platform'],bridge:'covered'});
 const step=this.get(2,-1);step.colors.push(PALETTE[3]);step.kinds.push('platform');this.cells.set(this.key(-3,1),{x:-3,z:1,colors:[PALETTE[3]],kinds:['platform'],bridge:'auto'});this.cells.set(this.key(3,-1),{x:3,z:-1,colors:[PALETTE[3],PALETTE[3],PALETTE[3]],kinds:['support','support','platform'],bridge:'auto'});
 for(const c of this.cells.values())c.floating=false;
 this.undoStack=[];this.redoStack=[];}
}
