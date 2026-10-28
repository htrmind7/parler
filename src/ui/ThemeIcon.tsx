type ThemeIconProps = { themeId: string; size?: number }

/** Flat two-tone illustrations, one per theme, drawn to follow the active appearance. */
const ILLUSTRATIONS: Record<string, React.ReactNode> = {
  greetings: (
    <>
      <path
        d="M8 12a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H20l-8 7v-7a6 6 0 0 1-4-6V12z"
        fill="var(--teal)"
      />
      <path
        d="M22 22a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5v5l-6-5h-6a5 5 0 0 1-5-5v-8z"
        fill="var(--coral)"
        opacity="0.95"
      />
      <circle cx="17" cy="17" r="2" fill="#fff" />
      <circle cx="23" cy="17" r="2" fill="#fff" />
      <circle cx="29" cy="17" r="2" fill="#fff" />
    </>
  ),
  introductions: (
    <>
      <rect x="6" y="10" width="36" height="28" rx="6" fill="var(--blue)" />
      <circle cx="18" cy="21" r="5" fill="#fff" />
      <path d="M9 33a9 7 0 0 1 18 0z" fill="#fff" />
      <rect x="30" y="18" width="9" height="3" rx="1.5" fill="#fff" />
      <rect
        x="30"
        y="25"
        width="9"
        height="3"
        rx="1.5"
        fill="#fff"
        opacity="0.7"
      />
    </>
  ),
  numbers: (
    <>
      <rect x="6" y="8" width="36" height="32" rx="8" fill="var(--gold)" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="Poppins, sans-serif"
        fontWeight="700"
        fontSize="18"
        fill="#1f2937"
      >
        123
      </text>
    </>
  ),
  food: (
    <>
      <path d="M9 24h30a15 15 0 0 1-30 0z" fill="var(--coral)" />
      <rect
        x="15"
        y="38"
        width="18"
        height="3.5"
        rx="1.75"
        fill="var(--coral)"
      />
      <path
        d="M17 18c-2-3 2-4 0-8M24 18c-2-3 2-4 0-8M31 18c-2-3 2-4 0-8"
        stroke="var(--teal)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="24" cy="24" rx="15" ry="3" fill="#fff" opacity="0.85" />
    </>
  ),
  family: (
    <>
      <circle cx="15" cy="14" r="5.5" fill="var(--blue)" />
      <path d="M5 36v-6a10 10 0 0 1 20 0v6z" fill="var(--blue)" />
      <circle cx="33" cy="14" r="5.5" fill="var(--coral)" />
      <path d="M23 36v-6a10 10 0 0 1 20 0v6z" fill="var(--coral)" />
      <circle cx="24" cy="27" r="4.2" fill="var(--gold)" />
      <path d="M17 41v-3.5a7 7 0 0 1 14 0V41z" fill="var(--gold)" />
    </>
  ),
  home: (
    <>
      <path d="M24 6 5 22h6v18h26V22h6z" fill="var(--coral)" />
      <path d="M24 6 5 22h38z" fill="var(--coral)" />
      <path d="M11 22h26v18H11z" fill="#fff" opacity="0.92" />
      <rect x="20" y="28" width="8" height="12" rx="2" fill="var(--teal)" />
      <rect x="13.5" y="25" width="5" height="5" rx="1" fill="var(--blue)" />
      <rect x="29.5" y="25" width="5" height="5" rx="1" fill="var(--blue)" />
    </>
  ),
  'getting-around': (
    <>
      <path
        d="M24 5a11.5 11.5 0 0 0-11.5 11.5C12.5 25 24 40 24 40s11.5-15 11.5-23.5A11.5 11.5 0 0 0 24 5z"
        fill="var(--coral)"
      />
      <circle cx="24" cy="16.5" r="4.5" fill="#fff" />
      <path
        d="M7 43c6-4 10 0 17-2s11 2 17-1"
        stroke="var(--teal)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  shopping: (
    <>
      <path
        d="M9 17h30l-2.5 22a3 3 0 0 1-3 2.6h-19a3 3 0 0 1-3-2.6z"
        fill="var(--teal)"
      />
      <path
        d="M17 21v-5a7 7 0 0 1 14 0v5"
        stroke="var(--gold)"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="17" cy="23" r="2" fill="#fff" />
      <circle cx="31" cy="23" r="2" fill="#fff" />
    </>
  ),
  health: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="10" fill="var(--coral)" />
      <path d="M20 13h8v7h7v8h-7v7h-8v-7h-7v-8h7z" fill="#fff" />
    </>
  ),
  time: (
    <>
      <circle cx="24" cy="25" r="17" fill="var(--blue)" />
      <circle cx="24" cy="25" r="13" fill="#fff" opacity="0.94" />
      <path
        d="M24 16v9.5l6 3.5"
        stroke="var(--blue)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="25" r="2" fill="var(--coral)" />
      <rect x="20" y="4" width="8" height="4" rx="2" fill="var(--blue)" />
    </>
  ),
}

export function ThemeIcon({ themeId, size = 40 }: ThemeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="theme-icon"
    >
      {ILLUSTRATIONS[themeId] ?? (
        <rect x="8" y="8" width="32" height="32" rx="9" fill="var(--teal)" />
      )}
    </svg>
  )
}

/** Accent color of each theme, used for the icon tile background. */
export const THEME_TONES: Record<string, string> = {
  greetings: 'var(--teal)',
  introductions: 'var(--blue)',
  numbers: 'var(--gold)',
  food: 'var(--coral)',
  family: 'var(--purple)',
  home: 'var(--coral)',
  'getting-around': 'var(--teal)',
  shopping: 'var(--teal)',
  health: 'var(--coral)',
  time: 'var(--blue)',
}
