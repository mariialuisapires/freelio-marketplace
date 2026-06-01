import { useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Camera, Edit3, Star, MapPin, Calendar, CheckCircle2, Heart,
  ExternalLink, Plus, Trash2, Briefcase, Award, Code2,
  MessageCircle, X, Clock, Globe, TrendingUp,
  DollarSign, Users, Link2
} from 'lucide-react'
import { usersService } from '@/services/users.service'
import { reviewsService } from '@/services/reviews.service'
import { profileService } from '@/services/profile.service'
import { projectsService } from '@/services/projects.service'
import { contractsService } from '@/services/contracts.service'
import { categoriesService } from '@/services/categories.service'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Avatar } from '@/components/common/Avatar'
import { StarRating } from '@/components/common/StarRating'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, formatCurrency, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(2000).optional(),
  title: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  website: z.string().max(500).optional(),
  linkedin: z.string().max(500).optional(),
  availability: z.enum(['AVAILABLE', 'PART_TIME', 'UNAVAILABLE'] as const).optional(),
})

const availabilityConfig = {
  AVAILABLE: { label: 'Disponível', color: 'text-green-600', dot: 'bg-green-500' },
  PART_TIME: { label: 'Parcialmente disponível', color: 'text-yellow-600', dot: 'bg-yellow-500' },
  UNAVAILABLE: { label: 'Indisponível', color: 'text-red-500', dot: 'bg-red-500' },
} as const

const statusVariant: Record<ProjectStatus, any> = {
  OPEN: 'success', IN_PROGRESS: 'info', COMPLETED: 'secondary', CANCELLED: 'destructive',
}
const statusLabel: Record<ProjectStatus, string> = {
  OPEN: 'Aberto', IN_PROGRESS: 'Em Andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado',
}

const freelancerTabs = ['Sobre', 'Projetos Realizados', 'Portfólio', 'Experiência', 'Certificações', 'Avaliações']
const clientTabs = ['Sobre', 'Projetos', 'Atividade']

