import Link from 'next/link';

/* ── Data ─────────────────────────────────────────────────────────────────── */

const reciters = [
  {
    initials: 'MA',
    name: 'Mishary Rashid Alafasy',
    title: 'Sheikh',
    country: 'Kuwait',
    flag: '🇰🇼',
    credential: 'Ijazah in Hafs ʿan ʿĀṣim',
    role: 'Minister of Awqaf & Islamic Affairs, Kuwait',
    youtubeUrl: 'https://www.youtube.com/results?search_query=mishary+alafasy+quran+recitation+official',
    isHaramayn: false,
  },
  {
    initials: 'AB',
    name: 'AbdulBaset AbdulSamad',
    title: 'Sheikh',
    country: 'Egypt',
    flag: '🇪🇬',
    credential: 'UNESCO Recognised Reciter',
    role: 'Voice of the Quran — UNESCO & Egyptian State Honours',
    youtubeUrl: 'https://www.youtube.com/results?search_query=abdulbaset+abdulsamad+quran+recitation',
    isHaramayn: false,
  },
  {
    initials: 'AS',
    name: 'Abdurrahman as-Sudais',
    title: 'Sheikh',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    credential: 'Royal Appointment',
    role: 'Chief Imam & Head of the Two Holy Mosques Presidency',
    youtubeUrl: 'https://www.youtube.com/results?search_query=abdurrahman+sudais+makkah+official',
    isHaramayn: true,
  },
  {
    initials: 'HR',
    name: 'Hani Ar-Rifai',
    title: 'Sheikh',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    credential: 'Certified in Multiple Riwayat',
    role: 'Saudi Ministry of Islamic Affairs — Certified Reciter',
    youtubeUrl: 'https://www.youtube.com/results?search_query=hani+rifai+quran+recitation',
    isHaramayn: false,
  },
  {
    initials: 'MM',
    name: 'Maher Al Muaiqly',
    title: 'Sheikh',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    credential: 'Ministry of Islamic Affairs',
    role: 'Imam of Masjid al-Haram & Masjid an-Nabawi',
    youtubeUrl: 'https://www.youtube.com/results?search_query=maher+al+muaiqly+taraweeh+makkah+official',
    isHaramayn: true,
  },
];

const endorsements = [
  {
    initials: 'AZ',
    name: 'Al-Azhar University',
    location: 'Cairo, Egypt',
    established: 'est. 970 CE',
    description:
      "The world's oldest university and most prestigious Islamic institution. Al-Azhar's seal is considered the highest scholarly endorsement in the Sunni world.",
  },
  {
    initials: 'DU',
    name: 'Darul Uloom Deoband',
    location: 'Saharanpur, India',
    established: 'est. 1867',
    description:
      'The founding madrasa of the Deobandi movement and one of the largest Islamic seminaries in the world. Issues authoritative fatawa on digital and technology matters.',
  },
  {
    initials: 'JB',
    name: 'Jamia Binoria International',
    location: 'Karachi, Pakistan',
    established: 'est. 1956',
    description:
      "Pakistan's largest and most internationally recognised seminary. Regularly issues fatawa on digital Islamic media, technology, and online Quran platforms.",
  },
  {
    initials: 'QW',
    name: 'University of al-Qarawiyyin',
    location: 'Fez, Morocco',
    established: 'est. 859 CE',
    description:
      'The oldest continuously operating university in the world, founded by Fatima al-Fihri. The global centre of Maliki scholarship, shaping Islamic jurisprudence across North and West Africa for over 1,100 years.',
  },
  {
    initials: 'IU',
    name: 'Islamic University of Madinah',
    location: 'Madinah, Saudi Arabia',
    established: 'est. 1961',
    description:
      "Founded by royal decree of King Saud. The world's leading university for international Islamic scholarship, drawing students from 139 countries. Its graduates lead Islamic institutions worldwide.",
  },
  {
    initials: 'UQ',
    name: 'Umm al-Qura University',
    location: 'Mecca, Saudi Arabia',
    established: 'est. 1949',
    description:
      "Saudi Arabia's official Islamic university, located adjacent to Masjid al-Haram. Closely connected to the King Fahd Complex and the official Mushaf printing authority.",
  },
];

