const strengthColors = ['bg-app-danger', 'bg-app-warn', 'bg-app-warn', 'bg-app-accent']

export function getPasswordStrength(password: string) {
  let strength = 0
  if (password.length >= 6) strength += 1
  if (password.length >= 8) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9!@#%^&*]/.test(password)) strength += 1
  return Math.min(strength, 4)
}

export function PasswordStrength({ value, id = 'password-strength' }: { value: string; id?: string }) {
  const strength = getPasswordStrength(value)
  const label = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][strength]
  const activeColor = strengthColors[Math.max(0, Math.min(strength - 1, strengthColors.length - 1))]

  return (
    <div className="space-y-2 px-1">
      <div
        id={id}
        className="flex h-1.5 w-full gap-1.5"
        role="meter"
        aria-label="Força da senha"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={strength}
        aria-valuetext={value ? label : 'Ainda não preenchida'}
      >
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            aria-hidden="true"
            className={`flex-1 rounded-full transition-colors duration-200 motion-reduce:transition-none ${strength >= segment ? activeColor : 'bg-app-raised'}`}
          />
        ))}
      </div>
      <p id={`${id}-hint`} className="flex items-center justify-between gap-3 text-xs text-app-subtle">
        <span>{value ? `Força: ${label.toLocaleLowerCase('pt-BR')}` : 'Use pelo menos 6 caracteres.'}</span>
        {value && <span className="tabular shrink-0">{strength}/4</span>}
      </p>
    </div>
  )
}
