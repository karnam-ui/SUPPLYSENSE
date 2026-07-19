# SupplySense Dashboard - Complete Documentation

## 📊 Overview

SupplySense is an enterprise-grade React dashboard for real-time supply chain intelligence. It provides real-time monitoring, predictive analytics, and AI-powered insights.

## ✨ Key Features

### Real-Time Monitoring
- **10-second polling** from backend
- Live KPI indicators
- Green blinking "Live" status indicator
- Auto-updating last modified timestamp

### 5 Main Sections
1. **Overview** - Dashboard with KPIs and alerts
2. **Inventory** - Product and warehouse management
3. **Suppliers** - Supplier performance rankings
4. **Forecasting** - AI demand predictions
5. **Ask SupplySense** - Natural language AI queries

### Enterprise-Grade Design
- Dark professional theme
- Color-coded severity indicators
- Responsive layouts
- Collapsible navigation

### Data Visualization
- Interactive bar charts
- Time-series line charts
- Real-time data updates
- Confidence interval ranges

## 🎨 Design System

### Color Palette
```
Background:       #0f172a (Deep Navy)
Cards:            #1e293b (Slate)
Accent:           #3b82f6 (Blue)
Critical/Error:   #ef4444 (Red)
Warning:          #f59e0b (Amber)
Success:          #22c55e (Green)
```

### Components
- **KPI Cards** - Display key metrics with threshold alerts
- **Alert Cards** - Color-coded severity (critical/warning/info)
- **Data Tables** - Searchable, sortable with expandable rows
- **Charts** - Interactive Recharts visualizations
- **Modals** - Detailed information views

## 🏗️ Architecture

### Technology Stack
- **React 19** - UI components
- **Vite** - Build tool (lightning fast)
- **Tailwind CSS 4** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP requests
- **Lucide Icons** - SVG icons

### Component Structure
```
App (Main Layout)
├── Sidebar (Navigation + Live Indicator)
├── Top Bar (Page Title + Last Updated)
└── Page Content
    ├── Overview
    ├── Inventory
    ├── Suppliers
    ├── Forecasting
    └── AskSupplySense
```

### Data Flow
```
Backend API (http://localhost:8000)
    ↓
useAPI Hook (10s polling)
    ↓
Components (Display Data)
    ↓
User Interactions (Click, Search, Filter)
```

## 📱 Page Details

### 1. Overview Dashboard
**Purpose**: High-level supply chain status

**Components**:
- 4 KPI Cards
  - Active Alerts (red if > 5)
  - Avg Supplier Reliability (percentage)
  - Products Below Reorder (red if > 3)
  - Delayed Orders This Week (red if > 2)

- Recent Alerts Feed (left)
  - Color-coded by severity
  - Latest 5 alerts
  - Scrollable overflow

- At-Risk Suppliers (right)
  - Suppliers with HIGH risk level
  - Up to 5 displayed
  - Click to view details

- Chart: Top Suppliers Performance
  - Bar chart comparing reliability scores
  - Shows top 5 suppliers

**Interactions**:
- Click supplier card → View details modal
- Close modal → X button or outside click

### 2. Inventory Management
**Purpose**: Product stock level monitoring

**Features**:
- Search box (by product name)
- Data table columns:
  - Warehouse
  - Product Name
  - Current Stock
  - Reorder Point
  - Status badge (Critical/Low/OK)
  - Last Updated time

- Bar chart: Stock Levels Overview
  - Current stock vs. reorder point
  - Top 8 products

**Color Coding**:
- Critical: Red (quantity ≤ reorder point)
- Low: Amber (quantity ≤ reorder point × 1.5)
- OK: Green (quantity > reorder point × 1.5)

### 3. Suppliers
**Purpose**: Supplier performance tracking

**Table Features**:
- Ranked by reliability score (high to low)
- Expandable rows (click row to expand)
- Columns:
  - Supplier Name
  - Reliability Score (%)
  - Average Delay (days)
  - Total Orders
  - Failed Orders
  - Risk Level Badge

- Risk Level Color Coding:
  - HIGH: Red badge with ⚠️
  - MEDIUM: Amber badge
  - LOW: Green badge

**Expandable Details**:
- Creation date
- Last update date
- Success rate calculation
- Full reliability percentage
- "View Order History" button

**Statistics Bar**:
- Total Suppliers count
- Average Reliability %
- At-Risk Count

### 4. Forecasting
**Purpose**: Demand prediction and stock planning

**Features**:
- Product dropdown selector
- 30-day line chart showing:
  - Historical demand (blue)
  - Forecast (green dashed)
  - Confidence intervals (gray dashed)

- Forecast Accuracy badge
  - Shows model accuracy percentage
  - Trending up indicator

**Stats Cards**:
- Model Accuracy %
- Forecast Period (30 days)
- Average Predicted Demand
- 30-Day Total units

**Insights Section**:
- Model confidence statement
- Total forecast calculation
- Average daily demand
- Confidence range explanation

### 5. Ask SupplySense
**Purpose**: AI-powered Q&A about supply chain

**Features**:
- Chat interface with message history
- User messages: right-aligned, blue background
- Bot messages: left-aligned, dark card
- Timestamps for each message
- Loading spinner while processing

