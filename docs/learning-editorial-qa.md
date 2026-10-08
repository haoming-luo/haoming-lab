# Article and beginner tutorial, 2026-10-07

## Content order

1. DENIM research note, written and evidence-reviewed first.
2. Four beginner prompts with real AgentFEM reference calculations.

The article separates the legacy fixed-material experiment (918 parameters)
from capability_v4 v2.2 (8,477 parameters). The 128-trajectory sealed table
comes from the public model card accessed 2026-10-07. It is not a common
leaderboard with the known-equation integrator. Synthetic scope, long-cycle
application domain, and missing formal energy theorem are stated briefly.

Language review: no invented personal anecdote or third-party endorsement;
the opening metal-wire example is explanatory. No “不是/并非…而是…” rhetorical
formula is used in the article. Genuine distinctions are stated directly.

## Reference calculations

AgentFEM source commit a05b293104c15f8ca3916b98edb24801e0e9ab6c,
runtime reports 0.4.0.dev0, DOLFINx 0.11.0, native macOS.
The development environment's installed distribution metadata remains
0.3.7.dev0; the tutorial names the imported runtime, not a released package.

- Beam: 80 × 8 Q2 plane stress. Downward traction 1 MPa represents 200 N
  with the specified 10 mm thickness. Tip -0.383196697 mm; Euler-Bernoulli
  estimate -0.380952381 mm. End/constraint singularities are not used for safety.
- Cylinder: 40 × 4 Q2 axisymmetric, axial strain fixed zero. Inner radial
  displacement 2.269841254 μm, checked against the matching Lamé solution.
  The generic scalar force-balance diagnostic is 1 for this axisymmetric
  case; it is not advertised as passing a full engineering verification gate.
- Steady heat: 80 × 16 Q1, center 60 °C. An explicit zero source with a
  domain-bound measure avoids the runtime's unbound zero-integral issue.
- Transient heat: 80 × 16 Q1, implicit Euler, dt=2 s, 300 increments.
  Center at 600 s: 59.940776620 °C. The plot reads the saved probe history.

All runs are `completed / computed`; analytical spot checks are not a claim
of product-wide verification or an engineering safety certification. No
student-facing AI session success rate was measured. The prompts were
translated into and tested as AgentFEM projects by this assistant.

Only generated plots and a compact numeric record are deployed; solver code,
raw HDF5 fields, local paths, and runtime logs stay outside this frontend repo.
The website uses `public/learn/lessons.json`. The classroom PDF has its own
formal wording in `docs/handout/content.json`, reference values in
`docs/handout/answers.json`, and print figures in `docs/handout/figures/`.
Rebuild with `scripts/build-learning-pdf.py`. The seven-page handout embeds
Songti SC Regular and Heiti SC Medium font subsets. Exercises precede the
two-page reference answers, with independent complete prompts and blank
spaces for student results.

Additional time-step check: dt=1 s on the same mesh gives 59.942987557 °C at
600 s. Maximum difference at shared saved times is 0.132761850 °C; final
difference is 0.002210938 °C. The handout distinguishes computed results
from analytical answers and linear scaling (the 400 N beam value).

Print QA: all seven pages rendered and inspected; corrected unsupported
Unicode superscripts, checked page boundaries and copyable prompt text.

Problem diagrams added: four native vector schematics show dimensions,
loads, constraints, temperature boundaries and the transient initial state.
No predicted response is drawn in the exercise diagrams. Exercise spacing
was adjusted to preserve one exercise per page and the seven-page total.
All seven pages re-rendered and inspected; full prompts remain copyable.

Added an editable Word handout and a second download link. Both formats have
seven pages, matching exercises, diagrams, prompts and reference answers.
Removed the repeated website URL from the PDF footer; three references at
the end identify the interactive tutorial, installation and AI connection
instructions. Word paragraphs and tables remain editable. All seven Word
pages were rendered and visually inspected with explicit macOS Chinese font
configuration for the isolated LibreOffice renderer.
