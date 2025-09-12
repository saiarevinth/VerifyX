from typing import Dict, Any, Optional
import cv2
import numpy as np
from PIL import Image
import io
from sqlalchemy.orm import Session
from app.services.ocr_service import OCRService
from app.services.database import get_db_session
from app.models.postgresql_models import Certificate
from difflib import SequenceMatcher
import re

class VerificationService:
    def __init__(self):
        self.ocr_service = OCRService()
        self.similarity_threshold = 0.7
    
    async def verify_certificate(self, file_content: bytes, content_type: str) -> Dict[str, Any]:
        """Verify certificate against database records"""
        try:
            # Extract text from uploaded certificate
            if content_type == "application/pdf":
                extracted_text = await self.ocr_service.extract_text_from_pdf(file_content)
            else:
                image = Image.open(io.BytesIO(file_content))
                extracted_text = await self.ocr_service.extract_text_from_image(image)
            
            # Clean and normalize text
            normalized_text = self._normalize_text(extracted_text)
            
            # Search for matching certificates in database
            matches = await self._find_matching_certificates(normalized_text)
            
            if matches:
                best_match = max(matches, key=lambda x: x['similarity'])
                
                if best_match['similarity'] >= self.similarity_threshold:
                    return {
                        "status": "valid",
                        "certificate_id": best_match['certificate_id'],
                        "confidence": best_match['similarity'],
                        "institution": best_match.get('institution_name', 'Unknown'),
                        "match_details": best_match
                    }
                else:
                    return {
                        "status": "suspicious",
                        "confidence": best_match['similarity'],
                        "message": "Certificate found but with low similarity score",
                        "possible_matches": matches[:3]  # Top 3 matches
                    }
            else:
                return {
                    "status": "invalid",
                    "confidence": 0.0,
                    "message": "No matching certificate found in database"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "confidence": 0.0,
                "message": f"Verification failed: {str(e)}"
            }
    
    async def verify_by_id(self, certificate_id: str) -> Dict[str, Any]:
        """Verify certificate by ID (for QR code verification)"""
        try:
            # Get database session
            db_gen = get_db_session()
            db = next(db_gen)
            
            try:
                # Search in PostgreSQL
                certificate = db.query(Certificate).filter(
                    Certificate.certificate_id == certificate_id
                ).first()
                
                if certificate:
                    return {
                        "status": "valid",
                        "certificate_id": certificate_id,
                        "confidence": 1.0,
                        "institution": certificate.institution_name,
                        "student_name": certificate.student_name,
                        "course_name": certificate.course_name,
                        "issue_date": certificate.issue_date.isoformat() if certificate.issue_date else None,
                        "certificate_type": certificate.certificate_type
                    }
                else:
                    return {
                        "status": "invalid",
                        "confidence": 0.0,
                        "message": "Certificate ID not found"
                    }
                    
            finally:
                db.close()
                
        except Exception as e:
            return {
                "status": "error",
                "confidence": 0.0,
                "message": f"Verification failed: {str(e)}"
            }
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Convert to lowercase
        text = text.lower()
        # Remove special characters but keep alphanumeric and spaces
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return text.strip()
    
    async def _find_matching_certificates(self, normalized_text: str) -> list:
        """Find matching certificates in database"""
        try:
            # Get database session
            db_gen = get_db_session()
            db = next(db_gen)
            
            try:
                # Get all certificates with extracted text
                certificates = db.query(Certificate).filter(
                    Certificate.extracted_text.isnot(None)
                ).all()
                
                matches = []
                
                for cert in certificates:
                    if cert.extracted_text:
                        # Normalize database text
                        db_normalized = self._normalize_text(cert.extracted_text)
                        
                        # Calculate similarity
                        similarity = SequenceMatcher(None, normalized_text, db_normalized).ratio()
                        
                        if similarity > 0.3:  # Minimum threshold for consideration
                            matches.append({
                                "certificate_id": cert.certificate_id,
                                "similarity": similarity,
                                "institution_name": cert.institution_name,
                                "student_name": cert.student_name,
                                "course_name": cert.course_name,
                                "certificate_type": cert.certificate_type
                            })
                
                # Sort by similarity descending
                matches.sort(key=lambda x: x['similarity'], reverse=True)
                return matches
                
            finally:
                db.close()
                
        except Exception as e:
            print(f"Error finding matches: {str(e)}")
            return []
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings"""
        # Use SequenceMatcher for basic similarity
        basic_similarity = SequenceMatcher(None, text1, text2).ratio()
        
        # Extract key information and compare
        info1 = self._extract_key_info(text1)
        info2 = self._extract_key_info(text2)
        
        # Calculate weighted similarity
        weights = {
            'institution': 0.3,
            'student': 0.25,
            'course': 0.25,
            'date': 0.2
        }
        
        weighted_similarity = 0
        for key, weight in weights.items():
            if info1.get(key) and info2.get(key):
                key_similarity = SequenceMatcher(None, info1[key], info2[key]).ratio()
                weighted_similarity += key_similarity * weight
        
        # Combine basic and weighted similarity
        final_similarity = (basic_similarity * 0.4) + (weighted_similarity * 0.6)
        return final_similarity
    
    def _extract_key_info(self, text: str) -> Dict[str, str]:
        """Extract key information from certificate text"""
        info = {}
        
        # Extract institution name
        institution_patterns = [
            r'university[^a-z]*([a-z\s]+)',
            r'college[^a-z]*([a-z\s]+)',
            r'institute[^a-z]*([a-z\s]+)'
        ]
        
        for pattern in institution_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['institution'] = match.group(1).strip()
                break
        
        # Extract student name (this is more complex and may need customization)
        name_patterns = [
            r'awarded to[^a-z]*([a-z\s]+)',
            r'presented to[^a-z]*([a-z\s]+)',
            r'this certifies that[^a-z]*([a-z\s]+)'
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['student'] = match.group(1).strip()
                break
        
        # Extract course information
        course_patterns = [
            r'course[^a-z]*([a-z\s]+)',
            r'program[^a-z]*([a-z\s]+)',
            r'degree[^a-z]*([a-z\s]+)'
        ]
        
        for pattern in course_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                info['course'] = match.group(1).strip()
                break
        
        # Extract dates
        date_pattern = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b'
        dates = re.findall(date_pattern, text)
        if dates:
            info['date'] = dates[0]
        
        return info

