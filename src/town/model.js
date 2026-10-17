export const PALETTE=['#d76457','#df9466','#e4ba65','#e5d99a','#a3bb7a','#6b9c80','#75aab0','#7298bb','#a997bb','#c78da0'];
export const THEMES={forest:{title:'森间来信',subtitle:'FOREST LETTERS',description:'在枝叶之间，搭一座慢慢长大的小村庄。',background:'#bac9b2',colors:['#d77c59','#e7bd72','#b7c88d','#93b5a0']},sky:{title:'云上的日子',subtitle:'DAYS ABOVE THE CLOUDS',description:'让一座小城，轻轻停在云的上面。',background:'#adc9d3',colors:['#d66f63','#e6c783','#91b5b5','#b4a4c9']}};
export class Town{
 constructor(theme='forest'){this.theme=THEMES[theme]?theme:'forest';this.cells=new Map();this.undoStack=[];this.redoStack=[];}
 key(x,z){return `${x},${z}`;}
 get(x,z){return this.cells.get(this.key(x,z));}
 snapshot(){return [...this.cells.values()].map(c=>({...c,colors:[...c.colors]}));}
 load(data){if(!Array.isArray(data)||data.length>180)return false;const next=new Map();for(const c of data){if(!Number.isInteger(c.x)||!Number.isInteger(c.z)||Math.abs(c.x)>7||Math.abs(c.z)>7||!Array.isArray(c.colors)||c.colors.length<1||c.colors.length>6||!c.colors.every(v=>PALETTE.includes(v)))return false;next.set(this.key(c.x,c.z),{x:c.x,z:c.z,colors:[...c.colors]});}this.cells=next;return true;}
 edit(x,z,color,erase=false){if(!Number.isInteger(x)||!Number.isInteger(z)||Math.abs(x)>7||Math.abs(z)>7||(!erase&&!PALETTE.includes(color)))return false;const c=this.get(x,z);if(erase&&!c||!erase&&(c?.colors.length>=6||!c&&this.cells.size>=180))return false;this.undoStack.push(this.snapshot());if(this.undoStack.length>60)this.undoStack.shift();this.redoStack=[];if(erase){c.colors.pop();if(!c.colors.length)this.cells.delete(this.key(x,z));}else if(c)c.colors.push(color);else this.cells.set(this.key(x,z),{x,z,colors:[color]});return true;}
 undo(){if(!this.undoStack.length)return false;this.redoStack.push(this.snapshot());return this.load(this.undoStack.pop());}
 redo(){if(!this.redoStack.length)return false;this.undoStack.push(this.snapshot());return this.load(this.redoStack.pop());}
 neighbors(x,z){return [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>this.get(x+dx,z+dz)).filter(Boolean);}
 count(){return this.snapshot().reduce((n,c)=>n+c.colors.length,0);}
 seed(){this.cells.clear();const coords=this.theme==='forest'?[[0,0,2],[-1,0,1],[1,0,2],[0,-1,3],[1,-1,1],[-2,0,1],[2,1,1],[2,0,2],[-1,1,1]]:[[0,0,3],[-1,0,1],[1,0,2],[0,-1,2],[-1,-1,1],[2,0,1],[2,1,2],[1,1,1],[-2,0,2]];for(const [x,z,h]of coords)this.cells.set(this.key(x,z),{x,z,colors:Array.from({length:h},()=>PALETTE[this.theme==='forest'?[1,2,4][Math.abs(x+z)%3]:[0,2,6][Math.abs(x+z)%3]])});this.undoStack=[];this.redoStack=[];}
}
