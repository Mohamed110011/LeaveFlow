#!/bin/bash

# Azure VM Quick Update Script
# Run this on your Azure VM to update the environment variables

echo "🔧 Updating environment variables on Azure VM..."

# Create/Update .env file with correct variables
cat > .env << EOL
# Database Configuration
POSTGRES_DB=smarthome_prod
POSTGRES_USER=postgres
POSTGRES_PASSWORD=VotreMotDePasseTresSecurise2024!

# JWT Configuration
JWT_SECRET=cat123

# ReCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=6LegyXQrAAAAADTVmklSOvwrdsqGPb35pWCD75XD
RECAPTCHA_SITE_KEY=6LegyXQrAAAAAJFpdqkfJNdqy3QzeF0IhFe6VkNJ
REACT_APP_RECAPTCHA_SITE_KEY=6LegyXQrAAAAAJFpdqkfJNdqy3QzeF0IhFe6VkNJ

# Email Configuration
EMAIL_USER=mohamed.taher@isimg.tn
EMAIL_PASSWORD=rnfu gtme vnso mcya

# Google OAuth Configuration
GOOGLE_CLIENT_ID=668076420172-0ml8a6aokd5hsspd6rviskgibnehe50h.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_google_client_secret_prod
REACT_APP_GOOGLE_CLIENT_ID=668076420172-0ml8a6aokd5hsspd6rviskgibnehe50h.apps.googleusercontent.com

# App Configuration
NODE_ENV=production
PORT=5001
REACT_APP_API_URL=http://leaveflow.ddns.net:5001

# Logs et monitoring
LOG_LEVEL=info
EOL

echo "✅ Environment file updated"

# Restart containers
echo "🔄 Restarting containers..."
docker-compose -f docker-compose.azure.yml down
sleep 5
docker-compose -f docker-compose.azure.yml up -d

echo "⏳ Waiting for containers to start..."
sleep 10

echo "📊 Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "📄 Server logs:"
docker logs smartHome_server_prod --tail 15

echo "✅ Update completed!"
echo "🌐 Test your application at: http://leaveflow.ddns.net:5001"
