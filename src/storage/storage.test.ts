import { describe, expect, it } from 'vitest'
import {
  gradeCard,
  introduceCard,
  createInitialState,
} from '../engine/engine.ts'
import type { AppState } from '../engine/types.ts'
import {
  CORRUPTED_BACKUP_KEY,
  STORAGE_KEY,
  StorageError,
  createMemoryStore,
  exportFileName,
  exportState,
  importState,
  loadState,
  MIGRATIONS,
  parseState,
  saveState,
  type KeyValueStore,
} from './storage.ts'

const TODAY = '2026-11-01'

function sampleState(): AppState {
  let state = createInitialState(TODAY, 10)
  state = introduceCard(state, 'greetings-bonjour', TODAY)
  state = introduceCard(state, 'greetings-merci', TODAY)
  state = gradeCard(state, 'greetings-bonjour', true, '2026-11-02')
  return { ...state, activity: ['2026-10-31', TODAY] }
}

describe('loadState', () => {
  it('returns a fresh state when nothing is stored', () => {
    const result = loadState(createMemoryStore(), TODAY)
    expect(result.status).toBe('empty')
    expect(result.state).toEqual(createInitialState(TODAY))
  })

  it('returns what was saved', () => {
    const store = createMemoryStore()
    const state = sampleState()
    expect(saveState(store, state)).toBe(true)
    expect(loadState(store, TODAY)).toEqual({ state, status: 'ok' })
  })

  it('uses the key frlearn.v1', () => {
    const store = createMemoryStore()
    saveState(store, sampleState())
    expect(JSON.parse(store.getItem('frlearn.v1') ?? '{}').version).toBe(2)
  })

  it('recovers from corrupted JSON and keeps the bad value as a backup', () => {
    const store = createMemoryStore()
    store.setItem(STORAGE_KEY, '{not json')
    const result = loadState(store, TODAY)
    expect(result.status).toBe('recovered')
    expect(result.state).toEqual(createInitialState(TODAY))
    expect(result.error).toMatch(/not valid JSON/)
    expect(store.getItem(CORRUPTED_BACKUP_KEY)).toBe('{not json')
  })

  it('recovers from data that does not match the format', () => {
    const store = createMemoryStore()
    const bad = { ...sampleState(), settings: { newPerDay: 7 } }
    store.setItem(STORAGE_KEY, JSON.stringify(bad))
    expect(loadState(store, TODAY).status).toBe('recovered')
  })

  it('does not crash when reading the storage throws', () => {
    const store: KeyValueStore = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }
    expect(loadState(store, TODAY).status).toBe('empty')
  })

  it('migrates an older version and saves the result', () => {
    const store = createMemoryStore()
    const { version: _version, ...current } = sampleState()
    void _version
    store.setItem(STORAGE_KEY, JSON.stringify({ ...current, version: 0 }))
    const migrations = {
      ...MIGRATIONS,
      0: (data: unknown) => ({ ...(data as object), version: 1 }),
    }
    const result = loadState(store, TODAY, migrations)
    expect(result).toEqual({ state: sampleState(), status: 'ok' })
    expect(JSON.parse(store.getItem(STORAGE_KEY) ?? '{}').version).toBe(2)
  })

  it('upgrades a version 1 save by adding the grammar progress', () => {
    const store = createMemoryStore()
    const { grammarDone: _grammar, ...v2 } = sampleState()
    void _grammar
    store.setItem(STORAGE_KEY, JSON.stringify({ ...v2, version: 1 }))
    const result = loadState(store, TODAY)
    expect(result.status).toBe('ok')
    expect(result.state).toEqual({ ...sampleState(), grammarDone: [] })
    expect(JSON.parse(store.getItem(STORAGE_KEY) ?? '{}').version).toBe(2)
  })
})

describe('saveState', () => {
  it('returns false instead of throwing when the browser refuses', () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => undefined,
    }
    expect(saveState(store, sampleState())).toBe(false)
  })
})

describe('parseState', () => {
  it('rejects a version from the future', () => {
    const raw = JSON.stringify({ ...sampleState(), version: 3 })
    expect(() => parseState(raw)).toThrow(/newer version/)
  })

  it('rejects a missing version', () => {
    const { version: _version, ...rest } = sampleState()
    void _version
    expect(() => parseState(JSON.stringify(rest))).toThrow(/no version/)
  })

  it('rejects an older version without a migration', () => {
    const raw = JSON.stringify({ ...sampleState(), version: 0 })
    expect(() => parseState(raw)).toThrow(/no migration from version 0/)
  })

  it.each([
    [
      'an impossible box',
      (s: AppState) => ({
        ...s,
        progress: {
          x: { cardId: 'x', box: 9, due: TODAY, seenCount: 1, lastSeen: TODAY },
        },
      }),
    ],
    [
      'an invalid date',
      (s: AppState) => ({
        ...s,
        today: { date: '2026-13-45', newIntroduced: 0 },
      }),
    ],
    [
      'a negative counter',
      (s: AppState) => ({ ...s, today: { date: TODAY, newIntroduced: -1 } }),
    ],
    [
      'a progress key that differs from its card',
      (s: AppState) => ({
        ...s,
        progress: {
          x: { cardId: 'y', box: 1, due: TODAY, seenCount: 1, lastSeen: TODAY },
        },
      }),
    ],
  ])('rejects %s', (_label, corrupt) => {
    expect(() => parseState(JSON.stringify(corrupt(sampleState())))).toThrow(
      StorageError,
    )
  })
})

describe('export and import', () => {
  it('gives back the same progress after export then import', () => {
    const state = sampleState()
    expect(importState(exportState(state))).toEqual(state)
  })

  it('names the export file after the day', () => {
    expect(exportFileName(TODAY)).toBe('parler-progress-2026-11-01.json')
  })

  it('explains why a file cannot be imported', () => {
    expect(() => importState('hello')).toThrow(/not valid JSON/)
    expect(() => importState('{}')).toThrow(/no version/)
    expect(() => importState('{"version":1}')).toThrow(/data is invalid/)
  })

  it('leaves the stored progress untouched when an import fails', () => {
    const store = createMemoryStore()
    saveState(store, sampleState())
    expect(() => importState('{"version":1}')).toThrow(StorageError)
    expect(loadState(store, TODAY).state).toEqual(sampleState())
  })
})
