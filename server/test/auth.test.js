import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

// Must be set BEFORE the module under test is imported
process.env.ENCRYPTION_KEY = "test-key-0123456789abcdef0123456789abcdef";

const { generateState, validateState, encrypt, decrypt } = await import(
  "../middleware/auth.js"
);

const SECRET = process.env.ENCRYPTION_KEY;

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

test("generateState produces a state that validateState accepts", () => {
  const state = generateState();
  assert.equal(validateState(state), true);
});

test("state has timestamp.nonce.hmac structure", () => {
  const parts = generateState().split(".");
  assert.equal(parts.length, 3);
  assert.ok(Number(parts[0]) > 0);
  assert.equal(parts[1].length, 32); // 16 random bytes as hex
  assert.equal(parts[2].length, 64); // sha256 hex
});

test("tampered state is rejected", () => {
  const state = generateState();
  const [ts, nonce, sig] = state.split(".");
  const otherNonce = crypto.randomBytes(16).toString("hex");
  assert.equal(validateState(`${ts}.${otherNonce}.${sig}`), false);
});

test("expired state is rejected even with a valid signature", () => {
  const ts = (Date.now() - 11 * 60 * 1000).toString(); // 11 min old, TTL is 10
  const nonce = crypto.randomBytes(16).toString("hex");
  const expired = `${ts}.${nonce}.${sign(`${ts}.${nonce}`)}`;
  assert.equal(validateState(expired), false);
});

test("future-dated state is rejected", () => {
  const ts = (Date.now() + 60 * 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const future = `${ts}.${nonce}.${sign(`${ts}.${nonce}`)}`;
  assert.equal(validateState(future), false);
});

test("malformed states are rejected", () => {
  assert.equal(validateState(undefined), false);
  assert.equal(validateState(null), false);
  assert.equal(validateState(""), false);
  assert.equal(validateState("longer-than-ten-chars-but-junk"), false);
  assert.equal(validateState("a.b.c"), false);
});

test("encrypt emits v2 GCM format and decrypt round-trips it", () => {
  const out = encrypt("hello tokens");
  assert.ok(out.startsWith("v2:"));
  assert.equal(out.split(":").length, 4); // v2:iv:tag:ciphertext
  assert.equal(decrypt(out), "hello tokens");
});

test("tampered v2 ciphertext fails to decrypt", () => {
  const out = encrypt("hello tokens");
  const parts = out.split(":");
  const ct = parts[3];
  const flipped = (ct[0] === "0" ? "1" : "0") + ct.slice(1);
  const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${flipped}`;
  assert.throws(() => decrypt(tampered));
});

test("legacy CBC tokens still decrypt", () => {
  // Reproduce the legacy encrypt: AES-256-CBC, key padded to 32 bytes
  const key = Buffer.from(SECRET.padEnd(32, "0").slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let enc = cipher.update("legacy data", "utf8", "hex");
  enc += cipher.final("hex");
  const legacy = iv.toString("hex") + ":" + enc;
  assert.equal(decrypt(legacy), "legacy data");
});
