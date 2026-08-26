import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';

// CSS Grid has no reliably-supported native masonry mode yet, so this approximates one:
// the container uses a tiny fixed `grid-auto-rows` track plus dense packing, and each
// cell reports how many of those tiny tracks its own *actual* rendered height needs.
// Combined with `items-start` on the container (so cells don't stretch to fill a row),
// this lets short cells pack into the gaps beside a taller neighbor instead of every
// row being forced to the height of its tallest cell.
const ROW_UNIT_PX = 8;
const GAP_PX = 16;

export function MasonryCell({
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [span, setSpan] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      setSpan(Math.max(1, Math.ceil((height + GAP_PX) / (ROW_UNIT_PX + GAP_PX))));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ ...style, gridRowEnd: `span ${span}` }} {...rest}>
      {children}
    </div>
  );
}
