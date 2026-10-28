export type Box = 0 | 1 | 2 | 3 | 4 | 5

export type CardProgress = {
  cardId: string
  box: Box
  due: string // next review, ISO date (YYYY-MM-DD)
  seenCount: number
  lastSeen: string // ISO date
}

export type NewPerDay = 5 | 10 | 15

export type AppState = {
  version: 2
  settings: { newPerDay: NewPerDay }
  progress: Record<string, CardProgress>
  today: { date: string; newIntroduced: number }
  activity: string[] // ISO dates of the days the app was opened (last 30 days)
  grammarDone: string[] // ids of the grammar lessons marked as understood
}

export type QuestionDirection = 'fr-to-vi' | 'vi-to-fr'

export type Session = {
  queue: string[] // card ids still to answer, the first one is current
  requeued: string[] // missed cards already given their second chance
}
