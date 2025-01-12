import { use } from 'react';
import type { Usable } from 'react';
import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Usable<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Detalhes do Projeto - Rural Credit App',
  description: 'Visualize os detalhes do projeto',
};

export default function ProjectLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = use(params);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        {children}
      </div>
    </div>
  );
}
