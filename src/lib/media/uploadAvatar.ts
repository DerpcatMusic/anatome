export async function uploadAvatar(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
): Promise<{ storageId: string }> {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!response.ok) {
    throw new Error(`העלאת התמונה נכשלה (${response.status})`);
  }
  return response.json() as Promise<{ storageId: string }>;
}
