'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, icon, error, type, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    
    const isPassword = type === 'password'
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type
    const hasValue = !!props.value || !!props.defaultValue;
    const isFloating = focused || hasValue;

    return (
      <div className={cn("w-full relative", className)}>
        <div className="relative">
          <input
            {...props}
            type={currentType}
            ref={ref}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "w-full bg-[#2A2A2A] border-none rounded-lg px-4 pt-6 pb-2 text-white text-base md:text-sm outline-none transition-all duration-200",
              "focus:ring-2 focus:ring-inset focus:ring-[#1DB954] focus:shadow-[0_0_12px_rgba(29,185,84,0.15)]",
              icon ? "pl-11" : "",
              isPassword ? "pr-11" : "",
              error ? "ring-2 ring-inset ring-[#E22134] focus:ring-[#E22134] focus:shadow-[0_0_12px_rgba(226,33,52,0.15)]" : "",
              className
            )}
          />
          <label 
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none text-[#B3B3B3]",
              isFloating ? "text-xs top-2 font-medium text-[#B3B3B3]" : "text-base md:text-sm top-[18px] md:top-4",
              icon && !isFloating ? "left-11" : icon && isFloating ? "left-11" : "left-4"
            )}
          >
            {label}
          </label>
          
          {icon && (
            <div className="absolute left-4 top-[18px] text-[#B3B3B3]">
              {icon}
            </div>
          )}

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[18px] text-[#B3B3B3] hover:text-white transition-colors outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-[#E22134] text-xs mt-1.5 flex items-center gap-1 font-medium transition-all">
            {error}
          </p>
        )}
      </div>
    )
  }
)
AuthInput.displayName = 'AuthInput'
