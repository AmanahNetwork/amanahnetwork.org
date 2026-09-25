import path from 'path';
import crypto from 'crypto';

/**
 * Strict file upload security utility
 * - Enforces allowed MIME types (images, PDF)
 * - Limits maximum file size (5MB default)
 * - Sanitizes filenames and eliminates path traversal attempts
 * - Validates extensions against approved list
 */

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf'
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const validateFileUpload = ({ originalname, mimetype, size, buffer }) => {
  if (!originalname || typeof originalname !== 'string') {
    throw new Error("Invalid file name.");
  }

  // 1. Check file size
  if (size && size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum permitted size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
  }

  // 2. Check extension
  const ext = path.extname(originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File extension '${ext}' is not permitted. Allowed: .jpg, .png, .webp, .pdf`);
  }

  // 3. Check MIME type
  if (mimetype && !ALLOWED_MIME_TYPES.has(mimetype.toLowerCase())) {
    throw new Error(`MIME type '${mimetype}' is not permitted.`);
  }

  // 4. Prevent double extensions / null-byte injection (e.g. evil.php.jpg)
  const baseNameWithoutExt = path.basename(originalname, ext);
  if (baseNameWithoutExt.includes('.') || originalname.includes('\0')) {
    throw new Error("Dangerous or double file extensions detected.");
  }

  // 5. Generate secure randomized filename
  const secureFilename = `${Date.now()}_${crypto.randomBytes(16).toString('hex')}${ext}`;

  return {
    valid: true,
    safeFilename: secureFilename,
    sanitizedExtension: ext,
    mimetype
  };
};
