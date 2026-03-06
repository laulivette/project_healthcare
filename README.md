# 🏥 Healthcare Data Platform

Projet de stockage, sécurisation et visualisation de données médicales.  
Les données sont ingérées depuis un CSV dans MongoDB, exposées via une API FastAPI, et visualisées dans un dashboard React avec un système de contrôle d'accès par rôle.

---

## 🗂️ Structure du projet

```
projet_test/
├── api/
│   ├── main.py              # API FastAPI (endpoints /patients)
│   ├── Dockerfile
│   └── requirements.txt
├── dashboard/
│   ├── src/
│   │   ├── main.jsx         # Point d'entrée React
│   │   └── App.jsx          # Dashboard avec contrôle d'accès par rôle
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── test/
│   ├── __init__.py
│   └── tests_unitaire.py    # Tests pytest
├── logs/                    # Généré automatiquement
├── ingestion.py             # Chargement du CSV dans MongoDB
├── logger.py                # Système de logs par rôle
├── Dockerfile               # Pour le container python_app
├── docker-compose.yml       # Orchestration de tous les services
├── healthcare_dataset.csv   # Données sources
└── requirements.txt
```

---

## ⚙️ Architecture

```
CSV
 │
 ▼
ingestion.py ──────────► MongoDB (port 27017)
                               │
                               ▼
                          FastAPI (port 8000)
                               │
                               ▼
                      Dashboard React (port 5173)
```

Tous les services tournent dans des containers Docker orchestrés par `docker-compose`.

---

## 🧩 Ce que fait chaque fichier

### `ingestion.py`
Lit le fichier `healthcare_dataset.csv` par lots de 1000 lignes et les insère dans la collection `healthcare_dataset` de la base MongoDB `healthcare`.  
Attend automatiquement que MongoDB soit prêt avant de démarrer.

**Fonctions :**
- `wait_for_mongo()` — boucle de connexion avec retry toutes les 5s
- `ingest_csv(collection, filepath, chunk_size)` — ingestion par chunks, retourne le total inséré
- `main()` — orchestre les deux

### `logger.py`
Système de logs avec filtrage des données selon le rôle de l'utilisateur connecté.

**Rôles :**
| Rôle | Niveau de log | Données visibles |
|------|--------------|-----------------|
| `admin` | DEBUG | Tous les champs (15) |
| `doctor` | INFO | Données médicales uniquement (12) — pas de billing |
| `patient` | WARNING | Ses données personnelles uniquement (7) |

Si un patient tente de consulter le dossier d'un autre patient, un log `[ACCÈS REFUSÉ]` est généré.  
Les logs sont écrits dans `logs/admin.log`, `logs/doctor.log`, `logs/patient.log`.

### `api/main.py`
API REST construite avec FastAPI. Elle lit les données depuis MongoDB et les expose au dashboard.

**Endpoints :**
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/patients` | Retourne tous les patients |
| GET | `/patients/{name}` | Retourne un patient par son nom |

La documentation Swagger est accessible automatiquement sur `http://localhost:8000/docs`.

### `dashboard/src/App.jsx`
Interface React qui fetch les données depuis l'API et applique le filtrage par rôle côté front.

**Fonctionnalités :**
- Sélecteur de rôle (Admin / Médecin / Patient)
- Sélecteur de patient (chargé dynamiquement depuis MongoDB)
- Champs masqués visuellement selon le rôle (affichage `████████`)
- Journal d'accès simulé
- Indicateur du nombre de patients chargés depuis la base

### `test/tests_unitaire.py`
Tests unitaires pytest pour `ingestion.py`.

**Tests couverts :**
- Connexion MongoDB réussie du premier coup
- Retry en cas d'échec de connexion
- Total retourné correct après ingestion
- `insert_many` appelé le bon nombre de fois
- Comportement avec un fichier CSV vide

---

## 🚀 Lancer le projet

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré

### 1. Cloner / ouvrir le projet
```bash
cd projet_test
```

### 2. Lancer tous les services
```bash
docker-compose up --build
```

Attendre de voir dans le terminal :
- `Ingestion terminée !` → MongoDB est prêt et les données sont chargées
- `VITE ready in ... ms` → le dashboard est prêt

### 3. Ouvrir le dashboard
👉 [http://localhost:5173](http://localhost:5173)

### 4. Explorer l'API (optionnel)
👉 [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Arrêter les services
```bash
docker-compose down
```

---

## 🧪 Lancer les tests

Dans un terminal séparé (avec le venv activé) :
```bash
pytest .\test\tests_unitaire.py -v
```

---

## 📋 Tester les logs manuellement

```bash
python logger.py
```

Les fichiers de logs apparaissent dans le dossier `logs/`.

---

## 📦 Dépendances Python

```
fastapi
uvicorn
pymongo
pandas
pytest
```

Install manuel (hors Docker) :
```bash
pip install -r requirements.txt
```
