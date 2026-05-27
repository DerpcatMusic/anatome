export type MediaSessionTrack = {
  title: string;
  artist?: string;
  artworkUrl?: string | null;
};

export function syncMediaSession(track: MediaSessionTrack | null): void {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

  if (!track) {
    navigator.mediaSession.metadata = null;
    return;
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist ?? "AnatoMe",
    album: "AnatoMe",
    artwork: track.artworkUrl
      ? [{ src: track.artworkUrl, sizes: "512x512", type: "image/png" }]
      : [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  });
}

export async function requestVideoPiP(
  element: HTMLElement | null,
): Promise<void> {
  if (!element || !document.pictureInPictureEnabled) return;
  const video = element.shadowRoot?.querySelector("video") ?? element.querySelector("video");
  if (!(video instanceof HTMLVideoElement)) return;
  if (document.pictureInPictureElement === video) return;
  try {
    await video.requestPictureInPicture();
  } catch {
    /* user dismissed or unsupported */
  }
}
