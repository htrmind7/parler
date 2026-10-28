import { describe, expect, it } from 'vitest'
import type { Card, Theme } from '../content/schemas.ts'
import { directionForBox } from './config.ts'
import { addDays, toIsoDate } from './dates.ts'
import {
  EngineError,
  answerInSession,
  createInitialState,
  dueCards,
  gradeCard,
  introduceCard,
  isRetry,
  isUnlocked,
  nextNewCards,
  recordActivity,
  remainingNewToday,
  rollDay,
  startSession,
} from './engine.ts'
import type { AppState, Box } from './types.ts'

const TODAY = '2026-11-01'

const themes: Theme[] = [
  { id: 'a', order: 1, titleVi: 'A', titleFr: 'A' },
  { id: 'b', order: 2, titleVi: 'B', titleFr: 'B' },
]

const card = (
  id: string,
  themeId: string,
  order: number,
  extra = {},
): Card => ({
  id,
  themeId,
  order,
  type: 'word',
  fr: id,
  vi: id,
  tipVi: id,
  status: 'validated',
  ...extra,
})

function withBox(state: AppState, cardId: string, box: Box): AppState {
  return {
    ...state,
    progress: {
      ...state.progress,
      [cardId]: {
        cardId,
        box,
        due: TODAY,
        seenCount: 1,
        lastSeen: '2026-10-30',
      },
    },
  }
}

