import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'font-medium transition-colors border',
          {
            'bg-primary text-primary-foreground border-primary hover:opacity-90':
              variant === 'default',
            'bg-background border-border text-foreground hover:bg-muted':
              variant === 'outline',
            'bg-transparent border-transparent text-foreground hover:bg-muted':
              variant === 'ghost',
            'bg-destructive text-white border-destructive hover:opacity-90':
              variant === 'destructive',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
