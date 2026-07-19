# SupplySense Dashboard Frontend

A premium, enterprise-grade React dashboard for real-time supply chain intelligence and monitoring.

## Features

✅ **Real-time Data Polling** - Updates every 10 seconds from backend
✅ **5 Main Pages** - Overview, Inventory, Suppliers, Forecasting, Ask SupplySense
✅ **Dark Professional Theme** - Enterprise-grade UI with Tailwind CSS
✅ **Live Data Visualization** - Charts powered by Recharts
✅ **AI Integration** - Ask SupplySense powered by Ollama LLM
✅ **Responsive Design** - Works on desktop and tablet
✅ **Collapsible Sidebar** - Toggle navigation for more screen space

## Pages Overview

### 1. Overview (Dashboard)
- 4 KPI cards showing critical metrics
- Recent alerts feed with color-coded severity
- At-risk suppliers widget
- Top suppliers performance bar chart
- Click on suppliers to view details

### 2. Inventory Management
- Searchable product table with warehouse info
- Real-time stock level indicators
- Color-coded status (Critical/Low/OK)
- Stock levels overview chart
- Last updated timestamps

### 3. Suppliers
- Ranked supplier table by reliability score
- Expandable rows showing detailed metrics
- Risk level badges (HIGH/MEDIUM/LOW)
- Performance statistics
- Click to view supplier order history

### 4. Forecasting
- Product selector dropdown
- 30-day demand forecast with historical comparison
- Confidence interval visualization
- Model accuracy display
- Predictive insights

### 5. Ask SupplySense
- Chat interface with AI responses
- Example query suggestions
- Real-time loading indicators
- Message history with timestamps
- Powered by Ollama llama3.2 model

## Theme Colors

```
Background:     #0f172a (dark slate)
Cards:          #1e293b (lighter slate)
Accent Blue:    #3b82f6
Critical Red:   #ef4444
Warning Yellow: #f59e0b
Success Green:  #22c55e
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Backend running on http://localhost:8000
- For AI features: Ollama running with llama3.2 model

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## API Endpoints Used

The frontend polls these backend endpoints every 10 seconds:

- `GET /dashboard` - KPI metrics
- `GET /inventory` - All inventory items
- `GET /suppliers` - Supplier list with reliability scores
- `GET /alerts` - Active alerts
- `GET /orders` - Recent orders
- `GET /forecast/{product_id}` - 30-day demand forecast
- `POST /query` - AI queries (with Ollama)

## Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── Overview.jsx          # Dashboard with KPIs
│   │   ├── Inventory.jsx         # Inventory management
│   │   ├── Suppliers.jsx         # Supplier ranking
│   │   ├── Forecasting.jsx       # Demand forecasting
│   │   ├── AskSupplySense.jsx    # AI chat interface
│   │   ├── KPICard.jsx           # Reusable KPI card
│   │   ├── AlertCard.jsx         # Alert display component
│   │   └── SupplierCard.jsx      # Supplier card component
│   ├── hooks/
│   │   └── useAPI.js             # Data fetching hook
│   ├── utils/
│   │   └── apiAdapter.js         # API response adapters
│   ├── App.jsx                   # Main app with layout
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  'supply': {
    'bg': '#0f172a',
    'card': '#1e293b',
    'accent': '#3b82f6',
    // ... etc
  }
}
```

### Polling Interval
Edit `src/hooks/useAPI.js` to change the polling interval:

```javascript
const POLL_INTERVAL = 10000; // milliseconds (currently 10 seconds)
```

### API Base URL
Edit `src/hooks/useAPI.js` to point to a different backend:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Dependencies

- **React 19** - UI framework
- **Recharts 3** - Charts and data visualization
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - SVG icon library
- **Axios** - HTTP client
- **Vite** - Fast build tool

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Tips

1. **Lazy Load Pages** - Components mount only when needed
2. **Optimized Re-renders** - useMemo for expensive calculations
3. **Efficient Polling** - Single useAPI hook reused across components
4. **CSS Optimization** - Tailwind purges unused styles in production

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS is enabled on backend (it is by default)
- Look for errors in browser DevTools Console

### AI Chat Not Working
- Make sure Ollama is running locally
- Run `ollama pull llama3.2` to download the model
- Check Ollama is accessible at `http://localhost:11434`

### Slow Data Updates
- Check network latency in DevTools
- Verify backend performance
- Consider increasing poll interval if network is congested

## Live Indicator

The green blinking dot in the top right shows "Live" status with real-time polling. It updates every 10 seconds with the latest timestamp.

## Future Enhancements

- [ ] User authentication
- [ ] Custom alerts and notifications
- [ ] Export reports (PDF/CSV)
- [ ] Multi-warehouse views
- [ ] Historical trend analysis
- [ ] Custom dashboards
- [ ] Mobile app version
