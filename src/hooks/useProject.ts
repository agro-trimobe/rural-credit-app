import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';

export interface Project {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  projectName: string;
  purpose?: string;
  creditLine: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  propertyName: string;
  area: number;
  location: string;
}

export function useProject(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null,
    () => apiClient.projects.get(id)
  );

  return {
    project: data,
    isLoading,
    isError: error,
    mutate
  };
}
