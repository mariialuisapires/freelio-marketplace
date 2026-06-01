import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Briefcase } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type FormData = z.infer<typeof schema>

export function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data)
      toast('Login realizado com sucesso!', 'success')
      navigate('/dashboard')
    },
    onError: () => toast('Email ou senha incorretos', 'error'),
  })

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
          <p className="mt-2 text-muted-foreground">Entre na sua conta do Freelio</p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <Input type="email" placeholder="seu@email.com" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Senha</label>
              <Input type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isPending}>
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
