import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: string): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
