You are building "Bilingual Quran Radio" — a hackathon project 
to WIN the Quran Foundation Hackathon ($3,000 first prize).

Forget everything in the current codebase. 
DELETE all existing files and rebuild from scratch.
Build this to the highest quality possible.

═══════════════════════════════════════════════════
HACKATHON CONTEXT — READ THIS FIRST
═══════════════════════════════════════════════════
Event: Quran Foundation Hackathon by Provision Capital
Deadline: April 20, 2026
Prize: $3,000 first place

Judging criteria (100 points total):
  30pts — Impact on Quran engagement
  20pts — Product Quality & UX
  20pts — Technical Execution
  15pts — Innovation & Creativity
  15pts — Effective use of Quran Foundation APIs

The hackathon theme:
  "Millions reconnect with the Quran in Ramadan but struggle 
   to maintain that connection afterwards."

This app solves that by letting people listen to the Quran 
with translation while commuting, driving, cooking — 
building a daily habit without needing to sit and read.

Every design and feature decision must serve one goal:
MAXIMUM IMPACT SCORE FROM JUDGES.

═══════════════════════════════════════════════════
TECH STACK
═══════════════════════════════════════════════════
- Next.js 14 App Router + TypeScript
- Tailwind CSS (utility classes only, no custom CSS files)
- Google Fonts: Amiri (Arabic) + Inter (UI)
- No backend, no database, no auth required
- Deploy to Vercel

═══════════════════════════════════════════════════
WHAT THE APP DOES
═══════════════════════════════════════════════════
Core feature — bilingual audio playback:
  1. User selects any Surah (1–114)
  2. User selects a Reciter (5 options)
  3. User selects Translation Language (50+ languages)
  4. User presses Play
  5. App plays verse by verse:
     Arabic audio → [gap] → Translation text shown → next verse
  6. Continues automatically like a radio stream
  7. User can commute and listen hands-free

This is the ONLY app in the world that does this 
using the Quran Foundation API with multilingual support.

═══════════════════════════════════════════════════
ALL APIs — VERIFIED AND FREE, NO KEY NEEDED
═══════════════════════════════════════════════════

BASE: https://api.qurancdn.com/api/qdc

── 1. ALL CHAPTERS ──
GET /chapters?language=en
Returns 114 chapters with:
  id, name_simple, name_arabic, name_complex,
  verses_count, revelation_place, translated_name

── 2. ALL AVAILABLE TRANSLATIONS (50+ languages) ──
GET /resources/translations?language=en
Returns full list of translation options with:
  id, name, author_name, language_name, language_id

Use this to populate the language/translation selector.
Group by language_name for a clean UI.

Key translation IDs for defaults:
  131 = Saheeh International (English) ← default
  149 = The Clear Quran / Dr. Mustafa Khattab (English)
  97  = Mufti Taqi Usmani (Urdu)
  84  = Urdu — Ahmed Ali
  95  = Bengali — Muhiuddin Khan  
  77  = French — Hamidullah
  79  = German — Bubenheim
  83  = Indonesian — Bahasa
  85  = Turkish — Diyanet
  80  = Spanish — Cortes

── 3. VERSES WITH TRANSLATION ──
GET /verses/by_chapter/{chapter_id}
  ?translations={translation_id}
  &fields=text_uthmani,verse_key,verse_number
  &per_page=300

Returns verses array with:
  verse_key, verse_number, text_uthmani (Arabic)
  translations[0].text (translation in selected language)

Strip HTML from translation: text.replace(/<[^>]+>/g,'')

── 4. ARABIC AUDIO URLS ──
GET /recitations/{recitation_id}/by_chapter/{chapter_id}
Returns: audio_files[] with { verse_key, url }
Full URL = "https://audio.qurancdn.com/" + url

Recitation IDs:
  7  = Mishary Rashid Al-Afasy    ← default
  1  = AbdulBaset AbdulSamad (Murattal)
  3  = AbdurRahman as-Sudais
  9  = Hani Ar-Rifai
  12 = Maher Al Muaiqly

── 5. ALL RECITERS ──
GET /resources/recitations?language=en

── 6. ENGLISH TRANSLATION AUDIO (Ibrahim Walk) ──
Only for English — when user selects English translation,
ALSO play audio of the translation after Arabic.

URL: https://audio.qurancdn.com/Ibrahim_Walk_Alafasy/{CCC}/{CCCVVV}.mp3
  CCC = chapter zero-padded to 3 digits
  VVV = verse zero-padded to 3 digits
  
