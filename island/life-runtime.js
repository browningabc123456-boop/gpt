const {random,kind}=globalThis.IslandCore;
export function createWalker(o,game=null){let x=o.x,y=o.y;if(game&&!canWalk(game,o.type,x,y)){let found=false;for(let r=25;r<=350&&!found;r+=25)for(let i=0;i<16;i++){let a=i*Math.PI/8,qx=o.x+Math.cos(a)*r,qy=o.y+Math.sin(a)*r;if(canWalk(game,o.type,qx,qy)){x=qx;y=qy;found=true;break;}}}return{x,y,homeX:x,homeY:y,target:null,wait:.4+o.v*2,angle:o.yaw||0,moving:false,rng:random((o.v*1e8|0)+7),distance:0};}
export function canWalk(game,type,x,y,from=null){
 if(!game.contains(x,y,.065))return false;if(['bird','butterfly'].includes(type))return true;
 const wet=game.waterAt(x,y);if(type!=='duck'&&wet)return false;
 if(from){if(type==='duck'&&game.waterAt(from.x,from.y)!==wet)return false;if(Math.abs(game.heightAt(x,y)-game.heightAt(from.x,from.y))>.13)return false;}
 return !game.objects.some(o=>kind(o.type)==='building'&&Math.hypot(o.x-x,o.y-y)<(o.s||1)*105);
}
export function stepWalker(w,o,game,dt){
 dt=Math.max(0,Math.min(.08,dt));w.moving=false;
 if(w.wait>0){w.wait-=dt;return w;}
 if(!w.target){for(let i=0;i<16;i++){let a=w.rng()*Math.PI*2,r=70+w.rng()*260,q={x:w.homeX+Math.cos(a)*r,y:w.homeY+Math.sin(a)*r};if(canWalk(game,o.type,q.x,q.y,w)){w.target=q;break;}}if(!w.target){w.wait=.8;return w;}}
 let dx=w.target.x-w.x,dy=w.target.y-w.y,d=Math.hypot(dx,dy),speed=({person:34,child:38,cat:29,dog:44,rabbit:43,deer:39,sheep:25,duck:25,bird:65,butterfly:48}[o.type]||30),step=Math.min(d,speed*dt),q={x:w.x+dx/(d||1)*step,y:w.y+dy/(d||1)*step};
 if(!canWalk(game,o.type,q.x,q.y,w)){w.target=null;w.wait=.25+w.rng();return w;}
 w.x=q.x;w.y=q.y;w.distance+=step;w.angle=Math.atan2(-dy,dx);w.moving=step>.001;
 if(d<3){w.target=null;w.wait=.8+w.rng()*3;}return w;
}
export function popScale(age){if(age<=0)return .02;if(age>=.65)return 1;let x=age/.65;return 1-Math.exp(-7*x)*Math.cos(x*11);}
