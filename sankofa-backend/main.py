from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import recherche, plantes, maladies

app = FastAPI(
    title="Sankofa AI API",
    description="Plateforme IA pour la valorisation de la pharmacopée traditionnelle africaine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recherche.router, prefix="/api", tags=["Recherche"])
app.include_router(plantes.router, prefix="/api", tags=["Plantes"])
app.include_router(maladies.router, prefix="/api", tags=["Maladies"])

@app.get("/")
def root():
    return {"message": "Sankofa AI API — opérationnelle", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
