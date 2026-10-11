# AgentFEM teaching examples 5 and 6

These projects accompany https://lab.haoming-luo.com/learn/ .
Code: Apache-2.0. Geometry generator adapted from AgentFEM's honeycomb generator.

## Requirements / 运行环境 / Environnement

Use AgentFEM containing the stability update merged on 2026-10-10 (PR #100),
DOLFINx, PETSc and SLEPc. The earlier v0.4.1 release does not contain buckling.
Honeycomb import also requires Gmsh. Reference calculations used DOLFINx 0.11.0
and AgentFEM source commit 58af6eaa. No solver code is bundled here.

Open each project folder and run `agentfem run` in your configured FEM environment.
Alternatively run `python case.py`. Outputs are standard AgentFEM run artifacts,
including the result manifest and XDMF/H5 for ParaView. Keep each XDMF with its H5.

## 05 column

The current web exercise runs `load_path.py` through `case.py`: a stress-free
initial bow of 0.1 mm, geometrically nonlinear plane-stress Neo-Hookean
elasticity, and total force ramped to 10.7 kN. This nonlinear case uses **N, mm,
MPa**, E=210000 MPa, nu=0.3, 60x4 quadratic elements and quadrature degree 4.
Newton absolute tolerance is 1e-6, with adaptive increments and a 1500-step cap.
The loaded face remains free to rotate. Its mean lateral displacement at 10.7 kN
is 9.64848 mm; a 90x4 mesh with quadrature degree 6 gives 9.69465 mm (0.48% change).
With a 0.2 mm initial bow it is 16.81577 mm. Euler's ideal-column load is
10.79488 kN. This lesson examines **precritical elastic amplification**, not a
steel failure load. It deliberately avoids interpreting solver failure as buckling.

The `solve()` function below remains an independent **linear eigenvalue** check;
its SI units and results are distinct from the nonlinear load-path case.

All modeling coordinates are in metres, elastic modulus in Pa, forces in N.
L=0.2 m, section height and out-of-plane thickness both 0.01 m, E=210 GPa,
nu=0.3. Plane stress, left clamped, right-face dead axial reference force 100 N.
Traction is 100/(0.01*0.01)=1e6 Pa. Gravity is omitted.

`case.solve()` computes the 200 mm column. `case.solve(.4,160)` computes 400 mm.
The eigenvalue solver tolerance is explicitly 1e-7: the default residual filter
can discard the lowest SI-scaled slender-column mode on this runtime. Always
check the first mode against Euler and check the eigenpair residual; do not
interpret a higher accepted mode as the first critical load.
Reference: 10779.485 N vs Euler 10794.880 N; 400 mm: 2698.184 N vs 2698.720 N.
The mode is normalized: its amplitude is not a physical displacement.

## 06 honeycomb

Import `honeycomb.msh`, not a geometry reconstructed from prose.
**Mesh coordinates are metres, not millimetres.**
The model uses quadratic displacement elements on the supplied triangular mesh.
Baseline mesh size 0.8 mm; `honeycomb-fine.msh` uses 0.4 mm.

Physical groups:

| Dimension | Tag | Name | Use |
|---|---|---|---|
| 2 | 1 | solid | Elastic material |
| 1 | 11 | left | ux=0, axial gauge |
| 1 | 12 | right | ux=0.001W, axial gauge |
| 1 | 13 | bottom | Free, transverse gauge |
| 1 | 14 | top | Free, transverse gauge |

W=0.05196152422706632 m, H=0.06 m. Pin uy only at (0,0).
Other boundaries, including hole walls, are traction free. E=1 GPa, nu=0.3,
small-strain plane stress; no gravity. No thickness is needed for the requested
displacement-ratio outputs; specify one if adding total reactions.
The specimen contains 3x3 rectangular periods, with rounded joints and detached
edge fragments removed. Inclined ligament 10 mm, vertical ligament 15 mm,
wall width 1.2 mm, angle -30 degrees from horizontal.

`python generate_mesh.py` reproduces the baseline mesh; parameters are near the
top of that file. `--size-mm 0.4 --output honeycomb-fine.msh` refines it.
The generator needs numpy and gmsh, but not AgentFEM.
`case.solve(solid=True)` computes the solid control; `case.solve(strain=.0005)`
halves extension. For refinement use `case.solve(mesh_file='honeycomb-fine.msh')`.

Mean displacements on the four tagged faces define gauge strains.
nu_app=-epsilon_y/epsilon_x. Expected: honeycomb -1.30260; solid +0.30000.
The refined mesh gives -1.30619 (0.28% change). These are finite-specimen values,
not periodic homogenized constants or universal material properties.

中文：下载并解压附件，将 honeycomb.msh 所在文件夹交给 AI。先按讲义计算，
再修改几何。标签 11/12/13/14 对应左/右/下/上，坐标单位为米。

Français : décompressez le dossier et transmettez-le à l’IA. Les coordonnées du
maillage sont en mètres. Les étiquettes 11/12/13/14 désignent gauche/droite/bas/haut.