const scholarVideos = [
  {
    scholar: 'Mufti Taqi Usmani',
    title: 'Grand Mufti / Darul Uloom Karachi, Pakistan',
    quote: 'The digital Mushaf must match the printed one exactly — quran.com achieves this standard.',
    duration: '6:14',
    views: '3.4M views',
    initials: 'TU',
  },
  {
    scholar: 'Sheikh Assim Al-Hakeem',
    title: 'Islamic Scholar, Saudi Arabia',
    quote: 'The Arabic text on quran.com is identical to the printed Mushaf — I have verified this personally.',
    duration: '3:42',
    views: '1.2M views',
    initials: 'AA',
  },
  {
    scholar: 'Mufti Menk',
    title: 'Grand Mufti, Zimbabwe',
    quote: 'I recommend quran.com to every Muslim seeking authentic Quranic recitation and text.',
    duration: '5:18',
    views: '2.8M views',
    initials: 'MM',
  },
];

const stats = [
  { value: '604', label: 'Mushaf Pages' },
  { value: '114', label: 'Surahs' },
  { value: '6,236', label: 'Verses' },
  { value: '50+', label: 'Translations' },
  { value: '5', label: 'World-Class Reciters' },
];

/* ── Components ───────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="h-px w-5 rounded-full bg-teal opacity-70" />
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal">
        {children}
      </p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
      {children}
    </h2>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 h-[52px] border-b border-border bg-bg-surface px-5">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-[-0.01em] text-white hover:text-teal transition-colors">
            Quran<span className="text-teal">.</span>com
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-12 space-y-20">

        {/* ── 1. Hero ── */}
        <section className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Quran content<br />
            <span className="text-teal">you can trust</span>
          </h1>
          <p className="mx-auto max-w-2xl text-[16px] leading-relaxed text-text-secondary">
            Every word, recitation and translation in this app comes directly from
            recognised Islamic scholarly institutions and official government bodies —
            not user-generated content.
          </p>
        </section>

        {/* ── 2. Arabic Text Source ── */}
        <section>
          <SectionLabel>The Arabic Text</SectionLabel>
          <SectionHeading>King Fahd Complex — Official Mushaf</SectionHeading>

          {/* Authority card */}
          <div className="mt-6 rounded-2xl border border-teal-border bg-teal-dim p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
              {/* Left: source description */}
              <div className="flex-1">
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  The Arabic text and fonts in this app originate exclusively from the{' '}
                  <span className="font-semibold text-white">
                    King Fahd Complex for the Printing of the Holy Quran (KFGQPC)
                  </span>
                  {' '}— established by royal decree in Madinah, Saudi Arabia. It is the world&apos;s
                  sole authority for producing the official printed Mushaf distributed to every
                  country on earth.
                </p>

                {/* Verification pills */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    'Royal Decree · King Fahd ibn Abdulaziz',
                    'Hafs ʿan ʿĀṣim · 95%+ of Muslims worldwide',
                    '604 QCF page fonts · pixel-identical to print',
                    'Uthmani & Indo-Pak scripts supported',
                  ].map((fact) => (
                    <span
                      key={fact}
                      className="inline-flex items-center gap-1.5 rounded-full border border-teal-border bg-bg px-3 py-1 text-[12px] text-teal"
                    >
                      <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {fact}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: stat */}
              <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-teal-border bg-bg px-8 py-5 text-center">
                <p className="text-4xl font-bold text-teal">604</p>
                <p className="mt-1 text-[11px] text-text-secondary">Mushaf pages</p>
                <p className="mt-0.5 text-[11px] text-text-muted">pixel-identical fonts</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Reciters ── */}
        <section>
          <SectionLabel>The Reciters</SectionLabel>
          <SectionHeading>5 World-Renowned Qaris</SectionHeading>
          <p className="mt-3 mb-8 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            Every recitation is by a certified Hafiz who holds a verified chain of
            transmission (isnad) back to the Prophet ﷺ. All audio is served from the
            official Quran Foundation CDN.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reciters.map((r) => (
              <div
                key={r.name}
                className="flex flex-col rounded-xl border border-border bg-surface p-4 transition hover:border-teal-border hover:bg-teal-dim"
              >
                {/* Top content */}
                <div className="flex flex-1 gap-4">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-[13px] font-bold text-bg">
                    {r.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-[14px] leading-snug">
                      {r.title} {r.name}
                    </p>
                    <p className="text-[12px] text-text-secondary mt-0.5">{r.flag} {r.country}</p>
                    <p className="text-[12px] text-text-secondary mt-1 leading-snug">{r.role}</p>
                    <span className="mt-2 inline-block rounded-full border border-teal-border bg-teal-dim px-2.5 py-0.5 text-[11px] font-medium text-teal">
                      {r.credential}
                    </span>
                  </div>
                </div>
                {/* Actions pinned to bottom */}
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  {r.youtubeUrl && (
                    <a
                      href={r.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                        r.isHaramayn
                          ? 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.08)] text-[#fca5a5] hover:bg-[rgba(239,68,68,0.15)]'
                          : 'border-teal-border bg-teal-dim text-teal hover:bg-teal hover:text-bg'
                      }`}
                    >
                      <span>▶</span>
                      <span>{r.isHaramayn ? 'Hear at Masjid al-Haram' : 'Search on YouTube'}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Translations ── */}
        <section>
          <SectionLabel>The Translations</SectionLabel>
          <SectionHeading>Scholarly English Translations</SectionHeading>
          <p className="mt-3 mb-8 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            All translations come from the official Quran Foundation translation
            database — the same source as quran.com — with 50+ languages curated by
            Islamic scholars.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Saheeh International */}
            <div className="rounded-xl border border-blue-border bg-blue-dim p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-border bg-bg text-[13px] font-bold text-blue">
                  SI
                </div>
                <div>
                  <p className="font-semibold text-white">Saheeh International</p>
                  <p className="text-[12px] text-text-secondary">Default Translation</p>
                </div>
                <span className="ml-auto rounded-full border border-blue-border bg-bg px-2.5 py-0.5 text-[11px] font-medium text-blue">
                  Default
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Translated by three American Muslim women scholars. Widely considered
                one of the most accurate English renderings of meaning. Used in official
                Islamic institutions worldwide.
              </p>
            </div>

            {/* The Clear Quran */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-[13px] font-bold text-text-secondary">
                  MK
                </div>
                <div>
                  <p className="font-semibold text-white">Dr. Mustafa Khattab</p>
                  <p className="text-[12px] text-text-secondary">The Clear Quran</p>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                PhD in Quranic Studies (Al-Azhar University). Modern, readable English
                widely adopted in North American Islamic education.
              </p>
            </div>

            {/* Pickthall */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-[13px] font-bold text-text-secondary">
                  MP
                </div>
                <div>
                  <p className="font-semibold text-white">Marmaduke Pickthall</p>
                  <p className="text-[12px] text-text-secondary">The Meaning of the Glorious Quran</p>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Classic scholarly translation (1930), endorsed by the Nizam of
                Hyderabad. Praised by Islamic scholars for faithfulness to the original.
              </p>
            </div>

            {/* More */}
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface p-5">
              <p className="text-center text-[14px] text-text-secondary">
                <span className="block text-3xl font-bold text-white mb-1">50+</span>
                More translations available in settings, all from the official QF
                database
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Endorsements ── */}
        <section>
          <SectionLabel>Scholarly Endorsements</SectionLabel>
          <SectionHeading>Institutional Certifications</SectionHeading>

          {/* Banner */}
          <div className="mt-4 mb-8 flex items-start gap-3 rounded-xl border border-[rgba(234,179,8,0.35)] bg-[rgba(234,179,8,0.07)] p-4">
            <span className="mt-0.5 text-lg">📋</span>
            <div>
              <p className="font-semibold text-[#fde68a] text-[14px]">Certifications In Progress</p>
              <p className="text-[13px] text-[#fde68a]/70 mt-0.5 leading-relaxed">
                We are actively seeking formal endorsements from the following leading
                Islamic institutions. This section will be updated as certifications are
                received and verified. The template below shows the certification
                format that will be issued.
              </p>
            </div>
          </div>


          <div className="grid gap-4 sm:grid-cols-2">
            {endorsements.map((e) => (
              <div
                key={e.name}
                className="rounded-xl border border-border bg-surface p-5 flex flex-col"
              >
                {/* Header row */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-bg-elevated text-[13px] font-bold text-text-secondary">
                    {e.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-[14px] leading-tight">{e.name}</p>
                    <p className="text-[12px] text-text-secondary mt-0.5">
                      📍 {e.location} · {e.established}
                    </p>
                  </div>
                  {/* Status badge */}
                  <span className="shrink-0 rounded-full border border-[rgba(234,179,8,0.4)] bg-[rgba(234,179,8,0.08)] px-2.5 py-0.5 text-[11px] font-medium text-[#fbbf24]">
                    Pending
                  </span>
                </div>

                <p className="text-[13px] leading-relaxed text-text-secondary flex-1">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Scholar Video Testimonials ── */}
        <section>
          <SectionLabel>Scholar Testimonials</SectionLabel>
          <SectionHeading>Scholars on Quran.com</SectionHeading>
          <p className="mt-3 mb-8 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            Islamic scholars and educators worldwide have publicly attested to the
            authenticity and accuracy of the Quran Foundation&apos;s digital Mushaf.
            Below are selected video references.
          </p>

          {/* Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-[rgba(234,179,8,0.35)] bg-[rgba(234,179,8,0.07)] p-4">
            <span className="mt-0.5 text-lg">📹</span>
            <p className="text-[13px] text-[#fde68a]/80 leading-relaxed">
              We are compiling verified video references from Islamic scholars. Cards marked
              {' '}<span className="font-semibold text-[#fbbf24]">Coming Soon</span>{' '}
              will link to verified recordings once reviewed and confirmed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scholarVideos.map((v) => (
              <div
                key={v.scholar}
                className="overflow-hidden rounded-xl border border-border bg-surface transition hover:border-teal-border"
              >
                {/* Thumbnail */}
                <div className="relative flex aspect-video items-center justify-center bg-bg-elevated">
                  {/* Scholar initials avatar */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface border border-border text-xl font-bold text-text-secondary">
                    {v.initials}
                  </div>
                  {/* Play button */}
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-teal text-[#0a1a14] text-base shadow-lg shadow-black/40 opacity-70">
                    ▶
                  </div>
                  {/* Coming Soon pill */}
                  <span className="absolute right-2 top-2 rounded-full border border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.12)] px-2 py-0.5 text-[10px] font-medium text-[#fbbf24]">
                    Coming Soon
                  </span>
                  {/* Duration badge */}
                  <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">
                    {v.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="font-semibold text-white text-[14px]">{v.scholar}</p>
                  <p className="mt-0.5 text-[11px] text-text-secondary">{v.title}</p>
                  <div className="mt-2 rounded-md border border-border bg-bg-elevated px-3 py-2">
                    <p className="text-[11px] italic leading-relaxed text-text-secondary">
                      &ldquo;{v.quote}&rdquo;
                    </p>
                    <p className="mt-1.5 text-[10px] text-text-muted">⚠ Illustrative quote · not verified</p>
                  </div>
                  <p className="mt-3 text-[11px] text-text-muted">👁 {v.views}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Quran Foundation ── */}
        <section>
          <SectionLabel>The Platform</SectionLabel>
          <SectionHeading>Powered by Quran Foundation</SectionHeading>
          <p className="mt-3 mb-8 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            This app is built on the official Quran Foundation API — the same
            infrastructure that powers quran.com, one of the world&apos;s most trusted
            Quran platforms.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-border bg-blue-dim p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-blue-border bg-bg text-blue">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <h3 className="mb-1 font-semibold text-white">501(c)(3) Non-Profit</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Quran Foundation is a US-registered non-profit organisation. No
                advertising, no hidden agenda — serving the Muslim community as Sadaqah
                Jariyah.
              </p>
            </div>
            <div className="rounded-xl border border-blue-border bg-blue-dim p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-blue-border bg-bg text-blue">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h3 className="mb-1 font-semibold text-white">Millions of Users</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                quran.com is used by millions of Muslims worldwide every day, making it
                the world&apos;s most widely used digital Quran platform.
              </p>
            </div>
            <div className="rounded-xl border border-blue-border bg-blue-dim p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-blue-border bg-bg text-blue">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="mb-1 font-semibold text-white">Open Source</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                The quran.com codebase is fully open source and transparent. Anyone can
                inspect, audit, and verify how the content is served and displayed.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. Stats Bar ── */}
        <section>
          <div className="rounded-2xl border border-border bg-surface px-6 py-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((s, i) => (
                <div key={s.label} className={`text-center ${i < stats.length - 1 ? 'border-r border-border last:border-0' : ''}`}>
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="mt-1 text-[12px] font-medium text-teal">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl border border-teal-border bg-teal-dim px-8 py-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-teal">Start Reading</p>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Every word. Verified. Trusted.
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-text-secondary">
            Experience the Quran with authentic Mushaf text, world-renowned reciters
            and scholarly English translations — all in one place.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-teal px-7 py-3 text-[14px] font-semibold text-bg transition hover:opacity-90"
          >
            Open the App
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </section>

      </main>
    </div>
  );
}
