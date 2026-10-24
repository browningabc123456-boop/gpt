import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {deflateRawSync} from 'node:zlib';
import {build} from 'esbuild';
const dir=import.meta.dirname;
const notices=(await readFile(join(dir,'assets/THREE-LICENSE.txt'),'utf8'))+'\n\n'+await readFile(join(dir,'assets/FONT-LICENSE.txt'),'utf8');
let html=await readFile(join(dir,'index.html'),'utf8');
let titleImage=await readFile(join(dir,'assets/title.png'));
let fontCSS='';for(let weight of ['regular','bold'])fontCSS+='@font-face{font-family:"Island Serif";font-style:normal;font-weight:'+(weight==='bold'?'700 900':'100 600')+';font-display:swap;src:url(data:font/woff;base64,'+(await readFile(join(dir,'assets/serif-'+weight+'.woff'))).toString('base64')+') format("woff")}';
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+fontCSS+await readFile(join(dir,'style.css'),'utf8')+'</style>');
html=html.replace('src="assets/title.png"',()=> 'src="data:image/png;base64,'+(titleImage.toString('base64'))+'"');
let result=await build({absWorkingDir:dir,entryPoints:['game.js'],bundle:true,format:'iife',minify:true,target:'es2020',write:false,legalComments:'none'});
let core=await readFile(join(dir,'core.js'),'utf8');html=html.replace('<script src="core.js"></script>',()=>'<script>'+core+'</script>');
html=html.replace('<script type="module" src="game.js"></script>',()=>'<script>'+result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>');
html=html.replace('</body>',()=>'<script type="text/plain" id="third-party-notices">'+notices.replace(/<\/script/gi,'<\\/script')+'</script></body>');
await mkdir(join(dir,'dist'),{recursive:true});await writeFile(join(dir,'dist/index.html'),html);await writeFile(join(dir,'../island.html'),html);
console.log('Built island/dist/index.html and island.html ('+Buffer.byteLength(html)+' bytes).');

await mkdir(join(dir,'../releases'),{recursive:true});
// Small ZIP writer keeps packaging dependency-free and works in restricted runtimes.
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data){let c=0xffffffff;for(let b of data)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
async function archive(path,files){let local=[],central=[],offset=0;for(let [name,path] of files){let data=await readFile(path),compressed=deflateRawSync(data),n=Buffer.from(name),crc=crc32(data),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(8,8);h.writeUInt32LE(crc,14);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(n.length,26);local.push(h,n,compressed);let c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(8,10);c.writeUInt32LE(crc,16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=h.length+n.length+compressed.length;}let directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);await writeFile(path,Buffer.concat([...local,directory,end]));}
await archive(join(dir,'../releases/island-sketchbook-web.zip'),[['index.html',join(dir,'dist/index.html')],['README.md',join(dir,'OFFLINE.md')]]);
await archive(join(dir,'../releases/island-sketchbook-source.zip'),['index.html','style.css','core.js','game.js','save-library.js','tests.mjs','build.mjs','README.md','OFFLINE.md','package.json','paper-world.js','paper-batches.js','paper-library.js','paper-actors.js','life-runtime.js','scene-composer.js','music.js','assets/legacy-starter.json','assets/serif-regular.woff','assets/serif-bold.woff','assets/FONT-LICENSE.txt','assets/THREE-LICENSE.txt','assets/title.png'].map(p=>[p,join(dir,p)]));
console.log('Packaged releases/island-sketchbook-web.zip and island-sketchbook-source.zip');
