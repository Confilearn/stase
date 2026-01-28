/**
 * Validates email format using regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates username format
 * - 3-20 characters
 * - Letters, numbers, and underscores only
 * - Cannot start or end with underscore
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]{1,18}[a-zA-Z0-9]$/;
  return usernameRegex.test(username);
}
