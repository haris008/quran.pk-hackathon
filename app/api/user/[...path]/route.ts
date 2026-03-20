import { type NextRequest, NextResponse } from 'next/server';
import { getQFToken, QF_CLIENT_ID } from '@/lib/qfToken';

const BASE = 'https://apis-prelive.quran.foundation/auth/v1';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const userToken = req.headers.get('x-user-token');
    const appToken  = await getQFToken();
    const authToken = userToken ?? appToken;

    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    const res = await fetch(upstream, {
      headers: {
        'x-auth-token': authToken,
        'x-client-id':  QF_CLIENT_ID,
        Accept:         'application/json',
      },
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
    const appToken  = await getQFToken();
    const authToken = userToken ?? appToken;

    const upstream = `${BASE}/${params.path.join('/')}`;
    const body     = await req.text();

    const res = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken,
        'x-client-id':  QF_CLIENT_ID,
        Accept:         'application/json',
      },
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
    const appToken  = await getQFToken();
    const authToken = userToken ?? appToken;

    const upstream = `${BASE}/${params.path.join('/')}${req.nextUrl.search}`;
    const body     = await req.text();

    const res = await fetch(upstream, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken,
        'x-client-id':  QF_CLIENT_ID,
        Accept:         'application/json',
      },
      ...(body ? { body } : {}),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
