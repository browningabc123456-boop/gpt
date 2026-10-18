import * as T from 'three';
export function secretArt(v,g,theme,index){
 if(theme==='sea'){if(index===0){const bottle=v.cylinder(g,.045,.08,.28,[0,.17,0],'#87b5a5',12,true);bottle.rotation.z=.45;v.cylinder(g,.035,.035,.08,[-.07,.32,0],'#a38357',8);}else{v.box(g,[.34,.20,.25],[0,.13,0],'#9f754b',.04);for(const x of [-.11,.11])v.box(g,[.035,.23,.27],[x,.13,0],'#dac181');v.box(g,[.07,.07,.025],[0,.16,.14],'#e1c77d');}}
 else if(theme==='forest'&&index===0){v.cylinder(g,.035,.05,.32,[0,.16,0],'#b49a6e',8);v.sphere(g,[.17,.09,.15],[0,.39,0],'#c88a6e');v.box(g,[.16,.12,.16],[0,.31,0],'#d7c297',.03);v.box(g,[.10,.015,.02],[0,.32,.09],'#665a43');}
 else if(theme==='forest'){v.sphere(g,[.11,.14,.10],[0,.15,0],'#b88a5d');v.sphere(g,[.08,.08,.08],[0,.29,.04],'#c9a376');v.sphere(g,[.13,.22,.10],[0,.19,-.15],'#b88a5d');for(const x of [-.04,.04])v.sphere(g,[.025,.045,.025],[x,.37,.04],'#b88a5d');}
 else if(theme==='city'&&index===0){v.sphere(g,[.18,.08,.11],[0,.1,0],'#b5aaa0');v.sphere(g,[.08,.08,.08],[.12,.16,.04],'#ccc1af');for(const x of [.08,.15])v.cylinder(g,0,.035,.08,[x,.24,.04],'#99998c',6);}
 else if(theme==='city'){v.box(g,[.28,.19,.15],[0,.13,0],'#8b9e98',.03);v.cylinder(g,.009,.015,.28,[.09,.32,0],'#b7ac87',6);for(const x of [-.07,.02])v.sphere(g,[.025,.025,.01],[x,.13,.085],'#ead5a2');}
 else if(theme==='snow'&&index===0){v.sphere(g,[.12,.13,.12],[0,.14,0],'#f8f4df');v.sphere(g,[.08,.08,.08],[0,.33,0],'#f8f4df');v.cylinder(g,.09,.10,.035,[0,.26,0],'#c4826a',12);v.cylinder(g,0,.06,.12,[0,.44,0],'#b7a17c',10);}
 else if(theme==='snow'){v.sphere(g,[.20,.06,.17],[0,.08,0],'#b2d6d5');for(const x of [-.04,.04])v.sphere(g,[.065,.065,.04],[x,.17,0],'#d8a6ab');}
 else if(theme==='garden'&&index===0){v.sphere(g,[.12,.07,.15],[0,.1,0],'#c97964');v.sphere(g,[.07,.06,.07],[0,.1,.14],'#59654d');for(const x of [-.05,.05])for(const z of [-.05,.06])v.sphere(g,[.018,.012,.02],[x,.165,z],'#59654d');}
 else if(theme==='garden'){v.sphere(g,[.07,.045,.17],[0,.05,0],'#bbbc8e');v.sphere(g,[.12,.12,.09],[0,.15,-.03],'#c9aa78');for(const x of [-.035,.035])v.cylinder(g,.006,.01,.12,[x,.14,.14],'#8d9a66',6);}
 else if(theme==='sky'&&index===0){const plane=new T.Group();plane.rotation.z=.2;g.add(plane);for(const side of [-1,1]){const wing=v.box(plane,[.16,.012,.30],[side*.075,.12,0],'#f5e9c8');wing.rotation.z=side*.4;}}
 else if(theme==='sky'){const geo=v.geometry('moon-secret',()=>new T.TorusGeometry(.1,.025,8,20,Math.PI*1.5));const mesh=new T.Mesh(geo,v.material('#e8cf82'));mesh.position.y=.15;g.add(mesh);}
 else if(index===0){v.sphere(g,[.19,.06,.15],[0,.08,0],'#c5ae83');const mesh=new T.Mesh(v.geometry('fossil-secret',()=>new T.TorusGeometry(.075,.012,6,18,Math.PI*1.8)),v.material('#8e7954'));mesh.rotation.x=-Math.PI/2;mesh.position.y=.15;g.add(mesh);}
 else{v.sphere(g,[.09,.16,.08],[0,.18,0],'#b8d4a0');for(const x of [-.07,.07])v.sphere(g,[.08,.025,.045],[x,.14,0],'#8eab6c');}
}
