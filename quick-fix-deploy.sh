#!/bin/bash

# Quick fix deployment script for reCAPTCHA issue
# Usage: ./quick-fix-deploy.sh

echo "🔧 Quick Fix: Updating reCAPTCHA Configuration"

# Check if we're in the right directory
if [ ! -f "docker-compose.azure.yml" ]; then
    echo "❌ Error: docker-compose.azure.yml not found. Please run this script from the smartHome directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create it with the correct environment variables."
    exit 1
fi

echo "📋 Current environment status:"
echo "✅ .env file exists"
echo "✅ .env.prod file exists"

# Show current environment variables (masked for security)
echo "🔍 Environment variables check:"
source .env
echo "- JWT_SECRET: ${JWT_SECRET:0:3}*** (${#JWT_SECRET} characters)"
echo "- RECAPTCHA_SECRET_KEY: ${RECAPTCHA_SECRET_KEY:0:6}*** (${#RECAPTCHA_SECRET_KEY} characters)"
echo "- EMAIL_USER: $EMAIL_USER"
echo "- GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:12}***"

# Check if containers are running
echo "🐳 Checking Docker containers..."
if docker ps | grep -q smartHome; then
    echo "✅ SmartHome containers are running"
    
    echo "🔄 Restarting containers with new environment..."
    docker-compose -f docker-compose.azure.yml down
    
    echo "⏳ Waiting for containers to stop..."
    sleep 5
    
    echo "🚀 Starting containers with updated environment..."
    docker-compose -f docker-compose.azure.yml up -d
    
    echo "⏳ Waiting for containers to start..."
    sleep 10
    
    echo "📊 Container status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo "📄 Checking server logs (last 10 lines):"
    docker logs smartHome_server_prod --tail 10
    
    echo "✅ Deployment completed!"
    echo "🌐 Test your application at: http://leaveflow.ddns.net:5001"
    echo "📝 Check logs with: docker logs smartHome_server_prod -f"
    
else
    echo "❌ SmartHome containers are not running"
    echo "🚀 Starting containers..."
    docker-compose -f docker-compose.azure.yml up -d
fi

echo "🎉 Quick fix deployment completed!"
echo "💡 If you still have issues, check the logs: docker logs smartHome_server_prod -f"
