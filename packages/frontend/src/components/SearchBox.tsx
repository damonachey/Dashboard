import { useEffect, useRef, useState } from 'react';
import type { SearchResult } from '@dashboard/shared';
import { useSearch } from '../hooks/useSearch';

export function SearchBox({ onSelectResult }: { onSelectResult: (result: SearchResult) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results } = useSearch(query);
  const visible = open && query.trim().length >= 2;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectResult(result: SearchResult): void {
    onSelectResult(result);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (!visible || !results || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const result = results[highlightedIndex];
      if (result) selectResult(result);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search modules…"
        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200 placeholder:text-slate-500"
      />

      {visible && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-96 w-96 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-lg">
          {!results || results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">No matches.</p>
          ) : (
            <ul>
              {results.map((result, index) => (
                <li key={result.moduleInstanceId + result.matchType}>
                  <button
                    onClick={() => selectResult(result)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex w-full flex-col items-start gap-0.5 border-b border-slate-800 px-3 py-2 text-left last:border-0 ${
                      index === highlightedIndex ? 'bg-slate-800' : ''
                    }`}
                  >
                    <span className="text-sm text-slate-200">
                      {result.tabName} <span className="text-slate-600">›</span> {result.moduleTitle}
                    </span>
                    {result.matchType === 'content' && (
                      <span className="truncate text-xs text-slate-500">{result.snippet}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
