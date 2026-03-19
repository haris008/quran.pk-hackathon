/**
 * Shared server-side helper for fetching and caching the Quran Foundation
 * prelive OAuth2 client-credentials token. Import only from server components
 * and API route handlers — never from client code.
 */

const OAUTH_URL    = process.env.QF_OAUTH_URL    ?? 'https://prelive-oauth2.quran.foundation/oauth2/token';
const CLIENT_ID    = process.env.QF_CLIENT_ID    ?? '';
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? '';

export const QF_CLIENT_ID = CLIENT_ID;

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getQFToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'content' }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QF OAuth token request failed: ${res.status} — ${body}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = {
    value:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}
