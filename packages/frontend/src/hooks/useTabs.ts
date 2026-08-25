import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useTabs() {
  return useQuery({ queryKey: ['tabs'], queryFn: api.getTabs });
}

export function useCreateTab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createTab(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tabs'] }),
  });
}

export function useDeleteTab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTab(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tabs'] }),
  });
}

export function useAddModuleInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tabId, moduleTypeId, config }: { tabId: string; moduleTypeId: string; config: unknown }) =>
      api.addModuleInstance(tabId, moduleTypeId, config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tabs'] }),
  });
}

export function useDeleteModuleInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteModuleInstance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tabs'] }),
  });
}
