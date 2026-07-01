const rawBase = import.meta.env.BASE_URL || "/";
const base = rawBase === "/" ? "" : rawBase.replace(/\/$/, "");

function isExternal(path: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith("//");
}

export function withBase(path: string | undefined): string | undefined {
  if (!path || isExternal(path) || path.startsWith("#")) return path;
  if (!path.startsWith("/")) return path;
  return `${base}${path}`;
}

export function withoutBase(pathname: string): string {
  if (!base) return pathname;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
  return pathname;
}

export function withBaseHtml(html: string): string {
  if (!base) return html;
  return html.replace(/\bhref=(["'])\/(?!\/)/g, `href=$1${base}/`);
}
