import React, { useState, useMemo } from 'react';
import useAPI from '../hooks/useAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Package } from 'lucide-react';

const Inventory = () => {
  const { data: inventoryData } = useAPI('/inventory');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(inventoryData)) return [];
    return inventoryData.filter(item =>
      (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventoryData, searchTerm]);

  const chartData = useMemo(() => {
    if (!Array.isArray(inventoryData)) return [];
    return inventoryData.slice(0, 8).map(p => ({
      name: (p.product?.name || 'Unknown').substring(0, 12),
      current: p.quantity,
      reorder: p.reorder_point,
    }));
  }, [inventoryData]);

  const getStockStatus = (current, reorder) => {
    if (current <= reorder) return { color: 'danger', status: 'Critical', emoji: '❌' };
    if (current <= reorder * 1.5) return { color: 'warning', status: 'Low', emoji: '⚠️' };
    return { color: 'success', status: 'OK', emoji: '✅' };
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="card-modern">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-lg">
            🔍
          </div>
          <h2 className="gradient-text-primary text-xl font-bold">Search Inventory</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern pl-10 w-full"
          />
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center text-lg">
              📊
            </div>
            <h2 className="gradient-text-primary text-xl font-bold">Stock Levels Overview</h2>
          </div>

          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  labelStyle={{ color: '#1e293b' }}
                />
                <Legend />
                <Bar dataKey="current" fill="#0284c7" radius={[8, 8, 0, 0]} />
                <Bar dataKey="reorder" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card-modern overflow-hidden">
        <div className="flex items-center gap-3 mb-6 px-6 pt-6">
          <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center text-lg">
            📦
          </div>
          <h2 className="gradient-text-primary text-xl font-bold">Inventory List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm">🏭 Warehouse</th>
                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm">📦 Product</th>
                <th className="px-6 py-4 text-center text-slate-700 font-semibold text-sm">Current Stock</th>
                <th className="px-6 py-4 text-center text-slate-700 font-semibold text-sm">Reorder Point</th>
                <th className="px-6 py-4 text-center text-slate-700 font-semibold text-sm">Status</th>
                <th className="hidden sm:table-cell px-6 py-4 text-center text-slate-700 font-semibold text-sm">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => {
                  const status = getStockStatus(product.quantity, product.reorder_point);
                  return (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-slate-700 text-sm font-medium">{product.warehouse_name}</td>
                      <td className="px-6 py-4 text-slate-900 text-sm font-medium">{product.product?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-center text-slate-900 font-semibold text-sm">{product.quantity}</td>
                      <td className="px-6 py-4 text-center text-slate-600 text-sm">{product.reorder_point}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                          status.color === 'success' 
                            ? 'bg-success-100 text-success-700' 
                            : status.color === 'warning'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-danger-100 text-danger-700'
                        }`}>
                          <span className="text-lg">{status.emoji}</span>
                          {status.status}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-center text-slate-600 text-sm">
                        {new Date(product.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">{searchTerm ? 'No products found' : 'No inventory data'}</p>
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
