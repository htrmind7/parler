import vi from '../i18n/vi.json'
import { Button } from '../ui/Button.tsx'

export function InstallScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="screen install">
      <h1 className="screen-title">{vi.install.title}</h1>
      <div className="panel">
        <p>{vi.install.iphone}</p>
        <p>{vi.install.android}</p>
        <p className="muted">{vi.install.once}</p>
      </div>
      <Button onClick={onDone}>{vi.install.done}</Button>
    </div>
  )
}
