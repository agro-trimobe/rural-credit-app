import useSWR from 'swr';

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  url: string;
}

export function useDocuments(id: string) {
  return useSWR<Document[]>(
    id ? `/api/projects/${id}/documents` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao carregar documentos');
      }
      return response.json();
    }
  );
}
