import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-white"
      >
        {label}
        {props.required && <span className="text-[#E22134] ml-1">*</span>}
      </label>

      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-[4px]
          bg-[#3E3E3E] border-none
          text-white text-sm placeholder:text-[#535353]
          outline-none
          transition-all duration-200
          focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'ring-2 ring-[#E22134]' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-[#E22134] flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-[#535353]">{hint}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-white">
        {label}
      </label>
      <textarea
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-[4px] resize-none
          bg-[#3E3E3E] border-none
          text-white text-sm placeholder:text-[#535353]
          outline-none transition-all duration-200
          focus:ring-2 focus:ring-[#1DB954]
          ${error ? 'ring-2 ring-[#E22134]' : ''}
          ${className}
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-[#E22134]">{error}</p>}
    </div>
  )
}
