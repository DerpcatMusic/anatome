<script lang="ts">
  import { browser } from "$app/environment";

  interface Props {
    variant?: "hero" | "footer";
  }

  let { variant = "hero" }: Props = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let reducedMotion = $state(true);
  let isDark = $state(false);

  type Blob = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rx: number;
    ry: number;
    color: string;
    alpha: number;
  };

  const HERO_BLOBS_LIGHT: Omit<Blob, "x" | "y">[] = [
    { vx: 0.06, vy: 0.04, rx: 0.5, ry: 0.34, color: "220, 165, 130", alpha: 0.22 },
    { vx: -0.05, vy: 0.05, rx: 0.46, ry: 0.38, color: "200, 115, 100", alpha: 0.18 },
    { vx: 0.04, vy: -0.04, rx: 0.48, ry: 0.32, color: "235, 200, 175", alpha: 0.16 },
    { vx: -0.03, vy: -0.03, rx: 0.4, ry: 0.36, color: "175, 95, 88", alpha: 0.12 },
  ];

  const HERO_BLOBS_DARK: Omit<Blob, "x" | "y">[] = [
    { vx: 0.05, vy: 0.04, rx: 0.52, ry: 0.36, color: "55, 58, 68", alpha: 0.2 },
    { vx: -0.04, vy: 0.05, rx: 0.44, ry: 0.4, color: "48, 52, 62", alpha: 0.16 },
    { vx: 0.04, vy: -0.04, rx: 0.46, ry: 0.34, color: "62, 48, 52", alpha: 0.12 },
  ];

  const FOOTER_BLOBS_LIGHT: Omit<Blob, "x" | "y">[] = [
    { vx: 0.04, vy: 0.03, rx: 0.55, ry: 0.42, color: "130, 52, 48", alpha: 0.35 },
    { vx: -0.05, vy: 0.03, rx: 0.48, ry: 0.38, color: "85, 105, 82", alpha: 0.22 },
    { vx: 0.03, vy: -0.04, rx: 0.44, ry: 0.4, color: "95, 68, 58", alpha: 0.28 },
  ];

  const FOOTER_BLOBS_DARK: Omit<Blob, "x" | "y">[] = [
    { vx: 0.04, vy: 0.03, rx: 0.55, ry: 0.42, color: "42, 44, 52", alpha: 0.28 },
    { vx: -0.04, vy: 0.03, rx: 0.48, ry: 0.38, color: "38, 42, 48", alpha: 0.2 },
    { vx: 0.03, vy: -0.04, rx: 0.44, ry: 0.4, color: "32, 34, 40", alpha: 0.24 },
  ];

  function readDark(): boolean {
    if (!browser) return false;
    const theme = document.documentElement.dataset.theme;
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  $effect(() => {
    if (!browser || !canvas) return;

    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    isDark = readDark();

    const themeObserver = new MutationObserver(() => {
      isDark = readDark();
      seed();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const schemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      if (!document.documentElement.dataset.theme) {
        isDark = schemeMq.matches;
        seed();
      }
    };
    schemeMq.addEventListener("change", onScheme);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let blobs: Blob[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let ow = 0;
    let oh = 0;
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d");
    if (!offCtx) return;

    const blobDefs = () => {
      const dark = isDark;
      if (variant === "footer") return dark ? FOOTER_BLOBS_DARK : FOOTER_BLOBS_LIGHT;
      return dark ? HERO_BLOBS_DARK : HERO_BLOBS_LIGHT;
    };

    const seed = () => {
      const defs = blobDefs();
      blobs = defs.map((d, i) => ({
        ...d,
        x: 0.2 + (i * 0.17) % 0.6,
        y: variant === "footer" ? 0.45 + (i * 0.14) % 0.4 : 0.15 + (i * 0.13) % 0.5,
      }));
    };

    const paintBase = () => {
      const styles = getComputedStyle(document.documentElement);
      const base = styles.getPropertyValue("--mesh-base").trim() || "oklch(98% 0.02 88)";
      const end = styles.getPropertyValue("--mesh-base-end").trim() || "oklch(95% 0.03 75)";
      const g = offCtx.createLinearGradient(0, 0, ow, oh);
      g.addColorStop(0, base);
      g.addColorStop(1, end);
      offCtx.fillStyle = g;
      offCtx.fillRect(0, 0, ow, oh);
    };

    const paintBlobs = () => {
      offCtx.globalCompositeOperation = "lighter";

      for (const b of blobs) {
        if (!reducedMotion) {
          b.x += b.vx * 0.001;
          b.y += b.vy * 0.001;
          if (b.x < 0.08 || b.x > 0.92) b.vx *= -1;
          if (b.y < 0.08 || b.y > 0.92) b.vy *= -1;
        }

        const px = b.x * ow;
        const py = b.y * oh;
        const rx = b.rx * Math.min(ow, oh);
        const ry = b.ry * Math.min(ow, oh);

        offCtx.save();
        offCtx.translate(px, py);
        offCtx.scale(1, ry / rx);
        const g = offCtx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, `rgba(${b.color}, ${b.alpha})`);
        g.addColorStop(0.4, `rgba(${b.color}, ${b.alpha * 0.45})`);
        g.addColorStop(0.75, `rgba(${b.color}, ${b.alpha * 0.08})`);
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        offCtx.fillStyle = g;
        offCtx.beginPath();
        offCtx.arc(0, 0, rx, 0, Math.PI * 2);
        offCtx.fill();
        offCtx.restore();
      }

      offCtx.globalCompositeOperation = "source-over";
    };

    const draw = (_t: number) => {
      paintBase();
      paintBlobs();

      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(off, 0, 0, ow, oh, 0, 0, w, h);

      if (!reducedMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    const resize = () => {
      isDark = readDark();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = 0.32;
      ow = Math.max(1, Math.floor(w * scale));
      oh = Math.max(1, Math.floor(h * scale));
      off.width = ow;
      off.height = oh;

      draw(0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      schemeMq.removeEventListener("change", onScheme);
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="mesh-canvas"
  class:mesh-canvas--footer={variant === "footer"}
  aria-hidden="true"
></canvas>
