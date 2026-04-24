import crypto from 'crypto';

export function generateJti(bytes = 16): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generateLinkToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}
