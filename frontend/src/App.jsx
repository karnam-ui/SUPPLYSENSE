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
  Zap,
} from 'lucide-react';
import Overview from './components/Overview';
import Inventory from './components/Inventory';
import Suppliers from './components/Suppliers';
import Forecasting from './components/Forecasting';
import AskSupplySense from './components/AskSupplySense';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLive, setIsLive] = useState(true);
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
    <div className="flex h-screen bg-gradient-bright">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-md`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="gradient-text-primary text-lg font-bold">SupplySense</h1>
                <p className="text-xs text-slate-500">Smart Supply Chain</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {Object.entries(pages).map(([key, page]) => {
            const Icon = page.icon;
            const isActive = currentPage === key;
            
            const emojiMap = {
              overview: '📊',
              inventory: '📦',
              suppliers: '🚚',
              forecasting: '📈',
              ask: '🤖',
            };
            
            const colorMap = {
              overview: 'from-primary-500 to-primary-600',
              inventory: 'from-warning-500 to-warning-600',
              suppliers: 'from-accent-500 to-accent-600',
              forecasting: 'from-success-500 to-success-600',
              ask: 'from-accent-600 to-primary-600',
            };
            
            return (
              <button
                key={key}
                onClick={() => setCurrentPage(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${colorMap[key]} text-white shadow-lg shadow-slate-300/50`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={!sidebarOpen ? page.label : ''}
              >
                <span className="text-lg flex-shrink-0">{emojiMap[key]}</span>
                {sidebarOpen && <span className="text-sm font-medium">{page.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Live Indicator */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse shadow-md shadow-success-500/50"></div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700">Live Data</p>
                <p className="text-xs text-slate-500">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="gradient-text-primary text-2xl font-bold">{pages[currentPage].label}</h2>
            <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-primary-500" />
              <span className="text-slate-600">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-glow-success rounded-lg border border-success-200">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-success-700">Live</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {React.createElement(currentComponent)}
        </div>
      </div>
    </div>
  );
}

export default App;
