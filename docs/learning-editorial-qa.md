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
All formats share prompts from `public/learn/lessons.json`. Classroom-only
explanations remain in `docs/handout/content.json`, reference values in
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

2026-10-08: Beam result now uses equal geometric scales and a tip detail;
values unchanged. Exercise diagram uses one resultant arrow labelled as
the resultant of the uniformly distributed end-face load. Added a single
download disclosure for PDF, Word and a self-contained offline HTML page.
An isolated Chrome test with networking disabled verified embedded images,
clipboard writing, legacy copy/paste, manual-selection fallback, Escape and
outside-click closing, and the download menu at 390 px width. MHTML is not
the supported interactive download because Chromium disables its scripts.

Unified prompts: website, offline HTML, PDF and Word now use the same ten
prompt blocks. Common instructions appear once, before the four exercises;
per-exercise prompts retain geometry, material, boundary conditions and
outputs without repeated workflow instructions. Extracted text matches the
canonical prompts in both rendered documents after whitespace normalization.
Both documents remain seven pages; every page was visually inspected.
The acknowledgment and editable Word footer placeholder are preserved.

Trilingual web edition: Chinese, English and French pages share the layout,
with complete translated lesson prose, prompts, UI feedback and figure labels.
Numerical results and modelling conditions are unchanged. English/French
figures were regenerated from the same computed samples. All three languages
are embedded in one offline HTML download. Browser checks
cover 1440 px and 390 px layouts, language switching, loaded figures and
clipboard equality; the existing copy fallback regression remains in place.

Localized handouts: English and French PDF and Word editions now follow the
selected page language. Each has seven pages, translated diagrams and plots,
the same numerical answers, references and acknowledgment. All pages of all
four documents were rendered and visually inspected. Extracted text matches
all ten canonical prompts for each language after whitespace normalization.
Latin editions use Times New Roman body text and Arial headings. Word footer
placeholders are editable and localized. Chinese files are unchanged.
Language switching no longer carries a stale exercise anchor; online and
offline regression checks confirm switching from #steady returns to the top.

Concise common instructions: all three languages now request one result figure,
key values with units, and only two or three explanatory sentences. The initial
reply remains readiness-only; no guessing or premature calculation. All four
exercise prompts and reference answers are unchanged. Website, offline HTML,
PDF and Word use the canonical language JSON. All six handouts remain seven
pages; every rendered page was visually inspected. Text extraction verifies
all ten prompt blocks in each PDF and each rendered Word document. Learning
tests, static-demo tests and the production build pass.

Acknowledgments update: moved the acknowledgment from page 1 to the end of
page 7, after references, in Chinese, English and French PDF/Word editions.
Added Professor Meng Wang of Beijing Institute of Technology for first
proposing AI-native finite-element simulation in the classroom, alongside
Renzi Bai's Windows installation validation and handout contribution.
Modestly resized the last-page plots to retain seven pages without deleting
teaching content. All 42 pages visually checked; all ten prompts verified in
each PDF and rendered Word file. Both names appear only on the final page.
