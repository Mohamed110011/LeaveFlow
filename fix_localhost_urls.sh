#!/bin/bash

# Update Dockerfile.prod to include a post-build script
cat > client/Dockerfile.prod << 'EOF'
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Hardcode the environment variables for production
# This ensures they are set during build time
ENV REACT_APP_API_URL=http://leaveflow.ddns.net:5001
ENV REACT_APP_GOOGLE_CLIENT_ID=668076420172-0ml8a6aokd5hsspd6rviskgibnehe50h.apps.googleusercontent.com
ENV REACT_APP_RECAPTCHA_SITE_KEY=6LfT3GMrAAAAAPvjbNp0ypX9zB820x06VPv-FTXj

# Build the app
RUN npm run build

# Post-build script to directly replace any remaining localhost references
RUN echo "Replacing any remaining localhost:5001 references with leaveflow.ddns.net:5001" && \
    find /app/build -type f -name "*.js" -exec sed -i 's|http://localhost:5001|http://leaveflow.ddns.net:5001|g' {} \;

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

echo "Updated Dockerfile.prod with post-build search and replace script"
echo "Now rebuild the client container with:"
echo "docker compose -f docker-compose.azure.yml build --no-cache client"
echo "docker compose -f docker-compose.azure.yml up -d"
