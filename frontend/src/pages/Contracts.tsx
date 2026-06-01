import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FileText, Star, MessageCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { contractsService } from '@/services/contracts.service'
import { reviewsService } from '@/services/reviews.service'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/common/EmptyState'
import { StarRating } from '@/components/common/StarRating'
import { Avatar } from '@/components/common/Avatar'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Contract, ContractStatus } from '@/types'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})
type ReviewForm = z.infer<typeof reviewSchema>

const statusVariant: Record<ContractStatus, any> = {
  ACTIVE: 'info', DELIVERED: 'warning', FINISHED: 'success', CANCELLED: 'destructive',
}
const statusLabel: Record<ContractStatus, string> = {
  ACTIVE: 'Ativo', DELIVERED: 'Entregue', FINISHED: 'Finalizado', CANCELLED: 'Cancelado',
}

export function Contracts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [reviewContract, setReviewContract] = useState<Contract | null>(null)
  const [rating, setRating] = useState(5)

  const { data, isLoading } = useQuery({
    queryKey: ['my-contracts'],
    queryFn: () => contractsService.getAll(),
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContractStatus }) =>
      contractsService.updateStatus(id, status),
    onSuccess: (_, vars) => {
      toast(
        vars.status === 'DELIVERED' ? 'Projeto marcado como entregue!' :
        vars.status === 'FINISHED' ? 'Contrato finalizado!' : 'Status atualizado.',
        'success'
      )
      qc.invalidateQueries({ queryKey: ['my-contracts'] })
    },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro', 'error'),
  })

  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  })

  const { mutate: createReview, isPending: reviewPending } = useMutation({
    mutationFn: (data: ReviewForm) =>
      reviewsService.create({ contractId: reviewContract!.id, rating, comment: data.comment }),
    onSuccess: () => {
      toast('Avaliação enviada!', 'success')
      setReviewContract(null)
    },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro', 'error'),
  })

  const contracts = data?.content ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contratos</h1>
        <p className="text-muted-foreground">{contracts.length} contrato(s)</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum contrato ainda" description="Aceite propostas para criar contratos." />
      ) : (
        <div className="space-y-4">
          {contracts.map(c => (
            <Card key={c.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">{c.project.title}</h3>
                      <Badge variant={statusVariant[c.status]}>{statusLabel[c.status]}</Badge>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${c.freelancer.id}`)}
                      className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar name={c.freelancer.name} photoUrl={c.freelancer.photoUrl} size="sm" />
                      <span className="text-sm font-medium hover:text-primary">{c.freelancer.name}</span>
                    </button>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Valor: <strong className="text-foreground">{formatCurrency(c.agreedPrice)}</strong></span>
                      <span>Início: {formatDate(c.startDate)}</span>
                      {c.endDate && <span>Fim: {formatDate(c.endDate)}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/chat/${user?.role === 'CLIENT' ? c.freelancer.id : c.project.client.id}`)}
                    >
                      <MessageCircle className="h-3 w-3" /> Conversar
                    </Button>
                    {user?.role === 'FREELANCER' && c.status === 'ACTIVE' && (
                      <Button size="sm" onClick={() => updateStatus({ id: c.id, status: 'DELIVERED' })}>
                        Marcar Entregue
                      </Button>
                    )}
                    {user?.role === 'CLIENT' && c.status === 'DELIVERED' && (
                      <>
                        <Button size="sm" onClick={() => updateStatus({ id: c.id, status: 'FINISHED' })}>
                          Finalizar Contrato
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setReviewContract(c); setRating(5) }}>
                          <Star className="h-3 w-3" /> Avaliar
                        </Button>
                      </>
                    )}
                    {c.status === 'FINISHED' && user?.role === 'CLIENT' && (
                      <Button size="sm" variant="outline" onClick={() => { setReviewContract(c); setRating(5) }}>
                        <Star className="h-3 w-3" /> Avaliar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Avaliação */}
      <Modal open={!!reviewContract} onClose={() => setReviewContract(null)} title="Avaliar Freelancer">
        <form onSubmit={handleSubmit(d => createReview(d))} className="space-y-4">
          <div className="text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Como foi trabalhar com <strong>{reviewContract?.freelancer.name}</strong>?
            </p>
            <StarRating value={rating} interactive onChange={setRating} size="lg" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Comentário (opcional)</label>
            <Textarea placeholder="Conte sobre a experiência..." rows={3} {...register('comment')} />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setReviewContract(null)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={reviewPending}>Enviar Avaliação</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
