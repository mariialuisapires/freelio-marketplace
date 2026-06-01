import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MessageCircle, User } from 'lucide-react'
import { messagesService } from '@/services/messages.service'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import type { Message } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function Chat() {
  const { userId: selectedUserId } = useParams<{ userId?: string }>()
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: inbox } = useQuery({
    queryKey: ['inbox'],
    queryFn: () => messagesService.getInbox(),
  })

  const { data: conversation } = useQuery({
    queryKey: ['conversation', selectedUserId],
    queryFn: () => messagesService.getConversation(selectedUserId!),
    enabled: !!selectedUserId,
  })

  useEffect(() => {
    if (conversation) setMessages(conversation.content)
  }, [conversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const { sendMessage } = useWebSocket({
    enabled: !!user,
    onMessage: (msg) => {
      if (msg.senderId === selectedUserId || msg.receiverId === selectedUserId) {
        setMessages(prev => [...prev, msg])
      }
      qc.invalidateQueries({ queryKey: ['inbox'] })
    },
  })

  const { mutate: sendRest } = useMutation({
    mutationFn: (text: string) => messagesService.send({ receiverId: selectedUserId!, content: text }),
    onSuccess: (msg) => setMessages(prev => [...prev, msg]),
  })

  const handleSend = () => {
    if (!content.trim() || !selectedUserId) return
    const text = content.trim()
    setContent('')
    sendMessage(selectedUserId, text)
    sendRest(text)
  }

  const contacts = inbox?.content.reduce<Record<string, Message>>((acc, msg) => {
    const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId
    if (!acc[otherId]) acc[otherId] = msg
    return acc
  }, {}) ?? {}

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r bg-muted/20">
        <div className="border-b p-4">
          <h2 className="font-semibold">Mensagens</h2>
        </div>
        <div className="overflow-y-auto">
          {Object.entries(contacts).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Sem conversas ainda</p>
          ) : (
            Object.entries(contacts).map(([otherId, lastMsg]) => {
              const otherName = lastMsg.senderId === user?.id ? lastMsg.receiverName : lastMsg.senderName
              const otherPhoto = lastMsg.senderId === user?.id ? lastMsg.receiverPhotoUrl : lastMsg.senderPhotoUrl
              return (
                <a key={otherId} href={`/chat/${otherId}`} className={cn(
                  'flex items-center gap-3 p-4 hover:bg-muted transition-colors',
                  selectedUserId === otherId && 'bg-muted'
                )}>
                  <Avatar name={otherName} photoUrl={otherPhoto} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{otherName}</p>
                    <p className="text-xs text-muted-foreground truncate">{lastMsg.content}</p>
                  </div>
                </a>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedUserId ? (
        <div className="flex flex-1 flex-col">
          {/* Header com link para perfil */}
          {(() => {
            const contact = Object.entries(contacts).find(([id]) => id === selectedUserId)
            if (!contact) return null
            const [otherId, lastMsg] = contact
            const otherName = lastMsg.senderId === user?.id ? lastMsg.receiverName : lastMsg.senderName
            const otherPhoto = lastMsg.senderId === user?.id ? lastMsg.receiverPhotoUrl : lastMsg.senderPhotoUrl
            return (
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Avatar name={otherName} photoUrl={otherPhoto} size="sm" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{otherName}</p>
                </div>
                <button
                  onClick={() => navigate(`/profile/${otherId}`)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="h-3.5 w-3.5" /> Ver perfil
                </button>
              </div>
            )
          })()}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id
              return (
                <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                  <Avatar
                    name={isMe ? user.name : msg.senderName}
                    photoUrl={msg.senderPhotoUrl}
                    size="sm"
                  />
                  <div className={cn('max-w-xs rounded-2xl px-4 py-2 text-sm', isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none')}>
                    <p>{msg.content}</p>
                    <p className={cn('mt-1 text-xs', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {formatDateTime(msg.sentAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div className="border-t p-4 flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={!content.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState icon={MessageCircle} title="Selecione uma conversa" description="Escolha um contato para começar a conversar." />
        </div>
      )}
    </div>
  )
}
