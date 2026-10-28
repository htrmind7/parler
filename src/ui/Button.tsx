type ButtonProps = {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'outline' | 'listen' | 'know' | 'dontKnow' | 'ghost'
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  icon,
  className = '',
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}
