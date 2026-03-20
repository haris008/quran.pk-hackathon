# Bilingual Quran Radio

A Next.js 14 web app that streams the Quran verse-by-verse in a bilingual radio format:

1. Arabic recitation plays for an ayah.
2. Optional pause gap.
3. English translation is read aloud (Web Speech API TTS) with word-by-word highlighting.
4. Playback auto-advances to the next ayah.

Built for the Quran Foundation Hackathon using authenticated Quran Foundation Content and User APIs.

**Live demo:** https://quran-pk.netlify.app

## Features

- All 114 surahs with surah selector and search
- Bilingual playback engine (`Arabic → gap → English → next verse`)
- Word-by-word karaoke highlight during English TTS playback
- Play modes: `Both`, `Arabic only`, `English only`
- 5 reciter options (Mishary, AbdulBaset, Sudais, Hani Ar-Rifai, Maher)
- Dynamic English translation selection (from QF Translation API)
- Adjustable pause gap: `0s`, `0.5s`, `1s`, `2s`, `3s`
- Playback speed: `0.75×`, `1×`, `1.25×`, `1.5×`
- Active verse highlighting + auto-scroll into view
- Keyboard shortcuts: `Space` play/pause · `←` prev verse · `→` next verse
- Login with Quran.com (OAuth2 PKCE flow)
- Bookmark ayah to Quran Foundation account (or localStorage if not logged in)
- Reading session logged to Quran Foundation User API per verse and on surah complete
- Daily streak tracking synced to Quran Foundation Streak API (localStorage fallback)
- Resume from last position across sessions
- Surah complete modal with auto-advance countdown
- Media Session API for lock-screen / notification controls
- Mobile-responsive layout

## Quran Foundation API Usage

### Content APIs
| API | Endpoint | Used for |
|-----|----------|----------|
| Verse API | `GET /verses/by_chapter/{id}` | Arabic text + translations per surah |
| Audio API | `GET /recitations/{id}/by_chapter/{id}` | Arabic recitation audio file listing |
| Translation API | `GET /resources/translations` | Dynamic English translation options |

### User APIs
| API | Endpoint | Used for |
|-----|----------|----------|
| User Progress Tracking | `POST /auth/v1/reading-sessions` | Log verse and surah completion |
| Bookmarks | `POST /auth/v1/bookmarks` | Save/sync bookmarked ayahs |
| Streak Tracking | `POST /auth/v1/streaks` | Record daily reading streak |

All Content API calls go through a server-side Next.js proxy (`/api/qf`) that adds `x-auth-token` (OAuth2 client credentials) and `x-client-id` headers. User API calls go through `/api/user` and additionally forward the user's bearer token via `x-user-token` when logged in.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Quran Foundation Content API v4 (`apis.quran.foundation/content/api/v4`)
- Quran Foundation User API (`apis.quran.foundation/auth/v1`)
- Quran Foundation OAuth2 (`oauth2.quran.foundation`) — PKCE flow
- Web Speech API (browser TTS for English translation audio)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
QF_CLIENT_ID=your_client_id
QF_CLIENT_SECRET=your_client_secret
QF_OAUTH_URL=https://oauth2.quran.foundation/oauth2/token
QF_API_BASE=https://apis.quran.foundation/content/api/v4
QF_USER_API_BASE=https://apis.quran.foundation/auth/v1
NEXT_PUBLIC_QF_CLIENT_ID=your_client_id
```

3. Start development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Routes

- `/` — Surah selector with search and featured surahs
- `/player/[surahId]` — Bilingual player
- `/api/qf/[...path]` — Server proxy for QF Content API (adds auth headers)
- `/api/user/[...path]` — Server proxy for QF User API (forwards user token)
- `/api/auth/token` — OAuth2 authorization code exchange

## Auth Flow

The player works fully without login (localStorage fallback for bookmarks and streak).

- **Login** button initiates OAuth2 PKCE flow with scopes: `openid offline_access reading_session bookmark`
- On callback, access token is stored in `sessionStorage`
- Authenticated requests include `x-user-token` header through the `/api/user` proxy

## Deployment

Deployed on Netlify. Set all environment variables in the Netlify dashboard and add the OAuth redirect URI (`https://your-domain.netlify.app/auth/callback`) to your QF OAuth client.

## Hackathon Checklist

- [x] Bilingual playback loop (Arabic recitation → English TTS)
- [x] Word-by-word TTS highlighting (karaoke effect)
- [x] QF Verse API integration (authenticated)
- [x] QF Audio API integration (authenticated)
- [x] QF Translation API integration (dynamic list)
- [x] QF User Progress Tracking API (reading sessions per verse + surah)
- [x] QF Bookmarks API (with localStorage fallback)
- [x] QF Streak Tracking API (with localStorage fallback)
- [x] OAuth2 PKCE login with Quran Foundation
- [x] Mobile responsive layout
- [x] Keyboard shortcuts + Media Session API
- [x] Surah complete modal with auto-advance
- [x] Resume from last position
- [x] Deploy to Netlify
- [x] GitHub repository
- [ ] 2–3 minute demo video
