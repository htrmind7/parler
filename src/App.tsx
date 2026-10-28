import { useEffect, useState } from 'react'
import rawCards from '../content/cards.json'
import rawThemes from '../content/themes.json'
import {
  applyAppearance,
  loadAppearance,
  saveAppearance,
  type Appearance,
} from './app/appearance.ts'
import { useAppState } from './app/useAppState.ts'
import type { ScreenName, ScreenProps } from './app/types.ts'
import { loadPublishedContent } from './content/loader.ts'
import { recordActivity } from './engine/engine.ts'
import { toIsoDate } from './engine/dates.ts'
import {
  isSpeechSupported,
  onSpeechProblem,
  type SpeechProblem,
} from './audio/speech.ts'
import vi from './i18n/vi.json'
import { HomeScreen } from './screens/HomeScreen.tsx'
import { InstallScreen } from './screens/InstallScreen.tsx'
import { LearnScreen } from './screens/LearnScreen.tsx'
import { ReviewScreen } from './screens/ReviewScreen.tsx'
import { SettingsScreen } from './screens/SettingsScreen.tsx'
import { WelcomeScreen } from './screens/WelcomeScreen.tsx'
import { WordsScreen } from './screens/WordsScreen.tsx'
import { GearIcon, HomeIcon, ListIcon } from './ui/Icons.tsx'

// Validated at build time by the content tests; only validated cards are published
const content = loadPublishedContent(rawThemes, rawCards)

const NAV: { screen: ScreenName; label: string; icon: React.ReactNode }[] = [
  { screen: 'home', label: vi.nav.home, icon: <HomeIcon /> },
  { screen: 'words', label: vi.nav.words, icon: <ListIcon /> },
  { screen: 'settings', label: vi.nav.settings, icon: <GearIcon /> },
]

export default function App() {
  const today = toIsoDate(new Date())
  const { state, update, persistent, recoveredError, saveFailed } =
    useAppState(today)
  const [screen, setScreen] = useState<ScreenName>('home')
  const [showInstall, setShowInstall] = useState(false)
  const [learnThemeId, setLearnThemeId] = useState<string | undefined>()
  const [appearance, setAppearance] = useState<Appearance>(loadAppearance)
  const [speechProblem, setSpeechProblem] = useState<SpeechProblem | null>(null)

  useEffect(() => onSpeechProblem(setSpeechProblem), [])

  const isFirstLaunch = state.activity.length === 0
  const props: ScreenProps = {
    content,
    state,
    update,
    today,
    go: setScreen,
    learnThemeId,
    startLearning: (themeId) => {
      setLearnThemeId(themeId)
      setScreen('learn')
    },
  }

  function changeAppearance(next: Appearance) {
    setAppearance(next)
    applyAppearance(next)
    saveAppearance(next)
  }

  let body: React.ReactNode
  if (showInstall) {
    body = <InstallScreen onDone={() => setShowInstall(false)} />
  } else if (isFirstLaunch) {
    body = (
      <WelcomeScreen
        onStart={(newPerDay) => {
          update((current) =>
            recordActivity({ ...current, settings: { newPerDay } }, today),
          )
          setShowInstall(true)
        }}
      />
    )
  } else if (screen === 'learn') {
    body = <LearnScreen {...props} />
  } else if (screen === 'review') {
    body = <ReviewScreen {...props} />
  } else if (screen === 'words') {
    body = <WordsScreen {...props} />
  } else if (screen === 'settings') {
    body = (
      <SettingsScreen
        {...props}
        onShowInstall={() => setShowInstall(true)}
        appearance={appearance}
        onAppearanceChange={changeAppearance}
      />
    )
  } else {
    body = <HomeScreen {...props} />
  }

  const showNav =
    !showInstall && !isFirstLaunch && screen !== 'learn' && screen !== 'review'
  const inSession =
    (screen === 'learn' || screen === 'review') && !isFirstLaunch
  const warnings = [
    recoveredError !== null && vi.warnings.recovered,
    !persistent && vi.warnings.noStorage,
    saveFailed && vi.warnings.saveFailed,
    !isSpeechSupported() && vi.warnings.noSpeech,
    speechProblem === 'no-french-voice' && vi.warnings.noFrenchVoice,
    speechProblem === 'failed' && vi.warnings.speechFailed,
  ].filter((text): text is string => typeof text === 'string')

  return (
    <div className={`app ${inSession ? 'in-session' : ''}`}>
      <div className="gradient-strip" />
      {warnings.map((text) => (
        <p key={text} className="warning">
          {text}
        </p>
      ))}
      <main>{body}</main>
      {showNav && (
        <nav className="nav">
          {NAV.map(({ screen: target, label, icon }) => (
            <button
              key={target}
              type="button"
              className={`nav-item ${screen === target ? 'active' : ''}`}
              onClick={() => setScreen(target)}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
      {inSession && (
        <button
          type="button"
          className="close"
          aria-label={vi.nav.home}
          onClick={() => setScreen('home')}
        >
          ×
        </button>
      )}
    </div>
  )
}
