import { Suspense } from 'react';
import ProjectClient from './project-client';

interface PageProps {
  params: { id: string };
}

export default function ProjectPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProjectClient id={params.id} />
    </Suspense>
  );
}