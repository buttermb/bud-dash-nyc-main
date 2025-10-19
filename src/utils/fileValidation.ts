/**
 * File Upload Security Validation
 * Validates file types and sizes for product image uploads
 */

const ALLOWED_PRODUCT_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'application/pdf' // For COA documents
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILENAME_LENGTH = 255;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

/**
 * Validates file for product image upload
 */
export const validateProductFile = (file: File): ValidationResult => {
  // Check file type
  if (!ALLOWED_PRODUCT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_PRODUCT_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Sanitize filename to prevent path traversal attacks
  const sanitizedFileName = sanitizeFilename(file.name);
  
  if (sanitizedFileName.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Filename too long. Maximum length: ${MAX_FILENAME_LENGTH} characters`
    };
  }

  return {
    valid: true,
    sanitizedFileName
  };
};

/**
 * Sanitizes filename by removing dangerous characters
 * Prevents path traversal and injection attacks
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove path separators and special characters
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric chars
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, ''); // Remove trailing dots

  // Ensure file has an extension
  if (!sanitized.includes('.')) {
    return `${sanitized}.jpg`;
  }

  return sanitized;
};

/**
 * Validates that a file path doesn't contain directory traversal attempts
 */
export const validateFilePath = (path: string): boolean => {
  const dangerousPatterns = [
    '../',
    '..\\',
    '%2e%2e',
    '%252e%252e',
    '..%2f',
    '..%5c'
  ];

  const lowerPath = path.toLowerCase();
  return !dangerousPatterns.some(pattern => lowerPath.includes(pattern));
};
