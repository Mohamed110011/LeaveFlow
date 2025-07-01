#!/bin/bash

# Script de déploiement pour Azure VM
# Usage: ./deploy-azure.sh

set -e

echo "🚀 Déploiement de SmartHome sur Azure VM..."

# Variables
APP_DIR="/home/$USER/apps/smartHome"
BACKUP_DIR="/home/$USER/backups/$(date +%Y%m%d_%H%M%S)"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction de nettoyage en cas d'erreur
cleanup() {
    log_error "Erreur détectée. Nettoyage..."
    cd $APP_DIR
    docker-compose -f docker-compose.azure.yml down
    exit 1
}

trap cleanup ERR

# 1. Vérifier les prérequis
log_info "Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé"
    exit 1
fi

# 2. Aller dans le répertoire de l'application
cd $APP_DIR

# 3. Sauvegarder la configuration précédente
if [ -f ".env" ]; then
    log_info "Sauvegarde de la configuration précédente..."
    mkdir -p $BACKUP_DIR
    cp .env $BACKUP_DIR/
    log_success "Configuration sauvegardée dans $BACKUP_DIR"
fi

# 4. Vérifier le fichier .env
if [ ! -f ".env" ]; then
    log_warning "Fichier .env non trouvé. Copie du template..."
    if [ -f ".env.prod" ]; then
        cp .env.prod .env
    elif [ -f ".env.example" ]; then
        cp .env.example .env
    else
        log_error "Aucun template d'environnement trouvé"
        exit 1
    fi
    log_warning "⚠️  IMPORTANT: Modifiez le fichier .env avec vos vraies valeurs !"
    log_warning "nano .env"
    read -p "Appuyez sur Entrée après avoir configuré le fichier .env..."
fi

# 5. Obtenir l'IP publique de la VM
PUBLIC_IP=$(curl -s ifconfig.me)
log_info "IP publique détectée: $PUBLIC_IP"

# 6. Mettre à jour l'URL de l'API dans .env
sed -i "s/VOTRE-IP-PUBLIQUE-AZURE/$PUBLIC_IP/g" .env
log_success "URL de l'API mise à jour avec l'IP publique"

# 7. Arrêter les containers existants
log_info "Arrêt des containers existants..."
docker-compose -f docker-compose.azure.yml down || true

# 8. Nettoyer les images non utilisées
log_info "Nettoyage des images Docker..."
docker system prune -f

# 9. Construire et démarrer les containers
log_info "Construction et démarrage des containers..."
docker-compose -f docker-compose.azure.yml up --build -d

# 10. Attendre que les services soient prêts
log_info "Attente du démarrage des services..."
sleep 30

# 11. Vérifier l'état des containers
log_info "Vérification de l'état des containers..."
docker-compose -f docker-compose.azure.yml ps

# 12. Test de santé des services
log_info "Test de santé des services..."

# Test du backend
if curl -f http://localhost:5001/health > /dev/null 2>&1; then
    log_success "Backend API accessible ✅"
else
    log_warning "Backend API non accessible, vérification en cours..."
    sleep 15
    if curl -f http://localhost:5001 > /dev/null 2>&1; then
        log_success "Backend accessible sur le port principal ✅"
    else
        log_error "Backend non accessible"
    fi
fi

# Test du frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend accessible ✅"
else
    log_warning "Frontend non accessible immédiatement (normal au premier démarrage)"
fi

# Test de la base de données
if docker-compose -f docker-compose.azure.yml exec -T postgres pg_isready > /dev/null 2>&1; then
    log_success "Base de données accessible ✅"
else
    log_error "Base de données non accessible"
fi

# 13. Afficher les informations de connexion
log_success "🎉 Déploiement terminé !"
echo ""
echo "📊 Informations de connexion:"
echo "🌐 Frontend: http://$PUBLIC_IP:3000"
echo "🔧 Backend API: http://$PUBLIC_IP:5001"
echo "🗄️  Base de données: $PUBLIC_IP:5432"
echo ""
echo "📋 Commandes utiles:"
echo "• Voir les logs: docker-compose -f docker-compose.azure.yml logs -f"
echo "• Redémarrer: docker-compose -f docker-compose.azure.yml restart"
echo "• Arrêter: docker-compose -f docker-compose.azure.yml down"
echo "• Mise à jour: ./deploy-azure.sh"
echo ""
echo "🔒 Sécurité:"
echo "• Configurez un nom de domaine et HTTPS avec Let's Encrypt"
echo "• Changez tous les mots de passe par défaut"
echo "• Configurez des sauvegardes automatiques"

log_success "Déploiement réussi ! 🚀"
