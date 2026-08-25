import { useEffect, useState } from 'react';
import { useTabs } from './hooks/useTabs';
import { TabBar } from './components/TabBar';
import { Tab } from './components/Tab';

export default function App() {
  const { data: tabs, isLoading } = useTabs();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTabId && tabs && tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const activeTab = tabs?.find((t) => t.id === activeTabId) ?? tabs?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </header>

      {isLoading && <p className="p-4 text-sm text-slate-500">Loading…</p>}

      {tabs && (
        <>
          <TabBar tabs={tabs} activeTabId={activeTab?.id ?? null} onSelect={setActiveTabId} />
          <main className="p-4">{activeTab && <Tab tab={activeTab} />}</main>
        </>
      )}
    </div>
  );
}
