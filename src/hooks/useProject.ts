import { Project } from '@/types/project';
import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';

export function useProject(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null,
    async () => {
      if (!id) return null;
      return apiClient.projects.get(id);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    project: data,
    isLoading,
    isError: error,
    mutate
  };
}
