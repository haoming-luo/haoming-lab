"""Teaching load sweep using AgentFEM finite-strain plane-stress elasticity.

Units: mm, N, MPa. The initial crooked shape is stress free.
"""
from pathlib import Path
import json
import numpy as np
import ufl
from dolfinx import fem
from agentfem import mesh, models, studies, fields, constitutive, steps, io, solvers

def solve(nx=60, maximum_force=10700., increment=None, imperfection=.1, output=None, quadrature=4):
    increment=300/maximum_force if increment is None else increment
    L,h,b,E=200.,10.,10.,210000.
    d=mesh.rectangle((0.,-h/2),(L,h/2),(nx,4),cell_type='quadrilateral')
    left=mesh.boundary(d,lambda x:np.isclose(x[0],0),name='clamp',tag=1)
    right=mesh.boundary(d,lambda x:np.isclose(x[0],L),name='loaded',tag=2)
    left=mesh.tagged_boundary_region(d,left.facet_tags,tag=1,name='clamp')
    right=mesh.tagged_boundary_region(d,right.facet_tags,tag=2,name='loaded')
    shape=fields.displacement(d,degree=2).value
    shape.interpolate(lambda x:np.vstack((np.zeros_like(x[0]),1-np.cos(np.pi*x[0]/(2*L)))))
    mesh.apply_mode_imperfection(d,[shape],amplitudes=[imperfection])
    m=models.create(study=studies.static_solid(dimension=2,assumption='plane_stress',nonlinear=True),mesh=d)
    u=m.field(fields.displacement(d,degree=2))
    mat=m.material(constitutive.neo_hookean_plane_stress(young=E,poisson=.3))
    m.clamp(u,on=left)
    m.traction((-maximum_force/(h*b),0.),on=right)
    m.check()
    step=m.step(target=u,material=mat,measure=ufl.Measure('dx',domain=d,metadata={'quadrature_degree':quadrature}),solver_options=solvers.NewtonSolverOptions(absolute_tolerance=1e-6,relative_tolerance=1e-8,maximum_iterations=50),incrementation=steps.automatic(initial=increment,maximum=increment,minimum=1e-5,max_increments=1500,max_cutbacks=12,fast_iterations=30,slow_iterations=45),output_every=1,progress=True)
    try:
        result=step.solve_result(output=output)
    except Exception:
        print('Last accepted factor:',step.accepted_load_factor,'last increment:',step.accepted_increments[-1] if step.accepted_increments else None,flush=True)
        raise
    area=fem.assemble_scalar(fem.form(1.*right.measure))
    curve=[]
    for s in step.snapshots:
        tip=fem.assemble_scalar(fem.form(s.solution[1]*right.measure))/area
        curve.append({'force_N':maximum_force*s.load_factor,'tip_mm':float(tip)})
    result.add_history('tip_lateral_displacement',[p['force_N'] for p in curve],[p['tip_mm'] for p in curve],abscissa_name='force_N')
    print('Completed points:',len(curve),'last:',curve[-1],flush=True)
    return result,curve,step

if __name__=='__main__':
    from agentfem import project
    root=Path(__file__).resolve().parent
    run=project.current_run(project_root=root)
    r,c,s=solve(output=run.artifact('load-path.xdmf'))
    run.publish(r)
    (root/'load-path.json').write_text(json.dumps(c,indent=2)+'\n')
