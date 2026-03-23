# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (runs typecheck first via tsc)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit (run this before committing)
```

No test suite exists — verify changes manually in the browser and by running `typecheck`.

## Architecture

This is a **Next.js 14 App Router** app with no external state library. All state lives in React hooks.

### Data Flow

```
Browser → /api/qf/* proxy → QF Content API (apis.quran.foundation)
Browser → /api/user/* proxy → QF User API (apis-prelive.quran.foundation/auth/v1)
Browser → /api/auth/token → prelive OAuth2 token exchange
```

All QF API calls go through server-side proxies (never direct from browser) to keep credentials secret.

### Key Abstractions

**`lib/quranApi.ts`** — All Content API calls. Uses `/api/qf` as base. Caches chapters/translations at module level. `loadBilingualSurah()` is the main entry point that combines verses + audio URLs into `Verse[]`. `stripHtml()` removes `<sup>` footnotes entirely (including content) before they reach the UI.

**`hooks/useSurahData.ts`** — Orchestrates loading: chapters/translations/recitations on mount, then verses on surah selection. Has retry logic for cold-start (waits 1.2s and retries if translation comes back empty). Default translation ID is `20` (Saheeh International).

**`hooks/usePlayer.ts`** — The core engine (~515 lines). Runs a `runPlaybackLoop` async function that steps through `Verse[]` playing Arabic HTML audio → pause gap → English Web Speech API TTS → repeat. Exposes `activeWordIndex` (tracked via `utterance.onboundary`) for word-by-word highlighting. Call `play()` to start from current index or `seekToVerse(n)` to jump.

**`components/VerseCard.tsx`** — Displays one verse. Accepts `activeWordIndex` prop; when set, renders `englishText` split into `<span>` elements with highlight on the active word. When `verse.qpcText` + `verse.pageNumber` are present, renders Arabic with the QCF page font (see below) for authentic Mushaf quality.

**`lib/qcfFont.ts`** — Dynamically injects `@font-face` rules for QCF (Quran Complex Font) per-Mushaf-page fonts. quran.com uses `p{n}-v1` fonts (e.g. `p1-v1` for Mushaf page 1) served from `/fonts/quran/hafs/v1/woff2/p{n}.woff2`. All 604 page fonts are bundled in `/public/fonts/quran/hafs/v1/woff2/`. The `text_qpc_hafs` field from the verses API contains the correct Unicode encoding for these fonts. Using QCF fonts produces the same thick, Mushaf-quality calligraphic rendering as quran.com.

### Authentication (Split Environment)

- **Content API**: Production credentials (`QF_CLIENT_ID` / `QF_CLIENT_SECRET`), OAuth client-credentials flow, token cached in `lib/qfToken.ts`
- **User API + Login**: Prelive credentials (`QF_USER_CLIENT_ID` / `QF_USER_CLIENT_SECRET`), PKCE flow via `prelive-oauth2.quran.foundation` with scopes `reading_session bookmark` (production OAuth server rejects all scopes for this client)
- User token stored in `localStorage` via `lib/auth.ts` helpers (`getSession/setSession/clearSession`)
- User token forwarded to `/api/user/*` via `x-user-token` request header

### User API Calls (fire-and-forget, only when logged in)

- **Reading sessions** — POSTed in `app/player/[surahId]/page.tsx` `onVerseCompleted` and `onSurahComplete` callbacks. Guarded by `if (!token) return`.
- **Bookmarks** — `lib/bookmarks.ts` syncs to `/api/user/bookmarks`. Payload: `{ key: surahNumber, type: 'ayah', verseNumber, mushaf: 1 }`.
- **Streaks** — `lib/streak.ts` syncs to `/api/user/streaks`. Local `localStorage` tracking with fire-and-forget remote sync.

### Environment Variables

Server-only (no `NEXT_PUBLIC_` prefix):
- `QF_CLIENT_ID`, `QF_CLIENT_SECRET`, `QF_OAUTH_URL`, `QF_API_BASE` — Content API
- `QF_USER_CLIENT_ID`, `QF_USER_CLIENT_SECRET`, `QF_USER_OAUTH_URL`, `QF_USER_API_BASE` — User API (prelive)

Browser-accessible:
- `NEXT_PUBLIC_QF_USER_CLIENT_ID` — Used in PKCE login initiation
- `NEXT_PUBLIC_QF_OAUTH_BASE` — OAuth base URL for PKCE redirect

### Safari / Web Speech API

`speechSynthesis.speak()` in Safari requires synchronous invocation from a user gesture. `usePlayer.ts` unlocks TTS by calling `speak/cancel` synchronously on the first play button click, before the async playback loop starts. The `onboundary` event (word highlighting) is not supported in Safari — the code degrades gracefully.

### Supported Reciter IDs

Hardcoded in `lib/audioUtils.ts`: `[7, 1, 3, 9, 12]` (Afasy, AbdulBaset, Sudais, Hani Ar-Rifai, Maher Al Muaiqly). Audio files come from `audio.qurancdn.com` CDN.

### Route Structure

| Route | Purpose |
|---|---|
| `/` | Surah selector grid |
| `/player/[surahId]` | Bilingual player |
| `/auth/callback` | OAuth2 PKCE callback (must be in Suspense) |
| `/api/qf/[...path]` | Content API proxy |
| `/api/user/[...path]` | User API proxy (GET/POST/DELETE) |
| `/api/auth/token` | OAuth authorization code exchange |
