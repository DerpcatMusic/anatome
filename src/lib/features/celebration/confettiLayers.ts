import type { CreditPool } from "$lib/features/credits/types";
import type { CelebrationKind, CelebrationMagnitude } from "./celebration.svelte";

/** Props for one `svelte-confetti` layer. */
export type ConfettiLayer = {
  amount?: number;
  x?: [number, number];
  y?: [number, number];
  size?: number;
  cone?: boolean;
  rounded?: boolean;
  noGravity?: boolean;
  duration?: number;
  delay?: [number, number];
  colorRange?: [number, number];
  colorArray?: string[];
  xSpread?: number;
};

export type CelebrationPlacement =
  | "edge-top-left"
  | "edge-top-right"
  | "edge-bottom-left"
  | "edge-bottom-right";

export type CelebrationScene = {
  placement: CelebrationPlacement;
  layers: ConfettiLayer[];
};

export type BurstProfile = {
  magnitude: CelebrationMagnitude;
  kind: CelebrationKind;
  intensity: number;
  pool?: CreditPool;
};

const GOLD_SPECULAR: string[] = [
  "linear-gradient(135deg, #fffef2 0%, #ffe566 22%, #ffd700 48%, #c9a227 72%, #8b6914 100%)",
  "linear-gradient(160deg, #ffffff 0%, #fff4c4 35%, #ffd700 65%, #b8860b 100%)",
  "#ffd700",
  "#fff8dc",
  "#f5e6a8",
];

const PARTY_MIX: string[] = [
  "#ff006e",
  "#fb5607",
  "#ffbe0b",
  "#8338ec",
  "#3a86ff",
  "#06d6a0",
  "#ffd700",
  "#ffffff",
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
];

const LEARN_VIOLET: string[] = [
  "var(--credit-vod)",
  "oklch(68% 0.16 285)",
  "oklch(78% 0.1 300)",
  "#c4b5fd",
  "#ffffff",
];

const TOGETHER_BLUE: string[] = [
  "var(--credit-live)",
  "oklch(62% 0.2 245)",
  "oklch(75% 0.14 230)",
  "#7dd3fc",
  "#ffffff",
];

const PREMIUM_GOLD: string[] = [...GOLD_SPECULAR, "var(--credit-private)", "#fffef2"];

/** Aim vectors — multipliers × viewport reach (see CelebrationConfettiHost CSS). */
const AIM = {
  topLeft: { x: [0.9, 3.4] as [number, number], y: [-2.8, -0.15] as [number, number] },
  topRight: { x: [-3.4, -0.9] as [number, number], y: [-2.8, -0.15] as [number, number] },
  bottomLeft: { x: [1, 3.6] as [number, number], y: [0.85, 2.4] as [number, number] },
  bottomRight: { x: [-3.6, -1] as [number, number], y: [0.85, 2.4] as [number, number] },
} as const;

function accentPalette(profile: BurstProfile): string[] {
  if (profile.kind === "credit" && profile.pool === "vod") return [...PARTY_MIX, ...LEARN_VIOLET];
  if (profile.kind === "credit" && profile.pool === "live") return [...PARTY_MIX, ...TOGETHER_BLUE];
  if (profile.kind === "credit" && profile.pool === "oneOnOne") return [...PARTY_MIX, ...PREMIUM_GOLD];
  if (profile.intensity >= 3) return [...PARTY_MIX, ...GOLD_SPECULAR];
  return [...PARTY_MIX, "var(--primary)", "var(--secondary)"];
}

function aimFor(corner: CelebrationPlacement) {
  switch (corner) {
    case "edge-top-left":
      return AIM.topLeft;
    case "edge-top-right":
      return AIM.topRight;
    case "edge-bottom-left":
      return AIM.bottomLeft;
    case "edge-bottom-right":
      return AIM.bottomRight;
  }
}

function cornerCannon(
  corner: CelebrationPlacement,
  colors: string[],
  amount: number,
  opts: Partial<ConfettiLayer> = {},
): CelebrationScene {
  return {
    placement: corner,
    layers: [
      {
        amount,
        cone: true,
        size: 9,
        delay: [0, 720],
        duration: 3800,
        xSpread: 0.55,
        colorArray: colors,
        ...aimFor(corner),
        ...opts,
      },
    ],
  };
}

