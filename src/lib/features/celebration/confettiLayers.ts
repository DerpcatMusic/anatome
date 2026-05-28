import type { CreditPool } from "$lib/features/credits/types";
import { creditPoolPrestige } from "$lib/features/credits/creditPoolTheme";
import { creditExcitementLevel } from "./creditCelebration";
import type {
  CelebrationBurstSource,
  CelebrationKind,
  CelebrationMagnitude,
} from "./celebration.svelte";

/** Props for one `svelte-confetti` layer — tuned for library-native linear physics. */
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
  quantity?: number;
  source?: CelebrationBurstSource;
};

const GOLD_SPECULAR: string[] = [
  "linear-gradient(135deg, #fffef2 0%, #ffe566 22%, #ffd700 48%, #c9a227 72%, #8b6914 100%)",
  "linear-gradient(160deg, #ffffff 0%, #fff4c4 35%, #ffd700 65%, #b8860b 100%)",
  "#ffd700",
  "#fff8dc",
];

const PARTY_MIX: string[] = [
  "#ff006e",
  "#fb5607",
  "#ffbe0b",
  "#8338ec",
  "#3a86ff",
  "#ffd700",
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
];

const LEARN_VIOLET: string[] = ["var(--credit-vod)", "#c4b5fd", "#e9d5ff", "#ffffff"];
const TOGETHER_BLUE: string[] = ["var(--credit-live)", "#7dd3fc", "#38bdf8", "#ffffff"];
const PREMIUM_GOLD: string[] = [...GOLD_SPECULAR, "var(--credit-private)", "#fffef2"];

