import { type NextRequest, NextResponse } from 'next/server';
import { getQFUserToken, QF_USER_CLIENT_ID } from '@/lib/qfToken';

const BASE = process.env.QF_USER_API_BASE ?? 'https://apis.quran.foundation/auth/v1';

function authHeaders(userToken: string | null, appToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    'x-client-id': QF_USER_CLIENT_ID,
    Accept:        'application/json',
  };
  if (userToken) {
    // User actions: user Bearer token is sufficient; skip app token to avoid context conflict
    headers['Authorization'] = `Bearer ${userToken}`;
  } else {
    headers['x-auth-token'] = appToken;
  }
  return headers;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const userToken = req.headers.get('x-user-token');
    const appToken  = await getQFUserToken();

    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    const res = await fetch(upstream, {
      headers: authHeaders(userToken, appToken),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const userToken = req.headers.get('x-user-token');
    const appToken  = await getQFUserToken();

    const upstream = `${BASE}/${params.path.join('/')}`;
    const body     = await req.text();

    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(userToken, appToken) },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const userToken = req.headers.get('x-user-token');
    const appToken  = await getQFUserToken();

    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    const body     = await req.text();

    const res = await fetch(upstream, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders(userToken, appToken) },
      ...(body ? { body } : {}),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