/** Four corners + optional second volley per corner. */
function edgeCannonShow(
  colors: string[],
  stream: number,
  tier: number,
  power: "ribbon" | "triumph" = "ribbon",
): CelebrationScene[] {
  const stagger = tier * 120;
  const secondVolley = Math.round(stream * (power === "triumph" ? 0.85 : 0.55));
  const size = power === "triumph" ? 11 : 8;

  const corners: CelebrationPlacement[] = [
    "edge-top-left",
    "edge-top-right",
    "edge-bottom-left",
    "edge-bottom-right",
  ];

  const scenes: CelebrationScene[] = [];

  for (const corner of corners) {
    const isBottom = corner.includes("bottom");
    scenes.push(
      cornerCannon(corner, colors, stream, {
        delay: [0, 550 + stagger],
        duration: 3600 + tier * 200,
        size,
        xSpread: power === "triumph" ? 0.62 : 0.52,
      }),
      cornerCannon(corner, colors, secondVolley, {
        delay: [280 + stagger, 1100 + stagger],
        duration: 4200 + tier * 150,
        size: size - 1,
        xSpread: 0.58,
        ...(isBottom ? { y: [1.1, 2.6] as [number, number] } : { y: [-3.2, -0.4] as [number, number] }),
      }),
    );
  }

  return scenes;
}

function nudgeScenes(profile: BurstProfile): CelebrationScene[] {
  const colors =
    profile.pool === "vod"
      ? LEARN_VIOLET
      : profile.pool === "live"
        ? TOGETHER_BLUE
        : profile.pool === "oneOnOne"
          ? PREMIUM_GOLD
          : PARTY_MIX;

  return [
    cornerCannon("edge-bottom-left", colors, 28, {
      size: 8,
      delay: [0, 200],
      duration: 3000,
      x: [0.6, 2.2],
      y: [0.7, 1.8],
    }),
    cornerCannon("edge-bottom-right", colors, 28, {
      size: 8,
      delay: [40, 240],
      duration: 3000,
      x: [-2.2, -0.6],
      y: [0.7, 1.8],
    }),
  ];
}

function pickScenes(profile: BurstProfile): CelebrationScene[] {
  const tier = Math.min(3, Math.max(0, profile.intensity)) as 0 | 1 | 2 | 3;
  const colors = accentPalette(profile);
  const stream = 55 + tier * 25;
  return edgeCannonShow(colors, stream, tier, "ribbon");
}

function triumphScenes(profile: BurstProfile): CelebrationScene[] {
  const colors = accentPalette(profile);
  const goldHeavy = profile.intensity >= 2 || profile.pool === "oneOnOne";
  const mainColors = goldHeavy ? [...PARTY_MIX, ...PREMIUM_GOLD] : colors;
  const heavy = 110 + profile.intensity * 35;

  return [
    ...edgeCannonShow(mainColors, heavy, profile.intensity, "triumph"),
    cornerCannon("edge-bottom-left", mainColors, Math.round(heavy * 0.7), {
      size: 14,
      delay: [0, 400],
      duration: 4200,
      x: [1.2, 4],
      y: [1, 2.8],
      xSpread: 0.68,
    }),
    cornerCannon("edge-bottom-right", mainColors, Math.round(heavy * 0.7), {
      size: 14,
      delay: [80, 480],
      duration: 4200,
      x: [-4, -1.2],
      y: [1, 2.8],
      xSpread: 0.68,
    }),
    {
      placement: "edge-top-left",
      layers: [
        {
          amount: 90,
          noGravity: true,
          duration: 2800,
          x: [1, 3.2],
          y: [-1.2, 0.8],
          size: 10,
          delay: [60, 320],
          colorArray: mainColors,
        },
      ],
    },
    {
      placement: "edge-top-right",
      layers: [
        {
          amount: 90,
          noGravity: true,
          duration: 3000,
          x: [-3.2, -1],
          y: [-1.2, 0.8],
          size: 10,
          delay: [100, 360],
          colorArray: mainColors,
        },
      ],
    },
  ];
}

function subscriptionRibbonScenes(profile: BurstProfile): CelebrationScene[] {
  const tier = Math.min(3, Math.max(0, profile.intensity)) as 0 | 1 | 2 | 3;
  const colors = accentPalette(profile);
  const stream = 65 + tier * 28;
  return edgeCannonShow(colors, stream, tier, "ribbon");
}

export function celebrationScenes(profile: BurstProfile): CelebrationScene[] {
  switch (profile.magnitude) {
    case "nudge":
      return nudgeScenes(profile);
    case "pick":
      return pickScenes(profile);
    case "ribbon":
      return subscriptionRibbonScenes(profile);
    case "triumph":
      return triumphScenes(profile);
  }
}

export function fallDistanceForMagnitude(magnitude: CelebrationMagnitude): string {
  switch (magnitude) {
    case "triumph":
      return "140vh";
    case "ribbon":
    case "pick":
      return "125vh";
    default:
      return "110vh";
  }
}

export function burstProfileFromBurst(burst: {
  magnitude: CelebrationMagnitude;
  kind: CelebrationKind;
  intensity: number;
  pool?: CreditPool;
}): BurstProfile {
  return {
    magnitude: burst.magnitude,
    kind: burst.kind,
    intensity: burst.intensity,
    pool: burst.pool,
  };
}
