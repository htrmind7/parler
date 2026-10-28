import { describe, expect, it } from 'vitest'
import { ContentError } from './loader.ts'
import {
  assertValidatedUnchanged,
  draftsToReview,
  rejectCard,
  validateCard,
} from './review.ts'
import type { Card } from './schemas.ts'

const draft: Card = {
  id: 'greetings-bonjour',
  themeId: 'greetings',
  order: 1,
  type: 'word',
  fr: 'bonjour',
  vi: 'xin chào',
  tipVi: 'mẹo',
  status: 'draft',
  reviewNotes: 'check the tip',
}
const validated: Card = { ...draft, id: 'greetings-merci', status: 'validated' }

describe('validateCard', () => {
  it('sets the status and drops the review notes', () => {
    const result = validateCard(draft)
    expect(result.status).toBe('validated')
    expect(result.reviewNotes).toBeUndefined()
    expect(draft.status).toBe('draft')
  })
})

describe('rejectCard', () => {
  it('removes a draft card', () => {
    expect(rejectCard([draft, validated], draft.id)).toEqual([validated])
  })

  it('refuses to reject a validated card', () => {
    expect(() => rejectCard([validated], validated.id)).toThrow(ContentError)
  })

  it('refuses an unknown card', () => {
    expect(() => rejectCard([draft], 'ghost')).toThrow(/does not exist/)
  })
})

describe('assertValidatedUnchanged', () => {
  it('accepts changes on drafts only', () => {
    const after = [{ ...draft, vi: 'chào' }, validated]
    expect(() =>
      assertValidatedUnchanged([draft, validated], after),
    ).not.toThrow()
  })

  it('rejects a modified validated card', () => {
    const after = [draft, { ...validated, vi: 'other' }]
    expect(() => assertValidatedUnchanged([draft, validated], after)).toThrow(
      /was modified/,
    )
  })

  it('rejects a removed validated card', () => {
    expect(() => assertValidatedUnchanged([validated], [])).toThrow(
      /was removed/,
    )
  })

  it('ignores the key order', () => {
    const reordered = Object.fromEntries(
      Object.entries(validated).reverse(),
    ) as Card
    expect(() =>
      assertValidatedUnchanged([validated], [reordered]),
    ).not.toThrow()
  })
})

describe('draftsToReview', () => {
  it('puts the cards with review notes first and skips validated ones', () => {
    const plain: Card = { ...draft, id: 'plain' }
    delete plain.reviewNotes
    const result = draftsToReview([plain, validated, draft])
    expect(result.map((card) => card.id)).toEqual([draft.id, 'plain'])
  })
})
