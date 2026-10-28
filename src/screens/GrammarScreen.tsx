import { useState } from 'react'
import { lessonStatus } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { speakFrench } from '../audio/speech.ts'
import { format } from '../i18n/format.ts'
import vi from '../i18n/vi.json'
import { Button } from '../ui/Button.tsx'
import {
  ArrowLeftIcon,
  BookIcon,
  CheckIcon,
  LockIcon,
  SpeakerIcon,
} from '../ui/Icons.tsx'

export function GrammarScreen({
  content,
  lessons,
  state,
  update,
}: ScreenProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = lessons.find((lesson) => lesson.id === openId)

  if (open) {
    const done = state.grammarDone.includes(open.id)
    return (
      <div className="screen" key={open.id}>
        <Button
          variant="ghost"
          className="back-link"
          icon={<ArrowLeftIcon size={20} />}
          onClick={() => setOpenId(null)}
        >
          {vi.grammar.backToList}
        </Button>
        <header>
          <span className="chip chip-lesson">
            {format(vi.grammar.lessonNumber, { n: open.order })}
          </span>
          <h1 className="screen-title">{open.titleVi}</h1>
          <p className="fr-text lesson-fr">{open.titleFr}</p>
          <p className="muted">{open.summaryVi}</p>
        </header>

        {open.sections.map((section) => (
          <section key={section.headingVi} className="lesson-section">
            <h2 className="section-title">{section.headingVi}</h2>
            {section.bodyVi.split('\n\n').map((paragraph) => (
              <p key={paragraph} className="lesson-body">
                {paragraph}
              </p>
            ))}
            {section.examples.length > 0 && (
              <ul className="lesson-examples">
                {section.examples.map((example) => (
                  <li key={example.fr}>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={vi.grammar.listen}
                      onClick={() => speakFrench(example.fr)}
                    >
                      <SpeakerIcon size={20} />
                    </button>
                    <span>
                      <span className="fr-text">{example.fr}</span>
                      <span className="example-vi">{example.vi}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <Button
          variant={done ? 'soft' : 'primary'}
          icon={done ? <CheckIcon size={20} /> : undefined}
          onClick={() =>
            update((current) => ({
              ...current,
              grammarDone: done
                ? current.grammarDone.filter((id) => id !== open.id)
                : [...current.grammarDone, open.id],
            }))
          }
        >
          {done ? vi.grammar.unmark : vi.grammar.markDone}
        </Button>
      </div>
    )
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{vi.grammar.title}</h1>
      <p className="muted">{vi.grammar.intro}</p>
      <ul className="list lesson-list">
        {lessons.map((lesson) => {
          const { status, cardsMissing } = lessonStatus(
            lesson,
            state,
            content.cards,
          )
          return (
            <li key={lesson.id}>
              <button
                type="button"
                className={`lesson-row lesson-${status}`}
                disabled={status === 'locked'}
                onClick={() => setOpenId(lesson.id)}
              >
                <span className="lesson-badge">
                  {status === 'done' ? (
                    <CheckIcon size={20} />
                  ) : status === 'locked' ? (
                    <LockIcon size={18} />
                  ) : (
                    <BookIcon size={20} />
                  )}
                </span>
                <span className="lesson-text">
                  <span className="lesson-title">{lesson.titleVi}</span>
                  <span className="muted">
                    {status === 'locked'
                      ? format(vi.grammar.locked, { n: cardsMissing })
                      : lesson.summaryVi}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
