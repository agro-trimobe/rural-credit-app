import { Metadata } from 'next';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Detalhes do Projeto - Rural Credit App',
  description: 'Visualize os detalhes do projeto',
};

export default async function ProjectLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        {children}
      </div>
    </div>
  );
}
