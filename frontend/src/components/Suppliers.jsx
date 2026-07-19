import React, { useState, useMemo } from 'react';
import useAPI from '../hooks/useAPI';
import { TrendingUp, TrendingDown, ChevronDown, Users } from 'lucide-react';
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
    const avgReliability = Math.round(
      suppliers.reduce((acc, s) => acc + s.reliability_score, 0) / suppliers.length * 100
    );
    const atRisk = suppliers.filter(s => s.risk_level === 'HIGH').length;
    return {
      total: suppliers.length,
      avgReliability,
      atRisk,
    };
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="🤝 Total Suppliers"
          value={stats.total}
          color="primary"
        />
        <KPICard
          title="📈 Avg Reliability"
          value={stats.avgReliability}
          unit="%"
          color="success"
        />
        <KPICard
          title="🚨 At-Risk Count"
          value={stats.atRisk}
          color="danger"
          critical={stats.atRisk > 0}
        />
      </div>

      {/* Suppliers Table */}
      <div className="card-modern overflow-hidden">
        <div className="flex items-center gap-3 mb-6 px-6 pt-6">
          <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center text-lg">
            📈
          </div>
          <h2 className="gradient-text-primary text-xl font-bold">Suppliers List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm w-8"></th>
                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm">Supplier Name</th>
                <th className="px-6 py-4 text-center text-slate-700 font-semibold text-sm">Reliability</th>
                <th className="hidden sm:table-cell px-6 py-4 text-center text-slate-700 font-semibold text-sm">Avg Delay</th>
                <th className="hidden md:table-cell px-6 py-4 text-center text-slate-700 font-semibold text-sm">Total Orders</th>
                <th className="hidden lg:table-cell px-6 py-4 text-center text-slate-700 font-semibold text-sm">Failed Orders</th>
                <th className="px-6 py-4 text-center text-slate-700 font-semibold text-sm">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier, idx) => {
                  const reliability = Math.round(supplier.reliability_score * 100);
                  const riskColor = getRiskColor(supplier.risk_level);
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedSupplier(expandedSupplier === idx ? null : idx)}
                      >
                        <td className="px-6 py-4 text-slate-600">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedSupplier === idx ? 'rotate-180' : ''}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold text-sm truncate">{supplier.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                            reliability >= 90 
                              ? 'bg-success-100 text-success-700' 
                              : reliability >= 75
                              ? 'bg-warning-100 text-warning-700'
                              : 'bg-danger-100 text-danger-700'
                          }`}>
                            {reliability}%
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 text-center text-slate-700 text-sm">{Math.round(supplier.avg_delay_days)}d</td>
                        <td className="hidden md:table-cell px-6 py-4 text-center text-slate-900 font-semibold text-sm">{supplier.total_orders}</td>
                        <td className="hidden lg:table-cell px-6 py-4 text-center text-slate-700 text-sm">{supplier.failed_orders}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                            riskColor === 'danger'
                              ? 'bg-danger-100 text-danger-700'
                              : riskColor === 'warning'
                              ? 'bg-warning-100 text-warning-700'
                              : 'bg-success-100 text-success-700'
                          }`}>
                            <span className="text-lg">
                              {supplier.risk_level === 'HIGH' ? '🔴' : supplier.risk_level === 'MEDIUM' ? '🟡' : '🟢'}
                            </span>
                            <span className="hidden sm:inline">{supplier.risk_level}</span>
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Row - Details */}
                      {expandedSupplier === idx && (
                        <tr className="bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-200">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Created</p>
                                  <p className="text-slate-900 font-semibold">{new Date(supplier.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Updated</p>
                                  <p className="text-slate-900 font-semibold">{new Date(supplier.updated_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Success Rate</p>
                                  <p className="text-slate-900 font-semibold">{Math.round((supplier.total_orders - supplier.failed_orders) / supplier.total_orders * 100)}%</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Reliability</p>
                                  <p className={`font-semibold ${reliability >= 90 ? 'text-success-700' : reliability >= 75 ? 'text-warning-700' : 'text-danger-700'}`}>
                                    {(supplier.reliability_score * 100).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedSupplier(supplier)}
                                className="btn-primary"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">Loading suppliers...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="gradient-text-primary text-2xl font-bold">{selectedSupplier.name}</h2>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 border border-success-200 rounded-lg">
                <p className="text-xs font-semibold text-success-600 uppercase mb-1">Reliability</p>
                <p className="text-3xl font-bold text-success-900">
                  {Math.round(selectedSupplier.reliability_score * 100)}%
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg">
                <p className="text-xs font-semibold text-primary-600 uppercase mb-1">Avg Delay</p>
                <p className="text-3xl font-bold text-primary-900">
                  {Math.round(selectedSupplier.avg_delay_days)}d
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200 rounded-lg">
                <p className="text-xs font-semibold text-warning-600 uppercase mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-warning-900">
                  {selectedSupplier.total_orders}
                </p>
              </div>
              <div className={`p-4 bg-gradient-to-br ${
                selectedSupplier.risk_level === 'HIGH'
                  ? 'from-danger-50 to-danger-100 border-danger-200'
                  : selectedSupplier.risk_level === 'MEDIUM'
                  ? 'from-warning-50 to-warning-100 border-warning-200'
                  : 'from-success-50 to-success-100 border-success-200'
              } border rounded-lg`}>
                <p className="text-xs font-semibold uppercase mb-1 ${
                  selectedSupplier.risk_level === 'HIGH'
                    ? 'text-danger-600'
                    : selectedSupplier.risk_level === 'MEDIUM'
                    ? 'text-warning-600'
                    : 'text-success-600'
                }">Risk Level</p>
                <p className={`text-3xl font-bold ${
                  selectedSupplier.risk_level === 'HIGH'
                    ? 'text-danger-900'
                    : selectedSupplier.risk_level === 'MEDIUM'
                    ? 'text-warning-900'
                    : 'text-success-900'
                }`}>
                  {selectedSupplier.risk_level}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSupplier(null)}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
