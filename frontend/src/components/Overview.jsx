import React, { useState, useMemo } from 'react';
import KPICard from './KPICard';
import AlertCard from './AlertCard';
import useAPI from '../hooks/useAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, AlertTriangle, Activity, Package, ShieldAlert, ArrowRight } from 'lucide-react';

const Overview = () => {
  const { data: kpiData } = useAPI('/dashboard');
  const { data: alertsData } = useAPI('/alerts');
  const { data: suppliersData } = useAPI('/suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const chartData = useMemo(() => {
    if (!Array.isArray(suppliersData)) return [];
    return suppliersData.slice(0, 6).map((supplier) => ({
      name: supplier.name.substring(0, 8),
      reliability: Math.round(supplier.reliability_score * 100),
      onTime: 85,
    }));
  }, [suppliersData]);

  const atRiskSuppliers = useMemo(() => {
    if (!Array.isArray(suppliersData)) return [];
    return suppliersData.filter((supplier) => supplier.risk_level === 'HIGH').slice(0, 5);
  }, [suppliersData]);

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Operations Command Center</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#f8fbff]">Supply chain resilience at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#8b949e]">Track alerts, supplier risk, and inventory pressure in a single premium workspace.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#8b949e]">
            <Activity className="h-4 w-4 text-[#22c55e]" />
            <span>Monitoring 24/7 • Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Active alerts" value={kpiData?.total_alerts || 0} critical={kpiData?.total_alerts > 5} threshold={5} color="danger" icon={Bell} />
        <KPICard title="Avg reliability" value={Math.round((kpiData?.avg_supplier_reliability || 0) * 100)} unit="%" color="success" icon={ShieldAlert} />
        <KPICard title="Below reorder" value={kpiData?.products_below_reorder || 0} critical={kpiData?.products_below_reorder > 3} threshold={3} color="warning" icon={Package} />
        <KPICard title="Delayed orders" value={kpiData?.delayed_orders_this_week || 0} critical={kpiData?.delayed_orders_this_week > 2} threshold={2} color="danger" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ef4444]/15 text-[#fda4af]">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#f8fbff]">Recent alerts</h3>
                <p className="text-sm text-[#8b949e]">Latest operational events</p>
              </div>
            </div>
            <span className="status-chip status-chip-critical">Critical feed</span>
          </div>

          {alertsData?.length > 0 ? (
            <div className="space-y-3">
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
            <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-10 text-center text-[#8b949e]">
              No active alerts at the moment.
            </div>
          )}
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-[#fcd34d]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#f8fbff]">At-risk suppliers</h3>
              <p className="text-sm text-[#8b949e]">Immediate follow-up required</p>
            </div>
          </div>

          {atRiskSuppliers.length > 0 ? (
            <div className="space-y-3">
              {atRiskSuppliers.map((supplier, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSupplier(supplier)}
                  className="w-full rounded-2xl border border-[#ef4444]/30 bg-[#0d1117] p-4 text-left transition hover:border-[#ef4444]/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#f8fbff]">{supplier.name}</p>
                      <p className="mt-1 text-sm text-[#8b949e]">Reliability {Math.round(supplier.reliability_score * 100)}%</p>
                    </div>
                    <span className="status-chip status-chip-critical">High risk</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-8 text-center text-[#8b949e]">No critical supplier issues detected.</div>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#22c55e]/15 text-[#86efac]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#f8fbff]">Supplier performance</h3>
                <p className="text-sm text-[#8b949e]">Reliability compared with on-time delivery</p>
              </div>
            </div>
            <button className="btn-secondary text-sm">
              View report <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#8b949e" tickLine={false} axisLine={false} />
                <YAxis stroke="#8b949e" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '0.9rem' }} labelStyle={{ color: '#e6edf3' }} />
                <Legend />
                <Bar dataKey="reliability" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="onTime" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="panel w-full max-w-md p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Supplier detail</p>
                <h3 className="mt-1 text-xl font-semibold text-[#f8fbff]">{selectedSupplier.name}</h3>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="text-2xl text-[#8b949e] transition hover:text-[#e6edf3]">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Reliability</p>
                <p className="mt-2 text-2xl font-semibold text-[#86efac]">{Math.round(selectedSupplier.reliability_score * 100)}%</p>
              </div>
              <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Avg delay</p>
                <p className="mt-2 text-2xl font-semibold text-[#f8fbff]">{Math.round(selectedSupplier.avg_delay_days)}d</p>
              </div>
              <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Orders</p>
                <p className="mt-2 text-2xl font-semibold text-[#f8fbff]">{selectedSupplier.total_orders}</p>
              </div>
              <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Risk</p>
                <p className="mt-2 text-2xl font-semibold text-[#fda4af]">{selectedSupplier.risk_level}</p>
              </div>
            </div>

            <button onClick={() => setSelectedSupplier(null)} className="btn-primary mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
