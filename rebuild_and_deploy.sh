#!/bin/bash

# Navigate to your project directory (adjust if needed)
cd ~/smartHome

# Pull the latest changes if needed
# git pull

# Rebuild the client container with no cache
echo "Rebuilding client container with no cache..."
docker compose -f docker-compose.azure.yml build --no-cache client

# Restart the containers
echo "Restarting containers..."
docker compose -f docker-compose.azure.yml up -d

# Wait for the containers to start
echo "Waiting for containers to start..."
sleep 10

# Verify no localhost:5001 references remain in the built files
echo "Checking for any remaining localhost:5001 references in built files..."
docker exec smartHome_client_1 grep -r "localhost:5001" /usr/share/nginx/html/ || echo "Great! No localhost:5001 references found."

echo "Deployment completed! Access your application at http://leaveflow.ddns.net"
