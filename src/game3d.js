import * as T from 'three';
import {CagePhysics} from './physics3d.js';
import {CageView} from './world3d.js';
import {LEVELS3D,canUnlock} from './levels3d.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const STORE='tuanzi-real-3d-v1';let saved={progress:{},layouts:{},last:0,sound:false};
try{const value=JSON.parse(localStorage.getItem(STORE));if(value&&typeof value==='object')saved={...saved,...value};}catch{}
for(const key of ['progress','layouts'])if(!saved[key]||typeof saved[key]!=='object')saved[key]={};
let physics,view,index=0,mode='build',selected=null,drag=null,toastTimer,saveTimer,petUntil=0,audio=null,wonHandled=false;
const keys=new Set(),joystick={x:0,y:0},lastDirection=new T.Vector3(0,0,-1),ray=new T.Raycaster(),mouse=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0));
const canvas=$('#world');
function persist(){try{localStorage.setItem(STORE,JSON.stringify(saved));}catch{}}
function saveLayout(){if(!physics)return;saved.layouts[index]=physics.objects.map(b=>({id:b.meta.id,p:b.position.toArray(),q:[b.quaternion.x,b.quaternion.y,b.quaternion.z,b.quaternion.w]}));saved.last=index;persist();}
function restoreLayout(){const layout=saved.layouts[index];if(!Array.isArray(layout))return;for(const item of layout){const body=physics.objects.find(b=>b.meta.id===item?.id);if(!body||!Array.isArray(item.p)||item.p.length!==3||!item.p.every(Number.isFinite)||!Array.isArray(item.q)||item.q.length!==4||!item.q.every(Number.isFinite))continue;if(Math.abs(item.p[0])>7||Math.abs(item.p[2])>5||item.p[1]<-.2||item.p[1]>7)continue;body.position.set(...item.p);body.quaternion.set(...item.q);body.quaternion.normalize();body.aabbNeedsUpdate=true;}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3700);}
function sound(type){if(!saved.sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const notes=type==='win'?[523,659,784,1047]:type==='jump'?[390,550]:type==='pet'?[660,784]:[330];notes.forEach((f,i)=>{const o=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.12;o.frequency.setValueAtTime(f,t);gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.045,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.19);o.connect(gain);gain.connect(audio.destination);o.start(t);o.stop(t+.21);});}catch{}}
function loadLevel(next,reset=false){
 if(!canUnlock(next,saved.progress)){toast('先帮小团子逃出前一座笼子吧');return false;}
 if(physics)saveLayout();if(reset)delete saved.layouts[next];index=next;clearTimeout(saveTimer);keys.clear();joystick.x=joystick.y=0;physics=new CagePhysics(index);restoreLayout();view.load(physics);selected=null;wonHandled=false;$('#win-layer').hidden=true;$('#level-number').textContent=String(index+1).padStart(2,'0');$('#level-name').textContent=physics.level.name;$('#level-tag').textContent=physics.level.tag;$('#scene-theme').textContent=`午后 · ${physics.level.name}`;$('#mission').textContent=physics.level.story;$('#difficulty').textContent=Array.from({length:5},(_,i)=>i<physics.level.difficulty?'●':'○').join(' ');$('#map-progress').textContent=`${String(index+1).padStart(2,'0')} / 06`;
 document.documentElement.style.setProperty('--green',physics.level.color);setMode('build');updateJourney();saved.last=index;persist();return true;
}
function updateJourney(){$('#journey-dots').innerHTML=LEVELS3D.map((l,i)=>`<button title="${l.name}${canUnlock(i,saved.progress)?'':' · 尚未解锁'}" aria-label="${l.name}" data-journey="${i}" class="${i===index?'current':saved.progress[i]?.completed?'complete':''}" ${canUnlock(i,saved.progress)?'':'disabled'}>${saved.progress[i]?.completed?'✓':i+1}</button>`).join('');$$('[data-journey]').forEach(b=>b.onclick=()=>loadLevel(Number(b.dataset.journey)));}
function setMode(next){
 if(drag)endDrag();mode=next;keys.clear();joystick.x=joystick.y=0;$('#joystick-thumb').style.transform='';
 $('#build-mode').classList.toggle('active',mode==='build');$('#play-mode').classList.toggle('active',mode==='play');$('#mode-indicator').textContent=mode==='build'?'✦ 搭建模式':'🐾 团子的冒险';$('#viewport').classList.toggle('mobile-playing',mode==='play');
 $('#strip-title').textContent=mode==='build'?'搭一条自己的路':'换你来当小团子';$('#strip-copy').textContent=mode==='build'?'拖动笼子里的木箱、纸筒与木板，放在彼此上面就能堆起来。':'WASD / 方向键移动，空格跳跃，靠近矮台阶按 E 攀爬。也可以随时切回搭建。';
 $('#scene-instruction').innerHTML=mode==='build'?'<span>↔</span> 拖动空白处转动视角 <i>·</i> 滚轮拉近看看':'<span>🐾</span> WASD 移动 <i>·</i> 空格跳跃 <i>·</i> E 攀爬';
 canvas.style.cursor=mode==='build'?'grab':'default';updateInspector();
}
function select(body){selected=body;view.setSelected(body);updateInspector();}
const icons={crate:'▧',plank:'▰',tube:'◉',ramp:'◩',stool:'⌑',cushion:'▱',block:'▣'};
function updateInspector(){
 $('#empty-inspector').hidden=!!selected;$('#object-inspector').hidden=!selected;$('#selected-badge').textContent=selected?(mode==='build'?'可自由摆放':'切回搭建可调整'):'未选中物件';
 if(!selected)return;$('#selected-name').textContent=selected.meta.name;$('#object-icon').textContent=icons[selected.meta.kind];$('#selected-size').textContent=selected.meta.size.map(n=>n.toFixed(1)).join(' × ')+' m';$('#object-status').textContent=drag?'✦ 搬运中 · 放到物件上方即可堆叠':'● 真实重力 · 观察支点与重心';
 for(const id of ['rotate-left','rotate-right','tilt-left','tilt-right','restore-object'])$('#'+id).disabled=mode!=='build';
}
function setRay(e){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,view.camera);}
function pick(e){setRay(e);const hit=ray.intersectObjects(view.pickables,false)[0];return hit?.object.userData.body||null;}
canvas.addEventListener('pointerdown',e=>{
 if(!view||$('#modal').open||wonHandled||e.button!==0||!e.isPrimary)return;
 if(mode!=='build')return;
 const body=pick(e);if(!body){select(null);return;}
 e.preventDefault();e.stopImmediatePropagation();canvas.focus({preventScroll:true});select(body);view.controls.enabled=false;
 plane.constant=-body.position.y;const point=new T.Vector3();ray.ray.intersectPlane(plane,point);
 drag={body,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false,offset:new T.Vector3(body.position.x-point.x,0,body.position.z-point.z),original:body.position.clone()};physics.beginDrag(body);canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';updateInspector();
},true);
canvas.addEventListener('pointermove',e=>{
 if(!view||mode!=='build')return;
 if(drag){
  e.preventDefault();e.stopImmediatePropagation();if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)drag.moved=true;
  if(drag.moved){setRay(e);const p=new T.Vector3();if(ray.ray.intersectPlane(plane,p))physics.moveDragged(p.x+drag.offset.x,p.z+drag.offset.z);}
 }else{
  const body=pick(e);canvas.style.cursor=body?'grab':'grab';if(body){const r=canvas.getBoundingClientRect();$('#object-label').textContent=body.meta.name+' · 可拖动';$('#object-label').style.left=Math.min(r.width-130,e.clientX-r.left+14)+'px';$('#object-label').style.top=Math.max(8,e.clientY-r.top-36)+'px';$('#object-label').hidden=false;}else $('#object-label').hidden=true;
 }
},true);
function endDrag(cancel=false){if(!drag)return;const d=drag;if(cancel)d.body.position.copy(d.original);physics.endDrag();drag=null;view.controls.enabled=true;canvas.style.cursor='grab';$('#object-label').hidden=true;updateInspector();clearTimeout(saveTimer);saveTimer=setTimeout(saveLayout,1400);if(d.moved&&!cancel){sound('place');toast('放好啦。看看它能不能稳稳站住，再让团子试一试');}}
canvas.addEventListener('pointerup',()=>endDrag(),true);canvas.addEventListener('pointercancel',()=>endDrag(true),true);canvas.addEventListener('lostpointercapture',()=>endDrag(),true);canvas.addEventListener('pointerleave',()=>{$('#object-label').hidden=true;});
viewSafeBind();
function viewSafeBind(){
 $('#build-mode').onclick=()=>setMode('build');$('#play-mode').onclick=()=>{setMode('play');toast(matchMedia('(pointer:coarse)').matches?'拖动左下角摇杆移动，右下角可以跳跃和攀爬':'WASD 移动 · 空格跳跃 · E 攀爬，试着走近一个矮木箱');};
 $('#rotate-left').onclick=()=>rotate(-Math.PI/2);$('#rotate-right').onclick=()=>rotate(Math.PI/2);$('#tilt-left').onclick=()=>rotate(Math.PI/12,true);$('#tilt-right').onclick=()=>rotate(-Math.PI/12,true);
 $('#restore-object').onclick=()=>{if(!selected||mode!=='build')return;selected.position.set(...selected.meta.position);selected.quaternion.setFromEuler(0,selected.meta.yaw||0,0);selected.velocity.setZero();selected.angularVelocity.setZero();selected.wakeUp();saveTimer=setTimeout(saveLayout,1200);toast('这件物品已经放回原位');};
 $('#camera-reset').onclick=()=>{view.resetCamera();$('#camera-follow').classList.remove('active');};$('#camera-top').onclick=()=>{view.resetCamera(true);$('#camera-follow').classList.remove('active');};$('#camera-follow').onclick=()=>{view.follow=!view.follow;if(view.follow){const direction=view.camera.position.clone().sub(view.controls.target).normalize();const target=new T.Vector3(physics.hamster.position.x,1,physics.hamster.position.z);view.controls.target.copy(target);view.camera.position.copy(target.clone().addScaledVector(direction,11));}$('#camera-follow').classList.toggle('active',view.follow);toast(view.follow?'靠近一点，陪团子一起冒险。仍然可以拖动旋转':'已切回自由视角');};
 $('#respawn').onclick=()=>{physics.respawn();keys.clear();joystick.x=joystick.y=0;toast('小团子回到小窝了，搭建的路线还在');};
 $('#reset').onclick=()=>showModal(`<p class="eyebrow">A FRESH LITTLE START</p><h2>重新布置这个小世界？</h2><p>本关物件和小团子会回到原位，已经解锁的笼子会保留。</p><button id="confirm-reset" class="primary">重新布置</button>`,()=>{$('#confirm-reset').onclick=()=>{loadLevel(index,true);$('#modal').close();};});
 $('#fullscreen').onclick=async()=>{try{const shell=$('.game-shell');if(document.fullscreenElement)await document.exitFullscreen();else await shell.requestFullscreen();}catch{toast('此窗口不支持全屏，可以在独立浏览器页面中放大');}};
 document.addEventListener('fullscreenchange',()=>{$('.game-shell').classList.toggle('fullscreen',!!document.fullscreenElement);setTimeout(()=>view.resize(),80);});
}
function rotate(angle,tilt=false){if(!selected||mode!=='build')return;physics.rotateObject(selected,angle,tilt);selected.position.y+=.12;selected.wakeUp();saveTimer=setTimeout(saveLayout,1300);sound('place');}
function movement(){
 const forward=new T.Vector3();view.camera.getWorldDirection(forward);forward.y=0;forward.normalize();const right=new T.Vector3().crossVectors(forward,new T.Vector3(0,1,0));
 const x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joystick.x;
 const y=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joystick.y;
 const v=forward.multiplyScalar(y).addScaledVector(right,x);if(v.length()>1)v.normalize();if(v.length()>.1)lastDirection.copy(v).normalize();return v;
}
function jump(){if(mode!=='play'||wonHandled)return;if(physics.jump())sound('jump');}
function climb(){if(mode!=='play'||wonHandled)return;const moving=movement();if(moving.length()<.1)lastDirection.set(Math.sin(view.hamster.root.rotation.y),0,Math.cos(view.hamster.root.rotation.y));if(!physics.tryClimb(lastDirection))toast('再靠近一点矮台阶，并面向它。更高的地方要先搭阶梯，或按空格跳上去');else sound('jump');}
document.addEventListener('keydown',e=>{
 if(!physics||$('#modal').open||wonHandled||e.target.matches('input,textarea,select'))return;
 const moving=/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(e.code);
 if(moving){e.preventDefault();if(mode!=='play')setMode('play');keys.add(e.code);}
 if(e.code==='Space'){e.preventDefault();if(!e.repeat)jump();}
 if(e.code==='KeyE'&&!e.repeat){e.preventDefault();climb();}
 if(e.code==='KeyB'&&!e.repeat)setMode(mode==='build'?'play':'build');
 if(mode==='build'&&e.code==='KeyR'&&!e.repeat)rotate(Math.PI/2);
 if(e.code==='Escape'&&drag)endDrag(true);
});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();joystick.x=joystick.y=0;$('#joystick-thumb').style.transform='';if(drag)endDrag(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();joystick.x=joystick.y=0;saveLayout();}});
$('#joystick').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();$('#joystick').setPointerCapture(e.pointerId);updateJoystick(e);});
function updateJoystick(e){const r=$('#joystick').getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/32,y=(e.clientY-r.top-r.height/2)/32,l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}joystick.x=x;joystick.y=y;$('#joystick-thumb').style.transform=`translate(${x*25}px,${y*25}px)`;}
$('#joystick').addEventListener('pointermove',e=>{if(e.buttons||$('#joystick').hasPointerCapture(e.pointerId))updateJoystick(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('#joystick').addEventListener(name,()=>{joystick.x=joystick.y=0;$('#joystick-thumb').style.transform='';});
$('#mobile-jump').addEventListener('pointerdown',e=>{e.preventDefault();jump();});$('#mobile-climb').addEventListener('pointerdown',e=>{e.preventDefault();climb();});
function showModal(html,bind){keys.clear();joystick.x=joystick.y=0;if(drag)endDrag();$('#modal-content').innerHTML=html;$('#modal').showModal();bind?.();}
$('#modal-close').onclick=()=>$('#modal').close();$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}});
$('#help').onclick=()=>showModal(`<p class="eyebrow">WELCOME TO TUANZI’S LITTLE WORLD</p><h2>这一次，真的住进小世界里 🐹</h2><p>你的目标是操控小团子翻出笼子。右侧高处的绿色箭头指向外面的安全垫；也欢迎你想出自己的逃跑路线。</p><div class="help-grid"><div class="help-step"><span>↔</span><strong>转动视角，仔细观察</strong><p>拖动空白处旋转，滚轮缩放，右键拖动平移。手机单指旋转，双指缩放。右上角可以俯视、归位或跟随团子。</p></div><div class="help-step"><span>▱</span><strong>搬动真实的物件</strong><p>在自由搭建模式下拖动木箱、纸筒、木板、矮凳。拖到其他物品上方就能堆叠。点选后可转向、倾斜；放开后重力会让不稳的物件倾倒。</p></div><div class="help-step"><span>🐾</span><strong>亲自操控小仓鼠</strong><p>切换操控团子：WASD 或方向键移动，空格跳跃，靠近并面向矮台阶按 E 攀爬。手机用摇杆和跳跃、攀爬按钮。按 B 随时切换模式。</p></div><div class="help-step"><span>↗</span><strong>翻出去，再出发</strong><p>走到小屋或高台不算通关。团子要真正越过笼子边界、落在外面，才能解锁下一座主题笼子。跌落可回窝重来，搭好的东西会保留。</p></div></div><button id="help-ok" class="primary">好，开动脑筋！</button>`,()=>{$('#help-ok').onclick=()=>$('#modal').close();});
function showMap(){showModal(`<p class="eyebrow">SIX LITTLE WORLDS</p><h2>团子的笼子旅行册</h2><p>一座笼子，一种心情。成功逃出当前笼子，才能打开下一段冒险。</p><div class="level-grid">${LEVELS3D.map((l,i)=>`<button class="level-tile ${i===index?'current':''}" data-level="${i}" ${canUnlock(i,saved.progress)?'':'disabled'}><span>${canUnlock(i,saved.progress)?String(i+1).padStart(2,'0'):'♧'}</span><strong>${l.name}</strong><small>${l.tag}</small><b>${saved.progress[i]?.completed?'✓ 已经逃出':canUnlock(i,saved.progress)?'开始探索 →':'逃出前一座笼子后开启'}</b></button>`).join('')}</div>`,()=>$$('[data-level]').forEach(b=>b.onclick=()=>{loadLevel(Number(b.dataset.level));$('#modal').close();}));}
$('#map').onclick=showMap;
$('#hint').onclick=()=>showModal(`<p class="eyebrow">A DIFFERENT PERSPECTIVE</p><h2>${physics.level.name} · 搭建灵感</h2><div class="hint-box"><p>💡 ${physics.level.hint}</p></div><p>先转动视角找到支点，再把路线分成几段。只要能安全翻出笼子，任何巧妙的解法都算数。</p><button id="hint-ok" class="primary">我再试试</button>`,()=>{$('#hint-ok').onclick=()=>$('#modal').close();});
$('#pet').onclick=()=>{petUntil=performance.now()+2000;view.burst(new T.Vector3(physics.hamster.position.x,physics.hamster.position.y+.5,physics.hamster.position.z),'#d6a391',10);toast('小团子蹭了蹭你的手指：一起想办法吧 ♡');sound('pet');};
function updateSound(){$('#sound').classList.toggle('off',!saved.sound);$('#sound').setAttribute('aria-label',saved.sound?'关闭音效':'开启音效');}
$('#sound').onclick=()=>{saved.sound=!saved.sound;persist();updateSound();if(saved.sound)sound('pet');};updateSound();
function win(){
 wonHandled=true;keys.clear();joystick.x=joystick.y=0;physics.hamster.velocity.setZero();saved.progress[index]={completed:true};saveLayout();updateJourney();sound('win');view.burst(view.hamster.root.position.clone().add(new T.Vector3(0,.6,0)),'#c4b779',50);
 const final=index===5;$('#win-layer').hidden=false;$('#win-layer').innerHTML=`<div class="win-card"><span>🐹</span><p class="eyebrow">A LITTLE COURAGE, A BIG ADVENTURE</p><h2>${final?'世界很大，团子很勇敢。':'翻出来啦，外面真好！'}</h2><p>小团子成功离开了${physics.level.name}。<br>${final?'六座笼子都留下了你的小小巧思。':'下一站：'+LEVELS3D[index+1].name+'，新的小世界在等你。'}</p><div class="win-actions"><button id="keep-exploring" class="secondary">再逛一逛</button><button id="next-cage" class="primary">${final?'看看旅行册':'开启下一座笼子 →'}</button></div></div>`;
 $('#keep-exploring').onclick=()=>{$('#win-layer').hidden=true;wonHandled=false;setMode('play');};$('#next-cage').onclick=()=>{if(final){$('#win-layer').hidden=true;showMap();}else loadLevel(index+1);};
}
let accumulator=0,lastTime=0,lastHeight=0;
function frame(time){
 const dt=Math.max(0,Math.min(.075,(time-lastTime)/1000||0));lastTime=time;const moving=mode==='play'&&!$('#modal').open&&!wonHandled?movement():new T.Vector3();accumulator+=dt;
 while(accumulator>=1/120){physics.step(1/120,moving,mode==='play'&&!$('#modal').open&&!wonHandled);accumulator-=1/120;}
 if(physics.fell){physics.fell=false;toast('软着陆，团子回到了小窝。路线还在，可以继续尝试');}
 if(physics.won&&!wonHandled&&!physics.celebrated){physics.celebrated=true;win();}
 view.render(dt,mode==='play',time<petUntil);
 const height=Math.max(0,physics.hamster.position.y-.265);if(Math.abs(height-lastHeight)>.03){lastHeight=height;$('#height-label').textContent=`离地 ${height.toFixed(1)} m`;}
 requestAnimationFrame(frame);
}
try{
 view=new CageView(canvas);let initial=Number.isInteger(saved.last)?Math.max(0,Math.min(5,saved.last)):0;if(!canUnlock(initial,saved.progress))initial=0;loadLevel(initial);
 new ResizeObserver(()=>view.resize()).observe($('#viewport'));window.addEventListener('pagehide',saveLayout);
 requestAnimationFrame(t=>{view.render(0,false);$('#loading').hidden=true;lastTime=t;requestAnimationFrame(frame);});
}catch(error){$('#loading').classList.add('error');$('#loading').innerHTML='<span class="loading-hamster">🌿</span><h3>这个窗口暂时没有成功开启 3D</h3><p>请使用开启了图形加速的 Chrome 或 Edge 浏览器。若嵌入预览不支持 WebGL，请在独立页面中打开游戏。</p>';console.error(error);}
export {physics,view,loadLevel,setMode};
