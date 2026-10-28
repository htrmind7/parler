export type Appearance = 'light' | 'dark' | 'mint'

export const APPEARANCES: Appearance[] = ['light', 'dark', 'mint']

/** Per-device preference: kept apart from the learning progress, which is exported. */
export const APPEARANCE_KEY = 'parler.appearance'

/** Browser theme color (address bar, status bar) matching each appearance. */
export const THEME_COLORS: Record<Appearance, string> = {
  light: '#f4f6f8',
  dark: '#0f1419',
  mint: '#bfe3d0',
}

export function parseAppearance(value: string | null): Appearance | null {
  return APPEARANCES.find((appearance) => appearance === value) ?? null
}

export function defaultAppearance(prefersDark: boolean): Appearance {
  return prefersDark ? 'dark' : 'light'
}

export function loadAppearance(): Appearance {
  try {
    const stored = parseAppearance(localStorage.getItem(APPEARANCE_KEY))
    if (stored) return stored
  } catch {
    // blocked storage: fall back to the system preference
  }
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return defaultAppearance(prefersDark)
}

export function applyAppearance(appearance: Appearance): void {
  document.documentElement.dataset.appearance = appearance
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[appearance])
}

export function saveAppearance(appearance: Appearance): void {
  try {
    localStorage.setItem(APPEARANCE_KEY, appearance)
  } catch {
    // the choice then only lasts until the app is closed
  }
}
