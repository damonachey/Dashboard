import { useEffect, useState } from 'react';
import type { SearchResult } from '@dashboard/shared';
import { useTabs } from './hooks/useTabs';
import { TabBar } from './components/TabBar';
import { Tab } from './components/Tab';
import { LockClosedIcon, LockOpenIcon } from './components/icons';
import { LockProvider, useLocked } from './context/LockContext';

const HIGHLIGHT_DURATION_MS = 3000;

function DashboardHeader() {
  const { locked, toggleLocked } = useLocked();
  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <button
        onClick={toggleLocked}
        className="text-slate-500 hover:text-slate-300"
        aria-label={locked ? 'Unlock editing' : 'Lock editing'}
        title={locked ? 'Locked — click to enable editing' : 'Unlocked — click to lock'}
      >
        {locked ? <LockClosedIcon /> : <LockOpenIcon />}
      </button>
    </header>
  );
}

function getTabNameFromUrl(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('tab');
  } catch {
    return null;
  }
}

function DashboardBody() {
  const { data: tabs, isLoading } = useTabs();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [highlightedModuleId, setHighlightedModuleId] = useState<string | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  function handleSelectSearchResult(result: SearchResult): void {
    setActiveTabId(result.tabId);
    setHighlightedModuleId(result.moduleInstanceId);
    setHighlightedItemId(result.itemId ?? null);
  }

  useEffect(() => {
    if (!highlightedModuleId) return;
    const timer = setTimeout(() => {
      setHighlightedModuleId(null);
      setHighlightedItemId(null);
    }, HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [highlightedModuleId]);

  useEffect(() => {
    if (!tabs || tabs.length === 0) return;
    if (activeTabId && tabs.some((t) => t.id === activeTabId)) return;

    const nameFromUrl = getTabNameFromUrl();
    const matched = nameFromUrl ? tabs.find((t) => t.name === nameFromUrl) : undefined;
    setActiveTabId((matched ?? tabs[0]).id);
  }, [tabs, activeTabId]);

  const activeTab = tabs?.find((t) => t.id === activeTabId) ?? tabs?.[0];

  // Keep the URL in sync with whichever tab is actually active — covers explicit
  // selection, the very first load, and falling back after the active tab is deleted.
  useEffect(() => {
    if (!activeTab) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') !== activeTab.name) {
      params.set('tab', activeTab.name);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, [activeTab]);

  return (
    <>
      {isLoading && <p className="p-4 text-sm text-slate-500">Loading…</p>}

      {tabs && (
        <>
          <TabBar
            tabs={tabs}
            activeTabId={activeTab?.id ?? null}
            onSelect={setActiveTabId}
            onSelectSearchResult={handleSelectSearchResult}
          />
          <main className="p-4">
            {activeTab && (
              <Tab tab={activeTab} highlightedModuleId={highlightedModuleId} highlightedItemId={highlightedItemId} />
            )}
          </main>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <LockProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <DashboardHeader />
        <DashboardBody />
      </div>
    </LockProvider>
  );
}
