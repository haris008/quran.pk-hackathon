import { type NextRequest, NextResponse } from 'next/server';

const BASE = 'https://api.alquran.cloud/v1';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = params;
  const qs = req.nextUrl.search;
  const upstream = `${BASE}/${path.join('/')}${qs}`;

  const res = await fetch(upstream, { next: { revalidate: 86400 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
