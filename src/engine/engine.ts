import type { Card, Theme } from '../content/schemas.ts'
import { addDays } from './dates.ts'
import {
  ACTIVITY_DAYS,
  INTERVAL_DAYS,
  MAX_BOX,
  PHRASE_UNLOCK_MIN_BOX,
  SESSION_MAX_CARDS,
} from './config.ts'
import type {
  AppState,
  Box,
  CardProgress,
  NewPerDay,
  Session,
} from './types.ts'

export class EngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EngineError'
  }
}

export function createInitialState(
  today: string,
  newPerDay: NewPerDay = 5,
): AppState {
  return {
    version: 2,
    settings: { newPerDay },
    progress: {},
    today: { date: today, newIntroduced: 0 },
    activity: [],
    grammarDone: [],
  }
}

/** Resets the daily counter when the day has changed. */
export function rollDay(state: AppState, today: string): AppState {
  if (state.today.date === today) return state
  return { ...state, today: { date: today, newIntroduced: 0 } }
}

export function remainingNewToday(state: AppState, today: string): number {
  const { today: counter, settings } = rollDay(state, today)
  return Math.max(0, settings.newPerDay - counter.newIntroduced)
}

/** Records the day the app was opened, keeping the last 30 days. */
export function recordActivity(state: AppState, today: string): AppState {
  const oldest = addDays(today, -(ACTIVITY_DAYS - 1))
  const days = new Set([...state.activity, today])
  const activity = [...days].filter((day) => day >= oldest).sort()
  return { ...state, activity }
}

/** A card enters the review system in box 1 once the learner has gone through it. */
export function introduceCard(
  state: AppState,
  cardId: string,
  today: string,
): AppState {
  const rolled = rollDay(state, today)
  if (rolled.progress[cardId]) {
    throw new EngineError(`card "${cardId}" is already introduced`)
  }
  if (remainingNewToday(rolled, today) === 0) {
    throw new EngineError('the daily limit of new cards is reached')
  }
  const progress: CardProgress = {
    cardId,
    box: 1,
    due: addDays(today, INTERVAL_DAYS[1]),
    seenCount: 1,
    lastSeen: today,
  }
  return {
    ...rolled,
    progress: { ...rolled.progress, [cardId]: progress },
    today: {
      date: today,
      newIntroduced: rolled.today.newIntroduced + 1,
    },
  }
}

/** A success moves the card up one box (box 5 stays), a miss sends it back to box 1. */
export function gradeCard(
  state: AppState,
  cardId: string,
  known: boolean,
  today: string,
): AppState {
  const current = state.progress[cardId]
  if (!current) throw new EngineError(`card "${cardId}" was never introduced`)
  const box = (known ? Math.min(current.box + 1, MAX_BOX) : 1) as Exclude<
    Box,
    0
  >
  const progress: CardProgress = {
    ...current,
    box,
    due: addDays(today, INTERVAL_DAYS[box]),
    seenCount: current.seenCount + 1,
    lastSeen: today,
  }
  return { ...state, progress: { ...state.progress, [cardId]: progress } }
}

/** Cards to review today or overdue, the most overdue first. */
export function dueCards(state: AppState, today: string): CardProgress[] {
  return Object.values(state.progress)
    .filter((progress) => progress.due <= today)
    .sort(
      (a, b) => a.due.localeCompare(b.due) || a.cardId.localeCompare(b.cardId),
    )
}

/** A phrase is unlocked when all its required words are at least in box 2. */
export function isUnlocked(card: Card, state: AppState): boolean {
  return (card.requires ?? []).every(
    (id) => (state.progress[id]?.box ?? 0) >= PHRASE_UNLOCK_MIN_BOX,
  )
}

/** Next cards to learn today (optionally within one theme), in theme then card order, within the daily limit. */
export function nextNewCards(
  state: AppState,
  themes: Theme[],
  cards: Card[],
  today: string,
  themeId?: string,
): Card[] {
  const themeOrder = new Map(themes.map((theme) => [theme.id, theme.order]))
  return cards
    .filter(
      (card) =>
        (themeId === undefined || card.themeId === themeId) &&
        !state.progress[card.id] &&
        isUnlocked(card, state),
    )
    .sort(
      (a, b) =>
        (themeOrder.get(a.themeId) ?? 0) - (themeOrder.get(b.themeId) ?? 0) ||
        a.order - b.order,
    )
    .slice(0, remainingNewToday(state, today))
}

/** A review session holds at most 10 due cards. */
export function startSession(state: AppState, today: string): Session {
  const queue = dueCards(state, today)
    .slice(0, SESSION_MAX_CARDS)
    .map((progress) => progress.cardId)
  return { queue, requeued: [] }
}

/** True for the second appearance of a missed card: it does not change the progress. */
export function isRetry(session: Session, cardId: string): boolean {
  return session.requeued.includes(cardId)
}

/** Answers the current card; a missed card comes back once at the end of the session. */
export function answerInSession(session: Session, known: boolean): Session {
  const [cardId, ...rest] = session.queue
  if (cardId === undefined) throw new EngineError('the session is finished')
  if (known || session.requeued.includes(cardId)) {
    return { ...session, queue: rest }
  }
  return {
    queue: [...rest, cardId],
    requeued: [...session.requeued, cardId],
  }
}
