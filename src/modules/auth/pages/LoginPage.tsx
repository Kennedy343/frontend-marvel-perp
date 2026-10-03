import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import logoUrl from '../../../assets/logoMarvel.png'
import { useAuthStore } from '../../../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    try {
      await login({ correoUsuario: email, passwordUsuario: password })
      navigate('/dashboard', { replace: true })
    } catch {
      // El error ya se muestra desde el store.
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-bg-gray px-4 py-10 sm:px-6 md:h-dvh md:overflow-hidden md:py-12">
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
        <div className="mb-8 flex items-center flex-col justify-center gap-3">
          <img src={logoUrl} alt="Logo Marvel" className="size-14" />
          <span className="font-sora text-sm font-semibold uppercase tracking-[0.3em] text-navy-950">Sistema Marvel</span>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-card motion-safe:animate-rise sm:p-8">
          <div className="mb-8">
            <h1 className="font-sora text-2xl font-semibold text-gray-900">Inicia sesión</h1>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Ingresa tus credenciales para acceder a la plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="font-dm-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@marvel.com"
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3.5 py-3 font-dm-sans text-sm font-medium text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="font-dm-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3.5 py-3 font-dm-sans text-sm font-medium text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-60"
              />
            </div>

            {error && (
              <p role="alert" className="font-dm-sans text-sm font-medium text-error-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary-blue px-4 py-3.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-8 text-center font-dm-sans text-xs font-medium text-gray-500">
            ¿Olvidaste tu contraseña?{' '}
            <a
              href="#"
              className="font-semibold text-primary-blue transition-colors hover:text-blue-700 hover:underline focus-visible:underline"
            >
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default LoginPage