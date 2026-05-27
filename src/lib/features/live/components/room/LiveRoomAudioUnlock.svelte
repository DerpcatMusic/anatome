<script lang="ts">
  import type { Room } from "livekit-client";
  import { useStartAudio } from "$lib/livekit/hooks/useStartAudio.svelte";

  let { room }: { room: Room } = $props();

  const { canPlayAudio } = useStartAudio({ room });

  $effect(() => {
    if (canPlayAudio || !room) return;

    const unlock = () => {
      void room.startAudio();
    };

    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    return () => window.removeEventListener("pointerdown", unlock, { capture: true });
  });
</script>
