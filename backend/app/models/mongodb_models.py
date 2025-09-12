from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class CertificateDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    certificate_id: str
    file_data: bytes
    file_name: str
    file_type: str
    file_size: int
    qr_code_data: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}
    upload_date: datetime = Field(default_factory=datetime.utcnow)

    # Pydantic v2 config
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )