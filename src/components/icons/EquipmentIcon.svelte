<script lang="ts">
  let { name }: { name: string } = $props();

  const icons: Record<string, string> = {
    mat: `<rect x="4" y="14" width="56" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="34" x2="48" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,

    reformer: `<rect x="6" y="20" width="48" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="14" y="16" width="20" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="36" x2="10" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="50" y1="36" x2="50" y2="42" stroke="currentColor" stroke-width="2.5"/><line x1="6" y1="42" x2="54" y2="42" stroke="currentColor" stroke-width="2"/>`,

    cadillac: `<rect x="8" y="12" width="44" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="8" y1="20" x2="52" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="8" y1="40" x2="52" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><circle cx="18" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="42" cy="30" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="52" y1="12" x2="52" y2="6" stroke="currentColor" stroke-width="2"/>`,

    chair: `<rect x="20" y="12" width="20" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="22" x2="40" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="24" y1="40" x2="24" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="36" y1="40" x2="36" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="48" x2="38" y2="48" stroke="currentColor" stroke-width="2"/>`,

    barrel: `<path d="M16 12 C12 12, 8 24, 8 30 C8 36, 12 48, 16 48 L48 48 C52 48, 56 36, 56 30 C56 24, 52 12, 48 12 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="22" x2="52" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="10" y1="30" x2="54" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="12" y1="38" x2="52" y2="38" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,

    magic_circle: `<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="32" cy="10" r="3" fill="currentColor"/><circle cx="32" cy="54" r="3" fill="currentColor"/><circle cx="10" cy="32" r="3" fill="currentColor"/><circle cx="54" cy="32" r="3" fill="currentColor"/>`,

    small_ball: `<circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 24 Q32 18, 46 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><path d="M16 34 Q32 28, 48 34" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>`,

    resistance_band: `<path d="M12 16 Q32 8, 52 16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 32 Q32 24, 52 32" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 48 Q32 40, 52 48" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="12" y1="16" x2="12" y2="48" stroke="currentColor" stroke-width="2"/><line x1="52" y1="16" x2="52" y2="48" stroke="currentColor" stroke-width="2"/>`,

    light_weights: `<rect x="12" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="40" y="20" width="8" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="2.5"/><rect x="24" y="12" width="12" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>`,
  };

  const svgContent = $derived(icons[name] ?? icons.mat);
</script>

<svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  {@html svgContent}
</svg>
