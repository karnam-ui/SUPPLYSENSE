# SupplySense Dashboard - Complete Setup & Running Guide

## System Requirements

- **Node.js**: 16.x or higher
- **npm**: 7.x or higher
- **Backend**: Running on http://localhost:8000
- **Optional - For AI Features**: Ollama with llama3.2 model

## Quick Start (30 seconds)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Dashboard will be available at: **http://localhost:5173**

---

## Full Installation Steps

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

Expected output:
```
added 104 packages in ~1 minute
```

### 2. Ensure Backend is Running

Start the SupplySense backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend should be running at: **http://localhost:8000**

Check backend health:
```bash
curl http://localhost:8000/health
```

### 3. (Optional) Set up AI Features

For the "Ask SupplySense" AI chat to work, install and run Ollama:

```bash
# Download from: https://ollama.ai
# Then pull the model
ollama pull llama3.2

# Start Ollama (if not already running)
ollama serve
```

Ollama should be accessible at: **http://localhost:11434**

### 4. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v8.1.1  ready in 123 ms
  
  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

---

## Dashboard Usage

### Main Navigation (Left Sidebar)

1. **Overview** - Dashboard with KPIs and alerts
2. **Inventory** - Product inventory management
3. **Suppliers** - Supplier performance ranking
4. **Forecasting** - AI demand predictions
5. **Ask SupplySense** - Chat with AI

Click the chevron (< >) to collapse/expand sidebar.

### Real-time Features

- **Live Indicator** - Green blinking dot in top-right shows "Live" status
- **Auto-Update** - All data refreshes every 10 seconds
- **Last Updated** - Timestamp showing latest poll time

### Key Features by Page

#### Overview Dashboard
- View 4 critical KPIs
- See recent alerts
- Monitor at-risk suppliers
- Click suppliers for details

#### Inventory
- Search products by name
- View stock levels vs. reorder points
- See warehouse locations
- Color-coded status badges

#### Suppliers
- Ranked by reliability score
- Expandable rows with details
- Risk level indicators
- Performance metrics

#### Forecasting
- Select product from dropdown
- View 30-day demand forecast
- Compare historical vs. predicted
- See forecast accuracy

#### Ask SupplySense
- Ask natural language questions
- Try example queries
- Get AI-powered insights
- Full conversation history

---

## Development Workflow

### Hot Module Replacement (HMR)

Vite enables automatic reloading when you edit code:

```bash
npm run dev
```

Edit any file and see changes instantly in browser.

### Build for Production

Create optimized production bundle:

```bash
npm run build
```

Output will be in `frontend/dist/` directory.

Preview production build locally:

```bash
npm run preview
```

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Symptoms**: Dashboard shows "Loading..." forever

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:8000/health
   ```
2. Check backend logs for errors
3. Ensure CORS is enabled in backend
4. Try accessing http://localhost:8000 directly in browser

### Issue: "AI Chat not responding"

**Symptoms**: "Ask SupplySense" shows error messages

**Solutions**:
1. Check if Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```
2. Ensure model is pulled:
   ```bash
   ollama list
   ```
3. If model missing, pull it:
   ```bash
   ollama pull llama3.2
   ```

### Issue: "Port 5173 already in use"

