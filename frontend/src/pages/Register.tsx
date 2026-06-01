import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'


const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['CLIENT', 'FREELANCER'] as const),
})

type FormData = z.infer<typeof schema>

export function Register() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CLIENT' },
  })

  const role = watch('role')

  const { mutate, isPending } = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      login(data)
      toast('Conta criada com sucesso!', 'success')
      navigate('/dashboard')
    },
    onError: (err: any) => {
      toast(err.response?.data?.message ?? 'Erro ao criar conta', 'error')
    },
  })

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Crie sua conta</h1>
          <p className="mt-2 text-muted-foreground">Junte-se ao Freelio gratuitamente</p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-4">
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3">
              {(['CLIENT', 'FREELANCER'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue('role', r)}
                  className={cn(
                    'rounded-lg border p-3 text-sm font-medium transition-colors',
                    role === r
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-input hover:bg-muted'
                  )}
                >
                  {r === 'CLIENT' ? '🏢 Sou Cliente' : '💼 Sou Freelancer'}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}

            <div>
              <label className="mb-1.5 block text-sm font-medium">Nome completo</label>
              <Input placeholder="Seu nome" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <Input type="email" placeholder="seu@email.com" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Senha</label>
              <Input type="password" placeholder="Mínimo 6 caracteres" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={isPending}>
              Criar conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
