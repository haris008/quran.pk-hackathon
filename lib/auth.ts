'use client';

const SESSION_KEY      = 'qf_session';
const CODE_VERIFIER_KEY = 'qf_pkce_verifier';

const CLIENT_ID    = process.env.NEXT_PUBLIC_QF_CLIENT_ID ?? 'aaf8af7e-f8c8-428b-9906-8abacf96cfb9';
const OAUTH_BASE   = 'https://prelive-oauth2.quran.foundation';
const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/auth/callback`
  : 'http://localhost:3000/auth/callback';

interface Session {
  accessToken: string;
  email: string;
}

/* ── PKCE helpers ── */

function randomBase64url(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sha256Base64url(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data    = encoder.encode(plain);
  const hash    = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/* ── Public API ── */

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function getUserToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

export function setSession(accessToken: string, email: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken, email }));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function loginWithPKCE(): Promise<void> {
  const verifier   = randomBase64url(64);
  const challenge  = await sha256Base64url(verifier);
  const state      = randomBase64url(16);

  sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id:             CLIENT_ID,
    redirect_uri:          REDIRECT_URI,
    response_type:         'code',
    scope:                 'openid offline_access',
    state,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${OAUTH_BASE}/oauth2/auth?${params}`;
}

export function getCodeVerifier(): string | null {
  return sessionStorage.getItem(CODE_VERIFIER_KEY);
}

export function clearCodeVerifier(): void {
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
}
