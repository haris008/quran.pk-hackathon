/**
 * Shared server-side helpers for fetching and caching QF OAuth2 tokens.
 * Import only from server components and API route handlers — never from client code.
 */

async function fetchClientCredentialsToken(
  oauthUrl: string,
  clientId: string,
  clientSecret: string,
  scope: string,
  cache: { value: string; expiresAt: number } | null,
): Promise<{ token: string; cache: { value: string; expiresAt: number } }> {
  if (cache && Date.now() < cache.expiresAt) {
    return { token: cache.value, cache };
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(oauthUrl, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QF OAuth token request failed: ${res.status} — ${body}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  const newCache = {
    value:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return { token: newCache.value, cache: newCache };
}

// ── Content API (production) ────────────────────────────────────────────────
const CONTENT_OAUTH_URL    = process.env.QF_OAUTH_URL     ?? 'https://oauth2.quran.foundation/oauth2/token';
const CONTENT_CLIENT_ID    = process.env.QF_CLIENT_ID     ?? '';
const CONTENT_CLIENT_SECRET = process.env.QF_CLIENT_SECRET ?? '';

export const QF_CLIENT_ID = CONTENT_CLIENT_ID;

let contentTokenCache: { value: string; expiresAt: number } | null = null;

export async function getQFToken(): Promise<string> {
  const result = await fetchClientCredentialsToken(
    CONTENT_OAUTH_URL, CONTENT_CLIENT_ID, CONTENT_CLIENT_SECRET, 'content', contentTokenCache,
  );
  contentTokenCache = result.cache;
  return result.token;
}

// ── User API (prelive) ──────────────────────────────────────────────────────
const USER_OAUTH_URL    = process.env.QF_USER_OAUTH_URL     ?? 'https://prelive-oauth2.quran.foundation/oauth2/token';
const USER_CLIENT_ID    = process.env.QF_USER_CLIENT_ID     ?? '';
const USER_CLIENT_SECRET = process.env.QF_USER_CLIENT_SECRET ?? '';

export const QF_USER_CLIENT_ID = USER_CLIENT_ID;

let userTokenCache: { value: string; expiresAt: number } | null = null;

export async function getQFUserToken(): Promise<string> {
  const result = await fetchClientCredentialsToken(
    USER_OAUTH_URL, USER_CLIENT_ID, USER_CLIENT_SECRET, 'reading_session bookmark streak', userTokenCache,
  );
  userTokenCache = result.cache;
  return result.token;
}
