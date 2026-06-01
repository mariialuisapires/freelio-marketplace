import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Trash2 } from 'lucide-react'
import { proposalsService } from '@/services/proposals.service'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCurrency, timeAgo } from '@/lib/utils'
import type { ProposalStatus } from '@/types'

const statusVariant: Record<ProposalStatus, any> = {
  PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'destructive',
}
const statusLabel: Record<ProposalStatus, string> = {
  PENDING: 'Pendente', ACCEPTED: 'Aceita', REJECTED: 'Rejeitada',
}

export function MyProposals() {
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => proposalsService.getMine(),
  })

  const { mutate: deleteProposal } = useMutation({
    mutationFn: proposalsService.delete,
    onSuccess: () => {
      toast('Proposta excluída.', 'success')
      qc.invalidateQueries({ queryKey: ['my-proposals'] })
    },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro', 'error'),
  })

  const proposals = data?.content ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Minhas Propostas</h1>
        <p className="text-muted-foreground">{proposals.length} proposta(s)</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma proposta enviada" description="Explore projetos disponíveis e envie sua primeira proposta." action={<Button asChild><Link to="/projects">Ver Projetos</Link></Button>} />
      ) : (
        <div className="space-y-4">
          {proposals.map(p => (
            <Card key={p.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-center gap-3">
                      <Link to={`/projects/${p.projectId}`} className="font-semibold hover:text-primary truncate">
                        {p.projectTitle}
                      </Link>
                      <Badge variant={statusVariant[p.status]}>{statusLabel[p.status]}</Badge>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{p.message}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold text-primary">{formatCurrency(p.price)}</span>
                      <span className="text-muted-foreground">{p.deliveryDays} dias</span>
                      <span className="text-muted-foreground">{timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                  {p.status === 'PENDING' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => deleteProposal(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
