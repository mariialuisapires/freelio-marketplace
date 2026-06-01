import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { Message } from '@/types'

interface UseWebSocketOptions {
  onMessage: (msg: Message) => void
  enabled: boolean
}

export function useWebSocket({ onMessage, enabled }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken')
    if (!token || !enabled) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (frame) => {
          try {
            const msg: Message = JSON.parse(frame.body)
            onMessage(msg)
          } catch { /* ignore */ }
        })
      },
    })

    client.activate()
    clientRef.current = client
  }, [onMessage, enabled])

  const sendMessage = useCallback((receiverId: string, content: string) => {
    clientRef.current?.publish({
      destination: '/app/chat',
      body: JSON.stringify({ receiverId, content }),
    })
  }, [])

  useEffect(() => {
    connect()
    return () => { clientRef.current?.deactivate() }
  }, [connect])

  return { sendMessage }
}
