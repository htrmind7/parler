import { seenCards } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { speakFrench } from '../audio/speech.ts'
import vi from '../i18n/vi.json'
import { SpeakerIcon } from '../ui/Icons.tsx'

export function WordsScreen({ content, state }: ScreenProps) {
  const cards = seenCards(state, content.themes, content.cards)
  return (
    <div className="screen">
      <h1 className="screen-title">{vi.words.title}</h1>
      {cards.length === 0 ? (
        <p className="muted">{vi.words.empty}</p>
      ) : (
        <ul className="list">
          {cards.map((card) => (
            <li key={card.id} className="list-row">
              <button
                type="button"
                className="icon-btn"
                aria-label={vi.words.listen}
                onClick={() => speakFrench(card.fr)}
              >
                <SpeakerIcon size={22} />
              </button>
              <span className="fr-text teal">{card.fr}</span>
              <span className="muted right">{card.vi}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
