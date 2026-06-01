import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  const icons = { success: CheckCircle, error: AlertCircle, info: Info }
  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div key={t.id} className={cn('flex items-center gap-3 rounded-lg border p-4 shadow-lg min-w-72 max-w-sm', colors[t.type])}>
              <Icon className="h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{t.message}</p>
              <button onClick={() => remove(t.id)}><X className="h-4 w-4" /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
