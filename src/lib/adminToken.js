// Web Crypto API - works in both Edge Runtime (middleware) and Node.js (API routes)
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

async function hmacHex(message, key) {
    const enc = new TextEncoder();
    const cryptoKey = await globalThis.crypto.subtle.importKey(
        'raw',
        enc.encode(key),
        {name: 'HMAC', hash: 'SHA-256'},
        false,
        ['sign'],
    );
    const sig = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
    return Array.from(new Uint8Array(sig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    const aBytes = new TextEncoder().encode(a);
    const bBytes = new TextEncoder().encode(b);
    let diff = 0;
    for (let i = 0; i < aBytes.length; i++) {
        diff |= aBytes[i] ^ bBytes[i];
    }
    return diff === 0;
}

export async function generateAdminToken(password) {
    const ts = Date.now().toString();
    const sig = await hmacHex(ts, password);
    return `${ts}.${sig}`;
}

export async function verifyAdminToken(token, password) {
    if (!token || !password) return false;
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;
    const ts = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);

    const issuedAt = parseInt(ts, 10);
    if (isNaN(issuedAt) || Date.now() - issuedAt > SESSION_DURATION_MS) return false;

    const expected = await hmacHex(ts, password);
    return timingSafeEqual(sig, expected);
}
