import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'h-14 w-full bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground rounded-none',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