Examples:
  1:1   → .../001/001001.mp3
  2:255 → .../002/002255.mp3
  67:2  → .../067/067002.mp3

For non-English translations: no translation audio available.
Show the text on screen instead (it auto-advances after a 
read-time delay based on text length).

═══════════════════════════════════════════════════
DATA LOADING STRATEGY
═══════════════════════════════════════════════════

On app start:
  - Fetch all 114 chapters → cache in memory
  - Fetch all translations → cache in memory
  - Both calls happen in parallel on layout mount

On surah load:
  - Fetch verses + audio URLs in parallel (Promise.all)
  - Show loading skeleton while fetching
  - Cache loaded surahs so switching back is instant

On translation change:
  - Re-fetch only the translation text (not audio)
  - Audio URLs don't change when translation changes

═══════════════════════════════════════════════════
PLAYBACK ENGINE — usePlayer.ts
═══════════════════════════════════════════════════
This is the most critical file. Build it correctly.

USE REFS NOT STATE for the play loop to avoid stale closures:

  const arabicAudio = useRef(new Audio());
  const translationAudio = useRef(new Audio());
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);

PLAY LOOP:
  async function playLoop(startIndex: number) {
    isPlayingRef.current = true;
    let i = startIndex;

    while (isPlayingRef.current && i < verses.length) {
      currentIndexRef.current = i;
      setCurrentIndex(i);         // update UI
      setTrack('arabic');

      // ARABIC
      if (mode !== 'translation_only') {
        arabicAudio.current.src = verses[i].arabicAudioUrl;
        arabicAudio.current.playbackRate = speed;
        try { await arabicAudio.current.play(); } catch(_) {}
        await ended(arabicAudio.current);
        if (!isPlayingRef.current) break;
      }

      // GAP
      if (mode === 'both') {
        await sleep(gapMs);
        if (!isPlayingRef.current) break;
      }

      // TRANSLATION
      setTrack('translation');
      if (mode !== 'arabic_only') {
        if (verses[i].translationAudioUrl) {
          // has audio (English)
          translationAudio.current.src = verses[i].translationAudioUrl;
          translationAudio.current.playbackRate = speed;
          try { await translationAudio.current.play(); } catch(_) {}
          await ended(translationAudio.current);
        } else {
          // text only — show for read time then advance
          const readTime = Math.max(2000, verses[i].translationText.length * 40);
          await sleep(readTime);
        }
        if (!isPlayingRef.current) break;
      }

      await sleep(400); // natural pause between verses
      i++;
    }

    if (i >= verses.length) {
      setTrack('idle');
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentIndex(0);
    }
  }

  function ended(audio: HTMLAudioElement): Promise<void> {
    return new Promise(resolve => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve(); // NEVER hang on 404
      audio.onstalled = () => resolve(); // NEVER hang if stalled
    });
  }

  function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }

  function pause() {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setTrack('idle');
    arabicAudio.current.pause();
    translationAudio.current.pause();
  }

  function resume() {
    setIsPlaying(true);
    playLoop(currentIndexRef.current);
  }

  function goTo(index: number) {
    pause();
    setTimeout(() => {
      setIsPlaying(true);
      playLoop(index);
    }, 150);
  }

  // Preload next verse while current plays
  useEffect(() => {
    const next = verses[currentIndex + 1];
    if (next?.arabicAudioUrl) {
      const preload = new Audio();
      preload.src = next.arabicAudioUrl;
      preload.load();
    }
  }, [currentIndex]);

═══════════════════════════════════════════════════
FILE STRUCTURE
═══════════════════════════════════════════════════
app/
  layout.tsx              ← Google Fonts, globals, metadata
  page.tsx                ← Home page (surah selector)
  player/
    [surahId]/
      page.tsx            ← Player page
globals.css               ← CSS variables + Amiri font + animations
tailwind.config.js        ← custom colors

components/
  SurahGrid.tsx           ← 114 surah cards with search
  VerseCard.tsx           ← verse with 4 states
  PlayerBar.tsx           ← fixed bottom player
  SettingsDrawer.tsx      ← bottom sheet settings
  LanguageSelector.tsx    ← grouped by language, searchable
  LoadingSkeleton.tsx     ← loading state

hooks/
  usePlayer.ts            ← playback engine
  useSurahData.ts         ← fetch verses + audio
  useTranslations.ts      ← fetch + cache all translations

lib/
  quranApi.ts             ← all API calls
  audioUtils.ts           ← URL helpers

types/
  quran.ts                ← all TypeScript interfaces

