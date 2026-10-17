import * as T from 'three';
// Deterministic microtextures keep the standalone game self-contained.
export function textile(color,kind='linen'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');let state=7261;const random=()=>((state=(state*1664525+1013904223)>>>0)/4294967296);
 c.fillStyle=color;c.fillRect(0,0,256,256);
 for(let i=0;i<10000;i++){const x=random()*256,y=random()*256;c.strokeStyle=i%2?'#ffffff30':'#46332420';c.lineWidth=kind==='fur'?.6:1;c.beginPath();c.moveTo(x,y);c.lineTo(x+(kind==='fur'?1:3),y+(kind==='fur'?3+random()*7:0));c.stroke();}
 if(kind==='linen')for(let i=0;i<256;i+=4){c.fillStyle='#ffffff13';c.fillRect(i,0,1,256);c.fillStyle='#35281d0b';c.fillRect(0,i,256,1);}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;
 return new T.MeshPhysicalMaterial({map,bumpMap:map,bumpScale:kind==='fur'?.001:.012,roughness:.92,sheen:1,sheenColor:new T.Color('#fff6eb'),sheenRoughness:.7});
}
export function piping(group,points,color='#fff5df',radius=.012){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),true);const mesh=new T.Mesh(new T.TubeGeometry(curve,96,radius,6,true),new T.MeshStandardMaterial({color,roughness:.85}));mesh.castShadow=true;group.add(mesh);return mesh;
}
