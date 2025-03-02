'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Users,
  FileText,
  Calendar,
  LineChart,
  Calculator,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Leaf,
  Home as HomeIcon,
  User,
  FolderOpen,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você será redirecionado para a página inicial.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao realizar logout',
        description: 'Ocorreu um erro ao tentar sair do sistema.',
        variant: 'destructive',
      })
    }
  }

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Clientes',
      href: '/clientes',
      icon: Users,
    },
    {
      title: 'Projetos',
      href: '/projetos',
      icon: FileText,
    },
    {
      title: 'Visitas',
      href: '/visitas',
      icon: Calendar,
    },
    {
      title: 'Oportunidades',
      href: '/oportunidades',
      icon: LineChart,
    },
    {
      title: 'Documentos',
      href: '/documentos',
      icon: FolderOpen,
    },
    {
      title: 'Simulações',
      href: '/simulacoes',
      icon: Calculator,
    },
  ]

  return (
    <>
      <div
        className={cn(
          'min-h-screen fixed top-0 left-0 z-20 flex flex-col border-r border-border bg-card transition-all duration-300',
          open ? 'w-64' : 'w-20'
        )}
        style={{ width: open ? '16rem' : '5rem' }}
      >
        <div className="flex items-center justify-between p-4">
          <div className={cn('flex items-center', !open && 'justify-center w-full')}>
            <Leaf className="h-8 w-8 text-primary" />
            {open && <span className="ml-2 text-xl font-bold text-primary truncate">Rural Credit</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className={cn('rounded-full', !open && 'hidden')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {!open && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="mx-auto mt-2 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <Separator className="my-4" />

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href || pathname.startsWith(item.href + '/') 
                    ? 'bg-secondary text-primary' 
                    : 'hover:bg-secondary/50',
                  !open && 'justify-center py-3'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5', 
                  (pathname === item.href || pathname.startsWith(item.href + '/')) && 'text-primary'
                )} />
                {open && <span className="truncate">{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <Separator className="my-4" />
        
        <div className="p-4">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 text-muted-foreground',
              !open && 'justify-center px-0'
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {open && <span className="truncate">Sair</span>}
          </Button>
        </div>
      </div>
      
      {/* Overlay para telas pequenas */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
