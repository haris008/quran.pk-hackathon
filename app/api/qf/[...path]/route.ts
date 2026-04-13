import { type NextRequest, NextResponse } from 'next/server';
import { getQFToken, QF_CLIENT_ID } from '@/lib/qfToken';

// Keep default aligned with production content OAuth issuer.
const API_BASE = process.env.QF_API_BASE ?? 'https://apis.quran.foundation/content/api/v4';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const token    = await getQFToken();
    const upstream = `${API_BASE}/${params.path.join('/')}${req.nextUrl.search}`;

    const res = await fetch(upstream, {
      headers: {
        'x-auth-token': token,
        'x-client-id':  QF_CLIENT_ID,
        Accept:          'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    console.error('[/api/qf] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
