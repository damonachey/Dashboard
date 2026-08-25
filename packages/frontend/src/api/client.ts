import type {
  ModuleDataEnvelope,
  ModuleInstance,
  ModuleTypeMeta,
  Tab,
  TabWithModules,
} from '@dashboard/shared';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${await res.text()}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  getModuleTypes: () => request<ModuleTypeMeta[]>('/module-types'),

  getTabs: () => request<TabWithModules[]>('/tabs'),
  createTab: (name: string) => request<TabWithModules>('/tabs', { method: 'POST', body: JSON.stringify({ name }) }),
  updateTab: (id: string, patch: { name?: string; position?: number }) =>
    request<Tab>(`/tabs/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteTab: (id: string) => request<void>(`/tabs/${id}`, { method: 'DELETE' }),

  addModuleInstance: (tabId: string, moduleTypeId: string, config: unknown) =>
    request<ModuleInstance>(`/tabs/${tabId}/modules`, {
      method: 'POST',
      body: JSON.stringify({ moduleTypeId, config }),
    }),
  updateModuleInstance: (id: string, patch: { config?: unknown; position?: number }) =>
    request<ModuleInstance>(`/module-instances/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteModuleInstance: (id: string) => request<void>(`/module-instances/${id}`, { method: 'DELETE' }),
  getModuleData: (id: string) => request<ModuleDataEnvelope>(`/module-instances/${id}/data`),

  getGoogleAuthStatus: () => request<{ authorized: boolean }>('/auth/google/status'),
};