**Solutions**:
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or run on different port
npm run dev -- --port 5174
```

### Issue: "Slow/No data updates"

**Solutions**:
1. Check network tab in DevTools (F12)
2. Look for failed requests to http://localhost:8000
3. Check backend database connectivity
4. Verify Redis is running (if backend uses caching)

---

## Configuration

### Change Polling Interval

Edit `src/hooks/useAPI.js`:

```javascript
const POLL_INTERVAL = 10000; // Change this value (milliseconds)
```

Examples:
- 5000 = 5 seconds (faster, more requests)
- 30000 = 30 seconds (slower, fewer requests)

### Change API Base URL

Edit `src/hooks/useAPI.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000'; // Change this
```

### Change Color Theme

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  'supply': {
    'bg': '#0f172a',        // Background color
    'card': '#1e293b',      // Card color
    'accent': '#3b82f6',    // Accent/highlight color
    'critical': '#ef4444',  // Critical/error color
    'warning': '#f59e0b',   // Warning color
    'success': '#22c55e',   // Success color
  }
}
```

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Overview.jsx           # Main dashboard page
│   │   ├── Inventory.jsx          # Inventory management
│   │   ├── Suppliers.jsx          # Supplier rankings
│   │   ├── Forecasting.jsx        # Demand forecasting
│   │   ├── AskSupplySense.jsx     # AI chat interface
│   │   ├── KPICard.jsx            # Reusable KPI component
│   │   ├── AlertCard.jsx          # Alert display component
│   │   └── SupplierCard.jsx       # Supplier card component
│   ├── hooks/
│   │   └── useAPI.js              # React hook for data fetching
│   ├── utils/
│   │   └── apiAdapter.js          # API response transformers
│   ├── App.jsx                    # Main application layout
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global Tailwind styles
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
└── package.json                   # Dependencies
```

---

## API Integration

### Endpoints Polled (Every 10 seconds)

| Endpoint | Purpose | Data |
|----------|---------|------|
| `GET /dashboard` | KPI metrics | Alerts, reliability, reorder count, delays |
| `GET /inventory` | All inventory items | Product stock, reorder points, warehouses |
| `GET /suppliers` | Supplier list | Reliability, delays, risk levels |
| `GET /alerts` | Active alerts | Alert type, severity, message |
| `GET /orders` | Recent orders | Order status, delays, dates |
| `GET /forecast/{id}` | Demand forecast | 30-day predictions, accuracy, confidence |
| `POST /query` | AI question | Uses Ollama to answer questions |

### Response Format Example

```javascript
// Dashboard KPI Response
{
  "total_alerts": 5,
  "critical_alerts": 2,
  "avg_supplier_reliability": 0.854,
  "products_below_reorder": 3,
  "delayed_orders_this_week": 1,
  "high_risk_suppliers": 2,
  "total_suppliers": 10,
  "total_products": 50
}
```

---

## Performance Optimization

### 1. Minimize API Calls
- Increase polling interval if network is slow
- Backend caches responses for 30 seconds

### 2. Browser Optimization
- Clear cache if experiencing stale data
- Use Chrome DevTools to profile performance

### 3. Production Build
- Always use `npm run build` for deployment
- Minifies CSS and JavaScript automatically
- Reduces bundle size by ~70%

---

## Browser DevTools Tips

### Debug Network Issues (F12 → Network)
- Filter by: XHR/Fetch
- Check response status (200 = success, 5xx = errors)
- See response times

### Debug React Components (F12 → Components)
- Inspect component state
- See props passed to components
- Hover over elements to see component tree

### Debug Styles (F12 → Elements)
- Check computed Tailwind classes
- Toggle styles to debug styling

---

## Deployment

### For Production Hosting

```bash
# Build optimized bundle
npm run build

# Output goes to dist/ folder
# Deploy dist/ contents to your web server
```

### Environment-Specific Backend URLs

Create `.env` files:

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000

# .env.production
VITE_API_BASE_URL=https://api.supplysense.com
```

Update `src/hooks/useAPI.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

---

## Support & Documentation

- **Backend Docs**: See `backend/API_DOCUMENTATION.md`
- **Frontend Docs**: See `frontend/README.md`
- **API Health Check**: http://localhost:8000/health
- **Swagger UI**: http://localhost:8000/docs (if backend has FastAPI docs)

---

## Quick Commands Reference

```bash
# Start frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install/update dependencies
npm install

# Check Node version
node --version

# Check npm version
npm --version
```

---

## Next Steps

1. ✅ Start backend: `cd backend && python main.py`
2. ✅ Start frontend: `cd frontend && npm run dev`
3. ✅ Open http://localhost:5173 in browser
4. ✅ Explore dashboard pages
5. ✅ Try example queries in "Ask SupplySense"

Enjoy using SupplySense! 🚀
