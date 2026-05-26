<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { SKULL_SPEC, SPINE_ROTATION_SPEED, buildVertebraSpecs } from "../assets/procedural-spine";
  import { readSpineBrandColors } from "../read-brand-colors";
  import { useSpineLanding } from "../spine-context.svelte";
  import type { SpineRegion } from "../spine-regions";

  const spine = useSpineLanding();
  const vertebrae = buildVertebraSpecs();
  const colors = $derived(readSpineBrandColors());

  let rootRotation = $state(0);
  let pulse = $state(0);
  let elapsed = 0;

  function regionIntensity(region: SpineRegion): number {
    if (spine.activeRegion === region) return 0.85 + pulse * 0.15;
    if (spine.activeRegion === "cta" && region === "lumbar") return 0.55 + pulse * 0.1;
    if (spine.activeRegion === "cta") return 0.2;
    return 0.1;
  }

  function emissiveFor(region: SpineRegion): string {
    const intensity = regionIntensity(region);
    if (intensity < 0.2) return colors.muted;
    return colors.emissive;
  }

  function baseColorFor(region: SpineRegion): string {
    const intensity = regionIntensity(region);
    return intensity > 0.5 ? colors.highlight : colors.base;
  }

  useTask((delta) => {
    elapsed += delta;
    pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.4);
    if (spine.reducedMotion || document.hidden) return;
    rootRotation += SPINE_ROTATION_SPEED * delta;
  });
</script>

<T.Group rotation.y={rootRotation}>
  <!-- Skull -->
  <T.Group position.y={SKULL_SPEC.y}>
    <T.Mesh>
      <T.SphereGeometry args={[SKULL_SPEC.radius, 24, 20]} />
      <T.MeshStandardMaterial
        color={baseColorFor("skull")}
        emissive={emissiveFor("skull")}
        emissiveIntensity={regionIntensity("skull") * 0.55}
        roughness={0.55}
        metalness={0.08}
      />
    </T.Mesh>
    <!-- Subtle jaw hint -->
    <T.Mesh position={[0, -SKULL_SPEC.radius * 0.55, SKULL_SPEC.radius * 0.35]}>
      <T.BoxGeometry args={[SKULL_SPEC.radius * 0.9, SKULL_SPEC.radius * 0.35, SKULL_SPEC.radius * 0.5]} />
      <T.MeshStandardMaterial
        color={baseColorFor("skull")}
        emissive={emissiveFor("skull")}
        emissiveIntensity={regionIntensity("skull") * 0.3}
        roughness={0.6}
        metalness={0.05}
      />
    </T.Mesh>
  </T.Group>

  {#each vertebrae as vert, i (i)}
    <T.Mesh position.y={vert.y}>
      <T.CylinderGeometry
        args={[vert.radius, vert.radius * 0.88, vert.height, 14]}
      />
      <T.MeshStandardMaterial
        color={baseColorFor(vert.region)}
        emissive={emissiveFor(vert.region)}
        emissiveIntensity={regionIntensity(vert.region) * 0.62}
        roughness={0.52}
        metalness={0.1}
      />
    </T.Mesh>
  {/each}
</T.Group>
