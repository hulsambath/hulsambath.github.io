import express from "express";
import {
  generateAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
} from "../config/oauth.js";
import { decrypt, validateState } from "../middleware/auth.js";

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

    // Encrypt tokens before sending to mobile app
    const encryptedToken = encrypt(tokenData);

    // Redirect to mobile app with encrypted token
    // Primary: HTTPS Universal Link (more reliable on iOS)
    const primaryUrl = `https://hulsambath.github.io/auth?token=${encodeURIComponent(encryptedToken)}`;
    // Fallback: Custom Scheme (reliable for manual clicks)
    const fallbackUrl = `${process.env.MOBILE_CALLBACK_SCHEME}?token=${encodeURIComponent(encryptedToken)}`;

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
              margin-bottom: 20px;
            }
            .button {
              display: block;
              width: 100%;
              background-color: #7C4DFF;
              color: white;
              padding: 12px 0;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 10px;
              transition: background-color 0.2s;
              border: none;
              cursor: pointer;
              font-size: 16px;
            }
            .button:hover {
              background-color: #651FFF;
            }
            .button-secondary {
              background-color: transparent;
              color: #7C4DFF;
              border: 1px solid #7C4DFF;
              margin-top: 10px;
            }
            .button-secondary:hover {
              background-color: #f3f0ff;
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
            <p class="redirect-note" id="status-text">Opening app...</p>

            <a href="${fallbackUrl}" class="button" id="primary-btn">Open App</a>
            <a href="${primaryUrl}" class="button button-secondary" id="fallback-btn">Try Universal Link</a>
          </div>

          <script>
            const primaryUrl = '${primaryUrl}';
            const fallbackUrl = '${fallbackUrl}';

            // Function to try redirect
            function tryRedirect() {
              document.getElementById('status-text').innerText = 'Opening app...';

              // Use Custom Scheme for auto-redirect (most reliable without Universal Links)
              window.location.href = fallbackUrl;

              // If page is still visible after a delay, update text
              setTimeout(() => {
                document.getElementById('status-text').innerText = 'If app didn\\'t open, tap the button below.';
              }, 2000);
            }

            // Start redirect process automatically
            setTimeout(tryRedirect, 100);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    // Improved error logging for debugging
    console.error(
      "Error exchanging code for tokens (Full):",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    );
    if (error.response) {
      console.error(
        "Error response data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }

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
