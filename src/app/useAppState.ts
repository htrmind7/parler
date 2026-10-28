import { useCallback, useEffect, useRef, useState } from 'react'
import { recordActivity, rollDay } from '../engine/engine.ts'
import type { AppState } from '../engine/types.ts'
import {
  createMemoryStore,
  getBrowserStore,
  loadState,
  saveState,
  type KeyValueStore,
  type LoadResult,
} from '../storage/storage.ts'

export type AppStateApi = {
  state: AppState
  /** Applies a change and saves it. */
  update: (change: (state: AppState) => AppState) => void
  /** False when the browser storage is blocked: the progress is lost on close. */
  persistent: boolean
  /** Set when unreadable stored data was replaced by a fresh state. */
  recoveredError: string | null
  saveFailed: boolean
}

type Boot = {
  store: KeyValueStore
  persistent: boolean
  result: LoadResult
  state: AppState
}

function boot(today: string): Boot {
  const browserStore = getBrowserStore()
  const store = browserStore ?? createMemoryStore()
  const result = loadState(store, today)
  // A returning learner opening the app counts as an active day; a first launch
  // is recorded only once the welcome screen is completed.
  const state =
    result.status === 'ok'
      ? recordActivity(rollDay(result.state, today), today)
      : result.state
  return { store, persistent: browserStore !== null, result, state }
}

export function useAppState(today: string): AppStateApi {
  const [initial] = useState(() => boot(today))
  const [state, setState] = useState(initial.state)
  const [saveFailed, setSaveFailed] = useState(false)
  const stateRef = useRef(initial.state)

  useEffect(() => {
    saveState(initial.store, initial.state)
  }, [initial])

  const update = useCallback(
    (change: (state: AppState) => AppState) => {
      const next = change(stateRef.current)
      stateRef.current = next
      setState(next)
      setSaveFailed(!saveState(initial.store, next))
    },
    [initial.store],
  )

  return {
    state,
    update,
    persistent: initial.persistent,
    recoveredError:
      initial.result.status === 'recovered'
        ? (initial.result.error ?? '')
        : null,
    saveFailed,
  }
}
