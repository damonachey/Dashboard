import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

export function useSearch(query: string) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = debounced.trim();

  return useQuery({
    queryKey: ['search', trimmed],
    queryFn: () => api.search(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LENGTH,
  });
}
