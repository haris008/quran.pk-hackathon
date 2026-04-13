import { type NextRequest, NextResponse } from 'next/server';
import { getQFUserToken, QF_USER_CLIENT_ID } from '@/lib/qfToken';

// User-authenticated flows in this project target prelive by default.
const BASE = process.env.QF_USER_API_BASE ?? 'https://apis-prelive.quran.foundation/auth/v1';
const DEBUG_USER_PROXY = process.env.DEBUG_QF_USER_PROXY === '1';

function logDebug(event: string, meta: Record<string, unknown>): void {
  if (!DEBUG_USER_PROXY) return;
  console.log(`[api/user] ${event}`, meta);
}

function summarizeBody(body: string): unknown {
  if (!body) return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return { raw: body.slice(0, 300) };
  }
}

async function parseUpstreamResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text.slice(0, 500) };
  }
}

function authHeaders(userToken: string | null, appToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'x-client-id': QF_USER_CLIENT_ID,
    Accept:        'application/json',
  };
  if (userToken) {
    // Per User API docs, JWT access token is sent as x-auth-token.
    headers['x-auth-token'] = userToken;
  } else if (appToken) {
    headers['x-auth-token'] = appToken;
  }
  return headers;
}

function forwardedHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  const timezone = req.headers.get('x-timezone');
  if (timezone) {
    headers['x-timezone'] = timezone;
  }

  return headers;
}

function toClientResponse(upstream: Response, data: unknown): NextResponse {
  const response = NextResponse.json(data, { status: upstream.status });
  const mutationAt = upstream.headers.get('x-mutation-at');
  if (mutationAt) {
    try {
      response.headers.set('x-mutation-at', mutationAt);
    } catch {
      logDebug('header_copy_failed', { name: 'x-mutation-at', value: mutationAt });
    }
  }
  const lastModified = upstream.headers.get('last-modified');
  if (lastModified) {
    try {
      response.headers.set('last-modified', lastModified);
    } catch {
      logDebug('header_copy_failed', { name: 'last-modified', value: lastModified });
    }
  }
  return response;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const userToken = req.headers.get('x-user-token');
    const appToken  = userToken ? undefined : await getQFUserToken();

    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    logDebug('request', {
      method: 'GET',
      upstream,
      hasUserToken: Boolean(userToken),
      authMode: userToken ? 'user_x_auth_token' : 'app_x_auth_token',
    });

    const res = await fetch(upstream, {
      headers: { ...authHeaders(userToken, appToken), ...forwardedHeaders(req) },
    });

    const data = await parseUpstreamResponse(res);
    logDebug('response', {
      method: 'GET',
      upstream,
      status: res.status,
      ok: res.ok,
      payload: data,
    });
    return toClientResponse(res, data);
  } catch (err) {
    logDebug('error', {
      method: 'GET',
      error: String(err),
    });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const userToken = req.headers.get('x-user-token');
    const appToken  = userToken ? undefined : await getQFUserToken();

    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    const body     = await req.text();
    logDebug('request', {
      method: 'POST',
      upstream,
      hasUserToken: Boolean(userToken),
      authMode: userToken ? 'user_x_auth_token' : 'app_x_auth_token',
      body: summarizeBody(body),
    });

    const res = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(userToken, appToken),
        ...forwardedHeaders(req),
      },
      body,
    });

    const data = await parseUpstreamResponse(res);
    logDebug('response', {
      method: 'POST',
      upstream,
      status: res.status,
      ok: res.ok,
      payload: data,
    });
    return toClientResponse(res, data);
  } catch (err) {
    logDebug('error', {
      method: 'POST',
      error: String(err),
    });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const userToken = req.headers.get('x-user-token');
    const appToken  = userToken ? undefined : await getQFUserToken();

    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    const body     = await req.text();
    logDebug('request', {
      method: 'DELETE',
      upstream,
      hasUserToken: Boolean(userToken),
      authMode: userToken ? 'user_x_auth_token' : 'app_x_auth_token',
      body: summarizeBody(body),
    });

    const res = await fetch(upstream, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(userToken, appToken),
        ...forwardedHeaders(req),
      },
      ...(body ? { body } : {}),
    });

    const data = await parseUpstreamResponse(res);
    logDebug('response', {
      method: 'DELETE',
      upstream,
      status: res.status,
      ok: res.ok,
      payload: data,
    });
    return toClientResponse(res, data);
  } catch (err) {
    logDebug('error', {
      method: 'DELETE',
      error: String(err),
    });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
