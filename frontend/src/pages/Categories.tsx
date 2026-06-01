import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, ArrowRight } from 'lucide-react'
import { categoriesService } from '@/services/categories.service'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Categories() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'popular'>('all')

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  })

  const filtered = categories
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => filter === 'popular' ? b.freelancerCount - a.freelancerCount : 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold">Explore por Categoria</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Encontre os melhores profissionais para o seu projeto
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10 h-12 text-base bg-background"
              placeholder="Buscar categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Filtros */}
        <div className="mb-8 flex items-center gap-3">
          {(['all', 'popular'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}>
              {f === 'all' ? 'Todas' : 'Mais populares'}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} categoria(s)
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Search className="mx-auto mb-4 h-12 w-12 opacity-40" />
            <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(cat => (
              <Link key={cat.id} to={`/categorias/${cat.id}`}>
                <div className="group relative overflow-hidden rounded-xl border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full">
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    <div className="mb-4 text-4xl">{cat.icon}</div>
                    <h3 className="mb-2 font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {cat.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {cat.freelancerCount > 0
                            ? `+${cat.freelancerCount.toLocaleString('pt-BR')} freelancers`
                            : 'Seja o primeiro'}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
