import React, { useState, useMemo } from 'react';
import useAPI from '../hooks/useAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Package, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

const Inventory = () => {
  const { data: inventoryData } = useAPI('/inventory');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(inventoryData)) return [];
    return inventoryData.filter((item) => (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [inventoryData, searchTerm]);

  const chartData = useMemo(() => {
    if (!Array.isArray(inventoryData)) return [];
    return inventoryData.slice(0, 8).map((product) => ({
      name: (product.product?.name || 'Unknown').substring(0, 12),
      current: product.quantity,
      reorder: product.reorder_point,
    }));
  }, [inventoryData]);

  const getStockStatus = (current, reorder) => {
    if (current <= reorder) return { tone: 'critical', label: 'CRITICAL', icon: AlertTriangle };
    if (current <= reorder * 1.5) return { tone: 'warning', label: 'LOW', icon: AlertCircle };
    return { tone: 'success', label: 'HEALTHY', icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      <div className="panel p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb]/15 text-[#60a5fa]">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f8fbff]">Inventory search</h3>
            <p className="text-sm text-[#8b949e]">Find products needing replenishment</p>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern pl-10"
          />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="panel p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#22c55e]/15 text-[#86efac]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#f8fbff]">Stock levels</h3>
              <p className="text-sm text-[#8b949e]">Current quantity against reorder thresholds</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#8b949e" tickLine={false} axisLine={false} />
                <YAxis stroke="#8b949e" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '0.9rem' }} labelStyle={{ color: '#e6edf3' }} />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="reorder" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="panel overflow-hidden">
        <div className="border-b border-[#30363d] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-[#fcd34d]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#f8fbff]">Inventory list</h3>
              <p className="text-sm text-[#8b949e]">Warehouse and replenishment posture</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#0d1117]">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#8b949e]">Warehouse</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-[#8b949e]">Product</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-[#8b949e]">Stock</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-[#8b949e]">Reorder</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-[#8b949e]">Status</th>
                <th className="hidden px-5 py-3 text-center text-sm font-semibold text-[#8b949e] sm:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => {
                  const status = getStockStatus(product.quantity, product.reorder_point);
                  const Icon = status.icon;
                  const toneClass = status.tone === 'success' ? 'status-chip-success' : status.tone === 'warning' ? 'status-chip-warning' : 'status-chip-critical';
                  return (
                    <tr key={idx} className="border-t border-[#30363d] bg-[#161b22]/60 transition hover:bg-[#161b22]">
                      <td className="px-5 py-4 text-sm text-[#f8fbff]">{product.warehouse_name}</td>
                      <td className="px-5 py-4 text-sm text-[#e6edf3]">{product.product?.name || 'Unknown'}</td>
                      <td className="px-5 py-4 text-center text-sm font-semibold text-[#f8fbff]">{product.quantity}</td>
                      <td className="px-5 py-4 text-center text-sm text-[#8b949e]">{product.reorder_point}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`status-chip ${toneClass}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-center text-sm text-[#8b949e] sm:table-cell">{new Date(product.last_updated).toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-[#8b949e]">
                    <Package className="mx-auto mb-3 h-10 w-10" />
                    {searchTerm ? 'No products match that search.' : 'No inventory data yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
