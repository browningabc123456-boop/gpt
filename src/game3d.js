import * as T from 'three';
import {CagePhysics} from './physics3d.js';
import {CageView} from './world3d.js';
import {LEVELS3D,canUnlock,CATALOG,WORLD_TO_CM} from './levels3d.js';
import {screenDirection,findWalkingPath} from './navigation.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const STORE='tuanzi-pet-paradise-v2';
let saved={progress:{},layouts:{},last:0,sound:false,stability:true};
try{
 const value=JSON.parse(localStorage.getItem(STORE));
 if(value&&typeof value==='object')saved={...saved,...value};
 else{const previous=JSON.parse(localStorage.getItem('tuanzi-real-3d-v1'));if(previous)saved.progress=previous.progress||{};}
}catch{}
for(const key of ['progress','layouts'])if(!saved[key]||typeof saved[key]!=='object')saved[key]={};
let physics,view,index=0,mode='build',selected=null,drag=null,playPointer=null;
let toastTimer,saveTimer,petUntil=0,audio=null,wonHandled=false,controlBasis=null,path=[],pathStuck=0;
const keys=new Set(),joystick={x:0,y:0},lastDirection=new T.Vector3(0,0,-1);
const ray=new T.Raycaster(),mouse=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0));
const canvas=$('#world');
function persist(){try{localStorage.setItem(STORE,JSON.stringify(saved));}catch{}}
function saveLayout(){if(!physics)return;saved.layouts[index]={version:2,objects:physics.serializeObjects()};saved.last=index;persist();}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(saveLayout,1600);}
function restoreLayout(){const layout=saved.layouts[index];if(layout?.version===2)physics.restoreObjects(layout.objects);}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3700);}
function sound(type){
 if(!saved.sound)return;
 try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const notes=type==='win'?[523,659,784,1047]:type==='jump'?[390,550]:type==='pet'?[660,784]:[440,520];
 notes.forEach((f,i)=>{const o=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.10;o.frequency.setValueAtTime(f,t);gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.035,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(gain);gain.connect(audio.destination);o.start(t);o.stop(t+.19);});}catch{}
}
function clearPath(){path=[];pathStuck=0;view?.setPath([]);}
function loadLevel(next,reset=false){
 if(!canUnlock(next))return false;
 if(drag)endDrag();if(physics)saveLayout();if(reset)delete saved.layouts[next];index=next;clearTimeout(saveTimer);keys.clear();joystick.x=joystick.y=0;controlBasis=null;
 physics=new CagePhysics(index);restoreLayout();physics.setStability(saved.stability!==false);view.load(physics);selected=null;wonHandled=false;path=[];pathStuck=0;
 $('#win-layer').hidden=true;$('#level-number').textContent=String(index+1).padStart(2,'0');$('#level-name').textContent=physics.level.name;$('#level-tag').textContent=physics.level.tag;$('#scene-theme').textContent=physics.level.subtitle;
 $('#mission').textContent=physics.level.story;$('#difficulty').textContent=Array.from({length:5},(_,i)=>i<physics.level.difficulty?'●':'○').join(' ');$('#map-progress').textContent='6 座 · 全部开放';
 $('#stability').checked=physics.stabilityEnabled;$('#hamster-portrait').src=view.portrait();document.documentElement.style.setProperty('--green',physics.level.color);$('#camera-follow').classList.remove('active');
 setMode('build');updateJourney();updateCount();saved.last=index;persist();return true;
}
function updateJourney(){
 $('#journey-dots').innerHTML=LEVELS3D.map((l,i)=>`<button title="${l.name}" aria-label="${l.name}" data-journey="${i}" class="${i===index?'current':saved.progress[i]?.completed?'complete':''}">${saved.progress[i]?.completed?'✓':i+1}</button>`).join('');
 $$('[data-journey]').forEach(b=>b.onclick=()=>loadLevel(Number(b.dataset.journey)));
}
function updateCount(){$('#object-count').textContent=`${physics.objects.length} / 60 件`;}
function setMode(next){
 if(drag)endDrag();mode=next;keys.clear();joystick.x=joystick.y=0;controlBasis=null;clearPath();$('#joystick-thumb').style.transform='';
 $('#build-mode').classList.toggle('active',mode==='build');$('#play-mode').classList.toggle('active',mode==='play');$('#mode-indicator').textContent=mode==='build'?'✦ 自由造景':'🐾 陪团子去冒险';$('#viewport').classList.toggle('mobile-playing',mode==='play');
 $('#strip-title').textContent=mode==='build'?'小小百宝箱，无限小创意':'点哪里，团子就去哪里';
 $('#strip-copy').textContent=mode==='build'?'点击「添加物品」拿新零件。拖动堆叠，放稳后自动固定；也可以关闭稳固搭建。':'点击地面自动绕开障碍；也可 WASD 移动，Shift 慢走，空格跳跃，E 上下攀爬。';
 $('#scene-instruction').innerHTML=mode==='build'?'<span>↔</span> 拖物件搭建 · 拖空白处转视角':'<span>🐾</span> 点击地面走过去 · Shift 精细慢走';canvas.style.cursor=mode==='build'?'grab':'crosshair';updateInspector();
}
function select(body){selected=body;view.setSelected(body);updateInspector();}
const icons={crate:'▧',plank:'▰',tube:'◉',ramp:'◩',stool:'⌑',cushion:'▱',block:'▣'};
function updateInspector(){
 $('#empty-inspector').hidden=!!selected;$('#object-inspector').hidden=!selected;$('#selected-badge').textContent=selected?(mode==='build'?'自由编辑':'切回搭建可调整'):'未选中物件';
 if(!selected)return;$('#selected-name').textContent=selected.meta.name;$('#object-icon').textContent=icons[selected.meta.kind];$('#selected-size').textContent=selected.meta.size.map(n=>+(n*WORLD_TO_CM).toFixed(1)).join(' × ')+' cm';
 $('#object-status').textContent=drag?'✦ 拿起了 · 拖到支点上方堆叠':selected.anchored?'✓ 已放稳固定 · 拖动可重新摆放':physics.stabilityEnabled?'● 正在落稳 · 随后会自动固定':'○ 自由重力 · 放稳底座再堆叠';
 for(const id of ['rotate-left','rotate-right','tilt-left','tilt-right','restore-object','duplicate-object','remove-object'])$('#'+id).disabled=mode!=='build';
}
function setRay(e){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,view.camera);}
function pick(e){setRay(e);return ray.intersectObjects(view.pickables,false)[0]?.object.userData.body||null;}
function walkToClick(e){
 setRay(e);const hit=ray.intersectObjects(view.supportMeshes,false).find(h=>h.object.visible&&h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.48);
 if(!hit){toast('点一下笼子里的地面或能落脚的平台吧');return;}
 const result=findWalkingPath(physics,physics.hamster.position,hit.point);
 if(!result.path.length){clearPath();toast(result.reason==='height'?'这处有高低差，先走到旁边，再跳跃或按 E 攀爬':'这条路被挡住了，可以搬开物品，或换一个落脚点');return;}
 path=result.path;pathStuck=0;controlBasis=null;view.setPath(path);canvas.focus({preventScroll:true});
}
canvas.addEventListener('pointerdown',e=>{
 if(!view||$('#modal').open||wonHandled||e.button!==0||!e.isPrimary)return;
 if(mode==='play'){playPointer={id:e.pointerId,x:e.clientX,y:e.clientY};return;}
 const body=pick(e);if(!body){select(null);return;}
 e.preventDefault();e.stopImmediatePropagation();canvas.focus({preventScroll:true});select(body);view.controls.enabled=false;
 plane.constant=-body.position.y;const point=new T.Vector3();ray.ray.intersectPlane(plane,point);
 drag={body,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false,offset:new T.Vector3(body.position.x-point.x,0,body.position.z-point.z),original:body.position.clone()};physics.beginDrag(body);canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';updateInspector();
},true);
canvas.addEventListener('pointermove',e=>{
 if(!view||mode!=='build')return;
 if(drag){e.preventDefault();e.stopImmediatePropagation();if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)drag.moved=true;
  if(drag.moved){setRay(e);const point=new T.Vector3();if(ray.ray.intersectPlane(plane,point))physics.moveDragged(point.x+drag.offset.x,point.z+drag.offset.z);}
 }else{const body=pick(e);if(body){const r=canvas.getBoundingClientRect();$('#object-label').textContent=body.meta.name+' · 拖动摆放';$('#object-label').style.left=Math.min(r.width-130,e.clientX-r.left+14)+'px';$('#object-label').style.top=Math.max(8,e.clientY-r.top-36)+'px';$('#object-label').hidden=false;}else $('#object-label').hidden=true;}
},true);
function endDrag(cancel=false){
 if(!drag)return;const d=drag;if(cancel)d.body.position.copy(d.original);physics.endDrag();drag=null;view.controls.enabled=true;canvas.style.cursor=mode==='build'?'grab':'crosshair';$('#object-label').hidden=true;updateInspector();scheduleSave();
 if(d.moved&&!cancel){sound('place');toast(physics.stabilityEnabled?'放好啦，落稳后会自动固定。拖走底座时，上面的物件仍会下落哦':'放好啦，看看重心是不是留在支点上');}
}
canvas.addEventListener('pointerup',e=>{if(drag)endDrag();else if(playPointer?.id===e.pointerId&&mode==='play'&&Math.hypot(e.clientX-playPointer.x,e.clientY-playPointer.y)<6)walkToClick(e);playPointer=null;},true);
canvas.addEventListener('pointercancel',()=>{endDrag(true);playPointer=null;},true);canvas.addEventListener('lostpointercapture',()=>endDrag(),true);canvas.addEventListener('pointerleave',()=>{$('#object-label').hidden=true;});
function rotate(angle,tilt=false){
 if(!selected||mode!=='build')return;physics.rotateObject(selected,angle,tilt);selected.updateAABB();const bottom=selected.position.y-selected.aabb.lowerBound.y;selected.position.y=Math.max(selected.position.y,physics.supportBelow(selected.position.x,selected.position.z,selected)+bottom+.012);selected.aabbNeedsUpdate=true;scheduleSave();sound('place');
}
$('#build-mode').onclick=()=>{setMode('build');canvas.focus({preventScroll:true});};
$('#play-mode').onclick=()=>{
 setMode('play');view.follow=true;const direction=view.camera.position.clone().sub(view.controls.target).normalize(),distance=Math.min(15,view.camera.position.distanceTo(view.controls.target));view.controls.target.set(physics.hamster.position.x,Math.max(.5,physics.hamster.position.y),physics.hamster.position.z);view.camera.position.copy(view.controls.target).addScaledVector(direction,distance);$('#camera-follow').classList.add('active');canvas.focus({preventScroll:true});toast('点一下地面试试，团子会自己走过去。WASD 也可以，Shift 轻轻走');
};
$('#rotate-left').onclick=()=>rotate(-Math.PI/2);$('#rotate-right').onclick=()=>rotate(Math.PI/2);$('#tilt-left').onclick=()=>rotate(Math.PI/12,true);$('#tilt-right').onclick=()=>rotate(-Math.PI/12,true);
$('#restore-object').onclick=()=>{if(!selected||mode!=='build')return;physics.beginDrag(selected);selected.quaternion.setFromEuler(0,selected.meta.yaw||0,0);physics.moveDragged(selected.meta.position[0],selected.meta.position[2]);physics.endDrag();scheduleSave();toast('这件物品回到原来的位置啦');};
function focusPet(){view.focusHamster();$('#camera-follow').classList.add('active');petUntil=performance.now()+1700;toast('奶油团子：今天也要一起去冒险呀 ♡');}
$('#pet-profile').onclick=focusPet;$('#camera-pet').onclick=focusPet;
$('#camera-reset').onclick=()=>{view.resetCamera();$('#camera-follow').classList.remove('active');controlBasis=null;};$('#camera-top').onclick=()=>{view.resetCamera(true);$('#camera-follow').classList.remove('active');controlBasis=null;};
$('#camera-follow').onclick=()=>{view.follow=!view.follow;$('#camera-follow').classList.toggle('active',view.follow);toast(view.follow?'视角会跟随团子，方向仍按你按下按键时的视角来判断':'已切回自由视角');};
$('#respawn').onclick=()=>{physics.respawn();keys.clear();controlBasis=null;joystick.x=joystick.y=0;clearPath();toast('团子回窝了，搭好的世界还在');};
$('#reset').onclick=()=>showModal('<p class="eyebrow">A FRESH LITTLE START</p><h2>重新布置这个小世界？</h2><p>本关会恢复默认布置，其他主题的布置和通关记录会保留。</p><button id="confirm-reset" class="primary">重新布置</button>',()=>{$('#confirm-reset').onclick=()=>{loadLevel(index,true);$('#modal').close();};});
$('#stability').onchange=e=>{saved.stability=e.target.checked;physics.setStability(saved.stability);persist();updateInspector();toast(saved.stability?'稳固搭建已开启：物件落稳后会固定':'自由重力已开启：所有可搬物件都能自然移动');};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.game-shell').requestFullscreen();}catch{toast('此窗口不能全屏，可以在独立浏览器页面里放大');}};
document.addEventListener('fullscreenchange',()=>{$('.game-shell').classList.toggle('fullscreen',!!document.fullscreenElement);setTimeout(()=>view.resize(),80);});
function addItem(key){
 const body=physics.addFromCatalog(key);if(!body){toast('小世界里最多放 60 件物品，先收回几件再添加吧');return;}
 setMode('build');view.objectMesh(body);select(body);updateCount();scheduleSave();sound('place');toast(`添加了${body.meta.name}，拖动它放到喜欢的地方吧`);
}
function showCatalog(){
 showModal(`<p class="eyebrow">LITTLE TREASURES, BIG IDEAS</p><div class="catalog-intro"><h2>团子的百宝箱 🧺</h2><span>${physics.objects.length} / 60 件物品</span></div><p>随心添加，不需要金币。所有零件都能搬动、旋转、堆叠。</p><div class="catalog-grid">${CATALOG.map(c=>`<button class="catalog-item" data-add="${c.key}"><b>＋</b><span class="catalog-icon">${c.icon}</span><strong>${c.label}</strong><small>${c.description}</small></button>`).join('')}</div><p class="catalog-tip">🐾 团子体长约 10 cm；尺寸按真实比例设计。开启「稳固搭建」，更容易把小创意搭得稳稳的。</p>`,()=>$$('[data-add]').forEach(b=>b.onclick=()=>{$('#modal').close();addItem(b.dataset.add);}));
}
$('#add-items').onclick=showCatalog;
$('#duplicate-object').onclick=()=>{if(!selected)return;const template=CATALOG.find(c=>c.kind===selected.meta.kind&&Math.abs(c.size[0]-selected.meta.size[0])<.1)||CATALOG.find(c=>c.kind===selected.meta.kind);if(template)addItem(template.key);};
$('#remove-object').onclick=()=>{if(!selected||mode!=='build')return;const body=selected;physics.removeObject(body);view.removeObjectMesh(body);select(null);updateCount();saveLayout();toast('已收回物品，随时能从百宝箱再拿一个');};
function movement(){
 const horizontal=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joystick.x;
 const vertical=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joystick.y;
 if(Math.hypot(horizontal,vertical)>.08){
  if(path.length)clearPath();if(!controlBasis){controlBasis=new T.Vector3();view.camera.getWorldDirection(controlBasis);controlBasis.y=0;controlBasis.normalize();}
  const d=screenDirection(horizontal,vertical,controlBasis),slow=keys.has('ShiftLeft')||keys.has('ShiftRight')?.48:1,v=new T.Vector3(d.x*slow,0,d.z*slow);if(v.length()>.08)lastDirection.copy(v).normalize();return v;
 }
 controlBasis=null;
 if(path.length){
  const h=physics.hamster.position;let d=Math.hypot(path[0].x-h.x,path[0].z-h.z);
  while(path.length&&d<.13){path.shift();view.setPath(path);if(path.length)d=Math.hypot(path[0].x-h.x,path[0].z-h.z);}
  if(path.length){const v=new T.Vector3(path[0].x-h.x,0,path[0].z-h.z).normalize();lastDirection.copy(v);if(path.length===1)v.multiplyScalar(Math.min(1,Math.max(.3,d/.4)));return v;}
 }
 return new T.Vector3();
}
function jump(){if(mode!=='play'||wonHandled)return;clearPath();if(physics.jump())sound('jump');}
function climb(){if(mode!=='play'||wonHandled)return;clearPath();const moving=movement();if(moving.length()<.1)lastDirection.set(Math.sin(view.hamster.root.rotation.y),0,Math.cos(view.hamster.root.rotation.y));if(!physics.tryClimb(lastDirection))toast('靠近并面向矮台阶再按 E；高处可以先加一个矮凳，或跳上去');else sound('jump');}
document.addEventListener('keydown',e=>{
 if(!physics||$('#modal').open||wonHandled||e.target.matches('input,textarea,select'))return;
 const moving=/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(e.code);
 if(moving){e.preventDefault();if(mode!=='play')setMode('play');keys.add(e.code);clearPath();}
 if(e.code==='ShiftLeft'||e.code==='ShiftRight')keys.add(e.code);
 if(e.code==='Space'&&!e.target.closest('button')){e.preventDefault();if(!e.repeat)jump();}
 if(e.code==='KeyE'&&!e.repeat){e.preventDefault();climb();}
 if(e.code==='KeyB'&&!e.repeat)setMode(mode==='build'?'play':'build');
 if(mode==='build'&&e.code==='KeyR'&&!e.repeat)rotate(Math.PI/2);
 if(e.code==='Escape'){clearPath();if(drag)endDrag(true);}
});
document.addEventListener('keyup',e=>{keys.delete(e.code);if(![...keys].some(k=>/^(Key[WASD]|Arrow)/.test(k))&&Math.hypot(joystick.x,joystick.y)<.08)controlBasis=null;});
window.addEventListener('blur',()=>{keys.clear();controlBasis=null;joystick.x=joystick.y=0;$('#joystick-thumb').style.transform='';clearPath();if(drag)endDrag(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();controlBasis=null;joystick.x=joystick.y=0;clearPath();saveLayout();}});
$('#joystick').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();$('#joystick').setPointerCapture(e.pointerId);clearPath();updateJoystick(e);});
function updateJoystick(e){const r=$('#joystick').getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/32,y=(e.clientY-r.top-r.height/2)/32,l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}joystick.x=x;joystick.y=y;$('#joystick-thumb').style.transform=`translate(${x*25}px,${y*25}px)`;}
$('#joystick').addEventListener('pointermove',e=>{if(e.buttons||$('#joystick').hasPointerCapture(e.pointerId))updateJoystick(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('#joystick').addEventListener(name,()=>{joystick.x=joystick.y=0;controlBasis=null;$('#joystick-thumb').style.transform='';});
$('#mobile-jump').addEventListener('pointerdown',e=>{e.preventDefault();jump();});$('#mobile-climb').addEventListener('pointerdown',e=>{e.preventDefault();climb();});
function showModal(html,bind){keys.clear();controlBasis=null;joystick.x=joystick.y=0;clearPath();if(drag)endDrag();$('#modal-content').innerHTML=html;$('#modal').showModal();bind?.();}
$('#modal-close').onclick=()=>$('#modal').close();
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}});
$('#help').onclick=()=>showModal(`<p class="eyebrow">WELCOME TO TUANZI’S PET PARADISE</p><h2>陪团子，慢慢玩 🐹</h2><p>六个主题全部开放。可以挑战翻出笼子，也可以用百宝箱布置你喜欢的小世界。</p><div class="help-grid"><div class="help-step"><span>🐾</span><strong>点哪里，团子就去哪</strong><p>先切到「操控团子」，点击地面，团子会绕开同一高度的障碍。高台需要先跳跃或攀爬。WASD 也能移动，按住时方向固定，松开快速停下；Shift 慢走。</p></div><div class="help-step"><span>🧺</span><strong>添加零件，自由搭建</strong><p>点击「添加物品」打开百宝箱。拿木箱、木板、纸筒、斜坡和软垫，拖到物件上方就能堆叠。点选后可以旋转、倾斜、复制和收回。</p></div><div class="help-step"><span>✓</span><strong>稳稳地放，慢慢地爬</strong><p>稳固搭建默认开启，落稳后会固定；拖走底座，上方仍会掉落。关闭后恢复自由重力。空格跳跃，E 上下攀爬，B 切换模式。手机使用摇杆。</p></div><div class="help-step"><span>♡</span><strong>靠近一点，看看团子</strong><p>拖空白处转动视角，滚轮缩放，右键平移。点击团子肖像或爱心按钮进入近景；归位按钮回到全景。通关与布置自动保存在当前浏览器。</p></div></div><button id="help-ok" class="primary">知道啦，一起去玩！</button>`,()=>{$('#help-ok').onclick=()=>$('#modal').close();});
function showMap(){showModal(`<p class="eyebrow">SIX LITTLE WORLDS · ALL OPEN</p><h2>今天想去哪里玩？</h2><p>全部主题都已开放，随时换一个小世界。每座笼子的布置会分别保存。</p><div class="level-grid">${LEVELS3D.map((l,i)=>`<button class="level-tile ${i===index?'current':''}" data-level="${i}" style="--tile-color:${l.color}"><span>${['☀','♧','❧','⚓','☾','✦'][i]}</span><strong>${l.name}</strong><small>${l.subtitle}</small><b>${saved.progress[i]?.completed?'✓ 已经逃出，继续布置':'自由探索 →'}</b></button>`).join('')}</div>`,()=>$$('[data-level]').forEach(b=>b.onclick=()=>{loadLevel(Number(b.dataset.level));$('#modal').close();}));}
$('#map').onclick=showMap;
$('#hint').onclick=()=>showModal(`<p class="eyebrow">A LITTLE INSPIRATION</p><h2>${physics.level.name} · 灵感</h2><div class="hint-box"><p>💡 ${physics.level.hint}</p></div><p>所有解法都欢迎。先布置得舒服，再陪团子慢慢去探险。</p><button id="hint-ok" class="primary">我再试试</button>`,()=>{$('#hint-ok').onclick=()=>$('#modal').close();});
$('#pet').onclick=()=>{petUntil=performance.now()+2000;view.burst(new T.Vector3(physics.hamster.position.x,physics.hamster.position.y+.5,physics.hamster.position.z),'#edb69b',10);toast('团子蹭了蹭你的手指：今天也最喜欢你啦 ♡');sound('pet');};
function updateSound(){$('#sound').classList.toggle('off',!saved.sound);$('#sound').setAttribute('aria-label',saved.sound?'关闭音效':'开启音效');}
$('#sound').onclick=()=>{saved.sound=!saved.sound;persist();updateSound();if(saved.sound)sound('pet');};updateSound();
function win(){
 wonHandled=true;keys.clear();clearPath();joystick.x=joystick.y=0;physics.hamster.velocity.setZero();saved.progress[index]={completed:true};saveLayout();updateJourney();sound('win');view.burst(view.hamster.root.position.clone().add(new T.Vector3(0,.6,0)),'#edc45e',50);
 const next=(index+1)%6;$('#win-layer').hidden=false;$('#win-layer').innerHTML=`<div class="win-card"><span>🐹</span><p class="eyebrow">SMALL PAWS, A BIG ADVENTURE</p><h2>小团子，成功出逃！</h2><p>外面的风，是新的味道。<br>继续布置这个世界，或者去${LEVELS3D[next].name}逛逛？</p><div class="win-actions"><button id="keep-exploring" class="secondary">继续玩这个世界</button><button id="next-cage" class="primary">换个主题 →</button></div></div>`;
 $('#keep-exploring').onclick=()=>{$('#win-layer').hidden=true;wonHandled=false;setMode('play');};$('#next-cage').onclick=()=>loadLevel(next);
}
let accumulator=0,lastTime=0,lastHeight=-1,lastInspector=0;
function frame(time){
 const dt=Math.max(0,Math.min(.075,(time-lastTime)/1000||0));lastTime=time;
 const active=mode==='play'&&!$('#modal').open&&!wonHandled,moving=active?movement():new T.Vector3();accumulator+=dt;
 while(accumulator>=1/120){physics.step(1/120,moving,active);accumulator-=1/120;}
 if(path.length&&active){if(Math.hypot(physics.hamster.velocity.x,physics.hamster.velocity.z)<.08)pathStuck+=dt;else pathStuck=0;if(pathStuck>1.4){clearPath();toast('前面有点挤，换一个落脚点，或先搬开物件吧');}}
 if(physics.fell){physics.fell=false;clearPath();toast('团子回到软软的小窝了，搭好的路线还在');}
 if(physics.won&&!wonHandled&&!physics.celebrated){physics.celebrated=true;win();}
 view.render(dt,mode==='play',time<petUntil);
 const height=Math.max(0,(physics.hamster.position.y-.265)*WORLD_TO_CM);if(Math.abs(height-lastHeight)>.3){lastHeight=height;$('#height-label').textContent=`离地 ${height.toFixed(0)} cm`;}
 if(selected&&time-lastInspector>400){lastInspector=time;updateInspector();}requestAnimationFrame(frame);
}
try{
 view=new CageView(canvas);let initial=Number.isInteger(saved.last)?saved.last:0;if(!canUnlock(initial))initial=0;loadLevel(initial);
 new ResizeObserver(()=>view.resize()).observe($('#viewport'));window.addEventListener('pagehide',saveLayout);
 requestAnimationFrame(t=>{view.render(0,false);$('#loading').hidden=true;lastTime=t;requestAnimationFrame(frame);});
}catch(error){$('#loading').classList.add('error');$('#loading').innerHTML='<span class="loading-hamster">🌿</span><h3>这个窗口还没有开启 3D 画面</h3><p>请使用开启了图形加速的 Chrome 或 Edge 浏览器，在独立页面打开游戏。</p>';console.error(error);}
export {physics,view,loadLevel,setMode};
