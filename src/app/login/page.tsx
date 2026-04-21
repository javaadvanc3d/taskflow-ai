'use client'

import { useActionState } from 'react'
import { Kanban } from 'lucide-react'
import { signIn } from './actions'

export default function LoginPage() {
  const [error, action, pending] = useActionState(signIn, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f1a] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
            <Kanban className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">
            TaskFlow <span className="text-violet-400">AI</span>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8">
          <h2 className="mb-1 text-base font-semibold text-white">Iniciar sesión</h2>
          <p className="mb-6 text-sm text-neutral-500">Ingresa tus credenciales para continuar</p>

          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-neutral-400">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-violet-500/60 focus:bg-white/[0.07]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-neutral-400">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-violet-500/60 focus:bg-white/[0.07]"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 flex h-10 items-center justify-center rounded-lg bg-green-600 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
