'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { signOut } from '@/app/login/actions'

interface UserMenuProps {
  email: string
}

export function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/5"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-600 text-xs font-medium text-white">
          {email[0]?.toUpperCase() ?? 'U'}
        </div>
        <span className="text-sm text-neutral-400">{email}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-neutral-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-white/[0.08] bg-[#1a1a2e] py-1 shadow-xl">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4 text-neutral-500" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
