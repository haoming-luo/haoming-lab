# SPDX-License-Identifier: Apache-2.0
"""Lesson 5. SI units, plane stress, physical out-of-plane thickness 0.01 m."""
from pathlib import Path
import json
import numpy as np
from agentfem import fields,mesh,models,project,studies,io
from agentfem.constitutive import isotropic_elastic

def solve(length=.2,nx=80):
    run=project.current_run(project_root=Path(__file__).resolve().parent)
    h,b,E=.01,.01,210e9
    d=mesh.rectangle((0,-h/2),(length,h/2),(nx,6),cell_type='quadrilateral')
    left=mesh.boundary(d,lambda x:np.isclose(x[0],0),name='clamp',tag=1)
    right=mesh.boundary(d,lambda x:np.isclose(x[0],length),name='compression',tag=2)
    mat=isotropic_elastic(young=E,poisson=.3,density=7800.)
    pre=models.create(study=studies.static_solid(dimension=2,assumption='plane_stress'),mesh=d)
    u0=pre.field(fields.displacement(d,degree=2));pre.material(mat);pre.clamp(u0,on=left)
    pre.traction((-100/(h*b),0),on=right)
    pre.check();pre.step(target=u0).solve_result()
    m=models.create(study=studies.buckling_solid(dimension=2,assumption='plane_stress'),mesh=d)
    u=m.field(fields.displacement(d,degree=2));m.material(mat);m.clamp(u,on=left)
    m.check()
    r=m.step(target=u,reference_displacement=u0,reference_name='100 N axial compression',modes=1,tolerance=1e-7).solve_result(output=run.artifact('buckling.xdmf'),strict_output=True)
    critical=float(r.quantity('load_factors')[0])*100
    theory=np.pi**2*E*(b*h**3/12)/(4*length**2)
    r.add_quantity('critical_load_N',critical);r.add_quantity('euler_load_N',theory)
    run.publish(r)
    return r,{'length_mm':length*1000,'critical_load_N':critical,'euler_load_N':theory,'relative_error':abs(critical/theory-1),'nx':nx}

if __name__=='__main__':
    import runpy
    load_solve=runpy.run_path(str(Path(__file__).with_name('load_path.py')))['solve']
    run=project.current_run(project_root=Path(__file__).resolve().parent)
    r,curve,_=load_solve(output=run.artifact('load-path.xdmf'))
    run.artifact('load-path.json').write_text(json.dumps(curve,indent=2)+'\n')
    run.publish(r)
