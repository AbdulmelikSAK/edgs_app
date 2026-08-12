# 🚀 Guide de déploiement EDGS Manager sur AWS Lightsail (5€/mois)

Ce guide détaille pas à pas comment déployer l'intégralité d'EDGS Manager sur une instance **AWS Lightsail** à 5$/mois.

---

## 📋 Prérequis sur AWS

### 1. Créer l'instance Lightsail
1. Connectez-vous à votre console **AWS Lightsail**.
2. Cliquez sur **Créer une instance**.
3. Choisissez la région la plus proche de vos clients (ex: **Paris - eu-west-3**).
4. Sélectionnez la plateforme : **Linux/Unix**.
5. Sélectionnez le plan de blueprint : **OS uniquement** -> **Ubuntu 22.04 LTS** (ou version supérieure).
6. Choisissez le plan d'instance : **5 USD/mois** (1 Go RAM, 1 vCPU, 40 Go SSD).
7. Donnez un nom à votre instance (ex: `edgs-manager-prod`) et cliquez sur **Créer l'instance**.

### 2. Configurer une IP statique (Gratuit)
*Par défaut, l'IP de votre instance change à chaque redémarrage. Il faut la rendre fixe.*
1. Dans l'onglet **Réseau** de Lightsail, cliquez sur **Créer une IP statique**.
2. Attachez-la à votre instance `edgs-manager-prod`.

### 3. Configurer le Pare-feu (Firewall)
Dans l'onglet **Réseau** de votre instance, ajoutez les règles suivantes :
*   **SSH** (Port 22) - *Déjà actif par défaut*
*   **HTTP** (Port 80) - *À ajouter*
*   **HTTPS** (Port 443) - *À ajouter*

---

## 🌐 Configuration des Noms de Domaine (DNS)

Chez votre fournisseur de nom de domaine (OVH, GoDaddy, Gandi, etc.), créez deux enregistrements de type **A** pointant vers l'IP statique de votre serveur :
1.  `admin.votredomaine.com` ➡️ `IP_STATIQUE_AWS`
2.  `api.votredomaine.com` ➡️ `IP_STATIQUE_AWS`

---

## 🖥️ Configuration du Serveur (SSH)

Connectez-vous à votre instance en SSH (via le bouton orange de la console AWS ou votre terminal local) et exécutez les commandes suivantes :

### 1. Installer Docker & Docker Compose
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Permettre à votre utilisateur ubuntu d'exécuter Docker sans sudo (optionnel mais recommandé)
sudo usermod -aG docker ubuntu
# Déconnectez-vous et reconnectez-vous pour appliquer cette modification.
```

### 2. Cloner et configurer le projet
```bash
# Cloner le projet depuis votre dépôt Git
git clone <URL_DE_VOTRE_DEPOT> edgs_app
cd edgs_app

# Créer le fichier d'environnement de production
cp .env.prod.example .env
nano .env # Remplissez les mots de passe, clés AWS S3, et noms de domaine réels
```

### 3. Lancer l'application
```bash
# Compiler et lancer tous les conteneurs en tâche de fond (API, Backoffice, BDD, Caddy)
docker-compose -f docker-compose.prod.yml up -d --build
```
Caddy va automatiquement obtenir des certificats SSL (HTTPS) gratuits auprès de Let's Encrypt pour vos domaines ! Vos applications seront directement accessibles de manière sécurisée.

---

## 💾 Planifier les Sauvegardes Automatiques (Sauvegardes vers S3)

Pour programmer la sauvegarde automatique de la base de données tous les soirs à 2h00 du matin :

1. Ouvrez l'éditeur de tâches planifiées (Cron) :
   ```bash
   crontab -e
   ```
2. Ajoutez la ligne suivante à la fin du fichier (remplacez `/home/ubuntu/edgs_app` par le chemin absolu de votre dossier) :
   ```cron
   0 2 * * * /home/ubuntu/edgs_app/scripts/backup_db_s3.sh >> /home/ubuntu/edgs_app/backup.log 2>&1
   ```
3. Sauvegardez et fermez. Le script s'exécutera désormais toutes les nuits, compressera vos données PostgreSQL et les enverra sur votre bucket AWS S3.
