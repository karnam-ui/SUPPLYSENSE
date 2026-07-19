"""Data seeding utilities."""
import logging
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from models import (
    Supplier, Product, Inventory, Order, Alert,
    RiskLevel, OrderStatus, AlertSeverity, AlertType
)

logger = logging.getLogger(__name__)

CATEGORIES = ["Electronics", "Machinery", "Raw Materials", "Components"]
WAREHOUSES = ["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D", "Warehouse E"]
SUPPLIER_NAMES = [
    "TechSupply Inc", "Global Parts Co", "Premium Materials Ltd", "Industrial Solutions",
    "Quality Components", "Express Logistics", "Advanced Manufacturing", "Standard Parts Co",
    "Certified Suppliers", "Reliable Industries"
]


def seed_database(db: Session) -> None:
    """
    Seed database with realistic data.
    
    Args:
        db: Database session
    """
    # Clear existing data
    db.query(Alert).delete()
    db.query(Order).delete()
    db.query(Inventory).delete()
    db.query(Product).delete()
    db.query(Supplier).delete()
    
    logger.info("Creating suppliers...")
    suppliers = create_suppliers(db)
    db.flush()  # Get supplier IDs
    
    logger.info("Creating products...")
    products = create_products(db)
    db.flush()  # Get product IDs - CRITICAL for inventory
    
    logger.info("Creating inventory...")
    create_inventory(db, products)
    
    logger.info("Creating historical orders...")
    create_orders(db, suppliers, products)
    
    logger.info("Creating alerts...")
    create_alerts(db, suppliers, products)
    
    db.commit()
    logger.info("Database seeding completed!")



def create_suppliers(db: Session) -> list:
    """
    Create 10 suppliers with mixed risk levels.
    
    Args:
        db: Database session
        
    Returns:
        List of created suppliers
    """
    suppliers = []
    
    # 3 high risk suppliers
    for i in range(3):
        supplier = Supplier(
            name=f"{SUPPLIER_NAMES[i]}",
            reliability_score=random.uniform(0.3, 0.6),
            avg_delay_days=random.uniform(5, 15),
            total_orders=random.randint(50, 150),
            failed_orders=random.randint(15, 40),
            risk_level=RiskLevel.HIGH
        )
        suppliers.append(supplier)
    
    # 4 medium risk suppliers
    for i in range(3, 7):
        supplier = Supplier(
            name=f"{SUPPLIER_NAMES[i]}",
            reliability_score=random.uniform(0.65, 0.85),
            avg_delay_days=random.uniform(1, 3),
            total_orders=random.randint(100, 250),
            failed_orders=random.randint(5, 15),
            risk_level=RiskLevel.MEDIUM
        )
        suppliers.append(supplier)
    
    # 3 low risk suppliers
    for i in range(7, 10):
        supplier = Supplier(
            name=f"{SUPPLIER_NAMES[i]}",
            reliability_score=random.uniform(0.85, 1.0),
            avg_delay_days=random.uniform(0, 1),
            total_orders=random.randint(200, 400),
            failed_orders=random.randint(0, 5),
            risk_level=RiskLevel.LOW
        )
        suppliers.append(supplier)
    
    for supplier in suppliers:
        db.add(supplier)
    
    return suppliers


def create_products(db: Session) -> list:
    """
    Create 20 products across 4 categories.
    
    Args:
        db: Database session
        
    Returns:
        List of created products
    """
    products = []
    product_names = [
        "CPU Processor", "RAM Memory", "SSD Storage", "Power Supply",
        "Motherboard", "Graphics Card", "Cooling Fan", "Network Card",
        "Steel Plate", "Aluminum Bar", "Copper Wire", "Plastic Sheet",
        "Rubber Seal", "Metal Bearing", "Circuit Board", "Transformer",
        "Motor Assembly", "Pump Unit", "Compressor", "Control Panel"
    ]
    
    for idx, name in enumerate(product_names):
        product = Product(
            name=name,
            category=CATEGORIES[idx % len(CATEGORIES)],
            unit_price=round(random.uniform(10, 1000), 2)
        )
        products.append(product)
        db.add(product)
    
    return products


