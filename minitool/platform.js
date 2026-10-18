const KEY='little-places-v1';
let native=null,memory=null,writeChain=Promise.resolve(),writeVersion=0,failed=false;
const browser={get(){try{return window.localStorage.getItem(KEY);}catch{return null;}},set(data){try{window.localStorage.setItem(KEY,data);return true;}catch{return false;}}};
export async function hydrateStorage(){
 const xhs=window.xhs,api=xhs&&xhs.miniTool;let launch=xhs&&xhs.launchOptions;
 if(api&&typeof api.getLaunchOptions==='function'&&!(launch&&launch.miniToolEnv))try{launch=await api.getLaunchOptions();}catch{}
 const version=Math.floor(Number(launch&&launch.miniToolEnv&&launch.miniToolEnv.buildVersion||0)/1000);
 if(version>=9460&&api&&typeof api.getStorage==='function'&&typeof api.setStorage==='function'){
  native=api;try{const result=await api.getStorage({key:KEY});memory=result&&typeof result.data==='string'?result.data:browser.get();}catch{native=null;memory=browser.get();}
 }else memory=browser.get();
}
function status(text){const node=document.getElementById('save-state');if(node)node.textContent=text;}
export const platformStorage={
 getItem(key){return key===KEY?memory:null;},
 setItem(key,data){if(key!==KEY)return;memory=data;if(native){const version=++writeVersion;status('正在保存作品…');writeChain=writeChain.catch(()=>{}).then(async()=>{if(version!==writeVersion)return;try{await native.setStorage({key:KEY,data});failed=false;status('已保存到小工具 · 下次回来还在');}catch{failed=true;const local=browser.set(data);status(local?'暂存于此设备 · 小工具存档未同步':'保存失败 · 请保持页面打开');}});}else{failed=!browser.set(data);if(failed)throw Error('此环境无法保存作品');}},
 get pending(){return writeChain;},get failed(){return failed;},get native(){return !!native;}
};
export async function savePicture(data){const api=window.xhs&&window.xhs.miniTool;if(!api||typeof api.saveImageToPhotosAlbum!=='function')throw Error('当前环境不支持保存相册，请在小红书 App 的小工具中使用。');let filePath=data;if(typeof api.writeTempFile==='function'){const result=await api.writeTempFile({data});if(!result||typeof result.filePath!=='string')throw Error('图片准备失败，请重试。');filePath=result.filePath;}await api.saveImageToPhotosAlbum({filePath});}
