import {build} from 'esbuild';
import {readFile,mkdir,writeFile,rm,copyFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=import.meta.dirname;await rm(join(root,'dist'),{recursive:true,force:true});await mkdir(join(root,'dist'),{recursive:true});
async function standalone(template,entry,stylesheet,licenses){
 const bundle=await build({entryPoints:[join(root,entry)],bundle:true,minify:true,format:'iife',target:'es2022',write:false,legalComments:'inline'});
 const [html,css,licenseTexts]=await Promise.all([readFile(join(root,template),'utf8'),readFile(join(root,stylesheet),'utf8'),Promise.all(licenses.map(async n=>`${n}\n${await readFile(join(root,'node_modules',n,'LICENSE'),'utf8')}`))]);
 return html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('</head>',()=>`<!-- Third-party MIT licenses:\n${licenseTexts.join('\n\n')}\n-->\n</head>`).replace(`<link rel="stylesheet" href="/${stylesheet}">`,()=>`<style>${css}</style>`).replace(`<script type="module" src="/${entry}"></script>`,()=>`<script>${bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script>`);
}
const town=await standalone('index.html','src/town/main.js','src/town/style.css',['three']);
const worlds=[['forest','forest-village.html','森间来信'],['sky','sky-city.html','云上的日子'],['snow','snow-village.html','雪落暖汤'],['garden','garden-village.html','花间小住'],['city','city-neighborhood.html','街角日常'],['ants','ant-colony.html','地下的秘密']];
for(const [theme,file,title]of worlds){const output=town.replace('<body>',`<body data-initial-theme="${theme}">`).replace('<title>森间来信 · 小小造景家</title>',`<title>${title} · 小小造景家</title>`);await Promise.all([writeFile(join(root,file),output),writeFile(join(root,'dist',file),output),...(theme==='forest'?[writeFile(join(root,'dist/index.html'),output)]:[])]);}
const hamster=await standalone('hamster-source.html','src/game3d.js','src/game.css',['three','cannon-es']);await writeFile(join(root,'hamster-3d.html'),hamster);await writeFile(join(root,'dist/hamster-3d.html'),hamster);
console.log('Built six standalone worlds: forest, sky, snow, garden, city and ants; preserved hamster game. No external runtime assets.');

const redirect='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./index.html"><title>返回小小造景家</title><p>海上船屋已移除。<a href="./index.html">进入其他场景</a></p></html>';await Promise.all([writeFile(join(root,'sea-village.html'),redirect),writeFile(join(root,'dist/sea-village.html'),redirect)]);

// The separate upload package never changes the standalone game URLs.
try{await copyFile(join(root,'releases/little-places-xhs.zip'),join(root,'dist/little-places-xhs.zip'));}catch(error){if(error.code!=='ENOENT')throw error;}

try{await copyFile(join(root,'releases/little-places-xhs-3d-fix.zip'),join(root,'dist/little-places-xhs-3d-fix.zip'));}catch(error){if(error.code!=='ENOENT')throw error;}

try{await copyFile(join(root,'releases/little-places-xhs-smooth.zip'),join(root,'dist/little-places-xhs-smooth.zip'));}catch(error){if(error.code!=='ENOENT')throw error;}

try{await copyFile(join(root,'releases/little-places-xhs-ui.zip'),join(root,'dist/little-places-xhs-ui.zip'));}catch(error){if(error.code!=='ENOENT')throw error;}

try{await copyFile(join(root,'releases/little-places-xhs-expand.zip'),join(root,'dist/little-places-xhs-expand.zip'));}catch(error){if(error.code!=='ENOENT')throw error;}
