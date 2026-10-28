import { describe, expect, it } from 'vitest'
import type { Card, Theme } from '../content/schemas.ts'
import { createInitialState, introduceCard } from '../engine/engine.ts'
import {
  currentStreak,
  lastWeek,
  restrictToCards,
  seenCards,
  themeProgress,
  weekdayIndex,
} from './selectors.ts'

const TODAY = '2026-11-01'
const themes: Theme[] = [
  { id: 'b', order: 2, titleVi: 'B', titleFr: 'B' },
  { id: 'a', order: 1, titleVi: 'A', titleFr: 'A' },
  { id: 'empty', order: 3, titleVi: 'E', titleFr: 'E' },
]
const card = (id: string, themeId: string, order: number): Card => ({
  id,
  themeId,
  order,
  type: 'word',
  fr: id,
  vi: id,
  tipVi: id,
  status: 'validated',
})
const cards = [card('b1', 'b', 1), card('a2', 'a', 2), card('a1', 'a', 1)]

describe('selectors', () => {
  const state = introduceCard(
    introduceCard(createInitialState(TODAY, 15), 'a1', TODAY),
    'gone',
    TODAY,
  )

  it('ignores the progress of cards removed from the content', () => {
    expect(Object.keys(restrictToCards(state, cards).progress)).toEqual(['a1'])
  })

  it('counts the seen cards per theme and hides empty themes', () => {
    const result = themeProgress(state, themes, cards)
    expect(result.map((r) => [r.theme.id, r.done, r.total])).toEqual([
      ['a', 1, 2],
      ['b', 0, 1],
    ])
  })

  it('lists the seen cards in order', () => {
    expect(seenCards(state, themes, cards).map((c) => c.id)).toEqual(['a1'])
  })

  it('builds the last 7 days, today last', () => {
    const week = lastWeek(['2026-10-30', TODAY], TODAY)
    expect(week).toHaveLength(7)
    expect(week[0].date).toBe('2026-10-26')
    expect(week[6]).toEqual({ date: TODAY, active: true })
    expect(week.filter((day) => day.active)).toHaveLength(2)
  })

  it('gives Monday as 0 and Sunday as 6', () => {
    expect(weekdayIndex('2026-11-02')).toBe(0)
    expect(weekdayIndex('2026-11-01')).toBe(6)
  })
})

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-10-30', '2026-10-31', TODAY], TODAY)).toBe(3)
  })

  it('keeps the streak alive when today is not recorded yet', () => {
    expect(currentStreak(['2026-10-30', '2026-10-31'], TODAY)).toBe(2)
  })

  it('stops at the first missing day', () => {
    expect(currentStreak(['2026-10-28', '2026-10-31', TODAY], TODAY)).toBe(2)
  })

  it('is 0 without recent activity', () => {
    expect(currentStreak([], TODAY)).toBe(0)
    expect(currentStreak(['2026-10-20'], TODAY)).toBe(0)
  })
})
