from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import upload, verify, dashboard
from app.services.database import init_databases
import os

app = FastAPI(title="Certificate Authenticity Validator", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(verify.router, prefix="/api/verify", tags=["verify"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.on_event("startup")
async def startup_event():
    await init_databases()

@app.get("/")
async def root():
    return {"message": "Certificate Authenticity Validator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}