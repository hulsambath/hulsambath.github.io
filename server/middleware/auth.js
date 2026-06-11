import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';
const STATE_TTL_MS = 10 * 60 * 1000;

/**
 * Encrypt sensitive data before sending to mobile app
 */
export function encrypt(text) {
  // Ensure key is 32 bytes
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt data received from mobile app
 */
export function decrypt(text) {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
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
