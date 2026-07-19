import React, { useState, useMemo } from 'react';
import useAPI from '../hooks/useAPI';
import { ChevronDown, Users, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import KPICard from './KPICard';

const Suppliers = () => {
  const { data: suppliersData } = useAPI('/suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [expandedSupplier, setExpandedSupplier] = useState(null);

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'HIGH') return 'danger';
    if (riskLevel === 'MEDIUM') return 'warning';
    return 'success';
  };

  const suppliers = useMemo(() => {
    if (!Array.isArray(suppliersData)) return [];
    return suppliersData;
  }, [suppliersData]);

  const stats = useMemo(() => {
    if (suppliers.length === 0) return { total: 0, avgReliability: 0, atRisk: 0 };
    const avgReliability = Math.round((suppliers.reduce((acc, supplier) => acc + supplier.reliability_score, 0) / suppliers.length) * 100);
    const atRisk = suppliers.filter((supplier) => supplier.risk_level === 'HIGH').length;
    return {
      total: suppliers.length,
      avgReliability,
      atRisk,
    };
  }, [suppliers]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Total suppliers" value={stats.total} color="primary" icon={Users} />
        <KPICard title="Avg reliability" value={stats.avgReliability} unit="%" color="success" icon={ShieldCheck} />
        <KPICard title="At-risk count" value={stats.atRisk} color="danger" critical={stats.atRisk > 0} icon={AlertTriangle} />
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-[#30363d] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563eb]/15 text-[#60a5fa]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#f8fbff]">Supplier portfolio</h3>
              <p className="text-sm text-[#8b949e]">Reliability, delay, and exposure profile</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#0d1117]">
              <tr>
                <th className="w-10 px-4 py-3 text-left"></th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#8b949e]">Supplier</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-[#8b949e]">Reliability</th>
                <th className="hidden px-4 py-3 text-center text-sm font-semibold text-[#8b949e] sm:table-cell">Avg delay</th>
                <th className="hidden px-4 py-3 text-center text-sm font-semibold text-[#8b949e] md:table-cell">Orders</th>
                <th className="hidden px-4 py-3 text-center text-sm font-semibold text-[#8b949e] lg:table-cell">Failed</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-[#8b949e]">Risk</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier, idx) => {
                  const reliability = Math.round(supplier.reliability_score * 100);
                  const riskColor = getRiskColor(supplier.risk_level);
                  const riskClass = riskColor === 'danger' ? 'status-chip-critical' : riskColor === 'warning' ? 'status-chip-warning' : 'status-chip-success';
                  return (
                    <React.Fragment key={idx}>
                      <tr className="cursor-pointer border-t border-[#30363d] bg-[#161b22]/50 transition hover:bg-[#161b22]" onClick={() => setExpandedSupplier(expandedSupplier === idx ? null : idx)}>
                        <td className="px-4 py-4 text-[#8b949e]">
                          <ChevronDown className={`h-4 w-4 transition ${expandedSupplier === idx ? 'rotate-180' : ''}`} />
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-[#f8fbff]">{supplier.name}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`status-chip ${reliability >= 90 ? 'status-chip-success' : reliability >= 75 ? 'status-chip-warning' : 'status-chip-critical'}`}>{reliability}%</span>
                        </td>
                        <td className="hidden px-4 py-4 text-center text-sm text-[#8b949e] sm:table-cell">{Math.round(supplier.avg_delay_days)}d</td>
                        <td className="hidden px-4 py-4 text-center text-sm text-[#f8fbff] md:table-cell">{supplier.total_orders}</td>
                        <td className="hidden px-4 py-4 text-center text-sm text-[#8b949e] lg:table-cell">{supplier.failed_orders}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`status-chip ${riskClass}`}>{supplier.risk_level}</span>
                        </td>
                      </tr>

                      {expandedSupplier === idx && (
                        <tr className="border-t border-[#30363d] bg-[#0d1117]">
                          <td colSpan="7" className="px-4 py-4">
                            <div className="grid gap-4 rounded-2xl border border-[#30363d] bg-[#161b22] p-4 md:grid-cols-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Created</p>
                                <p className="mt-1 text-sm text-[#f8fbff]">{new Date(supplier.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Updated</p>
                                <p className="mt-1 text-sm text-[#f8fbff]">{new Date(supplier.updated_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Success rate</p>
                                <p className="mt-1 text-sm text-[#f8fbff]">{Math.round(((supplier.total_orders - supplier.failed_orders) / supplier.total_orders) * 100)}%</p>
                              </div>
                              <div>
                                <button onClick={() => setSelectedSupplier(supplier)} className="btn-primary w-full">View details</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-[#8b949e]">
                    <Users className="mx-auto mb-3 h-10 w-10" />
                    Loading suppliers...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="panel w-full max-w-lg p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Supplier profile</p>
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
                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Total orders</p>
                <p className="mt-2 text-2xl font-semibold text-[#f8fbff]">{selectedSupplier.total_orders}</p>
              </div>
              <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">Risk level</p>
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

export default Suppliers;
