import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export const apiClient = {
  projects: {
    list: () => api.get('/projects').then(res => res.data),
    get: (id: string) => api.get(`/projects/${id}`).then(res => res.data),
    create: (data: any) => api.post('/projects', data).then(res => res.data),
  },
  documents: {
    list: (id: string) => 
      api.get(`/documents/${id}`).then(res => res.data),
    upload: (formData: FormData) => 
      api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => res.data),
  }
};
