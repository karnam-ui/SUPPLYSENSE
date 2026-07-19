"""
SupplySense API Documentation and Examples

This file contains detailed API documentation and examples for all endpoints.
"""

# =============================================================================
# API OVERVIEW
# =============================================================================

"""
Base URL: http://localhost:8000

The SupplySense backend provides RESTful API endpoints for supply chain
intelligence, including:
- Real-time KPI dashboards
- Inventory management
- Supplier performance tracking
- Order monitoring
- Alert management
- AI-powered insights
- Demand forecasting

All endpoints return JSON responses and support CORS for frontend integration.
"""

# =============================================================================
# ENDPOINTS
# =============================================================================

"""
GET /
  Description: API root and information
  Returns: API metadata and available endpoints
  
  Example:
    curl http://localhost:8000/
  
  Response:
    {
      "name": "SupplySense",
      "version": "1.0.0",
      "description": "Supply Chain Intelligence System API",
      "docs": "/docs",
      "endpoints": {
        "dashboard": "GET /dashboard",
        "inventory": "GET /inventory",
        "suppliers": "GET /suppliers",
        "orders": "GET /orders",
        "alerts": "GET /alerts",
        "forecast": "GET /forecast/{product_id}",
        "query": "POST /query",
        "health": "GET /health"
      }
    }
"""

"""
GET /health
  Description: Health check endpoint
  Returns: System status and component health
  
  Example:
    curl http://localhost:8000/health
  
  Response:
    {
      "status": "healthy",
      "timestamp": "2024-01-15T10:30:45.123456",
      "redis_connected": true,
      "background_tasks_running": true
    }
"""

"""
GET /dashboard
  Description: Get KPI metrics for dashboard
  Query Parameters: None
  Caching: 30 seconds (Redis)
  
  Returns: DashboardKPI object with metrics
  
  Example:
    curl http://localhost:8000/dashboard
  
  Response:
    {
      "total_alerts": 10,
      "critical_alerts": 2,
      "avg_supplier_reliability": 0.754,
      "products_below_reorder": 5,
      "delayed_orders_this_week": 3,
      "high_risk_suppliers": 3,
      "total_suppliers": 10,
      "total_products": 20
    }
  
  Metrics:
    - total_alerts: Number of unresolved alerts
    - critical_alerts: Number of critical severity alerts
    - avg_supplier_reliability: Average reliability score (0-1)
    - products_below_reorder: Count of products below reorder point
    - delayed_orders_this_week: Orders delayed in last 7 days
    - high_risk_suppliers: Suppliers with HIGH risk level
    - total_suppliers: Total number of suppliers
    - total_products: Total number of products
"""

"""
GET /inventory
  Description: Get all inventory items with shortage indicators
  Query Parameters: None
  Caching: 30 seconds (Redis)
  
  Returns: List of InventoryResponse objects
  
  Example:
    curl http://localhost:8000/inventory
    
  Response (array):
    [
      {
        "id": 1,
        "warehouse_name": "Warehouse A",
        "product_id": 1,
        "product": {
          "id": 1,
          "name": "CPU Processor",
          "category": "Electronics",
          "unit_price": 299.99
        },
        "quantity": 15,
        "reorder_point": 50,
        "last_updated": "2024-01-15T10:30:45.123456",
        "shortage_flag": true
      }
    ]
  
  Shortage Flag:
    - true: quantity < (reorder_point * 0.8)
    - false: quantity >= (reorder_point * 0.8)
"""

"""
GET /suppliers
  Description: Get all suppliers ranked by reliability score (highest first)
  Query Parameters: None
  
  Returns: List of SupplierResponse objects
  
  Example:
    curl http://localhost:8000/suppliers
  
  Response (array):
    [
      {
        "id": 8,
        "name": "Reliable Industries",
        "reliability_score": 0.98,
        "avg_delay_days": 0.5,
        "total_orders": 350,
        "failed_orders": 2,
        "risk_level": "LOW",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-15T10:30:45"
      },
      {
        "id": 1,
        "name": "TechSupply Inc",
        "reliability_score": 0.45,
        "avg_delay_days": 12.3,
        "total_orders": 120,
        "failed_orders": 35,
        "risk_level": "HIGH",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-15T10:30:45"
      }
    ]
  
  Risk Levels:
    - LOW: High reliability (score > 0.85)
    - MEDIUM: Moderate reliability (score 0.65-0.85)
    - HIGH: Low reliability (score < 0.65)
"""

