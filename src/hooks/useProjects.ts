import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';
import { Project } from '@/types/project';

export function useProjects() {
  const { data, error, mutate } = useSWR<Project[]>('projects', async () => {
    try {
      const response = await apiClient.projects.list();
      // Garantir que o retorno seja sempre um array
      return Array.isArray(response) ? response : [];
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      // Retornar array vazio em caso de erro
      return [];
    }
  });

  return {
    projects: Array.isArray(data) ? data : [], // Garantia dupla de que sempre retorne um array
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useProject(id: string) {
  const { data, error, mutate } = useSWR<Project>(`project-${id}`, () =>
    apiClient.projects.get(id)
  );

  return {
    project: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
