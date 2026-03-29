export const genId = () => crypto.getRandomValues(new Uint32Array(2)).reduce((a, b) => a + b.toString(36), '');

export const genCode = () => Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(36).toUpperCase().padStart(2, '0')).join('-');

export const today = () => new Date().toISOString().split('T')[0];

export const isExpired = (e) => e && new Date(e) < new Date();

export const isExpiringSoon = (e) => {
  if (!e) return false;
  const d = (new Date(e) - new Date()) / 86400000;
  return d >= 0 && d <= 3;
};

export async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'hs-salt-v1'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const lsGet = (k, fb) => {
  for (const key of [k, k.replace('hs-','fs-'), k.replace('fs-','hs-')]) {
    try { const v = localStorage.getItem(key); if (v !== null) return JSON.parse(v); } catch {}
  }
  return fb;
};

export const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
