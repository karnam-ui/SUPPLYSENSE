"""Setup script for database creation and seeding."""
import os
import sys
import logging
from database import init_db, SessionLocal
from seeding import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def setup_database():
    """Initialize and seed the database."""
    logger.info("Initializing database...")
    
    try:
        # Create tables
        init_db()
        logger.info("✓ Database tables created")
        
        # Seed data
        db = SessionLocal()
        try:
            seed_database(db)
            logger.info("✓ Database seeded with initial data")
        finally:
            db.close()
        
        logger.info("✓ Database setup completed successfully!")
        return True
    
    except Exception as e:
        logger.error(f"✗ Database setup failed: {e}")
        return False


if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)
