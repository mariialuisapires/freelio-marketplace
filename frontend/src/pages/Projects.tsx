import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Plus, Calendar, DollarSign, Sparkles } from 'lucide-react'
import { projectsService, type ProjectFilters } from '@/services/projects.service'
import { categoriesService } from '@/services/categories.service'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

const statusLabels: Record<ProjectStatus, string> = {
  OPEN: 'Aberto', IN_PROGRESS: 'Em Andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
}
const statusVariant: Record<ProjectStatus, any> = {
  OPEN: 'success', IN_PROGRESS: 'info', COMPLETED: 'secondary', CANCELLED: 'destructive',
}

export function Projects() {
  const { user } = useAuth()
  const isFreelancer = user?.role === 'FREELANCER'
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 0,
    status: isFreelancer ? 'OPEN' : undefined,
  })
  const [keyword, setKeyword] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'recommended' | 'all'>(isFreelancer ? 'recommended' : 'all')

  // Busca especialidades do freelancer para filtrar por categoria
  const { data: mySpecialties = [] } = useQuery({
    queryKey: ['my-specialties', user?.id],
    queryFn: () => categoriesService.getFreelancerSpecialties(user!.id),
    enabled: isFreelancer && !!user,
  })

  // Busca todas as categorias para extrair os IDs das categorias do freelancer
  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    enabled: isFreelancer,
  })

  // Extrai category IDs únicos das especialidades do freelancer
  const mySpecialtySlugs = mySpecialties.map(s => s.slug)
  const myCategoryIds = allCategories
    .filter(cat => cat.specialties.some(s => mySpecialtySlugs.includes(s.slug)))
    .map(cat => cat.id)

  const hasCategories = myCategoryIds.length > 0

  // Projetos recomendados (por categoria do freelancer)
  const { data: recommended, isLoading: loadingRec } = useQuery({
    queryKey: ['projects-recommended', myCategoryIds],
    queryFn: () => projectsService.getByCategories(myCategoryIds),
    enabled: isFreelancer && viewMode === 'recommended' && hasCategories,
  })

  // Todos os projetos (com filtros)
  const { data: allProjects, isLoading: loadingAll } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsService.getAll(filters),
    enabled: !isFreelancer || viewMode === 'all',
  })

  const data = viewMode === 'recommended' && isFreelancer ? recommended : allProjects
  const isLoading = viewMode === 'recommended' ? loadingRec : loadingAll
  const projects = data?.content ?? []

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault()
    setFilters(f => ({ ...f, keyword, page: 0 }))
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isFreelancer ? 'Oportunidades' : 'Projetos'}
          </h1>
          <p className="text-muted-foreground">
            {data?.totalElements ?? 0} projeto(s) encontrado(s)
          </p>
        </div>
        {user?.role === 'CLIENT' && (
          <Button asChild>
            <Link to="/projects/create"><Plus className="h-4 w-4" /> Novo Projeto</Link>
          </Button>
        )}
      </div>

      {/* Seletor de modo (somente freelancer) */}
      {isFreelancer && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {hasCategories && (
            <button
              onClick={() => setViewMode('recommended')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border',
                viewMode === 'recommended'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-input hover:border-primary hover:text-primary'
              )}
            >
              <Sparkles className="h-4 w-4" />
              Recomendados para você
              {recommended && recommended.totalElements > 0 && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs font-bold',
                  viewMode === 'recommended' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
                )}>
                  {recommended.totalElements}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setViewMode('all')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors border',
              viewMode === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-input hover:border-primary hover:text-primary'
            )}
          >
            Todos os projetos
          </button>
          {!hasCategories && (
            <p className="text-sm text-muted-foreground self-center">
              <Link to="/profile" className="text-primary hover:underline">
                Adicione suas especialidades
              </Link> para ver projetos recomendados
            </p>
          )}
        </div>
      )}

      {/* Filtros — somente no modo "todos" */}
      {(viewMode === 'all' || !isFreelancer) && (
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar projetos..." value={keyword} onChange={e => setKeyword(e.target.value)} />
            </div>
            <Button type="submit">Buscar</Button>
            <Button type="button" variant="outline" onClick={() => setShowFilters(f => !f)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.status ?? ''}
                  onChange={e => setFilters(f => ({ ...f, status: (e.target.value as ProjectStatus) || undefined, page: 0 }))}>
                  <option value="">Todos</option>
                  <option value="OPEN">Aberto</option>
                  <option value="IN_PROGRESS">Em Andamento</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Orçamento mínimo</label>
                <Input type="number" placeholder="R$ 0" value={filters.minBudget ?? ''}
                  onChange={e => setFilters(f => ({ ...f, minBudget: Number(e.target.value) || undefined, page: 0 }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Orçamento máximo</label>
                <Input type="number" placeholder="R$ 99999" value={filters.maxBudget ?? ''}
                  onChange={e => setFilters(f => ({ ...f, maxBudget: Number(e.target.value) || undefined, page: 0 }))} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header de recomendados */}
      {viewMode === 'recommended' && isFreelancer && hasCategories && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Projetos nas suas categorias:
          {allCategories.filter(c => myCategoryIds.includes(c.id)).map(c => (
            <span key={c.id} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              {c.icon} {c.name}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Search}
          title={viewMode === 'recommended' ? 'Nenhum projeto disponível nas suas categorias' : 'Nenhum projeto encontrado'}
          description={viewMode === 'recommended'
            ? 'Tente visualizar todos os projetos ou atualize suas especialidades no perfil.'
            : 'Tente ajustar os filtros de busca'}
          action={viewMode === 'recommended' ? (
            <Button variant="outline" onClick={() => setViewMode('all')}>Ver todos os projetos</Button>
          ) : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="h-full hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight line-clamp-2">{project.title}</h3>
                      <Badge variant={statusVariant[project.status]} className="shrink-0">
                        {statusLabels[project.status]}
                      </Badge>
                    </div>
                    {project.categoryName && (
                      <span className="mb-2 inline-block text-xs text-muted-foreground">
                        {project.categoryIcon} {project.categoryName}
                      </span>
                    )}
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(project.budget)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.deadline)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {project.client.name[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">{project.client.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {(data?.totalPages ?? 0) > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button variant="outline" disabled={data?.first}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 0) - 1 }))}>Anterior</Button>
              <span className="flex items-center px-4 text-sm">{(filters.page ?? 0) + 1} / {data?.totalPages}</span>
              <Button variant="outline" disabled={data?.last}
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 0) + 1 }))}>Próximo</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
