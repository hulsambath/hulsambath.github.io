# Deployment Guide - OAuth Backend Server

Complete guide for deploying the NoteMyMinds OAuth backend to production.

## Prerequisites

- GitHub account
- Railway account (recommended) OR Heroku account
- OAuth backend code pushed to GitHub repository

## Option 1: Railway (Recommended) ✅

Railway offers free tier with automatic deployments from GitHub.

### Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub account
3. Grant necessary permissions

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose repository: `my-portfolio`
4. Select directory: `server` (if prompted)

### Step 3: Configure Environment Variables

In Railway project settings, add these variables:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
PORT=3000
REDIRECT_URI=https://your-app.railway.app/auth/callback
MOBILE_CALLBACK_SCHEME=notemyminds://auth
ALLOWED_ORIGINS=https://hulsambath.github.io,https://your-app.railway.app
ENCRYPTION_KEY=your-secure-32-character-encryption-key-here
API_BASE_URL=https://your-app.railway.app
```

**Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Step 4: Configure Build Settings

Railway should auto-detect Node.js. If needed, add to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 5: Deploy

1. Railway will automatically deploy on push to `main` branch
2. Wait for build to complete (2-3 minutes)
3. Note your app URL: `https://your-app.railway.app`

### Step 6: Update Google Cloud Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your Web OAuth client
3. Add redirect URI:
   - `https://your-app.railway.app/auth/callback`
4. Save

### Step 7: Test Deployment

```bash
curl https://your-app.railway.app/
# Should return server info

curl https://your-app.railway.app/auth/status
# Should return { "status": "ok" }
```

## Option 2: Heroku

### Step 1: Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Or download from heroku.com
```

### Step 2: Login

```bash
heroku login
```

### Step 3: Create App

```bash
cd my-portfolio/server
heroku create notemyminds-oauth
```

### Step 4: Set Environment Variables

```bash
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret"
heroku config:set NODE_ENV="production"
heroku config:set REDIRECT_URI="https://notemyminds-oauth.herokuapp.com/auth/callback"
heroku config:set MOBILE_CALLBACK_SCHEME="notemyminds://auth"
heroku config:set ALLOWED_ORIGINS="https://hulsambath.github.io,https://notemyminds-oauth.herokuapp.com"
heroku config:set ENCRYPTION_KEY="$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")"
heroku config:set API_BASE_URL="https://notemyminds-oauth.herokuapp.com"
```

### Step 5: Deploy

```bash
git push heroku main
```

### Step 6: Open App

```bash
heroku open
```

## Option 3: Vercel (Serverless)

For serverless deployment, convert to Vercel Functions format.

Create `api/auth/google.js`:
```javascript
import { generateAuthUrl } from '../../config/oauth.js';

export default async function handler(req, res) {
  const authUrl = generateAuthUrl();
  res.redirect(authUrl);
}
```

Deploy:
```bash
vercel
```

## Post-Deployment Checklist

### 1. Update Mobile App Configs

**File:** `notemyminds/configs/notemyminds_prod.json`

```json
{
  "OAUTH_AUTH_URL": "https://your-app.railway.app/auth/google",
  "OAUTH_REFRESH_URL": "https://your-app.railway.app/auth/refresh",
  "API_BASE_URL": "https://your-app.railway.app"
}
```

### 2. Update Google Cloud Console

- Add production redirect URI
- Verify authorized domains
- Test OAuth consent screen

### 3. Test Production OAuth Flow

1. Build production APK/IPA
2. Install on test device
3. Initiate OAuth from app
4. Complete authentication
5. Verify callback works
6. Verify data syncs

### 4. Monitor Logs

**Railway:**
- View logs in Railway dashboard
- Set up notifications for errors

**Heroku:**
```bash
heroku logs --tail
```

### 5. Set Up Custom Domain (Optional)

**Railway:**
1. Settings → Domains
2. Add custom domain
3. Update DNS records

**Heroku:**
```bash
heroku domains:add auth.notemyminds.com
```

## Security Best Practices

### 1. Enable HTTPS Only

- Railway/Heroku automatically provide HTTPS
- Ensure `NODE_ENV=production`
- Check CORS configuration

### 2. Rotate Secrets Regularly

Update encryption key every 3-6 months:
```bash
# Generate new key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")

# Update Railway
railway variables set ENCRYPTION_KEY=$NEW_KEY

# Or Heroku
heroku config:set ENCRYPTION_KEY=$NEW_KEY
```

### 3. Monitor API Usage

- Set up alerts for unusual activity
- Monitor rate limit hits
- Track authentication success/failure rates

### 4. Backup Configuration

Save environment variables securely:
```bash
# Railway
railway variables export > .env.backup

# Heroku
heroku config -s > .env.backup
```

Store in secure location (1Password, etc.)

## Troubleshooting

### Build Fails

**Issue:** Module not found

**Solution:**
```bash
# Check package.json
cat package.json

# Ensure all dependencies listed
npm install
```

### OAuth Redirect Fails

**Issue:** "Redirect URI mismatch"

**Solution:**
1. Check exact URL in Google Console
2. Ensure trailing slash matches
3. Verify HTTPS vs HTTP

### CORS Errors

**Issue:** "Access-Control-Allow-Origin"

**Solution:**
```bash
# Add origin to allowed list
railway variables set ALLOWED_ORIGINS="https://hulsambath.github.io,https://your-app.railway.app,https://your-custom-domain.com"
```

### Mobile App Not Opening

**Issue:** Deep link callback fails

**Solution:**
1. Test deep link: `adb shell am start -a android.intent.action.VIEW -d "notemyminds://auth?token=test"`
2. Verify scheme in AndroidManifest.xml / Info.plist
3. Check backend redirects to correct scheme

## Monitoring & Maintenance

### Health Checks

Set up automated monitoring:
```bash
# Add to cron or monitoring service
curl https://your-app.railway.app/auth/status
```

### Update Dependencies

Monthly:
```bash
npm outdated
npm update
npm audit fix
```

### Performance Monitoring

Track metrics:
- Response times
- Error rates
- OAuth success/failure ratio
- Token refresh frequency

## Scaling

Railway/Heroku auto-scale based on traffic. For high volume:

1. Enable autoscaling
2. Set up Redis for session management
3. Implement request queuing
4. Add CDN for static responses

## Cost Estimation

**Railway Free Tier:**
- 500 hours/month
- $5 credit/month
- Suitable for small-medium apps

**Heroku:**
- Free tier: 550-1000 dyno hours/month
- Hobby tier: $7/month for always-on

**Vercel:**
- Free tier: 100GB bandwidth
- Serverless functions included

## Support

For issues:
1. Check server logs
2. Review Google Cloud Console logs
3. Test with curl/Postman
4. Check GitHub Issues

---

**Last Updated:** January 21, 2026
**Deployed:** ⏳ Pending
