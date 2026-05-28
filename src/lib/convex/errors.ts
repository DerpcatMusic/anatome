/** Surface Convex mutation failures; generic "Server Error" hides thrown messages in some clients. */
export function convexMutationErrorMessage(reason: unknown, fallback: string): string {
  if (typeof reason === "object" && reason !== null && "data" in reason) {
    const data = (reason as { data: unknown }).data;
    if (typeof data === "string" && data.trim() !== "") {
      return data;
    }
  }

  if (reason instanceof Error) {
    const message = reason.message.trim();
    if (message !== "" && message !== "Server Error") {
      return message;
    }
  }

  return fallback;
}
