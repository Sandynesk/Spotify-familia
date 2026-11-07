import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

/** Superfície padrão das telas internas. Para itens clicáveis, use <Link>/<button> com estas mesmas classes. */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-[var(--radius-app)] border border-app-line bg-app-surface p-4 ${className}`}>
      {children}
    </div>
  )
}
