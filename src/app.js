import { LEVELS, MATERIALS, WIDTH, HEIGHT, makeItem, ends, supportedItems, Simulation } from './engine.js';
import { Renderer } from './render.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game'),renderer=new Renderer(canvas);
const STORAGE='hamster-workshop-v1';
let saved={designs:{},progress:{},lastLevel:0,sound:false};
try{const v=JSON.parse(localStorage.getItem(STORAGE));if(v&&typeof v==='object')saved={...saved,...v};}catch{}
saved.designs=saved.designs&&typeof saved.designs==='object'?saved.designs:{};
saved.progress=saved.progress&&typeof saved.progress==='object'?saved.progress:{};
const state={levelIndex:0,level:LEVELS[0],items:[],selected:null,sim:null,mode:'build',ghost:null};
let history=[],drag=null,armed=null,toastTimer,audio=null,lastTime=0,petCooldown=0;
function persist(){try{saved.designs[state.levelIndex]=state.items;saved.lastLevel=state.levelIndex;localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{}}
function remember(){history.push(structuredClone(state.items));if(history.length>35)history.shift();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function sound(type){
  if(!saved.sound)return;
  try{
    audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();
    const notes=type==='win'?[523,659,784,1047]:type==='seed'?[880,1175]:type==='bounce'?[260,520]:type==='pet'?[660,780]:type==='fail'?[330,262]:[440];
    notes.forEach((freq,i)=>{const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.11;osc.type='sine';osc.frequency.setValueAtTime(freq,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.19);osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.21);});
  }catch{}
}
function cleanItems(raw,level){
  if(!Array.isArray(raw))return [];
  const counts={board:0,tube:0,spring:0};
  return raw.filter(o=>o&&MATERIALS[o.type]&&Number.isFinite(o.x)&&Number.isFinite(o.y)&&Number.isFinite(o.angle)&&Number.isFinite(o.power)&&++counts[o.type]<=level.inventory[o.type]).map((o,i)=>({...o,id:i+1,x:Math.max(30,Math.min(1170,o.x)),y:Math.max(180,Math.min(540,o.y)),angle:Math.max(o.type==='spring'?30:-35,Math.min(o.type==='spring'?75:35,o.angle)),power:Math.max(420,Math.min(660,o.power))}));
}
function loadLevel(index){
  if(state.level)persist();
  index=Math.max(0,Math.min(5,index));
  state.levelIndex=index;state.level=LEVELS[index];state.items=cleanItems(saved.designs[index],state.level);state.selected=null;state.mode='build';state.sim=null;state.ghost=null;armed=null;drag=null;history=[];
  $('#result').hidden=true;$('#level-number').textContent=String(index+1).padStart(2,'0');$('#level-title').textContent=state.level.name;$('#level-theme').textContent=state.level.theme;$('#chapter-count').textContent=`${String(index+1).padStart(2,'0')} / 06`;$('#mission-text').textContent=state.level.mission;$('#difficulty-dots').textContent=Array.from({length:5},(_,i)=>i<state.level.difficulty?'●':'○').join(' ');
  setStatus('从下方拿起材料，给小团子搭一条路吧');updateUI();persist();
}
function setStatus(message){$('#status-text').textContent=message;}
function updateUI(){
  const editing=state.mode==='build';
  const item=state.items.find(o=>o.id===state.selected);
  const modeLabels={build:'搭建时间',running:'冒险进行中',paused:'休息一下',won:'抵达小屋',failed:'再试一次'};
  $('#mode-badge').innerHTML=`<i></i> ${modeLabels[state.mode]}`;
  $('#run').innerHTML=state.mode==='running'?'Ⅱ <span>暂停试跑</span>':state.mode==='paused'?'▶ <span>继续前进</span>':'▶ <span>出发试跑</span>';
  $('#run').disabled=state.mode==='failed'||state.mode==='won';
  $('#undo').disabled=!editing||!history.length;$('#reset').disabled=!editing||!state.items.length;
  $('#seed-count').innerHTML=`◈ <b>${state.sim?.collected.size||0}</b> / 3`;
  $$('.material').forEach(button=>{const type=button.dataset.type,left=state.level.inventory[type]-state.items.filter(o=>o.type===type).length;button.querySelector('.inventory').textContent=`× ${left}`;button.disabled=!editing||left<=0;button.classList.toggle('active',armed===type);button.setAttribute('aria-label',`${MATERIALS[type].name}，剩余${left}个。拖动到场景，或点击后在场景中放置。`);});
  $('#inspector-empty').hidden=!!item;$('#inspector').hidden=!item;$('#selection-tag').textContent=item?'已选中':'未选中';
  if(item){
    $('#selected-name').textContent=`${item.type==='board'?'▰':item.type==='tube'?'◉':'↟'} ${MATERIALS[item.type].name}`;
    const spring=item.type==='spring';$('#angle-label').childNodes[0].textContent=spring?'起跳角度 ':'倾斜角度 ';
    $('#angle').min=spring?30:-35;$('#angle').max=spring?75:35;$('#angle').value=item.angle;$('#angle-value').textContent=`${item.angle}°`;
    $('#power-control').hidden=!spring;$('#power').value=item.power;$('#power-value').textContent=item.power;
    const supported=supportedItems(state.level,state.items).has(item.id);
    $('#support-status').textContent=supported?'● 支撑稳固，可以开工':'○ 还没有支撑，请把两端搭到平台上';$('#support-status').style.color=supported?'#829565':'#bd8869';
    for(const s of ['#angle','#power','#remove'])$(s).disabled=!editing;
  }
}
function point(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width*WIDTH,y:(event.clientY-r.top)/r.height*HEIGHT,inside:event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom};}
function snap(item){
  item.x=Math.round(Math.max(MATERIALS[item.type].length/2,Math.min(WIDTH-MATERIALS[item.type].length/2,item.x))/5)*5;
  item.y=Math.round(Math.max(185,Math.min(530,item.y))/5)*5;
  const anchors=[...state.level.platforms.map(p=>({x:p.x,w:p.w,y:p.y})),...state.items.filter(o=>o.id!==item.id&&o.type!=='spring').map(o=>({x:o.x-MATERIALS[o.type].length/2,w:MATERIALS[o.type].length,y:o.y}))];
  const close=anchors.filter(p=>item.x+MATERIALS[item.type].length/2>=p.x&&item.x-MATERIALS[item.type].length/2<=p.x+p.w&&Math.abs(item.y-p.y)<19).sort((a,b)=>Math.abs(a.y-item.y)-Math.abs(b.y-item.y));
  if(item.type!=='spring'){
    const e=ends(item),targets=e.map(pt=>anchors.filter(p=>pt.x>=p.x-1&&pt.x<=p.x+p.w+1).map(p=>p.y-(pt.y-item.y)).sort((a,b)=>Math.abs(a-item.y)-Math.abs(b-item.y))[0]);
    if(targets.every(Number.isFinite)&&Math.abs(targets[0]-targets[1])<=32&&Math.abs((targets[0]+targets[1])/2-item.y)<20){item.y=(targets[0]+targets[1])/2;return item;}
  }
  if(close.length)item.y=close[0].y;
  return item;
}
function hitItem(p){return [...state.items].reverse().find(o=>{const a=-(o.type==='spring'?0:o.angle)*Math.PI/180,dx=p.x-o.x,dy=p.y-o.y,xx=dx*Math.cos(a)-dy*Math.sin(a),yy=dx*Math.sin(a)+dy*Math.cos(a);return Math.abs(xx)<MATERIALS[o.type].length/2+10&&yy<(o.type==='board'?20:18)&&yy>(o.type==='tube'?-58:o.type==='spring'?-55:-28);});}
function addItem(type,p){
  if(state.items.filter(o=>o.type===type).length>=state.level.inventory[type])return;
  remember();const item=snap(makeItem(type,p.x,p.y));state.items.push(item);state.selected=item.id;armed=null;state.ghost=null;sound('place');persist();updateUI();
  if(!supportedItems(state.level,state.items).has(item.id))toast('虚线表示还没搭稳：把两端搭上平台，或调整角度');
  else setStatus('搭得稳稳的。还可以点选材料，调整角度和位置');
}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||state.mode!=='build')return;const p=point(e);canvas.focus({preventScroll:true});
  if(armed){addItem(armed,p);return;}
  const item=hitItem(p);
  if(item){remember();state.selected=item.id;drag={kind:'item',id:item.id,dx:p.x-item.x,dy:p.y-item.y,startX:e.clientX,startY:e.clientY,moved:false,original:structuredClone(item)};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';}
  else {state.selected=null;if(Math.hypot(p.x-(state.sim?.hamster.x??state.level.start.x),p.y-(state.sim?.hamster.y??state.level.start.y)+20)<55)pet();}
  updateUI();
});
$$('.material').forEach(button=>button.addEventListener('pointerdown',e=>{
  if(button.disabled||e.button!==0)return;e.preventDefault();
  drag={kind:'tool',type:button.dataset.type,startX:e.clientX,startY:e.clientY,moved:false};button.setPointerCapture(e.pointerId);
}));
$$('.material').forEach(button=>button.addEventListener('click',e=>{if(e.detail===0&&!button.disabled){armed=button.dataset.type;toast(`已拿起${MATERIALS[armed].name}，点击场景放置`);updateUI();}}));
window.addEventListener('pointermove',e=>{
  const p=point(e);
  if(drag){
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;
    if(drag.kind==='item'){
      const item=state.items.find(o=>o.id===drag.id);if(item){item.x=p.x-drag.dx;item.y=p.y-drag.dy;snap(item);updateUI();}
    }else if(drag.moved){
      state.ghost=p.inside?snap(makeItem(drag.type,p.x,p.y,'ghost')):null;
      let ghost=$('.dragging-tool');if(!ghost){ghost=document.createElement('div');ghost.className='dragging-tool';document.body.append(ghost);}ghost.textContent={board:'▰',tube:'◉',spring:'↟'}[drag.type];ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';ghost.hidden=p.inside;
    }
  }else if(armed&&state.mode==='build'){state.ghost=p.inside?snap(makeItem(armed,p.x,p.y,'ghost')):null;}
});
window.addEventListener('pointerup',e=>{
  if(!drag)return;const p=point(e),d=drag;drag=null;$('.dragging-tool')?.remove();state.ghost=null;canvas.style.cursor='grab';
  if(d.kind==='tool'){
    if(d.moved&&p.inside)addItem(d.type,p);
    else {armed=d.type;toast(`已拿起${MATERIALS[d.type].name}，点击场景放置`);updateUI();}
  }else{
    if(!d.moved)history.pop();persist();updateUI();
  }
});
window.addEventListener('pointercancel',()=>{if(drag?.kind==='item'){const i=state.items.findIndex(o=>o.id===drag.id);if(i>=0)state.items[i]=drag.original;history.pop();}drag=null;state.ghost=null;$('.dragging-tool')?.remove();updateUI();});
for(const [selector,key]of [['#angle','angle'],['#power','power']]){
  $(selector).addEventListener('pointerdown',()=>{if(state.mode==='build')remember();});
  $(selector).addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')&&state.mode==='build')remember();});
  $(selector).addEventListener('input',e=>{if(state.mode!=='build')return;const o=state.items.find(o=>o.id===state.selected);if(o){o[key]=Number(e.target.value);persist();updateUI();}});
}
function removeSelected(){if(state.mode!=='build')return;const i=state.items.findIndex(o=>o.id===state.selected);if(i<0)return;remember();state.items.splice(i,1);state.selected=null;persist();updateUI();sound('place');}
$('#remove').onclick=removeSelected;
function undo(){if(state.mode!=='build'||!history.length)return;state.items=history.pop();state.selected=null;persist();updateUI();toast('已撤销上一步');}
$('#undo').onclick=undo;
$('#reset').onclick=()=>showModal(`<p class="eyebrow">A FRESH LITTLE START</p><h2>重新搭一条路？</h2><p>本关材料会全部回到工具箱。其他关卡和已获得的瓜子记录会保留，也可以用撤销找回这次搭建。</p><button class="primary" id="confirm-reset">好，重新搭建</button>`,()=>{$('#confirm-reset').onclick=()=>{remember();state.items=[];state.selected=null;armed=null;persist();updateUI();$('#modal').close();};});
function run(){
  if(state.mode==='running'){state.mode='paused';setStatus('小团子休息中。继续前进，或返回搭建调整路线');updateUI();addReturnButton();return;}
  if(state.mode==='paused'){state.mode='running';setStatus('跟着小团子，看看这条路线怎么样');updateUI();removeReturnButton();return;}
  if(state.mode!=='build')return;
  armed=null;state.ghost=null;drag=null;state.selected=null;state.sim=new Simulation(state.level,state.items);state.mode='running';setStatus('跟着小团子，看看这条路线怎么样');updateUI();sound('place');
  const supports=supportedItems(state.level,state.items);if(state.items.some(o=>!supports.has(o.id)))toast('有材料还悬在空中，试跑时不会承重哦');
}
$('#run').onclick=run;
function addReturnButton(){if($('#back-to-build'))return;const b=document.createElement('button');b.id='back-to-build';b.className='secondary small';b.textContent='返回搭建';b.onclick=backToBuild;$('.transport-actions').prepend(b);}
function removeReturnButton(){$('#back-to-build')?.remove();}
function backToBuild(){state.mode='build';state.sim=null;$('#result').hidden=true;removeReturnButton();setStatus('好点子来自再试一次。调整一下，继续出发吧');updateUI();}
function finish(){
  state.mode=state.sim.state;const won=state.mode==='won',count=state.sim.collected.size;
  if(won){const old=saved.progress[state.levelIndex]||{seeds:0};saved.progress[state.levelIndex]={completed:true,seeds:Math.max(old.seeds||0,count)};persist();renderer.particle('win',state.level.exit.x-30,state.level.exit.y-80);sound('win');}
  else sound('fail');
  const result=$('#result');result.hidden=false;
  result.innerHTML=`<div class="result-card"><div class="result-emoji">${won?'🐹':'🌿'}</div><h2>${won?(state.levelIndex===5?'小小工程师，毕业啦！':'到家啦，开动！'):'软着陆，再想一想'}</h2>${won?`<div class="result-stars">${'✦'.repeat(count)}<span style="color:#ded5bc">${'✧'.repeat(3-count)}</span></div>`:''}<p>${won?`小团子安全抵达，带回了 ${count} 颗瓜子。<br>${count===3?'每一颗小心思，都有甜甜的回报。':'成功过关！也可以改进路线，收集更多瓜子。'}`:state.sim.reason}</p><div class="result-buttons"><button class="secondary" id="edit-again">${won?'再搭一条路':'返回搭建'}</button>${won?`<button class="primary" id="next-level">${state.levelIndex<5?'下一次冒险 →':'回顾冒险地图'}</button>`:''}</div></div>`;
  $('#edit-again').onclick=backToBuild;
  if(won)$('#next-level').onclick=()=>{if(state.levelIndex<5)loadLevel(state.levelIndex+1);else showLevels();};
  setStatus(won?'小团子吃到了点心，谢谢你的小巧思！':'路线还可以再完善一点，小团子等你一起再试');updateUI();
}
function showModal(html,bind){if(state.mode==='running'){state.mode='paused';updateUI();addReturnButton();}$('#modal-content').innerHTML=html;$('#modal').showModal();bind?.();}
$('#close-modal').onclick=()=>$('#modal').close();
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}});
function showHelp(){showModal(`<p class="eyebrow">WELCOME TO THE WORKSHOP</p><h2>小小工程师，欢迎开工 🐹</h2><p>帮小团子从左侧出发，抵达右侧的点心小屋。没有倒计时，失败也不会扣掉任何材料。</p><div class="help-steps"><div class="help-step"><b>1</b><div><strong>拿材料，搭路线</strong><p>拖动工具箱里的材料到场景；也可以先点击材料，再点击场景放置。木板和纸筒的两端都要搭上平台，悬空的材料不能承重。</p></div></div><div class="help-step"><b>2</b><div><strong>小调整，大作用</strong><p>点击材料，在工作台调整倾角。弹簧可以调方向和力度，需要放在平台或稳固的桥上。材料能随时收回，不必全部用完。</p></div></div><div class="help-step"><b>3</b><div><strong>试跑，观察，再改善</strong><p>小团子会自动向右走。空格可以试跑或暂停，暂停后可返回搭建。瓜子是额外挑战，安全到家就能过关。</p></div></div></div><p style="font-size:11px">小技巧：绿色端点 = 支撑稳固 · 橙色虚线 = 还没搭稳<br>Delete 收回选中材料 · Ctrl / ⌘ + Z 撤销 · 进度自动保存在当前浏览器</p><button id="got-it" class="primary">明白啦，开工！</button>`,()=>{$('#got-it').onclick=()=>$('#modal').close();});}
$('#help').onclick=showHelp;
function showLevels(){showModal(`<p class="eyebrow">SIX CAGES, A LITTLE WORLD</p><h2>小团子的冒险地图</h2><p>由一座小桥开始，慢慢成为小小工程师。每关都能用三种材料，也可以自由选择关卡练习。</p><div class="level-grid">${LEVELS.map((l,i)=>{const p=saved.progress[i];return `<button class="level-tile ${i===state.levelIndex?'current':''}" data-level="${i}"><span class="number">${String(i+1).padStart(2,'0')}</span><strong>${l.name}</strong><small>${p?.completed?'✓ 已通关 · '+p.seeds+'/3 瓜子':'●'.repeat(l.difficulty)+' · '+(i===0?'轻松上手':'动动脑筋')}</small></button>`;}).join('')}</div>`,()=>$$('[data-level]').forEach(b=>b.onclick=()=>{removeReturnButton();loadLevel(Number(b.dataset.level));$('#modal').close();}));}
$('#levels').onclick=showLevels;
$('#hint').onclick=()=>showModal(`<p class="eyebrow">A LITTLE INSPIRATION</p><h2>施工灵感 · ${state.level.name}</h2><p style="padding:18px;background:#f1eddd;border-radius:14px">💡 ${state.level.hint}</p><p>提示只是一种思路。你也可以搭一条自己的路线。</p><button id="hint-close" class="primary">我再想想</button>`,()=>{$('#hint-close').onclick=()=>$('#modal').close();});
function pet(){if(performance.now()<petCooldown)return;petCooldown=performance.now()+700;renderer.petUntil=renderer.time+2;const h=state.sim?.hamster||state.level.start;renderer.particle('heart',h.x,h.y-50);sound('pet');toast(['小团子：搭桥辛苦啦，分你一颗瓜子 ♡','小团子蹭了蹭你的手指 ♡','小团子：我准备好去探险啦！'][Math.floor(Math.random()*3)]);}
$('#pet').onclick=pet;
$('#sound').onclick=()=>{saved.sound=!saved.sound;$('#sound').querySelector('.sound-off').hidden=saved.sound;$('#sound').setAttribute('aria-label',saved.sound?'关闭音效':'开启音效');$('#sound').title=saved.sound?'关闭音效':'开启音效';persist();if(saved.sound)sound('seed');toast(saved.sound?'轻轻的音效，已开启':'音效已关闭');};
$('#sound').querySelector('.sound-off').hidden=saved.sound;
document.addEventListener('keydown',e=>{
  if($('#modal').open||['INPUT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName))return;
  if(e.code==='Space'){e.preventDefault();run();}
  else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected();}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();}
  else if(e.key==='Escape'){armed=null;state.ghost=null;state.selected=null;updateUI();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.mode==='running'){state.mode='paused';updateUI();addReturnButton();setStatus('已帮小团子暂停。回来后点击继续就好');}});
new ResizeObserver(()=>renderer.resize()).observe(canvas);
let accumulator=0;
function frame(time){
  const dt=Math.min((time-lastTime)/1000||0,.05);lastTime=time;
  if(state.mode==='running'&&state.sim){accumulator+=dt;while(accumulator>=1/120&&state.mode==='running'){state.sim.step(1/120);accumulator-=1/120;for(const event of state.sim.events.splice(0)){if(event.type==='seed'||event.type==='bounce'){sound(event.type);renderer.particle(event.type,event.x,event.y);updateUI();}}if(state.sim.state!=='running')finish();}}
  else accumulator=0;
  renderer.draw(state,dt);requestAnimationFrame(frame);
}
const initial=Number.isInteger(saved.lastLevel)?saved.lastLevel:0;
// Avoid persisting an empty first-level design over the restored save on boot.
state.level=null;loadLevel(initial);requestAnimationFrame(frame);
