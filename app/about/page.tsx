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
  },
  {
    initials: 'AB',
    name: 'AbdulBaset AbdulSamad',
    title: 'Sheikh',
    country: 'Egypt',
    flag: '🇪🇬',
    credential: 'UNESCO Recognised Reciter',
    role: 'Former Head of Quran Reciters Union, Egypt',
  },
  {
    initials: 'AS',
    name: 'Abdurrahman as-Sudais',
    title: 'Sheikh',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    credential: 'Royal Appointment',
    role: 'Imam & Khateeb of Masjid al-Haram, Mecca',
  },
  {
    initials: 'HR',
    name: 'Hani Ar-Rifai',
    title: 'Sheikh',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    credential: 'Certified in Multiple Riwayat',
    role: 'Saudi reciter, widely used in Islamic education',
  },
  {
    initials: 'MM',
    name: 'Maher Al Muaiqly',
    title: 'Sheikh',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    credential: 'Ministry of Islamic Affairs',
    role: 'Lead Taraweeh Imam of Masjid al-Haram',
  },
];

const endorsements = [
  {
    initials: 'AZ',
    name: 'Al-Azhar University',
    location: 'Cairo, Egypt',
    established: 'est. 970 CE',
    school: "Ash'ari / Shafi'i",
    schoolColor: 'blue',
    description:
      "The world's oldest university and most prestigious Sunni Islamic institution. Al-Azhar's seal is considered the highest scholarly endorsement in the Sunni world.",
    certRef: '—',
    status: 'pending',
  },
  {
    initials: 'DU',
    name: 'Darul Uloom Deoband',
    location: 'Saharanpur, India',
    established: 'est. 1867',
    school: 'Deobandi / Hanafi',
    schoolColor: 'teal',
    description:
      'The founding madrasa of the Deobandi movement and one of the largest Islamic seminaries in the world. Issues authoritative fatawa on digital and technology matters.',
    certRef: '—',
    status: 'pending',
  },
  {
    initials: 'JA',
    name: 'Jamia Ashrafia',
    location: 'Lahore, Pakistan',
    established: 'est. 1947',
    school: 'Deobandi / Hanafi',
    schoolColor: 'teal',
    description:
      'Premier Deobandi seminary in Pakistan, known internationally for issuing fatawa on digital Quran authenticity and digital recitation standards.',
    certRef: '—',
    status: 'pending',
  },
  {
    initials: 'JB',
    name: 'Jamia Binoria International',
    location: 'Karachi, Pakistan',
    established: 'est. 1956',
    school: 'Deobandi / Hanafi',
    schoolColor: 'teal',
    description:
      'One of Pakistan\'s largest Deobandi seminaries. Regularly issues fatawa on digital Islamic media, technology, and online Quran platforms.',
    certRef: '—',
    status: 'pending',
  },
  {
    initials: 'UQ',
    name: "Umm al-Qura University",
    location: 'Mecca, Saudi Arabia',
    established: 'est. 1949',
    school: "Hanbali / Ash'ari",
    schoolColor: 'blue',
    description:
      "Saudi Arabia's official Islamic university, located adjacent to Masjid al-Haram. Closely connected to the King Fahd Complex and the official Mushaf printing authority.",
    certRef: '—',
    status: 'pending',
  },
];

const stats = [
  { value: '604', label: 'Mushaf Pages' },
  { value: '114', label: 'Surahs' },
  { value: '6,236', label: 'Verses' },
  { value: '50+', label: 'Translations' },
  { value: '5', label: 'Certified Reciters' },
];

