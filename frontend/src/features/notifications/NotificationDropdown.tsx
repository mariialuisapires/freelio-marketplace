import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, ChevronRight } from 'lucide-react'
import { notificationsService } from '@/services/notifications.service'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

interface Props { onClose: () => void }

function getNotificationLink(n: Notification): string {
  const t = n.title.toLowerCase()

  if (t.includes('avaliação') || t.includes('avaliacao')) return '/profile?tab=avaliacoes'
  if (t.includes('nova mensagem') || t.includes('mensagem')) return '/chat'
  if (t.includes('contrato finalizado') || t.includes('finalizado')) return '/contracts'
  if (t.includes('projeto entregue') || t.includes('entregue')) return '/contracts'
  if (t.includes('proposta aceita') || t.includes('aceita')) return '/contracts'
  if (t.includes('nova proposta') || t.includes('proposta recebida')) return '/projects'
  if (t.includes('contrato')) return '/contracts'
  if (t.includes('projeto')) return '/projects'

  return '/profile'
}

export function NotificationDropdown({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getAll(),
  })

  const { mutate: markRead } = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const notifications = data?.content ?? []
  const unread = notifications.filter(n => !n.read)

  const handleClick = (n: Notification) => {
    if (!n.read) markRead(n.id)
    navigate(getNotificationLink(n))
    onClose()
  }

  return (
    <div ref={ref} className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-semibold">Notificações</span>
        {unread.length > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {unread.length}
          </span>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <Bell className="mb-2 h-8 w-8" />
            <p className="text-sm">Sem notificações</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                'group flex items-start gap-3 border-b px-4 py-3 cursor-pointer transition-colors hover:bg-muted/60',
                !n.read && 'bg-primary/5'
              )}
            >
              {!n.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
              {n.read && <span className="mt-1.5 h-2 w-2 shrink-0" />}

              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', !n.read ? 'font-semibold' : 'font-medium')}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1 mt-1">
                {!n.read && (
                  <button
                    onClick={e => { e.stopPropagation(); markRead(n.id) }}
                    className="rounded p-1 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Marcar como lida"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t px-4 py-2 text-center">
          <button
            onClick={() => { navigate('/profile'); onClose() }}
            className="text-xs text-primary hover:underline"
          >
            Ver todas as notificações
          </button>
        </div>
      )}
    </div>
  )
}
