import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

// Must be set BEFORE the module under test is imported
process.env.ENCRYPTION_KEY = "test-key-0123456789abcdef0123456789abcdef";

const { generateState, validateState } = await import("../middleware/auth.js");

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
