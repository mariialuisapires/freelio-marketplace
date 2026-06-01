import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-xl',
}

export function Avatar({ name, photoUrl, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('relative rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0', sizes[size], className)}>
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold text-primary-foreground">{getInitials(name)}</span>
      )}
    </div>
  )
}
