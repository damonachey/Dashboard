function parseHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function getHostname(url: string): string {
  return parseHostname(url) ?? url;
}

export function getFaviconUrl(url: string): string | undefined {
  const hostname = parseHostname(url);
  return hostname ? `https://icons.duckduckgo.com/ip3/${hostname}.ico` : undefined;
}
