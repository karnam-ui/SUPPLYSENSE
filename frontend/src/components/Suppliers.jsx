import React, { useState, useMemo } from 'react';
import useAPI from '../hooks/useAPI';
import { TrendingUp, TrendingDown, ChevronDown, AlertCircle } from 'lucide-react';

const Suppliers = () => {
  const { data: suppliersData } = useAPI('/suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [expandedSupplier, setExpandedSupplier] = useState(null);

  const getReliabilityColor = (reliability) => {
    if (reliability >= 90) return 'text-supply-success';
    if (reliability >= 75) return 'text-supply-warning';
    return 'text-supply-critical';
  };

  const getReliabilityBg = (reliability) => {
    if (reliability >= 90) return 'bg-green-900/20';
    if (reliability >= 75) return 'bg-yellow-900/20';
    return 'bg-red-900/20';
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
    <div className="p-6 space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-supply-card rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Suppliers</p>
          <h3 className="text-white font-bold text-2xl mt-1">{stats.total}</h3>
        </div>
        <div className="bg-supply-card rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Avg Reliability</p>
          <h3 className="text-supply-success font-bold text-2xl mt-1">{stats.avgReliability}%</h3>
        </div>
        <div className="bg-supply-card rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">At-Risk Count</p>
          <h3 className="text-supply-critical font-bold text-2xl mt-1">{stats.atRisk}</h3>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-supply-card rounded-lg overflow-hidden shadow-lg border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600 bg-supply-bg">
                <th className="px-6 py-4 text-left text-gray-300 font-semibold w-8"></th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Supplier Name</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Reliability</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Avg Delay</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Total Orders</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Failed Orders</th>
                <th className="px-6 py-4 text-center text-gray-300 font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier, idx) => {
                  const reliability = Math.round(supplier.reliability_score * 100);
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className="border-b border-gray-700 hover:bg-supply-bg/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedSupplier(expandedSupplier === idx ? null : idx)}
                      >
                        <td className="px-6 py-4 text-gray-300">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedSupplier === idx ? 'rotate-180' : ''}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">{supplier.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded ${getReliabilityBg(reliability)} ${getReliabilityColor(reliability)} font-semibold text-sm`}>
                            {reliability}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">{Math.round(supplier.avg_delay_days)} days</td>
                        <td className="px-6 py-4 text-center text-white font-semibold">{supplier.total_orders}</td>
                        <td className="px-6 py-4 text-center text-gray-400">{supplier.failed_orders}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold ${
                            supplier.risk_level === 'HIGH'
                              ? 'bg-red-900/20 text-supply-critical'
                              : supplier.risk_level === 'MEDIUM'
                              ? 'bg-yellow-900/20 text-supply-warning'
                              : 'bg-green-900/20 text-supply-success'
                          }`}>
                            {supplier.risk_level === 'HIGH' && <AlertCircle className="w-3 h-3" />}
                            {supplier.risk_level}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Row - Supplier Details */}
                      {expandedSupplier === idx && (
                        <tr className="bg-supply-bg border-b border-gray-700">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-gray-400 text-xs uppercase">Created</p>
                                  <p className="text-white font-semibold">{new Date(supplier.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs uppercase">Last Updated</p>
                                  <p className="text-white font-semibold">{new Date(supplier.updated_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs uppercase">Success Rate</p>
                                  <p className="text-white font-semibold">{Math.round((supplier.total_orders - supplier.failed_orders) / supplier.total_orders * 100)}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs uppercase">Reliability Score</p>
                                  <p className={`font-semibold ${getReliabilityColor(reliability)}`}>{(supplier.reliability_score * 100).toFixed(1)}%</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedSupplier(supplier)}
                                className="mt-2 bg-supply-accent hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                              >
                                View Order History
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
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    Loading suppliers...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSupplier(null)}
        >
          <div
            className="bg-supply-card rounded-lg p-6 max-w-2xl w-full border border-gray-700 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-4">{selectedSupplier.name}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Reliability Score</p>
                <p className="font-semibold text-white text-xl">{Math.round(selectedSupplier.reliability_score * 100)}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Average Delay</p>
                <p className="font-semibold text-white text-xl">{Math.round(selectedSupplier.avg_delay_days)} days</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="font-semibold text-white text-xl">{selectedSupplier.total_orders}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Failed Orders</p>
                <p className="font-semibold text-white text-xl">{selectedSupplier.failed_orders}</p>
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

export default Suppliers;
