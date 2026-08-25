import { useEffect, useState } from 'react';
import { useTabs } from './hooks/useTabs';
import { TabBar } from './components/TabBar';
import { Tab } from './components/Tab';
import { LockClosedIcon, LockOpenIcon } from './components/icons';
import { LockProvider, useLocked } from './context/LockContext';

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

function DashboardBody() {
  const { data: tabs, isLoading } = useTabs();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTabId && tabs && tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const activeTab = tabs?.find((t) => t.id === activeTabId) ?? tabs?.[0];

  return (
    <>
      {isLoading && <p className="p-4 text-sm text-slate-500">Loading…</p>}

      {tabs && (
        <>
          <TabBar tabs={tabs} activeTabId={activeTab?.id ?? null} onSelect={setActiveTabId} />
          <main className="p-4">{activeTab && <Tab tab={activeTab} />}</main>
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
