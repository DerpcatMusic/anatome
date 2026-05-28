const FAVICON_LIGHT = "/brand/favicon-light.svg";
const FAVICON_DARK = "/brand/favicon-dark.svg";
const SELECTOR = 'link[data-anatome-favicon]';

/** Keep tab icon aligned with app theme (not only system preference). */
export function syncFavicon(isDark: boolean) {
  if (typeof document === "undefined") return;

  let link = document.querySelector<HTMLLinkElement>(SELECTOR);
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.setAttribute("data-anatome-favicon", "");
    document.head.appendChild(link);
  }

  const href = isDark ? FAVICON_DARK : FAVICON_LIGHT;
  if (link.href !== new URL(href, window.location.origin).href) {
    link.href = href;
  }
}
