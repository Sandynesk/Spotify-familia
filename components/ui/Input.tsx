import React from 'react'
import { AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-app-text"
        >
          {label}
          {props.required && <span className="text-app-danger ml-1" aria-hidden="true">*</span>}
        </label>
        {hint && !error && (
          <span className="text-xs text-app-subtle">{hint}</span>
        )}
      </div>

      <input
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full px-4 py-3 min-h-[48px]
          rounded-[var(--radius-app-sm)]
          bg-app-elevated border border-app-line
          text-app-text text-base placeholder:text-app-subtle
          outline-none
          transition-colors duration-200
          focus:border-app-accent focus:ring-1 focus:ring-app-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-app-danger focus:border-app-danger focus:ring-app-danger' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-app-danger flex items-center gap-1.5 mt-0.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, id, className = '', ...props }: TextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-app-text">
          {label}
          {props.required && <span className="text-app-danger ml-1" aria-hidden="true">*</span>}
        </label>
        {hint && !error && (
          <span className="text-xs text-app-subtle">{hint}</span>
        )}
      </div>

      <textarea
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full px-4 py-3 min-h-[96px]
          rounded-[var(--radius-app-sm)] resize-none
          bg-app-elevated border border-app-line
          text-app-text text-base placeholder:text-app-subtle
          outline-none transition-colors duration-200
          focus:border-app-accent focus:ring-1 focus:ring-app-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-app-danger focus:border-app-danger focus:ring-app-danger' : ''}
          ${className}
        `}
        rows={3}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-app-danger flex items-center gap-1.5 mt-0.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
