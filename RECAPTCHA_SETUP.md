# reCAPTCHA Configuration Guide

## Issue
The application is currently showing "Invalid reCAPTCHA. Please try again." error because the reCAPTCHA keys are not properly configured.

## Solution

### 1. Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Sign in with your Google account
3. Click "Create" to create a new site
4. Fill in the form:
   - **Label**: SmartHome App
   - **reCAPTCHA type**: Select "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - **Domains**: Add your domain (e.g., `leaveflow.ddns.net`)
   - Accept the Terms of Service
5. Click "Submit"
6. Copy the **Site Key** and **Secret Key**

### 2. Update Environment Variables

Edit the `.env.prod` file and replace the placeholder values:

```bash
# Replace these with your actual keys
RECAPTCHA_SECRET_KEY=your_actual_secret_key_from_google
REACT_APP_RECAPTCHA_SITE_KEY=your_actual_site_key_from_google
```

### 3. Redeploy the Application

After updating the environment variables, redeploy the application:

```bash
# Stop the current containers
docker-compose -f docker-compose.azure.yml down

# Rebuild and start with new environment variables
docker-compose -f docker-compose.azure.yml up -d --build
```

### 4. Verify the Fix

Check the server logs to ensure reCAPTCHA is working:

```bash
docker logs smartHome_server_prod
```

You should see messages like:
- "Secret key configured: true"
- "Vérification reCAPTCHA réussie"

## Temporary Workaround (Development Only)

If you need to test the app immediately without reCAPTCHA, you can temporarily disable reCAPTCHA verification in development mode. **DO NOT USE THIS IN PRODUCTION**.

## Domain Configuration

Make sure your reCAPTCHA domain is configured for:
- `leaveflow.ddns.net` (your current domain)
- `localhost` (for local development)

## Troubleshooting

### Common Error Codes:
- `invalid-input-secret`: The secret key is invalid
- `invalid-input-response`: The response token is invalid
- `timeout-or-duplicate`: The response token has expired or been used

### Check Server Logs:
```bash
docker logs smartHome_server_prod -f
```

The logs will show detailed information about reCAPTCHA verification attempts.
