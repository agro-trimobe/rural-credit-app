'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/crm/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div 
        className="flex-1 transition-all duration-300 overflow-auto"
        style={{ 
          marginLeft: sidebarOpen ? '16rem' : '5rem',
          width: 'auto'
        }}
      >
        <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-end px-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="p-4 md:p-6 pb-24 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
