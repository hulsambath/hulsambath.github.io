# NoteMyMinds OAuth Server

Express.js backend server providing OAuth 2.0 authentication for NoteMyMinds mobile apps across all platforms.

## Purpose

This server enables cross-platform data synchronization by providing a unified OAuth flow that all platforms (iOS, Android, Web, Desktop) can use to access the same Google Drive `appDataFolder`.

## Architecture

```
Mobile App → Browser → OAuth Server → Google OAuth → OAuth Server → Mobile App
                                                              ↓
                                                    Encrypted Token via Deep Link
```

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
REDIRECT_URI=http://localhost:3000/auth/callback
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Endpoints

### GET /
- Root endpoint with server info and available endpoints

### GET /auth/google
- Initiates OAuth flow
- Redirects user to Google consent screen
- Used by mobile apps to start authentication

### GET /auth/callback
- OAuth callback from Google
- Exchanges authorization code for tokens
- Encrypts tokens and redirects to mobile app via deep link

### POST /auth/refresh
- Refreshes expired access token
- Body: `{ "refresh_token": "..." }`
- Returns new access token

### GET /auth/status
- Health check endpoint
- Returns server status

## Security Features

- ✅ Token encryption before deep link redirect
- ✅ CORS protection
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js security headers
- ✅ HTTPS only in production
- ✅ State parameter validation (CSRF protection)

## Deployment

### Option 1: Railway (Recommended)

1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Connect GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy!

Railway will auto-deploy on git push.

### Option 2: Heroku

```bash
heroku create notemyminds-oauth
heroku config:set GOOGLE_CLIENT_ID=...
heroku config:set GOOGLE_CLIENT_SECRET=...
git push heroku main
```

### Option 3: Vercel (Serverless)

Convert to serverless functions:
- `api/auth/google.js`
- `api/auth/callback.js`
- `api/auth/refresh.js`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth Web Client ID | `837570891347-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | `GOCSPX-xxx` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/auth/callback` |
| `MOBILE_CALLBACK_SCHEME` | Deep link scheme | `notemyminds://auth` |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | `http://localhost:5173,https://hulsambath.github.io` |
| `ENCRYPTION_KEY` | 32-char key for token encryption | Generated random string |
| `API_BASE_URL` | Public URL of this server | `https://your-server.com` |

## Testing

### Test OAuth Flow

1. Start server:
```bash
npm run dev
```

2. Open in browser:
```
http://localhost:3000/auth/google
```

3. Complete Google consent

4. Verify redirect to mobile app (will fail without app installed)

### Test with cURL

```bash
# Health check
curl http://localhost:3000/auth/status

# Test refresh endpoint
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"your_refresh_token"}'
```

## Logs

Server logs include:
- Request method and path
- OAuth flow stages
- Error details with stack traces (dev mode only)
- Token exchange success/failure

## Troubleshooting

### "Redirect URI mismatch"
- Update Google Cloud Console OAuth client
- Add your REDIRECT_URI to authorized redirect URIs

### CORS errors
- Add origin to ALLOWED_ORIGINS in .env
- Check browser console for exact origin

### Mobile app doesn't open
- Verify MOBILE_CALLBACK_SCHEME matches app config
- Check deep link configuration in mobile apps

## Production Checklist

- [ ] Set strong ENCRYPTION_KEY (32 characters)
- [ ] Update REDIRECT_URI to production URL
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS for production domains
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Test OAuth flow end-to-end
- [ ] Update mobile app configs with production URLs

## Related Documentation

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Express.js](https://expressjs.com/)
- [googleapis Node.js](https://github.com/googleapis/google-api-nodejs-client)

---

**Version:** 1.0.0
**Last Updated:** January 21, 2026
