# SmartHome PERN Application - Docker Setup

Cette application PERN (PostgreSQL, Express, React, Node.js) est entièrement dockerisée pour faciliter le développement et le déploiement.

## 🚀 Démarrage rapide

### Prérequis
- Docker Desktop installé
- Docker Compose installé

### 1. Configuration initiale

```bash
# Cloner le projet (si ce n'est pas déjà fait)
cd "c:\Users\mohamed taher\Desktop\smartHome"

# Copier le fichier d'environnement
copy .env.example .env

# Modifier le fichier .env avec vos vraies valeurs
notepad .env
```

### 2. Variables d'environnement importantes à configurer

Dans le fichier `.env`, modifiez ces valeurs :

```env
# Base de données
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# JWT Secret (au moins 32 caractères)
JWT_SECRET=votre_secret_jwt_tres_securise_ici

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret

# ReCAPTCHA
RECAPTCHA_SECRET_KEY=votre_cle_secrete_recaptcha
REACT_APP_RECAPTCHA_SITE_KEY=votre_cle_site_recaptcha

# Email
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app
```

## 🔧 Commandes principales

### Mode développement (recommandé pour développer)

```bash
# Avec PowerShell
.\start.ps1 -Action dev

# Avec Docker Compose
docker-compose -f docker-compose.dev.yml up --build
```

### Mode production

```bash
# Avec PowerShell
.\start.ps1 -Action prod

# Avec Docker Compose
docker-compose up --build -d
```

### Autres commandes utiles

```bash
# Arrêter l'application
.\start.ps1 -Action stop
# ou
docker-compose down

# Voir les logs
.\start.ps1 -Action logs
# ou
docker-compose logs -f

# Voir le statut
.\start.ps1 -Action status
# ou
docker-compose ps

# Nettoyer tout
.\start.ps1 -Action clean
# ou
docker-compose down -v && docker system prune -f
```

## 🌐 URLs d'accès

Une fois l'application démarrée :

- **Frontend (React)** : http://localhost:3000
- **Backend API (Express)** : http://localhost:5001
- **Base de données (PostgreSQL)** : localhost:5432

## 📂 Structure Docker

```
smartHome/
├── client/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development build
│   ├── nginx.conf             # Configuration Nginx
│   └── .dockerignore
├── server/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development build
│   └── .dockerignore
├── docker-compose.yml          # Configuration production
├── docker-compose.dev.yml      # Configuration développement
├── .env.example               # Template des variables d'environnement
├── Makefile                   # Commandes Make (Linux/Mac)
└── start.ps1                  # Script PowerShell (Windows)
```

## 🔍 Debugging

### Accéder aux containers

```bash
# Accéder au container du serveur
docker-compose exec server sh

# Accéder au container de la base de données
docker-compose exec postgres psql -U postgres -d smarthome_db
```

### Voir les logs d'un service spécifique

```bash
# Logs du frontend
docker-compose logs -f client

# Logs du backend
docker-compose logs -f server

# Logs de la base de données
docker-compose logs -f postgres
```

### Redémarrer un service spécifique

```bash
# Redémarrer le serveur
docker-compose restart server

# Redémarrer le client
docker-compose restart client
```

## 🔒 Sécurité

### En production, assurez-vous de :

1. Changer tous les mots de passe par défaut
2. Utiliser des secrets JWT forts (au moins 32 caractères)
3. Configurer correctement les variables d'environnement
4. Utiliser HTTPS en production
5. Configurer un reverse proxy (Nginx/Traefik) si nécessaire

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé** : Arrêtez les autres services qui utilisent les ports 3000, 5001, ou 5432
2. **Problème de permissions** : Assurez-vous que Docker Desktop est démarré
3. **Variables d'environnement** : Vérifiez que le fichier .env est correctement configuré
4. **Base de données** : Si la DB ne se connecte pas, supprimez les volumes avec `docker-compose down -v`

### Reconstruire complètement

```bash
# Arrêter et supprimer tout
docker-compose down -v
docker system prune -f

# Reconstruire
docker-compose up --build
```

## 📈 Monitoring

### En production, vous pouvez ajouter :

- Logs centralisés (ELK Stack)
- Monitoring (Prometheus + Grafana)
- Health checks
- Backup automatique de la base de données

## 🤝 Contribution

Pour contribuer au projet :

1. Utilisez le mode développement
2. Les modifications sont automatiquement rechargées
3. Testez vos changements
4. Commitez vos modifications
