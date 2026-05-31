<script lang="ts">

  import { T } from "@threlte/core";
  import ProceduralSpine from "./ProceduralSpine.svelte";
  import SpineCameraRig from "./SpineCameraRig.svelte";
  import { useSpineLanding } from "../spine-context.svelte";
  import { CAMERA_FRAMES } from "../spine-regions";

  const spine = useSpineLanding();
  const initial = CAMERA_FRAMES.skull;

  $effect(() => {
    spine.setSceneReady(true);
    return () => spine.setSceneReady(false);
  });
</script>

<T.PerspectiveCamera
  makeDefault
  position={initial.position}
  fov={38}
  near={0.1}
  far={100}
/>
<T.AmbientLight intensity={0.55} />
<T.DirectionalLight position={[4, 8, 6]} intensity={1.1} />
<T.DirectionalLight position={[-3, 4, -2]} intensity={0.35} color="#f0ebe0" />
<T.PointLight position={[0, 5, 2]} intensity={0.4} distance={12} />

<SpineCameraRig />
<ProceduralSpine />

<!-- Ground fade -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={-0.05}>
  <T.CircleGeometry args={[3.5, 48]} />
  <T.MeshStandardMaterial color="#e8e4da" transparent opacity={0.35} />
</T.Mesh>
