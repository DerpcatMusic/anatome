function horizontalScrollSign(node: HTMLElement): number {
  const dir =
    getComputedStyle(node).direction ||
    getComputedStyle(document.documentElement).direction ||
    "ltr";
  return dir === "rtl" ? -1 : 1;
}

/** Map vertical wheel delta to horizontal scroll (trackpad or mouse wheel over a carousel). */
export function horizontalWheelScroll(node: HTMLElement, enabled = true) {
  if (!enabled) {
    return {};
  }

  const onWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (event.deltaY === 0) return;
    const maxScroll = node.scrollWidth - node.clientWidth;
    if (maxScroll <= 0) return;
    event.preventDefault();
    node.scrollLeft += event.deltaY * horizontalScrollSign(node);
  };

  node.addEventListener("wheel", onWheel, { passive: false });
  return {
    destroy() {
      node.removeEventListener("wheel", onWheel);
    },
  };
}
