import { type NextRequest, NextResponse } from 'next/server';

/* Proxy for Google Translate TTS — avoids CORS and works for 100+ languages.
   /api/tts?text=Hello+world&lang=en */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') ?? '';
  const lang = req.nextUrl.searchParams.get('lang') ?? 'en';

  if (!text.trim()) {
    return new NextResponse('Missing text', { status: 400 });
  }

  const url = new URL('https://translate.google.com/translate_tts');
  url.searchParams.set('ie', 'UTF-8');
  url.searchParams.set('q', text);
  url.searchParams.set('tl', lang);
  url.searchParams.set('client', 'tw-ob');
  url.searchParams.set('ttsspeed', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
    },
  });

  if (!res.ok) {
    return new NextResponse('TTS upstream error', { status: res.status });
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
