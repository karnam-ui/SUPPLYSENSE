"""Configuration file for SupplySense backend."""
import os
from typing import Optional

# Database configuration
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost/supplysense"
)

# Redis configuration
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
REDIS_CACHE_EXPIRE: int = 30  # seconds

# Server configuration
SERVER_PORT: int = 8000
SERVER_HOST: str = "0.0.0.0"

# Ollama configuration
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL: str = "llama3.2"

# Background task configuration
BACKGROUND_TASK_INTERVAL: int = 10  # seconds

# Forecasting configuration
FORECAST_DAYS: int = 30
HISTORICAL_DATA_DAYS: int = 180

# Risk level thresholds
RISK_THRESHOLDS = {
    "HIGH": {
        "reliability_score_max": 0.6,
        "avg_delay_days_min": 5,
        "failed_orders_ratio_min": 0.2
    },
    "MEDIUM": {
        "reliability_score_max": 0.8,
        "avg_delay_days_min": 2,
        "failed_orders_ratio_min": 0.1
    },
    "LOW": {
        "reliability_score_max": 1.0,
        "avg_delay_days_min": 0,
        "failed_orders_ratio_min": 0.0
    }
}

# Inventory thresholds
CRITICAL_INVENTORY_THRESHOLD: float = 0.5  # 50% of reorder point
WARNING_INVENTORY_THRESHOLD: float = 0.8   # 80% of reorder point
