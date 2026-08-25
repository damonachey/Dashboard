import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useModuleTypes() {
  return useQuery({ queryKey: ['module-types'], queryFn: api.getModuleTypes, staleTime: Infinity });
}
