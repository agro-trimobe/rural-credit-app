'use client'

import { Header } from '@/components/ui/header'
import { Sidebar } from '@/components/ui/sidebar'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-14">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
