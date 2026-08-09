// ============================================================
// Input Scanner: URL Detection & PII Leakage Detection
// Scans child text for links and personal information
// ============================================================

import type { URLDetectionResult, PIIDetectionResult } from './types';

// URL detection regex
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(com|org|net|co\.za|io|me|app)\b/gi;

export function detectURLs(text: string): URLDetectionResult {
  const matches = text.match(URL_REGEX) || [];
  return {
    hasURLs: matches.length > 0,
    urls: matches,
  };
}

// PII detection patterns
const PHONE_REGEX = /(\+?27|0)\s*\d{2}\s*\d{3}\s*\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SA_ID_REGEX = /\b\d{13}\b/g;
// Address patterns (street number + street name)
const ADDRESS_REGEX = /\b\d{1,5}\s+[A-Z][a-z]+\s+(street|road|avenue|drive|lane|crescent|close|way)\b/i;
// Full name patterns (2+ capitalized words in sequence, min 3 chars each)
const NAME_REGEX = /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(\s+[A-Z][a-z]{2,})?\b/g;

export function detectPII(text: string): PIIDetectionResult {
  const types: PIIDetectionResult['types'] = [];
  
  if (PHONE_REGEX.test(text)) types.push('phone');
  PHONE_REGEX.lastIndex = 0;
  
  if (EMAIL_REGEX.test(text)) types.push('email');
  EMAIL_REGEX.lastIndex = 0;
  
  if (SA_ID_REGEX.test(text)) types.push('idNumber');
  SA_ID_REGEX.lastIndex = 0;
  
  if (ADDRESS_REGEX.test(text)) types.push('address');
  ADDRESS_REGEX.lastIndex = 0;

  // Name detection: only flag if 3+ words and looks like a full name
  const nameMatches = text.match(NAME_REGEX);
  if (nameMatches && nameMatches.some(m => m.split(/\s+/).length >= 3)) {
    types.push('fullName');
  }

  if (types.length === 0) {
    return { hasPII: false, types: [], message: '' };
  }

  const typeLabels: Record<string, string> = {
    phone: 'phone number',
    email: 'email address',
    address: 'home address',
    fullName: 'full name',
    idNumber: 'ID number',
  };

  const detected = types.map(t => typeLabels[t]).join(', ');
  return {
    hasPII: true,
    types,
    message: `Personal information detected (${detected}). Let us keep private details out of chats.`,
  };
}

/** Build parent alert payload for URL or PII detection */
export function buildInputAlertPayload(
  type: 'url' | 'pii',
  details: string,
  childInput: string,
  parentEmails: string[]
): { to: string[]; subject: string; body: string } {
  const isUrl = type === 'url';
  return {
    to: parentEmails,
    subject: isUrl
      ? '🔗 Link Detected — Conquerer Input Monitor'
      : '⚠️ Personal Info Detected — Conquerer Safety',
    body: `${isUrl ? 'URL/LINK' : 'PERSONAL INFORMATION'} DETECTION ALERT
=========================================
Date/Time: ${new Date().toLocaleString()}
Type: ${isUrl ? 'URL/Link shared' : 'PII detected'}
Details: ${details}
Child Input: "${childInput.slice(0, 200)}"

${isUrl ? 'The link was allowed but logged for your awareness.' : 'The message was allowed but flagged for your review.'}

Sent automatically by Conquerer Safety Monitor.
`
  };
}