describe('dates', () => {
  it('adds days across month, year and leap day', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('formats a date in the local time zone', () => {
    expect(toIsoDate(new Date(2026, 10, 1, 23, 59))).toBe('2026-11-01')
    expect(toIsoDate(new Date(2026, 10, 1, 0, 0))).toBe('2026-11-01')
  })
})

describe('introduceCard', () => {
  it('puts the card in box 1, due after 1 day, and counts it for today', () => {
    const state = introduceCard(createInitialState(TODAY), 'a1', TODAY)
    expect(state.progress.a1).toEqual({
      cardId: 'a1',
      box: 1,
      due: '2026-11-02',
      seenCount: 1,
      lastSeen: TODAY,
    })
    expect(state.today.newIntroduced).toBe(1)
  })

  it('refuses to introduce a card twice', () => {
    const state = introduceCard(createInitialState(TODAY), 'a1', TODAY)
    expect(() => introduceCard(state, 'a1', TODAY)).toThrow(EngineError)
  })

  it('does not mutate the previous state', () => {
    const before = createInitialState(TODAY)
    introduceCard(before, 'a1', TODAY)
    expect(before.progress).toEqual({})
    expect(before.today.newIntroduced).toBe(0)
  })
})

describe('gradeCard', () => {
  it.each([
    [1, 2, 2],
    [2, 3, 4],
    [3, 4, 8],
    [4, 5, 16],
    [5, 5, 16],
  ] as const)(
    'success in box %i lands in box %i and is due in %i days',
    (from, to, days) => {
      const state = gradeCard(
        withBox(createInitialState(TODAY), 'a1', from),
        'a1',
        true,
        TODAY,
      )
      expect(state.progress.a1.box).toBe(to)
      expect(state.progress.a1.due).toBe(addDays(TODAY, days))
      expect(state.progress.a1.seenCount).toBe(2)
      expect(state.progress.a1.lastSeen).toBe(TODAY)
    },
  )

  it.each([1, 2, 3, 4, 5] as const)(
    'a miss in box %i sends the card back to box 1, due after 1 day',
    (from) => {
      const state = gradeCard(
        withBox(createInitialState(TODAY), 'a1', from),
        'a1',
        false,
        TODAY,
      )
      expect(state.progress.a1.box).toBe(1)
      expect(state.progress.a1.due).toBe('2026-11-02')
    },
  )

  it('refuses a card that was never introduced', () => {
    expect(() =>
      gradeCard(createInitialState(TODAY), 'a1', true, TODAY),
    ).toThrow(EngineError)
  })
})

describe('dueCards', () => {
  it('returns today and overdue cards, the most overdue first', () => {
    let state = createInitialState(TODAY, 15)
    state = withBox(state, 'later', 1)
    state = withBox(state, 'today', 1)
    state = withBox(state, 'overdue', 1)
    state.progress.later.due = '2026-11-02'
    state.progress.overdue.due = '2026-10-28'
    expect(dueCards(state, TODAY).map((p) => p.cardId)).toEqual([
      'overdue',
      'today',
    ])
  })
})

describe('isUnlocked', () => {
  const phrase = card('p1', 'a', 5, { type: 'phrase', requires: ['w1', 'w2'] })

  it('is unlocked without requirements', () => {
    expect(isUnlocked(card('w1', 'a', 1), createInitialState(TODAY))).toBe(true)
  })

  it('stays locked while a required word is unseen or still in box 1', () => {
    let state = withBox(createInitialState(TODAY), 'w1', 2)
    expect(isUnlocked(phrase, state)).toBe(false)
    state = withBox(state, 'w2', 1)
    expect(isUnlocked(phrase, state)).toBe(false)
  })

  it('unlocks when all required words are at least in box 2', () => {
    let state = withBox(createInitialState(TODAY), 'w1', 2)
    state = withBox(state, 'w2', 4)
    expect(isUnlocked(phrase, state)).toBe(true)
  })
})

describe('daily counter', () => {
  it('stops at the daily limit', () => {
    let state = createInitialState(TODAY, 5)
    for (const id of ['c1', 'c2', 'c3', 'c4', 'c5']) {
      state = introduceCard(state, id, TODAY)
    }
    expect(remainingNewToday(state, TODAY)).toBe(0)
    expect(() => introduceCard(state, 'c6', TODAY)).toThrow(/daily limit/)
  })

  it('resets at midnight', () => {
    let state = createInitialState(TODAY, 5)
    for (const id of ['c1', 'c2', 'c3', 'c4', 'c5']) {
      state = introduceCard(state, id, TODAY)
    }
    const tomorrow = addDays(TODAY, 1)
    expect(rollDay(state, tomorrow).today).toEqual({
      date: tomorrow,
      newIntroduced: 0,
    })
    expect(remainingNewToday(state, tomorrow)).toBe(5)
    expect(introduceCard(state, 'c6', tomorrow).today.newIntroduced).toBe(1)
  })

  it('keeps the counter within the same day', () => {
    const state = introduceCard(createInitialState(TODAY), 'c1', TODAY)
    expect(rollDay(state, TODAY)).toBe(state)
  })
})

describe('nextNewCards', () => {
  const cards = [
    card('b1', 'b', 1),
    card('a2', 'a', 2),
    card('a1', 'a', 1),
    card('phrase', 'a', 3, { type: 'phrase', requires: ['a1'] }),
  ]

  it('orders by theme then card, skips introduced and locked cards', () => {
    const state = withBox(createInitialState(TODAY, 15), 'a2', 1)
    expect(nextNewCards(state, themes, cards, TODAY).map((c) => c.id)).toEqual([
      'a1',
      'b1',
    ])
  })

  it('stays within the remaining daily limit', () => {
    const state = createInitialState(TODAY, 5)
    const many = Array.from({ length: 8 }, (_, i) => card(`m${i}`, 'a', i))
    expect(nextNewCards(state, themes, many, TODAY)).toHaveLength(5)
  })

  it('can be restricted to one theme', () => {
    const state = createInitialState(TODAY, 15)
    const ids = nextNewCards(state, themes, cards, TODAY, 'b').map((c) => c.id)
    expect(ids).toEqual(['b1'])
  })

  it('offers a phrase once its words are in box 2', () => {
    const state = withBox(createInitialState(TODAY, 15), 'a1', 2)
    const ids = nextNewCards(state, themes, cards, TODAY).map((c) => c.id)
    expect(ids).toContain('phrase')
  })
})

describe('session', () => {
  function stateWithDue(count: number): AppState {
    let state = createInitialState(TODAY, 15)
    for (let i = 0; i < count; i++) {
      state = withBox(state, `c${String(i).padStart(2, '0')}`, 1)
    }
    return state
  }

  it('holds at most 10 due cards', () => {
    expect(startSession(stateWithDue(14), TODAY).queue).toHaveLength(10)
    expect(startSession(stateWithDue(3), TODAY).queue).toHaveLength(3)
  })

  it('removes a known card from the queue', () => {
    const session = answerInSession(startSession(stateWithDue(2), TODAY), true)
    expect(session.queue).toEqual(['c01'])
  })

  it('brings a missed card back once at the end', () => {
    let session = startSession(stateWithDue(2), TODAY)
    session = answerInSession(session, false)
    expect(session.queue).toEqual(['c01', 'c00'])
    expect(isRetry(session, 'c00')).toBe(true)
    expect(isRetry(session, 'c01')).toBe(false)
    session = answerInSession(session, true)
    session = answerInSession(session, false)
    expect(session.queue).toEqual([])
  })

  it('refuses to answer once finished', () => {
    const session = answerInSession(startSession(stateWithDue(1), TODAY), true)
    expect(() => answerInSession(session, true)).toThrow(EngineError)
  })
})

describe('recordActivity', () => {
  it('records each day once, keeping the last 30 days', () => {
    let state = createInitialState('2026-09-01')
    state = recordActivity(state, '2026-09-01')
    state = recordActivity(state, '2026-09-01')
    expect(state.activity).toEqual(['2026-09-01'])
    state = recordActivity(state, '2026-10-01')
    state = recordActivity(state, '2026-10-30')
    expect(state.activity).toEqual(['2026-10-01', '2026-10-30'])
    state = recordActivity(state, '2026-10-31')
    expect(state.activity).toEqual(['2026-10-30', '2026-10-31'])
  })
})

describe('directionForBox', () => {
  it('recognizes in boxes 1-2 and asks for production from box 3', () => {
    expect([1, 2, 3, 4, 5].map((box) => directionForBox(box as Box))).toEqual([
      'fr-to-vi',
      'fr-to-vi',
      'vi-to-fr',
      'vi-to-fr',
      'vi-to-fr',
    ])
  })
})
