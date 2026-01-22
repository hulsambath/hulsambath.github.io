# Environment Variables for Railway Deployment

## ✅ Values You Can Use Now

Copy these values into Railway's environment variables:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
PORT=3000
MOBILE_CALLBACK_SCHEME=notemyminds://auth
ALLOWED_ORIGINS=https://hulsambath.github.io
ENCRYPTION_KEY=your-encryption-key-here
```

## ⚠️ Values to Update AFTER Deployment

These will be set after you deploy and get your Railway URL:

### Step 1: Deploy to Railway First

1. Deploy your server to Railway (follow DEPLOYMENT.md)
2. Railway will give you a URL like: `https://your-app-name.railway.app`

### Step 2: Update These Variables in Railway

**Your Railway URL:** `https://your-app-name.railway.app`

Set these variables in Railway:

```bash
REDIRECT_URI=https://your-app-name.railway.app/auth/callback
API_BASE_URL=https://your-app-name.railway.app
ALLOWED_ORIGINS=https://hulsambath.github.io,https://your-app-name.railway.app
```

### Step 3: Update Google Cloud Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://your-actual-railway-url.railway.app/auth/callback
   ```
4. Click "Save"

### Step 4: Update Flutter App Config

✅ **Already updated!** `configs/notemyminds_prod.json` now uses:

- `OAUTH_AUTH_URL`: `https://your-app-name.railway.app/auth/google`
- `OAUTH_REFRESH_URL`: `https://your-app-name.railway.app/auth/refresh`
- `API_BASE_URL`: `https://your-app-name.railway.app`

## 📋 Complete Railway Environment Variables (Ready to Use!)

Copy and paste these **exact values** into Railway's environment variables:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
PORT=3000
REDIRECT_URI=https://your-app-name.railway.app/auth/callback
MOBILE_CALLBACK_SCHEME=notemyminds://auth
ALLOWED_ORIGINS=https://hulsambath.github.io,https://your-app-name.railway.app
ENCRYPTION_KEY=your-encryption-key-here
API_BASE_URL=https://your-app-name.railway.app
```

✅ **All values are ready to use!**
