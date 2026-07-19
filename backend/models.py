"""SQLAlchemy database models for SupplySense."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, Text
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class RiskLevel(str, enum.Enum):
    """Risk level enumeration."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class OrderStatus(str, enum.Enum):
    """Order status enumeration."""
    PENDING = "PENDING"
    DELIVERED = "DELIVERED"
    DELAYED = "DELAYED"
    CANCELLED = "CANCELLED"


class AlertSeverity(str, enum.Enum):
    """Alert severity enumeration."""
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"


class AlertType(str, enum.Enum):
    """Alert type enumeration."""
    INVENTORY_LOW = "INVENTORY_LOW"
    HIGH_RISK_SUPPLIER = "HIGH_RISK_SUPPLIER"
    ORDER_DELAYED = "ORDER_DELAYED"
    SUPPLIER_FAILURE = "SUPPLIER_FAILURE"
    FORECAST_ALERT = "FORECAST_ALERT"
    REORDER_NEEDED = "REORDER_NEEDED"


class Supplier(Base):
    """
    Supplier model.
    
    Attributes:
        id: Primary key
        name: Supplier name
        reliability_score: Score from 0.0 to 1.0 indicating reliability
        avg_delay_days: Average delay in days for orders
        total_orders: Total number of orders placed
        failed_orders: Number of failed/cancelled orders
        risk_level: Risk classification (LOW, MEDIUM, HIGH)
    """
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    reliability_score = Column(Float, default=0.5)
    avg_delay_days = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    failed_orders = Column(Integer, default=0)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = relationship("Order", back_populates="supplier")
    alerts = relationship("Alert", back_populates="supplier", cascade="all, delete-orphan")


class Product(Base):
    """
    Product model.
    
    Attributes:
        id: Primary key
        name: Product name
        category: Product category
        unit_price: Price per unit
    """
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    unit_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inventory = relationship("Inventory", back_populates="product")
    orders = relationship("Order", back_populates="product")


class Inventory(Base):
    """
    Inventory model.
    
    Attributes:
        id: Primary key
        warehouse_name: Name of the warehouse
        product_id: Foreign key to Product
        quantity: Current quantity in stock
        reorder_point: Quantity threshold for reordering
        last_updated: Last update timestamp
    """
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    warehouse_name = Column(String, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    quantity = Column(Integer, default=0)
    reorder_point = Column(Integer, default=10)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="inventory")


class Order(Base):
    """
    Order model.
    
    Attributes:
        id: Primary key
        supplier_id: Foreign key to Supplier
        product_id: Foreign key to Product
        quantity: Order quantity
        order_date: Date order was placed
        expected_date: Expected delivery date
        actual_date: Actual delivery date
        status: Order status (PENDING, DELIVERED, DELAYED, CANCELLED)
    """
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    quantity = Column(Integer)
    order_date = Column(DateTime, default=datetime.utcnow, index=True)
    expected_date = Column(DateTime)
    actual_date = Column(DateTime, nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="orders")
    product = relationship("Product", back_populates="orders")


class Alert(Base):
    """
    Alert model.
    
    Attributes:
        id: Primary key
        alert_type: Type of alert
        severity: Severity level (CRITICAL, WARNING, INFO)
        message: Alert message
        supplier_id: Optional foreign key to Supplier
        product_id: Optional foreign key to Product
        created_at: Alert creation timestamp
        is_resolved: Whether alert has been resolved
    """
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(Enum(AlertType), index=True)
    severity = Column(Enum(AlertSeverity), index=True)
    message = Column(Text)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    is_resolved = Column(Boolean, default=False, index=True)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="alerts")
