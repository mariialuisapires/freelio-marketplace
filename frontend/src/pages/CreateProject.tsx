import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { projectsService } from '@/services/projects.service'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  title: z.string().min(5, 'Título deve ter ao menos 5 caracteres').max(255),
  description: z.string().min(20, 'Descrição deve ter ao menos 20 caracteres'),
  budget: z.number({ invalid_type_error: 'Informe um valor' }).positive('Valor deve ser positivo'),
  deadline: z.string().min(1, 'Prazo é obrigatório'),
})

type FormData = z.infer<typeof schema>

export function CreateProject() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => projectsService.create(data),
    onSuccess: (project) => {
      toast('Projeto criado com sucesso!', 'success')
      qc.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/projects/${project.id}`)
    },
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro ao criar projeto', 'error'),
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Publicar Novo Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Título do projeto</label>
              <Input placeholder="Ex: Desenvolvimento de API REST com Spring Boot" {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Descrição detalhada</label>
              <Textarea
                placeholder="Descreva o projeto, requisitos, tecnologias desejadas, entregas esperadas..."
                rows={6}
                {...register('description')}
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Orçamento (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  {...register('budget', { valueAsNumber: true })}
                />
                {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Prazo limite</label>
                <Input type="date" min={today} {...register('deadline')} />
                {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline.message}</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" loading={isPending}>
                Publicar Projeto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
