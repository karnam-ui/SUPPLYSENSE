import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Truck,
  TrendingUp,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles,
  Radio,
} from 'lucide-react';
import Overview from './components/Overview';
import Inventory from './components/Inventory';
import Suppliers from './components/Suppliers';
import Forecasting from './components/Forecasting';
import AskSupplySense from './components/AskSupplySense';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const pages = {
    overview: { label: 'Overview', icon: LayoutDashboard, component: Overview },
    inventory: { label: 'Inventory', icon: Package, component: Inventory },
    suppliers: { label: 'Suppliers', icon: Truck, component: Suppliers },
    forecasting: { label: 'Forecasting', icon: TrendingUp, component: Forecasting },
    ask: { label: 'Ask SupplySense', icon: MessageSquare, component: AskSupplySense },
  };

  const currentComponent = pages[currentPage].component;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e1a] text-[#e6edf3]">
      <aside className={`${sidebarOpen ? 'w-60' : 'w-20'} flex min-w-0 flex-col border-r border-[#30363d] bg-[#0d1117] transition-all duration-300`}>
        <div className="flex items-center justify-between border-b border-[#30363d] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#2563eb]/40 bg-[#111827] shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Sparkles className="h-5 w-5 text-[#60a5fa]" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold text-[#f8fbff]">SupplySense</p>
                <p className="text-xs text-[#8b949e]">Enterprise Ops</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl border border-[#30363d] bg-[#161b22] p-2 text-[#8b949e] transition hover:border-[#2563eb]/40 hover:text-[#e6edf3]"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {Object.entries(pages).map(([key, page]) => {
            const Icon = page.icon;
            const isActive = currentPage === key;

            return (
              <button
                key={key}
                onClick={() => setCurrentPage(key)}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                title={!sidebarOpen ? page.label : ''}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#60a5fa]' : 'text-[#8b949e]'}`} />
                {sidebarOpen && <span className="text-sm font-medium">{page.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#30363d] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#263649] bg-[#161b22]/80 p-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]"></span>
            </span>
            {sidebarOpen && (
              <div>
                <p className="text-xs font-semibold text-[#e6edf3]">Live telemetry</p>
                <p className="text-[11px] text-[#8b949e]">Updated {lastUpdated.toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-[#30363d] bg-[#0d1117]/90 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold text-[#f8fbff]">{pages[currentPage].label}</h2>
            <p className="mt-1 text-sm text-[#8b949e]">Command center for planning, execution, and risk visibility.</p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-80"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]"></span>
            </span>
            <div className="flex items-center gap-2 text-sm text-[#e6edf3]">
              <span>Live data</span>
              <span className="text-[#8b949e]">•</span>
              <span className="text-[#8b949e]">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {React.createElement(currentComponent)}
        </div>
      </main>
    </div>
  );
}

export default App;
