#!/bin/bash

# Test script pour vérifier le fonctionnement de l'application
echo "🧪 Test automatique de l'application SmartHome"

# Variables
API_URL="http://leaveflow.ddns.net:5001"
APP_URL="http://leaveflow.ddns.net:3000"

echo "🔍 Test 1: Vérification de l'API"
if curl -s -f "$API_URL/auth/validate-token" > /dev/null; then
    echo "✅ API accessible"
else
    echo "❌ API non accessible"
fi

echo "🔍 Test 2: Vérification du frontend"
if curl -s -f "$APP_URL" > /dev/null; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend non accessible"
fi

echo "🔍 Test 3: Vérification des conteneurs"
if docker ps | grep -q smartHome_server_prod; then
    echo "✅ Serveur en cours d'exécution"
else
    echo "❌ Serveur arrêté"
fi

if docker ps | grep -q smartHome_client_prod; then
    echo "✅ Client en cours d'exécution"
else
    echo "❌ Client arrêté"
fi

echo "🔍 Test 4: Vérification des logs récents"
echo "Derniers logs du serveur :"
docker logs smartHome_server_prod --tail 5

echo "🔍 Test 5: Test d'inscription (sans reCAPTCHA)"
echo "Pour tester l'inscription complète, allez sur : $APP_URL/register"
echo "Et vérifiez que le reCAPTCHA apparaît correctement."

echo "🎉 Tests terminés !"
echo "📊 Résumé des URLs :"
echo "   - Frontend: $APP_URL"
echo "   - API: $API_URL"
echo "   - Inscription: $APP_URL/register"