"""
GET /orders
  Description: Get recent orders with delay calculations
  Query Parameters:
    - limit: Maximum number of orders (default: 50, max: 500)
  
  Returns: List of OrderResponse objects
  
  Example:
    curl "http://localhost:8000/orders?limit=100"
  
  Response (array):
    [
      {
        "id": 245,
        "supplier_id": 3,
        "product_id": 7,
        "quantity": 42,
        "order_date": "2024-01-12T14:30:00",
        "expected_date": "2024-01-15T14:30:00",
        "actual_date": "2024-01-18T10:15:00",
        "status": "DELAYED",
        "days_delayed": 3
      }
    ]
  
  Status Values:
    - PENDING: Order placed, awaiting fulfillment
    - DELIVERED: Order fulfilled on time
    - DELAYED: Order fulfilled after expected date
    - CANCELLED: Order was cancelled
  
  Days Delayed:
    - Only populated for DELAYED orders
    - Calculated as: actual_date - expected_date
"""

"""
GET /alerts
  Description: Get active unresolved alerts with optional severity filter
  Query Parameters:
    - severity: Optional filter (CRITICAL, WARNING, INFO)
  
  Returns: List of AlertResponse objects
  
  Example:
    curl http://localhost:8000/alerts
    curl "http://localhost:8000/alerts?severity=CRITICAL"
  
  Response (array):
    [
      {
        "id": 1,
        "alert_type": "HIGH_RISK_SUPPLIER",
        "severity": "CRITICAL",
        "message": "Supplier TechSupply Inc has HIGH risk level. Reliability: 0.45, Avg delay: 12.3 days",
        "supplier_id": 1,
        "product_id": null,
        "created_at": "2024-01-15T10:30:45",
        "is_resolved": false
      },
      {
        "id": 5,
        "alert_type": "INVENTORY_LOW",
        "severity": "WARNING",
        "message": "CRITICAL: CPU Processor at Warehouse A critically low: 12/50",
        "supplier_id": null,
        "product_id": 1,
        "created_at": "2024-01-15T10:28:30",
        "is_resolved": false
      }
    ]
  
  Alert Types:
    - INVENTORY_LOW: Product inventory below threshold
    - HIGH_RISK_SUPPLIER: Supplier with high risk classification
    - ORDER_DELAYED: Order delayed past expected delivery
    - SUPPLIER_FAILURE: Supplier failure or issue
    - FORECAST_ALERT: Demand forecast alert
    - REORDER_NEEDED: Proactive reorder needed
  
  Severity Levels:
    - CRITICAL: Immediate action required
    - WARNING: Should be addressed soon
    - INFO: Informational only
"""

"""
GET /forecast/{product_id}
  Description: Get 30-day demand forecast using XGBoost ML model
  Path Parameters:
    - product_id: ID of the product to forecast
  
  Returns: ForecastResponse with predicted demand for next 30 days
  
  Example:
    curl http://localhost:8000/forecast/1
  
  Response:
    {
      "product_id": 1,
      "product_name": "CPU Processor",
      "forecast_days": 30,
      "model_accuracy": 87.45,
      "forecast_data": [
        {
          "day": 1,
          "predicted_demand": 35,
          "confidence_interval": [28, 42]
        },
        {
          "day": 2,
          "predicted_demand": 38,
          "confidence_interval": [30, 45]
        }
      ]
    }
  
  Model Details:
    - Uses XGBoost regressor trained on historical order data
    - Features include: day of week, day of month, seasonality, moving averages
    - Confidence intervals represent ±20% prediction range
    - Model accuracy is MAPE-based (lower = better)
  
  Error Cases:
    - 404: Product not found
    - 400: Insufficient historical data for forecasting
"""

