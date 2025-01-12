import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';
import { Project } from '@/types/project';

export function useProjects() {
  const { data, error, mutate } = useSWR<Project[]>('projects', () => 
    apiClient.projects.list()
  );

  return {
    projects: data,
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
