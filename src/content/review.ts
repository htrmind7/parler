import { ContentError } from './loader.ts'
import type { Card } from './schemas.ts'

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val: unknown) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(
          Object.entries(val).sort(([a], [b]) => a.localeCompare(b)),
        )
      : val,
  )
}

/** Marks a reviewed card as validated; the review notes are no longer needed. */
export function validateCard(card: Card): Card {
  const validated: Card = { ...card, status: 'validated' }
  delete validated.reviewNotes
  return validated
}

/** Removes a draft card from the content. A validated card can never be rejected. */
export function rejectCard(cards: Card[], id: string): Card[] {
  const card = cards.find((item) => item.id === id)
  if (!card) throw new ContentError(`card "${id}" does not exist`)
  if (card.status === 'validated') {
    throw new ContentError(`card "${id}" is validated and cannot be rejected`)
  }
  return cards.filter((item) => item.id !== id)
}

/** Guards the rule "never modify a validated card" when saving the content. */
export function assertValidatedUnchanged(before: Card[], after: Card[]): void {
  for (const card of before) {
    if (card.status !== 'validated') continue
    const next = after.find((item) => item.id === card.id)
    if (!next) {
      throw new ContentError(`validated card "${card.id}" was removed`)
    }
    if (stableStringify(next) !== stableStringify(card)) {
      throw new ContentError(`validated card "${card.id}" was modified`)
    }
  }
}

/** Draft cards to review, those with review notes first. */
export function draftsToReview(cards: Card[]): Card[] {
  const drafts = cards.filter((card) => card.status === 'draft')
  const withNotes = drafts.filter((card) => card.reviewNotes)
  const withoutNotes = drafts.filter((card) => !card.reviewNotes)
  return [...withNotes, ...withoutNotes]
}
