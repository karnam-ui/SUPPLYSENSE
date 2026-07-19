"""Pydantic response schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from models import RiskLevel, OrderStatus, AlertSeverity, AlertType


class SupplierResponse(BaseModel):
    """Supplier response schema."""
    id: int
    name: str
    reliability_score: float
    avg_delay_days: float
    total_orders: int
    failed_orders: int
    risk_level: RiskLevel
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    """Product response schema."""
    id: int
    name: str
    category: str
    unit_price: float
    
    class Config:
        from_attributes = True


class InventoryResponse(BaseModel):
    """Inventory response schema."""
    id: int
    warehouse_name: str
    product_id: int
    product: Optional[ProductResponse] = None
    quantity: int
    reorder_point: int
    last_updated: datetime
    shortage_flag: Optional[bool] = None
    
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Order response schema."""
    id: int
    supplier_id: int
    product_id: int
    quantity: int
    order_date: datetime
    expected_date: datetime
    actual_date: Optional[datetime] = None
    status: OrderStatus
    days_delayed: Optional[int] = None
    
    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    """Alert response schema."""
    id: int
    alert_type: AlertType
    severity: AlertSeverity
    message: str
    supplier_id: Optional[int] = None
    product_id: Optional[int] = None
    created_at: datetime
    is_resolved: bool
    
    class Config:
        from_attributes = True


class DashboardKPI(BaseModel):
    """Dashboard KPI response schema."""
    total_alerts: int
    critical_alerts: int
    avg_supplier_reliability: float
    products_below_reorder: int
    delayed_orders_this_week: int
    high_risk_suppliers: int
    total_suppliers: int
    total_products: int


class ForecastPoint(BaseModel):
    """Single forecast data point."""
    day: int
    predicted_demand: float
    confidence_interval: tuple


class ForecastResponse(BaseModel):
    """Forecast response schema."""
    product_id: int
    product_name: str
    forecast_days: int
    forecast_data: List[ForecastPoint]
    model_accuracy: float


class QueryRequest(BaseModel):
    """Query request schema."""
    question: str


class QueryResponse(BaseModel):
    """Query response schema."""
    question: str
    answer: str
    context_used: int  # Number of context items used
