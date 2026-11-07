import React, { forwardRef, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
}

/** Labeled field with linked help/error text and an optional inline prefix. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, prefix, id, className, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? `field-${generatedId}`
  const helperId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-app-text">
          {label}
          {props.required && <span className="ml-1 text-app-danger" aria-hidden="true">*</span>}
        </label>
        {hint && !error && <span id={`${inputId}-hint`} className="text-xs text-app-subtle">{hint}</span>}
      </div>
      <div className={cn(
        'flex min-h-12 w-full items-center rounded-app-sm border bg-app-elevated transition-[border-color,box-shadow] duration-150 focus-within:border-app-accent focus-within:ring-1 focus-within:ring-app-accent/60',
        error ? 'border-app-danger focus-within:ring-app-danger/50' : 'border-app-line',
        props.disabled && 'cursor-not-allowed opacity-50',
      )}>
        {prefix != null && <span className="pl-4 pr-1 text-sm text-app-muted">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={helperId}
          className={cn('h-full min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-app-text outline-none placeholder:text-app-subtle', prefix != null && 'pl-1', className)}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-0.5 flex items-start gap-1.5 text-xs text-app-danger" role="alert">
          <AlertCircle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

/** Labeled multiline field following the same error and help contract as Input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? `field-${generatedId}`
  const helperId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-app-text">
          {label}
          {props.required && <span className="ml-1 text-app-danger" aria-hidden="true">*</span>}
        </label>
        {hint && !error && <span id={`${inputId}-hint`} className="text-xs text-app-subtle">{hint}</span>}
      </div>
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={helperId}
        rows={3}
        className={cn(
          'min-h-24 w-full resize-y rounded-app-sm border bg-app-elevated px-4 py-3 text-base text-app-text outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-app-subtle focus:border-app-accent focus:ring-1 focus:ring-app-accent/60 disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-app-danger focus:ring-app-danger/50' : 'border-app-line',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-0.5 flex items-start gap-1.5 text-xs text-app-danger" role="alert">
          <AlertCircle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})
