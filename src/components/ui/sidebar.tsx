'use client'

import { LayoutDashboard, Bot, UserCircle, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { toast } from '@/hooks/use-toast'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Agente Inteligente',
    icon: Bot,
    href: '/agent',
  },
  {
    title: 'Perfil',
    icon: UserCircle,
    href: '/profile',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/auth/login' })
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você será redirecionado para a página de login.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao realizar logout',
        description: 'Ocorreu um erro ao tentar sair do sistema.',
        variant: 'destructive',
      })
    }
  }

  return (
    <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background">
      <div className="flex h-full flex-col justify-between py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        
        <div className="px-2">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-muted"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  )
}
