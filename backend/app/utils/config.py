# backend/app/utils/config.py
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@localhost:5432/certificates")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:password@localhost:27017")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Tesseract configuration
TESSERACT_CMD = os.getenv("TESSERACT_CMD", "tesseract")

# File upload configuration
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10 * 1024 * 1024))  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}