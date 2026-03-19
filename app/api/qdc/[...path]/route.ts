import { type NextRequest, NextResponse } from 'next/server';
import { getQFToken, QF_CLIENT_ID } from '@/lib/qfToken';

const BASE = 'https://api.qurancdn.com/api/qdc';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = params;
  const qs = req.nextUrl.search;
  const upstream = `${BASE}/${path.join('/')}${qs}`;

  const res = await fetch(upstream, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://quran.com/',
      Origin: 'https://quran.com',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Use user token when provided, otherwise fall back to service account token
    const userToken  = req.headers.get('x-user-token');
    const appToken   = await getQFToken();
    const authToken  = userToken ?? appToken;

    const upstream = `${BASE}/${params.path.join('/')}`;
    const body     = await req.text();

    const res = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${authToken}`,
        'x-auth-token':  authToken,
        'x-client-id':   QF_CLIENT_ID,
        Accept:           'application/json',
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[/api/qdc POST] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const token    = await getQFToken();
    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    const body     = await req.text();

    const res = await fetch(upstream, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'x-client-id':  QF_CLIENT_ID,
        Accept:          'application/json',
      },
      ...(body ? { body } : {}),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[/api/qdc DELETE] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