═══════════════════════════════════════════════════
TYPES — types/quran.ts
═══════════════════════════════════════════════════
export interface Verse {
  verseKey: string;          // "1:1"
  verseNumber: number;
  arabicText: string;
  translationText: string;   // in selected language
  arabicAudioUrl: string;
  translationAudioUrl: string | null; // null if no audio
}

export interface Chapter {
  id: number;
  name_simple: string;       // "Al-Fatihah"
  name_arabic: string;       // "الفاتحة"
  name_complex: string;      // "Al-Fātiĥah"
  verses_count: number;
  revelation_place: string;
  translated_name: { name: string };
}

export interface Translation {
  id: number;
  name: string;              // "Saheeh International"
  author_name: string;
  language_name: string;     // "english"
  language_id: number;
}

export type PlayMode = 'both' | 'arabic_only' | 'translation_only';
export type Track = 'arabic' | 'translation' | 'idle';

═══════════════════════════════════════════════════
globals.css
═══════════════════════════════════════════════════
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --bg:           #1a1b2e;
  --bg-surface:   #222336;
  --bg-elevated:  #2a2b40;
  --bg-hover:     #2e2f47;
  --teal:         #2ec4a0;
  --teal-dim:     rgba(46,196,160,0.12);
  --teal-border:  rgba(46,196,160,0.35);
  --blue:         #4a90d9;
  --blue-dim:     rgba(74,144,217,0.12);
  --blue-border:  rgba(74,144,217,0.35);
  --text-1:       #e8e8f0;
  --text-2:       #8888aa;
  --text-3:       #55556a;
  --border:       rgba(255,255,255,0.07);
  --border-h:     rgba(255,255,255,0.14);
}

* { box-sizing: border-box; }

body {
  background: var(--bg);
  color: var(--text-1);
  font-family: 'Inter', sans-serif;
}

.arabic {
  font-family: 'Amiri', serif !important;
  direction: rtl;
  text-align: right;
  line-height: 1.9;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}
