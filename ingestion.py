import time
import pandas as pd
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure


def wait_for_mongo(uri="mongodb://mongodb:27017", retry_delay=5):
    """Attend que MongoDB soit prêt et retourne le client."""
    client = MongoClient(uri)
    connected = False
    while not connected:
        try:
            client.admin.command('ping')
            connected = True
            print("Connecté à MongoDB !")
        except ConnectionFailure:
            print("MongoDB pas encore prêt, nouvelle tentative dans 5s...")
            time.sleep(retry_delay)
    return client


def ingest_csv(collection, filepath="healthcare_dataset.csv", chunk_size=1000):
    """Ingère un CSV dans une collection MongoDB par lots."""
    total = 0
    for chunk in pd.read_csv(filepath, chunksize=chunk_size):
        data = chunk.to_dict(orient="records")
        collection.insert_many(data)
        total += len(data)
        print(f"{total} documents insérés...")
    print(f"Ingestion terminée ! Total : {total} documents.")
    return total


def main():
    client = wait_for_mongo()
    db = client["healthcare"]
    collection = db["healthcare_dataset"]
    ingest_csv(collection)


if __name__ == "__main__":
    main()