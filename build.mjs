import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=import.meta.dirname;
const bundle=await build({entryPoints:[join(root,'src/game3d.js')],bundle:true,minify:true,format:'iife',target:'es2022',write:false,legalComments:'inline'});
const [html,css]=await Promise.all([readFile(join(root,'index.html'),'utf8'),readFile(join(root,'src/game.css'),'utf8')]);
const licenses=await Promise.all(['three','cannon-es'].map(async name=>`${name}\n${await readFile(join(root,'node_modules',name,'LICENSE'),'utf8')}`));
const script=bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const output=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'')
 .replace('</head>',()=>`<!-- Third-party MIT licenses:\n${licenses.join('\n\n')}\n-->\n</head>`)
 .replace('<link rel="stylesheet" href="/src/game.css">',()=>`<style>${css}</style>`)
 .replace('<script type="module" src="/src/game3d.js"></script>',()=>`<script>${script}</script>`);
await mkdir(join(root,'dist'),{recursive:true});await writeFile(join(root,'dist/index.html'),output);
await writeFile(join(root,'hamster-3d.html'),output);
console.log('Built true 3D game: dist/index.html. All code, physics, textures and models are embedded.');
