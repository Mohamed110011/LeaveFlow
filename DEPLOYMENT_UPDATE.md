# Azure Deployment Update Guide

## Current Status
✅ Environment variables have been updated locally with correct reCAPTCHA keys
✅ JWT_SECRET variable name has been fixed
✅ Email and Google OAuth credentials are configured

## Next Steps to Fix the Production Issue

### 1. Update Azure Environment Variables

If you're running on Azure, you need to update the environment variables on your Azure VM:

#### Option A: SSH into Azure VM and update
```bash
# SSH into your Azure VM
ssh your-username@leaveflow.ddns.net

# Navigate to your app directory
cd /home/your-username/apps/smartHome

# Update the .env file with the new values
nano .env

# Or copy the updated .env.prod file content
```

#### Option B: Deploy with updated environment files
```bash
# From your local machine, deploy the updated files
scp .env your-username@leaveflow.ddns.net:/home/your-username/apps/smartHome/
scp .env.prod your-username@leaveflow.ddns.net:/home/your-username/apps/smartHome/

# Then SSH and restart the application
ssh your-username@leaveflow.ddns.net
cd /home/your-username/apps/smartHome
```

### 2. Restart the Application

Once the environment variables are updated on Azure:

```bash
# Stop the current containers
docker-compose -f docker-compose.azure.yml down

# Start with new environment variables
docker-compose -f docker-compose.azure.yml up -d

# Or use the deployment script
./deploy-azure.sh
```

### 3. Verify the Fix

Check the server logs to ensure reCAPTCHA is working:

```bash
# Check server logs
docker logs smartHome_server_prod -f

# You should see:
# - "Secret key configured: true"
# - "Secret key starts with: 6LegyX..."
# - "Vérification reCAPTCHA réussie" (when someone registers)
```

### 4. Test the Registration

Try registering a new user at: http://leaveflow.ddns.net:5001/auth/register

## Environment Variables Summary

Here are the correct environment variables that need to be set:

```bash
JWT_SECRET=cat123
RECAPTCHA_SECRET_KEY=6LegyXQrAAAAADTVmklSOvwrdsqGPb35pWCD75XD
REACT_APP_RECAPTCHA_SITE_KEY=6LegyXQrAAAAAJFpdqkfJNdqy3QzeF0IhFe6VkNJ
EMAIL_USER=mohamed.taher@isimg.tn
EMAIL_PASSWORD=rnfu gtme vnso mcya
GOOGLE_CLIENT_ID=668076420172-0ml8a6aokd5hsspd6rviskgibnehe50h.apps.googleusercontent.com
```

## Security Note

⚠️ **Important**: The JWT_SECRET "cat123" is very weak for production. Consider using a stronger secret:

```bash
# Generate a strong JWT secret
openssl rand -base64 32

# Or use a longer, more complex password
JWT_SECRET=your_very_long_and_complex_jwt_secret_here_at_least_32_characters_2024
```

## reCAPTCHA Domain Configuration

Make sure your reCAPTCHA is configured for the domain `leaveflow.ddns.net` in the Google reCAPTCHA admin console.
