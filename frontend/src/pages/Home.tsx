import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Shield, Zap, Star, CheckCircle, Briefcase,
  ChevronRight, Users
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function FreelancerBadge({ name, role, rating, photo, delay, className, style }: {
  name: string; role: string; rating: string; photo: string; delay?: string; className?: string; style?: React.CSSProperties
}) {
  return (
    <div
      className={`glass rounded-2xl px-4 py-3 flex items-center gap-3 ${className ?? ''}`}
      style={{ animationDelay: delay, ...style }}
    >
      <div className="h-11 w-11 rounded-full overflow-hidden shrink-0 ring-2 ring-green-500/30">
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-gray-900 dark:text-white text-sm font-semibold leading-tight truncate">{name}</p>
        <p className="text-gray-500 dark:text-slate-400 text-xs truncate">{role}</p>
      </div>
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-yellow-500 dark:text-yellow-400 text-xs font-bold">{rating}</span>
      </div>
    </div>
  )
}

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  )
}

export function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  })

  return (
    <div className="bg-white dark:bg-[#020617] text-gray-900 dark:text-white min-h-screen overflow-x-hidden transition-colors duration-300">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center hero-glow">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/8 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/6 dark:bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-8">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                #1 Marketplace de Freelancers
              </span>
            </div>

            <div className="animate-fade-up animation-delay-100">
              <h1 className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white">
                Conecte seu talento ao{' '}
                <span className="gradient-text">próximo grande projeto</span>
              </h1>
            </div>

            <p className="text-gray-600 dark:text-slate-400 text-lg leading-relaxed max-w-lg animate-fade-up animation-delay-200">
              Plataforma premium que conecta clientes e freelancers qualificados.
              Projetos reais, pagamentos seguros e resultados excepcionais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-300">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-green-400 transition-all duration-200 green-glow hover:scale-105">
                Começar Gratuitamente <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/categorias" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-6 py-3.5 text-sm font-semibold text-gray-800 dark:text-white hover:border-green-400 dark:hover:border-green-500/40 hover:bg-gray-200 dark:hover:bg-white/8 transition-all duration-200">
                Explorar Categorias
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 animate-fade-up animation-delay-400">
              {['Pagamento Seguro', 'Profissionais Verificados', 'Suporte Dedicado'].map(b => (
                <span key={b} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 shrink-0" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Cards de perfil */}
          <div className="relative h-[520px] hidden lg:block">

            {/* Card principal - centro */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
             <div className="glass rounded-3xl overflow-hidden w-52 green-glow animate-float pointer-events-auto">
                <img src="/avatars/avatar1.jpg" alt="Joao" className="w-full h-44 object-cover object-top" />
                <div className="p-4">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Joao</p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs mb-2">Full Stack Developer</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                    <span className="text-yellow-500 dark:text-yellow-400 text-xs font-bold ml-1">5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card superior esquerdo */}
            <div className="absolute top-4 left-0 animate-float-delayed">
              <div className="glass rounded-2xl overflow-hidden w-40">
                <img src="/avatars/avatar2.jpg" alt="Julia" className="w-full h-32 object-cover object-top" />
                <div className="p-3">
                  <p className="font-semibold text-gray-900 dark:text-white text-xs">Julia</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[10px]">Designer UI/UX</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-500 dark:text-yellow-400 text-[10px] font-bold">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card superior direito */}
            <div className="absolute top-8 right-0 animate-float-slow">
              <div className="glass rounded-2xl overflow-hidden w-40">
                <img src="/avatars/avatar3.jpg" alt="Pedro" className="w-full h-32 object-cover object-top" />
                <div className="p-3">
                  <p className="font-semibold text-gray-900 dark:text-white text-xs">Pedro</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[10px]">Dev Mobile</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-500 dark:text-yellow-400 text-[10px] font-bold">4.8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card inferior esquerdo */}
            <div className="absolute bottom-4 left-4 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="glass rounded-2xl overflow-hidden w-40">
                <img src="/avatars/avatar4.jpg" alt="Ana" className="w-full h-32 object-cover object-top" />
                <div className="p-3">
                  <p className="font-semibold text-gray-900 dark:text-white text-xs">Ana</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[10px]">Especialista SEO</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-500 dark:text-yellow-400 text-[10px] font-bold">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card inferior direito */}
            <div className="absolute bottom-2 right-2 animate-float-delayed">
              <div className="glass rounded-2xl overflow-hidden w-40">
                <img src="/avatars/avatar5.jpg" alt="Lucas" className="w-full h-32 object-cover object-top" />
                <div className="p-3">
                  <p className="font-semibold text-gray-900 dark:text-white text-xs">Lucas</p>
                  <p className="text-gray-500 dark:text-slate-400 text-[10px]">Dev Backend</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-500 dark:text-yellow-400 text-[10px] font-bold">5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat flutuante */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 glass rounded-xl px-4 py-2.5 animate-float-slow">
              <p className="text-2xl font-black text-green-600 dark:text-green-400">+1.2k</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Projetos ativos</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="mx-auto max-w-6xl">
          <FadeSection>
            <div className="text-center mb-16">
              <p className="text-green-600 dark:text-green-400 text-sm font-semibold tracking-widest uppercase mb-3">Por que nos escolher</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Construído para resultados</h2>
            </div>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="h-7 w-7 text-green-500 dark:text-green-400" />, title: 'Seguro e Confiável', desc: 'Pagamentos protegidos e liberados apenas após a entrega aprovada. Sua tranquilidade em primeiro lugar.' },
              { icon: <Zap className="h-7 w-7 text-green-500 dark:text-green-400" />, title: 'Rápido e Eficiente', desc: 'Receba propostas qualificadas em minutos. Algoritmo inteligente conecta você ao profissional ideal.' },
              { icon: <Star className="h-7 w-7 text-green-500 dark:text-green-400" />, title: 'Qualidade Garantida', desc: 'Sistema de avaliações verificadas e histórico transparente para você contratar com confiança.' },
            ].map(({ icon, title, desc }) => (
              <FadeSection key={title}>
                <div className="glass glass-hover rounded-2xl p-8 h-full transition-all duration-300 cursor-default group">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <FadeSection>
            <div className="text-center mb-20">
              <p className="text-green-600 dark:text-green-400 text-sm font-semibold tracking-widest uppercase mb-3">Simples e direto</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Como funciona</h2>
            </div>
          </FadeSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {[
              {
                icon: <Briefcase className="h-5 w-5 text-green-500 dark:text-green-400" />, title: 'Para Clientes',
                steps: [
                  { n: '01', title: 'Publique seu projeto', desc: 'Descreva o que você precisa e defina orçamento e prazo' },
                  { n: '02', title: 'Receba propostas', desc: 'Freelancers qualificados enviam propostas personalizadas' },
                  { n: '03', title: 'Contrate o ideal', desc: 'Compare perfis, avaliações e escolha o melhor profissional' },
                  { n: '04', title: 'Avalie o resultado', desc: 'Aprove a entrega e deixe sua avaliação para a comunidade' },
                ]
              },
              {
                icon: <Users className="h-5 w-5 text-green-500 dark:text-green-400" />, title: 'Para Freelancers',
                steps: [
                  { n: '01', title: 'Crie seu perfil', desc: 'Mostre suas skills, portfólio, certificações e disponibilidade' },
                  { n: '02', title: 'Encontre projetos', desc: 'Navegue por oportunidades filtradas por suas especialidades' },
                  { n: '03', title: 'Envie propostas', desc: 'Apresente sua proposta personalizada com preço e prazo' },
                  { n: '04', title: 'Receba avaliações', desc: 'Construa sua reputação e atraia cada vez mais clientes' },
                ]
              },
            ].map(({ icon, title, steps }) => (
              <FadeSection key={title}>
                <div className="glass rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">{icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/50 to-transparent" />
                    <div className="space-y-6 pl-10">
                      {steps.map(({ n, title: t, desc }) => (
                        <div key={n} className="relative group">
                          <div className="absolute -left-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 border border-green-500/40 text-green-600 dark:text-green-400 text-xs font-bold group-hover:bg-green-500/30 transition-colors">{n}</div>
                          <h4 className="text-gray-900 dark:text-white font-semibold mb-1">{t}</h4>
                          <p className="text-gray-500 dark:text-slate-400 text-sm">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIAS ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="mx-auto max-w-6xl">
          <FadeSection>
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-semibold tracking-widest uppercase mb-3">Especialidades</p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Explore por categoria</h2>
              </div>
              <Link to="/categorias" className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-500 font-medium group">
                Ver todas <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(categories.length > 0 ? categories : [
              { id: '1', icon: '💻', name: 'Desenvolvimento & TI', freelancerCount: 0, description: '', slug: '', specialties: [] },
              { id: '2', icon: '🎨', name: 'Design & Criativo', freelancerCount: 0, description: '', slug: '', specialties: [] },
              { id: '3', icon: '📈', name: 'Marketing & Vendas', freelancerCount: 0, description: '', slug: '', specialties: [] },
              { id: '4', icon: '✍️', name: 'Redação & Tradução', freelancerCount: 0, description: '', slug: '', specialties: [] },
              { id: '5', icon: '📊', name: 'Dados & Analytics', freelancerCount: 0, description: '', slug: '', specialties: [] },
              { id: '6', icon: '🤖', name: 'IA & Machine Learning', freelancerCount: 0, description: '', slug: '', specialties: [] },
              { id: '7', icon: '📱', name: 'Mobile Development', freelancerCount: 0, description: '', slug: '', specialties: [] },
              { id: '8', icon: '🎯', name: 'Consultoria', freelancerCount: 0, description: '', slug: '', specialties: [] },
            ]).slice(0, 8).map(cat => (
              <FadeSection key={cat.id}>
                <Link to={`/categorias/${cat.id}`}>
                  <div className="glass glass-hover rounded-2xl p-5 text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="text-3xl mb-3">{cat.icon}</div>
                    <p className="text-gray-900 dark:text-white text-sm font-semibold leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{cat.name}</p>
                    {cat.freelancerCount > 0 && (
                      <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">+{cat.freelancerCount} profissionais</p>
                    )}
                  </div>
                </Link>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <FadeSection>
            <div className="relative glass rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-transparent to-emerald-500/5 pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15 border border-green-500/25 mb-6 mx-auto">
                  <Zap className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                  Pronto para encontrar seu<br />
                  <span className="gradient-text">próximo projeto?</span>
                </h2>
                <p className="text-gray-600 dark:text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  Junte-se a milhares de profissionais e empresas que já utilizam o Freelio.
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-8 py-4 text-base font-bold text-white hover:bg-green-400 transition-all duration-200 green-glow hover:scale-105">
                  Criar Conta Gratuita <ArrowRight className="h-5 w-5" />
                </Link>
                <p className="text-gray-400 dark:text-slate-600 text-sm mt-4">Sem cartão de crédito. 100% gratuito para começar.</p>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-white/5 py-12 px-6 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-900 dark:text-white font-bold text-lg">Freelio</span>
              </div>
              <p className="text-gray-500 dark:text-slate-500 text-sm leading-relaxed">
                Marketplace premium conectando talentos e empresas em todo o Brasil.
              </p>
            </div>
            {[
              { title: 'Plataforma', links: [{ label: 'Categorias', to: '/categorias' }, { label: 'Entrar', to: '/login' }, { label: 'Cadastrar', to: '/register' }] },
              { title: 'Para Freelancers', links: [{ label: 'Criar Perfil', to: '/register' }, { label: 'Encontrar Projetos', to: '/projects' }] },
              { title: 'Para Clientes', links: [{ label: 'Publicar Projeto', to: '/register' }, { label: 'Buscar Freelancers', to: '/categorias' }] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-gray-500 dark:text-slate-500 text-sm hover:text-green-600 dark:hover:text-green-400 transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 dark:text-slate-600 text-sm">© 2026 Freelio. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              {['Termos de Uso', 'Privacidade', 'Cookies'].map(l => (
                <a key={l} href="#" className="text-gray-400 dark:text-slate-600 text-sm hover:text-gray-600 dark:hover:text-slate-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
