'use client'

import React, { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string
  hint?: string
  error?: string
  icon?: React.ReactNode
  describedBy?: string
}

/** Accessible auth field with a password visibility control and inline help. */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  {
    className,
    label,
    hint,
    error,
    icon,
    describedBy,
    type,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? `auth-field-${generatedId}`
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const helperIds = [ariaDescribedBy, describedBy, hint ? hintId : undefined, error ? errorId : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-app-text">
        {label}
        {inputProps.required && <span aria-hidden="true" className="ml-1 text-app-danger">*</span>}
      </label>

      <div className={cn(
        'relative flex min-h-[52px] w-full items-center rounded-app-sm border bg-app-elevated transition-[border-color,box-shadow] duration-150 focus-within:border-app-accent focus-within:ring-1 focus-within:ring-app-accent/60',
        error ? 'border-app-danger focus-within:ring-app-danger/50' : 'border-app-line',
        inputProps.disabled && 'cursor-not-allowed opacity-50',
      )}>
        {icon && (
          <span aria-hidden="true" className="pointer-events-none absolute left-4 flex text-app-muted">
            {icon}
          </span>
        )}
        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          type={isPassword && passwordVisible ? 'text' : type}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={helperIds || undefined}
          className={cn(
            'h-full min-h-12 min-w-0 flex-1 bg-transparent py-3 text-base text-app-text outline-none placeholder:text-app-subtle',
            icon ? 'pl-11' : 'pl-4',
            isPassword ? 'pr-12' : 'pr-4',
            className,
          )}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-app-muted transition-colors hover:bg-app-raised hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-app-accent"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={passwordVisible}
          >
            {passwordVisible ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
          </button>
        )}
      </div>

      {hint && <p id={hintId} className="text-xs leading-relaxed text-app-subtle">{hint}</p>}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs leading-relaxed text-app-danger" role="alert">
          <span aria-hidden="true" className="mt-0.5">•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})
