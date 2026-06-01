import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, DollarSign, Clock, ArrowLeft, Send, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { projectsService } from '@/services/projects.service'
import { proposalsService } from '@/services/proposals.service'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Avatar } from '@/components/common/Avatar'
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import type { ProposalStatus } from '@/types'

const proposalSchema = z.object({
  message: z.string().min(20, 'Mensagem deve ter ao menos 20 caracteres'),
  price: z.number({ invalid_type_error: 'Informe um valor' }).positive('Valor deve ser positivo'),
  deliveryDays: z.number({ invalid_type_error: 'Informe o prazo' }).int().positive('Prazo deve ser positivo'),
})
type ProposalForm = z.infer<typeof proposalSchema>

const proposalStatusVariant: Record<ProposalStatus, any> = {
  PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'destructive',
}
const proposalStatusLabel: Record<ProposalStatus, string> = {
  PENDING: 'Pendente', ACCEPTED: 'Aceita', REJECTED: 'Rejeitada',
}

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [showProposalModal, setShowProposalModal] = useState(false)

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.getById(id!),
    enabled: !!id,
  })

  const { data: proposals } = useQuery({
    queryKey: ['proposals-project', id],
    queryFn: () => proposalsService.getByProject(id!),
    enabled: !!id && user?.role === 'CLIENT' && project?.client.id === user?.id,
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
  })

  const { mutate: sendProposal, isPending: sendingProposal } = useMutation({
    mutationFn: (data: ProposalForm) => proposalsService.create({ ...data, projectId: id! }),
    onSuccess: () => {
      toast('Proposta enviada com sucesso!', 'success')
      setShowProposalModal(false)
      reset()
    },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro ao enviar proposta', 'error'),
  })

  const { mutate: acceptProposal } = useMutation({
    mutationFn: proposalsService.accept,
    onSuccess: () => {
      toast('Proposta aceita! Contrato criado.', 'success')
      qc.invalidateQueries({ queryKey: ['proposals-project', id] })
      qc.invalidateQueries({ queryKey: ['project', id] })
    },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro', 'error'),
  })

  const { mutate: rejectProposal } = useMutation({
    mutationFn: proposalsService.reject,
    onSuccess: () => {
      toast('Proposta rejeitada.', 'info')
      qc.invalidateQueries({ queryKey: ['proposals-project', id] })
    },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro', 'error'),
  })

  const { mutate: deleteProject } = useMutation({
    mutationFn: () => projectsService.delete(id!),
    onSuccess: () => { toast('Projeto excluído.', 'success'); navigate('/projects') },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro', 'error'),
  })

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-8 w-1/2 rounded bg-muted animate-pulse" />
      <div className="h-48 rounded-lg bg-muted animate-pulse" />
    </div>
  )

  if (!project) return <p>Projeto não encontrado.</p>

  const isOwner = user?.id === project.client.id
  const isFreelancer = user?.role === 'FREELANCER'
  const canPropose = isFreelancer && project.status === 'OPEN'

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge variant={project.status === 'OPEN' ? 'success' : project.status === 'IN_PROGRESS' ? 'info' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>

          {/* Propostas (Client only) */}
          {isOwner && proposals && (
            <Card>
              <CardHeader>
                <CardTitle>Propostas ({proposals.totalElements})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {proposals.content.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">Nenhuma proposta ainda</p>
                ) : (
                  proposals.content.map(p => (
                    <div key={p.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.freelancer.name} size="sm" />
                          <div>
                            <p className="font-medium">{p.freelancer.name}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</p>
                          </div>
                        </div>
                        <Badge variant={proposalStatusVariant[p.status]}>
                          {proposalStatusLabel[p.status]}
                        </Badge>
                      </div>
                      <p className="mb-3 text-sm text-muted-foreground">{p.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-sm">
                          <span className="font-semibold text-primary">{formatCurrency(p.price)}</span>
                          <span className="text-muted-foreground">{p.deliveryDays} dias</span>
                        </div>
                        {p.status === 'PENDING' && project.status === 'OPEN' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => rejectProposal(p.id)} variant="outline">Rejeitar</Button>
                            <Button size="sm" onClick={() => acceptProposal(p.id)}>Aceitar</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Orçamento</span>
                <span className="ml-auto font-semibold">{formatCurrency(project.budget)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Prazo</span>
                <span className="ml-auto">{formatDate(project.deadline)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Publicado</span>
                <span className="ml-auto">{timeAgo(project.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <button
                onClick={() => navigate(`/profile/${project.client.id}`)}
                className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
              >
                <Avatar name={project.client.name} photoUrl={project.client.photoUrl} />
                <div className="text-left">
                  <p className="font-medium hover:text-primary">{project.client.name}</p>
                  <p className="text-xs text-muted-foreground">Cliente — ver perfil</p>
                </div>
              </button>
            </CardContent>
          </Card>

          {canPropose && (
            <Button className="w-full" onClick={() => setShowProposalModal(true)}>
              <Send className="h-4 w-4" /> Enviar Proposta
            </Button>
          )}

          {isOwner && project.status === 'OPEN' && (
            <Button variant="destructive" className="w-full" onClick={() => deleteProject()}>
              <Trash2 className="h-4 w-4" /> Excluir Projeto
            </Button>
          )}
        </div>
      </div>

      {/* Modal Proposta */}
      <Modal open={showProposalModal} onClose={() => setShowProposalModal(false)} title="Enviar Proposta">
        <form onSubmit={handleSubmit(d => sendProposal(d))} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Mensagem</label>
            <Textarea placeholder="Descreva sua experiência e como você pode ajudar..." rows={4} {...register('message')} />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Seu preço (R$)</label>
              <Input type="number" step="0.01" placeholder="2500.00" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Prazo (dias)</label>
              <Input type="number" placeholder="30" {...register('deliveryDays', { valueAsNumber: true })} />
              {errors.deliveryDays && <p className="mt-1 text-xs text-red-500">{errors.deliveryDays.message}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowProposalModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={sendingProposal}>Enviar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
