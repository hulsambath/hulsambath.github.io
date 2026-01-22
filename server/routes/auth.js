import express from "express";
import {
  generateAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
} from "../config/oauth.js";
import { decrypt, encrypt, validateState } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /auth/google
 * Initiates OAuth flow by redirecting to Google consent screen
 */
router.get("/google", (req, res) => {
  try {
    const authUrl = generateAuthUrl();
    console.log("Generated OAuth URL, redirecting to Google...");
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to initiate authentication" });
  }
});

/**
 * GET /auth/callback
 * Handles OAuth callback from Google
 * Exchanges code for tokens and redirects to mobile app
 */
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return res.redirect(
      `${process.env.MOBILE_CALLBACK_SCHEME}?error=${encodeURIComponent(error)}`,
    );
  }

  // Also handle error if tokens are missing but no explicit error param
  if (!code && !error) {
    return res.redirect(
      `${process.env.MOBILE_CALLBACK_SCHEME}?error=authorization_code_missing`,
    );
  }

  // Validate required parameters
  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  // Validate state (CSRF protection)
  if (!validateState(state)) {
    return res.status(400).json({ error: "Invalid state parameter" });
  }

  try {
    // Exchange authorization code for tokens
    console.log("Exchanging code for tokens...");
    const tokens = await getTokensFromCode(code);

    // Encrypt tokens before sending to mobile app
    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope,
    });

    const encryptedToken = encrypt(tokenData);

    // Redirect to mobile app with encrypted token
    const callbackUrl = `${process.env.MOBILE_CALLBACK_SCHEME}?token=${encodeURIComponent(encryptedToken)}`;
    console.log("Authentication successful, redirecting to mobile app...");

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              text-align: center;
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 400px;
            }
            .success-icon {
              width: 80px;
              height: 80px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1.5rem;
            }
            .checkmark {
              color: white;
              font-size: 3rem;
            }
            h1 {
              color: #1f2937;
              margin-bottom: 0.5rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }
            .app-name {
              color: #7C4DFF;
              font-weight: bold;
            }
            .redirect-note {
              font-size: 0.875rem;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">
              <span class="checkmark">✓</span>
            </div>
            <h1>Authentication Successful!</h1>
            <p>You're now signed in to <span class="app-name">NoteMyMinds</span></p>
            <p class="redirect-note">Redirecting to the app...</p>

            <a href="${callbackUrl}" class="button">Open App</a>
          </div>
          <style>
            .button {
              display: inline-block;
              background-color: #7C4DFF;
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 10px;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #651FFF;
            }
          </style>
            // Attempt to redirect to mobile app
            setTimeout(() => {
              window.location.href = '${callbackUrl}';
            }, 1000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    res.status(500).json({
      error: "Failed to complete authentication",
      details: error.message,
    });
  }
});

/**
 * POST /auth/refresh
 * Refreshes access token using refresh token
 */
router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    // Decrypt refresh token if it's encrypted
    let decryptedRefreshToken = refresh_token;
    try {
      decryptedRefreshToken = decrypt(refresh_token);
    } catch (e) {
      // Token might not be encrypted, use as-is
    }

    // Get new access token
    const tokens = await refreshAccessToken(decryptedRefreshToken);

    res.json({
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({
      error: "Failed to refresh token",
      details: error.message,
    });
  }
});

/**
 * GET /auth/status
 * Health check endpoint
 */
router.get("/status", (req, res) => {
  res.json({
    status: "ok",
    service: "NoteMyMinds OAuth Server",
    timestamp: new Date().toISOString(),
  });
});

export default router;
