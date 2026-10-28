import { z } from 'zod'

export const themeSchema = z.object({
  id: z.string().min(1),
  order: z.number().int(),
  titleVi: z.string().min(1),
  titleFr: z.string().min(1),
})

export const cardSchema = z.object({
  id: z.string().min(1),
  themeId: z.string().min(1),
  order: z.number().int(),
  type: z.enum(['word', 'phrase']),
  fr: z.string().min(1),
  vi: z.string().min(1),
  tipVi: z.string().min(1),
  exampleFr: z.string().min(1).optional(),
  exampleVi: z.string().min(1).optional(),
  // Optional in V0: pronunciation uses the browser speech synthesis
  audio: z
    .object({ main: z.string().min(1), example: z.string().min(1).optional() })
    .optional(),
  requires: z.array(z.string().min(1)).optional(),
  status: z.enum(['draft', 'validated']),
  reviewNotes: z.string().optional(),
})

export type Theme = z.infer<typeof themeSchema>
export type Card = z.infer<typeof cardSchema>
