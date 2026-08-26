export function finvizUrl(symbol: string): string {
  return `https://finviz.com/quote.ashx?t=${encodeURIComponent(symbol)}`;
}
