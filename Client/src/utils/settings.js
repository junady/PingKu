// Utilitas manajemen konfigurasi aplikasi PingKu dengan persistensi localStorage

export function isVercelOrPublicDeployment() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.includes('vercel.app') || host.includes('netlify.app') || host.includes('github.io') || (window.location.port === '' && host !== 'localhost');
}

export const DEFAULT_SETTINGS = {
  backendUrl: isVercelOrPublicDeployment() ? '' : 'http://localhost:8080',
  wsUrl: isVercelOrPublicDeployment() ? '' : 'ws://localhost:8080/ws',
  dnsResolver: '1.1.1.1',
  port: 53,
  intervalSec: 2,
  probeMethod: 'ICMP / TCP',
};

const SETTINGS_KEY = 'pingku_app_settings';

export function getAppSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Jika di Vercel tapi localStorage menyimpan localhost:8080, otomatis sesuaikan ke relative path
      if (isVercelOrPublicDeployment() && parsed.backendUrl === 'http://localhost:8080') {
        parsed.backendUrl = '';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('[PingKu] Gagal membaca settings dari localStorage:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveAppSettings(newSettings) {
  if (typeof window === 'undefined') return false;
  try {
    const current = getAppSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('pingku_settings_changed', { detail: merged }));
    return true;
  } catch (err) {
    console.error('[PingKu] Gagal menyimpan settings ke localStorage:', err);
    return false;
  }
}

export function resetAppSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    localStorage.removeItem(SETTINGS_KEY);
    window.dispatchEvent(new CustomEvent('pingku_settings_changed', { detail: DEFAULT_SETTINGS }));
    return { ...DEFAULT_SETTINGS };
  } catch (err) {
    console.error('[PingKu] Gagal reset settings:', err);
    return { ...DEFAULT_SETTINGS };
  }
}
