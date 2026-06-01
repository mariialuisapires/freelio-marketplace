import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
}

export function StarRating({ value, max = 5, size = 'md', interactive, onChange }: StarRatingProps) {
  const sizes = { sm: 'h-3 w-3', md: 'h-5 w-5', lg: 'h-6 w-6' }
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <Star
          key={star}
          className={cn(
            sizes[size],
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-muted-foreground',
            interactive && 'cursor-pointer transition-colors hover:text-yellow-400'
          )}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  )
}