"""
POST /query
  Description: AI-powered query about supply chain status using Ollama
  Request Body:
    {
      "question": "Your question here"
    }
  
  Returns: QueryResponse with AI-generated answer
  
  Example:
    curl -X POST http://localhost:8000/query \
      -H "Content-Type: application/json" \
      -d '{"question": "Which suppliers have the highest risk?"}'
  
  Response:
    {
      "question": "Which suppliers have the highest risk?",
      "answer": "Based on the current data, the suppliers with the highest risk are...",
      "context_used": 23
    }
  
  Context Information Provided to AI:
    - High-risk suppliers with metrics
    - Critical inventory items
    - Recently delayed orders
    - Active critical alerts
  
  Example Questions:
    - "What is our current supply chain status?"
    - "Which products are critically low?"
    - "What is the reliability of our suppliers?"
    - "Summarize recent order delays"
    - "Which warehouses need restocking?"
  
  Requirements:
    - Ollama must be running locally (http://localhost:11434)
    - Model: llama3.2 (download with: ollama pull llama3.2)
  
  Error Cases:
    - 503: Ollama service unavailable
    - 500: Error processing query
"""

# =============================================================================
# DATA MODELS
# =============================================================================

"""
Supplier Model:
{
  "id": int,
  "name": str,
  "reliability_score": float (0.0-1.0),
  "avg_delay_days": float,
  "total_orders": int,
  "failed_orders": int,
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "created_at": datetime,
  "updated_at": datetime
}

Product Model:
{
  "id": int,
  "name": str,
  "category": str,
  "unit_price": float
}

Inventory Model:
{
  "id": int,
  "warehouse_name": str,
  "product_id": int,
  "product": Product,
  "quantity": int,
  "reorder_point": int,
  "last_updated": datetime,
  "shortage_flag": bool
}

Order Model:
{
  "id": int,
  "supplier_id": int,
  "product_id": int,
  "quantity": int,
  "order_date": datetime,
  "expected_date": datetime,
  "actual_date": datetime | null,
  "status": "PENDING" | "DELIVERED" | "DELAYED" | "CANCELLED",
  "days_delayed": int | null
}

Alert Model:
{
  "id": int,
  "alert_type": str,
  "severity": "CRITICAL" | "WARNING" | "INFO",
  "message": str,
  "supplier_id": int | null,
  "product_id": int | null,
  "created_at": datetime,
  "is_resolved": bool
}
"""

# =============================================================================
# USAGE EXAMPLES
# =============================================================================

"""
Python Example:

import requests
import json

BASE_URL = "http://localhost:8000"

# 1. Get dashboard KPIs
response = requests.get(f"{BASE_URL}/dashboard")
kpis = response.json()
print(f"Total alerts: {kpis['total_alerts']}")
print(f"High-risk suppliers: {kpis['high_risk_suppliers']}")

# 2. Get all suppliers
response = requests.get(f"{BASE_URL}/suppliers")
suppliers = response.json()
for supplier in suppliers:
    print(f"{supplier['name']}: {supplier['reliability_score']:.2f}")

# 3. Get recent orders
response = requests.get(f"{BASE_URL}/orders?limit=10")
orders = response.json()
for order in orders:
    print(f"Order {order['id']}: Status={order['status']}")

# 4. Get critical alerts
response = requests.get(f"{BASE_URL}/alerts?severity=CRITICAL")
alerts = response.json()
for alert in alerts:
    print(f"[CRITICAL] {alert['message']}")

# 5. Get demand forecast
response = requests.get(f"{BASE_URL}/forecast/1")
forecast = response.json()
print(f"Forecast accuracy: {forecast['model_accuracy']:.2f}%")
for point in forecast['forecast_data'][:5]:
    print(f"Day {point['day']}: {point['predicted_demand']} units")

# 6. Query AI
response = requests.post(
    f"{BASE_URL}/query",
    json={"question": "What is our supplier status?"}
)
result = response.json()
print(f"Q: {result['question']}")
print(f"A: {result['answer']}")
"""

