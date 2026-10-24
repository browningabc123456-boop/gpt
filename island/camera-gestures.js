const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const center=([a,b])=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const distance=([a,b])=>Math.hypot(a.x-b.x,a.y-b.y);
const angle=([a,b])=>Math.atan2(b.y-a.y,b.x-a.x);
export function beginCameraGesture(points,camera,canTilt=false){return{start:points.map(p=>({...p})),center:center(points),dist:distance(points),angle:angle(points),...camera,canTilt,intent:null};}
export function solveCameraGesture(g,points){const c=center(points),dx=c.x-g.center.x,dy=c.y-g.center.y,ratio=distance(points)/(g.dist||1),raw=angle(points)-g.angle,rotation=Math.atan2(Math.sin(raw),Math.cos(raw)),moves=points.map((p,i)=>({x:p.x-g.start[i].x,y:p.y-g.start[i].y}));
 const bothMoved=moves.every(p=>Math.hypot(p.x,p.y)>5),parallel=moves[0].y*moves[1].y>0&&Math.abs(moves[0].y-moves[1].y)<Math.max(14,Math.abs(dy)*.5);
 if(!g.intent&&bothMoved){if(g.canTilt&&parallel&&Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)*1.6&&Math.abs(ratio-1)<.075&&Math.abs(rotation)<.10)g.intent='tilt';else if(Math.abs(ratio-1)>.1||Math.abs(rotation)>.13||Math.abs(dx)>14)g.intent='transform';}
 const tilting=g.intent==='tilt';return{center:c,tilting,zoom:tilting?g.zoom:clamp(g.zoom*ratio,.4,5.5),azimuth:tilting?g.azimuth:g.azimuth+(Math.abs(rotation)<.025?0:rotation),elevation:tilting?clamp(g.elevation+dy*.0045,.34,1.25):g.elevation};
}
