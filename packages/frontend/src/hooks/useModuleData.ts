import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

const POLL_INTERVAL_MS = 30_000;

export function useModuleData(instanceId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['module-data', instanceId],
    queryFn: () => api.getModuleData(instanceId),
    enabled,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
