<script lang="ts">
  import { useThrelte, useTask } from "@threlte/core";
  import { Vector3 } from "three";
  import { useSpineLanding } from "../spine-context.svelte";

  const { camera } = useThrelte();
  const spine = useSpineLanding();

  const targetPos = new Vector3();
  const targetLook = new Vector3();
  const smoothPos = new Vector3();
  const smoothLook = new Vector3();
  let initialized = false;

  $effect(() => {
    const frame = spine.activeSection.camera;
    targetPos.set(...frame.position);
    targetLook.set(...frame.lookAt);
    if (!initialized && camera.current) {
      smoothPos.copy(targetPos);
      smoothLook.copy(targetLook);
      initialized = true;
    }
  });

  useTask((delta) => {
    const cam = camera.current;
    if (!cam) return;

    const t = 1 - Math.exp(-6 * delta);
    smoothPos.lerp(targetPos, t);
    smoothLook.lerp(targetLook, t);
    cam.position.copy(smoothPos);
    cam.lookAt(smoothLook);
  });
</script>
