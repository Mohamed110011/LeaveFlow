#!/bin/bash

# Script de déploiement automatique
# Usage: ./deploy-to-azure.sh

echo "🚀 Déploiement vers Azure VM..."

# Variables
AZURE_USER="azureuser"
AZURE_HOST="leaveflow.ddns.net"
AZURE_PATH="~/apps/LeaveFlow"
LOCAL_PATH="c:/Users/mohamed taher/Desktop/smartHome"

echo "📁 Synchronisation des fichiers..."

# Copier les fichiers essentiels
echo "Copie de server/index.js..."
scp "$LOCAL_PATH/server/index.js" $AZURE_USER@$AZURE_HOST:$AZURE_PATH/server/

echo "Copie de .env..."
scp "$LOCAL_PATH/.env" $AZURE_USER@$AZURE_HOST:$AZURE_PATH/

echo "Copie de docker-compose.azure.yml..."
scp "$LOCAL_PATH/docker-compose.azure.yml" $AZURE_USER@$AZURE_HOST:$AZURE_PATH/

echo "Copie des routes..."
scp -r "$LOCAL_PATH/server/routes" $AZURE_USER@$AZURE_HOST:$AZURE_PATH/server/

echo "Copie des utils..."
scp -r "$LOCAL_PATH/server/utils" $AZURE_USER@$AZURE_HOST:$AZURE_PATH/server/

echo "✅ Synchronisation terminée"

echo "🔄 Redémarrage de l'application sur Azure..."
ssh $AZURE_USER@$AZURE_HOST << 'EOF'
cd ~/apps/LeaveFlow
docker-compose -f docker-compose.azure.yml down
docker-compose -f docker-compose.azure.yml up -d --build
echo "⏳ Attente du démarrage..."
sleep 15
docker logs smartHome_server_prod --tail 10
EOF

echo "🎉 Déploiement terminé !"
echo "🌐 Testez votre application : http://leaveflow.ddns.net:3000"
