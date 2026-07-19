import React, { useState, useMemo } from 'react';
import KPICard from './KPICard';
import AlertCard from './AlertCard';
import SupplierCard from './SupplierCard';
import useAPI from '../hooks/useAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Overview = () => {
  const { data: kpiData } = useAPI('/dashboard');
  const { data: alertsData } = useAPI('/alerts');
  const { data: suppliersData } = useAPI('/suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Prepare chart data
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
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Alerts"
          value={kpiData?.total_alerts || 0}
          critical={kpiData?.total_alerts > 5}
          threshold={5}
        />
        <KPICard
          title="Avg Supplier Reliability"
          value={Math.round((kpiData?.avg_supplier_reliability || 0) * 100)}
          unit="%"
        />
        <KPICard
          title="Products Below Reorder"
          value={kpiData?.products_below_reorder || 0}
          critical={kpiData?.products_below_reorder > 3}
          threshold={3}
        />
        <KPICard
          title="Delayed Orders"
          value={kpiData?.delayed_orders_this_week || 0}
          critical={kpiData?.delayed_orders_this_week > 2}
          threshold={2}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-2 bg-supply-card rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-white font-bold mb-4 text-lg">Recent Alerts</h2>
          <div className="max-h-96 overflow-y-auto">
            {alertsData?.length > 0 ? (
              alertsData.slice(0, 5).map((alert, idx) => (
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
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No alerts</p>
            )}
          </div>
        </div>

        {/* At-Risk Suppliers */}
        <div className="bg-supply-card rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-white font-bold mb-4 text-lg">At-Risk Suppliers</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {atRiskSuppliers.length > 0 ? (
              atRiskSuppliers.map((supplier, idx) => (
                <SupplierCard
                  key={idx}
                  supplier={{
                    name: supplier.name,
                    location: supplier.name,
                    reliability: Math.round(supplier.reliability_score * 100),
                    on_time_delivery: 85,
                    avg_lead_time: Math.round(supplier.avg_delay_days),
                    at_risk: true,
                    trend: 1,
                  }}
                  onClick={() => setSelectedSupplier(supplier)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No at-risk suppliers</p>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Reliability Chart */}
      {chartData.length > 0 && (
        <div className="bg-supply-card rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-white font-bold mb-4 text-lg">Top Suppliers Performance</h2>
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
              <Bar dataKey="reliability" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="onTime" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Selected Supplier Modal */}
      {selectedSupplier && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSupplier(null)}
        >
          <div
            className="bg-supply-card rounded-lg p-6 max-w-md w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-4">{selectedSupplier.name}</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Reliability:</span>
                <span className="text-white font-semibold">{Math.round(selectedSupplier.reliability_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Delay:</span>
                <span className="text-white font-semibold">{Math.round(selectedSupplier.avg_delay_days)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Orders:</span>
                <span className="text-white font-semibold">{selectedSupplier.total_orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level:</span>
                <span className="text-white font-semibold">{selectedSupplier.risk_level}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedSupplier(null)}
              className="w-full bg-supply-accent hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
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
