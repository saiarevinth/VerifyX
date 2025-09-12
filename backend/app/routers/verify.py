from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from app.services.database import get_db_session
from app.services.verification_service import VerificationService
from app.models.postgresql_models import VerificationLog
from datetime import datetime

router = APIRouter()

@router.post("/")
async def verify_certificate(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db_session)
):
    """Verify certificate authenticity"""
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and PDF files are allowed")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Initialize verification service
        verification_service = VerificationService()
        
        # Perform verification
        verification_result = await verification_service.verify_certificate(file_content, file.content_type)
        
        # Log verification attempt
        client_ip = request.client.host if request else "unknown"
        log_entry = VerificationLog(
            certificate_id=verification_result.get("certificate_id", "unknown"),
            verification_result=verification_result["status"],
            confidence_score=verification_result.get("confidence", 0.0),
            user_ip=client_ip
        )
        
        db.add(log_entry)
        db.commit()
        
        return {
            "success": True,
            "verification_result": verification_result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@router.get("/{certificate_id}")
async def verify_by_id(
    certificate_id: str,
    db: Session = Depends(get_db_session)
):
    """Verify certificate by ID (for QR code verification)"""
    try:
        verification_service = VerificationService()
        result = await verification_service.verify_by_id(certificate_id)
        
        return {
            "success": True,
            "certificate_id": certificate_id,
            "verification_result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Certificate not found: {str(e)}")
