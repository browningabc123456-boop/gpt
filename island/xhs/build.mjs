import {build,transform} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {zipFiles} from './zip.mjs';
import {adaptGame} from './adapt.mjs';
const dir=resolve(import.meta.dirname,'..'),root=resolve(dir,'..'),out=join(root,'island-xhs-dist');
await rm(out,{recursive:true,force:true});await mkdir(join(out,'assets'),{recursive:true});
function rgba(hex){if(hex.length===4)hex=hex.split('').map(c=>c+c).join('');return `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},${parseInt(hex.slice(6,8),16)/255})`;}
const plugin={name:'offline-xhs-island',setup(b){
 b.onLoad({filter:/\/island\/.*\.js$/},async args=>{let s=await readFile(args.path,'utf8');if(args.path===join(dir,'game.js'))s=adaptGame(s);if(args.path===join(dir,'paper-world.js'))s=s.replace("col+'00'","'rgba('+[1,3,5].map(i=>parseInt(col.slice(i,i+2),16)).join(',')+',0)'");s=s.replace(/(['"])#([\da-fA-F]{8}|[\da-fA-F]{4})\1/g,(_,q,hex)=>q+rgba(hex)+q);return{contents:s,loader:'js'};});
 b.onLoad({filter:/\/three\/build\/three\.core\.js$/},async args=>{let s=await readFile(args.path,'utf8');s=s.replace(/fetch\(/g,'unavailableResourceRequest(');s="function unavailableResourceRequest(){return Promise.reject(new Error('This game only uses packaged and generated resources'));}\n"+s;return{contents:s,loader:'js'};});
 b.onLoad({filter:/\/three\/build\/three\.module\.js$/},async args=>{let s=await readFile(args.path,'utf8'),a=s.indexOf('class WebXRManager'),z=s.indexOf('\nfunction WebGLMaterials(',a+1);if(a<0||z<0)throw Error('Review Three XR exclusion');s=s.slice(0,a)+`class WebXRManager {constructor(){this.enabled=false;this.isPresenting=false;}addEventListener(){}removeEventListener(){}setAnimationLoop(){}dispose(){}getEnvironmentBlendMode(){return 'opaque';}hasDepthSensing(){return false;}}\n`+s.slice(z);return{contents:s,loader:'js'};});
}};
const flags={target:['es2017','chrome61'],minify:true,legalComments:'none'};
let result=await build({absWorkingDir:dir,entryPoints:['game.js'],bundle:true,write:false,format:'iife',...flags,plugins:[plugin]});
await writeFile(join(out,'assets/game.js'),result.outputFiles[0].text);
for(let [from,to]of [['core.js','core.js'],['xhs/compat.js','compat.js']]){let s=(await transform(await readFile(join(dir,from),'utf8'),flags)).code;await writeFile(join(out,'assets',to),s);}
let html=await readFile(join(dir,'index.html'),'utf8');html=html.replace('href="style.css"','href="./assets/style.css"').replace('src="assets/title.png"','src="./assets/title.png"').replace('<script src="core.js"></script><script type="module" src="game.js"></script>','<script src="./assets/compat.js"></script><script src="./assets/core.js"></script><script src="./assets/game.js"></script>');
await writeFile(join(out,'index.html'),html);
let css=await readFile(join(dir,'style.css'),'utf8');css=css.replace(/([\w-]+):([^;{}]+)(?=[;}])/g,(all,key,value)=>{let fallback=value.replace(/(\d+(?:\.\d+)?)dvh/g,'$1vh').replace(/env\(safe-area-inset-(top|bottom)\)/g,'0px');if(key==='inset')return `top:${value};right:${value};bottom:${value};left:${value};${all}`;if(key==='gap')return `grid-gap:${value};${all}`;return fallback!==value?`${key}:${fallback};${all}`:all;});
css='@font-face{font-family:"Island Serif";font-style:normal;font-weight:100 600;src:url(./serif-regular.woff) format("woff")}@font-face{font-family:"Island Serif";font-style:normal;font-weight:700 900;src:url(./serif-bold.woff) format("woff")}'+css+'\n'+await readFile(join(dir,'xhs/compat.css'),'utf8');
await writeFile(join(out,'assets/style.css'),(await transform(css,{loader:'css',target:'chrome61',minify:true})).code);
for(let file of ['title.png','serif-regular.woff','serif-bold.woff'])await copyFile(join(dir,'assets',file),join(out,'assets',file));
await writeFile(join(out,'assets/licenses.json'),JSON.stringify({three:await readFile(join(dir,'assets/THREE-LICENSE.txt'),'utf8'),font:await readFile(join(dir,'assets/FONT-LICENSE.txt'),'utf8')}));
const archive=join(root,'releases/island-sketchbook-xhs.zip');await zipFiles(out,archive);await copyFile(archive,join(root,'releases/island-sketchbook-xhs-v6.zip'));
