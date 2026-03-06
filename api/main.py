from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import time

app = FastAPI()

# CORS pour que le dashboard React puisse appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connexion MongoDB avec retry
def get_db():
    while True:
        try:
            client = MongoClient("mongodb://mongodb:27017", serverSelectionTimeoutMS=3000)
            client.admin.command("ping")
            return client["healthcare"]["healthcare_dataset"]
        except ConnectionFailure:
            print("MongoDB pas encore prêt, nouvelle tentative dans 3s...")
            time.sleep(3)

collection = get_db()


@app.get("/patients")
def get_patients():
    """Retourne tous les patients (sans l'_id MongoDB)."""
    patients = list(collection.find({}, {"_id": 0}))
    if not patients:
        raise HTTPException(status_code=404, detail="Aucun patient trouvé")
    return patients


@app.get("/patients/{name}")
def get_patient(name: str):
    """Retourne un patient par son nom."""
    patient = collection.find_one({"Name": name}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    return patient
