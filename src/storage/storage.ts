import { createInitialState } from '../engine/engine.ts'
import type { AppState } from '../engine/types.ts'
import { CURRENT_VERSION, appStateSchema } from './schema.ts'

export const STORAGE_KEY = 'frlearn.v1'
/** Where an unreadable stored value is kept, so a bug never destroys the progress for good. */
export const CORRUPTED_BACKUP_KEY = 'frlearn.v1.corrupted'

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

/** The subset of the browser Storage API the app needs. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** Upgrades the data of version N to version N + 1. */
export type Migrations = Record<number, (data: unknown) => unknown>

/** No migration yet: version 1 is the first format. */
export const MIGRATIONS: Migrations = {}

export type LoadResult = {
  state: AppState
  /** empty: nothing stored yet; ok: loaded; recovered: unreadable data was replaced by a fresh state */
  status: 'empty' | 'ok' | 'recovered'
  error?: string
}

function describeIssues(error: {
  issues: { path: PropertyKey[]; message: string }[]
}): string {
  return error.issues
    .slice(0, 3)
    .map(
      (issue) =>
        `${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`,
    )
    .join('; ')
}

/** Parses and validates a stored or imported value, migrating older versions. */
export function parseState(
  raw: string,
  migrations: Migrations = MIGRATIONS,
): AppState {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new StorageError('the data is not valid JSON')
  }

  let version = (data as { version?: unknown } | null)?.version
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    throw new StorageError('the data has no version number')
  }
  if (version > CURRENT_VERSION) {
    throw new StorageError(
      `the data comes from a newer version of the app (version ${version})`,
    )
  }
  while (version < CURRENT_VERSION) {
    const migrate = migrations[version]
    if (!migrate) {
      throw new StorageError(`no migration from version ${version}`)
    }
    data = migrate(data)
    version += 1
  }

  const result = appStateSchema.safeParse(data)
  if (!result.success) {
    throw new StorageError(
      `the data is invalid (${describeIssues(result.error)})`,
    )
  }
  return result.data
}

/** Saves the state; returns false when the browser refuses (quota, private mode). */
export function saveState(store: KeyValueStore, state: AppState): boolean {
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** Reads the stored state, falling back to a fresh one if nothing usable is stored. */
export function loadState(
  store: KeyValueStore,
  today: string,
  migrations: Migrations = MIGRATIONS,
): LoadResult {
  let raw: string | null
  try {
    raw = store.getItem(STORAGE_KEY)
  } catch {
    return { state: createInitialState(today), status: 'empty' }
  }
  if (raw === null) {
    return { state: createInitialState(today), status: 'empty' }
  }

  try {
    const state = parseState(raw, migrations)
    if (JSON.parse(raw).version !== CURRENT_VERSION) saveState(store, state)
    return { state, status: 'ok' }
  } catch (error) {
    try {
      store.setItem(CORRUPTED_BACKUP_KEY, raw)
    } catch {
      // keeping a backup is best effort
    }
    return {
      state: createInitialState(today),
      status: 'recovered',
      error: (error as Error).message,
    }
  }
}

/** The progress as a JSON file content, for the export button. */
export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function exportFileName(today: string): string {
  return `parle-progress-${today}.json`
}

/** Reads an exported file; throws a StorageError with a clear message if it cannot be used. */
export function importState(
  text: string,
  migrations: Migrations = MIGRATIONS,
): AppState {
  return parseState(text, migrations)
}

/** In-memory store, used in tests and when the browser storage is unavailable. */
export function createMemoryStore(): KeyValueStore {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

/** The browser local storage, or null when it is blocked (private window, blocked site data). */
export function getBrowserStore(): KeyValueStore | null {
  try {
    const store = window.localStorage
    const probe = `${STORAGE_KEY}.probe`
    store.setItem(probe, '1')
    store.removeItem(probe)
    return store
  } catch {
    return null
  }
}
