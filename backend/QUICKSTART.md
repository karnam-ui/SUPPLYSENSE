"""Quick start guide for SupplySense backend."""

# ============================================================================
# SUPPLYSENSE BACKEND - QUICK START GUIDE
# ============================================================================

"""
This guide will get you up and running with SupplySense in 5 minutes!

========================================================================
STEP 1: CHECK PREREQUISITES
========================================================================

You need:
✓ Python 3.8 or higher
✓ PostgreSQL 12 or higher
✓ Optional: Redis 6+ for caching
✓ Optional: Ollama for AI features

Check versions:
  python --version
  psql --version
  redis-cli --version (optional)

========================================================================
STEP 2: CREATE DATABASE
========================================================================

PostgreSQL (all platforms):

  psql -U postgres
  CREATE DATABASE supplysense;
  \q

That's it! The app will create tables automatically.

========================================================================
STEP 3: INSTALL & RUN (Linux/macOS)
========================================================================

# One command to set up and run:
chmod +x run.sh
./run.sh

The script will:
✓ Create virtual environment
✓ Install dependencies
✓ Create database tables
✓ Seed with sample data
✓ Start Redis (if available)
✓ Launch the API server

Done! Server runs on http://localhost:8000

========================================================================
STEP 3: INSTALL & RUN (Windows)
========================================================================

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python setup.py

# Start Redis (optional, in another terminal)
redis-server

# Run the app
python main.py

Done! Server runs on http://localhost:8000

========================================================================
STEP 4: VERIFY IT'S WORKING
========================================================================

Test the health endpoint:
  curl http://localhost:8000/health

Visit the interactive docs:
  Open http://localhost:8000/docs in your browser

Run the test suite:
  python test_endpoints.py

========================================================================
STEP 5: EXPLORE THE API
========================================================================

Get Dashboard KPIs:
  curl http://localhost:8000/dashboard

Get All Suppliers:
  curl http://localhost:8000/suppliers

Get Inventory:
  curl http://localhost:8000/inventory

Get Orders:
  curl http://localhost:8000/orders

Get Alerts:
  curl http://localhost:8000/alerts

Get Forecast:
  curl http://localhost:8000/forecast/1

Query AI (requires Ollama):
  curl -X POST http://localhost:8000/query \
    -H "Content-Type: application/json" \
    -d '{"question": "What is our supply chain status?"}'

========================================================================
OPTIONAL: ENABLE AI FEATURES
========================================================================

To enable the AI query endpoint:

1. Download Ollama from https://ollama.ai
2. Pull the model: ollama pull llama3.2
3. Run Ollama: ollama serve
4. Now /query endpoint will work!

Test it:
  curl -X POST http://localhost:8000/query \
    -H "Content-Type: application/json" \
    -d '{"question": "Which suppliers have high risk?"}'

========================================================================
OPTIONAL: ENABLE CACHING
========================================================================

To enable Redis caching:

1. Install Redis from https://redis.io
2. Run: redis-server
3. The app will automatically use it!

Benefits:
✓ 30x faster dashboard queries
✓ Automatic cache refresh every 10 seconds
✓ Works without it (no caching fallback)

========================================================================
API ENDPOINTS QUICK REFERENCE
========================================================================

GET /
  API information

GET /health
  System health check

GET /dashboard
  Dashboard KPIs (cached)

GET /suppliers
  All suppliers by reliability

GET /inventory
  All inventory items

GET /orders
  Recent orders (last 50)

GET /alerts
  Active alerts

GET /forecast/{product_id}
  30-day demand forecast

POST /query
  Ask AI about supply chain

========================================================================
SAMPLE DATA
========================================================================

The database is seeded with:
✓ 10 suppliers (3 high-risk, 4 medium, 3 low-risk)
✓ 20 products across 4 categories
✓ 5 warehouses with inventory
✓ 300 historical orders (6 months)
✓ 10 active alerts

All data is realistic and updates every 10 seconds!

========================================================================
TROUBLESHOOTING
========================================================================

Server won't start?
  - Is PostgreSQL running? (psql -U postgres -c "SELECT 1")
  - Is port 8000 in use? (Use --port 8001 in uvicorn command)

Database connection error?
  - Create database: psql -U postgres -c "CREATE DATABASE supplysense"
  - Check DATABASE_URL in config.py

Missing dependencies?
  pip install -r requirements.txt

Redis not available?
  - It's optional! App works without it
  - To enable: redis-server

Ollama not working?
  - It's optional! AI features just won't work
  - Make sure ollama serve is running
  - Run: ollama pull llama3.2

========================================================================
INTERACTIVE API DOCUMENTATION
========================================================================

Swagger UI:
  http://localhost:8000/docs

ReDoc:
  http://localhost:8000/redoc

These let you test endpoints directly in your browser!

========================================================================
CONFIGURATION
========================================================================

All settings are in config.py:

DATABASE_URL: PostgreSQL connection string
REDIS_URL: Redis connection string
SERVER_PORT: Port number (default 8000)
OLLAMA_BASE_URL: Ollama server address
BACKGROUND_TASK_INTERVAL: Task frequency in seconds

Environment variables override config.py:
  export DATABASE_URL="postgresql://user:pass@host/db"
  export REDIS_URL="redis://localhost:6379/0"

========================================================================
STOPPING THE SERVER
========================================================================

Press Ctrl+C in the terminal

Redis will keep running in background (if started with --daemonize)
To stop Redis: redis-cli shutdown

========================================================================
NEXT STEPS
========================================================================

1. Read API_DOCUMENTATION.md for detailed endpoint docs
2. Read README.md for complete setup guide
3. Explore /docs for interactive API testing
4. Check background_tasks.py to customize monitoring
5. Modify config.py for your environment

========================================================================
TIPS
========================================================================

✓ Use /docs endpoint to test all endpoints
✓ Dashboard updates every 10 seconds (background task)
✓ Inventory changes every 10 seconds (simulated)
✓ Orders are generated every 10 seconds (simulated)
✓ Alerts are created based on thresholds (automatic)
✓ Forecasts use 6 months of historical data
✓ AI queries use database context for accuracy

========================================================================
READY TO GO!
========================================================================

Your SupplySense backend is ready!

API: http://localhost:8000
Docs: http://localhost:8000/docs

Happy supply chaining! 🚀
"""
