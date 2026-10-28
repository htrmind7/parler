import type { Card, Theme } from '../content/schemas.ts'
import { addDays } from '../engine/dates.ts'
import type { AppState } from '../engine/types.ts'

/** Progress of cards removed from the content is simply ignored. */
export function restrictToCards(state: AppState, cards: Card[]): AppState {
  const ids = new Set(cards.map((card) => card.id))
  const progress = Object.fromEntries(
    Object.entries(state.progress).filter(([id]) => ids.has(id)),
  )
  return { ...state, progress }
}

export type ThemeProgress = { theme: Theme; done: number; total: number }

export function themeProgress(
  state: AppState,
  themes: Theme[],
  cards: Card[],
): ThemeProgress[] {
  return themes
    .map((theme) => {
      const inTheme = cards.filter((card) => card.themeId === theme.id)
      return {
        theme,
        total: inTheme.length,
        done: inTheme.filter((card) => state.progress[card.id]).length,
      }
    })
    .filter((entry) => entry.total > 0)
    .sort((a, b) => a.theme.order - b.theme.order)
}

/** Cards already seen, in theme then card order. */
export function seenCards(
  state: AppState,
  themes: Theme[],
  cards: Card[],
): Card[] {
  const themeOrder = new Map(themes.map((theme) => [theme.id, theme.order]))
  return cards
    .filter((card) => state.progress[card.id])
    .sort(
      (a, b) =>
        (themeOrder.get(a.themeId) ?? 0) - (themeOrder.get(b.themeId) ?? 0) ||
        a.order - b.order,
    )
}

/** Opening days of the last 7 days (oldest first, today last), for the small chart. */
export function lastWeek(
  activity: string[],
  today: string,
): { date: string; active: boolean }[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6)
    return { date, active: activity.includes(date) }
  })
}

/** Day of the week of an ISO day, Monday = 0. */
export function weekdayIndex(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number)
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7
}