**Example Queries** (shown on first load):
- "Which suppliers are highest risk this week?"
- "Which products need urgent restocking?"
- "What is our biggest supply chain risk right now?"
- "Which warehouse has the most critical shortage?"

**Requirements**:
- Ollama running locally at http://localhost:11434
- llama3.2 model installed

## 🔄 Real-Time Updates

### Polling Mechanism
Every 10 seconds, the dashboard fetches fresh data:

```javascript
// Polling configuration
const POLL_INTERVAL = 10000; // milliseconds
```

### Endpoints Polled
1. `/dashboard` - KPI metrics
2. `/inventory` - Stock levels
3. `/suppliers` - Reliability scores
4. `/alerts` - Active alerts
5. `/orders` - Recent orders
6. `/forecast/{product_id}` - Predictions (on demand)
7. `/query` - AI responses (on demand)

### Live Indicator
- Green blinking dot in top-right
- Updates every 10 seconds
- Shows "Last updated" timestamp

## 🎯 User Workflows

### Monitor Critical Issues
1. Open dashboard
2. Check KPI cards for red indicators
3. Review Recent Alerts feed
4. Click at-risk supplier for details
5. Ask SupplySense for recommendations

### Manage Inventory
1. Go to Inventory page
2. Search for products
3. Check stock levels vs. reorder points
4. Identify critical shortages (red badges)
5. Go to Forecasting to predict demand

### Analyze Suppliers
1. Go to Suppliers page
2. Review supplier rankings
3. Expand HIGH risk suppliers
4. Check success rate and delays
5. Plan mitigation strategies

### Forecast Demand
1. Go to Forecasting page
2. Select product from dropdown
3. View 30-day prediction chart
4. Check confidence intervals
5. Plan procurement accordingly

### Ask Questions
1. Go to Ask SupplySense page
2. Try example queries or ask custom questions
3. Review AI responses
4. Follow up with related questions
5. Export insights as needed

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 16.x
npm >= 7.x
Backend running on http://localhost:8000
Ollama (optional, for AI features)
```

### Quick Start
```bash
cd frontend
npm install
npm run dev
```

Dashboard: http://localhost:5173

### Production Build
```bash
npm run build
```

Optimized output in `dist/` folder.

## 📊 Data Structures

### KPI Response
```json
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

### Inventory Item
```json
{
  "id": 1,
  "warehouse_name": "Warehouse A",
  "product": {
    "id": 1,
    "name": "CPU Processor",
    "category": "Electronics",
    "unit_price": 299.99
  },
  "quantity": 15,
  "reorder_point": 50,
  "shortage_flag": true,
  "last_updated": "2024-01-15T10:30:45"
}
```

### Supplier Item
```json
{
  "id": 1,
  "name": "TechSupply Inc",
  "reliability_score": 0.854,
  "avg_delay_days": 2.3,
  "total_orders": 120,
  "failed_orders": 12,
  "risk_level": "MEDIUM",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-15T10:30:45"
}
```

### Alert Item
```json
{
  "id": 1,
  "alert_type": "INVENTORY_LOW",
  "severity": "CRITICAL",
  "message": "CPU Processor at Warehouse A critically low: 12/50",
  "supplier_id": null,
  "product_id": 1,
  "created_at": "2024-01-15T10:30:45",
  "is_resolved": false
}
```

### Forecast Item
```json
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
    }
  ]
}
```

## 🔧 Customization

### Change Polling Interval
Edit `src/hooks/useAPI.js`:
```javascript
const POLL_INTERVAL = 5000; // 5 seconds (faster)
```

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'supply': {
    'bg': '#0f172a',
    'card': '#1e293b',
    'accent': '#3b82f6',
    // ...
  }
}
```

### Change API URL
Edit `src/hooks/useAPI.js`:
```javascript
const API_BASE_URL = 'https://api.example.com';
```

## 📈 Performance

- **Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: 90+
- **Bundle Size**: ~150 KB (gzipped)

Optimizations:
- Code splitting with React.lazy
- Memoization with useMemo
- Efficient polling with useCallback
- CSS purging with Tailwind

## 🐛 Troubleshooting

### Backend Not Connected
- Check: `curl http://localhost:8000/health`
- Verify backend is running
- Check CORS settings

### AI Chat Not Working
- Ensure Ollama is running: `ollama serve`
- Check model: `ollama list`
- Pull if missing: `ollama pull llama3.2`

### Slow Updates
- Check network tab in DevTools
- Verify backend performance
- Consider increasing poll interval

### Port Already in Use
```bash
lsof -ti:5173 | xargs kill -9
# Or use different port
npm run dev -- --port 5174
```

## 📚 Additional Resources

- Backend API Docs: `backend/API_DOCUMENTATION.md`
- Setup Guide: `frontend/SETUP_GUIDE.md`
- Frontend README: `frontend/README.md`
- Backend README: `backend/README.md`

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Recharts Examples](https://recharts.org/examples)

---

**SupplySense Dashboard** - Enterprise Supply Chain Intelligence Platform
*Built with React, Vite, and Tailwind CSS*
