// Projection uses viewport coordinates; positioned children use their parent's
// coordinates. Keep that conversion in one place, including host top insets.
export function speechPlacement(anchor,bounds,size,parent,obstacles=[]){
 const pad=5,gap=9;if(anchor.x<bounds.left+pad||anchor.x>bounds.right-pad||anchor.y<bounds.top+pad||anchor.y>bounds.bottom-pad||size.width>bounds.right-bounds.left-pad*2)return null;
 const left=Math.max(bounds.left+pad,Math.min(bounds.right-size.width-pad,anchor.x-size.width/2));
 for(const below of [false,true]){const top=below?anchor.y+gap:anchor.y-size.height-gap,rect={left,right:left+size.width,top,bottom:top+size.height};if(top<bounds.top+pad||rect.bottom>bounds.bottom-pad)continue;if(obstacles.some(r=>r.left<rect.right+4&&r.right>rect.left-4&&r.top<rect.bottom+4&&r.bottom>rect.top-4))continue;return{left:left-parent.left,top:top-parent.top,tail:Math.max(8,Math.min(size.width-8,anchor.x-left)),below,rect};}
 return null;
}

export function unoccludedSpeaker(ray,camera,pointer,head,meshes){const p=head.clone().project(camera);if(p.z<-1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1)return false;ray.setFromCamera(pointer.set(p.x,p.y),camera);const hit=ray.intersectObjects(meshes,false)[0];return !hit||hit.distance+.12>=ray.ray.origin.distanceTo(head);}
