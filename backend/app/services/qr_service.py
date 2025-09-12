import qrcode
import uuid
import base64
from io import BytesIO
from typing import Dict, Any

class QRService:
    def __init__(self):
        self.base_url = "http://localhost:8000/api/verify/"
    
    async def generate_qr_code(self, certificate_id: str, certificate_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate QR code for certificate verification"""
        try:
            # Create verification URL
            verification_url = f"{self.base_url}{certificate_id}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(verification_url)
            qr.make(fit=True)
            
            # Create image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = BytesIO()
            qr_image.save(buffer, format='PNG')
            qr_code_bytes = buffer.getvalue()
            qr_code_base64 = base64.b64encode(qr_code_bytes).decode('utf-8')
            
            return {
                "qr_code_id": str(uuid.uuid4()),
                "verification_url": verification_url,
                "qr_code_base64": qr_code_base64,
                "qr_code_url": f"data:image/png;base64,{qr_code_base64}"
            }
            
        except Exception as e:
            raise Exception(f"QR code generation failed: {str(e)}")
    
    async def verify_qr_code(self, qr_data: str) -> Dict[str, Any]:
        """Verify QR code and extract certificate ID"""
        try:
            if self.base_url in qr_data:
                certificate_id = qr_data.replace(self.base_url, "")
                return {
                    "valid": True,
                    "certificate_id": certificate_id
                }
            else:
                return {
                    "valid": False,
                    "error": "Invalid QR code format"
                }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }