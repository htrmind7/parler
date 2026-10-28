import { describe, expect, it } from 'vitest'
import rawGrammar from '../../content/grammar.json'
import { ContentError } from './loader.ts'
import { parseGrammar } from './grammar.ts'

const lesson = {
  id: 'etre',
  order: 1,
  titleVi: 'Động từ être',
  titleFr: 'Le verbe être',
  summaryVi: 'Cách nói “là”.',
  unlockAfterCards: 10,
  sections: [
    {
      headingVi: 'Chia động từ',
      bodyVi: 'Je suis, tu es...',
      examples: [{ fr: 'Je suis ici.', vi: 'Tôi ở đây.' }],
    },
  ],
}

describe('parseGrammar', () => {
  it('accepts a valid lesson and sorts by order', () => {
    const second = { ...lesson, id: 'avoir', order: 2 }
    expect(parseGrammar([second, lesson]).map((l) => l.id)).toEqual([
      'etre',
      'avoir',
    ])
  })

  it('names the lesson and the field when something is missing', () => {
    expect(() => parseGrammar([{ ...lesson, titleVi: '' }])).toThrow(
      /lesson "etre" is invalid: titleVi/,
    )
  })

  it('rejects duplicate ids and empty lessons', () => {
    expect(() => parseGrammar([lesson, lesson])).toThrow(/duplicate id/)
    expect(() => parseGrammar([{ ...lesson, sections: [] }])).toThrow(
      ContentError,
    )
  })
})

describe('grammar content file', () => {
  it('is valid and opens gradually', () => {
    const lessons = parseGrammar(rawGrammar)
    expect(lessons.length).toBeGreaterThan(0)
    const thresholds = lessons.map((l) => l.unlockAfterCards)
    expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b))
  })
})