def create_inventory(db: Session, products: list) -> None:
    """
    Create inventory items for products across warehouses.
    
    Args:
        db: Database session
        products: List of products
    """
    for product in products:
        for warehouse in WAREHOUSES:
            reorder_point = random.randint(50, 200)
            # Some items critically low
            if random.random() < 0.3:
                quantity = random.randint(0, int(reorder_point * 0.4))
            elif random.random() < 0.5:
                quantity = random.randint(int(reorder_point * 0.4), reorder_point)
            else:
                quantity = random.randint(reorder_point, int(reorder_point * 2.5))
            
            inventory = Inventory(
                warehouse_name=warehouse,
                product_id=product.id,
                quantity=quantity,
                reorder_point=reorder_point
            )
            db.add(inventory)


def create_orders(db: Session, suppliers: list, products: list) -> None:
    """
    Create 6 months of historical orders.
    
    Args:
        db: Database session
        suppliers: List of suppliers
        products: List of products
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=180)
    
    for _ in range(300):  # Create 300 orders over 180 days
        order_date = start_date + timedelta(
            days=random.randint(0, 180),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        supplier = random.choice(suppliers)
        product = random.choice(products)
        quantity = random.randint(5, 100)
        
        # Expected delivery varies by supplier
        expected_delay = int(supplier.avg_delay_days) + random.randint(-2, 5)
        expected_date = order_date + timedelta(days=expected_delay)
        
        # Determine status and actual date
        if order_date > end_date - timedelta(days=7):
            status = OrderStatus.PENDING
            actual_date = None
        else:
            rand = random.random()
            if rand < 0.8:  # 80% delivered
                actual_delay = int(supplier.avg_delay_days) + random.randint(-3, 3)
                actual_date = order_date + timedelta(days=actual_delay)
                status = OrderStatus.DELIVERED
            elif rand < 0.95:  # 15% delayed
                actual_date = expected_date + timedelta(days=random.randint(1, 10))
                status = OrderStatus.DELAYED
            else:  # 5% cancelled
                actual_date = None
                status = OrderStatus.CANCELLED
        
        order = Order(
            supplier_id=supplier.id,
            product_id=product.id,
            quantity=quantity,
            order_date=order_date,
            expected_date=expected_date,
            actual_date=actual_date,
            status=status
        )
        db.add(order)


def create_alerts(db: Session, suppliers: list, products: list) -> None:
    """
    Create 10 active alerts.
    
    Args:
        db: Database session
        suppliers: List of suppliers
        products: List of products
    """
    # Critical: High risk supplier alert
    high_risk = [s for s in suppliers if s.risk_level == RiskLevel.HIGH]
    for supplier in high_risk[:2]:
        alert = Alert(
            alert_type=AlertType.HIGH_RISK_SUPPLIER,
            severity=AlertSeverity.CRITICAL,
            message=f"Supplier {supplier.name} has HIGH risk level. "
                   f"Reliability: {supplier.reliability_score:.2f}, "
                   f"Avg delay: {supplier.avg_delay_days:.1f} days",
            supplier_id=supplier.id,
            is_resolved=False
        )
        db.add(alert)
    
    # Warning: Low inventory
    for product in products[:3]:
        alert = Alert(
            alert_type=AlertType.INVENTORY_LOW,
            severity=AlertSeverity.WARNING,
            message=f"Product {product.name} is below reorder point in some warehouses",
            product_id=product.id,
            is_resolved=False
        )
        db.add(alert)
    
    # Info: Reorder needed
    for product in products[3:5]:
        alert = Alert(
            alert_type=AlertType.REORDER_NEEDED,
            severity=AlertSeverity.INFO,
            message=f"Product {product.name} should be reordered proactively",
            product_id=product.id,
            is_resolved=False
        )
        db.add(alert)
    
    # Critical: Delayed order
    for _ in range(2):
        supplier = random.choice(high_risk)
        product = random.choice(products)
        alert = Alert(
            alert_type=AlertType.ORDER_DELAYED,
            severity=AlertSeverity.WARNING,
            message=f"Recent order from {supplier.name} for {product.name} is delayed",
            supplier_id=supplier.id,
            product_id=product.id,
            is_resolved=False
        )
        db.add(alert)
