const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const OUTPUT_SIZE = 256;
const WEBP_QUALITY = 0.8;

export type ProcessedAvatar = {
  blob: Blob;
  width: number;
  height: number;
};

/**
 * Resize and encode avatar uploads for Convex storage.
 * Uses Canvas in the browser (static deploy has no Bun server runtime).
 */
export async function processAvatarFile(file: File): Promise<ProcessedAvatar> {
  if (!file.type.startsWith("image/")) {
    throw new Error("יש להעלות קובץ תמונה בלבד");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("התמונה גדולה מדי (מקסימום 8MB)");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, OUTPUT_SIZE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("לא הצלחנו לעבד את התמונה");

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("לא הצלחנו לשמור את התמונה"));
            return;
          }
          resolve(result);
        },
        "image/webp",
        WEBP_QUALITY,
      );
    });

    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}
