import type { Content } from '../content/loader.ts'
import type { AppState } from '../engine/types.ts'

export type ScreenName = 'home' | 'learn' | 'review' | 'words' | 'settings'

export type ScreenProps = {
  content: Content
  state: AppState
  update: (change: (state: AppState) => AppState) => void
  today: string
  go: (screen: ScreenName) => void
}
