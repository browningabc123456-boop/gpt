// The upload edition uses the platform bridge; shared gameplay stays identical.
export function adaptGame(source){
 function swap(from,to){if(!source.includes(from))throw Error('Review XHS adaptation: '+from.slice(0,90));source=source.replace(from,to);}
 source="import {storage as platformStorage,state as platformState,preparePlatform,photoToAlbum} from './xhs/platform.js';\n"+source;
 source=source.replaceAll('localStorage','platformStorage');
 swap('if(!document.hidden&&game&&','if(!contextPaused&&!document.hidden&&game&&');
 swap("window.addEventListener('resize',resize);","let contextPaused=false;canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextPaused=true;saveNow();music.suspend();toast('画面正在恢复');});canvas.addEventListener('webglcontextrestored',()=>{contextPaused=false;dirty=true;music.resume().catch(()=>{});});window.addEventListener('resize',resize);");
 swap("const api=window.xhs?.miniTool;","const api=platformState.api;");
 let a=source.indexOf('async function persistLibrary()'),b=source.indexOf('\n',a);if(a<0)throw Error('Review persistence');source=source.slice(0,a)+`async function persistLibrary(){let raw=JSON.stringify(data);try{await platformStorage.write(KEY,raw);$('saveState').textContent='已暂存';return true;}catch(e){$('saveState').textContent='未保存';toast(e.message);return false;}}`+source.slice(b);
 a=source.indexOf('function download(');b=source.indexOf('\n',a);if(a<0)throw Error('Review browser download');source=source.slice(0,a)+source.slice(b);
 a=source.indexOf('async function nativePhoto(');b=source.indexOf('\n',a);source=source.slice(0,a)+`async function nativePhoto(p){await photoToAlbum(p.data);return '已保存到系统相册';}`+source.slice(b);
 swap("init().catch(e=>", "preparePlatform().then(()=>init()).then(()=>{if(platformState.warning)toast(platformState.warning);}).catch(e=>");
 return source;
}
