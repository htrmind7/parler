import { useEffect, useState } from 'react'
import { speakFrench } from '../src/audio/speech.ts'
import {
  draftsToReview,
  rejectCard,
  validateCard,
} from '../src/content/review.ts'
import type { Card } from '../src/content/schemas.ts'

type Editable = Pick<Card, 'fr' | 'vi' | 'tipVi' | 'exampleFr' | 'exampleVi'>

async function saveCards(cards: Card[]): Promise<Card[]> {
  const response = await fetch('/api/content', {
    method: 'PUT',
    body: JSON.stringify(cards),
  })
  const body = (await response.json()) as { cards?: Card[]; error?: string }
  if (!response.ok || !body.cards) throw new Error(body.error ?? 'Save failed')
  return body.cards
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

type CardEditorProps = {
  card: Card
  busy: boolean
  onValidate: (edited: Card) => void
  onSkip: () => void
  onReject: () => void
}

function CardEditor({
  card,
  busy,
  onValidate,
  onSkip,
  onReject,
}: CardEditorProps) {
  const [draft, setDraft] = useState<Editable>({
    fr: card.fr,
    vi: card.vi,
    tipVi: card.tipVi,
    exampleFr: card.exampleFr,
    exampleVi: card.exampleVi,
  })

  const update = (field: keyof Editable, value: string) =>
    setDraft((previous) => ({ ...previous, [field]: value }))

  const validate = () =>
    onValidate({
      ...card,
      fr: draft.fr.trim(),
      vi: draft.vi.trim(),
      tipVi: draft.tipVi.trim(),
      exampleFr: blankToUndefined(draft.exampleFr),
      exampleVi: blankToUndefined(draft.exampleVi),
    })

  return (
    <div className="panel">
      {card.reviewNotes && (
        <div className="notes">
          <strong>Review notes</strong>
          <div>{card.reviewNotes}</div>
        </div>
      )}

      <label htmlFor="fr">French ({card.type})</label>
      <input
        id="fr"
        className="fr"
        value={draft.fr}
        onChange={(e) => update('fr', e.target.value)}
      />
      <label htmlFor="vi">Vietnamese translation</label>
      <input
        id="vi"
        value={draft.vi}
        onChange={(e) => update('vi', e.target.value)}
      />
      <label htmlFor="tip">Vietnamese tip</label>
      <textarea
        id="tip"
        rows={3}
        value={draft.tipVi}
        onChange={(e) => update('tipVi', e.target.value)}
      />
      <label htmlFor="exfr">Example (French)</label>
      <input
        id="exfr"
        className="fr"
        value={draft.exampleFr ?? ''}
        onChange={(e) => update('exampleFr', e.target.value)}
      />
      <label htmlFor="exvi">Example (Vietnamese)</label>
      <input
        id="exvi"
        value={draft.exampleVi ?? ''}
        onChange={(e) => update('exampleVi', e.target.value)}
      />

      <div className="actions">
        <button type="button" onClick={() => speakFrench(draft.fr)}>
          Listen
        </button>
        <button
          type="button"
          disabled={!draft.exampleFr}
          onClick={() => speakFrench(draft.exampleFr ?? '')}
        >
          Listen to example
        </button>
        <button
          type="button"
          className="primary"
          disabled={busy}
          onClick={validate}
        >
          Validate
        </button>
        <button type="button" disabled={busy} onClick={onSkip}>
          Skip
        </button>
        <button
          type="button"
          className="danger"
          disabled={busy}
          onClick={onReject}
        >
          Reject
        </button>
      </div>
    </div>
  )
}

export function ReviewApp() {
  const [cards, setCards] = useState<Card[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [skipped, setSkipped] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/content')
      .then((response) => response.json())
      .then((body: { cards?: Card[]; error?: string }) => {
        if (body.cards) setCards(body.cards)
        else setError(body.error ?? 'Could not load the content')
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  async function persist(next: Card[]) {
    setBusy(true)
    setError(null)
    try {
      setCards(await saveCards(next))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!cards) {
    return <main className="review">{error ?? 'Loading…'}</main>
  }

  const pending = draftsToReview(cards).filter(
    (card) => !skipped.includes(card.id),
  )
  const current = pending[0]
  const validatedCount = cards.filter((c) => c.status === 'validated').length

  function reject(card: Card) {
    if (!window.confirm(`Reject and delete "${card.fr}"?`)) return
    try {
      void persist(rejectCard(cards!, card.id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <main className="review">
      <h1>Card review</h1>
      <p className="counter">
        {pending.length} to review · {validatedCount} validated
      </p>

      {current ? (
        <CardEditor
          key={current.id}
          card={current}
          busy={busy}
          onValidate={(edited) =>
            void persist(
              cards.map((card) =>
                card.id === edited.id ? validateCard(edited) : card,
              ),
            )
          }
          onSkip={() => setSkipped([...skipped, current.id])}
          onReject={() => reject(current)}
        />
      ) : (
        <div className="panel">Nothing left to review.</div>
      )}
      {error && <p className="error">{error}</p>}
    </main>
  )
}
