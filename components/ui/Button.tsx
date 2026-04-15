import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-b from-[#1ed760] to-[#1aa34a] 
    text-black font-black tracking-tight
    shadow-[0_4px_15px_rgba(29,185,84,0.3)]
    hover:from-[#22e06b] hover:to-[#1db954]
    hover:shadow-[0_8px_25px_rgba(29,185,84,0.45)]
    hover:-translate-y-0.5
  `,
  secondary: `
    bg-[#282828] text-white font-bold
    border border-white/10
    hover:bg-[#333333] hover:border-white/20
    shadow-lg
  `,
  ghost: `
    bg-transparent text-[#B3B3B3] font-bold
    hover:text-white hover:bg-white/10
  `,
  danger: `
    bg-transparent text-[#ff4d5e] border border-[#ff4d5e]/30 font-bold
    hover:bg-[#ff4d5e] hover:text-white
    shadow-[0_0_15px_rgba(255,77,94,0.1)]
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs md:px-5 md:text-sm',
  md: 'px-6 py-2.5 text-sm md:px-7 md:py-3 md:text-base',
  lg: 'px-8 py-3.5 text-base md:px-10 md:py-4 md:text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        group inline-flex items-center justify-center gap-2
        rounded-full border-none cursor-pointer
        transition-all duration-300 ease-out
        active:scale-[0.96] active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon && (
        <span className="transition-transform duration-700 ease-in-out md:group-hover:rotate-[360deg]">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  )
}
