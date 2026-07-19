import React, { useState, useMemo } from 'react';
import useAPI from '../hooks/useAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, AlertCircle } from 'lucide-react';

const Inventory = () => {
  const { data: inventoryData } = useAPI('/inventory');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(inventoryData)) return [];
    return inventoryData.filter(item =>
      (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventoryData, searchTerm]);

  // Prepare chart data for top products
  const chartData = useMemo(() => {
    if (!Array.isArray(inventoryData)) return [];
    return inventoryData.slice(0, 8).map(p => ({
      name: (p.product?.name || 'Unknown').substring(0, 12),
      current: p.quantity,
      reorder: p.reorder_point,
    }));
  }, [inventoryData]);

  const getStockStatus = (current, reorder) => {
    if (current <= reorder) return { color: 'text-supply-critical', bg: 'bg-red-900/20', status: 'Critical' };
    if (current <= reorder * 1.5) return { color: 'text-supply-warning', bg: 'bg-yellow-900/20', status: 'Low' };
    return { color: 'text-supply-success', bg: 'bg-green-900/20', status: 'OK' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search Bar */}
      <div className="bg-supply-card rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-supply-bg border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-supply-accent"
          />
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-supply-card rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-white font-bold mb-4 text-lg">Stock Levels Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="reorder" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-supply-card rounded-lg overflow-hidden shadow-lg border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600 bg-supply-bg">
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Warehouse</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Product Name</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Current Stock</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Reorder Point</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => {
                  const status = getStockStatus(product.quantity, product.reorder_point);
                  return (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-supply-bg/50 transition-colors">
                      <td className="px-6 py-4 text-gray-300">{product.warehouse_name}</td>
                      <td className="px-6 py-4 text-white">{product.product?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{product.quantity}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{product.reorder_point}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded ${status.bg} ${status.color} text-sm font-semibold`}>
                          {product.quantity <= product.reorder_point && <AlertCircle className="w-3 h-3" />}
                          {status.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 text-sm">
                        {new Date(product.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    {searchTerm ? 'No products found' : 'Loading inventory...'}
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
