/**
 * EXIF Metadata Scrubber
 * Renders an uploaded image file onto an isolated HTML5 Canvas to completely strip 
 * all EXIF camera metadata, GPS location coordinates, and timestamps before AI processing.
 */

export interface ScrubbedImageResult {
  cleanDataUrl: string;
  cleanBlob: Blob;
  originalName: string;
  metadataRemoved: boolean;
}

export async function scrubExifMetadata(file: File): Promise<ScrubbedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an isolated canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Draw image onto canvas to strip EXIF headers
        ctx.drawImage(img, 0, 0);

        // Convert canvas back to clean JPEG data URL & Blob
        const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                cleanDataUrl,
                cleanBlob: blob,
                originalName: file.name,
                metadataRemoved: true
              });
            } else {
              reject(new Error('Failed to generate scrubbed blob'));
            }
          },
          'image/jpeg',
          0.92
        );
      };

      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}
