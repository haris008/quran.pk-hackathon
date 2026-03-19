# Bilingual Quran Radio

Bilingual Quran Radio is a Next.js 14 web app that streams the Quran verse-by-verse in a radio style:

1. Arabic recitation plays for an ayah.
2. Optional pause gap.
3. English translation audio plays for the same ayah.
4. Playback auto-advances to the next ayah.

Built for the Quran Foundation Hackathon using Quran Foundation content APIs and user APIs.

## Features

- Surah selector with search (all 114 chapters)
- Bilingual playback engine (`Arabic -> gap -> English -> next verse`)
- Play modes: `both`, `arabic_only`, `translation_only`
- Reciter selection (Mishary, AbdulBaset, Sudais, Hani Ar-Rifai, Maher)
- Gap setting: `0s`, `0.5s`, `1s`, `2s`, `3s`
- Playback speed: `0.75x`, `1x`, `1.25x`
- Verse highlighting + scroll into view
- Keyboard shortcuts:
  - `Space`: play/pause
  - `Left`: previous verse
  - `Right`: next verse
- Bookmark ayah to Quran.com account (if logged in) or localStorage (if not logged in)
- Reading session logging to Quran.com when logged in
- Continue from last position (localStorage)
- Optional prompt to move to next Surah when complete
- Media Session integration for lock-screen controls

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Quran Foundation API v4 (`api.qurancdn.com`)
- QuranicAudio translation audio pattern (`Ibrahim_Walk_Alafasy`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_QURAN_API_BASE=https://api.qurancdn.com/api/qdc
NEXT_PUBLIC_QURAN_AUTH_URL=https://oauth2.quran.foundation
```

3. Start development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Routes

- `/` Home (Surah selector + featured Surahs)
- `/player/[surahId]` Main bilingual player
- `/api/verses` Proxy for chapter verse data
- `/api/audio` Proxy for recitation audio list

## Optional Login

- The player works fully without login.
- The `Login with Quran.com` button redirects to Quran Foundation OAuth.
- If a Quran access token is present, bookmarks use Quran User API.
- If not logged in, bookmarks are saved in localStorage.
- For full account login/sync, you can optionally set `NEXT_PUBLIC_OAUTH_CLIENT_ID` and `NEXT_PUBLIC_OAUTH_REDIRECT_URI`.

## Hackathon Checklist

- [x] Bilingual playback loop implemented
- [x] Reciter selector implemented
- [x] Pause gap controls implemented
- [x] Verse highlighting + auto-scroll
- [x] Optional login flow
- [x] Bookmark API + localStorage fallback
- [x] Mobile responsive layout
- [x] Audio error handling (`onerror`/skip)
- [ ] Deploy to Vercel
- [ ] Add public GitHub repository link
- [ ] Record 2-3 minute demo video

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import project in Vercel.
3. Add the same environment variables in Vercel project settings.
4. Redeploy.

## Test Surahs

For quick manual QA, test:

- Al-Fatiha (1)
- Al-Ikhlas (112)
- Al-Falaq (113)
- An-Nas (114)
- Al-Kahf (18)
- Ya-Sin (36)
- Al-Mulk (67)
