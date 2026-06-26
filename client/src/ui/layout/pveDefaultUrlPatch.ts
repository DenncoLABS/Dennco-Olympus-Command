const BOOT_KEY = '__olympusPveDefaultUrlReady';
const PVE_URL_KEY = 'olympus.service.proxmox.url';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function defaultPveUrl() {
  const host = window.location.hostname || '127.0.0.1';
  return `https://${host}:8006`;
}

function ensurePveUrl() {
  if (!localStorage.getItem(PVE_URL_KEY)) {
    localStorage.setItem(PVE_URL_KEY, defaultPveUrl());
  }
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    ensurePveUrl();
    window.addEventListener('focus', ensurePveUrl);
    window.addEventListener('storage', ensurePveUrl);
  }
}
