import { seenCards } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { speakFrench } from '../audio/speech.ts'
import vi from '../i18n/vi.json'
import { SpeakerIcon } from '../ui/Icons.tsx'
import { THEME_TONES, ThemeIcon } from '../ui/ThemeIcon.tsx'

export function WordsScreen({ content, state }: ScreenProps) {
  const cards = seenCards(state, content.themes, content.cards)
  const groups = content.themes
    .map((theme) => ({
      theme,
      cards: cards.filter((card) => card.themeId === theme.id),
    }))
    .filter((group) => group.cards.length > 0)

  return (
    <div className="screen">
      <h1 className="screen-title">{vi.words.title}</h1>
      {groups.length === 0 ? (
        <p className="muted">{vi.words.empty}</p>
      ) : (
        groups.map(({ theme, cards: themeCards }) => (
          <section key={theme.id}>
            <h2 className="group-title">
              <span
                className="theme-tile small"
                style={
                  {
                    '--tone': THEME_TONES[theme.id] ?? 'var(--teal)',
                  } as React.CSSProperties
                }
              >
                <ThemeIcon themeId={theme.id} size={22} />
              </span>
              {theme.titleVi}
            </h2>
            <ul className="list">
              {themeCards.map((card) => (
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
          </section>
        ))
      )}
    </div>
  )
}
