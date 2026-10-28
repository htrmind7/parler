import { useState } from 'react'
import { format } from '../i18n/format.ts'
import vi from '../i18n/vi.json'
import type { NewPerDay } from '../engine/types.ts'
import { Button } from '../ui/Button.tsx'

const OPTIONS: NewPerDay[] = [5, 10, 15]

export function WelcomeScreen({
  onStart,
}: {
  onStart: (newPerDay: NewPerDay) => void
}) {
  const [choice, setChoice] = useState<NewPerDay>(5)
  return (
    <div className="screen welcome">
      <h1 className="app-name">{vi.app.name}</h1>
      <p className="flags" aria-hidden="true">
        🇻🇳 → 🇫🇷
      </p>
      <p className="tagline">{vi.welcome.tagline}</p>
      <p className="muted">{vi.welcome.perDay}</p>
      <div className="pills">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`pill ${choice === option ? 'pill-active' : ''}`}
            onClick={() => setChoice(option)}
          >
            {format(vi.welcome.perDayOption, { n: option })}
          </button>
        ))}
      </div>
      <Button onClick={() => onStart(choice)}>{vi.welcome.start}</Button>
    </div>
  )
}
