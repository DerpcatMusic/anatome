# Spine 3D assets (`/concept`)

The `/concept` landing uses a **procedural hybrid spine** built in code ([`procedural-spine.ts`](../../src/lib/features/landing-spine/assets/procedural-spine.ts)) for region-based emissive highlights without an external GLTF.

## Replacing with a licensed GLTF (Phase C)

1. Model in Blender: skull + segmented spine (`skull`, `cervical`, `thoracic`, `lumbar`, `sacrum`, `coccyx` object names).
2. Export **glTF 2.0 + Draco** (~500KB–2MB target).
3. Place at `static/landing-spine/spine-hybrid.glb`.
4. Swap `ProceduralSpine.svelte` for `useGltf` from `@threlte/extras` and map mesh names in `spine-regions.ts`.

License medical/educational meshes only for commercial use. Do not ship unlicensed Sketchfab assets.

## Poster

LCP poster reuses `/landing/session-anatomy.webp` until a dedicated spine render exists.
