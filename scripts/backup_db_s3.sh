#!/bin/bash
# Script de sauvegarde automatique de la base de données vers AWS S3 (ou S3-compatible)
# Ce script peut être planifié via une tâche Cron sur le serveur (ex: tous les soirs à minuit).

# Charger les variables d'environnement depuis le fichier .env (à adapter selon le chemin)
PARENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$PARENT_DIR/.env" ]; then
    export $(grep -v '^#' "$PARENT_DIR/.env" | xargs)
fi

# Variables par défaut si non définies dans le .env
DB_CONTAINER="${DB_CONTAINER_NAME:-edgs_db_prod}"
DB_USER="${DB_USER:-edgs_user}"
DB_NAME="${DB_NAME:-edgs}"
S3_BUCKET="${S3_BUCKET}"
AWS_REGION="${AWS_REGION:-eu-west-3}" # Par défaut Paris pour AWS

# Générer les noms de fichiers
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILENAME="backup_${DB_NAME}_${DATE}.sql.gz"
LOCAL_BACKUP_PATH="/tmp/${BACKUP_FILENAME}"

echo "=== Début de la sauvegarde de la base de données [${DATE}] ==="

# 1. Vérifier si le conteneur de base de données tourne
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo "ERREUR : Le conteneur $DB_CONTAINER n'est pas en cours d'exécution."
    exit 1
fi

# 2. Exécuter pg_dump dans le conteneur et compresser le résultat
echo "-> Exportation de la base de données..."
docker exec -t "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$LOCAL_BACKUP_PATH"

if [ $? -ne 0 ]; then
    echo "ERREUR : L'exportation de la base de données a échoué."
    rm -f "$LOCAL_BACKUP_PATH"
    exit 1
fi

echo "-> Exportation réussie : $LOCAL_BACKUP_PATH"

# 3. Préparer l'argument d'endpoint personnalisé si on n'utilise pas AWS S3 standard
ENDPOINT_ARG=""
if [ -n "$S3_ENDPOINT" ] && [[ "$S3_ENDPOINT" != *"amazonaws.com"* ]]; then
    # Pour Scaleway, DigitalOcean Spaces, etc.
    ENDPOINT_ARG="--endpoint-url https://${S3_ENDPOINT}"
    echo "-> Utilisation d'un endpoint S3 personnalisé : https://${S3_ENDPOINT}"
fi

# 4. Envoyer le fichier de sauvegarde sur S3 en utilisant un conteneur AWS CLI temporaire
echo "-> Envoi du fichier vers le bucket S3 ($S3_BUCKET)..."
docker run --rm \
  -v /tmp:/tmp \
  -e AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY}" \
  -e AWS_SECRET_ACCESS_KEY="${S3_SECRET_KEY}" \
  -e AWS_DEFAULT_REGION="${AWS_REGION}" \
  amazon/aws-cli \
  s3 cp "/tmp/${BACKUP_FILENAME}" "s3://${S3_BUCKET}/backups/${BACKUP_FILENAME}" ${ENDPOINT_ARG}

if [ $? -eq 0 ]; then
    echo "SUCCESS : Sauvegarde envoyée avec succès sur S3."
else
    echo "ERREUR : L'envoi vers S3 a échoué."
    rm -f "$LOCAL_BACKUP_PATH"
    exit 1
fi

# 5. Nettoyer le fichier local temporaire
echo "-> Nettoyage du fichier temporaire local..."
rm -f "$LOCAL_BACKUP_PATH"

echo "=== Fin de la procédure de sauvegarde ==="
