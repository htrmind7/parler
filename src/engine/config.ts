import type { Box, QuestionDirection } from './types.ts'

/** Days before the next review for a card that lands in each box. */
export const INTERVAL_DAYS: Record<Exclude<Box, 0>, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
}

export const MAX_BOX = 5
export const SESSION_MAX_CARDS = 10
/** A phrase is offered only when all its required words are at least in this box. */
export const PHRASE_UNLOCK_MIN_BOX = 2
/** Boxes up to this one ask French (audio) → translation, the next ones ask for production. */
export const RECOGNITION_MAX_BOX = 2
export const ACTIVITY_DAYS = 30

export function directionForBox(box: Box): QuestionDirection {
  return box <= RECOGNITION_MAX_BOX ? 'fr-to-vi' : 'vi-to-fr'
}
