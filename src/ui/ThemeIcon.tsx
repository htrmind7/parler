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
  pronouns: (
    <>
      <circle cx="24" cy="15" r="8" fill="var(--blue)" />
      <path d="M8 41v-4a16 12 0 0 1 32 0v4z" fill="var(--blue)" />
      <circle cx="35" cy="13" r="5" fill="var(--coral)" />
      <circle cx="35" cy="13" r="1.8" fill="#fff" />
    </>
  ),
  verbs: (
    <>
      <circle cx="24" cy="24" r="18" fill="var(--coral)" />
      <path
        d="M17 24h13M25 17l7 7-7 7"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  'small-words': (
    <>
      <rect x="6" y="8" width="36" height="28" rx="9" fill="var(--teal)" />
      <path d="M16 36v8l9-8z" fill="var(--teal)" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="Poppins, sans-serif"
        fontWeight="700"
        fontSize="24"
        fill="#fff"
      >
        ?
      </text>
    </>
  ),
  adjectives: (
    <>
      <path
        d="M24 5l5.2 11 12 1.6-8.8 8.3 2.2 11.9L24 31.2 13.4 37.8l2.2-11.9-8.8-8.3 12-1.6z"
        fill="var(--gold)"
      />
      <circle cx="24" cy="22" r="3" fill="#fff" opacity="0.8" />
    </>
  ),
  'daily-phrases': (
    <>
      <path
        d="M9 18h26v13a9 9 0 0 1-9 9H18a9 9 0 0 1-9-9z"
        fill="var(--coral)"
      />
      <path
        d="M35 21h3a4 4 0 0 1 0 8h-3"
        stroke="var(--coral)"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M16 14c-2-3 2-4 0-8M23 14c-2-3 2-4 0-8M30 14c-2-3 2-4 0-8"
        stroke="var(--teal)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  'days-months': (
    <>
      <rect x="6" y="9" width="36" height="32" rx="8" fill="var(--blue)" />
      <rect x="6" y="9" width="36" height="11" rx="6" fill="var(--coral)" />
      <rect x="14" y="5" width="4" height="9" rx="2" fill="#fff" />
      <rect x="30" y="5" width="4" height="9" rx="2" fill="#fff" />
      <g fill="#fff">
        <circle cx="15" cy="28" r="2.2" />
        <circle cx="24" cy="28" r="2.2" />
        <circle cx="33" cy="28" r="2.2" />
        <circle cx="15" cy="35" r="2.2" />
        <circle cx="24" cy="35" r="2.2" />
      </g>
    </>
  ),
  colors: (
    <>
      <path
        d="M24 6C13 6 6 14 6 24c0 9 7 18 17 18 4 0 5-3 3-6-2-3 0-6 4-6h6c4 0 6-2 6-6C42 13 34 6 24 6z"
        fill="var(--gold)"
      />
      <circle cx="16" cy="20" r="3.4" fill="var(--coral)" />
      <circle cx="25" cy="14" r="3.4" fill="var(--teal)" />
      <circle cx="34" cy="20" r="3.4" fill="var(--blue)" />
      <circle cx="14" cy="30" r="3.4" fill="#fff" />
    </>
  ),
  weather: (
    <>
      <circle cx="19" cy="18" r="9" fill="var(--gold)" />
      <path
        d="M17 38a8 8 0 0 1 1-16 11 11 0 0 1 21 3 6.5 6.5 0 0 1-1 13z"
        fill="var(--blue)"
      />
    </>
  ),
  clothes: (
    <>
      <path
        d="M17 6l-11 7 5 8 5-3v22h16V18l5 3 5-8-11-7c-1 4-4 6-7 6s-6-2-7-6z"
        fill="var(--teal)"
      />
      <path
        d="M17 6c1 4 4 6 7 6s6-2 7-6"
        stroke="#fff"
        strokeWidth="2.4"
        fill="none"
        opacity="0.7"
      />
    </>
  ),
  body: (
    <>
      <path
        d="M16 42V24l-6-8a3 3 0 0 1 5-3l4 5V10a3 3 0 0 1 6 0v9V8a3 3 0 0 1 6 0v11V11a3 3 0 0 1 6 0v21c0 6-4 10-10 10z"
        fill="var(--coral)"
      />
    </>
  ),
  'work-school': (
    <>
      <rect x="6" y="14" width="36" height="26" rx="7" fill="var(--blue)" />
      <path
        d="M17 14v-3a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3"
        stroke="var(--blue)"
        strokeWidth="3.4"
        fill="none"
      />
      <rect x="6" y="25" width="36" height="3.4" fill="#fff" opacity="0.55" />
      <rect x="21" y="23" width="6" height="8" rx="2" fill="var(--gold)" />
    </>
  ),
  places: (
    <>
      <rect x="8" y="14" width="18" height="28" rx="3" fill="var(--blue)" />
      <rect x="26" y="24" width="14" height="18" rx="3" fill="var(--teal)" />
      <g fill="#fff">
        <rect x="12" y="19" width="4" height="4" rx="1" />
        <rect x="19" y="19" width="4" height="4" rx="1" />
        <rect x="12" y="27" width="4" height="4" rx="1" />
        <rect x="19" y="27" width="4" height="4" rx="1" />
        <rect x="30" y="29" width="4" height="4" rx="1" />
      </g>
      <path
        d="M4 42h40"
        stroke="var(--coral)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  admin: (
    <>
      <path d="M11 5h20l8 8v30H11z" fill="#fff" opacity="0.95" />
      <path d="M31 5v8h8z" fill="var(--teal)" />
      <path
        d="M11 5h20l8 8v30H11z"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="17" y="21" width="16" height="3" rx="1.5" fill="var(--blue)" />
      <rect
        x="17"
        y="28"
        width="12"
        height="3"
        rx="1.5"
        fill="var(--blue)"
        opacity="0.6"
      />
      <circle cx="31" cy="37" r="4.4" fill="var(--coral)" />
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
  pronouns: 'var(--blue)',
  verbs: 'var(--coral)',
  'small-words': 'var(--teal)',
  adjectives: 'var(--gold)',
  'daily-phrases': 'var(--coral)',
  'days-months': 'var(--blue)',
  colors: 'var(--gold)',
  weather: 'var(--blue)',
  clothes: 'var(--teal)',
  body: 'var(--coral)',
  'work-school': 'var(--blue)',
  places: 'var(--teal)',
  admin: 'var(--purple)',
}
