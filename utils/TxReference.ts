/**
 * Generates a unique transaction reference
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now().toString();
  const randomSuffix = Math.random().toString(36).substr(2, 12).toUpperCase();
  const randomPrefix = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `TXN${randomPrefix}${timestamp}${randomSuffix}`;
}
