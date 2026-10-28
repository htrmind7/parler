import type { Lesson } from '../content/grammar.ts'
import type { Content } from '../content/loader.ts'
import type { AppState } from '../engine/types.ts'

export type ScreenName =
  'home' | 'learn' | 'review' | 'words' | 'grammar' | 'settings'

export type ScreenProps = {
  content: Content
  lessons: Lesson[]
  state: AppState
  update: (change: (state: AppState) => AppState) => void
  today: string
  go: (screen: ScreenName) => void
  /** Starts learning new cards, optionally within one theme. */
  startLearning: (themeId?: string) => void
  /** Theme chosen on the home screen, if any. */
  learnThemeId?: string
}
