import { Suspense } from 'react';
import { Metadata } from 'next';
import ProjectClient from './project-client';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Projeto ${resolvedParams.id}`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProjectClient id={resolvedParams.id} />
    </Suspense>
  );
}