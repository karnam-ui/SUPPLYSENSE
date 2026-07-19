"""Main FastAPI application for SupplySense."""
import logging
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from config import SERVER_PORT, SERVER_HOST, BACKGROUND_TASK_INTERVAL, FORECAST_DAYS
from database import init_db, get_db
from models import (
    Supplier, Product, Inventory, Order, Alert, RiskLevel, OrderStatus
)
from schemas import (
    SupplierResponse, InventoryResponse, OrderResponse, AlertResponse,
    DashboardKPI, ForecastResponse, QueryRequest, QueryResponse
)
from cache import cache
from seeding import seed_database
from forecasting import forecast_demand
from ai_utils import query_ollama, build_context, check_ollama_available
from background_tasks import background_task_loop, run_background_tasks

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# Background task management
background_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting SupplySense backend...")
    
    try:
        # Initialize database
        init_db()
        logger.info("✓ Database initialized")
    except Exception as e:
        logger.error(f"Database init error: {e}")
    
    # Start background tasks
    global background_task
    try:
        background_task = asyncio.create_task(
            background_task_loop(BACKGROUND_TASK_INTERVAL)
        )
        logger.info(f"✓ Background tasks started (interval: {BACKGROUND_TASK_INTERVAL}s)")
    except Exception as e:
        logger.error(f"Background task error: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down SupplySense backend...")
    if background_task:
        background_task.cancel()
        try:
            await background_task
        except asyncio.CancelledError:
            pass
    logger.info("SupplySense backend stopped")


# Create FastAPI app
app = FastAPI(
    title="SupplySense",
    description="Supply Chain Intelligence System API",
    version="1.0.0",
    lifespan=lifespan
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Dashboard Endpoint
# ============================================================================

@app.get("/dashboard", response_model=DashboardKPI)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardKPI:
    """
    Get dashboard KPIs.
    
    Returns cached data if available (30-second TTL), otherwise calculates
    and caches new values.
    
    Returns:
        DashboardKPI with all key metrics
    """
    cache_key = "dashboard:kpis"
    cached = cache.get(cache_key)
    
    if cached:
        logger.debug("Dashboard KPIs from cache")
        return DashboardKPI(**cached)
    
    logger.debug("Calculating dashboard KPIs...")
    
    try:
        # Count alerts
        total_alerts = db.query(Alert).filter(
            Alert.is_resolved == False
        ).count()
        critical_alerts = db.query(Alert).filter(
            Alert.is_resolved == False,
            Alert.severity == "CRITICAL"
        ).count()
        
        # Average supplier reliability
        avg_reliability = db.query(func.avg(Supplier.reliability_score)).scalar() or 0.0
        
        # Products below reorder point
        products_below = db.query(Inventory).filter(
            Inventory.quantity < Inventory.reorder_point
        ).count()
        
        # Delayed orders this week
        week_ago = datetime.utcnow() - timedelta(days=7)
        delayed_this_week = db.query(Order).filter(
            Order.status == OrderStatus.DELAYED,
            Order.order_date >= week_ago
        ).count()
        
        # High risk suppliers
        high_risk_count = db.query(Supplier).filter(
            Supplier.risk_level == RiskLevel.HIGH
        ).count()
        
        # Total suppliers and products
        total_suppliers = db.query(Supplier).count()
        total_products = db.query(Product).count()
        
        kpis = {
            "total_alerts": total_alerts,
            "critical_alerts": critical_alerts,
            "avg_supplier_reliability": round(float(avg_reliability), 3),
            "products_below_reorder": products_below,
            "delayed_orders_this_week": delayed_this_week,
            "high_risk_suppliers": high_risk_count,
            "total_suppliers": total_suppliers,
            "total_products": total_products
        }
        
        # Cache the results
        cache.set(cache_key, kpis)
        
        return DashboardKPI(**kpis)
    
    except Exception as e:
        logger.error(f"Error calculating dashboard KPIs: {e}")
        raise HTTPException(status_code=500, detail="Error calculating KPIs")


# ============================================================================
# Inventory Endpoint
# ============================================================================

@app.get("/inventory", response_model=list[InventoryResponse])
def get_inventory(db: Session = Depends(get_db)) -> list:
    """
    Get all inventory items with shortage flags.
    
    Returns:
        List of inventory items with product details and shortage indicators
    """
    cache_key = "inventory:all"
    cached = cache.get(cache_key)
    
    if cached:
        logger.debug("Inventory from cache")
        return cached
    
    logger.debug("Fetching inventory...")
    
    try:
        from config import WARNING_INVENTORY_THRESHOLD
        
        inventories = db.query(Inventory).all()
        
        result = []
        for inv in inventories:
            # Make sure the product relationship is loaded
            product_data = None
            if inv.product:
                product_data = {
                    "id": inv.product.id,
                    "name": inv.product.name,
                    "category": inv.product.category,
                    "unit_price": inv.product.unit_price
                }
                
            item = InventoryResponse(
                id=inv.id,
                warehouse_name=inv.warehouse_name,
                product_id=inv.product_id,
                product=product_data,
                quantity=inv.quantity,
                reorder_point=inv.reorder_point,
                last_updated=inv.last_updated,
                shortage_flag=inv.quantity < (inv.reorder_point * WARNING_INVENTORY_THRESHOLD)
            )
            result.append(item)
        
        # Cache results
        serialized = [item.model_dump() for item in result]
        cache.set(cache_key, serialized)
        
        return result
    
    except Exception as e:
        logger.error(f"Error fetching inventory: {e}")
        raise HTTPException(status_code=500, detail="Error fetching inventory")



# ============================================================================
# Suppliers Endpoint
# ============================================================================

@app.get("/suppliers", response_model=list[SupplierResponse])
def get_suppliers(db: Session = Depends(get_db)) -> list:
    """
    Get all suppliers ranked by reliability score (highest first).
    
    Returns:
        List of suppliers sorted by reliability score descending
    """
    try:
        suppliers = db.query(Supplier).order_by(
            Supplier.reliability_score.desc()
        ).all()
        return suppliers
    except Exception as e:
        logger.error(f"Error fetching suppliers: {e}")
        raise HTTPException(status_code=500, detail="Error fetching suppliers")


# ============================================================================
# Orders Endpoint
# ============================================================================

@app.get("/orders", response_model=list[OrderResponse])
def get_orders(limit: int = Query(50, le=500), db: Session = Depends(get_db)) -> list:
    """
    Get recent orders with delay calculations.
    
    Args:
        limit: Maximum number of orders to return (default 50, max 500)
    
    Returns:
        List of recent orders with calculated delay information
    """
    try:
        orders = db.query(Order).order_by(
            Order.order_date.desc()
        ).limit(limit).all()
        
        result = []
        for order in orders:
            # Calculate days delayed
            days_delayed = None
            if order.status == OrderStatus.DELAYED and order.actual_date:
                days_delayed = (order.actual_date - order.expected_date).days
            
            item = OrderResponse(
                id=order.id,
                supplier_id=order.supplier_id,
                product_id=order.product_id,
                quantity=order.quantity,
                order_date=order.order_date,
                expected_date=order.expected_date,
                actual_date=order.actual_date,
                status=order.status,
                days_delayed=days_delayed
            )
            result.append(item)
        
        return result
    
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail="Error fetching orders")


