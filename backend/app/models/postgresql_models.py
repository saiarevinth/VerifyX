from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, LargeBinary, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String, unique=True, index=True)
    institution_name = Column(String, index=True)
    student_name = Column(String)
    course_name = Column(String)
    certificate_type = Column(String)  # 'legacy' or 'digital'
    extracted_text = Column(Text)
    issue_date = Column(DateTime)
    upload_date = Column(DateTime, default=func.now())
    is_verified = Column(Boolean, default=False)
    confidence_score = Column(Float, default=0.0)

    # Add these fields for file storage
    file_data = Column(LargeBinary)
    file_name = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    qr_code_data = Column(JSON, nullable=True)  # Only for digital certificates

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String, index=True)
    verification_date = Column(DateTime, default=func.now())
    verification_result = Column(String)  # 'valid', 'invalid', 'not_found'
    confidence_score = Column(Float)
    user_ip = Column(String)

