
import time
import pandas as pd
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Attente que MongoDB soit prêt
connected = False
while not connected:
    try:
        client = MongoClient("mongodb://mongodb:27017")
        client.admin.command('ping')
        connected = True
        print("Connecté à MongoDB !")
    except ConnectionFailure:
        print("MongoDB pas encore prêt, nouvelle tentative dans 5s...")
        time.sleep(5)

# Connexion à MongoDB
# client = MongoClient("mongodb://localhost:27017")
db = client["healthcare"]
collection = db["healthcare_dataset"]

# Ingestion par lots
chunk_size = 1000
total = 0

for chunk in pd.read_csv("healthcare_dataset.csv", chunksize=chunk_size):
    data = chunk.to_dict(orient="records")
    collection.insert_many(data)
    total += len(data)
    print(f"{total} documents insérés...")

print(f"Ingestion terminée ! Total : {total} documents.")