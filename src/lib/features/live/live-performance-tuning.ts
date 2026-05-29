import type { PublishProfileInput } from "./live-publish-profile";

export type BrowserMediaProfile = {
  engine: "firefox" | "chromium" | "safari" | "other";
  platform: string;
  /** WebRTC hardware encode/decode is browser + OS dependent; not controllable from app code. */
  hardwareAccelLikely: boolean;
  hints: string[];
};

export function detectBrowserMediaProfile(): BrowserMediaProfile {
  if (typeof navigator === "undefined") {
    return { engine: "other", platform: "", hardwareAccelLikely: false, hints: [] };
  }

  const ua = navigator.userAgent;
  const engine: BrowserMediaProfile["engine"] = /firefox/i.test(ua)
    ? "firefox"
    : /safari/i.test(ua) && !/chrome|chromium/i.test(ua)
      ? "safari"
      : /chrome|chromium|edg/i.test(ua)
        ? "chromium"
        : "other";

  const platform = navigator.platform || "";
  const linux = /linux/i.test(platform) || /linux/i.test(ua);
  const firefoxOnLinux = engine === "firefox" && linux;

  const hints: string[] = [];
  if (firefoxOnLinux) {
    hints.push(
      "Firefox על Linux: ודאי VA-API (about:config → media.ffmpeg.vaapi.enabled=true) ו־libva-intel/amd. בלי זה הקידוד לרוב על CPU.",
    );
  }
  if (engine === "firefox") {
    hints.push("לשידור חלק ב-Firefox: H.264, 30fps, בלי סימולקאסט — פחות עומס CPU.");
  }
  hints.push(
    "60fps = כפול עומס קידוד. לכיתת כושר 30fps בדרך כלל מספיק; השתמשי ב-60 רק אם המצלמה והמעבד מסתדרים.",
  );

  const hardwareAccelLikely =
    engine === "chromium" && !linux
      ? true
      : engine === "safari"
        ? true
        : engine === "chromium" && linux
          ? true
          : !firefoxOnLinux;

  return { engine, platform, hardwareAccelLikely, hints };
}

/**
 * Simulcast + backup codec + 60fps together can peg CPU (3+ encoders).
 * LiveKit: backupCodec defaults on; dual-codec mode is explicitly heavy.
 */
export function effectivePublishInput(input: PublishProfileInput): PublishProfileInput {
  let simulcastEnabled = input.simulcastEnabled;

  if (input.selectedFramerate > 30) {
    simulcastEnabled = false;
  }

  return { ...input, simulcastEnabled };
}

export function shouldEnableDynacast(input: PublishProfileInput): boolean {
  const effective = effectivePublishInput(input);
  return effective.simulcastEnabled && effective.selectedCodec !== "vp9" && effective.selectedCodec !== "av1";
}

export function publishPerformanceWarnings(input: PublishProfileInput): string[] {
  const warnings: string[] = [];
  const effective = effectivePublishInput(input);

  if (input.selectedFramerate > 30 && input.simulcastEnabled) {
    warnings.push("סימולקאסט כבוי אוטומטית ב-60fps — אחרת CPU קופץ.");
  }
  if (input.selectedFramerate > 30) {
    warnings.push("60fps דורש מצלמה + מעבד חזקים; אם CPU גבוה, נסי 30fps.");
  }
  if (!effective.simulcastEnabled && input.simulcastEnabled) {
    warnings.push("סימולקאסט הושבת בגלל פריימרייט.");
  }

  return warnings;
}
