import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const root=import.meta.dirname;
const read=name=>readFile(join(root,name),'utf8');
const [html,css,engine,renderer,app,png]=await Promise.all([
  read('index.html'),read('src/style.css'),read('src/engine.js'),read('src/render.js'),read('src/app.js'),readFile(join(root,'assets/hamster.png'))
]);
const dataURL=`data:image/png;base64,${png.toString('base64')}`;
const stripImports=source=>source.replace(/^import .*?;\s*$/gm,'');
const script=[engine.replace(/^export /gm,''),stripImports(renderer).replace("'/assets/hamster.png'",JSON.stringify(dataURL)),stripImports(app)].join('\n');
const output=html.replace('<link rel="stylesheet" href="/src/style.css">',()=>`<style>${css}</style>`)
  .replace('<script type="module" src="/src/app.js"></script>',()=>`<script type="module">${script}</script>`)
  .replace('href="/" aria-label="仓鼠施工队首页"','href="#" aria-label="仓鼠施工队首页"');
await mkdir(join(root,'dist'),{recursive:true});
await writeFile(join(root,'dist/index.html'),output);
console.log('Built dist/index.html — self-contained, offline playable, no external requests.');
