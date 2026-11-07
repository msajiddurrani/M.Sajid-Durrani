import {
  Box3, BoxGeometry, BufferGeometry, CatmullRomCurve3, CylinderGeometry,
  ExtrudeGeometry, Group, IcosahedronGeometry, LineBasicMaterial, LineSegments,
  InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Object3D, OctahedronGeometry, Shape, SphereGeometry, TorusGeometry, TubeGeometry, Vector3,
} from 'three'
import type { Material } from 'three'

export type ModelPart = { node: Object3D; home: Vector3; away: Vector3 }
export type ProjectModel = { root: Group; parts: ModelPart[]; update: (time: number) => void; dispose: () => void }

export function createProjectModel(id: string): ProjectModel {
  const root = new Group(), parts: ModelPart[] = []
  const ivory = new MeshStandardMaterial({color:0xf2f0eb,roughness:.36,metalness:.15})
  const ink = new MeshStandardMaterial({color:0x20201e,roughness:.44,metalness:.25})
  const coral = new MeshStandardMaterial({color:0xe74a3b,roughness:.35,metalness:.2})
  const metal = new MeshStandardMaterial({color:0xb9b7b0,roughness:.28,metalness:.7})
  const updates: ((t:number)=>void)[] = []
  const mesh = (geometry:BufferGeometry, material:Material, parent:Group, x=0,y=0,z=0) => {
    const item=new Mesh(geometry,material);item.position.set(x,y,z);parent.add(item);return item
  }
  const box = (parent:Group,w:number,h:number,d:number,material:Material,x=0,y=0,z=0) => mesh(new BoxGeometry(w,h,d),material,parent,x,y,z)
  function batch(parent:Group,geometry:BufferGeometry,material:Material,matrices:Matrix4[]) {
    const instances=new InstancedMesh(geometry,material,matrices.length)
    matrices.forEach((matrix,index)=>instances.setMatrixAt(index,matrix))
    instances.instanceMatrix.needsUpdate=true;instances.computeBoundingBox();parent.add(instances)
    return instances
  }
  function part(x:number,y:number,z:number,dx=0,dy=.8,dz=0) {
    const node=new Group();node.position.set(x,y,z);root.add(node)
    parts.push({node,home:node.position.clone(),away:new Vector3(x+dx,y+dy,z+dz)})
    return node
  }
  function tube(parent:Group,points:number[][],material:Material,radius=.025) {
    const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p as [number,number,number])))
    mesh(new TubeGeometry(curve,32,radius,6,false),material,parent)
    return curve
  }
  function page(parent:Group,w=1.6,h=2.1) {
    box(parent,w,h,.11,ivory)
    box(parent,w*.65,.035,.016,coral,-.04,h*.25,.066)
    batch(parent,new BoxGeometry(1,1,1),metal,Array.from({length:4},(_,index)=>new Matrix4().makeScale(w*.7,.035,.016).setPosition(-.04,h*.25-(index+1)*.23,.066)))
  }
  function toothShape() {
    const s=new Shape()
    s.moveTo(-.55,.85);s.bezierCurveTo(-.93,1.15,-1.02,.4,-.73,-.05)
    s.bezierCurveTo(-.52,-.43,-.65,-1.2,-.3,-1.4)
    s.bezierCurveTo(-.06,-1.55,-.13,-.53,0,-.5)
    s.bezierCurveTo(.15,-.53,.12,-1.48,.35,-1.37)
    s.bezierCurveTo(.65,-1.2,.51,-.45,.74,-.06)
    s.bezierCurveTo(1.02,.45,.93,1.13,.55,.85)
    s.bezierCurveTo(.2,.65,-.2,.65,-.55,.85)
    return s
  }

  if(id==='creamy') {
    const cone=part(0,-.55,0,0,-.6,-.15)
    mesh(new CylinderGeometry(.63,.035,1.65,40),ivory,cone)
    for(const direction of [-1,1])for(let line=0;line<8;line++){
      const points:number[][]=[]
      for(let step=0;step<=30;step++){
        const u=step/30,r=.045+u*.595,a=line*Math.PI/4+direction*u*2.5
        points.push([Math.cos(a)*r,-.825+u*1.65,Math.sin(a)*r])
      }
      tube(cone,points,metal,.007)
    }
    const scoop=part(0,.68,0,.25,.65,.25)
    mesh(new SphereGeometry(.76,32,24),ivory,scoop)
    for(let i=0;i<9;i++){const a=i*Math.PI*2/9;mesh(new SphereGeometry(.18,12,8),ivory,scoop,Math.cos(a)*.59,-.34,Math.sin(a)*.59)}
    const strawberry=part(.12,1.53,-.05,.35,.8,-.25)
    mesh(new SphereGeometry(.55,28,20),coral,strawberry)
    const tub=part(-1.25,-.18,.35,-.6,.3,.4);tub.rotation.z=-.14
    mesh(new CylinderGeometry(.37,.29,.61,28),coral,tub)
    mesh(new CylinderGeometry(.39,.39,.07,28),ivory,tub,0,.33,0)
    box(tub,.38,.19,.02,ivory,0,0,.335)
    updates.push(t=>{strawberry.rotation.y=t*.12;tub.rotation.y=Math.sin(t*.35)*.06})
  } else if(id==='sop-voice') {
    const microphone=part(-.3,.35,0,-.2,.7,.3)
    mesh(new CylinderGeometry(.43,.43,1.2,32),metal,microphone)
    mesh(new SphereGeometry(.43,28,18),metal,microphone,0,.6,0)
    mesh(new SphereGeometry(.43,28,18),metal,microphone,0,-.6,0)
    for(let i=0;i<8;i++){const grille=mesh(new TorusGeometry(.435,.014,6,48),ink,microphone,0,-.47+i*.135,0);grille.rotation.x=Math.PI/2}
    const stand=part(-.3,-.35,0,0,-.4,-.3)
    tube(stand,[[-.64,.65,0],[-.64,-.23,0],[0,-.55,0],[.64,-.23,0],[.64,.65,0]],coral,.065)
    mesh(new CylinderGeometry(.065,.065,.6,16),metal,stand,0,-.84,0)
    mesh(new CylinderGeometry(.77,.87,.14,32),ink,stand,0,-1.2,0)
    const routes=part(1.4,.15,-.2,.7,.4,-.3)
    for(let i=0;i<3;i++)box(routes,.54,.32,.32,i===1?coral:ivory,0,(i-1)*.63,0)
    const signal=new Group();root.add(signal)
    const path=tube(signal,[[.2,.35,0],[.75,.35,-.1],[.9,.15,-.2],[1.2,.15,-.2]],metal,.018)
    const packet=mesh(new SphereGeometry(.065,12,8),coral,signal)
    const waves=part(-.3,.35,-.55,-.2,.5,-.5)
    for(let i=0;i<2;i++){const ring=mesh(new TorusGeometry(1.1+i*.26,.012,6,72),coral,waves);ring.scale.x=.7}
    updates.push(t=>{packet.position.copy(path.getPoint((t*.2)%1));waves.scale.setScalar(1+Math.sin(t*1.1)*.035)})
  } else if(id==='axiom-crm') {
    const board=part(0,.1,-.32,0,.6,-.6)
    box(board,3.45,2.2,.16,ink);box(board,3.24,1.99,.025,ivory,0,0,.095)
    for(let column=0;column<3;column++){
      box(board,.78,.075,.025,column===0?coral:metal,(column-1)*1.04,.72,.13)
      if(column<2)box(board,.015,1.38,.02,metal,(column-1)*1.04+.52,-.08,.13)
    }
    for(let column=0;column<3;column++){
      const cards=part((column-1)*1.04,.1,.02,(column-1)*.65,.5+column*.1,.4)
      for(let row=0;row<2;row++){
        const y=.28-row*.62
        box(cards,.79,.49,.08,ivory,0,y,0)
        box(cards,.4,.035,.012,metal,.09,y+.1,.048)
        box(cards,.5,.025,.012,metal,.02,y-.025,.048)
        mesh(new SphereGeometry(.055,10,8),column===2?coral:ink,cards,-.27,y+.09,.05)
      }
    }
    const chart=part(1.25,-1.05,.55,.6,-.35,.6)
    for(let i=0;i<3;i++)box(chart,.16,.25+i*.18,.18,i===2?coral:metal,(i-1)*.23,(.25+i*.18)/2,0)
    const cursor=mesh(new SphereGeometry(.06,12,8),coral,board,0,.9,.16)
    updates.push(t=>{cursor.position.x=Math.sin(t*.5)*1.1})
  } else if(id==='vangaurd') {
    const watch=part(0,0,0,0,.65,-.3)
    box(watch,.86,1.15,.15,ink,0,1.25,-.06);box(watch,.86,1.15,.15,ink,0,-1.25,-.06)
    for(let i=0;i<4;i++)box(watch,.3,.05,.017,metal,0,-1.05-i*.2,.025)
    box(watch,1.4,1.85,.27,metal);box(watch,1.24,1.66,.04,ink,0,0,.155)
    tube(watch,[[-.5,.1,.19],[-.3,.1,.19],[-.16,.38,.19],[.03,-.27,.19],[.19,.22,.19],[.3,.1,.19],[.5,.1,.19]],coral,.025)
    for(let i=0;i<3;i++)box(watch,.18,.1+i*.07,.025,i===2?coral:ivory,(i-1)*.28,-.54,.19)
    const dial=part(1.16,-.5,.25,.65,-.3,.35)
    const plate=mesh(new CylinderGeometry(.58,.58,.07,32),ivory,dial);plate.rotation.x=Math.PI/2
    for(let i=0;i<3;i++){const arc=mesh(new TorusGeometry(.39,.065,8,24,1.65),i===0?coral:ink,dial,0,0,.055);arc.rotation.z=i*2.094}
    const training=part(-1.2,.5,-.28,-.5,.5,-.4);page(training,.67,1.02);training.rotation.z=.1
    const orbit=mesh(new TorusGeometry(1.18,.012,6,80),coral,watch);orbit.rotation.y=.8;orbit.scale.y=1.5
    updates.push(t=>{orbit.rotation.z=Math.sin(t*.3)*.13;dial.rotation.z=t*.08})
  } else if(id==='dentora') {
    const dental=new ExtrudeGeometry(toothShape(),{depth:.52,bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:3,steps:1,curveSegments:16})
    dental.translate(0,.18,-.26)
    const hero=part(.45,.35,.25,.6,.9,.2)
    mesh(dental,ivory,hero)
    tube(hero,[[-.36,.89,.42],[0,.76,.47],[.35,.89,.42]],metal,.019)
    const arch=part(-.15,-1.1,-.25,-.5,-.35,-.3)
    const whiteTeeth:Matrix4[]=[],selectedTeeth:Matrix4[]=[]
    for(let i=0;i<12;i++){
      const angle=-Math.PI*.9+i*Math.PI*1.8/11
      const tooth=new Object3D();tooth.position.set(Math.sin(angle)*1.8,.05,Math.cos(angle)*1.25)
      tooth.scale.setScalar(.24);tooth.rotation.y=angle;tooth.updateMatrix()
      ;(i===8?selectedTeeth:whiteTeeth).push(tooth.matrix.clone())
    }
    batch(arch,dental,ivory,whiteTeeth);batch(arch,dental,coral,selectedTeeth)
    const chart=part(-1.8,.2,-.65,-.6,.4,-.5)
    page(chart,.85,1.4);chart.rotation.y=.3;chart.rotation.z=.1
    const scanner=mesh(new TorusGeometry(1.12,.018,6,72),coral,hero)
    scanner.rotation.x=Math.PI/2
    updates.push(t=>{scanner.position.y=Math.sin(t*.9)*.38;scanner.rotation.z=t*.12})
  } else if(id==='axiom') {
    const documents=part(-1.85,.05,.1,-.7,.65,-.3)
    for(let i=0;i<3;i++) {const p=new Group();p.position.set(i*.09,-i*.08,-i*.19);p.rotation.z=-.08;page(p,.95,1.35);documents.add(p)}
    const index=part(-.1,0,0,0,.8,-.6)
    const cells:Matrix4[]=[],accentCells:Matrix4[]=[]
    for(let x=0;x<3;x++)for(let y=0;y<3;y++)for(let z=0;z<3;z++){
      const matrix=new Matrix4().makeTranslation((x-1)*.31,(y-1)*.31,(z-1)*.31)
      ;((x+y+z)%5===0?accentCells:cells).push(matrix)
    }
    const cellGeometry=new BoxGeometry(.19,.19,.19)
    batch(index,cellGeometry,metal,cells);batch(index,cellGeometry,coral,accentCells)
    const core=part(1.6,.05,0,.65,.8,.4)
    mesh(new IcosahedronGeometry(.65,0),coral,core)
    const cage=mesh(new IcosahedronGeometry(.88,0),new MeshStandardMaterial({color:0xf2f0eb,wireframe:true,transparent:true,opacity:.6}),core)
    const links=new Group();root.add(links)
    const path=tube(links,[[-1.4,0,.15],[-.85,.2,.15],[-.1,0,.15],[.8,-.2,.15],[1.5,0,.15]],metal)
    const packets=Array.from({length:3},()=>mesh(new SphereGeometry(.055,10,8),coral,links))
    updates.push(t=>{cage.rotation.y=t*.18;core.rotation.x=Math.sin(t*.35)*.1;packets.forEach((p,i)=>p.position.copy(path.getPoint((t*.14+i/3)%1)))})
  } else if(id==='sop') {
    for(let i=0;i<3;i++) {const p=part(-.6+i*.12,.05-i*.09,-.7-i*.25,-.4-i*.12,.7+i*.1,-.3);page(p,1.75,2.2);p.rotation.z=.08}
    const shield=part(.65,.1,.35,.7,.6,.4)
    const shape=new Shape();shape.moveTo(-.82,.9);shape.lineTo(0,1.2);shape.lineTo(.82,.9);shape.lineTo(.72,-.15);shape.bezierCurveTo(.65,-.65,.3,-1,0,-1.18);shape.bezierCurveTo(-.3,-1,-.65,-.65,-.72,-.15);shape.closePath()
    const geometry=new ExtrudeGeometry(shape,{depth:.2,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:3,steps:1})
    mesh(geometry,ink,shield)
    tube(shield,[[-.4,.1,.3],[-.1,-.22,.3],[.47,.43,.3]],coral,.075)
    const validation=part(.7,-1.35,.65,.4,-.3,.4)
    for(let i=0;i<3;i++) {box(validation,.33,.14,.2,i===2?coral:metal,(i-1)*.49,0,0);if(i<2)box(validation,.15,.025,.025,metal,(i-1)*.49+.25,0,0)}
    updates.push(t=>{shield.rotation.y=Math.sin(t*.45)*.07})
  } else if(id==='terra') {
    const globe=part(0,0,0,0,.2,-.8)
    mesh(new SphereGeometry(1.36,48,32),ink,globe)
    const grid=new Group();globe.add(grid)
    const lineMaterial=new LineBasicMaterial({color:0xf2f0eb,transparent:true,opacity:.24})
    const vertices:number[]=[]
    for(let lat=-60;lat<=60;lat+=30)for(let angle=0;angle<360;angle+=5){
      for(const lon of [angle,angle+5]){const a=lat*Math.PI/180,b=lon*Math.PI/180;vertices.push(1.375*Math.cos(a)*Math.cos(b),1.375*Math.sin(a),1.375*Math.cos(a)*Math.sin(b))}
    }
    for(let lon=0;lon<180;lon+=30)for(let angle=0;angle<360;angle+=5){
      for(const latitude of [angle,angle+5]){const a=latitude*Math.PI/180,b=lon*Math.PI/180;vertices.push(1.375*Math.cos(a)*Math.cos(b),1.375*Math.sin(a),1.375*Math.cos(a)*Math.sin(b))}
    }
    const lines=new BufferGeometry()
    // Sampled land clusters provide an original, low-poly geospatial surface.
    const clusters=[[-100,40,24,20],[-65,-15,15,35],[20,5,22,30],[55,48,65,25],[135,-25,20,13]]
    const land:Vector3[]=[]
    for(let lat=-55;lat<75;lat+=7)for(let lon=-175;lon<180;lon+=7){
      if(!clusters.some(([x,y,rx,ry])=>((lon-x)/rx)**2+((lat-y)/ry)**2<1))continue
      const a=lat*Math.PI/180,b=lon*Math.PI/180
      land.push(new Vector3(1.39*Math.cos(a)*Math.cos(b),1.39*Math.sin(a),1.39*Math.cos(a)*Math.sin(b)))
    }
    const dots=new InstancedMesh(new OctahedronGeometry(.023,0),ivory,land.length)
    land.forEach((position,i)=>dots.setMatrixAt(i,new Matrix4().makeTranslation(position.x,position.y,position.z)))
    globe.add(dots)
    lines.setFromPoints(Array.from({length:vertices.length/3},(_,i)=>new Vector3(vertices[i*3],vertices[i*3+1],vertices[i*3+2])))
    grid.add(new LineSegments(lines,lineMaterial))
    const orbit=part(0,0,0,.3,.7,.2);orbit.rotation.z=.45
    const ring=mesh(new TorusGeometry(1.93,.014,6,100),coral,orbit);ring.rotation.x=Math.PI/2
    const satellite=new Group();orbit.add(satellite)
    box(satellite,.22,.24,.26,ivory);box(satellite,.4,.018,.28,metal,-.4,0,0);box(satellite,.4,.018,.28,metal,.4,0,0)
    updates.push(t=>{globe.rotation.y=t*.075;const a=t*.25;satellite.position.set(Math.cos(a)*1.93,0,Math.sin(a)*1.93);satellite.rotation.y=-a})
  } else {
    const bar=part(0,0,0,0,.5,-.4)
    const axle=mesh(new CylinderGeometry(.09,.09,3.8,20),metal,bar);axle.rotation.z=Math.PI/2
    for(const side of [-1,1]){
      const weights=part(side*1.24,0,0,side*.8,.4,0)
      for(let i=0;i<3;i++) {const disc=mesh(new CylinderGeometry(.64-i*.06,.64-i*.06,.17,40),i===2?coral:ink,weights,side*i*.2,0,0);disc.rotation.z=Math.PI/2
        const rim=mesh(new TorusGeometry(.61-i*.06,.018,6,48),metal,weights,side*i*.2+side*.088,0,0);rim.rotation.y=Math.PI/2}
    }
    const membership=part(-.1,-1.25,.65,-.4,-.45,.5);membership.rotation.x=-.3;membership.rotation.z=-.08
    box(membership,1.45,.86,.075,ivory);box(membership,.35,.07,.02,coral,-.35,.19,.05)
    for(let i=0;i<4;i++)box(membership,.05,.25,.01,ink,.25+i*.1,-.1,.05)
    updates.push(t=>{bar.rotation.x=Math.sin(t*.4)*.06})
  }
  const bounds=new Box3().setFromObject(root),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3())
  const wrapper=new Group();root.position.sub(center);wrapper.add(root);wrapper.scale.setScalar((id==='sop'?4:4.65)/Math.max(size.x,size.y,size.z))
  return {root:wrapper,parts,update:t=>updates.forEach(update=>update(t)),dispose(){
    const geometries=new Set<BufferGeometry>(),materials=new Set<Material>()
    wrapper.traverse(node=>{if(node instanceof Mesh || node instanceof LineSegments){geometries.add(node.geometry);(Array.isArray(node.material)?node.material:[node.material]).forEach(m=>materials.add(m))}})
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());[ivory,ink,coral,metal].forEach(m=>m.dispose())
  }}
}
