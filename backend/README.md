# SupplySense Backend Setup Guide

This is a comprehensive README for the SupplySense backend. Follow the setup instructions for your operating system.

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/)
- **Redis 6+** (optional but recommended) - [Download](https://redis.io/)
- **Ollama** (for AI query endpoint) - [Download](https://ollama.ai/)

### Installation & Setup (Linux/macOS)

```bash
# Make the run script executable
chmod +x run.sh

# Run the automated setup and start the server
./run.sh
```

The script will:
1. Check dependencies
2. Create a Python virtual environment
3. Install all required packages
4. Set up the PostgreSQL database
5. Seed the database with initial data
6. Start Redis (if available)
7. Launch the FastAPI server

### Installation & Setup (Windows)

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python setup.py

# Start Redis (if available in WSL or separate terminal)
redis-server

# Run the application
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📋 Manual Setup Steps

If you prefer manual setup:

### 1. Database Setup

First, create the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE supplysense;

# Create user (optional)
CREATE USER supplysense_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE supplysense TO supplysense_user;

\q  # Exit psql
```

### 2. Environment Configuration

Edit `config.py` to set your database URL:

```python
DATABASE_URL = "postgresql://postgres:password@localhost/supplysense"
REDIS_URL = "redis://localhost:6379/0"
OLLAMA_BASE_URL = "http://localhost:11434"
```

### 3. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Initialize Database

```bash
python setup.py
```

This will:
- Create all database tables
- Seed with 10 suppliers, 20 products, 5 warehouses, historical orders, and alerts

### 5. Start Redis (Optional)

For caching support:

```bash
redis-server
```

### 6. Start Ollama (Optional)

For AI query support:

```bash
ollama serve
```

### 7. Run the Application

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Or use:

```bash
python main.py
```

## 📚 API Endpoints

Access the interactive API documentation at: **http://localhost:8000/docs**

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/dashboard` | GET | KPI metrics (cached) |
| `/inventory` | GET | All inventory items |
| `/suppliers` | GET | All suppliers ranked by reliability |
| `/orders` | GET | Recent 50 orders (configurable) |
| `/alerts` | GET | Unresolved alerts |
| `/forecast/{product_id}` | GET | 30-day demand forecast |
| `/query` | POST | AI-powered supply chain query |

### Query Examples

#### Dashboard KPIs
```bash
curl http://localhost:8000/dashboard
```

Response:
```json
{
  "total_alerts": 10,
  "critical_alerts": 2,
  "avg_supplier_reliability": 0.75,
  "products_below_reorder": 5,
  "delayed_orders_this_week": 3,
  "high_risk_suppliers": 3,
  "total_suppliers": 10,
  "total_products": 20
}
```

#### Get Suppliers
```bash
curl http://localhost:8000/suppliers
```

#### Get Recent Orders
```bash
curl "http://localhost:8000/orders?limit=50"
```

#### Get Alerts
```bash
curl "http://localhost:8000/alerts?severity=CRITICAL"
```

#### Forecast Demand
```bash
curl http://localhost:8000/forecast/1
```

#### AI Query
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Which suppliers have the highest risk?"}'
```

## 🔧 Configuration

All configuration is in `config.py`:

```python
# Database
DATABASE_URL = "postgresql://user:password@host/database"

# Redis Cache
REDIS_URL = "redis://localhost:6379/0"
REDIS_CACHE_EXPIRE = 30  # seconds

# Server
SERVER_PORT = 8000
SERVER_HOST = "0.0.0.0"

# Ollama AI
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2"

# Background Tasks
BACKGROUND_TASK_INTERVAL = 10  # seconds

# Forecasting
FORECAST_DAYS = 30
HISTORICAL_DATA_DAYS = 180
```

## 📊 Database Models

### Supplier
- `id`: Primary key
- `name`: Supplier name
- `reliability_score`: 0.0-1.0
- `avg_delay_days`: Average delay
- `total_orders`: Total order count
- `failed_orders`: Count of failed orders
- `risk_level`: LOW, MEDIUM, HIGH

### Product
- `id`: Primary key
- `name`: Product name
- `category`: Category (Electronics, Machinery, etc.)
- `unit_price`: Price per unit

### Inventory
- `id`: Primary key
- `warehouse_name`: Warehouse location
- `product_id`: Foreign key
- `quantity`: Current stock
- `reorder_point`: Threshold for reordering
- `last_updated`: Update timestamp

### Order
- `id`: Primary key
- `supplier_id`: Foreign key
- `product_id`: Foreign key
- `quantity`: Order quantity
- `order_date`: Date placed
- `expected_date`: Expected delivery
- `actual_date`: Actual delivery (if completed)
- `status`: PENDING, DELIVERED, DELAYED, CANCELLED

### Alert
- `id`: Primary key
- `alert_type`: Alert category
- `severity`: CRITICAL, WARNING, INFO
- `message`: Alert message
- `supplier_id`: Optional foreign key
- `product_id`: Optional foreign key
- `is_resolved`: Resolution status

## 🔄 Background Tasks

The system runs background monitoring tasks every 10 seconds:

1. **Update Inventory**: Simulate warehouse activity with random quantity changes
2. **Generate Orders**: Create random new orders
3. **Check Thresholds**: Create alerts for low inventory
4. **Monitor Delays**: Identify and flag delayed orders
5. **Risk Assessment**: Update supplier risk levels based on metrics
6. **Cache Refresh**: Clear Redis cache to refresh data

## 💾 Caching

Redis caching improves performance:

- Dashboard KPIs: 30-second TTL
- Inventory: 30-second TTL
- Cache misses trigger database queries

Disable caching by not running Redis; the app will work without it.

## 🤖 AI Features

The `/query` endpoint uses **Ollama with llama3.2** model:

### Requirements
- Download and run Ollama: `ollama pull llama3.2` then `ollama serve`

### Example Queries
- "Which suppliers have the highest risk?"
- "What products are critically low on inventory?"
- "How many delayed orders do we have this week?"
- "Which warehouses need urgent restocking?"

## 🧪 Testing Endpoints

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Dashboard
curl http://localhost:8000/dashboard

# All suppliers
curl http://localhost:8000/suppliers | jq

# All products in inventory
curl http://localhost:8000/inventory | jq

# Recent orders
curl http://localhost:8000/orders | jq

# Alerts
curl http://localhost:8000/alerts | jq

# Forecast
curl http://localhost:8000/forecast/1 | jq

# AI query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is our supplier risk status?"}' | jq
```

### Using Python
```python
import requests

# Dashboard
response = requests.get("http://localhost:8000/dashboard")
print(response.json())

# Query
response = requests.post(
    "http://localhost:8000/query",
    json={"question": "Summarize the current supply chain status"}
)
print(response.json())
```

### Using JavaScript/Node.js
```javascript
// Fetch dashboard
fetch('http://localhost:8000/dashboard')
  .then(r => r.json())
  .then(data => console.log(data));

// Post query
fetch('http://localhost:8000/query', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({question: 'What is the supply chain status?'})
})
  .then(r => r.json())
  .then(data => console.log(data));
```

## 📈 Initial Data

The system seeds with:
- **10 Suppliers**: 3 high-risk, 4 medium-risk, 3 low-risk
- **20 Products**: Across 4 categories (Electronics, Machinery, Raw Materials, Components)
- **5 Warehouses**: A, B, C, D, E with varying inventory levels
- **300 Historical Orders**: 6 months of data with varying statuses
- **10 Active Alerts**: Mix of critical, warning, and info levels

## 🐛 Troubleshooting

### Connection Refused
```
Error: ConnectionRefusedError
```
Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
Services app > PostgreSQL > Start
```

### Redis Connection Error
```
Error: Failed to connect to Redis
```
The app will work without Redis (no caching). To enable:
```bash
redis-server
```

### Ollama Connection Error
```
Error: Failed to connect to Ollama
```
To enable AI queries:
```bash
ollama pull llama3.2
ollama serve
```

### Port Already in Use
```
Error: Address already in use
```
Use a different port:
```bash
python -m uvicorn main:app --port 8001
```

### Database Migration Issues
Reset the database:
```bash
psql -U postgres -d supplysense -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
python setup.py
```

## 📝 Project Structure

```
supplysense-backend/
├── main.py                 # FastAPI application
├── models.py              # SQLAlchemy database models
├── database.py            # Database connection and session
├── config.py              # Configuration settings
├── schemas.py             # Pydantic response schemas
├── cache.py               # Redis cache utilities
├── forecasting.py         # XGBoost demand forecasting
├── ai_utils.py            # Ollama AI integration
├── seeding.py             # Database seeding
├── background_tasks.py    # Background monitoring tasks
├── setup.py               # Database initialization script
├── requirements.txt       # Python dependencies
├── run.sh                 # Automated setup script (Linux/macOS)
└── README.md              # This file
```

## 🔐 Security Notes

For production deployment:

1. **Change default credentials** in config.py
2. **Use environment variables** for sensitive data
3. **Enable HTTPS/TLS** for API endpoints
4. **Set up proper authentication** (JWT, API keys)
5. **Use database connection pooling**
6. **Implement rate limiting**
7. **Add input validation** for all endpoints
8. **Use secure Redis** with password authentication

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the endpoint documentation at `/docs`
3. Check application logs for error messages
4. Ensure all prerequisites are installed

## 📄 License

This project is provided as-is for the SupplySense system.

---

**SupplySense Backend v1.0.0** - Supply Chain Intelligence System
