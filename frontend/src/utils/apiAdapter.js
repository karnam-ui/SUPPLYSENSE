/**
 * API Data Adapters
 * Transform backend responses into frontend component data structures
 */

export const adaptDashboardKPI = (kpiData) => {
  if (!kpiData) return null;
  
  return {
    active_alerts: kpiData.total_alerts || 0,
    avg_supplier_reliability: (kpiData.avg_supplier_reliability * 100) || 0,
    products_below_reorder: kpiData.products_below_reorder || 0,
    delayed_orders: kpiData.delayed_orders_this_week || 0,
    high_risk_suppliers: kpiData.high_risk_suppliers || 0,
  };
};

export const adaptInventory = (inventoryData) => {
  if (!Array.isArray(inventoryData)) return { products: [] };
  
  return {
    products: inventoryData.map(item => ({
      id: item.id,
      sku: item.product?.id || 'N/A',
      name: item.product?.name || 'Unknown',
      warehouse: item.warehouse_name,
      current_stock: item.quantity,
      reorder_point: item.reorder_point,
      status: item.shortage_flag ? 'critical' : 'ok',
      last_updated: item.last_updated,
    })),
  };
};

export const adaptSuppliers = (suppliersData) => {
  if (!Array.isArray(suppliersData)) return { suppliers: [], at_risk_suppliers: [] };
  
  const suppliers = suppliersData.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    location: `Risk: ${supplier.risk_level}`,
    reliability: Math.round(supplier.reliability_score * 100),
    on_time_delivery: 85, // Backend doesn't provide this, using default
    avg_lead_time: Math.round(supplier.avg_delay_days) || 0,
    at_risk: supplier.risk_level === 'HIGH',
    trend: 1, // Default positive trend
    total_orders: supplier.total_orders,
    failed_orders: supplier.failed_orders,
    quality_score: Math.round(supplier.reliability_score * 100),
    contact: 'contact@supplier.com',
    payment_terms: 'NET30',
    recent_orders: [],
  }));
  
  const at_risk = suppliers.filter(s => s.at_risk).slice(0, 5);
  
  return { suppliers, at_risk_suppliers: at_risk };
};

export const adaptAlerts = (alertsData) => {
  if (!Array.isArray(alertsData)) return { alerts: [] };
  
  return {
    alerts: alertsData.map(alert => ({
      id: alert.id,
      title: alert.alert_type.replace(/_/g, ' '),
      message: alert.message,
      severity: alert.severity.toLowerCase(),
      timestamp: alert.created_at,
    })),
  };
};

export const adaptForecast = (forecastData) => {
  if (!forecastData) return { products: [] };
  
  // Mock structure - backend returns forecast for single product
  return {
    products: [{
      id: forecastData.product_id,
      sku: `SKU-${forecastData.product_id}`,
      name: forecastData.product_name,
      current_stock: 50,
      reorder_point: 30,
      avg_monthly_demand: 120,
      forecast_accuracy: forecastData.model_accuracy,
      trend: 2,
      forecast_data: forecastData.forecast_data.map(item => ({
        date: new Date(Date.now() + item.day * 24 * 60 * 60 * 1000),
        historical: item.predicted_demand * 0.9,
        forecast: item.predicted_demand,
        confidence_upper: item.confidence_interval?.[1] || item.predicted_demand * 1.2,
        confidence_lower: item.confidence_interval?.[0] || item.predicted_demand * 0.8,
      })),
      insights: [
        `Average daily demand: ${Math.round(forecastData.forecast_data[0]?.predicted_demand / 30 || 0)} units`,
        `Forecast confidence: ${forecastData.model_accuracy}% accurate`,
        `Next 30-day forecast: ${forecastData.forecast_data.reduce((sum, d) => sum + d.predicted_demand, 0) || 0} units`,
      ],
    }],
  };
};
