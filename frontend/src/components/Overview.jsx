import React, { useState, useMemo } from 'react';
import KPICard from './KPICard';
import AlertCard from './AlertCard';
import SupplierCard from './SupplierCard';
import useAPI from '../hooks/useAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, TrendingUp, AlertTriangle } from 'lucide-react';

const Overview = () => {
  const { data: kpiData } = useAPI('/dashboard');
  const { data: alertsData } = useAPI('/alerts');
  const { data: suppliersData } = useAPI('/suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const chartData = useMemo(() => {
    if (!Array.isArray(suppliersData)) return [];
    return suppliersData.slice(0, 5).map(s => ({
      name: s.name.substring(0, 8),
      reliability: Math.round(s.reliability_score * 100),
      onTime: 85,
    }));
  }, [suppliersData]);

  const atRiskSuppliers = useMemo(() => {
    if (!Array.isArray(suppliersData)) return [];
    return suppliersData
      .filter(s => s.risk_level === 'HIGH')
      .slice(0, 5);
  }, [suppliersData]);

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="📊 Active Alerts"
          value={kpiData?.total_alerts || 0}
          critical={kpiData?.total_alerts > 5}
          threshold={5}
          color="danger"
        />
        <KPICard
          title="✅ Avg Reliability"
          value={Math.round((kpiData?.avg_supplier_reliability || 0) * 100)}
          unit="%"
          color="success"
        />
        <KPICard
          title="📦 Below Reorder"
          value={kpiData?.products_below_reorder || 0}
          critical={kpiData?.products_below_reorder > 3}
          threshold={3}
          color="warning"
        />
        <KPICard
          title="⏱️ Delayed Orders"
          value={kpiData?.delayed_orders_this_week || 0}
          critical={kpiData?.delayed_orders_this_week > 2}
          threshold={2}
          color="danger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 card-modern">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center text-lg">
              🚨
            </div>
            <h2 className="gradient-text-primary text-xl font-bold">Recent Alerts</h2>
          </div>

          {alertsData?.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alertsData.slice(0, 5).map((alert, idx) => (
                <AlertCard
                  key={idx}
                  alert={{
                    id: alert.id,
                    title: alert.alert_type.replace(/_/g, ' '),
                    message: alert.message,
                    severity: alert.severity.toLowerCase(),
                    timestamp: alert.created_at,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No active alerts</p>
            </div>
          )}
        </div>

        {/* At-Risk Suppliers */}
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center text-lg">
              🎯
            </div>
            <h2 className="gradient-text-primary text-xl font-bold">At-Risk Suppliers</h2>
          </div>

          {atRiskSuppliers.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {atRiskSuppliers.map((supplier, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSupplier(supplier)}
                  className="p-4 bg-gradient-to-br from-danger-50 to-danger-100/50 border border-danger-200 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:border-danger-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-danger-900 truncate">{supplier.name}</h3>
                    <span className="status-badge status-danger">High Risk</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-danger-700">Reliability: <span className="font-semibold">{Math.round(supplier.reliability_score * 100)}%</span></p>
                    <p className="text-danger-700">Avg Delay: <span className="font-semibold">{Math.round(supplier.avg_delay_days)}d</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-success-600 font-semibold">✓ No at-risk suppliers</p>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Performance Chart */}
      {chartData.length > 0 && (
        <div className="card-modern">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center text-lg">
              📈
            </div>
            <h2 className="gradient-text-primary text-xl font-bold">Top Suppliers Performance</h2>
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
                <Bar dataKey="reliability" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="onTime" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="gradient-text-primary text-xl font-bold">{selectedSupplier.name}</h2>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 border border-success-200 rounded-lg">
                <p className="text-xs font-medium text-success-600 mb-1">Reliability</p>
                <p className="text-2xl font-bold text-success-900">
                  {Math.round(selectedSupplier.reliability_score * 100)}%
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg">
                <p className="text-xs font-medium text-primary-600 mb-1">Avg Delay</p>
                <p className="text-2xl font-bold text-primary-900">
                  {Math.round(selectedSupplier.avg_delay_days)}d
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200 rounded-lg">
                <p className="text-xs font-medium text-warning-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-warning-900">
                  {selectedSupplier.total_orders}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-danger-50 to-danger-100 border border-danger-200 rounded-lg">
                <p className="text-xs font-medium text-danger-600 mb-1">Risk Level</p>
                <p className="text-2xl font-bold text-danger-900">
                  {selectedSupplier.risk_level}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSupplier(null)}
              className="w-full py-2 px-4 bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