# ============================================================================
# Alerts Endpoint
# ============================================================================

@app.get("/alerts", response_model=list[AlertResponse])
def get_alerts(
    severity: str = Query(None),
    db: Session = Depends(get_db)
) -> list:
    """
    Get active unresolved alerts.
    
    Args:
        severity: Optional filter by severity (CRITICAL, WARNING, INFO)
    
    Returns:
        List of active alerts
    """
    try:
        query = db.query(Alert).filter(Alert.is_resolved == False)
        
        if severity:
            query = query.filter(Alert.severity == severity)
        
        alerts = query.order_by(Alert.created_at.desc()).all()
        return alerts
    
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail="Error fetching alerts")


# ============================================================================
# Forecasting Endpoint
# ============================================================================

@app.get("/forecast/{product_id}", response_model=ForecastResponse)
def get_forecast(product_id: int, db: Session = Depends(get_db)) -> ForecastResponse:
    """
    Get 30-day demand forecast using XGBoost.
    
    Args:
        product_id: Product ID to forecast
    
    Returns:
        Forecast with predicted demand for next 30 days
    """
    try:
        # Verify product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Generate forecast
        forecast_data, accuracy = forecast_demand(
            db,
            product_id,
            forecast_days=FORECAST_DAYS
        )
        
        if not forecast_data:
            raise HTTPException(
                status_code=400,
                detail="Insufficient data for forecasting"
            )
        
        return ForecastResponse(
            product_id=product_id,
            product_name=product.name,
            forecast_days=FORECAST_DAYS,
            forecast_data=forecast_data,
            model_accuracy=round(accuracy, 2)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating forecast: {e}")
        raise HTTPException(status_code=500, detail="Error generating forecast")


# ============================================================================
# AI Query Endpoint
# ============================================================================

@app.post("/query", response_model=QueryResponse)
def query_ai(request: QueryRequest, db: Session = Depends(get_db)) -> QueryResponse:
    """
    Query AI about supply chain status.
    
    Uses Ollama llama3.2 model with context from database to provide
    intelligent answers about supply chain issues.
    
    Args:
        request: Query request with question
    
    Returns:
        QueryResponse with AI-generated answer
    """
    try:
        # Build context
        context = build_context(db, max_items=10)
        context_used = len(context.split('\n'))
        
        # Query Ollama
        answer = query_ollama(request.question, context)
        
        if answer is None:
            raise HTTPException(
                status_code=503,
                detail="Ollama service unavailable. Make sure Ollama is running."
            )
        
        return QueryResponse(
            question=request.question,
            answer=answer,
            context_used=context_used
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI query: {e}")
        raise HTTPException(status_code=500, detail="Error processing query")


# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get("/health")
def health_check() -> dict:
    """
    Health check endpoint.
    
    Returns:
        Status and component health
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "redis_connected": cache.is_connected(),
        "background_tasks_running": background_task is not None and not background_task.done()
    }


# ============================================================================
# Root Endpoint
# ============================================================================

@app.get("/")
def root() -> dict:
    """
    Root endpoint with API information.
    
    Returns:
        API metadata
    """
    return {
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


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=SERVER_HOST,
        port=SERVER_PORT,
        reload=False,
        log_level="info"
    )
