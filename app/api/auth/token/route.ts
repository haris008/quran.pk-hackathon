import { type NextRequest, NextResponse } from 'next/server';

const OAUTH_TOKEN_URL = process.env.QF_USER_OAUTH_URL ?? 'https://prelive-oauth2.quran.foundation/oauth2/token';
const CLIENT_ID       = process.env.QF_USER_CLIENT_ID     ?? '';
const CLIENT_SECRET   = process.env.QF_USER_CLIENT_SECRET ?? '';

export async function POST(req: NextRequest) {
  try {
    const { code, codeVerifier, redirectUri } = await req.json() as {
      code: string;
      codeVerifier: string;
      redirectUri: string;
    };

    // Always send client_id in Basic auth (empty secret for public PKCE clients)
    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const headers: Record<string, string> = {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    };

    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri:  redirectUri,
      client_id:     CLIENT_ID,
    });

    const res = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[auth/token] OAuth error', res.status, JSON.stringify(data));
      return NextResponse.json({ error: data }, { status: res.status });
    }

    /* Try to extract email from id_token or access_token (both may be JWTs) */
    let email = 'User';
    const jwt = (data.id_token ?? data.access_token) as string | undefined;
    try {
      const payload = JSON.parse(
        Buffer.from(jwt!.split('.')[1], 'base64url').toString()
      ) as { email?: string; sub?: string };
      email = payload.email ?? payload.sub ?? 'User';
    } catch { /* leave as 'User' */ }

    return NextResponse.json({
      accessToken: data.access_token as string,
      email,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
