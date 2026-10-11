# SPDX-License-Identifier: Apache-2.0
"""Connected re-entrant specimen, adapted from AgentFEM mesh/honeycomb.py.
Coordinates are metres. Run with Python, numpy and gmsh; no FEM runtime needed.
"""
from pathlib import Path
import argparse
import numpy as np
import gmsh

def generate(output, size=0.0008):
    angle, ligament, vertical, thickness = -30., .01, .015, .0012
    repeats = (3, 3)
    w = ligament*np.cos(np.deg2rad(angle))
    s = ligament*np.sin(np.deg2rad(angle))
    width, height = 2*w*repeats[0], 2*(vertical+s)*repeats[1]
    gmsh.initialize()
    try:
        gmsh.option.setNumber('General.Terminal', 0)
        gmsh.model.add('teaching_honeycomb')
        occ = gmsh.model.occ
        vertices = np.array([[0,0],[w,s],[w,s+vertical],[0,2*s+vertical],[-w,s+vertical],[-w,s]])
        edges, points = {}, {}
        for j in range(-2, 2*repeats[1]+3):
            for i in range(-repeats[1]-3, repeats[0]+3):
                vv = vertices+[2*w*i+w*j,(vertical+s)*j]
                for a,b in zip(vv,np.roll(vv,-1,axis=0)):
                    if max(a[0],b[0]) < -thickness or min(a[0],b[0]) > width+thickness or max(a[1],b[1]) < -thickness or min(a[1],b[1]) > height+thickness:
                        continue
                    ka,kb=tuple(np.round(a,12)),tuple(np.round(b,12))
                    edges[tuple(sorted((ka,kb)))]=(a,b)
                    points[ka],points[kb]=a,b
        pieces=[]
        for a,b in edges.values():
            d=b-a; n=np.array([-d[1],d[0]])/np.linalg.norm(d)*thickness/2
            ids=[occ.addPoint(float(p[0]),float(p[1]),0) for p in [a+n,b+n,b-n,a-n]]
            lines=[occ.addLine(ids[k],ids[(k+1)%4]) for k in range(4)]
            pieces.append((2,occ.addPlaneSurface([occ.addCurveLoop(lines)])))
        for p in points.values():
            pieces.append((2,occ.addDisk(float(p[0]),float(p[1]),0,thickness/2,thickness/2)))
        fused,_=occ.fuse(pieces[:1],pieces[1:])
        clipped,_=occ.intersect(fused,[(2,occ.addRectangle(0,0,0,width,height))])
        largest=max(clipped,key=lambda item:occ.getMass(*item))
        occ.remove([x for x in clipped if x!=largest],recursive=True)
        occ.synchronize()
        gmsh.model.addPhysicalGroup(2,[largest[1]],1)
        gmsh.model.setPhysicalName(2,1,'solid')
        curves=gmsh.model.getBoundary([largest],oriented=False)
        for tag,name,axis,value in [(11,'left',0,0),(12,'right',0,width),(13,'bottom',1,0),(14,'top',1,height)]:
            ids=[]
            for dim,t in curves:
                box=gmsh.model.getBoundingBox(dim,t)
                if abs(box[axis]-value)<2e-7 and abs(box[axis+3]-value)<2e-7:
                    ids.append(t)
            assert ids,name
            gmsh.model.addPhysicalGroup(1,ids,tag)
            gmsh.model.setPhysicalName(1,tag,name)
        gmsh.option.setNumber('Mesh.MeshSizeMin',size)
        gmsh.option.setNumber('Mesh.MeshSizeMax',size)
        gmsh.model.mesh.generate(2)
        gmsh.option.setNumber('Mesh.MshFileVersion',4.1)
        gmsh.write(str(output))
    finally:
        gmsh.finalize()
    return width,height

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--size-mm',type=float,default=.8)
    parser.add_argument('--output',default=str(Path(__file__).with_name('honeycomb.msh')))
    args=parser.parse_args()
    print(generate(args.output,args.size_mm/1000))
