# Bilingual Quran Radio

> Listen to the entire Quran like a podcast — Arabic recitation, then your language's translation, verse by verse, automatically.

**Live demo:** https://quran-pk.netlify.app

Built for the [Quran Foundation Hackathon](https://launch.provisioncapital.com/quran-hackathon) using the official Quran Foundation Content and User APIs.

---

## What it does

Most Quran apps require you to sit down and actively read. Bilingual Quran Radio lets you **passively absorb** the Quran — put it on while commuting, cooking, or winding down.

For each verse:
1. Arabic recitation plays (authentic audio from the Quran Foundation CDN)
2. Short pause
3. English translation is read aloud with **word-by-word highlighting**
4. Auto-advances to the next verse

Every one of the 114 surahs. 200+ translations. 5 world-renowned reciters.

---

## Why Trust Us? — And a Recommendation for Quran.com

When I started building this app, my first question was: *can I trust quran.com?* Is this a legitimate platform, or just another random website claiming to serve the Quran?

I had to do my own research to find the answer. Most users won't — they'll simply leave.

Quran.com serves **millions of Muslims daily**, yet a first-time visitor has no immediate reason to trust it. This is a missed opportunity for impact at scale. My recommendation to the Quran Foundation:

- **Seek certifications from major Islamic institutions** — Al-Azhar University, the Islamic University of Madinah, Dar al-Ulum Deoband. A formal endorsement from any of these would instantly signal legitimacy to hundreds of millions of Muslims worldwide and dramatically increase trust, retention, and word-of-mouth.

- **Feature recommendation videos from renowned scholars** — A short video from a recognized Sheikh saying "I use quran.com and I trust it" carries more weight than any disclaimer or badge.

- **Tell users who the reciters actually are** — Most visitors have no idea that Sheikh Abdul Rahman Al-Sudais is not just a reciter on the internet — he is the **Imam and President of Masjid al-Haram**, the Grand Mosque in Makkah, the holiest site in Islam. That single fact transforms how a user perceives every word they are listening to. These credentials should be prominently displayed, not hidden.

This is the gap this app's [/about](https://quran-pk.netlify.app/about) page is designed to address — and what I believe quran.com should build at scale to unlock its true impact on the global Muslim community.

---

## Features

- All 114 surahs with search and featured highlights
- Bilingual playback engine (`Arabic → gap → English → next verse`)
- Word-by-word karaoke highlight during English TTS
- Play modes: `Both`, `Arabic only`, `English only`
- 5 reciter options
- 200+ translation options (dynamic from QF API)
- Adjustable pause gap and playback speed
- Login with Quran.com account (OAuth2 PKCE)
- Bookmark any ayah — synced to your Quran Foundation account
- Tap a bookmark to jump directly to that ayah and start playing from there
- Daily reading streak tracked via Quran Foundation Streak API
- Resume from last position across sessions
- Keyboard shortcuts: `Space` play/pause · `←` prev · `→` next
- Lock-screen / notification controls (Media Session API)
- Mobile responsive

---

## Quran Foundation API Usage

### Content APIs
| API | Endpoint | Purpose |
|-----|----------|---------|
| Verses API | `GET /verses/by_chapter/{id}` | Arabic text + translations |
| Audio API | `GET /recitations/{id}/by_chapter/{id}` | Recitation audio URLs |
| Translations API | `GET /resources/translations` | 200+ translation options |
| Chapters API | `GET /chapters` | Surah list and metadata |

### User APIs
| API | Endpoint | Purpose |
|-----|----------|---------|
| Reading Sessions | `POST /auth/v1/reading-sessions` | Log verse and surah completion |
| Bookmarks | `POST /auth/v1/bookmarks` | Save/sync bookmarked ayahs |
| Streak Tracking | `POST /auth/v1/streaks` | Daily reading streak |

All API calls go through server-side Next.js proxy routes (`/api/qf` and `/api/user`) to keep credentials secure and never exposed to the browser.

---

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS**
- **Web Speech API** — browser TTS for English translation audio
- **QCF Mushaf Fonts** — same authentic Mushaf calligraphy as quran.com (604 per-page fonts)
- **Quran Foundation Content API v4** — verses, audio, translations, chapters
- **Quran Foundation User API** — reading sessions, bookmarks, streaks
- **Quran Foundation OAuth2** — PKCE login flow

---

## Local Setup

1. Clone and install:

```bash
git clone <repo-url>
cd bilingual-quran-radio
npm install
```

2. Create `.env.local`:

```env
# Content API
QF_CLIENT_ID=your_client_id
QF_CLIENT_SECRET=your_client_secret
QF_OAUTH_URL=https://oauth2.quran.foundation/oauth2/token
QF_API_BASE=https://apis.quran.foundation/content/api/v4

# User API
QF_USER_CLIENT_ID=your_user_client_id
QF_USER_CLIENT_SECRET=your_user_client_secret
QF_USER_OAUTH_URL=https://prelive-oauth2.quran.foundation/oauth2/token
QF_USER_API_BASE=https://apis-prelive.quran.foundation/auth/v1

# Browser (PKCE login)
NEXT_PUBLIC_QF_USER_CLIENT_ID=your_user_client_id
NEXT_PUBLIC_QF_OAUTH_BASE=https://prelive-oauth2.quran.foundation
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
```

3. Run:

```bash
npm run dev
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Surah selector grid |
| `/player/[surahId]` | Bilingual player |
| `/about` | Trust & authenticity page |
| `/auth/callback` | OAuth2 PKCE callback |
| `/api/qf/[...path]` | Content API proxy |
| `/api/user/[...path]` | User API proxy |

---

## Auth

The app works fully without login — bookmarks and streak fall back to `localStorage`.

Login initiates an OAuth2 PKCE flow with the Quran Foundation. The access token is stored in `localStorage` and forwarded to the User API via the server-side proxy.
