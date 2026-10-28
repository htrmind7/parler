import { speakFrench } from '../audio/speech.ts'
import vi from '../i18n/vi.json'
import type { Card } from '../content/schemas.ts'
import { Button } from './Button.tsx'
import { SpeakerIcon } from './Icons.tsx'

/** Everything about a card, shown at once while learning and on the back in review. */
export function CardDetails({ card }: { card: Card }) {
  return (
    <div className="details">
      <p className="vi-main">{card.vi}</p>
      <div className="tip">
        <span className="label">{vi.learn.tip}</span>
        <p>{card.tipVi}</p>
      </div>
      {card.exampleFr && (
        <div className="example">
          <span className="label">{vi.learn.example}</span>
          <p className="fr-text">{card.exampleFr}</p>
          {card.exampleVi && <p className="example-vi">{card.exampleVi}</p>}
          <Button
            variant="listen"
            icon={<SpeakerIcon size={20} />}
            onClick={() => speakFrench(card.exampleFr ?? '')}
          >
            {vi.learn.listenExample}
          </Button>
        </div>
      )}
    </div>
  )
}
