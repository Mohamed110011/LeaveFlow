#!/bin/bash

# Check current environment configuration
echo "=== Environment Configuration Check ==="
echo "Current working directory: $(pwd)"
echo "Files in current directory:"
ls -la

echo -e "\n=== Environment Files ==="
echo "Available .env files:"
find . -name ".env*" -type f

echo -e "\n=== Docker Container Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== Server Logs (last 20 lines) ==="
docker logs smartHome_server_prod --tail 20

echo -e "\n=== Environment Variables in Container ==="
docker exec smartHome_server_prod env | grep -E "(RECAPTCHA|JWT|NODE_ENV)" | sort
