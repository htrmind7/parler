import { useEffect, useRef, useState } from 'react'
import { lastWeek, weekdayIndex } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { APPEARANCES, type Appearance } from '../app/appearance.ts'
import {
  getFrenchVoices,
  isSpeechSupported,
  loadVoiceName,
  saveVoiceName,
  speakFrench,
} from '../audio/speech.ts'
import { createInitialState } from '../engine/engine.ts'
import type { NewPerDay } from '../engine/types.ts'
import { format } from '../i18n/format.ts'
import vi from '../i18n/vi.json'
import { exportFileName, exportState, importState } from '../storage/storage.ts'
import { Button } from '../ui/Button.tsx'
import { LeafIcon, MoonIcon, SunIcon } from '../ui/Icons.tsx'

const OPTIONS: NewPerDay[] = [5, 10, 15]

function download(fileName: string, text: string): void {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function VoicePicker() {
  const [voices, setVoices] = useState(getFrenchVoices)
  const [chosen, setChosen] = useState(loadVoiceName)

  // Voices load lazily in most browsers
  useEffect(() => {
    const refresh = () => setVoices(getFrenchVoices())
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', refresh)
  }, [])

  function choose(name: string | null) {
    saveVoiceName(name)
    setChosen(name)
    // Synchronous on purpose: speech must start from the tap
    speakFrench('Bonjour, je m\u2019appelle Marie.')
  }

  return (
    <>
      <h2 className="section-title">{vi.settings.voice}</h2>
      {voices.length === 0 ? (
        <p className="hint">{vi.settings.voiceNone}</p>
      ) : (
        <div className="voice-list">
          {[null, ...voices.map((voice) => voice.name)].map((name) => (
            <button
              key={name ?? 'auto'}
              type="button"
              className={`pill voice-option ${chosen === name ? 'pill-active' : ''}`}
              aria-pressed={chosen === name}
              onClick={() => choose(name)}
            >
              {name ?? vi.settings.voiceAuto}
            </button>
          ))}
        </div>
      )}
      <p className="hint">{vi.settings.voiceHint}</p>
    </>
  )
}

type SettingsProps = ScreenProps & {
  onShowInstall: () => void
  appearance: Appearance
  onAppearanceChange: (appearance: Appearance) => void
}

const APPEARANCE_LABELS: Record<Appearance, string> = {
  light: vi.settings.appearanceLight,
  dark: vi.settings.appearanceDark,
  mint: vi.settings.appearanceMint,
}

const APPEARANCE_ICONS: Record<Appearance, React.ReactNode> = {
  light: <SunIcon size={22} />,
  dark: <MoonIcon size={22} />,
  mint: <LeafIcon size={22} />,
}

export function SettingsScreen({
  state,
  update,
  today,
  onShowInstall,
  appearance,
  onAppearanceChange,
}: SettingsProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const week = lastWeek(state.activity, today)

  async function onFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const imported = importState(await file.text())
      if (!window.confirm(vi.settings.importConfirm)) return
      update(() => imported)
      setMessage(vi.settings.importOk)
    } catch (error) {
      setMessage(
        format(vi.settings.importError, { reason: (error as Error).message }),
      )
    }
  }

  function reset() {
    if (!window.confirm(vi.settings.resetConfirm)) return
    update(() => createInitialState(today, state.settings.newPerDay))
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{vi.settings.title}</h1>

      <h2 className="section-title">{vi.settings.appearance}</h2>
      <div className="swatches">
        {APPEARANCES.map((option) => (
          <button
            key={option}
            type="button"
            className={`swatch swatch-${option} ${appearance === option ? 'swatch-active' : ''}`}
            aria-pressed={appearance === option}
            onClick={() => onAppearanceChange(option)}
          >
            <span className="swatch-preview">{APPEARANCE_ICONS[option]}</span>
            <span>{APPEARANCE_LABELS[option]}</span>
          </button>
        ))}
      </div>

      {isSpeechSupported() && <VoicePicker />}

      <h2 className="section-title">{vi.settings.newPerDay}</h2>
      <div className="pills">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`pill ${state.settings.newPerDay === option ? 'pill-active' : ''}`}
            onClick={() =>
              update((current) => ({
                ...current,
                settings: { newPerDay: option },
              }))
            }
          >
            {format(vi.welcome.perDayOption, { n: option })}
          </button>
        ))}
      </div>

      <h2 className="section-title">{vi.settings.progress}</h2>
      <div className="tiles">
        <div className="tile">
          <span className="tile-number teal">
            {Object.keys(state.progress).length}
          </span>
          <span className="muted">{vi.settings.wordsLearned}</span>
        </div>
        <div className="tile">
          <span className="tile-number gold">{state.activity.length}</span>
          <span className="muted">{vi.settings.activeDays}</span>
        </div>
      </div>
      <p className="muted">{vi.settings.thisWeek}</p>
      <div className="week">
        {week.map((day) => (
          <div key={day.date} className="week-day">
            <div className={`week-bar ${day.active ? 'active' : ''}`} />
            <span className="muted">
              {vi.settings.weekdays[weekdayIndex(day.date)]}
            </span>
          </div>
        ))}
      </div>

      <h2 className="section-title">{vi.settings.backup}</h2>
      <p className="muted">{vi.settings.backupHint}</p>
      <div className="actions">
        <Button
          variant="outline"
          onClick={() => download(exportFileName(today), exportState(state))}
        >
          {vi.settings.export}
        </Button>
        <Button variant="outline" onClick={() => fileInput.current?.click()}>
          {vi.settings.import}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onFileChosen}
        />
        {message && <p className="notice">{message}</p>}
        <Button variant="ghost" onClick={onShowInstall}>
          {vi.settings.install}
        </Button>
        <Button variant="dontKnow" onClick={reset}>
          {vi.settings.reset}
        </Button>
      </div>

      <p className="muted version">
        {format(vi.settings.version, { version: __APP_VERSION__ })}
      </p>
    </div>
  )
}
