export const SUPPORTED_RECITER_IDS = [7, 1, 3, 9, 12] as const;

export function getTranslationAudioUrl(_chapterNumber: number, _verseNumber: number): string {
  /* No reliable English audio CDN is available — the player uses a
     text read-time delay instead (see usePlayer.ts). */
  return '';
}

export function getArabicAudioUrl(urlPath: string): string {
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  return `https://audio.qurancdn.com/${urlPath.replace(/^\/+/, '')}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}
