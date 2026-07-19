"""AI query utilities using Ollama."""
import logging
import requests
from typing import Optional
from config import OLLAMA_BASE_URL, OLLAMA_MODEL
from sqlalchemy.orm import Session
from models import Supplier, Product, Inventory, Order, Alert

logger = logging.getLogger(__name__)


def build_context(db: Session, max_items: int = 10) -> str:
    """
    Build context from database for AI queries.
    
    Args:
        db: Database session
        max_items: Maximum items per category
        
    Returns:
        Context string
    """
    context_parts = []
    
    try:
        # High-risk suppliers
        high_risk = db.query(Supplier).filter(
            Supplier.risk_level == "HIGH"
        ).limit(max_items).all()
        if high_risk:
            context_parts.append("HIGH RISK SUPPLIERS:\n")
            for s in high_risk:
                context_parts.append(
                    f"- {s.name}: reliability {s.reliability_score:.2f}, "
                    f"avg delay {s.avg_delay_days:.1f} days\n"
                )
        
        # Low inventory items
        low_inv = db.query(Inventory).filter(
            Inventory.quantity < (Inventory.reorder_point * 0.5)
        ).limit(max_items).all()
        if low_inv:
            context_parts.append("\nCRITICAL INVENTORY ITEMS:\n")
            for inv in low_inv:
                context_parts.append(
                    f"- {inv.product.name} in {inv.warehouse_name}: "
                    f"{inv.quantity}/{inv.reorder_point}\n"
                )
        
        # Recent delayed orders
        delayed = db.query(Order).filter(
            Order.status == "DELAYED"
        ).limit(max_items).all()
        if delayed:
            context_parts.append("\nRECENT DELAYED ORDERS:\n")
            for o in delayed:
                context_parts.append(
                    f"- Order {o.id}: {o.product.name} from {o.supplier.name}, "
                    f"expected {o.expected_date.date()}\n"
                )
        
        # Active critical alerts
        critical_alerts = db.query(Alert).filter(
            Alert.is_resolved == False,
            Alert.severity == "CRITICAL"
        ).limit(max_items).all()
        if critical_alerts:
            context_parts.append("\nCRITICAL ALERTS:\n")
            for alert in critical_alerts:
                context_parts.append(f"- {alert.message}\n")
    
    except Exception as e:
        logger.error(f"Error building context: {e}")
    
    return "".join(context_parts) if context_parts else "No specific alerts or issues."


def query_ollama(question: str, context: str = "") -> Optional[str]:
    """
    Query Ollama AI model with a question and context.
    
    Args:
        question: User question
        context: Context information from database
        
    Returns:
        AI response or None if error
    """
    try:
        prompt = f"""You are a supply chain intelligence assistant for SupplySense.
You help analyze supply chain data, identify risks, and provide recommendations.

CONTEXT:
{context}

QUESTION:
{question}

Provide a concise, actionable response based on the context provided."""
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.7
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "").strip()
        else:
            logger.error(f"Ollama error: {response.status_code}")
            return None
    
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to Ollama. Make sure Ollama is running.")
        return None
    except Exception as e:
        logger.error(f"Ollama query error: {e}")
        return None


def check_ollama_available() -> bool:
    """
    Check if Ollama is available and running.
    
    Returns:
        True if available
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False
