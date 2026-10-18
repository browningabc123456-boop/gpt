// Geometry counts describe a scene, not a phone's capabilities. Only sustained
// frame timing can lower quality, and lowering quality must retain the 3D game.
export class FrameQuality{
 constructor(){this.tier=0;this.samples=[];this.frames=0;}
 observe(milliseconds){this.frames++;if(this.frames<=30||!Number.isFinite(milliseconds)||milliseconds<=0)return false;this.samples.push(milliseconds);if(this.samples.length<45)return false;const sorted=this.samples.slice().sort((a,b)=>a-b),median=sorted[22];this.samples=[];if(this.tier<2&&median>(this.tier?140:90)){this.tier++;return true;}return false;}
 resetTiming(){this.samples=[];this.frames=0;}
 get fps(){return[30,24,20][this.tier];}
 get dpr(){return[1.5,1,.75][this.tier];}
 get pixelCap(){return this.tier?1e6:2e6;}
}
