# EDGS Application — Sablage Industriel

Solution complète de gestion d'intervention de sablage industriel pour l'entreprise EDGS. Ce dépôt contient le backend, l'application d'administration et l'application mobile de terrain.

---

## 🛠️ Stack Technique

1. **Backend**: NestJS, TypeScript, PostgreSQL (TypeORM), MinIO (stockage objet compatible S3).
2. **Back-office d'administration**: React Vite, Vanilla CSS (Premium Dark Theme), Leaflet / OpenStreetMap.
3. **Application Mobile**: React Native (Expo SDK 51) avec base SQLite embarquée (`expo-sqlite`).

---

## 🏗️ Architecture & Fonctionnalités clés

- **Offline-First (Mobile)** : L'application mobile fonctionne sans connexion réseau. Les données sont persistées dans une base de données SQLite locale (`cached_missions`, `cached_truck`).
- **File de synchronisation** : Toutes les actions hors-ligne (pointages, statuts, changements de stock, coordonnées GPS, photos chantiers) sont stockées dans la table SQLite `pending_sync` et rejouées chronologiquement lorsque le réseau redevient actif.
- **Télémétrie GPS en arrière-plan** : Log de la géolocalisation des camions toutes les 20 secondes en mode de démonstration (30 minutes par défaut) associé à la mission en cours.
- **Rapports imprimables** : Génération automatisée des rapports complets au format HTML/PDF stockés sur MinIO et accessibles par liens uniques depuis le back-office.
- **Alerte de Stock Bas** : Indicateurs critiques en back-office et mobile si le nombre de sacs de sable d'un camion passe sous son seuil d'alerte.

---

## 📂 Structure du projet

- `/backend` : Code de l'API REST NestJS + PostgreSQL
- `/backoffice` : Tableau de bord de gestion d'administration
- `/mobile` : Application Expo React Native pour les tablettes camions
- `install_and_run.sh` : Script d'installation global et démarrage Docker Compose
- `docker-compose.yml` : Fichier de configuration des conteneurs

---

## 🚀 Lancement Rapide (Docker Compose)

Exécutez le script d'installation à la racine pour installer les dépendances et démarrer les conteneurs :

```bash
./install_and_run.sh
```

### Accès aux Services
- **Back-office** : [http://localhost:8080](http://localhost:8080)
- **REST API Swagger Docs** : [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Object Storage MinIO Console** : [http://localhost:9001](http://localhost:9001)

### Identifiants de Démonstration (Seeder Automatique)
- **Administrateur Backoffice** :
  - **Email** : `admin@edgs.fr`
  - **Mot de passe** : `admin_secret`
- **Chauffeur Mobile** :
  - **Code PIN** : `1234`

---

## 📱 Application Mobile & Compilation APK

### Lancement en mode développement (Simulateur / Expo Go)
```bash
cd mobile
npm install
npm run start
```

### Génération de l'APK de Release
Pour compiler l'APK de release localement sans passer par les serveurs cloud d'Expo (EAS), exécutez le script automatisé :
```bash
cd mobile
./build_apk.sh
```
*Note : Cela requiert l'installation locale du JDK (Java Development Kit) et d'Android Studio (Android SDK).*

---

## 🔬 Tests unitaires et d'intégration

### API Backend
Pour lancer les tests Jest dans l'environnement de développement :
```bash
cd backend
npm run test
```
