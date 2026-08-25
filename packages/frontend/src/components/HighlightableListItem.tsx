import { useEffect, useRef, type ReactNode } from 'react';

export function HighlightableListItem({
  active,
  className = '',
  children,
}: {
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [active]);

  return (
    <li
      ref={ref}
      className={`${className} ${active ? 'rounded ring-2 ring-sky-500' : ''}`}
    >
      {children}
    </li>
  );
}
