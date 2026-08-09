// ============================================================
// Backup Encryption
// Encrypts diary entries and chat history for Supabase sync
// Uses Web Crypto API with AES-GCM, key derived from parent PIN
// ============================================================

const SALT_KEY = 'explorer_encryption_salt_v1';

/** Derive an AES-GCM key from a passphrase (parent PIN or passphrase) */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function getSalt(): Uint8Array {
  const stored = localStorage.getItem(SALT_KEY);
  if (stored) return new Uint8Array(JSON.parse(stored));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)));
  return salt;
}

/** Encrypt a string using AES-GCM with the parent's passphrase */
export async function encryptData(plaintext: string, passphrase: string): Promise<string> {
  const salt = getSalt();
  const key = await deriveKey(passphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  // Combine IV + ciphertext and base64 encode
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/** Decrypt a string using AES-GCM with the parent's passphrase */
export async function decryptData(encrypted: string, passphrase: string): Promise<string> {
  const salt = getSalt();
  const key = await deriveKey(passphrase, salt);

  const combined = new Uint8Array(
    atob(encrypted).split('').map(c => c.charCodeAt(0))
  );

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plainBuffer);
}

/** Encrypt sensitive data before Supabase sync */
export async function encryptForSync(
  data: object,
  passphrase: string
): Promise<string> {
  return encryptData(JSON.stringify(data), passphrase);
}

/** Decrypt data received from Supabase */
export async function decryptFromSync<T>(
  encrypted: string,
  passphrase: string
): Promise<T> {
  const json = await decryptData(encrypted, passphrase);
  return JSON.parse(json) as T;
}
