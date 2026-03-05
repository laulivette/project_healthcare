import pytest
from unittest.mock import MagicMock, patch
from pymongo.errors import ConnectionFailure
from ingestion import wait_for_mongo, ingest_csv
import ingestion as im


# Tests pour wait_for_mongo
def test_wait_for_mongo_connexion_reussie():
    """MongoDB répond du premier coup : on doit récupérer un client."""
    mock_client = MagicMock()
    mock_client.admin.command.return_value = True

    with patch.object(im, "MongoClient", return_value=mock_client):
        client = wait_for_mongo()

    assert client == mock_client


def test_wait_for_mongo_retry_puis_connexion():
    """MongoDB échoue une fois puis réussit : on doit quand même récupérer un client."""
    mock_client = MagicMock()
    mock_client.admin.command.side_effect = [ConnectionFailure, True]

    with patch.object(im, "MongoClient", return_value=mock_client), \
         patch.object(im.time, "sleep"):
        client = wait_for_mongo()

    assert client == mock_client


# Tests pour ingest_csv
def test_ingest_csv_retourne_le_bon_total():
    """Le total retourné doit correspondre au nombre de lignes du CSV."""
    mock_collection = MagicMock()

    # On simule un CSV avec 2 chunks de 3 lignes chacun
    chunk1 = MagicMock()
    chunk1.to_dict.return_value = [{"a": 1}, {"a": 2}, {"a": 3}]

    chunk2 = MagicMock()
    chunk2.to_dict.return_value = [{"a": 4}, {"a": 5}, {"a": 6}]

    with patch.object(im.pd, "read_csv", return_value=iter([chunk1, chunk2])):
        total = ingest_csv(mock_collection, filepath="fake.csv")

    assert total == 6


def test_ingest_csv_appelle_insert_many():
    """insert_many doit être appelé autant de fois qu'il y a de chunks."""
    mock_collection = MagicMock()

    chunk1 = MagicMock()
    chunk1.to_dict.return_value = [{"a": 1}]

    chunk2 = MagicMock()
    chunk2.to_dict.return_value = [{"a": 2}]

    with patch.object(im.pd, "read_csv", return_value=iter([chunk1, chunk2])):
        ingest_csv(mock_collection, filepath="fake.csv")

    assert mock_collection.insert_many.call_count == 2


def test_ingest_csv_fichier_vide():
    """Si le CSV est vide, le total doit être 0 et insert_many ne doit pas être appelé."""
    mock_collection = MagicMock()

    with patch.object(im.pd, "read_csv", return_value=iter([])):
        total = ingest_csv(mock_collection, filepath="fake.csv")

    assert total == 0
    mock_collection.insert_many.assert_not_called()
