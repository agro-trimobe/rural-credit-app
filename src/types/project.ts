export interface Document {
  id?: string;
  name: string;
  size: number;
  type: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'aguardando_documentos'
  | 'em_analise';

export type Project = {
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
