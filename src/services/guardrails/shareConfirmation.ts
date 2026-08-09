// ============================================================
// Share Confirmation Dialog
// Requires confirmation before sending data outside the app
// ============================================================

/** Returns a promise that resolves true if user confirms, false if cancelled */
export function confirmShare(destination: 'whatsapp' | 'email'): Promise<boolean> {
  const label = destination === 'whatsapp' ? 'WhatsApp' : 'Email';
  return new Promise((resolve) => {
    const confirmed = window.confirm(
      `📤 Share Confirmation\n\nThis will send information outside the app via ${label}.\n\nAre you sure you want to share?`
    );
    resolve(confirmed);
  });
}

/** Non-blocking version using a custom event (for React integration) */
export type ShareConfirmCallback = (confirmed: boolean) => void;

let pendingCallback: ShareConfirmCallback | null = null;

export function requestShareConfirmation(
  destination: 'whatsapp' | 'email',
  callback: ShareConfirmCallback
): void {
  pendingCallback = callback;
  window.dispatchEvent(new CustomEvent('explorer-share-confirm', {
    detail: { destination }
  }));
}

export function resolveShareConfirmation(confirmed: boolean): void {
  if (pendingCallback) {
    pendingCallback(confirmed);
    pendingCallback = null;
  }
}
