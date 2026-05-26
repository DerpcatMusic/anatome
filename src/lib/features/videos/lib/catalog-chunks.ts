/** Split macroflow videos into at most two horizontal carousel rows. */
export function chunkMacroflowRows<T>(videos: T[], maxPerRow = 12): T[][] {
  if (videos.length === 0) return [[]];
  if (videos.length <= maxPerRow) return [videos];
  const mid = Math.ceil(videos.length / 2);
  return [videos.slice(0, mid), videos.slice(mid)];
}
