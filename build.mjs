import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=import.meta.dirname;await mkdir(join(root,'dist'),{recursive:true});
async function standalone(template,entry,stylesheet,licenses){
 const bundle=await build({entryPoints:[join(root,entry)],bundle:true,minify:true,format:'iife',target:'es2022',write:false,legalComments:'inline'});
 const [html,css,licenseTexts]=await Promise.all([readFile(join(root,template),'utf8'),readFile(join(root,stylesheet),'utf8'),Promise.all(licenses.map(async n=>`${n}\n${await readFile(join(root,'node_modules',n,'LICENSE'),'utf8')}`))]);
 return html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace('</head>',()=>`<!-- Third-party MIT licenses:\n${licenseTexts.join('\n\n')}\n-->\n</head>`).replace(`<link rel="stylesheet" href="/${stylesheet}">`,()=>`<style>${css}</style>`).replace(`<script type="module" src="/${entry}"></script>`,()=>`<script>${bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script>`);
}
const town=await standalone('index.html','src/town/main.js','src/town/style.css',['three']);
const forest=town.replace('<body>','<body data-initial-theme="forest">');
const sky=town.replace('<body>','<body data-initial-theme="sky">').replace('<title>森间来信 · 小小造景家</title>','<title>云上的日子 · 小小造景家</title>');
await writeFile(join(root,'forest-village.html'),forest);await writeFile(join(root,'sky-city.html'),sky);await writeFile(join(root,'dist/index.html'),forest);await writeFile(join(root,'dist/forest-village.html'),forest);await writeFile(join(root,'dist/sky-city.html'),sky);
const hamster=await standalone('hamster-source.html','src/game3d.js','src/game.css',['three','cannon-es']);await writeFile(join(root,'hamster-3d.html'),hamster);await writeFile(join(root,'dist/hamster-3d.html'),hamster);
console.log('Built two standalone town games: forest-village.html and sky-city.html; preserved hamster-3d.html. No runtime network assets.');
