import {build} from 'esbuild';
import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),out=join(root,'minitool-dist');
await rm(out,{recursive:true,force:true});await mkdir(join(out,'assets'),{recursive:true});
function legacyColor(hex){const h=hex.length===4?hex.split('').map(c=>c+c).join(''):hex;return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${(parseInt(h.slice(6,8),16)/255).toFixed(4)})`;}
const plugin={name:'isolated-minitool-adaptation',setup(builder){
 builder.onResolve({filter:/\/screenshot\.js$/},args=>args.importer.includes('/src/town/')?{path:join(root,'minitool/screenshot.js')}:null);
 builder.onResolve({filter:/\/instances\.js$/},args=>args.importer.includes('/src/town/')?{path:join(root,'minitool/instances.js')}:null);
 builder.onLoad({filter:/\/src\/town\/.*\.js$/},async args=>{let s=await readFile(args.path,'utf8');const name=args.path.split('/').at(-1);
 if(name==='main.js'){
  s="import {platformStorage} from '../../minitool/platform.js';import {installRuntimeFrame} from '../../minitool/runtime.js';\n"+s.replaceAll('localStorage','platformStorage');
  s=s.replace("function persist(){","function persist(){if(document.getElementById('simple-world'))return;");
  s=s.replace("$('#save-state').textContent='已自动保存 · 下次回来还在';","if(!platformStorage.native)$('#save-state').textContent='已保存到此设备 · 下次回来还在';");
  s=s.replace("$('#thought-close').onclick=hideThought;","document.addEventListener('minitool-fallback',()=>{music.pause();inspector?.stop();});$('#thought-close').onclick=hideThought;");
  s=s.replace('requestAnimationFrame(frame);}requestAnimationFrame(frame);','}installRuntimeFrame(frame);');
  s=s.replace('手机可长按预览图片保存','在小红书中点击保存到相册').replace('请使用手机或电脑的系统截图','请稍后重试').replace('PNG 下载','相册保存');
 }
 if(name==='view.js'){
  s="import {compactWorld,finishFrame,rendererSize,watchRenderer} from '../../minitool/runtime.js';\n"+s;
  s=s.replace("antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'","antialias:true,preserveDrawingBuffer:true,powerPreference:'default'").replace('Math.min(devicePixelRatio,1.7)','Math.min(devicePixelRatio,1.5)').replace('this.renderer.shadowMap.enabled=true','this.renderer.shadowMap.enabled=false').replace('this.sun.shadow.mapSize.set(2048,2048)','this.sun.shadow.mapSize.set(512,512)');
  s=s.replace('this.camera=new T.OrthographicCamera(-10,10,8,-8,.1,100);','this.camera=new T.OrthographicCamera(-10,10,8,-8,.5,70);');
  s=s.replace('this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));','watchRenderer(this);this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));');
  const outlineStart=s.indexOf(' outline(mesh,color=');const outlineEnd=s.indexOf('\n box(',outlineStart);if(outlineStart<0||outlineEnd<0)throw Error('Review outline adapter');s=s.slice(0,outlineStart)+' outline(mesh){return mesh;}'+s.slice(outlineEnd);
  s=s.replace('const map=paper(color,type.length);','const map=null;').replace('new T.MeshStandardMaterial({map,roughness:','new T.MeshStandardMaterial({color,map,roughness:');
  s=s.replace('new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(n=>n/3)))','r>.06?new RoundedBoxGeometry(...size,1,Math.min(r,...size.map(n=>n/3))):new T.BoxGeometry(...size)').replace('new T.SphereGeometry(1,20,14)','new T.SphereGeometry(1,10,7)').replace('new T.TubeGeometry(curve,Math.max(4,points.length*4),r,5,false)','new T.TubeGeometry(curve,Math.max(3,points.length*2),r,3,false)');
  s=s.replace('this.life.syncTown(town);this.updateNight();','this.life.syncTown(town);this.updateNight();compactWorld(this);');
  s=s.replace('this.renderer.setSize(r.width,r.height,false);','rendererSize(this,r.width,r.height);this.renderer.setSize(r.width,r.height,false);');
  s=s.replaceAll('this.renderer.render(this.scene,this.camera);}','this.renderer.render(this.scene,this.camera);finishFrame(this);}');
 }
 if(name==='music.js'){s=s.replace('pause(){if(this.enabled)this.context?.suspend();}', 'pause(){clearInterval(this.timer);this.timer=null;if(this.enabled)this.context?.suspend();}').replace('this.next=this.context.currentTime+.1;this.context.resume();','this.next=this.context.currentTime+.1;this.context.resume();if(!this.timer)this.timer=setInterval(()=>this.schedule(),180);');}
 if(name==='inspection.js'){
  s=s.replace('this.renderer=null;}','this.renderer=null;document.addEventListener(\'visibilitychange\',()=>{if(document.hidden)cancelAnimationFrame(this.frame);else if(this.controls&&this.resumeTick)this.resumeTick();});}');
  s=s.replace('if(version!==this.version)return;resize();','if(version!==this.version||document.hidden)return;resize();').replace('};tick();','};this.resumeTick=tick;tick();');
  s=s.replace('this.cache.set(job.item.id,png);','if(this.cache.size>=40)this.cache.delete(this.cache.keys().next().value);this.cache.set(job.item.id,png);');
 }
 s=s.replace(/(['"])#([0-9a-fA-F]{8}|[0-9a-fA-F]{4})\1/g,(_,quote,hex)=>quote+legacyColor(hex)+quote);
 return{contents:s,loader:'js'};
 });
 // Offline-only renderer: omit dormant networking loaders and XR integration entirely.
 builder.onLoad({filter:/\/three\/build\/three\.core\.js$/},async args=>{let s=await readFile(args.path,'utf8');s=s.replace(/fetch\(/g,'offlineResourceRequest(');s="function offlineResourceRequest(){return Promise.reject(new Error('Only packaged resources and generated textures are supported'));}\n"+s;return{contents:s,loader:'js'};});
 builder.onLoad({filter:/\/three\/build\/three\.module\.js$/},async args=>{let s=await readFile(args.path,'utf8');const start=s.indexOf('class WebXRManager'),end=s.indexOf('\nfunction WebGLMaterials(',start+1);if(start<0||end<0)throw Error('Renderer layout changed; review XR exclusion');s=s.slice(0,start)+`class WebXRManager {constructor(){this.enabled=false;this.isPresenting=false;}addEventListener(){}removeEventListener(){}setAnimationLoop(){}dispose(){}getEnvironmentBlendMode(){return 'opaque';}hasDepthSensing(){return false;}}\n`+s.slice(end);return{contents:s,loader:'js'};});
}};
const result=await build({absWorkingDir:root,entryPoints:['minitool/entry.js'],bundle:true,write:false,format:'iife',target:['es2017','chrome61'],minify:true,legalComments:'none',plugins:[plugin]});
await writeFile(join(out,'assets/game.js'),result.outputFiles[0].text);
let html=await readFile(join(root,'index.html'),'utf8');html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('<link rel="stylesheet" href="/src/town/style.css">','<link rel="stylesheet" href="./assets/style.css">').replace('<script type="module" src="/src/town/main.js"></script>','<script src="./assets/game.js"></script>');
html=html.replace('<title>森间来信 · 小小造景家</title>','<title>小小造景家</title>');
await writeFile(join(out,'index.html'),html);
let css=await readFile(join(root,'src/town/style.css'),'utf8');
// Local declaration fallbacks; modern declarations stay as progressive enhancements.
css=css.replace(/([\w-]+):([^;{}]+)(?=[;}])/g,(all,key,value)=>{let fallback=value.replace(/(\d+(?:\.\d+)?)dvh/g,'$1vh');if(key==='inset')return `top:${value};right:${value};bottom:${value};left:${value};${all}`;
 if(value.includes('min(620px'))fallback='calc(100% - 70px)';else if(value.includes('min(650px'))fallback='calc(100% - 36px)';else if(value.includes('min(580px'))fallback='90%';else if(value.includes('min(560px'))fallback='calc(100% - 32px)';else if(value.includes('min(550px'))fallback='calc(100% - 30px)';else if(value.includes('min(820px'))fallback='calc(100% - 24px)';else if(value.includes('min(49dvh'))fallback='49vh';
 const safe=value.match(/^max\((\d+)px,env\(safe-area-inset-(top|bottom)\)\)$/);if(safe)return `${key}:${safe[1]}px;${key}:var(--safe-area-inset-${safe[2]}, ${safe[1]}px);@BAD@${all}`.replace('@BAD@','');
 if(key==='gap')return `grid-gap:${value};${all}`;
 return fallback!==value?`${key}:${fallback};${all}`:all;});
css=css.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{4})(?![0-9a-fA-F])/g,(_,hex)=>legacyColor(hex));
css+='\n'+await readFile(join(root,'minitool/compat.css'),'utf8');
await writeFile(join(out,'assets/style.css'),css);
const license=await readFile(join(root,'node_modules/three/LICENSE'),'utf8');await writeFile(join(out,'assets/licenses.json'),JSON.stringify({three:license}));
const archive=join(root,'releases/little-places-xhs.zip');await mkdir(join(root,'releases'),{recursive:true});await rm(archive,{force:true});execFileSync('python3',['-c',"import pathlib,zipfile,sys; root=pathlib.Path(sys.argv[1]); z=zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED,compresslevel=9); [z.write(p,p.relative_to(root).as_posix()) for p in sorted(root.rglob('*')) if p.is_file()]; z.close()",out,archive]);
await copyFile(archive,join(root,'releases/little-places-xhs-ui.zip'));
console.log('Built isolated offline mini-tool:',archive);
