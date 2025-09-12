# VerifyX

A full-stack web application for certificate authentication and verification using OCR, QR codes, and a modern React frontend.

## Features
- Upload legacy (PDF) or digital (PDF/JPG/PNG) certificates
- Automatic text extraction using OCR
- Field parsing: institution, student, course, date
- QR code generation for digital certificates
- Certificate verification (by file or QR code)
- Dashboard analytics
- Simple authentication (demo)

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, OCR (Tesseract)
- **Frontend:** React (with React Router), modern CSS
- **Other:** Pillow, PyMuPDF, qrcode, OpenCV

---

## Setup Instructions

### 1. Backend

#### Prerequisites
- Python 3.8+
- PostgreSQL (running locally or accessible remotely)

#### Steps
1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd VerifyX/backend
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On Mac/Linux
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment:**
   - Copy `.env.example` to `.env` and set your `DATABASE_URL` (or edit `backend/app/services/database.py` directly).
   - Example: 
     ```env
     DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/verifyx
     ```
5. **Run the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend

#### Prerequisites
- Node.js (v16+ recommended)

#### Steps
1. **Install dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```
2. **Start the frontend:**
   ```bash
   npm start
   ```
   The app will run at [http://localhost:3000](http://localhost:3000)

---

## Usage
- Login with: `admin@example.com` / `123` (demo only)
- Upload certificates, verify, and view analytics from the dashboard.

---

## Customization & Production
- Replace dummy login with real authentication (API or OAuth)
- Set up HTTPS and production-ready database
- Deploy backend (e.g., with Gunicorn, Docker) and frontend (e.g., Netlify, Vercel)

---

## License
MIT
