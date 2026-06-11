import crypto from 'crypto';

const ENCRYPTION_KEY = (() => {
  const key = process.env.ENCRYPTION_KEY;
  if (process.env.NODE_ENV === "production") {
    if (!key || key.length < 32) {
      console.error(
        "FATAL: ENCRYPTION_KEY must be set and at least 32 characters in production.",
      );
      process.exit(1);
    }
    return key;
  }
  if (!key) {
    console.warn(
      "WARNING: ENCRYPTION_KEY not set — using an insecure development-only key.",
    );
    return "dev-only-insecure-key-do-not-use";
  }
  return key;
})();
const STATE_TTL_MS = 10 * 60 * 1000;

// Must match the legacy CBC key derivation so old tokens still decrypt
function deriveKey() {
  return Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
}

/**
 * Encrypt sensitive data (AES-256-GCM, authenticated).
 * Format: v2:<iv>:<authTag>:<ciphertext> (hex)
 */
export function encrypt(text) {
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `v2:${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * Decrypt data. Accepts v2 (GCM) and legacy (CBC iv:ciphertext) formats —
 * legacy support keeps refresh tokens already stored on devices working.
 */
export function decrypt(text) {
  const key = deriveKey();

  if (text.startsWith('v2:')) {
    const [, ivHex, tagHex, data] = text.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Legacy AES-256-CBC: <iv>:<ciphertext>
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(parts.join(':'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function signState(payload) {
  return crypto.createHmac('sha256', ENCRYPTION_KEY).update(payload).digest('hex');
}

/**
 * Generate HMAC-signed OAuth state for CSRF protection.
 * Format: <timestamp>.<nonce>.<hmac>
 */
export function generateState() {
  const ts = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  return `${ts}.${nonce}.${signState(`${ts}.${nonce}`)}`;
}

/**
 * Validate OAuth state: structure, HMAC signature (timing-safe), and age.
 */
export function validateState(state) {
  if (typeof state !== 'string') return false;
  const parts = state.split('.');
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;

  let sigBuf;
  try {
    sigBuf = Buffer.from(sig, 'hex');
  } catch {
    return false;
  }
  const expectedBuf = Buffer.from(signState(`${ts}.${nonce}`), 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= 0 && age <= STATE_TTL_MS;
}