"""
JavaScript/Node.js Example:

const BASE_URL = "http://localhost:8000";

// 1. Get dashboard KPIs
fetch(`${BASE_URL}/dashboard`)
  .then(r => r.json())
  .then(data => console.log("KPIs:", data));

// 2. Get suppliers
fetch(`${BASE_URL}/suppliers`)
  .then(r => r.json())
  .then(suppliers => {
    suppliers.forEach(s => {
      console.log(`${s.name}: ${s.reliability_score}`);
    });
  });

// 3. Post AI query
fetch(`${BASE_URL}/query`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    question: 'Which products need restocking?'
  })
})
  .then(r => r.json())
  .then(data => console.log("AI Response:", data.answer));

// 4. Check health
fetch(`${BASE_URL}/health`)
  .then(r => r.json())
  .then(data => console.log("Status:", data.status));
"""

"""
cURL Examples:

# Get dashboard
curl http://localhost:8000/dashboard | jq

# Get suppliers sorted by reliability
curl http://localhost:8000/suppliers | jq '.[] | {name, reliability_score}'

# Get critical alerts
curl "http://localhost:8000/alerts?severity=CRITICAL" | jq

# Get recent orders (last 20)
curl "http://localhost:8000/orders?limit=20" | jq

# Get inventory with shortage flags
curl http://localhost:8000/inventory | jq '.[] | select(.shortage_flag == true)'

# Get forecast for product 1
curl http://localhost:8000/forecast/1 | jq

# Ask AI question
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Summarize critical issues"}' | jq '.answer'
"""

# =============================================================================
# RESPONSE CODES
# =============================================================================

"""
200 OK
  The request was successful and the response body contains the data.

201 Created
  The resource was successfully created.

400 Bad Request
  The request is invalid or missing required parameters.
  Example: insufficient data for forecasting

404 Not Found
  The requested resource does not exist.
  Example: product ID not found

500 Internal Server Error
  An error occurred on the server.
  Example: database connection error

503 Service Unavailable
  A required service is not available.
  Example: Ollama not running for AI queries
"""

# =============================================================================
# CACHING STRATEGY
# =============================================================================

"""
Redis Caching (30-second TTL):

1. Dashboard KPIs
   - Key: "dashboard:kpis"
   - TTL: 30 seconds
   - Refreshed on background task runs

2. Inventory
   - Key: "inventory:all"
   - TTL: 30 seconds
   - Cleared when inventory updates

Background tasks run every 10 seconds and automatically:
- Update inventory quantities
- Generate new random orders
- Check alert thresholds
- Update supplier risk levels
- Clear relevant cache keys

To manually clear cache:
  - Redis CLI: redis-cli DEL "dashboard:*" "inventory:*"
  - Or restart application
"""

# =============================================================================
# RATE LIMITING NOTES
# =============================================================================

"""
Current Implementation:
- No rate limiting implemented
- All endpoints accessible without authentication

Production Considerations:
- Implement JWT token authentication
- Add API key validation
- Add rate limiting (e.g., 100 requests/minute per client)
- Use API Gateway or middleware for rate control
- Add request logging and monitoring
"""

# =============================================================================
# PERFORMANCE NOTES
# =============================================================================

"""
Optimization Features:
1. Database Connection Pooling
   - Pool size: 10
   - Max overflow: 20
   - Configurable in database.py

2. Redis Caching
   - 30-second cache TTL for heavy operations
   - Reduces database load
   - Graceful fallback if Redis unavailable

3. Background Tasks
   - Runs every 10 seconds asynchronously
   - Updates cache proactively
   - Generates alerts proactively

4. Query Optimization
   - Indexed database fields
   - Efficient joins for relationships
   - Limited result sets with pagination

5. Forecasting Model
   - XGBoost with 100 estimators
   - Trains on 80% of historical data
   - Predicts 30 days forward
   - Includes lag and seasonal features
"""