function getReputation(avgRating: number | undefined, completedCount: number) {
  if (!avgRating) return null
  if (avgRating >= 4.5 && completedCount >= 5) return { icon: '⭐', label: 'Excelente Cliente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
  if (avgRating >= 4.0) return { icon: '🥇', label: 'Cliente Confiável', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
  return { icon: '✅', label: 'Cliente Ativo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
}

export function Profile() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const profileId = id ?? currentUser?.id
  const isOwner = !id || id === currentUser?.id
  const viewerIsClient = currentUser?.role === 'CLIENT'

  const [activeTab, setActiveTab] = useState(() => {
    const tabMap: Record<string, string> = {
      avaliacoes: 'Avaliações',
      portfolio: 'Portfólio',
      experiencia: 'Experiência',
      certificacoes: 'Certificações',
      projetos: 'Projetos Realizados',
      sobre: 'Sobre',
    }
    const raw = searchParams.get('tab') ?? ''
    return tabMap[raw.toLowerCase()] ?? raw ?? 'Sobre'
  })
  const [editing, setEditing] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [showExpModal, setShowExpModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [primarySpecialty, setPrimarySpecialty] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => usersService.getById(profileId!),
    enabled: !!profileId,
  })

  const isFreelancerProfile = profile?.role === 'FREELANCER'
  const isClientProfile = profile?.role === 'CLIENT'
  const tabs = isFreelancerProfile ? freelancerTabs : clientTabs

  const profileSkills = (() => {
    if (!profile?.skills) return skills.length > 0 ? skills : []
    try { return JSON.parse(profile.skills) } catch { return profile.skills.split(',').filter(Boolean) }
  })()

  const { data: reviews } = useQuery({
    queryKey: ['reviews', profileId],
    queryFn: () => reviewsService.getByFreelancer(profileId!),
    enabled: !!profileId && isFreelancerProfile,
  })

  const { data: avgRating } = useQuery({
    queryKey: ['avg-rating', profileId],
    queryFn: () => reviewsService.getAverage(profileId!),
    enabled: !!profileId && isFreelancerProfile,
  })

  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    enabled: isFreelancerProfile,
  })

  const { data: mySpecialties = [] } = useQuery({
    queryKey: ['my-specialties', profileId],
    queryFn: () => categoriesService.getFreelancerSpecialties(profileId!),
    enabled: !!profileId && isFreelancerProfile,
  })

  const { data: categorySpecialties = [] } = useQuery({
    queryKey: ['cat-specialties', selectedCategoryId],
    queryFn: () => categoriesService.getSpecialties(selectedCategoryId),
    enabled: !!selectedCategoryId,
  })

  const { mutate: saveSpecialties, isPending: savingSpecialties } = useMutation({
    mutationFn: () => categoriesService.setMySpecialties(profileId!, primarySpecialty, selectedSpecialties),
    onSuccess: () => {
      toast('Especialidades salvas!', 'success')
      setShowSpecialtyModal(false)
      qc.invalidateQueries({ queryKey: ['my-specialties', profileId] })
    },
    onError: () => toast('Erro ao salvar especialidades', 'error'),
  })

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio', profileId],
    queryFn: () => profileService.getPortfolio(profileId!),
    enabled: !!profileId && isFreelancerProfile,
  })

  const { data: completedContracts } = useQuery({
    queryKey: ['completed-contracts', profileId],
    queryFn: () => contractsService.getCompletedByFreelancer(profileId!),
    enabled: !!profileId && isFreelancerProfile,
  })

  const { data: experiences } = useQuery({
    queryKey: ['experiences', profileId],
    queryFn: () => profileService.getExperiences(profileId!),
    enabled: !!profileId && isFreelancerProfile,
  })

  const { data: certifications } = useQuery({
    queryKey: ['certifications', profileId],
    queryFn: () => profileService.getCertifications(profileId!),
    enabled: !!profileId && isFreelancerProfile,
  })

  const { data: contracts } = useQuery({
    queryKey: ['contracts-profile', profileId],
    queryFn: () => contractsService.getAll(),
    enabled: !!profileId && isOwner,
  })

  // Client projects
  const { data: clientProjects } = useQuery({
    queryKey: ['client-projects', profileId],
    queryFn: () => projectsService.getAll({ size: 50 }),
    enabled: !!profileId && isClientProfile,
  })

  const { data: isFavorited } = useQuery({
    queryKey: ['favorited', profileId],
    queryFn: () => profileService.isFavorited(profileId!),
    enabled: viewerIsClient && !!profileId && !isOwner && isFreelancerProfile,
  })

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? '',
      bio: profile?.bio ?? '',
      title: profile?.title ?? '',
      location: profile?.location ?? '',
      website: profile?.website ?? '',
      linkedin: profile?.linkedin ?? '',
      availability: (profile?.availability ?? 'AVAILABLE') as 'AVAILABLE' | 'PART_TIME' | 'UNAVAILABLE',
    },
  })

  const { mutate: updateProfile, isPending: saving } = useMutation({
    mutationFn: (data: any) => profileService.update(profileId!, { ...data, skills: skills.length > 0 ? skills : profileSkills }),
    onSuccess: () => {
      toast('Perfil atualizado!', 'success')
      setEditing(false)
      qc.invalidateQueries({ queryKey: ['user', profileId] })
    },
    onError: () => toast('Erro ao atualizar', 'error'),
  })

  const { mutate: uploadPhoto } = useMutation({
    mutationFn: (file: File) => usersService.uploadPhoto(profileId!, file),
    onSuccess: () => { toast('Foto atualizada!', 'success'); qc.invalidateQueries({ queryKey: ['user', profileId] }) },
    onError: () => toast('Erro ao fazer upload', 'error'),
  })

  const { mutate: toggleFavorite } = useMutation({
    mutationFn: () => isFavorited ? profileService.unfavorite(profileId!) : profileService.favorite(profileId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorited', profileId] }),
    onError: (e: any) => toast(e.response?.data?.message ?? 'Erro', 'error'),
  })

  const displaySkills = skills.length > 0 ? skills : profileSkills
  const addSkill = () => {
    if (newSkill.trim() && displaySkills.length < 30 && !displaySkills.includes(newSkill.trim())) {
      setSkills([...displaySkills, newSkill.trim()])
      setNewSkill('')
    }
  }
  const removeSkill = (s: string) => setSkills(displaySkills.filter((sk: string) => sk !== s))
  const saveSkills = () => {
    profileService.update(profileId!, { skills: displaySkills }).then(() => {
      toast('Skills salvas!', 'success')
      qc.invalidateQueries({ queryKey: ['user', profileId] })
    })
  }

  // Client stats
  const allProjects = clientProjects?.content ?? []
  const completedProjects = allProjects.filter(p => p.status === 'COMPLETED')
  const activeProjects = allProjects.filter(p => p.status === 'IN_PROGRESS')
  const completionRate = allProjects.length > 0 ? Math.round((completedProjects.length / allProjects.length) * 100) : 0

  // Freelancer stats
  const finishedContracts = contracts?.content.filter(c => c.status === 'FINISHED') ?? []
  const activeContracts = contracts?.content.filter(c => c.status === 'ACTIVE' || c.status === 'DELIVERED') ?? []

  if (isLoading) return (
    <div className="space-y-4 max-w-4xl">
      <div className="h-48 rounded-xl bg-muted animate-pulse" />
      <div className="h-32 rounded-xl bg-muted animate-pulse" />
    </div>
  )

  if (!profile) return <p>Usuário não encontrado.</p>

  const avail = availabilityConfig[(profile.availability ?? 'AVAILABLE') as keyof typeof availabilityConfig]
  const reputation = isClientProfile ? getReputation(undefined, completedProjects.length) : null

  return (
    <div className="max-w-4xl space-y-6">

      {/* HEADER */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative shrink-0">
              <Avatar name={profile.name} photoUrl={profile.photoUrl} size="xl" className="h-28 w-28 text-3xl" />
              {isOwner && (
                <>
                  <button onClick={() => fileRef.current?.click()}
                    className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    {profile.verified && (
                      <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isClientProfile ? 'Cliente Verificado' : 'Verificado'}
                      </span>
                    )}
                    {reputation && (
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', reputation.color)}>
                        {reputation.icon} {reputation.label}
                      </span>
                    )}
                  </div>
                  {profile.title && <p className="text-muted-foreground font-medium mb-2">{profile.title}</p>}

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                    {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Membro desde {formatDate(profile.createdAt)}</span>
                    {isFreelancerProfile && (
                      <span className="flex items-center gap-1.5">
                        <span className={cn('h-2.5 w-2.5 rounded-full', avail.dot)} />
                        <span className={avail.color}>{avail.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Links sociais */}
                  <div className="flex gap-3">
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                        <Globe className="h-3.5 w-3.5" /> Website
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                        <Link2 className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                    )}
                  </div>

                  {isFreelancerProfile && avgRating != null && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating value={Math.round(avgRating)} size="sm" />
                      <span className="font-bold">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({reviews?.totalElements ?? 0} avaliações)</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {isOwner && !editing && (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                      <Edit3 className="h-3.5 w-3.5" /> Editar
                    </Button>
                  )}
                  {!isOwner && isFreelancerProfile && (
                    <>
                      {viewerIsClient && (
                        <Button size="sm" variant="outline" onClick={() => toggleFavorite()}>
                          <Heart className={cn('h-4 w-4', isFavorited && 'fill-red-500 text-red-500')} />
                          {isFavorited ? 'Favoritado' : 'Favoritar'}
                        </Button>
                      )}
                      <Button size="sm" onClick={() => navigate(`/chat/${profileId}`)}>
                        <MessageCircle className="h-4 w-4" /> Contatar
                      </Button>
                    </>
                  )}
                  {!isOwner && isClientProfile && (
                    <Button size="sm" onClick={() => navigate(`/chat/${profileId}`)}>
                      <MessageCircle className="h-4 w-4" /> Contatar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          {isFreelancerProfile && isOwner && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-6">
              {[
                { label: 'Projetos concluídos', value: finishedContracts.length },
                { label: 'Projetos ativos', value: activeContracts.length },
                { label: 'Portfólio', value: portfolio?.length ?? 0 },
                { label: 'Certificações', value: certifications?.length ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-primary">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          )}

          {isClientProfile && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-6">
              {[
                { label: 'Projetos publicados', value: allProjects.length },
                { label: 'Concluídos', value: completedProjects.length },
                { label: 'Ativos', value: activeProjects.length },
                { label: 'Taxa de conclusão', value: `${completionRate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-primary">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDIT FORM */}
      {editing && (
        <Card>
          <CardHeader><CardTitle>Editar Perfil</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(d => updateProfile(d))} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="mb-1 block text-sm font-medium">Nome</label><Input {...register('name')} /></div>
                <div><label className="mb-1 block text-sm font-medium">Título profissional</label><Input placeholder="Ex: Dev Full Stack Java & React" {...register('title')} /></div>
                <div><label className="mb-1 block text-sm font-medium">Localização</label><Input placeholder="Ex: Porto Alegre - RS" {...register('location')} /></div>
                {isFreelancerProfile && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">Disponibilidade</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('availability')}>
                      <option value="AVAILABLE">🟢 Disponível</option>
                      <option value="PART_TIME">🟡 Parcialmente disponível</option>
                      <option value="UNAVAILABLE">🔴 Indisponível</option>
                    </select>
                  </div>
                )}
                <div><label className="mb-1 block text-sm font-medium">Website</label><Input placeholder="https://seusite.com" {...register('website')} /></div>
                <div><label className="mb-1 block text-sm font-medium">LinkedIn</label><Input placeholder="https://linkedin.com/in/..." {...register('linkedin')} /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium">Biografia</label><Textarea rows={4} placeholder="Descreva sua experiência..." {...register('bio')} /></div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => { setEditing(false); reset() }}>Cancelar</Button>
                <Button type="submit" loading={saving}>Salvar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TABS */}
      <div>
        <div className="flex gap-1 border-b mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {tab}
            </button>
          ))}
        </div>

        {/* ===== FREELANCER TABS ===== */}
        {isFreelancerProfile && activeTab === 'Sobre' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Sobre</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground leading-relaxed">{profile.bio || 'Este usuário ainda não adicionou uma descrição.'}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5" /> Skills</CardTitle>
                {isOwner && <span className="text-xs text-muted-foreground">{displaySkills.length}/30</span>}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {displaySkills.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma skill adicionada.</p>}
                  {displaySkills.map((s: string) => (
                    <span key={s} className="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                      {s}
                      {isOwner && <button onClick={() => removeSkill(s)} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>}
                    </span>
                  ))}
                </div>
                {isOwner && (
                  <div className="flex gap-2 flex-wrap">
                    <Input placeholder="Adicionar skill (ex: React, Docker...)" value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="max-w-xs" />
                    <Button size="sm" onClick={addSkill} disabled={!newSkill.trim()}><Plus className="h-4 w-4" /></Button>
                    {displaySkills.length > 0 && <Button size="sm" variant="outline" onClick={saveSkills}>Salvar</Button>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card Especialidades */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" /> Especialidades
                </CardTitle>
                {isOwner && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedSpecialties(mySpecialties.map(s => s.id))
                    setPrimarySpecialty(mySpecialties[0]?.id ?? '')
                    setShowSpecialtyModal(true)
                  }}>
                    <Plus className="h-3.5 w-3.5" /> Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {mySpecialties.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {isOwner ? 'Adicione suas especialidades para aparecer nas categorias.' : 'Nenhuma especialidade cadastrada.'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {mySpecialties.map(s => (
                      <span key={s.id} className={cn(
                        'rounded-full px-3 py-1 text-sm font-medium',
                        s.id === primarySpecialty || mySpecialties[0]?.id === s.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      )}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {isFreelancerProfile && activeTab === 'Projetos Realizados' && (
          <div className="space-y-4">
            {!completedContracts?.content.length ? (
              <EmptyState icon={Briefcase} title="Nenhum projeto realizado ainda"
                description="Os projetos concluídos através do Freelio aparecerão aqui." />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {completedContracts.totalElements} projeto(s) concluído(s) através da plataforma
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {completedContracts.content.map(c => (
                    <Link key={c.id} to={`/projects/${c.project.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold line-clamp-2 mb-1">{c.project.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">{c.project.description}</p>
                            </div>
                            <Badge variant="success" className="shrink-0">Concluído</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1 text-primary font-semibold">
                              <DollarSign className="h-3.5 w-3.5" />{formatCurrency(c.agreedPrice)}
                            </span>
                            {c.endDate && (
                              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                <Clock className="h-3 w-3" />Entregue em {formatDate(c.endDate)}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Avatar name={c.project.client.name} photoUrl={c.project.client.photoUrl} size="sm" />
                            <div>
                              <p className="text-xs font-medium">{c.project.client.name}</p>
                              <p className="text-xs text-muted-foreground">Cliente</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {isFreelancerProfile && activeTab === 'Portfólio' && (
          <div className="space-y-4">
            {isOwner && <Button onClick={() => setShowPortfolioModal(true)}><Plus className="h-4 w-4" /> Adicionar Projeto</Button>}
            {!portfolio?.length ? <EmptyState icon={Briefcase} title="Nenhum projeto no portfólio" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {portfolio.map(p => (
                  <Card key={p.id} className="overflow-hidden">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="h-44 w-full object-cover" /> :
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><Code2 className="h-10 w-10 text-primary/40" /></div>}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold">{p.title}</h3>
                        {isOwner && <button onClick={() => profileService.deletePortfolio(profileId!, p.id).then(() => qc.invalidateQueries({ queryKey: ['portfolio', profileId] }))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                      </div>
                      {p.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                      <div className="flex flex-wrap gap-1 mb-4">{p.technologies.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
                      <div className="flex gap-2">
                        {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><ExternalLink className="h-3.5 w-3.5" /> Demo</Button></a>}
                        {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><Code2 className="h-3.5 w-3.5" /> GitHub</Button></a>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {isFreelancerProfile && activeTab === 'Experiência' && (
          <div className="space-y-4">
            {isOwner && <Button onClick={() => setShowExpModal(true)}><Plus className="h-4 w-4" /> Adicionar Experiência</Button>}
            {!experiences?.length ? <EmptyState icon={Briefcase} title="Nenhuma experiência cadastrada" /> : (
              experiences.map(exp => (
                <Card key={exp.id}><CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10"><Briefcase className="h-6 w-6 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-primary font-medium">{exp.company}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />{formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Atual'}
                        </p>
                        {exp.description && <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>}
                      </div>
                    </div>
                    {isOwner && <button onClick={() => profileService.deleteExperience(profileId!, exp.id).then(() => qc.invalidateQueries({ queryKey: ['experiences', profileId] }))} className="text-muted-foreground hover:text-red-500 shrink-0"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </CardContent></Card>
              ))
            )}
          </div>
        )}

        {isFreelancerProfile && activeTab === 'Certificações' && (
          <div className="space-y-4">
            {isOwner && <Button onClick={() => setShowCertModal(true)}><Plus className="h-4 w-4" /> Adicionar Certificação</Button>}
            {!certifications?.length ? <EmptyState icon={Award} title="Nenhuma certificação cadastrada" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certifications.map(cert => (
                  <Card key={cert.id}><CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900"><Award className="h-5 w-5 text-yellow-600" /></div>
                        <div>
                          <h3 className="font-semibold text-sm">{cert.name}</h3>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(cert.issueDate)}</p>
                          {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"><ExternalLink className="h-3 w-3" /> Ver credencial</a>}
                        </div>
                      </div>
                      {isOwner && <button onClick={() => profileService.deleteCertification(profileId!, cert.id).then(() => qc.invalidateQueries({ queryKey: ['certifications', profileId] }))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>}
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            )}
          </div>
        )}

        {isFreelancerProfile && activeTab === 'Avaliações' && (
          <div className="space-y-4">
            {avgRating != null && (
              <Card><CardContent className="p-6 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">{avgRating.toFixed(1)}</div>
                  <StarRating value={Math.round(avgRating)} size="md" />
                  <p className="text-sm text-muted-foreground mt-1">{reviews?.totalElements ?? 0} avaliações</p>
                </div>
              </CardContent></Card>
            )}
            {!reviews?.content.length ? <EmptyState icon={Star} title="Nenhuma avaliação ainda" /> : (
              reviews.content.map(r => (
                <Card key={r.id}><CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar name={r.client.name} photoUrl={r.client.photoUrl} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{r.client.name}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                      </div>
                      <StarRating value={r.rating} size="sm" />
                      {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
                    </div>
                  </div>
                </CardContent></Card>
              ))
            )}
          </div>
        )}

        {/* ===== CLIENT TABS ===== */}
        {isClientProfile && activeTab === 'Sobre' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Sobre</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio || 'Este cliente ainda não adicionou uma descrição.'}
                </p>
              </CardContent>
            </Card>

            {/* Estatísticas detalhadas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Briefcase, label: 'Total de Projetos', value: allProjects.length, color: 'text-blue-500' },
                { icon: CheckCircle2, label: 'Projetos Concluídos', value: completedProjects.length, color: 'text-green-500' },
                { icon: TrendingUp, label: 'Taxa de Conclusão', value: `${completionRate}%`, color: 'text-primary' },
                { icon: Clock, label: 'Projetos Ativos', value: activeProjects.length, color: 'text-yellow-500' },
                { icon: Users, label: 'Freelancers Contratados', value: completedProjects.length, color: 'text-purple-500' },
                { icon: DollarSign, label: 'Projetos Publicados', value: allProjects.length, color: 'text-emerald-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <Card key={label}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-full bg-muted p-3"><Icon className={cn('h-5 w-5', color)} /></div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isClientProfile && activeTab === 'Projetos' && (
          <div className="space-y-4">
            {isOwner && (
              <Button asChild>
                <Link to="/projects/create"><Plus className="h-4 w-4" /> Novo Projeto</Link>
              </Button>
            )}
            {!allProjects.length ? (
              <EmptyState icon={Briefcase} title="Nenhum projeto publicado ainda"
                description="Este cliente ainda não publicou projetos na plataforma." />
            ) : (
              allProjects.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{p.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{formatCurrency(p.budget)}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(p.deadline)}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</span>
                          </div>
                        </div>
                        <Badge variant={statusVariant[p.status]}>{statusLabel[p.status]}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}

        {isClientProfile && activeTab === 'Atividade' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Atividade na Plataforma</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Membro desde', value: formatDate(profile.createdAt) },
                  { label: 'Projetos publicados', value: allProjects.length.toString() },
                  { label: 'Projetos concluídos', value: completedProjects.length.toString() },
                  { label: 'Taxa de conclusão', value: `${completionRate}%` },
                  { label: 'Freelancers contratados', value: completedProjects.length.toString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-semibold text-sm">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* MODALS (Freelancer only) */}
      {isFreelancerProfile && (
        <>
          <PortfolioModal open={showPortfolioModal} onClose={() => setShowPortfolioModal(false)}
            onSave={(data: any) => profileService.addPortfolio(profileId!, data).then(() => { qc.invalidateQueries({ queryKey: ['portfolio', profileId] }); setShowPortfolioModal(false); toast('Projeto adicionado!', 'success') })} />
          <ExperienceModal open={showExpModal} onClose={() => setShowExpModal(false)}
            onSave={(data: any) => profileService.addExperience(profileId!, data).then(() => { qc.invalidateQueries({ queryKey: ['experiences', profileId] }); setShowExpModal(false); toast('Experiência adicionada!', 'success') })} />
          <CertificationModal open={showCertModal} onClose={() => setShowCertModal(false)}
            onSave={(data: any) => profileService.addCertification(profileId!, data).then(() => { qc.invalidateQueries({ queryKey: ['certifications', profileId] }); setShowCertModal(false); toast('Certificação adicionada!', 'success') })} />

          {/* Modal Especialidades */}
          <Modal open={showSpecialtyModal} onClose={() => setShowSpecialtyModal(false)} title="Minhas Especialidades" className="max-w-lg">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Categoria principal *</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedCategoryId}
                  onChange={e => { setSelectedCategoryId(e.target.value); setSelectedSpecialties([]); setPrimarySpecialty('') }}
                >
                  <option value="">Selecione uma categoria...</option>
                  {allCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              {selectedCategoryId && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Especialidades ({selectedSpecialties.length} selecionadas)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {categorySpecialties.map(s => {
                      const selected = selectedSpecialties.includes(s.id)
                      const isPrimary = primarySpecialty === s.id
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setSelectedSpecialties(prev => prev.filter(id => id !== s.id))
                              if (isPrimary) setPrimarySpecialty('')
                            } else {
                              setSelectedSpecialties(prev => [...prev, s.id])
                              if (!primarySpecialty) setPrimarySpecialty(s.id)
                            }
                          }}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-sm font-medium border transition-colors',
                            selected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-muted-foreground border-input hover:border-primary hover:text-primary'
                          )}
                        >
                          {s.name}
                          {isPrimary && <span className="ml-1 text-xs opacity-70">★</span>}
                        </button>
                      )
                    })}
                  </div>
                  {selectedSpecialties.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Clique em uma especialidade selecionada (em verde) para marcá-la como principal (★)
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowSpecialtyModal(false)}>Cancelar</Button>
                <Button
                  className="flex-1"
                  loading={savingSpecialties}
                  disabled={!primarySpecialty || selectedSpecialties.length === 0}
                  onClick={() => saveSpecialties()}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  )
}

function PortfolioModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', githubUrl: '', demoUrl: '', technologies: [] as string[], tech: '' })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open={open} onClose={onClose} title="Adicionar Projeto ao Portfólio" className="max-w-lg">
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Título *</label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Descrição</label><Textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium">URL da Imagem</label><Input placeholder="https://..." value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} /></div>
          <div><label className="text-sm font-medium">GitHub</label><Input placeholder="https://github.com/..." value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Demo</label><Input placeholder="https://..." value={form.demoUrl} onChange={e => set('demoUrl', e.target.value)} /></div>
        </div>
        <div>
          <label className="text-sm font-medium">Tecnologias</label>
          <div className="flex gap-2 mt-1 mb-2">
            <Input placeholder="Ex: React" value={form.tech} onChange={e => set('tech', e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (form.tech.trim()) { set('technologies', [...form.technologies, form.tech.trim()]); set('tech', '') } } }} />
            <Button size="sm" type="button" onClick={() => { if (form.tech.trim()) { set('technologies', [...form.technologies, form.tech.trim()]); set('tech', '') } }}>+</Button>
          </div>
          <div className="flex flex-wrap gap-1">{form.technologies.map(t => <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => set('technologies', form.technologies.filter((x: string) => x !== t))}>{t} ×</Badge>)}</div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={!form.title} onClick={() => onSave({ title: form.title, description: form.description || undefined, imageUrl: form.imageUrl || undefined, githubUrl: form.githubUrl || undefined, demoUrl: form.demoUrl || undefined, technologies: form.technologies })}>Salvar</Button>
        </div>
      </div>
    </Modal>
  )
}

function ExperienceModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ company: '', position: '', startDate: '', endDate: '', description: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open={open} onClose={onClose} title="Adicionar Experiência Profissional">
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Empresa *</label><Input value={form.company} onChange={e => set('company', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Cargo *</label><Input value={form.position} onChange={e => set('position', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium">Início *</label><Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
          <div><label className="text-sm font-medium">Fim (vazio = Atual)</label><Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
        </div>
        <div><label className="text-sm font-medium">Descrição</label><Textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={!form.company || !form.position || !form.startDate}
            onClick={() => onSave({ company: form.company, position: form.position, startDate: form.startDate, endDate: form.endDate || undefined, description: form.description || undefined })}>Salvar</Button>
        </div>
      </div>
    </Modal>
  )
}

function CertificationModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ name: '', issuer: '', issueDate: '', credentialUrl: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open={open} onClose={onClose} title="Adicionar Certificação">
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Nome *</label><Input placeholder="Ex: AWS Cloud Practitioner" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Emissor *</label><Input placeholder="Ex: Amazon Web Services" value={form.issuer} onChange={e => set('issuer', e.target.value)} /></div>
        <div><label className="text-sm font-medium">Data *</label><Input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} /></div>
        <div><label className="text-sm font-medium">URL da Credencial</label><Input placeholder="https://..." value={form.credentialUrl} onChange={e => set('credentialUrl', e.target.value)} /></div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={!form.name || !form.issuer || !form.issueDate}
            onClick={() => onSave({ name: form.name, issuer: form.issuer, issueDate: form.issueDate, credentialUrl: form.credentialUrl || undefined })}>Salvar</Button>
        </div>
      </div>
    </Modal>
  )
}
