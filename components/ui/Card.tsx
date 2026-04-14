import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-[#181818] rounded-lg p-4
        transition-colors duration-200
        ${hover ? 'cursor-pointer hover:bg-[#282828]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
