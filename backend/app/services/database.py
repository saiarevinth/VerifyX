import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.postgresql_models import Base

# DATABASE_URL can be provided via environment variable; falls back to existing default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:MyNewSecurePass123@localhost:5432/your_actual_db",
)

# PostgreSQL setup
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

async def init_databases():
    """Initialize databases (create tables if they don't exist)."""
    Base.metadata.create_all(bind=engine)

def get_db_session() -> Session:
    """Dependency that provides a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

