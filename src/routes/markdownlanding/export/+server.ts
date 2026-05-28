import {
  buildLandingCopyDocument,
  buildLandingCopyJson,
  buildLandingCopyMarkdown,
} from "$lib/features/landing/copy/landing-copy-export";
import { parseLandingCopyMarkdown } from "$lib/features/landing/copy/landing-copy-parse";
import type { RequestHandler } from "./$types";

export const prerender = false;

/** Raw markdown / JSON export. HTML UI lives at `/markdownlanding`. */
export const GET: RequestHandler = async ({ url }) => {
  const format = url.searchParams.get("format") ?? "md";

  if (format === "json") {
    return new Response(buildLandingCopyJson(), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  if (format === "parse-preview") {
    const raw = url.searchParams.get("text");
    if (!raw) {
      return new Response(JSON.stringify({ error: "Missing text query param" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
    const parsed = parseLandingCopyMarkdown(raw);
    return new Response(
      JSON.stringify(
        {
          format: parsed.format,
          warnings: parsed.warnings,
          entries: Object.fromEntries(parsed.entries),
        },
        null,
        2,
      ),
      { headers: { "Content-Type": "application/json; charset=utf-8" } },
    );
  }

  const doc = buildLandingCopyDocument();
  const markdown = buildLandingCopyMarkdown(doc);
  const download = url.searchParams.get("download") === "1";

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-store",
      ...(download
        ? {
            "Content-Disposition": `attachment; filename="landing-copy-${doc.generatedAt.slice(0, 10)}.md"`,
          }
        : {}),
    },
  });
};
