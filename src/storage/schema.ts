import { z } from 'zod'
import { addDays } from '../engine/dates.ts'
import type { AppState } from '../engine/types.ts'

export const CURRENT_VERSION = 2

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => addDays(value, 0) === value, 'not a real calendar day')

const box = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])

const cardProgressSchema = z.object({
  cardId: z.string().min(1),
  box,
  due: isoDate,
  seenCount: z.number().int().min(0),
  lastSeen: isoDate,
})

export const appStateSchema = z
  .object({
    version: z.literal(CURRENT_VERSION),
    settings: z.object({
      newPerDay: z.union([z.literal(5), z.literal(10), z.literal(15)]),
    }),
    progress: z.record(z.string(), cardProgressSchema),
    today: z.object({
      date: isoDate,
      newIntroduced: z.number().int().min(0),
    }),
    activity: z.array(isoDate),
    grammarDone: z.array(z.string().min(1)),
  })
  .refine(
    (state) =>
      Object.entries(state.progress).every(([key, p]) => key === p.cardId),
    { message: 'progress keys must match their cardId', path: ['progress'] },
  ) satisfies z.ZodType<AppState>
