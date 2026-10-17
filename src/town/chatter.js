export class Chatter{
 constructor(random=Math.random){this.random=random;this.active=[];this.next=7;this.lastSeed=null;}
 update(time,actors,manual=null){this.active=this.active.filter(e=>e.until>time&&actors.includes(e.actor)&&e.actor.mesh.visible&&e.actor!==manual);const limit=manual?1:2;if(this.active.length>limit)this.active.length=limit;if(time<this.next||this.active.length>=limit)return null;this.next=time+7+this.random()*9;const available=actors.filter(a=>a!==manual&&a.seed!==this.lastSeed&&a.mesh.visible&&!this.active.some(e=>e.actor===a));if(!available.length)return null;const actor=available[Math.floor(this.random()*available.length)],entry={actor,until:time+4.8};this.lastSeed=actor.seed;this.active.push(entry);return entry;}
 clear(time=0){this.active=[];this.next=time+7;this.lastSeed=null;}
}
