export function facadeLayout(height){return ['cottage','merged-loft','single-clock','solid-tower','grand-oculus','lantern-slits'][height-1];}
export function exposedCombo(town,combo){return combo.members.every(m=>town.get(m.x,m.z)?.kinds.length===combo.level+1&&town.get(m.x,m.z)?.kinds[combo.level]===combo.kind);}
export function stairLane(town,c,n,dx,dz){for(const side of [1,-1]){const px=dz?-side:0,pz=dx?side:0;if(!town.get(c.x+px,c.z+pz)&&!town.get(n.x+px,n.z+pz))return side;}return null;}
export function crossingPoint(a,b){if(!!a.dx===!!b.dx)return null;const h=a.dx?a:b,v=a.dx?b:a,x=v.x,z=h.z;if(x<=h.x||x>=h.x+h.gap||z<=v.z||z>=v.z+v.gap)return null;return{x,z};}
export function entranceDirection(l,atEnd=false){if(l.style==='stairs'&&l.gap===1&&l.lane)return[l.dz?-l.lane:0,l.dx?l.lane:0];return[(atEnd?-1:1)*l.dx,(atEnd?-1:1)*l.dz];}
export function connectionPoints(l){const y=l.a*1.04,dy=(l.b-l.a)*1.04;if(l.style==='stairs'&&l.gap===1&&l.lane){const d=l.lane;return [[0,y,0],[0,y,.77*d],[0,y+dy/2,1.75*d],[1.56,y+dy/2,1.75*d],[1.56,y+dy,.77*d],[1.56,y+dy,0]];}return [[0,y,0],[l.gap*1.56,y+dy,0]];}
export function safeStairLane(town,l,links,reserved=new Set()){
 for(const lane of [1,-1]){const px=l.dz?-lane:0,pz=l.dx?lane:0,points=[{x:l.x+px,z:l.z+pz},{x:l.x+l.dx+px,z:l.z+l.dz+pz}];if(points.some(p=>town.get(p.x,p.z)||reserved.has(`${p.x},${p.z}`)))continue;
 const blocked=links.some(other=>other!==l&&!(other.style==='stairs'&&other.gap===1)&&Math.min(other.a,other.b)<=Math.max(l.a,l.b)+1&&Math.max(other.a,other.b)>=Math.min(l.a,l.b)-1&&points.some(p=>other.dx?p.z===other.z&&p.x>=other.x&&p.x<=other.x+other.gap:p.x===other.x&&p.z>=other.z&&p.z<=other.z+other.gap));if(!blocked){points.forEach(p=>reserved.add(`${p.x},${p.z}`));return lane;}}
 return null;
}
