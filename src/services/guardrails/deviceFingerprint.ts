// ============================================================
// Device Fingerprinting & Login Alerts
// Detects new device access and notifies parents
// ============================================================

const KNOWN_DEVICES_KEY = 'explorer_known_devices_v1';

export interface DeviceInfo {
  fingerprint: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  firstSeen: string;
  lastSeen: string;
}

/** Generate a simple device fingerprint from browser properties */
export function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.hardwareConcurrency?.toString() || 'unknown',
    navigator.platform || 'unknown',
  ];
  // Simple hash
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/** Check if this is a new/unknown device */
export function checkDeviceAccess(): { isNewDevice: boolean; deviceInfo: DeviceInfo } {
  const fingerprint = generateFingerprint();
  const knownDevices = getKnownDevices();
  const now = new Date().toISOString();

  const deviceInfo: DeviceInfo = {
    fingerprint,
    userAgent: navigator.userAgent.slice(0, 100),
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    firstSeen: now,
    lastSeen: now,
  };

  const existing = knownDevices.find(d => d.fingerprint === fingerprint);
  if (existing) {
    existing.lastSeen = now;
    saveKnownDevices(knownDevices);
    return { isNewDevice: false, deviceInfo: existing };
  }

  // New device
  knownDevices.push(deviceInfo);
  saveKnownDevices(knownDevices);
  return { isNewDevice: true, deviceInfo };
}

function getKnownDevices(): DeviceInfo[] {
  try {
    return JSON.parse(localStorage.getItem(KNOWN_DEVICES_KEY) || '[]');
  } catch { return []; }
}

function saveKnownDevices(devices: DeviceInfo[]): void {
  localStorage.setItem(KNOWN_DEVICES_KEY, JSON.stringify(devices.slice(-10)));
}

export function buildNewDeviceAlert(
  deviceInfo: DeviceInfo,
  parentEmails: string[]
): { to: string[]; subject: string; body: string } {
  return {
    to: parentEmails,
    subject: '📱 New Device Detected — Conquerer Security',
    body: `NEW DEVICE ACCESS ALERT
=========================================
Date/Time: ${new Date().toLocaleString()}
Device: ${deviceInfo.userAgent}
Screen: ${deviceInfo.screenResolution}
Timezone: ${deviceInfo.timezone}
Language: ${deviceInfo.language}

The Conquerer app was accessed from a previously unrecognized device.
If this was not expected, please review device access and update your PIN.

Sent automatically by Conquerer Security.
`
  };
}
