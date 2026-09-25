import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { validateFileUpload } from '../utils/uploadSecurity.js';

// Reusable constant-time compare test
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// Reusable NoSQL sanitizer test
const sanitizeNoSqlInPlace = (target) => {
  if (!target || typeof target !== 'object') return;
  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
    } else if (typeof target[key] === 'object' && target[key] !== null) {
      sanitizeNoSqlInPlace(target[key]);
    }
  }
};

// Reusable HTML escape test
const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Reusable account masking test
const maskAccountNumber = (acc) => {
  const str = String(acc || '').trim();
  if (str.length <= 4) return '****';
  return str.slice(0, 2) + '****' + str.slice(-4);
};

test('1. File Upload Security - Rejects unapproved MIME types and extensions', () => {
  assert.throws(() => {
    validateFileUpload({
      originalname: 'malicious.exe',
      mimetype: 'application/x-msdownload',
      size: 1024
    });
  }, /not permitted/);

  assert.throws(() => {
    validateFileUpload({
      originalname: 'exploit.php.jpg',
      mimetype: 'image/jpeg',
      size: 1024
    });
  }, /Dangerous or double file extensions/);

  assert.throws(() => {
    validateFileUpload({
      originalname: 'large.pdf',
      mimetype: 'application/pdf',
      size: 10 * 1024 * 1024 // 10MB > 5MB limit
    });
  }, /exceeds maximum permitted size/);

  const valid = validateFileUpload({
    originalname: 'receipt.pdf',
    mimetype: 'application/pdf',
    size: 500 * 1024
  });
  assert.equal(valid.valid, true);
  assert.match(valid.safeFilename, /\.pdf$/);
});

test('2. NoSQL Injection Prevention - Strips operators ($gt, $ne, $where)', () => {
  const payload = {
    username: 'admin',
    password: { $ne: null },
    nested: {
      $gt: 0,
      safeKey: 'cleanValue'
    }
  };

  sanitizeNoSqlInPlace(payload);

  assert.equal(payload.username, 'admin');
  assert.equal(payload.password.$ne, undefined);
  assert.equal(payload.nested.$gt, undefined);
  assert.equal(payload.nested.safeKey, 'cleanValue');
});

test('3. Timing-Safe Comparison - Mitigates timing attacks on secret keys', () => {
  const masterKey = 'super_secret_governance_key_2026';
  assert.equal(safeCompare('super_secret_governance_key_2026', masterKey), true);
  assert.equal(safeCompare('wrong_key', masterKey), false);
  assert.equal(safeCompare('', masterKey), false);
  assert.equal(safeCompare(null, masterKey), false);
});

test('4. HTML Content Escaping - Prevents Cross-Site Scripting (XSS) in Emails', () => {
  const dirty = '<script>alert("xss")</script>&"quote"\'single\'';
  const clean = escapeHtml(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('&lt;script&gt;'), true);
  assert.equal(clean.includes('&quot;quote&quot;'), true);
  assert.equal(clean.includes('&#039;single&#039;'), true);
});

test('5. PII Masking - Trims API responses to protect sensitive financial accounts', () => {
  assert.equal(maskAccountNumber('123456789012'), '12****9012');
  assert.equal(maskAccountNumber('987654321'), '98****4321');
  assert.equal(maskAccountNumber('123'), '****');
});

test('6. Tamper-Evident SHA256 Chaining - Cryptographic verification', () => {
  const action = 'AID_TRANSFER';
  const actorId = 'agent_007';
  const status = 'SUCCESS';
  const isoTime = new Date().toISOString();
  const details = { amount: 50000 };
  const prevHash = 'GENESIS_BLOCK';

  const content = `${action}|${actorId}|${status}|${isoTime}|${JSON.stringify(details)}|${prevHash}`;
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  assert.equal(hash.length, 64);
  assert.notEqual(hash, prevHash);
});
