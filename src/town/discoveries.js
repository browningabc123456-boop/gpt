import {THEMES,topKind,walkLevel} from './model.js';
export const KIND_LABELS={house:'间小屋',platform:'块平台',garden:'座花园'};
const names={forest:['花香早餐铺','林间街角咖啡','藤影小舞台'],sky:['云朵早餐铺','云上咖啡廊','星泉音乐角'],snow:['暖汤点心铺','雪檐茶座','雪松小剧场'],garden:['花蜜早餐铺','叶下下午茶','蝴蝶小舞台'],city:['街角花店咖啡','骑楼面包铺','街头音乐角'],ants:['种子早餐铺','根须茶座','菌丝音乐角']};
export function themeRecipes(theme){const n=names[theme]||names.forest;return [{id:`${theme}:mix:breakfast`,theme,type:'mix',style:'breakfast',name:n[0],need:{house:1,garden:1},description:'让小屋和花园同高相邻，长出花箱、点心桌和小招牌。'},{id:`${theme}:mix:cafe`,theme,type:'mix',style:'cafe',name:n[1],need:{house:1,platform:1},description:'小屋门前接一块同高平台，出现遮阳棚与露天咖啡座。'},{id:`${theme}:mix:stage`,theme,type:'mix',style:'stage',name:n[2],need:{garden:1,platform:1},description:'同高相邻的花园与平台，变成有花门和乐器的音乐角。'}];}
export const SECRET_NAMES={forest:['桥下的蘑菇信箱','偷懒的小松鼠'],sky:['云边的纸飞机','睡着的月亮碎片'],snow:['温泉边的小雪人','冻住的爱心石'],garden:['叶背的瓢虫旅馆','花下的蜗牛邮局'],city:['巷口的打盹猫','屋顶的迷你电台'],ants:['墙里的古老化石','会发光的种子']};
export function requirementText(recipe){return Object.entries(recipe.need).map(([kind,n])=>`${n} ${KIND_LABELS[kind]}`).join(' + ');}
export function mixedCombinations(town){const recipes=themeRecipes(town.theme).filter(r=>r.type==='mix'),found=[];for(const c of town.cells.values())for(const [dx,dz]of [[1,0],[0,1]]){const other=town.get(c.x+dx,c.z+dz);if(!other||walkLevel(c)!==walkLevel(other))continue;for(const recipe of recipes){const kinds=Object.keys(recipe.need),a=topKind(c),b=topKind(other);if(a===b||!kinds.includes(a)||!kinds.includes(b))continue;const terrace=[c,other].find(c=>topKind(c)===(recipe.style==='stage'?'platform':'garden'))||[c,other].find(c=>topKind(c)!=='house');found.push({...recipe,key:`${recipe.id}:${c.x},${c.z}:${dx},${dz}`,cells:[c,other],anchor:terrace,level:walkLevel(terrace)});}}return found;}
const validIds=new Set(Object.keys(THEMES).flatMap(t=>[...themeRecipes(t).map(r=>r.id),...SECRET_NAMES[t].map((_,i)=>`${t}:secret:${i}`)]));
export class Discoveries{
 constructor(value={}){this.completed=new Set(Array.isArray(value?.completed)?value.completed.filter(id=>validIds.has(id)):[]);this.secrets=new Set(Array.isArray(value?.secrets)?value.secrets.filter(id=>validIds.has(id)&&id.includes(':secret:')):[]);}
 discoverSecret(theme,index){const id=`${theme}:secret:${index}`;if(!validIds.has(id))return false;const fresh=!this.secrets.has(id);this.secrets.add(id);this.completed.add(id);return fresh;}
 snapshot(){return{completed:[...this.completed],secrets:[...this.secrets]};}
}