const AIM = {
  topLeft: { x: [0.6, 2.8] as [number, number], y: [-2.2, -0.1] as [number, number] },
  topRight: { x: [-2.8, -0.6] as [number, number], y: [-2.2, -0.1] as [number, number] },
  bottomLeft: { x: [0.7, 2.9] as [number, number], y: [0.5, 1.8] as [number, number] },
  bottomRight: { x: [-2.9, -0.7] as [number, number], y: [0.5, 1.8] as [number, number] },
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

/**
 * Official “feathered cone” pattern — main blast + two side sprays per corner.
 * @see https://mitcheljager.github.io/svelte-confetti/
 */
function featheredCorner(
  corner: CelebrationPlacement,
  colors: string[],
  mainAmount: number,
  opts: {
    duration?: number;
    delay?: [number, number];
    size?: number;
    rounded?: boolean;
    wings?: boolean;
  } = {},
): CelebrationScene {
  const aim = aimFor(corner);
  const isLeft = corner.includes("left");
  const duration = opts.duration ?? 3200;
  const delay = opts.delay ?? [0, 950];
  const size = opts.size ?? 10;
  const wing = Math.max(14, Math.round(mainAmount * 0.28));
  const withWings = opts.wings !== false;

  const wingA = isLeft
    ? { x: [-0.85, -0.2] as [number, number], y: [0.2, 0.9] as [number, number] }
    : { x: [0.2, 0.85] as [number, number], y: [0.2, 0.9] as [number, number] };
  const wingB = isLeft
    ? { x: [0.25, 1.05] as [number, number], y: [0.15, 0.8] as [number, number] }
    : { x: [-1.05, -0.25] as [number, number], y: [0.15, 0.8] as [number, number] };

  const layers: ConfettiLayer[] = [
    {
      amount: mainAmount,
      cone: true,
      rounded: opts.rounded,
      colorArray: colors,
      size,
      duration,
      delay,
      xSpread: 0.15,
      ...aim,
    },
  ];

  if (withWings) {
    layers.push(
      {
        amount: wing,
        cone: true,
        colorArray: colors,
        size: size - 1,
        duration: duration + 150,
        delay: [30, delay[1] + 80],
        xSpread: 0.15,
        ...wingA,
      },
      {
        amount: wing,
        cone: true,
        colorArray: colors,
        size: size - 1,
        duration: duration + 250,
        delay: [60, delay[1] + 160],
        xSpread: 0.15,
        ...wingB,
      },
    );
  }

  return { placement: corner, layers };
}

function sparkCorner(
  corner: CelebrationPlacement,
  colors: string[],
  amount: number,
  opts: {
    duration?: number;
    delay?: [number, number];
    size?: number;
  } = {},
): CelebrationScene {
  const aim = aimFor(corner);
  return {
    placement: corner,
    layers: [
      {
        amount,
        cone: true,
        colorArray: colors,
        size: opts.size ?? 6,
        duration: opts.duration ?? 2400,
        delay: opts.delay ?? [0, 320],
        xSpread: 0.12,
        ...aim,
      },
    ],
  };
}

function creditPalette(pool: CreditPool): string[] {
  switch (pool) {
    case "vod":
      return LEARN_VIOLET;
    case "live":
      return TOGETHER_BLUE;
    case "oneOnOne":
      return PREMIUM_GOLD;
  }
}

const CORNERS: CelebrationPlacement[] = [
  "edge-top-left",
  "edge-top-right",
  "edge-bottom-left",
  "edge-bottom-right",
];

function edgeFeatheredShow(
  colors: string[],
  mainAmount: number,
  tier: number,
  power: "ribbon" | "triumph",
): CelebrationScene[] {
  const delaySpread = power === "triumph" ? 1400 : 1050;
  const duration = power === "triumph" ? 3600 : 3200;
  const size = power === "triumph" ? 11 : 9;

  const scenes = CORNERS.map((corner, index) =>
    featheredCorner(corner, colors, mainAmount + tier * 8, {
      duration: duration + index * 80,
      delay: [index * 40, delaySpread + tier * 60],
      size,
      rounded: power === "triumph",
    }),
  );

  if (power === "triumph") {
    for (const corner of CORNERS) {
      const aim = aimFor(corner);
      scenes.push({
        placement: corner,
        layers: [
          {
            amount: 35 + tier * 10,
            cone: true,
            colorArray: colors,
            size: 8,
            duration: 2200,
            delay: [0, 500],
            xSpread: 0.2,
            x: [aim.x[0] * 0.6, aim.x[1] * 0.85],
            y: [aim.y[0] * 0.5, aim.y[1] * 0.7],
          },
        ],
      });
    }
  }

  return scenes;
}

function creditNudgeScenes(profile: BurstProfile): CelebrationScene[] {
  const pool = profile.pool ?? "vod";
  const qty = profile.quantity ?? 1;
  const level = creditExcitementLevel(pool, qty);
  const colors = creditPalette(pool);

  if (level === 0) {
    return [
      sparkCorner("edge-bottom-left", colors, 8 + Math.min(4, qty - 1), {
        duration: 2200,
        delay: [0, 280],
        size: 5,
      }),
    ];
  }

  if (level === 1) {
    const amount = 14 + Math.min(8, qty);
    return [
      sparkCorner("edge-bottom-left", colors, amount, { duration: 2500, delay: [0, 420], size: 6 }),
      sparkCorner("edge-bottom-right", colors, amount, {
        duration: 2500,
        delay: [40, 480],
        size: 6,
      }),
    ];
  }

  const main = level === 2 ? 22 + Math.min(12, qty * 2) : 34 + Math.min(18, qty * 2);
  const corners: CelebrationPlacement[] =
    level === 3
      ? ["edge-bottom-left", "edge-bottom-right", "edge-top-left", "edge-top-right"]
      : ["edge-bottom-left", "edge-bottom-right"];

  return corners.map((corner, i) =>
    featheredCorner(corner, colors, main, {
      duration: level === 3 ? 3000 : 2700,
      delay: [i * 25, level === 3 ? 900 : 620],
      size: level === 3 ? 9 : 7,
      wings: level >= 2,
      rounded: level === 3,
    }),
  );
}

function nudgeScenes(profile: BurstProfile): CelebrationScene[] {
  if (profile.kind === "credit" && profile.pool) {
    return creditNudgeScenes(profile);
  }
  return creditNudgeScenes({ ...profile, pool: "live", quantity: 1 });
}

function pickScenes(profile: BurstProfile): CelebrationScene[] {
  const tier = Math.min(3, Math.max(0, profile.intensity)) as 0 | 1 | 2 | 3;
  return edgeFeatheredShow(accentPalette(profile), 42, tier, "ribbon");
}

function subscriptionRibbonScenes(profile: BurstProfile): CelebrationScene[] {
  const tier = Math.min(3, Math.max(0, profile.intensity)) as 0 | 1 | 2 | 3;
  return edgeFeatheredShow(accentPalette(profile), 58, tier, "ribbon");
}

function creditPurchaseScenes(profile: BurstProfile): CelebrationScene[] {
  const pool = profile.pool ?? "vod";
  const qty = profile.quantity ?? 1;
  const level = creditExcitementLevel(pool, qty);
  const colors = creditPalette(pool);
  const prestige = creditPoolPrestige(pool);

  if (level === 0) {
    return [
      sparkCorner("edge-bottom-left", colors, 12 + Math.min(6, qty), {
        duration: 2600,
        delay: [0, 400],
        size: 6,
      }),
      sparkCorner("edge-bottom-right", colors, 10, { duration: 2600, delay: [80, 520], size: 6 }),
    ];
  }

  if (level === 1) {
    return [
      featheredCorner("edge-bottom-left", colors, 28 + qty, {
        duration: 3000,
        delay: [0, 700],
        size: 8,
        wings: false,
      }),
      featheredCorner("edge-bottom-right", colors, 28 + qty, {
        duration: 3000,
        delay: [60, 760],
        size: 8,
        wings: false,
      }),
    ];
  }

  if (level === 2) {
    return edgeFeatheredShow(
      [...PARTY_MIX, ...colors],
      48 + prestige * 10 + Math.min(20, qty * 2),
      prestige,
      "ribbon",
    );
  }

  const mainColors = [...PARTY_MIX, ...PREMIUM_GOLD];
  const tier = Math.max(prestige, profile.intensity);
  const scenes = edgeFeatheredShow(mainColors, 72 + Math.min(30, qty * 3), tier, "triumph");

  for (const corner of CORNERS) {
    scenes.push(
      featheredCorner(corner, mainColors, 55 + tier * 12 + Math.min(15, qty), {
        duration: 3800,
        delay: [180, 1200],
        size: 12,
        rounded: true,
      }),
    );
  }

  scenes.push({
    placement: "edge-bottom-left",
    layers: [
      {
        amount: 36 + Math.min(24, qty * 4),
        noGravity: true,
        duration: 1400,
        x: [-0.45, 0.45],
        y: [-0.45, 0.45],
        size: 7,
        delay: [0, 200],
        colorArray: mainColors,
      },
    ],
  });
  scenes.push({
    placement: "edge-bottom-right",
    layers: [
      {
        amount: 36 + Math.min(24, qty * 4),
        noGravity: true,
        duration: 1400,
        x: [-0.45, 0.45],
        y: [-0.45, 0.45],
        size: 7,
        delay: [60, 260],
        colorArray: mainColors,
      },
    ],
  });

  return scenes;
}

function triumphScenes(profile: BurstProfile): CelebrationScene[] {
  if (profile.kind === "credit" && profile.pool) {
    return creditPurchaseScenes(profile);
  }

  const colors = accentPalette(profile);
  const goldHeavy = profile.intensity >= 2;
  const mainColors = goldHeavy ? [...PARTY_MIX, ...PREMIUM_GOLD] : colors;
  const tier = profile.intensity;

  const scenes = edgeFeatheredShow(mainColors, 85, tier, "triumph");

  for (const corner of CORNERS) {
    scenes.push(
      featheredCorner(corner, mainColors, 70 + tier * 15, {
        duration: 3800,
        delay: [200, 1300],
        size: 12,
        rounded: true,
      }),
    );
  }

  scenes.push({
    placement: "edge-bottom-left",
    layers: [
      {
        amount: 50,
        noGravity: true,
        duration: 1400,
        x: [-0.45, 0.45],
        y: [-0.45, 0.45],
        size: 7,
        delay: [0, 200],
        colorArray: mainColors,
      },
    ],
  });
  scenes.push({
    placement: "edge-bottom-right",
    layers: [
      {
        amount: 50,
        noGravity: true,
        duration: 1400,
        x: [-0.45, 0.45],
        y: [-0.45, 0.45],
        size: 7,
        delay: [60, 260],
        colorArray: mainColors,
      },
    ],
  });

  return scenes;
}

export function celebrationScenes(profile: BurstProfile): CelebrationScene[] {
  if (profile.kind === "credit" && profile.pool) {
    if (profile.source === "checkout") {
      return creditPurchaseScenes(profile);
    }
    return creditNudgeScenes(profile);
  }

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

export function celebrationBurstLifetimeMs(profile: BurstProfile): number {
  const scenes = celebrationScenes(profile);
  let maxMs = 2800;
  for (const scene of scenes) {
    for (const layer of scene.layers) {
      const delayMax = layer.delay?.[1] ?? 50;
      const duration = layer.duration ?? 2000;
      maxMs = Math.max(maxMs, delayMax + duration + 300);
    }
  }
  return maxMs;
}

export function fallDistanceForMagnitude(
  magnitude: CelebrationMagnitude,
  profile?: BurstProfile,
): string {
  if (profile?.kind === "credit" && profile.pool) {
    const level = creditExcitementLevel(profile.pool, profile.quantity ?? 1);
    if (level === 0) return "55vh";
    if (level === 1) return "70vh";
    if (level === 2) return "88vh";
    return "100vh";
  }

  switch (magnitude) {
    case "triumph":
      return "100vh";
    case "ribbon":
    case "pick":
      return "100vh";
    default:
      return "85vh";
  }
}

export function burstProfileFromBurst(burst: {
  magnitude: CelebrationMagnitude;
  kind: CelebrationKind;
  intensity: number;
  pool?: CreditPool;
  quantity?: number;
  source?: CelebrationBurstSource;
}): BurstProfile {
  return {
    magnitude: burst.magnitude,
    kind: burst.kind,
    intensity: burst.intensity,
    pool: burst.pool,
    quantity: burst.quantity,
    source: burst.source,
  };
}
