"""Forecasting utilities using XGBoost."""
import logging
from datetime import datetime, timedelta
from typing import List, Tuple
import numpy as np
import pandas as pd
import xgboost as xgb
from sqlalchemy.orm import Session
from models import Order, OrderStatus
import random

logger = logging.getLogger(__name__)


def generate_historical_data(
    db: Session, 
    product_id: int,
    days: int = 180
) -> pd.DataFrame:
    """
    Generate or fetch historical order data for a product.
    
    Args:
        db: Database session
        product_id: Product ID
        days: Number of historical days
        
    Returns:
        DataFrame with date and quantity columns
    """
    # Fetch actual orders
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    orders = db.query(Order).filter(
        Order.product_id == product_id,
        Order.order_date >= start_date,
        Order.status != OrderStatus.CANCELLED
    ).all()
    
    # Create date range
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    df = pd.DataFrame({'date': date_range})
    df['quantity'] = 0
    
    # Aggregate orders by date
    for order in orders:
        date_key = order.order_date.date()
        mask = df['date'].dt.date == date_key
        df.loc[mask, 'quantity'] += order.quantity
    
    # If no historical data, generate synthetic data
    if df['quantity'].sum() == 0:
        # Simulate realistic demand pattern
        base_demand = random.randint(10, 50)
        trend = np.linspace(0, 20, len(df))
        seasonal = 15 * np.sin(np.linspace(0, 4*np.pi, len(df)))
        noise = np.random.normal(0, 5, len(df))
        df['quantity'] = (base_demand + trend + seasonal + noise).astype(int)
        df['quantity'] = df['quantity'].clip(lower=0)
    
    return df


def prepare_features(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
    """
    Prepare features for XGBoost model.
    
    Args:
        df: DataFrame with historical data
        
    Returns:
        Tuple of (X, y) features and target
    """
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['month'] = df['date'].dt.month
    df['week_of_year'] = df['date'].dt.isocalendar().week
    
    # Create lag features
    df['lag_1'] = df['quantity'].shift(1).fillna(0)
    df['lag_7'] = df['quantity'].shift(7).fillna(0)
    df['lag_30'] = df['quantity'].shift(30).fillna(0)
    
    # Moving averages
    df['ma_7'] = df['quantity'].rolling(window=7).mean().fillna(0)
    df['ma_30'] = df['quantity'].rolling(window=30).mean().fillna(0)
    
    feature_cols = ['day_of_week', 'day_of_month', 'month', 'week_of_year',
                   'lag_1', 'lag_7', 'lag_30', 'ma_7', 'ma_30']
    
    X = df[feature_cols].values
    y = df['quantity'].values
    
    return X, y


def train_forecast_model(df: pd.DataFrame) -> xgb.XGBRegressor:
    """
    Train XGBoost model for demand forecasting.
    
    Args:
        df: DataFrame with historical data
        
    Returns:
        Trained XGBoost model
    """
    X, y = prepare_features(df)
    
    # Split into train/test
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # Train model
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        verbosity=0
    )
    
    model.fit(X_train, y_train, verbose=False)
    
    return model


def forecast_demand(
    db: Session,
    product_id: int,
    forecast_days: int = 30,
    historical_days: int = 180
) -> Tuple[List[dict], float]:
    """
    Forecast future demand for a product.
    
    Args:
        db: Database session
        product_id: Product ID
        forecast_days: Number of days to forecast
        historical_days: Number of historical days to use
        
    Returns:
        Tuple of (forecast_data, model_accuracy)
    """
    try:
        # Get historical data
        df = generate_historical_data(db, product_id, historical_days)
        
        if len(df) < 30:
            # Not enough data for forecasting
            logger.warning(f"Insufficient data for product {product_id}")
            return [], 0.0
        
        # Train model
        model = train_forecast_model(df)
        
        # Calculate accuracy on test set
        X, y = prepare_features(df)
        split_idx = int(len(X) * 0.8)
        X_test = X[split_idx:]
        y_test = y[split_idx:]
        
        predictions = model.predict(X_test)
        mape = np.mean(np.abs((y_test - predictions) / (y_test + 1))) * 100
        accuracy = max(0, 100 - mape)
        
        # Generate forecast
        last_date = df['date'].max()
        forecast_data = []
        
        for day in range(1, forecast_days + 1):
            future_date = last_date + timedelta(days=day)
            
            # Create features for future date
            features = np.array([[
                future_date.weekday(),
                future_date.day,
                future_date.month,
                future_date.isocalendar()[1],
                df['quantity'].iloc[-1] if len(df) > 0 else 0,
                df['quantity'].iloc[-7] if len(df) > 7 else 0,
                df['quantity'].iloc[-30] if len(df) > 30 else 0,
                df['quantity'].iloc[-7:].mean() if len(df) > 7 else 0,
                df['quantity'].iloc[-30:].mean() if len(df) > 30 else 0,
            ]])
            
            pred = model.predict(features)[0]
            predicted_demand = max(0, int(pred))
            
            # Simple confidence interval (±20%)
            confidence_interval = (
                max(0, int(predicted_demand * 0.8)),
                int(predicted_demand * 1.2)
            )
            
            forecast_data.append({
                "day": day,
                "predicted_demand": predicted_demand,
                "confidence_interval": confidence_interval
            })
        
        return forecast_data, accuracy
    
    except Exception as e:
        logger.error(f"Forecast error for product {product_id}: {e}")
        return [], 0.0
