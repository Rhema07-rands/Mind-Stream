from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Handle SQLite-specific connect args
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

pool_kwargs = {}
if not settings.DATABASE_URL.startswith("sqlite"):
    pool_kwargs = {
        "pool_pre_ping": True,       # Test connections before using them
        "pool_recycle": 300,         # Recycle connections every 5 minutes
        "pool_size": 5,              # Keep 5 connections in the pool
        "max_overflow": 10,          # Allow up to 10 extra connections
    }

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, **pool_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
