import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const PREFIX = 'enc:';

function getKey(): Buffer | null {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex) return null;
  const key = Buffer.from(hex, 'hex');
  if (key.length !== 32) {
    console.error('TOKEN_ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
    return null;
  }
  return key;
}

export function encryptToken(value: string | null | undefined): string | null {
  if (!value) return value ?? null;
  if (value.startsWith(PREFIX)) return value; // already encrypted
  const key = getKey();
  if (!key) return value; // no key configured — store plain (dev fallback)

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(value: string | null | undefined): string | null {
  if (!value) return value ?? null;
  if (!value.startsWith(PREFIX)) return value; // plain text (legacy or no key)
  const key = getKey();
  if (!key) return value;

  try {
    const [ivHex, tagHex, dataHex] = value.slice(PREFIX.length).split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
  } catch {
    console.error('Token decryption failed — token may be corrupted');
    return null;
  }
}

// Decrypts all OAuth token fields on a user object.
// Add new provider token fields here when integrating OneDrive, Box, etc.
export function decryptUserTokens<T extends {
  googleAccessToken?: string | null;
  googleRefreshToken?: string | null;
  dropboxAccessToken?: string | null;
  dropboxRefreshToken?: string | null;
}>(user: T): T {
  return {
    ...user,
    googleAccessToken: decryptToken(user.googleAccessToken),
    googleRefreshToken: decryptToken(user.googleRefreshToken),
    dropboxAccessToken: decryptToken(user.dropboxAccessToken),
    dropboxRefreshToken: decryptToken(user.dropboxRefreshToken),
  };
}
