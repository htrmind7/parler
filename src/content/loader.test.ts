import { describe, expect, it } from 'vitest'
import rawCards from '../../content/cards.json'
import rawThemes from '../../content/themes.json'
import { ContentError, loadPublishedContent, parseContent } from './loader'

const theme = {
  id: 't1',
  order: 1,
  titleVi: 'Chào hỏi',
  titleFr: 'Salutations',
}
const card = {
  id: 't1-bonjour',
  themeId: 't1',
  order: 1,
  type: 'word',
  fr: 'bonjour',
  vi: 'xin chào',
  tipVi: 'mẹo',
  status: 'validated',
}

describe('parseContent', () => {
  it('accepts a valid card', () => {
    expect(parseContent([theme], [card]).cards).toHaveLength(1)
  })

  it('rejects a card with a missing required field, naming the card and field', () => {
    const invalid = { ...card, vi: undefined }
    expect(() => parseContent([theme], [invalid])).toThrow(
      /card "t1-bonjour" is invalid: vi/,
    )
  })

  it('rejects an unknown status', () => {
    expect(() =>
      parseContent([theme], [{ ...card, status: 'published' }]),
    ).toThrow(ContentError)
  })

  it('rejects duplicate ids', () => {
    expect(() => parseContent([theme], [card, card])).toThrow(
      /duplicate id "t1-bonjour"/,
    )
  })

  it('rejects an unknown theme', () => {
    expect(() => parseContent([theme], [{ ...card, themeId: 'nope' }])).toThrow(
      /unknown theme "nope"/,
    )
  })

  it('rejects a requirement that is not an existing word', () => {
    expect(() =>
      parseContent([theme], [{ ...card, requires: ['ghost'] }]),
    ).toThrow(/required word "ghost"/)
  })
})

describe('loadPublishedContent', () => {
  it('keeps only validated cards, sorted by order', () => {
    const draft = { ...card, id: 't1-draft', order: 0, status: 'draft' }
    const second = { ...card, id: 't1-merci', order: 2 }
    const { cards } = loadPublishedContent([theme], [second, draft, card])
    expect(cards.map((c) => c.id)).toEqual(['t1-bonjour', 't1-merci'])
  })

  it('still rejects an invalid draft card', () => {
    const draft = { ...card, id: 't1-draft', status: 'draft', fr: '' }
    expect(() => loadPublishedContent([theme], [draft])).toThrow(ContentError)
  })
})

describe('content files', () => {
  it('are valid', () => {
    expect(() => parseContent(rawThemes, rawCards)).not.toThrow()
  })

  it('contain the 10 sample cards', () => {
    expect(parseContent(rawThemes, rawCards).cards).toHaveLength(10)
  })
})
