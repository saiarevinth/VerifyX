import pytesseract
import cv2
import numpy as np
from PIL import Image
import fitz  # PyMuPDF
import io
from typing import Optional

class OCRService:
    def __init__(self):
        # Configure tesseract path if needed
        # pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
        pass
    
    async def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF using OCR"""
        try:
            # Open PDF
            doc = fitz.open("pdf", pdf_bytes)
            extracted_text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Convert page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom
                img_data = pix.tobytes("png")
                
                # Process with OCR
                image = Image.open(io.BytesIO(img_data))
                text = await self.extract_text_from_image(image)
                extracted_text += f"\n--- Page {page_num + 1} ---\n{text}\n"
            
            doc.close()
            return extracted_text.strip()
            
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    async def extract_text_from_image(self, image: Image.Image) -> str:
        """Extract text from image using Tesseract OCR with enhanced preprocessing"""
        try:
            # Convert PIL image to OpenCV format
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Resize for better OCR (optional, can help with small text)
            scale_percent = 150  # percent of original size
            width = int(opencv_image.shape[1] * scale_percent / 100)
            height = int(opencv_image.shape[0] * scale_percent / 100)
            dim = (width, height)
            opencv_image = cv2.resize(opencv_image, dim, interpolation=cv2.INTER_CUBIC)
            
            # Convert to grayscale
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            
            # Denoise
            denoised = cv2.medianBlur(gray, 3)
            
            # Adaptive thresholding for better binarization
            thresh = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
            )
            
            # Sharpening (optional, can help with blurry scans)
            kernel = np.array([[0, -1, 0], [-1, 5,-1], [0, -1, 0]])
            sharpened = cv2.filter2D(thresh, -1, kernel)
            
            # OCR
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(sharpened, config=custom_config)
            
            return text.strip()
            
        except Exception as e:
            raise Exception(f"Image OCR failed: {str(e)}")
    
    def preprocess_image(self, image_array: np.ndarray) -> np.ndarray:
        """Advanced image preprocessing for better OCR results"""
        # Convert to grayscale
        if len(image_array.shape) == 3:
            gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        else:
            gray = image_array
        
        # Noise removal
        denoised = cv2.medianBlur(gray, 5)
        
        # Morphological operations
        kernel = np.ones((1, 1), np.uint8)
        opening = cv2.morphologyEx(denoised, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Threshold
        _, thresh = cv2.threshold(opening, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh