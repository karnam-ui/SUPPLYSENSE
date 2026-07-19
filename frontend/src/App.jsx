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

  // Simulate live indicator pulse
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
    <div className="flex h-screen bg-supply-bg">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-supply-card border-r border-gray-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-supply-accent rounded flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-white font-bold text-lg">SupplySense</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {Object.entries(pages).map(([key, page]) => {
            const Icon = page.icon;
            const isActive = currentPage === key;
            return (
              <button
                key={key}
                onClick={() => setCurrentPage(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-supply-accent text-white'
                    : 'text-gray-400 hover:text-white hover:bg-supply-bg'
                }`}
                title={!sidebarOpen ? page.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{page.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Live Indicator */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-supply-success rounded-full animate-pulse"></div>
            {sidebarOpen && (
              <div>
                <p className="text-gray-300 font-semibold">Live</p>
                <p className="text-gray-500 text-xs">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-supply-card border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-xl">{pages[currentPage].label}</h2>
          <div className="flex items-center gap-4">
            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-green-900/20 rounded-full">
                <div className="w-2 h-2 bg-supply-success rounded-full animate-pulse"></div>
                <span className="text-supply-success text-xs font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {React.createElement(currentComponent)}
        </div>
      </div>
    </div>
  );
}

export default App;
