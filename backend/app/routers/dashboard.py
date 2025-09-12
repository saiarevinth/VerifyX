from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.services.database import get_db_session
from app.models.postgresql_models import Certificate, VerificationLog
from datetime import datetime, timedelta
from typing import Dict, Any

router = APIRouter()

@router.get("/analytics")
async def get_dashboard_analytics(db: Session = Depends(get_db_session)):
    """Get dashboard analytics data"""
    try:
        # Total certificates
        total_certificates = db.query(Certificate).count()
        
        # Certificates by type
        cert_types = db.query(
            Certificate.certificate_type,
            func.count(Certificate.id).label('count')
        ).group_by(Certificate.certificate_type).all()
        
        # Recent uploads (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_uploads = db.query(Certificate).filter(
            Certificate.upload_date >= thirty_days_ago
        ).count()
        
        # Verification statistics
        total_verifications = db.query(VerificationLog).count()
        
        verification_results = db.query(
            VerificationLog.verification_result,
            func.count(VerificationLog.id).label('count')
        ).group_by(VerificationLog.verification_result).all()
        
        # Recent verifications (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_verifications = db.query(VerificationLog).filter(
            VerificationLog.verification_date >= seven_days_ago
        ).count()
        
        # Top institutions
        top_institutions = db.query(
            Certificate.institution_name,
            func.count(Certificate.id).label('count')
        ).filter(
            Certificate.institution_name.isnot(None)
        ).group_by(Certificate.institution_name).order_by(desc('count')).limit(10).all()
        
        # Daily upload trend (last 30 days)
        daily_uploads = db.query(
            func.date(Certificate.upload_date).label('date'),
            func.count(Certificate.id).label('count')
        ).filter(
            Certificate.upload_date >= thirty_days_ago
        ).group_by(func.date(Certificate.upload_date)).order_by('date').all()
        
        return {
            "summary": {
                "total_certificates": total_certificates,
                "recent_uploads": recent_uploads,
                "total_verifications": total_verifications,
                "recent_verifications": recent_verifications
            },
            "certificate_types": [{"type": ct[0], "count": ct[1]} for ct in cert_types],
            "verification_results": [{"result": vr[0], "count": vr[1]} for vr in verification_results],
            "top_institutions": [{"name": ti[0], "count": ti[1]} for ti in top_institutions],
            "daily_uploads": [{"date": str(du[0]), "count": du[1]} for du in daily_uploads]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics fetch failed: {str(e)}")
