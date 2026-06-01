import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users, Star, MapPin, CheckCircle2, MessageCircle } from 'lucide-react'
import { categoriesService } from '@/services/categories.service'
import { reviewsService } from '@/services/reviews.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/common/Avatar'
import { StarRating } from '@/components/common/StarRating'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

function FreelancerCard({ freelancer }: { freelancer: User }) {
  const navigate = useNavigate()
  const { data: avgRating } = useQuery({
    queryKey: ['avg-rating', freelancer.id],
    queryFn: () => reviewsService.getAverage(freelancer.id),
  })

  const skills = (() => {
    if (!freelancer.skills) return []
    try { return JSON.parse(freelancer.skills).slice(0, 4) } catch { return freelancer.skills.split(',').slice(0, 4) }
  })()

  const avail = freelancer.availability === 'AVAILABLE'
    ? { dot: 'bg-green-500', label: 'Disponível' }
    : freelancer.availability === 'PART_TIME'
    ? { dot: 'bg-yellow-500', label: 'Parcial' }
    : { dot: 'bg-red-500', label: 'Indisponível' }

  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Link to={`/profile/${freelancer.id}`}>
          <Avatar name={freelancer.name} photoUrl={freelancer.photoUrl} size="lg" className="shrink-0" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/profile/${freelancer.id}`} className="font-bold hover:text-primary">
                  {freelancer.name}
                </Link>
                {freelancer.verified && (
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                )}
              </div>
              {freelancer.title && (
                <p className="text-sm text-muted-foreground">{freelancer.title}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${avail.dot}`} />
              {avail.label}
            </div>
          </div>

          {freelancer.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />{freelancer.location}
            </div>
          )}

          {avgRating != null && (
            <div className="flex items-center gap-1.5 mt-2">
              <StarRating value={Math.round(avgRating)} size="sm" />
              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
            </div>
          )}

          {freelancer.bio && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{freelancer.bio}</p>
          )}

          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {skills.map((s: string) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <Button size="sm" variant="outline" asChild>
          <Link to={`/profile/${freelancer.id}`}>Ver perfil</Link>
        </Button>
        <Button size="sm" onClick={() => navigate(`/chat/${freelancer.id}`)}>
          <MessageCircle className="h-3.5 w-3.5" /> Contatar
        </Button>
      </div>
    </div>
  )
}

export function CategoryDetail() {
  const { id } = useParams<{ id: string }>()
  const [page, setPage] = useState(0)

  const { data: category, isLoading: loadingCat } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesService.getById(id!),
    enabled: !!id,
  })

  const { data: freelancers, isLoading: loadingFreelancers } = useQuery({
    queryKey: ['category-freelancers', id, page],
    queryFn: () => categoriesService.getFreelancers(id!, page),
    enabled: !!id,
  })

  if (loadingCat) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-32 rounded-xl bg-muted animate-pulse mb-8" />
    </div>
  )

  if (!category) return <p>Categoria não encontrada.</p>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <Link to="/categorias" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Todas as categorias
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground mt-1">{category.description}</p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {category.freelancerCount > 0
                  ? `${category.freelancerCount} freelancer(s) disponível(is)`
                  : 'Seja o primeiro a se especializar aqui'}
              </div>
            </div>
          </div>

          {/* Especialidades */}
          {category.specialties.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {category.specialties.map(s => (
                <span key={s.id} className="rounded-full bg-white/80 dark:bg-black/20 border px-3 py-1 text-xs font-medium">
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Freelancers */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-xl font-bold">
          Freelancers em {category.name}
          {freelancers && <span className="ml-2 text-sm font-normal text-muted-foreground">({freelancers.totalElements} resultado(s))</span>}
        </h2>

        {loadingFreelancers ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : !freelancers?.content.length ? (
          <EmptyState icon={Users} title="Nenhum freelancer nesta categoria ainda"
            description="Seja o primeiro a se especializar aqui e aparecer para os clientes!" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {freelancers.content.map(f => (
                <FreelancerCard key={f.id} freelancer={f} />
              ))}
            </div>

            {(freelancers.totalPages ?? 0) > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button variant="outline" disabled={freelancers.first} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <span className="flex items-center px-4 text-sm">{page + 1} / {freelancers.totalPages}</span>
                <Button variant="outline" disabled={freelancers.last} onClick={() => setPage(p => p + 1)}>Próximo</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