.blink { animation: blink 1.2s ease-in-out infinite; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in { animation: fadeIn 0.3s ease; }

═══════════════════════════════════════════════════
UI — MATCH quran.com EXACTLY
══════════════════════════════════════════════════
Reference file: `bilingual-quran-radio-qurancom-ui.html`
Open it and match every detail.

── HEADER (sticky 52px) ──
Background: #222336, border-bottom 1px solid var(--border)
Left:  Logo text "Bilingual Quran Radio" — Inter 18px semibold
Right: language count badge + settings gear icon

── SURAH NAV BAR (44px) ──
Left:  Current surah "67. Al-Mulk ▾" — click opens surah selector
Center: "Page 562 · Juz 29" — muted small text
Right:  "Verse by Verse" / "Reading" pill toggle

── MODE BAR (40px) ──
Left:  ▶ Listen | Arabic · Both · English pills
Right: Selected translation name + language flag emoji ▾
       Click opens LanguageSelector drawer

── MAIN (scrollable, pb-[160px]) ──
Surah header:
  - Arabic calligraphy centered, Amiri 52px, color #e8e8f0
  - English name below, Inter 22px
  - Bismillah Arabic + English translation
  - border-bottom

Verse cards: (no outer box, just padding + border-bottom)
  Each verse:
    Row 1: [67:1] [▶] [🔖] [status badge] ············ [⋯]
    Row 2: Arabic text — Amiri 28px RTL right-aligned
    Row 3: Translation text — Inter 15px muted
    Row 4: Tafsirs | Layers | Lessons | Reflections (muted tabs)

  4 states:
    IDLE:
      bg: transparent, no left border
      arabic: #e8e8f0, translation: #8888aa

    PLAYING ARABIC:
      bg: rgba(46,196,160,0.05)
      border-left: 3px solid #2ec4a0
      arabic: #d4f5ec (bright green-white)
      badge: green dot (blink) + "Arabic"
      play btn: teal tint

    PLAYING TRANSLATION:
      bg: rgba(74,144,217,0.05)
      border-left: 3px solid #4a90d9
      arabic: #8888aa (dimmed)
      translation: #c5ddf5 (bright blue-white)
      badge: blue dot (blink) + "Translation"

    DONE:
      opacity: 0.45
      no left border

── PLAYER BAR (fixed bottom) ──
Top edge: 3px progress line (teal when arabic, blue when translation)

Content row:
  LEFT — current verse preview (hidden on mobile <380px):
    Arabic text truncated — Amiri 16px RTL
    Translation text truncated — Inter 11px muted
    State pill: "● 67:2 · Arabic" (teal) or "● 67:2 · Translation" (blue)

  CENTER — transport controls:
    [⚙] [🔊] [◀ PREV] [● PLAY/PAUSE 42px teal circle] [▶ NEXT] [⏭]
    
  RIGHT:
    Gap:  [──●──] 1s    (accent-color: teal)
    Speed: [1×] button

── BOTTOM DRAWERS ──

Settings Drawer (⚙ opens):
  Handle bar at top
  Sections:
    Reciter (5 options as pills)
    Playback Mode (Both / Arabic only / Translation only)
    Speed (0.75× / 1× / 1.25× / 1.5×)
    Gap (0s / 0.5s / 1s / 2s / 3s)
  Active state: teal border + teal dim background

Language/Translation Drawer (translation name opens):
  Search bar at top
  Grouped by language:
    🇬🇧 English (3 translations)
      ● Saheeh International
        The Clear Quran
        Pickthall
    🇵🇰 Urdu (4 translations)
      ...
    🇧🇩 Bengali ...
    🇫🇷 French ...
    (all 50+ languages from the API)
  
  When English selected: show "● Audio available" badge
  Other languages: show "● Text only" badge
  Selected: teal checkmark

═══════════════════════════════════════════════════
HOME PAGE — SurahGrid
═══════════════════════════════════════════════════
- Full page background #1a1b2e
- Header same as player
- Search bar: full width, placeholder "Search surah by name or number..."
  - Filters by English name, Arabic name, and number in real time

- Stats bar below search:
  "114 Surahs · 6,236 Verses · 50+ Languages"
  in muted small text

- Grid: 1 col mobile, 2 col tablet, 3 col desktop
  gap-3, padding 16px

- Each surah card:
  bg: #222336, border 1px var(--border), rounded-lg
  hover: bg #2a2b40, border var(--border-h), cursor pointer
  transition: all 0.15s

  Card content:
    Top row:
      Left:  surah number — 13px muted
      Right: "Makkiyah" or "Madinah" badge
             (Makkiyah = teal dim, Madinah = blue dim)
    
    Arabic name: Amiri 22px teal (#2ec4a0) RTL right-aligned
    
    English name: Inter 15px semibold #e8e8f0
    
    Translated name (e.g. "The Opening"): 12px muted italic
    
    Bottom: "{n} verses" — 11px muted

  Click → navigate to /player/{id}

═══════════════════════════════════════════════════
ADDITIONAL FEATURES (hackathon scoring)
═══════════════════════════════════════════════════

── BOOKMARKS (User API requirement) ──
- Bookmark button on each verse
- Saved to localStorage
- Bookmarks page accessible from header
- Shows bookmarked verses with surah context
- "Sync with Quran.com" placeholder button 
  (shows "Login to sync" — satisfies User API mention)

── STREAK TRACKING ──
- Track listening sessions in localStorage
- Show streak count in header: "🔥 7 day streak"
- Increment when user listens for 60+ seconds
- Reset if day skipped
- This satisfies the Streak Tracking User API requirement

── RESUME LAST SESSION ──
- Save to localStorage: { surahId, verseIndex, translationId, reciterId }
- On home page: show "Continue: Surah Al-Kahf, Verse 31 →" banner
- Click resumes exactly where left off

── KEYBOARD SHORTCUTS ──
  Space     → play / pause
  ←         → previous verse
  →         → next verse  
  M         → toggle mute
  +/-       → increase/decrease gap

── MEDIA SESSION API ──
  navigator.mediaSession.metadata = new MediaMetadata({
    title: `${verse.arabicText.slice(0,20)}...`,
    artist: `${surah.name_simple} · ${reciterName}`,
    album: 'Bilingual Quran Radio',
  });
  navigator.mediaSession.setActionHandler('play', togglePlay);
  navigator.mediaSession.setActionHandler('pause', pause);
  navigator.mediaSession.setActionHandler('previoustrack', prevVerse);
  navigator.mediaSession.setActionHandler('nexttrack', nextVerse);

This makes controls appear on the lock screen —
critical for commuter use case.

── AUTO-ADVANCE SURAH ──
When last verse completes:
  Show modal: "Surah Al-Mulk complete. Continue to Al-Qalam?"
  [Continue] [Restart] [Choose Surah]
  Auto-continues after 5 seconds if no action

═══════════════════════════════════════════════════
MOBILE FIRST — RESPONSIVE RULES
═══════════════════════════════════════════════════
This is primarily a MOBILE/COMMUTER app.

Mobile (<640px):
  - Hide verse preview in player bar
  - Player controls full width centered
  - 1 column surah grid
  - Larger touch targets (min 44px)
  - Arabic font 24px (not 28px)
  - Bottom drawers full width

Tablet (640–1024px):
  - 2 column surah grid
  - Show verse preview in player bar

Desktop (1024px+):
  - 3 column surah grid
  - Full player bar
  - Max content width 900px centered

═══════════════════════════════════════════════════
PERFORMANCE
═══════════════════════════════════════════════════
- Cache API responses in module-level Map (persist across navigations)
- Preload next verse audio while current is playing
- Lazy load LanguageSelector (it's large)
- next/link for navigation (no full reloads)
- Add <meta name="google" content="notranslate"> to protect Arabic text
- Add translate="no" on all Arabic text elements

═══════════════════════════════════════════════════
ERROR STATES
═══════════════════════════════════════════════════
- API failure: "Could not load surah. [Retry]" button
- Audio 404: silently skip (onerror → resolve promise)
- No internet: show offline banner
- Translation missing for verse: show "—" gracefully

═══════════════════════════════════════════════════
METADATA (for judges seeing the demo)
═══════════════════════════════════════════════════
In layout.tsx:
  title: "Bilingual Quran Radio — Understand Every Verse"
  description: "Listen to the Quran with translation in 50+ 
    languages. Arabic recitation followed by translation, 
    verse by verse. Perfect for commuters."

In README.md:
  # Bilingual Quran Radio
  
  Built for the Quran Foundation Hackathon 2026.
  
  ## The Problem
  1.8 billion Muslims. Most don't understand Arabic.
  They reconnect with the Quran in Ramadan but the 
  connection fades when Ramadan ends.
  
  ## The Solution
  A bilingual audio player that alternates Arabic 
  recitation with translation in your language — 
  verse by verse, automatically. Listen while commuting.
  Build a daily habit without changing your routine.
  
  ## What Makes It Different
  - Only app using Quran Foundation API for bilingual playback
  - 50+ languages — not just English
  - Mobile-first, lock screen controls
  - Works for ANY Muslim worldwide, any language
  
  ## APIs Used
  - Quran Foundation Content API (verses, audio, translations)
  - Streak Tracking (User API)
  - Bookmarks (User API)

═══════════════════════════════════════════════════
BUILD ORDER — DO NOT SKIP STEPS
═══════════════════════════════════════════════════
1.  Delete all existing files
2.  npx create-next-app@latest . --typescript --tailwind --app
3.  Set up globals.css (copy from above exactly)
4.  Set up types/quran.ts
5.  Build lib/quranApi.ts — all API functions
6.  Build lib/audioUtils.ts — URL helpers
7.  Build hooks/useSurahData.ts
8.  Build hooks/usePlayer.ts — TEST with console.logs
9.  Build components/VerseCard.tsx — all 4 states
10. Build components/PlayerBar.tsx
11. Build components/SettingsDrawer.tsx
12. Build components/LanguageSelector.tsx
13. Build app/player/[surahId]/page.tsx
14. Build components/SurahGrid.tsx
15. Build app/page.tsx
16. Test full flow end to end
17. Add bookmarks + streak to localStorage
18. Add keyboard shortcuts + Media Session API
19. Final polish — loading states, error states, mobile
20. Deploy to Vercel

═══════════════════════════════════════════════════
TESTING — VERIFY ALL OF THIS WORKS
═══════════════════════════════════════════════════
□ Home loads 114 surahs
□ Search filters correctly
□ Click surah → navigates to player
□ Verses load with Arabic text
□ Translation loads in English by default
□ Arabic audio plays for verse 1
□ After Arabic ends → 1s gap → English translation shown highlighted
□ Auto-advances to verse 2
□ Verse 1 dims (done state)
□ Pause stops immediately
□ Resume continues from same verse
□ Change translation to Urdu → verse text updates
□ Urdu: no audio, text shown for read time then advances
□ Reciter change works
□ Gap slider changes gap
□ Mode "Arabic only" skips translation
□ Next/Prev verse buttons work
□ Bookmark saves to localStorage
□ Streak increments after 60s listen
□ Resume banner shows on home after session
□ Lock screen controls work on mobile
□ Works on 375px iPhone width
□ Vercel deploy has public URL

═══════════════════════════════════════════════════
START NOW
═══════════════════════════════════════════════════
First verify the reference file exists:
  ls bilingual-quran-radio-qurancom-ui.html

Then start with step 1 of the build order.
After each step tell me what you built and show 
any errors before continuing.

The goal is a working, beautiful, deployed app 
that wins $3,000. Build accordingly.
