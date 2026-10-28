import { z } from 'zod'
import { ContentError } from './loader.ts'

const exampleSchema = z.object({
  fr: z.string().min(1),
  vi: z.string().min(1),
})

const sectionSchema = z.object({
  headingVi: z.string().min(1),
  bodyVi: z.string().min(1),
  examples: z.array(exampleSchema),
})

export const lessonSchema = z.object({
  id: z.string().min(1),
  order: z.number().int(),
  titleVi: z.string().min(1),
  titleFr: z.string().min(1),
  summaryVi: z.string().min(1),
  /** Number of cards the learner must have started before the lesson opens. */
  unlockAfterCards: z.number().int().min(0),
  sections: z.array(sectionSchema).min(1),
})

export type Lesson = z.infer<typeof lessonSchema>
export type LessonExample = z.infer<typeof exampleSchema>

/** Validates the grammar lessons and returns them in learning order. */
export function parseGrammar(raw: unknown): Lesson[] {
  if (!Array.isArray(raw)) {
    throw new ContentError('grammar: expected a list')
  }
  const lessons = raw.map((item, index) => {
    const result = lessonSchema.safeParse(item)
    if (result.success) return result.data
    const id = (item as { id?: unknown } | null)?.id
    const where = typeof id === 'string' ? `"${id}"` : `#${index}`
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ')
    throw new ContentError(`lesson ${where} is invalid: ${issues}`)
  })
  const seen = new Set<string>()
  for (const { id } of lessons) {
    if (seen.has(id)) throw new ContentError(`grammar: duplicate id "${id}"`)
    seen.add(id)
  }
  return [...lessons].sort((a, b) => a.order - b.order)
}
