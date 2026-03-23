/**
 * QCF (Quran Complex Font) page font loader.
 *
 * quran.com renders Arabic verse text using per-Mushaf-page glyph fonts:
 *   font-family: p{n}-v1  (e.g. "p1-v1" for page 1)
 *   source:      https://quran.com/fonts/quran/hafs/v1/woff2/p{n}.woff2
 *
 * Each page font maps the QPC Hafs Unicode codepoints (Arabic Presentation
 * Forms, U+FB50+) to the exact glyphs from the King Fahd Complex printed Mushaf.
 * This gives the authentic calligraphic rendering that matches quran.com.
 */

const loaded = new Set<number>();

export function loadQcfFont(pageNumber: number): void {
  if (typeof document === 'undefined') return; // SSR guard
  if (loaded.has(pageNumber)) return;
  loaded.add(pageNumber);

  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'p${pageNumber}-v1';
      src: url('/fonts/quran/hafs/v1/woff2/p${pageNumber}.woff2') format('woff2');
      font-display: block;
    }
  `;
  document.head.appendChild(style);
}

/** CSS font-family value for a given Mushaf page */
export function qcfFontFamily(pageNumber: number): string {
  return `p${pageNumber}-v1, UthmanicHafs, serif`;
}
