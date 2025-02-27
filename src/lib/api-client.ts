import axios from 'axios';

// Interceptor para tratar erros de autenticação
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Adicionar interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 401 (não autorizado), redirecionar para a página de login
    if (error.response && error.response.status === 401) {
      console.error('Erro de autenticação detectado:', error.response.data);
      
      // Em ambiente de navegador, redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };

export const apiClient = {
  projects: {
    list: () => api.get('/projects').then(res => res.data),
    get: (id: string) => api.get(`/projects/${id}`).then(res => res.data),
    create: (data: any) => api.post('/projects', data).then(res => res.data),
    update: (id: string, data: any) => api.put(`/projects/${id}`, data).then(res => res.data),
    delete: (id: string) => api.delete(`/projects/${id}`).then(res => res.data),
  },
  documents: {
    list: (id: string) => 
      api.get(`/projects/${id}/documents`).then(res => res.data),
    upload: (formData: FormData) => 
      api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => res.data),
    delete: (projectId: string, docId: string) =>
      api.delete(`/projects/${projectId}/documents/${docId}`).then(res => res.data),
  }
};
