import { z } from 'zod'
import { cardSchema, themeSchema, type Card, type Theme } from './schemas.ts'

export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

export type Content = { themes: Theme[]; cards: Card[] }

function parseList<T extends z.ZodType>(
  schema: T,
  raw: unknown,
  label: string,
): z.infer<T>[] {
  if (!Array.isArray(raw)) {
    throw new ContentError(`${label}: expected a list`)
  }
  return raw.map((item, index) => {
    const result = schema.safeParse(item)
    if (result.success) return result.data
    const id = (item as { id?: unknown } | null)?.id
    const where = typeof id === 'string' ? `"${id}"` : `#${index}`
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ')
    throw new ContentError(`${label} ${where} is invalid: ${issues}`)
  })
}

function assertUniqueIds(items: { id: string }[], label: string): void {
  const seen = new Set<string>()
  for (const { id } of items) {
    if (seen.has(id)) throw new ContentError(`${label}: duplicate id "${id}"`)
    seen.add(id)
  }
}

function assertReferences(themes: Theme[], cards: Card[]): void {
  const themeIds = new Set(themes.map((theme) => theme.id))
  const wordIds = new Set(
    cards.filter((card) => card.type === 'word').map((card) => card.id),
  )
  for (const card of cards) {
    if (!themeIds.has(card.themeId)) {
      throw new ContentError(
        `card "${card.id}": unknown theme "${card.themeId}"`,
      )
    }
    for (const required of card.requires ?? []) {
      if (!wordIds.has(required)) {
        throw new ContentError(
          `card "${card.id}": required word "${required}" does not exist`,
        )
      }
    }
  }
}

/** Validates the whole content, whatever the card status. */
export function parseContent(rawThemes: unknown, rawCards: unknown): Content {
  const themes = parseList(themeSchema, rawThemes, 'theme')
  const cards = parseList(cardSchema, rawCards, 'card')
  assertUniqueIds(themes, 'theme')
  assertUniqueIds(cards, 'card')
  assertReferences(themes, cards)
  return { themes, cards }
}

/** Content published with the site: only validated cards, in display order. */
export function loadPublishedContent(
  rawThemes: unknown,
  rawCards: unknown,
): Content {
  const { themes, cards } = parseContent(rawThemes, rawCards)
  return {
    themes: [...themes].sort((a, b) => a.order - b.order),
    cards: cards
      .filter((card) => card.status === 'validated')
      .sort((a, b) => a.order - b.order),
  }
}
