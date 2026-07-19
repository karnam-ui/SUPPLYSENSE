"""Background tasks for monitoring and alerts."""
import logging
import asyncio
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from models import (
    Supplier, Product, Inventory, Order, Alert,
    RiskLevel, OrderStatus, AlertSeverity, AlertType
)
from database import SessionLocal
from cache import cache

logger = logging.getLogger(__name__)


def update_inventory(db: Session) -> None:
    """
    Update inventory slightly to simulate warehouse activity.
    
    Args:
        db: Database session
    """
    try:
        inventories = db.query(Inventory).limit(20).all()
        for inv in inventories:
            # Random small changes
            change = random.randint(-5, 10)
            inv.quantity = max(0, inv.quantity + change)
            inv.last_updated = datetime.utcnow()
        db.commit()
    except Exception as e:
        logger.error(f"Error updating inventory: {e}")
        db.rollback()


def generate_random_order(db: Session) -> None:
    """
    Generate a random new order.
    
    Args:
        db: Database session
    """
    try:
        suppliers = db.query(Supplier).all()
        products = db.query(Product).all()
        
        if not suppliers or not products:
            return
        
        supplier = random.choice(suppliers)
        product = random.choice(products)
        
        order_date = datetime.utcnow()
        expected_delay = int(supplier.avg_delay_days) + random.randint(-2, 5)
        expected_date = order_date + timedelta(days=expected_delay)
        
        order = Order(
            supplier_id=supplier.id,
            product_id=product.id,
            quantity=random.randint(5, 50),
            order_date=order_date,
            expected_date=expected_date,
            status=OrderStatus.PENDING
        )
        db.add(order)
        db.commit()
        logger.debug(f"Generated order: {product.name} from {supplier.name}")
    except Exception as e:
        logger.error(f"Error generating order: {e}")
        db.rollback()


def check_inventory_thresholds(db: Session) -> None:
    """
    Check inventory levels and create alerts if needed.
    
    Args:
        db: Database session
    """
    try:
        from config import CRITICAL_INVENTORY_THRESHOLD
        
        inventories = db.query(Inventory).all()
        for inv in inventories:
            threshold = inv.reorder_point * CRITICAL_INVENTORY_THRESHOLD
            
            if inv.quantity < threshold:
                # Check if alert already exists
                existing = db.query(Alert).filter(
                    Alert.alert_type == AlertType.INVENTORY_LOW,
                    Alert.product_id == inv.product_id,
                    Alert.is_resolved == False
                ).first()
                
                if not existing:
                    alert = Alert(
                        alert_type=AlertType.INVENTORY_LOW,
                        severity=AlertSeverity.CRITICAL,
                        message=f"CRITICAL: {inv.product.name} at {inv.warehouse_name} "
                               f"critically low: {inv.quantity}/{inv.reorder_point}",
                        product_id=inv.product_id,
                        is_resolved=False
                    )
                    db.add(alert)
        
        db.commit()
    except Exception as e:
        logger.error(f"Error checking inventory thresholds: {e}")
        db.rollback()


def check_delayed_orders(db: Session) -> None:
    """
    Check for delayed orders and create/update alerts.
    
    Args:
        db: Database session
    """
    try:
        now = datetime.utcnow()
        pending_orders = db.query(Order).filter(
            Order.status == OrderStatus.PENDING,
            Order.expected_date < now
        ).all()
        
        for order in pending_orders:
            # Update order status
            order.status = OrderStatus.DELAYED
            
            # Check if alert exists
            existing = db.query(Alert).filter(
                Alert.alert_type == AlertType.ORDER_DELAYED,
                Alert.supplier_id == order.supplier_id,
                Alert.is_resolved == False
            ).first()
            
            if not existing:
                alert = Alert(
                    alert_type=AlertType.ORDER_DELAYED,
                    severity=AlertSeverity.WARNING,
                    message=f"Order {order.id} from {order.supplier.name} "
                           f"is delayed. Expected: {order.expected_date.date()}",
                    supplier_id=order.supplier_id,
                    product_id=order.product_id,
                    is_resolved=False
                )
                db.add(alert)
        
        db.commit()
    except Exception as e:
        logger.error(f"Error checking delayed orders: {e}")
        db.rollback()


def update_supplier_risk_levels(db: Session) -> None:
    """
    Update supplier risk levels based on metrics.
    
    Args:
        db: Database session
    """
    try:
        from config import RISK_THRESHOLDS
        
        suppliers = db.query(Supplier).all()
        for supplier in suppliers:
            # Calculate metrics
            if supplier.total_orders > 0:
                failed_ratio = supplier.failed_orders / supplier.total_orders
            else:
                failed_ratio = 0
            
            # Determine risk level
            if (supplier.reliability_score < RISK_THRESHOLDS["HIGH"]["reliability_score_max"] or
                supplier.avg_delay_days >= RISK_THRESHOLDS["HIGH"]["avg_delay_days_min"] or
                failed_ratio >= RISK_THRESHOLDS["HIGH"]["failed_orders_ratio_min"]):
                new_risk = RiskLevel.HIGH
            elif (supplier.reliability_score < RISK_THRESHOLDS["MEDIUM"]["reliability_score_max"] or
                  supplier.avg_delay_days >= RISK_THRESHOLDS["MEDIUM"]["avg_delay_days_min"] or
                  failed_ratio >= RISK_THRESHOLDS["MEDIUM"]["failed_orders_ratio_min"]):
                new_risk = RiskLevel.MEDIUM
            else:
                new_risk = RiskLevel.LOW
            
            old_risk = supplier.risk_level
            if new_risk != old_risk:
                supplier.risk_level = new_risk
                
                # Create alert for risk level change
                if new_risk == RiskLevel.HIGH:
                    alert = Alert(
                        alert_type=AlertType.HIGH_RISK_SUPPLIER,
                        severity=AlertSeverity.CRITICAL,
                        message=f"Supplier {supplier.name} risk level upgraded to HIGH",
                        supplier_id=supplier.id,
                        is_resolved=False
                    )
                    db.add(alert)
        
        db.commit()
    except Exception as e:
        logger.error(f"Error updating supplier risk levels: {e}")
        db.rollback()


def run_background_tasks() -> None:
    """Run all background monitoring tasks."""
    db = SessionLocal()
    try:
        logger.debug("Running background tasks...")
        update_inventory(db)
        generate_random_order(db)
        check_inventory_thresholds(db)
        check_delayed_orders(db)
        update_supplier_risk_levels(db)
        
        # Clear cache to refresh data
        cache.clear_pattern("dashboard:*")
        cache.clear_pattern("inventory:*")
        
        logger.debug("Background tasks completed")
    except Exception as e:
        logger.error(f"Error in background tasks: {e}")
    finally:
        db.close()


async def background_task_loop(interval: int) -> None:
    """
    Background task loop that runs tasks at regular intervals.
    
    Args:
        interval: Interval in seconds between task runs
    """
    logger.info(f"Starting background task loop (interval: {interval}s)")
    while True:
        try:
            await asyncio.sleep(interval)
            run_background_tasks()
        except Exception as e:
            logger.error(f"Error in background task loop: {e}")
