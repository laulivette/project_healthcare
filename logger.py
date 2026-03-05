import logging
import os

# ── Création du dossier logs si besoin ──────────────────────────────────────
os.makedirs("logs", exist_ok=True)


def get_logger(role: str, name: str = None):
    """
    Retourne un logger configuré selon le rôle.

    Rôles disponibles :
      - "admin"   → voit tout (DEBUG+), log dans logs/admin.log
      - "doctor"  → voit les infos médicales (INFO+), log dans logs/doctor.log
      - "patient" → voit uniquement ses propres infos (WARNING+), log dans logs/patient.log

    Paramètres :
      role  : "admin", "doctor" ou "patient"
      name  : nom du patient (utilisé pour filtrer ses logs)
    """

    logger_name = f"{role}_{name}" if name else role
    logger = logging.getLogger(logger_name)

    # Évite de dupliquer les handlers si appelé plusieurs fois
    if logger.handlers:
        return logger

    # Niveau de log selon le rôle
    levels = {
        "admin":   logging.DEBUG,
        "doctor":  logging.INFO,
        "patient": logging.WARNING,
    }
    logger.setLevel(levels.get(role, logging.INFO))

    # Format des messages
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Handler fichier
    file_handler = logging.FileHandler(f"logs/{role}.log", encoding="utf-8")
    file_handler.setFormatter(formatter)

    # Handler console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


def log_patient_data(record: dict, role: str, requester_name: str = None):
    """
    Logue les données d'un patient selon le rôle de celui qui consulte.

    - admin   → toutes les colonnes
    - doctor  → infos médicales (pas billing, pas insurance)
    - patient → uniquement ses propres infos de base (pas les données financières)

    Paramètres :
      record         : dict représentant une ligne du dataset
      role           : "admin", "doctor" ou "patient"
      requester_name : nom du patient connecté (pour vérifier que c'est bien lui)
    """

    logger = get_logger(role, requester_name)

    if role == "admin":
        # Voit absolument tout
        logger.debug(f"[ACCÈS COMPLET] {record}")

    elif role == "doctor":
        # Voit les infos médicales, pas les données financières
        medical_fields = [
            "Name", "Age", "Gender", "Blood Type",
            "Medical Condition", "Date of Admission",
            "Doctor", "Hospital", "Admission Type",
            "Discharge Date", "Medication", "Test Results"
        ]
        medical_view = {k: record[k] for k in medical_fields if k in record}
        logger.info(f"[DOSSIER MÉDICAL] {medical_view}")

    elif role == "patient":
        # Vérifie que le patient consulte bien SES données
        if requester_name and record.get("Name", "").lower() != requester_name.lower():
            logger.warning(
                f"[ACCÈS REFUSÉ] {requester_name} a tenté de consulter "
                f"le dossier de {record.get('Name')}"
            )
            return

        # Voit uniquement ses infos de base
        patient_fields = [
            "Name", "Age", "Gender",
            "Medical Condition", "Date of Admission",
            "Discharge Date", "Medication"
        ]
        patient_view = {k: record[k] for k in patient_fields if k in record}
        logger.warning(f"[MON DOSSIER] {patient_view}")


# ── Exemple d'utilisation ────────────────────────────────────────────────────
if __name__ == "__main__":
    exemple = {
        "Name": "Bobby JacksOn",
        "Age": 30,
        "Gender": "Male",
        "Blood Type": "B-",
        "Medical Condition": "Cancer",
        "Date of Admission": "2024-01-31",
        "Doctor": "Matthew Smith",
        "Hospital": "Sons and Miller",
        "Insurance Provider": "Blue Cross",
        "Billing Amount": 18856.28,
        "Room Number": 328,
        "Admission Type": "Urgent",
        "Discharge Date": "2024-02-02",
        "Medication": "Paracetamol",
        "Test Results": "Normal"
    }

    print("\n=== VUE ADMIN ===")
    log_patient_data(exemple, role="admin")

    print("\n=== VUE DOCTOR ===")
    log_patient_data(exemple, role="doctor")

    print("\n=== VUE PATIENT (le bon) ===")
    log_patient_data(exemple, role="patient", requester_name="Bobby JacksOn")

    print("\n=== VUE PATIENT (mauvaise personne) ===")
    log_patient_data(exemple, role="patient", requester_name="Leslie Terry")
