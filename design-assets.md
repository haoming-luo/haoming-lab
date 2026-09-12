# Homepage art and motion

Selected visual: first displayed concept, exec-32bc1ce1-36aa-4a54-9c6b-b2a3d4917826.png.

Hero made with built-in ImageGen, based on the selected concept. Final prompt: preserve the silver organic bracket shape, viewpoint, lighting and cyan finite-element mesh; replace background and openings with pure black RGB(0,0,0); no text, floor or shadow; whole object uncropped. Source result: exec-ecbbf716-59d7-49ea-9228-0aab162e7ae8.png. Optimized runtime assets: public/assets/bracket-hero.webp and bracket-hero-small.webp.

Black-background raster is independently composited with lighten blending. This is 2.5D parallax, not a rotatable 3D model, AI-generated video or computed stress visualization. Typography and links are DOM content. No animation library, video download, external fonts, backend or model weights are required on the homepage.

Second scene (September 12 refinement): transparent rotor render from existing PhysicsTwin/native/lp_rotor.blend, using Blender Cycles and scripts/render-home-rotor.py. Original CAD/GLB is not copied into the public project. public/assets/rotor-hero.webp is 68,208 bytes. Desktop requests it after scroll begins; mobile uses native lazy loading. Main text switches to the right and rotor appears on the left. Native overscroll is disabled on the page, and ambient float stops at the end.

Desktop scroll drives two text scenes and a restrained image transform; mobile uses natural document flow. Reduced motion and the pause control suppress spatial movement. No wheel interception. Tabler arrow icon is distributed with its MIT license.
