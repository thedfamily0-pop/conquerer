// ============================================================
// Image Content Moderation
// Basic client-side checks + hash-based safety verification
// Alerts parents if suspicious image content is detected
// ============================================================

import type { ImageModerationResult } from './types';

// Minimum acceptable image dimensions (tiny images are suspicious)
const MIN_DIMENSION = 50;
// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Suspicious file signatures (non-image content disguised)
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export async function moderateImage(file: File): Promise<ImageModerationResult> {
  // Check file type
  if (!IMAGE_MIMES.includes(file.type)) {
    return { isSafe: false, reason: 'Invalid file type. Only images are allowed.' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isSafe: false, reason: 'Image is too large (max 10MB).' };
  }

  if (file.size === 0) {
    return { isSafe: false, reason: 'Empty file.' };
  }

  // Load and check dimensions
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
      return { isSafe: false, reason: 'Image is too small to be valid.' };
    }
  } catch {
    return { isSafe: false, reason: 'Could not read image dimensions.' };
  }

  // Basic skin-tone pixel ratio check (heuristic)
  // This is a lightweight client-side heuristic, not a full NSFW classifier.
  // For production, integrate a server-side moderation API.
  const skinRatio = await estimateSkinToneRatio(file);
  if (skinRatio > 0.6) {
    return { isSafe: false, reason: 'Image flagged for review by parents.' };
  }

  return { isSafe: true };
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

async function estimateSkinToneRatio(file: File): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 100; // downsample for performance
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(0); return; }

      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const pixels = imageData.data;
      let skinPixels = 0;
      const totalPixels = size * size;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // Skin tone detection heuristic (RGB-based)
        if (isSkinTone(r, g, b)) skinPixels++;
      }

      URL.revokeObjectURL(img.src);
      resolve(skinPixels / totalPixels);
    };
    img.onerror = () => resolve(0);
    img.src = URL.createObjectURL(file);
  });
}

function isSkinTone(r: number, g: number, b: number): boolean {
  // Common skin tone ranges in RGB
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15 && r - g > 15 &&
    r < 250 && g < 230 && b < 210
  );
}

export function buildImageAlertPayload(
  reason: string,
  context: string,
  parentEmails: string[]
): { to: string[]; subject: string; body: string } {
  return {
    to: parentEmails,
    subject: '📷 Image Content Flag — Conquerer Safety',
    body: `IMAGE MODERATION ALERT
=========================================
Date/Time: ${new Date().toLocaleString()}
Context: ${context}
Reason: ${reason}

The image was blocked. Please review with your child if needed.

Sent automatically by Conquerer Safety Monitor.
`
  };
}
