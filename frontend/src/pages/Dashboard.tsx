import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Briefcase, CheckCircle, TrendingUp, Plus, ArrowUpRight,
  Edit3, Trophy, DollarSign, Calendar, Target, ChevronRight, Send, Clock
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { projectsService } from '@/services/projects.service'
import { proposalsService } from '@/services/proposals.service'
import { contractsService } from '@/services/contracts.service'
import { reviewsService } from '@/services/reviews.service'
import { profileService } from '@/services/profile.service'
import { usersService } from '@/services/users.service'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/common/Avatar'
import { StarRating } from '@/components/common/StarRating'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function MetricCard({ icon: Icon, label, value, sub, trend, color: _color }: {
  icon: any; label: string; value: string; sub: string; trend?: 'up' | 'down'; color?: string
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
          <Icon className="h-5 w-5 text-green-500 dark:text-green-400" />
        </div>
        {trend && (
          <span className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trend === 'up'
              ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
          )}>
            <ArrowUpRight className={cn('h-3 w-3', trend === 'down' && 'rotate-180')} />
            {sub}
          </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      {!trend && <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function FreelancerDashboard() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: profileData } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => usersService.getById(user!.id),
    enabled: !!user,
  })

  const { data: proposals } = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => proposalsService.getMine(0),
  })

  const { data: contracts } = useQuery({
    queryKey: ['my-contracts'],
    queryFn: () => contractsService.getAll(),
  })

  const { data: avgRating } = useQuery({
    queryKey: ['avg-rating', user?.id],
    queryFn: () => reviewsService.getAverage(user!.id),
    enabled: !!user,
  })

  const { data: recommended } = useQuery({
    queryKey: ['projects', { status: 'OPEN', size: 4 }],
    queryFn: () => projectsService.getAll({ status: 'OPEN', size: 4 }),
  })

  const { mutate: updateAvailability } = useMutation({
    mutationFn: (availability: string) =>
      profileService.update(user!.id, { availability: availability as any }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', user?.id] }),
  })

  const allContracts = contracts?.content ?? []
  const allProposals = proposals?.content ?? []

  const finished = allContracts.filter(c => c.status === 'FINISHED')
  const active = allContracts.filter(c => c.status === 'ACTIVE' || c.status === 'DELIVERED')
  const accepted = allProposals.filter(p => p.status === 'ACCEPTED').length
  const pending = allProposals.filter(p => p.status === 'PENDING').length
  const rejected = allProposals.filter(p => p.status === 'REJECTED').length
  const total = allProposals.length

  const totalEarnings = finished.reduce((sum, c) => sum + c.agreedPrice, 0)
  const approvalRate = total > 0 ? Math.round((accepted / total) * 100) : 0

  const earningsData = (() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const earned = finished
        .filter(c => c.endDate && new Date(c.endDate).getMonth() === d.getMonth())
        .reduce((s, c) => s + c.agreedPrice, 0)
      return { month: months[d.getMonth()], ganhos: earned || 0 }
    })
  })()

  const proposalData = [
    { name: 'Aceitas', value: accepted, color: '#22C55E' },
    { name: 'Pendentes', value: pending, color: '#F59E0B' },
    { name: 'Rejeitadas', value: rejected, color: '#EF4444' },
  ].filter(d => d.value > 0)

  const upcoming = active
    .filter(c => c.project?.deadline)
    .sort((a, b) => new Date(a.project.deadline).getTime() - new Date(b.project.deadline).getTime())
    .slice(0, 4)

  const achievements = [
    { icon: '🏆', label: 'Primeira Contratação', earned: accepted >= 1 },
    { icon: '⭐', label: 'Freelancer 5 Estrelas', earned: avgRating != null && avgRating >= 4.5 },
    { icon: '🚀', label: '5 Projetos Concluídos', earned: finished.length >= 5 },
    { icon: '💰', label: 'Primeiro R$ 1.000', earned: totalEarnings >= 1000 },
    { icon: '🎯', label: '10 Propostas', earned: total >= 10 },
    { icon: '🌟', label: 'Top Freelancer', earned: finished.length >= 10 && (avgRating ?? 0) >= 4.8 },
  ]

  const isAvailable = profileData?.availability === 'AVAILABLE'
  const monthGoal = 8000
  const projectGoal = 10

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">

        {/* HERO */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar name={user?.name ?? ''} photoUrl={profileData?.photoUrl} size="xl"
                  className="h-20 w-20 text-2xl ring-2 ring-green-500/30" />
                <span className={cn(
                  'absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-[#020617]',
                  isAvailable ? 'bg-green-500' : 'bg-gray-400'
                )} />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">{getGreeting()} 👋</p>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  {user?.name?.split(' ')[0]}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  {avgRating != null && (
                    <div className="flex items-center gap-1.5">
                      <StarRating value={Math.round(avgRating)} size="sm" />
                      <span className="text-gray-900 dark:text-white font-bold text-sm">{avgRating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border',
                    isAvailable
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/25'
                  )}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400')} />
                    {isAvailable ? 'Disponível para trabalho' : 'Indisponível'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateAvailability(isAvailable ? 'UNAVAILABLE' : 'AVAILABLE')}
                className={cn('relative inline-flex h-8 w-14 items-center rounded-full transition-colors', isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-700')}
              >
                <span className={cn('inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform', isAvailable ? 'translate-x-7' : 'translate-x-1')} />
              </button>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <Edit3 className="h-3.5 w-3.5" /> Editar Perfil
                </Button>
              </Link>
              <Link to="/projects/create">
                <button className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-400 transition-colors">
                  <Plus className="h-4 w-4" /> Novo Projeto
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={DollarSign} label="Ganhos Totais" value={formatCurrency(totalEarnings)} sub={`${finished.slice(-3).length} este mês`} trend="up" />
          <MetricCard icon={Send} label="Propostas Enviadas" value={String(total)} sub={`${pending} pendentes`} trend="up" />
          <MetricCard icon={CheckCircle} label="Taxa de Aprovação" value={`${approvalRate}%`} sub={`${accepted} aceitas`} trend={approvalRate > 50 ? 'up' : 'down'} />
          <MetricCard icon={Briefcase} label="Projetos Concluídos" value={String(finished.length)} sub={`${active.length} em andamento`} trend="up" />
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-6">

          {/* COLUNA ESQUERDA */}
          <div className="space-y-6">

            {/* Gráfico ganhos */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Evolução dos Ganhos</h2>
                  <p className="text-gray-500 dark:text-slate-500 text-xs">Últimos 6 meses</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-400 text-xs font-semibold">Em crescimento</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--tw-prose-bg, #fff)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px' }}
                    formatter={(v: any) => [formatCurrency(v), 'Ganhos']}
                  />
                  <Area type="monotone" dataKey="ganhos" stroke="#22C55E" strokeWidth={2} fill="url(#gainGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut propostas */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Status das Propostas</h2>
              {proposalData.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400 dark:text-slate-600">
                  <Send className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">Nenhuma proposta ainda</p>
                  <Link to="/projects" className="mt-3 text-green-600 dark:text-green-400 text-xs hover:underline">Explorar projetos</Link>
                </div>
              ) : (
                <div className="flex items-center gap-6 flex-wrap">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={proposalData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                        {proposalData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 flex-1">
                    {proposalData.map(d => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-600 dark:text-slate-400 text-sm">{d.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 dark:text-white font-bold text-sm">{d.value}</span>
                          <span className="text-gray-400 dark:text-slate-600 text-xs ml-1">({total > 0 ? Math.round((d.value / total) * 100) : 0}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Projetos recentes */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Projetos Recentes</h2>
                <Link to="/contracts" className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-500">
                  Ver todos <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {allContracts.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-slate-600 py-6 text-sm">Nenhum projeto ainda</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {allContracts.slice(0, 5).map(c => {
                    const statusConfig = {
                      ACTIVE: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25' },
                      DELIVERED: { label: 'Revisão', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/25' },
                      FINISHED: { label: 'Concluído', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25' },
                      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25' },
                    }[c.status]
                    return (
                      <div key={c.id} className="flex items-center justify-between rounded-xl bg-muted border border-border px-4 py-3 hover:border-green-400 dark:hover:border-green-500/40 transition-colors group">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                            <Briefcase className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 dark:text-white text-sm font-semibold truncate">{c.project.title}</p>
                            <p className="text-gray-500 dark:text-slate-500 text-xs mt-0.5">{c.project.client.name} · {formatCurrency(c.agreedPrice)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Oportunidades */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Oportunidades Recomendadas</h2>
                  <p className="text-gray-500 dark:text-slate-500 text-xs">Projetos compatíveis com seu perfil</p>
                </div>
                <Link to="/projects" className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-500">
                  Ver mais <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(recommended?.content ?? []).slice(0, 4).map(p => (
                  <div key={p.id} className="rounded-xl bg-muted border border-border p-4 hover:border-green-400 dark:hover:border-green-500/40 transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900 dark:text-white text-sm font-semibold line-clamp-2 leading-tight flex-1 pr-2">{p.title}</h3>
                      <span className="shrink-0 text-green-600 dark:text-green-400 font-bold text-sm">{formatCurrency(p.budget)}</span>
                    </div>
                    <p className="text-gray-500 dark:text-slate-500 text-xs line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{formatDate(p.deadline)}
                      </span>
                      <Link to={`/projects/${p.id}`}>
                        <button className="rounded-lg bg-green-500/15 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/20 px-3 py-1.5 text-xs font-semibold hover:bg-green-500/25 transition-colors opacity-0 group-hover:opacity-100">
                          Ver projeto →
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-5">

            {/* Perfil */}
            <div className="glass rounded-2xl p-5 text-center">
              <Avatar name={user?.name ?? ''} photoUrl={profileData?.photoUrl} size="lg" className="mx-auto mb-3 ring-2 ring-green-500/30" />
              <h3 className="text-gray-900 dark:text-white font-bold text-lg">{user?.name}</h3>
              {profileData?.title && <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{profileData.title}</p>}
              {avgRating != null && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <StarRating value={Math.round(avgRating)} size="sm" />
                  <span className="text-gray-900 dark:text-white font-bold text-sm">{avgRating.toFixed(1)}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/8">
                {[
                  { label: 'Concluídos', v: finished.length },
                  { label: 'Propostas', v: total },
                  { label: 'Ativos', v: active.length },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-gray-900 dark:text-white font-bold text-lg">{s.v}</p>
                    <p className="text-gray-500 dark:text-slate-500 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximas Entregas */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500 dark:text-green-400" /> Próximas Entregas
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-gray-400 dark:text-slate-600 text-sm text-center py-4">Sem entregas próximas</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcoming.map(c => {
                    const daysLeft = Math.ceil((new Date(c.project.deadline).getTime() - Date.now()) / 86400000)
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{c.project.title}</p>
                          <p className="text-gray-500 dark:text-slate-500 text-xs">{c.project.client.name}</p>
                        </div>
                        <span className={cn(
                          'shrink-0 rounded-lg px-2 py-1 text-xs font-semibold',
                          daysLeft <= 2
                            ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                            : daysLeft <= 5
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                        )}>
                          {daysLeft}d
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Metas */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500 dark:text-green-400" /> Metas do Mês
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-xs">Meta Financeira</span>
                    <span className="text-gray-900 dark:text-white text-xs font-bold">{formatCurrency(totalEarnings)} / {formatCurrency(monthGoal)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                      style={{ width: `${Math.min((totalEarnings / monthGoal) * 100, 100)}%` }} />
                  </div>
                  <p className="text-gray-400 dark:text-slate-600 text-xs mt-1">{Math.min(Math.round((totalEarnings / monthGoal) * 100), 100)}% da meta</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500 dark:text-slate-400 text-xs">Projetos Concluídos</span>
                    <span className="text-gray-900 dark:text-white text-xs font-bold">{finished.length} / {projectGoal}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
                      style={{ width: `${Math.min((finished.length / projectGoal) * 100, 100)}%` }} />
                  </div>
                  <p className="text-gray-400 dark:text-slate-600 text-xs mt-1">{Math.min(Math.round((finished.length / projectGoal) * 100), 100)}% da meta</p>
                </div>
              </div>
            </div>

            {/* Conquistas */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> Conquistas
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {achievements.map(a => (
                  <div key={a.label} className={cn(
                    'flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all',
                    a.earned
                      ? 'bg-green-50 border border-green-200 dark:bg-green-500/10 dark:border-green-500/20'
                      : 'bg-muted border border-border opacity-40'
                  )}>
                    <span className="text-2xl">{a.icon}</span>
                    <p className={cn('text-xs leading-tight', a.earned ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-600')}>
                      {a.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientDashboard() {
  const { user } = useAuth()

  const { data: projects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsService.getAll({ size: 50 }),
  })

  const { data: contracts } = useQuery({
    queryKey: ['my-contracts'],
    queryFn: () => contractsService.getAll(),
  })

  const allProjects = projects?.content ?? []
  const allContracts = contracts?.content ?? []
  const completed = allProjects.filter(p => p.status === 'COMPLETED')
  const inProgress = allProjects.filter(p => p.status === 'IN_PROGRESS')

  const chartData = [
    { name: 'Abertos', value: allProjects.filter(p => p.status === 'OPEN').length },
    { name: 'Em andamento', value: inProgress.length },
    { name: 'Concluídos', value: completed.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">{getGreeting()} 👋</p>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">{user?.name?.split(' ')[0]}</h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">Gerencie seus projetos e encontre os melhores talentos</p>
            </div>
            <Link to="/projects/create">
              <button className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white hover:bg-green-400 transition-colors">
                <Plus className="h-4 w-4" /> Novo Projeto
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Briefcase} label="Total de Projetos" value={String(allProjects.length)} sub="publicados" />
          <MetricCard icon={TrendingUp} label="Em Andamento" value={String(inProgress.length)} sub="projetos ativos" trend="up" />
          <MetricCard icon={CheckCircle} label="Concluídos" value={String(completed.length)} sub="projetos finalizados" trend="up" />
          <MetricCard icon={Briefcase} label="Contratos Ativos" value={String(allContracts.filter(c => c.status === 'ACTIVE').length)} sub="em execução" />
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Status dos Projetos</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)' }} />
              <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fill="url(#clientGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Projetos Recentes</h2>
            <Link to="/projects" className="text-green-600 dark:text-green-400 text-sm hover:text-green-500">Ver todos</Link>
          </div>
          <div className="flex flex-col gap-3">
            {allProjects.slice(0, 5).map(p => {
              const sc = { OPEN: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25', IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25', COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/25', CANCELLED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25' }[p.status]
              const sl = { OPEN: 'Aberto', IN_PROGRESS: 'Em Andamento', COMPLETED: 'Concluído', CANCELLED: 'Cancelado' }[p.status]
              return (
                <Link key={p.id} to={`/projects/${p.id}`}>
                  <div className="flex items-center justify-between rounded-xl bg-muted border border-border px-4 py-3 hover:border-green-400 dark:hover:border-green-500/40 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                        <Briefcase className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 dark:text-white text-sm font-semibold truncate">{p.title}</p>
                        <p className="text-gray-500 dark:text-slate-500 text-xs mt-0.5">{formatCurrency(p.budget)} · {formatDate(p.deadline)}</p>
                      </div>
                    </div>
                    <span className={cn('ml-4 shrink-0 rounded-full border px-3 py-1 text-xs font-semibold', sc)}>{sl}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  if (user?.role === 'FREELANCER') return <FreelancerDashboard />
  return <ClientDashboard />
}
