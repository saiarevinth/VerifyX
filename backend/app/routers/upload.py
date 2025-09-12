from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.database import get_db_session
from app.services.ocr_service import OCRService
from app.services.qr_service import QRService
from app.models.postgresql_models import Certificate
import uuid
from datetime import datetime
import io
from PIL import Image
import re

router = APIRouter()

@router.post("/legacy")
async def upload_legacy_certificate(
    file: UploadFile = File(...),
    db: Session = Depends(get_db_session)
):
    """Upload and process legacy certificate with OCR"""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed for legacy certificates")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Generate unique certificate ID
        certificate_id = str(uuid.uuid4())
        
        # OCR text extraction
        ocr_service = OCRService()
        extracted_text = await ocr_service.extract_text_from_pdf(file_content)

        # Initialize DB model with base fields
        db_certificate = Certificate(
            certificate_id=certificate_id,
            certificate_type="legacy",
            extracted_text=extracted_text,
            upload_date=datetime.utcnow(),
            file_data=file_content,
            file_name=file.filename,
            file_type=file.content_type,
            file_size=len(file_content)
        )
        
        # Parse extracted text for additional fields (improved implementation)
        # Try to match common labels using regex
        text = extracted_text or ""
        try:
            # Institution
            inst_match = re.search(r"(?:institution|college|university)\s*[:\-]?\s*(.+)", text, flags=re.IGNORECASE)
            if inst_match:
                db_certificate.institution_name = inst_match.group(1).strip()

            # Student name
            student_match = re.search(r"(?:student\s*name|name)\s*[:\-]?\s*(.+)", text, flags=re.IGNORECASE)
            if student_match:
                db_certificate.student_name = student_match.group(1).strip()

            # Course name
            course_match = re.search(r"(?:course\s*name|course|program|degree)\s*[:\-]?\s*(.+)", text, flags=re.IGNORECASE)
            if course_match:
                db_certificate.course_name = course_match.group(1).strip()

            # Issue/Date
            date_match = re.search(r"(?:issue\s*date|date\s*of\s*issue|issued\s*on|date)\s*[:\-]?\s*([0-9]{1,2}[\-/ ]?[A-Za-z]{3,9}[\-/ ]?[0-9]{2,4}|[0-9]{4}[\-/][0-9]{2}[\-/][0-9]{2})", text, flags=re.IGNORECASE)
            if date_match:
                raw_date = date_match.group(1).strip()
                # Best-effort parse a few common formats
                for fmt in ("%d-%b-%Y", "%d %B %Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y"):
                    try:
                        db_certificate.issue_date = datetime.strptime(raw_date, fmt)
                        break
                    except Exception:
                        continue
        except Exception:
            # Parsing should never crash the endpoint; continue with best-effort fields
            pass

        # Persist
        db.add(db_certificate)
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")
        db.refresh(db_certificate)
        
        return {
            "success": True,
            "certificate_id": certificate_id,
            "extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
            "message": "Legacy certificate processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.post("/digital")
async def upload_digital_certificate(
    file: UploadFile = File(...),
    db: Session = Depends(get_db_session)
):
    """Upload digital certificate and generate QR code"""
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF, JPEG, and PNG files are allowed")
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Generate unique certificate ID
        certificate_id = str(uuid.uuid4())
        
        # Generate QR code
        qr_service = QRService()
        qr_data = await qr_service.generate_qr_code(certificate_id, {
            "file_name": file.filename,
            "file_type": file.content_type,
            "upload_date": datetime.utcnow().isoformat()
        })

        # Optionally extract text from digital certificate
        ocr_service = OCRService()
        extracted_text = None
        if file.content_type == "application/pdf":
            extracted_text = await ocr_service.extract_text_from_pdf(file_content)
        elif file.content_type in ["image/jpeg", "image/png"]:
            image = Image.open(io.BytesIO(file_content))
            extracted_text = await ocr_service.extract_text_from_image(image)

        # Save to PostgreSQL (including file data, extracted text, and QR code data)
        db_certificate = Certificate(
            certificate_id=certificate_id,
            certificate_type="digital",
            extracted_text=extracted_text,
            upload_date=datetime.utcnow(),
            file_data=file_content,
            file_name=file.filename,
            file_type=file.content_type,
            file_size=len(file_content),
            qr_code_data=qr_data
        )
        # Try to parse key fields from OCR text if available
        text = extracted_text or ""
        try:
            inst_match = re.search(r"(?:institution|college|university)\s*[:\-]?\s*(.+)", text, flags=re.IGNORECASE)
            if inst_match:
                db_certificate.institution_name = inst_match.group(1).strip()
            student_match = re.search(r"(?:student\s*name|name)\s*[:\-]?\s*(.+)", text, flags=re.IGNORECASE)
            if student_match:
                db_certificate.student_name = student_match.group(1).strip()
            course_match = re.search(r"(?:course\s*name|course|program|degree)\s*[:\-]?\s*(.+)", text, flags=re.IGNORECASE)
            if course_match:
                db_certificate.course_name = course_match.group(1).strip()
        except Exception:
            pass
        db.add(db_certificate)
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")
        db.refresh(db_certificate)
        
        return {
            "success": True,
            "certificate_id": certificate_id,
            "qr_code_url": qr_data["qr_code_url"],
            "verification_url": qr_data["verification_url"],
            "message": "Digital certificate processed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
