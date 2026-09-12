# Homepage design QA — 2026-09-12

final result: passed

## Reference and evidence

- Source visual truth: `/Users/luo/.codex/generated_images/01a08172-a7d0-7741-aba1-c9af4a1b09d7/exec-32bc1ce1-36aa-4a54-9c6b-b2a3d4917826.png` (first selected concept, 1487 × 1058 px).
- Browser-rendered implementation: `docs/qa/lab-desktop-final.png`; local URL http://127.0.0.1:8785/.
- Full-view same-input comparison: `docs/qa/lab-comparison.png`, reference and implementation side by side. CSS viewport 1487 × 1058 inside a browser iframe, display scale .65. Screenshot crop 967 × 688; reference normalized to the same size. This is a real browser render, not a code mock.
- Additional direct desktop viewport: 1280 × 720; second scene in `docs/qa/lab-chapter.png`.
- Mobile: 390 × 844 CSS px, displayed at .8 scale in `docs/qa/lab-mobile.png`; also checked direct 636 × 782 narrow viewport and scrolled through to footer.
- State: initial hero, second scroll scene, primary link, motion pause.

## Findings and comparison history

1. P2: black asset rectangle visible on transparent isolated scene. Fixed by explicitly setting scene background before lighten compositing. Recapture shows seamless object/background blending.
2. P2: large LAB wordmark overlapped entry in short desktop. Added short-height type scale. Direct 1280 × 720 check shows entry clear of wordmark.
3. P2: end-of-scroll structure tip clipped. Reduced zoom/rotation and increased downward translation. Revised `lab-chapter.png` shows entire object clear of viewport edges.

No remaining actionable P0/P1/P2 findings in checked states.

## Required fidelity surfaces

- Typography: editable HTML, system Helvetica/PingFang/Microsoft YaHei stack; matches clean sans-serif hierarchy. Main slogan retains selected line breaks. Supporting copy is readable at actual desktop scale. No external font wait.
- Layout: left heading/project entry, right independent structure, outlined LAB at bottom. Mobile intentionally stacks these regions. No boxed project card added. Scene two is a user-requested extension beyond reference.
- Colors: near-black background, cool white/silver and restrained cyan; muted readable body text. Plain background and absent floor reflection are intentional to support independent floating asset, not a pasted poster.
- Image fidelity: same silver organic bracket and cyan mesh art direction. AI asset recreated as a separate image with pure black background; no CSS geometry substitute. WebP 157,520 bytes desktop, 58,928 bytes mobile. No visible black rectangle in final captures. Raster translation is not represented as real 3D rotation.
- Copy: selected main slogan; user-supplied secondary slogan; real project entry. Removed tiny decorative English annotations and scientific claim-like labels from mock to keep homepage concise.
- Icons: Tabler MIT arrow, local file; licensed and visible with cyan tint.
- Focused review: headline, project copy and CTA checked in direct unscaled 1280 × 720 screenshot; no truncation. Full-view comparison alone not used for small text review.

## Interaction and performance checks

- PageDown advances to second scene; inactive scene links use inert/aria-hidden to avoid invisible focus targets.
- Start exploring navigates to real structural-design page.
- Search completes: 48 candidates, 38 eligible, 1.742 → 1.121 kg, stored prediction displayed.
- Pause changes label to 开启动效 and pressed state; mobile scroll reaches project and footer naturally.
- Browser error logs empty in checked final homepage states.
- Reduced-motion implemented; physical iPhone/Windows testing not performed this turn.
- Static lab full data/CAD tests, home asset and size-budget tests, and production build pass.

## Follow-up polish

- P3: Windows font rendering and physical-device scroll feel should be checked on those devices when convenient.
- Future true camera rotation would require video/sequence or a 3D asset; not part of this lightweight parallax implementation.
