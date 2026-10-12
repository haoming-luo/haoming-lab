# SPDX-License-Identifier: Apache-2.0
"""Lesson 6. Import the supplied mesh; SI units, ordinary linear elasticity."""
from pathlib import Path
import json
import numpy as np
from agentfem import constraints,fields,mesh,models,project,studies,mechanics
from agentfem.constitutive import isotropic_elastic

def solve(solid=False,strain=.001,mesh_file=None):
    root=Path(__file__).resolve().parent
    run=project.current_run(project_root=root)
    width,height=3*np.sqrt(3)*.01,.06
    if solid:
        d=mesh.rectangle((0,0),(width,height),(40,40))
        regions=[mesh.boundary(d,lambda x,a=a,v=v:np.isclose(x[a],v),name=n,tag=t) for t,n,a,v in [(11,'left',0,0),(12,'right',0,width),(13,'bottom',1,0),(14,'top',1,height)]]
    else:
        data=mesh.read_gmsh_mesh(mesh_file or root/'honeycomb.msh',gdim=2)
        d=data.domain
        regions=[mesh.tagged_boundary_region(d,data.facet_tags,tag=t,name=n) for t,n in [(11,'left'),(12,'right'),(13,'bottom'),(14,'top')]]
    left,right,bottom,top=regions
    m=models.create(study=studies.static_solid(dimension=2,assumption='plane_stress'),mesh=d)
    u=m.field(fields.displacement(d,degree=2))
    m.material(isotropic_elastic(young=1e9,poisson=.3,density=1000.))
    m.constraint(constraints.fixed_component(u,component=0,on=left,value=0.))
    m.constraint(constraints.fixed_component(u,component=0,on=right,value=strain*width))
    # The honeycomb has no material at (0, 0): its left edge starts at y=5 mm.
    pin_at=(0.,0. if solid else .005)
    coordinates=u.value.function_space.tabulate_dof_coordinates()
    assert np.any(np.linalg.norm(coordinates[:,:2]-pin_at,axis=1)<1e-10), 'Support must coincide with a mesh DOF'
    m.constraint(constraints.pin(u,at=pin_at,components=(1,)))
    m.check()
    r=m.step(target=u).solve_result(output=run.artifact('displacement.xdmf'),strict_output=True)
    answer=mechanics.apparent_poisson_ratio(u,axial_axis=0,transverse_axis=1,axial_faces=(left,right),transverse_faces=(bottom,top),axial_length=width,transverse_length=height)
    for key in ['apparent_poisson_ratio','axial_gauge_strain','transverse_gauge_strain']:
        r.add_quantity(key,float(answer[key]))
    run.publish(r)
    return r,answer

if __name__=='__main__':
    _,answer=solve()
    print(json.dumps(answer,indent=2,default=float))