/* ── Components ───────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
      {children}
    </p>
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
          <Link
            href="/"
            className="text-[13px] text-text-secondary hover:text-white transition-colors"
          >
            ← Back to Surahs
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-12 space-y-20">

        {/* ── 1. Hero ── */}
        <section className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-border bg-teal-dim px-4 py-1.5 text-[12px] font-medium text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            Content Authenticity
          </div>
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
          <p className="mt-3 mb-8 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            The Arabic text and fonts in this app originate from the{' '}
            <span className="text-white font-medium">
              King Fahd Complex for the Printing of the Holy Quran (KFGQPC)
            </span>
            , established by royal decree in Madinah, Saudi Arabia — the world&apos;s
            single authority for the official printed Mushaf.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-xl border border-teal-border bg-teal-dim p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-teal-border bg-bg text-lg">
                🕌
              </div>
              <h3 className="mb-1 font-semibold text-white">Royal Decree Authority</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Established by decree of King Fahd ibn Abdulaziz. The only institution
                authorised to produce the official printed Mushaf distributed worldwide.
              </p>
            </div>
            {/* Card 2 */}
            <div className="rounded-xl border border-teal-border bg-teal-dim p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-teal-border bg-bg text-lg">
                🔤
              </div>
              <h3 className="mb-1 font-semibold text-white">QCF Digital Mushaf Fonts</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                This app uses all 604 QCF page fonts from KFGQPC — the exact same font
                system used by quran.com — rendering each letter pixel-identical to the
                printed Mushaf.
              </p>
            </div>
            {/* Card 3 */}
            <div className="rounded-xl border border-teal-border bg-teal-dim p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-teal-border bg-bg text-lg">
                ✅
              </div>
              <h3 className="mb-1 font-semibold text-white">Hafs ʿan ʿĀṣim</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                The text follows the Hafs ʿan ʿĀṣim recitation — the most widely used
                Quranic reading method, followed by over 95% of Muslims worldwide.
              </p>
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
                className="flex gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-teal-border hover:bg-teal-dim"
              >
                {/* Avatar */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-[13px] font-bold text-bg">
                  {r.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white text-[14px]">
                    {r.title} {r.name}
                  </p>
                  <p className="text-[12px] text-text-secondary mt-0.5">{r.flag} {r.country}</p>
                  <p className="text-[12px] text-text-secondary mt-1 leading-snug">{r.role}</p>
                  <span className="mt-2 inline-block rounded-full border border-teal-border bg-teal-dim px-2.5 py-0.5 text-[11px] font-medium text-teal">
                    {r.credential}
                  </span>
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
                className="rounded-xl border border-border bg-surface p-5"
              >
                {/* Header row */}
                <div className="mb-4 flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold ${
                    e.schoolColor === 'teal'
                      ? 'border-teal-border bg-teal-dim text-teal'
                      : 'border-blue-border bg-blue-dim text-blue'
                  }`}>
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

                {/* School of thought pill */}
                <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  e.schoolColor === 'teal'
                    ? 'border border-teal-border bg-teal-dim text-teal'
                    : 'border border-blue-border bg-blue-dim text-blue'
                }`}>
                  {e.school}
                </span>

                <p className="text-[13px] leading-relaxed text-text-secondary mb-4">
                  {e.description}
                </p>

                {/* Certificate template footer */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-3 py-2">
                  <span className="text-[11px] text-text-muted">Certificate Ref</span>
                  <span className="text-[12px] font-mono text-text-secondary">{e.certRef}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Quran Foundation ── */}
        <section>
          <SectionLabel>The Platform</SectionLabel>
          <SectionHeading>Powered by Quran Foundation</SectionHeading>
          <p className="mt-3 mb-8 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            This app is built on the official Quran Foundation API — the same
            infrastructure that powers quran.com, one of the world&apos;s most trusted
            Quran platforms.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 text-2xl">🏛️</div>
              <h3 className="mb-1 font-semibold text-white">501(c)(3) Non-Profit</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                Quran Foundation is a US-registered non-profit organisation. No
                advertising, no hidden agenda — serving the Muslim community as Sadaqah
                Jariyah.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 text-2xl">🌍</div>
              <h3 className="mb-1 font-semibold text-white">Millions of Users</h3>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                quran.com is used by millions of Muslims worldwide every day, making it
                the world&apos;s most widely used digital Quran platform.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 text-2xl">🔓</div>
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

      </main>
    </div>
  );
}
